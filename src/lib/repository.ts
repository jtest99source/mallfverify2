import "server-only";
import { validateCategoryAttributes, socialProfilesSchema } from "@/lib/business-attribute-schemas";
import { categoryConfigs, getBusinessCategoryFromSlug, getCategorySlugFromBusiness, isPublicCategorySlug, publicCategorySlugs, type CategorySlug } from "@/lib/data";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase";
import { toSlug } from "@/lib/slugs";
import { siteConfig } from "@/config/site";
import { calculateUntappedScore } from "@/lib/untapped-score";
import { filterBusinessesByFacet, getFacet } from "@/lib/taxonomy";
import type { AnyCategoryAttributes, Business, BusinessCategory, BusinessFact, ContentStatus, EditorialService, EditorialSource, FAQ, FeaturedReview, GoogleReview, ImageCandidate, ImageStatus, PlacePhoto, PriceEstimate, PriceLevel, PriorityLevel, ReviewSentiment, ReviewTheme, SocialProfiles, VisitTip } from "@/types/business";
import type { Guide } from "@/types/guide";
import type { Ranking, RankingCategory } from "@/types/ranking";
import type { Locale } from "@/lib/i18n";

const publicStatuses: ContentStatus[] = ["published", "premium"];
const configuredBusinessCategories = new Set<BusinessCategory>(
  Object.values(categoryConfigs).map((config) => config.businessCategory)
);
const publicBusinessCategories = new Set<BusinessCategory>(
  publicCategorySlugs.map((slug) => categoryConfigs[slug].businessCategory)
);

const nightlifeRestaurantSignals = [
  "bar",
  "beach club",
  "beachclub",
  "cocktail",
  "club",
  "gastrobeach",
  "live music",
  "pub",
  "rooftop",
  "skybar"
];

const restaurantListingSignals = [
  "arroceria",
  "bar and grill",
  "bistro",
  "brasserie",
  "brunch",
  "burger",
  "cocina",
  "dining",
  "food",
  "gastro",
  "gastrobar",
  "grill",
  "kitchen",
  "mediterranean",
  "paella",
  "pizzeria",
  "restaurant",
  "restaurante",
  "steak",
  "sushi",
  "tapas",
  "trattoria"
];

const barListingSignals = [
  "bar",
  "bar and grill",
  "beach bar",
  "beer",
  "bodega",
  "chiringuito",
  "cocktail",
  "coctel",
  "cocteleria",
  "gastrobar",
  "gastropub",
  "pub",
  "rooftop",
  "skybar",
  "sports bar",
  "tapas",
  "vermut",
  "vermuteria",
  "wine bar",
  "vinoteca"
];

const cafeListingSignals = [
  "bakery",
  "brunch",
  "cake",
  "cafe",
  "cafeteria",
  "coffee",
  "croissant",
  "desayuno",
  "forn",
  "panaderia",
  "pasteleria",
  "pastry",
  "specialty coffee"
];

const iceCreamExclusionSignals = [
  "gelateria",
  "gelat",
  "heladeria",
  "helado",
  "ice cream",
  "sorbet"
];

const bakeryListingSignals = [
  "bakery",
  "cake",
  "cannoli",
  "confectionery",
  "croissant",
  "dulce",
  "forn",
  "horno",
  "panaderia",
  "pasteleria",
  "pastry"
];

const casinoListingSignals = [
  "apuestas",
  "betting",
  "bingo",
  "casino",
  "gaming hall",
  "juego",
  "juegos",
  "merkur",
  "orenes",
  "poker",
  "punt de joc",
  "salon de juego",
  "salon de juegos",
  "spielhalle",
  "tragaperras"
];

const activityListingSignals = [
  "adventure",
  "aventura",
  "bike",
  "boat trip",
  "boat tour",
  "buggy",
  "charter",
  "climbing",
  "cruise",
  "cycling",
  "dive",
  "diving",
  "excursion",
  "freediving",
  "guided",
  "helicopter",
  "hiking",
  "horse",
  "jet ski",
  "jetski",
  "kayak",
  "museum",
  "nautica",
  "paddle",
  "pirates",
  "sailing",
  "segway",
  "snorkel",
  "snorkeling",
  "surf",
  "tour",
  "tours",
  "trekking",
  "vela",
  "walking"
];

function getBusinessCategoriesForListing(category: CategorySlug): BusinessCategory[] {
  if (category === "restaurants") return ["restaurant", "bar", "cafe", "beach-club"];
  if (category === "nightlife") return ["nightlife", "bar", "beach-club", "restaurant"];
  if (category === "bars") return ["bar", "nightlife", "beach-club", "restaurant", "hotel", "cafe"];
  if (category === "cafes") return ["cafe", "bakery", "restaurant", "bar"];
  if (category === "bakeries") return ["bakery", "cafe"];
  if (category === "casinos") return ["casino", "bar", "nightlife"];
  if (category === "activities") return ["activity", "boat-rental", "gym", "nightlife"];
  return [getBusinessCategoryFromSlug(category)];
}

function normalizeListingSignal(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ")
    .toLowerCase();
}

function hasListingSignal(text: string, signals: string[]) {
  return signals.some((signal) => {
    const normalizedSignal = normalizeListingSignal(signal).trim();
    if (!normalizedSignal) return false;
    if (!normalizedSignal.includes(" ")) return new RegExp(`(^|\\W)${normalizedSignal}(\\W|$)`).test(text);
    return text.includes(normalizedSignal);
  });
}

