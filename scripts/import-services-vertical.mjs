// Generic importer for the professional-services verticals (lawyers, tax-advisors).
// Reads a scraped Google preview JSON (same shape as the aesthetic batch:
// place_id, maps_url, name, rating, reviews_count, address, lat, lng, website,
// phone) and imports as the given real category. Geo-fences Mallorca, fetches a
// photo, inserts as draft; skips place_ids already in the DB.
//
// Usage:
//   node scripts/import-services-vertical.mjs --category=lawyers --file=data/import-previews/abogados.json
//   node scripts/import-services-vertical.mjs --category=tax-advisors --file=... --apply
//
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { calculateAuthorityScore, createSocialProfiles, detectWebsiteType, inferLocationFromAddress, isWithinMallorca } from "../src/lib/business-geo.ts";

const CATS = {
  lawyers: { bc: "lawyer", singular: "Despacho de abogados" },
  "tax-advisors": { bc: "tax-advisor", singular: "Gestoría o asesor fiscal" }
};

const arg = (n) => { const a = process.argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : null; };
const APPLY = process.argv.includes("--apply");
const LIMIT = arg("limit") ? Number.parseInt(arg("limit"), 10) : null;
const CATEGORY = arg("category");
const FILE = arg("file");

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim(); if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("="); if (i === -1) continue;
    const k = t.slice(0, i).trim(); if (!process.env[k]) process.env[k] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
}

// Pick the decoding with the fewest mojibake markers (handles both correct UTF-8
// and latin1-mangled exports).
function readData(file) {
  const buf = readFileSync(file);
  const plain = buf.toString("utf8");
  const alt = Buffer.from(buf.toString("latin1"), "latin1").toString("utf8");
  const score = (s) => (s.match(/Ã.|Â./g) || []).length;
  return JSON.parse(score(alt) < score(plain) ? alt : plain);
}

function toSlug(v) { return v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""); }

async function uniqSlug(sb, bc, base, pid) {
  let c = base, n = 2;
  while (true) {
    const { data, error } = await sb.from("businesses").select("id, google_place_id").eq("category", bc).eq("slug", c).maybeSingle();
    if (error) throw error;
    if (!data || data.google_place_id === pid) return c;
    c = `${base}-${n++}`;
  }
}

async function fetchPhoto(pid, key) {
  try {
    const d = await (await fetch(`https://places.googleapis.com/v1/places/${pid}?key=${key}`, { headers: { "X-Goog-FieldMask": "photos" } })).json();
    const names = (d.photos ?? []).map((p) => p.name).filter(Boolean);
    if (!names.length) return {};
    const m = await (await fetch(`https://places.googleapis.com/v1/${names[0]}/media?maxWidthPx=1600&skipHttpRedirect=true&key=${key}`)).json();
    return { url: m.photoUri ?? null, names, pn: names[0] };
  } catch { return {}; }
}

async function main() {
  loadLocalEnv();
  const cfg = CATS[CATEGORY];
  if (!cfg) throw new Error(`--category must be one of: ${Object.keys(CATS).join(", ")}`);
  if (!FILE || !existsSync(FILE)) throw new Error(`--file not found: ${FILE}`);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY, gkey = process.env.GOOGLE_PLACES_API_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  const data = readData(FILE);
  const seen = new Set();
  let rows = [];
  for (const r of data) {
    const pid = r.place_id ?? r.google_place_id;
    if (!pid || !r.name || seen.has(pid)) continue;
    seen.add(pid);
    const lat = r.lat ?? r.latitude, lng = r.lng ?? r.longitude;
    if (!isWithinMallorca(lat, lng)) continue;
    rows.push({ ...r, pid, lat, lng });
  }
  if (LIMIT) rows = rows.slice(0, LIMIT);
  console.log(`[${CATEGORY}] in-Mallorca candidates: ${rows.length} | apply=${APPLY}`);

  let inserted = 0, skipped = 0, outOfMallorca = data.length - rows.length;
  for (const [idx, r] of rows.entries()) {
    const progress = `[${idx + 1}/${rows.length}]`;
    const { data: ex } = await sb.from("businesses").select("id").eq("google_place_id", r.pid).maybeSingle();
    if (ex) { console.log(`${progress} skip (exists): ${r.name}`); skipped++; continue; }

    const loc = inferLocationFromAddress(r.address);
    const wt = detectWebsiteType(r.website);
    const auth = calculateAuthorityScore({ rating: r.rating, reviews_count: r.reviews_count, website: r.website, phone: r.phone });
    const areaLabel = loc.area && loc.area !== "Mallorca" ? ` en ${loc.area}` : " en Mallorca";
    const photo = APPLY && gkey ? await fetchPhoto(r.pid, gkey) : {};
    const slug = APPLY ? await uniqSlug(sb, cfg.bc, toSlug(r.name), r.pid) : toSlug(r.name);

    console.log(`${progress} INSERT: ${r.name} — ${loc.area}${photo.url ? " (photo)" : ""}`);
    if (APPLY) {
      const { error } = await sb.from("businesses").insert({
        id: `google-${r.pid}`,
        slug, name: r.name, category: cfg.bc,
        short_description: `${cfg.singular}${areaLabel} con datos de Google pendiente de revisión editorial.`,
        description: "",
        rating: r.rating ?? null, reviews_count: r.reviews_count ?? null,
        website: r.website ?? null, phone: r.phone ?? null, address: r.address ?? null,
        latitude: r.lat ?? null, longitude: r.lng ?? null,
        google_maps_url: r.maps_url ?? r.google_maps_url ?? null,
        primary_type: null, raw_google_place: null,
        primary_photo_name: photo.pn ?? null, photo_names: photo.names ?? null,
        primary_image_url: photo.url ?? null, primary_image_source: photo.url ? "google_places" : null,
        tags: [], best_for: [],
        area: loc.area, city: loc.city ?? null, municipality: loc.municipality ?? null, island: "Mallorca",
        website_type: wt, social_profiles: createSocialProfiles(r.website, wt), authority_score: auth, geo_score: auth,
        instagram: null, price_level: null, image: "/images/placeholder.svg", gallery: [], opening_hours: null, faqs: [],
        seo: { title: `${r.name}: ${cfg.singular} en Mallorca | Mallorca Verified`, description: `${cfg.singular}${areaLabel}.` },
        updated_at: new Date().toISOString().slice(0, 10), imported_at: new Date().toISOString(),
        google_place_id: r.pid, source: "google_places", status: "draft",
        commercial_priority: "medium", client_potential: "medium", is_featured: false, is_claimed: false
      });
      if (error) throw error;
    }
    inserted++;
  }
  console.log(`\n${APPLY ? "APPLIED" : "DRY RUN"} — inserted: ${inserted} | skipped(exists): ${skipped} | out-of-Mallorca: ${outOfMallorca}`);
  if (!APPLY) console.log("Re-run with --apply to write.");
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
