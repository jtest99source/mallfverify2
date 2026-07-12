// Imports the curated medical-aesthetic clinics (medicina estética) from
// data/import-previews/clinicas_esteticas_mallorca.json.
//
// The source is noisy (nail/hair/beauty salons, vets, dentists, hospitals), so
// we re-derive the KEEP bucket here (medical-aesthetic signal only) — same logic
// used to report the ~113 candidates. They import as category "healthcare" with
// the "medicina-estetica" tag, which the virtual "aesthetic-clinics" category
// carves out (and general healthcare excludes). Fresh rows go in as draft.
//
// Usage:
//   node scripts/import-estetica.mjs             # dry-run
//   node scripts/import-estetica.mjs --apply     # writes
//   node scripts/import-estetica.mjs --apply --limit=5
//
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { calculateAuthorityScore, createSocialProfiles, detectWebsiteType, inferLocationFromAddress, isWithinMallorca } from "../src/lib/business-geo.ts";

const SOURCE = "data/import-previews/clinicas_esteticas_mallorca.json";
const AESTHETIC_TAG = "medicina-estetica";
const APPLY = process.argv.includes("--apply");
const LIMIT = (() => { const a = process.argv.find((x) => x.startsWith("--limit=")); return a ? Number.parseInt(a.slice(8), 10) : null; })();

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    if (!process.env[k]) process.env[k] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
}

const norm = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Same classifier used for the report — KEEP = medical aesthetic only.
const NOISE = /veterinari|\bvet\b|dental|odontolog|hospital|centro de salud|centre de salut|ibsalut|unidad basica|unitat basica|\bp\.?a\.?c\b|fisioterap|\bfisio\b|podolog|\boptic|psicolog|psiquiatr|acupuntura|farmacia|bauhaus|muller|supermercado|reflexolog|osteopat|quiromasaj|nutriclinic|dialisi|reconocimientos medic|centre medic|\bespla\b|logoped|healing|retreat|\byoga\b|pilates|fish spa|centro medico son|centres medics canovas|centro medico canovas|centro medico inca|centro medico manacor|med-in|comyce|better2know|ortoped/;
const MED = /medicina estetica|medico estetico|dermatolog|cirug|cirujano|dermoestetic|medicina capilar|aesthetic|clinica.*(estetic|medic|laser|dermat|capilar|plast)|(dr|dra)\.? .*(estetic|dermatolog|plastic|laser|capilar|facial)|laserum|no\+vello|sinvello|laser diodo|depilacion laser|instituto rubi|imeba|mesomedic|clinica londres|skin|lipo|rejuven|blefaroplast|oculoplast/;

function isKeep(r) {
  if (!isWithinMallorca(r.lat, r.lng)) return false;
  const t = norm(r.name) + " " + norm(r.address);
  return MED.test(t) && !NOISE.test(t);
}

