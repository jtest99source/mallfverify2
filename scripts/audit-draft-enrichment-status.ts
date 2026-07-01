import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

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

type Row = {
  slug: string;
  name: string | null;
  display_name: string | null;
  category: string;
  status: string;
  google_place_id: string | null;
  place_reviews: unknown;
  place_photos: unknown;
  image_candidate_urls: unknown;
  place_attributes: unknown;
  business_facts: unknown;
  highlights: unknown;
  detail_enriched_at: string | null;
};

function countArray(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (!value || typeof value !== "object") return Boolean(value);
  return Object.keys(value as Record<string, unknown>).length > 0;
}

function publicName(row: Row) {
  return row.display_name || row.name || row.slug;
}

function parseListArg(name: string, fallback: string[]) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (!match) return fallback;
  const value = match.slice(prefix.length);
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function main() {
  loadLocalEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const categories = parseListArg("categories", ["rent-a-car", "car-dealer", "spa"]);

  const { data, error } = await supabase
    .from("businesses")
    .select("slug,name,display_name,category,status,google_place_id,place_reviews,place_photos,image_candidate_urls,place_attributes,business_facts,highlights,detail_enriched_at")
    .in("category", categories)
    .eq("status", "draft")
    .order("category")
    .order("reviews_count", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as Row[];
  const lines: string[] = [
    "# Draft Enrichment Status",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "| Category | Drafts | With Place ID | detail_enriched_at | Reviews | Photos | Image candidates | Attributes | Facts | Highlights |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|"
  ];

  for (const category of categories) {
    const group = rows.filter((row) => row.category === category);
    lines.push(
      `| ${category} | ${group.length} | ${group.filter((row) => row.google_place_id).length} | ${group.filter((row) => row.detail_enriched_at).length} | ${group.filter((row) => countArray(row.place_reviews) > 0).length} | ${group.filter((row) => countArray(row.place_photos) > 0).length} | ${group.filter((row) => countArray(row.image_candidate_urls) > 0).length} | ${group.filter((row) => hasValue(row.place_attributes)).length} | ${group.filter((row) => countArray(row.business_facts) > 0).length} | ${group.filter((row) => countArray(row.highlights) > 0).length} |`
    );
  }

  lines.push("", "## Drafts Missing Detail Timestamp", "");

  const missingDetail = rows.filter((row) => !row.detail_enriched_at);
  if (!missingDetail.length) {
    lines.push("- None.");
  } else {
    for (const row of missingDetail.slice(0, 200)) {
      lines.push(`- ${publicName(row)} (${row.slug}) - ${row.category} - place_id: ${row.google_place_id ? "yes" : "no"}`);
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync("reports", { recursive: true });
  const reportPath = join("reports", `draft-enrichment-status-${stamp}.md`);
  writeFileSync(reportPath, `${lines.join("\n")}\n`);

  console.log(JSON.stringify({ reportPath, totalDrafts: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
