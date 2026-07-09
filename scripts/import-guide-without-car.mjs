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

const { data: existing } = await sb.from("guides").select("id").eq("slug", "getting-around-mallorca-without-car-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "getting-around-mallorca-without-car-2026",
  locale: "en",
  title: "Getting Around Mallorca Without a Car: Complete Guide 2026",
  excerpt: "Mallorca's public transport is better than its reputation. TIB buses and trains are free for residents in 2026 and cheap for visitors — but some areas still need a car.",
  intro: "Mallorca has a genuinely usable public transport network, and getting around without a car is realistic for most towns, resorts and the main sights — though not for every hidden cove. The island runs on two connected systems: the TIB network of interurban buses, trains and metro that reach almost every major town from Palma, and the EMT city buses within Palma itself. For all of 2026 the interurban TIB buses, SFM trains and metro are free for residents with a travel card, and even for visitors paying cash the fares are low. This guide covers what's easy, what's cheap, and — honestly — which parts of the island genuinely need a car.",
  sections: [
    {
      heading: "The two networks: TIB and EMT",
      business_ids: [],
      body: "Everything centres on the **Estació Intermodal** beneath **Plaça d'Espanya** in Palma, where buses, trains and metro all connect. **TIB** (Transport de les Illes Balears) runs the red-and-yellow interurban buses that reach almost every major town — **Alcúdia**, **Pollença**, **Sóller**, **Manacor**, **Cala d'Or**, **Andratx** — plus the **SFM** trains (to Inca, Sa Pobla and Manacor) and the **Metro de Palma**. **EMT** runs the city buses within Palma, including the airport lines.\n\nThe practical rule is that the operator matters more than the route number: a TIB coach for anywhere outside Palma, an EMT bus within it. Journey planning is easiest through Google Maps, which shows live stop times for both, or the official tib.org and emtpalma.cat sites and apps. A virtual version of the travel card for phones is expected during the first half of 2026.",
    },
    {
      heading: "Free travel in 2026 — for residents",
      business_ids: [],
      body: "For all of 2026, travel on **TIB** interurban buses, **SFM** trains and the **Metro de Palma** is free with an **Intermodal Card** or **Single Card** (Targeta Única), and this extends to **EMT** Palma city buses for cardholders. The important caveat: this applies only to residents. Eligibility needs proof of registration (a padrón certificate), and the card is issued free at TIB offices in Palma's Estació Intermodal, Inca, Manacor and Alcúdia, and at the EMT office.\n\nVisitors and tourists without a qualifying card pay standard cash fares — but these are low, generally between about €3 and €13.50 depending on distance, and often around 40% cheaper if you pay by contactless card rather than cash. So while the headline free travel is a residents' benefit, public transport remains inexpensive for everyone.",
    },
    {
      heading: "Getting around Palma: EMT city buses",
      business_ids: [],
      body: "Within Palma you rarely need anything but the **EMT** city buses, which cover the old town, the Passeig Marítim seafront, Portixol, Génova, the Castell de Bellver and the residential districts across more than 30 routes. As of 2026 a single urban fare is around €3, cheaper with a contactless card, and buses run frequently through the day.\n\nPalma itself is also very walkable — the old town, cathedral, Santa Catalina and the seafront are all easily covered on foot — so many visitors staying in the city barely use transport at all. For the airport, the EMT **A1** bus runs to the city centre and the **A2** to Playa de Palma, both cheap and frequent, which we cover below.",
    },
    {
      heading: "The airport: A1 and A2 buses",
      business_ids: [],
      body: "Palma Airport (PMI) is well connected to the city by EMT bus, and it's far cheaper than a taxi. The **A1** Aerobús runs directly between the airport and Palma city centre (Plaça d'Espanya and the Passeig Marítim) for €5, taking under 20 minutes, and it runs until the early hours — last departures are around 3:10 AM. The **A2** runs to Playa de Palma and S'Arenal, until roughly 01:15. Both are airport-exclusive lines with no intermediate stops on the A1.\n\nFor destinations beyond Palma, seasonal **Aerotib** coaches run directly from the airport to the main resort areas — the north (Alcúdia, Can Picafort), the east (Manacor, Cala Bona), Playa de Palma and the southwest (Palmanova, Magaluf, Santa Ponça) — though these stop earlier in the evening, so check the last departure for your route. Outside those hours, a taxi or ride app is the fallback from the airport.",
    },
    {
      heading: "The Sóller train and tram",
      business_ids: [],
      body: "The one piece of Mallorcan transport that's an attraction in itself is the **Ferrocarril de Sóller**, a vintage 1912 wooden narrow-gauge train that runs from Palma (just off Plaça d'Espanya) north through the Tramuntana to Sóller, connecting with an antique **tram** down to Port de Sóller on the coast. It's a scenic day out rather than pure transport, and priced as such: a combined return ticket for the train and tram (Palma–Port de Sóller–Palma) is €40 at the ticket desk, or €32 online as a discount on certain departures, subject to availability. The tram alone is €10 each way, and a one-way train ticket is €23.\n\nA useful tip: you can take the scenic train out to Sóller and return more cheaply and quickly on the **204 bus** from Port de Sóller to Palma, which takes about 35 minutes and costs €4–6 (and is free for residents with the Intermodal card). Timetables reduce in winter, so check trendesoller.com before travelling.",
    },
    {
      heading: "Which resorts and areas work without a car",
      business_ids: [],
      body: "Reachable by direct bus or train from Palma and easy without a car: **Sóller** and **Port de Sóller** (train, tram, or bus 204); **Alcúdia** and **Port d'Alcúdia** in the north; **Pollença** and **Port de Pollença**; **Valldemossa** (direct bus, about 30 minutes); the inland towns of **Inca**, **Sa Pobla** and **Manacor** (SFM train); and the southeast resorts like **Cala d'Or**. Palma itself, of course, needs nothing but your feet and the odd EMT bus.\n\nWhere you'll genuinely struggle without a car: the remote Tramuntana coves and viewpoints (Sa Calobra, Sa Foradada, many mountain miradors), the smaller southern and eastern calas reached only by minor roads, and anywhere that relies on infrequent seasonal services. For a day or two of these, hiring a car just for those days, or using a taxi or ride app, makes more sense than forcing it by bus. Be honest with your itinerary: a beach-and-town holiday works car-free; a cove-hopping or deep-mountain one doesn't.",
    },
    {
      heading: "Taxis, ride apps, ferries and bikes",
      business_ids: [],
      body: "**Uber** operates in Mallorca (as UberX), alongside local taxis and apps, though at busy times and in remote spots availability can be patchy and it isn't necessarily cheaper than a standard taxi. For the airport and late arrivals, taxis are metered and reliable. There's no need to rely on ride apps for the main routes, which the buses cover well, but they're a useful fallback for the gaps.\n\nFor day trips further afield, ferries run from Palma and other ports to the neighbouring islands, and the **bike** is a serious option in Mallorca — the island is a world cycling destination, and rental is widely available. Bikes are practical for getting around within a town or resort and for the flatter areas, but for getting between towns they suit confident road cyclists rather than casual riders, given the distances and mountain terrain. For most car-free visitors, the realistic mix is buses and trains for towns, the occasional taxi or ride app for the gaps, and a bike for local exploring.",
    },
  ],
  faqs: [
    { question: "Can you get around Mallorca without a car?", answer: "Yes, for most towns, resorts and main sights. The TIB network of interurban buses and trains reaches Alcúdia, Pollença, Sóller, Manacor, Cala d'Or and more from Palma, and it's free for residents in 2026 and cheap for visitors. Palma itself is walkable with EMT city buses. However, remote Tramuntana coves and many smaller calas genuinely need a car, so a beach-and-town holiday works car-free while a cove-hopping one doesn't." },
    { question: "Can you visit Cap de Formentor without a car?", answer: "It's possible but limited. In summer (roughly June to September) private cars are restricted from Cap de Formentor during the day, with a shuttle bus running from Port de Pollença instead — so in season you'd take a bus to Port de Pollença and the shuttle from there. Outside those restrictions, there's no regular public bus to the cape itself, so many car-free visitors reach Formentor via an organised excursion or boat trip from Port de Pollença or Alcúdia." },
    { question: "Is public transport in Mallorca reliable?", answer: "The main TIB bus and train routes and Palma's EMT buses are reliable and reasonably frequent, especially in summer, and are free for residents in 2026. The limitations are frequency on minor rural routes, reduced winter timetables, and earlier last departures than you might expect — the airport A1 bus runs until around 3:10 AM, but many rural coaches stop by mid-evening. Check live times on Google Maps or tib.org, and plan the last service back carefully." },
    { question: "What are the best apps for buses in Mallorca?", answer: "Google Maps is the most practical for planning journeys, as it shows live stop times for both TIB and EMT services and combines routes. The official tib.org site and app cover the interurban buses, trains and metro, and emtpalma.cat covers Palma's city buses. For the Sóller train, use the official trendesoller.com. Paying by contactless card is often around 40% cheaper than cash on the buses." },
  ],
  seo: {
    title: "Getting Around Mallorca Without a Car 2026 | Mallorca Verified",
    description: "Mallorca without a car: TIB buses and trains free for residents in 2026, cheap for visitors, the Sóller train, airport buses, and which areas still need a car.",
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