function businessMatchesListingCategory(row: Pick<BusinessRow, "category" | "name" | "display_name" | "short_description" | "description" | "tags" | "best_for">, category: CategorySlug) {
  const signalText = normalizeListingSignal(
    [
      row.name,
      row.display_name,
      row.short_description,
      row.description,
      ...(row.tags ?? []),
      ...(row.best_for ?? [])
    ].join(" ")
  );

  if (category === "restaurants") {
    if (row.category === "restaurant") {
      if (hasListingSignal(signalText, iceCreamExclusionSignals)) return false;
      return true;
    }
    if (row.category !== "bar" && row.category !== "cafe" && row.category !== "beach-club") return false;
    return hasListingSignal(signalText, restaurantListingSignals);
  }

  if (category === "nightlife") {
    if (row.category === "nightlife" || row.category === "bar" || row.category === "beach-club") return true;
    if (row.category !== "restaurant") return false;
    return hasListingSignal(signalText, nightlifeRestaurantSignals);
  }

  if (category === "bars") {
    if (row.category === "bar" || row.category === "nightlife" || row.category === "beach-club") return true;
    if (row.category !== "restaurant" && row.category !== "hotel" && row.category !== "cafe") return false;
    return hasListingSignal(signalText, barListingSignals);
  }

  if (category === "cafes") {
    if (row.category === "cafe") return true;
    if (row.category !== "bakery" && row.category !== "restaurant" && row.category !== "bar") return false;
    return hasListingSignal(signalText, cafeListingSignals);
  }

  if (category === "bakeries") {
    if (row.category === "bakery") return true;
    if (row.category !== "cafe") return false;
    return hasListingSignal(signalText, bakeryListingSignals);
  }

  if (category === "casinos") {
    if (row.category === "casino") return true;
    if (row.category !== "bar" && row.category !== "nightlife") return false;
    return hasListingSignal(signalText, casinoListingSignals);
  }

  if (category === "activities") {
    if (row.category === "activity") return true;
    if (row.category !== "boat-rental" && row.category !== "gym" && row.category !== "nightlife") return false;
    return hasListingSignal(signalText, activityListingSignals);
  }

  return row.category === getBusinessCategoryFromSlug(category);
}
const fallbackPublicBusinessStats = {
  publishedBusinesses: 6036,
  analyzedReviews: 3765662,
  activeCategories: 17
};
const publicListingMaxRows = 1000;
const businessListingSelect = [
  "id",
  "slug",
  "name",
  "original_name",
  "display_name",
  "name_quality_status",
  "category",
  "short_description",
  "description",
  "area",
  "city",
  "municipality",
  "address",
  "website",
  "instagram",
  "phone",
  "price_level",
  "tags",
  "best_for",
  "image",
  "primary_image_url",
  "primary_image_source",
  "primary_image_credit",
  "gallery_image_urls",
  "image_status",
  "updated_at",
  "google_place_id",
  "rating",
  "reviews_count",
  "google_maps_url",
  "source",
  "status",
  "commercial_priority",
  "client_potential",
  "is_featured",
  "is_claimed",
  "authority_score",
  "website_type",
  "ai_description",
  "editorial_description",
  "ideal_for",
  "price_estimate"
].join(",");

type SeoJson = { title?: string; description?: string };

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  original_name: string | null;
  display_name: string | null;
  name_quality_status: string | null;
  category: BusinessCategory;
  short_description: string;
  description: string;
  area: string;
  city: string | null;
  municipality: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  instagram: string | null;
  social_profiles?: SocialProfiles | null;
  phone: string | null;
  price_level: PriceLevel | null;
  tags: string[] | null;
  best_for: string[] | null;
  image: string | null;
  primary_image_url?: string | null;
  primary_image_source?: string | null;
  primary_image_credit?: string | null;
  gallery_image_urls?: string[] | null;
  image_status?: ImageStatus | null;
  image_candidate_urls?: ImageCandidate[] | null;
  gallery: string[] | null;
  opening_hours: string | null;
  faqs: FAQ[] | null;
  seo: SeoJson | null;
  updated_at: string;
  google_place_id: string | null;
  raw_google_place?: Record<string, unknown> | null;
  photo_names?: string[] | null;
  place_photos?: PlacePhoto[] | null;
  place_reviews?: GoogleReview[] | null;
  business_facts?: BusinessFact[] | null;
  visit_tips?: VisitTip[] | null;
  editorial_opinion?: string | null;
  highlights?: string[] | null;
  reservation_hint?: string | null;
  parking_hint?: string | null;
  season_hint?: string | null;
  detail_enriched_at?: string | null;
  rating: number | null;
  reviews_count: number | null;
  google_maps_url: string | null;
  source: string | null;
  status: ContentStatus | null;
  commercial_priority: PriorityLevel | null;
  client_potential: PriorityLevel | null;
  is_featured: boolean | null;
  is_claimed: boolean | null;
  authority_score: number | null;
  website_type: string | null;
  ai_description: string | null;
  editorial_description: string | null;
  ideal_for: string[] | null;
  what_to_expect: string | null;
  review_summary: string | null;
  faq_auto: FAQ[] | null;
  editorial_status: string | null;
  review_sentiment?: ReviewSentiment | null;
  review_themes?: ReviewTheme[] | null;
  review_pros?: string[] | null;
  review_cons?: string[] | null;
  services?: EditorialService[] | null;
  price_estimate?: PriceEstimate | null;
  category_attributes?: unknown;
  featured_reviews?: FeaturedReview[] | null;
  business_self_description?: string | null;
  editorial_generated_at?: string | null;
  editorial_source?: EditorialSource | null;
};

