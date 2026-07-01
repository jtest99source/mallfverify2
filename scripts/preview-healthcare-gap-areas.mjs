import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PREVIEW_PATH = "data/import-previews/healthcare-preview.json";
const OUTPUT_DIR = "reports";
const DEFAULT_AREAS = ["Peguera", "Santa Ponsa", "Palmanova", "Magaluf", "Soller", "Cala d'Or", "Santanyi", "Cala Millor", "Sa Coma"];

function argValue(name) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function splitAreas(value) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function runPreview(area) {
  const result = spawnSync(
    process.execPath,
    ["scripts/preview-google-category.mjs", "--category=healthcare", `--area=${area}`],
    { stdio: "inherit", shell: false }
  );
  if (result.status !== 0) throw new Error(`Preview failed for ${area}.`);
}

const areas = splitAreas(argValue("areas"));
const targetAreas = areas.length ? areas : DEFAULT_AREAS;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");

if (existsSync(PREVIEW_PATH)) {
  const backupPath = `data/import-previews/healthcare-preview-before-gap-batch-${stamp}.json`;
  writeFileSync(backupPath, readFileSync(PREVIEW_PATH, "utf8"), "utf8");
}

const unique = new Map();
const perArea = [];

for (const area of targetAreas) {
  runPreview(area);
  const rows = JSON.parse(readFileSync(PREVIEW_PATH, "utf8"));
  let added = 0;
  for (const row of rows) {
    if (!row.google_place_id) continue;
    if (!unique.has(row.google_place_id)) {
      unique.set(row.google_place_id, { ...row, preview_area: area });
      added += 1;
    }
  }
  perArea.push({ area, fetched: rows.length, added });
}

const merged = Array.from(unique.values());
writeFileSync(PREVIEW_PATH, `${JSON.stringify(merged, null, 2)}\n`, "utf8");

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
const reportPath = join(OUTPUT_DIR, `healthcare-gap-preview-batch-${stamp}.md`);
const lines = [
  "# Healthcare Gap Preview Batch",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Preview output: ${PREVIEW_PATH}`,
  "",
  "## Summary",
  "",
  `- Areas searched: ${targetAreas.join(", ")}`,
  `- Unique preview rows: ${merged.length}`,
  "",
  "## By Area",
  "",
  "| Area | Rows fetched | Unique added |",
  "|---|---:|---:|",
  ...perArea.map((item) => `| ${fmt(item.area)} | ${item.fetched} | ${item.added} |`),
  "",
  "## Preview Rows",
  "",
  "| Area source | Name | Rating | Reviews | Type | Website | Address |",
  "|---|---|---:|---:|---|---|---|",
  ...merged.map((row) => `| ${fmt(row.preview_area)} | ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`)
];

writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
console.log(JSON.stringify({ report: reportPath, preview: PREVIEW_PATH, areas: targetAreas, unique_rows: merged.length }, null, 2));
