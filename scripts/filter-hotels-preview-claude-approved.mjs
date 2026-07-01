import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_PREVIEW = "data/import-previews/hotels-preview.json";
const OUTPUT_PREVIEW = "data/import-previews/hotels-preview.json";
const APPROVED_BACKUP = "data/import-previews/hotels-approved-claude-import-preview-2026-06-29.json";
const OUTPUT_DIR = "reports";

const SKIP_NAMES = [
  "Menorca Experimental",
  "Sa Cova Banyalbufar",
  "Restaurant Son Terrassa",
  "Son Menut",
  "La Farm",
  "Torre Playa",
  "AC Hotel Ciutat de Palma",
  "Hotel Oleander",
  "Alcudia Beach Apartments",
  "Grupotel Alcudia Suite",
  "O7 Nordeste Playa",
  "Tropicana Hotel",
  "Hotel Lliteras Cala Ratjada",
  "Leonardo Royal Hotel Palmanova Bay",
  "Leonardo Royal Hotel Mallorca Palmanova Bay",
  "HM Alma Beach Adults Only",
  "Caprice Vell Marí Hotel & Resort",
  "Aparthotel Ciudad Laurel Cala Millor",
  "Indico Rock Hotel",
  "Aubamar Palma Resort"
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
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function skipName(row, normalizedSkips) {
  const rowName = normalize(row.name);
  return normalizedSkips.find(({ raw, normalized }) => rowName === normalized || rowName.includes(normalized) || normalized.includes(rowName))?.raw ?? null;
}

function wrongIslandReason(row) {
  const text = `${row.address ?? ""} ${row.name ?? ""}`;
  if (/\b077(30|40|49|50)\b/i.test(text)) return "wrong island postcode: Menorca";
  if (/\b078(00|20|30|40|49)\b/i.test(text)) return "wrong island postcode: Ibiza";
  return null;
}

async function fetchExistingPlaceIds(supabase) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("businesses")
      .select("google_place_id,slug,status,category,name,display_name")
      .not("google_place_id", "is", null)
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return new Map(rows.map((row) => [row.google_place_id, row]));
}

async function main() {
  loadLocalEnv();
  if (!existsSync(SOURCE_PREVIEW)) throw new Error(`Missing source preview: ${SOURCE_PREVIEW}`);

  const supabase = createSupabaseClient();
  const existingByPlaceId = await fetchExistingPlaceIds(supabase);
  const rows = JSON.parse(readFileSync(SOURCE_PREVIEW, "utf8"));
  const normalizedSkips = SKIP_NAMES.map((raw) => ({ raw, normalized: normalize(raw) }));
  const selected = [];
  const excluded = [];
  const seen = new Set();

  for (const row of rows) {
    if (!row.google_place_id || seen.has(row.google_place_id)) continue;
    seen.add(row.google_place_id);

    const existing = existingByPlaceId.get(row.google_place_id);
    if (existing) {
      excluded.push({ row, reason: `already in DB: ${existing.status}:${existing.category}:${existing.slug}` });
      continue;
    }

    const islandReason = wrongIslandReason(row);
    if (islandReason) {
      excluded.push({ row, reason: islandReason });
      continue;
    }

    const skipped = skipName(row, normalizedSkips);
    if (skipped) {
      excluded.push({ row, reason: `Claude skip: ${skipped}` });
      continue;
    }

    selected.push({ ...row, category: "hotel" });
  }

  mkdirSync("data/import-previews", { recursive: true });
  writeFileSync(OUTPUT_PREVIEW, `${JSON.stringify(selected, null, 2)}\n`, "utf8");
  writeFileSync(APPROVED_BACKUP, `${JSON.stringify(selected, null, 2)}\n`, "utf8");

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `hotels-preview-claude-approved-filter-${stamp}.md`);
  const lines = [
    "# Hotels Preview Claude Approved Filter",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Source preview: ${SOURCE_PREVIEW}`,
    `- Source unique rows considered: ${seen.size}`,
    `- Rows written: ${selected.length}`,
    `- Excluded rows: ${excluded.length}`,
    `- Output preview: ${OUTPUT_PREVIEW}`,
    `- Approved backup: ${APPROVED_BACKUP}`,
    "",
    "## Approved Rows",
    "",
    "| Name | Rating | Reviews | Type | Website | Address |",
    "|---|---:|---:|---|---|---|",
    ...selected.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
    "",
    "## Excluded",
    "",
    "| Name | Reason | Rating | Reviews | Type | Address |",
    "|---|---|---:|---:|---|---|",
    ...excluded.map(({ row, reason }) => `| ${fmt(row.name)} | ${fmt(reason)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.address)} |`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(JSON.stringify({ report: reportPath, output_preview: OUTPUT_PREVIEW, approved_backup: APPROVED_BACKUP, rows: selected.length, excluded: excluded.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
