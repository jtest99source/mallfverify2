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
  hammam:   "google-ChIJMX-nYFOSlxIRMKRzTuMuW9w",
  anaya:    "google-ChIJZ83K5DCTlxIRwWXCwdOvsyE",
  phothong: "google-ChIJlc868vmTlxIRlceW_V-sx8E",
  jasmine:  "google-ChIJf9h9LHCSlxIRnrk_SA92mgw",
  kotcha:   "google-ChIJLXMdlYmTlxIR0hXQUpQcBwQ",
  japhead:  "google-ChIJb2tff3KTlxIRWFmGBFzqfBY",
  nura:     "google-ChIJ9fY7O1qJlxIRHAC4g57xr_Y",
  mentnat:  "google-ChIJzxIXZMfFlxIRbB5GHogPqcU",
  wsPalma:  "google-ChIJ2YzBUJaXlxIR793Lx5lB9Zg",
  wsPins:   "google-ChIJ-ZP4lAM_lhIR8S_NijfXW2c",
  wsComa:   "google-ChIJZQ7_mv9BlhIRVLXJeiTfg0Y",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-spa-days-outside-hotels-mallorca-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-spa-days-outside-hotels-mallorca-2026",
  locale: "de",
  title: "Die besten Spa-Tage auf Mallorca außerhalb von Hotelspas 2026",
  excerpt: "Für einen richtigen Spa-Tag auf Mallorca müssen Sie kein Fünf-Sterne-Hotelgast sein. Die besten unabhängigen Spas, Hammams und Massagezentren — mit ehrlichen Preisen.",
  intro: "Ein Spa-Tag auf Mallorca muss nicht bedeuten, Fünf-Sterne-Hotelpreise zu zahlen oder Hotelgast zu sein. Die Insel hat ein starkes Angebot an unabhängigen Spas, Hammams und Massagezentren — die meisten in Palma konzentriert, mit guten Optionen im Südwesten, im Inselinneren und im Osten —, wo eine 60-minütige Massage meist um die 50–70 € kostet, deutlich unter dem, was ein Hotel-Spa-Tagespaket üblicherweise kostet. Dieser Leitfaden zeigt die besten für alle offenen Optionen (nicht nur für Hotelgäste) nach Gebiet, von einem Hammam im maurischen Stil bis zu Thai-Massagestudios, in denen die Therapeutinnen in Thailand ausgebildet wurden, und ist ehrlich dabei, welche vollständig unabhängig sind und welche für alle offene Spa-Zentren sind, die sich in einem Hotel befinden.",
  sections: [
    {
      heading: "Palma: der Hammam und die herausragenden Massagestudios",
      business_ids: [IDS.hammam, IDS.anaya],
      body: "Palma hat die dichteste und beste Auswahl an unabhängigen Spas. Für einen vollen Spa-Rundgang statt nur einer Massage ist **Hammam Al Ándalus** in der Carrer de Costa i Llobera (4,5 Sterne, ~1.300 Bewertungen) der Star — ein Badehaus im maurischen Stil mit warmen Thermalbecken, einem Dampfbad und schöner Architektur, wo Sie einen Baderundgang mit optionalem Peeling und optionaler Massage buchen. Rezensenten bewerten es durchweg als ausgezeichnetes Preis-Leistungs-Verhältnis und echtes Entspannungserlebnis, und es ist die Wahl für Paare, die ein gemeinsames Baderitual statt einer klinischen Massage wollen.\n\nFür Massage im Speziellen ist **Anaya Massage & Spa** nahe dem Zentrum (4,9 Sterne) ein Premium-Spa, gelobt für gekonnte Deep-Tissue- und Entspannungsbehandlungen in schönen, ruhigen Räumen, mit einfacher Buchung über WhatsApp. Diese beiden verankern Palmas unabhängige Szene — Hammam Al Ándalus für das Thermal-Rundgang-Erlebnis, Anaya für eine ernsthafte, ergebnisorientierte Massage.",
    },
    {
      heading: "Palma: authentische Thai-Massage",
      business_ids: [IDS.phothong, IDS.jasmine, IDS.kotcha],
      body: "Palma hat mehrere echte Thai-Massagestudios, in denen, wie Rezensenten immer wieder bestätigen, die Therapeutinnen in Thailand ausgebildet wurden — ein anderes, festeres Erlebnis als eine Spa-Entspannungsmassage. **Pho Thong Thai Spa** in Santa Catalina (4,8 Sterne, ~200 Bewertungen) gilt weithin als eines der besten, wobei Rezensenten, die selbst in Thailand Massagen hatten, es für starken Druck und Technik als das Echte bezeichnen. **Jasmine Thai Massage** nahe dem Hafen an der Avinguda de Joan Miró (4,8 Sterne) ist eine weitere hoch bewertete Option, gelobt für geschickte Therapeutinnen, die die richtigen Muskeln ansprechen, mit Tee und thailändischen Süßigkeiten zum Abschluss.\n\nFür ein kleineres, intimeres Thai-Studio bietet **Kotchakorn Thai Massage** (5,0 Sterne) einen etwas sanfteren Stil, den Rezensenten schätzen, und eignet sich gut für Paare, die Sitzungen nebeneinander buchen. Alle sind ohne Termin zugänglich, aber gut besucht, eine Vorausbuchung ist also ratsam, besonders im Sommer.",
    },
    {
      heading: "Palma: etwas anderes — Japanisches Head Spa",
      business_ids: [IDS.japhead],
      body: "Für eine Behandlung jenseits der Standardmassage ist das **Japanese Head Spa Mallorca** nahe dem Zentrum (4,5 Sterne, ~145 Bewertungen) auf das japanische Head-Spa-Ritual spezialisiert — eine Kopfhaut- und Haarbehandlung kombiniert mit einer entspannenden Kopf- und Nackenmassage. Rezensenten heben die geschickten Therapeutinnen und die tief entspannende Kopfhautarbeit hervor, auch wenn ein paar anmerken, dass die Behandlungen für den Preis kurz wirken können, prüfen Sie also beim Buchen genau, was Ihr Paket beinhaltet.\n\nEs ist ein Nischen-, aber wirklich anderes Spa-Erlebnis, gut, wenn Sie die üblichen Körpermassagen schon gemacht haben und etwas Neues wollen, oder wenn Kopfhautverspannung und Stressabbau Ihre Priorität sind. Wie bei den Thai-Studios buchen Sie vor und bestätigen Sie die Behandlungsdauer und was enthalten ist, damit die Erwartungen passen.",
    },
    {
      heading: "Südwesten und Inselinneres: Santa Ponsa und Inca",
      business_ids: [IDS.nura, IDS.mentnat],
      body: "Wenn Sie in den belebten Ferienorten des Südwestens wohnen und nicht nach Palma fahren wollen, ist **Spa Nura** in Santa Ponsa (4,7 Sterne, ~120 Bewertungen) ein gut geführtes unabhängiges Tagesspa. Rezensenten beschreiben einen kleinen, aber komfortablen Raum mit Jacuzzi, Kaltwasserbecken und zwei Saunen, dazu gute Massagen, manchmal mit einem Glas Cava zum Abschluss — ein richtiger kleiner Spa-Rundgang statt nur eines Behandlungsraums. Da es kompakt ist, hilft es, einen ruhigeren Termin zu buchen, und es ist eine praktische unabhängige Option für alle rund um Santa Ponsa, Palmanova oder Magaluf.\n\nIm Inselinneren in Inca ist **Mentnature** (auch als Masaje Mallorca / Terapias Naturales gelistet, 4,8 Sterne, ~240 Bewertungen) ein angesehenes Therapiezentrum mit Fokus auf Massage statt eines vollen Nass-Spa-Rundgangs, gelobt für maßgeschneiderte Deep-Tissue- und Sportmassagen und Fußreflexzonenmassage. Es eignet sich für alle im Inselinneren oder im Norden, die eine wirklich gute Behandlung gegen Muskelverspannung oder zur Regeneration wollen statt Becken und Saunen — beachten Sie, dass es auf Werktage ausgerichtet ist und am Wochenende schließt.",
    },
    {
      heading: "Für alle offen: die Mallorca-Wellness-Spa-Zentren",
      business_ids: [IDS.wsPalma, IDS.wsPins, IDS.wsComa],
      body: "Gesondert kennenswert sind die **Mallorca Wellness Spa**-Zentren — eine Spa-Kette, deren Filialen sich in Hotels befinden, aber als eigene Spas betrieben werden und für Nicht-Gäste offen sind, sodass Sie ein Tagesspa oder eine Behandlung buchen können, ohne dort zu übernachten. Sie sind eine nützliche Option für Gebiete, in denen unabhängige Spas dünner gesät sind. Die Filiale **Playa de Palma** (4,7 Sterne, ~530 Bewertungen) ist die volumenstärkste, mit Pool, Dampfbad, Sauna, Eisbad und Tagesticket-Zusatzoptionen. An der Ostküste decken die Filiale **Costa dels Pins** im Eurotel Punta Rotja (4,8 Sterne, ~330 Bewertungen) und die Filiale **Sa Coma** (4,9 Sterne, ~250 Bewertungen) die Ferienregionen Cala Millor und Levante gut ab, beide stark bewertet für ihre Massagen und Paarbehandlungen.\n\nSie sind die Wahl, wenn Sie im Osten oder an der Playa de Palma wohnen und einen richtigen Nass-Spa-Rundgang (Pool, Sauna, Dampfbad) plus Massage an einem Ort wollen statt eines einzelnen Behandlungsraums. Da sie spa-fokussiert und für alle offen sind, bieten sie Ihnen die Hotel-Spa-Einrichtungen, ohne dass Sie Gast sein müssen — bestätigen Sie nur die Tageszugangs- und Behandlungspreise direkt, da die Pakete je nach Filiale variieren.",
    },
    {
      heading: "Preise, Buchung und was man wissen sollte",
      business_ids: [],
      body: "Als grober Richtwert liegt eine 60-minütige Massage in einem unabhängigen Spa auf Mallorca meist um die 50–70 €, in der Regel weniger als das Äquivalent in einem Fünf-Sterne-Hotelspa, und Hammam- oder Thermal-Rundgang-Sitzungen sind für das Erlebnis oft überraschend preiswert. Tagespakete, die einen Baderundgang mit Peeling und Massage kombinieren, kosten mehr, unterbieten aber meist immer noch die Hotel-Tagesspa-Preise. Die Preise variieren je nach Behandlung und Dauer, bestätigen Sie sie also direkt beim Buchen.\n\nEinige praktische Hinweise. Buchen Sie im Sommer vor, da die besten Spas und Thai-Studios schnell voll sind, besonders für Paar-Termine und Wochenendzeiten. Viele unabhängige Orte nehmen Buchungen unkompliziert über WhatsApp entgegen. Bestätigen Sie genau, was ein Paket beinhaltet — Dauer, ob Pool- und Saunazugang enthalten ist, und etwaige Zusätze —, da die häufigste Beschwerde der Rezensenten über Spas ist, dass Behandlungen kürzer wirken als erwartet. Die vollständig unabhängigen Optionen konzentrieren sich in Palma, während die für alle offenen Mallorca-Wellness-Spa-Zentren die Abdeckung auf die Playa de Palma und die Ostküste ausdehnen.",
    },
  ],
  faqs: [
    { question: "Wo kann man auf Mallorca einen Spa-Tag machen, ohne im Hotel zu übernachten?", answer: "Palma hat die besten unabhängigen Nicht-Hotel-Optionen: Hammam Al Ándalus für einen Thermal-Baderundgang im maurischen Stil, Anaya Massage & Spa für Premium-Massage und mehrere authentische Thai-Studios wie Pho Thong Thai und Jasmine Thai. Außerhalb Palmas sind Spa Nura in Santa Ponsa und Mentnature in Inca starke unabhängige Optionen, und die Mallorca-Wellness-Spa-Zentren (für Nicht-Gäste offen) decken die Playa de Palma und die Ostküste ab. Die meisten nehmen Laufkundschaft, aber Vorausbuchen ist ratsam." },
    { question: "Was kostet eine Massage auf Mallorca außerhalb eines Hotels?", answer: "Eine 60-minütige Massage in einem unabhängigen Spa auf Mallorca kostet meist um die 50–70 €, in der Regel weniger als die entsprechende Behandlung in einem Fünf-Sterne-Hotelspa. Hammam-Baderundgänge und Tagespakete, die Peeling und Massage kombinieren, kosten mehr, sind aber für das Erlebnis oft preiswert. Die Preise variieren je nach Behandlung und Dauer, bestätigen Sie sie also direkt und prüfen Sie, ob Pool- und Saunazugang im Preis enthalten ist." },
    { question: "Was ist das beste Paar-Spa auf Mallorca außerhalb von Hotels?", answer: "Hammam Al Ándalus in Palma ist ideal für Paare, die ein gemeinsames Erlebnis wollen, mit einem Thermal-Baderundgang, den Sie zusammen genießen, plus optionalen Massagen nebeneinander. Die Thai-Studios wie Kotchakorn und Jasmine bieten ebenfalls Paarmassagen im selben Raum an, Spa Nura in Santa Ponsa eignet sich für Paare im Südwesten, und die Mallorca-Wellness-Spa-Zentren sind für Paarbehandlungen an der Ostküste und Playa de Palma gut bewertet. Buchen Sie Paar-Termine vor, da sie im Sommer schnell weg sind." },
    { question: "Muss man ein Spa auf Mallorca im Voraus buchen?", answer: "Im Sommer ja — die besten unabhängigen Spas und Thai-Massagestudios sind schnell voll, besonders für Paar-Termine und Wochenendzeiten, eine Vorausbuchung wird also dringend empfohlen. Viele Orte, darunter Anaya und die Thai-Studios, nehmen Buchungen unkompliziert über WhatsApp entgegen. Außerhalb der Saison können Sie oft ohne Termin kommen, aber es lohnt sich trotzdem, vorher anzurufen, um die Verfügbarkeit und genau zu bestätigen, was Ihre gewählte Behandlung beinhaltet." },
  ],
  seo: {
    title: "Die besten Spa-Tage auf Mallorca außerhalb von Hotelspas 2026",
    description: "Die besten unabhängigen Nicht-Hotel-Spas auf Mallorca: Hammam Al Ándalus, authentische Thai-Massage in Palma, dazu Santa Ponsa, Inca und für alle offene Spa-Zentren. Ehrliche Preise.",
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
