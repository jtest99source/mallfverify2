// scripts/import-guide-palmanova-magaluf-couples.mjs
// EN + DE. Anchored on proprietary DB data (2026-07-24 inventory: Palmanova 86
// and Magaluf 83 verified businesses with 100+ reviews; category mix; Palmanova
// restaurant price medians n=21). Ratings/review counts quoted from our DB.
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

const HOTEL_IDS = [
  "google-ChIJTyaP_9GOlxIR5ji5VWxeZ_Y", // Elba Sunset Mallorca Thalasso Spa
  "google-ChIJfUBWPrOOlxIRawwyIrgR6l0", // Aparthotel Ponent Mar
  "google-ChIJ3bFmCLOOlxIRK0b-2YpowSU", // FERGUS Club Palmanova Park
  "google-ChIJBZX6hy6JlxIRfJteFoygFbI"  // INNSiDE by Meliá Wave Calviá
];
const FOOD_EVENING_IDS = [
  "google-ChIJNbg9NDSJlxIRXOk46GAcpIo", // Tandoori Night
  "google-ChIJBRktOuaJlxIRLMacoGcq2mE", // Iroko Mallorca
  "google-ChIJVVXhejaJlxIRTqICJwNRTWA", // Max Garden
  "google-ChIJuUDaozKJlxIR7YjdxiQHNNg", // Restaurante El Mundo
  "google-ChIJoQ9HsDWJlxIRaMonmVB4qVE", // Il Chiringo
  "google-ChIJy9SgQGSJlxIRHUrpaT4grgk", // Barbuda Beach
  "google-ChIJ1z-oWDKJlxIR3cgvlO-794U", // Papis Live Music
  "google-ChIJE3CvBTKJlxIRFtXthxZF_Qc"  // Finnegan's
];
const ACTIVITY_IDS = [
  "google-ChIJd_NUQiaJlxIRZsPKyq1HjcQ", // Pirates Adventure
  "google-ChIJr9dYIc2OlxIRqSAxf-bQUwA", // Big Blue Diving
  "google-ChIJczI1HYWWlxIRl79aFIR9R6M", // Golf Fantasia
  "google-ChIJ77Wj5C2JlxIRjlAGxSfPCAo"  // Katmandu Park
];

