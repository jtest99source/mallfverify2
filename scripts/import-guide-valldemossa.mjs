import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

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

const IDS = {
  esTaller:   "google-ChIJ6Q_LeTvvlxIR4tj_tdM7lKs",
  quitaPenas: "google-ChIJ2ylQKQTulxIRKQLmOAvL4Jg",
  laPosada:   "google-ChIJMTScwx7vlxIRTcs6GBkhhSc",
  canCosta:   "google-ChIJAXv5J-nxlxIRJd_3CgrJLxc",
  esPort:     "google-ChIJw9-_9JrxlxIRqOARz6J2tjY",
  canUetam:   "google-ChIJiTVQpmHvlxIRlypmH13VBx0",
  barbafl:    "google-ChIJR6n0GOrvlxIRDuE2VMw61rI",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-valldemossa-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-valldemossa-2026",
  locale: "en",
  title: "Best Restaurants in Valldemossa 2026",
  excerpt: "Valldemossa's best food sits just off the main square. Where to eat well — from traditional pa amb oli to the port — beyond the tourist traps.",
  intro: "Valldemossa is small, and its best restaurants are almost all a short walk off the main square, Plaça de la Cartuja, rather than on it — the tables lining the square trade on the Chopin-and-Carthusian-monastery footfall, while the places locals and repeat visitors rate are tucked into side lanes or down at the port. The village works as a lunch stop on a Tramuntana drive or a half-day from Palma (about 20–25 minutes away), and the food ranges from traditional Mallorcan pa amb oli to full sit-down meals with valley views. This guide picks the restaurants worth your time, all with strong verified Google ratings, and is honest about which to skip.",
  sections: [
    {
      heading: "Off the square: where the best food actually is",
      business_ids: [IDS.esTaller, IDS.quitaPenas, IDS.laPosada],
      body: "The single best-rated restaurant in Valldemossa is **Es Taller Valldemossa**, on Carrer de Santiago Rusiñol just off the centre — a 4.7-star spot with over 2,800 reviews, known for creative cooking (the suckling pig and ceviche draw particular praise), full vegan options, and prices that reviewers repeatedly call low for the quality. It's a €€ place, open daily for lunch and dinner but closed Mondays, and booking is advised.\n\nA few steps away, **QuitaPenas Valldemossa** (4.7 stars, ~2,470 reviews) is the pick for traditional Mallorcan food. It's a combined tapas restaurant and grocery built around a shaded courtyard, best known for its pa amb oli platters, sobrassada and local cheese and wine — the kind of honest, produce-led lunch that the square's tourist tables don't do as well. It's off the main street, quieter, and reviewers consistently recommend booking.\n\nFor a meal with a view, **La Posada** sits at the end of a lane near the Chopin Museum overlooking the valley and cliff (4.5 stars, ~1,540 reviews). It's a €€ tapas-style kitchen where the setting is a genuine draw and the food holds up, though a few reviewers note prices creeping toward the higher side for the area.",
    },
    {
      heading: "Traditional Mallorcan cooking and paella",
      business_ids: [IDS.canCosta, IDS.canUetam],
      body: "Just outside the village on the Deià road, **Restaurante Can Costa Valldemossa** is the destination for traditional Mallorcan cuisine in a historic building filled with farm antiques, almost museum-like (4.5 stars, and one of the highest review counts in the area at over 3,200). It's known for paellas — including lobster (bogavante) paella, minimum two people — plus octopus, turbot and local wines. It's a €€ spot, open daily for lunch and dinner (Sunday lunch only). Be aware some reviewers feel main dishes above €20 lean toward tourist pricing, so it's a sit-down occasion rather than a cheap bite.\n\nFor Mallorcan food with a view and a relaxed feel, **Ca'n Uetam** on the edge of the village (4.7 stars, ~1,100 reviews) doubles as a café-restaurant and small guesthouse, repeatedly praised for its panoramic valley outlook and friendly service. Reviews are strong overall, with the odd note about slow service when busy — worth it for the setting.",
    },
    {
      heading: "Down at the port: Es Port de Valldemossa",
      business_ids: [IDS.esPort],
      body: "Most visitors never realise Valldemossa has a port — it's a winding drive down from the village to a small cove, and that journey is part of the appeal. **Restaurante Es Port de Valldemossa** (4.5 stars, ~1,660 reviews) sits right on the water with cliffs framing the Mediterranean, specialising in seafood and paella. Reviewers single out the fish dishes, the setting and the friendly service.\n\nThis is a place to plan around rather than stumble into: it's a detour off the main Tramuntana route, so it suits a leisurely lunch when you have the afternoon, not a quick stop. If you're driving the coast anyway, it's one of the more memorable lunch settings in the area — just check opening times, as coastal spots like this can be seasonal.",
    },
    {
      heading: "Coffee, breakfast and a lighter stop",
      business_ids: [IDS.barbafl],
      body: "If you just want coffee, cake or a light lunch rather than a full meal, **Barbaflorida cafè** on Plaça Cartoixa is the standout on the square itself (4.7 stars, ~1,050 reviews) — a rare case where a central spot genuinely delivers, praised for excellent coffee, pastries and breakfast a step above the usual tourist offerings. Note it opens daytime only (roughly 10 AM–4 PM) and is closed Tuesdays and Wednesdays.\n\nValldemossa's signature sweet is the coca de patata, a light, sugar-dusted potato-flour bun best eaten warm with a hot chocolate or an almond-milk horchata. Several cafés around the centre serve it; it's the local thing to try even if you're only passing through for an hour.",
    },
    {
      heading: "Is it worth eating in Valldemossa — and what to skip",
      business_ids: [IDS.esTaller, IDS.quitaPenas],
      body: "Valldemossa is worth eating in, but only if you step off Plaça de la Cartuja. The restaurants directly on the square rely on tourist volume and are generally the weakest value; the genuinely good places — **Es Taller Valldemossa**, **QuitaPenas Valldemossa**, **La Posada** — are all a minute or two away in the side lanes. That short walk is the whole trick to eating well here.\n\nOne honest caution: at least one higher-profile restaurant in the village has drawn recent reviews reporting poor service and even a case of food poisoning, so it pays to stick to the consistently well-reviewed spots rather than the most heavily marketed. Prices skew toward the mid-to-upper range across the village generally — this is a well-touristed Tramuntana destination, not a budget one — so expect to pay a little more than in a working inland town.",
    },
    {
      heading: "Combining Valldemossa with Deià or Sóller",
      business_ids: [],
      body: "Valldemossa is best combined with the rest of the Tramuntana rather than visited alone. It sits on the Ma-1130/Ma-10 corridor between Palma and the coast, so a natural day pairs it with **Deià** (about 15 minutes further along the coast road, higher-end dining) and **Sóller** (around 25–30 minutes on), making a classic mountain loop.\n\nA common plan: morning in Valldemossa for the monastery and a coca de patata, lunch at one of the off-square restaurants or down at the port, then on to Deià or Sóller for the afternoon. If you're using the vintage Sóller train and tram as your day out, Valldemossa doesn't sit on that line — it needs a car or the bus — so treat it as a separate driving day rather than tacking it onto the train trip.",
    },
  ],
  faqs: [
    { question: "Where are the best restaurants in Valldemossa?", answer: "The best-rated restaurants are just off the main square rather than on it. Es Taller (4.7 stars) is the top pick for creative cooking with vegan options, QuitaPenas (4.7) for traditional pa amb oli and Mallorcan platters, and La Posada (4.5) for tapas with a valley view. For traditional paella, Ca'n Costa on the Deià road is a long-standing favourite, and Es Port de Valldemossa down at the cove is best for seafood." },
    { question: "Is Valldemossa worth visiting just to eat?", answer: "Valldemossa is worth a meal if you eat at the restaurants just off Plaça de la Cartuja rather than the tourist-focused tables on the square itself. Places like Es Taller and QuitaPenas serve genuinely good food, and the village pairs a meal with the Carthusian monastery, the Chopin connection and Tramuntana scenery. Most people combine it with Deià or Sóller rather than making a dedicated food trip." },
    { question: "Do you need to book restaurants in Valldemossa?", answer: "In summer and at weekends, yes — the most popular spots like Es Taller and QuitaPenas fill up, and reviewers repeatedly recommend reserving, especially for lunch. Cafés like Barbaflorida are walk-in but can have a wait for a table at peak times. For the port restaurant and a Sunday visit, booking ahead is safest, and always check opening days as some close on Mondays or Tuesdays." },
    { question: "Is food expensive in Valldemossa?", answer: "Valldemossa sits at the mid-to-upper end for Mallorca. Most good restaurants are €€, with main dishes often above €20 at the more established spots like Ca'n Costa, reflecting its status as a well-touristed Tramuntana village. You can still eat more affordably with a pa amb oli platter at QuitaPenas or a coffee and coca de patata at a café, but it's not a budget destination overall." },
  ],
  seo: {
    title: "Best Restaurants in Valldemossa 2026 | Mallorca Verified",
    description: "Where to eat well in Valldemossa: the best restaurants just off the main square, from pa amb oli to seafood at the port — honest picks, not tourist traps.",
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
