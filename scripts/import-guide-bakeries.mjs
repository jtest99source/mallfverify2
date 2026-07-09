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
  canJoan:   "google-ChIJ_Wydbk6SlxIRc5wKl1c1hcY",
  fornetSoca:"google-ChIJTU1qblqSlxIRgqyBztCvFs4",
  laGloria:  "google-ChIJsZl3ukSSlxIRbIENsjonsK4",
  fornFondo: "google-ChIJUVFTnlqSlxIRA40wlWye4nc",
  santFran:  "google-ChIJl5jNWb_FlxIR1D3lA5OoWkg",
  canToni:   "google-ChIJ8Ye4do_JlxIRVA9NSG0IRjo",
  canDelante:"google-ChIJ_YseA7nFlxIR4hoVBP2V0BQ",
};

// Republish hidden bakeries cited in this guide so their cards render
const CITED_IDS = Object.values(IDS);
const { data: hiddenRows } = await sb.from("businesses").select("id,name,status").in("id", CITED_IDS);
const toRepublish = (hiddenRows || []).filter(b => b.status === "hidden");
if (toRepublish.length) {
  const { error } = await sb.from("businesses")
    .update({ status: "published", updated_at: new Date().toISOString().slice(0, 10) })
    .in("id", toRepublish.map(b => b.id));
  if (error) { console.error("Republish error:", error); process.exit(1); }
  console.log(`✓ Republished ${toRepublish.length}: ${toRepublish.map(b => b.name).join(", ")}`);
} else {
  console.log("No hidden bakeries to republish.");
}

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-bakeries-ensaimadas-mallorca-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Guide already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-bakeries-ensaimadas-mallorca-2026",
  locale: "en",
  title: "Best Traditional Bakeries in Mallorca 2026: Where to Buy Ensaimadas",
  excerpt: "The ensaimada is Mallorca's signature pastry. Where to buy a genuinely good one — from a Palma institution since the 1700s to the inland ovens of Inca.",
  intro: "The ensaimada is Mallorca's signature pastry: a coiled, spiral bun of thin, lard-enriched dough (saïm means lard in Mallorcan), dusted with icing sugar and either left plain or filled. The best come from traditional wood-oven bakeries — forns — that have been making them the same way for generations, and they range from a centuries-old café in Palma's old town to family ovens in inland towns like Inca and Sineu. This guide covers where to buy a genuinely good ensaimada, the difference between the types, and whether the boxed ones at the airport are worth it, focusing on the traditional bakeries locals actually rate.",
  sections: [
    {
      heading: "The Palma institution: Ca'n Joan de s'Aigo",
      business_ids: [IDS.canJoan],
      body: "The most famous place to try an ensaimada in Palma is **Ca'n Joan de s'Aigo**, a café dating back to the early 18th century whose original branch on Carrer de Can Sanç holds 4.6 stars from nearly 7,900 reviews. Reviewers describe stepping back in time into an antique-filled room, and the classic order is an ensaimada with a cup of thick hot chocolate, or the house-made ice cream the place has served since its founder used Tramuntana mountain snow to make it. There are now three branches across Palma, all with the same traditional feel.\n\nIt's as much an experience as a bakery, and reviewers warn it gets busy with cruise-ship groups, so go early or mid-afternoon. A few note the coffee is ordinary and it can be touristy, but for a first ensaimada in an atmospheric, genuinely historic setting, it's the classic choice — and prices stay reasonable despite the central location.",
    },
    {
      heading: "Traditional Palma forns worth seeking out",
      business_ids: [IDS.fornetSoca, IDS.laGloria, IDS.fornFondo],
      body: "For a more bakery-focused experience, three traditional Palma ovens stand out. **Fornet de la Soca** on Plaça de Weyler (4.5 stars, ~1,200 reviews) — formerly known as the historic Forn des Teatre — is a beautifully decorated forn that reviewers travel to Palma specifically for, praised for melt-in-the-mouth plain ensaimadas and traditional savoury baking alongside the sweet. **Forn de La Glòria** (4.8 stars), tucked down a narrow alley, is a wood-oven bakery reviewers call as local as it gets, where the oven gives the pastries a subtle smoky flavour — a well-kept secret for ensaimadas, panades and bread.\n\n**Forn Fondo** on Carrer Unió (4.4 stars) is another long-standing central bakery reviewers stumble on while searching for ensaimadas and end up loving, with a good spread of pastries at fair prices. Between these three you get the traditional, produce-led Palma bakery experience rather than the busier café scene — better if the pastry itself, not the setting, is the point.",
    },
    {
      heading: "The inland ovens: Inca and Sineu",
      business_ids: [IDS.santFran, IDS.canToni, IDS.canDelante],
      body: "Many locals will tell you the best ensaimadas come not from Palma but from the inland towns, and **Inca** is the heartland. **Forn Sant Francesc** (4.6 stars, ~670 reviews) is repeatedly called the best traditional ensaimada on the island by reviewers who drive out specially — light, fluffy dough in several varieties (plain, cabello de ángel, chocolate), though the large round ones typically sell out by late morning, so order the night before or arrive early. In the market town of **Sineu**, **Forn Can Toni** (4.6 stars) is a quality Mallorcan bakery on the main square, worth pairing with the famous Wednesday Sineu market.\n\nFor something smaller and more old-fashioned, **Forn Can Delante** in Inca is a century-old family pastry shop — not a high-volume spot, but a genuine traditional forn reviewers single out for its crema cremada and turrón ensaimadas and its friendly, family atmosphere. These town forns are where the ensaimada is treated as an everyday local staple rather than a tourist product, and a short drive inland genuinely rewards you with a better pastry.",
    },
    {
      heading: "Understanding the ensaimada: types and what to order",
      business_ids: [],
      body: "The ensaimada comes in two main forms. The **ensaimada llisa** (plain) is the everyday version — a simple spiral of light, flaky dough with icing sugar, eaten for breakfast with coffee or hot chocolate. The larger, filled **ensaimada de cabell d'àngel** is stuffed with a sweet pumpkin-strand jam (angel hair), and there are also versions filled with cream (nata), chocolate or, at fiesta time, topped with sobrassada and other savoury Mallorcan ingredients.\n\nA key thing to know: authentic ensaimadas are made with pork lard (saïm), which is what gives them their texture, so they are not suitable for vegetarians or anyone avoiding pork — some inland forns make everything with lard and have no alternative. The big round boxed ensaimadas are the ones sold as gifts to take home; if you want one of these, order ahead at a busy forn, as they sell out. For a casual taste, a single-serving plain ensaimada with coffee is the classic local breakfast.",
    },
    {
      heading: "Are the airport ensaimadas worth it?",
      business_ids: [],
      body: "You'll see stacks of the distinctive octagonal ensaimada boxes at Palma Airport, and they're a genuine local product rather than a tourist trap — the round boxed ensaimada is precisely the format Mallorcans buy to give as a gift or bring to the mainland, so taking one home is an authentic thing to do. They travel well in the box and are designed for exactly this.\n\nThat said, an ensaimada from a good traditional forn, bought fresh that morning, will almost always beat an airport one on quality and freshness. If you have time, buy from one of the bakeries above the day you fly and carry it in its box as hand luggage; if you're rushed, the airport version is a reasonable fallback and still a real ensaimada. Either way, it's best eaten within a day or two, as they're at their best fresh.",
    },
  ],
  faqs: [
    { question: "Where can I buy the best ensaimada in Mallorca?", answer: "In Palma, Ca'n Joan de s'Aigo is the famous historic café for an ensaimada with hot chocolate, while traditional forns like Fornet de la Soca (formerly Forn des Teatre) and Forn de La Glòria are the picks if you want the pastry itself. Many locals rate the inland ovens even higher — Forn Sant Francesc in Inca is repeatedly called the best on the island. The large boxed ensaimadas sell out early, so order ahead." },
    { question: "What is the best ensaimada to take home on the plane?", answer: "The large round ensaimada in its distinctive octagonal box is the traditional gift format and travels well as hand luggage. Buy one fresh from a good bakery the day you fly — order ahead at a busy forn like Forn Sant Francesc in Inca or Fornet de la Soca in Palma, as the big ones often sell out by late morning. The boxed ensaimadas sold at Palma Airport are a genuine local product and a reasonable fallback if you're short on time." },
    { question: "What is the difference between types of ensaimada?", answer: "The ensaimada llisa is the plain, everyday version — a light spiral of lard-enriched dough with icing sugar. The larger ensaimada de cabell d'àngel is filled with sweet pumpkin-strand jam, and there are also versions with cream, chocolate or savoury toppings like sobrassada at fiesta time. All authentic ensaimadas are made with pork lard (saïm), which gives them their texture but means they aren't suitable for vegetarians or those avoiding pork." },
    { question: "Are airport ensaimadas in Mallorca any good?", answer: "The ensaimadas boxed for sale at Palma Airport are a genuine traditional product, not a tourist gimmick — the round boxed ensaimada is exactly the format Mallorcans buy as a gift to take to the mainland. They're a reasonable option if you're rushed, but an ensaimada bought fresh that morning from a good traditional forn will usually be better on quality and freshness. They're best eaten within a day or two." },
  ],
  seo: {
    title: "Best Bakeries in Mallorca 2026: Where to Buy Ensaimadas",
    description: "Where to buy the best ensaimada in Mallorca: Ca'n Joan de s'Aigo, traditional Palma forns and the inland ovens of Inca and Sineu, plus the types explained.",
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
