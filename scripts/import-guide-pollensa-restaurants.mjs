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
  laParra:  "google-ChIJH-dWFCLVlxIRRzvK1jpLNGI",
  elMoli:   "google-ChIJ3xTxByDUlxIRUQhp10HEdoc",
  laPlaceta:"google-ChIJ0Rni5h_UlxIRhnPfn9xG6Zc",
  ilGiardino:"google-ChIJ18BYkaDWlxIRf216285g8h8",
  laFonda:  "google-ChIJpWMN6qDWlxIRjMo_RvjkV1k",
  anima:    "google-ChIJl-bweQDXlxIRYGvd9GqVt9E",
  pescador: "google-ChIJ_2CT1yTVlxIRD9DQrWYDOF4",
  bellavista:"google-ChIJSc1RFBHVlxIRQRUUHOrUegs",
  vista:    "google-ChIJNWvk1afVlxIR4y7_R8fwQxo",
  idilico:  "google-ChIJRbfeM8vVlxIRailcMif0V6E",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-pollensa-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-pollensa-2026",
  locale: "en",
  title: "Best Restaurants in Pollença 2026",
  excerpt: "Where to eat in Pollença, north Mallorca's cultural town — the genuinely good tables around Plaça Major and the old town, versus the seafront restaurants down in the port.",
  intro: "Pollença sits about 55 km north of Palma at the eastern end of the Serra de Tramuntana, a town that has kept its Mallorcan character rather than surrendering to resort tourism, best known for the **365 steps of the Calvari** (one for each day of the year) climbing from near **Plaça Major**, and for its **Sunday market**, one of the largest on the island. An important thing to understand before choosing where to eat: the inland old town of **Pollença** and the seaside **Port de Pollença** are 6 km apart and have quite different restaurant scenes — the old town leans towards squares, cellars and Mallorcan cooking, the port towards seafront dining. This guide separates the two and flags which places are genuinely good versus which are trading on a prime square-side location.",
  sections: [
    {
      heading: "Old town: around Plaça Major",
      business_ids: [IDS.ilGiardino, IDS.laPlaceta],
      body: "The heart of dining in the old town is **Plaça Major**, the tree-shaded main square overlooked by the church of Nostra Senyora dels Àngels, lined with café and restaurant terraces that fill on Sunday mornings after the market. Right on the square, **Il Giardino** (4.5 stars, ~555 reviews) is a long-established Italian that reviewers rate for its central people-watching position, attentive service and pasta, though a few note the prime location comes with prime prices and small add-on charges for bread. It's the reliable square-side choice for a relaxed dinner watching the evening pass.\n\nA short walk off the square, **La Placeta** (4.5 stars, ~600 reviews) sits on a quieter village corner and draws consistent praise for grilled meats, suckling pig, paella and Mallorcan almond cake, with several reviewers calling it the best meal of their stay. Eating just off the main square rather than directly on it often means better value and a more local feel, so it's worth walking a couple of streets out.",
    },
    {
      heading: "Old town: traditional Mallorcan cooking",
      business_ids: [IDS.elMoli, IDS.laParra],
      body: "For genuinely traditional Mallorcan food, two cellers stand out. **Restaurant Celler El Molí** (4.5 stars, ~1,000 reviews) is a local bistro serving a set three-course lunch of simple, well-executed Mallorcan dishes with a menu that changes daily, and it's excellent value — but it's lunch-only and small, so booking ahead is genuinely necessary, as reviewers report every table full by 2pm. Just outside the town centre, **Celler La Parra** (4.6 stars, ~3,450 reviews) is a four-generation, family-run restaurant that makes its own wine and cooks everything over a wood grill, praised for lamb, suckling pig and homemade desserts — a strong choice for a full Mallorcan experience, and bookings are effectively essential given its popularity.\n\nBetween them, El Molí is the pick for an affordable traditional lunch in the old town, while La Parra is the destination for a wood-grilled Mallorcan dinner with the town's own wine. Both reward booking ahead.",
    },
    {
      heading: "Old town: modern and casual",
      business_ids: [IDS.laFonda, IDS.anima],
      body: "For something more contemporary, **Restaurant La Fonda de l'Aigua** (4.7 stars, ~800 reviews) is a well-regarded modern Mediterranean spot praised for fresh, thoughtfully presented dishes like ceviche and rosemary potatoes, in a cosy, child-friendly setting — though some reviewers note service can be slow and prices a touch high, so it suits a relaxed, unhurried meal rather than a quick bite.\n\nFor a casual daytime stop, **Anima e Farina** (4.9 stars, ~495 reviews) is a small focacceria and café that reviewers repeatedly single out for excellent in-house focaccia (including one with sobrassada, the local spreadable sausage), good Italian coffee and homemade cakes. It's ideal for a quality lunch or mid-morning break rather than a sit-down dinner, and its high rating reflects how consistently people rate it.",
    },
    {
      heading: "Port de Pollença: seafront dining",
      business_ids: [IDS.pescador, IDS.bellavista, IDS.vista, IDS.idilico],
      body: "Down at the port, 6 km from the old town, the scene shifts to seafront restaurants along the bay. **Ca'n Pescador** (4.6 stars, ~3,500 reviews) is a long-standing beachfront fish restaurant serving fresh seafood and paella in a relaxed setting, popular and generally well liked — though, as at many high-volume seafront spots, a few reviewers feel the paella is pricey for what it is, so it's worth managing expectations on cost. For a smaller, higher-rated option, **Restaurant Ca'n Bella-vista** (4.8 stars) on the Passeig d'Anglada Camarasa is praised for paella, sea views and friendly service at reasonable prices.\n\n**Vista Restaurant** (4.8 stars, ~470 reviews) is a newer, well-rated all-day spot just behind the beach with a broad menu spanning brunch, pasta, fish and steaks, and **Idilico Beach House** (4.4 stars) is a relaxed, family-friendly beachfront choice liked for its paella and setting. For the port, the trade-off is familiar: the view is the draw, so pick the better-rated tables and don't expect old-town prices.",
    },
    {
      heading: "Booking, seasons and the festival",
      business_ids: [],
      body: "Booking is worth it across Pollença in summer, and essential at the most popular tables — the traditional cellers (El Molí, La Parra) fill fast, and the lunch-only spots can be fully booked by early afternoon. Many old-town restaurants close one day midweek or open lunch-only, so check opening hours before you go, particularly out of the main season when hours reduce.\n\nOne specific thing to plan around: the **Festival de Pollença**, the town's international classical music festival, runs across July and August nights in the cloister of the Sant Domingo convent and celebrates its 65th edition in 2026. On concert nights the old town is busier and restaurants around the centre fill earlier, so if you're dining before or after a concert, book ahead and allow time. The same applies during the town's big **La Patrona** festival in early August.",
    },
    {
      heading: "Old town or port — which to choose",
      business_ids: [],
      body: "If you want traditional Mallorcan cooking, character and culture, eat in the **old town**: the cellers for wood-grilled meat and local wine, the squares for a relaxed dinner, and the casual spots for lunch after climbing the Calvari or browsing the Sunday market. If you want to eat looking at the sea, head to **Port de Pollença**, accepting that you're partly paying for the view and choosing the better-rated seafront tables accordingly.\n\nThe good news is they're only 6 km apart and connected by a frequent bus, so you don't have to choose for your whole stay — do a traditional celler lunch in town one day and a seafront fish dinner in the port another. For most visitors, the old town delivers the more distinctive Pollença meal, with the port as the choice for a beachside evening.",
    },
  ],
  faqs: [
    { question: "What are the best restaurants in Pollença?", answer: "In the old town, Celler La Parra and Restaurant Celler El Molí are the standouts for traditional Mallorcan cooking, La Placeta and Il Giardino are reliable around Plaça Major, and La Fonda de l'Aigua is the modern Mediterranean pick. Down in Port de Pollença, Ca'n Pescador and Ca'n Bella-vista are well-rated seafront choices. Booking ahead is wise in summer, and essential at the popular cellers." },
    { question: "Where should I eat in Pollença — the old town or the port?", answer: "The inland old town (Pollença) is better for traditional Mallorcan food, cellers, squares and character, while Port de Pollença, 6 km away, is where the seafront fish restaurants are. They're connected by a frequent bus, so you can do both across a stay — a traditional celler in town one day, a beachfront dinner in the port another. For the most distinctive Pollença meal, the old town usually wins." },
    { question: "Is there good traditional Mallorcan food in Pollença?", answer: "Yes. Restaurant Celler El Molí serves an excellent-value daily set lunch of traditional Mallorcan dishes (lunch-only, book ahead), and Celler La Parra, a four-generation family restaurant just outside the centre, cooks lamb, suckling pig and more over a wood grill and makes its own wine. Both are among the best places on the island for a genuine Mallorcan meal, and booking is effectively essential in season." },
    { question: "Do you need to book restaurants in Pollença in summer?", answer: "For the popular places, yes — the traditional cellers and lunch-only spots fill quickly, sometimes fully booked by early afternoon. Booking is especially important during the Pollença Music Festival across July and August and the La Patrona festival in early August, when the old town is busy and restaurants fill earlier. Many places also close one day midweek, so check opening hours before you go." },
  ],
  seo: {
    title: "Best Restaurants in Pollença 2026 | Mallorca Verified",
    description: "Where to eat in Pollença: traditional cellers and squares in the old town, seafront fish in Port de Pollença. Honest picks, prices and booking tips.",
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
