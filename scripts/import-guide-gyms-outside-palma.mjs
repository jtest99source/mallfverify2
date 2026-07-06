import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import {
  calculateAuthorityScore, createSocialProfiles,
  detectWebsiteType, inferLocationFromAddress,
} from "../src/lib/business-geo.ts";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function toSlug(v) {
  return v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
async function getUniqueSlug(category, base, pid) {
  let c = base, n = 2;
  while (true) {
    const { data } = await sb.from("businesses").select("id,google_place_id").eq("category", category).eq("slug", c).maybeSingle();
    if (!data || data.google_place_id === pid) return c;
    c = `${base}-${n++}`;
  }
}
async function fetchPlace(apiKey, pid) {
  const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(pid)}`, {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,location,googleMapsUri,websiteUri,nationalPhoneNumber,rating,userRatingCount,primaryType,types,photos.name",
    },
  });
  if (!r.ok) throw new Error(`Places API ${r.status}: ${await r.text()}`);
  return r.json();
}

// ── Businesses in this guide ──────────────────────────────────────────────
const BUSINESSES = [
  { pid: "ChIJixvdUBYtlhIRQadwuPyOKg4", name: "Thunder Fitness Club",         cat: "gym" },
  { pid: "ChIJgUUfv7fFlxIRP_XiIOVahG0", name: "Anytime Fitness Inca",          cat: "gym" },
  { pid: "ChIJJUgQRarFlxIR6T8QuSO5u5g", name: "Areafit Inca",                  cat: "gym" },
  { pid: "ChIJlV4WB3CJlxIRWOdYm1Hk5Rs", name: "Choice Training Club",          cat: "gym" },
  { pid: "ChIJ__8PrL6JlxIRT7BfVTXBNPM", name: "Shambhala Gym",                 cat: "gym" },
  { pid: "ChIJ3YIfWACJlxIRu8u0LJwOmYI", name: "C23 Athletxs Santa Ponsa",      cat: "gym" },
  { pid: "ChIJu-LCu18tlhIRI34DXfr1XC4", name: "Mantinia Gym",                  cat: "gym" },
  { pid: "ChIJq4nNKoUslhIRe94h7zpQJw8", name: "Summit Community Training",     cat: "gym" },
  { pid: "ChIJe8NFHs7plxIR6lWwrL2VME0", name: "Natur Yoga Studio",             cat: "gym" },
  { pid: "ChIJJcwTdF3plxIRuoUa5iVeo10", name: "S'espai 6 Pilates & Yoga Studio", cat: "gym" },
  { pid: "ChIJ5Y9m5rDolxIR3tCNo9dBkGk", name: "Tot Pilates",                   cat: "gym" },
];

// ── Step 1: check which exist ─────────────────────────────────────────────
const { data: existing } = await sb.from("businesses").select("id,google_place_id,status").in("google_place_id", BUSINESSES.map(b => b.pid));
const dbMap = new Map((existing || []).map(r => [r.google_place_id, r]));
const missing = BUSINESSES.filter(b => !dbMap.has(b.pid));
console.log(`In DB: ${dbMap.size}/${BUSINESSES.length} | Missing: ${missing.length}`);

// ── Step 2: import missing via Places API ────────────────────────────────
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
if (missing.length > 0 && !apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY");

for (const biz of missing) {
  const p = await fetchPlace(apiKey, biz.pid);
  const name = p.displayName?.text ?? biz.name;
  const address = p.formattedAddress ?? "";
  const website = p.websiteUri ?? null;
  const loc = inferLocationFromAddress(address);
  const wsType = detectWebsiteType(website);
  const photos = (p.photos ?? []).map(x => x.name).filter(Boolean);
  const slug = await getUniqueSlug(biz.cat, toSlug(name), biz.pid);
  const shortDesc = `Gym en ${loc.municipality || loc.city || "Mallorca"} con datos de Google pendiente de revisión editorial.`;
  const { error } = await sb.from("businesses").insert({
    id: `google-${biz.pid}`, slug, name, category: biz.cat,
    short_description: shortDesc, description: "",
    rating: p.rating ?? null, reviews_count: p.userRatingCount ?? null,
    website, phone: p.nationalPhoneNumber ?? null, address,
    latitude: p.location?.latitude ?? null, longitude: p.location?.longitude ?? null,
    google_maps_url: p.googleMapsUri ?? null,
    primary_type: p.primaryType ?? null, raw_google_place: p, tags: p.types ?? [],
    primary_photo_name: photos[0] ?? null, photo_names: photos.length ? photos : null,
    area: loc.area, city: loc.city ?? null, municipality: loc.municipality ?? null, island: "Mallorca",
    website_type: wsType, social_profiles: createSocialProfiles(website, wsType),
    authority_score: calculateAuthorityScore({ rating: p.rating, reviews_count: p.userRatingCount, website, category: biz.cat }),
    image: "/images/placeholder.svg",
    gallery: [], opening_hours: null, faqs: [], best_for: [],
    seo: { title: `${name}: gym en Mallorca | Mallorca Verified`, description: shortDesc },
    status: "published", source: "google_places",
    commercial_priority: "medium", client_potential: "medium",
    is_featured: false, is_claimed: false, instagram: null, price_level: null,
    updated_at: new Date().toISOString().slice(0, 10),
    imported_at: new Date().toISOString(), google_place_id: biz.pid,
  });
  if (error) { console.error(`✗ ${name}: ${error.message}`); continue; }
  dbMap.set(biz.pid, { id: `google-${biz.pid}`, status: "published" });
  console.log(`  ✓ Imported: ${name}`);
}

// ── Step 3: build id map ─────────────────────────────────────────────────
const id = (pid) => dbMap.get(pid)?.id ?? `google-${pid}`;

// ── Step 4: check guide doesn't already exist ────────────────────────────
const { data: existingGuide } = await sb.from("guides").select("id").eq("slug", "best-gyms-fitness-studios-outside-palma-mallorca-2026").eq("locale", "en").maybeSingle();
if (existingGuide) { console.log("Guide already exists."); process.exit(0); }

// ── Step 5: insert guide ─────────────────────────────────────────────────
const guide = {
  id: crypto.randomUUID(),
  slug: "best-gyms-fitness-studios-outside-palma-mallorca-2026",
  locale: "en",
  title: "Best Gyms and Fitness Studios Outside Palma, Mallorca 2026",
  excerpt: "From 24-hour gyms in Inca to CrossFit in Santa Ponsa and yoga in Sóller — where to train outside Palma, by region, with honest pricing.",
  intro: "You don't need to be in Palma to train well in Mallorca: the resort towns and inland hubs have their own established gyms, CrossFit boxes and yoga studios, and drop-in day passes for holidaymakers are common. Day passes typically run around €10–15, with week passes varying widely by gym, so it's always worth checking each place's current rates directly. This guide is organised by region — north, east and centre, and southwest — and leans toward the larger, well-reviewed gyms, while flagging the smaller boutique studios worth knowing for classes or personal coaching. Ratings and review counts are from Google at the time of writing.",
  sections: [
    {
      heading: "North: Alcúdia and Pollença",
      business_ids: [id("ChIJixvdUBYtlhIRQadwuPyOKg4"), id("ChIJu-LCu18tlhIRI34DXfr1XC4"), id("ChIJq4nNKoUslhIRe94h7zpQJw8")],
      body: "The north has the densest cluster of holiday-friendly gyms, built around Alcúdia's large tourist population. **Thunder Fitness Club** in Alcúdia holds 4.6 stars from around 100 Google reviews, where visitors describe it as a small but well-stocked commercial gym with a wide range of machines and a friendly owner; a couple of reviewers note it can feel crowded mid-afternoon. Its published rates are a €15 day pass and €60 week pass, with a €20 registration fee and €60 monthly membership (the registration fee also applies to take the monthly), and it opens from 6:30 AM on weekdays with a last entry 30 minutes before closing. Alcúdia has other commercial gyms of a similar rating nearby, so it's worth comparing a couple if you're staying in the area.\n\nFor smaller, more personal setups, **Mantinia Gym** in Alcúdia (5.0 stars, ~36 reviews) is described by reviewers as an old-school, well-equipped gym with boxing facilities, where visitors arranged day and week passes easily over WhatsApp. **Summit Community Training** on Carrer de Pollèntia (4.7 stars) is reviewed as a functional-training and personal-coaching setup with a community feel — reviewers rate the coaching, though one notes it suits guided training more than solo lifting. In Pollença, reviewers describe **Vital Esport** as running more like a class-based box than a walk-in gym, with the floor often given over to instructed groups.",
    },
    {
      heading: "Centre and east: Inca and Manacor",
      business_ids: [id("ChIJgUUfv7fFlxIRP_XiIOVahG0"), id("ChIJJUgQRarFlxIR6T8QuSO5u5g")],
      body: "Inca, the island's inland hub, has the best option for anyone who trains at odd hours: **Anytime Fitness Inca** is open 24 hours, seven days a week, with app-based access. It holds 4.6 stars from around 190 reviews, where visitors describe it as clean and modern with helpful staff and a good range of equipment, and several mention paying around €35 for a one-week pass. Also in Inca, **Areafit Inca** (4.7 stars, ~370 reviews) is reviewed as a large, newer facility with a wide range of machines and classes — one of the highest review counts of any gym outside Palma.\n\nOver in the east, Manacor has newer commercial gyms that reviewers describe as clean and well-equipped with modern machines, typically open around 6 AM–11 PM. These town gyms serve residents rather than tourists, so reviewers find them quieter than resort gyms; check each gym's current pricing directly, as it varies.",
    },
    {
      heading: "Southwest: Santa Ponsa and Calvià",
      business_ids: [id("ChIJlV4WB3CJlxIRWOdYm1Hk5Rs"), id("ChIJ__8PrL6JlxIRT7BfVTXBNPM"), id("ChIJ3YIfWACJlxIRu8u0LJwOmYI")],
      body: "The southwest is the strongest area for functional training and CrossFit-style communities. **Choice Training Club** in Santa Ponsa (4.9 stars, ~190 reviews) is reviewed as a genuine community box offering strength, running and Hyrox-style cross training; reviewers repeatedly praise the coaches, and one calls it among the best CrossFit boxes they've trained at. **Shambhala Gym** in Santa Ponsa (4.8 stars, ~70 reviews) is described by reviewers as a top walk-in gym in the resort, with free weights, machines, boxing and a ring, and several say the owner welcomes visitors on day passes arranged via WhatsApp.\n\nFor CrossFit specifically, reviewers describe **C23 Athletxs Santa Ponsa** in Calvià (Son Bugadelles area) as a well-run box where coaches speak English and adapt classes for non-Spanish speakers — several drop-in visitors mention being made to feel welcome. It's newer, with fewer reviews so far. Between them, the southwest covers community-class training and independent lifting well.",
    },
    {
      heading: "Yoga and Pilates: Sóller and beyond",
      business_ids: [id("ChIJe8NFHs7plxIR6lWwrL2VME0"), id("ChIJJcwTdF3plxIRuoUa5iVeo10"), id("ChIJ5Y9m5rDolxIR3tCNo9dBkGk")],
      body: "If you want yoga or Pilates rather than a weights room, Sóller punches well above its size. **Natur Yoga Studio** (5.0 stars, ~70 reviews) is reviewed for classes in an orchard setting and at Port de Sóller, with reviewers noting the teacher runs sessions in both Spanish and English, caters to all levels, and offers private villa classes. **S'espai 6 Pilates & Yoga Studio** (4.9 stars) is described by reviewers as a bright space with mountain views where classes run bilingually and suit beginners.\n\nFor dedicated reformer Pilates, **Tot Pilates** in Sóller (5.0 stars) is reviewed as a fully equipped studio with small, personalised classes and a highly rated instructor — one reviewer says they drive 80 minutes each way for it. These smaller studios are class-based and need booking ahead, so message in advance rather than turning up, especially in summer.",
    },
    {
      heading: "Day passes, prices and what to check",
      business_ids: [],
      body: "For visitors, day and week passes are the norm rather than membership. A day pass is commonly around €10–15 — Thunder Fitness Club in Alcúdia publishes €15, and reviewers at Anytime Fitness Inca mention around €35 for a week — but week and monthly rates vary widely between gyms, so always check each place's current prices directly rather than assuming. Some gyms also charge a small refundable deposit for an access card, or a registration fee on monthly memberships.\n\nA few practical checks from what reviewers consistently report. Only a few gyms outside Palma are genuinely 24-hour (Anytime Fitness Inca is the clearest); most run roughly 6:30 AM to 10 or 11 PM, and several have a last-entry cutoff before closing. Reviewers often mention bringing a towel and water, as smaller gyms can get hot in summer. If you want classes (CrossFit, Hyrox, yoga, Pilates), check the timetable and book, since class slots dominate the floor at community boxes and studios. And if English matters, reviewers find the southwest boxes and Sóller studios the most reliably bilingual. Many owner-run gyms arrange passes over WhatsApp before a first visit.",
    },
  ],
  faqs: [
    { question: "Are there good gyms outside Palma in Mallorca?", answer: "Yes. Alcúdia in the north has commercial gyms like Thunder Fitness Club (4.6 stars), Inca has the 24-hour Anytime Fitness and the large Areafit (4.7 stars, ~370 reviews), and the southwest has well-reviewed CrossFit and functional-training boxes like Choice Training Club (4.9 stars) and Shambhala Gym (4.8 stars). Most offer day and week passes for visitors, with day passes commonly around €10–15." },
    { question: "Is there a 24-hour gym outside Palma in Mallorca?", answer: "Yes — Anytime Fitness Inca is open 24 hours, seven days a week, with app-based access, in the inland town of Inca. It holds 4.6 stars from around 190 reviews, where visitors describe it as clean and modern with a good range of equipment. Most other gyms outside Palma run roughly 6:30 AM to 10 or 11 PM rather than around the clock, so Inca is the clearest 24-hour option outside the capital." },
    { question: "How much does a gym day pass cost in Mallorca outside Palma?", answer: "A day pass commonly costs around €10–15 — Thunder Fitness Club in Alcúdia publishes a €15 day pass and €60 week pass, and reviewers at Anytime Fitness Inca mention around €35 for a week. Week and monthly rates vary considerably between gyms, and some add a registration fee or a small refundable card deposit, so check each gym's current pricing directly before you go." },
    { question: "Where can I do yoga or Pilates outside Palma in Mallorca?", answer: "Sóller is the best base for yoga and Pilates outside Palma. Natur Yoga Studio (5.0 stars) runs bilingual classes in an orchard setting and at Port de Sóller, S'espai 6 offers yoga and Pilates with mountain views, and Tot Pilates is a fully equipped reformer studio with small personalised classes. All are highly rated and class-based, so book ahead, especially in summer." },
  ],
  seo: {
    title: "Best Gyms & Fitness Studios Outside Palma Mallorca 2026",
    description: "Gyms, CrossFit and yoga outside Palma by region: 24h Anytime Inca, Thunder Fitness Alcúdia, Choice Training Santa Ponsa. Day passes, prices and tips.",
  },
  status: "published",
  source: "claude_browser",
  is_featured: false,
  hero_image_url: null,
  updated_at: new Date().toISOString().slice(0, 10),
  imported_at: new Date().toISOString(),
};

const { error: guideErr } = await sb.from("guides").insert(guide);
if (guideErr) { console.error("Guide error:", guideErr); process.exit(1); }
console.log(`\n✓ Published: ${guide.slug} (${guide.locale})`);
console.log(`  Sections: ${guide.sections.length} | FAQs: ${guide.faqs.length} | business_ids: ${guide.sections.flatMap(s => s.business_ids).length}`);
