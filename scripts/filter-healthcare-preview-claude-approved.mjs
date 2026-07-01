import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PREVIEW_PATH = "data/import-previews/healthcare-preview.json";
const OUTPUT_DIR = "reports";

const SKIP_NAMES = new Set([
  "Dr. Sandra Lossau",
  "Dr. Oliver Hahn",
  "Dr. Huw Jones | HSJ Clinic",
  "Clinic Cala Rajada"
]);

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

const rows = JSON.parse(readFileSync(PREVIEW_PATH, "utf8"));
const approved = rows.filter((row) => !SKIP_NAMES.has(row.name));
const skipped = rows.filter((row) => SKIP_NAMES.has(row.name));
const missing = [...SKIP_NAMES].filter((name) => !rows.some((row) => row.name === name));

if (missing.length) {
  throw new Error(`Skip names not found in preview: ${missing.join(", ")}`);
}

if (skipped.length !== SKIP_NAMES.size) {
  throw new Error(`Expected ${SKIP_NAMES.size} skipped rows, found ${skipped.length}.`);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = `data/import-previews/healthcare-preview-before-claude-approved-filter-${stamp}.json`;
writeFileSync(backupPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
writeFileSync(PREVIEW_PATH, `${JSON.stringify(approved, null, 2)}\n`, "utf8");

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
const reportPath = join(OUTPUT_DIR, `healthcare-preview-claude-approved-filter-${stamp}.md`);
const lines = [
  "# Healthcare Preview Claude Approved Filter",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Summary",
  "",
  `- Preview rows before Claude filter: ${rows.length}`,
  `- Approved rows kept: ${approved.length}`,
  `- Skipped rows removed: ${skipped.length}`,
  `- Backup: ${backupPath}`,
  "",
  "## Kept For Import",
  "",
  "| Name | Rating | Reviews | Type | Website | Address |",
  "|---|---:|---:|---|---|---|",
  ...approved.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
  "",
  "## Skipped",
  "",
  "| Name | Rating | Reviews | Type | Website | Address |",
  "|---|---:|---:|---|---|---|",
  ...skipped.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`)
];

writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
console.log(JSON.stringify({ preview: PREVIEW_PATH, backup: backupPath, report: reportPath, kept: approved.length, skipped: skipped.length }, null, 2));
