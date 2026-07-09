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
  esTaller:   "google-ChIJ6Q_LeTvvlxIR4tj_tdM7lKs",
  quitaPenas: "google-ChIJ2ylQKQTulxIRKQLmOAvL4Jg",
  laPosada:   "google-ChIJMTScwx7vlxIRTcs6GBkhhSc",
  canCosta:   "google-ChIJAXv5J-nxlxIRJd_3CgrJLxc",
  esPort:     "google-ChIJw9-_9JrxlxIRqOARz6J2tjY",
  canUetam:   "google-ChIJiTVQpmHvlxIRlypmH13VBx0",
  barbafl:    "google-ChIJR6n0GOrvlxIRDuE2VMw61rI",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-valldemossa-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-valldemossa-2026",
  locale: "de",
  title: "Die besten Restaurants in Valldemossa 2026",
  excerpt: "Das beste Essen in Valldemossa liegt knapp abseits des Hauptplatzes. Wo Sie gut essen — von Pa amb oli bis zum Hafen — jenseits der Touristenfallen.",
  intro: "Valldemossa ist klein, und die besten Restaurants liegen fast alle ein kurzes Stück abseits des Hauptplatzes Plaça de la Cartuja statt direkt an ihm — die Tische rund um den Platz leben von der Laufkundschaft zwischen Chopin-Museum und Kartause, während die Lokale, die Einheimische und Wiederkehrer schätzen, in Seitengassen oder unten am Hafen versteckt sind. Der Ort eignet sich als Mittagsstopp auf einer Tramuntana-Fahrt oder als halber Tag ab Palma (rund 20–25 Minuten entfernt), und das Essen reicht von traditionellem mallorquinischem Pa amb oli bis zu vollen Menüs mit Talblick. Dieser Leitfaden wählt die Restaurants aus, die Ihre Zeit wert sind, alle mit starken, verifizierten Google-Bewertungen, und sagt ehrlich, welche Sie auslassen sollten.",
  sections: [
    {
      heading: "Abseits des Platzes: wo das beste Essen wirklich ist",
      business_ids: [IDS.esTaller, IDS.quitaPenas, IDS.laPosada],
      body: "Das bestbewertete Restaurant in Valldemossa ist **Es Taller Valldemossa** in der Carrer de Santiago Rusiñol, knapp abseits des Zentrums — ein Lokal mit 4,7 Sternen und über 2.800 Bewertungen, bekannt für kreative Küche (Spanferkel und Ceviche werden besonders gelobt), volle vegane Optionen und Preise, die Gäste immer wieder als niedrig für die Qualität bezeichnen. Es ist ein €€-Lokal, täglich zum Mittag- und Abendessen geöffnet, montags geschlossen, und eine Reservierung ist ratsam.\n\nWenige Schritte entfernt ist **QuitaPenas Valldemossa** (4,7 Sterne, ~2.470 Bewertungen) die Wahl für traditionelles mallorquinisches Essen. Es verbindet Tapas-Restaurant und Feinkostladen rund um einen schattigen Innenhof und ist am bekanntesten für seine Pa-amb-oli-Platten, Sobrassada sowie lokalen Käse und Wein — die Art ehrliches, produktbetontes Mittagessen, das die Touristentische am Platz weniger gut hinbekommen. Es liegt abseits der Hauptstraße, ruhiger, und Gäste empfehlen durchweg, zu reservieren.\n\nFür ein Essen mit Aussicht liegt **La Posada** am Ende einer Gasse nahe dem Chopin-Museum mit Blick über das Tal und die Felsen (4,5 Sterne, ~1.540 Bewertungen). Es ist eine €€-Tapasküche, in der die Lage ein echtes Argument ist und das Essen mithält, auch wenn einige Gäste anmerken, dass die Preise für die Gegend nach oben tendieren.",
    },
    {
      heading: "Traditionelle mallorquinische Küche und Paella",
      business_ids: [IDS.canCosta, IDS.canUetam],
      body: "Kurz außerhalb des Ortes an der Straße nach Deià ist **Restaurante Can Costa Valldemossa** die Adresse für traditionelle mallorquinische Küche in einem historischen Gebäude voller bäuerlicher Antiquitäten, fast museal (4,5 Sterne und mit über 3.200 eine der höchsten Bewertungszahlen der Gegend). Bekannt ist es für Paellas — darunter Hummer-Paella (bogavante), Mindestbestellung zwei Personen — sowie Oktopus, Steinbutt und lokale Weine. Es ist ein €€-Lokal, täglich zum Mittag- und Abendessen geöffnet (sonntags nur mittags). Beachten Sie, dass einige Gäste Hauptgerichte über 20 € als eher touristisch bepreist empfinden, es ist also eher ein Essen für einen Anlass als ein günstiger Happen.\n\nFür mallorquinisches Essen mit Aussicht und entspanntem Flair ist **Ca'n Uetam** am Ortsrand (4,7 Sterne, ~1.100 Bewertungen) zugleich Café-Restaurant und kleine Pension, immer wieder gelobt für den Panoramablick übers Tal und den freundlichen Service. Die Bewertungen sind insgesamt stark, mit gelegentlichem Hinweis auf langsamen Service bei Andrang — die Lage macht es wett.",
    },
    {
      heading: "Unten am Hafen: Es Port de Valldemossa",
      business_ids: [IDS.esPort],
      body: "Den wenigsten Besuchern ist bewusst, dass Valldemossa einen Hafen hat — eine kurvige Fahrt vom Ort hinunter zu einer kleinen Bucht, und diese Fahrt ist Teil des Reizes. **Restaurante Es Port de Valldemossa** (4,5 Sterne, ~1.660 Bewertungen) liegt direkt am Wasser, mit Felsen, die das Mittelmeer einrahmen, und ist auf Fisch und Paella spezialisiert. Gäste heben die Fischgerichte, die Lage und den freundlichen Service hervor.\n\nDies ist ein Ort, den man einplant, statt zufällig hineinzustolpern: Es ist ein Abstecher von der Haupt-Tramuntana-Route und eignet sich daher für ein gemütliches Mittagessen, wenn Sie den Nachmittag Zeit haben, nicht für einen kurzen Stopp. Wenn Sie ohnehin die Küste entlangfahren, ist es eine der schönsten Mittagslagen der Gegend — prüfen Sie nur die Öffnungszeiten, da Küstenlokale wie dieses saisonal sein können.",
    },
    {
      heading: "Kaffee, Frühstück und ein leichter Stopp",
      business_ids: [IDS.barbafl],
      body: "Wenn Sie nur Kaffee, Kuchen oder ein leichtes Mittagessen statt einer vollen Mahlzeit wollen, ist **Barbaflorida cafè** an der Plaça Cartoixa der Star direkt am Platz (4,7 Sterne, ~1.050 Bewertungen) — ein seltener Fall, in dem ein zentrales Lokal wirklich überzeugt, gelobt für ausgezeichneten Kaffee, Gebäck und ein Frühstück eine Stufe über dem üblichen Touristenangebot. Beachten Sie, dass es nur tagsüber öffnet (etwa 10–16 Uhr) und dienstags und mittwochs geschlossen ist.\n\nValldemossas typische Süßspeise ist die Coca de patata, ein leichtes, mit Puderzucker bestäubtes Kartoffelmehl-Gebäck, das man am besten warm mit heißer Schokolade oder einer Mandel-Horchata isst. Mehrere Cafés im Zentrum servieren sie; sie ist das lokale Muss, selbst wenn Sie nur für eine Stunde vorbeikommen.",
    },
    {
      heading: "Lohnt sich Essen in Valldemossa — und was man auslassen sollte",
      business_ids: [IDS.esTaller, IDS.quitaPenas],
      body: "In Valldemossa lohnt sich Essen, aber nur, wenn Sie den Platz Plaça de la Cartuja verlassen. Die Restaurants direkt am Platz leben von der Touristenmenge und bieten meist das schlechteste Preis-Leistungs-Verhältnis; die wirklich guten Adressen — **Es Taller Valldemossa**, **QuitaPenas Valldemossa**, **La Posada** — liegen alle ein bis zwei Minuten entfernt in den Seitengassen. Dieser kurze Weg ist der ganze Trick, um hier gut zu essen.\n\nEine ehrliche Warnung: Mindestens ein bekannteres Restaurant im Ort hat zuletzt Bewertungen mit schlechtem Service und sogar einem Fall von Lebensmittelvergiftung erhalten, es lohnt sich also, bei den durchweg gut bewerteten Lokalen zu bleiben statt bei den am stärksten beworbenen. Die Preise tendieren im Ort generell ins mittlere bis obere Segment — dies ist ein stark besuchtes Tramuntana-Ziel, kein günstiges — rechnen Sie also mit etwas höheren Preisen als in einem gewöhnlichen Landstädtchen.",
    },
    {
      heading: "Valldemossa mit Deià oder Sóller verbinden",
      business_ids: [],
      body: "Valldemossa verbindet man am besten mit dem Rest der Tramuntana, statt es allein zu besuchen. Es liegt am Korridor der Ma-1130/Ma-10 zwischen Palma und der Küste, sodass ein natürlicher Tagesausflug es mit **Deià** (etwa 15 Minuten weiter an der Küstenstraße, gehobenere Küche) und **Sóller** (rund 25–30 Minuten weiter) verbindet und so eine klassische Bergrunde ergibt.\n\nEin gängiger Plan: vormittags Valldemossa mit der Kartause und einer Coca de patata, Mittagessen in einem der Lokale abseits des Platzes oder unten am Hafen, dann weiter nach Deià oder Sóller für den Nachmittag. Wenn Sie den historischen Sóller-Zug und die Tram als Tagesausflug nutzen, liegt Valldemossa nicht an dieser Strecke — es braucht ein Auto oder den Bus — behandeln Sie es also als eigenen Fahrtag, statt es an den Zugausflug anzuhängen.",
    },
  ],
  faqs: [
    { question: "Wo sind die besten Restaurants in Valldemossa?", answer: "Die bestbewerteten Restaurants liegen knapp abseits des Hauptplatzes statt direkt an ihm. Es Taller (4,7 Sterne) ist die Top-Wahl für kreative Küche mit veganen Optionen, QuitaPenas (4,7) für traditionelles Pa amb oli und mallorquinische Platten, und La Posada (4,5) für Tapas mit Talblick. Für traditionelle Paella ist Ca'n Costa an der Straße nach Deià ein langjähriger Favorit, und Es Port de Valldemossa unten an der Bucht ist am besten für Fisch." },
    { question: "Lohnt sich Valldemossa allein zum Essen?", answer: "Valldemossa lohnt ein Essen, wenn Sie in den Restaurants knapp abseits der Plaça de la Cartuja essen statt an den touristischen Tischen am Platz selbst. Lokale wie Es Taller und QuitaPenas servieren wirklich gutes Essen, und der Ort verbindet ein Essen mit der Kartause, dem Chopin-Bezug und der Tramuntana-Landschaft. Die meisten kombinieren es mit Deià oder Sóller, statt eine reine Essensreise zu machen." },
    { question: "Muss man in Valldemossa reservieren?", answer: "Im Sommer und an Wochenenden ja — die beliebtesten Lokale wie Es Taller und QuitaPenas füllen sich, und Gäste empfehlen durchweg zu reservieren, besonders mittags. Cafés wie Barbaflorida sind ohne Reservierung möglich, können aber zu Stoßzeiten Wartezeit haben. Für das Hafenrestaurant und einen Sonntagsbesuch ist Vorausbuchen am sichersten, und prüfen Sie immer die Öffnungstage, da einige montags oder dienstags schließen." },
    { question: "Ist Essen in Valldemossa teuer?", answer: "Valldemossa liegt für mallorquinische Verhältnisse im mittleren bis oberen Bereich. Die meisten guten Restaurants sind €€, mit Hauptgerichten oft über 20 € bei den etablierteren Adressen wie Ca'n Costa, was seinen Status als stark besuchtes Tramuntana-Dorf widerspiegelt. Günstiger essen Sie mit einer Pa-amb-oli-Platte bei QuitaPenas oder einem Kaffee mit Coca de patata im Café, aber insgesamt ist es kein günstiges Ziel." },
  ],
  seo: {
    title: "Die besten Restaurants in Valldemossa 2026 | Mallorca Verified",
    description: "Wo Sie in Valldemossa gut essen: die besten Restaurants abseits des Hauptplatzes, von Pa amb oli bis Fisch am Hafen — ehrliche Tipps, keine Touristenfallen.",
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
