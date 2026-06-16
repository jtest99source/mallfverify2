import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const MAX_RESULTS = 2000;
const OUTPUT_PATH = "data/import-previews/hotels-preview.json";

const SEARCHES = [
  // Palma
  "hotels Palma Mallorca",
  "boutique hotels Palma Mallorca",
  "luxury hotels Palma Mallorca",
  "5 star hotels Palma Mallorca",
  "4 star hotels Palma Mallorca",
  "hotels Old Town Palma Mallorca",
  "hotels Santa Catalina Palma Mallorca",
  "hotels Portixol Palma Mallorca",
  "hotels Playa de Palma Mallorca",

  // Serra de Tramuntana
  "hotels Port de Soller Mallorca",
  "hotels Soller Mallorca",
  "hotels Deia Mallorca",
  "hotels Valldemossa Mallorca",
  "hotels Fornalutx Mallorca",
  "hotels Banyalbufar Mallorca",
  "hotels Esporles Mallorca",
  "hotels Puigpunyent Mallorca",

  // Norte
  "hotels Pollenca Mallorca",
  "hotels Port de Pollenca Mallorca",
  "hotels Alcudia Mallorca",
  "hotels Port d'Alcudia Mallorca",
  "hotels Playa de Muro Mallorca",
  "hotels Can Picafort Mallorca",
  "hotels Muro Mallorca",
  "hotels Son Serra de Marina Mallorca",

  // Este
  "hotels Cala Millor Mallorca",
  "hotels Cala Ratjada Mallorca",
  "hotels Porto Cristo Mallorca",
  "hotels Son Servera Mallorca",
  "hotels Arta Mallorca",
  "hotels Capdepera Mallorca",
  "hotels Canyamel Mallorca",
  "hotels Sa Coma Mallorca",
  "hotels S'Illot Mallorca",
  "hotels Cala Bona Mallorca",

  // Sureste
  "hotels Cala d'Or Mallorca",
  "hotels Portocolom Mallorca",
  "hotels Santanyi Mallorca",
  "hotels Colonia de Sant Jordi Mallorca",
  "hotels Campos Mallorca",
  "hotels Felanitx Mallorca",
  "hotels Cala Figuera Mallorca",
  "hotels Cala Santanyi Mallorca",
  "hotels Cala Murada Mallorca",
  "hotels Ses Salines Mallorca",

  // Sur y suroeste
  "hotels Peguera Mallorca",
  "hotels Andratx Mallorca",
  "hotels Port d'Andratx Mallorca",
  "hotels Camp de Mar Mallorca",
  "hotels Santa Ponsa Mallorca",
  "hotels Palmanova Mallorca",
  "hotels Magaluf Mallorca",
  "hotels Illetas Mallorca",
  "hotels Cala Major Mallorca",
  "hotels Puerto Portals Mallorca",
  "hotels S'Arenal Mallorca",
  "hotels Llucmajor Mallorca",
  "hotels Cala Blava Mallorca",

  // Interior
  "hotels Inca Mallorca",
  "hotels Binissalem Mallorca",
  "hotels Manacor Mallorca",
  "hotels Sineu Mallorca",
  "hotels Petra Mallorca",
  "hotels Montuiri Mallorca",
  "hotels Porreres Mallorca",
  "hotels Alaro Mallorca",
  "hotels Santa Maria del Cami Mallorca",

  // Por tipo
  "luxury hotels Mallorca",
  "beach hotels Mallorca",
  "seafront hotels Mallorca",
  "family hotels Mallorca",
  "adults only hotels Mallorca",
  "all inclusive hotels Mallorca",
  "spa hotels Mallorca",
  "rural hotels Mallorca",
  "finca hotels Mallorca",
  "resort hotels Mallorca",
  "hostal Mallorca",
  "apart hotels Mallorca",
  "aparthotel Mallorca",
  "hotels with pool Mallorca",
  "agroturismo Mallorca",
  "hoteles con encanto Mallorca",
  "boutique hotels Mallorca",
  "small luxury hotels Mallorca",
  "romantic hotels Mallorca",
  "hotels open all year Mallorca",

  // En español — búsquedas habituales
  "hoteles Palma Mallorca",
  "hoteles con encanto Mallorca",
  "hoteles rurales Mallorca",
  "hoteles de lujo Mallorca",
  "hoteles boutique Mallorca",
  "hoteles con piscina Mallorca",
  "hoteles en primera línea de playa Mallorca",
  "apartamentos turísticos Mallorca",
  "alojamiento rural Mallorca",
  "casas rurales Mallorca",
  "finca rural Mallorca",
  "hoteles para parejas Mallorca",
  "hoteles adults only Mallorca",
  "hoteles todo incluido Mallorca",
  "agroturismo Mallorca",
  "posadas Mallorca",
  "hotel boutique Palma Mallorca",
  "villas de alquiler Mallorca",
  "hotel en la playa Mallorca",
  "hotel con spa Mallorca",
  "casas de campo Mallorca"
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
    category: "hotel",
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
      place.reviews_count >= 20
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
