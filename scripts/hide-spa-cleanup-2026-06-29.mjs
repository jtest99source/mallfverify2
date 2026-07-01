import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "reports";
const TARGET_SLUGS = [
  "unit24palma",
  "sense-head-spa-palma",
  "estetica-marga-comas",
  "vip-massage"
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
  if (!url || !key) throw new Error("Missing Supabase env vars.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const supabase = createSupabaseClient();

  const { data: before, error: beforeError } = await supabase
    .from("businesses")
    .select("id,slug,name,display_name,status,category,city,area,rating,reviews_count,primary_type,website")
    .in("slug", TARGET_SLUGS)
    .order("slug", { ascending: true });
  if (beforeError) throw beforeError;

  const found = new Set((before ?? []).map((row) => row.slug));
  const missing = TARGET_SLUGS.filter((slug) => !found.has(slug));
  if (missing.length) throw new Error(`Missing slugs: ${missing.join(", ")}`);

  const hideable = (before ?? []).filter((row) => row.category === "spa" && row.status !== "hidden");
  const skipped = (before ?? []).filter((row) => row.category !== "spa" || row.status === "hidden");

  let updated = [];
  if (apply && hideable.length) {
    const { data, error } = await supabase
      .from("businesses")
      .update({ status: "hidden", updated_at: new Date().toISOString().slice(0, 10) })
      .in("id", hideable.map((row) => row.id))
      .select("slug,name,display_name,status,category,city,area,rating,reviews_count,primary_type,website")
      .order("slug", { ascending: true });
    if (error) throw error;
    updated = data ?? [];
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `spa-cleanup-hide-${apply ? "apply" : "dry-run"}-${stamp}.md`);
  const lines = [
    "# Spa Cleanup Hide",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Apply: ${apply ? "yes" : "no"}`,
    "",
    "## Summary",
    "",
    `- Target slugs: ${TARGET_SLUGS.length}`,
    `- Hideable rows: ${hideable.length}`,
    `- Skipped rows: ${skipped.length}`,
    "",
    "## Hideable",
    "",
    "| Slug | Current status | Name | Area | Rating | Reviews | Type | Website |",
    "|---|---|---|---|---:|---:|---|---|",
    ...hideable.map((row) => `| ${fmt(row.slug)} | ${fmt(apply ? "hidden" : row.status)} | ${fmt(row.display_name || row.name)} | ${fmt(row.city || row.area)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} |`),
    "",
    "## Skipped",
    "",
    "| Slug | Status | Category | Name | Reason |",
    "|---|---|---|---|---|",
    ...skipped.map((row) => `| ${fmt(row.slug)} | ${fmt(row.status)} | ${fmt(row.category)} | ${fmt(row.display_name || row.name)} | ${fmt(row.category !== "spa" ? `category=${row.category}` : "already hidden")} |`),
    "",
    "## Updated",
    "",
    "| Slug | Status | Name |",
    "|---|---|---|",
    ...updated.map((row) => `| ${fmt(row.slug)} | ${fmt(row.status)} | ${fmt(row.display_name || row.name)} |`)
  ];

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: reportPath, apply, hideable: hideable.length, skipped: skipped.length, updated: updated.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
