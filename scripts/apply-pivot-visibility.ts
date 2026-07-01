import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  slug: string;
  name: string | null;
  display_name: string | null;
  category: string | null;
  status: string | null;
  rating: number | null;
  reviews_count: number | null;
  area: string | null;
  city: string | null;
  municipality: string | null;
  google_place_id: string | null;
};

type VisibilityResult = {
  action: "hide" | "candidate";
  slug: string;
  name: string;
  category: string;
  status: string;
  rating: string;
  reviews: string;
  result: "planned" | "applied" | "candidate" | "skipped" | "error";
  note: string;
};

const PAGE_SIZE = 1000;
const publicStatuses = new Set(["published", "premium"]);
const movedOutOfPlaces = new Set(["beach", "route", "excursion", "bakery"]);

const thresholds: Record<string, { label: string; minRating: number; minReviews: number }> = {
  restaurant: { label: "restaurants", minRating: 4.0, minReviews: 50 },
  hotel: { label: "hotels", minRating: 4.1, minReviews: 80 },
  "beach-club": { label: "beach-clubs", minRating: 4.0, minReviews: 30 },
  bar: { label: "bars", minRating: 4.0, minReviews: 30 },
  cafe: { label: "cafes", minRating: 4.2, minReviews: 20 },
  nightlife: { label: "nightlife", minRating: 3.8, minReviews: 100 },
  activity: { label: "activities", minRating: 4.3, minReviews: 15 },
  "boat-rental": { label: "boats", minRating: 4.2, minReviews: 10 },
  "rent-a-car": { label: "rent-a-car", minRating: 3.8, minReviews: 50 },
  "car-dealer": { label: "car-dealers", minRating: 3.9, minReviews: 15 },
  gym: { label: "gyms", minRating: 4.0, minReviews: 20 },
  spa: { label: "spas", minRating: 4.2, minReviews: 15 },
  healthcare: { label: "healthcare", minRating: 4.0, minReviews: 8 },
  "real-estate": { label: "real-estate", minRating: 3.9, minReviews: 8 }
};

const practicalCategories = new Set(["nightlife", "rent-a-car", "car-dealer", "gym", "spa", "healthcare", "real-estate"]);

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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function publicName(row: BusinessRow) {
  return row.display_name?.trim() || row.name?.trim() || row.slug;
}

function parseFlag(flag: string) {
  return process.argv.includes(flag);
}

function passesThreshold(row: BusinessRow) {
  const rule = thresholds[row.category ?? ""];
  if (!rule) return false;
  return (row.rating ?? 0) >= rule.minRating && (row.reviews_count ?? 0) >= rule.minReviews;
}

async function fetchRows(supabase: ReturnType<typeof createSupabaseClient>) {
  const rows: BusinessRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,rating,reviews_count,area,city,municipality,google_place_id")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function resultRow(row: BusinessRow, action: VisibilityResult["action"], result: VisibilityResult["result"], note: string): VisibilityResult {
  return {
    action,
    slug: row.slug,
    name: publicName(row),
    category: row.category ?? "unknown",
    status: row.status ?? "unknown",
    rating: typeof row.rating === "number" ? row.rating.toFixed(1) : "-",
    reviews: typeof row.reviews_count === "number" ? String(row.reviews_count) : "-",
    result,
    note
  };
}

function renderReport(results: VisibilityResult[], apply: boolean) {
  const counts = results.reduce<Record<string, number>>((acc, item) => {
    acc[item.result] = (acc[item.result] ?? 0) + 1;
    return acc;
  }, {});
  const lines = [
    "# Pivot Visibility Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${apply ? "APPLY HIDE" : "DRY RUN"}`,
    "",
    "## Summary",
    "",
    `- Hide planned: ${counts.planned ?? 0}`,
    `- Hide applied: ${counts.applied ?? 0}`,
    `- Publication candidates: ${counts.candidate ?? 0}`,
    `- Skipped: ${counts.skipped ?? 0}`,
    `- Errors: ${counts.error ?? 0}`,
    "",
    "## Hide Moved-Out Public Places",
    "",
    "| Category | Slug | Name | Status | Rating | Reviews | Result | Note |",
    "|---|---|---|---|---:|---:|---|---|",
    ...results
      .filter((item) => item.action === "hide")
      .map((item) => `| ${item.category} | \`${item.slug}\` | ${item.name.replace(/\|/g, "/")} | ${item.status} | ${item.rating} | ${item.reviews} | ${item.result} | ${item.note.replace(/\|/g, "/")} |`),
    "",
    "## Practical-Service Publication Candidates",
    "",
    "These are draft rows that pass the new pivot thresholds. Hidden rows are intentionally not auto-promoted.",
    "",
    "| Category | Slug | Name | Status | Rating | Reviews | Note |",
    "|---|---|---|---|---:|---:|---|",
    ...results
      .filter((item) => item.action === "candidate")
      .map((item) => `| ${item.category} | \`${item.slug}\` | ${item.name.replace(/\|/g, "/")} | ${item.status} | ${item.rating} | ${item.reviews} | ${item.note.replace(/\|/g, "/")} |`)
  ];
  return lines.join("\n");
}

async function main() {
  loadLocalEnv();
  const apply = parseFlag("--apply");
  const supabase = createSupabaseClient();
  const rows = await fetchRows(supabase);
  const results: VisibilityResult[] = [];

  const movedOutPublic = rows.filter((row) => movedOutOfPlaces.has(row.category ?? "") && publicStatuses.has(row.status ?? ""));
  for (const row of movedOutPublic) {
    if (!apply) {
      results.push(resultRow(row, "hide", "planned", "Moved to Guides or removed from public Places."));
      continue;
    }
    const { error } = await supabase.from("businesses").update({ status: "hidden" }).eq("id", row.id);
    results.push(resultRow(row, "hide", error ? "error" : "applied", error?.message ?? "Moved to Guides or removed from public Places."));
  }

  const candidates = rows
    .filter((row) => row.status === "draft")
    .filter((row) => practicalCategories.has(row.category ?? ""))
    .filter(passesThreshold)
    .sort((a, b) => {
      const categoryCompare = (a.category ?? "").localeCompare(b.category ?? "");
      if (categoryCompare !== 0) return categoryCompare;
      return (b.reviews_count ?? 0) - (a.reviews_count ?? 0);
    });

  for (const row of candidates) {
    const rule = thresholds[row.category ?? ""];
    results.push(resultRow(row, "candidate", "candidate", `Passes ${rule.label} threshold ${rule.minRating.toFixed(1)} stars / ${rule.minReviews} reviews.`));
  }

  mkdirSync("reports", { recursive: true });
  const reportPath = join("reports", `pivot-visibility-${apply ? "apply" : "dry-run"}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(reportPath, `${renderReport(results, apply)}\n`, "utf8");

  const counts = results.reduce<Record<string, number>>((acc, item) => {
    acc[item.result] = (acc[item.result] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`Mode: ${apply ? "APPLY HIDE" : "DRY RUN"}`);
  console.log(`Hide planned: ${counts.planned ?? 0}`);
  console.log(`Hide applied: ${counts.applied ?? 0}`);
  console.log(`Publication candidates: ${counts.candidate ?? 0}`);
  console.log(`Skipped: ${counts.skipped ?? 0}`);
  console.log(`Errors: ${counts.error ?? 0}`);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
