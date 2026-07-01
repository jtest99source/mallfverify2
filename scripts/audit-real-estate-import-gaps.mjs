import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;
const OUTPUT_DIR = "reports";
const PUBLIC_STATUSES = new Set(["published", "premium"]);

const STRATEGIC_AREAS = [
  { area: "Palma", priority: "high", target: 40, aliases: ["Palma"] },
  { area: "Andratx", priority: "high", target: 12, aliases: ["Andratx", "Port d'Andratx", "Puerto de Andratx", "Camp de Mar", "Sant Elm"] },
  { area: "Santa Ponca", priority: "high", target: 10, aliases: ["Santa Ponca", "Santa Ponça"] },
  { area: "Palmanova", priority: "high", target: 6, aliases: ["Palmanova", "Magaluf"] },
  { area: "Peguera", priority: "high", target: 6, aliases: ["Peguera", "Paguera"] },
  { area: "Portals Nous", priority: "high", target: 6, aliases: ["Portals Nous", "Puerto Portals"] },
  { area: "Pollenca", priority: "high", target: 12, aliases: ["Pollenca", "Pollença", "Port de Pollenca", "Port de Pollença", "Puerto Pollensa"] },
  { area: "Alcudia", priority: "high", target: 12, aliases: ["Alcudia", "Alcúdia", "Port d'Alcudia", "Puerto Alcudia", "Playa de Muro"] },
  { area: "Soller", priority: "high", target: 8, aliases: ["Soller", "Sóller", "Port de Soller", "Port de Sóller"] },
  { area: "Santanyi", priority: "high", target: 10, aliases: ["Santanyi", "Santanyí", "Cala d'Or", "Portocolom", "Cala Figuera", "S'Horta"] },
  { area: "Cala Millor / Sa Coma", priority: "medium", target: 6, aliases: ["Cala Millor", "Sa Coma", "Cala Bona", "S'Illot", "Son Servera"] },
  { area: "Colonia de Sant Jordi", priority: "medium", target: 4, aliases: ["Colonia de Sant Jordi", "Colònia de Sant Jordi", "Ses Salines"] },
  { area: "Inca / Central Mallorca", priority: "medium", target: 8, aliases: ["Inca", "Binissalem", "Santa Maria del Cami", "Santa Maria del Camí", "Sineu", "Alaro", "Alaró"] },
  { area: "Manacor / East inland", priority: "medium", target: 8, aliases: ["Manacor", "Porto Cristo", "Felanitx", "Cala Ratjada", "Arta", "Artà"] },
  { area: "Llucmajor", priority: "medium", target: 5, aliases: ["Llucmajor", "S'Arenal", "Sa Rapita", "Sa Ràpita"] }
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

function locationText(row) {
  return [row.city, row.area, row.municipality, row.address].filter(Boolean).join(" ");
}

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function hasLanguageSignal(row) {
  const text = [publicName(row), row.website, row.raw_google_place?.websiteUri, row.raw_google_place?.displayName?.text].filter(Boolean).join(" ").toLowerCase();
  return /real estate|property|properties|estate|international|immobilien|haus|engel|v[oö]lkers|mallorcaimmobilien|deutsch|german|remax|re\/max|savills|sotheby/.test(text);
}

function areaMatches(row, strategicArea) {
  const text = slugText(locationText(row));
  return strategicArea.aliases.some((alias) => {
    const needle = slugText(alias);
    return needle && text.includes(needle);
  });
}

function qualityScore(row) {
  return (row.rating ?? 0) * Math.log((row.reviews_count ?? 0) + 1);
}

async function fetchRealEstateRows(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,status,area,city,municipality,address,website,rating,reviews_count,raw_google_place")
      .eq("category", "real-estate")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE_SIZE) break;
  }
  return rows;
}

function recommendation(publicCount, target) {
  if (publicCount === 0) return "Preview/import first batch";
  if (publicCount < Math.ceil(target * 0.5)) return "Import likely needed";
  if (publicCount < target) return "Light preview only";
  return "No import needed now";
}

function writeReport(rows) {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const publicRows = rows.filter((row) => PUBLIC_STATUSES.has(row.status));
  const hiddenRows = rows.filter((row) => row.status === "hidden");
  const areaReports = STRATEGIC_AREAS.map((area) => {
    const matches = publicRows.filter((row) => areaMatches(row, area));
    const languageMatches = matches.filter(hasLanguageSignal);
    const top = matches.slice().sort((a, b) => qualityScore(b) - qualityScore(a)).slice(0, 5);
    return {
      ...area,
      publicCount: matches.length,
      languageSignalCount: languageMatches.length,
      recommendation: recommendation(matches.length, area.target),
      top
    };
  });

  const needsImport = areaReports.filter((area) => area.recommendation !== "No import needed now");
  const lines = [
    "# Real Estate Import Gaps",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total real-estate rows: ${rows.length}`,
    `- Public real-estate rows: ${publicRows.length}`,
    `- Hidden real-estate rows: ${hiddenRows.length}`,
    `- Strategic areas reviewed: ${STRATEGIC_AREAS.length}`,
    `- Areas with import opportunity: ${needsImport.length}`,
    "",
    "## Recommended Import Order",
    "",
    "| Area | Priority | Public count | EN/DE-ish signal | Target | Recommendation |",
    "|---|---|---:|---:|---:|---|",
    ...needsImport
      .sort((a, b) => {
        const priority = { high: 0, medium: 1, low: 2 };
        return priority[a.priority] - priority[b.priority] || a.publicCount - b.publicCount;
      })
      .map((area) => `| ${fmt(area.area)} | ${fmt(area.priority)} | ${area.publicCount} | ${area.languageSignalCount} | ${area.target} | ${fmt(area.recommendation)} |`),
    "",
    "## All Strategic Areas",
    "",
    "| Area | Priority | Public count | EN/DE-ish signal | Target | Recommendation | Top current matches |",
    "|---|---|---:|---:|---:|---|---|",
    ...areaReports.map((area) => `| ${fmt(area.area)} | ${fmt(area.priority)} | ${area.publicCount} | ${area.languageSignalCount} | ${area.target} | ${fmt(area.recommendation)} | ${fmt(area.top.map((row) => publicName(row)).join("; "))} |`),
    "",
    "## Suggested Next Commands",
    "",
    "Run preview/import only for the areas marked `Preview/import first batch` or `Import likely needed`.",
    "Use targeted Google searches per area rather than a broad Mallorca-wide import.",
    ""
  ];

  const path = join(OUTPUT_DIR, `real-estate-import-gaps-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  return path;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const rows = await fetchRealEstateRows(supabase);
  const path = writeReport(rows);
  console.log(JSON.stringify({ report: path, rows: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
