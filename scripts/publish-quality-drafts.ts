import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  category: string;
  status: string;
  area: string | null;
  city: string | null;
  municipality: string | null;
  google_place_id: string | null;
  rating: number | null;
  reviews_count: number | null;
  primary_type: string | null;
  place_reviews: Array<Record<string, unknown>> | null;
  place_photos: Array<{ name?: string; credit?: string | null }> | null;
  photo_names: string[] | null;
  primary_photo_name: string | null;
  primary_image_url: string | null;
  primary_image_source: string | null;
  primary_image_credit: string | null;
  place_attributes: Record<string, unknown> | null;
  detail_enriched_at: string | null;
  raw_google_place: Record<string, unknown> | null;
  authority_score: number | null;
};

type Options = {
  apply: boolean;
  limit: number | null;
  maxPerCategory: number | null;
  categories: string[];
};

type QualityRule = {
  minRating: number;
  minReviews: number;
};

const QUALITY_RULES: Record<string, QualityRule> = {
  restaurant: { minRating: 4.2, minReviews: 50 },
  hotel: { minRating: 4.1, minReviews: 50 },
  "beach-club": { minRating: 4.1, minReviews: 30 },
  bar: { minRating: 4.1, minReviews: 30 },
  cafe: { minRating: 4.2, minReviews: 25 },
  bakery: { minRating: 4.2, minReviews: 15 },
  spa: { minRating: 4.2, minReviews: 15 },
  gym: { minRating: 4.0, minReviews: 20 },
  "rent-a-car": { minRating: 4.1, minReviews: 40 },
  activity: { minRating: 4.2, minReviews: 20 },
  excursion: { minRating: 4.2, minReviews: 20 },
  "boat-rental": { minRating: 4.3, minReviews: 15 },
  route: { minRating: 4.3, minReviews: 10 },
  beach: { minRating: 4.2, minReviews: 15 }
};

const DEFAULT_CATEGORIES = Object.keys(QUALITY_RULES);
const PAGE_SIZE = 100;
const PUBLIC_STATUSES = ["published", "premium"];

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

function argValue(name: string) {
  const prefix = `--${name}=`;
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length).trim() : null;
}

function parseNumber(value: string | null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}

function parseArgs(): Options {
  const categories = (argValue("categories") ?? DEFAULT_CATEGORIES.join(","))
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    apply: process.argv.includes("--apply"),
    limit: parseNumber(argValue("limit")),
    maxPerCategory: parseNumber(argValue("max-per-category")),
    categories
  };
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function arrayLength(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function rawTypes(row: BusinessRow) {
  const raw = row.raw_google_place;
  const rawTypesValue = raw && Array.isArray(raw.types) ? raw.types.filter((item): item is string => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...rawTypesValue].filter(Boolean))];
}

function hasType(row: BusinessRow, ...expected: string[]) {
  const types = rawTypes(row);
  return types.some((type) => expected.some((item) => type === item || type.includes(item)));
}

function primaryType(row: BusinessRow) {
  return row.primary_type ?? (typeof row.raw_google_place?.primaryType === "string" ? row.raw_google_place.primaryType : "");
}

function nameIncludes(row: BusinessRow, ...keywords: string[]) {
  const value = normalize(`${row.display_name ?? ""} ${row.name}`);
  return keywords.some((keyword) => value.includes(normalize(keyword)));
}

