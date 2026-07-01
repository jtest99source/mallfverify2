import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const OUTPUT_DIR = "data/import-previews";
const REPORT_DIR = "reports";

function argValue(name) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function categoryFromPath(filePath) {
  const basename = path.basename(filePath);
  if (basename.includes("-zone-topup-preview-")) return basename.split("-zone-topup-preview-")[0];
  if (basename.endsWith("-preview.json")) return basename.replace("-preview.json", "");
  return basename.replace(".json", "");
}

function latestPreviewFor(category) {
  const prefix = `${category}-zone-topup-preview-`;
  const matches = readdirSync(OUTPUT_DIR)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".json"))
    .map((name) => path.join(OUTPUT_DIR, name))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  if (!matches.length) throw new Error(`No zone-topup preview found for ${category}`);
  return matches[0];
}

function selectedPreviewPaths() {
  const explicit = argValue("previews");
  if (explicit) return explicit.split(",").map((item) => item.trim()).filter(Boolean);

  const categories = (argValue("categories") ?? "restaurants,bars,cafes,healthcare,vets")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return categories.map(latestPreviewFor);
}

function rowTypes(row) {
  return [row.primary_type, ...(Array.isArray(row.types) ? row.types : [])].filter(Boolean);
}

function hasAnyType(row, types) {
  const values = new Set(rowTypes(row));
  return types.some((type) => values.has(type));
}

function hasName(row, keywords) {
  const name = normalize(row.name);
  return keywords.some((keyword) => name.includes(normalize(keyword)));
}

function hasText(row, keywords) {
  const text = normalize(`${row.name} ${row.address} ${row.website} ${row.primary_type} ${rowTypes(row).join(" ")}`);
  return keywords.some((keyword) => text.includes(normalize(keyword)));
}

function isOffIsland(row) {
  const rawAddress = String(row.address ?? "").toLowerCase();
  const address = normalize(row.address);
  const name = normalize(row.name);
  return (
    /\b077\d{2}\b/.test(String(row.address ?? "")) ||
    [
      "menorca",
      "mao",
      "ciutadella",
      "son bou",
      "es mercadal",
      "ferreries",
      "ibiza",
      "sant antoni de portmany",
      "cadiz",
      "las palmas",
      "puertollano",
      "ciudad real",
      "cdad real",
      "andorra",
      "france",
      "italy",
      "italia",
      "bengaluru"
    ].some((keyword) => address.includes(normalize(keyword))) ||
    /\b08\d{3}\b/.test(String(row.address ?? "")) ||
    /\b28\d{3}\b/.test(String(row.address ?? "")) ||
    /\b29\d{3}\b/.test(String(row.address ?? "")) ||
    /\b46\d{3}\b/.test(String(row.address ?? "")) ||
    /\b17\d{3}\b/.test(String(row.address ?? "")) ||
    rawAddress.includes("barcelona, barcelona") ||
    rawAddress.includes("girona, girona") ||
    rawAddress.includes("tarragona, tarragona") ||
    rawAddress.includes("valència, valencia") ||
    rawAddress.includes("valencia, valencia") ||
    rawAddress.includes("madrid, madrid") ||
    rawAddress.includes("málaga") ||
    address.includes(" genova ge ") ||
    address.includes(" provincia de buenos aires ") ||
    address.endsWith(" argentina") ||
    (name.includes("menorca") && /\b077\d{2}\b/.test(String(row.address ?? "")))
  );
}

function reasonForRestaurant(row) {
  if (isOffIsland(row)) return "wrong geography";
  if (hasAnyType(row, ["lodging", "hotel", "resort_hotel", "extended_stay_hotel"])) return "hotel/lodging, not restaurant candidate";
  if (hasAnyType(row, ["supermarket", "grocery_store", "market", "fish_store", "furniture_store", "real_estate_agency"])) return "shop/market/service, not restaurant";
  if (hasAnyType(row, ["tourist_attraction", "museum", "church", "school", "university"])) return "attraction/institution, not restaurant";
  return null;
}

function reasonForBar(row) {
  if (isOffIsland(row)) return "wrong geography";
  if (hasAnyType(row, ["lodging", "hotel", "resort_hotel", "extended_stay_hotel"])) return "hotel/lodging, not bar candidate";
  if (hasAnyType(row, ["store", "supermarket", "grocery_store", "furniture_store", "real_estate_agency", "school", "university"])) return "shop/service/institution, not bar";
  if (hasAnyType(row, ["tourist_attraction", "marina", "association_or_organization"])) return "attraction/association, not bar";
  return null;
}

