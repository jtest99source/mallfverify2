import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Severity = "high" | "medium" | "low";

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  name_quality_status: string | null;
  category: string | null;
  status: string | null;
  source: string | null;
  area: string | null;
  city: string | null;
  municipality: string | null;
  address: string | null;
  google_place_id: string | null;
  rating: number | null;
  reviews_count: number | null;
  website: string | null;
  phone: string | null;
  google_maps_url: string | null;
  website_type: string | null;
  primary_type: string | null;
  primary_image_url: string | null;
  primary_photo_name: string | null;
  photo_names: string[] | null;
  place_photos: unknown[] | null;
  place_reviews: Array<{ text?: string | null; rating?: number | null }> | null;
  place_attributes?: Record<string, unknown> | null;
  review_themes: unknown[] | null;
  review_pros: string[] | null;
  services: unknown[] | null;
  price_estimate: Record<string, unknown> | null;
  category_attributes: Record<string, unknown> | null;
  featured_reviews: unknown[] | null;
  business_self_description: string | null;
  editorial_generated_at: string | null;
  editorial_source: string | null;
  authority_score: number | null;
  raw_google_place: Record<string, unknown> | null;
  updated_at: string | null;
};

type Issue = {
  key: string;
  label: string;
  severity: Severity;
};

const PAGE_SIZE = 75;
const PUBLIC_STATUSES = ["published", "premium"];
const USEFUL_REVIEW_MIN_CHARS = 80;
const GENERIC_GOOGLE_TYPES = new Set(["point_of_interest", "establishment", "service"]);

const EXPECTED_TYPES: Record<string, string[]> = {
  restaurant: ["restaurant"],
  hotel: ["hotel", "lodging"],
  "beach-club": ["restaurant", "bar", "beach"],
  "boat-rental": ["boat_rental", "tour_operator", "travel_agency", "tourist_attraction", "adventure_sports_center"],
  activity: ["tourist_attraction", "amusement_park", "adventure_sports_center", "tour_operator", "travel_agency", "park", "winery", "farm", "sports_activity_location"],
  beach: ["beach", "park", "tourist_attraction", "natural_feature"],
  bar: ["bar", "pub", "wine_bar", "cocktail_bar"],
  cafe: ["cafe", "coffee_shop", "brunch_restaurant"],
  bakery: ["bakery", "pastry_shop"],
  "rent-a-car": ["car_rental"],
  "car-dealer": ["car_dealer", "used_car_dealer"],
  spa: ["spa", "massage", "wellness_center"],
  gym: ["gym", "fitness_center", "yoga_studio", "pilates_studio"],
  market: ["market", "grocery_store", "food_store", "liquor_store", "wine_store"],
  "local-shop": ["store", "home_goods_store", "clothing_store", "jewelry_store", "book_store"],
  museum: ["museum", "art_gallery", "cultural_center"],
  route: ["tourist_attraction", "hiking_area", "park", "scenic_point"],
  excursion: ["tour_operator", "travel_agency"]
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

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    allStatuses: args.includes("--all-statuses"),
    includeDrafts: args.includes("--include-drafts"),
    limit: Number(args.find((arg) => arg.startsWith("--limit="))?.slice("--limit=".length) ?? 0) || null
  };
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function arrayLength(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function rawTypes(row: BusinessRow) {
  const raw = row.raw_google_place;
  const types = raw && Array.isArray(raw.types) ? raw.types.filter((item): item is string => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...types].filter(Boolean))];
}

