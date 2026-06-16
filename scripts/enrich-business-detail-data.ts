import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_LIMIT = 25;
const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_PAUSE_MS = 250;
const MASSIVE_RUN_THRESHOLD = 100;
const SUPABASE_PAGE_SIZE = 250;

type GooglePhoto = {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: Array<{ displayName?: string; uri?: string }>;
};

type GoogleReview = {
  name?: string;
  relativePublishTimeDescription?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string } | string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

type GooglePlaceDetails = {
  id?: string;
  displayName?: { text?: string; languageCode?: string };
  formattedAddress?: string;
  googleMapsUri?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  priceRange?: {
    startPrice?: GoogleMoney;
    endPrice?: GoogleMoney;
  };
  editorialSummary?: GoogleLocalizedText | string;
  generativeSummary?: GoogleLocalizedText | { overview?: GoogleLocalizedText | string } | string;
  types?: string[];
  primaryType?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  currentOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  photos?: GooglePhoto[];
  reviews?: GoogleReview[];
  servesBeer?: boolean;
  servesWine?: boolean;
  servesCocktails?: boolean;
  servesBrunch?: boolean;
  servesBreakfast?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  servesDessert?: boolean;
  servesVegetarianFood?: boolean;
  outdoorSeating?: boolean;
  liveMusic?: boolean;
  goodForGroups?: boolean;
  goodForChildren?: boolean;
  allowsDogs?: boolean;
  reservable?: boolean;
  takeout?: boolean;
  delivery?: boolean;
  dineIn?: boolean;
  paymentOptions?: Record<string, boolean>;
  parkingOptions?: Record<string, boolean>;
  accessibilityOptions?: Record<string, boolean>;
};

type GoogleLocalizedText = {
  text?: string;
  languageCode?: string;
};

type GoogleMoney = {
  currencyCode?: string;
  units?: string | number;
  nanos?: number;
};

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  category: string;
  area: string | null;
  city: string | null;
  municipality: string | null;
  address: string | null;
  google_place_id: string | null;
  rating: number | null;
  reviews_count: number | null;
  website: string | null;
  google_maps_url: string | null;
  phone: string | null;
  price_level: string | null;
  opening_hours: string | null;
  raw_google_place: Record<string, unknown> | null;
  image_candidate_urls: Array<Record<string, unknown>> | null;
  place_reviews?: Array<Record<string, unknown>> | null;
  detail_enriched_at?: string | null;
};

