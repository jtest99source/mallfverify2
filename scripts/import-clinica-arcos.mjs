import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { calculateAuthorityScore, createSocialProfiles, detectWebsiteType, inferLocationFromAddress } from "../src/lib/business-geo.ts";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY");
const CID = "3868828981933754447";
const CAT = "healthcare";
const LANG = { en: "fluent", de: "basic", source: "business_direct", confirmedAt: "2026-07" };

function toSlug(v) { return v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""); }
async function getUniqueSlug(base, pid) {
  let c = base, n = 2;
  while (true) {
    const { data } = await sb.from("businesses").select("id,google_place_id").eq("category", CAT).eq("slug", c).maybeSingle();
    if (!data || data.google_place_id === pid) return c;
    c = `${base}-${n++}`;
  }
}
async function textSearch(q) {
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "places.id,places.displayName,places.googleMapsUri,places.formattedAddress" },
    body: JSON.stringify({ textQuery: q, languageCode: "es", regionCode: "ES", maxResultCount: 10 })
  });
  const d = await r.json(); return d.places ?? [];
}
async function fetchPlace(pid) {
  const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(pid)}`, {
    headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "id,displayName,formattedAddress,location,googleMapsUri,websiteUri,nationalPhoneNumber,rating,userRatingCount,primaryType,types,photos.name,photos.authorAttributions,reviews.rating,reviews.text,reviews.relativePublishTimeDescription,reviews.authorAttribution" }
  });
  if (!r.ok) throw new Error(`Places API ${r.status}: ${await r.text()}`);
  return r.json();
}
function reviewText(r) { return typeof r.text === "string" ? r.text : r.text?.text; }
function buildReviews(place) {
  return (place.reviews ?? []).map(r => ({
    authorName: r.authorAttribution?.displayName ?? null, authorUri: r.authorAttribution?.uri ?? null,
    rating: typeof r.rating === "number" ? r.rating : null, relativeTimeDescription: r.relativePublishTimeDescription ?? null,
    text: reviewText(r) ?? null, languageCode: typeof r.text === "object" ? r.text?.languageCode ?? null : null,
  })).filter(r => r.text);
}

// 1) find place_id
const hits = [...await textSearch("Clínica dental Arcos Mallorca"), ...await textSearch("Clinica Arcos Palma Mallorca"), ...await textSearch("clinicaarcosmallorca")];
let place = hits.find(p => (p.googleMapsUri || "").includes(`cid=${CID}`)) || hits.find(p => /arcos/i.test(p.displayName?.text || ""));
if (!place) { console.log("No encontrada. Candidatos:", [...new Set(hits.map(p => `${p.displayName?.text} — ${p.googleMapsUri}`))].join("\n")); process.exit(1); }
const pid = place.id;
console.log(`Match: ${place.displayName?.text} (place_id ${pid}) — cid match: ${(place.googleMapsUri || "").includes(`cid=${CID}`)}`);

// 2) already in DB?
const { data: existing } = await sb.from("businesses").select("id,slug").eq("google_place_id", pid).maybeSingle();
if (existing) {
  await sb.from("businesses").update({ language_verification: LANG }).eq("id", existing.id);
  console.log(`Ya existía (${existing.id}); idioma actualizado. slug: /${CAT}/${existing.slug}`);
  process.exit(0);
}

// 3) fetch + insert
const p = await fetchPlace(pid);
const id = `google-${pid}`;
const name = p.displayName?.text ?? "Clínica Arcos";
const address = p.formattedAddress ?? "";
const website = p.websiteUri ?? null;
const loc = inferLocationFromAddress(address);
const wsType = detectWebsiteType(website);
const photos = (p.photos ?? []).map(x => x.name).filter(Boolean);
const slug = await getUniqueSlug(toSlug(name), pid);
const shortDesc = `Clínica dental en ${loc.municipality || loc.city || "Palma"} con datos verificados de Google.`;
const { error } = await sb.from("businesses").insert({
  id, slug, name, category: CAT, short_description: shortDesc, description: "",
  rating: p.rating ?? null, reviews_count: p.userRatingCount ?? null,
  website, phone: p.nationalPhoneNumber ?? null, address,
  latitude: p.location?.latitude ?? null, longitude: p.location?.longitude ?? null,
  google_maps_url: p.googleMapsUri ?? null, primary_type: p.primaryType ?? null, raw_google_place: p, tags: p.types ?? [],
  primary_photo_name: photos[0] ?? null, photo_names: photos.length ? photos : null,
  place_reviews: buildReviews(p), detail_enriched_at: new Date().toISOString(),
  area: loc.area, city: loc.city ?? null, municipality: loc.municipality ?? null, island: "Mallorca",
  website_type: wsType, social_profiles: createSocialProfiles(website, wsType),
  authority_score: calculateAuthorityScore({ rating: p.rating, reviews_count: p.userRatingCount, website, category: CAT }),
  image: "/images/placeholder.svg", gallery: [], opening_hours: null, faqs: [], best_for: [],
  seo: { title: `${name}: clínica dental en Mallorca | Mallorca Verified`, description: shortDesc },
  status: "published", source: "google_places", commercial_priority: "medium", client_potential: "medium",
  is_featured: false, is_claimed: false, instagram: null, price_level: null,
  updated_at: new Date().toISOString().slice(0, 10), imported_at: new Date().toISOString(),
  google_place_id: pid, language_verification: LANG
});
if (error) { console.error("Insert error:", error.message); process.exit(1); }
console.log(`✓ Importada: ${name} (★${p.rating}, ${p.userRatingCount} reseñas) — ${loc.city || loc.area} — slug /${CAT}/${slug} — id ${id}`);
