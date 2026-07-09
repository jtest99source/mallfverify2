import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

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

const ID = {
  mercat:    "google-ChIJvXCh7GeSlxIRg6SZs6guDy0",
  vermoutique:"google-ChIJn-TlFwCTlxIRP-AqW8E98DQ",
  laMona:    "google-ChIJY1PgNQCTlxIRBEJ_zLxtSQg",
  tapasPalma:"google-ChIJV_97jguTlxIRa2-hs2tbJnc",
  buscando:  "google-ChIJJfkxplqTlxIR56ViJw0J_s0",
  perrito:   "google-ChIJg1YbX12SlxIRmyffPwabrD4",
  santina:   "google-ChIJMbGD7GeSlxIR7aoZWR1hylU",
  plantShack:"google-ChIJG5ARVJ2TlxIRU4MwNpoC2Go",
  xo:        "google-ChIJBylJ2EeTlxIRgSPXhSp21b8",
  azuca:     "google-ChIJwW3NPQCTlxIRRC63WmFnWzs",
  esencia:   "google-ChIJhVOkx8GTlxIRhySy1AbPZhQ",
  infineat:  "google-ChIJM6xxZV2SlxIRiu3KOQJuHEQ",
  bankai:    "google-ChIJU2BnWhyTlxIRFtBscKdujMI",
  mamas:     "google-ChIJCxiRkfqTlxIR48tGB2SzneE",
  burguesa:  "google-ChIJ-fKoK2aSlxIRSpaNEKLJog4",
};

// ── Republish/publish cited businesses that are hidden/draft ───────────────
const REACTIVATE = [ID.mercat, ID.xo];
const { data: reRows } = await sb.from("businesses").select("id,name,status").in("id", REACTIVATE);
const toFix = (reRows || []).filter(b => b.status === "hidden" || b.status === "draft");
if (toFix.length) {
  const { error } = await sb.from("businesses")
    .update({ status: "published", updated_at: new Date().toISOString().slice(0, 10) })
    .in("id", toFix.map(b => b.id));
  if (error) { console.error("Reactivate error:", error); process.exit(1); }
  console.log(`✓ Published ${toFix.length}: ${toFix.map(b => `${b.name} (${b.status}→published)`).join(", ")}`);
}

