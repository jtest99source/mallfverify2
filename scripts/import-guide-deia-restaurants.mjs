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

// ── Import missing Xelini ──────────────────────────────────────────────────
const XELINI_PID = "ChIJ8_DQ31WSlxIR3Yv4Z0epDjk";
const XELINI_CAT = "restaurant";
let xeliniId = `google-${XELINI_PID}`;

const { data: xeliniRow } = await sb.from("businesses").select("id").eq("google_place_id", XELINI_PID).maybeSingle();
if (!xeliniRow) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Missing GOOGLE_PLACES_API_KEY");
  const p = await fetchPlace(apiKey, XELINI_PID);
  const name = p.displayName?.text ?? "Restaurante Xelini";
  const address = p.formattedAddress ?? "";
  const website = p.websiteUri ?? null;
  const loc = inferLocationFromAddress(address);
  const wsType = detectWebsiteType(website);
  const photos = (p.photos ?? []).map(x => x.name).filter(Boolean);
  const slug = await getUniqueSlug(XELINI_CAT, toSlug(name), XELINI_PID);
  const shortDesc = `Restaurant en ${loc.municipality || loc.city || "Deià"} con datos de Google pendiente de revisión editorial.`;
  const { error } = await sb.from("businesses").insert({
    id: xeliniId, slug, name, category: XELINI_CAT,
    short_description: shortDesc, description: "",
    rating: p.rating ?? null, reviews_count: p.userRatingCount ?? null,
    website, phone: p.nationalPhoneNumber ?? null, address,
    latitude: p.location?.latitude ?? null, longitude: p.location?.longitude ?? null,
    google_maps_url: p.googleMapsUri ?? null,
    primary_type: p.primaryType ?? null, raw_google_place: p, tags: p.types ?? [],
    primary_photo_name: photos[0] ?? null, photo_names: photos.length ? photos : null,
    area: loc.area, city: loc.city ?? null, municipality: loc.municipality ?? null, island: "Mallorca",
    website_type: wsType, social_profiles: createSocialProfiles(website, wsType),
    authority_score: calculateAuthorityScore({ rating: p.rating, reviews_count: p.userRatingCount, website, category: XELINI_CAT }),
    image: "/images/restaurant.svg",
    gallery: [], opening_hours: null, faqs: [], best_for: [],
    seo: { title: `${name}: restaurant en Mallorca | Mallorca Verified`, description: shortDesc },
    status: "published", source: "google_places",
    commercial_priority: "medium", client_potential: "medium",
    is_featured: false, is_claimed: false, instagram: null, price_level: null,
    updated_at: new Date().toISOString().slice(0, 10),
    imported_at: new Date().toISOString(), google_place_id: XELINI_PID,
  });
  if (error) { console.error("Insert error:", error.message); process.exit(1); }
  console.log(`✓ Imported Xelini: ${name} (★${p.rating}, ${p.userRatingCount} reviews)`);
} else {
  xeliniId = xeliniRow.id;
  console.log("Xelini already in DB.");
}

