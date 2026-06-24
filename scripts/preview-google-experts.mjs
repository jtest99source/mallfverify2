import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const MAX_RESULTS = 300;

const verticalConfigs = {
  lawyers: {
    verticalSlug: "english-speaking-lawyers-mallorca",
    output: "data/expert-previews/english-speaking-lawyers-mallorca.json",
    minRating: 4,
    minReviews: 5,
    searches: [
      "English speaking lawyer Mallorca",
      "English speaking lawyer Palma Mallorca",
      "property lawyer Mallorca",
      "real estate lawyer Mallorca",
      "tax advisor Mallorca expats",
      "inheritance lawyer Mallorca English",
      "abogado inmobiliario Mallorca",
      "abogado fiscal Mallorca extranjeros",
      "gestoria Mallorca expats",
      "law firm Mallorca international clients"
    ],
    extraSearches: {
      en: [
        "English speaking solicitor Mallorca",
        "English speaking notary lawyer Mallorca",
        "real estate solicitor Mallorca foreign buyers",
        "property purchase lawyer Mallorca expats",
        "inheritance lawyer Mallorca expats",
        "tax lawyer Mallorca non residents",
        "immigration lawyer Mallorca expats",
        "international law firm Mallorca"
      ],
      de: [
        "Rechtsanwalt Mallorca",
        "deutscher Rechtsanwalt Mallorca",
        "deutschsprachiger Anwalt Mallorca",
        "Anwalt Immobilien Mallorca",
        "Steuerberater Mallorca",
        "deutscher Steuerberater Mallorca",
        "Erbrecht Anwalt Mallorca",
        "Kanzlei Mallorca deutsche Mandanten"
      ]
    }
  },
  architects: {
    verticalSlug: "architects-renovation-mallorca",
    output: "data/expert-previews/architects-renovation-mallorca.json",
    minRating: 4,
    minReviews: 5,
    searches: [
      "architect Mallorca renovation",
      "architects Palma Mallorca",
      "architecture studio Mallorca",
      "renovation company Mallorca",
      "villa renovation Mallorca",
      "construction company Mallorca villas",
      "interior designer Mallorca",
      "arquitecto Mallorca reforma",
      "empresa reformas Mallorca",
      "interiorismo Mallorca vivienda"
    ],
    extraSearches: {
      en: [
        "villa builder Mallorca",
        "luxury villa renovation Mallorca",
        "building contractor Mallorca expats",
        "project manager construction Mallorca",
        "architect for foreign buyers Mallorca",
        "interior architect Mallorca villas"
      ],
      de: [
        "Architekt Mallorca",
        "deutscher Architekt Mallorca",
        "Bauunternehmen Mallorca",
        "deutscher Bautraeger Mallorca",
        "Villa Renovierung Mallorca",
        "Innenarchitekt Mallorca deutsch"
      ]
    }
  },
  property: {
    verticalSlug: "property-managers-mallorca",
    output: "data/expert-previews/property-managers-mallorca.json",
    minRating: 4,
    minReviews: 5,
    searches: [
      "property management Mallorca",
      "property manager Mallorca",
      "villa management Mallorca",
      "home management Mallorca",
      "key holding Mallorca",
      "relocation services Mallorca",
      "expat relocation Mallorca",
      "gestión propiedades Mallorca",
      "mantenimiento villas Mallorca",
      "property services Mallorca expats"
    ],
    extraSearches: {
      en: [
        "holiday home management Mallorca",
        "second home management Mallorca",
        "villa maintenance Mallorca",
        "key holding service Mallorca",
        "relocation consultant Mallorca",
        "expat property services Mallorca"
      ],
      de: [
        "Immobilienverwaltung Mallorca",
        "Hausverwaltung Mallorca",
        "deutsche Hausverwaltung Mallorca",
        "Ferienhaus Betreuung Mallorca",
        "Relocation Mallorca deutsch",
        "Immobilienservice Mallorca deutsch"
      ]
    }
  },
  "estate-agents": {
    verticalSlug: "estate-agents-mallorca",
    output: "data/expert-previews/estate-agents-mallorca.json",
    minRating: 4.4,
    minReviews: 20,
    searches: [
      "real estate agent Mallorca",
      "estate agent Mallorca",
      "property agent Mallorca",
      "luxury real estate Mallorca",
      "real estate agency Palma Mallorca",
      "inmobiliaria Mallorca compradores extranjeros",
      "inmobiliaria lujo Mallorca",
      "property sales Mallorca expats",
      "buy property Mallorca real estate agency",
      "estate agents southwest Mallorca"
    ],
    extraSearches: {
      en: [
        "real estate agent Mallorca expats",
        "property agency Mallorca foreign buyers",
        "buy villa Mallorca estate agent",
        "luxury property agent Mallorca",
        "estate agent Palma international clients",
        "real estate agent southwest Mallorca"
      ],
      de: [
        "Immobilienmakler Mallorca",
        "deutscher Immobilienmakler Mallorca",
        "Immobilien Mallorca kaufen Makler",
        "Luxusimmobilien Mallorca Makler",
        "Makler Mallorca deutsche Kunden",
        "Immobilienagentur Mallorca deutsch"
      ]
    }
  },
  "mortgage-brokers": {
    verticalSlug: "mortgage-brokers-mallorca",
    output: "data/expert-previews/mortgage-brokers-mallorca.json",
    minRating: 4.4,
    minReviews: 5,
    searches: [
      "mortgage broker Mallorca",
      "mortgage advisor Mallorca",
      "English speaking mortgage broker Mallorca",
      "mortgage for non residents Mallorca",
      "hipoteca extranjeros Mallorca",
      "asesor hipotecario Mallorca",
      "mortgage consultant Mallorca property buyers",
      "broker hipotecario Mallorca",
      "expat mortgage Spain Mallorca",
      "mortgage advice Palma Mallorca"
    ],
    extraSearches: {
      en: [
        "mortgage broker Spain non resident Mallorca",
        "mortgage advisor Mallorca foreign buyers",
        "Spanish mortgage broker Mallorca",
        "property finance Mallorca expats",
        "non resident mortgage Spain Mallorca",
        "international mortgage broker Mallorca"
      ],
      de: [
        "Hypothekenberater Mallorca",
        "Finanzierung Mallorca Immobilie",
        "Immobilienfinanzierung Mallorca",
        "deutscher Hypothekenmakler Mallorca",
        "Bankfinanzierung Mallorca Auslaender",
        "Mallorca Immobilien Finanzierung deutsch"
      ]
    }
  },
  doctors: {
    verticalSlug: "english-speaking-doctors-mallorca",
    output: "data/expert-previews/english-speaking-doctors-mallorca.json",
    minRating: 4.4,
    minReviews: 10,
    searches: [
      "English speaking doctor Mallorca",
      "English speaking doctor Palma Mallorca",
      "private doctor Mallorca English",
      "general practitioner Mallorca English",
      "international medical centre Mallorca",
      "private clinic Mallorca English speaking",
      "German speaking doctor Mallorca",
      "doctor Mallorca expats",
      "medical centre Palma Mallorca English",
      "médico privado Mallorca inglés"
    ],
    extraSearches: {
      en: [
        "English speaking GP Mallorca",
        "private GP Mallorca expats",
        "family doctor Mallorca English",
        "international doctor Mallorca",
        "private medical clinic Mallorca expats",
        "24 hour doctor Mallorca English"
      ],
      de: [
        "deutscher Arzt Mallorca",
        "deutschsprachiger Arzt Mallorca",
        "Arzt Mallorca",
        "Hausarzt Mallorca deutsch",
        "Privatarzt Mallorca deutsch",
        "deutsche Klinik Mallorca",
        "Arztzentrum Mallorca",
        "Kinderarzt Mallorca deutsch"
      ]
    }
  },
  dentists: {
    verticalSlug: "english-speaking-dentists-mallorca",
    output: "data/expert-previews/english-speaking-dentists-mallorca.json",
    minRating: 4.5,
    minReviews: 20,
    searches: [
      "English speaking dentist Mallorca",
      "English speaking dentist Palma Mallorca",
      "dental clinic Mallorca English",
      "private dentist Mallorca",
      "German speaking dentist Mallorca",
      "dentist Mallorca expats",
      "implant dentist Mallorca English",
      "orthodontist Mallorca English",
      "clinica dental Mallorca ingles",
      "dentist Palma Mallorca international"
    ],
    extraSearches: {
      en: [
        "English speaking orthodontist Mallorca",
        "British dentist Mallorca",
        "international dental clinic Mallorca",
        "emergency dentist Mallorca English",
        "implant dentist Palma Mallorca",
        "private dental clinic Mallorca expats"
      ],
      de: [
        "Zahnarzt Mallorca",
        "deutscher Zahnarzt Mallorca",
        "deutschsprachiger Zahnarzt Mallorca",
        "Zahnarzt Palma Mallorca",
        "Kieferorthopaede Mallorca",
        "Implantologe Mallorca deutsch",
        "Notfall Zahnarzt Mallorca deutsch",
        "Zahnarztpraxis Mallorca deutsch"
      ]
    }
  },
  "aesthetic-medicine": {
    verticalSlug: "aesthetic-medicine-mallorca",
    output: "data/expert-previews/aesthetic-medicine-mallorca.json",
    minRating: 4.4,
    minReviews: 20,
    searches: [
      "english speaking aesthetic clinic Mallorca",
      "english speaking cosmetic clinic Mallorca",
      "botox clinic Mallorca english",
      "aesthetic medicine Mallorca expats",
      "skin clinic Mallorca english",
      "laser clinic Mallorca english",
      "anti aging clinic Mallorca english",
      "Beauty Clinic Mallorca Bendinat",
      "mySkin Mallorca dermatology",
      "MD Aesthetics Santa Ponsa Mallorca",
      "OLIVA Aesthetic Mallorca",
      "Clínica Mediben Palma",
      "CENSALUD Palma aesthetic",
      "Mallorca Medical Group plastic surgery",
      "clinica estetica Mallorca",
      "medicina estetica Palma Mallorca"
    ],
    extraSearches: {
      en: [
        "cosmetic surgery Mallorca english",
        "plastic surgery clinic Mallorca english",
        "filler treatment Mallorca english",
        "dermatology clinic Mallorca english",
        "non surgical facelift Mallorca",
        "body contouring clinic Mallorca",
        "laser hair removal Mallorca english",
        "skin rejuvenation clinic Mallorca"
      ],
      de: [
        "Schönheitsklinik Mallorca",
        "Ästhetische Medizin Mallorca deutsch",
        "Botox Mallorca deutsch",
        "Hautarzt Mallorca aesthetisch",
        "Laserbehandlung Mallorca",
        "Antiaging Klinik Mallorca",
        "kosmetische Chirurgie Mallorca deutsch",
        "Faltenbehandlung Mallorca",
        "Schönheitsbehandlung Mallorca deutsch",
        "mySkin Mallorca Dermatologie"
      ]
    }
  }
};

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

