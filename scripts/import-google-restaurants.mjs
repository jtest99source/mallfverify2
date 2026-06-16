import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { calculateAuthorityScore, createSocialProfiles, detectWebsiteType, inferLocationFromAddress } from "../src/lib/business-geo.ts";

const PREVIEW_PATH = "data/import-previews/restaurants-preview.json";

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

function toSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function cleanPriceLevel(value) {
  return value || null;
}

function getPhotoNames(place) {
  const photos = place.raw_google_place?.photos ?? place.photos ?? [];
  if (!Array.isArray(photos)) return [];
  return photos.map((photo) => photo.name).filter(Boolean);
}

function getPrimaryPhotoName(place) {
  return getPhotoNames(place)[0] ?? null;
}

function getShortDescription(place) {
  const location = inferLocationFromAddress(place.address);
  if (location.area && location.area !== "Mallorca") {
    return `Restaurante en ${location.area} con datos de Google pendiente de revisión editorial.`;
  }

  return "Restaurante en Mallorca con datos de Google pendiente de revisión editorial.";
}

function normalizePlace(place) {
  const photoNames = getPhotoNames(place);

  return {
    google_place_id: place.google_place_id ?? null,
    name: place.name ?? null,
    category: "restaurant",
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
    raw_google_place: place.raw_google_place ?? place,
    primary_photo_name: getPrimaryPhotoName(place),
    photo_names: photoNames.length ? photoNames : null
  };
}

async function getUniqueSlug(supabase, baseSlug, googlePlaceId) {
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, google_place_id")
      .eq("category", "restaurant")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) throw error;
    if (!data || data.google_place_id === googlePlaceId) return candidate;

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function buildEnrichment(place) {
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
    throw new Error(`Missing preview file: ${PREVIEW_PATH}. Run npm run places:preview:restaurants first.`);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error: schemaError } = await supabase
    .from("businesses")
    .select("primary_type,primary_photo_name,photo_names,city,municipality,island,website_type,social_profiles,authority_score,geo_score")
    .limit(1);

  if (schemaError) {
    throw new Error(`Missing Google Places/GEO columns. Apply supabase/migrations/002_business_google_photos.sql and supabase/migrations/004_business_location_and_geo_fields.sql before importing. Details: ${schemaError.message}`);
  }

  const preview = JSON.parse(readFileSync(PREVIEW_PATH, "utf8"));
  const unique = new Map();
  let duplicateRowsIgnored = 0;

  for (const item of preview) {
    const place = normalizePlace(item);
    if (!place.google_place_id || !place.name) continue;
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
      category: "restaurant",
      short_description: shortDescription,
      description: "",
      ...enrichment,
      address: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
      website: place.website,
      instagram: null,
      phone: place.phone,
      price_level: cleanPriceLevel(null),
      tags: place.types,
      best_for: [],
      image: "/images/restaurant.svg",
      gallery: [],
      opening_hours: null,
      faqs: [],
      seo: {
        title: `${place.name}: restaurante en Mallorca | Mallorca Verified`,
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
      commercial_priority: "medium",
      client_potential: "medium",
      is_featured: false,
      is_claimed: false,
      raw_google_place: place.raw_google_place,
      primary_photo_name: place.primary_photo_name,
      photo_names: place.photo_names,
      imported_at: new Date().toISOString()
    });

    if (error) throw error;
    inserted += 1;
  }

  const { count, error: countError } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("category", "restaurant");

  if (countError) throw countError;

  console.log(
    JSON.stringify(
      {
        inserted,
        updated,
        duplicate_rows_ignored: duplicateRowsIgnored,
        total_businesses_restaurant: count
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
