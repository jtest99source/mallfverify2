/**
 * import-excel-businesses.mjs
 *
 * Imports businesses from the ChatGPT Excel file into Supabase.
 * Calls Google Places Details API only for place_ids not already in DB.
 *
 * Usage:
 *   npx tsx scripts/import-excel-businesses.mjs
 *   npx tsx scripts/import-excel-businesses.mjs --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import xlsx from "xlsx";
import {
  calculateAuthorityScore,
  createSocialProfiles,
  detectWebsiteType,
  inferLocationFromAddress,
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

function toSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function getUniqueSlug(sb, category, baseSlug, googlePlaceId) {
  let candidate = baseSlug;
  let suffix = 2;
  while (true) {
    const { data, error } = await sb
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

function buildEnrichment(address, website) {
  const websiteType = detectWebsiteType(website);
  const location = inferLocationFromAddress(address ?? "");
  return {
    area: location.area,
    city: location.city ?? null,
    municipality: location.municipality ?? null,
    island: "Mallorca",
    website_type: websiteType,
    social_profiles: createSocialProfiles(website, websiteType),
  };
}

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
  "beach-club": "/images/placeholder.svg",
  "boat-rental": "/images/placeholder.svg",
  activity: "/images/placeholder.svg",
  museum: "/images/placeholder.svg",
  nightlife: "/images/placeholder.svg",
};

const PLACES_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "googleMapsUri",
  "websiteUri",
  "nationalPhoneNumber",
  "rating",
  "userRatingCount",
  "primaryType",
  "types",
  "regularOpeningHours",
  "photos.name",
  "photos.widthPx",
  "photos.heightPx",
].join(",");

async function fetchPlaceDetails(apiKey, placeId) {
  const resp = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": PLACES_FIELD_MASK,
      },
    }
  );
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Places API ${resp.status} for ${placeId}: ${text}`);
  }
  return resp.json();
}

function extractPlaceId(url) {
  const m = (url || "").match(/place_id:([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

function toRow(r, cat) {
  const pid = extractPlaceId(r["Google Maps URL"]);
  const nota = (r["Nota"] || "").toLowerCase();
  if (!pid || nota.includes("excluido") || nota.includes("<4.0")) return null;
  if ((parseFloat(r["Rating"]) || 0) < 4.0) return null;
  return { name: r["Nombre"], muni: r["Municipio"], rating: parseFloat(r["Rating"]), reviews: parseInt(r["Nº reviews"]) || 0, place_id: pid, category: cat };
}

function readExcel() {
  const wb = xlsx.readFile("mallorca_verified_negocios_nuevos (2).xlsx");
  const all = [];

  const DIRECT = {
    "Restaurantes": "restaurant", "Hoteles": "hotel", "Cafés": "cafe", "Bares": "bar",
    "Panaderías": "bakery", "Inmobiliarias": "real-estate", "Salud": "healthcare", "Veterinarios": "veterinarian",
  };
  for (const [sheet, cat] of Object.entries(DIRECT)) {
    const ws = wb.Sheets[sheet];
    if (!ws) continue;
    xlsx.utils.sheet_to_json(ws, { defval: "" }).filter(r => r["Nombre"]).forEach(r => { const b = toRow(r, cat); if (b) all.push(b); });
  }

  const extras = [["Beach Clubs", "beach-club"], ["Ocio nocturno", "nightlife"], ["Boat Charter", "boat-rental"]];
  for (const [sh, cat] of extras) {
    const ws = wb.Sheets[sh];
    if (!ws) continue;
    xlsx.utils.sheet_to_json(ws, { defval: "" }).filter(r => r["Nombre"]).forEach(r => { const b = toRow(r, cat); if (b) all.push(b); });
  }

  const gymWs = wb.Sheets["Gimnasios"];
  if (gymWs) {
    xlsx.utils.sheet_to_json(gymWs, { defval: "" }).filter(r => r["Nombre"]).forEach(r => {
      let cat = "gym";
      if (r["Nombre"].includes("Golf")) cat = "activity";
      else if (r["Nombre"].includes("Aparthotel") || r["Nombre"].includes("Hotel")) cat = "hotel";
      const b = toRow(r, cat);
      if (b) all.push(b);
    });
  }

  const actMap = {
    "Bodega Ribas": "activity", "Bodegas Suau": "activity", "Celler Tianna Negre": "activity",
    "Celler Macià Batle": "activity", "Bodegues José L. Ferrer": "activity",
    "Miquel Oliver Vinyes i Bodegues": "activity", "Vins Miquel Gelabert": "activity",
    "Bodegues Castell Miquel": "activity", "Mesquida Mora": "activity", "4Kilos": "activity",
    "T Golf Calvia": "activity", "Capdepera Golf": "activity", "Golf Maioris": "activity",
    "Club de Golf de Son Servera": "activity", "Pula Golf Resort": "activity",
    "Coves de Campanet": "activity", "Jardins d'Alfàbia": "activity",
    "Rafa Nadal Museum": "museum", "Fundació Miró Mallorca": "museum",
    "Gordiola (Vidrierías/Museu)": "museum", "Museu La Granja d'Esporles": "museum",
    "Globus Mallorca Balloons": "activity", "Observatorio Astronómico de Mallorca": "activity",
    "Circuit Mallorca Llucmajor": "activity", "Western Water Park": "activity",
    "Cinesa Festival Park": "activity", "Restaurant & Tafona Son Catiu": "restaurant",
  };
  const actWs = wb.Sheets["Actividades"];
  if (actWs) {
    xlsx.utils.sheet_to_json(actWs, { defval: "" }).filter(r => r["Nombre"]).forEach(r => {
      const cat = actMap[r["Nombre"]];
      if (!cat) return;
      const b = toRow(r, cat);
      if (b) all.push(b);
    });
  }

  return all;
}

// The 7 hidden businesses ChatGPT recommends → republish
const REPUBLISH_PLACE_IDS = [
  "ChIJDUHh6KCrlxIRnHRj4KX6vg4", // Cassai Gran Cafè i Restaurant
  "ChIJ2YKBR9HplxIRztY4kXrRmaM", // L'Hermitage Hotel & Spa
  "ChIJ9SgowQbblxIRSicmRmpefh4", // Refugi Son Amer
  "ChIJw5A4xJKSlxIRR4kl8YMn9rI", // Planas Salud Medicina Estética
  "ChIJXfSKcsHDlxIRJCDglKce8j8", // Bodegues Castell Miquel
  "ChIJI4euacmJlxIRlwos5DpJkRI", // Kensington Finest Properties
  "ChIJ77dzNAPVlxIRG5zGvrb9BMw", // Aparthotel Duva Convention Center & Spa
];

async function main() {
  loadEnv();
  const dryRun = process.argv.includes("--dry-run");
  if (dryRun) console.log("DRY RUN — no writes to DB\n");

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY in .env.local");

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  // ── Step 1: Republish 7 hidden businesses ────────────────────────────────
  console.log("Step 1: Republishing hidden businesses...");
  const { data: hiddenOnes } = await sb
    .from("businesses")
    .select("id, name, status")
    .in("google_place_id", REPUBLISH_PLACE_IDS);

  const toRepublish = (hiddenOnes || []).filter(b => b.status === "hidden");
  console.log(`  Found ${toRepublish.length} hidden to republish:`);
  for (const b of toRepublish) console.log(`    ${b.name}`);

  if (!dryRun && toRepublish.length > 0) {
    const { error } = await sb
      .from("businesses")
      .update({ status: "published", updated_at: new Date().toISOString().slice(0, 10) })
      .in("id", toRepublish.map(b => b.id));
    if (error) { console.error("Republish error:", error); }
    else console.log(`  ✓ Republished ${toRepublish.length}`);
  }

  // ── Step 2: Identify new businesses from Excel ───────────────────────────
  console.log("\nStep 2: Loading Excel...");
  const allExcel = readExcel();
  console.log(`  ${allExcel.length} total in Excel (aptos)`);

  const allPlaceIds = allExcel.map(b => b.place_id);
  const { data: existing } = await sb
    .from("businesses")
    .select("google_place_id")
    .in("google_place_id", allPlaceIds);
  const existingSet = new Set((existing || []).map(r => r.google_place_id));

  const newOnes = allExcel.filter(b => !existingSet.has(b.place_id));
  console.log(`  ${existingSet.size} already in DB → skip`);
  console.log(`  ${newOnes.length} new → will call Places API`);

  // ── Step 3: Fetch from Places API + insert ───────────────────────────────
  console.log("\nStep 3: Fetching from Places API and inserting...\n");
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < newOnes.length; i++) {
    const biz = newOnes[i];
    const progress = `[${String(i + 1).padStart(2)}/${newOnes.length}]`;

    let placeData;
    try {
      placeData = await fetchPlaceDetails(apiKey, biz.place_id);
    } catch (e) {
      console.error(`  ${progress} ✗ API error for ${biz.name}: ${e.message}`);
      errors++;
      continue;
    }

    const name = placeData.displayName?.text ?? biz.name;
    const address = placeData.formattedAddress ?? "";
    const website = placeData.websiteUri ?? null;
    const phone = placeData.nationalPhoneNumber ?? null;
    const lat = placeData.location?.latitude ?? null;
    const lng = placeData.location?.longitude ?? null;
    const mapsUrl = placeData.googleMapsUri ?? null;
    const primaryType = placeData.primaryType ?? null;
    const types = placeData.types ?? [];
    const photos = placeData.photos ?? [];
    const photoNames = photos.map(p => p.name).filter(Boolean);

    const enrichment = buildEnrichment(address, website);
    const authorityScore = calculateAuthorityScore({
      rating: biz.rating, reviews_count: biz.reviews, website, category: biz.category,
    });

    const image = CATEGORY_IMAGE[biz.category] ?? "/images/placeholder.svg";

    const shortDesc = enrichment.area && enrichment.area !== "Mallorca"
      ? `${biz.category.charAt(0).toUpperCase() + biz.category.slice(1)} en ${enrichment.area} con datos de Google pendiente de revisión editorial.`
      : `${biz.category.charAt(0).toUpperCase() + biz.category.slice(1)} en Mallorca con datos de Google pendiente de revisión editorial.`;

    const baseSlug = toSlug(name);
    const slug = dryRun ? baseSlug : await getUniqueSlug(sb, biz.category, baseSlug, biz.place_id);

    console.log(`  ${progress} ${dryRun ? "(dry)" : "INSERT"} ★${biz.rating} ${name} [${biz.category}] ${enrichment.municipality || enrichment.city || "?"}`);

    if (!dryRun) {
      const { error } = await sb.from("businesses").insert({
        id: `google-${biz.place_id}`,
        slug,
        name,
        category: biz.category,
        short_description: shortDesc,
        description: "",
        rating: biz.rating ?? null,
        reviews_count: biz.reviews ?? null,
        website,
        phone,
        address,
        latitude: lat,
        longitude: lng,
        google_maps_url: mapsUrl,
        primary_type: primaryType,
        raw_google_place: placeData,
        primary_photo_name: photoNames[0] ?? null,
        photo_names: photoNames.length ? photoNames : null,
        tags: types,
        ...enrichment,
        authority_score: authorityScore,
        geo_score: authorityScore,
        imported_at: new Date().toISOString(),
        updated_at: new Date().toISOString().slice(0, 10),
        google_place_id: biz.place_id,
        source: "google_places",
        status: "draft",
        instagram: null,
        price_level: null,
        best_for: [],
        image,
        gallery: [],
        opening_hours: null,
        faqs: [],
        seo: {
          title: `${name}: ${biz.category} en Mallorca | Mallorca Verified`,
          description: shortDesc,
        },
        commercial_priority: "medium",
        client_potential: "medium",
        is_featured: false,
        is_claimed: false,
      });
      if (error) {
        console.error(`    ✗ Insert error: ${error.message}`);
        errors++;
        continue;
      }
    }
    inserted++;
  }

  console.log(`\n── Results ──────────────────────────────`);
  console.log(`Republished hidden: ${toRepublish.length}`);
  console.log(`Inserted new:       ${inserted}`);
  console.log(`Errors:             ${errors}`);
  if (dryRun) console.log("\n[DRY RUN — no DB changes]");
}

main().catch(e => { console.error(e); process.exit(1); });