const en = {
  id: "en-palmanova-magaluf-couples-worth-it",
  slug: "palmanova-magaluf-couples-worth-it",
  locale: "en",
  title: "Palmanova & Magaluf for Couples: Worth It in 2026?",
  excerpt:
    "The honest answer for couples eyeing the southwest: what Palmanova and Magaluf are actually like, backed by 169 verified businesses and real review data.",
  intro:
    "Short answer: **Palmanova, yes — comfortably.** Magaluf, it depends entirely on which hundred metres you're standing in. The two resorts share a stretch of coast in Calvià, southwest Mallorca, connected by a seafront promenade — and they get lumped together by reputation far more than the data justifies. On Mallorca Verified we track **86 businesses in Palmanova and 83 in Magaluf** with at least 100 Google reviews each, and the mix tells the real story: Magaluf's inventory leans hard into bars and clubs (29 of its 83), while Palmanova's is built on restaurants and hotels (49 of its 86). This guide gives couples the honest split — where to stay, where to eat, what the evenings look like beyond the strip, and what it costs — using our verified ratings, not the 2010s reputation.",
  sections: [
    {
      heading: "Palmanova vs Magaluf: what the data says about the difference",
      body:
        "The reputations are twenty years old; the business mix is current. Of Magaluf's 83 verified businesses with 100+ reviews, **29 are bars or nightlife venues** — around one in three. That's the strip, and in July it is exactly what you imagine. Palmanova next door runs on a different economy: **30 restaurants and 19 hotels** against just 16 bars and clubs. Same bay system, different customer.\n\nWhat surprises most first-time visitors: the quality floor in both resorts is genuinely high. Palmanova's top-rated restaurant, **Tandoori Night**, holds 4.8★ across more than 2,400 reviews — numbers most of Palma would take. Even in Magaluf, the standouts aren't clubs: **Pizzería Los Dos Hermanos** holds 4.9★, Irish music pub **Finnegan's** 4.8★, and the dinner-show **Pirates Adventure** 4.8★ across more than 4,600 reviews. The strip is real, but it's a few streets — not the postcode.\n\nFor couples the practical geography matters more than the branding: Palmanova's three beaches are broad, sandy and calm, the promenade walk to Magaluf takes around 20 minutes if you want the noise for one evening, and Palma is 20–35 minutes away for city days — see [where to stay in Mallorca](/en/guides/best-areas-stay-mallorca) for how the southwest compares with other bases.",
      business_ids: []
    },
    {
      heading: "Where couples actually stay",
      body:
        "The southwest's hotel stock is dense, so ratings separate the field fast. In Palmanova, the **Elba Sunset Mallorca Thalasso Spa** is the couples' flagship on our data — 4.5★ across more than 2,500 reviews, with the thalasso spa doing the heavy lifting on the \"actually relaxing\" front. **Aparthotel Ponent Mar** (4.6★) is the strongest apartment-style option for couples who want a kitchen and more space, and **FERGUS Club Palmanova Park** (4.5★) holds the all-round resort corner. On the Magaluf side of the line, **INNSiDE by Meliá Wave Calviá** (4.2★) is the design-led modern pick — the kind of place that exists precisely because the area's customer base is broadening.\n\nBooking logic for couples here: the front line between Palmanova's Son Maties beach and Torrenova is the sweet spot — beach at the door, restaurant density around you, and the strip far enough that you visit it rather than sleep on it. For adults-only alternatives across the island, our [adults-only hotels guide](/en/guides/hoteles-adults-only-mallorca) covers the wider field.",
      business_ids: HOTEL_IDS
    },
    {
      heading: "Eating, beach clubs and evenings that aren't the strip",
      body:
        "Dinner in Palmanova runs **€20–30 per person at the median** across the 21 verified restaurants with price estimates — identical to the island median, which undercuts the \"resort mark-up\" assumption. The names worth knowing: **Tandoori Night** (4.8★, the southwest's benchmark Indian), **Iroko Mallorca** (4.7★) and **Max Garden** (4.7★) for terrace dinners, and **Restaurante El Mundo** in Magaluf (4.6★, 2,000+ reviews) proving the party town can cook.\n\nDaytime, the beach club tier here is more relaxed than glossy: **Il Chiringo** is Palmanova's crowd favourite at 4.5★ across nearly 3,000 reviews, and **Barbuda Beach** (4.6★) is the calmer, couples-leaning alternative. Evenings without entering the strip: **Papis Live Music** (4.5★) for live sets over dinner, **Finnegan's** in Magaluf (4.8★) for a proper Irish music pub night, and **Pirates Adventure** as the one big show worth planning around — book at least a week ahead in peak season. Browse the full local field on the [Palmanova restaurant rankings](/en/areas/palmanova/restaurants) and [Magaluf rankings](/en/areas/magaluf/restaurants).",
      business_ids: FOOD_EVENING_IDS
    },
    {
      heading: "Verified Picks for a southwest stay",
      body:
        "The activity layer that rounds out a couples' week here — every pick verified through real Google data with at least 100 reviews.",
      business_ids: ACTIVITY_IDS
    }
  ],
  faqs: [
    {
      question: "Is Palmanova good for couples?",
      answer:
        "Yes — comfortably. Palmanova's verified business mix is built on restaurants (30) and hotels (19) rather than nightlife (6 venues), its three sandy beaches are calm, and dinner runs €20–30 per person at the median across our 21 verified restaurants with price data — the same as the island median. The couples' flagship hotels on our data are the Elba Sunset Mallorca Thalasso Spa (4.5★, 2,500+ reviews) and Aparthotel Ponent Mar (4.6★). The Magaluf strip is a 20-minute promenade walk away — close enough for one loud evening, far enough to sleep."
    },
    {
      question: "What's the actual difference between Palmanova and Magaluf?",
      answer:
        "They're adjacent bays in Calvià connected by a seafront promenade, but their economies differ measurably. Of Magaluf's 83 verified businesses with 100+ reviews on Mallorca Verified, 29 are bars or nightlife venues — about one in three. Palmanova's 86 lean the other way: 30 restaurants and 19 hotels against 16 bars and clubs. In short: Magaluf hosts the strip and the party infrastructure; Palmanova is the quieter beach-resort neighbour where most couples and families base themselves."
    },
    {
      question: "Is Magaluf only for young party crowds?",
      answer:
        "The strip is — the rest of Magaluf less so than its reputation suggests. Its highest-rated verified businesses aren't clubs: Pizzería Los Dos Hermanos holds 4.9★, the Irish music pub Finnegan's 4.8★, the dinner-show Pirates Adventure 4.8★ across 4,600+ reviews, and Restaurante El Mundo 4.6★. Katmandu Park (4.3★, 6,000+ reviews) is a family and rainy-day standby. If you stay on the Palmanova side and dip into Magaluf for a show or a pub night, the party never has to find you."
    },
    {
      question: "Is Palmanova expensive?",
      answer:
        "No more than Mallorca overall. Across the 21 verified Palmanova restaurants with price estimates in our data, dinner lands at €20–30 per person at the median — exactly the island-wide figure from our 1,401-restaurant dataset. Hotels span from resort packages to apartment-style stays like Aparthotel Ponent Mar, and the beach itself, like every beach on Mallorca, is free. The optional layer — beach club daybeds, boat trips — is where budgets stretch, same as everywhere on the island."
    }
  ],
  seo: {
    title: "Palmanova & Magaluf for Couples — Worth It in 2026? | Mallorca Verified",
    description:
      "Palmanova vs Magaluf for couples: verified hotels, restaurants and beach clubs, real prices and the honest difference — data from 169 verified businesses."
  }
};

