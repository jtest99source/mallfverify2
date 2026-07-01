/**
 * Comprehensive validity audit across all categories.
 *
 * Established categories (restaurant, hotel, beach-club, bar, cafe, nightlife,
 * activity, boat-rental): published/premium only — spot wrong primary_type that
 * slipped through the original import.
 *
 * New/preparing categories (rent-a-car, car-dealer, spa, gym, healthcare,
 * real-estate): all statuses (hidden, draft, published) — full pipeline view.
 *
 * For each business the check answers: does the Google primary_type fit the
 * category we put it in? If not, it's flagged with a suggested action.
 *
 * No database writes are made.
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ── types ─────────────────────────────────────────────────────────────────────

type BusinessRow = {
  id: string;
  slug: string | null;
  name: string | null;
  display_name: string | null;
  category: string | null;
  status: string | null;
  area: string | null;
  city: string | null;
  rating: number | null;
  reviews_count: number | null;
  google_place_id: string | null;
  primary_type: string | null;
  raw_google_place: Record<string, unknown> | null;
  editorial_generated_at: string | null;
  detail_enriched_at: string | null;
  primary_image_url: string | null;
};

type Concern = {
  level: "wrong-category" | "borderline" | "quality";
  note: string;
  suggested?: string;
};

// ── config ────────────────────────────────────────────────────────────────────

const ESTABLISHED = ["restaurant", "hotel", "beach-club", "bar", "cafe", "nightlife", "activity", "boat-rental"];
const NEW_CATEGORIES = ["rent-a-car", "car-dealer", "spa", "gym", "healthcare", "real-estate"];
const PUBLIC = ["published", "premium"];
const PAGE_SIZE = 1000;

const THRESHOLDS: Record<string, { minRating: number; minReviews: number }> = {
  "restaurant":  { minRating: 4.0, minReviews: 50 },
  "hotel":       { minRating: 4.1, minReviews: 80 },
  "beach-club":  { minRating: 4.0, minReviews: 30 },
  "bar":         { minRating: 4.0, minReviews: 30 },
  "cafe":        { minRating: 4.2, minReviews: 20 },
  "nightlife":   { minRating: 3.8, minReviews: 100 },
  "activity":    { minRating: 4.3, minReviews: 15 },
  "boat-rental": { minRating: 4.2, minReviews: 10 },
  "rent-a-car":  { minRating: 3.8, minReviews: 50 },
  "car-dealer":  { minRating: 3.9, minReviews: 15 },
  "spa":         { minRating: 4.2, minReviews: 15 },
  "gym":         { minRating: 4.0, minReviews: 20 },
  "healthcare":  { minRating: 4.0, minReviews: 8 },
  "real-estate": { minRating: 3.9, minReviews: 8 },
};

// ── helpers ───────────────────────────────────────────────────────────────────

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const sep = t.indexOf("=");
    if (sep === -1) continue;
    const k = t.slice(0, sep).trim();
    const v = t.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function publicName(row: BusinessRow) {
  return (row.display_name?.trim() || row.name?.trim() || "").replace(/\|/g, "\\|");
}

function normName(row: BusinessRow) {
  return publicName(row).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function rawTypes(row: BusinessRow): string[] {
  const rt = row.raw_google_place;
  const extra = rt && Array.isArray(rt.types) ? (rt.types as unknown[]).filter((x): x is string => typeof x === "string") : [];
  return [...new Set([row.primary_type ?? "", ...extra].filter(Boolean))];
}

function has(types: string[], ...terms: string[]) {
  return types.some(t => terms.some(term => t === term || t.includes(term)));
}

function nameHas(row: BusinessRow, ...terms: string[]) {
  const n = normName(row);
  return terms.some(t => n.includes(t));
}

function fmt(v: unknown) {
  if (v === null || v === undefined || v === "") return "-";
  return String(v).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function isPublic(status: string | null) {
  return PUBLIC.includes(status ?? "");
}

// ── validity rules ─────────────────────────────────────────────────────────────

const RESTAURANT_TYPES = [
  "restaurant", "mediterranean_restaurant", "spanish_restaurant", "italian_restaurant",
  "french_restaurant", "american_restaurant", "seafood_restaurant", "pizza_restaurant",
  "sushi_restaurant", "steak_house", "hamburger_restaurant", "chicken_restaurant",
  "sandwich_shop", "tapas_restaurant", "asian_restaurant", "japanese_restaurant",
  "chinese_restaurant", "thai_restaurant", "indian_restaurant", "turkish_restaurant",
  "mexican_restaurant", "greek_restaurant", "korean_restaurant", "german_restaurant",
  "argentinian_restaurant", "portuguese_restaurant", "vegan_restaurant",
  "vegetarian_restaurant", "food_truck", "brunch_restaurant", "breakfast_restaurant",
  "fine_dining_restaurant", "fast_food_restaurant", "taco_restaurant", "snack_bar",
  "food", "bar_and_grill"
];

const HOTEL_TYPES = [
  "hotel", "resort_hotel", "lodging", "bed_and_breakfast", "motel", "hostel",
  "extended_stay_hotel", "campground", "vacation_rental", "apartment_complex",
  "resort", "inn"
];

const BAR_TYPES = ["bar", "pub", "wine_bar", "sports_bar"];
const NIGHTLIFE_TYPES = ["night_club", "cocktail_bar", "lounge_bar", "bar", "pub", "live_music_venue", "concert_hall", "karaoke"];
const CAFE_TYPES = ["cafe", "coffee_shop", "bakery", "ice_cream_shop", "dessert_shop", "pastry_shop"];
const ACTIVITY_TYPES = [
  "tourist_attraction", "tour_operator", "travel_agency", "amusement_park", "water_park",
  "zoo", "aquarium", "sports_club", "sports_activity_location", "bowling_alley", "casino",
  "movie_theater", "museum", "art_gallery", "winery", "farm", "golf_course", "hiking_area",
  "live_music_venue", "concert_hall", "escape_room", "adventure_sports_center"
];
const BOAT_TYPES = ["boat_rental", "water_sports", "marina", "sailing_school", "tourist_attraction"];
const CAR_RENTAL_TYPES = ["car_rental"];
const CAR_DEALER_TYPES = ["car_dealer", "used_car_dealer"];
const SPA_CORE_TYPES = ["spa", "massage", "massage_spa", "wellness_center", "sauna"];
const SPA_BORDERLINE_TYPES = ["beauty_salon", "health", "beautician", "aesthetician", "hair_care"];
const GYM_TYPES = ["gym", "fitness_center", "yoga_studio", "pilates_studio", "sports_club", "sports_activity_location", "martial_arts_school", "dance_studio"];
const HEALTHCARE_TYPES = ["doctor", "hospital", "medical_clinic", "dentist", "dental_clinic", "physiotherapist", "health", "medical_center", "urgent_care_center", "pharmacy"];
const REAL_ESTATE_TYPES = ["real_estate_agency"];

function checkConcern(row: BusinessRow): Concern | null {
  const category = row.category ?? "";
  const types = rawTypes(row);
  const primary = row.primary_type ?? "";
  const threshold = THRESHOLDS[category];

  // ── quality check for published (applies to all categories) ──────────────
  if (isPublic(row.status) && threshold) {
    const belowRating = row.rating !== null && row.rating < threshold.minRating;
    const belowReviews = row.reviews_count !== null && row.reviews_count < threshold.minReviews;
    if (belowRating || belowReviews) {
      const quality: Concern = {
        level: "quality",
        note: `Below threshold: min ${threshold.minRating}★/${threshold.minReviews} reviews, has ${row.rating ?? "-"}★/${row.reviews_count ?? "-"} reviews`
      };
      // Don't return yet; type check takes priority
    }
  }

  // ── RESTAURANT ────────────────────────────────────────────────────────────
  if (category === "restaurant") {
    if (has(types, ...HOTEL_TYPES)) return { level: "wrong-category", note: "Hotel type in restaurant", suggested: "hotel" };
    if (has(types, "night_club")) return { level: "wrong-category", note: "Nightclub type in restaurant", suggested: "nightlife" };
    if (has(types, "car_rental")) return { level: "wrong-category", note: "Car rental type in restaurant", suggested: "rent-a-car" };
    if (has(types, "real_estate_agency")) return { level: "wrong-category", note: "Real estate type in restaurant", suggested: "real-estate" };
    if (has(types, "scenic_point", "natural_feature")) return { level: "wrong-category", note: "Scenic/natural type in restaurant" };
    if (has(types, "supermarket", "grocery_store", "wholesale_store")) return { level: "wrong-category", note: "Market/supermarket type in restaurant", suggested: "market" };
    if (!has(types, ...RESTAURANT_TYPES) && !has(types, ...CAFE_TYPES) && !has(types, ...BAR_TYPES)) {
      return { level: "borderline", note: `Weak restaurant signal: primary_type=${primary}` };
    }
    // Quality
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── HOTEL ─────────────────────────────────────────────────────────────────
  if (category === "hotel") {
    if (has(types, "night_club")) return { level: "wrong-category", note: "Nightclub type in hotel", suggested: "nightlife" };
    if (has(types, "car_rental")) return { level: "wrong-category", note: "Car rental type in hotel", suggested: "rent-a-car" };
    if (has(types, "real_estate_agency")) return { level: "wrong-category", note: "Real estate type in hotel", suggested: "real-estate" };
    if (!has(types, ...HOTEL_TYPES)) {
      return { level: "borderline", note: `Weak hotel signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── BEACH-CLUB ────────────────────────────────────────────────────────────
  if (category === "beach-club") {
    // Beach clubs are legitimately typed as restaurant/bar by Google; check name signals instead
    const beachSignal = nameHas(row, "beach club", "beachclub", "beach bar", "chiringuito", "balneario", "beach", "playa");
    if (has(types, ...HOTEL_TYPES) && !beachSignal) return { level: "borderline", note: "Hotel type; lacks beach-club name signal", suggested: "hotel" };
    if (has(types, "car_rental")) return { level: "wrong-category", note: "Car rental type in beach-club", suggested: "rent-a-car" };
    if (has(types, "home_improvement_store", "furniture_store", "hardware_store")) return { level: "wrong-category", note: "Retail store in beach-club" };
    if (!has(types, ...RESTAURANT_TYPES, ...BAR_TYPES, "beach", "tourist_attraction") && !beachSignal) {
      return { level: "borderline", note: `Unusual type for beach-club: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── BAR ───────────────────────────────────────────────────────────────────
  if (category === "bar") {
    // Wrong: clearly a restaurant type
    if (has(types, ...RESTAURANT_TYPES.filter(t => t !== "bar_and_grill" && t !== "snack_bar"))) {
      return { level: "wrong-category", note: `Restaurant type in bar (${primary})`, suggested: "restaurant" };
    }
    // Wrong: nightlife
    if (has(types, "night_club")) {
      return { level: "wrong-category", note: "Nightclub type; should be in nightlife", suggested: "nightlife" };
    }
    // Wrong: hotel
    if (has(types, ...HOTEL_TYPES)) {
      return { level: "wrong-category", note: `Hotel type in bar (${primary})`, suggested: "hotel" };
    }
    // Wrong: car rental / dealer
    if (has(types, "car_rental")) return { level: "wrong-category", note: "Car rental type in bar", suggested: "rent-a-car" };
    if (has(types, "car_dealer", "used_car_dealer")) return { level: "wrong-category", note: "Car dealer type in bar", suggested: "car-dealer" };
    // Borderline: lounge_bar / cocktail_bar → could be nightlife
    if (has(types, "cocktail_bar", "lounge_bar") && !has(types, "bar", "pub")) {
      return { level: "borderline", note: `cocktail_bar/lounge_bar — could be nightlife instead`, suggested: "nightlife" };
    }
    // Borderline: no bar signal
    if (!has(types, ...BAR_TYPES, "cocktail_bar", "lounge_bar", "live_music_venue")) {
      return { level: "borderline", note: `Weak bar signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── CAFE ──────────────────────────────────────────────────────────────────
  if (category === "cafe") {
    // Wrong: clearly a restaurant
    if (has(types, ...RESTAURANT_TYPES.filter(t => !CAFE_TYPES.includes(t) && t !== "snack_bar" && t !== "bar_and_grill"))) {
      return { level: "wrong-category", note: `Restaurant type in cafe (${primary})`, suggested: "restaurant" };
    }
    // Wrong: hotel
    if (has(types, ...HOTEL_TYPES)) {
      return { level: "wrong-category", note: `Hotel type in cafe (${primary})`, suggested: "hotel" };
    }
    // Wrong: nightlife
    if (has(types, "night_club")) {
      return { level: "wrong-category", note: "Nightclub type in cafe", suggested: "nightlife" };
    }
    // Wrong: car rental
    if (has(types, "car_rental")) return { level: "wrong-category", note: "Car rental type in cafe", suggested: "rent-a-car" };
    // Wrong: scenic/natural
    if (primary === "scenic_point" || primary === "natural_feature") {
      return { level: "wrong-category", note: `Scenic/viewpoint place in cafe (${primary})` };
    }
    // Wrong: store/retail
    if (has(types, "store", "market", "supermarket", "department_store", "clothing_store", "home_goods_store")) {
      return { level: "wrong-category", note: `Retail store in cafe (${primary})` };
    }
    // Borderline: bar type
    if (has(types, "bar", "pub", "sports_bar") && !has(types, ...CAFE_TYPES)) {
      return { level: "borderline", note: `Bar type in cafe (${primary}) — could be bar`, suggested: "bar" };
    }
    // Borderline: weak signal
    if (!has(types, ...CAFE_TYPES)) {
      return { level: "borderline", note: `Weak cafe signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── NIGHTLIFE ─────────────────────────────────────────────────────────────
  if (category === "nightlife") {
    if (has(types, ...HOTEL_TYPES)) return { level: "wrong-category", note: `Hotel in nightlife (${primary})`, suggested: "hotel" };
    if (has(types, "car_rental")) return { level: "wrong-category", note: "Car rental in nightlife", suggested: "rent-a-car" };
    if (!has(types, ...NIGHTLIFE_TYPES)) {
      return { level: "borderline", note: `Weak nightlife signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── ACTIVITY ──────────────────────────────────────────────────────────────
  if (category === "activity") {
    if (has(types, ...HOTEL_TYPES)) return { level: "wrong-category", note: `Hotel in activity (${primary})`, suggested: "hotel" };
    if (has(types, "car_rental")) return { level: "wrong-category", note: "Car rental in activity", suggested: "rent-a-car" };
    if (has(types, "car_dealer", "used_car_dealer")) return { level: "wrong-category", note: "Car dealer in activity", suggested: "car-dealer" };
    if (has(types, "real_estate_agency")) return { level: "wrong-category", note: "Real estate in activity", suggested: "real-estate" };
    if (!has(types, ...ACTIVITY_TYPES)) {
      return { level: "borderline", note: `Weak activity signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── BOAT-RENTAL ───────────────────────────────────────────────────────────
  if (category === "boat-rental") {
    if (has(types, ...HOTEL_TYPES)) return { level: "wrong-category", note: `Hotel in boats (${primary})`, suggested: "hotel" };
    if (has(types, "car_rental")) return { level: "wrong-category", note: "Car rental in boats", suggested: "rent-a-car" };
    if (has(types, ...RESTAURANT_TYPES.filter(t => t !== "food"))) {
      return { level: "borderline", note: `Restaurant type in boats (${primary}) — confirm it's a boat rental` };
    }
    const boatSignal = has(types, ...BOAT_TYPES) || nameHas(row, "boat", "charter", "yacht", "sail", "barco", "llaut", "velero", "catamaran", "vela", "yate");
    if (!boatSignal) {
      return { level: "borderline", note: `Weak boat-rental signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── RENT-A-CAR ────────────────────────────────────────────────────────────
  if (category === "rent-a-car") {
    if (has(types, ...HOTEL_TYPES)) return { level: "wrong-category", note: `Hotel in rent-a-car (${primary})`, suggested: "hotel" };
    if (has(types, "car_dealer", "used_car_dealer")) return { level: "wrong-category", note: "Car dealer type in rent-a-car", suggested: "car-dealer" };
    if (has(types, "car_repair")) return { level: "wrong-category", note: "Car repair/workshop in rent-a-car" };
    if (primary === "chauffeur_service") return { level: "wrong-category", note: "Chauffeur service — not standard car rental" };
    const bikeSignal = nameHas(row, "bike ", " bike", "bikes", "e-bike", "bicycle", "cycling", "bicicleta") || primary === "bicycle_store" || primary === "bicycle_rental";
    if (bikeSignal && !has(types, ...CAR_RENTAL_TYPES)) return { level: "wrong-category", note: "Bike/cycling rental in rent-a-car" };
    if (!has(types, ...CAR_RENTAL_TYPES) && !nameHas(row, "rent", "rental", "alquiler", "hire")) {
      return { level: "borderline", note: `Weak rent-a-car signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── CAR-DEALER ────────────────────────────────────────────────────────────
  if (category === "car-dealer") {
    if (has(types, ...HOTEL_TYPES)) return { level: "wrong-category", note: `Hotel in car-dealer (${primary})`, suggested: "hotel" };
    if (has(types, ...CAR_RENTAL_TYPES)) return { level: "wrong-category", note: "Car rental type in car-dealer", suggested: "rent-a-car" };
    if (has(types, "car_repair") && !has(types, ...CAR_DEALER_TYPES)) return { level: "borderline", note: "Car repair/workshop signal — confirm is dealer" };
    const dealerNameSignal = nameHas(row, "concesionario", "compraventa", "used car", "coches ocasion", "coches de ocasion", "gebrauchtwagen", "autohandler", "cars", "autos", "motor", "auto ");
    if (!has(types, ...CAR_DEALER_TYPES) && !dealerNameSignal) {
      return { level: "borderline", note: `Weak car-dealer signal: primary_type=${primary} — verify manually` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── SPA ───────────────────────────────────────────────────────────────────
  if (category === "spa") {
    if (has(types, ...HOTEL_TYPES)) return { level: "wrong-category", note: `Hotel in spa — already in hotel category (${primary})`, suggested: "hotel" };
    if (has(types, "hair_salon", "nail_salon", "barber_shop")) return { level: "wrong-category", note: `Hair/nail salon in spa (${primary})` };
    if (has(types, "gym", "fitness_center")) return { level: "wrong-category", note: "Gym/fitness in spa", suggested: "gym" };
    if (has(types, ...RESTAURANT_TYPES.filter(t => !SPA_BORDERLINE_TYPES.includes(t)))) return { level: "wrong-category", note: `Restaurant type in spa (${primary})`, suggested: "restaurant" };
    if (has(types, "car_rental")) return { level: "wrong-category", note: "Car rental in spa", suggested: "rent-a-car" };
    if (has(types, "tourist_attraction", "natural_feature")) return { level: "borderline", note: `Tourist attraction / nature in spa (${primary})` };
    if (has(types, "physiotherapist", "medical_clinic", "doctor", "hospital", "dentist")) {
      return { level: "borderline", note: `Medical/physio signal in spa (${primary}) — consider healthcare category` };
    }
    const adultSignal = nameHas(row, "erotic", "tantra", "tantric", "sensual");
    if (adultSignal) return { level: "wrong-category", note: "Adult/erotic massage signal — should stay hidden" };
    if (!has(types, ...SPA_CORE_TYPES, ...SPA_BORDERLINE_TYPES)) {
      return { level: "borderline", note: `Weak spa signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── GYM ───────────────────────────────────────────────────────────────────
  if (category === "gym") {
    if (has(types, ...HOTEL_TYPES)) return { level: "wrong-category", note: `Hotel in gym (${primary})`, suggested: "hotel" };
    if (has(types, "car_rental")) return { level: "wrong-category", note: "Car rental in gym", suggested: "rent-a-car" };
    if (has(types, ...RESTAURANT_TYPES.filter(t => t !== "food"))) return { level: "wrong-category", note: `Restaurant type in gym (${primary})`, suggested: "restaurant" };
    if (!has(types, ...GYM_TYPES)) {
      return { level: "borderline", note: `Weak gym signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── HEALTHCARE ────────────────────────────────────────────────────────────
  if (category === "healthcare") {
    if (has(types, ...HOTEL_TYPES)) return { level: "wrong-category", note: `Hotel in healthcare (${primary})`, suggested: "hotel" };
    if (has(types, "spa", "massage", "beauty_salon", "wellness_center") && !has(types, ...HEALTHCARE_TYPES)) {
      return { level: "wrong-category", note: `Beauty/spa type in healthcare (${primary})`, suggested: "spa" };
    }
    if (!has(types, ...HEALTHCARE_TYPES)) {
      return { level: "borderline", note: `Weak healthcare signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  // ── REAL-ESTATE ───────────────────────────────────────────────────────────
  if (category === "real-estate") {
    if (has(types, ...HOTEL_TYPES)) return { level: "wrong-category", note: `Hotel in real-estate (${primary})`, suggested: "hotel" };
    if (has(types, ...RESTAURANT_TYPES.filter(t => t !== "food"))) return { level: "wrong-category", note: `Restaurant type in real-estate (${primary})`, suggested: "restaurant" };
    if (!has(types, ...REAL_ESTATE_TYPES) && !nameHas(row, "inmobiliaria", "real estate", "immobilien", "property")) {
      return { level: "borderline", note: `Weak real-estate signal: primary_type=${primary}` };
    }
    if (threshold && isPublic(row.status)) {
      if ((row.rating ?? 5) < threshold.minRating || (row.reviews_count ?? 999) < threshold.minReviews) {
        return { level: "quality", note: `Below threshold (${threshold.minRating}★/${threshold.minReviews}rev): ${row.rating ?? "-"}★/${row.reviews_count ?? "-"}rev` };
      }
    }
    return null;
  }

  return null;
}

// ── fetch ─────────────────────────────────────────────────────────────────────

async function fetchRows(): Promise<BusinessRow[]> {
  const supabase = createSupabaseClient();
  const allCategories = [...ESTABLISHED, ...NEW_CATEGORIES];
  const rows: BusinessRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,area,city,rating,reviews_count,google_place_id,primary_type,raw_google_place,editorial_generated_at,detail_enriched_at,primary_image_url")
      .in("category", allCategories)
      .order("category", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  // Deduplicate
  const seen = new Set<string>();
  return rows.filter(r => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ── render ────────────────────────────────────────────────────────────────────

function renderCategory(category: string, rows: BusinessRow[]) {
  const isNew = NEW_CATEGORIES.includes(category);
  const scope = isNew ? "all statuses" : "published/premium only";

  const published = rows.filter(r => isPublic(r.status));
  const draft     = rows.filter(r => r.status === "draft");
  const hidden    = rows.filter(r => r.status === "hidden");

  const concerns: Array<{ row: BusinessRow; concern: Concern }> = [];
  for (const row of rows) {
    // For established categories: only check published
    if (!isNew && !isPublic(row.status)) continue;
    const c = checkConcern(row);
    if (c) concerns.push({ row, concern: c });
  }

  const wrongCat  = concerns.filter(x => x.concern.level === "wrong-category");
  const borderline = concerns.filter(x => x.concern.level === "borderline");
  const quality    = concerns.filter(x => x.concern.level === "quality");

  // For new categories: compute publish-ready count (valid + meets threshold)
  const publishReady = isNew ? rows.filter(r => {
    const t = THRESHOLDS[category];
    const meetsQuality = !t || ((r.rating ?? 0) >= t.minRating && (r.reviews_count ?? 0) >= t.minReviews);
    const c = checkConcern(r);
    return meetsQuality && (!c || c.level === "borderline"); // borderline can still be reviewed
  }).length : null;

  const totalIssues = wrongCat.length + borderline.length + quality.length;
  const issueLabel = totalIssues === 0
    ? "✅ No issues found"
    : `⚠️ ${wrongCat.length} wrong-category, ${borderline.length} borderline, ${quality.length} below-threshold`;

  const header = `## ${category.toUpperCase()}`;
  const meta = isNew
    ? `Scope: ${scope} | Published: ${published.length} | Draft: ${draft.length} | Hidden: ${hidden.length} | Total: ${rows.length}`
    : `Scope: ${scope} | Published: ${published.length}`;

  const lines: string[] = [
    header,
    "",
    meta,
    "",
    issueLabel,
  ];

  if (wrongCat.length > 0) {
    lines.push(
      "",
      "### Wrong Category (action: hide or recategorize)",
      "",
      "| Name | Status | City | Rating | Reviews | primary_type | Concern | Suggested | Slug |",
      "|---|---|---|---:|---:|---|---|---|---|",
      ...wrongCat.map(({ row, concern }) =>
        `| ${fmt(publicName(row))} | ${fmt(row.status)} | ${fmt(row.city || row.area)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(concern.note)} | ${fmt(concern.suggested ?? "-")} | ${fmt(row.slug)} |`
      )
    );
  }

  if (borderline.length > 0) {
    lines.push(
      "",
      "### Borderline (manual review needed)",
      "",
      "| Name | Status | City | Rating | Reviews | primary_type | Concern | Suggested | Slug |",
      "|---|---|---|---:|---:|---|---|---|---|",
      ...borderline.map(({ row, concern }) =>
        `| ${fmt(publicName(row))} | ${fmt(row.status)} | ${fmt(row.city || row.area)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(concern.note)} | ${fmt(concern.suggested ?? "-")} | ${fmt(row.slug)} |`
      )
    );
  }

  if (quality.length > 0) {
    lines.push(
      "",
      "### Below Quality Threshold (action: hide or keep in draft)",
      "",
      "| Name | Status | City | Rating | Reviews | Concern | Slug |",
      "|---|---|---:|---:|---:|---|---|",
      ...quality.map(({ row, concern }) =>
        `| ${fmt(publicName(row))} | ${fmt(row.status)} | ${fmt(row.city || row.area)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(concern.note)} | ${fmt(row.slug)} |`
      )
    );
  }

  if (isNew) {
    const validPublished = published.filter(r => {
      const c = checkConcern(r);
      return !c || c.level === "quality";
    }).length;
    const validDraft = draft.filter(r => {
      const c = checkConcern(r);
      const t = THRESHOLDS[category];
      return (!c || c.level === "quality") && t && (r.rating ?? 0) >= t.minRating && (r.reviews_count ?? 0) >= t.minReviews;
    }).length;
    const validHidden = hidden.filter(r => {
      const c = checkConcern(r);
      const t = THRESHOLDS[category];
      return (!c || c.level === "quality") && t && (r.rating ?? 0) >= t.minRating && (r.reviews_count ?? 0) >= t.minReviews;
    }).length;

    lines.push(
      "",
      `**Pipeline: ${validPublished} valid published | ${validDraft} draft ready to publish | ${validHidden} hidden ready to promote to draft**`
    );
  }

  lines.push("");
  return lines.join("\n");
}

async function main() {
  loadLocalEnv();
  const all = await fetchRows();

  const byCategory = new Map<string, BusinessRow[]>();
  for (const row of all) {
    const cat = row.category ?? "unknown";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(row);
  }

  const totalPublished = all.filter(r => isPublic(r.status)).length;
  const totalDraft     = all.filter(r => r.status === "draft").length;
  const totalHidden    = all.filter(r => r.status === "hidden").length;

  const allConcerns: Array<{ category: string; concern: Concern }> = [];
  for (const [cat, rows] of byCategory) {
    const isNew = NEW_CATEGORIES.includes(cat);
    for (const row of rows) {
      if (!isNew && !isPublic(row.status)) continue;
      const c = checkConcern(row);
      if (c) allConcerns.push({ category: cat, concern: c });
    }
  }

  const categoryOrder = [...ESTABLISHED, ...NEW_CATEGORIES];

  const lines: string[] = [
    "# Total Business Validity Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Established categories (restaurant, hotel, beach-club, bar, cafe, nightlife, activity, boat-rental): published/premium only.",
    "New/preparing categories (rent-a-car, car-dealer, spa, gym, healthcare, real-estate): all statuses.",
    "",
    "## Global Summary",
    "",
    `- Total businesses in scope: ${all.length}`,
    `- Published/premium: ${totalPublished}`,
    `- Draft: ${totalDraft}`,
    `- Hidden: ${totalHidden}`,
    `- Total concerns: ${allConcerns.length} (${allConcerns.filter(x => x.concern.level === "wrong-category").length} wrong-category, ${allConcerns.filter(x => x.concern.level === "borderline").length} borderline, ${allConcerns.filter(x => x.concern.level === "quality").length} below-threshold)`,
    "",
    "## Category Breakdown",
    "",
    "| Category | Mode | Published | Draft | Hidden | Wrong-cat | Borderline | Below-threshold |",
    "|---|---|---:|---:|---:|---:|---:|---:|",
    ...categoryOrder.map(cat => {
      const rows = byCategory.get(cat) ?? [];
      const isNew = NEW_CATEGORIES.includes(cat);
      const pub = rows.filter(r => isPublic(r.status)).length;
      const dra = rows.filter(r => r.status === "draft").length;
      const hid = rows.filter(r => r.status === "hidden").length;
      const concerns = rows
        .filter(r => isNew || isPublic(r.status))
        .map(r => checkConcern(r))
        .filter((c): c is Concern => c !== null);
      const wrong  = concerns.filter(c => c.level === "wrong-category").length;
      const border = concerns.filter(c => c.level === "borderline").length;
      const qual   = concerns.filter(c => c.level === "quality").length;
      const mode   = isNew ? "all statuses" : "pub only";
      return `| ${cat} | ${mode} | ${pub} | ${dra} | ${hid} | ${wrong} | ${border} | ${qual} |`;
    }),
    "",
    "---",
    "",
    ...categoryOrder.map(cat => {
      const rows = byCategory.get(cat) ?? [];
      return renderCategory(cat, rows);
    })
  ];

  const text = lines.join("\n");
  mkdirSync("reports", { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = join("reports", `total-validity-audit-${stamp}.md`);
  writeFileSync(path, text, "utf8");
  console.log(JSON.stringify({ reportPath: path, total: all.length, concerns: allConcerns.length }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
