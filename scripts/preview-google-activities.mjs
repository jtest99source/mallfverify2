import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const MAX_RESULTS = 2000;
const OUTPUT_PATH = "data/import-previews/activities-preview.json";

const SEARCHES = [
  // Genéricas
  "activities Mallorca",
  "excursions Mallorca",
  "things to do Mallorca",
  "private tours Mallorca",

  // Por zona
  "activities Palma Mallorca",
  "activities Santa Catalina Palma Mallorca",
  "activities Playa de Palma Mallorca",
  "activities Soller Mallorca",
  "activities Port de Soller Mallorca",
  "activities Alcudia Mallorca",
  "activities Port d'Alcudia Mallorca",
  "activities Pollenca Mallorca",
  "activities Port de Pollenca Mallorca",
  "activities Andratx Mallorca",
  "activities Santa Ponsa Mallorca",
  "activities Palmanova Mallorca",
  "activities Magaluf Mallorca",
  "activities Cala d'Or Mallorca",
  "activities Cala Millor Mallorca",
  "activities Cala Ratjada Mallorca",
  "activities Porto Cristo Mallorca",
  "activities Arta Mallorca",
  "activities Santanyi Mallorca",
  "activities Colonia de Sant Jordi Mallorca",
  "activities Portocolom Mallorca",
  "activities Peguera Mallorca",

  // Por tipo
  "kayak Mallorca",
  "kayak tours Mallorca",
  "kayak rental Mallorca",
  "paddle surf Mallorca",
  "stand up paddle Mallorca",
  "diving Mallorca",
  "scuba diving Mallorca",
  "dive center Mallorca",
  "snorkeling Mallorca",
  "jet ski Mallorca",
  "jet ski rental Mallorca",
  "jet ski tours Mallorca",
  "wine tours Mallorca",
  "wine tours Binissalem Mallorca",
  "hiking tours Mallorca",
  "cycling tours Mallorca",
  "bike tours Mallorca",
  "bike rental Mallorca",
  "quad tours Mallorca",
  "buggy tours Mallorca",
  "off road tours Mallorca",
  "coasteering Mallorca",
  "parasailing Mallorca",
  "paragliding Mallorca",
  "climbing Mallorca",
  "canyoning Mallorca",
  "caves tour Mallorca",
  "horse riding Mallorca",
  "horse riding tours Mallorca",
  "escape room Mallorca",
  "water park Mallorca",
  "amusement park Mallorca",
  "aquarium Mallorca",
  "karting Mallorca",
  "paintball Mallorca",
  "adventure park Mallorca",
  "4x4 tours Mallorca",
  "cultural tours Palma Mallorca",

  // En español — actividades
  "actividades Mallorca",
  "qué hacer en Mallorca",
  "cosas que hacer en Palma Mallorca",
  "actividades acuáticas Mallorca",
  "kayak Mallorca",
  "paddle surf Mallorca",
  "buceo Mallorca",
  "snorkel Mallorca",
  "excursiones en bicicleta Mallorca",
  "rutas en e-bike Mallorca",
  "rutas en bici Mallorca",
  "senderismo guiado Mallorca",
  "excursiones en quad Mallorca",
  "tours en buggy Mallorca",
  "visitas guiadas Palma Mallorca",
  "tours a pie Palma Mallorca",
  "excursiones organizadas Mallorca",
  "clases de cocina Mallorca",
  "cata de vinos Mallorca",
  "rutas a caballo Mallorca",
  "escalada Mallorca",
  "parapente Mallorca",
  "parasailing Mallorca",
  "kitesurf Mallorca",
  "windsurf Mallorca",
  "esquí acuático Mallorca",
  "flyboard Mallorca",
  "cuevas Mallorca visita",
  "kartódromo Mallorca",
  "paintball Mallorca"
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
    category: "activity",
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
      place.rating >= 4.3 &&
      place.reviews_count >= 15
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
