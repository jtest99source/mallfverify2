import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  category: string;
  status: string;
  area: string | null;
  city: string | null;
  municipality: string | null;
  address: string | null;
  google_place_id: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  raw_google_place: Record<string, unknown> | null;
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  primaryType?: string;
  types?: string[];
  websiteUri?: string;
  internationalPhoneNumber?: string;
  businessStatus?: string;
};

type Options = {
  apply: boolean;
  includeDrafts: boolean;
  limit: number;
  slugs: string[];
  categories: string[];
};

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.googleMapsUri",
  "places.rating",
  "places.userRatingCount",
  "places.primaryType",
  "places.types",
  "places.websiteUri",
  "places.internationalPhoneNumber",
  "places.businessStatus"
].join(",");

const TARGET_SLUGS = [
  "sendero-cala-deia",
  "robinson-boats-portocolom",
  "mallorca-boat-hire",
  "cala-mondrago",
  "cala-deia",
  "assona-portals",
  "nikki-beach-mallorca",
  "gran-folies-cala-llamp",
  "purobeach-palma",
  "balneario-illetas"
];

const STOP_WORDS = new Set([
  "mallorca",
  "majorca",
  "illes",
  "balears",
  "balearic",
  "islands",
  "hotel",
  "restaurant",
  "restaurante",
  "beach",
  "club",
  "boat",
  "rental",
  "charter",
  "activity",
  "activities",
  "playa",
  "platja",
  "cala",
  "the",
  "and",
  "for",
  "de",
  "del",
  "la",
  "el",
  "los",
  "las",
  "en",
  "a"
]);

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

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const value = (name: string) => {
    const prefix = `--${name}=`;
    const arg = args.find((item) => item.startsWith(prefix));
    return arg ? arg.slice(prefix.length).trim() : null;
  };
  const limit = Number(value("limit") ?? 50);
  return {
    apply: args.includes("--apply"),
    includeDrafts: args.includes("--include-drafts"),
    limit: Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 50,
    slugs: (value("slugs") ?? TARGET_SLUGS.join(",")).split(",").map((item) => item.trim()).filter(Boolean),
    categories: (value("categories") ?? "").split(",").map((item) => item.trim()).filter(Boolean)
  };
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value: string) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function nameSimilarity(sourceName: string, candidateName: string) {
  const source = normalize(sourceName);
  const candidate = normalize(candidateName);
  if (!source || !candidate) return 0;
  if (source === candidate) return 1;
  if (source.length >= 8 && candidate.includes(source)) return 0.95;
  if (candidate.length >= 8 && source.includes(candidate)) return 0.9;

  const sourceTokens = tokens(source);
  const candidateTokens = new Set(tokens(candidate));
  if (!sourceTokens.length || !candidateTokens.size) return 0;
  const matched = sourceTokens.filter((token) => candidateTokens.has(token)).length;
  return matched / Math.max(sourceTokens.length, candidateTokens.size);
}

function locationText(business: BusinessRow) {
  return [business.city, business.area, business.municipality].filter(Boolean).join(" ");
}

function categoryQueryLabel(category: string) {
  return {
    "beach-club": "beach club",
    "boat-rental": "boat rental",
    beach: "beach",
    route: "route",
    activity: "activity"
  }[category] ?? category;
}

function buildQueries(business: BusinessRow) {
  const name = business.display_name || business.name;
  const place = locationText(business);
  const category = categoryQueryLabel(business.category);
  return [
    `${name} ${place} Mallorca`,
    `${name} ${category} Mallorca`,
    `${name} Mallorca`
  ].filter((query, index, arr) => query.trim() && arr.indexOf(query) === index);
}

function addressLooksMallorca(address?: string) {
  const normalized = normalize(address ?? "");
  return normalized.includes("mallorca") || normalized.includes("illes balears") || normalized.includes("baleares");
}

function typeBoost(category: string, place: GooglePlace) {
  const types = new Set(place.types ?? []);
  const primary = place.primaryType ?? "";
  if (category === "beach-club" && (types.has("restaurant") || types.has("bar") || primary.includes("restaurant"))) return 0.08;
  if (category === "boat-rental" && (types.has("tour_agency") || types.has("travel_agency") || primary.includes("tour"))) return 0.05;
  if (category === "beach" && (types.has("beach") || types.has("tourist_attraction") || primary === "beach")) return 0.08;
  if (category === "route" && (types.has("tourist_attraction") || types.has("hiking_area") || types.has("park"))) return 0.05;
  return 0;
}

