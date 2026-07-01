import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;
const OUTPUT_DIR = "reports";
const DEFAULT_CATEGORIES = ["restaurant", "bar", "hotel"];

const CATEGORY_RULES = {
  restaurant: { minRating: 4.0, minReviews: 50 },
  bar: { minRating: 4.0, minReviews: 30 },
  hotel: { minRating: 4.1, minReviews: 80 }
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

function parseCategories() {
  return (argValue("categories") ?? DEFAULT_CATEGORIES.join(","))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function rawTypes(row) {
  const raw = row.raw_google_place;
  const types = raw && Array.isArray(raw.types) ? raw.types.filter((item) => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...types].filter(Boolean))];
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function categoryFit(row) {
  const types = rawTypes(row);
  const text = normalize(`${publicName(row)} ${row.website ?? ""} ${types.join(" ")}`);
  if (row.category === "restaurant") {
    if (types.some((type) => type.includes("restaurant")) || /restaurant|restaurante|pizzeria|burger|tapas|grill|steak|cocina/.test(text)) return "good";
    if (/bar|cafe|bakery|hotel|lodging|store|market/.test(text)) return "review";
    return "weak";
  }
  if (row.category === "bar") {
    if (types.some((type) => type.includes("bar") || type === "pub") || /bar|pub|cocktail|wine|sports bar|chiringuito/.test(text)) return "good";
    if (/restaurant|cafe|hotel|store|market/.test(text)) return "review";
    return "weak";
  }
  if (row.category === "hotel") {
    if (types.some((type) => type.includes("hotel") || type === "lodging") || /hotel|hostal|resort|apartament|finca/.test(text)) return "good";
    if (/restaurant|bar|cafe|real estate|store/.test(text)) return "review";
    return "weak";
  }
  return "review";
}

function decisionTier(row) {
  const rule = CATEGORY_RULES[row.category] ?? { minRating: 0, minReviews: 0 };
  const rating = row.rating ?? 0;
  const reviews = row.reviews_count ?? 0;
  const fit = categoryFit(row);
  if (fit === "good" && rating >= rule.minRating && reviews >= rule.minReviews) return "publish_candidates";
  if (fit === "good" && rating >= rule.minRating && reviews >= Math.floor(rule.minReviews * 0.5)) return "borderline_thin";
  if (fit !== "good") return "category_review";
  return "likely_skip_threshold";
}

function tierLabel(key) {
  return {
    publish_candidates: "Publish candidates",
    borderline_thin: "Borderline thin",
    category_review: "Category review",
    likely_skip_threshold: "Likely skip by threshold"
  }[key] ?? key;
}

async function fetchDrafts(supabase, categories) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,status,category,city,area,municipality,address,rating,reviews_count,website,phone,google_place_id,primary_type,raw_google_place,authority_score,detail_enriched_at,primary_image_url,place_reviews,place_photos")
      .in("category", categories)
      .eq("status", "draft")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

function rowLine(row) {
  return `| ${fmt(publicName(row))} | ${fmt(row.category)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(categoryFit(row))} | ${fmt(row.website)} | ${fmt(row.slug)} |`;
}

async function main() {
  loadLocalEnv();
  const categories = parseCategories();
  const supabase = createSupabaseClient();
  const rows = await fetchDrafts(supabase, categories);
  const grouped = new Map();

  for (const row of rows) {
    const key = `${row.category}:${decisionTier(row)}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `drafts-category-review-${categories.join("-")}-${stamp}.md`);
  const lines = [
    "# Drafts Category Review",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Goal: decide which existing drafts should be published, kept as draft/hidden, or moved before importing new rows.",
    "",
    "## Summary",
    "",
    `- Categories: ${categories.join(", ")}`,
    `- Draft rows reviewed: ${rows.length}`,
    "",
    "| Category | Drafts | Publish candidates | Borderline thin | Category review | Likely skip threshold |",
    "|---|---:|---:|---:|---:|---:|",
    ...categories.map((category) => {
      const categoryRows = rows.filter((row) => row.category === category);
      return `| ${fmt(category)} | ${categoryRows.length} | ${categoryRows.filter((row) => decisionTier(row) === "publish_candidates").length} | ${categoryRows.filter((row) => decisionTier(row) === "borderline_thin").length} | ${categoryRows.filter((row) => decisionTier(row) === "category_review").length} | ${categoryRows.filter((row) => decisionTier(row) === "likely_skip_threshold").length} |`;
    })
  ];

  for (const category of categories) {
    lines.push("", `# ${category}`, "");
    for (const tier of ["publish_candidates", "borderline_thin", "category_review", "likely_skip_threshold"]) {
      const tierRows = (grouped.get(`${category}:${tier}`) ?? [])
        .slice()
        .sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0));
      lines.push(
        "",
        `## ${tierLabel(tier)} (${tierRows.length})`,
        "",
        "| Name | Category | Area | Rating | Reviews | Type | Fit | Website | Slug |",
        "|---|---|---|---:|---:|---|---|---|---|",
        ...tierRows.map(rowLine)
      );
    }
  }

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: reportPath, categories, drafts: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
