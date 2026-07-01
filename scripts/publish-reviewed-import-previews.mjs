import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "reports";

const BATCHES = [
  {
    category: "healthcare",
    label: "healthcare-approved-26",
    path: "data/import-previews/healthcare-approved-26-import-preview-2026-06-29.json"
  },
  {
    category: "healthcare",
    label: "healthcare-topup-approved-62",
    path: "data/import-previews/healthcare-preview.json"
  },
  {
    category: "real-estate",
    label: "real-estate-topup-approved-19",
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
  if (!existsSync(batch.path)) throw new Error(`Missing preview file for ${batch.label}: ${batch.path}`);
  return JSON.parse(readFileSync(batch.path, "utf8")).map((row) => ({
    category: batch.category,
    batch: batch.label,
    source_path: batch.path,
    google_place_id: row.google_place_id,
    preview_name: row.name,
    preview_rating: row.rating,
    preview_reviews: row.reviews_count,
    preview_type: row.primary_type,
    preview_website: row.website,
    preview_address: row.address
  }));
}

function dedupeTargets(rows) {
  const unique = new Map();
  for (const row of rows) {
    if (!row.google_place_id) continue;
    const key = `${row.category}:${row.google_place_id}`;
    if (!unique.has(key)) unique.set(key, row);
  }
  return [...unique.values()];
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const supabase = createSupabaseClient();
  const targets = dedupeTargets(BATCHES.flatMap(loadBatch));
  const ids = [...new Set(targets.map((row) => row.google_place_id).filter(Boolean))];

  const { data, error } = await supabase
    .from("businesses")
    .select("id,google_place_id,slug,name,display_name,status,category,city,area,municipality,rating,reviews_count,website,primary_type")
    .in("google_place_id", ids);
  if (error) throw error;

  const rowsByCategoryPlace = new Map((data ?? []).map((row) => [`${row.category}:${row.google_place_id}`, row]));
  const audited = targets.map((row) => ({
    ...row,
    db: rowsByCategoryPlace.get(`${row.category}:${row.google_place_id}`) ?? null
  }));

  const publishable = audited.filter((row) => row.db?.category === row.category && row.db.status === "draft");
  const skipped = audited.filter((row) => !row.db || row.db.category !== row.category || row.db.status !== "draft");

  if (apply && publishable.length) {
    const { error: updateError } = await supabase
      .from("businesses")
      .update({ status: "published", updated_at: new Date().toISOString().slice(0, 10) })
      .in("id", publishable.map((row) => row.db.id));
    if (updateError) throw updateError;
  }

  const summaryByBatch = BATCHES.map((batch) => {
    const batchRows = audited.filter((row) => row.batch === batch.label);
    const batchPublishable = publishable.filter((row) => row.batch === batch.label);
    const batchSkipped = skipped.filter((row) => row.batch === batch.label);
    return {
      label: batch.label,
      category: batch.category,
      target: batchRows.length,
      publishable: batchPublishable.length,
      skipped: batchSkipped.length
    };
  });

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `reviewed-import-previews-publish-${apply ? "apply" : "dry-run"}-${stamp}.md`);
  const lines = [
    "# Reviewed Import Previews Publish",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Apply: ${apply ? "yes" : "no"}`,
    "",
    "## Summary",
    "",
    `- Target rows: ${audited.length}`,
    `- Publishable draft rows: ${publishable.length}`,
    `- Skipped rows: ${skipped.length}`,
    "",
    "| Batch | Category | Target rows | Publishable | Skipped |",
    "|---|---|---:|---:|---:|",
    ...summaryByBatch.map((item) => `| ${fmt(item.label)} | ${fmt(item.category)} | ${item.target} | ${item.publishable} | ${item.skipped} |`),
    "",
    "## Publishable",
    "",
    "| Batch | Category | Current status | Slug | Name | Area | Rating | Reviews | Type | Website |",
    "|---|---|---|---|---|---|---:|---:|---|---|",
    ...publishable.map((row) => {
      const db = row.db;
      return `| ${fmt(row.batch)} | ${fmt(row.category)} | ${fmt(apply ? "published" : db.status)} | ${fmt(db.slug)} | ${fmt(db.display_name || db.name)} | ${fmt(db.city || db.area || db.municipality)} | ${fmt(db.rating)} | ${fmt(db.reviews_count)} | ${fmt(db.primary_type)} | ${fmt(db.website)} |`;
    }),
    "",
    "## Skipped",
    "",
    "| Batch | Category | Status | Slug | Name | Reason |",
    "|---|---|---|---|---|---|",
    ...skipped.map((row) => {
      const db = row.db;
      const reason = !db ? "not found" : db.category !== row.category ? `category=${db.category}` : `status=${db.status}`;
      return `| ${fmt(row.batch)} | ${fmt(row.category)} | ${fmt(db?.status)} | ${fmt(db?.slug)} | ${fmt(db?.display_name || db?.name || row.preview_name)} | ${fmt(reason)} |`;
    })
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({
    report: reportPath,
    apply,
    target_rows: audited.length,
    publishable: publishable.length,
    skipped: skipped.length,
    batches: summaryByBatch
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