function scorePlace(business: BusinessRow, place: GooglePlace) {
  const name = business.display_name || business.name;
  const candidateName = place.displayName?.text ?? "";
  const similarity = nameSimilarity(name, candidateName);
  const score = similarity + typeBoost(business.category, place);
  const accepted = Boolean(place.id) &&
    place.businessStatus !== "CLOSED_PERMANENTLY" &&
    addressLooksMallorca(place.formattedAddress) &&
    score >= 0.55;
  return { similarity, score, accepted };
}

async function searchPlace(apiKey: string, query: string) {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK
    },
    body: JSON.stringify({
      textQuery: query,
      languageCode: "es",
      regionCode: "ES",
      maxResultCount: 5
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Places API error for "${query}" (${response.status}): ${body}`);
  }

  const data = await response.json();
  return (data.places ?? []) as GooglePlace[];
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function fetchBusinesses(supabase: ReturnType<typeof createSupabaseClient>, options: Options) {
  let query = supabase
    .from("businesses")
    .select("id,slug,name,display_name,category,status,area,city,municipality,address,google_place_id,latitude,longitude,google_maps_url,raw_google_place")
    .is("google_place_id", null)
    .limit(options.limit);

  query = options.includeDrafts
    ? query.in("status", ["published", "premium", "draft", "hidden"])
    : query.in("status", ["published", "premium"]);

  if (options.slugs.length) query = query.in("slug", options.slugs);
  if (options.categories.length) query = query.in("category", options.categories);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as BusinessRow[];
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");
  const supabase = createSupabaseClient();
  const businesses = await fetchBusinesses(supabase, options);

  const results = [];
  let updated = 0;

  for (const business of businesses) {
    const queries = buildQueries(business);
    const candidates: Array<{ query: string; place: GooglePlace; similarity: number; score: number; accepted: boolean }> = [];

    for (const query of queries) {
      const places = await searchPlace(apiKey, query);
      for (const place of places) {
        if (candidates.some((candidate) => candidate.place.id === place.id)) continue;
        const score = scorePlace(business, place);
        candidates.push({ query, place, ...score });
      }
      if (candidates.some((candidate) => candidate.accepted)) break;
    }

    candidates.sort((a, b) => b.score - a.score);
    const selected = candidates.find((candidate) => candidate.accepted) ?? null;
    let duplicateOwner: { id: string; slug: string; name: string; display_name: string | null } | null = null;

    if (selected?.place.id) {
      const { data, error } = await supabase
        .from("businesses")
        .select("id,slug,name,display_name")
        .eq("google_place_id", selected.place.id)
        .maybeSingle();
      if (error) throw error;
      duplicateOwner = data;
    }

    if (options.apply && selected && !duplicateOwner) {
      const place = selected.place;
      const { error } = await supabase
        .from("businesses")
        .update({
          google_place_id: place.id,
          latitude: place.location?.latitude ?? business.latitude ?? null,
          longitude: place.location?.longitude ?? business.longitude ?? null,
          google_maps_url: place.googleMapsUri ?? business.google_maps_url ?? null,
          address: business.address || place.formattedAddress || null,
          raw_google_place: {
            ...(business.raw_google_place ?? {}),
            ...place,
            fix_missing_google_place_id: {
              matched_at: new Date().toISOString(),
              query: selected.query,
              similarity: selected.similarity,
              score: selected.score
            }
          }
        })
        .eq("id", business.id);
      if (error) throw error;
      updated += 1;
    }

    results.push({
      name: business.display_name || business.name,
      slug: business.slug,
      category: business.category,
      status: business.status,
      selected: selected
        ? {
            google_place_id: selected.place.id ?? null,
            name: selected.place.displayName?.text ?? null,
            address: selected.place.formattedAddress ?? null,
            rating: selected.place.rating ?? null,
            reviews: selected.place.userRatingCount ?? null,
            primaryType: selected.place.primaryType ?? null,
            similarity: Number(selected.similarity.toFixed(2)),
            score: Number(selected.score.toFixed(2)),
            duplicateOwner: duplicateOwner ? duplicateOwner.display_name || duplicateOwner.name || duplicateOwner.slug : null,
            applied: Boolean(options.apply && !duplicateOwner)
          }
        : null,
      topCandidates: candidates.slice(0, 3).map((candidate) => ({
        google_place_id: candidate.place.id ?? null,
        name: candidate.place.displayName?.text ?? null,
        address: candidate.place.formattedAddress ?? null,
        similarity: Number(candidate.similarity.toFixed(2)),
        score: Number(candidate.score.toFixed(2)),
        accepted: candidate.accepted
      }))
    });
  }

  console.log(JSON.stringify({
    mode: options.apply ? "apply" : "dry-run",
    selected: businesses.length,
    updated,
    results
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