function reasonForCafe(row) {
  if (isOffIsland(row)) return "wrong geography";
  if (hasAnyType(row, ["lodging", "hotel", "resort_hotel", "extended_stay_hotel"])) return "hotel/lodging, not cafe candidate";
  const cafeSignal = hasAnyType(row, [
    "cafe",
    "cafeteria",
    "coffee_shop",
    "bakery",
    "pastry_shop",
    "cake_shop",
    "ice_cream_shop",
    "brunch_restaurant",
    "restaurant"
  ]) || hasName(row, ["cafe", "coffee", "brunch", "bakery", "panader", "pasteler", "forn", "helader", "gelat"]);
  if (!cafeSignal && hasAnyType(row, ["store", "supermarket", "grocery_store", "furniture_store", "real_estate_agency", "school", "university", "winery"])) return "shop/service/institution, not cafe";
  if (hasAnyType(row, ["night_club", "bar"]) && !hasAnyType(row, ["cafe", "coffee_shop", "bakery", "ice_cream_shop"])) return "bar/nightlife, not cafe";
  return null;
}

function reasonForHealthcare(row) {
  if (isOffIsland(row)) return "wrong geography";
  if (hasAnyType(row, ["gym", "fitness_center", "sports_activity_location", "lodging", "hotel", "store", "supermarket", "pet_store", "veterinary_care"])) return "obvious non-healthcare type";
  if (hasName(row, ["tiendanimal", "kiwoko", "gym", "fitness", "palestra", "hotel", "resort", "veterinaria", "veterinario"])) return "obvious non-healthcare name";
  return null;
}

function reasonForRealEstate(row) {
  if (isOffIsland(row)) return "wrong geography";
  if (hasAnyType(row, ["lodging", "hotel", "travel_agency", "tourist_attraction", "restaurant", "bar", "store", "furniture_store", "general_contractor"])) return "obvious non-real-estate type";
  if (hasName(row, ["holiday", "ferien", "vacation", "apartamentos", "hotel", "restaurant", "decorhome"])) return "obvious non-real-estate name";
  return null;
}

function reasonForSpas(row) {
  if (isOffIsland(row)) return "wrong geography";
  const spaSignal = hasAnyType(row, ["spa", "massage_spa", "massage_therapist", "beauty_salon", "wellness_center", "facial_spa"]) || hasName(row, ["spa", "massage", "masaje", "wellness", "thai", "beauty", "estetica", "relax"]);
  if (!spaSignal) return "no spa/wellness signal";
  if (hasAnyType(row, ["school", "university", "training_center", "gym", "fitness_center", "lodging", "hotel", "restaurant", "store"])) return "obvious non-spa type";
  if (hasName(row, ["campus training", "dancer", "academy", "formacion"])) return "obvious non-spa name";
  return null;
}

function reasonForGyms(row) {
  if (isOffIsland(row)) return "wrong geography";
  const gymSignal = hasAnyType(row, ["gym", "fitness_center", "sports_club", "sports_activity_location", "yoga_studio", "martial_arts_school", "athletic_field"]) || hasName(row, ["gym", "fitness", "crossfit", "yoga", "pilates", "padel", "pádel", "club", "deportivo", "muay", "box"]);
  if (!gymSignal) return "no gym/sports signal";
  if (hasAnyType(row, ["supermarket", "grocery_store", "lodging", "hotel", "restaurant", "real_estate_agency", "car_dealer"])) return "obvious non-gym type";
  if (hasName(row, ["lidl", "supermercado", "hotel", "resort", "residence", "sport shop", "tienda"])) return "obvious non-gym name";
  return null;
}

function reasonForNightlife(row) {
  if (isOffIsland(row)) return "wrong geography";
  const nightlifeSignal = hasAnyType(row, ["night_club", "bar", "pub", "karaoke", "live_music_venue", "disco", "event_venue", "cocktail_bar", "sports_bar"]) || hasName(row, ["club", "disco", "pub", "bar", "cocktail", "karaoke", "music", "beach club", "rooftop"]);
  if (!nightlifeSignal && hasAnyType(row, ["restaurant"])) return null;
  if (!nightlifeSignal) return "no nightlife/bar signal";
  if (hasAnyType(row, ["lodging", "hotel", "resort_hotel", "store", "shopping_mall", "marina", "school", "university"])) return "obvious non-nightlife type";
  if (hasName(row, ["hotel", "resort", "tienda", "shop", "nautico", "nautic", "boat charter"])) return "obvious non-nightlife name";
  return null;
}

