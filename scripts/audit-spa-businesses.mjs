import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;
const OUTPUT_DIR = "reports";
const PUBLIC_STATUSES = new Set(["published", "premium"]);

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

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function rawTypes(row) {
  const raw = row.raw_google_place;
  const types = raw && Array.isArray(raw.types) ? raw.types.filter((item) => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...types].filter(Boolean))];
}

function spaFamily(row) {
  const types = rawTypes(row);
  const text = `${publicName(row)} ${row.website ?? ""} ${row.address ?? ""}`.toLowerCase();
  if (/hotel|resort/.test(text) || types.some((type) => ["hotel", "resort_hotel", "lodging"].includes(type))) return "hotel_spa";
  if (/thai|massage|masaje|maderoterapia|therapy|therapeutic/.test(text) || types.some((type) => type.includes("massage"))) return "massage";
  if (/wellness|bienestar|retreat|yoga|hammam|thermal|thalasso/.test(text) || types.some((type) => type.includes("wellness") || type.includes("spa"))) return "wellness";
  if (/beauty|estetica|estética|facial|body|skin/.test(text) || types.some((type) => type.includes("beauty"))) return "beauty_spa";
  if (/fisio|physio|clinic|clínica|doctor/.test(text) || types.some((type) => ["physiotherapist", "medical_clinic", "medical_center", "doctor"].includes(type))) return "healthcare_overlap";
  return "other";
}

function concern(row) {
  const family = spaFamily(row);
  const text = `${publicName(row)} ${row.website ?? ""} ${row.address ?? ""}`.toLowerCase();
  if (/erotic|tantra|tántric|tantric|sensual/.test(text)) return "adult/tantric massage signal";
  if (family === "healthcare_overlap") return "looks more healthcare/physio than spa";
  if (family === "other") return "weak spa/wellness signal";
  if (!row.website) return "missing website";
  if ((row.reviews_count ?? 0) < 15) return "low reviews";
  return null;
}

function groupCount(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row) || "-";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

async function fetchRows(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,status,category,city,area,municipality,address,rating,reviews_count,website,phone,google_place_id,primary_type,raw_google_place,primary_photo_name,photo_names,place_reviews")
      .eq("category", "spa")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const rows = await fetchRows(supabase);
  const publicRows = rows.filter((row) => PUBLIC_STATUSES.has(row.status));
  const draftRows = rows.filter((row) => row.status === "draft");
  const hiddenRows = rows.filter((row) => row.status === "hidden");
  const suspectRows = publicRows.map((row) => ({ row, concern: concern(row) })).filter((item) => item.concern);

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `spa-business-audit-${stamp}.md`);
  const lines = [
    "# Spa Business Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total spa rows: ${rows.length}`,
    `- Public spa rows: ${publicRows.length}`,
    `- Draft spa rows: ${draftRows.length}`,
    `- Hidden spa rows: ${hiddenRows.length}`,
    `- Public suspect rows: ${suspectRows.length}`,
    "",
    "## Public Type Families",
    "",
    "| Family | Count |",
    "|---|---:|",
    ...groupCount(publicRows, spaFamily).map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Public Areas",
    "",
    "| Area | Count |",
    "|---|---:|",
    ...groupCount(publicRows, (row) => row.city || row.area || row.municipality || "Mallorca").slice(0, 40).map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Public Suspects",
    "",
    "| Name | Status | Area | Rating | Reviews | Type | Concern | Website | Slug |",
    "|---|---|---|---:|---:|---|---|---|---|",
    ...suspectRows.map(({ row, concern }) => `| ${fmt(publicName(row))} | ${fmt(row.status)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(concern)} | ${fmt(row.website)} | ${fmt(row.slug)} |`),
    "",
    "## Top Public Rows",
    "",
    "| Name | Family | Area | Rating | Reviews | Type | Website | Slug |",
    "|---|---|---|---:|---:|---|---|---|",
    ...publicRows
      .slice()
      .sort((a, b) => ((b.reviews_count ?? 0) - (a.reviews_count ?? 0)) || ((b.rating ?? 0) - (a.rating ?? 0)))
      .slice(0, 80)
      .map((row) => `| ${fmt(publicName(row))} | ${fmt(spaFamily(row))} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.slug)} |`)
  ];

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: reportPath, rows: rows.length, public: publicRows.length, drafts: draftRows.length, hidden: hiddenRows.length, suspects: suspectRows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
