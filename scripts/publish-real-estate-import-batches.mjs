import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "reports";
const BATCHES = [
  {
    label: "palmanova-calvia-approved-9",
    path: "data/import-previews/real-estate-preview-before-gap-batch-2026-06-29T11-30-37-969Z.json"
  },
  {
    label: "gap-areas-claude-approved-13",
    path: "data/import-previews/real-estate-preview.json"
  }
];

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

function loadBatch(batch) {
  const rows = JSON.parse(readFileSync(batch.path, "utf8"));
  return rows.map((row) => ({
    batch: batch.label,
    google_place_id: row.google_place_id,
    preview_name: row.name
  }));
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const supabase = createSupabaseClient();
  const previewRows = BATCHES.flatMap(loadBatch);
  const ids = [...new Set(previewRows.map((row) => row.google_place_id).filter(Boolean))];

  const { data, error } = await supabase
    .from("businesses")
    .select("id,google_place_id,slug,name,display_name,status,category,city,area,municipality,rating,reviews_count,website,primary_type")
    .in("google_place_id", ids);
  if (error) throw error;

  const byPlaceId = new Map((data ?? []).map((row) => [row.google_place_id, row]));
  const rows = previewRows.map((row) => ({ ...row, db: byPlaceId.get(row.google_place_id) ?? null }));
  const publishable = rows.filter((row) => row.db?.category === "real-estate" && row.db.status === "draft");
  const skipped = rows.filter((row) => !row.db || row.db.category !== "real-estate" || row.db.status !== "draft");

  if (apply && publishable.length) {
    const { error: updateError } = await supabase
      .from("businesses")
      .update({ status: "published", updated_at: new Date().toISOString().slice(0, 10) })
      .in("id", publishable.map((row) => row.db.id));
    if (updateError) throw updateError;
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = join(OUTPUT_DIR, `real-estate-import-batches-publish-${apply ? "apply" : "dry-run"}-${stamp}.md`);
  const lines = [
    "# Real Estate Import Batches Publish",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Apply: ${apply ? "yes" : "no"}`,
    "",
    "## Summary",
    "",
    `- Target preview rows: ${rows.length}`,
    `- Publishable draft rows: ${publishable.length}`,
    `- Skipped rows: ${skipped.length}`,
    "",
    "## Publishable",
    "",
    "| Batch | Current status | Slug | Name | Area | Rating | Reviews | Type | Website |",
    "|---|---|---|---|---|---:|---:|---|---|",
    ...publishable.map((row) => {
      const db = row.db;
      return `| ${fmt(row.batch)} | ${fmt(apply ? "published" : db.status)} | ${fmt(db.slug)} | ${fmt(db.display_name || db.name)} | ${fmt(db.city || db.area || db.municipality)} | ${fmt(db.rating)} | ${fmt(db.reviews_count)} | ${fmt(db.primary_type)} | ${fmt(db.website)} |`;
    }),
    "",
    "## Skipped",
    "",
    "| Batch | Status | Slug | Name | Reason |",
    "|---|---|---|---|---|",
    ...skipped.map((row) => {
      const db = row.db;
      const reason = !db ? "not found" : db.category !== "real-estate" ? `category=${db.category}` : `status=${db.status}`;
      return `| ${fmt(row.batch)} | ${fmt(db?.status)} | ${fmt(db?.slug)} | ${fmt(db?.display_name || db?.name || row.preview_name)} | ${fmt(reason)} |`;
    })
  ];
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: path, apply, target_rows: rows.length, publishable: publishable.length, skipped: skipped.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
