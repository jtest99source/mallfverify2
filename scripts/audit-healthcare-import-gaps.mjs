import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;
const OUTPUT_DIR = "reports";
const PUBLIC_STATUSES = new Set(["published", "premium"]);

const STRATEGIC_AREAS = [
  { area: "Palma", priority: "high", target: 35, aliases: ["Palma"] },
  { area: "Alcudia / Playa de Muro", priority: "high", target: 8, aliases: ["Alcudia", "Alcúdia", "Playa de Muro", "Port d'Alcudia", "Puerto Alcudia"] },
  { area: "Pollenca", priority: "high", target: 4, aliases: ["Pollenca", "Pollença", "Port de Pollenca", "Port de Pollença", "Puerto Pollensa"] },
  { area: "Santa Ponsa / Palmanova / Magaluf", priority: "high", target: 8, aliases: ["Santa Ponsa", "Santa Ponça", "Palmanova", "Magaluf"] },
  { area: "Peguera / Andratx", priority: "high", target: 4, aliases: ["Peguera", "Paguera", "Andratx", "Port d'Andratx", "Puerto de Andratx"] },
  { area: "Cala d'Or / Santanyi", priority: "medium", target: 4, aliases: ["Cala d'Or", "Santanyi", "Santanyí", "Portocolom"] },
  { area: "Cala Millor / Sa Coma", priority: "medium", target: 4, aliases: ["Cala Millor", "Sa Coma", "Cala Bona", "Son Servera"] },
  { area: "Inca / Central Mallorca", priority: "medium", target: 3, aliases: ["Inca", "Sineu", "Binissalem", "Santa Maria del Cami", "Santa Maria del Camí"] },
  { area: "Manacor / East inland", priority: "medium", target: 3, aliases: ["Manacor", "Porto Cristo", "Felanitx", "Cala Ratjada", "Arta", "Artà"] },
  { area: "Soller", priority: "medium", target: 2, aliases: ["Soller", "Sóller", "Port de Soller", "Port de Sóller"] }
];

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function slugText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function locationText(row) {
  return [row.city, row.area, row.municipality, row.address].filter(Boolean).join(" ");
}

function rawTypes(row) {
  const raw = row.raw_google_place;
  const types = raw && Array.isArray(raw.types) ? raw.types.filter((item) => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...types].filter(Boolean))];
}

function typeFamily(row) {
  const types = rawTypes(row);
  const text = `${publicName(row)} ${row.website ?? ""}`.toLowerCase();
  if (types.some((type) => type.includes("dentist") || type.includes("dental")) || /dent|zahnarzt|dental/.test(text)) return "dentist";
  if (types.some((type) => ["hospital", "medical_clinic", "medical_center", "urgent_care_center"].includes(type)) || /clinic|clinica|clínica|medical|hospital|policlinic|policl[ií]nic/.test(text)) return "clinic";
  if (types.some((type) => ["doctor", "health"].includes(type)) || /doctor|arzt|m[eé]dico|medico|gp\b/.test(text)) return "doctor";
  if (types.some((type) => type.includes("physiotherapist") || type.includes("chiropractor")) || /fisio|physio|fisioterapia|chiro/.test(text)) return "physio";
  return "other";
}

function hasLanguageSignal(row) {
  const text = [publicName(row), row.website, row.raw_google_place?.websiteUri, row.raw_google_place?.displayName?.text, row.address].filter(Boolean).join(" ").toLowerCase();
  return /english|british|international|expat|doctor|clinic|dental|medical|deutsch|deutscher|deutsche|arzt|zahnarzt|praxis|klinik|alem[aá]n|juaneda|doctor spain/.test(text);
}

function areaMatches(row, strategicArea) {
  const text = slugText(locationText(row));
  return strategicArea.aliases.some((alias) => text.includes(slugText(alias)));
}

function recommendation(publicCount, target) {
  if (publicCount === 0) return "Preview/import first batch";
  if (publicCount < Math.ceil(target * 0.5)) return "Import likely needed";
  if (publicCount < target) return "Light preview only";
  return "No import needed now";
}

function qualityScore(row) {
  return (row.rating ?? 0) * Math.log((row.reviews_count ?? 0) + 1);
}

async function fetchRows(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("slug,name,display_name,status,area,city,municipality,address,website,rating,reviews_count,primary_type,raw_google_place")
      .eq("category", "healthcare")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE_SIZE) break;
  }
  return rows;
}

function writeReport(rows) {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const publicRows = rows.filter((row) => PUBLIC_STATUSES.has(row.status));
  const areaReports = STRATEGIC_AREAS.map((area) => {
    const matches = publicRows.filter((row) => areaMatches(row, area));
    const top = matches.slice().sort((a, b) => qualityScore(b) - qualityScore(a)).slice(0, 6);
    return {
      ...area,
      publicCount: matches.length,
      languageSignalCount: matches.filter(hasLanguageSignal).length,
      doctors: matches.filter((row) => typeFamily(row) === "doctor").length,
      dentists: matches.filter((row) => typeFamily(row) === "dentist").length,
      clinics: matches.filter((row) => typeFamily(row) === "clinic").length,
      recommendation: recommendation(matches.length, area.target),
      top
    };
  });
  const opportunities = areaReports.filter((area) => area.recommendation !== "No import needed now");
  const priorityRank = { high: 0, medium: 1, low: 2 };
  const path = join(OUTPUT_DIR, `healthcare-import-gaps-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  const lines = [
    "# Healthcare Import Gaps",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total healthcare rows: ${rows.length}`,
    `- Public healthcare rows: ${publicRows.length}`,
    `- Strategic areas reviewed: ${STRATEGIC_AREAS.length}`,
    `- Areas with import opportunity: ${opportunities.length}`,
    "",
    "## Recommended Import Order",
    "",
    "| Area | Priority | Public | EN/DE-ish signal | Doctors | Dentists | Clinics | Target | Recommendation |",
    "|---|---|---:|---:|---:|---:|---:|---:|---|",
    ...opportunities
      .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || a.publicCount - b.publicCount)
      .map((area) => `| ${fmt(area.area)} | ${fmt(area.priority)} | ${area.publicCount} | ${area.languageSignalCount} | ${area.doctors} | ${area.dentists} | ${area.clinics} | ${area.target} | ${fmt(area.recommendation)} |`),
    "",
    "## All Strategic Areas",
    "",
    "| Area | Priority | Public | EN/DE-ish signal | Doctors | Dentists | Clinics | Target | Recommendation | Top current matches |",
    "|---|---|---:|---:|---:|---:|---:|---:|---|---|",
    ...areaReports.map((area) => `| ${fmt(area.area)} | ${fmt(area.priority)} | ${area.publicCount} | ${area.languageSignalCount} | ${area.doctors} | ${area.dentists} | ${area.clinics} | ${area.target} | ${fmt(area.recommendation)} | ${fmt(area.top.map(publicName).join("; "))} |`)
  ];
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  return path;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const rows = await fetchRows(supabase);
  const report = writeReport(rows);
  console.log(JSON.stringify({ report, rows: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