// ── Compute hero from first renderable business photo ──────────────────────
const orderedIds = [ID.azuca, ID.mercat, ID.perrito, ID.burguesa, ID.mamas, ID.vermoutique, ...Object.values(ID)];
const { data: photoRows } = await sb.from("businesses").select("id,primary_image_url").in("id", [...new Set(orderedIds)]);
const photoMap = new Map((photoRows || []).map(r => [r.id, r.primary_image_url]));
const renderable = u => typeof u === "string" && (u.startsWith("https://lh3.googleusercontent.com") || u.startsWith("https://images.unsplash.com"));
const hero = [...new Set(orderedIds)].map(id => photoMap.get(id)).find(renderable) || null;
console.log(`Hero: ${hero ? hero.slice(0, 60) : "NONE"}`);

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-santa-catalina-palma-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Guide already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-santa-catalina-palma-2026",
  locale: "en",
  title: "Best Restaurants in Santa Catalina, Palma 2026",
  excerpt: "Palma's old fishermen's quarter turned dining district. Where to actually eat in Santa Catalina — the market, the tapas bars, the brunch spots and the standout dinners.",
  intro: "Santa Catalina is Palma's former fishermen's quarter, just west of the old town, built around the **Mercat de Santa Catalina** — Palma's oldest covered market, dating from 1920 — which anchors what has become the city's best-known eating and drinking district. The neighbourhood went from a working-class, seafaring barrio to a dining destination over the last couple of decades, its pedestrianised streets now lined with tapas bars, brunch cafés, international kitchens and a few genuinely excellent restaurants. This guide organises the area by how you'd actually use it — the market itself, tapas and vermut, brunch, and dinner — and is honest about which places are worth it and whether Santa Catalina is really more expensive than the rest of Palma.",
  sections: [
    {
      heading: "Eating at the Mercat de Santa Catalina",
      business_ids: [ID.mercat, ID.vermoutique],
      body: "The **Mercat de Santa Catalina** (4.4 stars, ~5,500 reviews) is the heart of the neighbourhood, a working covered market where locals, chefs and yacht provisioners shop side by side, open Monday to Saturday from 7am (to 3–4pm weekdays, earlier on Saturday) and closed Sundays. Beyond the produce stalls, several bars inside serve food made from the market's own ingredients, and eating here is one of the best-value, most local experiences in Palma. **Vermoutique** (4.9 stars) is a standout market bar for vermouth on tap, patatas bravas, croquetas and fresh seafood tapas, with reviewers repeatedly singling out the bravas sauce.\n\nThe market is best earlier in the day — before about 10:30am it belongs to the neighbourhood, and by 2pm the stalls wind down. A note on timing: the market building closes mid-afternoon and on Sundays, so it's a breakfast-to-lunch destination, with the surrounding streets taking over for the evening. On Saturdays it's the traditional start of the local 'tardeo', with people out for a caña, a cava and a plate of something before the afternoon rolls on.",
    },
    {
      heading: "Tapas and vermut",
      business_ids: [ID.laMona, ID.tapasPalma, ID.buscando],
      body: "Santa Catalina is strong for tapas and vermouth bars. **La Mona Vermuteria** on Carrer de Cotoner (4.9 stars) is a small, well-loved vermuteria praised for excellent gildas, tapas and a good-mood atmosphere, with high-table-and-stool seating and a lively crowd. **Tapas Palma** (4.6 stars, ~1,560 reviews) is a larger, reliable option just off the main streets, liked for croquettes, prawns and generous portions with friendly service, though a few reviewers feel the food is good rather than exceptional.\n\nFor a more restaurant-style tapas dinner, **Buscando el Norte** on Carrer de Sant Magí (4.3 stars, ~1,070 reviews) is a busy, well-priced spot serving shareable plates with an Asian–South American lean, ceviche and risotto among the dishes reviewers rate. These are the places for grazing across small plates with a drink rather than a formal sit-down meal, and they capture the neighbourhood's casual evening rhythm.",
    },
    {
      heading: "Brunch",
      business_ids: [ID.perrito, ID.santina, ID.plantShack, ID.xo],
      body: "Santa Catalina is arguably Palma's brunch capital, with a cluster of well-rated spots. **El Perrito** on Carrer d'Anníbal (4.7 stars, ~1,410 reviews) is a cosy, dog-friendly café praised for eggs Benedict, matcha and a warm welcome — one of the neighbourhood's brunch institutions. Nearby **Santina** (4.2 stars, ~1,220 reviews) is a popular, healthy-leaning brunch spot known for Turkish eggs, bowls and avocado toast, though its rating reflects that it can get busy and prices run high for what's a light plate.\n\nFor plant-based brunch, **Plant Shack** on Carrer de Dameto (4.8 stars) is a well-regarded vegan café doing smoothie bowls, toasts and good coffee, and **XO Bruncherie** on Plaça de la Navegació (4.8 stars, ~495 reviews) is another strong choice for scrambled eggs, avocado toast and coffee — though, as several reviewers note across the area's brunch spots, the base price often climbs quickly once you add extras like egg or ham. Booking isn't usually needed for brunch, but popular spots fill on weekend mornings.",
    },
    {
      heading: "Dinner: the standouts",
      business_ids: [ID.azuca, ID.esencia, ID.infineat, ID.bankai],
      body: "For dinner, Santa Catalina has some of Palma's best-rated kitchens. **Azuca - Urban Bistro** on Carrer de la Fàbrica (5.0 stars, ~1,435 reviews) is a dinner-only bistro with a remarkable rating, praised for creative tapas-style plates (artichokes, tacos), warm service and, reviewers note, decent prices for the quality — one of the neighbourhood's top all-round choices. **Bistro Esencia** on Carrer de Sant Magí (4.8 stars) is a small, intimate spot doing a creative tasting menu with wine pairing that reviewers repeatedly call the highlight of their trip, well suited to a special dinner.\n\n**Infineat** on Carrer de la Fàbrica (4.8 stars) is a fusion restaurant blending Asian and local flavours in inventive small plates, described by several reviewers as a near-Michelin experience, and **Bankai Palma** (5.0 stars) is a highly rated modern sushi and Japanese-style spot on Carrer de Cotoner. These are dinner-focused and popular, so booking ahead is wise, especially at weekends.",
    },
    {
      heading: "Italian, burgers and casual dinners",
      business_ids: [ID.mamas, ID.burguesa],
      body: "For more casual dinners, the neighbourhood covers the crowd-pleasers well. **Mama's Santa Catalina** on Carrer de Sant Magí (4.8 stars, ~1,225 reviews) is a popular Italian with a lively terrace, praised for authentic pizza and a good wine list — though some reviewers flag that prices are on the high side for pizza, so it's more of a treat than a cheap eat. **La Nueva Burguesa**, also on Sant Magí (4.8 stars, ~2,590 reviews), is one of Palma's best-rated burger spots, with homemade sauces made from market produce, plenty of gluten-free options and, reviewers agree, genuinely excellent burgers — booking is recommended as it gets busy.\n\nThese are the spots for a relaxed, no-occasion dinner with a group or family, at prices below the tasting-menu restaurants above. Between the two, Mama's is the choice for a terrace pizza night and La Nueva Burguesa for a standout casual burger.",
    },
    {
      heading: "Is Santa Catalina expensive, and do you need to book?",
      business_ids: [],
      body: "Santa Catalina is one of Palma's most sought-after neighbourhoods, sitting above the city's largest marina, and prices reflect that — it trends a little higher than the average across Palma, particularly the brunch spots, where add-ons stack up, and the pricier Italian and tasting-menu restaurants. That said, it isn't uniformly expensive: eating at the market bars, the tapas and vermut spots, and the casual dinners keeps costs reasonable, and the standout Azuca is noted by reviewers as good value for its quality.\n\nOn booking: the market bars, brunch cafés and tapas spots are largely walk-in, though popular ones fill on weekend mornings and evenings. The dinner standouts — Azuca, Bistro Esencia, Bankai — are small and busy, so booking ahead is genuinely worth it, especially at weekends and in high season. As a general rule, reserve for a sit-down dinner, and just turn up (a little early) for brunch and tapas.",
    },
  ],
  faqs: [
    { question: "What are the best restaurants in Santa Catalina, Palma?", answer: "For dinner, Azuca - Urban Bistro (5.0 stars) and Bistro Esencia are the standouts, with Infineat and Bankai for creative fusion and sushi. For tapas, La Mona Vermuteria and Tapas Palma are reliable; for brunch, El Perrito and XO Bruncherie; and Mama's (Italian) and La Nueva Burguesa (burgers) for casual dinners. The Mercat de Santa Catalina itself is great for a market lunch. Book ahead for the dinner spots." },
    { question: "Is Santa Catalina expensive?", answer: "It trends a little higher than the Palma average, as one of the city's most sought-after neighbourhoods above the main marina — especially the brunch spots (where extras add up) and the pricier Italian and tasting-menu restaurants. But it isn't uniformly expensive: the market bars, tapas and vermut spots, and casual dinners keep costs reasonable, and some standouts like Azuca are noted as good value for the quality." },
    { question: "Is the Mercat de Santa Catalina worth visiting?", answer: "Yes, especially in the morning. It's Palma's oldest covered market (from 1920), a genuine working market where locals and chefs shop, with bars inside serving food from the market's own produce — Vermoutique is a standout for vermouth and tapas. It's open Monday to Saturday, roughly 7am to 3–4pm (earlier on Saturday) and closed Sundays, so it's a breakfast-to-lunch destination. Go before about 10:30am for the quietest, most local experience." },
    { question: "Where is the best brunch in Santa Catalina?", answer: "El Perrito on Carrer d'Anníbal is one of the neighbourhood's brunch institutions, known for eggs Benedict and matcha. XO Bruncherie and Plant Shack (vegan) are also highly rated, and Santina is popular for Turkish eggs and healthy bowls. Note that base prices at the brunch spots can climb once you add extras like egg or ham. Booking isn't usually needed, but the popular spots fill on weekend mornings." },
  ],
  seo: {
    title: "Best Restaurants in Santa Catalina, Palma 2026",
    description: "Where to eat in Santa Catalina, Palma: the market, tapas, brunch and standout dinners. Honest picks, prices and whether you need to book.",
  },
  status: "published",
  source: "claude_browser",
  is_featured: false,
  hero_image_url: hero,
  updated_at: new Date().toISOString().slice(0, 10),
  imported_at: new Date().toISOString(),
};

const { error } = await sb.from("guides").insert(guide);
if (error) { console.error("Error:", error); process.exit(1); }
console.log("✓ Published:", guide.slug, "(" + guide.locale + ")");
console.log("  Sections:", guide.sections.length, "| FAQs:", guide.faqs.length, "| business_ids:", guide.sections.flatMap(s => s.business_ids).length, "| hero:", hero ? "set" : "none");
