import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PREVIEW_PATH = "data/import-previews/real-estate-preview.json";
const OUTPUT_DIR = "reports";

const APPROVED_NAMES = new Set([
  "Berkshire Hathaway HomeServices Nova Mallorca, Puerto Portals Office",
  "Calvià Properties",
  "Mallorca Sol Properties",
  "Richmallorca real estate",
  "Steffek und Partner",
  "BECKER & BECKER IMMOBILIEN MALLORCA",
  "Hola Reality",
  "Safehouse The Real Estate Group",
  "Gestpropiedad-Cas Català"
]);

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

const rows = JSON.parse(readFileSync(PREVIEW_PATH, "utf8"));
const approved = rows.filter((row) => APPROVED_NAMES.has(row.name));
const excluded = rows.filter((row) => !APPROVED_NAMES.has(row.name));
const missing = [...APPROVED_NAMES].filter((name) => !rows.some((row) => row.name === name));

if (missing.length) {
  throw new Error(`Approved names not found in preview: ${missing.join(", ")}`);
}

if (approved.length !== APPROVED_NAMES.size) {
  throw new Error(`Expected ${APPROVED_NAMES.size} approved rows, found ${approved.length}.`);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = `data/import-previews/real-estate-preview-before-approved-filter-${stamp}.json`;
writeFileSync(backupPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
writeFileSync(PREVIEW_PATH, `${JSON.stringify(approved, null, 2)}\n`, "utf8");

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
const reportPath = join(OUTPUT_DIR, `real-estate-preview-approved-filter-${stamp}.md`);
const lines = [
  "# Real Estate Preview Approved Filter",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Summary",
  "",
  `- Original preview rows: ${rows.length}`,
  `- Approved rows kept: ${approved.length}`,
  `- Excluded rows removed from import preview: ${excluded.length}`,
  `- Backup: ${backupPath}`,
  "",
  "## Kept For Import",
  "",
  "| Name | Rating | Reviews | Type | Website | Address |",
  "|---|---:|---:|---|---|---|",
  ...approved.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
  "",
  "## Excluded From This Import",
  "",
  "| Name | Rating | Reviews | Type | Website | Address |",
  "|---|---:|---:|---|---|---|",
  ...excluded.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`)
];

writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
console.log(JSON.stringify({ preview: PREVIEW_PATH, backup: backupPath, report: reportPath, kept: approved.length, excluded: excluded.length }, null, 2));
