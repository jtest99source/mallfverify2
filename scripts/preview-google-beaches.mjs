import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const MAX_RESULTS = 2000;
const OUTPUT_PATH = "data/import-previews/beaches-preview.json";

const SEARCHES = [
  // Genéricas
  "best beaches Mallorca",
  "calas Mallorca",
  "hidden beaches Mallorca",
  "family beaches Mallorca",
  "sandy beaches Mallorca",
  "beaches with parking Mallorca",
  "nudist beaches Mallorca",

  // Norte
  "beaches Alcudia Mallorca",
  "beaches Port d'Alcudia Mallorca",
  "beaches Pollensa Mallorca",
  "beaches Port de Pollenca Mallorca",
  "Playa de Muro Mallorca",
  "Formentor beach Mallorca",
  "Cala Sant Vicenc beaches Mallorca",
  "beaches Can Picafort Mallorca",
  "beaches Son Serra de Marina Mallorca",

  // Este
  "beaches Cala Millor Mallorca",
  "beaches Cala Bona Mallorca",
  "beaches Cala Ratjada Mallorca",
  "beaches Capdepera Mallorca",
  "beaches Canyamel Mallorca",
  "beaches Porto Cristo Mallorca",
  "beaches Manacor Mallorca",
  "beaches Sa Coma Mallorca",
  "beaches S'Illot Mallorca",

  // Sureste
  "beaches Santanyi Mallorca",
  "beaches Cala d'Or Mallorca",
  "beaches Portocolom Mallorca",
  "beaches Ses Salines Mallorca",
  "Es Trenc beach Mallorca",
  "Cala Pi Mallorca",
  "beaches Colonia de Sant Jordi Mallorca",
  "Cala Mondrago Mallorca",
  "Cala Llombards Mallorca",
  "Calo des Moro Mallorca",
  "Cala Santanyi Mallorca",
  "Cala Figuera beaches Mallorca",
  "Cala Murada Mallorca",

  // Suroeste
  "beaches Andratx Mallorca",
  "beaches Port d'Andratx Mallorca",
  "beaches Peguera Mallorca",
  "beaches Santa Ponsa Mallorca",
  "beaches Palmanova Mallorca",
  "beaches Magaluf Mallorca",
  "beaches Illetas Mallorca",
  "beaches Cala Major Mallorca",
  "beaches Camp de Mar Mallorca",
  "Sant Elm beach Mallorca",
  "Camp de Mar beach Mallorca",
  "beaches Soller Mallorca",
  "beaches Port de Soller Mallorca",

  // Sur
  "beaches Llucmajor Mallorca",
  "S'Arenal beach Mallorca",
  "Cala Blava beach Mallorca",
  "Playa de Palma Mallorca",

  // En español — búsquedas habituales
  "playas de Mallorca",
  "mejores playas de Mallorca",
  "calas de Mallorca",
  "calas escondidas Mallorca",
  "calas más bonitas Mallorca",
  "playas familiares Mallorca",
  "playas vírgenes Mallorca",
  "playas tranquilas Mallorca",
  "playas con niños Mallorca",
  "playas nudistas Mallorca",
  "playas con bandera azul Mallorca",
  "playas accesibles Mallorca",
  "cala con aguas cristalinas Mallorca",
  "calas de Pollença",
  "calas sureste Mallorca",
  "calas norte Mallorca",
  "playas sin masificar Mallorca",
  "playa con chiringuito Mallorca",
  "playa con aparcamiento Mallorca"
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
    category: "beach",
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
      place.reviews_count >= 5
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