const de = {
  id: "de-palmanova-magaluf-fuer-paare",
  slug: "palmanova-magaluf-fuer-paare",
  locale: "de",
  title: "Palmanova & Magaluf für Paare: Lohnt sich das 2026?",
  excerpt:
    "Die ehrliche Antwort für Paare mit Blick auf den Südwesten: Wie Palmanova und Magaluf wirklich sind — belegt mit 169 geprüften Betrieben und echten Bewertungsdaten.",
  intro:
    "Kurze Antwort: **Palmanova — ja, ohne Bauchschmerzen.** Magaluf — hängt komplett davon ab, auf welchen hundert Metern Sie stehen. Die beiden Orte teilen sich einen Küstenabschnitt in Calvià im Südwesten Mallorcas, verbunden durch eine Strandpromenade — und werden vom Ruf her weit stärker in einen Topf geworfen, als die Daten hergeben. Auf Mallorca Verified führen wir **86 Betriebe in Palmanova und 83 in Magaluf** mit jeweils mindestens 100 Google-Rezensionen, und die Mischung erzählt die wahre Geschichte: Magalufs Angebot lehnt sich stark an Bars und Clubs an (29 von 83), während Palmanova auf Restaurants und Hotels gebaut ist (49 von 86). Dieser Guide liefert Paaren die ehrliche Trennlinie — wo wohnen, wo essen, wie die Abende jenseits des Party-Strips aussehen und was es kostet. Auf Basis unserer geprüften Bewertungen, nicht des Rufs aus den 2010ern.",
  sections: [
    {
      heading: "Palmanova vs. Magaluf: Was die Daten über den Unterschied sagen",
      body:
        "Der Ruf ist zwanzig Jahre alt; die Betriebsstruktur ist aktuell. Von Magalufs 83 geprüften Betrieben mit über 100 Rezensionen sind **29 Bars oder Nightlife-Venues** — etwa jeder dritte. Das ist der Strip, und im Juli ist er genau das, was Sie sich vorstellen. Palmanova nebenan lebt von einer anderen Ökonomie: **30 Restaurants und 19 Hotels** gegenüber nur 16 Bars und Clubs. Gleiche Bucht, anderes Publikum.\n\nWas Erstbesucher am meisten überrascht: Das Qualitätsniveau ist in beiden Orten erstaunlich hoch. Palmanovas bestbewertetes Restaurant, **Tandoori Night**, hält 4,8★ bei über 2.400 Rezensionen — Zahlen, die auch in Palma bestehen würden. Selbst in Magaluf sind die Spitzenreiter keine Clubs: **Pizzería Los Dos Hermanos** hält 4,9★, der irische Musik-Pub **Finnegan's** 4,8★, die Dinner-Show **Pirates Adventure** 4,8★ bei über 4.600 Rezensionen. Der Strip existiert — aber er ist ein paar Straßen, nicht die Postleitzahl.\n\nFür Paare zählt die praktische Geografie mehr als das Etikett: Palmanovas drei Strände sind breit, sandig und ruhig, der Promenadenweg nach Magaluf dauert rund 20 Minuten — falls Sie den Trubel für einen Abend wollen — und Palma ist für Stadttage 20–35 Minuten entfernt. Wie der Südwesten im Vergleich zu anderen Basen abschneidet, steht in [Wo auf Mallorca wohnen](/de/guides/best-areas-stay-mallorca).",
      business_ids: []
    },
    {
      heading: "Wo Paare wirklich wohnen",
      body:
        "Das Hotelangebot im Südwesten ist dicht — die Bewertungen sortieren das Feld schnell. In Palmanova ist das **Elba Sunset Mallorca Thalasso Spa** nach unseren Daten das Paar-Flaggschiff: 4,5★ bei über 2.500 Rezensionen, und das Thalasso-Spa erledigt den Teil mit der echten Entspannung. Das **Aparthotel Ponent Mar** (4,6★) ist die stärkste Apartment-Option für Paare, die Küche und Platz wollen, und der **FERGUS Club Palmanova Park** (4,5★) deckt die klassische Resort-Ecke ab. Auf der Magaluf-Seite ist das **INNSiDE by Meliá Wave Calviá** (4,2★) die designorientierte moderne Wahl — ein Haus, das es genau deshalb gibt, weil sich das Publikum der Gegend verbreitert.\n\nBuchungslogik für Paare: Die erste Linie zwischen Palmanovas Strand Son Maties und Torrenova ist der Sweet Spot — Strand vor der Tür, Restaurantdichte drumherum, und der Strip weit genug weg, dass man ihn besucht statt neben ihm zu schlafen. Adults-only-Alternativen auf der ganzen Insel sammelt der [Adults-only-Hotel-Guide](/de/guides/hoteles-adults-only-mallorca).",
      business_ids: HOTEL_IDS
    },
    {
      heading: "Essen, Beach Clubs und Abende abseits des Strips",
      body:
        "Das Abendessen in Palmanova liegt im Median bei **20–30 € pro Person** über die 21 geprüften Restaurants mit Preisschätzung — identisch mit dem Inselmedian, was die Annahme vom \"Resort-Aufschlag\" sauber widerlegt. Die Namen, die man kennen sollte: **Tandoori Night** (4,8★, der Inder-Maßstab des Südwestens), **Iroko Mallorca** (4,7★) und **Max Garden** (4,7★) für Terrassen-Abende, dazu **Restaurante El Mundo** in Magaluf (4,6★, über 2.000 Rezensionen) als Beweis, dass die Partystadt kochen kann.\n\nTagsüber ist die Beach-Club-Ebene hier eher entspannt als glamourös: **Il Chiringo** ist Palmanovas Publikumsliebling mit 4,5★ bei fast 3.000 Rezensionen, **Barbuda Beach** (4,6★) die ruhigere, paar-freundlichere Alternative. Abende ohne Strip: **Papis Live Music** (4,5★) für Live-Musik zum Essen, **Finnegan's** in Magaluf (4,8★) für einen echten Irish-Pub-Abend, und **Pirates Adventure** als die eine große Show, um die man plant — in der Hochsaison mindestens eine Woche vorher buchen. Das komplette lokale Feld zeigen die [Palmanova-Rankings](/de/areas/palmanova/restaurants) und [Magaluf-Rankings](/de/areas/magaluf/restaurants).",
      business_ids: FOOD_EVENING_IDS
    },
    {
      heading: "Verified Picks für den Südwesten",
      body:
        "Die Aktivitäten-Ebene, die eine Paar-Woche hier abrundet — jeder Pick über echte Google-Daten geprüft, mindestens 100 Rezensionen.",
      business_ids: ACTIVITY_IDS
    }
  ],
  faqs: [
    {
      question: "Ist Palmanova gut für Paare?",
      answer:
        "Ja — ohne Einschränkung. Palmanovas geprüfte Betriebsstruktur basiert auf Restaurants (30) und Hotels (19) statt Nightlife (6 Venues), die drei Sandstrände sind ruhig, und das Abendessen liegt im Median bei 20–30 € pro Person über unsere 21 geprüften Restaurants mit Preisdaten — gleichauf mit dem Inselmedian. Die Paar-Flaggschiffe nach unseren Daten: Elba Sunset Mallorca Thalasso Spa (4,5★, über 2.500 Rezensionen) und Aparthotel Ponent Mar (4,6★). Der Magaluf-Strip liegt 20 Promenadenminuten entfernt — nah genug für einen lauten Abend, weit genug zum Schlafen."
    },
    {
      question: "Was ist der Unterschied zwischen Palmanova und Magaluf?",
      answer:
        "Es sind benachbarte Buchten in Calvià, verbunden durch eine Strandpromenade — aber ihre Ökonomien unterscheiden sich messbar. Von Magalufs 83 geprüften Betrieben mit über 100 Rezensionen auf Mallorca Verified sind 29 Bars oder Nightlife-Venues — rund ein Drittel. Palmanovas 86 lehnen in die andere Richtung: 30 Restaurants und 19 Hotels gegenüber 16 Bars und Clubs. Kurz: Magaluf trägt den Strip und die Party-Infrastruktur; Palmanova ist der ruhigere Strandort nebenan, in dem die meisten Paare und Familien wohnen."
    },
    {
      question: "Ist Magaluf nur Party?",
      answer:
        "Der Strip schon — der Rest von Magaluf weniger, als der Ruf vermuten lässt. Die bestbewerteten geprüften Betriebe sind keine Clubs: Pizzería Los Dos Hermanos hält 4,9★, der irische Musik-Pub Finnegan's 4,8★, die Dinner-Show Pirates Adventure 4,8★ bei über 4.600 Rezensionen, das Restaurante El Mundo 4,6★. Der Katmandu Park (4,3★, über 6.000 Rezensionen) ist der Familien- und Regentage-Klassiker. Wer auf der Palmanova-Seite wohnt und für eine Show oder einen Pub-Abend nach Magaluf hinüberläuft, wird von der Party nie gefunden."
    },
    {
      question: "Ist Palmanova teuer?",
      answer:
        "Nicht teurer als Mallorca insgesamt. Über die 21 geprüften Palmanova-Restaurants mit Preisschätzung liegt das Abendessen im Median bei 20–30 € pro Person — exakt der Inselwert aus unserem Datensatz von 1.401 Restaurants. Die Hotels reichen vom Resort-Paket bis zur Apartment-Option wie dem Aparthotel Ponent Mar, und der Strand ist — wie jeder Strand auf Mallorca — gratis. Teuer wird nur die optionale Schicht: Beach-Club-Liegen, Bootsausflüge — wie überall auf der Insel."
    }
  ],
  seo: {
    title: "Palmanova & Magaluf für Paare — lohnt sich das 2026? | Mallorca Verified",
    description:
      "Palmanova oder Magaluf für Paare? Geprüfte Hotels, Restaurants und Beach Clubs, echte Preise und der ehrliche Unterschied — Daten aus 169 geprüften Betrieben."
  }
};

for (const g of [en, de]) {
  const guide = {
    ...g,
    status: "published",
    source: "editorial",
    is_featured: false,
    hero_image_url: null,
    updated_at: "2026-07-24",
    created_at: new Date().toISOString(),
    imported_at: new Date().toISOString()
  };
  const { data: existing } = await sb.from("guides").select("id").eq("slug", g.slug).eq("locale", g.locale).maybeSingle();
  if (existing) { console.log(`Ya existe ${g.locale}/${g.slug}`); continue; }
  const { error } = await sb.from("guides").insert(guide);
  if (error) throw error;
  console.log(`Publicada ${g.locale}/${g.slug}: "${g.title}"`);
}
