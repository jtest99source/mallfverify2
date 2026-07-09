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
  sis:      "google-ChIJ10U6ktrDlxIRehKj5yXQpmY",
  trastero: "google-ChIJ_RN8PQTClxIRF9LRaXN126k",
  gallardo: "google-ChIJtYwPxGrDlxIRJilPGoMhZSA",
  terramar: "google-ChIJT2KVi7bDlxIR1MM1wDjF5CU",
  traffic:  "google-ChIJBWfiphzClxIRep50kujhmBM",
  bufala:   "google-ChIJKdy4bBzClxIRZl-NWjd7iak",
  forastera:"google-ChIJm3cGcL-TlxIRvSDL0o4R8Mk",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-alaro-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-alaro-2026",
  locale: "en",
  title: "Best Restaurants in Alaró 2026",
  excerpt: "Alaró punches above its weight for food. Where to eat in this Tramuntana foothill village — the perfect lunch before or after the hike up to its castle.",
  intro: "Alaró is a working village at the foot of the Serra de Tramuntana, about 40 minutes from Palma, best known for the dramatic hike up to the ruined Castell d'Alaró on the crag above it. It's also become a genuine food destination in its own right, with a cluster of good restaurants around its two squares — Plaça de la Vila and Plaça d'es Mercat — ranging from an Italian run by an actual Italian chef to a craft brewery and a standout brunch spot. This guide covers where to eat well in the village, whether you want lunch after the castle climb or dinner on a square, and is a favourite stop for cyclists riding through the Tramuntana too.",
  sections: [
    {
      heading: "The standouts: Sis Market Café and El Trastero",
      business_ids: [IDS.sis, IDS.trastero],
      body: "Two places lead the village on the balance of quality and consistency. **Sis Market Café** on Plaça d'es Mercat (4.8 stars, ~355 reviews) is the highest-rated, a café-restaurant with a lovely patio praised by reviewers for excellent brunch, sandwiches, coffee and a warm welcome, with weekend evening opening too — booking is recommended as it gets busy. **El Trastero Cuina Bar** on the small Plaça de Cabrit i Bassa (4.7 stars, ~550 reviews) is a favourite for dinner, with reviewers highlighting fresh, well-prepared, good-value food, warm hosts and a lovely outdoor setting watching village life go by (note tips are cash only).\n\nBetween them they cover the day: Sis Market for a daytime brunch or lunch, El Trastero for a relaxed evening meal on a quiet square. Both are the safest all-round choices in Alaró and the ones to book ahead in season.",
    },
    {
      heading: "Italian done properly: Gallardo and La Bufala",
      business_ids: [IDS.gallardo, IDS.bufala],
      body: "Alaró has two Italian options, both worth knowing. **Gallardo Restaurante Pizzeria** on Plaça d'es Mercat (4.6 stars, ~295 reviews) is the standout — reviewers repeatedly call it the best restaurant in the village, cooked single-handedly by an actual Italian chef, with creative dishes beyond the usual, Roman-style rectangular pizza, a good wine list and a beautiful outdoor setting. It's dinner-focused and booking is advised. **La Bufala** (4.3 stars, ~860 reviews) is the higher-volume, more casual Italian, set in a charming courtyard with traditional pizza and pasta, large portions and a family-friendly patio — a reliable, relaxed choice.\n\nBetween the two, Gallardo is the one to book for a special, inventive Italian dinner, while La Bufala is the easy, crowd-pleasing option for a casual pizza night with a group or kids.",
    },
    {
      heading: "Grills, local classics and a craft brewery",
      business_ids: [IDS.terramar, IDS.traffic, IDS.forastera],
      body: "For a Mallorcan grill, **Restaurant Terra Mar & Foc** (4.6 stars, ~400 reviews) draws people in with the smell of the charcoal grill from the street, serving fresh grilled meats and fish, tapas and generous portions — though one or two recent reviewers feel prices have risen, so it's worth checking. On Plaça de la Vila, **Restaurant Traffic** (4.3 stars) is a long-standing local favourite for eating out on the square, consistently praised for grilled dishes, paella and friendly service in a spot used by locals.\n\nFor something different, **Forastera** is a small craft brewery and brewpub where the owner brews the beer himself, serving good coffee, breakfast and handmade food alongside — a welcoming, family-style hangout and a well-known stop for road cyclists riding through Alaró. Its opening hours are limited and can be seasonal, so check before heading there specifically.",
    },
    {
      heading: "Combining lunch with the Castell d'Alaró hike",
      business_ids: [],
      body: "Most people come to Alaró for the **Castell d'Alaró**, the ruined castle on the crag high above the village, and a meal in town pairs naturally with the climb. The full walk from the village takes around two hours up on a mix of road and uneven mountain paths, or you can drive part way up a narrow (but paved) road to a parking area near the Es Verger restaurant and walk the final stretch — roughly an hour from there. At the top are stunning panoramic views over much of the island, a few benches and a small kiosk selling drinks and snacks, resupplied, famously, by donkeys.\n\nThe classic plan is to hike in the morning while it's cool, then come down for a late lunch in the village — Sis Market Café or Restaurant Traffic are well set up for a post-hike meal. Take plenty of water, as it's exposed and the kiosk at the top can run low. Alaró is also a popular refuelling stop for cyclists, which is why casual spots like Forastera and the village cafés stay busy through the day.",
    },
  ],
  faqs: [
    { question: "What are the best restaurants in Alaró?", answer: "Sis Market Café (4.8 stars) is the top-rated for brunch and lunch, and El Trastero Cuina Bar (4.7 stars) is a favourite for dinner on a quiet square. For Italian, Gallardo is repeatedly called the best restaurant in the village, cooked by an actual Italian chef, while La Bufala is the more casual courtyard option. Restaurant Terra Mar & Foc is the pick for a charcoal grill, and Forastera is a characterful craft brewery with good food." },
    { question: "Is Alaró worth visiting?", answer: "Yes — Alaró is one of the most rewarding Tramuntana foothill villages, best known for the dramatic hike up to the ruined Castell d'Alaró with panoramic island views, and increasingly for its food. About 40 minutes from Palma, it combines a genuine working-village atmosphere with a cluster of good restaurants around its squares, making it ideal for a day trip pairing the castle climb with a long lunch." },
    { question: "How far is Alaró from Palma?", answer: "Alaró is about 40 minutes' drive from Palma, in the foothills of the Serra de Tramuntana. It's an easy day trip, and a popular one for the Castell d'Alaró hike combined with lunch in the village. It's also a well-known stop on cycling routes through the Tramuntana, so its cafés and casual spots stay busy with riders through the day." },
    { question: "Do you need to book restaurants in Alaró?", answer: "For the most popular places, yes — Sis Market Café, El Trastero and Gallardo all get busy and booking is recommended, especially at weekends and for dinner in season. Several Alaró restaurants also close one or two days midweek and some open evenings only, so it's worth checking opening days before you go, particularly if you're combining your meal with the castle hike." },
  ],
  seo: {
    title: "Best Restaurants in Alaró 2026 | Mallorca Verified",
    description: "Where to eat in Alaró, Mallorca: the best restaurants around the squares, from Italian chef Gallardo to brunch at Sis Market — plus the Castell d'Alaró hike.",
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
