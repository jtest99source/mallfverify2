import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PREVIEW_PATH = "data/import-previews/healthcare-preview.json";
const OUTPUT_DIR = "reports";

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

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function family(row) {
  const types = [row.primary_type, ...(row.types ?? [])].filter(Boolean);
  const text = `${row.name ?? ""} ${row.website ?? ""}`.toLowerCase();
  if (types.some((type) => /dentist|dental/.test(type)) || /dent|zahnarzt|dental/.test(text)) return "dentist";
  if (types.some((type) => /hospital|medical_clinic|medical_center|urgent_care/.test(type)) || /clinic|clinica|medical|hospital|policlinic/.test(text)) return "clinic";
  if (types.some((type) => /doctor|health/.test(type)) || /doctor|arzt|m[eé]dico|medico|gp\b/.test(text)) return "doctor";
  if (types.some((type) => /physiotherapist|chiropractor/.test(type)) || /fisio|physio|fisioterapia|chiro/.test(text)) return "physio";
  if (types.some((type) => /beauty|spa|veterinary|shopping|lodging/.test(type))) return "wrong-category";
  return "other";
}

function likelyUseful(row) {
  const typeFamily = family(row);
  const text = `${row.name ?? ""} ${row.website ?? ""}`.toLowerCase();
  const internationalSignal = /english|british|international|doctor|medical|clinic|dental|deutsch|arzt|zahnarzt|praxis|klinik|juaneda|doctor spain|medcare|ims|allmedica/.test(text);
  if (!["doctor", "clinic", "dentist", "physio"].includes(typeFamily)) return false;
  if ((row.rating ?? 0) < 4.3) return false;
  if ((row.reviews_count ?? 0) < 12) return false;
  if (!internationalSignal && (row.reviews_count ?? 0) < 50) return false;
  return true;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const preview = JSON.parse(readFileSync(PREVIEW_PATH, "utf8"));
  const ids = preview.map((row) => row.google_place_id).filter(Boolean);
  const { data, error } = await supabase
    .from("businesses")
    .select("google_place_id,slug,status,name,display_name,category,city,area,website")
    .in("google_place_id", ids);
  if (error) throw error;

  const existing = new Map((data ?? []).map((row) => [row.google_place_id, row]));
  const rows = preview.map((row) => ({
    ...row,
    current: existing.get(row.google_place_id) ?? null,
    family: family(row),
    recommendation: existing.has(row.google_place_id) ? "skip/update existing" : likelyUseful(row) ? "import candidate" : "review manually"
  }));
  const newRows = rows.filter((row) => !row.current);
  const importCandidates = rows.filter((row) => row.recommendation === "import candidate");
  const manualReview = rows.filter((row) => row.recommendation === "review manually");

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const path = join(OUTPUT_DIR, `healthcare-preview-review-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  const lines = [
    "# Healthcare Preview Review",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Preview: ${PREVIEW_PATH}`,
    "",
    "## Summary",
    "",
    `- Preview rows: ${rows.length}`,
    `- Already in database: ${rows.length - newRows.length}`,
    `- New rows: ${newRows.length}`,
    `- Import candidates: ${importCandidates.length}`,
    `- Manual review: ${manualReview.length}`,
    "",
    "## Rows",
    "",
    "| Recommendation | Source area | Name | Family | Rating | Reviews | Type | Website | Existing | Address |",
    "|---|---|---|---|---:|---:|---|---|---|---|",
    ...rows.map((row) => `| ${fmt(row.recommendation)} | ${fmt(row.preview_area)} | ${fmt(row.name)} | ${fmt(row.family)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.current ? `${row.current.status}:${row.current.slug}` : "-")} | ${fmt(row.address)} |`)
  ];
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: path, preview_rows: rows.length, existing: rows.length - newRows.length, new_rows: newRows.length, import_candidates: importCandidates.length, manual_review: manualReview.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
