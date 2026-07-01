import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  name: string | null;
  display_name: string | null;
  category: string | null;
  status: string | null;
  rating: number | null;
  reviews_count: number | null;
};

const PAGE_SIZE = 1000;

const thresholds: Record<string, { label: string; minRating: number; minReviews: number; priority: "core" | "low" }> = {
  restaurant: { label: "restaurants", minRating: 4.0, minReviews: 50, priority: "core" },
  hotel: { label: "hotels", minRating: 4.1, minReviews: 80, priority: "low" },
  "beach-club": { label: "beach-clubs", minRating: 4.0, minReviews: 30, priority: "core" },
  bar: { label: "bars", minRating: 4.0, minReviews: 30, priority: "core" },
  cafe: { label: "cafes", minRating: 4.2, minReviews: 20, priority: "core" },
  nightlife: { label: "nightlife", minRating: 3.8, minReviews: 100, priority: "core" },
  activity: { label: "activities", minRating: 4.3, minReviews: 15, priority: "core" },
  "boat-rental": { label: "boats", minRating: 4.2, minReviews: 10, priority: "core" },
  "rent-a-car": { label: "rent-a-car", minRating: 3.8, minReviews: 50, priority: "core" },
  "car-dealer": { label: "car-dealers", minRating: 3.9, minReviews: 15, priority: "core" },
  gym: { label: "gyms", minRating: 4.0, minReviews: 20, priority: "core" },
  casino: { label: "casinos", minRating: 3.8, minReviews: 20, priority: "core" },
  veterinarian: { label: "vets", minRating: 4.2, minReviews: 20, priority: "core" },
  spa: { label: "spas", minRating: 4.2, minReviews: 15, priority: "core" },
  healthcare: { label: "healthcare", minRating: 4.0, minReviews: 8, priority: "core" },
  "real-estate": { label: "real-estate", minRating: 3.9, minReviews: 8, priority: "core" }
};

const movedOutOfPlaces = new Set(["beach", "route", "excursion", "bakery"]);

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

function publicStatus(row: BusinessRow) {
  return row.status === "published" || row.status === "premium";
}

function publicName(row: BusinessRow) {
  return row.display_name?.trim() || row.name?.trim() || row.id;
}

async function fetchRows() {
  const supabase = createSupabaseClient();
  const rows: BusinessRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,name,display_name,category,status,rating,reviews_count")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function render(rows: BusinessRow[]) {
  const categories = [...new Set(rows.map((row) => row.category ?? "unknown"))].sort();
  const publicRows = rows.filter(publicStatus);
  const lines = [
    "# Mallorca Verified Pivot Readiness",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total businesses: ${rows.length}`,
    `- Public businesses: ${publicRows.length}`,
    `- Public businesses moved out of Places: ${publicRows.filter((row) => movedOutOfPlaces.has(row.category ?? "")).length}`,
    `- Public businesses in pivot categories: ${publicRows.filter((row) => Boolean(thresholds[row.category ?? ""])).length}`,
    "",
    "## Pivot Categories",
    "",
    "| Category | Public now | Draft | Hidden | Meets new threshold | Below threshold but public | Min rating | Min reviews |",
    "|---|---:|---:|---:|---:|---:|---:|---:|"
  ];

  for (const [category, rule] of Object.entries(thresholds)) {
    const categoryRows = rows.filter((row) => row.category === category);
    const publicCategoryRows = categoryRows.filter(publicStatus);
    const meets = publicCategoryRows.filter((row) => (row.rating ?? 0) >= rule.minRating && (row.reviews_count ?? 0) >= rule.minReviews);
    lines.push(`| ${rule.label} | ${publicCategoryRows.length} | ${categoryRows.filter((row) => row.status === "draft").length} | ${categoryRows.filter((row) => row.status === "hidden").length} | ${meets.length} | ${publicCategoryRows.length - meets.length} | ${rule.minRating.toFixed(1)} | ${rule.minReviews} |`);
  }

  lines.push("", "## Moved Out Of Places", "", "| Category | Public | Draft | Hidden |", "|---|---:|---:|---:|");
  for (const category of [...movedOutOfPlaces].sort()) {
    const categoryRows = rows.filter((row) => row.category === category);
    lines.push(`| ${category} | ${categoryRows.filter(publicStatus).length} | ${categoryRows.filter((row) => row.status === "draft").length} | ${categoryRows.filter((row) => row.status === "hidden").length} |`);
  }

  lines.push("", "## Other Categories In Database", "", "| Category | Public | Draft | Hidden |", "|---|---:|---:|---:|");
  for (const category of categories.filter((category) => !thresholds[category] && !movedOutOfPlaces.has(category))) {
    const categoryRows = rows.filter((row) => (row.category ?? "unknown") === category);
    lines.push(`| ${category} | ${categoryRows.filter(publicStatus).length} | ${categoryRows.filter((row) => row.status === "draft").length} | ${categoryRows.filter((row) => row.status === "hidden").length} |`);
  }

  lines.push("", "## Public Rows Below New Thresholds", "");
  for (const [category, rule] of Object.entries(thresholds)) {
    const below = rows
      .filter((row) => row.category === category && publicStatus(row))
      .filter((row) => (row.rating ?? 0) < rule.minRating || (row.reviews_count ?? 0) < rule.minReviews)
      .sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0))
      .slice(0, 20);
    if (!below.length) continue;
    lines.push(`### ${rule.label}`, "", "| Name | Rating | Reviews |", "|---|---:|---:|");
    for (const row of below) lines.push(`| ${publicName(row).replace(/\|/g, " ")} | ${row.rating ?? "-"} | ${row.reviews_count ?? "-"} |`);
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  loadLocalEnv();
  const rows = await fetchRows();
  const text = render(rows);
  if (!existsSync("reports")) mkdirSync("reports");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `pivot-readiness-${stamp}.md`);
  writeFileSync(reportPath, `${text}\n`, "utf8");
  console.log(JSON.stringify({ reportPath, total: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
