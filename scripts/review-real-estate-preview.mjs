import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PREVIEW_PATH = "data/import-previews/real-estate-preview.json";
const OUTPUT_DIR = "reports";

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

function areaFromAddress(address) {
  const text = address ?? "";
  for (const area of ["Palmanova", "Magaluf", "Calvià", "Santa Ponça", "Portals Nous", "Cas Català", "Illetes", "Cala Vinyes", "Costa den Blanes", "El Toro", "Bendinat", "Palma", "Port d'Andratx"]) {
    if (text.includes(area)) return area;
  }
  return "-";
}

function likelyUseful(row) {
  const nameAndSite = `${row.name ?? ""} ${row.website ?? ""}`.toLowerCase();
  const isAgency = row.primary_type === "real_estate_agency" || (row.types ?? []).includes("real_estate_agency");
  const languageSignal = /real estate|property|properties|immobilien|mallorca|homes|agency|kensington|berkshire|bhhs|minkner|safehouse|sandberg|coastal/.test(nameAndSite);
  const enoughReviews = (row.reviews_count ?? 0) >= 8;
  return isAgency && languageSignal && enoughReviews;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const preview = JSON.parse(readFileSync(PREVIEW_PATH, "utf8"));
  const ids = preview.map((row) => row.google_place_id).filter(Boolean);
  const { data, error } = await supabase
    .from("businesses")
    .select("google_place_id,slug,status,name,display_name,category,city,area,website")
    .in("google_place_id", ids);
  if (error) throw error;

  const existing = new Map((data ?? []).map((row) => [row.google_place_id, row]));
  const rows = preview.map((row) => ({
    ...row,
    current: existing.get(row.google_place_id) ?? null,
    area_guess: areaFromAddress(row.address),
    recommendation: existing.has(row.google_place_id) ? "skip/update existing" : likelyUseful(row) ? "import candidate" : "review manually"
  }));

  const newRows = rows.filter((row) => !row.current);
  const importCandidates = rows.filter((row) => row.recommendation === "import candidate");
  const manualReview = rows.filter((row) => row.recommendation === "review manually");

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const lines = [
    "# Real Estate Preview Review",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Preview: ${PREVIEW_PATH}`,
    "",
    "## Summary",
    "",
    `- Preview rows: ${rows.length}`,
    `- Already in database: ${rows.length - newRows.length}`,
    `- New rows: ${newRows.length}`,
    `- Import candidates: ${importCandidates.length}`,
    `- Manual review: ${manualReview.length}`,
    "",
    "## Rows",
    "",
    "| Recommendation | Name | Area guess | Rating | Reviews | Type | Website | Existing | Address |",
    "|---|---|---|---:|---:|---|---|---|---|",
    ...rows.map((row) => `| ${fmt(row.recommendation)} | ${fmt(row.name)} | ${fmt(row.area_guess)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.current ? `${row.current.status}:${row.current.slug}` : "-")} | ${fmt(row.address)} |`)
  ];

  const path = join(OUTPUT_DIR, `real-estate-preview-review-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: path, preview_rows: rows.length, existing: rows.length - newRows.length, new_rows: newRows.length, import_candidates: importCandidates.length, manual_review: manualReview.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
