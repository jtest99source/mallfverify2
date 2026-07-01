import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "reports";
const OUTPUT_DIR_PREVIEWS = "data/import-previews";
const PREVIOUS_PREVIEWS = [
  "data/import-previews/nightlife-general-topup-preview-2026-06-29T13-02-37-158Z.json",
  "data/import-previews/nightlife-preview.json"
];

const SEARCHES = [
  "best cocktail bars Palma old town Mallorca",
  "best cocktail bars La Lonja Palma Mallorca",
  "best cocktail bars Santa Catalina Palma Mallorca",
  "best rooftop bars Palma Mallorca",
  "best live music bars Palma Mallorca",
  "jazz club Palma Mallorca",
  "late night bars Palma Mallorca",
  "dance bars Palma Mallorca",
  "clubs Paseo Maritimo Palma Mallorca",
  "discotecas Paseo Maritimo Palma Mallorca",
  "clubs El Terreno Palma Mallorca",
  "nightlife El Terreno Palma Mallorca",
  "clubs Santa Catalina Palma Mallorca",
  "cocktail bar Portixol Palma Mallorca",
  "beach club Portixol Palma Mallorca",
  "beach club Illetas Mallorca",
  "beach club Portals Nous Mallorca",
  "beach club Puerto Portals Mallorca",
  "beach club Santa Ponsa Mallorca",
  "late bars Santa Ponsa Mallorca",
  "pubs Santa Ponsa Mallorca",
  "pubs Palmanova Mallorca",
  "late bars Palmanova Mallorca",
  "bars Punta Ballena Magaluf Mallorca",
  "clubs Punta Ballena Magaluf Mallorca",
  "karaoke Magaluf Mallorca",
  "sports bar Magaluf Mallorca",
  "late bars Alcudia Mallorca",
  "pubs Port d'Alcudia Mallorca",
  "beach club Playa de Muro Mallorca",
  "live music Alcudia Mallorca",
  "late bars Cala Ratjada Mallorca",
  "clubs Cala Ratjada Mallorca",
  "pubs Cala Ratjada Mallorca",
  "beach club Cala Ratjada Mallorca",
  "late bars Cala d'Or Mallorca",
  "pubs Cala d'Or Mallorca",
  "cocktail bars Cala d'Or Mallorca",
  "beach club Cala d'Or Mallorca",
  "late bars Can Picafort Mallorca",
  "beach club Can Picafort Mallorca",
  "Nachtleben Mallorca",
  "Diskothek Palma Mallorca",
  "Cocktailbar Palma Mallorca",
  "Live Musik Palma Mallorca",
  "Irish pub Mallorca",
  "sports bar Mallorca"
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

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function loadExcludedPlaceIds() {
  const excluded = new Set();
  for (const previewPath of PREVIOUS_PREVIEWS) {
    if (!existsSync(previewPath)) continue;
    const rows = JSON.parse(readFileSync(previewPath, "utf8"));
    for (const row of rows) {
      if (row.google_place_id) excluded.add(row.google_place_id);
    }
  }
  return excluded;
}

function getPhotoNames(place) {
  const photos = place.photos ?? [];
  if (!Array.isArray(photos)) return [];
  return photos.map((photo) => photo.name).filter(Boolean);
}

function mapPlace(place, query) {
  const photoNames = getPhotoNames(place);
  return {
    google_place_id: place.id ?? null,
    name: place.displayName?.text ?? null,
    category: "nightlife",
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
    photo_names: photoNames,
    preview_query: query
  };
}

function passesBasicFilters(place) {
  if (
    !place.google_place_id ||
    !place.name ||
    place.business_status === "CLOSED_PERMANENTLY" ||
    place.business_status === "CLOSED_TEMPORARILY" ||
    typeof place.rating !== "number" ||
    typeof place.reviews_count !== "number" ||
    place.rating < 3.8 ||
    place.reviews_count < 80
  ) return false;

  const allTypes = [place.primary_type, ...(place.types ?? [])].filter(Boolean);
  const blockedTypes = new Set([
    "hotel",
    "lodging",
    "resort_hotel",
    "marina",
    "tourist_attraction",
    "shopping_mall",
    "store",
    "school",
    "training_center"
  ]);
  if (allTypes.some((type) => blockedTypes.has(type))) return false;

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
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");

  const excludedPlaceIds = loadExcludedPlaceIds();
  const unique = new Map();
  const perQuery = [];

  for (const query of SEARCHES) {
    const places = await searchPlaces(apiKey, query);
    let accepted = 0;
    let added = 0;
    for (const rawPlace of places) {
      const place = mapPlace(rawPlace, query);
      if (!passesBasicFilters(place)) continue;
      accepted += 1;
      if (excludedPlaceIds.has(place.google_place_id)) continue;
      if (!unique.has(place.google_place_id)) {
        unique.set(place.google_place_id, place);
        added += 1;
      }
    }
    perQuery.push({ query, fetched: places.length, accepted, added });
    console.log(`${query}: ${places.length} fetched, ${accepted} accepted, ${added} new`);
  }

  const rows = [...unique.values()];
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync(OUTPUT_DIR_PREVIEWS, { recursive: true });
  const previewPath = join(OUTPUT_DIR_PREVIEWS, `nightlife-second-pass-preview-${stamp}.json`);
  writeFileSync(previewPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const reportPath = join(OUTPUT_DIR, `nightlife-second-pass-preview-${stamp}.md`);
  const lines = [
    "# Nightlife Second-Pass Preview",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Searches: ${SEARCHES.length}`,
    `- Previous preview place IDs excluded: ${excludedPlaceIds.size}`,
    `- New unique rows: ${rows.length}`,
    `- Preview file: ${previewPath}`,
    "",
    "## By Query",
    "",
    "| Query | Fetched | Accepted | New added |",
    "|---|---:|---:|---:|",
    ...perQuery.map((item) => `| ${fmt(item.query)} | ${item.fetched} | ${item.accepted} | ${item.added} |`),
    "",
    "## Preview Rows",
    "",
    "| Query | Name | Rating | Reviews | Type | Website | Address |",
    "|---|---|---:|---:|---|---|---|",
    ...rows.map((row) => `| ${fmt(row.preview_query)} | ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(JSON.stringify({ report: reportPath, preview: previewPath, rows: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