function hasCompatibleCategoryTypes(row: BusinessRow) {
  const primary = primaryType(row);

  if (
    [
      "car_dealer",
      "used_car_dealer",
      "market",
      "grocery_store",
      "supermarket",
      "discount_supermarket",
      "liquor_store",
      "wine_store",
      "museum",
      "art_gallery",
      "cultural_center",
      "shopping_mall",
      "department_store",
      "hardware_store",
      "home_goods_store",
      "clothing_store",
      "sporting_goods_store"
    ].includes(primary)
  ) {
    return false;
  }

  if (row.category === "restaurant") return hasType(row, "restaurant") || nameIncludes(row, "restaurante", "restaurant", "pizzeria", "burger", "hamburgues");
  if (row.category === "hotel") return hasType(row, "hotel", "lodging", "resort_hotel") || nameIncludes(row, "hotel", "hostal", "resort", "apartament");
  if (row.category === "bar") return hasType(row, "bar", "pub", "wine_bar", "cocktail_bar") || nameIncludes(row, "bar", "pub", "cocteleria");
  if (row.category === "cafe") return hasType(row, "cafe", "coffee_shop", "ice_cream_shop") || nameIncludes(row, "cafe", "cafeteria", "coffee", "gelato", "heladeria");
  if (row.category === "bakery") return hasType(row, "bakery", "pastry_shop") || nameIncludes(row, "forn", "pasteleria", "pastisseria", "bakery", "panaderia");
  if (row.category === "spa") return hasType(row, "spa", "massage", "wellness_center", "beauty_salon") || nameIncludes(row, "spa", "wellness", "massage");
  if (row.category === "gym") return hasType(row, "gym", "fitness_center", "yoga_studio", "pilates_studio", "sports_complex", "sports_activity_location") || nameIncludes(row, "gym", "fitness", "crossfit", "pilates", "yoga", "padel");
  if (row.category === "rent-a-car") return hasType(row, "car_rental") || nameIncludes(row, "rent", "rental", "rent a car", "rentacar", "car rental", "alquiler");
  if (row.category === "boat-rental") return hasType(row, "boat_rental", "tour_agency", "travel_agency") || nameIncludes(row, "boat", "barco", "yacht", "charter", "llaut", "sail");
  if (row.category === "beach-club") return nameIncludes(row, "beach club", "chiringuito", "balneario") || (hasType(row, "restaurant", "bar") && nameIncludes(row, "beach", "playa", "cala", "mar"));
  if (row.category === "beach") return hasType(row, "beach", "public_bath") || nameIncludes(row, "cala", "playa", "platja", "calo", "beach");
  if (row.category === "route") return hasType(row, "hiking_area", "scenic_spot", "historical_landmark", "historical_place", "nature_preserve", "park") || nameIncludes(row, "faro", "mirador", "sendero", "ruta", "camino", "puig", "trail");
  if (row.category === "excursion") return hasType(row, "tour_agency", "travel_agency", "tourist_attraction") || nameIncludes(row, "excursion", "tour", "visita guiada");
  if (row.category === "activity") return hasType(row, "tour_operator", "travel_agency", "amusement_park", "sports_activity_location", "sports_club", "adventure_sports_center") || nameIncludes(row, "buggy", "quad", "surf", "dive", "kayak", "paddle", "sup ", "beachvolley", "ocean trails", "adventure", "activity");

  return true;
}

function locationIsUsable(row: BusinessRow) {
  if (hasText(row.city) || hasText(row.municipality)) return true;
  if (!hasText(row.area)) return false;
  return row.area !== "Mallorca";
}

function photoName(row: BusinessRow) {
  return row.place_photos?.find((photo) => photo.name)?.name ?? row.primary_photo_name ?? row.photo_names?.[0] ?? null;
}

function photoCredit(row: BusinessRow) {
  return row.place_photos?.find((photo) => photo.name === photoName(row))?.credit ?? "Google Places";
}

function qualify(row: BusinessRow) {
  const rule = QUALITY_RULES[row.category];
  const reasons: string[] = [];
  if (!rule) reasons.push("no_quality_rule");
  if (row.status !== "draft") reasons.push("not_draft");
  if (!row.google_place_id) reasons.push("missing_google_place_id");
  if (!row.detail_enriched_at) reasons.push("missing_detail_enrichment");
  if (typeof row.rating !== "number" || row.rating < (rule?.minRating ?? 999)) reasons.push("rating_below_cut");
  if (typeof row.reviews_count !== "number" || row.reviews_count < (rule?.minReviews ?? 999999)) reasons.push("reviews_below_cut");
  if (arrayLength(row.place_reviews) < 3) reasons.push("too_few_place_reviews");
  if (Math.max(arrayLength(row.place_photos), arrayLength(row.photo_names), hasText(row.primary_photo_name) ? 1 : 0) < 3) reasons.push("too_few_photos");
  if (!photoName(row) && !hasText(row.primary_image_url)) reasons.push("no_primary_image_source");
  if (!locationIsUsable(row)) reasons.push("weak_location");
  if (!hasCompatibleCategoryTypes(row)) reasons.push("category_type_mismatch");
  return reasons;
}

