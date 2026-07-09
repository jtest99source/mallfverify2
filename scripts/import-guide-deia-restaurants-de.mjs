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

// Xelini (★3.9) intentionally excluded — hidden, mentioned in prose only
const IDS = {
  balm:     "google-ChIJWSkAXjPvlxIRwmkqVKqpkcU",
  march:    "google-ChIJYQSe2bjvlxIRhq4-R_e19qc",
  olivo:    "google-ChIJ9birlq3vlxIRKzLbXjfmePs",
  trattoria:"google-ChIJay6YFq3vlxIRL2rDAWJ5O4w",
  fontfresca:"google-ChIJVU2CRK3vlxIRPstklewtUe4",
  aura:     "google-ChIJV7FvvjXvlxIRmwAxzB1VCrA",
  peixot:   "google-ChIJ4y8IaD_vlxIRO9QxiCeQEIM",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-deia-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-deia-2026",
  locale: "de",
  title: "Die besten Restaurants in Deià 2026",
  excerpt: "Deià ist schön und teuer. Wo Sie in Mallorcas exklusivstem Dorf gut essen — vom Fünf-Sterne-Degustationsmenü bis zu ehrlichem Fisch an der Klippe und gutem Preis-Leistungs-Verhältnis.",
  intro: "Deià ist eines der schönsten und exklusivsten Dörfer Mallorcas, eine Ansammlung honigfarbener Steinhäuser an einem Tramuntana-Hang über dem Meer, lange mit Künstlern, Schriftstellern und heute einem betuchten Publikum verbunden. Dieser Ruf spiegelt sich in seinen Restaurants: Dies ist kein günstiges Ziel, und einige seiner berühmtesten Tische verlangen entsprechend. Aber Deià hat auch wirklich ausgezeichnetes Essen über eine Bandbreite von Preisen, von einem winzigen Ehepaar-Restaurant, das das bestbewertete im Dorf ist, bis zu ikonischem Fisch an der Klippe und ein paar ehrlichen, preiswerteren Adressen. Dieser Leitfaden ist ehrlich dabei, was das Geld wert ist, wofür Sie wirklich zahlen und wie Sie hier gut essen, ohne ein Fünf-Sterne-Budget.",
  sections: [
    {
      heading: "Das beste Essen im Dorf: Balm",
      business_ids: [IDS.balm],
      body: "Das bestbewertete Restaurant in Deià ist **Balm**, ein kleines, von einem Ehepaar geführtes Restaurant mit bemerkenswerten 5,0 Sternen aus über 500 Bewertungen. Rezensenten beschreiben eine fokussierte, durchdacht kuratierte kleine Karte, auf außergewöhnlichem Niveau umgesetzt — Fisch, Muscheln und saisonale Gerichte werden besonders gelobt —, mit herzlichem, leidenschaftlichem Service in einem gemütlichen, aber nicht beengten Ambiente. Mehrere nennen es die beste Mahlzeit ihrer gesamten Mallorca-Reise.\n\nEs ist nur abends geöffnet und sonntags geschlossen, und angesichts seiner Größe und seines Rufs ist eine frühzeitige Reservierung unerlässlich. Das Parken in Deià ist bekanntlich schwierig, rechnen Sie das also ein. Wenn Sie ein herausragendes Abendessen im Dorf wollen und das Essen selbst am wichtigsten ist, ist dies die Wahl — und obwohl es nicht günstig ist, finden Rezensenten durchweg, dass es sein Geld wert ist, was man in Deià nicht von allem sagt.",
    },
    {
      heading: "Ikonische Lagen: Ca's Patró March und El Olivo",
      business_ids: [IDS.march, IDS.olivo],
      body: "Zwei Restaurants in Deià sind ebenso für ihre Lage wie für ihr Essen berühmt. **Ca's Patró March** (4,0 Sterne, ~2.200 Bewertungen) ist in die Klippen der Cala Deià gebaut, direkt über dem Meer — Sie parken weiter oben und gehen hinunter, und Reservierungen (die online um Mitternacht zehn Tage im Voraus öffnen) sind unerlässlich. Rezensenten schwärmen von der Lage und einem Bad vor dem Mittagessen; der Fisch, das Thunfisch-Tatar, der Oktopus und die Paella werden meist gemocht, auch wenn einige finden, dass das Essen der spektakulären Lage nicht ganz gerecht wird. Es ist ein Mittagsort und ein echtes Mallorca-Erlebnis, entsprechend bepreist.\n\n**El Olivo**, das Fine-Dining-Restaurant im Fünf-Sterne-Hotel La Residencia (mit Reservierung auch für Nicht-Gäste offen), ist die gehobene Degustationsmenü-Option des Dorfes, in einer schönen alten Ölmühle. Es ist ein €€€€-Anlass-Restaurant mit göttlicher Kulisse und aufmerksamem Service — aber die Bewertungen sind wirklich geteilt: Manche nennen es einen magischen Abend für besondere Anlässe, während andere finden, dass das sehr teure Degustationsmenü (berichtet mit Hunderten von Euro pro Person) den Preis allein für das Essen nicht rechtfertigt. Gehen Sie wegen der Kulisse und des Anlasses hin, mit offenen Augen beim Preis.",
    },
    {
      heading: "Verlässliche Mittelklasse: Trattoria Italiana und die Tapas-Adressen",
      business_ids: [IDS.trattoria],
      body: "Für eine gute Mahlzeit ohne Spitzenpreise ist **Trattoria Italiana** (4,4 Sterne, ~780 Bewertungen) eine verlässliche Wahl, ein Italiener mit Terrasse über dem Dorf, gelobt für Pizza, Pasta, Wolfsbarsch und herzlichen Service — ein solides, publikumsfreundliches Abendessen. Für Tapas servieren **Restaurante Xelini** (eine alteingesessene Adresse mit hübscher Gartenterrasse, Live-Musik und einer herzlichen kubanischen Inhaberin) und das kleinere **Can Xelini** beide beliebte, unkomplizierte Tapas — gegrillter Tintenfisch, Knoblauchgarnelen, Padrón-Paprika — zu moderateren Preisen als die Aushängeschild-Restaurants des Dorfes.\n\nDies sind die Adressen, die man ansteuert, wenn man in Deià mit normalerem Budget gut essen oder ein entspanntes Abendessen statt eines Anlass-Festmahls will. Wie überall im Dorf ist eine Reservierung in der Saison ratsam, und beachten Sie, dass mehrere Adressen ein oder zwei Tage unter der Woche schließen.",
    },
    {
      heading: "Aussicht, Mittagessen und ein leichter Stopp: Sa Font Fresca, Aura und Cas Peixot",
      business_ids: [IDS.fontfresca, IDS.aura, IDS.peixot],
      body: "Für ein Mittagessen an der Klippe mit Aussicht zu fairen Preisen ist **Cafè Sa Font Fresca** (4,4 Sterne, ~1.370 Bewertungen) ein Star — ein Terrassenrestaurant am Dorfrand, das frisches Essen, ausgezeichnete Pizza und Focaccia sowie Zitronenkuchen serviert, mit spektakulärer Aussicht und entspanntem Flair. Es ist einer der preiswerteren Tische in Deià und ein natürlicher Stopp, wenn Sie von Valldemossa hereingewandert sind. **Aura Deià** (5,0 Sterne) ist eine weitere starke Mittagsoption, wiederholt als bestes Preis-Leistungs-Verhältnis im Dorf bezeichnet, mit guter Aussicht, freundlichem Service und Gerichten wie Wolfsbarsch und Rinderbäckchen, die über ihrem Preis spielen.\n\nFür nur einen Kaffee, ein Getränk oder einen kleinen Happen ist **Cas Peixot** ein schönes Café mit einer Innenhofterrasse und einem kleinen Teich mit Schildkröten — eher ein charmanter Ort, um innezuhalten und den nächsten Schritt zu planen, als eine volle Mahlzeit. Zwischen diesen dreien können Sie Deiàs Kulisse genießen, ohne sich auf ein teures Abendessen festzulegen.",
    },
    {
      heading: "Ist Deià teuer — und wie man mit Budget gut isst",
      business_ids: [],
      body: "Deià ist wirklich teuer, und das sollte man offen sagen: Es ist Mallorcas exklusivstes Dorf, und die berühmten Restaurants verlangen entsprechend, wobei das El-Olivo-Degustationsmenü in die Hunderte pro Person geht und selbst die Klippen- und Aussichtsrestaurants für ihre Lage einen Aufschlag verlangen. Wenn Sie mit Dorfpreisen rechnen, erleben Sie einen Schock.\n\nAber man kann hier auch ohne Spitzenausgaben gut essen. Die preiswerten Optionen sind das Mittag- statt des Abendessens, die Mittelklasse- und Tapas-Adressen (Trattoria, die Xelini-Tapas-Lokale) und die Aussichtscafés wie Sa Font Fresca und Aura, die die Deià-Kulisse zu faireren Preisen liefern. Ein Kaffee oder Getränk bei Cas Peixot oder eine Pizza mit Aussicht bei Sa Font Fresca lassen Sie das Dorf aufsaugen, ohne eine Fine-Dining-Rechnung. Und wenn Sie sich einen Luxus gönnen wollen, ist Balm der eine, den Rezensenten beim Essen wirklich wert finden, statt rein für einen Namen oder eine Aussicht zu zahlen.",
    },
    {
      heading: "Deià mit Sóller und Valldemossa verbinden",
      business_ids: [],
      body: "Deià ist klein und liegt direkt an der Küstenstraße Ma-10 zwischen **Valldemossa** (etwa 15 Minuten südwestlich) und **Sóller** (etwa 15 Minuten nordöstlich), sodass die meisten Besucher es mit einem oder beiden verbinden, statt es als eigenständigen Ausflug zu machen. Ein klassischer Tramuntana-Tag verbindet alle drei: Valldemossa für seine Kartause und eine Coca de patata, Deià für ein Mittagessen oder einen Abstieg zur Cala Deià und Sóller für den Nachmittag und die historische Tram zum Hafen.\n\nWanderer können Deià zu Fuß von Sóller oder Valldemossa über die alten Bergpfade des GR-221 erreichen und hungrig zum Mittagessen an einem Ort wie Sa Font Fresca ankommen. Wenn Sie einen kulinarischen Tag um Deià herum planen, verbindet es sich am natürlichsten mit Sóller für eine größere Auswahl an Restaurants und einfacheres Parken, wobei Sie Deià für seine Kulisse und eine herausragende Mahlzeit nutzen statt für einen ganzen Tag voller Optionen, angesichts dessen, wie kompakt und teuer es ist.",
    },
  ],
  faqs: [
    { question: "Was sind die besten Restaurants in Deià?", answer: "Balm ist das bestbewertete (5,0 Sterne), ein kleines Ehepaar-Restaurant, das Rezensenten als die beste Mahlzeit ihrer Reise bezeichnen. Ca's Patró March ist der ikonische Fischort an der Klippe der Cala Deià, und El Olivo im La Residencia ist die gehobene Degustationsmenü-Option. Für besseres Preis-Leistungs-Verhältnis essen Trattoria Italiana, die Xelini-Tapas-Adressen und Aussichtscafés wie Cafè Sa Font Fresca und Aura Deià alle gut zu moderateren Preisen." },
    { question: "Ist Deià teuer zum Essen?", answer: "Ja — Deià ist Mallorcas exklusivstes Dorf, und die Preise spiegeln das wider, wobei das El-Olivo-Degustationsmenü in die Hunderte von Euro pro Person geht und die berühmten Klippen- und Aussichtsrestaurants für ihre Lage einen Aufschlag verlangen. Günstiger essen Sie an den Mittelklasse- und Tapas-Adressen und den Aussichtscafés wie Sa Font Fresca und Aura sowie indem Sie mittags statt abends essen, aber insgesamt ist es kein günstiges Ziel." },
    { question: "Kann man in Deià mit Budget gut essen?", answer: "Man kann, wenn man die richtigen Orte wählt. Das Mittagessen ist preiswerter als das Abendessen, und Adressen wie Cafè Sa Font Fresca (tolle Pizza und Aussicht) und Aura Deià (oft als bestes Preis-Leistungs-Verhältnis im Dorf bezeichnet) geben Ihnen die Deià-Kulisse zu faireren Preisen. Die Xelini-Tapas-Lokale bieten moderat bepreiste Tapas, und Cas Peixot ist schön für nur einen Kaffee oder ein Getränk. Gehen Sie nicht davon aus, dass die berühmten Namen die einzigen Optionen sind." },
    { question: "Lohnt sich El Olivo im La Residencia?", answer: "Es kommt darauf an, was Sie wollen. El Olivo ist für Nicht-Gäste offen und bietet eine schöne Kulisse in einer alten Ölmühle mit aufmerksamem Service, was es zu einem denkwürdigen Ort für besondere Anlässe macht. Die Bewertungen sind allerdings wirklich geteilt: Manche finden es magisch, während andere finden, dass das sehr teure Degustationsmenü seinen Preis allein für das Essen nicht rechtfertigt. Gehen Sie wegen der Kulisse und des Anlasses hin, statt die beste Preis-Leistung in Deià zu erwarten, und buchen Sie vor." },
  ],
  seo: {
    title: "Die besten Restaurants in Deià 2026 | Mallorca Verified",
    description: "Wo Sie in Deià essen, Mallorcas exklusivstem Dorf: das bestbewertete Balm, Ca's Patró March an der Klippe, El Olivo, plus ehrliche preiswertere Tipps. Ist Deià teuer?",
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
