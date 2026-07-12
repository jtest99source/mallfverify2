import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { cleanBusinessDisplayName, normalizeBusinessName } from "../src/lib/business-name-normalizer";
import { calculateAuthorityScore, createSocialProfiles, detectWebsiteType, inferLocationFromAddress, isWithinMallorca } from "../src/lib/business-geo";

const PREVIEW_PATH = "data/import-previews/activities-preview.json";

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

type NormalizedPlace = {
  google_place_id: string;
  name: string;
  category: "activity";
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
  if (place.photo_names?.length) return place.photo_names;

  const rawPhotos = place.raw_google_place?.photos;
  const photos = Array.isArray(rawPhotos) ? rawPhotos : [];
  return photos
    .map((photo) => (typeof photo === "object" && photo && "name" in photo ? String(photo.name) : null))
    .filter(Boolean) as string[];
}

function normalizePlace(place: PreviewPlace): NormalizedPlace | null {
  if (!place.google_place_id || !place.name) return null;
  const photoNames = getPhotoNames(place);

  return {
    google_place_id: place.google_place_id,
    name: place.name,
    category: "activity",
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
  let candidate = baseSlug || googlePlaceId.toLowerCase();
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, google_place_id")
      .eq("category", "activity")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) throw error;
    const existing = data as { google_place_id: string | null } | null;
    if (!existing || existing.google_place_id === googlePlaceId) return candidate;

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function publicName(place: NormalizedPlace) {
  return cleanBusinessDisplayName(place.name);
}

function getShortDescription(place: NormalizedPlace) {
  const location = inferLocationFromAddress(place.address);
  const name = publicName(place);
  if (location.area && location.area !== "Mallorca") {
    return `${name} es una actividad turistica en ${location.area} importada desde Google Places para revision editorial.`;
  }

  return `${name} es una actividad turistica en Mallorca importada desde Google Places para revision editorial.`;
}

function reputationPhrase(place: NormalizedPlace) {
  if (typeof place.rating !== "number" || typeof place.reviews_count !== "number") {
    return "Su reputacion publica todavia necesita mas contexto editorial.";
  }

  if (place.rating >= 4.7 && place.reviews_count >= 500) {
    return `Destaca por una reputacion muy solida: ${place.rating} sobre 5 y ${place.reviews_count} resenas.`;
  }

  if (place.rating >= 4.4) {
    return `Mantiene valoraciones altas, con ${place.rating} sobre 5 y ${place.reviews_count} resenas.`;
  }

  return `Cuenta con ${place.rating} sobre 5 y ${place.reviews_count} resenas, una base util para valorar su trayectoria.`;
}

function buildAiContent(place: NormalizedPlace) {
  const name = publicName(place);
  const location = inferLocationFromAddress(place.address).area;
  const types = place.types
    .map((type) => type.replace(/_/g, " "))
    .filter((type) => !["point of interest", "establishment", "travel agency", "tourist attraction"].includes(type))
    .slice(0, 2);
  const specialty = types.length ? types.join(" y ") : "experiencias y excursiones en Mallorca";

  return {
    ai_description: `${name} es una actividad turistica ubicada en ${location}. Su perfil encaja con ${specialty}, dentro de una propuesta pensada para visitantes que quieren descubrir Mallorca de forma activa. ${reputationPhrase(place)}`,
    ideal_for: ["excursiones en Mallorca", "viajeros activos", "experiencias con referencias publicas"],
    what_to_expect: `${name} ofrece una referencia de actividad turistica en ${location}, con datos practicos para valorar ubicacion, reputacion y canales de contacto. Revisa la web o Google Maps para confirmar horarios, disponibilidad y condiciones actuales.`,
    review_summary: `${name} figura como actividad turistica en ${location}. ${reputationPhrase(place)}`,
    faq_auto: [
      {
        question: `Que tipo de actividad es ${name}?`,
        answer: `${name} aparece clasificada como actividad turistica en ${location}, segun los datos publicos importados.`
      },
      {
        question: `Donde esta ${name}?`,
        answer: `${name} esta situada en ${location}, Mallorca.`
      },
      {
        question: `Tiene valoraciones publicas ${name}?`,
        answer:
          typeof place.rating === "number" && typeof place.reviews_count === "number"
            ? `Si. Figura con ${place.rating} sobre 5 y ${place.reviews_count} resenas.`
            : "La ficha no tiene aun rating y volumen de resenas suficientes."
      }
    ]
  };
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
    throw new Error(`Missing preview file: ${PREVIEW_PATH}. Run npm run places:preview:activities first.`);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error: schemaError } = await supabase
    .from("businesses")
    .select("primary_type,primary_photo_name,photo_names,city,municipality,island,website_type,social_profiles,authority_score,geo_score,original_name,display_name,name_quality_status,ideal_for,what_to_expect,faq_auto")
    .limit(1);

  if (schemaError) {
    throw new Error(`Missing activity import columns. Apply migrations 002, 004, 005 and 006 before importing. Details: ${schemaError.message}`);
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
    // Geo-fence: never import places whose coordinates fall outside Mallorca.
    if (!isWithinMallorca(place.latitude, place.longitude)) {
      console.log(`  ⨯ skipped (outside Mallorca): ${place.name} — ${place.address ?? "no address"}`);
      continue;
    }

    const enrichment = buildEnrichment(place);
    const nameFields = normalizeBusinessName({ name: place.name });
    const aiContent = buildAiContent(place);

    const { data: existing, error: existingError } = await supabase
      .from("businesses")
      .select("id, slug, original_name, editorial_description")
      .eq("google_place_id", place.google_place_id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      const existingRow = existing as { id: string; original_name: string | null; editorial_description: string | null };
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
          original_name: existingRow.original_name || nameFields.original_name,
          display_name: nameFields.display_name,
          name_quality_status: nameFields.name_quality_status,
          ...enrichment,
          ...aiContent,
          imported_at: new Date().toISOString()
        })
        .eq("id", existingRow.id);

      if (error) throw error;
      updated += 1;
      continue;
    }

    const baseSlug = toSlug(place.name);
    const slug = await getUniqueSlug(supabase, baseSlug, place.google_place_id);
    const shortDescription = getShortDescription(place);
    const displayName = nameFields.display_name;

    const { error } = await supabase.from("businesses").insert({
      id: `google-${place.google_place_id}`,
      slug,
      name: place.name,
      original_name: nameFields.original_name,
      display_name: displayName,
      name_quality_status: nameFields.name_quality_status,
      category: "activity",
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
      image: "/images/activity.svg",
      gallery: [],
      opening_hours: null,
      faqs: [],
      seo: {
        title: `${displayName}: actividad en Mallorca | Mallorca Verified`,
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
      editorial_status: "ai_generated",
      ...enrichment,
      ...aiContent,
      imported_at: new Date().toISOString()
    });

    if (error) throw error;
    inserted += 1;
  }

  const { count, error: countError } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("category", "activity");

  if (countError) throw countError;

  const { data: topActivities, error: topError } = await supabase
    .from("businesses")
    .select("id,name,display_name,authority_score,rating,reviews_count,website")
    .eq("category", "activity")
    .order("authority_score", { ascending: false, nullsFirst: false })
    .limit(10);

  if (topError) throw topError;

  console.log(
    JSON.stringify(
      {
        inserted,
        updated,
        duplicate_rows_ignored: duplicateRowsIgnored,
        total_businesses_activity: count,
        top_10_activities_by_authority_score: topActivities ?? []
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
