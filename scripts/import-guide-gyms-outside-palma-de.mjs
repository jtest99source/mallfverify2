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
  thunder:   "google-ChIJixvdUBYtlhIRQadwuPyOKg4",
  anytime:   "google-ChIJgUUfv7fFlxIRP_XiIOVahG0",
  areafit:   "google-ChIJJUgQRarFlxIR6T8QuSO5u5g",
  choice:    "google-ChIJlV4WB3CJlxIRWOdYm1Hk5Rs",
  shambhala: "google-ChIJ__8PrL6JlxIRT7BfVTXBNPM",
  c23:       "google-ChIJ3YIfWACJlxIRu8u0LJwOmYI",
  mantinia:  "google-ChIJu-LCu18tlhIRI34DXfr1XC4",
  summit:    "google-ChIJq4nNKoUslhIRe94h7zpQJw8",
  natur:     "google-ChIJe8NFHs7plxIR6lWwrL2VME0",
  espai6:    "google-ChIJJcwTdF3plxIRuoUa5iVeo10",
  totpilates:"google-ChIJ5Y9m5rDolxIR3tCNo9dBkGk",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-gyms-fitness-studios-outside-palma-mallorca-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-gyms-fitness-studios-outside-palma-mallorca-2026",
  locale: "de",
  title: "Die besten Fitnessstudios außerhalb von Palma, Mallorca 2026",
  excerpt: "Von 24-Stunden-Gyms in Inca über CrossFit in Santa Ponsa bis Yoga in Sóller — wo Sie außerhalb Palmas trainieren, nach Region, mit ehrlichen Preisen.",
  intro: "Man muss nicht in Palma sein, um auf Mallorca gut zu trainieren: Die Resortorte und Inlandszentren haben eigene etablierte Fitnessstudios, CrossFit-Boxen und Yoga-Studios, und Tagespässe für Urlauber sind üblich. Ein Tagespass liegt meist bei etwa 10–15 €, während Wochenpässe je nach Studio stark variieren, es lohnt sich also immer, die aktuellen Preise direkt beim jeweiligen Studio zu prüfen. Dieser Leitfaden ist nach Region gegliedert — Norden, Zentrum und Osten sowie Südwesten — und setzt auf die größeren, gut bewerteten Studios, weist aber auch auf die kleineren Boutique-Studios für Kurse oder persönliches Coaching hin. Bewertungen und Rezensionszahlen stammen zum Zeitpunkt der Erstellung von Google.",
  sections: [
    {
      heading: "Norden: Alcúdia und Pollença",
      business_ids: [IDS.thunder, IDS.mantinia, IDS.summit],
      body: "Der Norden hat die dichteste Ansammlung urlaubsfreundlicher Fitnessstudios, rund um die große Urlauberzahl in Alcúdia. **Thunder Fitness Club** in Alcúdia hat 4,6 Sterne aus rund 100 Google-Bewertungen, in denen Besucher es als kleines, aber gut ausgestattetes kommerzielles Studio mit einer breiten Auswahl an Geräten und einem freundlichen Inhaber beschreiben; einige merken an, dass es nachmittags voll werden kann. Die veröffentlichten Preise sind ein Tagespass für 15 € und ein Wochenpass für 60 €, mit 20 € Anmeldegebühr und 60 € Monatsbeitrag (die Anmeldegebühr fällt auch für den Monatsbeitrag an), und es öffnet werktags ab 6:30 Uhr, mit letztem Einlass 30 Minuten vor Schließung. Alcúdia hat weitere kommerzielle Studios mit ähnlicher Bewertung in der Nähe, es lohnt sich also, ein paar zu vergleichen, wenn Sie in der Gegend wohnen.\n\nFür kleinere, persönlichere Studios wird **Mantinia Gym** in Alcúdia (5,0 Sterne, ~36 Bewertungen) von Rezensenten als altmodisches, gut ausgestattetes Studio mit Boxeinrichtung beschrieben, bei dem Besucher Tages- und Wochenpässe unkompliziert über WhatsApp vereinbarten. **Summit Community Training** in der Carrer de Pollèntia (4,7 Sterne) wird als Studio für Functional Training und persönliches Coaching mit Community-Gefühl bewertet — Rezensenten loben das Coaching, ein Rezensent merkt aber an, dass es sich eher für angeleitetes Training als für freies Heben eignet. In Pollença beschreiben Rezensenten **Vital Esport** eher als kursbasierte Box denn als frei zugängliches Studio, mit oft von Gruppenkursen belegter Fläche.",
    },
    {
      heading: "Zentrum und Osten: Inca und Manacor",
      business_ids: [IDS.anytime, IDS.areafit],
      body: "Inca, das Inlandszentrum der Insel, hat die beste Option für alle, die zu ungewöhnlichen Zeiten trainieren: **Anytime Fitness Inca** ist rund um die Uhr an sieben Tagen die Woche geöffnet, mit App-Zugang. Es hat 4,6 Sterne aus rund 190 Bewertungen, in denen Besucher es als sauber und modern mit hilfsbereitem Personal und guter Geräteauswahl beschreiben, und mehrere erwähnen rund 35 € für einen Wochenpass. Ebenfalls in Inca wird **Areafit Inca** (4,7 Sterne, ~370 Bewertungen) als große, neuere Anlage mit breiter Geräte- und Kursauswahl bewertet — eine der höchsten Rezensionszahlen aller Studios außerhalb Palmas.\n\nIm Osten hat Manacor neuere kommerzielle Studios, die Rezensenten als sauber und gut ausgestattet mit modernen Geräten beschreiben, meist geöffnet von etwa 6 bis 23 Uhr. Diese Stadtstudios bedienen Anwohner statt Touristen, weshalb Rezensenten sie ruhiger als Resortstudios finden; prüfen Sie die aktuellen Preise jedes Studios direkt, da sie variieren.",
    },
    {
      heading: "Südwesten: Santa Ponsa und Calvià",
      business_ids: [IDS.choice, IDS.shambhala, IDS.c23],
      body: "Der Südwesten ist die stärkste Region für Functional Training und CrossFit-Communities. **Choice Training Club** in Santa Ponsa (4,9 Sterne, ~190 Bewertungen) wird als echte Community-Box mit Kraft-, Lauf- und Hyrox-artigem Cross-Training bewertet; Rezensenten loben wiederholt die Coaches, und einer nennt es eine der besten CrossFit-Boxen, in denen er trainiert hat. **Shambhala Gym** in Santa Ponsa (4,8 Sterne, ~70 Bewertungen) wird von Rezensenten als Top-Studio für Laufkundschaft im Ort beschrieben, mit freien Gewichten, Geräten, Boxausrüstung und Ring, und mehrere sagen, der Inhaber begrüße Besucher mit über WhatsApp vereinbarten Tagespässen.\n\nFür CrossFit im Speziellen beschreiben Rezensenten **C23 Athletxs** in Calvià (Bereich Son Bugadelles) als gut geführte Box, in der die Coaches Englisch sprechen und Kurse für Nicht-Spanischsprecher anpassen — mehrere Drop-in-Besucher erwähnen, willkommen geheißen worden zu sein. Es ist neuer, mit bisher weniger Bewertungen. Zusammen decken sie im Südwesten Community-Kurstraining und freies Heben gut ab.",
    },
    {
      heading: "Yoga und Pilates: Sóller und Umgebung",
      business_ids: [IDS.natur, IDS.espai6, IDS.totpilates],
      body: "Wenn Sie lieber Yoga oder Pilates als einen Kraftraum wollen, spielt Sóller weit über seiner Größe. **Natur Yoga Studio** (5,0 Sterne, ~70 Bewertungen) wird für Kurse in einem Obstgarten und in Port de Sóller bewertet, wobei Rezensenten anmerken, dass die Lehrerin Stunden auf Spanisch und Englisch hält, alle Niveaus bedient und private Villa-Kurse anbietet. **S'espai 6 Pilates & Yoga Studio** (4,9 Sterne) wird von Rezensenten als heller Raum mit Bergblick beschrieben, in dem Kurse zweisprachig laufen und für Anfänger geeignet sind.\n\nFür reines Reformer-Pilates ist **Tot Pilates** in Sóller (5,0 Sterne) als voll ausgestattetes Studio mit kleinen, persönlichen Kursen und einer hoch bewerteten Trainerin rezensiert — eine Rezensentin sagt, sie fahre 80 Minuten pro Strecke dafür. Diese kleineren Studios sind kursbasiert und müssen vorab gebucht werden, schreiben Sie also im Voraus, statt einfach aufzutauchen, besonders im Sommer.",
    },
    {
      heading: "Tagespässe, Preise und worauf zu achten ist",
      business_ids: [],
      body: "Für Besucher sind Tages- und Wochenpässe die Norm statt einer Mitgliedschaft. Ein Tagespass liegt meist bei etwa 10–15 € — Thunder Fitness Club in Alcúdia veröffentlicht 15 €, und Rezensenten bei Anytime Fitness Inca erwähnen rund 35 € für eine Woche — aber Wochen- und Monatspreise variieren stark zwischen den Studios, prüfen Sie also immer die aktuellen Preise direkt vor Ort, statt zu schätzen. Einige Studios verlangen zudem eine kleine erstattbare Kaution für eine Zugangskarte oder eine Anmeldegebühr bei Monatsmitgliedschaften.\n\nEinige praktische Hinweise aus dem, was Rezensenten regelmäßig berichten. Nur wenige Studios außerhalb Palmas sind wirklich rund um die Uhr geöffnet (Anytime Fitness Inca ist das klarste); die meisten laufen etwa von 6:30 bis 22 oder 23 Uhr, und mehrere haben einen letzten Einlass vor Schließung. Rezensenten erwähnen oft, Handtuch und Wasser mitzubringen, da kleinere Studios im Sommer heiß werden können. Wenn Sie Kurse wollen (CrossFit, Hyrox, Yoga, Pilates), prüfen Sie den Kursplan und buchen Sie, da Kursslots die Fläche in Community-Boxen und Studios dominieren. Und wenn Englisch wichtig ist, finden Rezensenten die Boxen im Südwesten und die Studios in Sóller am zuverlässigsten zweisprachig. Viele inhabergeführte Studios vereinbaren Pässe über WhatsApp vor dem ersten Besuch.",
    },
  ],
  faqs: [
    { question: "Gibt es außerhalb von Palma auf Mallorca gute Fitnessstudios?", answer: "Ja. Alcúdia im Norden hat kommerzielle Studios wie Thunder Fitness Club (4,6 Sterne), Inca hat das 24-Stunden-Anytime Fitness und das große Areafit (4,7 Sterne, ~370 Bewertungen), und der Südwesten hat gut bewertete CrossFit- und Functional-Training-Boxen wie Choice Training Club (4,9 Sterne) und Shambhala Gym (4,8 Sterne). Die meisten bieten Besuchern Tages- und Wochenpässe, mit Tagespässen meist bei etwa 10–15 €." },
    { question: "Gibt es außerhalb von Palma auf Mallorca ein 24-Stunden-Studio?", answer: "Ja — Anytime Fitness Inca ist rund um die Uhr an sieben Tagen die Woche geöffnet, mit App-Zugang, in der Inlandsstadt Inca. Es hat 4,6 Sterne aus rund 190 Bewertungen, in denen Besucher es als sauber und modern mit guter Geräteauswahl beschreiben. Die meisten anderen Studios außerhalb Palmas laufen eher von etwa 6:30 bis 22 oder 23 Uhr als rund um die Uhr, sodass Inca die klarste 24-Stunden-Option außerhalb der Hauptstadt ist." },
    { question: "Was kostet ein Tagespass fürs Fitnessstudio außerhalb von Palma?", answer: "Ein Tagespass kostet meist etwa 10–15 € — Thunder Fitness Club in Alcúdia veröffentlicht einen Tagespass für 15 € und einen Wochenpass für 60 €, und Rezensenten bei Anytime Fitness Inca erwähnen rund 35 € für eine Woche. Wochen- und Monatspreise variieren erheblich zwischen den Studios, und einige verlangen eine Anmeldegebühr oder eine kleine erstattbare Kartenkaution, prüfen Sie also die aktuellen Preise jedes Studios direkt vorab." },
    { question: "Wo kann man außerhalb von Palma auf Mallorca Yoga oder Pilates machen?", answer: "Sóller ist die beste Basis für Yoga und Pilates außerhalb Palmas. Natur Yoga Studio (5,0 Sterne) hält zweisprachige Kurse in einem Obstgarten und in Port de Sóller, S'espai 6 bietet Yoga und Pilates mit Bergblick, und Tot Pilates ist ein voll ausgestattetes Reformer-Studio mit kleinen, persönlichen Kursen. Alle sind hoch bewertet und kursbasiert, buchen Sie also vorab, besonders im Sommer." },
  ],
  seo: {
    title: "Beste Fitnessstudios außerhalb von Palma Mallorca 2026",
    description: "Fitnessstudios, CrossFit und Yoga außerhalb Palmas nach Region: 24h Anytime Inca, Thunder Fitness Alcúdia, Choice Training Santa Ponsa. Pässe, Preise, Tipps.",
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
