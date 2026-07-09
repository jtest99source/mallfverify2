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

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-pollensa-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-pollensa-2026",
  locale: "de",
  title: "Die besten Restaurants in Pollença 2026",
  excerpt: "Wo Sie in Pollença essen, der Kulturstadt im Norden Mallorcas — die wirklich guten Tische rund um die Plaça Major und die Altstadt gegenüber den Strandrestaurants unten im Hafen.",
  intro: "Pollença liegt etwa 55 km nördlich von Palma am östlichen Ende der Serra de Tramuntana, eine Stadt, die ihren mallorquinischen Charakter bewahrt hat, statt sich dem Resort-Tourismus zu ergeben, am bekanntesten für die **365 Stufen des Calvari** (eine für jeden Tag des Jahres), die von nahe der **Plaça Major** hinaufführen, und für ihren **Sonntagsmarkt**, einen der größten der Insel. Etwas Wichtiges, das man vor der Wahl des Essensortes verstehen sollte: Die im Landesinneren gelegene Altstadt von **Pollença** und der am Meer liegende **Port de Pollença** sind 6 km voneinander entfernt und haben recht unterschiedliche Restaurantszenen — die Altstadt tendiert zu Plätzen, Cellers und mallorquinischer Küche, der Hafen zum Essen an der Strandpromenade. Dieser Leitfaden trennt die beiden und weist darauf hin, welche Orte wirklich gut sind und welche von einer erstklassigen Lage am Platz leben.",
  sections: [
    {
      heading: "Altstadt: rund um die Plaça Major",
      business_ids: [IDS.ilGiardino, IDS.laPlaceta],
      body: "Das Herz des Essens in der Altstadt ist die **Plaça Major**, der baumbeschattete Hauptplatz, überragt von der Kirche Nostra Senyora dels Àngels, gesäumt von Café- und Restaurantterrassen, die sich an Sonntagvormittagen nach dem Markt füllen. Direkt am Platz ist **Il Giardino** (4,5 Sterne, ~555 Bewertungen) ein alteingesessener Italiener, den Rezensenten für seine zentrale Lage zum Leutebeobachten, aufmerksamen Service und Pasta schätzen, auch wenn einige anmerken, dass die erstklassige Lage mit erstklassigen Preisen und kleinen Zusatzkosten fürs Brot einhergeht. Es ist die verlässliche Wahl am Platz für ein entspanntes Abendessen mit Blick auf den vorüberziehenden Abend.\n\nEinen kurzen Weg vom Platz entfernt liegt **La Placeta** (4,5 Sterne, ~600 Bewertungen) an einer ruhigeren Dorfecke und erhält durchweg Lob für Grillfleisch, Spanferkel, Paella und mallorquinischen Mandelkuchen, wobei mehrere Rezensenten es als die beste Mahlzeit ihres Aufenthalts bezeichnen. Direkt neben dem Hauptplatz statt genau auf ihm zu essen bedeutet oft besseres Preis-Leistungs-Verhältnis und ein lokaleres Gefühl, es lohnt sich also, ein paar Straßen hinauszugehen.",
    },
    {
      heading: "Altstadt: traditionelle mallorquinische Küche",
      business_ids: [IDS.elMoli, IDS.laParra],
      body: "Für wirklich traditionelles mallorquinisches Essen stechen zwei Cellers heraus. **Restaurant Celler El Molí** (4,5 Sterne, ~1.000 Bewertungen) ist ein lokales Bistro, das ein festes Drei-Gänge-Mittagsmenü aus einfachen, gut umgesetzten mallorquinischen Gerichten mit täglich wechselnder Karte serviert, und es ist ausgezeichnetes Preis-Leistungs-Verhältnis — aber es ist nur mittags geöffnet und klein, eine Vorausbuchung ist also wirklich nötig, da Rezensenten berichten, dass bis 14 Uhr jeder Tisch belegt ist. Etwas außerhalb des Stadtzentrums ist **Celler La Parra** (4,6 Sterne, ~3.450 Bewertungen) ein von vier Generationen familiengeführtes Restaurant, das seinen eigenen Wein macht und alles über einem Holzgrill kocht, gelobt für Lamm, Spanferkel und hausgemachte Desserts — eine starke Wahl für ein volles mallorquinisches Erlebnis, und Reservierungen sind angesichts seiner Beliebtheit praktisch unerlässlich.\n\nZwischen den beiden ist El Molí die Wahl für ein günstiges traditionelles Mittagessen in der Altstadt, während La Parra das Ziel für ein holzgegrilltes mallorquinisches Abendessen mit dem eigenen Wein der Stadt ist. Beide belohnen eine Vorausbuchung.",
    },
    {
      heading: "Altstadt: modern und leger",
      business_ids: [IDS.laFonda, IDS.anima],
      body: "Für etwas Zeitgenössischeres ist **Restaurant La Fonda de l'Aigua** (4,7 Sterne, ~800 Bewertungen) eine angesehene moderne mediterrane Adresse, gelobt für frische, durchdacht präsentierte Gerichte wie Ceviche und Rosmarinkartoffeln, in gemütlichem, kinderfreundlichem Ambiente — auch wenn manche Rezensenten anmerken, dass der Service langsam und die Preise etwas hoch sein können, es eignet sich also für eine entspannte, gemächliche Mahlzeit statt eines schnellen Happens.\n\nFür einen legeren Tagesstopp ist **Anima e Farina** (4,9 Sterne, ~495 Bewertungen) eine kleine Focacceria und ein Café, das Rezensenten immer wieder für ausgezeichnete hausgemachte Focaccia (darunter eine mit Sobrassada, der lokalen streichfähigen Wurst), guten italienischen Kaffee und hausgemachte Kuchen hervorheben. Es ist ideal für ein hochwertiges Mittagessen oder eine Pause am Vormittag statt eines Abendessens im Sitzen, und seine hohe Bewertung spiegelt wider, wie durchweg gut es bewertet wird.",
    },
    {
      heading: "Port de Pollença: Essen an der Strandpromenade",
      business_ids: [IDS.pescador, IDS.bellavista, IDS.vista, IDS.idilico],
      body: "Unten im Hafen, 6 km von der Altstadt, verlagert sich die Szene zu Strandrestaurants entlang der Bucht. **Ca'n Pescador** (4,6 Sterne, ~3.500 Bewertungen) ist ein alteingesessenes Fischrestaurant am Strand, das frischen Fisch und Paella in entspanntem Ambiente serviert, beliebt und allgemein gut angesehen — auch wenn, wie bei vielen volumenstarken Strandadressen, einige Rezensenten finden, die Paella sei für das Gebotene teuer, es lohnt sich also, die Erwartungen beim Preis im Zaum zu halten. Für eine kleinere, höher bewertete Option wird **Restaurant Ca'n Bella-vista** (4,8 Sterne) am Passeig d'Anglada Camarasa für Paella, Meerblick und freundlichen Service zu vernünftigen Preisen gelobt.\n\n**Vista Restaurant** (4,8 Sterne, ~470 Bewertungen) ist eine neuere, gut bewertete Ganztagsadresse direkt hinter dem Strand mit einer breiten Karte von Brunch über Pasta bis Fisch und Steaks, und **Idilico Beach House** (4,4 Sterne) ist eine entspannte, familienfreundliche Wahl am Strand, geschätzt für seine Paella und die Lage. Für den Hafen ist der Kompromiss vertraut: Die Aussicht ist der Reiz, wählen Sie also die besser bewerteten Tische und erwarten Sie keine Altstadtpreise.",
    },
    {
      heading: "Buchung, Saison und das Festival",
      business_ids: [],
      body: "Eine Buchung lohnt sich im Sommer in ganz Pollença und ist an den beliebtesten Tischen unerlässlich — die traditionellen Cellers (El Molí, La Parra) füllen sich schnell, und die reinen Mittagsadressen können am frühen Nachmittag ausgebucht sein. Viele Altstadtrestaurants schließen einen Tag unter der Woche oder öffnen nur mittags, prüfen Sie also die Öffnungszeiten, bevor Sie hingehen, besonders außerhalb der Hauptsaison, wenn die Zeiten reduziert sind.\n\nEine konkrete Sache zum Einplanen: das **Festival de Pollença**, das internationale Festival für klassische Musik der Stadt, das an den Nächten im Juli und August im Kreuzgang des Klosters Sant Domingo stattfindet und 2026 seine 65. Ausgabe feiert. An Konzertabenden ist die Altstadt belebter und die Restaurants im Zentrum füllen sich früher, wenn Sie also vor oder nach einem Konzert essen, buchen Sie vor und planen Sie Zeit ein. Dasselbe gilt während des großen Stadtfests **La Patrona** Anfang August.",
    },
    {
      heading: "Altstadt oder Hafen — was man wählen sollte",
      business_ids: [],
      body: "Wenn Sie traditionelle mallorquinische Küche, Charakter und Kultur wollen, essen Sie in der **Altstadt**: die Cellers für holzgegrilltes Fleisch und lokalen Wein, die Plätze für ein entspanntes Abendessen und die legeren Adressen für ein Mittagessen nach dem Aufstieg des Calvari oder dem Bummel über den Sonntagsmarkt. Wenn Sie mit Blick aufs Meer essen wollen, gehen Sie zum **Port de Pollença** und akzeptieren Sie, dass Sie teils für die Aussicht zahlen, und wählen Sie entsprechend die besser bewerteten Tische an der Strandpromenade.\n\nDie gute Nachricht: Sie sind nur 6 km voneinander entfernt und durch einen häufigen Bus verbunden, sodass Sie sich nicht für Ihren ganzen Aufenthalt festlegen müssen — machen Sie an einem Tag ein traditionelles Celler-Mittagessen in der Stadt und an einem anderen ein Fischabendessen an der Strandpromenade im Hafen. Für die meisten Besucher liefert die Altstadt die unverwechselbarere Pollença-Mahlzeit, mit dem Hafen als Wahl für einen Abend am Strand.",
    },
  ],
  faqs: [
    { question: "Was sind die besten Restaurants in Pollença?", answer: "In der Altstadt sind Celler La Parra und Restaurant Celler El Molí die herausragenden für traditionelle mallorquinische Küche, La Placeta und Il Giardino sind verlässlich rund um die Plaça Major, und La Fonda de l'Aigua ist die moderne mediterrane Wahl. Unten im Port de Pollença sind Ca'n Pescador und Ca'n Bella-vista gut bewertete Adressen an der Strandpromenade. Eine Vorausbuchung ist im Sommer ratsam und an den beliebten Cellers unerlässlich." },
    { question: "Wo sollte ich in Pollença essen — in der Altstadt oder im Hafen?", answer: "Die im Landesinneren gelegene Altstadt (Pollença) ist besser für traditionelles mallorquinisches Essen, Cellers, Plätze und Charakter, während der Port de Pollença, 6 km entfernt, dort ist, wo die Fischrestaurants an der Strandpromenade liegen. Sie sind durch einen häufigen Bus verbunden, sodass Sie über einen Aufenthalt beides machen können — an einem Tag ein Celler in der Stadt, an einem anderen ein Abendessen am Strand im Hafen. Für die unverwechselbarste Pollença-Mahlzeit gewinnt meist die Altstadt." },
    { question: "Gibt es gutes traditionelles mallorquinisches Essen in Pollença?", answer: "Ja. Restaurant Celler El Molí serviert ein ausgezeichnetes, preiswertes tägliches Mittagsmenü mit traditionellen mallorquinischen Gerichten (nur mittags, vorher buchen), und Celler La Parra, ein von vier Generationen geführtes Familienrestaurant knapp außerhalb des Zentrums, kocht Lamm, Spanferkel und mehr über einem Holzgrill und macht seinen eigenen Wein. Beide gehören zu den besten Orten der Insel für eine echte mallorquinische Mahlzeit, und eine Buchung ist in der Saison praktisch unerlässlich." },
    { question: "Muss man in Pollença im Sommer Restaurants buchen?", answer: "Für die beliebten Orte ja — die traditionellen Cellers und die reinen Mittagsadressen füllen sich schnell, manchmal sind sie am frühen Nachmittag ausgebucht. Eine Buchung ist besonders wichtig während des Pollença-Musikfestivals im Juli und August und des La-Patrona-Fests Anfang August, wenn die Altstadt belebt ist und die Restaurants sich früher füllen. Viele Orte schließen zudem einen Tag unter der Woche, prüfen Sie also die Öffnungszeiten, bevor Sie hingehen." },
  ],
  seo: {
    title: "Die besten Restaurants in Pollença 2026 | Mallorca Verified",
    description: "Wo Sie in Pollença essen: traditionelle Cellers und Plätze in der Altstadt, Fisch an der Strandpromenade im Port de Pollença. Ehrliche Tipps, Preise und Buchungshinweise.",
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
