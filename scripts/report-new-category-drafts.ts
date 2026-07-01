import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  slug: string | null;
  name: string | null;
  display_name: string | null;
  category: string | null;
  status: string | null;
  city: string | null;
  area: string | null;
  address: string | null;
  rating: number | null;
  reviews_count: number | null;
  primary_type: string | null;
  website: string | null;
  phone: string | null;
  google_maps_url: string | null;
  google_place_id: string | null;
};

const CATEGORIES = ["healthcare", "real-estate", "nightlife", "car-dealer"];

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
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

function fmt(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function nameOf(row: BusinessRow) {
  return row.display_name || row.name || "-";
}

function renderCategory(category: string, rows: BusinessRow[]) {
  const sorted = rows
    .filter((row) => row.category === category)
    .sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0) || nameOf(a).localeCompare(nameOf(b)));

  return [
    `## ${category}`,
    "",
    `Total drafts: ${sorted.length}`,
    "",
    "| Name | Rating | Reviews | Type | Area/City | Address | Website | Phone | Maps | Slug | Place ID |",
    "|---|---:|---:|---|---|---|---|---|---|---|---|",
    ...sorted.map((row) => [
      fmt(nameOf(row)),
      fmt(row.rating),
      fmt(row.reviews_count),
      fmt(row.primary_type),
      fmt(row.city || row.area),
      fmt(row.address),
      fmt(row.website),
      fmt(row.phone),
      fmt(row.google_maps_url),
      fmt(row.slug),
      fmt(row.google_place_id)
    ].join(" | ")).map((line) => `| ${line} |`),
    ""
  ].join("\n");
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("slug,name,display_name,category,status,city,area,address,rating,reviews_count,primary_type,website,phone,google_maps_url,google_place_id")
    .eq("status", "draft")
    .in("category", CATEGORIES);

  if (error) throw error;

  const rows = (data ?? []) as BusinessRow[];
  const lines = [
    "# New Draft Businesses For Manual Review",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Scope: current `draft` businesses in the newly populated/priority categories. Use this for manual review before publishing or enriching.",
    "",
    "Categories:",
    "",
    ...CATEGORIES.map((category) => `- ${category}`),
    "",
    ...CATEGORIES.map((category) => renderCategory(category, rows))
  ];

  if (!existsSync("reports")) mkdirSync("reports");
  const reportPath = join("reports", `new-category-drafts-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(reportPath, lines.join("\n"), "utf8");
  console.log(JSON.stringify({
    reportPath,
    totalDrafts: rows.length,
    counts: CATEGORIES.reduce<Record<string, number>>((acc, category) => {
      acc[category] = rows.filter((row) => row.category === category).length;
      return acc;
    }, {})
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