type Options = {
  limit: number | null;
  category: string | null;
  slug: string | null;
  onlyMissing: boolean;
  includeDrafts: boolean;
  dryRun: boolean;
  yes: boolean;
  batchSize: number;
  pauseMs: number;
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

function parseArgs() {
  const args = process.argv.slice(2);
  const options: Options = {
    limit: DEFAULT_LIMIT,
    category: null as string | null,
    slug: null as string | null,
    onlyMissing: false,
    includeDrafts: false,
    dryRun: false,
    yes: false,
    batchSize: DEFAULT_BATCH_SIZE,
    pauseMs: DEFAULT_PAUSE_MS
  };

  for (const arg of args) {
    if (arg.startsWith("--limit=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) options.limit = Math.floor(value);
    } else if (arg.startsWith("--category=")) {
      options.category = arg.split("=")[1] || null;
    } else if (arg.startsWith("--slug=")) {
      options.slug = arg.split("=")[1] || null;
    } else if (arg.startsWith("--only=")) {
      options.slug = arg.split("=")[1] || null;
    } else if (arg === "--all") {
      options.limit = null;
    } else if (arg === "--only-missing") {
      options.onlyMissing = true;
    } else if (arg === "--include-drafts") {
      options.includeDrafts = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--yes") {
      options.yes = true;
    } else if (arg.startsWith("--batch-size=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) options.batchSize = Math.floor(value);
    } else if (arg.startsWith("--pause-ms=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value >= 0) options.pauseMs = Math.floor(value);
    }
  }

  if (options.slug && options.limit === DEFAULT_LIMIT) options.limit = 1;
  if (options.onlyMissing && options.limit === DEFAULT_LIMIT) options.limit = null;

  return options;
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

async function fetchPlaceDetails(apiKey: string, googlePlaceId: string): Promise<GooglePlaceDetails> {
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(googlePlaceId)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "id",
        "displayName",
        "formattedAddress",
        "googleMapsUri",
        "websiteUri",
        "nationalPhoneNumber",
        "internationalPhoneNumber",
        "rating",
        "userRatingCount",
        "priceLevel",
        "priceRange",
        "editorialSummary",
        "generativeSummary",
        "types",
        "primaryType",
        "regularOpeningHours",
        "currentOpeningHours",
        "photos.name",
        "photos.widthPx",
        "photos.heightPx",
        "photos.authorAttributions",
        "reviews.rating",
        "reviews.text",
        "reviews.relativePublishTimeDescription",
        "reviews.authorAttribution",
        "servesBeer",
        "servesWine",
        "servesCocktails",
        "servesBrunch",
        "servesBreakfast",
        "servesLunch",
        "servesDinner",
        "servesDessert",
        "servesVegetarianFood",
        "outdoorSeating",
        "liveMusic",
        "goodForGroups",
        "goodForChildren",
        "allowsDogs",
        "reservable",
        "takeout",
        "delivery",
        "dineIn",
        "paymentOptions",
        "parkingOptions",
        "accessibilityOptions"
      ].join(",")
    }
  });

  if (!response.ok) {
    throw new Error(`Google Places details ${response.status}: ${await response.text()}`);
  }

  return response.json() as Promise<GooglePlaceDetails>;
}

function publicName(business: Pick<BusinessRow, "display_name" | "name">) {
  return business.display_name?.trim() || business.name;
}

function locationLabel(business: Pick<BusinessRow, "city" | "area" | "municipality">) {
  return business.city || business.area || business.municipality || "Mallorca";
}

function categoryLabel(category: string) {
  return {
    restaurant: "restaurante",
    hotel: "hotel",
    "beach-club": "beach club",
    "boat-rental": "alquiler de barcos",
    activity: "actividad",
    beach: "playa o cala",
    bar: "bar",
    cafe: "cafetería",
    bakery: "horno o pastelería",
    spa: "spa",
    gym: "gimnasio",
    market: "mercado o tienda gourmet",
    "local-shop": "tienda local",
    museum: "museo o espacio cultural",
    route: "ruta o mirador",
    excursion: "excursión",
    "rent-a-car": "alquiler de coches",
    "car-dealer": "concesionario"
  }[category] ?? "negocio";
}

function mapPriceLevel(priceLevel?: string) {
  const prices: Record<string, string> = {
    PRICE_LEVEL_FREE: "€",
    PRICE_LEVEL_INEXPENSIVE: "€",
    PRICE_LEVEL_MODERATE: "€€",
    PRICE_LEVEL_EXPENSIVE: "€€€",
    PRICE_LEVEL_VERY_EXPENSIVE: "€€€€"
  };

  return priceLevel ? prices[priceLevel] ?? null : null;
}

function moneyToNumber(money?: GoogleMoney | null) {
  if (!money) return null;
  const units = typeof money.units === "string" ? Number(money.units) : money.units;
  const nanos = typeof money.nanos === "number" ? money.nanos / 1_000_000_000 : 0;
  if (!Number.isFinite(units)) return null;
  return Math.round(((units ?? 0) + nanos) * 100) / 100;
}

function buildPriceEstimate(place: GooglePlaceDetails) {
  const min = moneyToNumber(place.priceRange?.startPrice);
  const max = moneyToNumber(place.priceRange?.endPrice);
  const currency = place.priceRange?.startPrice?.currencyCode ?? place.priceRange?.endPrice?.currencyCode ?? null;

  if (min !== null || max !== null) {
    return {
      range_min: min,
      range_max: max,
      currency,
      source: "google_places",
      reported_by: null,
      breakdown: null
    };
  }

  const level = priceLevelNumber(mapPriceLevel(place.priceLevel));
  return level
    ? {
        level,
        source: "google_places",
        reported_by: null,
        breakdown: null
      }
    : null;
}

function priceLevelNumber(priceLevel?: string | null) {
  if (!priceLevel) return null;
  const normalized = priceLevel.trim();
  const euroCount = Array.from(normalized).filter((char) => char === "€").length;
  return euroCount > 0 ? Math.min(euroCount, 4) : null;
}

function localizedText(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.text === "string") return record.text.trim() || null;
  if (record.overview) return localizedText(record.overview);
  return null;
}

