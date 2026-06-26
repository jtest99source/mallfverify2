import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const MAX_RESULTS = 2000;
const OUTPUT_PATH = "data/import-previews/boats-preview.json";

const SEARCHES = [
  // Puertos principales
  "boat rental Palma Mallorca",
  "boat charter Palma Mallorca",
  "boat rental Port d'Andratx Mallorca",
  "boat rental Puerto Portals Mallorca",
  "boat rental Alcudia Mallorca",
  "boat rental Port d'Alcudia Mallorca",
  "boat charter Alcudia Mallorca",

  // Puertos secundarios
  "boat rental Port de Pollenca Mallorca",
  "boat charter Port de Pollenca Mallorca",
  "boat rental Porto Cristo Mallorca",
  "boat charter Porto Cristo Mallorca",
  "boat rental Cala Ratjada Mallorca",
  "boat rental Cala d'Or Mallorca",
  "boat charter Cala d'Or Mallorca",
  "boat rental Colonia de Sant Jordi Mallorca",
  "boat rental Portocolom Mallorca",
  "boat rental Santa Ponsa Mallorca",
  "boat rental Palmanova Mallorca",
  "boat rental Magaluf Mallorca",
  "boat rental Soller Mallorca",
  "boat rental Port de Soller Mallorca",
  "boat rental Can Picafort Mallorca",
  "boat rental Cala Bona Mallorca",

  // Por tipo
  "yacht charter Mallorca",
  "luxury yacht charter Mallorca",
  "catamaran charter Mallorca",
  "speed boat rental Mallorca",
  "rib boat rental Mallorca",
  "sailing boat rental Mallorca",
  "sailboat charter Mallorca",
  "llaut rental Mallorca",
  "boat tours Mallorca",
  "private boat trip Mallorca",
  "sunset boat trip Mallorca",
  "boat excursion Mallorca",
  "party boat Mallorca",
  "boats without license Mallorca",
  "boat rental without license Mallorca",
  "alquiler barcos Mallorca",
  "alquiler barcos sin licencia Mallorca",
  "alquiler velero Mallorca",
  "alquiler llaut Mallorca",
  "charter nautico Mallorca",

  // En español — más tipos y búsquedas
  "excursión en barco Mallorca",
  "paseo en barco Mallorca",
  "alquiler de barco Mallorca",
  "alquiler embarcación Mallorca",
  "barco privado Mallorca",
  "tour en catamarán Mallorca",
  "excursión velero Mallorca",
  "barco sin patrón Mallorca",
  "embarcación sin licencia Mallorca",
  "crucero Mallorca",
  "sunset cruise Mallorca",
  "tour en barco calas Mallorca",
  "pesca deportiva Mallorca",
  "salida de pesca Mallorca",
  "fishing charter Mallorca",
  "lancha de alquiler Mallorca",
  "barca de alquiler Mallorca",
  "alquiler barco Palma Mallorca"
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
    category: "boat-rental",
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
      place.business_status !== "CLOSED_PERMANENTLY" &&
      place.business_status !== "CLOSED_TEMPORARILY" &&
      typeof place.rating === "number" &&
      typeof place.reviews_count === "number" &&
      place.rating >= 4.2 &&
      place.reviews_count >= 10
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
