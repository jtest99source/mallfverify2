import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_PREVIEW = "data/import-previews/rent-a-car-general-topup-preview-2026-06-29T14-06-31-833Z.json";
const OUTPUT_PREVIEW = "data/import-previews/rent-a-car-preview.json";
const APPROVED_BACKUP = "data/import-previews/rent-a-car-approved-1-import-preview-2026-06-29.json";
const OUTPUT_DIR = "reports";
const APPROVED_NAMES = ["ROYAL RENT S.A."];

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

function main() {
  if (!existsSync(SOURCE_PREVIEW)) throw new Error(`Missing source preview: ${SOURCE_PREVIEW}`);
  const rows = JSON.parse(readFileSync(SOURCE_PREVIEW, "utf8"));
  const approved = APPROVED_NAMES.map((raw) => ({ raw, normalized: normalize(raw) }));
  const selected = [];
  const missing = [];

  for (const item of approved) {
    const match = rows.find((row) => {
      const name = normalize(row.name);
      return name === item.normalized || name.includes(item.normalized) || item.normalized.includes(name);
    });
    if (match) selected.push({ ...match, category: "rent-a-car" });
    else missing.push(item.raw);
  }

  mkdirSync("data/import-previews", { recursive: true });
  writeFileSync(OUTPUT_PREVIEW, `${JSON.stringify(selected, null, 2)}\n`, "utf8");
  writeFileSync(APPROVED_BACKUP, `${JSON.stringify(selected, null, 2)}\n`, "utf8");

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `rent-a-car-preview-claude-approved-filter-${stamp}.md`);
  const lines = [
    "# Rent-a-car Preview Claude Approved Filter",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Source preview: ${SOURCE_PREVIEW}`,
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