function toSlug(v) {
  return v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

async function getUniqueSlug(sb, baseSlug, placeId) {
  let candidate = baseSlug, suffix = 2;
  while (true) {
    const { data, error } = await sb.from("businesses").select("id, google_place_id").eq("category", "healthcare").eq("slug", candidate).maybeSingle();
    if (error) throw error;
    if (!data || data.google_place_id === placeId) return candidate;
    candidate = `${baseSlug}-${suffix}`; suffix += 1;
  }
}

async function fetchPrimaryPhoto(placeId, key) {
  try {
    const det = await fetch(`https://places.googleapis.com/v1/places/${placeId}?key=${key}`, { headers: { "X-Goog-FieldMask": "photos" } });
    const dj = await det.json();
    const names = (dj.photos ?? []).map((p) => p.name).filter(Boolean);
    if (!names.length) return { primaryUrl: null, photoNames: null, primaryName: null };
    const media = await fetch(`https://places.googleapis.com/v1/${names[0]}/media?maxWidthPx=1600&skipHttpRedirect=true&key=${key}`);
    const mj = await media.json();
    return { primaryUrl: mj.photoUri ?? null, photoNames: names, primaryName: names[0] };
  } catch {
    return { primaryUrl: null, photoNames: null, primaryName: null };
  }
}

async function main() {
  loadLocalEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, gkey = process.env.GOOGLE_PLACES_API_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const data = JSON.parse(Buffer.from(readFileSync(SOURCE, "latin1"), "latin1").toString("utf8"));
  const seen = new Set();
  let keep = [];
  for (const r of data) {
    if (!r.place_id || seen.has(r.place_id)) continue;
    seen.add(r.place_id);
    if (isKeep(r)) keep.push(r);
  }
  if (LIMIT) keep = keep.slice(0, LIMIT);
  console.log(`KEEP candidates: ${keep.length}${LIMIT ? ` (limited to ${LIMIT})` : ""} | apply=${APPLY}`);

  let inserted = 0, tagged = 0, skipped = 0;
  for (const [idx, r] of keep.entries()) {
    const progress = `[${idx + 1}/${keep.length}]`;
    const { data: existing, error: exErr } = await sb.from("businesses").select("id, slug, tags, category, status").eq("google_place_id", r.place_id).maybeSingle();
    if (exErr) throw exErr;

    if (existing) {
      // Reclassify existing row into aesthetic by adding the tag (no duplicate).
      const tags = Array.from(new Set([...(existing.tags ?? []), AESTHETIC_TAG]));
      console.log(`${progress} TAG existing (${existing.status}/${existing.category}): ${r.name}`);
      if (APPLY) {
        // Normalize category to healthcare so the aesthetic carve (healthcare + tag) picks it up.
        const { error } = await sb.from("businesses").update({ tags, category: "healthcare" }).eq("id", existing.id);
        if (error) throw error;
      }
      tagged++;
      continue;
    }

    const location = inferLocationFromAddress(r.address);
    const websiteType = detectWebsiteType(r.website);
    const authority = calculateAuthorityScore({ rating: r.rating, reviews_count: r.reviews_count, website: r.website, phone: r.phone });
    const areaLabel = location.area && location.area !== "Mallorca" ? ` en ${location.area}` : " en Mallorca";
    const photo = APPLY && gkey ? await fetchPrimaryPhoto(r.place_id, gkey) : { primaryUrl: null, photoNames: null, primaryName: null };
    const slug = APPLY ? await getUniqueSlug(sb, toSlug(r.name), r.place_id) : toSlug(r.name);

    console.log(`${progress} INSERT: ${r.name} — ${location.area}${photo.primaryUrl ? " (photo)" : ""}`);
    if (APPLY) {
      const { error } = await sb.from("businesses").insert({
        id: `google-${r.place_id}`,
        slug,
        name: r.name,
        category: "healthcare",
        short_description: `Clínica de medicina estética${areaLabel} con datos de Google pendiente de revisión editorial.`,
        description: "",
        rating: r.rating ?? null,
        reviews_count: r.reviews_count ?? null,
        website: r.website ?? null,
        phone: r.phone ?? null,
        address: r.address ?? null,
        latitude: r.lat ?? null,
        longitude: r.lng ?? null,
        google_maps_url: r.maps_url ?? null,
        primary_type: null,
        raw_google_place: null,
        primary_photo_name: photo.primaryName,
        photo_names: photo.photoNames,
        primary_image_url: photo.primaryUrl,
        primary_image_source: photo.primaryUrl ? "google_places" : null,
        tags: [AESTHETIC_TAG],
        best_for: [],
        area: location.area,
        city: location.city ?? null,
        municipality: location.municipality ?? null,
        island: "Mallorca",
        website_type: websiteType,
        social_profiles: createSocialProfiles(r.website, websiteType),
        authority_score: authority,
        geo_score: authority,
        instagram: null,
        price_level: null,
        image: "/images/placeholder.svg",
        gallery: [],
        opening_hours: null,
        faqs: [],
        seo: { title: `${r.name}: Clínica de medicina estética en Mallorca | Mallorca Verified`, description: `Clínica de medicina estética${areaLabel}.` },
        updated_at: new Date().toISOString().slice(0, 10),
        imported_at: new Date().toISOString(),
        google_place_id: r.place_id,
        source: "google_places",
        status: "draft",
        commercial_priority: "medium",
        client_potential: "medium",
        is_featured: false,
        is_claimed: false
      });
      if (error) throw error;
    }
    inserted++;
  }

  console.log(`\n${APPLY ? "APPLIED" : "DRY RUN"} — inserted(new draft): ${inserted} | tagged(existing): ${tagged} | skipped: ${skipped}`);
  if (!APPLY) console.log("Re-run with --apply to write.");
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
