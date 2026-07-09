/**
 * filter-zone-topup-candidates.mjs
 *
 * Reads zone-topup preview JSONs for a given date stamp, applies category-specific
 * quality filters, and writes approved-only JSONs ready for import.
 *
 * Usage:
 *   node scripts/filter-zone-topup-candidates.mjs --stamp=2026-07-06T11-18-33-755Z
 *   node scripts/filter-zone-topup-candidates.mjs --stamp=2026-07-06T11-18-33-755Z --category=restaurants
 *
 * Writes:
 *   data/import-previews/{category}-zone-topup-approved-{stamp}.json
 *   reports/{category}-zone-topup-filter-report-{stamp}.md
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ─── Blocked primary_type sets per category ───────────────────────────────────

const ALWAYS_BLOCKED_TYPES = new Set([
  "parking", "parking_lot", "gas_station", "car_wash", "atm", "bank",
  "post_office", "police", "fire_station", "courthouse", "city_hall",
  "embassy", "local_government_office", "insurance_agency",
  "travel_agency", "bus_station", "train_station", "subway_station",
  "airport", "ferry_terminal", "taxi_stand",
  "cemetery", "funeral_home", "place_of_worship", "church", "mosque",
  "hindu_temple", "synagogue",
  "school", "university", "library", "museum",
  "amusement_park", "aquarium", "zoo", "bowling_alley", "movie_theater",
  "casino", "night_club",
  "storage", "warehouse", "moving_company",
  "locksmith", "plumber", "electrician", "painter", "roofer",
  "car_dealer", "car_repair", "bicycle_store", "bicycle_rental",
  "convenience_store", "gas_station", "hardware_store",
  "clothing_store", "shoe_store", "electronics_store", "book_store",
  "home_goods_store", "furniture_store", "jewelry_store",
  "florist", "gift_shop",
  "laundry", "dry_cleaning",
  "shopping_mall", "department_store",
]);

// Types blocked specifically per category
const CATEGORY_BLOCKED_TYPES = {
  restaurant: new Set([
    "castle", "historical_landmark", "monument", "tourist_attraction",
    "golf_course", "stadium", "event_venue",
    "grocery_store", "supermarket", "food_store", "butcher_shop", "seafood_store",
    "ice_cream_shop", "dessert_shop", "meal_delivery", "catering",
    "health_food_store", "vitamin_supplements_store",
    "pharmacy", "doctor", "dentist", "hospital", "physiotherapist",
    "hair_salon", "nail_salon", "barber_shop", "beauty_salon",
    "gym", "fitness_center", "yoga_studio", "swimming_pool",
    "hotel", "resort_hotel", "lodging", "hostel", "motel",
    "spa", "massage", "wellness_center",
    "real_estate_agency", "lawyer", "accounting",
    "car_rental", "boat_rental",
    "park", "natural_feature", "national_park", "hiking_area",
    "beach", "campsite", "rv_park", "farmstay",
    "pet_store", "veterinarian",
    "art_gallery", "performing_arts_theater",
  ]),
  bar: new Set([
    "castle", "historical_landmark", "tourist_attraction", "golf_course",
    "grocery_store", "supermarket", "food_store", "butcher_shop",
    "pharmacy", "doctor", "dentist", "hospital",
    "gym", "fitness_center", "yoga_studio",
    "hotel", "resort_hotel", "lodging",
    "spa", "massage",
    "real_estate_agency", "car_rental",
    "park", "natural_feature", "beach",
    "pet_store", "veterinarian",
    "accounting", "lawyer",
  ]),
  cafe: new Set([
    "castle", "historical_landmark", "tourist_attraction", "golf_course",
    "grocery_store", "supermarket", "food_store",
    "pharmacy", "doctor", "dentist", "hospital",
    "gym", "fitness_center",
    "hotel", "resort_hotel", "lodging",
    "spa", "massage",
    "real_estate_agency", "car_rental",
    "park", "natural_feature", "beach",
    "pet_store", "veterinarian",
    "accounting", "lawyer", "insurance_agency",
  ]),
  hotel: new Set([
    "castle", "historical_landmark", "tourist_attraction", "golf_course",
    "restaurant", "bar", "cafe", "coffee_shop",
    "grocery_store", "supermarket", "pharmacy",
    "doctor", "dentist", "hospital",
    "gym", "fitness_center", "spa",
    "real_estate_agency", "car_rental",
    "park", "natural_feature", "beach",
    "pet_store", "veterinarian",
    "accounting", "lawyer",
  ]),
  bakery: new Set([
    "castle", "historical_landmark", "tourist_attraction",
    "grocery_store", "supermarket",
    "pharmacy", "doctor", "dentist", "hospital",
    "gym", "fitness_center",
    "hotel", "lodging", "spa",
    "real_estate_agency", "car_rental",
    "park", "natural_feature",
    "pet_store", "veterinarian",
    "accounting", "lawyer",
    "restaurant", "bar",
  ]),
  spa: new Set([
    "castle", "historical_landmark", "tourist_attraction",
    "restaurant", "bar", "cafe", "coffee_shop",
    "grocery_store", "supermarket", "food_store",
    "doctor", "dentist", "hospital",
    "gym", "fitness_center", "yoga_studio",
    "hotel", "resort_hotel", "lodging",
    "real_estate_agency", "car_rental",
    "park", "natural_feature",
    "pet_store", "veterinarian",
    "hair_salon", "nail_salon", "barber_shop",
  ]),
  gym: new Set([
    "castle", "historical_landmark", "tourist_attraction",
    "restaurant", "bar", "cafe",
    "grocery_store", "supermarket", "food_store",
    "pharmacy", "doctor", "dentist", "hospital",
    "hotel", "lodging", "spa",
    "real_estate_agency", "car_rental",
    "park", "natural_feature",
    "pet_store", "veterinarian",
    "sporting_goods_store",
  ]),
  healthcare: new Set([
    "castle", "historical_landmark", "tourist_attraction",
    "restaurant", "bar", "cafe",
    "grocery_store", "supermarket", "food_store",
    "gym", "fitness_center", "yoga_studio",
    "hotel", "lodging", "spa",
    "real_estate_agency", "car_rental",
    "park", "natural_feature",
    "pet_store", "veterinarian",
    "hair_salon", "nail_salon", "barber_shop", "beauty_salon",
  ]),
  veterinarian: new Set([
    "castle", "historical_landmark", "tourist_attraction",
    "restaurant", "bar", "cafe",
    "grocery_store", "supermarket", "food_store",
    "gym", "fitness_center", "spa",
    "hotel", "lodging",
    "real_estate_agency", "car_rental",
    "park", "natural_feature",
    "doctor", "dentist", "hospital", "pharmacy",
  ]),
  "real-estate": new Set([
    "castle", "historical_landmark", "tourist_attraction",
    "restaurant", "bar", "cafe",
    "grocery_store", "supermarket", "food_store",
    "gym", "fitness_center", "spa",
    "hotel", "lodging",
    "car_rental", "car_dealer",
    "park", "natural_feature",
    "pet_store", "veterinarian",
    "doctor", "dentist", "hospital", "pharmacy",
  ]),
};

// ─── Blocked name keywords ─────────────────────────────────────────────────────

const BLOCKED_NAME_KEYWORDS = [
  "booking.com", "tripadvisor", "airbnb", "expedia", "trivago",
  "hotels.com", "lastminute", "skyscanner",
  "supermercado", "supermarket", "mercadona", "lidl", "aldi", "spar ",
  "gasolinera", "estacion de servicio", "gas station",
  "farmacia", "pharmacy",
  "campo de golf", "golf club",
  "apartamento", "apartamentos", "alquiler vacacional",
  "agencia inmobiliaria" // for non-real-estate categories
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9 ]+/g, " ")
    .trim();
}

function argValue(name) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function getAllTypes(place) {
  const rawTypes = place.types ?? place.raw_google_place?.types ?? [];
  const primaryType = place.primary_type ?? place.raw_google_place?.primaryType ?? null;
  return [...new Set([primaryType, ...rawTypes].filter(Boolean))];
}

function isBlocked(place, category) {
  const types = getAllTypes(place);
  const nameLower = normalize(place.name ?? "");

  // Check always-blocked types
  if (types.some((t) => ALWAYS_BLOCKED_TYPES.has(t))) {
    return `type:${types.find((t) => ALWAYS_BLOCKED_TYPES.has(t))}`;
  }

  // Check category-specific blocked types
  const catBlocked = CATEGORY_BLOCKED_TYPES[category];
  if (catBlocked) {
    const hit = types.find((t) => catBlocked.has(t));
    if (hit) return `type:${hit}`;
  }

  // Check blocked name keywords (only apply 'agencia inmobiliaria' block for non-real-estate)
  for (const kw of BLOCKED_NAME_KEYWORDS) {
    if (kw === "agencia inmobiliaria" && category === "real-estate") continue;
    if (nameLower.includes(normalize(kw))) return `name:${kw}`;
  }

  return null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

const stamp = argValue("stamp");
if (!stamp) throw new Error("Missing --stamp. Example: --stamp=2026-07-06T11-18-33-755Z");

const categoryArg = argValue("category");

const CATEGORIES = categoryArg
  ? [categoryArg]
  : ["restaurants", "bars", "cafes", "hotels", "bakeries", "spas", "gyms", "healthcare", "vets", "real-estate"];

// Map category (script name) → DB category name
const CATEGORY_DB_MAP = {
  restaurants: "restaurant",
  bars: "bar",
  cafes: "cafe",
  hotels: "hotel",
  bakeries: "bakery",
  spas: "spa",
  gyms: "gym",
  healthcare: "healthcare",
  vets: "veterinarian",
  "real-estate": "real-estate",
};

mkdirSync("data/import-previews", { recursive: true });
mkdirSync("reports", { recursive: true });

const allStats = [];

for (const category of CATEGORIES) {
  const previewPath = `data/import-previews/${category}-zone-topup-preview-${stamp}.json`;
  if (!existsSync(previewPath)) {
    console.warn(`Missing preview for ${category}: ${previewPath}`);
    continue;
  }

  const candidates = JSON.parse(readFileSync(previewPath, "utf8"));
  const dbCategory = CATEGORY_DB_MAP[category] ?? category;

  const approved = [];
  const rejected = [];

  for (const place of candidates) {
    const reason = isBlocked(place, dbCategory);
    if (reason) {
      rejected.push({ ...place, filter_reason: reason });
    } else {
      approved.push(place);
    }
  }

  // Write approved
  const outPath = `data/import-previews/${category}-zone-topup-approved-${stamp}.json`;
  writeFileSync(outPath, `${JSON.stringify(approved, null, 2)}\n`, "utf8");

  // Write report
  const reportLines = [
    `# ${category} Zone Top-Up Filter Report`,
    "",
    `Stamp: ${stamp}`,
    `Total candidates: ${candidates.length}`,
    `Approved: ${approved.length}`,
    `Rejected: ${rejected.length}`,
    "",
    "## Approved (ready for import)",
    "",
    "| Area | Name | Rating | Reviews | Type | Address |",
    "|---|---|---:|---:|---|---|",
    ...approved.map((p) => `| ${p.zone_topup_area ?? "-"} | ${p.name} | ${p.rating} | ${p.reviews_count} | ${p.primary_type ?? "-"} | ${(p.address ?? "").slice(0, 60)} |`),
    "",
    "## Rejected",
    "",
    "| Reason | Area | Name | Rating | Reviews | Type | Address |",
    "|---|---|---|---:|---:|---|---|",
    ...rejected.map((p) => `| ${p.filter_reason} | ${p.zone_topup_area ?? "-"} | ${p.name} | ${p.rating} | ${p.reviews_count} | ${p.primary_type ?? "-"} | ${(p.address ?? "").slice(0, 60)} |`),
  ];
  const reportPath = `reports/${category}-zone-topup-filter-report-${stamp}.md`;
  writeFileSync(reportPath, `${reportLines.join("\n")}\n`, "utf8");

  console.log(`${category.padEnd(14)}: ${String(candidates.length).padStart(4)} in → ${String(approved.length).padStart(4)} approved / ${String(rejected.length).padStart(4)} rejected → ${outPath}`);
  allStats.push({ category, total: candidates.length, approved: approved.length, rejected: rejected.length });
}

console.log(`\nDone. Approved files written to data/import-previews/`);
console.log("Total:", allStats.reduce((s, x) => s + x.total, 0), "in →", allStats.reduce((s, x) => s + x.approved, 0), "approved");
