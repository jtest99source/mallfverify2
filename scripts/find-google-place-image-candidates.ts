import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { scoreAndSortImageCandidates } from "../src/lib/image-candidate-scoring";

const DEFAULT_LIMIT = 50;
const DEFAULT_MAX_PHOTOS = 6;

type GooglePhoto = {
  name?: string;
  widthPx?: number;
  heightPx?: number;
  authorAttributions?: Array<{
    displayName?: string;
    uri?: string;
  }>;
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
  google_place_id: string | null;
  authority_score: number | null;
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
  const args = process.argv.slice(2);
  const options = {
    limit: DEFAULT_LIMIT,
    maxPhotos: DEFAULT_MAX_PHOTOS,
    category: null as string | null,
    dryRun: false
  };

  for (const arg of args) {
    if (arg.startsWith("--limit=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) options.limit = Math.min(value, 500);
    } else if (arg.startsWith("--max-photos=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) options.maxPhotos = Math.min(value, 10);
    } else if (arg.startsWith("--category=")) {
      options.category = arg.split("=")[1] || null;
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

async function fetchPlacePhotos(apiKey: string, googlePlaceId: string) {
  const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(googlePlaceId)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,photos.name,photos.widthPx,photos.heightPx,photos.authorAttributions"
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`details ${response.status}: ${body}`);
  }

  const place = await response.json();
  return Array.isArray(place.photos) ? (place.photos as GooglePhoto[]) : [];
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

async function countCoverage(supabase: any) {
  const { data, error } = await supabase
    .from("businesses")
    .select("primary_image_url")
    .in("status", ["published", "premium"]);

  if (error) throw error;
  const rows = data ?? [];
  const withImages = rows.filter((row: { primary_image_url: string | null }) => row.primary_image_url?.trim()).length;
  return {
    total_published_premium: rows.length,
    with_primary_image_url: withImages,
    without_primary_image_url: rows.length - withImages,
    coverage_percent: rows.length ? Math.round((withImages / rows.length) * 10000) / 100 : 0
  };
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");

  const supabase = createSupabaseClient();
  const beforeCoverage = await countCoverage(supabase);

  let query = supabase
    .from("businesses")
    .select("id,name,display_name,category,google_place_id,authority_score,primary_image_url,image_candidate_urls,raw_google_place")
    .in("status", ["published", "premium"])
    .is("primary_image_url", null)
    .not("google_place_id", "is", null)
    .order("authority_score", { ascending: false, nullsFirst: false })
    .limit(options.limit);

  if (options.category) query = query.eq("category", options.category);

  const { data, error } = await query;
  if (error) throw new Error(`Cannot read businesses. Details: ${error.message}`);

  const businesses = (data ?? []) as BusinessRow[];
  let processed = 0;
  let updated = 0;
  let businessesWithNewCandidates = 0;
  let candidatesAdded = 0;
  let withoutPhotos = 0;
  const errors: Array<{ business: string; google_place_id: string | null; error: string }> = [];
  const topAdded: Array<{ business: string; category: string | null; added: number; bestScore: number; bestUrl: string | undefined }> = [];

  for (const business of businesses) {
    processed += 1;

    try {
      if (!business.google_place_id) continue;

      const photos = await fetchPlacePhotos(apiKey, business.google_place_id);
      if (!photos.length) {
        withoutPhotos += 1;
        continue;
      }

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
          reason: `${business.category ?? "business"} google places photo ${photo.widthPx ?? ""}x${photo.heightPx ?? ""}`,
          credit: getCredit(photo),
          photoName: photo.name,
          widthPx: photo.widthPx,
          heightPx: photo.heightPx,
          foundAt: new Date().toISOString()
        });
      }

      if (!newCandidates.length) continue;

      const scoredCandidates = scoreAndSortImageCandidates([...existing, ...newCandidates]);
      candidatesAdded += newCandidates.length;
      businessesWithNewCandidates += 1;

      if (!options.dryRun) {
        const rawGooglePlace = {
          ...(business.raw_google_place ?? {}),
          photos
        };

        const { error: updateError } = await supabase
          .from("businesses")
          .update({
            image_candidate_urls: scoredCandidates,
            photo_names: getPhotoNames(photos),
            raw_google_place: rawGooglePlace
          })
          .eq("id", business.id);

        if (updateError) throw updateError;
        updated += 1;
      }

      const best = scoredCandidates[0];
      topAdded.push({
        business: business.display_name || business.name,
        category: business.category,
        added: newCandidates.length,
        bestScore: best?.imageQualityScore ?? 0,
        bestUrl: best?.url
      });
    } catch (error) {
      errors.push({
        business: business.display_name || business.name,
        google_place_id: business.google_place_id,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  topAdded.sort((a, b) => b.bestScore - a.bestScore);
  const afterCoverage = await countCoverage(supabase);

  console.log(JSON.stringify({
    dry_run: options.dryRun,
    processed_businesses: processed,
    updated_businesses: updated,
    businesses_with_new_google_candidates: businessesWithNewCandidates,
    google_candidates_added: candidatesAdded,
    businesses_without_google_photos: withoutPhotos,
    top_google_candidates: topAdded.slice(0, 30),
    coverage_before: beforeCoverage,
    coverage_after: afterCoverage,
    errors
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
