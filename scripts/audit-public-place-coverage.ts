import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  slug: string | null;
  name: string | null;
  display_name: string | null;
  category: string | null;
  status: string | null;
  city: string | null;
  area: string | null;
  municipality: string | null;
  rating: number | null;
  reviews_count: number | null;
  authority_score: number | null;
  detail_enriched_at: string | null;
  primary_image_url: string | null;
};

const PAGE_SIZE = 1000;
const PUBLIC_STATUSES = new Set(["published", "premium"]);
const PUBLIC_PLACE_CATEGORIES = [
  "restaurant",
  "hotel",
  "beach-club",
  "bar",
  "cafe",
  "nightlife",
  "activity",
  "boat-rental",
  "rent-a-car",
  "car-dealer",
  "spa",
  "healthcare",
  "real-estate"
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "Restaurants",
  hotel: "Hotels",
  "beach-club": "Beach clubs",
  bar: "Bars",
  cafe: "Cafes",
  nightlife: "Nightlife",
  activity: "Activities",
  "boat-rental": "Boats",
  "rent-a-car": "Rent a car",
  "car-dealer": "Car dealers",
  spa: "Spas",
  healthcare: "Healthcare",
  "real-estate": "Real estate"
};

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

async function fetchRows() {
  const supabase = createSupabaseClient();
  const rows: BusinessRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,city,area,municipality,rating,reviews_count,authority_score,detail_enriched_at,primary_image_url")
      .in("status", [...PUBLIC_STATUSES])
      .in("category", [...PUBLIC_PLACE_CATEGORIES])
      .order("category", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

function cleanCell(value: unknown) {
  return String(value ?? "-").replace(/\|/g, "/").replace(/\r?\n/g, " ").trim() || "-";
}

function locationFor(row: BusinessRow) {
  return row.city || row.area || row.municipality || "Mallorca";
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function average(values: number[]) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function formatNumber(value: number | null, digits = 0) {
  if (value === null || Number.isNaN(value)) return "-";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  });
}

function countBy<T extends string>(rows: BusinessRow[], keyFor: (row: BusinessRow) => T) {
  const counts = new Map<T, BusinessRow[]>();
  for (const row of rows) {
    const key = keyFor(row);
    counts.set(key, [...(counts.get(key) ?? []), row]);
  }
  return counts;
}

function render(rows: BusinessRow[]) {
  const byCategory = countBy(rows, (row) => row.category ?? "unknown");
  const byLocation = countBy(rows, locationFor);
  const locationSummaries = [...byLocation.entries()]
    .map(([location, locationRows]) => ({
      location,
      total: locationRows.length,
      categories: new Set(locationRows.map((row) => row.category ?? "unknown")).size,
      avgRating: average(locationRows.map((row) => row.rating).filter((value): value is number => typeof value === "number")),
      reviews: locationRows.reduce((sum, row) => sum + (row.reviews_count ?? 0), 0)
    }))
    .sort((a, b) => b.total - a.total || b.categories - a.categories || b.reviews - a.reviews);

  const searchReadyLocations = locationSummaries.filter((item) => item.total >= 10 && item.categories >= 3);
  const thinLocations = locationSummaries.filter((item) => item.total < 5);

  const lines = [
    "# Public Places Coverage Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Executive Summary",
    "",
    `- Public place rows in active categories: ${rows.length}`,
    `- Active categories counted: ${PUBLIC_PLACE_CATEGORIES.length}`,
    `- Unique visible locations: ${locationSummaries.length}`,
    `- Search-ready locations (10+ places and 3+ categories): ${searchReadyLocations.length}`,
    `- Thin locations (<5 places): ${thinLocations.length}`,
    `- Detail enriched: ${rows.filter((row) => row.detail_enriched_at).length} (${pct(rows.filter((row) => row.detail_enriched_at).length, rows.length)})`,
    `- With primary image: ${rows.filter((row) => row.primary_image_url).length} (${pct(rows.filter((row) => row.primary_image_url).length, rows.length)})`,
    "",
    "## Category Readiness",
    "",
    "| Category | Public | Areas | Areas 10+ | Areas 20+ | Avg rating | Median reviews | Enriched | With image |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|",
    ...PUBLIC_PLACE_CATEGORIES.map((category) => {
      const categoryRows = byCategory.get(category) ?? [];
      const categoryLocations = countBy(categoryRows, locationFor);
      const counts = [...categoryLocations.values()].map((items) => items.length);
      const ratings = categoryRows.map((row) => row.rating).filter((value): value is number => typeof value === "number");
      const reviews = categoryRows.map((row) => row.reviews_count).filter((value): value is number => typeof value === "number");
      return [
        CATEGORY_LABELS[category] ?? category,
        categoryRows.length,
        categoryLocations.size,
        counts.filter((count) => count >= 10).length,
        counts.filter((count) => count >= 20).length,
        formatNumber(average(ratings), 1),
        formatNumber(median(reviews)),
        `${categoryRows.filter((row) => row.detail_enriched_at).length} (${pct(categoryRows.filter((row) => row.detail_enriched_at).length, categoryRows.length)})`,
        `${categoryRows.filter((row) => row.primary_image_url).length} (${pct(categoryRows.filter((row) => row.primary_image_url).length, categoryRows.length)})`
      ].map(cleanCell).join(" | ");
    }).map((row) => `| ${row} |`),
    "",
    "## Best Locations For A Search-First Homepage",
    "",
    "These are the safest location options to expose in the homepage search UI.",
    "",
    "| Location | Public places | Categories covered | Avg rating | Total reviews |",
    "|---|---:|---:|---:|---:|",
    ...searchReadyLocations.slice(0, 40).map((item) => `| ${cleanCell(item.location)} | ${item.total} | ${item.categories} | ${formatNumber(item.avgRating, 1)} | ${formatNumber(item.reviews)} |`),
    "",
    "## Top Locations By Category",
    "",
    ...PUBLIC_PLACE_CATEGORIES.flatMap((category) => {
      const categoryRows = byCategory.get(category) ?? [];
      const categoryLocations = [...countBy(categoryRows, locationFor).entries()]
        .map(([location, locationRows]) => ({
          location,
          count: locationRows.length,
          avgRating: average(locationRows.map((row) => row.rating).filter((value): value is number => typeof value === "number")),
          reviews: locationRows.reduce((sum, row) => sum + (row.reviews_count ?? 0), 0)
        }))
        .sort((a, b) => b.count - a.count || b.reviews - a.reviews)
        .slice(0, 12);
      return [
        `### ${CATEGORY_LABELS[category] ?? category}`,
        "",
        "| Location | Count | Avg rating | Total reviews |",
        "|---|---:|---:|---:|",
        ...categoryLocations.map((item) => `| ${cleanCell(item.location)} | ${item.count} | ${formatNumber(item.avgRating, 1)} | ${formatNumber(item.reviews)} |`),
        ""
      ];
    }),
    "## Homepage/Search Recommendations",
    "",
    "- Use location suggestions only from the search-ready list by default.",
    "- If a selected location has fewer than 3 results in a category, fall back to all-Mallorca results and show a small note.",
    "- For SEO pages, only expose area/category pages when there are at least 3 businesses; prefer 5+ for homepage chips.",
    "- Prioritize content and import work where a category has fewer than 10 strong locations or weak coverage outside Palma.",
    ""
  ];

  return lines.join("\n");
}

async function main() {
  loadLocalEnv();
  const rows = await fetchRows();
  const report = render(rows);
  if (!existsSync("reports")) mkdirSync("reports");
  const reportPath = join("reports", `public-place-coverage-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(reportPath, report, "utf8");
  console.log(JSON.stringify({ reportPath, publicPlaces: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
