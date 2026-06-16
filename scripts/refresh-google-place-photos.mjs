import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

const DEFAULT_LIMIT = 50;

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
  const options = { limit: DEFAULT_LIMIT, category: null };

  for (const arg of args) {
    if (arg.startsWith("--limit=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) options.limit = Math.min(value, 200);
    }
    if (arg.startsWith("--category=")) {
      options.category = arg.split("=")[1] || null;
    }
  }

  return options;
}

function getPhotoNames(photos) {
  if (!Array.isArray(photos)) return [];
  return photos.map((photo) => photo.name).filter(Boolean);
}

async function fetchPlacePhotos(apiKey, googlePlaceId) {
  const response = await fetch(`https://places.googleapis.com/v1/places/${googlePlaceId}`, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,photos"
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Places API error for ${googlePlaceId} (${response.status}): ${body}`);
  }

  return response.json();
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");
  if (!supabaseUrl || !supabaseKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error: schemaError } = await supabase.from("businesses").select("primary_photo_name,photo_names,raw_google_place").limit(1);
  if (schemaError) {
    throw new Error(`Missing photo columns. Apply supabase/migrations/002_business_google_photos.sql before refreshing photos. Details: ${schemaError.message}`);
  }

  let query = supabase
    .from("businesses")
    .select("id,name,category,google_place_id,raw_google_place")
    .eq("source", "google_places")
    .not("google_place_id", "is", null)
    .order("updated_at", { ascending: false })
    .limit(options.limit);

  if (options.category) query = query.eq("category", options.category);

  const { data: businesses, error } = await query;
  if (error) throw error;

  let updatedWithPhotos = 0;
  let withoutPhotos = 0;
  const errors = [];

  for (const business of businesses ?? []) {
    try {
      const place = await fetchPlacePhotos(apiKey, business.google_place_id);
      const photos = place.photos ?? [];
      const photoNames = getPhotoNames(photos);

      if (!photoNames.length) {
        withoutPhotos += 1;
        continue;
      }

      const rawGooglePlace = {
        ...(business.raw_google_place ?? {}),
        photos
      };

      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          primary_photo_name: photoNames[0],
          photo_names: photoNames,
          raw_google_place: rawGooglePlace
        })
        .eq("id", business.id);

      if (updateError) throw updateError;
      updatedWithPhotos += 1;
    } catch (error) {
      errors.push({
        id: business.id,
        name: business.name,
        google_place_id: business.google_place_id,
        error: error.message
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        businesses_revisados: businesses?.length ?? 0,
        businesses_actualizados_con_fotos: updatedWithPhotos,
        businesses_sin_fotos: withoutPhotos,
        errores: errors
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
