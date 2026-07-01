import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_PATH = "data/import-previews/real-estate-preview-before-gap-approved-filter-2026-06-29T11-32-22-255Z.json";
const PREVIEW_PATH = "data/import-previews/real-estate-preview.json";
const OUTPUT_DIR = "reports";

const APPROVED_NAMES = new Set([
  "Perera & Partner INMOBILIARIA",
  "Inmobiliaria Colònia Sant Pere",
  "Inmobiliaria Sa Coma",
  "FALC Real Estate Nordost",
  "LAB Properties",
  "Inmobiliaria en Palma de Mallorca - REGA International Realty",
  "GestPropiedad Sant Jordi",
  "Inmopropiedad - Inmobiliaria Mallorca",
  "Claudia Kuhrau Immobilien",
  "PHOENIX MALLORCA",
  "Inmobiliaria Q Mallorca",
  "Immobilienagentur Fincas Bonnin Sanso - Cala Millor",
  "Hernán Nogués Real Estate - Inmobiliaria"
]);

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

const rows = JSON.parse(readFileSync(SOURCE_PATH, "utf8"));
const approved = rows.filter((row) => APPROVED_NAMES.has(row.name));
const excluded = rows.filter((row) => !APPROVED_NAMES.has(row.name));
const missing = [...APPROVED_NAMES].filter((name) => !rows.some((row) => row.name === name));

if (missing.length) {
  throw new Error(`Approved names not found in source preview: ${missing.join(", ")}`);
}

if (approved.length !== APPROVED_NAMES.size) {
  throw new Error(`Expected ${APPROVED_NAMES.size} approved rows, found ${approved.length}.`);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = `data/import-previews/real-estate-preview-before-claude-approved-filter-${stamp}.json`;
writeFileSync(backupPath, readFileSync(PREVIEW_PATH, "utf8"), "utf8");
writeFileSync(PREVIEW_PATH, `${JSON.stringify(approved, null, 2)}\n`, "utf8");

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
const reportPath = join(OUTPUT_DIR, `real-estate-gap-preview-claude-approved-filter-${stamp}.md`);
const lines = [
  "# Real Estate Gap Preview Claude Approved Filter",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Summary",
  "",
  `- Source preview rows: ${rows.length}`,
  `- Approved rows kept: ${approved.length}`,
  `- Excluded rows: ${excluded.length}`,
  `- Previous preview backup: ${backupPath}`,
  `- Source backup reviewed: ${SOURCE_PATH}`,
  "",
  "## Kept For Import",
  "",
  "| Source area | Name | Rating | Reviews | Type | Website | Address |",
  "|---|---|---:|---:|---|---|---|",
  ...approved.map((row) => `| ${fmt(row.preview_area)} | ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
  "",
  "## Excluded From This Import",
  "",
  "| Source area | Name | Rating | Reviews | Type | Website | Address |",
  "|---|---|---:|---:|---|---|---|",
  ...excluded.map((row) => `| ${fmt(row.preview_area)} | ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`)
];

writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
console.log(JSON.stringify({ preview: PREVIEW_PATH, backup: backupPath, report: reportPath, kept: approved.length, excluded: excluded.length }, null, 2));
