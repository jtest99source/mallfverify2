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
    source_path: batch.path,
    preview_area: row.preview_area ?? null,
    google_place_id: row.google_place_id,
    preview_name: row.name,
    preview_rating: row.rating,
    preview_reviews: row.reviews_count,
    preview_type: row.primary_type,
    preview_website: row.website,
    preview_address: row.address
  }));
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const previewRows = BATCHES.flatMap(loadBatch);
  const ids = [...new Set(previewRows.map((row) => row.google_place_id).filter(Boolean))];
  const { data, error } = await supabase
    .from("businesses")
    .select("google_place_id,slug,name,display_name,status,category,city,area,municipality,rating,reviews_count,website,primary_type,imported_at,updated_at")
    .in("google_place_id", ids);
  if (error) throw error;

  const byPlaceId = new Map((data ?? []).map((row) => [row.google_place_id, row]));
  const audited = previewRows.map((row) => ({ ...row, db: byPlaceId.get(row.google_place_id) ?? null }));
  const batchSummaries = BATCHES.map((batch) => {
    const rows = audited.filter((row) => row.batch === batch.label);
    return {
      batch: batch.label,
      total: rows.length,
      found: rows.filter((row) => row.db).length,
      draft: rows.filter((row) => row.db?.status === "draft").length,
      published: rows.filter((row) => row.db?.status === "published" || row.db?.status === "premium").length,
      hidden: rows.filter((row) => row.db?.status === "hidden").length,
      missing: rows.filter((row) => !row.db).length
    };
  });

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = join(OUTPUT_DIR, `real-estate-import-batches-audit-${stamp}.md`);
  const lines = [
    "# Real Estate Import Batches Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "| Batch | Preview rows | Found in DB | Draft | Public | Hidden | Missing |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...batchSummaries.map((item) => `| ${fmt(item.batch)} | ${item.total} | ${item.found} | ${item.draft} | ${item.published} | ${item.hidden} | ${item.missing} |`),
    "",
    "## Rows",
    "",
    "| Batch | DB status | DB slug | Name | Area | Rating | Reviews | Type | Website | Imported at | Preview address |",
    "|---|---|---|---|---|---:|---:|---|---|---|---|",
    ...audited.map((row) => {
      const db = row.db;
      const area = db ? db.city || db.area || db.municipality : row.preview_area;
      return `| ${fmt(row.batch)} | ${fmt(db?.status ?? "not found")} | ${fmt(db?.slug)} | ${fmt(db?.display_name || db?.name || row.preview_name)} | ${fmt(area)} | ${fmt(db?.rating ?? row.preview_rating)} | ${fmt(db?.reviews_count ?? row.preview_reviews)} | ${fmt(db?.primary_type ?? row.preview_type)} | ${fmt(db?.website ?? row.preview_website)} | ${fmt(db?.imported_at)} | ${fmt(row.preview_address)} |`;
    })
  ];

  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: path, batches: batchSummaries }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