function getBusinessSelfDescription(place: GooglePlaceDetails) {
  return localizedText(place.editorialSummary) ?? localizedText(place.generativeSummary);
}

function formatPriceEstimate(estimate: ReturnType<typeof buildPriceEstimate>) {
  if (!estimate) return null;
  if ("range_min" in estimate && (estimate.range_min !== null || estimate.range_max !== null)) {
    const min = estimate.range_min;
    const max = estimate.range_max;
    const currency = estimate.currency === "EUR" || !estimate.currency ? "€" : estimate.currency;
    if (min !== null && max !== null) return `${min}–${max} ${currency}`;
    if (min !== null) return `Desde ${min} ${currency}`;
    if (max !== null) return `Hasta ${max} ${currency}`;
  }
  return null;
}

function getOpeningHours(place: GooglePlaceDetails) {
  const descriptions = place.regularOpeningHours?.weekdayDescriptions ?? place.currentOpeningHours?.weekdayDescriptions;
  if (!descriptions?.length) return null;
  return descriptions.join("\n");
}

function textFromReview(review: GoogleReview) {
  if (typeof review.text === "string") return review.text;
  return review.text?.text;
}

function buildPlaceReviews(place: GooglePlaceDetails) {
  return (place.reviews ?? [])
    .map((review) => ({
      authorName: review.authorAttribution?.displayName ?? null,
      authorUri: review.authorAttribution?.uri ?? null,
      rating: typeof review.rating === "number" ? review.rating : null,
      relativeTimeDescription: review.relativePublishTimeDescription ?? null,
      text: textFromReview(review) ?? null,
      languageCode: typeof review.text === "object" ? review.text?.languageCode ?? null : null
    }))
    .filter((review) => review.text);
}

function cleanBooleanOptions(value?: Record<string, boolean>) {
  if (!value) return null;
  const entries = Object.entries(value).filter(([, optionValue]) => optionValue === true);
  return entries.length ? Object.fromEntries(entries) : null;
}

function buildPlaceAttributes(place: GooglePlaceDetails) {
  const booleanFields = [
    "servesBeer",
    "servesWine",
    "servesCocktails",
    "servesBrunch",
    "servesBreakfast",
    "servesLunch",
    "servesDinner",
    "servesDessert",
    "servesVegetarianFood",
    "outdoorSeating",
    "liveMusic",
    "goodForGroups",
    "goodForChildren",
    "allowsDogs",
    "reservable",
    "takeout",
    "delivery",
    "dineIn"
  ] as const;

  const attributes: Record<string, unknown> = {};
  for (const field of booleanFields) {
    if (place[field] === true) attributes[field] = true;
  }

  const paymentOptions = cleanBooleanOptions(place.paymentOptions);
  const parkingOptions = cleanBooleanOptions(place.parkingOptions);
  const accessibilityOptions = cleanBooleanOptions(place.accessibilityOptions);

  if (paymentOptions) attributes.paymentOptions = paymentOptions;
  if (parkingOptions) attributes.parkingOptions = parkingOptions;
  if (accessibilityOptions) attributes.accessibilityOptions = accessibilityOptions;

  return Object.keys(attributes).length ? attributes : null;
}