function reasonForRentACar(row) {
  if (isOffIsland(row)) return "wrong geography";
  const rentalSignal = hasAnyType(row, ["car_rental", "scooter_rental_service", "motorcycle_rental_agency"]) || hasName(row, ["rent a car", "rental car", "alquiler coches", "car hire", "scooter", "moto rent", "cooltra"]);
  if (!rentalSignal) return "no rent-a-car signal";
  if (hasAnyType(row, ["boat_rental", "travel_agency", "lodging", "hotel", "restaurant", "store"]) && !rentalSignal) return "obvious non-rent-a-car type";
  if (hasName(row, ["boats", "yacht", "barco", "smart boats"])) return "boat rental, not rent-a-car";
  return null;
}

function reasonForCarDealers(row) {
  if (isOffIsland(row)) return "wrong geography";
  const dealerSignal = hasAnyType(row, ["car_dealer", "used_car_dealer"]) || hasName(row, ["concesionario", "automoviles", "automóviles", "coches", "cars", "auto", "motor"]);
  if (!dealerSignal) return "no car-dealer signal";
  if (!hasAnyType(row, ["car_dealer", "used_car_dealer"]) && hasAnyType(row, ["car_repair", "electronics_store", "lodging", "hotel", "restaurant"])) return "obvious non-dealer type";
  if (!hasAnyType(row, ["car_dealer", "used_car_dealer"]) && hasName(row, ["rent a car", "rental", "moto", "repair", "taller", "movil", "móvil", "tecnomovil"])) return "obvious non-dealer name";
  return null;
}

function reasonForBakeries(row) {
  if (isOffIsland(row)) return "wrong geography";
  const bakerySignal = hasAnyType(row, ["bakery", "pastry_shop", "cake_shop", "confectionery", "coffee_shop", "ice_cream_shop"]) || hasName(row, ["bakery", "panader", "pasteler", "forn", "horno", "cake", "gelat", "helader", "dulce"]);
  if (!bakerySignal) return "no bakery signal";
  if (hasAnyType(row, ["hotel", "lodging", "supermarket", "grocery_store", "restaurant", "bar", "store"]) && !bakerySignal) return "obvious non-bakery type";
  if (hasName(row, ["supermercado", "agromart", "hotel", "restaurant"])) return "obvious non-bakery name";
  return null;
}

function reasonForHotels(row) {
  if (isOffIsland(row)) return "wrong geography";
  const hotelSignal = hasAnyType(row, ["hotel", "lodging", "resort_hotel", "extended_stay_hotel", "bed_and_breakfast", "hostel"]) || hasName(row, ["hotel", "hostal", "finca", "agroturismo", "apartamentos", "resort"]);
  if (!hotelSignal) return "no hotel/lodging signal";
  if (hasAnyType(row, ["restaurant", "bar", "store", "real_estate_agency", "travel_agency"]) && !hotelSignal) return "obvious non-hotel type";
  if (hasName(row, ["airbnb", "casa en alquiler", "property", "ideal property"])) return "vacation rental/service listing";
  return null;
}

function reasonForCasinos(row) {
  if (isOffIsland(row)) return "wrong geography";
  const casinoSignal = hasAnyType(row, ["casino", "video_arcade", "bingo_hall", "sports_bar", "amusement_center"]) || hasName(row, ["casino", "bingo", "salon de juego", "salón de juego", "joc", "apuestas", "bet", "merkur", "orenes", "fun games", "tragaperras"]);
  if (!casinoSignal) return "no casino/gambling signal";
  if (hasAnyType(row, ["hotel", "lodging", "resort_hotel", "restaurant", "travel_agency"]) && !hasName(row, ["casino", "bingo", "joc", "apuestas", "bet", "merkur", "orenes", "fun games"])) return "obvious non-casino type";
  if (hasName(row, ["hotel", "aparthotel", "resort", "realidad virtual", "virtual reality"])) return "obvious non-casino name";
  return null;
}

function reasonForActivities(row) {
  if (isOffIsland(row)) return "wrong geography";
  const activitySignal = hasAnyType(row, [
    "adventure_sports_center",
    "amusement_center",
    "amusement_park",
    "aquarium",
    "athletic_field",
    "cycling_park",
    "diving_center",
    "escape_room_center",
    "event_venue",
    "farm",
    "horseback_riding_service",
    "karting_track",
    "park",
    "sports_activity_location",
    "tour_agency",
    "tour_operator",
    "tourist_attraction",
    "water_park"
  ]) || hasName(row, [
    "activity",
    "adventure",
    "aquarium",
    "buggy",
    "cata",
    "climbing",
    "coasteering",
    "diving",
    "escape",
    "experience",
    "karting",
    "kayak",
    "paddle",
    "paintball",
    "quad",
    "riding",
    "snorkel",
    "tour",
    "water sport"
  ]);
  if (!activitySignal) return "no activity/experience signal";
  if (hasAnyType(row, ["hotel", "lodging", "restaurant", "bar", "cafe", "supermarket", "store", "real_estate_agency"])) return "obvious non-activity type";
  if (hasName(row, ["hotel", "restaurant", "bar ", "supermercado", "inmobiliaria", "rent a car"])) return "obvious non-activity name";
  return null;
}

