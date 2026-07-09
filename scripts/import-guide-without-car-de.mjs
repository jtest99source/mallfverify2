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

const { data: existing } = await sb.from("guides").select("id").eq("slug", "getting-around-mallorca-without-car-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "getting-around-mallorca-without-car-2026",
  locale: "de",
  title: "Mallorca ohne Auto: Der komplette Leitfaden 2026",
  excerpt: "Mallorcas öffentlicher Nahverkehr ist besser als sein Ruf. TIB-Busse und -Züge sind 2026 für Residenten kostenlos und für Besucher günstig — aber manche Gegenden brauchen weiterhin ein Auto.",
  intro: "Mallorca hat ein wirklich brauchbares Nahverkehrsnetz, und ohne Auto voranzukommen ist für die meisten Städte, Ferienorte und die wichtigsten Sehenswürdigkeiten realistisch — wenn auch nicht für jede versteckte Bucht. Die Insel läuft über zwei verbundene Systeme: das TIB-Netz aus Überlandbussen, Zügen und Metro, das von Palma aus fast jede größere Stadt erreicht, und die EMT-Stadtbusse innerhalb Palmas selbst. Für das ganze Jahr 2026 sind die Überland-TIB-Busse, die SFM-Züge und die Metro für Residenten mit Fahrkarte kostenlos, und selbst für Besucher, die bar zahlen, sind die Fahrpreise niedrig. Dieser Leitfaden zeigt, was einfach ist, was günstig ist und — ehrlich — welche Teile der Insel wirklich ein Auto brauchen.",
  sections: [
    {
      heading: "Die zwei Netze: TIB und EMT",
      business_ids: [],
      body: "Alles dreht sich um die **Estació Intermodal** unter der **Plaça d'Espanya** in Palma, wo Busse, Züge und Metro alle zusammentreffen. **TIB** (Transport de les Illes Balears) betreibt die rot-gelben Überlandbusse, die fast jede größere Stadt erreichen — **Alcúdia**, **Pollença**, **Sóller**, **Manacor**, **Cala d'Or**, **Andratx** — dazu die **SFM**-Züge (nach Inca, Sa Pobla und Manacor) und die **Metro de Palma**. **EMT** betreibt die Stadtbusse innerhalb Palmas, einschließlich der Flughafenlinien.\n\nDie praktische Regel: Der Betreiber zählt mehr als die Liniennummer — ein TIB-Bus für alles außerhalb Palmas, ein EMT-Bus innerhalb. Die Reiseplanung geht am einfachsten über Google Maps, das Live-Abfahrtszeiten für beide zeigt, oder über die offiziellen Seiten und Apps tib.org und emtpalma.cat. Eine virtuelle Version der Fahrkarte fürs Handy wird für die erste Hälfte 2026 erwartet.",
    },
    {
      heading: "Kostenlos fahren 2026 — für Residenten",
      business_ids: [],
      body: "Für das ganze Jahr 2026 ist das Fahren mit **TIB**-Überlandbussen, **SFM**-Zügen und der **Metro de Palma** mit einer **Intermodal-Karte** oder **Single-Karte** (Targeta Única) kostenlos, und das gilt auch für die **EMT**-Stadtbusse in Palma für Karteninhaber. Der wichtige Vorbehalt: Das gilt nur für Residenten. Die Berechtigung erfordert einen Meldenachweis (ein Padrón-Zertifikat), und die Karte wird kostenlos in den TIB-Büros in Palmas Estació Intermodal, Inca, Manacor und Alcúdia sowie im EMT-Büro ausgestellt.\n\nBesucher und Touristen ohne berechtigende Karte zahlen die normalen Barpreise — aber diese sind niedrig, je nach Entfernung meist zwischen etwa 3 € und 13,50 €, und oft rund 40 % günstiger, wenn Sie kontaktlos mit Karte statt bar zahlen. Während das kostenlose Fahren also ein Vorteil für Residenten ist, bleibt der Nahverkehr für alle preiswert.",
    },
    {
      heading: "In Palma unterwegs: EMT-Stadtbusse",
      business_ids: [],
      body: "Innerhalb Palmas brauchen Sie selten mehr als die **EMT**-Stadtbusse, die die Altstadt, die Uferpromenade Passeig Marítim, Portixol, Génova, das Castell de Bellver und die Wohnviertel über mehr als 30 Linien abdecken. Ab 2026 kostet eine einfache Stadtfahrt rund 3 €, mit kontaktloser Karte günstiger, und die Busse fahren tagsüber häufig.\n\nPalma selbst ist zudem sehr fußgängerfreundlich — die Altstadt, die Kathedrale, Santa Catalina und die Uferfront sind alle leicht zu Fuß machbar —, sodass viele Besucher, die in der Stadt wohnen, kaum Nahverkehr nutzen. Für den Flughafen fährt der EMT-Bus **A1** ins Zentrum und der **A2** nach Playa de Palma, beide günstig und häufig, was wir unten behandeln.",
    },
    {
      heading: "Der Flughafen: Busse A1 und A2",
      business_ids: [],
      body: "Der Flughafen Palma (PMI) ist per EMT-Bus gut mit der Stadt verbunden, und das ist weit günstiger als ein Taxi. Der **A1** Aerobús fährt direkt zwischen dem Flughafen und dem Zentrum Palmas (Plaça d'Espanya und Passeig Marítim) für 5 €, in unter 20 Minuten, und er fährt bis in die frühen Morgenstunden — die letzten Abfahrten sind gegen 3:10 Uhr. Der **A2** fährt nach Playa de Palma und S'Arenal, bis etwa 1:15 Uhr. Beide sind flughafenexklusive Linien, wobei der A1 keine Zwischenstopps hat.\n\nFür Ziele außerhalb Palmas fahren saisonale **Aerotib**-Busse direkt vom Flughafen zu den wichtigsten Ferienregionen — dem Norden (Alcúdia, Can Picafort), dem Osten (Manacor, Cala Bona), Playa de Palma und dem Südwesten (Palmanova, Magaluf, Santa Ponça) —, allerdings enden diese früher am Abend, prüfen Sie also die letzte Abfahrt Ihrer Linie. Außerhalb dieser Zeiten sind ein Taxi oder eine Fahrdienst-App der Ausweichweg vom Flughafen.",
    },
    {
      heading: "Der Zug und die Tram von Sóller",
      business_ids: [],
      body: "Das eine mallorquinische Verkehrsmittel, das eine Attraktion für sich ist, ist der **Ferrocarril de Sóller**, ein historischer hölzerner Schmalspurzug von 1912, der von Palma (direkt an der Plaça d'Espanya) nordwärts durch die Tramuntana nach Sóller fährt und mit einer historischen **Tram** hinunter nach Port de Sóller an der Küste verbindet. Es ist eher ein landschaftlicher Tagesausflug als reiner Nahverkehr und entsprechend bepreist: Ein kombiniertes Hin- und Rückfahrticket für Zug und Tram (Palma–Port de Sóller–Palma) kostet 40 € am Schalter oder 32 € online als Rabatt auf bestimmte Abfahrten, je nach Verfügbarkeit. Die Tram allein kostet 10 € pro Strecke, und ein einfaches Zugticket 23 €.\n\nEin nützlicher Tipp: Sie können mit dem landschaftlichen Zug nach Sóller hinausfahren und günstiger und schneller mit dem **Bus 204** von Port de Sóller nach Palma zurückkehren, der etwa 35 Minuten dauert und 4–6 € kostet (und für Residenten mit Intermodal-Karte kostenlos ist). Die Fahrpläne werden im Winter reduziert, prüfen Sie also trendesoller.com vor der Fahrt.",
    },
    {
      heading: "Welche Ferienorte und Gegenden ohne Auto funktionieren",
      business_ids: [],
      body: "Per Direktbus oder Zug von Palma erreichbar und ohne Auto einfach: **Sóller** und **Port de Sóller** (Zug, Tram oder Bus 204); **Alcúdia** und **Port d'Alcúdia** im Norden; **Pollença** und **Port de Pollença**; **Valldemossa** (Direktbus, etwa 30 Minuten); die Inlandsstädte **Inca**, **Sa Pobla** und **Manacor** (SFM-Zug); und die südöstlichen Ferienorte wie **Cala d'Or**. Palma selbst braucht natürlich nichts außer Ihren Füßen und dem gelegentlichen EMT-Bus.\n\nWo Sie ohne Auto wirklich Mühe haben: die abgelegenen Tramuntana-Buchten und Aussichtspunkte (Sa Calobra, Sa Foradada, viele Bergmiradors), die kleineren südlichen und östlichen Calas, die nur über Nebenstraßen erreichbar sind, und alles, was auf seltene saisonale Verbindungen angewiesen ist. Für ein oder zwei Tage davon ist es sinnvoller, nur für diese Tage ein Auto zu mieten oder ein Taxi oder eine Fahrdienst-App zu nutzen, als es mit dem Bus zu erzwingen. Seien Sie bei Ihrer Reiseplanung ehrlich: Ein Strand-und-Städte-Urlaub funktioniert autofrei; ein Bucht-Hopping- oder Tiefgebirgs-Urlaub nicht.",
    },
    {
      heading: "Taxis, Fahrdienst-Apps, Fähren und Fahrräder",
      business_ids: [],
      body: "**Uber** ist auf Mallorca in Betrieb (als UberX), neben lokalen Taxis und Apps, auch wenn zu Stoßzeiten und an abgelegenen Orten die Verfügbarkeit lückenhaft sein kann und es nicht unbedingt günstiger ist als ein normales Taxi. Für den Flughafen und späte Ankünfte sind Taxis mit Taxameter und zuverlässig. Für die Hauptstrecken, die die Busse gut abdecken, müssen Sie sich nicht auf Fahrdienst-Apps verlassen, aber sie sind ein nützlicher Ausweichweg für die Lücken.\n\nFür Tagesausflüge weiter weg fahren Fähren von Palma und anderen Häfen zu den Nachbarinseln, und das **Fahrrad** ist auf Mallorca eine ernsthafte Option — die Insel ist ein Weltziel für Radsport, und Verleih ist weit verbreitet. Fahrräder sind praktisch, um sich innerhalb einer Stadt oder eines Ferienorts und in flacheren Gegenden fortzubewegen, aber um zwischen Städten zu fahren, eignen sie sich angesichts der Entfernungen und des Bergterrains eher für sichere Rennradfahrer als für Gelegenheitsfahrer. Für die meisten autofreien Besucher ist die realistische Mischung: Busse und Züge für Städte, das gelegentliche Taxi oder die Fahrdienst-App für die Lücken und ein Fahrrad für lokale Erkundungen.",
    },
  ],
  faqs: [
    { question: "Kann man sich auf Mallorca ohne Auto fortbewegen?", answer: "Ja, für die meisten Städte, Ferienorte und Hauptsehenswürdigkeiten. Das TIB-Netz aus Überlandbussen und Zügen erreicht von Palma aus Alcúdia, Pollença, Sóller, Manacor, Cala d'Or und mehr, und es ist 2026 für Residenten kostenlos und für Besucher günstig. Palma selbst ist zu Fuß mit EMT-Stadtbussen machbar. Abgelegene Tramuntana-Buchten und viele kleinere Calas brauchen jedoch wirklich ein Auto, sodass ein Strand-und-Städte-Urlaub autofrei funktioniert, ein Bucht-Hopping-Urlaub aber nicht." },
    { question: "Kann man Cap de Formentor ohne Auto besuchen?", answer: "Es ist möglich, aber begrenzt. Im Sommer (etwa Juni bis September) sind Privatfahrzeuge tagsüber an Cap de Formentor beschränkt, stattdessen fährt ein Shuttlebus ab Port de Pollença — in der Saison würden Sie also mit dem Bus nach Port de Pollença und von dort mit dem Shuttle fahren. Außerhalb dieser Beschränkungen gibt es keinen regulären öffentlichen Bus zum Kap selbst, sodass viele autofreie Besucher Formentor über einen organisierten Ausflug oder eine Bootsfahrt ab Port de Pollença oder Alcúdia erreichen." },
    { question: "Ist der öffentliche Nahverkehr auf Mallorca zuverlässig?", answer: "Die wichtigsten TIB-Bus- und Zugstrecken und Palmas EMT-Busse sind zuverlässig und einigermaßen häufig, besonders im Sommer, und 2026 für Residenten kostenlos. Die Einschränkungen sind die Frequenz auf kleineren ländlichen Strecken, reduzierte Winterfahrpläne und frühere letzte Abfahrten, als Sie erwarten könnten — der Flughafenbus A1 fährt bis etwa 3:10 Uhr, aber viele ländliche Busse enden bis zum frühen Abend. Prüfen Sie Live-Zeiten auf Google Maps oder tib.org und planen Sie die letzte Rückfahrt sorgfältig." },
    { question: "Was sind die besten Apps für Busse auf Mallorca?", answer: "Google Maps ist am praktischsten für die Reiseplanung, da es Live-Abfahrtszeiten für TIB- und EMT-Dienste zeigt und Routen kombiniert. Die offizielle Seite und App tib.org decken die Überlandbusse, Züge und Metro ab, und emtpalma.cat deckt Palmas Stadtbusse ab. Für den Sóller-Zug nutzen Sie das offizielle trendesoller.com. Kontaktlos mit Karte zu zahlen ist bei den Bussen oft rund 40 % günstiger als bar." },
  ],
  seo: {
    title: "Mallorca ohne Auto 2026 | Mallorca Verified",
    description: "Mallorca ohne Auto: TIB-Busse und -Züge 2026 für Residenten kostenlos, für Besucher günstig, der Sóller-Zug, Flughafenbusse und welche Gegenden ein Auto brauchen.",
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
