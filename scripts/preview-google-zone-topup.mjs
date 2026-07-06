import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getPlaceCategoryConfig } from "./place-category-config.mjs";

const OUTPUT_DIR = "data/import-previews";
const REPORT_DIR = "reports";
const MAX_RESULTS_PER_CATEGORY = 1200;

const LEGACY_CONFIGS = {
  restaurants: {
    businessCategory: "restaurant",
    singular: "restaurant",
    minRating: 4.0,
    minReviews: 20
  },
  hotels: {
    businessCategory: "hotel",
    singular: "hotel",
    minRating: 4.0,
    minReviews: 20
  }
};

const AREA_SETS = {
  palma: [
    "Palma centro",
    "Santa Catalina Palma",
    "La Lonja Palma",
    "Paseo Maritimo Palma",
    "Portixol Palma",
    "El Molinar Palma",
    "Coll d'en Rabassa Palma",
    "Ciudad Jardin Palma",
    "Playa de Palma",
    "El Terreno Palma",
    "Son Armadams Palma",
    "Son Espanyolet Palma",
    "Son Cotoner Palma",
    "Son Rapinya Palma",
    "Blanquerna Palma",
    "Son Oliva Palma",
    "Pere Garau Palma",
    "Cala Major Palma",
    "Sant Agusti Palma",
    "Genova Palma",
    "Son Ferriol Palma"
  ],
  hubs: [
    "Calvia",
    "Santa Ponsa",
    "Palmanova",
    "Magaluf",
    "Peguera",
    "Port d'Andratx",
    "Soller",
    "Port de Soller",
    "Alcudia",
    "Port d'Alcudia",
    "Pollenca",
    "Port de Pollenca",
    "Can Picafort",
    "Playa de Muro",
    "Inca",
    "Manacor",
    "Llucmajor",
    "Cala Millor",
    "Cala Ratjada",
    "Arta",
    "Porto Cristo",
    "Cala d'Or",
    "Portocolom",
    "Santanyi",
    "Campos",
    "Colonia de Sant Jordi",
    "Felanitx",
    "Marratxi",
    "Santa Maria del Cami",
    "Binissalem",
    "Sineu"
  ],
  interior: [
    "Alaro",
    "Bunyola",
    "Esporles",
    "Valldemossa",
    "Fornalutx",
    "Deia",
    "Banyalbufar",
    "Estellencs",
    "Puigpunyent",
    "Sa Pobla",
    "Muro",
    "Santa Margalida",
    "Llubi",
    "Petra",
    "Ariany",
    "Sant Joan",
    "Vilafranca de Bonany",
    "Montuiri",
    "Porreres",
    "Algaida",
    "Sencelles",
    "Consell",
    "Lloseta",
    "Selva",
    "Campanet",
    "Buger",
    "Mancor de la Vall",
    "Costitx",
    "Lloret de Vistalegre",
    "Santa Eugenia",
    "Maria de la Salut",
    "Ses Salines",
    "Son Servera"
  ]
};

AREA_SETS.priority = [...AREA_SETS.palma, ...AREA_SETS.hubs];

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

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getConfig(category) {
  try {
    return getPlaceCategoryConfig(category);
  } catch {
    const legacy = LEGACY_CONFIGS[category];
    if (!legacy) throw new Error(`Unknown category "${category}".`);
    return legacy;
  }
}

