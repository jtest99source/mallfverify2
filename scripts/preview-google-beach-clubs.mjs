import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const MAX_RESULTS = 2000;
const OUTPUT_PATH = "data/import-previews/beach-clubs-preview.json";

const SEARCHES = [
  // Palma y alrededores
  "beach club Palma Mallorca",
  "beach club Illetas Mallorca",
  "beach club Cala Major Mallorca",
  "beach club Playa de Palma Mallorca",
  "beach club Portixol Mallorca",
  "beach club Portals Nous Mallorca",
  "beach club Puerto Portals Mallorca",

  // Suroeste
  "beach club Peguera Mallorca",
  "beach club Santa Ponsa Mallorca",
  "beach club Magaluf Mallorca",
  "beach club Palmanova Mallorca",
  "beach club Camp de Mar Mallorca",
  "beach club Port d'Andratx Mallorca",
  "beach club Sant Elm Mallorca",
  "beach club Andratx Mallorca",

  // Norte
  "beach club Alcudia Mallorca",
  "beach club Port d'Alcudia Mallorca",
  "beach club Playa de Muro Mallorca",
  "beach club Port de Pollenca Mallorca",
  "beach club Can Picafort Mallorca",

  // Este
  "beach club Cala Millor Mallorca",
  "beach club Cala Ratjada Mallorca",
  "beach club Porto Cristo Mallorca",
  "beach club Cala d'Or Mallorca",
  "beach club Portocolom Mallorca",
  "beach club Cala Bona Mallorca",
  "beach club Canyamel Mallorca",

  // Sur
  "beach club Colonia de Sant Jordi Mallorca",
  "beach club Cala Pi Mallorca",
  "beach club Llucmajor Mallorca",
  "beach club S'Arenal Mallorca",

  // Genérico
  "beach club Mallorca",
  "chiringuito playa Mallorca",
  "chiringuito Mallorca",
  "balneario playa Mallorca",
  "beach restaurant Mallorca",
  "seafront beach bar Mallorca",
  "sunset beach club Mallorca",

  // En español — chiringuitos y restaurantes de playa
  "chiringuito de lujo Mallorca",
  "restaurante en la playa Mallorca",
  "bar en la playa Mallorca",
  "cocina en la playa Mallorca",
  "paella en la playa Mallorca",
  "hamacas y sombrillas Mallorca",
  "alquiler hamacas playa Mallorca",
  "beach club con dj Mallorca",
  "atardecer en la playa Mallorca",
  "terraza playa Mallorca",
  "restaurante con tumbonas Mallorca",
  "chiringuito con cocina Mallorca",
  "chiringuito cala Mallorca"
];

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

function getPhotoNames(place) {
  const photos = place.photos ?? [];
  if (!Array.isArray(photos)) return [];
  return photos.map((photo) => photo.name).filter(Boolean);
}

function mapPlace(place) {
  const photoNames = getPhotoNames(place);

  return {
    google_place_id: place.id ?? null,
    name: place.displayName?.text ?? null,
    category: "beach-club",
    rating: place.rating ?? null,
    reviews_count: place.userRatingCount ?? null,
    address: place.formattedAddress ?? null,
    latitude: place.location?.latitude ?? null,
    longitude: place.location?.longitude ?? null,
    website: place.websiteUri ?? null,
    phone: place.internationalPhoneNumber ?? null,
    google_maps_url: place.googleMapsUri ?? null,
    primary_type: place.primaryType ?? null,
    types: place.types ?? [],
    raw_google_place: place,
    business_status: place.businessStatus ?? null,
    primary_photo_name: photoNames[0] ?? null,
    photo_names: photoNames
  };
}

function passesFilters(place) {
  return Boolean(
    place.google_place_id &&
      place.name &&
      place.business_status !== "CLOSED_PERMANENTLY" &&
      place.business_status !== "CLOSED_TEMPORARILY" &&
      typeof place.rating === "number" &&
      typeof place.reviews_count === "number" &&
      place.rating >= 4.0 &&
      place.reviews_count >= 30
  );
}

async function searchPlaces(apiKey, textQuery) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.rating",
        "places.userRatingCount",
        "places.formattedAddress",
        "places.location",
        "places.websiteUri",
        "places.internationalPhoneNumber",
        "places.primaryType",
        "places.types",
        "places.googleMapsUri",
        "places.photos",
        "places.businessStatus"
      ].join(",")
    },
    body: JSON.stringify({
      textQuery,
      languageCode: "es",
      regionCode: "ES",
      maxResultCount: 20
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Places API error for "${textQuery}" (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.places ?? [];
}

async function main() {
  loadLocalEnv();

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");
  }

  const unique = new Map();
  let totalFetched = 0;
  let totalAfterFilters = 0;

  for (const query of SEARCHES) {
    if (unique.size >= MAX_RESULTS) break;

    const places = await searchPlaces(apiKey, query);
    totalFetched += places.length;

    for (const rawPlace of places) {
      const place = mapPlace(rawPlace);
      if (!passesFilters(place)) continue;
      totalAfterFilters += 1;
      if (!unique.has(place.google_place_id)) unique.set(place.google_place_id, place);
      if (unique.size >= MAX_RESULTS) break;
    }

    console.log(`${query}: ${places.length} fetched, ${unique.size} unique accepted`);
  }

  const preview = Array.from(unique.values()).slice(0, MAX_RESULTS);
  const outputDir = path.dirname(OUTPUT_PATH);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(preview, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        total_resultados_encontrados: totalFetched,
        total_unicos: unique.size,
        total_despues_de_filtros: totalAfterFilters,
        archivo_generado: OUTPUT_PATH
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
