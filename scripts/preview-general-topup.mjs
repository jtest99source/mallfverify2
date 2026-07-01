import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getPlaceCategoryConfig } from "./place-category-config.mjs";

const OUTPUT_DIR = "reports";

function argValue(name) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

const category = argValue("category");
if (!category) {
  throw new Error("Missing --category. Example: node scripts/preview-general-topup.mjs --category=healthcare");
}

const config = getPlaceCategoryConfig(category);
const previewPath = config.output;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const safeCategory = category.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
const approvedBackupPath = `data/import-previews/${safeCategory}-approved-import-preview-${stamp}.json`;
const topupPreviewPath = `data/import-previews/${safeCategory}-general-topup-preview-${stamp}.json`;

const hadExistingPreview = existsSync(previewPath);
const existingPreview = hadExistingPreview ? readFileSync(previewPath, "utf8") : null;

if (hadExistingPreview) {
  writeFileSync(approvedBackupPath, existingPreview, "utf8");
}

const result = spawnSync(
  process.execPath,
  ["scripts/preview-google-category.mjs", `--category=${category}`],
  { stdio: "inherit", shell: false }
);

if (result.status !== 0) {
  if (hadExistingPreview && existingPreview !== null) writeFileSync(previewPath, existingPreview, "utf8");
  throw new Error(`General preview failed for ${category}. Restored previous preview.`);
}

const topupRows = JSON.parse(readFileSync(previewPath, "utf8"));
writeFileSync(topupPreviewPath, `${JSON.stringify(topupRows, null, 2)}\n`, "utf8");

if (hadExistingPreview && existingPreview !== null) {
  writeFileSync(previewPath, existingPreview, "utf8");
}

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
const reportPath = join(OUTPUT_DIR, `${safeCategory}-general-topup-preview-${stamp}.md`);
const lines = [
  `# ${category} General Top-Up Preview`,
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Summary",
  "",
  `- Category: ${category}`,
  `- General top-up preview rows: ${topupRows.length}`,
  `- General top-up preview file: ${topupPreviewPath}`,
  hadExistingPreview
    ? `- Existing approved/import preview preserved at: ${approvedBackupPath}`
    : "- No existing preview was present before this run.",
  `- Main category preview restored after run: ${previewPath}`,
  "",
  "## Preview Rows",
  "",
  "| Name | Rating | Reviews | Type | Website | Address |",
  "|---|---:|---:|---|---|---|",
  ...topupRows.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`)
];

writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
console.log(JSON.stringify({
  category,
  report: reportPath,
  topup_preview: topupPreviewPath,
  approved_backup: hadExistingPreview ? approvedBackupPath : null,
  restored_main_preview: previewPath,
  rows: topupRows.length
}, null, 2));