async function fetchPublicKeys(supabase: ReturnType<typeof createSupabaseClient>) {
  const slugs = new Set<string>();
  const googlePlaceIds = new Set<string>();

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("slug,google_place_id")
      .in("status", PUBLIC_STATUSES)
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    const page = (data ?? []) as Array<{ slug: string | null; google_place_id: string | null }>;
    for (const row of page) {
      if (row.slug) slugs.add(row.slug);
      if (row.google_place_id) googlePlaceIds.add(row.google_place_id);
    }
    if (page.length < PAGE_SIZE) break;
  }

  return { slugs, googlePlaceIds };
}

async function fetchPhotoUri(apiKey: string, name: string) {
  const url = new URL(`https://places.googleapis.com/v1/${name}/media`);
  url.searchParams.set("maxWidthPx", "1600");
  url.searchParams.set("skipHttpRedirect", "true");

  const response = await fetch(url, { headers: { "X-Goog-Api-Key": apiKey } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google photo media ${response.status}: ${body}`);
  }

  const media = await response.json();
  return typeof media.photoUri === "string" ? media.photoUri : null;
}

async function fetchDrafts(supabase: ReturnType<typeof createSupabaseClient>, options: Options) {
  const rows: BusinessRow[] = [];
  const target = options.limit ?? Infinity;

  for (let from = 0; rows.length < target; from += PAGE_SIZE) {
    const to = Math.min(from + PAGE_SIZE - 1, from + (target - rows.length) - 1);
    let query = supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,area,city,municipality,google_place_id,rating,reviews_count,primary_type,place_reviews,place_photos,photo_names,primary_photo_name,primary_image_url,primary_image_source,primary_image_credit,place_attributes,detail_enriched_at,raw_google_place,authority_score")
      .eq("status", "draft")
      .in("category", options.categories)
      .order("id", { ascending: true })
      .range(from, to);

    const { data, error } = await query;
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

function applyCategoryCaps(rows: BusinessRow[], maxPerCategory: number | null) {
  const counts = new Map<string, number>();
  return rows.filter((row) => {
    if (!maxPerCategory) return true;
    const count = counts.get(row.category) ?? 0;
    if (count >= maxPerCategory) return false;
    counts.set(row.category, count + 1);
    return true;
  });
}

function dedupePublishCandidates(rows: BusinessRow[]) {
  const seen = new Set<string>();
  const selected: BusinessRow[] = [];
  const skipped: BusinessRow[] = [];

  for (const row of rows) {
    const keys = [`slug:${row.slug}`];
    if (row.google_place_id) keys.push(`place:${row.google_place_id}`);

    if (keys.some((key) => seen.has(key))) {
      skipped.push(row);
      continue;
    }

    for (const key of keys) seen.add(key);
    selected.push(row);
  }

  return { selected, skipped };
}

function reportPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return join("reports", `publish-quality-drafts-${stamp}.md`);
}

function renderReport(rows: BusinessRow[], qualified: BusinessRow[], rejected: Array<{ row: BusinessRow; reasons: string[] }>, applied: number, duplicateSkipped: BusinessRow[]) {
  const counts = new Map<string, { total: number; qualified: number; rejected: number }>();
  for (const row of rows) {
    const item = counts.get(row.category) ?? { total: 0, qualified: 0, rejected: 0 };
    item.total += 1;
    counts.set(row.category, item);
  }
  for (const row of qualified) counts.get(row.category)!.qualified += 1;
  for (const item of rejected) counts.get(item.row.category)!.rejected += 1;

  const lines = [
    "# Publish Quality Drafts",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Drafts checked: ${rows.length}`,
    `- Qualified: ${qualified.length}`,
    `- Duplicate candidates skipped: ${duplicateSkipped.length}`,
    `- Applied: ${applied}`,
    "",
    "## By Category",
    "",
    "| Category | Checked | Qualified | Rejected |",
    "|---|---:|---:|---:|",
    ...[...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([category, item]) => `| ${category} | ${item.total} | ${item.qualified} | ${item.rejected} |`),
    "",
    "## Qualified Preview",
    "",
    "| Name | Category | Area | Rating | Reviews | Photos | Slug |",
    "|---|---|---|---:|---:|---:|---|",
    ...qualified.slice(0, 250).map((row) => `| ${(row.display_name || row.name).replace(/\|/g, "\\|")} | ${row.category} | ${(row.city || row.area || row.municipality || "-").replace(/\|/g, "\\|")} | ${row.rating ?? "-"} | ${row.reviews_count ?? "-"} | ${Math.max(arrayLength(row.place_photos), arrayLength(row.photo_names), hasText(row.primary_photo_name) ? 1 : 0)} | ${row.slug} |`),
    "",
    "## Rejection Reasons",
    "",
    "| Reason | Count |",
    "|---|---:|"
  ];

  const reasonCounts = new Map<string, number>();
  for (const item of rejected) {
    for (const reason of item.reasons) reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
  }
  lines.push(...[...reasonCounts.entries()].sort((a, b) => b[1] - a[1]).map(([reason, count]) => `| ${reason} | ${count} |`));
  lines.push("");
  lines.push("## Duplicate Candidates Skipped");
  lines.push("");
  lines.push("| Name | Category | Google place ID | Slug |");
  lines.push("|---|---|---|---|");
  lines.push(...duplicateSkipped.slice(0, 250).map((row) => `| ${(row.display_name || row.name).replace(/\|/g, "\\|")} | ${row.category} | ${row.google_place_id ?? "-"} | ${row.slug} |`));
  lines.push("");
  return lines.join("\n");
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const supabase = createSupabaseClient();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (options.apply && !apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. It is required to create primary_image_url from Google photos.");

  const rows = await fetchDrafts(supabase, options);
  const publicKeys = await fetchPublicKeys(supabase);
  const rejected: Array<{ row: BusinessRow; reasons: string[] }> = [];
  const qualifiedAll: BusinessRow[] = [];

  for (const row of rows) {
    const reasons = qualify(row);
    if (publicKeys.slugs.has(row.slug)) reasons.push("slug_already_public");
    if (row.google_place_id && publicKeys.googlePlaceIds.has(row.google_place_id)) reasons.push("google_place_id_already_public");
    if (reasons.length) rejected.push({ row, reasons });
    else qualifiedAll.push(row);
  }

  const sortedQualified = qualifiedAll.sort((a, b) =>
    (b.authority_score ?? 0) - (a.authority_score ?? 0) ||
    (b.reviews_count ?? 0) - (a.reviews_count ?? 0) ||
    (b.rating ?? 0) - (a.rating ?? 0)
  );
  const deduped = dedupePublishCandidates(sortedQualified);
  const qualified = applyCategoryCaps(
    deduped.selected,
    options.maxPerCategory
  );

  let applied = 0;
  const errors: Array<{ slug: string; error: string }> = [];

  if (options.apply) {
    for (const row of qualified) {
      try {
        const name = photoName(row);
        const primaryImageUrl = row.primary_image_url || (name ? await fetchPhotoUri(apiKey!, name) : null);
        if (!primaryImageUrl) throw new Error("Could not create primary image URL.");

        const { error } = await supabase
          .from("businesses")
          .update({
            status: "published",
            primary_image_url: primaryImageUrl,
            primary_image_source: row.primary_image_source || "google_places",
            primary_image_credit: row.primary_image_credit || photoCredit(row),
            primary_photo_name: row.primary_photo_name || name,
            image_status: "google_places",
            updated_at: new Date().toISOString().slice(0, 10)
          })
          .eq("id", row.id)
          .eq("status", "draft");

        if (error) throw error;
        applied += 1;
      } catch (error) {
        errors.push({ slug: row.slug, error: error instanceof Error ? error.message : String(error) });
      }
    }
  }

  if (!existsSync("reports")) mkdirSync("reports");
  const path = reportPath();
  writeFileSync(path, renderReport(rows, qualified, rejected, applied, deduped.skipped), "utf8");

  console.log(JSON.stringify({
    mode: options.apply ? "apply" : "dry-run",
    reportPath: path,
    checked: rows.length,
    qualified: qualified.length,
    qualified_before_caps: qualifiedAll.length,
    duplicate_candidates_skipped: deduped.skipped.length,
    applied,
    by_category: qualified.reduce<Record<string, number>>((acc, row) => {
      acc[row.category] = (acc[row.category] ?? 0) + 1;
      return acc;
    }, {}),
    errors
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
