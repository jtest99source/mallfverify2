import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getPlaceCategoryConfig } from "./place-category-config.mjs";

const MAX_RESULTS = 2000;

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

function areaSearches(config, area) {
  const cleanArea = area.replace(/\s+/g, " ").trim();
  if (!cleanArea) return config.searches;

  if (config.businessCategory === "real-estate") {
    return [
      `real estate agency ${cleanArea} Mallorca`,
      `estate agents ${cleanArea} Mallorca`,
      `property agency ${cleanArea} Mallorca`,
      `inmobiliaria ${cleanArea} Mallorca`,
      `agencia inmobiliaria ${cleanArea} Mallorca`,
      `Immobilienmakler ${cleanArea} Mallorca`,
      `Immobilien ${cleanArea} Mallorca`
    ];
  }

  return [
    `${config.singular} ${cleanArea} Mallorca`,
    `best ${config.singular} ${cleanArea} Mallorca`,
    `${cleanArea} Mallorca ${config.singular}`
  ];
}

function getPhotoNames(place) {
  const photos = place.photos ?? [];
  if (!Array.isArray(photos)) return [];
  return photos.map((photo) => photo.name).filter(Boolean);
}

function mapPlace(place, businessCategory) {
  const photoNames = getPhotoNames(place);

  return {
    google_place_id: place.id ?? null,
    name: place.displayName?.text ?? null,
    category: businessCategory,
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
    business_status: place.businessStatus ?? null,
    raw_google_place: place,
    primary_photo_name: photoNames[0] ?? null,
    photo_names: photoNames
  };
}

function passesFilters(place, config) {
  if (
    !place.google_place_id ||
    !place.name ||
    place.business_status === "CLOSED_PERMANENTLY" ||
    place.business_status === "CLOSED_TEMPORARILY" ||
    typeof place.rating !== "number" ||
    typeof place.reviews_count !== "number" ||
    place.rating < config.minRating ||
    place.reviews_count < config.minReviews
  ) return false;

  if (config.blockedTypes?.length) {
    const allTypes = [place.primary_type, ...(place.types ?? [])].filter(Boolean);
    if (config.blockedTypes.some((bt) => allTypes.includes(bt))) return false;
  }

  if (config.requiredTypes?.length) {
    const allTypes = [place.primary_type, ...(place.types ?? [])].filter(Boolean);
    if (!config.requiredTypes.some((rt) => allTypes.includes(rt))) return false;
  }

  if (config.blockedNameKeywords?.length) {
    const nameLower = (place.name ?? "").toLowerCase();
    if (config.blockedNameKeywords.some((kw) => nameLower.includes(kw.toLowerCase()))) return false;
  }

  return true;
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

  const category = argValue("category");
  if (!category) throw new Error("Missing --category. Example: npm run places:preview:category -- --category=cafes");
  const area = argValue("area");

  const config = getPlaceCategoryConfig(category);
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");

  const unique = new Map();
  const searches = areaSearches(config, area ?? "");

  for (const query of searches) {
    if (unique.size >= MAX_RESULTS) break;

    const places = await searchPlaces(apiKey, query);
    let acceptedForQuery = 0;
    for (const rawPlace of places) {
      const place = mapPlace(rawPlace, config.businessCategory);
      if (!passesFilters(place, config)) continue;
      acceptedForQuery += 1;
      if (!unique.has(place.google_place_id)) unique.set(place.google_place_id, place);
      if (unique.size >= MAX_RESULTS) break;
    }

    console.log(`${query}: ${places.length} fetched, ${acceptedForQuery} accepted, ${unique.size} unique`);
  }

  const preview = Array.from(unique.values()).slice(0, MAX_RESULTS);
  mkdirSync(path.dirname(config.output), { recursive: true });
  writeFileSync(config.output, `${JSON.stringify(preview, null, 2)}\n`, "utf8");

  console.log(`Wrote ${preview.length} ${category}${area ? ` for ${area}` : ""} to ${config.output}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
