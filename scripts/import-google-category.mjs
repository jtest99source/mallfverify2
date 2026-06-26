import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { calculateAuthorityScore, createSocialProfiles, detectWebsiteType, inferLocationFromAddress } from "../src/lib/business-geo.ts";
import { getPlaceCategoryConfig } from "./place-category-config.mjs";

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

function argValue(name) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function argNumber(name) {
  const value = argValue(name);
  if (!value) return null;
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number) || number < 0) throw new Error(`Invalid --${name}=${value}`);
  return number;
}

function toSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getPhotoNames(place) {
  const photos = place.raw_google_place?.photos ?? place.photos ?? [];
  if (!Array.isArray(photos)) return [];
  return photos.map((photo) => photo.name).filter(Boolean);
}

function normalizePlace(place, config) {
  const photoNames = getPhotoNames(place);

  return {
    google_place_id: place.google_place_id ?? null,
    name: place.name ?? null,
    category: config.businessCategory,
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
    business_status: place.business_status ?? null,
    raw_google_place: place.raw_google_place ?? place,
    primary_photo_name: place.primary_photo_name ?? photoNames[0] ?? null,
    photo_names: photoNames.length ? photoNames : null
  };
}

async function getUniqueSlug(supabase, category, baseSlug, googlePlaceId) {
  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, google_place_id")
      .eq("category", category)
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

function getShortDescription(place, config) {
  const location = inferLocationFromAddress(place.address);
  const area = location.area && location.area !== "Mallorca" ? ` en ${location.area}` : " en Mallorca";
  return `${config.singular.charAt(0).toUpperCase()}${config.singular.slice(1)}${area} con datos de Google pendiente de revision editorial.`;
}

async function main() {
  loadLocalEnv();

  const category = argValue("category");
  if (!category) throw new Error("Missing --category. Example: npm run places:import:category -- --category=cafes");
  const limit = argNumber("limit");
  const offset = argNumber("offset") ?? 0;
  const skipCount = process.argv.includes("--skip-count");

  const config = getPlaceCategoryConfig(category);
  if (!existsSync(config.output)) {
    throw new Error(`Missing preview file: ${config.output}. Run npm run places:preview:category -- --category=${category} first.`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error: schemaError } = await supabase
    .from("businesses")
    .select("primary_type,primary_photo_name,photo_names,city,municipality,island,website_type,social_profiles,authority_score,geo_score")
    .limit(1);

  if (schemaError) {
    throw new Error(`Missing Google Places/GEO columns. Apply migrations before importing. Details: ${schemaError.message}`);
  }

  const preview = JSON.parse(readFileSync(config.output, "utf8"));
  const unique = new Map();
  let duplicateRowsIgnored = 0;
  let closedRowsIgnored = 0;

  for (const item of preview) {
    const place = normalizePlace(item, config);
    if (!place.google_place_id || !place.name) continue;
    if (place.business_status === "CLOSED_PERMANENTLY" || place.business_status === "CLOSED_TEMPORARILY") {
      closedRowsIgnored += 1;
      continue;
    }
    if (unique.has(place.google_place_id)) {
      duplicateRowsIgnored += 1;
      continue;
    }
    unique.set(place.google_place_id, place);
  }

  let inserted = 0;
  let updated = 0;

  const placesToImport = Array.from(unique.values()).slice(offset, limit ? offset + limit : undefined);

  for (const place of placesToImport) {
    const enrichment = buildEnrichment(place);
    const { data: existing, error: existingError } = await supabase
      .from("businesses")
      .select("id, slug")
      .eq("google_place_id", place.google_place_id)
      .maybeSingle();

    if (existingError) throw existingError;

    const sharedPayload = {
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
      tags: place.types,
      ...enrichment,
      imported_at: new Date().toISOString()
    };

    if (existing) {
      const { error } = await supabase.from("businesses").update(sharedPayload).eq("id", existing.id);
      if (error) throw error;
      updated += 1;
      continue;
    }

    const baseSlug = toSlug(place.name);
    const slug = await getUniqueSlug(supabase, config.businessCategory, baseSlug, place.google_place_id);
    const shortDescription = getShortDescription(place, config);

    const { error } = await supabase.from("businesses").insert({
      id: `google-${place.google_place_id}`,
      slug,
      name: place.name,
      category: config.businessCategory,
      short_description: shortDescription,
      description: "",
      ...sharedPayload,
      instagram: null,
      price_level: null,
      best_for: [],
      image: config.image,
      gallery: [],
      opening_hours: null,
      faqs: [],
      seo: {
        title: `${place.name}: ${config.singular} en Mallorca | Mallorca Verified`,
        description: shortDescription
      },
      updated_at: new Date().toISOString().slice(0, 10),
      google_place_id: place.google_place_id,
      source: "google_places",
      status: "draft",
      commercial_priority: "medium",
      client_potential: "medium",
      is_featured: false,
      is_claimed: false
    });

    if (error) throw error;
    inserted += 1;
  }

  let count = null;
  if (!skipCount) {
    const { count: categoryCount, error: countError } = await supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("category", config.businessCategory);

    if (countError) throw countError;
    count = categoryCount;
  }

  console.log(JSON.stringify({
    category,
    business_category: config.businessCategory,
    limit,
    offset,
    unique_preview_places: unique.size,
    attempted_this_run: placesToImport.length,
    inserted,
    updated,
    duplicate_rows_ignored: duplicateRowsIgnored,
    closed_rows_ignored: closedRowsIgnored,
    total_businesses_category: count
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
