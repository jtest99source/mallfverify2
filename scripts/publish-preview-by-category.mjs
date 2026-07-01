import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getPlaceCategoryConfig } from "./place-category-config.mjs";

const OUTPUT_DIR = "reports";
const LEGACY_CONFIGS = {
  activities: { output: "data/import-previews/activities-preview.json", businessCategory: "activity" },
  hotels: { output: "data/import-previews/hotels-preview.json", businessCategory: "hotel" },
  restaurants: { output: "data/import-previews/restaurants-preview.json", businessCategory: "restaurant" },
  boats: { output: "data/import-previews/boats-preview.json", businessCategory: "boat-rental" }
};

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

function argValue(name) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function fetchBusinessesByPlaceIds(supabase, ids) {
  const rows = [];
  for (const part of chunk(ids, 75)) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,google_place_id,slug,name,display_name,status,category,city,area,municipality,rating,reviews_count,website,primary_type")
      .in("google_place_id", part);
    if (error) throw error;
    rows.push(...(data ?? []));
  }
  return rows;
}

async function publishByIds(supabase, ids) {
  for (const part of chunk(ids, 75)) {
    const { error } = await supabase
      .from("businesses")
      .update({ status: "published", updated_at: new Date().toISOString().slice(0, 10) })
      .in("id", part);
    if (error) throw error;
  }
}

async function adoptHiddenByIds(supabase, ids, category) {
  for (const part of chunk(ids, 75)) {
    const { error } = await supabase
      .from("businesses")
      .update({ category, status: "published", updated_at: new Date().toISOString().slice(0, 10) })
      .in("id", part)
      .eq("status", "hidden");
    if (error) throw error;
  }
}

async function main() {
  loadLocalEnv();
  const category = argValue("category");
  if (!category) throw new Error("Missing --category. Example: node scripts/publish-preview-by-category.mjs --category=spas");
  const apply = process.argv.includes("--apply");
  const adoptHiddenMismatches = process.argv.includes("--adopt-hidden-mismatches");
  let config;
  try {
    config = getPlaceCategoryConfig(category);
  } catch (error) {
    config = LEGACY_CONFIGS[category];
    if (!config) throw error;
  }
  const previewPath = config.output;
  if (!existsSync(previewPath)) throw new Error(`Missing preview file: ${previewPath}`);

  const previewRows = JSON.parse(readFileSync(previewPath, "utf8"));
  const ids = [...new Set(previewRows.map((row) => row.google_place_id).filter(Boolean))];
  const supabase = createSupabaseClient();

  const data = await fetchBusinessesByPlaceIds(supabase, ids);

  const byPlaceId = new Map((data ?? []).map((row) => [row.google_place_id, row]));
  const rows = previewRows.map((row) => ({ preview: row, db: byPlaceId.get(row.google_place_id) ?? null }));
  const publishable = rows.filter((row) => row.db?.category === config.businessCategory && row.db.status === "draft");
  const adoptableHidden = rows.filter((row) => row.db && row.db.status === "hidden" && row.db.category !== config.businessCategory);
  const skipped = rows.filter((row) => !row.db || row.db.category !== config.businessCategory || row.db.status !== "draft");

  if (apply && publishable.length) {
    await publishByIds(supabase, publishable.map((row) => row.db.id));
  }
  if (apply && adoptHiddenMismatches && adoptableHidden.length) {
    await adoptHiddenByIds(supabase, adoptableHidden.map((row) => row.db.id), config.businessCategory);
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `${category}-preview-publish-${apply ? "apply" : "dry-run"}-${stamp}.md`);
  const lines = [
    `# ${category} Preview Publish`,
    "",
    `Generated: ${new Date().toISOString()}`,
    `Apply: ${apply ? "yes" : "no"}`,
    `Adopt hidden mismatches: ${adoptHiddenMismatches ? "yes" : "no"}`,
    `Preview: ${previewPath}`,
    "",
    "## Summary",
    "",
    `- Preview rows: ${previewRows.length}`,
    `- Publishable draft rows: ${publishable.length}`,
    `- Adoptable hidden mismatches: ${adoptableHidden.length}`,
    `- Skipped rows: ${skipped.length}`,
    "",
    "## Publishable",
    "",
    "| Current status | Slug | Name | Area | Rating | Reviews | Type | Website |",
    "|---|---|---|---|---:|---:|---|---|",
    ...publishable.map(({ db }) => `| ${fmt(apply ? "published" : db.status)} | ${fmt(db.slug)} | ${fmt(db.display_name || db.name)} | ${fmt(db.city || db.area || db.municipality)} | ${fmt(db.rating)} | ${fmt(db.reviews_count)} | ${fmt(db.primary_type)} | ${fmt(db.website)} |`),
    "",
    "## Adoptable hidden mismatches",
    "",
    "| Current category | Current status | Slug | Name | Area | Rating | Reviews | Type | Website |",
    "|---|---|---|---|---|---:|---:|---|---|",
    ...adoptableHidden.map(({ db }) => `| ${fmt(apply && adoptHiddenMismatches ? config.businessCategory : db.category)} | ${fmt(apply && adoptHiddenMismatches ? "published" : db.status)} | ${fmt(db.slug)} | ${fmt(db.display_name || db.name)} | ${fmt(db.city || db.area || db.municipality)} | ${fmt(db.rating)} | ${fmt(db.reviews_count)} | ${fmt(db.primary_type)} | ${fmt(db.website)} |`),
    "",
    "## Skipped",
    "",
    "| Status | Slug | Name | Reason |",
    "|---|---|---|---|",
    ...skipped.map(({ preview, db }) => {
      const reason = !db ? "not found" : db.category !== config.businessCategory ? `category=${db.category}` : `status=${db.status}`;
      return `| ${fmt(db?.status)} | ${fmt(db?.slug)} | ${fmt(db?.display_name || db?.name || preview.name)} | ${fmt(reason)} |`;
    })
  ];

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: reportPath, apply, adopt_hidden_mismatches: adoptHiddenMismatches, preview_rows: previewRows.length, publishable: publishable.length, adoptable_hidden_mismatches: adoptableHidden.length, skipped: skipped.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
