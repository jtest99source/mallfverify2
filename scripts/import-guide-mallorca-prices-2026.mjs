// scripts/import-guide-mallorca-prices-2026.mjs
// EN + DE. Anchored on proprietary DB data (price_estimate medians computed
// 2026-07-24: restaurants n=1401, cafés n=261, beach clubs n=100) plus facts
// already verified in our published guides (que-hacer-en-mallorca 2026-07-03).
// No external unverified claims.
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

const VALUE_PICKS = [
  "google-ChIJAQBA0Q2UlxIRveBtiRewJ9o", // Che!!! Asador argentino
  "google-ChIJB2yswyaTlxIRQB-M7X4ZAxw", // Klüg Burgers
  "google-ChIJSz-yzKctlhIRveupQjk1CVw", // Paso Obligado (Alcúdia)
  "google-ChIJEUmdbl2SlxIRAUgt4EO4dYM", // Jaipur Tandoori
  "google-ChIJw3DBAqCTlxIRbqeIyFO6WCI", // Ca n'Ela Vegan
  "google-ChIJGR_A-6FRlhIRb6pD6C19t_U", // Il Pizzettaro (Cala d'Or)
  "google-ChIJy6TvNQ-7lxIRrTIytDPX5Fs", // Burger Doze (Llucmajor)
  "google-ChIJU93S3VOSlxIRFFVRA4V7hK4"  // Badal Corner
];