type RankingItemRow = {
  position: number;
  business_id: string | null;
  name: string;
  description: string;
  why_we_picked_it: string;
  best_for: string[] | null;
};

type RankingRow = {
  id: string;
  slug: string;
  locale: Locale;
  title: string;
  hook: string;
  intro: string;
  hero_image_url?: string | null;
  category: RankingCategory;
  area: string | null;
  faqs: FAQ[] | null;
  seo: SeoJson | null;
  updated_at: string;
  status: ContentStatus | null;
  source: string | null;
  is_featured: boolean | null;
  ranking_items?: RankingItemRow[];
};

type GuideRow = {
  id: string;
  slug: string;
  locale: Locale;
  title: string;
  excerpt: string;
  intro: string;
  hero_image_url?: string | null;
  sections: Guide["sections"] | null;
  faqs: FAQ[] | null;
  seo: SeoJson | null;
  updated_at: string;
  status: ContentStatus | null;
  source: string | null;
  is_featured: boolean | null;
};

function emptyWhenUnconfigured<T>(fallback: T): T | null {
  if (hasSupabaseConfig()) return null;
  return fallback;
}

function normalizeSeo(seo: SeoJson | null | undefined, titleFallback: string, descriptionFallback = "") {
  return {
    title: seo?.title || titleFallback,
    description: seo?.description || descriptionFallback
  };
}

function textFromGoogleReview(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "text" in value && typeof (value as { text?: unknown }).text === "string") {
    return (value as { text: string }).text;
  }
  return undefined;
}

function parseGoogleReviews(rawGooglePlace?: Record<string, unknown> | null): GoogleReview[] | undefined {
  const reviews = rawGooglePlace?.reviews;
  if (!Array.isArray(reviews)) return undefined;

  const parsed = reviews
    .map((review): GoogleReview => {
      const item = review as Record<string, unknown>;
      const authorAttribution = item.authorAttribution as Record<string, unknown> | undefined;

      return {
        authorName: typeof item.author_name === "string" ? item.author_name : typeof authorAttribution?.displayName === "string" ? authorAttribution.displayName : undefined,
        rating: typeof item.rating === "number" ? item.rating : undefined,
        relativeTimeDescription:
          typeof item.relative_time_description === "string"
            ? item.relative_time_description
            : typeof item.relativePublishTimeDescription === "string"
              ? item.relativePublishTimeDescription
              : undefined,
        text: textFromGoogleReview(item.text)
      };
    })
    .filter((review) => review.text?.trim());

  return parsed.length ? parsed : undefined;
}

function parseCategoryAttributes(category: BusinessCategory, value: unknown): AnyCategoryAttributes | undefined {
  if (!value) return undefined;
  const parsed = validateCategoryAttributes(category, value);
  return parsed.success ? (parsed.data as AnyCategoryAttributes) : undefined;
}

function parseSocialProfiles(value: unknown): SocialProfiles | undefined {
  const parsed = socialProfilesSchema.safeParse(value ?? {});
  if (!parsed.success) return undefined;
  return Object.keys(parsed.data).length ? parsed.data : undefined;
}

