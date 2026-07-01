import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  name: string | null;
  display_name: string | null;
  category: string | null;
  status: string | null;
  google_place_id: string | null;
  rating: number | null;
  reviews_count: number | null;
  primary_image_url: string | null;
  place_photos: unknown;
  place_reviews: unknown;
  place_attributes: unknown;
  category_attributes: unknown;
  review_themes: unknown;
  review_pros: unknown;
  services: unknown;
  featured_reviews: unknown;
  editorial_generated_at: string | null;
};

type PreviewRow = {
  google_place_id?: string | null;
  name?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
};

const PAGE_SIZE = 1000;

const categories: Record<string, { label: string; preview?: string; minRating: number; minReviews: number; priority: "core" | "low" }> = {
  restaurant: { label: "restaurants", preview: "restaurants", minRating: 4.0, minReviews: 50, priority: "core" },
  hotel: { label: "hotels", preview: "hotels", minRating: 4.1, minReviews: 80, priority: "low" },
  "beach-club": { label: "beach-clubs", preview: "beach-clubs", minRating: 4.0, minReviews: 30, priority: "core" },
  bar: { label: "bars", preview: "bars", minRating: 4.0, minReviews: 30, priority: "core" },
  cafe: { label: "cafes", preview: "cafes", minRating: 4.2, minReviews: 20, priority: "core" },
  nightlife: { label: "nightlife", preview: "nightlife", minRating: 3.8, minReviews: 100, priority: "core" },
  activity: { label: "activities", preview: "activities", minRating: 4.3, minReviews: 15, priority: "core" },
  "boat-rental": { label: "boats", preview: "boats", minRating: 4.2, minReviews: 10, priority: "core" },
  "rent-a-car": { label: "rent-a-car", preview: "rent-a-car", minRating: 3.8, minReviews: 50, priority: "core" },
  "car-dealer": { label: "car-dealers", preview: "car-dealers", minRating: 3.9, minReviews: 15, priority: "core" },
  gym: { label: "gyms", preview: "gyms", minRating: 4.0, minReviews: 20, priority: "core" },
  casino: { label: "casinos", preview: "casinos", minRating: 3.8, minReviews: 20, priority: "core" },
  veterinarian: { label: "vets", preview: "vets", minRating: 4.2, minReviews: 20, priority: "core" },
  spa: { label: "spas", preview: "spas", minRating: 4.2, minReviews: 15, priority: "core" },
  healthcare: { label: "healthcare", preview: "healthcare", minRating: 4.0, minReviews: 8, priority: "core" },
  "real-estate": { label: "real-estate", preview: "real-estate", minRating: 3.9, minReviews: 8, priority: "core" },
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

function isPublic(row: BusinessRow) {
  return row.status === "published" || row.status === "premium";
}

function hasItems(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return Boolean(value);
}

function meets(row: BusinessRow | PreviewRow, rule: { minRating: number; minReviews: number }) {
  return (row.rating ?? 0) >= rule.minRating && (row.reviews_count ?? 0) >= rule.minReviews;
}

function nameOf(row: BusinessRow) {
  return row.display_name?.trim() || row.name?.trim() || row.id;
}

async function fetchRows() {
  const supabase = createSupabaseClient();
  const rows: BusinessRow[] = [];
  const select = [
    "id",
    "name",
    "display_name",
    "category",
    "status",
    "google_place_id",
    "rating",
    "reviews_count",
    "primary_image_url",
    "place_photos",
    "place_reviews",
    "place_attributes",
    "category_attributes",
    "review_themes",
    "review_pros",
    "services",
    "featured_reviews",
    "editorial_generated_at",
  ].join(",");

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select(select)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as unknown as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function readPreview(slug: string): PreviewRow[] {
  const file = join("data", "import-previews", `${slug}-preview.json`);
  if (!existsSync(file)) return [];
  return JSON.parse(readFileSync(file, "utf8")) as PreviewRow[];
}

function render(rows: BusinessRow[]) {
  const existingPlaceIds = new Set(rows.map((row) => row.google_place_id).filter(Boolean));
  const lines = [
    "# Places Pipeline Status",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Current Public Inventory",
    "",
    "| Category | Public | Draft | Hidden | Meets Threshold | Missing Details | Missing AI Signals | Missing Image | Preview Remaining | New Preview IDs |",
    "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
  ];

  for (const [category, rule] of Object.entries(categories)) {
    const categoryRows = rows.filter((row) => row.category === category);
    const publicRows = categoryRows.filter(isPublic);
    const previewRows = rule.preview ? readPreview(rule.preview) : [];
    const previewMeeting = previewRows.filter((row) => meets(row, rule));
    const newPreviewIds = previewMeeting.filter((row) => row.google_place_id && !existingPlaceIds.has(row.google_place_id)).length;
    const missingDetails = publicRows.filter((row) => !hasItems(row.place_reviews) || !hasItems(row.place_photos)).length;
    const missingSignals = publicRows.filter((row) => !hasItems(row.review_themes) || !hasItems(row.review_pros) || !hasItems(row.services)).length;
    const missingImage = publicRows.filter((row) => !row.primary_image_url).length;

    lines.push(
      `| ${rule.label} | ${publicRows.length} | ${categoryRows.filter((row) => row.status === "draft").length} | ${categoryRows.filter((row) => row.status === "hidden").length} | ${publicRows.filter((row) => meets(row, rule)).length} | ${missingDetails} | ${missingSignals} | ${missingImage} | ${previewMeeting.length} | ${newPreviewIds} |`,
    );
  }

  lines.push("", "## Enrichment Coverage", "");
  lines.push("| Category | Public | Place Reviews | Place Photos | Place Attributes | AI Signals | Featured Reviews | Primary Image |");
  lines.push("|---|---:|---:|---:|---:|---:|---:|---:|");
  for (const [category, rule] of Object.entries(categories)) {
    const publicRows = rows.filter((row) => row.category === category && isPublic(row));
    lines.push(
      `| ${rule.label} | ${publicRows.length} | ${publicRows.filter((row) => hasItems(row.place_reviews)).length} | ${publicRows.filter((row) => hasItems(row.place_photos)).length} | ${publicRows.filter((row) => hasItems(row.place_attributes)).length} | ${publicRows.filter((row) => hasItems(row.review_themes) && hasItems(row.review_pros) && hasItems(row.services)).length} | ${publicRows.filter((row) => hasItems(row.featured_reviews)).length} | ${publicRows.filter((row) => Boolean(row.primary_image_url)).length} |`,
    );
  }

  lines.push("", "## Public Rows Needing Cleanup By Threshold", "");
  for (const [category, rule] of Object.entries(categories)) {
    const below = rows
      .filter((row) => row.category === category && isPublic(row))
      .filter((row) => !meets(row, rule))
      .sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0))
      .slice(0, 15);
    if (!below.length) continue;
    lines.push(`### ${rule.label}`, "", "| Name | Rating | Reviews |", "|---|---:|---:|");
    for (const row of below) lines.push(`| ${nameOf(row).replace(/\|/g, " ")} | ${row.rating ?? "-"} | ${row.reviews_count ?? "-"} |`);
    lines.push("");
  }

  lines.push("", "## Practical Import Queue", "");
  lines.push("- Import-ready means: still present in the cleaned preview, meets the current category threshold, and its Google Place ID is not already in Supabase.");
  lines.push("- This is not the same as editorial approval; manual review still wins for borderline verticals.", "");
  lines.push("| Category | Clean Preview | Meets Threshold | New Place IDs | Already In DB |", "|---|---:|---:|---:|---:|");
  for (const [category, rule] of Object.entries(categories)) {
    if (!rule.preview) continue;
    const previewRows = readPreview(rule.preview);
    const previewMeeting = previewRows.filter((row) => meets(row, rule));
    const newRows = previewMeeting.filter((row) => row.google_place_id && !existingPlaceIds.has(row.google_place_id));
    if (!["rent-a-car", "car-dealer", "spa", "healthcare", "real-estate", "nightlife"].includes(category)) continue;
    lines.push(`| ${rule.label} | ${previewRows.length} | ${previewMeeting.length} | ${newRows.length} | ${previewMeeting.length - newRows.length} |`);
  }

  return lines.join("\n");
}

async function main() {
  loadLocalEnv();
  const rows = await fetchRows();
  const text = render(rows);
  if (!existsSync("reports")) mkdirSync("reports");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `places-pipeline-status-${stamp}.md`);
  writeFileSync(reportPath, `${text}\n`, "utf8");
  console.log(JSON.stringify({ reportPath, total: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
