import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PREVIEW_PATH = "data/import-previews/healthcare-preview.json";
const OUTPUT_DIR = "reports";

const APPROVED_PLACE_IDS = new Set([
  "ChIJxQavdxUnmBIR7I3oPzvpnGc", // The Doctor's M. C - Camp de Mar
  "ChIJezRYjE4nmBIRkVaEpzaQpuo", // Clinica Dental Paguera
  "ChIJMf7EgiMnmBIRIbSSDVoy2BI", // Clinica Dental Ferreira
  "ChIJD-_k7hiPlxIRwyJ7F-DBgZE", // The Doctor's M.C. - Magaluf
  "ChIJDT9GSK3llxIRVJVMumuZNHg", // Medcare Medical Center | Port de Soller
  "ChIJ_QPHX_yIlxIR5Fs6iEuz5kk", // DR. STOMA MEDICAL CENTER
  "ChIJmWD-LrmJlxIRtFu6Qie1TMs", // Juaneda Centro Medico Santa Ponsa
  "ChIJzZYEi7GJlxIRQh3X0bXo2Lo", // Dr. Sandra Lossau
  "ChIJw4wiUrmJlxIR2czZvqb_Ap8", // Infinite Dentistry & Aesthetic
  "ChIJLzjo-DKJlxIRLlOarmTK_nI", // Juaneda Medical Care - Son Matias
  "ChIJr8g9UUuJlxIRUOF58NM10wI", // Centro Medico Canovas - Las Palmeras
  "ChIJBR6K0K2PlxIRGXdx_rY_YOU", // Dr. Oliver Hahn
  "ChIJ9_1jhH-OlxIRjTzjBaSz7j4", // Dr. Huw Jones | HSJ Clinic
  "ChIJ_zlYo-LllxIR1tcjPRtvfNE", // Juaneda Medical Care - Puerto de Soller
  "ChIJR0f6CLnolxIRxhq_OjR-SZ4", // Clinica del Peu Soller
  "ChIJpzBuvr_olxIRS8pp6GKnOWc", // Clinica Dental Soller
  "ChIJ42ojRMNQlhIRrGQcTHIkhaA", // Centro Medico Cala d'Or SLU
  "ChIJU2PORxtFlhIRC1JTUvO2Tps", // Fast medic Mallorca. Dr Zamora Calas de Mallorca
  "ChIJZ0-VLvYWlhIR5abZQLYcFSg", // Clinic Cala Rajada
  "ChIJp9s6a4lBlhIRoa4e_bBjKh8", // Doctor- Arzt- Medical Center
  "ChIJi9NjWXVQlhIR_wuA60HuPp0", // Clinica Prof. Dr. Roman
  "ChIJISEvIR5VlhIRYfQlYLm3v0Y", // Podoleg Marc Valldosera
  "ChIJtQL_AIlVlhIRDHSMvMEevGk", // PHYSICUM
  "ChIJg1hZPVZVlhIR66Mu7k8UoZ8", // Orthopadie Dr. Manfred Schlueter Santanyi
  "ChIJBWydxQW7lxIR8TEOxbOmGPE", // Dr. Esser Medical Center
  "ChIJ-2il3qBRlhIR_dJ1BQ9IShw", // Fisioterapia Centre Ca'n Salines
  "ChIJ-6jWEB_EJ4YR4ZghKrQHHi8", // INSADIB
  "ChIJgStjb9JBlhIRX3hX_Wx3W68", // FloydClinic Cala Millor
  "ChIJP-UZx2NAlhIRhb0nZRs4JIE", // Clinica Dental Denthos
  "ChIJQXGo5UFBlhIRJ2VF4wEnH2g" // Clinica Dental Ana
]);

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

const rows = JSON.parse(readFileSync(PREVIEW_PATH, "utf8"));
const approved = rows.filter((row) => APPROVED_PLACE_IDS.has(row.google_place_id));
const excluded = rows.filter((row) => !APPROVED_PLACE_IDS.has(row.google_place_id));
const missing = [...APPROVED_PLACE_IDS].filter(
  (placeId) => !rows.some((row) => row.google_place_id === placeId)
);

if (missing.length) {
  throw new Error(`Approved place IDs not found in preview: ${missing.join(", ")}`);
}

if (approved.length !== APPROVED_PLACE_IDS.size) {
  throw new Error(`Expected ${APPROVED_PLACE_IDS.size} approved rows, found ${approved.length}.`);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = `data/import-previews/healthcare-preview-before-approved-filter-${stamp}.json`;
writeFileSync(backupPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
writeFileSync(PREVIEW_PATH, `${JSON.stringify(approved, null, 2)}\n`, "utf8");

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
const reportPath = join(OUTPUT_DIR, `healthcare-preview-approved-filter-${stamp}.md`);
const lines = [
  "# Healthcare Preview Approved Filter",
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
