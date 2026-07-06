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
  groenk:   "google-ChIJu0AhH6fplxIRFzQb3Yko0M8",
  cafemed:  "google-ChIJK_odrX_olxIRhvl87SF8dFg",
  ritma:    "google-ChIJ8fGguT2TlxIRZtpGVL-2Wd4",
  canbenet: "google-ChIJbyAad9DplxIRKqHvb2Ruufo",
  cantuna:  "google-ChIJpT6qVH_olxIRr7ncT3KAoZE",
  esturo:   "google-ChIJgVXCqXjolxIRxgW679MOyp0",
  forn:     "google-ChIJ_3Xt0UrplxIRecjw0FnJPwA",
  corella:  "google-ChIJPbFkxqjplxIRJj1q4vbD1Rc",
  pruna:    "google-ChIJ5TKPXwDplxIRt8uPxFayDIw",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-fornalutx-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-fornalutx-2026",
  locale: "en",
  title: "Best Restaurants in Fornalutx 2026",
  excerpt: "Fornalutx is tiny, but it eats far above its size. A handful of genuinely good restaurants and cafés, from farm-to-table menus to the best pastries in the valley.",
  intro: "Fornalutx is one of Mallorca's smallest and prettiest villages, a cluster of stone houses stepped up a Tramuntana hillside just above Sóller, with a permanent population of only a few hundred. You might expect a place this size to have one tourist café and little else — but it punches well above its weight, with a handful of genuinely good restaurants and cafés ranging from a farm-to-table kitchen run by one couple to a bakery turning out some of the best pastries in the valley. This guide covers the places actually worth eating at, is honest about the ones that trade more on their view than their food, and works whether you're staying in the village or driving up from Sóller for the day.",
  sections: [
    {
      heading: "The best all-rounder: Groenk Bistro & Grill",
      business_ids: [IDS.groenk],
      body: "The strongest restaurant in the village on the balance of quality and consistency is **Groenk Bistro & Grill**, which holds 4.8 stars from over 1,270 reviews — a remarkable review count for a village this small. Reviewers describe careful, well-executed cooking across a broad menu: a much-praised schnitzel, fish of the day, steaks, big fresh salads and pulled-pork burgers, served in a smartly decorated space with terrace seating. Several note it feels like a place that cares rather than a tourist trap, though a few mention it's a little pricey and the odd dish can be uneven.\n\nIt's open daily, lunch through dinner, and parking is a block away. Given its popularity and Fornalutx's size, booking is sensible, especially for dinner or a terrace table. For most visitors wanting one reliable, all-round meal in the village, this is the safest choice.",
    },
    {
      heading: "Farm-to-table and standout cooking: Cafe Med and Ritma",
      business_ids: [IDS.cafemed, IDS.ritma],
      body: "For something more personal, **Restaurant Cafe Med** on Carrer de sa Plaça is a tiny farm-to-table restaurant (4.6 stars, ~300 reviews) run by a husband-and-wife team who live upstairs and grow much of the produce themselves. The menu is small, changes weekly, and reviewers repeatedly call it the best meal of their Mallorca trip — inventive dishes explained course by course, with local ingredients and thoughtful wine pairings. Capacity is very limited, so booking ahead is essential.\n\n**Ritma Mallorca** (4.9 stars, ~410 reviews) is the other standout, a smaller-hours dinner-focused spot with stunning valley views and a reputation for impeccable food and service — reviewers consistently rank it among their best meals on the island. It's only open a few evenings a week (roughly Wednesday to Sunday, with a Saturday lunch), fills fast, and reservations are strongly advised. Both of these are destination meals rather than casual drop-ins.",
    },
    {
      heading: "Tapas and a relaxed bite: Can Benet by Don Pedro",
      business_ids: [IDS.canbenet],
      body: "For a more casual meal, **Can Benet by Don Pedro** on the village square (4.6 stars, ~1,020 reviews) is a well-liked tapas and café spot. Reviewers praise the friendly service (several mention the same staff by name and returning nightly during their stay), the Iberico steak and tortilla, and the relaxed square-side setting for coffee, pan cristal or a light dinner. A few note the menu is smaller and more café-style than a full restaurant, and that some dishes are better than others.\n\nIt's the pick for a laid-back bite or a drink rather than a big sit-down dinner, and its long daily hours (closed Wednesdays) make it easy to drop into while wandering the village. Good for families or anyone wanting tapas over a formal meal.",
    },
    {
      heading: "Great views, honest expectations: Ca N'Antuna and Es Turó",
      business_ids: [IDS.cantuna, IDS.esturo],
      body: "Fornalutx's two best-known terrace restaurants trade heavily on their spectacular valley views, and it's worth being honest about the trade-off. **Ca N'Antuna** (4.2 stars, ~2,110 reviews) has arguably the most famous verandah in the village, with sweeping views, and reviewers are divided: many love the setting and traditional dishes like deep-fried sole, while others find the food average and overpriced for what it is, and service inconsistent. **Restaurant Es Turó** (4.2 stars, ~1,230 reviews) is similar — a no-frills mountain taverna praised for its terrace, sunset views and generous Mallorcan plates (porcella, padrón peppers, sausage), though reviews on food and service run mixed.\n\nThe honest summary: both are worth it primarily for the view and the atmosphere, best enjoyed with a group sharing plates rather than as a foodie destination. If the meal itself matters most, Groenk, Cafe Med or Ritma are the stronger choices; if you want a classic terrace-with-a-view lunch, these deliver that.",
    },
    {
      heading: "Coffee, pastries and gelato",
      business_ids: [IDS.forn, IDS.corella, IDS.pruna],
      body: "For breakfast, coffee or a light stop rather than a full meal, Fornalutx has three standouts. **Forn de Barri** (4.8 stars, ~180 reviews) is the village bakery, open mornings until mid-afternoon, praised for excellent croissants, napolitanas, cinnamon rolls, sourdough bread and sandwiches at affordable prices — a great first stop before a walk. **Corel·la Café** (4.9 stars, ~210 reviews) is a specialty coffee spot where the owner makes the pastries himself, with reviewers highlighting the coffee quality, cakes, chai latte and a small deli of local products to take away.\n\nFor something sweet later in the day, **Pruna Gelateria Artesana** on the square (4.9 stars, ~270 reviews) serves artisan gelato that reviewers rate among the best on the island, with original flavours like rosemary honey and a friendly owner who lets you taste before choosing. Between the three, you're covered from a morning coffee and pastry to an afternoon ice cream without needing a full sit-down meal.",
    },
    {
      heading: "Combining Fornalutx with Sóller and Biniaraix",
      business_ids: [],
      body: "Fornalutx is tiny, so most visitors combine it with the wider Sóller valley rather than making it a standalone trip. It sits about 10 minutes by car above **Sóller**, and a popular plan is to explore Sóller and Port de Sóller (reachable by the vintage train and tram from Palma), then drive or walk up to Fornalutx for a quieter meal with mountain views away from the busier town.\n\nWalkers can link Fornalutx with the hamlet of **Biniaraix** and Sóller on foot via the old stone paths and the Barranc de Biniaraix, one of the Tramuntana's classic short walks — a scenic way to work up an appetite before lunch. Because Fornalutx has only a handful of places and several keep limited days or hours, it's worth checking opening times and booking ahead rather than turning up and hoping, especially outside peak season when some close midweek.",
    },
  ],
  faqs: [
    { question: "Is Fornalutx worth visiting just to eat?", answer: "Fornalutx is worth a trip for a meal if you book one of its standout restaurants — Groenk Bistro & Grill for a reliable all-round meal, or Cafe Med and Ritma for more personal, high-end cooking. The village itself is one of the prettiest in Mallorca, so a meal pairs naturally with a wander through its stone streets and a coffee at Forn de Barri or Corel·la Café. Most people combine it with nearby Sóller rather than making a dedicated trip, as it's very small." },
    { question: "How many restaurants does Fornalutx have?", answer: "Fornalutx is a very small village, so it has only a handful of restaurants — but several are genuinely good. The main sit-down options are Groenk Bistro & Grill, Cafe Med, Ritma Mallorca, Can Benet by Don Pedro, and the two view-focused terraces Ca N'Antuna and Es Turó, plus cafés and a bakery (Forn de Barri, Corel·la Café) and an artisan gelateria. Because there are so few and some open limited days, booking ahead is strongly recommended, especially in the evening and out of season." },
    { question: "Where can I get good coffee or breakfast in Fornalutx?", answer: "Fornalutx has two excellent morning spots. Forn de Barri is the village bakery, open from early until mid-afternoon, with well-priced croissants, sourdough, cinnamon rolls and sandwiches. Corel·la Café is a specialty coffee spot where the owner bakes the pastries, praised for its coffee, cakes and small deli. For dessert, Pruna Gelateria Artesana on the square serves highly rated artisan gelato in the afternoons and evenings." },
    { question: "Do you need to book restaurants in Fornalutx?", answer: "Yes, booking is strongly advised for the sit-down restaurants. The village is tiny and its best places — especially the small farm-to-table Cafe Med and the highly rated Ritma — have very limited capacity and fill quickly. Several restaurants also close midweek or open only a few evenings, so it's worth checking opening days and reserving rather than arriving and hoping, particularly outside the summer season. The cafés and bakery are walk-in but keep daytime hours only." },
  ],
  seo: {
    title: "Best Restaurants in Fornalutx 2026 | Mallorca Verified",
    description: "Where to eat in Fornalutx, Mallorca's tiny Tramuntana village above Sóller: farm-to-table Cafe Med, Groenk, Ritma, plus the best bakery, café and gelato.",
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
