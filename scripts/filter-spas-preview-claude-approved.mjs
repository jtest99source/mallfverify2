import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_PATH = "data/import-previews/spas-general-topup-preview-2026-06-29T12-53-28-387Z.json";
const PREVIEW_PATH = "data/import-previews/spas-preview.json";
const OUTPUT_DIR = "reports";

const APPROVED_NAMES = new Set([
  "Bangkok Thai traditional massage",
  "Jaidee Thai Wellness S’Arenal",
  "Plenitud Experience. Especialistas en masaje PRENATAL. Embarazadas, maternidad, mujer..",
  "COS centro de quiromasaje",
  "Azurit Wellness- MASSAGE & BEAUTY - PALMA DE MALLORCA",
  "Aloha Temple - Mallorca"
]);

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const approvedNames = new Set([...APPROVED_NAMES].map(normalize));
const rows = JSON.parse(readFileSync(SOURCE_PATH, "utf8"));
const approved = rows.filter((row) => approvedNames.has(normalize(row.name)));
const excluded = rows.filter((row) => !approvedNames.has(normalize(row.name)));
const missing = [...approvedNames].filter((name) => !rows.some((row) => normalize(row.name) === name));

if (missing.length) {
  throw new Error(`Approved names not found in source preview: ${missing.join(", ")}`);
}

if (approved.length !== APPROVED_NAMES.size) {
  throw new Error(`Expected ${APPROVED_NAMES.size} approved rows, found ${approved.length}.`);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = `data/import-previews/spas-preview-before-claude-approved-filter-${stamp}.json`;
if (existsSync(PREVIEW_PATH)) {
  writeFileSync(backupPath, readFileSync(PREVIEW_PATH, "utf8"), "utf8");
}
writeFileSync(PREVIEW_PATH, `${JSON.stringify(approved, null, 2)}\n`, "utf8");

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
const reportPath = join(OUTPUT_DIR, `spas-preview-claude-approved-filter-${stamp}.md`);
const lines = [
  "# Spas Preview Claude Approved Filter",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Summary",
  "",
  `- Source preview rows: ${rows.length}`,
  `- Approved rows kept: ${approved.length}`,
  `- Excluded rows: ${excluded.length}`,
  `- Output preview: ${PREVIEW_PATH}`,
  existsSync(backupPath) ? `- Previous preview backup: ${backupPath}` : "- Previous preview backup: -",
  "",
  "## Kept For Import",
  "",
  "| Name | Rating | Reviews | Type | Website | Address |",
  "|---|---:|---:|---|---|---|",
  ...approved.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
  "",
  "## Excluded",
  "",
  "| Name | Rating | Reviews | Type | Website | Address |",
  "|---|---:|---:|---|---|---|",
  ...excluded.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`)
];

writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
console.log(JSON.stringify({ preview: PREVIEW_PATH, backup: existsSync(backupPath) ? backupPath : null, report: reportPath, kept: approved.length, excluded: excluded.length }, null, 2));
