import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const MAX_RESULTS = 2000;
const MIN_RATING = 4.0;
const MIN_REVIEWS = 50;
const OUTPUT_PATH = "data/import-previews/restaurants-preview.json";

const SEARCHES = [
  // Palma y alrededores
  "best restaurants in Palma Mallorca",
  "restaurants in Santa Catalina Palma",
  "restaurants in Old Town Palma Mallorca",
  "restaurants in La Lonja Palma Mallorca",
  "restaurants in El Terreno Palma Mallorca",
  "restaurants in Portixol Palma Mallorca",
  "restaurants in Playa de Palma Mallorca",
  "fine dining restaurants Palma Mallorca",
  "tapas restaurants Palma Mallorca",
  "pizza restaurants Palma Mallorca",
  "pizzeria Palma Mallorca",
  "hamburgueseria Palma Mallorca",
  "sushi restaurants Palma Mallorca",
  "burger restaurants Palma Mallorca",
  "ramen restaurants Palma Mallorca",
  "mexican restaurants Palma Mallorca",
  "thai restaurants Palma Mallorca",
  "indian restaurants Palma Mallorca",
  "vegan restaurants Palma Mallorca",
  "family restaurants Palma Mallorca",
  "restaurants near Palma Cathedral Mallorca",
  "restaurants in Paseo Maritimo Palma Mallorca",
  "restaurants in Son Espanyolet Palma Mallorca",
  "restaurants in Ciudad Jardin Palma Mallorca",
  "restaurants in Santa Ponca Mallorca",

  // Serra de Tramuntana
  "restaurants in Port de Soller Mallorca",
  "restaurants in Soller Mallorca",
  "restaurants in Deia Mallorca",
  "restaurants in Valldemossa Mallorca",
  "restaurants in Banyalbufar Mallorca",
  "restaurants in Esporles Mallorca",
  "restaurants in Fornalutx Mallorca",
  "restaurants in Bunyola Mallorca",
  "restaurants in Puigpunyent Mallorca",

  // Norte
  "restaurants in Pollenca Mallorca",
  "restaurants in Port de Pollenca Mallorca",
  "restaurants in Alcudia Mallorca",
  "restaurants in Port d'Alcudia Mallorca",
  "restaurants in Playa de Muro Mallorca",
  "restaurants in Can Picafort Mallorca",
  "restaurants in Muro Mallorca",
  "restaurants in Sa Pobla Mallorca",
  "restaurants in Puerto de Alcudia Mallorca",
  "restaurants in Son Serra de Marina Mallorca",

  // Este
  "restaurants in Cala Millor Mallorca",
  "restaurants in Cala Ratjada Mallorca",
  "restaurants in Porto Cristo Mallorca",
  "restaurants in Son Servera Mallorca",
  "restaurants in Arta Mallorca",
  "restaurants in Capdepera Mallorca",
  "restaurants in Canyamel Mallorca",
  "restaurants in Sa Coma Mallorca",
  "restaurants in S'Illot Mallorca",
  "restaurants in Cala Bona Mallorca",

  // Sureste
  "restaurants in Santanyi Mallorca",
  "restaurants in Cala Figuera Mallorca",
  "restaurants in Cala d'Or Mallorca",
  "restaurants in Portocolom Mallorca",
  "restaurants in Felanitx Mallorca",
  "restaurants in Colonia de Sant Jordi Mallorca",
  "restaurants in Campos Mallorca",
  "restaurants in Ses Salines Mallorca",
  "restaurants in Cala Mondrago Mallorca",
  "restaurants in Cala Santanyi Mallorca",
  "restaurants in Cala Figuera Santanyi Mallorca",
  "restaurants in Cala Murada Mallorca",

  // Sur y suroeste
  "restaurants in Santa Ponsa Mallorca",
  "restaurants in Palmanova Mallorca",
  "restaurants in Magaluf Mallorca",
  "restaurants in Portals Nous Mallorca",
  "restaurants in Peguera Mallorca",
  "restaurants in Camp de Mar Mallorca",
  "restaurants in Andratx Mallorca",
  "restaurants in Port d'Andratx Mallorca",
  "restaurants in Sant Elm Mallorca",
  "restaurants in Cala Major Mallorca",
  "restaurants in Illetas Mallorca",
  "restaurants in S'Arenal Mallorca",
  "restaurants in Llucmajor Mallorca",
  "restaurants in Cala Blava Mallorca",

  // Interior
  "restaurants in Manacor Mallorca",
  "restaurants in Inca Mallorca",
  "restaurants in Sa Pobla Mallorca",
  "restaurants in Santa Maria del Cami Mallorca",
  "restaurants in Alaro Mallorca",
  "restaurants in Binissalem Mallorca",
  "restaurants in Sineu Mallorca",
  "restaurants in Petra Mallorca",
  "restaurants in Montuiri Mallorca",
  "restaurants in Porreres Mallorca",
  "restaurants in Llubi Mallorca",
  "restaurants in Selva Mallorca",
  "restaurants in Caimari Mallorca",
  "restaurants in Algaida Mallorca",
  "restaurants in Lloret de Vistalegre Mallorca",

  // Por tipo de cocina
  "mediterranean restaurants Mallorca",
  "seafood restaurants Mallorca",
  "traditional mallorcan restaurants Mallorca",
  "mallorcan cuisine Mallorca",
  "arroceria Mallorca",
  "tapas Mallorca",
  "pizzeria Mallorca",
  "hamburgueseria Mallorca",
  "burger restaurants Mallorca",
  "japanese restaurants Mallorca",
  "sushi restaurants Mallorca",
  "ramen restaurants Mallorca",
  "mexican restaurants Mallorca",
  "thai restaurants Mallorca",
  "indian restaurants Mallorca",
  "restaurants with sea view Mallorca",
  "paella restaurants Mallorca",
  "brunch restaurants Mallorca",
  "steakhouses Mallorca",
  "italian restaurants Mallorca",
  "grill restaurants Mallorca",
  "bbq restaurants Mallorca",
  "vegetarian restaurants Mallorca",
  "vegan restaurants Mallorca",
  "gluten free restaurants Mallorca",
  "romantic restaurants Mallorca",
  "family restaurants Mallorca",
  "restaurants with terrace Mallorca",
  "restaurants open all year Mallorca",
  "Michelin restaurants Mallorca",
  "fine dining Mallorca",
  "cheap eats Mallorca",
  "menu del dia Mallorca",
  "breakfast restaurants Mallorca",

  // En español — búsquedas habituales
  "restaurantes Palma Mallorca",
  "mejores restaurantes Mallorca",
  "restaurantes mallorquines Mallorca",
  "cocina mallorquina Mallorca",
  "restaurantes baratos Palma Mallorca",
  "menú del día Palma Mallorca",
  "donde comer en Palma Mallorca",
  "restaurantes con vistas al mar Mallorca",
  "restaurantes en la playa Mallorca",
  "restaurantes con terraza Mallorca",
  "restaurantes románticos Mallorca",
  "restaurantes vegetarianos Palma Mallorca",
  "restaurantes veganos Palma Mallorca",
  "carne a la brasa Mallorca",
  "restaurantes con jardín Mallorca",
  "restaurantes para grupos Mallorca",
  "restaurantes con niños Mallorca",

  // Platos y tipos de cocina en español
  "paella Mallorca",
  "arroces Mallorca",
  "tapas Mallorca",
  "chiringuito Mallorca",
  "cocina de mercado Palma Mallorca",
  "marisquería Mallorca",
  "pescado fresco Mallorca",
  "asador Mallorca",
  "hamburguesería Palma Mallorca",
  "pizzería Palma Mallorca",
  "sushi Palma Mallorca",
  "ramen Palma Mallorca",
  "mexicano Palma Mallorca",

  // Platos típicos mallorquines
  "frito mallorquín restaurante Mallorca",
  "tumbet restaurante Mallorca",
  "sopas mallorquinas restaurante Mallorca",
  "ensaimada Palma Mallorca",
  "pa amb oli Mallorca"
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
    category: "restaurant",
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
      place.rating >= MIN_RATING &&
      place.reviews_count >= MIN_REVIEWS
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

  for (const query of SEARCHES) {
    if (unique.size >= MAX_RESULTS) break;

    const places = await searchPlaces(apiKey, query);
    for (const rawPlace of places) {
      const place = mapPlace(rawPlace);
      if (!passesFilters(place)) continue;
      if (!unique.has(place.google_place_id)) unique.set(place.google_place_id, place);
      if (unique.size >= MAX_RESULTS) break;
    }

    console.log(`${query}: ${places.length} fetched, ${unique.size} unique accepted`);
  }

  const preview = Array.from(unique.values()).slice(0, MAX_RESULTS);
  const outputDir = path.dirname(OUTPUT_PATH);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(preview, null, 2)}\n`, "utf8");

  console.log(`Wrote ${preview.length} restaurants to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
