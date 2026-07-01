import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_PREVIEW = "data/import-previews/casinos-preview.json";
const OUTPUT_PREVIEW = "data/import-previews/casinos-preview.json";
const APPROVED_BACKUP = "data/import-previews/casinos-approved-pragmatic-import-preview-2026-06-29.json";
const OUTPUT_DIR = "reports";

const INCLUDE_NAMES = [
  "Casino Mallorca Luckia",
  "Gringos Bingo",
  "Tropicana Merkur Casino",
  "Bingo Rosales",
  "Bingo Versalles",
  "Salon de juegos Merkur",
  "Merkur salon de juegos",
  "Orenes Sports Bar & Salon de Juego",
  "Sport bar Cafeteria Apuestas Deportivas Local de Juego Punt de Joc El Plaza"
];

const EXCLUDE_EXACT_OR_PARTIAL = [
  "Casino Menorca",
  "Gran Casino Costa Brava",
  "Casino Tarragona",
  "Casino Peralada",
  "Casino Barcelona",
  "Casino Collioure",
  "UNNIC Andorra",
  "Alcudia Garden Aparthotel",
  "Club Mac",
  "Realidad Virtual Another World Mallorca",
  "PAMADI PORTO PI",
  "PAMADI Tamesis",
  "Mega Fun Games Ciudad Jardin",
  "Mega Fun Games Avenidas",
  "Mega Fun Games Playa de Palma",
  "Mega Fun Games La Ribera",
  "Fun Games Baleares",
  "Bingo Casa Menorca"
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

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function matchesAny(name, list) {
  const normalized = normalize(name);
  return list.some((raw) => {
    const candidate = normalize(raw);
    return normalized === candidate || normalized.includes(candidate) || candidate.includes(normalized);
  });
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

async function fetchExistingRows(supabase) {
  const byPlaceId = new Map();
  const byName = new Map();
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("google_place_id,status,category,slug,name,display_name")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    for (const row of data ?? []) {
      if (row.google_place_id) byPlaceId.set(row.google_place_id, row);
      byName.set(normalize(row.display_name || row.name), row);
    }
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  return { byPlaceId, byName };
}

async function main() {
  loadLocalEnv();
  if (!existsSync(SOURCE_PREVIEW)) throw new Error(`Missing preview file: ${SOURCE_PREVIEW}`);

  const supabase = createSupabaseClient();
  const existing = await fetchExistingRows(supabase);
  const sourceRows = JSON.parse(readFileSync(SOURCE_PREVIEW, "utf8"));
  const unique = new Map();
  for (const row of sourceRows) {
    if (row.google_place_id && !unique.has(row.google_place_id)) unique.set(row.google_place_id, row);
  }

  const approved = [];
  const excluded = [];

  for (const row of unique.values()) {
    const existingById = existing.byPlaceId.get(row.google_place_id);
    const existingByName = existing.byName.get(normalize(row.name));
    let reason = null;

    if (existingById) reason = `already in DB by place id: ${existingById.status}:${existingById.category}:${existingById.slug}`;
    else if (existingByName) reason = `already in DB by name: ${existingByName.status}:${existingByName.category}:${existingByName.slug}`;
    else if (matchesAny(row.name, EXCLUDE_EXACT_OR_PARTIAL)) reason = "Claude/pragmatic skip";
    else if (matchesAny(row.name, ["Orenes Sports Bar & Salon de Juego"]) && (row.reviews_count ?? 0) < 50) reason = "Claude/pragmatic skip: Orenes branch too thin";
    else if (!matchesAny(row.name, INCLUDE_NAMES)) reason = "not in pragmatic include list";

    if (reason) excluded.push({ row, reason });
    else approved.push(row);
  }

  writeFileSync(OUTPUT_PREVIEW, `${JSON.stringify(approved, null, 2)}\n`, "utf8");
  writeFileSync(APPROVED_BACKUP, `${JSON.stringify(approved, null, 2)}\n`, "utf8");

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `casinos-preview-pragmatic-approved-filter-${stamp}.md`);
  const lines = [
    "# Casinos Preview Pragmatic Approved Filter",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Source preview: ${SOURCE_PREVIEW}`,
    `- Source unique rows considered: ${unique.size}`,
    `- Rows written: ${approved.length}`,
    `- Excluded rows: ${excluded.length}`,
    `- Output preview: ${OUTPUT_PREVIEW}`,
    `- Approved backup: ${APPROVED_BACKUP}`,
    "",
    "## Approved Rows",
    "",
    "| Name | Rating | Reviews | Type | Website | Address |",
    "|---|---:|---:|---|---|---|",
    ...approved.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
    "",
    "## Excluded",
    "",
    "| Name | Reason | Rating | Reviews | Type | Address |",
    "|---|---|---:|---:|---|---|",
    ...excluded.map(({ row, reason }) => `| ${fmt(row.name)} | ${fmt(reason)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.address)} |`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(JSON.stringify({ report: reportPath, output_preview: OUTPUT_PREVIEW, approved_backup: APPROVED_BACKUP, rows: approved.length, excluded: excluded.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
