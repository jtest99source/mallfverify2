import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_PREVIEW = "data/import-previews/vets-preview.json";
const OUTPUT_PREVIEW = "data/import-previews/vets-preview.json";
const APPROVED_BACKUP = "data/import-previews/vets-approved-claude-import-preview-2026-06-29.json";
const OUTPUT_DIR = "reports";

const SKIP_NAMES = [
  "Clinica Veterinaria Rafael Coll",
  "Medivet Clinica Veterinaria Santa Catalina",
  "centre veterinari Santa Catalina",
  "Veterinary Clinic Ponente",
  "Vet Center Genovese",
  "Genova Vet Clinica Veterinaria",
  "Centro Veterinario Salut Animal",
  "Commeu clinica veterinaria",
  "Clinica Dental Santa Catalina",
  "Mascotasana Palma",
  "Pajareria Son Gotleu",
  "Tiendanimal",
  "Alcudia Magatzem",
  "Can Leon Manacor",
  "Kiwoko Mundo Animal",
  "Templo Animal Autolavado para mascotas",
  "Centro Veterinario Friendly Vets",
  "Servicio Veterinario A Domicilio 24 Horas",
  "Clinica Veterinaria VetSoller",
  "Ladaria Veterinaris",
  "Clinica Veterinaria Pollenca",
  "Clinica Veterinaria Zooclinic",
  "Consultori Guillem Rubi"
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
    return normalized === candidate || normalized.includes(candidate);
  });
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function offIsland(row) {
  const text = normalize(`${row.name ?? ""} ${row.address ?? ""}`);
  return (
    /\b07701\b/.test(text) ||
    text.includes("mao") ||
    text.includes("menorca") ||
    text.includes("las palmas") ||
    text.includes("gran canaria") ||
    text.includes("barcelona") ||
    text.includes("valencia") ||
    text.includes("ciudad real") ||
    text.includes("cdad real") ||
    text.includes("italia") ||
    text.includes(" genova ge ")
  );
}

function specificClaudeSkip(row) {
  const name = normalize(row.name);
  const address = normalize(row.address);
  if (name.includes("andres burguera vidal") && address.includes("santanyi")) return true;
  if (name.includes("kivet salud animal") && address.includes("manacor")) return true;
  return false;
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
    else if (offIsland(row)) reason = "Claude skip: wrong geography";
    else if (specificClaudeSkip(row)) reason = "Claude skip";
    else if (matchesAny(row.name, SKIP_NAMES)) reason = "Claude skip";

    if (reason) excluded.push({ row, reason });
    else approved.push(row);
  }

  writeFileSync(OUTPUT_PREVIEW, `${JSON.stringify(approved, null, 2)}\n`, "utf8");
  writeFileSync(APPROVED_BACKUP, `${JSON.stringify(approved, null, 2)}\n`, "utf8");

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `vets-preview-claude-approved-filter-${stamp}.md`);
  const lines = [
    "# Vets Preview Claude Approved Filter",
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
