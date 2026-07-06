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
  groenk:   "google-ChIJu0AhH6fplxIRFzQb3Yko0M8",
  cafemed:  "google-ChIJK_odrX_olxIRhvl87SF8dFg",
  ritma:    "google-ChIJ8fGguT2TlxIRZtpGVL-2Wd4",
  canbenet: "google-ChIJbyAad9DplxIRKqHvb2Ruufo",
  cantuna:  "google-ChIJpT6qVH_olxIRr7ncT3KAoZE",
  esturo:   "google-ChIJgVXCqXjolxIRxgW679MOyp0",
  forn:     "google-ChIJ_3Xt0UrplxIRecjw0FnJPwA",
  corella:  "google-ChIJPbFkxqjplxIRJj1q4vbD1Rc",
  pruna:    "google-ChIJ5TKPXwDplxIRt8uPxFayDIw",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-fornalutx-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-fornalutx-2026",
  locale: "de",
  title: "Die besten Restaurants in Fornalutx 2026",
  excerpt: "Fornalutx ist winzig, isst aber weit über seiner Größe. Eine Handvoll wirklich guter Restaurants und Cafés, von Farm-to-Table bis zum besten Gebäck im Tal.",
  intro: "Fornalutx ist eines der kleinsten und schönsten Dörfer Mallorcas, eine Ansammlung von Steinhäusern, die sich einen Tramuntana-Hang oberhalb von Sóller hinaufstaffeln, mit nur wenigen Hundert festen Einwohnern. Man würde erwarten, dass ein Ort dieser Größe ein Touristencafé und sonst wenig hat — aber er spielt weit über seiner Größe, mit einer Handvoll wirklich guter Restaurants und Cafés, von einer Farm-to-Table-Küche, die ein einziges Paar führt, bis zu einer Bäckerei mit dem besten Gebäck im Tal. Dieser Leitfaden zeigt die Orte, an denen sich das Essen wirklich lohnt, ist ehrlich bei denen, die eher von ihrer Aussicht als von ihrem Essen leben, und funktioniert, ob Sie im Dorf wohnen oder für den Tag von Sóller heraufkommen.",
  sections: [
    {
      heading: "Der beste Allrounder: Groenk Bistro & Grill",
      business_ids: [IDS.groenk],
      body: "Das stärkste Restaurant im Dorf im Verhältnis von Qualität und Beständigkeit ist **Groenk Bistro & Grill**, das 4,8 Sterne aus über 1.270 Bewertungen hält — eine bemerkenswerte Bewertungszahl für ein so kleines Dorf. Rezensenten beschreiben eine sorgfältige, gut umgesetzte Küche über eine breite Karte: ein viel gelobtes Schnitzel, Fisch des Tages, Steaks, große frische Salate und Pulled-Pork-Burger, serviert in einem geschmackvoll gestalteten Raum mit Terrasse. Mehrere merken an, dass es sich eher wie ein Ort anfühlt, dem etwas an der Sache liegt, als wie eine Touristenfalle, auch wenn ein paar es etwas teuer finden und das eine oder andere Gericht ungleichmäßig sein kann.\n\nEs ist täglich geöffnet, von mittags bis abends, und ein Parkplatz liegt einen Block entfernt. Angesichts seiner Beliebtheit und der Größe von Fornalutx ist eine Reservierung sinnvoll, besonders zum Abendessen oder für einen Terrassentisch. Für die meisten Besucher, die eine verlässliche, runde Mahlzeit im Dorf wollen, ist dies die sicherste Wahl.",
    },
    {
      heading: "Farm-to-Table und herausragende Küche: Cafe Med und Ritma",
      business_ids: [IDS.cafemed, IDS.ritma],
      body: "Für etwas Persönlicheres ist **Restaurant Cafe Med** in der Carrer de sa Plaça ein winziges Farm-to-Table-Restaurant (4,6 Sterne, ~300 Bewertungen), geführt von einem Ehepaar, das im Obergeschoss wohnt und einen Großteil der Produkte selbst anbaut. Die Karte ist klein, wechselt wöchentlich, und Rezensenten nennen es wiederholt das beste Essen ihrer Mallorca-Reise — einfallsreiche Gerichte, Gang für Gang erklärt, mit lokalen Zutaten und durchdachten Weinbegleitungen. Die Kapazität ist sehr begrenzt, eine Reservierung im Voraus ist also unerlässlich.\n\n**Ritma Mallorca** (4,9 Sterne, ~410 Bewertungen) ist die andere Spitzenadresse, ein auf das Abendessen ausgerichteter Ort mit begrenzten Öffnungszeiten, atemberaubendem Talblick und einem Ruf für tadelloses Essen und tadellosen Service — Rezensenten zählen es durchweg zu ihren besten Mahlzeiten der Insel. Es ist nur an wenigen Abenden pro Woche geöffnet (etwa Mittwoch bis Sonntag, mit einem Samstagsmittag), füllt sich schnell, und Reservierungen werden dringend empfohlen. Beide sind eher Ziel-Mahlzeiten als spontane Stopps.",
    },
    {
      heading: "Tapas und ein entspannter Happen: Can Benet by Don Pedro",
      business_ids: [IDS.canbenet],
      body: "Für eine ungezwungenere Mahlzeit ist **Can Benet by Don Pedro** am Dorfplatz (4,6 Sterne, ~1.020 Bewertungen) ein beliebter Tapas- und Café-Ort. Rezensenten loben den freundlichen Service (mehrere erwähnen dasselbe Personal namentlich und kamen während ihres Aufenthalts allabendlich wieder), das Iberico-Steak und die Tortilla sowie die entspannte Lage am Platz für Kaffee, Pan cristal oder ein leichtes Abendessen. Ein paar merken an, dass die Karte kleiner und café-artiger ist als bei einem vollen Restaurant und dass manche Gerichte besser sind als andere.\n\nEs ist die Wahl für einen lockeren Happen oder ein Getränk statt eines großen Abendessens, und seine langen täglichen Öffnungszeiten (mittwochs geschlossen) machen es leicht, beim Bummel durchs Dorf hereinzuschauen. Gut für Familien oder alle, die Tapas einem förmlichen Essen vorziehen.",
    },
    {
      heading: "Tolle Aussicht, ehrliche Erwartungen: Ca N'Antuna und Es Turó",
      business_ids: [IDS.cantuna, IDS.esturo],
      body: "Die zwei bekanntesten Terrassenrestaurants von Fornalutx leben stark von ihrer spektakulären Talaussicht, und es lohnt sich, beim Kompromiss ehrlich zu sein. **Ca N'Antuna** (4,2 Sterne, ~2.110 Bewertungen) hat wohl die berühmteste Veranda des Dorfes, mit weitem Blick, und die Rezensenten sind geteilter Meinung: Viele lieben die Lage und traditionelle Gerichte wie frittierte Seezunge, während andere das Essen durchschnittlich und für das Gebotene überteuert finden und den Service uneinheitlich. **Restaurant Es Turó** (4,2 Sterne, ~1.230 Bewertungen) ist ähnlich — eine schlichte Bergtaverne, gelobt für ihre Terrasse, den Sonnenuntergangsblick und großzügige mallorquinische Teller (Porcella, Padrón-Paprika, Wurst), auch wenn die Bewertungen zu Essen und Service gemischt ausfallen.\n\nDas ehrliche Fazit: Beide lohnen sich vor allem für die Aussicht und die Atmosphäre, am besten in einer Gruppe genossen, die Teller teilt, statt als Feinschmeckerziel. Wenn das Essen selbst am wichtigsten ist, sind Groenk, Cafe Med oder Ritma die stärkeren Wahlen; wenn Sie ein klassisches Terrassenmittagessen mit Aussicht wollen, liefern diese das.",
    },
    {
      heading: "Kaffee, Gebäck und Gelato",
      business_ids: [IDS.forn, IDS.corella, IDS.pruna],
      body: "Für Frühstück, Kaffee oder einen leichten Stopp statt einer vollen Mahlzeit hat Fornalutx drei Spitzenadressen. **Forn de Barri** (4,8 Sterne, ~180 Bewertungen) ist die Dorfbäckerei, vormittags bis zum frühen Nachmittag geöffnet, gelobt für ausgezeichnete Croissants, Napolitanas, Zimtschnecken, Sauerteigbrot und Sandwiches zu erschwinglichen Preisen — ein großartiger erster Stopp vor einer Wanderung. **Corel·la Café** (4,9 Sterne, ~210 Bewertungen) ist ein Spezialitäten-Kaffeeort, an dem der Inhaber das Gebäck selbst macht, wobei Rezensenten die Kaffeequalität, die Kuchen, den Chai Latte und ein kleines Feinkostangebot lokaler Produkte zum Mitnehmen hervorheben.\n\nFür etwas Süßes später am Tag serviert **Pruna Gelateria Artesana** am Platz (4,9 Sterne, ~270 Bewertungen) handwerkliches Gelato, das Rezensenten zu den besten der Insel zählen, mit originellen Sorten wie Rosmarin-Honig und einem freundlichen Inhaber, der vor der Wahl probieren lässt. Zwischen den dreien sind Sie vom morgendlichen Kaffee mit Gebäck bis zum nachmittäglichen Eis versorgt, ohne eine volle Mahlzeit zu brauchen.",
    },
    {
      heading: "Fornalutx mit Sóller und Biniaraix verbinden",
      business_ids: [],
      body: "Fornalutx ist winzig, daher verbinden die meisten Besucher es mit dem weiteren Sóller-Tal, statt es als eigenständigen Ausflug zu machen. Es liegt etwa 10 Autominuten oberhalb von **Sóller**, und ein beliebter Plan ist, Sóller und Port de Sóller zu erkunden (mit dem historischen Zug und der Tram ab Palma erreichbar) und dann nach Fornalutx hinaufzufahren oder zu wandern für eine ruhigere Mahlzeit mit Bergblick abseits des belebteren Ortes.\n\nWanderer können Fornalutx zu Fuß mit dem Weiler **Biniaraix** und Sóller verbinden, über die alten Steinpfade und den Barranc de Biniaraix, eine der klassischen kurzen Wanderungen der Tramuntana — eine landschaftlich schöne Art, sich vor dem Mittagessen Appetit zu holen. Da Fornalutx nur eine Handvoll Orte hat und mehrere begrenzte Tage oder Zeiten haben, lohnt es sich, die Öffnungszeiten zu prüfen und vorab zu reservieren, statt aufzutauchen und zu hoffen, besonders außerhalb der Hochsaison, wenn einige unter der Woche schließen.",
    },
  ],
  faqs: [
    { question: "Lohnt sich Fornalutx allein zum Essen?", answer: "Fornalutx lohnt einen Ausflug für eine Mahlzeit, wenn Sie eines seiner Spitzenrestaurants buchen — Groenk Bistro & Grill für eine verlässliche, runde Mahlzeit oder Cafe Med und Ritma für persönlichere, gehobene Küche. Das Dorf selbst ist eines der schönsten Mallorcas, sodass sich ein Essen natürlich mit einem Bummel durch die Steingassen und einem Kaffee bei Forn de Barri oder Corel·la Café verbindet. Die meisten kombinieren es mit dem nahen Sóller, statt eine eigene Reise zu machen, da es sehr klein ist." },
    { question: "Wie viele Restaurants hat Fornalutx?", answer: "Fornalutx ist ein sehr kleines Dorf, hat also nur eine Handvoll Restaurants — aber mehrere sind wirklich gut. Die wichtigsten Sitzoptionen sind Groenk Bistro & Grill, Cafe Med, Ritma Mallorca, Can Benet by Don Pedro und die zwei aussichtsorientierten Terrassen Ca N'Antuna und Es Turó, dazu Cafés und eine Bäckerei (Forn de Barri, Corel·la Café) sowie eine handwerkliche Gelateria. Da es so wenige sind und einige nur begrenzte Tage öffnen, wird eine Vorausbuchung dringend empfohlen, besonders abends und außerhalb der Saison." },
    { question: "Wo bekommt man in Fornalutx guten Kaffee oder ein Frühstück?", answer: "Fornalutx hat zwei ausgezeichnete Morgenadressen. Forn de Barri ist die Dorfbäckerei, von früh bis zum frühen Nachmittag geöffnet, mit preiswerten Croissants, Sauerteigbrot, Zimtschnecken und Sandwiches. Corel·la Café ist ein Spezialitäten-Kaffeeort, an dem der Inhaber das Gebäck backt, gelobt für Kaffee, Kuchen und ein kleines Feinkostangebot. Als Nachtisch serviert Pruna Gelateria Artesana am Platz hoch bewertetes handwerkliches Gelato an Nachmittagen und Abenden." },
    { question: "Muss man in Fornalutx reservieren?", answer: "Ja, für die Sitzrestaurants wird eine Reservierung dringend empfohlen. Das Dorf ist winzig, und seine besten Orte — besonders das kleine Farm-to-Table Cafe Med und das hoch bewertete Ritma — haben sehr begrenzte Kapazität und füllen sich schnell. Mehrere Restaurants schließen zudem unter der Woche oder öffnen nur wenige Abende, es lohnt sich also, die Öffnungstage zu prüfen und zu reservieren, statt aufzutauchen und zu hoffen, besonders außerhalb der Sommersaison. Die Cafés und die Bäckerei sind ohne Reservierung möglich, haben aber nur tagsüber geöffnet." },
  ],
  seo: {
    title: "Die besten Restaurants in Fornalutx 2026 | Mallorca Verified",
    description: "Wo Sie in Fornalutx essen, Mallorcas winzigem Tramuntana-Dorf über Sóller: Farm-to-Table Cafe Med, Groenk, Ritma, dazu die beste Bäckerei, Café und Gelato.",
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