function buildPlacePhotos(place: GooglePlaceDetails) {
  return (place.photos ?? [])
    .filter((photo) => photo.name)
    .map((photo) => ({
      name: photo.name,
      widthPx: photo.widthPx ?? null,
      heightPx: photo.heightPx ?? null,
      credit: (photo.authorAttributions ?? []).map((author) => author.displayName).filter(Boolean).join(", ") || "Google Places"
    }));
}

function buildBusinessFacts(business: BusinessRow, place: GooglePlaceDetails) {
  const priceEstimate = buildPriceEstimate(place);
  const priceLabel = formatPriceEstimate(priceEstimate) ?? mapPriceLevel(place.priceLevel);
  const facts = [
    getOpeningHours(place) ? { key: "opening_hours", label: "Horario", value: getOpeningHours(place), source: "google_places" } : null,
    priceLabel ? { key: "price", label: "Precio", value: priceLabel, source: "google_places" } : null,
    { key: "area", label: "Zona", value: locationLabel(business), source: "businesses" },
    { key: "category", label: "Tipo", value: categoryLabel(business.category), source: "businesses" },
    typeof place.rating === "number" ? { key: "rating", label: "Valoración", value: `${place.rating}/5`, source: "google_places" } : null
  ];

  return facts.filter(Boolean);
}

function buildHighlights(business: BusinessRow, place: GooglePlaceDetails) {
  const labels = new Set<string>();
  const add = (value?: string | null) => {
    if (value?.trim()) labels.add(value.trim());
  };

  if (place.primaryType) add(place.primaryType.replace(/_/g, " "));
  for (const type of place.types ?? []) {
    const normalized = type.replace(/_/g, " ");
    if (!["point of interest", "establishment", "food"].includes(normalized)) add(normalized);
    if (labels.size >= 2) break;
  }
  if (typeof place.rating === "number" && typeof place.userRatingCount === "number") {
    add(`Valoración ${place.rating}/5 con ${place.userRatingCount.toLocaleString("es-ES")} reseñas`);
  }
  add(`Ubicado en ${locationLabel(business)}`);

  return Array.from(labels).slice(0, 3);
}

function buildVisitTips(business: BusinessRow, place: GooglePlaceDetails) {
  const tips = [
    place.formattedAddress || business.address
      ? { key: "address", label: "Dirección", value: place.formattedAddress || business.address, source: "google_places" }
      : null,
    place.googleMapsUri || business.google_maps_url
      ? { key: "maps", label: "Mapa", value: "Usa Google Maps para confirmar la ruta exacta antes de salir.", source: "google_places" }
      : null,
    place.websiteUri || business.website
      ? { key: "website", label: "Antes de ir", value: "Confirma horarios, disponibilidad y reservas en la web oficial.", source: "google_places" }
      : null
  ];

  return tips.filter(Boolean);
}

function buildEditorialOpinion(business: BusinessRow, place: GooglePlaceDetails) {
  const name = publicName(business);
  const category = categoryLabel(business.category);
  const location = locationLabel(business);
  const rating = typeof place.rating === "number" ? place.rating : business.rating;
  const reviewsCount = typeof place.userRatingCount === "number" ? place.userRatingCount : business.reviews_count;
  const types = (place.types ?? []).map((type) => type.replace(/_/g, " ")).filter((type) => !["point of interest", "establishment"].includes(type));

  const reputation =
    typeof rating === "number" && typeof reviewsCount === "number"
      ? `Tiene una valoración pública de ${rating}/5 con ${reviewsCount.toLocaleString("es-ES")} reseñas, una señal útil para valorar reputación.`
      : "Aún necesita más contexto de reseñas públicas para una lectura completa.";

  const typeText = types.length ? `Su perfil encaja con ${types.slice(0, 2).join(" y ")}.` : `Su perfil encaja como ${category}.`;

  return `${name} es un ${category} ubicado en ${location}. ${typeText} ${reputation}`.trim();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasReviewText(review: unknown) {
  if (!review || typeof review !== "object") return false;
  const value = (review as { text?: unknown }).text;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value && typeof value === "object" && typeof (value as { text?: unknown }).text === "string" && (value as { text: string }).text.trim());
}