function mapBusiness(row: BusinessRow, maxReviewsInCategory?: number): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    originalName: row.original_name ?? undefined,
    displayName: row.display_name ?? undefined,
    nameQualityStatus: row.name_quality_status ?? undefined,
    category: row.category,
    shortDescription: row.short_description,
    description: row.description,
    area: row.area,
    city: row.city ?? undefined,
    municipality: row.municipality ?? undefined,
    address: row.address ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    website: row.website ?? undefined,
    instagram: row.instagram ?? undefined,
    phone: row.phone ?? undefined,
    priceLevel: row.price_level ?? undefined,
    tags: row.tags ?? [],
    bestFor: row.best_for ?? [],
    image: row.image ?? undefined,
    primaryImageUrl: row.primary_image_url ?? undefined,
    primaryImageSource: row.primary_image_source ?? undefined,
    primaryImageCredit: row.primary_image_credit ?? undefined,
    galleryImageUrls: row.gallery_image_urls ?? undefined,
    imageStatus: row.image_status ?? undefined,
    imageCandidateUrls: row.image_candidate_urls ?? undefined,
    gallery: row.gallery ?? undefined,
    openingHours: row.opening_hours ?? undefined,
    faqs: row.faqs ?? [],
    seo: normalizeSeo(row.seo, `${row.display_name || row.name} | ${siteConfig.name}`, row.short_description),
    updatedAt: row.updated_at,
    googlePlaceId: row.google_place_id ?? undefined,
    rawGooglePlace: row.raw_google_place ?? undefined,
    photoNames: row.photo_names ?? undefined,
    placePhotos: row.place_photos ?? undefined,
    placeReviews: row.place_reviews ?? undefined,
    businessFacts: row.business_facts ?? undefined,
    visitTips: row.visit_tips ?? undefined,
    editorialOpinion: row.editorial_opinion ?? undefined,
    highlights: row.highlights ?? undefined,
    reservationHint: row.reservation_hint ?? undefined,
    parkingHint: row.parking_hint ?? undefined,
    seasonHint: row.season_hint ?? undefined,
    detailEnrichedAt: row.detail_enriched_at ?? undefined,
    googleReviews: row.place_reviews?.length ? row.place_reviews : parseGoogleReviews(row.raw_google_place),
    rating: row.rating ?? undefined,
    reviewsCount: row.reviews_count ?? undefined,
    googleMapsUrl: row.google_maps_url ?? undefined,
    source: row.source ?? undefined,
    status: row.status ?? undefined,
    commercialPriority: row.commercial_priority ?? undefined,
    clientPotential: row.client_potential ?? undefined,
    isFeatured: row.is_featured ?? false,
    isClaimed: row.is_claimed ?? false,
    authorityScore: row.authority_score ?? undefined,
    untappedScore:
      typeof row.rating === "number" && typeof row.reviews_count === "number" && typeof maxReviewsInCategory === "number"
        ? calculateUntappedScore(row.rating, row.reviews_count, maxReviewsInCategory)
        : undefined,
    websiteType: row.website_type ?? undefined,
    aiDescription: row.ai_description ?? undefined,
    editorialDescription: row.editorial_description ?? undefined,
    idealFor: row.ideal_for ?? undefined,
    whatToExpect: row.what_to_expect ?? undefined,
    reviewSummary: row.review_summary ?? undefined,
    faqAuto: row.faq_auto ?? undefined,
    editorialStatus: row.editorial_status ?? undefined,
    reviewSentiment: row.review_sentiment ?? undefined,
    reviewThemes: row.review_themes ?? undefined,
    reviewPros: row.review_pros ?? undefined,
    reviewCons: row.review_cons ?? undefined,
    services: row.services ?? undefined,
    priceEstimate: row.price_estimate ?? undefined,
    categoryAttributes: parseCategoryAttributes(row.category, row.category_attributes),
    socialProfiles: parseSocialProfiles(row.social_profiles),
    featuredReviews: row.featured_reviews ?? undefined,
    businessSelfDescription: row.business_self_description ?? undefined,
    editorialGeneratedAt: row.editorial_generated_at ?? undefined,
    editorialSource: row.editorial_source ?? undefined
  };
}

function maxReviewsByCategory(rows: BusinessRow[]) {
  const maxByCategory = new Map<BusinessCategory, number>();
  for (const row of rows) {
    const reviewsCount = row.reviews_count ?? 0;
    maxByCategory.set(row.category, Math.max(maxByCategory.get(row.category) ?? 0, reviewsCount));
  }
  return maxByCategory;
}

function mapBusinesses(rows: BusinessRow[]): Business[] {
  const maxByCategory = maxReviewsByCategory(rows);
  return rows.map((row) => mapBusiness(row, maxByCategory.get(row.category)));
}

function mapRanking(row: RankingRow): Ranking {
  return {
    id: row.id,
    slug: row.slug,
    locale: row.locale,
    title: row.title,
    hook: row.hook,
    intro: row.intro,
    heroImageUrl: row.hero_image_url ?? undefined,
    category: row.category,
    area: row.area ?? undefined,
    items: (row.ranking_items ?? [])
      .sort((a, b) => a.position - b.position)
      .map((item) => ({
        position: item.position,
        businessId: item.business_id ?? undefined,
        name: item.name,
        description: item.description,
        whyWePickedIt: item.why_we_picked_it,
        bestFor: item.best_for ?? []
      })),
    faqs: row.faqs ?? [],
    seo: normalizeSeo(row.seo, `${row.title} | ${siteConfig.name}`, row.intro),
    updatedAt: row.updated_at,
    status: row.status ?? undefined,
    source: row.source ?? undefined,
    isFeatured: row.is_featured ?? false
  };
}

function mapGuide(row: GuideRow): Guide {
  return {
    id: row.id,
    slug: row.slug,
    locale: row.locale,
    title: row.title,
    excerpt: row.excerpt,
    intro: row.intro,
    heroImageUrl: row.hero_image_url ?? undefined,
    sections: row.sections ?? [],
    faqs: row.faqs ?? [],
    seo: normalizeSeo(row.seo, `${row.title} | ${siteConfig.name}`, row.excerpt),
    updatedAt: row.updated_at,
    status: row.status ?? undefined,
    source: row.source ?? undefined,
    isFeatured: row.is_featured ?? false
  };
}

function publicStatusFilter(query: any) {
  return query.in("status", publicStatuses);
}

export async function getPublicBusinessStats() {
  return fallbackPublicBusinessStats;
}

