import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { calculateAuthorityScore, createSocialProfiles, detectWebsiteType, inferLocationFromAddress } from "../src/lib/business-geo";

const PREVIEW_PATH = "data/import-previews/boats-preview.json";

type PreviewPlace = {
  google_place_id?: string | null;
  name?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  website?: string | null;
  phone?: string | null;
  google_maps_url?: string | null;
  primary_type?: string | null;
  types?: string[];
  raw_google_place?: Record<string, unknown>;
  primary_photo_name?: string | null;
  photo_names?: string[];
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

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getPhotoNames(place: PreviewPlace) {
  const rawPhotos = place.raw_google_place?.photos;
  const photos = Array.isArray(rawPhotos) ? rawPhotos : [];
  const rawPhotoNames = photos.map((photo) => (typeof photo === "object" && photo && "name" in photo ? String(photo.name) : null)).filter(Boolean) as string[];

  if (place.photo_names?.length) return place.photo_names;
  return rawPhotoNames;
}

function getShortDescription(place: NormalizedPlace) {
  const location = inferLocationFromAddress(place.address);
  if (location.area && location.area !== "Mallorca") {
    return `${place.name} es una empresa de alquiler de barcos o charter en ${location.area} importada desde Google Places para revisiÃ³n editorial.`;
  }

  return `${place.name} es una empresa de alquiler de barcos o charter en Mallorca importada desde Google Places para revisiÃ³n editorial.`;
}

type NormalizedPlace = {
  google_place_id: string;
  name: string;
  category: "boat-rental";
  rating: number | null;
  reviews_count: number | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  phone: string | null;
  google_maps_url: string | null;
  primary_type: string | null;
  types: string[];
  raw_google_place: Record<string, unknown>;
  primary_photo_name: string | null;
  photo_names: string[] | null;
};

function normalizePlace(place: PreviewPlace): NormalizedPlace | null {
  if (!place.google_place_id || !place.name) return null;

  const photoNames = getPhotoNames(place);

  return {
    google_place_id: place.google_place_id,
    name: place.name,
    category: "boat-rental",
    rating: place.rating ?? null,
    reviews_count: place.reviews_count ?? null,
    address: place.address ?? null,
    latitude: place.latitude ?? null,
    longitude: place.longitude ?? null,
    website: place.website ?? null,
    phone: place.phone ?? null,
    google_maps_url: place.google_maps_url ?? null,
    primary_type: place.primary_type ?? null,
    types: Array.isArray(place.types) ? place.types : [],
    raw_google_place: place.raw_google_place ?? (place as Record<string, unknown>),
    primary_photo_name: place.primary_photo_name ?? photoNames[0] ?? null,
    photo_names: photoNames.length ? photoNames : null
  };
}

async function getUniqueSlug(supabase: any, baseSlug: string, googlePlaceId: string) {
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, google_place_id")
      .eq("category", "boat-rental")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) throw error;
    const existing = data as { google_place_id: string | null } | null;
    if (!existing || existing.google_place_id === googlePlaceId) return candidate;

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function buildEnrichment(place: NormalizedPlace) {
  const websiteType = detectWebsiteType(place.website);
  const location = inferLocationFromAddress(place.address);
  const authorityScore = calculateAuthorityScore(place);

  return {
    area: location.area,
    city: location.city ?? null,
    municipality: location.municipality ?? null,
    island: "Mallorca",
    website_type: websiteType,
    social_profiles: createSocialProfiles(place.website, websiteType),
    authority_score: authorityScore,
    geo_score: authorityScore
  };
}

async function main() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  if (!existsSync(PREVIEW_PATH)) {
    throw new Error(`Missing preview file: ${PREVIEW_PATH}. Run npm run places:preview:boats first.`);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error: schemaError } = await supabase
    .from("businesses")
    .select("primary_type,primary_photo_name,photo_names,city,municipality,island,website_type,social_profiles,authority_score,geo_score,editorial_status")
    .limit(1);

  if (schemaError) {
    throw new Error(`Missing Google Places/GEO columns. Apply supabase/migrations/002_business_google_photos.sql and supabase/migrations/004_business_location_and_geo_fields.sql before importing. Details: ${schemaError.message}`);
  }

  const preview = JSON.parse(readFileSync(PREVIEW_PATH, "utf8")) as PreviewPlace[];
  const unique = new Map<string, NormalizedPlace>();
  let duplicateRowsIgnored = 0;

  for (const item of preview) {
    const place = normalizePlace(item);
    if (!place) continue;
    if (unique.has(place.google_place_id)) {
      duplicateRowsIgnored += 1;
      continue;
    }
    unique.set(place.google_place_id, place);
  }

  let inserted = 0;
  let updated = 0;

  for (const place of unique.values()) {
    const enrichment = buildEnrichment(place);
    const { data: existing, error: existingError } = await supabase
      .from("businesses")
      .select("id, slug")
      .eq("google_place_id", place.google_place_id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const { error } = await supabase
        .from("businesses")
        .update({
          rating: place.rating,
          reviews_count: place.reviews_count,
          website: place.website,
          phone: place.phone,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude,
          google_maps_url: place.google_maps_url,
          primary_type: place.primary_type,
          raw_google_place: place.raw_google_place,
          primary_photo_name: place.primary_photo_name,
          photo_names: place.photo_names,
          ...enrichment,
          imported_at: new Date().toISOString()
        })
        .eq("id", existing.id);

      if (error) throw error;
      updated += 1;
      continue;
    }

    const baseSlug = toSlug(place.name);
    const slug = await getUniqueSlug(supabase, baseSlug, place.google_place_id);
    const shortDescription = getShortDescription(place);

    const { error } = await supabase.from("businesses").insert({
      id: `google-${place.google_place_id}`,
      slug,
      name: place.name,
      category: "boat-rental",
      short_description: shortDescription,
      description: "",
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      website: place.website,
      instagram: null,
      phone: place.phone,
      price_level: null,
      tags: place.types,
      best_for: [],
      image: "/images/boat.svg",
      gallery: [],
      opening_hours: null,
      faqs: [],
      seo: {
        title: `${place.name}: alquiler de barcos en Mallorca | Mallorca Verified`,
        description: shortDescription
      },
      updated_at: new Date().toISOString().slice(0, 10),
      google_place_id: place.google_place_id,
      rating: place.rating,
      reviews_count: place.reviews_count,
      google_maps_url: place.google_maps_url,
      primary_type: place.primary_type,
      source: "google_places",
      status: "draft",
      commercial_priority: "high",
      client_potential: "high",
      is_featured: false,
      is_claimed: false,
      raw_google_place: place.raw_google_place,
      primary_photo_name: place.primary_photo_name,
      photo_names: place.photo_names,
      editorial_status: "raw",
      ...enrichment,
      imported_at: new Date().toISOString()
    });

    if (error) throw error;
    inserted += 1;
  }

  const { count, error: countError } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("category", "boat-rental");

  if (countError) throw countError;

  const { data: topBoats, error: topError } = await supabase
    .from("businesses")
    .select("id,name,authority_score,rating,reviews_count,website,phone")
    .eq("category", "boat-rental")
    .order("authority_score", { ascending: false, nullsFirst: false })
    .limit(10);

  if (topError) throw topError;

  console.log(
    JSON.stringify(
      {
        inserted,
        updated,
        duplicate_rows_ignored: duplicateRowsIgnored,
        total_businesses_boat_rental: count,
        top_10_boats_by_authority_score: topBoats ?? []
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