function reviewTextCount(value: unknown) {
  return Array.isArray(value) ? value.filter(hasReviewText).length : 0;
}

function distributionBucket(count: number) {
  if (count === 0) return "0";
  if (count <= 2) return "1-2";
  if (count <= 4) return "3-4";
  return "5";
}

function reportPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return join("reports", `place-reviews-coverage-${stamp}.md`);
}

async function hasColumn(supabase: ReturnType<typeof createSupabaseClient>, column: string) {
  const { error } = await supabase.from("businesses").select(column).limit(1);
  return !error;
}

async function fetchBusinesses(supabase: ReturnType<typeof createSupabaseClient>, options: Options) {
  const rows: BusinessRow[] = [];
  const target = options.limit ?? Infinity;

  for (let from = 0; rows.length < target; from += SUPABASE_PAGE_SIZE) {
    const to = Math.min(from + SUPABASE_PAGE_SIZE - 1, from + (target - rows.length) - 1);
    let query = supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,area,city,municipality,address,google_place_id,rating,reviews_count,website,google_maps_url,phone,price_level,opening_hours,raw_google_place,image_candidate_urls,place_reviews,detail_enriched_at")
      .in("status", options.includeDrafts ? ["published", "premium", "draft"] : ["published", "premium"])
      .not("google_place_id", "is", null)
      .range(from, to);

    if (options.category) query = query.eq("category", options.category);
    if (options.slug) query = query.eq("slug", options.slug);
    if (options.onlyMissing) query = query.is("detail_enriched_at", null);

    const { data, error } = await query;
    if (error) throw error;

    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < SUPABASE_PAGE_SIZE) break;
  }

  return rows;
}

function categoryBreakdown(businesses: BusinessRow[]) {
  return businesses.reduce<Record<string, number>>((acc, business) => {
    acc[business.category] = (acc[business.category] ?? 0) + 1;
    return acc;
  }, {});
}

async function coverageReport(supabase: ReturnType<typeof createSupabaseClient>) {
  const rows: Array<Pick<BusinessRow, "slug" | "name" | "display_name" | "category" | "google_place_id" | "place_reviews">> = [];

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("slug,name,display_name,category,google_place_id,place_reviews")
      .in("status", ["published", "premium"])
      .range(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error) throw error;

    const page = (data ?? []) as Array<Pick<BusinessRow, "slug" | "name" | "display_name" | "category" | "google_place_id" | "place_reviews">>;
    rows.push(...page);
    if (page.length < SUPABASE_PAGE_SIZE) break;
  }

  const byCategory: Record<string, { total: number; withReviews: number; totalReviews: number }> = {};
  const distribution = { "0": 0, "1-2": 0, "3-4": 0, "5": 0 };
  const withoutReviews: Array<{ name: string; slug: string; category: string }> = [];
  const withoutGooglePlaceId: Array<{ name: string; slug: string; category: string }> = [];

  for (const row of rows) {
    const count = reviewTextCount(row.place_reviews);
    byCategory[row.category] ??= { total: 0, withReviews: 0, totalReviews: 0 };
    byCategory[row.category].total += 1;
    byCategory[row.category].totalReviews += count;
    if (count > 0) byCategory[row.category].withReviews += 1;
    distribution[distributionBucket(count)] += 1;
    if (!row.google_place_id) withoutGooglePlaceId.push({ name: publicName(row), slug: row.slug, category: row.category });
    else if (count === 0) withoutReviews.push({ name: publicName(row), slug: row.slug, category: row.category });
  }

  return { byCategory, distribution, withoutReviews, withoutGooglePlaceId };
}