function selectedCategories() {
  const raw = argValue("categories") ?? argValue("category") ?? "restaurants,bars,cafes,healthcare,vets";
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function selectedAreas() {
  const rawAreas = argValue("areas");
  if (rawAreas) return rawAreas.split(",").map((item) => item.trim()).filter(Boolean);

  const areaSet = argValue("area-set") ?? "priority";
  const areas = AREA_SETS[areaSet];
  if (!areas) throw new Error(`Unknown --area-set="${areaSet}". Use one of: ${Object.keys(AREA_SETS).join(", ")}`);
  return areas;
}

function categoryQueries(category, config, area) {
  const suffix = `${area} Mallorca`;
  const singular = config.singular ?? category;

  if (category === "restaurants") {
    return [
      `restaurants in ${suffix}`,
      `best restaurants ${suffix}`,
      `restaurante ${suffix}`,
      `donde comer ${suffix}`,
      `tapas ${suffix}`,
      `fine dining ${suffix}`
    ];
  }

  if (category === "bars") {
    return [
      `bars in ${suffix}`,
      `cocktail bars ${suffix}`,
      `tapas bars ${suffix}`,
      `wine bars ${suffix}`,
      `bares ${suffix}`,
      `bares de copas ${suffix}`
    ];
  }

  if (category === "cafes") {
    return [
      `cafes in ${suffix}`,
      `coffee shops ${suffix}`,
      `specialty coffee ${suffix}`,
      `brunch ${suffix}`,
      `cafeterias ${suffix}`,
      `desayunos ${suffix}`
    ];
  }

  if (category === "healthcare") {
    return [
      `medical clinic ${suffix}`,
      `doctor ${suffix}`,
      `dentist ${suffix}`,
      `physiotherapist ${suffix}`,
      `centro medico ${suffix}`,
      `clinica dental ${suffix}`
    ];
  }

  if (category === "vets") {
    return [
      `veterinary clinic ${suffix}`,
      `veterinarian ${suffix}`,
      `emergency vet ${suffix}`,
      `veterinario ${suffix}`,
      `clinica veterinaria ${suffix}`
    ];
  }

  if (category === "real-estate") {
    return [
      `real estate agency ${suffix}`,
      `estate agents ${suffix}`,
      `property agency ${suffix}`,
      `inmobiliaria ${suffix}`,
      `agencia inmobiliaria ${suffix}`,
      `Immobilienmakler ${suffix}`
    ];
  }

  if (category === "gyms") {
    return [
      `gym ${suffix}`,
      `fitness center ${suffix}`,
      `crossfit ${suffix}`,
      `yoga studio ${suffix}`,
      `gimnasio ${suffix}`,
      `centro deportivo ${suffix}`
    ];
  }

  if (category === "spas") {
    return [
      `spa ${suffix}`,
      `massage ${suffix}`,
      `thai massage ${suffix}`,
      `wellness center ${suffix}`,
      `masajes ${suffix}`
    ];
  }

  if (category === "hotels") {
    return [
      `hotels in ${suffix}`,
      `boutique hotel ${suffix}`,
      `agroturismo ${suffix}`,
      `hotel rural ${suffix}`,
      `hostal ${suffix}`
    ];
  }

  return [
    `${singular} ${suffix}`,
    `best ${singular} ${suffix}`,
    `${suffix} ${singular}`
  ];
}

function mapPlace(place, businessCategory, query, area) {
  const photos = Array.isArray(place.photos) ? place.photos : [];
  const photoNames = photos.map((photo) => photo.name).filter(Boolean);

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
    photo_names: photoNames,
    zone_topup_query: query,
    zone_topup_area: area
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

  const allTypes = [place.primary_type, ...(place.types ?? [])].filter(Boolean);
  if (config.blockedTypes?.some((type) => allTypes.includes(type))) return false;
  if (config.requiredTypes?.length && !config.requiredTypes.some((type) => allTypes.includes(type))) return false;

  if (config.blockedNameKeywords?.length) {
    const nameLower = place.name.toLowerCase();
    if (config.blockedNameKeywords.some((keyword) => nameLower.includes(keyword.toLowerCase()))) return false;
  }

  return true;
}

async function searchPlaces(apiKey, textQuery, attempt = 1) {
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
    if ([429, 500, 502, 503, 504].includes(response.status) && attempt < 4) {
      const waitMs = 1200 * attempt;
      console.warn(`Retrying "${textQuery}" after ${response.status} (${waitMs}ms, attempt ${attempt + 1}/4)`);
      await sleep(waitMs);
      return searchPlaces(apiKey, textQuery, attempt + 1);
    }
    throw new Error(`Google Places API error for "${textQuery}" (${response.status}): ${body}`);
  }

  const data = await response.json();
  return data.places ?? [];
}

async function fetchExistingBusinesses(supabase, businessCategory) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("businesses")
      .select("google_place_id,slug,status,name,display_name,category,address")
      .eq("category", businessCategory)
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

