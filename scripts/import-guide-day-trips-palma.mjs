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

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-day-trips-from-palma-mallorca-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-day-trips-from-palma-mallorca-2026",
  locale: "en",
  title: "Best Day Trips from Palma, Mallorca 2026",
  excerpt: "The best day trips from Palma by car, train or bus — Tramuntana villages, dramatic caves, wild beaches and medieval towns, with honest travel times.",
  intro: "Palma is a great base for exploring Mallorca, and most of the island's headline sights are within a 30–90 minute drive. Some are reachable without a car — the vintage train to Sóller, the bus to Valldemossa — but the most rewarding day trips, like the serpentine road to Sa Calobra or the wild beach at Es Trenc, really need your own wheels. This guide runs through the best day trips by direction and by how you'll get there, with honest travel times and what to expect, so you can match a trip to whether you're driving, on public transport, or want a relaxed half-day versus a full one.",
  sections: [
    {
      heading: "Tramuntana villages: Valldemossa, Deià and Sóller",
      business_ids: [],
      body: "The classic Palma day trip heads northwest into the Serra de Tramuntana. **Valldemossa** (about 20–25 minutes by car or bus) is a postcard hilltop village known for its Carthusian monastery and Chopin connection, best paired with lunch at one of the restaurants just off the main square. **Deià** (about 15 minutes further along the coast road) is smaller, more exclusive, and long associated with artists and writers since Robert Graves settled there.\n\n**Sóller** (around 30 minutes on) sits in a citrus valley and is the one Tramuntana trip you can do entirely without a car: the vintage 1912 wooden train runs from Palma's Plaça d'Espanya, and a connecting tram carries you down to Port de Sóller on the coast. A natural full day strings all three together into a mountain loop by car, or you can make Sóller a standalone train-and-tram outing. If you're driving, be ready for slow, winding roads — scenic but not quick.",
    },
    {
      heading: "Sa Calobra and the Torrent de Pareis",
      business_ids: [],
      body: "For many, the drive to **Sa Calobra** is the single most dramatic day trip on the island, and the road is the highlight as much as the destination: a series of hairpins corkscrewing down through the Tramuntana to a tiny cove on the north coast, roughly 1h15–1h30 from Palma. At the bottom, Sa Calobra opens onto the mouth of the **Torrent de Pareis**, a spectacular gorge where the canyon meets the sea through a short walk-through cave.\n\nA few honest cautions: the beach and restaurants get very crowded and the food here is poor, so bring a picnic. Parking at the cove is paid, around €13, and the operator tends to prefer cash, so arrive before late morning. Hiking the full Torrent de Pareis gorge from Escorca is a serious 5–6 hour route that needs a guide and proper gear — it involves scrambling and water crossings and is not a casual walk. For most visitors, the drive, the cove and the cave are the day.",
    },
    {
      heading: "The east coast: Coves del Drach and Porto Cristo",
      business_ids: [],
      body: "The east coast's headline attraction is the **Coves del Drach** in Porto Cristo, about 1h10 from Palma and one of Mallorca's most visited sights. The caves are genuinely impressive in scale, with vast chambers of rock formations, and the visit includes a short classical music concert performed live on the underground lake, followed by an optional brief boat ride across it.\n\nThe most useful tip is to book directly through the official Coves del Drach website rather than through a tour operator or reseller, which is often more than double the price. The concert is performed with the lights off, so it's not ideal for small children who may find the dark unsettling. Porto Cristo itself is a pleasant harbour town for lunch afterwards, and the nearby Coves dels Hams are an alternative cave system if you want to avoid the biggest crowds.",
    },
    {
      heading: "Wild beaches: Es Trenc and the south",
      business_ids: [],
      body: "If your day trip is really about the beach, head to the south coast. **Es Trenc** (about 45 minutes from Palma) is the island's most famous natural beach — a long stretch of white sand and shallow turquoise water backed by a protected nature park, with no resort development, which is exactly what makes it special. It gets busy in peak season precisely because the sand and water are among the island's best.\n\nGo early and be prepared: parking costs around €8 and fills up, though you can park for free in nearby Colònia de Sant Jordi and walk in. Bring everything you need, as facilities are limited by design. For quieter alternatives on the same drive, the coves further southeast around Santanyí — Cala Llombards and Cala Santanyí — are smaller, more sheltered, and lovely in their own right.",
    },
    {
      heading: "The north: Alcúdia old town and Formentor",
      business_ids: [],
      body: "The north pairs history with dramatic coast. **Alcúdia's old town** (about 50 minutes from Palma) is ringed by well-preserved **medieval walls** you can walk for views over the town, entered through the historic **Porta de Mallorca** gate. Inside are narrow streets, Roman ruins, cafés and a lively market — an easy, walkable half-day. As with any busy tourist spot, keep an eye on your belongings around the crowded gate in peak season.\n\nFurther north, the **Cap de Formentor** peninsula and its lighthouse offer some of the island's most spectacular clifftop views, at the very tip beyond Port de Pollença. Note that in summer the narrow road to Formentor is closed to private cars during peak hours, with a shuttle bus running instead — check current access rules before driving, as they change seasonally. Combined, Alcúdia and Formentor make a full northern day.",
    },
    {
      heading: "How to choose: by car, train or bus",
      business_ids: [],
      body: "Match the trip to your transport. Without a car, your best day trips are **Sóller** (the vintage train and tram from Palma), **Valldemossa** (a direct bus of about 30 minutes), and **Palma's own sights** if you want a low-effort day — the cathedral, La Seu, is a short walk from the centre, costs around €10 to enter, and is best booked online. The TIB bus network reaches Alcúdia and the main towns, and is free for registered residents in 2026 on interurban routes.\n\nWith a car, the island opens up: Sa Calobra, Es Trenc, the eastern caves and the full Tramuntana loop all become practical, and you can combine two nearby sights in a day. As a rule, plan mountain and beach trips for the morning — Tramuntana roads are slow and busy by midday, and beaches and parking fill early. Confirm seasonal details before you go: Formentor road closures, cave opening times and beach parking all vary by season, and popular sights like the Coves del Drach and the cathedral are best pre-booked online.",
    },
  ],
  faqs: [
    { question: "What are the best day trips from Palma without a car?", answer: "The best car-free day trips from Palma are Sóller (via the vintage 1912 train and connecting tram to the port), Valldemossa (a direct bus of about 30 minutes), and Alcúdia (on the TIB bus network, free for residents in 2026 on interurban routes). Palma's own cathedral, old town and seafront also make an easy low-effort day. For Sa Calobra, Es Trenc or the eastern caves, you'll really want a car." },
    { question: "How far is Sa Calobra from Palma and is it worth it?", answer: "Sa Calobra is roughly 1h15–1h30 from Palma by car, and the dramatic hairpin road down through the Tramuntana is the highlight of the trip as much as the destination. The cove and the Torrent de Pareis gorge mouth are beautiful, but it gets very crowded, the food on site is poor (bring a picnic), and parking is paid at around €13. Arrive before late morning and go for the drive and the scenery." },
    { question: "Do you need to book the Coves del Drach in advance?", answer: "Booking ahead is recommended, and you should book directly through the official Coves del Drach website rather than a tour reseller, which is often more than double the price. The visit includes a short classical concert on the underground lake and an optional boat ride. It's about 1h10 from Palma near Porto Cristo, and the dark concert section can unsettle small children." },
    { question: "What is the best beach day trip from Palma?", answer: "Es Trenc, about 45 minutes south of Palma, is the most famous natural beach day trip — a long undeveloped stretch of white sand and shallow turquoise water in a protected park. Go early, as parking (around €8) fills up, though you can park free in nearby Colònia de Sant Jordi and walk in. For quieter alternatives, the coves around Santanyí like Cala Llombards and Cala Santanyí are smaller and more sheltered." },
  ],
  seo: {
    title: "Best Day Trips from Palma, Mallorca 2026 | Mallorca Verified",
    description: "The best day trips from Palma by car, train or bus: Tramuntana villages, Sa Calobra, Coves del Drach, Es Trenc and Alcúdia — with honest travel times and tips.",
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
console.log("  Sections:", guide.sections.length, "| FAQs:", guide.faqs.length);
