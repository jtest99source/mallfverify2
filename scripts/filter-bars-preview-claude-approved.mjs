import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_PREVIEW = "data/import-previews/bars-preview.json";
const OUTPUT_PREVIEW = "data/import-previews/bars-preview.json";
const APPROVED_BACKUP = "data/import-previews/bars-approved-claude-import-preview-2026-06-29.json";
const OUTPUT_DIR = "reports";

const SKIP_NAMES = [
  "Gin Tonic Bar",
  "Hotel Hostal Cuba",
  "Terreno Barrio Hotel",
  "Portixol Restaurante",
  "Es Gremi",
  "Stereo Mallorca",
  "Cala Deia",
  "Mirador Banyalbufar",
  "Beach House Port Soller",
  "Ca'n Uetam",
  "A.S.S. Gent Gran",
  "The TOP Hotel Honucai Rooftop bar",
  "La Palmera Capdepera",
  "Rumours Bar",
  "Bar El Extremeno",
  "La Botte",
  "Casa Coffee & Wine",
  "Maraca Club",
  "Sport bar Punt de Joc Dragonera",
  "Sport bar Cafeteria Apuestas Deportivas Local de Juego Punt de Joc Dragonera",
  "Orient Shisha Palma",
  "Kaelum Club",
  "Times Square Music Club",
  "BAR CUBA COLONIAL",
  "Discoteca Living Music Club",
  "La Terraza Joan Miro",
  "Thalassa Maritimo",
  "Balneario 6",
  "Vermuteria La Rosa Catalina",
  "Mojo Beach",
  "Restaurante Club Nautico Portitxol",
  "Restaurante Cocco Portitxol",
  "Bar Bon Brou",
  "Cafe Es Firo",
  "Tramuntana Grill",
  "Ca'n Lluc",
  "Ca's Patro March",
  "Placa Cartoixa Cafeteria Ca'n Molinas",
  "The Tavern Irish Pub Alcudia",
  "Lemon Lounge Bar Pollenca",
  "Sea.Bar.Is Port de Pollenca",
  "Restaurant sa Caleta Cala Millor",
  "Calma Beach Club Cala Millor",
  "Flamingo Bar Restaurant Porto Cristo",
  "Arenal de Canyamel",
  "Sa Font Bierbrunnen Cala Ratjada",
  "Restaurante La Marina Cala Figuera",
  "5illes BEACH&SUNSET Colonia",
  "Bar Madison Colonia",
  "Restaurante s'Ona Beach",
  "Ginger",
  "Linekers Bar Magaluf",
  "Tim's Port d'Andratx",
  "Chiringuito de camp de mar",
  "Es Celler de Manacor",
  "Natura beach Balneario 7",
  "Stop & Smile",
  "Bar Estacion Inca",
  "Bierkonig",
  "Beach Club y Cocktail Bar La Pedrisa"
];

const REDIRECT_TO_CAFES = [
  "La Corderia",
  "Cafe a Tres Bandas",
  "Cafe Bar Es Vaixell",
  "Es Trui de Soller",
  "Aromas Valldemossa",
  "Cafe Sa Fonda",
  "La Mar Dolca",
  "Bar Marina",
  "Cafeteria Bar Camp de Mar",
  "La Comercial",
  "Perbacco",
  "Cafe Bistro Mara",
  "Bhukkad Boca"
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

function matchesName(name, list) {
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

function looksOffIsland(row) {
  const text = normalize(`${row.name ?? ""} ${row.address ?? ""}`);
  return /\b29015\b/.test(text) || text.includes("malaga") || text.includes("menorca") || text.includes("ibiza");
}

async function fetchExistingRows(supabase) {
  const byPlaceId = new Map();
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("google_place_id,status,category,slug,name,display_name")
      .not("google_place_id", "is", null)
      .range(from, from + pageSize - 1);
    if (error) throw error;
    for (const row of data ?? []) byPlaceId.set(row.google_place_id, row);
    if (!data || data.length < pageSize) break;
    from += pageSize;
  }
  return byPlaceId;
}

async function main() {
  loadLocalEnv();
  if (!existsSync(SOURCE_PREVIEW)) throw new Error(`Missing preview file: ${SOURCE_PREVIEW}`);

  const supabase = createSupabaseClient();
  const existingByPlaceId = await fetchExistingRows(supabase);
  const sourceRows = JSON.parse(readFileSync(SOURCE_PREVIEW, "utf8"));
  const unique = new Map();
  for (const row of sourceRows) {
    const id = row.google_place_id;
    if (!id || unique.has(id)) continue;
    unique.set(id, row);
  }

  const approved = [];
  const excluded = [];

  for (const row of unique.values()) {
    const existing = existingByPlaceId.get(row.google_place_id);
    let reason = null;
    if (existing) reason = `already in DB: ${existing.status}:${existing.category}:${existing.slug}`;
    else if (looksOffIsland(row)) reason = "Claude skip: off-island / mainland";
    else if (matchesName(row.name, SKIP_NAMES)) reason = `Claude skip: ${row.name}`;
    else if (matchesName(row.name, REDIRECT_TO_CAFES)) reason = `Claude redirect to cafes: ${row.name}`;

    if (reason) excluded.push({ row, reason });
    else approved.push(row);
  }

  writeFileSync(OUTPUT_PREVIEW, `${JSON.stringify(approved, null, 2)}\n`, "utf8");
  writeFileSync(APPROVED_BACKUP, `${JSON.stringify(approved, null, 2)}\n`, "utf8");

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `bars-preview-claude-approved-filter-${stamp}.md`);
  const lines = [
    "# Bars Preview Claude Approved Filter",
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

  console.log(
    JSON.stringify(
      {
        report: reportPath,
        output_preview: OUTPUT_PREVIEW,
        approved_backup: APPROVED_BACKUP,
        rows: approved.length,
        excluded: excluded.length
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
