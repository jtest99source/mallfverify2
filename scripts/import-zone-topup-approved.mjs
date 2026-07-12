/**
 * import-zone-topup-approved.mjs
 *
 * Imports zone-topup approved preview files into Supabase as drafts.
 *
 * Usage:
 *   node scripts/import-zone-topup-approved.mjs --stamp=2026-07-06T11-18-33-755Z
 *   node scripts/import-zone-topup-approved.mjs --stamp=2026-07-06T11-18-33-755Z --category=restaurants
 *   node scripts/import-zone-topup-approved.mjs --stamp=2026-07-06T11-18-33-755Z --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import {
  calculateAuthorityScore,
  createSocialProfiles,
  detectWebsiteType,
  inferLocationFromAddress,
  isWithinMallorca,
} from "../src/lib/business-geo.ts";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

function argValue(name) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function toSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function getUniqueSlug(supabase, category, baseSlug, googlePlaceId) {
  let candidate = baseSlug;
  let suffix = 2;
  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, google_place_id")
      .eq("category", category)
      .eq("slug", candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data || data.google_place_id === googlePlaceId) return candidate;
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

function buildEnrichment(place) {
  const websiteType = detectWebsiteType(place.website);
  const location = inferLocationFromAddress(place.address);
  const authorityScore = calculateAuthorityScore(place);
  return {
    area: location.area,
    city: location.city ?? null,
    municipality: location.municipality ?? null,
    island: "Mallorca",
    website_type: websiteType,
    social_profiles: createSocialProfiles(place.website, websiteType),
    authority_score: authorityScore,
    geo_score: authorityScore,
  };
}

function getPhotoNames(place) {
  const photos = place.raw_google_place?.photos ?? place.photos ?? [];
  if (!Array.isArray(photos)) return [];
  return photos.map((p) => p.name).filter(Boolean);
}

// DB category name → image path
const CATEGORY_IMAGE = {
  restaurant: "/images/restaurant.svg",
  bar: "/images/bar.svg",
  cafe: "/images/cafe.svg",
  hotel: "/images/hotel.svg",
  bakery: "/images/bakery.svg",
  spa: "/images/placeholder.svg",
  gym: "/images/placeholder.svg",
  healthcare: "/images/placeholder.svg",
  veterinarian: "/images/placeholder.svg",
  "real-estate": "/images/placeholder.svg",
};

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

async function main() {
  loadEnv();

  const stamp = argValue("stamp");
  if (!stamp) throw new Error("Missing --stamp. Example: --stamp=2026-07-06T11-18-33-755Z");

  const categoryArg = argValue("category");
  const dryRun = process.argv.includes("--dry-run");

  const CATEGORIES = categoryArg
    ? [categoryArg]
    : ["restaurants", "bars", "cafes", "hotels", "bakeries", "spas", "gyms", "healthcare", "vets", "real-estate"];

  if (dryRun) console.log("DRY RUN — no writes to DB\n");

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const totals = { inserted: 0, updated: 0, skipped: 0, errors: 0 };

  for (const categoryKey of CATEGORIES) {
    const approvedPath = `data/import-previews/${categoryKey}-zone-topup-approved-${stamp}.json`;
    if (!existsSync(approvedPath)) {
      console.warn(`Missing approved file: ${approvedPath} — skipping`);
      continue;
    }

    const places = JSON.parse(readFileSync(approvedPath, "utf8"));
    const dbCategory = CATEGORY_DB_MAP[categoryKey] ?? categoryKey;
    const image = CATEGORY_IMAGE[dbCategory] ?? "/images/placeholder.svg";

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const place of places) {
      if (!place.google_place_id || !place.name) { skipped++; continue; }
      // Geo-fence: never publish places whose coordinates fall outside Mallorca.
      if (!isWithinMallorca(place.latitude, place.longitude)) { skipped++; continue; }

      // Check if already in DB
      const { data: existing } = await sb
        .from("businesses")
        .select("id, slug, status")
        .eq("google_place_id", place.google_place_id)
        .maybeSingle();

      const enrichment = buildEnrichment(place);
      const photoNames = getPhotoNames(place);

      const sharedPayload = {
        rating: place.rating ?? null,
        reviews_count: place.reviews_count ?? null,
        website: place.website ?? null,
        phone: place.phone ?? null,
        address: place.address ?? null,
        latitude: place.latitude ?? null,
        longitude: place.longitude ?? null,
        google_maps_url: place.google_maps_url ?? null,
        primary_type: place.primary_type ?? null,
        raw_google_place: place.raw_google_place ?? null,
        primary_photo_name: photoNames[0] ?? null,
        photo_names: photoNames.length ? photoNames : null,
        tags: place.types ?? [],
        ...enrichment,
        imported_at: new Date().toISOString(),
      };

      if (existing) {
        // Only update enrichment + rating data, never downgrade status
        if (!dryRun) {
          const { error } = await sb.from("businesses").update(sharedPayload).eq("id", existing.id);
          if (error) { console.error(`  UPDATE error ${place.name}: ${error.message}`); errors++; continue; }
        }
        updated++;
        continue;
      }

      // New insert
      const baseSlug = toSlug(place.name);
      const slug = dryRun ? baseSlug : await getUniqueSlug(sb, dbCategory, baseSlug, place.google_place_id);

      const shortDesc = enrichment.area && enrichment.area !== "Mallorca"
        ? `${dbCategory.charAt(0).toUpperCase() + dbCategory.slice(1)} en ${enrichment.area} con datos de Google pendiente de revisión editorial.`
        : `${dbCategory.charAt(0).toUpperCase() + dbCategory.slice(1)} en Mallorca con datos de Google pendiente de revisión editorial.`;

      if (!dryRun) {
        const { error } = await sb.from("businesses").insert({
          id: `google-${place.google_place_id}`,
          slug,
          name: place.name,
          category: dbCategory,
          short_description: shortDesc,
          description: "",
          ...sharedPayload,
          instagram: null,
          price_level: null,
          best_for: [],
          image,
          gallery: [],
          opening_hours: null,
          faqs: [],
          seo: {
            title: `${place.name}: ${dbCategory} en Mallorca | Mallorca Verified`,
            description: shortDesc,
          },
          updated_at: new Date().toISOString().slice(0, 10),
          google_place_id: place.google_place_id,
          source: "google_places",
          status: "draft",
          commercial_priority: "medium",
          client_potential: "medium",
          is_featured: false,
          is_claimed: false,
        });
        if (error) { console.error(`  INSERT error ${place.name}: ${error.message}`); errors++; continue; }
      }
      inserted++;
    }

    console.log(`${categoryKey.padEnd(14)}: ${inserted} inserted, ${updated} updated, ${skipped} skipped, ${errors} errors (${places.length} total)`);
    totals.inserted += inserted;
    totals.updated += updated;
    totals.skipped += skipped;
    totals.errors += errors;
  }

  console.log(`\nTotal: ${totals.inserted} inserted, ${totals.updated} updated, ${totals.skipped} skipped, ${totals.errors} errors`);
}

main().catch((e) => { console.error(e); process.exit(1); });