const en = {
  id: "en-mallorca-prices-2026",
  slug: "mallorca-prices-2026",
  locale: "en",
  title: "Mallorca Prices 2026: What Things Actually Cost (Real Data)",
  excerpt:
    "Is Mallorca expensive? Real 2026 numbers from 1,401 verified restaurants plus entry prices for the island's main sights — medians, not guesses.",
  intro:
    "Short answer: Mallorca is mid-range by European standards — and the numbers behind that are more interesting than the label. Across the **1,401 verified restaurants** on Mallorca Verified with a published price estimate, the median dinner runs **€20–30 per person**. Cafés and brunch spots sit at €10–20, beach club dining at €20–30 before you touch a sunbed. And the counterintuitive part: **Palma is not more expensive than the rest of the island** — the median across 405 verified Palma restaurants is the same €25 midpoint as Mallorca overall. This guide breaks down what eating out, sights and activities actually cost in 2026, using our own verified data and the entry prices we've already confirmed for the island's main attractions — so you can budget on numbers, not vibes. Prices are indicative medians, not quotes.",
  sections: [
    {
      heading: "Is Mallorca expensive? The honest answer",
      body:
        "It depends what you compare it with — but the data gives a cleaner answer than most blogs. Our method: every business on Mallorca Verified carries real Google review data, and 1,401 restaurants also carry a per-person price estimate. Taking medians across those (July 2026), a normal dinner out lands at **€20–30 per person** — mid-range for Western Europe, clearly above inland Spain, clearly below the Côte d'Azur clichés people arrive braced for.\n\nTwo findings stand out. First, **Palma doesn't carry a capital-city premium**: the 405 verified Palma restaurants in our data show the same €25 median midpoint as the island overall. If your mental model is \"the city will be pricier than the resorts\", Mallorca doesn't behave that way — location inside a resort zone matters more than which town you're in. Second, the spread between zones is smaller than expected: [Port d'Alcúdia](/en/areas/port-d-alcudia/restaurants) and [Palmanova](/en/areas/palmanova/restaurants) both sit on the €20–30 band. Sóller trends a notch higher (€30 midpoint in our smaller sample there) — the Tramuntana postcard tax is real, if modest.\n\nWhere Mallorca does get expensive is the layer on top: beach club daybeds, boat charters and peak-season extras. That's a choice, not a baseline. A couple eating well twice a day can hold €50–60 per person daily on food without trying hard — see the [full restaurant rankings](/en/top/restaurants) for where the ratings actually are.",
      business_ids: []
    },
    {
      heading: "Eating out: what 1,401 verified restaurants actually charge",
      body:
        "The medians from our verified data, July 2026:\n\n| What | Verified places | Typical per person |\n| --- | --- | --- |\n| Restaurant dinner | 1,401 | €20–30 (median midpoint €25) |\n| Café / brunch | 261 | €10–20 |\n| Beach club dining | 100 | €20–30 (food only) |\n\nBy zone, using only zones where we have a meaningful sample: Palma (405 restaurants) €20–30, Port d'Alcúdia (37) €20–30, Palmanova (21) €20–30, Sóller (19) €20–40. The pattern: the island's dining floor is remarkably consistent — what changes between zones is the ceiling.\n\nEating well below €20 is not a compromise here, and the data proves it: **Che!!! Asador argentino** in Palma holds 4.6★ across more than 9,300 reviews at under €20 per person; **Klüg Burgers** (4.8★), **Ca n'Ela Vegan Restaurant** (4.8★) and **Jaipur Tandoori** (4.7★) all do the same in Palma; **Paso Obligado** in Alcúdia (4.9★) and **Il Pizzettaro** in Cala d'Or (4.9★) prove the pattern outside the capital. For how to pay — where cards are universal and where cash still rules — see our [cash or card guide](/en/guides/cash-or-card-mallorca).",
      business_ids: []
    },
    {
      heading: "Sights, activities and the extras that add up",
      body:
        "Entry prices we've verified for the island's headline attractions in 2026: **Castillo de Bellver** €4 (free on Sundays), the **Catedral de Mallorca** around €10, **Cuevas del Drach** €18 adults / €11 children (2–12). The **Tren de Sóller** heritage railway is €30 return from Palma online, or €40 for the combined train-and-tram ticket to Port de Sóller — full logistics in our [Sóller train guide](/en/guides/soller-train-worth-it-guide). Guided half-day outdoor tours (paddleboard, quad, snorkel) run €50–100 per person; organised cave day-tours with transport from Palma cost €45–65; full-day boat excursions start around €150 per person.\n\nThe quiet extra for visitors: the Balearic **ecotax (Ecotasa)** — roughly €4 per person per day at a 4-star hotel, age 16 and up, applied to licensed tourist accommodation only. Residents and private long-term rentals don't pay it.\n\nAnd the honest counterweight: a lot of the best of Mallorca is free. Every beach on the island, the Puerto de Alcúdia waterfront, Bellver on Sundays, old-town Palma on foot. A realistic sightseeing day for two — one paid attraction each, one café stop, one proper dinner — works out around €80–110 for the pair on our medians. For the full activity landscape, see [things to do in Mallorca](/en/guides/que-hacer-en-mallorca).",
      business_ids: []
    },
    {
      heading: "Verified Picks: top-rated meals under €20",
      body:
        "Proof that cheap and excellent coexist here — every place below holds at least 4.6★ on Google with hundreds to thousands of reviews, at €20 per person or less (price estimates from our verified data).",
      business_ids: VALUE_PICKS
    }
  ],
  faqs: [
    {
      question: "Is Mallorca expensive?",
      answer:
        "Mallorca is mid-range for Western Europe. Across 1,401 verified restaurants with price estimates on Mallorca Verified (July 2026), the median dinner costs €20–30 per person; cafés run €10–20 and beach club dining €20–30. Headline sights are moderate — Castillo de Bellver €4, the Cathedral around €10, Cuevas del Drach €18 — and every beach is free. The expensive layer is optional: beach club daybeds, boat charters and peak-season extras. Visitors also pay the Balearic ecotax, roughly €4 per person per day at a 4-star hotel."
    },
    {
      question: "Is Palma more expensive than the rest of Mallorca?",
      answer:
        "No — and our data is unambiguous about it. The 405 verified Palma restaurants with price estimates show the same €25 median midpoint as the island overall (€20–30 per person). Palma does not carry a capital-city premium; zone-to-zone differences on Mallorca are driven more by resort positioning than by being in the city. In our sample, Sóller trends slightly higher (€30 midpoint) while the big resort zones — Port d'Alcúdia, Palmanova — match the island median."
    },
    {
      question: "How much does a meal cost in Mallorca in 2026?",
      answer:
        "Median across 1,401 verified restaurants: €20–30 per person for a restaurant dinner, with the midpoint at €25. A café or brunch stop runs €10–20 and eating at a beach club €20–30 for the food alone. Eating under €20 without sacrificing quality is realistic: several of the island's highest-rated restaurants — Che!!! Asador argentino (4.6★, 9,300+ reviews), Klüg Burgers (4.8★), Paso Obligado in Alcúdia (4.9★) — all sit at or under €20 per person."
    },
    {
      question: "How much should I budget per day in Mallorca?",
      answer:
        "On our verified medians, a realistic sightseeing day for two people — one paid attraction each (€4–18 per adult), a café stop (€10–20 each) and a proper dinner (€20–30 each) — lands around €80–110 for the pair, before accommodation and transport. A single traveller eating two meals out daily holds €50–60 on food alone. Add the ecotax (about €4 per person per day at a 4-star hotel) if you're staying in licensed tourist accommodation; residents and long-term private rentals are exempt."
    }
  ],
  seo: {
    title: "Mallorca Prices 2026: What Things Actually Cost | Mallorca Verified",
    description:
      "Is Mallorca expensive? Median prices from 1,401 verified restaurants, café and beach club costs, attraction entry fees and the ecotax — real 2026 data."
  }
};