export async function getBusinesses(category: CategorySlug): Promise<Business[]> {
  const fallback = emptyWhenUnconfigured<Business[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  const businessCategories = getBusinessCategoriesForListing(category);
  const { data, error } = await publicStatusFilter(
    supabase
      .from("businesses")
      .select(businessListingSelect)
      .in("category", businessCategories)
      .order("is_featured", { ascending: false })
      .order("authority_score", { ascending: false, nullsFirst: false })
      .order("reviews_count", { ascending: false, nullsFirst: false })
      .limit(publicListingMaxRows)
  );
  if (error) throw error;

  return mapBusinesses(((data ?? []) as BusinessRow[]).filter((row) => businessMatchesListingCategory(row, category)));
}

function mapMiniRankingBusiness(row: Pick<BusinessRow, "id" | "slug" | "name" | "display_name" | "category" | "short_description" | "description" | "area" | "city" | "image" | "primary_image_url" | "gallery_image_urls" | "rating" | "reviews_count" | "updated_at">): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    displayName: row.display_name ?? undefined,
    category: row.category,
    shortDescription: row.short_description,
    description: row.description,
    area: row.area,
    city: row.city ?? undefined,
    image: row.image ?? undefined,
    primaryImageUrl: row.primary_image_url ?? undefined,
    galleryImageUrls: row.gallery_image_urls ?? undefined,
    tags: [],
    bestFor: [],
    faqs: [],
    seo: normalizeSeo(null, `${row.display_name || row.name} | ${siteConfig.name}`, row.short_description),
    updatedAt: row.updated_at,
    rating: row.rating ?? undefined,
    reviewsCount: row.reviews_count ?? undefined
  };
}

type FacetScanBusinessRow = Pick<
  BusinessRow,
  | "id"
  | "slug"
  | "name"
  | "original_name"
  | "display_name"
  | "category"
  | "short_description"
  | "description"
  | "area"
  | "city"
  | "municipality"
  | "website_type"
  | "tags"
  | "best_for"
  | "ideal_for"
  | "raw_google_place"
  | "category_attributes"
  | "updated_at"
>;

function mapFacetScanBusiness(row: FacetScanBusinessRow): Business {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    originalName: row.original_name ?? undefined,
    displayName: row.display_name ?? undefined,
    category: row.category,
    shortDescription: row.short_description,
    description: row.description,
    area: row.area,
    city: row.city ?? undefined,
    municipality: row.municipality ?? undefined,
    websiteType: row.website_type ?? undefined,
    tags: row.tags ?? [],
    bestFor: row.best_for ?? [],
    idealFor: row.ideal_for ?? undefined,
    rawGooglePlace: row.raw_google_place ?? undefined,
    categoryAttributes: parseCategoryAttributes(row.category, row.category_attributes),
    faqs: [],
    seo: normalizeSeo(null, `${row.display_name || row.name} | ${siteConfig.name}`, row.short_description),
    updatedAt: row.updated_at
  };
}

function ratioScore(row: Pick<BusinessRow, "rating" | "reviews_count">) {
  return (row.rating ?? 0) * Math.log((row.reviews_count ?? 0) + 1);
}