function reasonForVets(row) {
  if (isOffIsland(row)) return "wrong geography";
  const vetSignal = hasAnyType(row, ["veterinary_care"]) || hasName(row, ["vet", "veterin", "animal", "mascota"]);
  if (!vetSignal) return "no veterinary signal";
  if (hasAnyType(row, ["dentist", "dental_clinic", "doctor", "hospital", "medical_center", "gym", "supermarket"])) return "obvious non-vet type";
  if (!hasAnyType(row, ["veterinary_care"]) && hasAnyType(row, ["store", "pet_store"])) return "obvious non-vet type";
  if (hasName(row, ["clinica dental", "tiendanimal", "kiwoko", "pajareria", "autolavado"])) return "obvious non-vet name";
  return null;
}

function exclusionReason(category, row) {
  if (category === "restaurants") return reasonForRestaurant(row);
  if (category === "bars") return reasonForBar(row);
  if (category === "cafes") return reasonForCafe(row);
  if (category === "healthcare") return reasonForHealthcare(row);
  if (category === "real-estate") return reasonForRealEstate(row);
  if (category === "spas") return reasonForSpas(row);
  if (category === "gyms") return reasonForGyms(row);
  if (category === "nightlife") return reasonForNightlife(row);
  if (category === "rent-a-car") return reasonForRentACar(row);
  if (category === "car-dealers") return reasonForCarDealers(row);
  if (category === "bakeries") return reasonForBakeries(row);
  if (category === "hotels") return reasonForHotels(row);
  if (category === "casinos") return reasonForCasinos(row);
  if (category === "activities") return reasonForActivities(row);
  if (category === "vets") return reasonForVets(row);
  return isOffIsland(row) ? "wrong geography" : null;
}

function cleanPreview(filePath, stamp) {
  const category = categoryFromPath(filePath);
  const rows = JSON.parse(readFileSync(filePath, "utf8"));
  const kept = [];
  const removed = [];

  for (const row of rows) {
    const reason = exclusionReason(category, row);
    if (reason) removed.push({ ...row, exclusion_reason: reason });
    else kept.push(row);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  mkdirSync(REPORT_DIR, { recursive: true });
  const outputPreview = path.join(OUTPUT_DIR, `${category}-zone-topup-clean-preview-${stamp}.json`);
  const reportPath = path.join(REPORT_DIR, `${category}-zone-topup-clean-candidates-${stamp}.md`);

  writeFileSync(outputPreview, `${JSON.stringify(kept, null, 2)}\n`, "utf8");
  const lines = [
    `# ${category} Zone Top-Up Clean Candidates`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Source preview: ${filePath}`,
    `- Clean preview: ${outputPreview}`,
    `- Source rows: ${rows.length}`,
    `- Removed obvious junk: ${removed.length}`,
    `- Rows for Claude review: ${kept.length}`,
    "",
    "## Candidates For Claude Review",
    "",
    "| Area | Name | Rating | Reviews | Type | Website | Address |",
    "|---|---|---:|---:|---|---|---|",
    ...kept.map((row) => `| ${fmt(row.zone_topup_area)} | ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
    "",
    "## Removed Obvious Junk",
    "",
    "| Reason | Area | Name | Rating | Reviews | Type | Address |",
    "|---|---|---|---:|---:|---|---|",
    ...removed.map((row) => `| ${fmt(row.exclusion_reason)} | ${fmt(row.zone_topup_area)} | ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.address)} |`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  return {
    category,
    source: filePath,
    report: reportPath,
    preview: outputPreview,
    source_rows: rows.length,
    removed_obvious_junk: removed.length,
    rows: kept.length
  };
}

function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const results = selectedPreviewPaths().map((filePath) => {
    if (!existsSync(filePath)) throw new Error(`Preview not found: ${filePath}`);
    return cleanPreview(filePath, stamp);
  });

  console.log(JSON.stringify({ results }, null, 2));
}

main();