const IDS = {
  balm:     "google-ChIJWSkAXjPvlxIRwmkqVKqpkcU",
  march:    "google-ChIJYQSe2bjvlxIRhq4-R_e19qc",
  olivo:    "google-ChIJ9birlq3vlxIRKzLbXjfmePs",
  trattoria:"google-ChIJay6YFq3vlxIRL2rDAWJ5O4w",
  xelini:   xeliniId,
  fontfresca:"google-ChIJVU2CRK3vlxIRPstklewtUe4",
  aura:     "google-ChIJV7FvvjXvlxIRmwAxzB1VCrA",
  peixot:   "google-ChIJ4y8IaD_vlxIRO9QxiCeQEIM",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-deia-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Guide already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-deia-2026",
  locale: "en",
  title: "Best Restaurants in Deià 2026",
  excerpt: "Deià is beautiful and expensive. Where to eat well in Mallorca's most exclusive village — from a five-star tasting menu to honest cliffside seafood and good value.",
  intro: "Deià is one of Mallorca's most beautiful and most exclusive villages, a cluster of honey-coloured stone houses on a Tramuntana hillside above the sea, long associated with artists, writers and, these days, a well-heeled crowd. That reputation is reflected in its restaurants: this is not a budget destination, and some of its most famous tables charge accordingly. But Deià also has genuinely excellent food across a range of prices, from a tiny husband-and-wife restaurant that's the highest-rated in the village to iconic cliffside seafood and a few honest, better-value spots. This guide is honest about what's worth the money, what you're really paying for, and how to eat well here without a five-star budget.",
  sections: [
    {
      heading: "The best food in the village: Balm",
      business_ids: [IDS.balm],
      body: "The highest-rated restaurant in Deià is **Balm**, a small husband-and-wife-owned restaurant holding a remarkable 5.0 stars from over 500 reviews. Reviewers describe a focused, thoughtfully curated small menu executed to an exceptional standard — fish, mussels and seasonal dishes drawing particular praise — with warm, passionate service in a cosy but not cramped setting. Several call it the best meal of their entire trip to Mallorca.\n\nIt's dinner-only and closed Sundays, and given its size and reputation, booking well ahead is essential. Parking in Deià is notoriously difficult, so factor that in. If you want one standout dinner in the village and the food itself matters most, this is the pick — and while it isn't cheap, reviewers consistently feel it delivers for the price, which isn't something everyone says about Deià.",
    },
    {
      heading: "Iconic settings: Cas Patró March and El Olivo",
      business_ids: [IDS.march, IDS.olivo],
      body: "Two Deià restaurants are famous as much for where they are as what they serve. **Ca's Patró March** (4.0 stars, ~2,200 reviews) is carved into the cliffs at Cala Deià, right above the sea — you park higher up and walk down, and reservations (which open online at midnight ten days ahead) are essential. Reviewers rave about the setting and a swim before lunch; the seafood, tuna tartare, octopus and paella are generally well liked, though a few feel the food doesn't quite match the spectacular location. It's a lunch spot and a genuine Mallorca experience, priced for it.\n\n**El Olivo**, the fine-dining restaurant at the five-star hotel La Residencia (open to non-guests with a reservation), is the village's high-end tasting-menu option, set in a beautiful old olive press. It's a €€€€ occasion restaurant with a divine setting and attentive service — but reviews are genuinely divided: some call it a magical special-occasion night, while others feel the very expensive tasting menu (reported at hundreds of euros per person) doesn't justify the price on food alone. Go for the setting and the occasion, with eyes open on cost.",
    },
    {
      heading: "Reliable mid-range: Trattoria Italiana and the tapas spots",
      business_ids: [IDS.trattoria, IDS.xelini],
      body: "For a good meal without the top-end prices, **Trattoria Italiana** (4.4 stars, ~780 reviews) is a reliable choice, an Italian with a patio overlooking the village praised for its pizza, pasta, sea bass and warm service — a solid, crowd-pleasing dinner. For tapas, **Restaurante Xelini** (a long-running spot with a pretty garden terrace, live music and a welcoming Cuban owner) and the smaller **Can Xelini** both serve well-liked, straightforward tapas — grilled squid, garlic prawns, padrón peppers — at more moderate prices than the village's headline restaurants.\n\nThese are the places to aim for if you want to eat well in Deià on a more normal budget, or want a relaxed dinner rather than a special-occasion blowout. As across the village, booking is wise in season, and note several places close a day or two midweek.",
    },
    {
      heading: "Views, lunch and a lighter stop: Sa Font Fresca, Aura and Cas Peixot",
      business_ids: [IDS.fontfresca, IDS.aura, IDS.peixot],
      body: "For a cliffside lunch with a view at fair prices, **Cafè Sa Font Fresca** (4.4 stars, ~1,370 reviews) is a standout — a terrace restaurant on the edge of the village serving fresh food, excellent pizza and focaccia, and lemon cake, with spectacular views and a relaxed feel. It's one of the better-value tables in Deià and a natural stop if you've walked in from Valldemossa. **Aura Deià** (5.0 stars) is another strong lunch option, repeatedly called the best value for money in the village, with a good view, friendly service and dishes like sea bass and beef-cheek that punch above their price.\n\nFor just a coffee, a drink or a light bite, **Cas Peixot** is a lovely café with a courtyard terrace and a little pond with turtles — more a charming spot to pause and plan your next move than a full meal. Between these three you can enjoy Deià's setting without committing to an expensive dinner.",
    },
    {
      heading: "Is Deià expensive — and how to eat well on a budget",
      business_ids: [],
      body: "Deià is genuinely expensive, and it's worth being upfront about it: it's Mallorca's most exclusive village, and the famous restaurants price accordingly, with the El Olivo tasting menu running into the hundreds per person and even the cliffside and view restaurants charging a premium for their setting. If you arrive expecting village prices, you'll get a shock.\n\nBut you can eat well here without the top-end spend. The value plays are lunch rather than dinner, the mid-range and tapas spots (Trattoria, the Xelini tapas places), and the view cafés like Sa Font Fresca and Aura that deliver the Deià setting at fairer prices. A coffee or drink at Cas Peixot, or a pizza with a view at Sa Font Fresca, lets you soak up the village without a fine-dining bill. And if you want one splurge, Balm is the one reviewers feel is genuinely worth it on food, rather than paying purely for a name or a view.",
    },
    {
      heading: "Combining Deià with Sóller and Valldemossa",
      business_ids: [],
      body: "Deià is small and sits right on the Ma-10 coast road between **Valldemossa** (about 15 minutes southwest) and **Sóller** (about 15 minutes northeast), so most visitors combine it with one or both rather than making it a standalone trip. A classic Tramuntana day links all three: Valldemossa for its monastery and a coca de patata, Deià for lunch or a walk down to Cala Deià, and Sóller for the afternoon and the vintage tram to the port.\n\nWalkers can reach Deià on foot from Sóller or Valldemossa via the old GR-221 mountain paths, arriving hungry for lunch at somewhere like Sa Font Fresca. If you're basing a food day around Deià, it pairs most naturally with Sóller for a wider choice of restaurants and easier parking, using Deià for its setting and a standout meal rather than a whole day's worth of options, given how compact and pricey it is.",
    },
  ],
  faqs: [
    { question: "What are the best restaurants in Deià?", answer: "Balm is the highest-rated (5.0 stars), a small husband-and-wife restaurant reviewers call the best meal of their trip. Ca's Patró March is the iconic cliffside seafood spot at Cala Deià, and El Olivo at La Residencia is the high-end tasting-menu option. For better value, Trattoria Italiana, the Xelini tapas spots, and view cafés like Cafè Sa Font Fresca and Aura Deià all eat well at more moderate prices." },
    { question: "Is Deià expensive for eating out?", answer: "Yes — Deià is Mallorca's most exclusive village and prices reflect it, with the El Olivo tasting menu running into the hundreds of euros per person and the famous cliffside and view restaurants charging a premium for their setting. You can eat more affordably at the mid-range and tapas spots and the view cafés like Sa Font Fresca and Aura, and by choosing lunch over dinner, but overall it's not a budget destination." },
    { question: "Can you eat well in Deià on a budget?", answer: "You can, if you pick the right places. Lunch is better value than dinner, and spots like Cafè Sa Font Fresca (great pizza and views) and Aura Deià (often called the best value in the village) give you the Deià setting at fairer prices. The Xelini tapas places offer moderate-priced tapas, and Cas Peixot is lovely for just a coffee or drink. Avoid assuming the famous names are the only options." },
    { question: "Is El Olivo at La Residencia worth it?", answer: "It depends what you want. El Olivo is open to non-guests and offers a beautiful setting in an old olive press with attentive service, making it a memorable special-occasion venue. However, reviews are genuinely divided: some find it magical, while others feel the very expensive tasting menu doesn't justify its price on food alone. Go for the setting and the occasion rather than expecting the best-value meal in Deià, and book ahead." },
  ],
  seo: {
    title: "Best Restaurants in Deià 2026 | Mallorca Verified",
    description: "Where to eat in Deià, Mallorca's most exclusive village: top-rated Balm, cliffside Ca's Patró March, El Olivo, plus honest better-value picks. Is Deià expensive?",
  },
  status: "published",
  source: "claude_browser",
  is_featured: false,
  hero_image_url: null,
  updated_at: new Date().toISOString().slice(0, 10),
  imported_at: new Date().toISOString(),
};

const { error } = await sb.from("guides").insert(guide);
if (error) { console.error("Error:", error); process.exit(1); }
console.log("✓ Published:", guide.slug, "(" + guide.locale + ")");
console.log("  Sections:", guide.sections.length, "| FAQs:", guide.faqs.length, "| business_ids:", guide.sections.flatMap(s => s.business_ids).length);
