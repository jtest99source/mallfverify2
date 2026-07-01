import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase";
import type { BusinessCategory } from "@/types/business";
import type { RankingCategory } from "@/types/ranking";

export type EditorialImage = {
  imageKey: string;
  source: string;
  sourceId?: string;
  imageUrl: string;
  imageDownloadUrl?: string;
  photographerName?: string;
  photographerUrl?: string;
  alt?: string;
  query?: string;
  category?: string;
  attribution?: string;
};

type EditorialImageRow = {
  image_key: string;
  source: string;
  source_id: string | null;
  image_url: string;
  image_download_url: string | null;
  photographer_name: string | null;
  photographer_url: string | null;
  alt: string | null;
  query: string | null;
  category: string | null;
};

type UnsplashPhoto = {
  id: string;
  alt_description: string | null;
  description: string | null;
  urls: {
    regular?: string;
    full?: string;
    raw?: string;
  };
  links: {
    download_location?: string;
    html?: string;
  };
  user: {
    name?: string;
    links?: {
      html?: string;
    };
  };
};

const categoryImageKeys: Record<BusinessCategory, string> = {
  restaurant: "category_restaurant",
  hotel: "category_hotel",
  "beach-club": "category_beach_club",
  "boat-rental": "category_boat_rental",
  activity: "category_activity",
  beach: "category_beach",
  bar: "category_restaurant",
  cafe: "category_restaurant",
  nightlife: "category_activity",
  bakery: "category_restaurant",
  "rent-a-car": "category_activity",
  "car-dealer": "category_activity",
  spa: "category_hotel",
  gym: "category_activity",
  casino: "category_activity",
  veterinarian: "category_activity",
  healthcare: "category_hotel",
  "real-estate": "category_activity",
  market: "category_restaurant",
  "local-shop": "category_activity",
  museum: "category_activity",
  route: "category_beach",
  excursion: "category_activity"
};

const fallbackImageKeys: Record<BusinessCategory, string> = {
  restaurant: "fallback_restaurant",
  hotel: "fallback_hotel",
  "beach-club": "fallback_beach_club",
  "boat-rental": "fallback_boat_rental",
  activity: "fallback_activity",
  beach: "fallback_beach",
  bar: "fallback_restaurant",
  cafe: "fallback_restaurant",
  nightlife: "fallback_activity",
  bakery: "fallback_restaurant",
  "rent-a-car": "fallback_activity",
  "car-dealer": "fallback_activity",
  spa: "fallback_hotel",
  gym: "fallback_activity",
  casino: "fallback_activity",
  veterinarian: "fallback_activity",
  healthcare: "fallback_hotel",
  "real-estate": "fallback_activity",
  market: "fallback_restaurant",
  "local-shop": "fallback_activity",
  museum: "fallback_activity",
  route: "fallback_beach",
  excursion: "fallback_activity"
};

const rankingCategoryMap: Record<RankingCategory, BusinessCategory> = {
  restaurants: "restaurant",
  hotels: "hotel",
  "beach-clubs": "beach-club",
  boats: "boat-rental",
  activities: "activity",
  beaches: "beach",
  bars: "bar",
  cafes: "cafe",
  nightlife: "nightlife",
  bakeries: "bakery",
  "rent-a-car": "rent-a-car",
  "car-dealers": "car-dealer",
  spas: "spa",
  gyms: "gym",
  casinos: "casino",
  vets: "veterinarian",
  healthcare: "healthcare",
  "real-estate": "real-estate",
  markets: "market",
  "local-shops": "local-shop",
  museums: "museum",
  routes: "route",
  excursions: "excursion"
};

function editorialSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_+|_+$)/g, "")
    .slice(0, 80);
}

function mapEditorialImage(row: EditorialImageRow): EditorialImage {
  const attribution = row.photographer_name
    ? `Photo by ${row.photographer_name} on Unsplash`
    : undefined;

  return {
    imageKey: row.image_key,
    source: row.source,
    sourceId: row.source_id ?? undefined,
    imageUrl: row.image_url,
    imageDownloadUrl: row.image_download_url ?? undefined,
    photographerName: row.photographer_name ?? undefined,
    photographerUrl: row.photographer_url ?? undefined,
    alt: row.alt ?? undefined,
    query: row.query ?? undefined,
    category: row.category ?? undefined,
    attribution
  };
}

export async function searchUnsplashPhotos(query: string, limit = 1) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("Missing UNSPLASH_ACCESS_KEY. Add it to .env.local.");
  }

  const params = new URLSearchParams({
    query,
    per_page: String(Math.min(Math.max(limit, 1), 30)),
    orientation: "landscape",
    content_filter: "high"
  });

  const response = await fetch(`https://api.unsplash.com/search/photos?${params.toString()}`, {
    headers: {
      Authorization: `Client-ID ${accessKey}`
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Unsplash API error ${response.status}: ${body}`);
  }

  const data = await response.json() as { results?: UnsplashPhoto[] };
  return data.results ?? [];
}

export async function getEditorialImage(imageKey: string): Promise<EditorialImage | null> {
  if (!hasSupabaseConfig()) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("editorial_images")
    .select("*")
    .eq("image_key", imageKey)
    .maybeSingle();

  if (error) {
    if (error.message.includes("editorial_images")) return null;
    throw error;
  }

  return data ? mapEditorialImage(data as EditorialImageRow) : null;
}

export async function getEditorialImageForCategory(category: BusinessCategory) {
  return getEditorialImage(categoryImageKeys[category]);
}

export async function getEditorialFallbackImageForCategory(category: BusinessCategory) {
  return getEditorialImage(fallbackImageKeys[category]);
}

export async function getEditorialImageForGuide(title: string, category?: string) {
  const specific = await getEditorialImage(`guide_${editorialSlug(title)}`);
  if (specific) return specific;

  const normalized = (category || title).toLowerCase();
  if (normalized.includes("hotel")) return getEditorialImage("category_hotel");
  if (normalized.includes("barco") || normalized.includes("boat")) return getEditorialImage("category_boat_rental");
  if (normalized.includes("beach club")) return getEditorialImage("category_beach_club");
  if (normalized.includes("playa") || normalized.includes("cala") || normalized.includes("beach")) return getEditorialImage("category_beach");
  if (normalized.includes("actividad") || normalized.includes("activity")) return getEditorialImage("category_activity");
  if (normalized.includes("restaurante") || normalized.includes("restaurant")) return getEditorialImage("category_restaurant");
  return getEditorialImage("guide_default");
}

export async function getEditorialImageForRanking(title: string, category: RankingCategory) {
  const specific = await getEditorialImage(`ranking_${editorialSlug(title)}`);
  if (specific) return specific;

  const businessCategory = rankingCategoryMap[category];
  if (businessCategory) return getEditorialImageForCategory(businessCategory);
  return getEditorialImage("ranking_default");
}

export function editorialImageKeysForCategory(category: BusinessCategory) {
  return {
    category: categoryImageKeys[category],
    fallback: fallbackImageKeys[category]
  };
}

