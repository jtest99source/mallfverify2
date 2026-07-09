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

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-bakeries-ensaimadas-mallorca-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-bakeries-ensaimadas-mallorca-2026",
  locale: "de",
  title: "Die besten traditionellen Bäckereien auf Mallorca 2026: Wo man Ensaimadas kauft",
  excerpt: "Die Ensaimada ist Mallorcas Wahrzeichen-Gebäck. Wo Sie eine wirklich gute kaufen — von einer Palma-Institution seit dem 18. Jahrhundert bis zu den Öfen im Inselinneren von Inca.",
  intro: "Die Ensaimada ist Mallorcas Wahrzeichen-Gebäck: eine spiralförmig gewundene Schnecke aus dünnem, mit Schweineschmalz angereichertem Teig (saïm bedeutet Schmalz auf Mallorquinisch), mit Puderzucker bestäubt und entweder pur oder gefüllt. Die besten kommen aus traditionellen Holzofen-Bäckereien — forns —, die sie seit Generationen auf dieselbe Art backen, und sie reichen von einem jahrhundertealten Café in Palmas Altstadt bis zu Familienöfen in Inlandsstädten wie Inca und Sineu. Dieser Leitfaden zeigt, wo Sie eine wirklich gute Ensaimada kaufen, den Unterschied zwischen den Sorten und ob die abgepackten am Flughafen sich lohnen — mit Fokus auf die traditionellen Bäckereien, die Einheimische wirklich schätzen.",
  sections: [
    {
      heading: "Die Institution Palmas: Ca'n Joan de s'Aigo",
      business_ids: [IDS.canJoan],
      body: "Der berühmteste Ort, um in Palma eine Ensaimada zu probieren, ist **Ca'n Joan de s'Aigo**, ein Café aus dem frühen 18. Jahrhundert, dessen Stammhaus in der Carrer de Can Sanç 4,6 Sterne aus fast 7.900 Bewertungen hält. Rezensenten beschreiben eine Zeitreise in einen mit Antiquitäten gefüllten Raum, und die klassische Bestellung ist eine Ensaimada mit einer Tasse dicker heißer Schokolade oder das hausgemachte Eis, das der Ort serviert, seit sein Gründer Schnee aus der Tramuntana verwendete, um es herzustellen. Es gibt heute drei Filialen in Palma, alle mit demselben traditionellen Flair.\n\nEs ist ebenso sehr ein Erlebnis wie eine Bäckerei, und Rezensenten warnen, dass es mit Kreuzfahrtgruppen voll wird, gehen Sie also früh oder am frühen Nachmittag. Ein paar merken an, dass der Kaffee gewöhnlich ist und es touristisch sein kann, aber für eine erste Ensaimada in einer stimmungsvollen, wirklich historischen Umgebung ist es die klassische Wahl — und die Preise bleiben trotz der zentralen Lage vernünftig.",
    },
    {
      heading: "Traditionelle Palma-Forns, die einen Umweg wert sind",
      business_ids: [IDS.fornetSoca, IDS.laGloria, IDS.fornFondo],
      body: "Für ein stärker auf die Bäckerei ausgerichtetes Erlebnis stechen drei traditionelle Öfen in Palma heraus. **Fornet de la Soca** an der Plaça de Weyler (4,5 Sterne, ~1.200 Bewertungen) — früher bekannt als das historische Forn des Teatre — ist ein wunderschön gestalteter Forn, für den Rezensenten eigens nach Palma reisen, gelobt für auf der Zunge zergehende pure Ensaimadas und traditionelles herzhaftes Backwerk neben dem Süßen. **Forn de La Glòria** (4,8 Sterne), versteckt in einer engen Gasse, ist eine Holzofen-Bäckerei, die Rezensenten so bodenständig wie nur möglich nennen, wo der Ofen dem Gebäck einen feinen rauchigen Geschmack gibt — ein gut gehütetes Geheimnis für Ensaimadas, Panades und Brot.\n\n**Forn Fondo** in der Carrer Unió (4,4 Sterne) ist eine weitere alteingesessene zentrale Bäckerei, auf die Rezensenten bei der Suche nach Ensaimadas stoßen und die sie dann lieben, mit einer guten Auswahl an Gebäck zu fairen Preisen. Zwischen diesen dreien bekommen Sie das traditionelle, produktbetonte Palma-Bäckereierlebnis statt der belebteren Café-Szene — besser, wenn das Gebäck selbst und nicht die Kulisse der Punkt ist.",
    },
    {
      heading: "Die Öfen im Inselinneren: Inca und Sineu",
      business_ids: [IDS.santFran, IDS.canToni, IDS.canDelante],
      body: "Viele Einheimische werden Ihnen sagen, dass die besten Ensaimadas nicht aus Palma, sondern aus den Inlandsstädten kommen, und **Inca** ist das Kernland. **Forn Sant Francesc** (4,6 Sterne, ~670 Bewertungen) wird von Rezensenten, die eigens hinausfahren, wiederholt als die beste traditionelle Ensaimada der Insel bezeichnet — leichter, fluffiger Teig in mehreren Varianten (pur, Cabello de ángel, Schokolade), auch wenn die großen runden meist bis zum späten Vormittag ausverkauft sind, bestellen Sie also am Vorabend oder kommen Sie früh. In der Marktstadt **Sineu** ist **Forn Can Toni** (4,6 Sterne) eine hochwertige mallorquinische Bäckerei am Hauptplatz, gut zu verbinden mit dem berühmten Mittwochsmarkt von Sineu.\n\nFür etwas Kleineres und Altmodischeres ist **Forn Can Delante** in Inca eine hundert Jahre alte Familienkonditorei — kein Ort mit großem Andrang, aber ein echter traditioneller Forn, den Rezensenten für seine Crema-cremada- und Turrón-Ensaimadas und seine freundliche, familiäre Atmosphäre hervorheben. In diesen Stadt-Forns wird die Ensaimada als alltägliches lokales Grundnahrungsmittel behandelt statt als Touristenprodukt, und eine kurze Fahrt ins Inselinnere belohnt Sie wirklich mit einem besseren Gebäck.",
    },
    {
      heading: "Die Ensaimada verstehen: Sorten und was man bestellt",
      business_ids: [],
      body: "Die Ensaimada gibt es in zwei Hauptformen. Die **Ensaimada llisa** (pur) ist die Alltagsversion — eine einfache Spirale aus leichtem, blättrigem Teig mit Puderzucker, zum Frühstück mit Kaffee oder heißer Schokolade gegessen. Die größere, gefüllte **Ensaimada de cabell d'àngel** ist mit einer süßen Kürbisfaden-Marmelade (Engelshaar) gefüllt, und es gibt auch Versionen mit Sahne (nata), Schokolade oder, zur Fiesta-Zeit, mit Sobrassada und anderen herzhaften mallorquinischen Zutaten belegt.\n\nEine wichtige Sache: Echte Ensaimadas werden mit Schweineschmalz (saïm) hergestellt, das ihnen ihre Textur gibt, sie sind also nicht für Vegetarier oder alle geeignet, die auf Schweinefleisch verzichten — manche Inland-Forns machen alles mit Schmalz und haben keine Alternative. Die großen runden abgepackten Ensaimadas sind die, die als Mitbringsel verkauft werden; wenn Sie eine davon wollen, bestellen Sie in einem gut besuchten Forn vor, da sie ausverkauft sind. Für einen unkomplizierten Kostvorgang ist eine pure Ensaimada in Einzelportion mit Kaffee das klassische lokale Frühstück.",
    },
    {
      heading: "Lohnen sich die Ensaimadas vom Flughafen?",
      business_ids: [],
      body: "Sie werden am Flughafen Palma Stapel der markanten achteckigen Ensaimada-Schachteln sehen, und es ist ein echtes lokales Produkt statt einer Touristenfalle — die runde abgepackte Ensaimada ist genau das Format, das Mallorquiner als Geschenk oder zum Mitbringen aufs Festland kaufen, eine mit nach Hause zu nehmen ist also authentisch. Sie reisen in der Schachtel gut und sind genau dafür gemacht.\n\nAllerdings wird eine Ensaimada aus einem guten traditionellen Forn, am selben Morgen frisch gekauft, eine vom Flughafen fast immer bei Qualität und Frische schlagen. Wenn Sie Zeit haben, kaufen Sie am Abflugtag in einer der obigen Bäckereien und tragen Sie sie in ihrer Schachtel als Handgepäck; wenn Sie in Eile sind, ist die Flughafenversion ein vernünftiger Ausweichweg und immer noch eine echte Ensaimada. So oder so isst man sie am besten innerhalb von ein bis zwei Tagen, da sie frisch am besten schmecken.",
    },
  ],
  faqs: [
    { question: "Wo kann man die beste Ensaimada auf Mallorca kaufen?", answer: "In Palma ist Ca'n Joan de s'Aigo das berühmte historische Café für eine Ensaimada mit heißer Schokolade, während traditionelle Forns wie Fornet de la Soca (früher Forn des Teatre) und Forn de La Glòria die Wahl sind, wenn Sie das Gebäck selbst wollen. Viele Einheimische bewerten die Öfen im Inselinneren noch höher — Forn Sant Francesc in Inca wird wiederholt als der beste der Insel bezeichnet. Die großen abgepackten Ensaimadas sind früh ausverkauft, bestellen Sie also vor." },
    { question: "Welche Ensaimada eignet sich am besten zum Mitnehmen im Flugzeug?", answer: "Die große runde Ensaimada in ihrer markanten achteckigen Schachtel ist das traditionelle Geschenkformat und reist als Handgepäck gut. Kaufen Sie am Abflugtag eine frisch in einer guten Bäckerei — bestellen Sie in einem gut besuchten Forn wie Forn Sant Francesc in Inca oder Fornet de la Soca in Palma vor, da die großen oft bis zum späten Vormittag ausverkauft sind. Die am Flughafen Palma verkauften abgepackten Ensaimadas sind ein echtes lokales Produkt und ein vernünftiger Ausweichweg, wenn Sie wenig Zeit haben." },
    { question: "Was ist der Unterschied zwischen den Ensaimada-Sorten?", answer: "Die Ensaimada llisa ist die pure Alltagsversion — eine leichte Spirale aus mit Schmalz angereichertem Teig mit Puderzucker. Die größere Ensaimada de cabell d'àngel ist mit süßer Kürbisfaden-Marmelade gefüllt, und es gibt auch Versionen mit Sahne, Schokolade oder herzhaften Belägen wie Sobrassada zur Fiesta-Zeit. Alle echten Ensaimadas werden mit Schweineschmalz (saïm) gemacht, das ihnen ihre Textur gibt, aber bedeutet, dass sie nicht für Vegetarier oder alle geeignet sind, die auf Schweinefleisch verzichten." },
    { question: "Sind die Ensaimadas vom Flughafen auf Mallorca gut?", answer: "Die am Flughafen Palma abgepackt verkauften Ensaimadas sind ein echtes traditionelles Produkt, keine Touristenmasche — die runde abgepackte Ensaimada ist genau das Format, das Mallorquiner als Geschenk aufs Festland mitnehmen. Sie sind eine vernünftige Option, wenn Sie in Eile sind, aber eine am selben Morgen frisch aus einem guten traditionellen Forn gekaufte Ensaimada ist meist besser bei Qualität und Frische. Sie schmecken am besten innerhalb von ein bis zwei Tagen." },
  ],
  seo: {
    title: "Beste Bäckereien auf Mallorca 2026: Wo man Ensaimadas kauft",
    description: "Wo Sie die beste Ensaimada auf Mallorca kaufen: Ca'n Joan de s'Aigo, traditionelle Palma-Forns und die Öfen im Inselinneren von Inca und Sineu, plus die Sorten erklärt.",
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