function writeCoverageReport(result: {
  dryRun: boolean;
  selected: number;
  processed: number;
  updated: number;
  failures: Array<{ business: string; slug: string; category: string; error: string }>;
  previews: Array<{ business: string; slug: string; category: string; facts: number; highlights: string[]; reviews: number; photos: number }>;
  coverage: Awaited<ReturnType<typeof coverageReport>>;
}) {
  if (!existsSync("reports")) mkdirSync("reports");

  const categoryLines = Object.entries(result.coverage.byCategory)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, row]) => {
      const average = row.total ? row.totalReviews / row.total : 0;
      return `| ${category} | ${row.total} | ${row.withReviews} | ${average.toFixed(2)} |`;
    });

  const lines = [
    "# Place Reviews Coverage",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Dry run: ${result.dryRun ? "yes" : "no"}`,
    "",
    "## Run",
    "",
    `- Selected: ${result.selected}`,
    `- Processed: ${result.processed}`,
    `- Updated: ${result.updated}`,
    `- Failures: ${result.failures.length}`,
    "",
    "## Coverage by category",
    "",
    "| Category | Total | With reviews | Avg reviews |",
    "|---|---:|---:|---:|",
    ...categoryLines,
    "",
    "## Review distribution",
    "",
    `- 0 reviews: ${result.coverage.distribution["0"]}`,
    `- 1-2 reviews: ${result.coverage.distribution["1-2"]}`,
    `- 3-4 reviews: ${result.coverage.distribution["3-4"]}`,
    `- 5 reviews: ${result.coverage.distribution["5"]}`,
    "",
    "## Businesses without reviews after attempt",
    "",
    ...result.coverage.withoutReviews.map((row) => `- ${row.name} (${row.slug}) - ${row.category}`),
    "",
    "## Businesses without google_place_id",
    "",
    ...result.coverage.withoutGooglePlaceId.map((row) => `- ${row.name} (${row.slug}) - ${row.category}`),
    "",
    "## Failures",
    "",
    ...result.failures.map((row) => `- ${row.business} (${row.slug}) - ${row.category}: ${row.error}`),
    "",
    "## Preview",
    "",
    ...result.previews.slice(0, 30).map((row) => `- ${row.business} (${row.slug}) - ${row.category}: ${row.reviews} reviews, ${row.photos} photos, ${row.facts} facts`)
  ];

  const path = reportPath();
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  return path;
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");

  const supabase = createSupabaseClient();

  const { error: schemaError } = await supabase.from("businesses").select("place_photos,place_reviews,place_attributes,business_facts,visit_tips,highlights,price_estimate,detail_enriched_at").limit(1);
  if (schemaError) {
    throw new Error(`Missing detail enrichment columns. Apply migration 010_business_detail_enrichment.sql first. Details: ${schemaError.message}`);
  }

  const supportsBusinessSelfDescription = await hasColumn(supabase, "business_self_description");
  const businesses = await fetchBusinesses(supabase, options);
  let updated = 0;
  let processed = 0;
  const errors: Array<{ business: string; slug: string; category: string; error: string }> = [];
  const previews: Array<{ business: string; slug: string; category: string; facts: number; highlights: string[]; reviews: number; photos: number }> = [];

  const runSummary = {
    dry_run: options.dryRun,
    only_missing: options.onlyMissing,
    include_drafts: options.includeDrafts,
    selected: businesses.length,
    by_category: categoryBreakdown(businesses),
    estimated_place_details_calls: businesses.length,
    note: "Place Details field mask includes reviews/photos/priceRange/editorialSummary, so this can trigger Enterprise + Atmosphere billing."
  };
  console.log(JSON.stringify(runSummary, null, 2));

  if (options.dryRun) {
    const coverage = await coverageReport(supabase);
    const report = writeCoverageReport({
      dryRun: true,
      selected: businesses.length,
      processed: 0,
      updated: 0,
      failures: [],
      previews: businesses.slice(0, 30).map((business) => ({
        business: publicName(business),
        slug: business.slug,
        category: business.category,
        facts: 0,
        highlights: [],
        reviews: reviewTextCount(business.place_reviews),
        photos: 0
      })),
      coverage
    });

    console.log(JSON.stringify({
      dry_run: true,
      selected: businesses.length,
      estimated_place_details_calls: businesses.length,
      by_category: categoryBreakdown(businesses),
      report
    }, null, 2));
    return;
  }

  if (businesses.length > MASSIVE_RUN_THRESHOLD && !options.yes) {
    throw new Error(`Refusing to run ${businesses.length} paid Place Details calls without --yes. Re-run with --dry-run first, then add --yes when ready.`);
  }

  for (let index = 0; index < businesses.length; index += 1) {
    const business = businesses[index];
    if (index % options.batchSize === 0) {
      const batchNumber = Math.floor(index / options.batchSize) + 1;
      const totalBatches = Math.ceil(businesses.length / options.batchSize);
      console.log(`Batch ${batchNumber}/${totalBatches} (${index + 1}-${Math.min(index + options.batchSize, businesses.length)} of ${businesses.length})`);
    }

    try {
      if (!business.google_place_id) continue;
      processed += 1;
      const place = await fetchPlaceDetails(apiKey, business.google_place_id);
      const placePhotos = buildPlacePhotos(place);
      const placeReviews = buildPlaceReviews(place);
      const placeAttributes = buildPlaceAttributes(place);
      const businessFacts = buildBusinessFacts(business, place);
      const visitTips = buildVisitTips(business, place);
      const highlights = buildHighlights(business, place);
      const openingHours = getOpeningHours(place);
      const priceLevel = mapPriceLevel(place.priceLevel);
      const priceEstimate = buildPriceEstimate(place);
      const businessSelfDescription = getBusinessSelfDescription(place);
      const rawGooglePlace = {
        ...(business.raw_google_place ?? {}),
        ...place
      };

      const payload: Record<string, unknown> = {
        raw_google_place: rawGooglePlace,
        place_photos: placePhotos,
        place_reviews: placeReviews,
        business_facts: businessFacts,
        visit_tips: visitTips,
        highlights,
        price_estimate: priceEstimate,
        opening_hours: business.opening_hours || openingHours,
        price_level: business.price_level || priceLevel,
        address: business.address || place.formattedAddress || null,
        website: business.website || place.websiteUri || null,
        phone: business.phone || place.internationalPhoneNumber || place.nationalPhoneNumber || null,
        google_maps_url: business.google_maps_url || place.googleMapsUri || null,
        rating: place.rating ?? business.rating,
        reviews_count: place.userRatingCount ?? business.reviews_count,
        detail_enriched_at: new Date().toISOString()
      };

      if (supportsBusinessSelfDescription) {
        payload.business_self_description = businessSelfDescription;
      }

      if (placeAttributes) {
        payload.place_attributes = placeAttributes;
      }

      previews.push({
        business: publicName(business),
        slug: business.slug,
        category: business.category,
        facts: businessFacts.length,
        highlights,
        reviews: placeReviews.length,
        photos: placePhotos.length
      });

      if (!options.dryRun) {
        const { error: updateError } = await supabase.from("businesses").update(payload).eq("id", business.id);
        if (updateError) throw updateError;
        updated += 1;
      }
    } catch (error) {
      errors.push({
        business: publicName(business),
        slug: business.slug,
        category: business.category,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    if (options.pauseMs > 0) await sleep(options.pauseMs);
  }

  const coverage = await coverageReport(supabase);
  const report = writeCoverageReport({
    dryRun: options.dryRun,
    selected: businesses.length,
    processed,
    updated,
    failures: errors,
    previews,
    coverage
  });

  console.log(JSON.stringify({
    dry_run: options.dryRun,
    selected: businesses.length,
    processed,
    updated,
    report,
    previews: previews.slice(0, 20),
    errors
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