const de = {
  id: "de-mallorca-preise-2026",
  slug: "mallorca-preise-2026",
  locale: "de",
  title: "Was kostet Mallorca 2026? Echte Preise aus geprüften Daten",
  excerpt:
    "Ist Mallorca teuer? Echte Zahlen 2026 aus 1.401 geprüften Restaurants plus Eintrittspreise der wichtigsten Sehenswürdigkeiten — Mediane statt Bauchgefühl.",
  intro:
    "Kurze Antwort: Mallorca liegt im europäischen Mittelfeld — und die Zahlen dahinter sind interessanter als das Etikett. Über die **1.401 geprüften Restaurants** auf Mallorca Verified mit Preisschätzung liegt das mittlere Abendessen bei **20–30 € pro Person**. Cafés und Brunch-Lokale bewegen sich bei 10–20 €, Essen im Beach Club bei 20–30 € — noch ohne Liege. Und das Überraschende: **Palma ist nicht teurer als der Rest der Insel** — der Median über 405 geprüfte Palma-Restaurants liegt beim selben Mittelwert von 25 € wie mallorcaweit. Dieser Guide schlüsselt auf, was Essen, Sehenswürdigkeiten und Aktivitäten 2026 wirklich kosten — auf Basis unserer eigenen geprüften Daten und der Eintrittspreise, die wir für die wichtigsten Attraktionen bereits bestätigt haben. Alle Preise sind indikative Mediane, keine Angebote.",
  sections: [
    {
      heading: "Ist Mallorca teuer? Die ehrliche Antwort",
      body:
        "Kommt darauf an, womit man vergleicht — aber die Daten antworten sauberer als die meisten Blogs. Unsere Methode: Jeder Betrieb auf Mallorca Verified basiert auf echten Google-Bewertungsdaten, und 1.401 Restaurants tragen zusätzlich eine Preisschätzung pro Person. Über deren Mediane (Juli 2026) landet ein normales Abendessen bei **20–30 € pro Person** — Mittelfeld für Westeuropa, klar über dem spanischen Binnenland, klar unter den Côte-d'Azur-Klischees, mit denen viele anreisen.\n\nZwei Befunde stechen heraus. Erstens: **Palma verlangt keinen Hauptstadt-Aufschlag** — die 405 geprüften Palma-Restaurants zeigen denselben Median-Mittelwert von 25 € wie die Insel insgesamt. Wer erwartet, dass die Stadt teurer ist als die Ferienorte, liegt auf Mallorca daneben: Die Lage innerhalb einer Resort-Zone wiegt schwerer als die Stadtfrage. Zweitens ist die Spannweite zwischen den Zonen kleiner als gedacht: [Port d'Alcúdia](/de/areas/port-d-alcudia/restaurants) und [Palmanova](/de/areas/palmanova/restaurants) liegen beide im Band von 20–30 €. Sóller tendiert eine Stufe höher (30 € Mittelwert in unserer kleineren Stichprobe) — die Tramuntana-Postkarten-Steuer existiert, bleibt aber moderat.\n\nTeuer wird Mallorca erst in der Schicht darüber: Beach-Club-Liegen, Bootscharter, Hochsaison-Extras. Das ist eine Entscheidung, keine Grundgebühr. Ein Paar, das zweimal täglich gut essen geht, bleibt ohne Anstrengung bei 50–60 € pro Person und Tag fürs Essen — wo die Bewertungen wirklich stehen, zeigt das [komplette Restaurant-Ranking](/de/top/restaurants).",
      business_ids: []
    },
    {
      heading: "Essen gehen: Was 1.401 geprüfte Restaurants wirklich verlangen",
      body:
        "Die Mediane aus unseren geprüften Daten, Juli 2026:\n\n| Was | Geprüfte Betriebe | Typisch pro Person |\n| --- | --- | --- |\n| Abendessen im Restaurant | 1.401 | 20–30 € (Median-Mittelwert 25 €) |\n| Café / Brunch | 261 | 10–20 € |\n| Essen im Beach Club | 100 | 20–30 € (nur Essen) |\n\nNach Zonen — nur dort, wo unsere Stichprobe aussagekräftig ist: Palma (405 Restaurants) 20–30 €, Port d'Alcúdia (37) 20–30 €, Palmanova (21) 20–30 €, Sóller (19) 20–40 €. Das Muster: Der Boden der Insel-Gastronomie ist bemerkenswert konstant — was sich zwischen den Zonen ändert, ist die Decke.\n\nUnter 20 € gut zu essen ist hier kein Kompromiss, und die Daten belegen es: **Che!!! Asador argentino** in Palma hält 4,6★ bei über 9.300 Rezensionen für unter 20 € pro Person; **Klüg Burgers** (4,8★), **Ca n'Ela Vegan Restaurant** (4,8★) und **Jaipur Tandoori** (4,7★) schaffen dasselbe in Palma; **Paso Obligado** in Alcúdia (4,9★) und **Il Pizzettaro** in Cala d'Or (4,9★) beweisen das Muster außerhalb der Hauptstadt. Wo Karte selbstverständlich ist und wo noch Bargeld regiert, steht im [Guide zu Karte oder Bargeld](/de/guides/cash-or-card-mallorca).",
      business_ids: []
    },
    {
      heading: "Sehenswürdigkeiten, Aktivitäten und die Extras, die sich summieren",
      body:
        "Eintrittspreise, die wir für die Top-Attraktionen 2026 bestätigt haben: **Castillo de Bellver** 4 € (sonntags gratis), die **Kathedrale von Palma** rund 10 €, **Cuevas del Drach** 18 € für Erwachsene / 11 € für Kinder (2–12). Der historische **Tren de Sóller** kostet online 30 € hin und zurück ab Palma, das Kombiticket mit Straßenbahn nach Port de Sóller 40 € — die komplette Logistik im [Sóller-Zug-Guide](/de/guides/soller-train-worth-it-guide). Geführte Halbtagestouren (SUP, Quad, Schnorcheln) liegen bei 50–100 € pro Person; organisierte Höhlen-Tagestouren mit Transfer ab Palma bei 45–65 €; ganztägige Bootsausflüge beginnen um 150 € pro Person.\n\nDas stille Extra für Urlauber: die balearische **Übernachtungssteuer (Ecotasa)** — rund 4 € pro Person und Tag im 4-Sterne-Hotel, ab 16 Jahren, nur in lizenzierten touristischen Unterkünften. Residenten und private Langzeitmieten zahlen sie nicht.\n\nUnd das ehrliche Gegengewicht: Vieles vom Besten auf Mallorca ist gratis. Jeder Strand der Insel, die Uferpromenade von Puerto de Alcúdia, Bellver am Sonntag, Palmas Altstadt zu Fuß. Ein realistischer Sightseeing-Tag für zwei — je eine bezahlte Attraktion (4–18 € pro Erwachsenem), ein Café-Stopp, ein richtiges Abendessen — landet nach unseren Medianen bei etwa 80–110 € fürs Paar. Das komplette Aktivitäten-Bild steht in [Was tun auf Mallorca](/de/guides/was-tun-auf-mallorca).",
      business_ids: []
    },
    {
      heading: "Verified Picks: Top-bewertet essen unter 20 €",
      body:
        "Der Beleg, dass günstig und exzellent hier koexistieren — jeder Betrieb unten hält mindestens 4,6★ auf Google bei Hunderten bis Tausenden Rezensionen, für höchstens 20 € pro Person (Preisschätzungen aus unseren geprüften Daten).",
      business_ids: VALUE_PICKS
    }
  ],
  faqs: [
    {
      question: "Ist Mallorca teuer?",
      answer:
        "Mallorca liegt im westeuropäischen Mittelfeld. Über 1.401 geprüfte Restaurants mit Preisschätzung auf Mallorca Verified (Juli 2026) kostet das mittlere Abendessen 20–30 € pro Person; Cafés liegen bei 10–20 €, Essen im Beach Club bei 20–30 €. Die Top-Sehenswürdigkeiten sind moderat — Castillo de Bellver 4 €, Kathedrale rund 10 €, Cuevas del Drach 18 € — und jeder Strand ist gratis. Teuer ist die optionale Schicht: Beach-Club-Liegen, Bootscharter, Hochsaison-Extras. Urlauber zahlen zudem die Ecotasa, rund 4 € pro Person und Tag im 4-Sterne-Hotel."
    },
    {
      question: "Ist Palma teurer als der Rest von Mallorca?",
      answer:
        "Nein — und unsere Daten sind da eindeutig. Die 405 geprüften Palma-Restaurants mit Preisschätzung zeigen denselben Median-Mittelwert von 25 € wie die Insel insgesamt (20–30 € pro Person). Palma verlangt keinen Hauptstadt-Aufschlag; Preisunterschiede auf Mallorca hängen stärker an der Resort-Lage als an der Stadtfrage. In unserer Stichprobe tendiert Sóller etwas höher (30 € Mittelwert), während die großen Ferienzonen — Port d'Alcúdia, Palmanova — den Insel-Median treffen."
    },
    {
      question: "Was kostet ein Essen auf Mallorca 2026?",
      answer:
        "Median über 1.401 geprüfte Restaurants: 20–30 € pro Person für ein Abendessen, Mittelwert 25 €. Ein Café- oder Brunch-Stopp kostet 10–20 €, Essen im Beach Club 20–30 € (ohne Liege). Unter 20 € ohne Qualitätsverlust ist realistisch: Mehrere der bestbewerteten Restaurants der Insel — Che!!! Asador argentino (4,6★, über 9.300 Rezensionen), Klüg Burgers (4,8★), Paso Obligado in Alcúdia (4,9★) — liegen bei höchstens 20 € pro Person."
    },
    {
      question: "Wie viel Budget braucht man pro Tag auf Mallorca?",
      answer:
        "Nach unseren geprüften Medianen landet ein realistischer Sightseeing-Tag für zwei Personen — je eine bezahlte Attraktion (4–18 € pro Erwachsenem), ein Café-Stopp (10–20 € p. P.) und ein richtiges Abendessen (20–30 € p. P.) — bei etwa 80–110 € fürs Paar, vor Unterkunft und Transport. Wer allein reist und zweimal täglich essen geht, bleibt bei 50–60 € pro Tag fürs Essen. Dazu kommt in lizenzierten touristischen Unterkünften die Ecotasa (rund 4 € pro Person und Tag im 4-Sterne-Hotel); Residenten und private Langzeitmieten sind befreit."
    }
  ],
  seo: {
    title: "Was kostet Mallorca 2026? Echte Preise & Daten | Mallorca Verified",
    description:
      "Ist Mallorca teuer? Mediane aus 1.401 geprüften Restaurants, Café- und Beach-Club-Preise, Eintritte der Top-Sehenswürdigkeiten und die Ecotasa — Daten 2026."
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