function removeExisting(rows, existingRows) {
  const existingByPlaceId = new Map(existingRows.filter((row) => row.google_place_id).map((row) => [row.google_place_id, row]));
  const existingByName = new Map(existingRows.map((row) => [normalize(row.display_name || row.name), row]).filter(([key]) => key));
  const fresh = [];
  const removed = [];

  for (const row of rows) {
    const normalizedName = normalize(row.name);
    const byPlaceId = row.google_place_id ? existingByPlaceId.get(row.google_place_id) : null;
    const byName = normalizedName ? existingByName.get(normalizedName) : null;
    if (byPlaceId || byName) {
      const match = byPlaceId || byName;
      removed.push({ ...row, exclusion_reason: `already in DB: ${match.status}:${match.slug}` });
    } else {
      fresh.push(row);
    }
  }

  return { fresh, removed };
}

function writeReport(category, previewPath, rows, removed, errors, stats, stamp) {
  mkdirSync(REPORT_DIR, { recursive: true });
  const reportPath = path.join(REPORT_DIR, `${category}-zone-topup-new-candidates-${stamp}.md`);
  const lines = [
    `# ${category} Zone Top-Up New Candidates`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Preview: ${previewPath}`,
    `- Queries run: ${stats.queries}`,
    `- Raw accepted unique rows: ${stats.unique}`,
    `- Existing DB rows removed: ${removed.length}`,
    `- New rows for Claude review: ${rows.length}`,
    `- Query errors skipped: ${errors.length}`,
    "",
    "## New Candidates For Claude Review",
    "",
    "| Area | Name | Rating | Reviews | Type | Website | Address |",
    "|---|---|---:|---:|---|---|---|",
    ...rows.map((row) => `| ${fmt(row.zone_topup_area)} | ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
    "",
    "## Removed As Existing",
    "",
    "| Reason | Area | Name | Rating | Reviews | Type | Address |",
    "|---|---|---|---:|---:|---|---|",
    ...removed.map((row) => `| ${fmt(row.exclusion_reason)} | ${fmt(row.zone_topup_area)} | ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.address)} |`),
    "",
    "## Query Errors Skipped",
    "",
    "| Category | Area | Query | Error |",
    "|---|---|---|---|",
    ...errors.map((error) => `| ${fmt(error.category)} | ${fmt(error.area)} | ${fmt(error.query)} | ${fmt(error.message)} |`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  return reportPath;
}

async function previewCategory({ apiKey, supabase, category, areas, stamp }) {
  const config = getConfig(category);
  const unique = new Map();
  const errors = [];
  let queryCount = 0;

  for (const area of areas) {
    for (const query of categoryQueries(category, config, area)) {
      if (unique.size >= MAX_RESULTS_PER_CATEGORY) break;
      queryCount += 1;
      let places = [];
      try {
        places = await searchPlaces(apiKey, query);
      } catch (error) {
        errors.push({ category, area, query, message: error.message });
        console.warn(`${category} | ${query}: skipped after error: ${error.message}`);
        continue;
      }
      let accepted = 0;
      for (const rawPlace of places) {
        const place = mapPlace(rawPlace, config.businessCategory, query, area);
        if (!passesFilters(place, config)) continue;
        accepted += 1;
        if (!unique.has(place.google_place_id)) unique.set(place.google_place_id, place);
      }
      console.log(`${category} | ${query}: ${places.length} fetched, ${accepted} accepted, ${unique.size} unique`);
    }
  }

  const allRows = Array.from(unique.values());
  const existingRows = await fetchExistingBusinesses(supabase, config.businessCategory);
  const { fresh, removed } = removeExisting(allRows, existingRows);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const previewPath = path.join(OUTPUT_DIR, `${category}-zone-topup-preview-${stamp}.json`);
  writeFileSync(previewPath, `${JSON.stringify(fresh, null, 2)}\n`, "utf8");
  const reportPath = writeReport(category, previewPath, fresh, removed, errors, { queries: queryCount, unique: allRows.length }, stamp);

  return {
    category,
    report: reportPath,
    preview: previewPath,
    rows: fresh.length,
    existing_removed: removed.length,
    query_errors: errors.length,
    queries: queryCount
  };
}

async function main() {
  loadLocalEnv();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");

  const supabase = createSupabaseClient();
  const categories = selectedCategories();
  const areas = selectedAreas();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const results = [];

  for (const category of categories) {
    results.push(await previewCategory({ apiKey, supabase, category, areas, stamp }));
  }

  console.log(JSON.stringify({ area_count: areas.length, results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
