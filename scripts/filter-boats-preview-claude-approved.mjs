import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_PREVIEW = "data/import-previews/boats-preview.json";
const OUTPUT_PREVIEW = "data/import-previews/boats-preview.json";
const APPROVED_BACKUP = "data/import-previews/boats-approved-33-import-preview-2026-06-29.json";
const OUTPUT_DIR = "reports";

const APPROVED_NAMES = [
  "JETSKI VICE MALLORCA",
  "MONKEY ON TOURS",
  "LIFE & SEA MALLORCA",
  "Sea Safari Mallorca",
  "WATERSPORTS MALLORCA MAGALUF",
  "VIBE Magaluf Excursions & Events",
  "RedstarTours Excursiones",
  "NATURE BOAT PORTOCOLOM",
  "Jetski on Delivery",
  "Jet Ski For Rent Santa Ponsa",
  "OASIS CATAMARAN",
  "Attraction Catamarans Mallorca",
  "ROBINSON BOAT MALLORCA",
  "Mallorca Llaut Experience",
  "Llaut San Francisco",
  "Bladerunner Mallorca",
  "Eco Catamaran E-sea",
  "The Sailing Adventure Mallorca",
  "Sa Roqueta Jet Ski",
  "KIWI Charter Mallorca",
  "Islander Charter Mallorca",
  "Aventura IB Colonia de Sant Jordi",
  "Excursions La Mallorca",
  "My Bay Alquiler de Barcos",
  "Bonnie Lass Charters",
  "Onboat Mallorca",
  "One Jetski Cala D'Or",
  "CAPRICE EXPERIENCE",
  "Blue Sea Charter Cala d'Or",
  "Vela Charter Balear",
  "No Frills Excursions",
  "Puerto Pollensa Boat Trips",
  "NEMO MALLORCA CHARTER"
];

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

function findApprovedRow(rows, approvedName) {
  const normalizedApproved = normalize(approvedName);
  return rows.find((row) => {
    const normalizedName = normalize(row.name);
    return normalizedName === normalizedApproved || normalizedName.includes(normalizedApproved) || normalizedApproved.includes(normalizedName);
  });
}

function main() {
  if (!existsSync(SOURCE_PREVIEW)) throw new Error(`Missing source preview: ${SOURCE_PREVIEW}`);
  const rows = JSON.parse(readFileSync(SOURCE_PREVIEW, "utf8"));
  const selected = [];
  const missing = [];
  const seenPlaceIds = new Set();

  for (const name of APPROVED_NAMES) {
    const match = findApprovedRow(rows, name);
    if (!match) {
      missing.push(name);
      continue;
    }
    if (match.google_place_id && seenPlaceIds.has(match.google_place_id)) continue;
    if (match.google_place_id) seenPlaceIds.add(match.google_place_id);
    selected.push({ ...match, category: "boat-rental" });
  }

  mkdirSync("data/import-previews", { recursive: true });
  writeFileSync(OUTPUT_PREVIEW, `${JSON.stringify(selected, null, 2)}\n`, "utf8");
  writeFileSync(APPROVED_BACKUP, `${JSON.stringify(selected, null, 2)}\n`, "utf8");

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `boats-preview-claude-approved-filter-${stamp}.md`);
  const lines = [
    "# Boats Preview Claude Approved Filter",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Source preview: ${SOURCE_PREVIEW}`,
    `- Approved names requested: ${APPROVED_NAMES.length}`,
    `- Rows written: ${selected.length}`,
    `- Output preview: ${OUTPUT_PREVIEW}`,
    `- Approved backup: ${APPROVED_BACKUP}`,
    `- Missing approved names: ${missing.length}`,
    "",
    "## Approved Rows",
    "",
    "| Name | Rating | Reviews | Type | Website | Address |",
    "|---|---:|---:|---|---|---|",
    ...selected.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
    "",
    "## Missing",
    "",
    ...missing.map((name) => `- ${name}`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(JSON.stringify({ report: reportPath, output_preview: OUTPUT_PREVIEW, approved_backup: APPROVED_BACKUP, rows: selected.length, missing }, null, 2));
}

main();