function uniqueItems(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function searchesForConfig(config, searchSet) {
  if (searchSet === "base") return config.searches;
  if (searchSet === "all" || searchSet === "expanded") {
    return uniqueItems([
      ...config.searches,
      ...(config.extraSearches?.en ?? []),
      ...(config.extraSearches?.de ?? [])
    ]);
  }
  return uniqueItems([...(config.extraSearches?.[searchSet] ?? [])]);
}

function outputForConfig(config, suffix) {
  if (!suffix) return config.output;
  const parsed = path.parse(config.output);
  return path.join(parsed.dir, `${parsed.name}-${suffix}${parsed.ext}`);
}

function isOfficialWebsite(url) {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return ![
      "facebook.com",
      "instagram.com",
      "tiktok.com",
      "linktr.ee",
      "linktree.com",
      "wa.me",
      "api.whatsapp.com"
    ].some((blocked) => hostname === blocked || hostname.endsWith(`.${blocked}`));
  } catch {
    return false;
  }
}

function websiteKey(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    const pathname = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.hostname.replace(/^www\./, "").toLowerCase()}${pathname}`.toLowerCase();
  } catch {
    return null;
  }
}

function mapPlace(place, config, query) {
  return {
    google_place_id: place.id ?? null,
    vertical_slug: config.verticalSlug,
    name: place.displayName?.text ?? null,
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
    source_query: query,
    review_note:
      "Candidate only. Confirm official website, languages, specialty and fit before publishing a Mallorca Verified Experts profile.",
    raw_google_place: place
  };
}

function passesFilters(place, config) {
  return Boolean(
    place.google_place_id &&
      place.name &&
      place.business_status !== "CLOSED_PERMANENTLY" &&
      place.business_status !== "CLOSED_TEMPORARILY" &&
      typeof place.rating === "number" &&
      typeof place.reviews_count === "number" &&
      place.rating >= config.minRating &&
      place.reviews_count >= config.minReviews &&
      isOfficialWebsite(place.website)
  );
}

async function searchPlaces(apiKey, textQuery, languageCode) {
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
        "places.businessStatus"
      ].join(",")
    },
    body: JSON.stringify({
      textQuery,
      languageCode,
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

async function previewVertical(apiKey, configKey, options) {
  const config = verticalConfigs[configKey];
  if (!config) throw new Error(`Unknown --vertical=${configKey}. Use one of: ${Object.keys(verticalConfigs).join(", ")}`);

  const unique = new Map();
  const seenWebsites = new Map();
  const searches = searchesForConfig(config, options.searchSet);
  if (!searches.length) throw new Error(`No searches found for --vertical=${configKey} --search-set=${options.searchSet}`);

  for (const query of searches) {
    if (unique.size >= MAX_RESULTS) break;

    const places = await searchPlaces(apiKey, query, options.languageCode);
    let acceptedForQuery = 0;
    for (const rawPlace of places) {
      const place = mapPlace(rawPlace, config, query);
      if (!passesFilters(place, config)) continue;
      acceptedForQuery += 1;
      const webKey = websiteKey(place.website);
      const duplicatePlaceId = unique.has(place.google_place_id);
      const duplicateWebsiteId = webKey ? seenWebsites.get(webKey) : null;
      if (!duplicatePlaceId && !duplicateWebsiteId) {
        unique.set(place.google_place_id, place);
        if (webKey) seenWebsites.set(webKey, place.google_place_id);
      } else if (duplicateWebsiteId) {
        const existing = unique.get(duplicateWebsiteId);
        if (existing && (place.reviews_count ?? 0) > (existing.reviews_count ?? 0)) {
          unique.delete(duplicateWebsiteId);
          unique.set(place.google_place_id, place);
          if (webKey) seenWebsites.set(webKey, place.google_place_id);
        }
      }
      if (unique.size >= MAX_RESULTS) break;
    }

    console.log(`${query}: ${places.length} fetched, ${acceptedForQuery} accepted, ${unique.size} unique`);
  }

  const preview = Array.from(unique.values()).slice(0, MAX_RESULTS);
  const output = outputForConfig(config, options.suffix);
  mkdirSync(path.dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(preview, null, 2)}\n`, "utf8");
  console.log(`Wrote ${preview.length} candidates to ${output}`);
}

async function main() {
  loadLocalEnv();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");

  const vertical = argValue("vertical") ?? "all";
  const searchSet = argValue("search-set") ?? "base";
  const suffix = argValue("suffix");
  const languageCode = argValue("language") ?? "es";

  if (!["base", "en", "de", "expanded", "all"].includes(searchSet)) {
    throw new Error("Unknown --search-set. Use one of: base, en, de, expanded, all");
  }
  if (!["es", "en", "de"].includes(languageCode)) {
    throw new Error("Unknown --language. Use one of: es, en, de");
  }

  const keys = vertical === "all" ? Object.keys(verticalConfigs) : [vertical];
  for (const key of keys) await previewVertical(apiKey, key, { searchSet, suffix, languageCode });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
