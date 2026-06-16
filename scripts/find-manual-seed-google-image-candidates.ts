import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { scoreAndSortImageCandidates } from "../src/lib/image-candidate-scoring";

const DEFAULT_MAX_PHOTOS = 5;

const PLACE_MATCHES: Record<string, { placeId: string; note: string }> = {
  "vandal-palma": {
    placeId: "ChIJxcDlNmaSlxIRRw6ZIWrcZg8",
    note: "Exact match: Vandal Palma"
  },
  "mallorca-boat-hire": {
    placeId: "ChIJcTV8Ui0tlhIR53r_RyqnI3w",
    note: "Exact match: Mallorca Boat Hire"
  },
  "nikki-beach-mallorca": {
    placeId: "ChIJDy2pKCmJlxIRXe1vTFRdqnM",
    note: "Exact match: Nikki Beach Mallorca"
  },
  "santi-taura-palma": {
    placeId: "ChIJq6qq6hLElxIRc9AqB63IDok",
    note: "Clear match: DINS Santi Taura"
  },
  "el-camino-palma": {
    placeId: "ChIJK3PlkMmTlxIRi534SQWzYm0",
    note: "Known Google match from existing dataset: El Camino"
  },
  "cala-mondrago": {
    placeId: "ChIJg0Av669WlhIRYN7EK7W8L2Q",
    note: "Exact match: Cala Mondrago"
  },
  "cala-varques": {
    placeId: "ChIJofCn5bRFlhIRik8ZC6XGpeA",
    note: "Exact match: Cala Varques"
  },
  "illeta-camp-de-mar": {
    placeId: "ChIJ3UzHtyknmBIRrrMQWJLDMz4",
    note: "Clear match: Restaurante Illeta"
  },
  "belmond-la-residencia-deia": {
    placeId: "ChIJ9birlq3vlxIR_a16RBx3yOQ",
    note: "Clear match: La Residencia, A Belmond Hotel"
  },
  "cap-rocat": {
    placeId: "ChIJ_drNRxOXlxIR0WarZLbVaRQ",
    note: "Clear match: Hotel Cap Rocat"
  },
  "purobeach-palma": {
    placeId: "ChIJ4a3aTKaWlxIRswFN7GZDDhk",
    note: "Clear match: Purobeach Palma"
  },
  "gran-folies-cala-llamp": {
    placeId: "ChIJNZ_PjqUmmBIRUcbKeHIy20c",
    note: "Clear match: Beach Club Gran Folies"
  },
  "sendero-cala-deia": {
    placeId: "ChIJ75UrJ7nvlxIRZ8rbuFrdatY",
    note: "Uses Cala Deia visual reference for the walking route"
  },
  "cala-deia": {
    placeId: "ChIJ75UrJ7nvlxIRZ8rbuFrdatY",
    note: "Clear match: Cala Deia"
  },
  "balneario-illetas": {
    placeId: "ChIJBQj0SHeOlxIRCDE2oiizWik",
    note: "Clear match: Balneario Illetas"
  }
};

type GooglePhoto = {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: Array<{ displayName?: string; uri?: string }>;
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  googleMapsUri?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  photos?: GooglePhoto[];
};

type ImageCandidate = {
  url?: string;
  source?: string;
  field?: string;
  extractionMethod?: string;
  confidence?: string;
  reason?: string;
  credit?: string;
  photoName?: string;
  widthPx?: number;
  heightPx?: number;
  imageQualityScore?: number;
  imageQualityReasons?: string[];
  foundAt?: string;
};

type BusinessRow = {
  id: string;
  name: string;
  display_name: string | null;
  category: string | null;
  website: string | null;
  google_place_id: string | null;
  primary_image_url: string | null;
  image_candidate_urls: ImageCandidate[] | null;
  raw_google_place: Record<string, unknown> | null;
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

function parseArgs() {
  const options = { maxPhotos: DEFAULT_MAX_PHOTOS, dryRun: false };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--max-photos=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) options.maxPhotos = Math.min(value, 10);
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function fetchPlace(apiKey: string, placeId: string): Promise<GooglePlace> {
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "id",
        "displayName",
        "formattedAddress",
        "googleMapsUri",
        "websiteUri",
        "rating",
        "userRatingCount",
        "photos.name",
        "photos.widthPx",
        "photos.heightPx",
        "photos.authorAttributions"
      ].join(",")
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`details ${response.status}: ${body}`);
  }

  return response.json();
}

async function fetchPhotoUri(apiKey: string, photoName: string) {
  const url = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
  url.searchParams.set("maxWidthPx", "1600");
  url.searchParams.set("skipHttpRedirect", "true");

  const response = await fetch(url, {
    headers: { "X-Goog-Api-Key": apiKey }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`media ${response.status}: ${body}`);
  }

  const media = await response.json();
  return typeof media.photoUri === "string" ? media.photoUri : null;
}

