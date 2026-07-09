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

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-sunset-spots-mallorca-2026").eq("locale", "en").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-sunset-spots-mallorca-2026",
  locale: "en",
  title: "Best Places to Watch the Sunset in Mallorca 2026",
  excerpt: "Mallorca's best sunsets are on its west and southwest coasts — from the famous pierced rock at Sa Foradada to quiet Sant Elm facing Dragonera island.",
  intro: "Because the sun sets in the west, Mallorca's best sunset spots are concentrated along its west and southwest coasts — the Serra de Tramuntana cliffs and the Andratx-to-Santa Ponça stretch — rather than the north or east. That's worth knowing before you drive an hour to the wrong place: Cap de Formentor, for instance, is spectacular but faces north and is really a sunrise and panorama spot, not a sunset-over-the-sea one. This guide covers the genuinely west-facing places, ranked loosely by how much effort they take, from drive-up viewpoints with a bar to hikes that reward you with solitude. In summer the sun sets roughly between 9 and 9:30 PM, in winter closer to 5:30 PM, so always check the day's exact time before setting out.",
  sections: [
    {
      heading: "Sa Foradada: the famous one (Deià)",
      business_ids: [],
      body: "**Sa Foradada** — also written Na Foradada — is the island's most photographed sunset, a long rocky peninsula on the Son Marroig estate between Valldemossa and Deià with a natural hole pierced through the rock that the setting sun shines through. There's a viewpoint right by the road and a bar-restaurant (Na Foradada) on the cliff, plus a longer walking trail down toward the rock itself for those who want to escape the crowd on the main platform.\n\nIt's about 45 minutes from Palma via the Ma-1110 toward Deià. The catch is its fame: it gets very crowded at sunset and parking along the road is limited and fills early, so arrive well before the sun drops. For the classic Mallorca sunset photo this is the one, but if you want quiet, it isn't it — walk the trail past the main viewpoint to find more space, or pick one of the calmer spots below.",
    },
    {
      heading: "Mirador de Ses Barques: drive-up with a terrace (Sóller)",
      business_ids: [],
      body: "For a sunset with far fewer people and the comfort of a table, **Mirador de Ses Barques** sits at 462 metres on the Ma-10 mountain road between Sóller and Sa Calobra. It has a small free viewpoint and a restaurant with a panoramic terrace serving traditional Mallorcan food, and it's easily reached by car with parking right there — no hike required.\n\nUnlike Sa Foradada, it's set back above the sea rather than on the cliff edge, giving a wide, layered view over Port de Sóller and the coast rather than the sun dropping straight into the water. It's a good choice if you want an unhurried aperitivo-with-a-view rather than a scramble for a photo spot, and it works beautifully across the whole day, not just at sunset. Being on the Sóller side, it pairs naturally with a day in the Sóller valley.",
    },
    {
      heading: "Sant Elm and Sa Dragonera: the southwest classic",
      business_ids: [],
      body: "At the island's southwest tip, **Sant Elm** (San Telmo) is a small, relaxed seaside village facing the protected island of **Sa Dragonera**, and it's one of the most rewarding sunsets on Mallorca. The distinctive thing here is that the sun doesn't drop straight into the open sea — it sets behind Dragonera's long dragon-back silhouette, throwing the island into shadow against a pink-and-orange sky. About 40 minutes from Palma via Andratx, it has a small central car park (around €4) and a seafront lined with bars and traditional restaurants, so you can make an evening of it.\n\nFor a no-effort version, simply walk the seafront promenade and pick a spot or a terrace. For more, the hike up to the ruined **La Trapa** monastery (about an hour from the village, moderate, good footwear needed) trades the crowds for solitude and an even wider view over Dragonera — but plan the descent, as you'll likely be coming down in the dark, so bring a light. Sant Elm suits couples and anyone wanting the calm, authentic side of the island.",
    },
    {
      heading: "Easy viewpoints near Palma: Santa Ponça and Cala Blava",
      business_ids: [],
      body: "If you don't want a long drive, two spots close to Palma deliver a proper west-facing sunset. The **Mirador de ses Illes Malgrats** near Santa Ponça is about 25 minutes from the city via the Ma-1, well signposted with parking nearby and a short walk to the cliffs, where the sun sets into the sea between the little Malgrats islets. There are no bars right at the viewpoint, so bring your own drinks — as most locals do.\n\nSouth of Palma toward Llucmajor, the **Cala Blava** cliffs and the quiet **Mirador des Balconet** (also called Pujador des Frares) are an under-the-radar option for watching the sun go down in peace, away from the busier Tramuntana spots. Both of these are the practical picks for a spontaneous evening when you don't want to commit to an hour-plus drive into the mountains.",
    },
    {
      heading: "Beaches and beach bars for a barefoot sunset",
      business_ids: [],
      body: "For sunset with your feet in the sand, the south coast's west-facing beaches are the move. **Es Trenc**, about 45 minutes from Palma, is a long undeveloped stretch that faces west, making it a beautiful barefoot sunset once the day crowds thin out. Nearer the city, the beaches around **Santa Ponça** and the southwest coves catch the evening light well and are easy to reach.\n\nIf you'd rather have a cocktail in hand, the southwest has beach clubs and cliff bars built around the view — the Port d'Andratx and Cala Llamp area is the classic strip for a sunset drink or dinner by the sea, and Port de Sóller's seafront works well on the Tramuntana side. Palma itself also has rooftop and seafront lounge bars if you want an urban sunset without leaving the city. These trade the wild scenery of the miradors for comfort and a drinks menu, which is exactly right for some evenings.",
    },
    {
      heading: "A note on Cap de Formentor",
      business_ids: [],
      body: "Cap de Formentor comes up on every sunset list, so it's worth being clear: the peninsula and its lighthouse at Mallorca's northern tip are genuinely spectacular, but the setting faces north and east, so it's celebrated for sunrise and for its panoramic cliff views rather than for the sun setting into the sea. If dramatic scenery is what you're after, it delivers at any time of day — but for a true sunset-over-water, the west-coast spots above are the better call.\n\nAccess also makes Formentor an awkward sunset trip in summer: from roughly June to September, private cars are only allowed to the cape early in the morning (until around 8 AM), after which you must take a shuttle bus from Port de Pollença, and it's about 1h30 from Palma. In winter the road is open all day and far quieter. If you do go, treat it as a scenery-and-sunrise destination rather than a sunset one.",
    },
  ],
  faqs: [
    { question: "Where is the best place to watch the sunset in Mallorca?", answer: "Sa Foradada near Deià is the most famous, a pierced rock on the west coast that the setting sun shines through, though it gets very crowded. For something calmer, Sant Elm in the southwest offers a beautiful sunset behind Sa Dragonera island, and Mirador de Ses Barques near Sóller gives a wide Tramuntana view from a terrace with far fewer people. All face west or southwest, which is where Mallorca's best sunsets are." },
    { question: "What is the best sunset spot in Mallorca without a car?", answer: "Your easiest car-free options are around Palma and its seafront — the Paseo Marítimo, rooftop bars and the western beaches reachable by EMT bus — and Port de Sóller, which you can reach by the vintage train and tram and which has a west-facing bay with seafront bars. The dramatic Tramuntana miradors like Sa Foradada and Ses Barques really need a car, as public transport to them is limited, especially for the late return after dark." },
    { question: "What is the best sunset spot in Mallorca for couples?", answer: "Sant Elm is the standout for couples — a quiet seaside village facing Sa Dragonera, with waterfront restaurants where you can have dinner as the sun sets behind the island. Mirador de Ses Barques near Sóller is another romantic, uncrowded choice with a terrace restaurant, and the beach clubs around Port d'Andratx and Cala Llamp are ideal if you want cocktails and a sea view rather than a viewpoint scramble." },
    { question: "What time is sunset in Mallorca and when should I arrive?", answer: "Sunset in Mallorca falls roughly between 9 and 9:30 PM in midsummer and around 5:30 PM in midwinter, so always check the exact time for your date. Arrive 30–45 minutes early to park and find a spot, especially at popular places like Sa Foradada where parking fills fast. Bring a layer, as it cools quickly after sundown, and a light if you're walking back from a viewpoint or hike in the dark." },
  ],
  seo: {
    title: "Best Places to Watch the Sunset in Mallorca 2026 | Mallorca Verified",
    description: "Mallorca's best sunset spots on the west and southwest coasts: Sa Foradada, Ses Barques, Sant Elm and Sa Dragonera, easy miradors near Palma, plus beach bars.",
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