export async function getHomepageMiniRankingBusinesses(category: CategorySlug, limit = 5, area?: string, minReviews?: number): Promise<Business[]> {
  const fallback = emptyWhenUnconfigured<Business[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  let query = publicStatusFilter(
    supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,short_description,description,area,city,image,primary_image_url,gallery_image_urls,rating,reviews_count,updated_at")
      .eq("category", getBusinessCategoryFromSlug(category))
      .not("rating", "is", null)
      .not("reviews_count", "is", null)
      .order("rating", { ascending: false })
      .order("reviews_count", { ascending: false })
      .limit(Math.max(limit * 6, limit))
  );

  if (area) query = query.or(`city.ilike.%${area}%,area.ilike.%${area}%`);
  if (minReviews) query = query.gte("reviews_count", minReviews);

  const { data, error } = await query;
  if (error) throw error;

  return ((data ?? []) as Array<Pick<BusinessRow, "id" | "slug" | "name" | "display_name" | "category" | "short_description" | "description" | "area" | "city" | "image" | "primary_image_url" | "gallery_image_urls" | "rating" | "reviews_count" | "updated_at">>)
    .sort((a, b) => {
      const ratioDiff = ratioScore(b) - ratioScore(a);
      if (ratioDiff !== 0) return ratioDiff;
      return (b.reviews_count ?? 0) - (a.reviews_count ?? 0);
    })
    .slice(0, limit)
    .map(mapMiniRankingBusiness);
}

export async function getBusinessesForFacetScan(category: CategorySlug): Promise<Business[]> {
  const fallback = emptyWhenUnconfigured<Business[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  const businessCategories = getBusinessCategoriesForListing(category);
  const { data, error } = await publicStatusFilter(
    supabase
      .from("businesses")
      .select("id,slug,name,original_name,display_name,category,short_description,description,area,city,municipality,website_type,tags,best_for,ideal_for,updated_at")
      .in("category", businessCategories)
  );
  if (error) throw error;
  return ((data ?? []) as FacetScanBusinessRow[])
    .filter((row) => businessMatchesListingCategory(row, category))
    .map(mapFacetScanBusiness);
}

function sortByAuthority(businesses: Business[]) {
  return businesses.sort((a, b) => {
    const authorityA = a.authorityScore ?? 0;
    const authorityB = b.authorityScore ?? 0;
    if (authorityA !== authorityB) return authorityB - authorityA;
    const reviewsA = a.reviewsCount ?? 0;
    const reviewsB = b.reviewsCount ?? 0;
    return reviewsB - reviewsA;
  });
}

function businessRankingScore(business: Pick<Business, "rating" | "reviewsCount">) {
  return (business.rating ?? 0) * Math.log((business.reviewsCount ?? 0) + 1);
}

function sortByRankingScore(businesses: Business[]) {
  return businesses.slice().sort((a, b) => {
    const scoreDiff = businessRankingScore(b) - businessRankingScore(a);
    if (scoreDiff !== 0) return scoreDiff;
    return (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
  });
}

function businessRankingArea(business: Pick<Business, "city" | "area" | "municipality">) {
  return business.city || business.area || business.municipality || "Mallorca";
}

export type BusinessRankingPlacement = {
  scope: "local" | "island";
  area: string;
  areaSlug: string;
  category: CategorySlug;
  position: number;
  total: number;
};

export type BusinessRankingContext = {
  primary?: BusinessRankingPlacement;
  local?: BusinessRankingPlacement;
  island?: BusinessRankingPlacement;
};

export async function getBusinessRankingContext(business: Business, category: CategorySlug, minLocalBusinesses = 3): Promise<BusinessRankingContext> {
  const businesses = sortByRankingScore(await getBusinesses(category));
  const islandIndex = businesses.findIndex((item) => item.id === business.id);
  const island =
    islandIndex >= 0
      ? {
          scope: "island" as const,
          area: "Mallorca",
          areaSlug: "mallorca",
          category,
          position: islandIndex + 1,
          total: businesses.length
        }
      : undefined;

  const localArea = businessRankingArea(business);
  const localAreaSlug = toSlug(localArea);
  const localBusinesses =
    localAreaSlug && localAreaSlug !== "mallorca"
      ? businesses.filter((item) => toSlug(businessRankingArea(item)) === localAreaSlug)
      : [];
  const localIndex = localBusinesses.findIndex((item) => item.id === business.id);
  const local =
    localBusinesses.length >= minLocalBusinesses && localIndex >= 0
      ? {
          scope: "local" as const,
          area: localArea,
          areaSlug: localAreaSlug,
          category,
          position: localIndex + 1,
          total: localBusinesses.length
        }
      : undefined;

  return {
    primary: local ?? island,
    local,
    island
  };
}

export async function getTopBusinessesByCategory(category: CategorySlug, limit = 40): Promise<Business[]> {
  const businesses = await getBusinesses(category);
  return sortByAuthority(businesses).slice(0, limit);
}

export async function getTopBusinessesByFacet(category: CategorySlug, facetSlug: string, limit = 40): Promise<Business[]> {
  const facet = getFacet(category, facetSlug);
  if (!facet) return [];
  const businesses = await getBusinesses(category);
  return sortByAuthority(filterBusinessesByFacet(businesses, facet)).slice(0, limit);
}

export async function getBusinessesByAreaAndCategory(areaSlug: string, category: CategorySlug): Promise<{ areaName: string; businesses: Business[] }> {
  const businesses = await getBusinesses(category);
  const matching = businesses.filter((business) => {
    const area = business.city || business.area || "Mallorca";
    return toSlug(area) === areaSlug;
  });

  return {
    areaName: matching[0]?.city || matching[0]?.area || areaSlug.replace(/-/g, " "),
    businesses: sortByAuthority(matching)
  };
}

export async function getBusinessAreaCategoryPages(minBusinesses = 3): Promise<Array<{ area: string; areaSlug: string; category: CategorySlug; count: number }>> {
  const fallback = emptyWhenUnconfigured<Array<{ area: string; areaSlug: string; category: CategorySlug; count: number }>>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  const { data, error } = await publicStatusFilter(supabase.from("businesses").select("area,city,category"));
  if (error) throw error;

  const counts = new Map<string, { area: string; areaSlug: string; category: CategorySlug; count: number }>();
  for (const row of data as Pick<BusinessRow, "area" | "city" | "category">[]) {
    const area = row.city || row.area || "Mallorca";
    const category = getCategorySlugFromBusiness(row.category);
    const areaSlug = toSlug(area);
    const key = `${areaSlug}:${category}`;
    const current = counts.get(key) ?? { area, areaSlug, category, count: 0 };
    current.count += 1;
    counts.set(key, current);
  }

  return Array.from(counts.values())
    .filter((item) => item.count >= minBusinesses)
    .sort((a, b) => b.count - a.count);
}

export async function getFeaturedBusinesses(limit = 6): Promise<Business[]> {
  const fallback = emptyWhenUnconfigured<Business[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  const { data, error } = await publicStatusFilter(
    supabase.from("businesses").select("*").order("is_featured", { ascending: false }).order("commercial_priority", { ascending: false }).order("updated_at", { ascending: false }).limit(limit)
  );
  if (error) throw error;
  return mapBusinesses(data as BusinessRow[]);
}

export async function getBusinessBySlug(category: CategorySlug, slug: string): Promise<Business | undefined> {
  const fallback = emptyWhenUnconfigured<undefined>(undefined);
  if (fallback === undefined && !hasSupabaseConfig()) return undefined;

  const supabase = createSupabaseServerClient();
  const { data, error } = await publicStatusFilter(
    supabase.from("businesses").select("*").eq("category", getBusinessCategoryFromSlug(category)).eq("slug", slug).limit(1)
  ).maybeSingle();
  if (error) throw error;
  return data ? mapBusiness(data as BusinessRow) : undefined;
}

export async function getBusinessById(id: string): Promise<Business | undefined> {
  const fallback = emptyWhenUnconfigured<undefined>(undefined);
  if (fallback === undefined && !hasSupabaseConfig()) return undefined;

  const supabase = createSupabaseServerClient();
  const { data, error } = await publicStatusFilter(supabase.from("businesses").select("*").eq("id", id).limit(1)).maybeSingle();
  if (error) throw error;
  return data ? mapBusiness(data as BusinessRow) : undefined;
}

function relatedCategorySlugs(category: CategorySlug): CategorySlug[] {
  const groups: Partial<Record<CategorySlug, CategorySlug[]>> = {
    restaurants: ["bars", "cafes", "nightlife"],
    bars: ["restaurants", "cafes", "nightlife"],
    cafes: ["restaurants", "bakeries", "bars"],
    bakeries: ["cafes", "restaurants"],
    nightlife: ["bars", "restaurants"],
    hotels: ["restaurants", "beach-clubs", "spas", "activities"],
    "beach-clubs": ["restaurants", "beaches", "bars"],
    beaches: ["beach-clubs", "activities", "boats"],
    boats: ["activities", "beaches", "beach-clubs"],
    activities: ["excursions", "routes", "beaches", "boats"],
    excursions: ["activities", "routes"],
    routes: ["activities", "excursions", "beaches"],
    spas: ["hotels", "gyms", "healthcare"],
    gyms: ["spas", "healthcare"],
    healthcare: ["spas", "gyms"],
    "rent-a-car": ["activities", "hotels"],
    "car-dealers": ["rent-a-car"],
    "real-estate": []
  };

  return groups[category] ?? [];
}

function businessAreaKeys(business: Pick<Business, "area" | "city" | "municipality">) {
  return new Set([business.city, business.area, business.municipality].filter(Boolean).map((value) => toSlug(value as string)));
}

function relatedBusinessScore(target: Business, candidate: Business, relatedCategories: Set<BusinessCategory>) {
  const targetAreas = businessAreaKeys(target);
  const candidateAreas = businessAreaKeys(candidate);
  const sameArea = [...candidateAreas].some((area) => targetAreas.has(area));
  const sameCategory = candidate.category === target.category;
  const relatedCategory = relatedCategories.has(candidate.category);

  let score = 0;
  if (sameCategory && sameArea) score += 1000;
  else if (relatedCategory && sameArea) score += 800;
  else if (sameArea) score += 650;
  else if (sameCategory) score += 450;
  else if (relatedCategory) score += 250;

  if (candidate.isFeatured) score += 25;
  score += (candidate.authorityScore ?? 0) / 10;
  score += businessRankingScore(candidate);
  return score;
}

export async function getRelatedBusinesses(business: Business, limit = 3): Promise<Business[]> {
  const fallback = emptyWhenUnconfigured<Business[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  const category = getCategorySlugFromBusiness(business.category);
  const relatedCategories = new Set(relatedCategorySlugs(category).map(getBusinessCategoryFromSlug));
  const areaValues = [business.city, business.area, business.municipality].filter(Boolean) as string[];
  const categoryValues = [business.category, ...relatedCategories];
  const candidates = new Map<string, BusinessRow>();

  const addRows = (rows: BusinessRow[] | null) => {
    for (const row of rows ?? []) {
      if (row.id !== business.id) candidates.set(row.id, row);
    }
  };

  const sameCategoryQuery = publicStatusFilter(
    supabase
      .from("businesses")
      .select(businessListingSelect)
      .neq("id", business.id)
      .eq("category", business.category)
      .order("is_featured", { ascending: false })
      .order("authority_score", { ascending: false, nullsFirst: false })
      .limit(Math.max(limit * 12, 24))
  );

  const relatedCategoryQuery = categoryValues.length > 1
    ? publicStatusFilter(
        supabase
          .from("businesses")
          .select(businessListingSelect)
          .neq("id", business.id)
          .in("category", categoryValues)
          .order("is_featured", { ascending: false })
          .order("authority_score", { ascending: false, nullsFirst: false })
          .limit(Math.max(limit * 12, 24))
      )
    : Promise.resolve({ data: [], error: null });

  const areaQueries = areaValues.flatMap((area) =>
    (["area", "city", "municipality"] as const).map((field) =>
      publicStatusFilter(
        supabase
          .from("businesses")
          .select(businessListingSelect)
          .neq("id", business.id)
          .eq(field, area)
          .in("category", categoryValues)
          .order("is_featured", { ascending: false })
          .order("authority_score", { ascending: false, nullsFirst: false })
          .limit(Math.max(limit * 12, 24))
      )
    )
  );

  const results = await Promise.all([sameCategoryQuery, relatedCategoryQuery, ...areaQueries]);
  for (const result of results) {
    if (result.error) throw result.error;
    addRows(result.data as BusinessRow[]);
  }

  return mapBusinesses(Array.from(candidates.values()))
    .sort((a, b) => relatedBusinessScore(business, b, relatedCategories) - relatedBusinessScore(business, a, relatedCategories))
    .slice(0, limit);
}

export async function getBusinessSlugsByCategory(category: CategorySlug): Promise<{ slug: string }[]> {
  const fallback = emptyWhenUnconfigured<{ slug: string }[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  const { data, error } = await publicStatusFilter(supabase.from("businesses").select("slug").eq("category", getBusinessCategoryFromSlug(category)));
  if (error) throw error;
  return data ?? [];
}

export async function getRankings(locale?: Locale, limit?: number): Promise<Ranking[]> {
  const fallback = emptyWhenUnconfigured<Ranking[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  let query = publicStatusFilter(
    supabase
      .from("rankings")
      .select("*, ranking_items(*)")
      .order("is_featured", { ascending: false })
      .order("updated_at", { ascending: false })
  );
  if (locale) query = query.eq("locale", locale);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data as RankingRow[]).map(mapRanking);
}

export async function getRankingBySlug(slug: string, locale: Locale): Promise<Ranking | undefined> {
  const fallback = emptyWhenUnconfigured<undefined>(undefined);
  if (fallback === undefined && !hasSupabaseConfig()) return undefined;

  const supabase = createSupabaseServerClient();
  const { data, error } = await publicStatusFilter(supabase.from("rankings").select("*, ranking_items(*)").eq("slug", slug).eq("locale", locale).limit(1)).maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  const ranking = mapRanking(data as RankingRow);
  return isPublicCategorySlug(ranking.category) ? ranking : undefined;
}

export async function getRelatedRankings(category: CategorySlug | RankingCategory, limit = 3): Promise<Ranking[]> {
  const fallback = emptyWhenUnconfigured<Ranking[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  const { data, error } = await publicStatusFilter(supabase.from("rankings").select("*, ranking_items(*)").eq("category", category).order("updated_at", { ascending: false }).limit(limit));
  if (error) throw error;
  return (data as RankingRow[]).map(mapRanking);
}

export async function getRankingSlugs(): Promise<{ slug: string }[]> {
  const fallback = emptyWhenUnconfigured<{ slug: string }[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  const { data, error } = await publicStatusFilter(supabase.from("rankings").select("slug"));
  if (error) throw error;
  return data ?? [];
}

export async function getGuides(locale?: Locale, limit?: number, excludeSource?: string): Promise<Guide[]> {
  const fallback = emptyWhenUnconfigured<Guide[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  let query = publicStatusFilter(supabase.from("guides").select("*").order("is_featured", { ascending: false }).order("updated_at", { ascending: false }));
  if (locale) query = query.eq("locale", locale);
  if (excludeSource) query = query.neq("source", excludeSource);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data as GuideRow[]).map(mapGuide);
}

export async function getGuideBySlug(slug: string, locale: Locale): Promise<Guide | undefined> {
  const fallback = emptyWhenUnconfigured<undefined>(undefined);
  if (fallback === undefined && !hasSupabaseConfig()) return undefined;

  const supabase = createSupabaseServerClient();
  const { data, error } = await publicStatusFilter(supabase.from("guides").select("*").eq("slug", slug).eq("locale", locale).limit(1)).maybeSingle();
  if (error) throw error;
  return data ? mapGuide(data as GuideRow) : undefined;
}

export async function getRelatedGuides(areaSlug: string | null, categoryKeywords: string[], locale: Locale, limit = 3): Promise<Guide[]> {
  const fallback = emptyWhenUnconfigured<Guide[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();

  // Build ilike conditions: area slug + category keywords, searched in title and slug
  const terms: string[] = [];
  if (areaSlug) {
    const area = areaSlug.replace(/-/g, " ");
    terms.push(`title.ilike.%${area}%`, `slug.ilike.%${areaSlug}%`);
  }
  for (const kw of categoryKeywords) {
    terms.push(`title.ilike.%${kw}%`, `slug.ilike.%${kw}%`);
  }

  if (!terms.length) return [];

  const { data, error } = await publicStatusFilter(
    supabase.from("guides").select("*").eq("locale", locale).or(terms.join(",")).order("is_featured", { ascending: false }).limit(limit)
  );
  if (error) return [];
  return (data as GuideRow[]).map(mapGuide);
}

export async function getGuideSlugs(): Promise<{ slug: string }[]> {
  const fallback = emptyWhenUnconfigured<{ slug: string }[]>([]);
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  const { data, error } = await publicStatusFilter(supabase.from("guides").select("slug"));
  if (error) throw error;
  return data ?? [];
}

export async function getSitemapEntities() {
  const fallback = emptyWhenUnconfigured<{
    businesses: Array<{ slug: string; category: BusinessCategory; updatedAt: string }>;
    rankings: Array<{ slug: string; locale: Locale; category: RankingCategory; updatedAt: string }>;
    guides: Array<{ slug: string; updatedAt: string }>;
  }>({ businesses: [], rankings: [], guides: [] });
  if (fallback) return fallback;

  const supabase = createSupabaseServerClient();
  const [businessesResult, rankingsResult, guidesResult] = await Promise.all([
    publicStatusFilter(supabase.from("businesses").select("slug,category,updated_at")),
    publicStatusFilter(supabase.from("rankings").select("slug,locale,category,updated_at")),
    publicStatusFilter(supabase.from("guides").select("slug,updated_at"))
  ]);

  if (businessesResult.error) throw businessesResult.error;
  if (rankingsResult.error) throw rankingsResult.error;
  if (guidesResult.error) throw guidesResult.error;

  return {
    businesses: ((businessesResult.data ?? []) as Array<{ slug: string; category: BusinessCategory; updated_at: string }>).map((row) => ({
      slug: row.slug,
      category: row.category,
      updatedAt: row.updated_at
    })),
    rankings: ((rankingsResult.data ?? []) as Array<{ slug: string; locale: Locale; category: RankingCategory; updated_at: string }>)
      .filter((row) => isPublicCategorySlug(row.category))
      .map((row) => ({
      slug: row.slug,
      locale: row.locale,
      category: row.category,
      updatedAt: row.updated_at
    })),
    guides: ((guidesResult.data ?? []) as Array<{ slug: string; updated_at: string }>).map((row) => ({
      slug: row.slug,
      updatedAt: row.updated_at
    }))
  };
}