function getCredit(photo: GooglePhoto) {
  const names = (photo.authorAttributions ?? [])
    .map((attribution) => attribution.displayName?.trim())
    .filter(Boolean);

  return names.length ? `Google Places: ${names.join(", ")}` : "Google Places";
}

function getExistingKeys(candidates: ImageCandidate[]) {
  const keys = new Set<string>();
  for (const candidate of candidates) {
    if (candidate.url) keys.add(`url:${candidate.url}`);
    if (candidate.photoName) keys.add(`photo:${candidate.photoName}`);
  }
  return keys;
}

function getPhotoNames(photos: GooglePhoto[]) {
  return photos.map((photo) => photo.name).filter((name): name is string => Boolean(name));
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");

  const supabase = createSupabaseClient();
  const ids = Object.keys(PLACE_MATCHES);
  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,display_name,category,website,google_place_id,primary_image_url,image_candidate_urls,raw_google_place")
    .in("id", ids)
    .is("primary_image_url", null);

  if (error) throw new Error(`Cannot read manual seeds. Details: ${error.message}`);

  const rows = (data ?? []) as BusinessRow[];
  let updated = 0;
  let candidatesAdded = 0;
  const skipped = ids.filter((id) => !rows.some((row) => row.id === id));
  const matched: Array<{ business: string; place: string | null; added: number; bestScore: number }> = [];
  const errors: Array<{ id: string; error: string }> = [];

  for (const business of rows) {
    try {
      const match = PLACE_MATCHES[business.id];
      const place = await fetchPlace(apiKey, match.placeId);
      const photos = Array.isArray(place.photos) ? place.photos : [];
      const existing = Array.isArray(business.image_candidate_urls) ? business.image_candidate_urls : [];
      const existingKeys = getExistingKeys(existing);
      const newCandidates: ImageCandidate[] = [];

      for (const photo of photos.slice(0, options.maxPhotos)) {
        if (!photo.name || existingKeys.has(`photo:${photo.name}`)) continue;

        const photoUri = await fetchPhotoUri(apiKey, photo.name);
        if (!photoUri || existingKeys.has(`url:${photoUri}`)) continue;

        newCandidates.push({
          url: photoUri,
          source: "google_places",
          field: "google_place_photo",
          extractionMethod: "google_places_photo",
          confidence: "high",
          reason: `${business.category ?? "business"} google places manual match: ${match.note}`,
          credit: getCredit(photo),
          photoName: photo.name,
          widthPx: photo.widthPx,
          heightPx: photo.heightPx,
          foundAt: new Date().toISOString()
        });
      }

      if (!newCandidates.length) {
        matched.push({ business: business.display_name || business.name, place: place.displayName?.text ?? null, added: 0, bestScore: 0 });
        continue;
      }

      const scoredCandidates = scoreAndSortImageCandidates([...existing, ...newCandidates]);

      if (!options.dryRun) {
        const { data: duplicatePlaceOwner, error: duplicatePlaceError } = await supabase
          .from("businesses")
          .select("id")
          .eq("google_place_id", place.id || match.placeId)
          .neq("id", business.id)
          .maybeSingle();

        if (duplicatePlaceError) throw duplicatePlaceError;

        const { error: updateError } = await supabase
          .from("businesses")
          .update({
            google_place_id: duplicatePlaceOwner ? business.google_place_id : business.google_place_id || place.id || match.placeId,
            website: business.website || place.websiteUri || null,
            website_type: business.website || place.websiteUri ? "official_website" : null,
            google_maps_url: place.googleMapsUri ?? null,
            rating: place.rating ?? null,
            reviews_count: place.userRatingCount ?? null,
            image_candidate_urls: scoredCandidates,
            photo_names: getPhotoNames(photos),
            raw_google_place: {
              ...(business.raw_google_place ?? {}),
              ...place,
              manual_seed_image_match: {
                note: match.note,
                matched_at: new Date().toISOString(),
                google_place_id_already_used_by: duplicatePlaceOwner?.id ?? null
              }
            }
          })
          .eq("id", business.id);

        if (updateError) throw updateError;
        updated += 1;
      }

      candidatesAdded += newCandidates.length;
      matched.push({
        business: business.display_name || business.name,
        place: place.displayName?.text ?? null,
        added: newCandidates.length,
        bestScore: scoredCandidates[0]?.imageQualityScore ?? 0
      });
    } catch (error) {
      errors.push({
        id: business.id,
        error: error instanceof Error ? error.message : JSON.stringify(error)
      });
    }
  }

  console.log(JSON.stringify({
    dry_run: options.dryRun,
    matched_businesses: matched.length,
    updated_businesses: updated,
    google_candidates_added: candidatesAdded,
    skipped_not_missing_or_not_found: skipped,
    matched,
    errors
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