function publicName(row: BusinessRow) {
  return row.display_name?.trim() || row.name;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function pct(part: number, total: number) {
  return total ? Math.round((part / total) * 10000) / 100 : 0;
}

function usefulReviewCount(row: BusinessRow) {
  return (row.place_reviews ?? []).filter((review) => {
    const text = review.text?.trim() ?? "";
    if (text.length >= USEFUL_REVIEW_MIN_CHARS) return true;
    return text.length >= 45 && /servicio|comida|ambiente|terraza|habitaci|desayuno|piscina|playa|parking|reserva|precio|paella|tapas|barco|gu[ií]a|ruta|masaje|tratamiento/i.test(text);
  }).length;
}

function isClosed(row: BusinessRow) {
  const status = row.raw_google_place?.businessStatus;
  return status === "CLOSED_PERMANENTLY" || status === "CLOSED_TEMPORARILY";
}

function hasExpectedType(row: BusinessRow) {
  const expected = row.category ? EXPECTED_TYPES[row.category] : undefined;
  if (!expected?.length) return true;
  const types = rawTypes(row).filter((type) => !GENERIC_GOOGLE_TYPES.has(type));
  if (!types.length) return true;
  return types.some((type) => expected.some((expectedType) => type.includes(expectedType) || expectedType.includes(type)));
}

function issue(key: string, label: string, severity: Severity): Issue {
  return { key, label, severity };
}

function auditRow(row: BusinessRow) {
  const issues: Issue[] = [];
  const photosCount = Math.max(arrayLength(row.place_photos), arrayLength(row.photo_names), hasText(row.primary_photo_name) ? 1 : 0);
  const usefulReviews = usefulReviewCount(row);

  if (isClosed(row)) issues.push(issue("closed_google_status", "Google marca el negocio como cerrado", "high"));
  if (!hasText(row.google_place_id)) issues.push(issue("missing_google_place_id", "Sin google_place_id", "high"));
  if (!hasText(row.area) || row.area === "Mallorca") issues.push(issue("generic_area", "Zona genérica o vacía", "high"));
  if (!hasText(row.primary_image_url)) issues.push(issue("missing_primary_image", "Sin imagen principal real", "high"));
  if (!hasText(row.category)) issues.push(issue("missing_category", "Sin categoría", "high"));
  if (!hasExpectedType(row)) issues.push(issue("category_type_mismatch", `Categoría sospechosa para tipos: ${rawTypes(row).join(", ")}`, "high"));

  if (typeof row.rating !== "number") issues.push(issue("missing_rating", "Sin rating", "medium"));
  if (typeof row.reviews_count !== "number") issues.push(issue("missing_reviews_count", "Sin número de reseñas", "medium"));
  if (typeof row.reviews_count === "number" && row.reviews_count < 20) issues.push(issue("low_reviews_count", "Pocas reseñas públicas", "medium"));
  if (!hasText(row.city) && !hasText(row.municipality)) issues.push(issue("weak_location_detail", "Sin city ni municipality", "medium"));
  if (!hasText(row.website) && !hasText(row.phone) && !hasText(row.google_maps_url)) issues.push(issue("missing_contact_channels", "Sin web/teléfono/maps", "medium"));
  if (!photosCount) issues.push(issue("missing_google_photos", "Sin fotos de Google guardadas", "medium"));
  if (!arrayLength(row.place_reviews)) issues.push(issue("missing_place_reviews", "Sin reseñas de Place Details", "medium"));
  if (arrayLength(row.place_reviews) > 0 && usefulReviews < 3) issues.push(issue("few_useful_reviews", "Menos de 3 reseñas útiles para IA", "medium"));
  if (!row.place_attributes || !Object.keys(row.place_attributes).length) issues.push(issue("missing_place_attributes", "Sin atributos booleanos de Google", "medium"));

  if (!arrayLength(row.review_themes)) issues.push(issue("missing_review_themes", "Sin chips de temas", "low"));
  if (!arrayLength(row.review_pros)) issues.push(issue("missing_review_pros", "Sin 'Lo que más gusta'", "low"));
  if (!arrayLength(row.services)) issues.push(issue("missing_services", "Sin 'Qué ofrece'", "low"));
  if (!row.category_attributes) issues.push(issue("missing_category_attributes", "Sin category_attributes", "low"));
  if (!arrayLength(row.featured_reviews)) issues.push(issue("missing_featured_reviews", "Sin reseñas destacadas", "low"));
  if (!row.editorial_generated_at) issues.push(issue("missing_editorial_generation", "Sin generación editorial rica", "low"));
  if (row.name_quality_status === "raw") issues.push(issue("raw_name", "Nombre pendiente de normalización", "low"));

  const severityScore = issues.reduce((sum, item) => sum + (item.severity === "high" ? 5 : item.severity === "medium" ? 2 : 1), 0);

  return {
    row,
    issues,
    severityScore,
    usefulReviews,
    photosCount
  };
}

function countIssues(audits: ReturnType<typeof auditRow>[]) {
  const counts = new Map<string, { label: string; severity: Severity; count: number }>();
  for (const audit of audits) {
    for (const item of audit.issues) {
      const current = counts.get(item.key) ?? { label: item.label, severity: item.severity, count: 0 };
      current.count += 1;
      counts.set(item.key, current);
    }
  }
  return [...counts.entries()]
    .map(([key, value]) => ({ key, ...value }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function renderReport(rows: BusinessRow[], audits: ReturnType<typeof auditRow>[]) {
  const issueCounts = countIssues(audits);
  const byCategory = new Map<string, ReturnType<typeof auditRow>[]>();
  for (const audit of audits) {
    const category = audit.row.category ?? "unknown";
    byCategory.set(category, [...(byCategory.get(category) ?? []), audit]);
  }

  const highRisk = audits.filter((audit) => audit.issues.some((item) => item.severity === "high"));
  const mediumRisk = audits.filter((audit) => !audit.issues.some((item) => item.severity === "high") && audit.issues.some((item) => item.severity === "medium"));
  const cleanEnough = audits.filter((audit) => !audit.issues.some((item) => item.severity !== "low"));

  const categoryRows = [...byCategory.entries()]
    .map(([category, categoryAudits]) => ({
      category,
      total: categoryAudits.length,
      high: categoryAudits.filter((audit) => audit.issues.some((item) => item.severity === "high")).length,
      medium: categoryAudits.filter((audit) => audit.issues.some((item) => item.severity === "medium")).length,
      missingImage: categoryAudits.filter((audit) => audit.issues.some((item) => item.key === "missing_primary_image")).length,
      genericArea: categoryAudits.filter((audit) => audit.issues.some((item) => item.key === "generic_area")).length,
      missingEditorial: categoryAudits.filter((audit) => audit.issues.some((item) => item.key === "missing_editorial_generation")).length
    }))
    .sort((a, b) => b.high - a.high || b.total - a.total);

  const priorityRows = audits
    .filter((audit) => audit.severityScore > 0)
    .sort((a, b) => b.severityScore - a.severityScore || (b.row.reviews_count ?? 0) - (a.row.reviews_count ?? 0))
    .slice(0, 120);

  const lines = [
    "# Business Profile Quality Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Audited businesses | ${rows.length} |`,
    `| High-risk profiles | ${highRisk.length} (${pct(highRisk.length, rows.length)}%) |`,
    `| Medium-risk profiles | ${mediumRisk.length} (${pct(mediumRisk.length, rows.length)}%) |`,
    `| Clean enough for data quality | ${cleanEnough.length} (${pct(cleanEnough.length, rows.length)}%) |`,
    "",
    "## Issue Counts",
    "",
    "| Issue | Severity | Count |",
    "|---|---|---:|",
    ...issueCounts.map((row) => `| ${formatValue(row.label)} | ${row.severity} | ${row.count} |`),
    "",
    "## By Category",
    "",
    "| Category | Total | High risk | Medium flags | Missing image | Generic area | Missing editorial |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...categoryRows.map((row) => `| ${formatValue(row.category)} | ${row.total} | ${row.high} | ${row.medium} | ${row.missingImage} | ${row.genericArea} | ${row.missingEditorial} |`),
    "",
    "## Priority Review Queue",
    "",
    "| # | Score | Name | Category | Status | Area | Rating | Reviews | Useful reviews | Photos | Issues | URL slug |",
    "|---:|---:|---|---|---|---|---:|---:|---:|---:|---|---|",
    ...priorityRows.map((audit, index) => {
      const row = audit.row;
      return `| ${index + 1} | ${audit.severityScore} | ${formatValue(publicName(row))} | ${formatValue(row.category)} | ${formatValue(row.status)} | ${formatValue(row.city || row.area || row.municipality)} | ${formatValue(row.rating)} | ${formatValue(row.reviews_count)} | ${audit.usefulReviews} | ${audit.photosCount} | ${formatValue(audit.issues.map((item) => item.key).join(", "))} | ${formatValue(row.slug)} |`;
    }),
    "",
    "## Suggested Order",
    "",
    "1. Fix high-risk rows first: closed status, missing Google Place ID, generic area, missing image, category/type mismatch.",
    "2. Re-run detail enrichment after applying migration 016 so place_attributes is populated.",
    "3. Generate editorial only for rows with enough useful reviews or strong place attributes.",
    "4. Review top category gaps before publishing large new batches.",
    ""
  ];

  return lines.join("\n");
}

async function fetchRows(allStatuses: boolean, includeDrafts: boolean, limit: number | null) {
  const supabase = createSupabaseClient();
  const selectFields = [
    "id",
    "slug",
    "name",
    "display_name",
    "name_quality_status",
    "category",
    "status",
    "source",
    "area",
    "city",
    "municipality",
    "address",
    "google_place_id",
    "rating",
    "reviews_count",
    "website",
    "phone",
    "google_maps_url",
    "website_type",
    "primary_type",
    "primary_image_url",
    "primary_photo_name",
    "photo_names",
    "place_photos",
    "place_reviews",
    "place_attributes",
    "review_themes",
    "review_pros",
    "services",
    "price_estimate",
    "category_attributes",
    "featured_reviews",
    "business_self_description",
    "editorial_generated_at",
    "editorial_source",
    "authority_score",
    "raw_google_place",
    "updated_at"
  ].join(",");

  const rows: BusinessRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    if (limit !== null && rows.length >= limit) break;
    const to = limit === null ? from + PAGE_SIZE - 1 : Math.min(from + PAGE_SIZE - 1, limit - 1);
    let query = supabase
      .from("businesses")
      .select(selectFields)
      .order("id", { ascending: true })
      .range(from, to);

    if (!allStatuses) {
      query = includeDrafts ? query.in("status", [...PUBLIC_STATUSES, "draft"]) : query.in("status", PUBLIC_STATUSES);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Cannot audit profile quality. Apply migrations through 016 first if columns are missing. Details: ${error.message}`);
    }

    const page = (data ?? []) as unknown as BusinessRow[];
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

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const rows = await fetchRows(options.allStatuses, options.includeDrafts, options.limit);
  const audits = rows.map(auditRow);

  if (!existsSync("reports")) mkdirSync("reports");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `business-profile-quality-${stamp}.md`);
  writeFileSync(reportPath, renderReport(rows, audits), "utf8");

  const highRisk = audits.filter((audit) => audit.issues.some((item) => item.severity === "high")).length;
  const mediumRisk = audits.filter((audit) => !audit.issues.some((item) => item.severity === "high") && audit.issues.some((item) => item.severity === "medium")).length;
  console.log(JSON.stringify({
    reportPath,
    audited: rows.length,
    highRisk,
    mediumRisk
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
