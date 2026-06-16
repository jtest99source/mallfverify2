import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

const DEFAULT_LIMIT = 20;
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
  "places.internationalPhoneNumber"
].join(",");

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
  "en"
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

function parseArgs() {
  const options = { limit: DEFAULT_LIMIT };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--limit=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) options.limit = Math.min(value, 100);
    }
  }

  return options;
}

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function meaningfulTokens(value) {
  return normalizeText(value)
    .split(" ")
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function nameSimilarityScore(sourceName, candidateName) {
  const source = normalizeText(sourceName);
  const candidate = normalizeText(candidateName);
  if (!source || !candidate) return 0;
  if (source === candidate) return 1;
  if (source.length >= 8 && candidate.includes(source)) return 0.95;
  if (candidate.length >= 8 && source.includes(candidate)) return 0.9;

  const sourceTokens = meaningfulTokens(source);
  const candidateTokens = new Set(meaningfulTokens(candidate));
  if (!sourceTokens.length || !candidateTokens.size) return 0;

  const matched = sourceTokens.filter((token) => candidateTokens.has(token)).length;
  return matched / Math.max(sourceTokens.length, candidateTokens.size);
}

function addressLooksBalearic(address) {
  const normalized = normalizeText(address);
  return (
    normalized.includes("mallorca") ||
    normalized.includes("majorca") ||
    normalized.includes("illes balears") ||
    normalized.includes("balearic islands") ||
    normalized.includes("baleares")
  );
}

function isReasonableMatch(businessName, place) {
  const candidateName = place.displayName?.text ?? "";
  const score = nameSimilarityScore(businessName, candidateName);
  return {
    score,
    accepted: Boolean(place.id) && score >= 0.45 && addressLooksBalearic(place.formattedAddress)
  };
}

async function searchPlace(apiKey, query) {
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
    throw new Error(`Google Places API error ${response.status}: ${body}`);
  }

  return response.json();
}

function getBeforeAfter(business, place) {
  const before = {
    google_place_id: business.google_place_id ?? null,
    latitude: business.latitude ?? null,
    longitude: business.longitude ?? null,
    google_maps_url: business.google_maps_url ?? null,
    address: business.address ?? null
  };

  const after = {
    google_place_id: business.google_place_id || place.id || null,
    latitude: place.location?.latitude ?? business.latitude ?? null,
    longitude: place.location?.longitude ?? business.longitude ?? null,
    google_maps_url: place.googleMapsUri ?? business.google_maps_url ?? null,
    address: business.address || place.formattedAddress || null
  };

  return { before, after };
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");
  if (!supabaseUrl || !supabaseKey) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id,name,display_name,status,google_place_id,latitude,longitude,google_maps_url,address,raw_google_place")
    .in("status", ["published", "premium"])
    .or("latitude.is.null,longitude.is.null,google_maps_url.is.null")
    .order("authority_score", { ascending: false, nullsFirst: false })
    .limit(options.limit);

  if (error) throw error;

  let updated = 0;
  let notFound = 0;
  let lowConfidence = 0;
  const errors = [];
  const examples = [];

  for (const business of businesses ?? []) {
    const publicName = business.display_name || business.name;
    const query = `${publicName} Mallorca`;

    try {
      const data = await searchPlace(apiKey, query);
      const places = data.places ?? [];

      if (!places.length) {
        notFound += 1;
        continue;
      }

      let selected = null;
      let selectedConfidence = null;
      for (const place of places) {
        const confidence = isReasonableMatch(publicName, place);
        if (confidence.accepted) {
          selected = place;
          selectedConfidence = confidence;
          break;
        }
      }

      if (!selected) {
        lowConfidence += 1;
        const first = places[0];
        examples.push({
          name: publicName,
          query,
          skipped_reason: "baja_confianza",
          first_result: first
            ? {
                google_place_id: first.id ?? null,
                name: first.displayName?.text ?? null,
                address: first.formattedAddress ?? null,
                similarity: nameSimilarityScore(publicName, first.displayName?.text ?? "")
              }
            : null
        });
        continue;
      }

      const { data: duplicatePlaceOwner, error: duplicatePlaceError } = await supabase
        .from("businesses")
        .select("id,name,display_name")
        .eq("google_place_id", selected.id)
        .neq("id", business.id)
        .maybeSingle();

      if (duplicatePlaceError) throw duplicatePlaceError;

      const rawGooglePlace = {
        ...(business.raw_google_place ?? {}),
        ...selected,
        fix_missing_maps: {
          query,
          matched_at: new Date().toISOString(),
          similarity: selectedConfidence?.score ?? null,
          google_place_id_already_used_by: duplicatePlaceOwner?.id ?? null
        }
      };

      const { before, after } = getBeforeAfter(business, selected);
      if (duplicatePlaceOwner) {
        after.google_place_id = business.google_place_id ?? null;
      }

      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          google_place_id: business.google_place_id || (duplicatePlaceOwner ? null : selected.id) || null,
          latitude: selected.location?.latitude ?? business.latitude ?? null,
          longitude: selected.location?.longitude ?? business.longitude ?? null,
          google_maps_url: selected.googleMapsUri ?? business.google_maps_url ?? null,
          address: business.address || selected.formattedAddress || null,
          raw_google_place: rawGooglePlace
        })
        .eq("id", business.id);

      if (updateError) throw updateError;

      updated += 1;
      examples.push({
        name: publicName,
        matched_name: selected.displayName?.text ?? null,
        similarity: selectedConfidence?.score ?? null,
        google_place_id_already_used_by: duplicatePlaceOwner?.id ?? null,
        before,
        after
      });
    } catch (error) {
      errors.push({
        id: business.id,
        name: publicName,
        error: error.message
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        procesados: businesses?.length ?? 0,
        actualizados: updated,
        no_encontrados: notFound,
        skipped_baja_confianza: lowConfidence,
        errores: errors,
        ejemplos_antes_despues: examples.slice(0, 20)
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
