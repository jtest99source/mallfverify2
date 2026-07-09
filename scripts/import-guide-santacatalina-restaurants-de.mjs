import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const ID = {
  mercat:    "mercado-santa-catalina", // clean id, not google-<pid>
  vermoutique:"google-ChIJn-TlFwCTlxIRP-AqW8E98DQ",
  laMona:    "google-ChIJY1PgNQCTlxIRBEJ_zLxtSQg",
  tapasPalma:"google-ChIJV_97jguTlxIRa2-hs2tbJnc",
  buscando:  "google-ChIJJfkxplqTlxIR56ViJw0J_s0",
  perrito:   "google-ChIJg1YbX12SlxIRmyffPwabrD4",
  santina:   "google-ChIJMbGD7GeSlxIR7aoZWR1hylU",
  plantShack:"google-ChIJG5ARVJ2TlxIRU4MwNpoC2Go",
  xo:        "google-ChIJBylJ2EeTlxIRgSPXhSp21b8",
  azuca:     "google-ChIJwW3NPQCTlxIRRC63WmFnWzs",
  esencia:   "google-ChIJhVOkx8GTlxIRhySy1AbPZhQ",
  infineat:  "google-ChIJM6xxZV2SlxIRiu3KOQJuHEQ",
  bankai:    "google-ChIJU2BnWhyTlxIRFtBscKdujMI",
  mamas:     "google-ChIJCxiRkfqTlxIR48tGB2SzneE",
  burguesa:  "google-ChIJ-fKoK2aSlxIRSpaNEKLJog4",
};

// hero: reuse the EN guide's hero for consistency, else first business photo
const { data: enGuide } = await sb.from("guides").select("hero_image_url").eq("slug","best-restaurants-santa-catalina-palma-2026").eq("locale","en").maybeSingle();
const hero = enGuide?.hero_image_url ?? null;

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-santa-catalina-palma-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-santa-catalina-palma-2026",
  locale: "de",
  title: "Die besten Restaurants in Santa Catalina, Palma 2026",
  excerpt: "Palmas altes Fischerviertel, das zum Gastro-Viertel wurde. Wo man in Santa Catalina wirklich isst — der Markt, die Tapasbars, die Brunch-Adressen und die herausragenden Abendessen.",
  intro: "Santa Catalina ist Palmas ehemaliges Fischerviertel, direkt westlich der Altstadt, rund um den **Mercat de Santa Catalina** herum gebaut — Palmas ältesten überdachten Markt, aus dem Jahr 1920 —, der das verankert, was zum bekanntesten Ess- und Trinkviertel der Stadt geworden ist. Das Viertel entwickelte sich über die letzten Jahrzehnte von einem Arbeiter- und Seefahrerviertel zu einem gastronomischen Ziel, seine verkehrsberuhigten Straßen sind heute gesäumt von Tapasbars, Brunch-Cafés, internationalen Küchen und ein paar wirklich ausgezeichneten Restaurants. Dieser Leitfaden ordnet das Viertel danach, wie man es tatsächlich nutzt — der Markt selbst, Tapas und Vermut, Brunch und Abendessen — und ist ehrlich dabei, welche Orte es wert sind und ob Santa Catalina wirklich teurer ist als der Rest von Palma.",
  sections: [
    {
      heading: "Essen im Mercat de Santa Catalina",
      business_ids: [ID.mercat, ID.vermoutique],
      body: "Der **Mercat de Santa Catalina** (4,4 Sterne, ~5.500 Bewertungen) ist das Herz des Viertels, ein arbeitender überdachter Markt, auf dem Einheimische, Köche und Yacht-Versorger Seite an Seite einkaufen, geöffnet Montag bis Samstag ab 7 Uhr (werktags bis 15–16 Uhr, samstags früher) und sonntags geschlossen. Neben den Frischeständen servieren mehrere Bars im Inneren Essen aus den eigenen Zutaten des Marktes, und hier zu essen ist eines der preiswertesten, lokalsten Erlebnisse in Palma. **Vermoutique** (4,9 Sterne) ist eine herausragende Marktbar für Vermut vom Fass, Patatas bravas, Kroketten und frische Meeresfrüchte-Tapas, wobei Rezensenten immer wieder die Bravas-Soße hervorheben.\n\nDer Markt ist früher am Tag am besten — vor etwa 10:30 Uhr gehört er dem Viertel, und gegen 14 Uhr laufen die Stände aus. Ein Hinweis zum Timing: Das Marktgebäude schließt am frühen Nachmittag und sonntags, es ist also ein Ziel für Frühstück bis Mittag, wobei die umliegenden Straßen für den Abend übernehmen. Samstags ist es der traditionelle Beginn des lokalen 'Tardeo', wenn die Leute für eine Caña, ein Cava und einen Teller von irgendetwas ausgehen, bevor der Nachmittag weiterrollt.",
    },
    {
      heading: "Tapas und Vermut",
      business_ids: [ID.laMona, ID.tapasPalma, ID.buscando],
      body: "Santa Catalina ist stark bei Tapas- und Vermut-Bars. **La Mona Vermuteria** an der Carrer de Cotoner (4,9 Sterne) ist eine kleine, beliebte Vermuteria, gelobt für ausgezeichnete Gildas, Tapas und gute Stimmung, mit Sitzplätzen an hohen Tischen und Hockern und einem lebhaften Publikum. **Tapas Palma** (4,6 Sterne, ~1.560 Bewertungen) ist eine größere, verlässliche Option knapp abseits der Hauptstraßen, geschätzt für Kroketten, Garnelen und großzügige Portionen mit freundlichem Service, auch wenn einige Rezensenten das Essen eher gut als außergewöhnlich finden.\n\nFür ein Tapas-Abendessen im Restaurantstil ist **Buscando el Norte** an der Carrer de Sant Magí (4,3 Sterne, ~1.070 Bewertungen) eine gut besuchte, fair bepreiste Adresse mit Tellern zum Teilen mit asiatisch-südamerikanischem Einschlag, Ceviche und Risotto unter den von Rezensenten geschätzten Gerichten. Dies sind die Orte zum Naschen über kleine Teller mit einem Getränk statt eines formellen Essens im Sitzen, und sie fangen den legeren Abendrhythmus des Viertels ein.",
    },
    {
      heading: "Brunch",
      business_ids: [ID.perrito, ID.santina, ID.plantShack, ID.xo],
      body: "Santa Catalina ist wohl Palmas Brunch-Hauptstadt, mit einer Ansammlung gut bewerteter Adressen. **El Perrito** an der Carrer d'Anníbal (4,7 Sterne, ~1.410 Bewertungen) ist ein gemütliches, hundefreundliches Café, gelobt für Eggs Benedict, Matcha und einen herzlichen Empfang — eine der Brunch-Institutionen des Viertels. In der Nähe ist **Santina** (4,2 Sterne, ~1.220 Bewertungen) eine beliebte, gesundheitsbewusste Brunch-Adresse, bekannt für Turkish Eggs, Bowls und Avocado-Toast, auch wenn ihre Bewertung widerspiegelt, dass es voll werden kann und die Preise für einen leichten Teller hoch laufen.\n\nFür pflanzlichen Brunch ist **Plant Shack** an der Carrer de Dameto (4,8 Sterne) ein angesehenes veganes Café mit Smoothie-Bowls, Toasts und gutem Kaffee, und **XO Bruncherie** an der Plaça de la Navegació (4,8 Sterne, ~495 Bewertungen) ist eine weitere starke Wahl für Rührei, Avocado-Toast und Kaffee — auch wenn, wie mehrere Rezensenten über die Brunch-Adressen des Viertels anmerken, der Grundpreis oft schnell steigt, sobald man Extras wie Ei oder Schinken hinzufügt. Für Brunch ist eine Buchung meist nicht nötig, aber die beliebten Adressen füllen sich an Wochenendvormittagen.",
    },
    {
      heading: "Abendessen: die Herausragenden",
      business_ids: [ID.azuca, ID.esencia, ID.infineat, ID.bankai],
      body: "Fürs Abendessen hat Santa Catalina einige der bestbewerteten Küchen Palmas. **Azuca - Urban Bistro** an der Carrer de la Fàbrica (5,0 Sterne, ~1.435 Bewertungen) ist ein reines Abend-Bistro mit einer bemerkenswerten Bewertung, gelobt für kreative Teller im Tapas-Stil (Artischocken, Tacos), herzlichen Service und, wie Rezensenten anmerken, faire Preise für die Qualität — eine der besten Allround-Adressen des Viertels. **Bistro Esencia** an der Carrer de Sant Magí (4,8 Sterne) ist eine kleine, intime Adresse mit einem kreativen Degustationsmenü mit Weinbegleitung, das Rezensenten wiederholt als Höhepunkt ihrer Reise bezeichnen, gut geeignet für ein besonderes Abendessen.\n\n**Infineat** an der Carrer de la Fàbrica (4,8 Sterne) ist ein Fusion-Restaurant, das asiatische und lokale Aromen in einfallsreichen kleinen Tellern verbindet, von mehreren Rezensenten als beinahe Michelin-Erlebnis beschrieben, und **Bankai Palma** (5,0 Sterne) ist eine hoch bewertete moderne Sushi- und Adresse im japanischen Stil an der Carrer de Cotoner. Diese sind auf das Abendessen ausgerichtet und beliebt, eine Vorausbuchung ist also ratsam, besonders an Wochenenden.",
    },
    {
      heading: "Italienisch, Burger und legere Abendessen",
      business_ids: [ID.mamas, ID.burguesa],
      body: "Für legerere Abendessen deckt das Viertel die Publikumslieblinge gut ab. **Mama's Santa Catalina** an der Carrer de Sant Magí (4,8 Sterne, ~1.225 Bewertungen) ist ein beliebter Italiener mit lebhafter Terrasse, gelobt für authentische Pizza und eine gute Weinkarte — auch wenn einige Rezensenten anmerken, dass die Preise für Pizza im oberen Bereich liegen, es ist also eher ein Genuss als ein günstiges Essen. **La Nueva Burguesa**, ebenfalls an der Sant Magí (4,8 Sterne, ~2.590 Bewertungen), ist eine der bestbewerteten Burger-Adressen Palmas, mit hausgemachten Soßen aus Marktprodukten, vielen glutenfreien Optionen und, da sind sich Rezensenten einig, wirklich ausgezeichneten Burgern — eine Buchung wird empfohlen, da es voll wird.\n\nDies sind die Adressen für ein entspanntes Abendessen ohne Anlass mit einer Gruppe oder Familie, zu Preisen unter den Degustationsmenü-Restaurants oben. Zwischen den beiden ist Mama's die Wahl für einen Pizzaabend auf der Terrasse und La Nueva Burguesa für einen herausragenden legeren Burger.",
    },
    {
      heading: "Ist Santa Catalina teuer, und muss man reservieren?",
      business_ids: [],
      body: "Santa Catalina ist eines der begehrtesten Viertel Palmas, oberhalb des größten Yachthafens der Stadt gelegen, und die Preise spiegeln das wider — es tendiert etwas höher als der Durchschnitt in Palma, besonders die Brunch-Adressen, wo sich die Extras summieren, und die teureren italienischen und Degustationsmenü-Restaurants. Dennoch ist es nicht durchweg teuer: An den Marktbars, den Tapas- und Vermut-Adressen und bei den legeren Abendessen zu essen hält die Kosten vernünftig, und das herausragende Azuca wird von Rezensenten als gutes Preis-Leistungs-Verhältnis für seine Qualität angemerkt.\n\nZur Buchung: Die Marktbars, Brunch-Cafés und Tapas-Adressen sind weitgehend ohne Reservierung, auch wenn die beliebten sich an Wochenendvormittagen und -abenden füllen. Die herausragenden Abendadressen — Azuca, Bistro Esencia, Bankai — sind klein und gut besucht, eine Vorausbuchung lohnt sich also wirklich, besonders an Wochenenden und in der Hochsaison. Als allgemeine Regel: Reservieren Sie für ein Abendessen im Sitzen und kommen Sie einfach (etwas früher) für Brunch und Tapas.",
    },
  ],
  faqs: [
    { question: "Was sind die besten Restaurants in Santa Catalina, Palma?", answer: "Fürs Abendessen sind Azuca - Urban Bistro (5,0 Sterne) und Bistro Esencia die Herausragenden, mit Infineat und Bankai für kreative Fusion und Sushi. Für Tapas sind La Mona Vermuteria und Tapas Palma verlässlich; für Brunch El Perrito und XO Bruncherie; und Mama's (Italienisch) und La Nueva Burguesa (Burger) für legere Abendessen. Der Mercat de Santa Catalina selbst ist ideal für ein Marktessen. Buchen Sie für die Abendadressen vor." },
    { question: "Ist Santa Catalina teuer?", answer: "Es tendiert etwas höher als der Durchschnitt in Palma, als eines der begehrtesten Viertel der Stadt oberhalb des Haupt-Yachthafens — besonders die Brunch-Adressen (wo sich die Extras summieren) und die teureren italienischen und Degustationsmenü-Restaurants. Aber es ist nicht durchweg teuer: Die Marktbars, Tapas- und Vermut-Adressen und legeren Abendessen halten die Kosten vernünftig, und einige Herausragende wie Azuca werden als gutes Preis-Leistungs-Verhältnis für die Qualität angemerkt." },
    { question: "Lohnt sich ein Besuch des Mercat de Santa Catalina?", answer: "Ja, besonders am Vormittag. Es ist Palmas ältester überdachter Markt (von 1920), ein echter arbeitender Markt, auf dem Einheimische und Köche einkaufen, mit Bars im Inneren, die Essen aus den eigenen Produkten des Marktes servieren — Vermoutique ist herausragend für Vermut und Tapas. Er ist Montag bis Samstag geöffnet, etwa von 7 bis 15–16 Uhr (samstags früher) und sonntags geschlossen, es ist also ein Ziel für Frühstück bis Mittag. Gehen Sie vor etwa 10:30 Uhr für das ruhigste, lokalste Erlebnis." },
    { question: "Wo gibt es den besten Brunch in Santa Catalina?", answer: "El Perrito an der Carrer d'Anníbal ist eine der Brunch-Institutionen des Viertels, bekannt für Eggs Benedict und Matcha. XO Bruncherie und Plant Shack (vegan) sind ebenfalls hoch bewertet, und Santina ist beliebt für Turkish Eggs und gesunde Bowls. Beachten Sie, dass die Grundpreise an den Brunch-Adressen steigen können, sobald man Extras wie Ei oder Schinken hinzufügt. Eine Buchung ist meist nicht nötig, aber die beliebten Adressen füllen sich an Wochenendvormittagen." },
  ],
  seo: {
    title: "Die besten Restaurants in Santa Catalina, Palma 2026",
    description: "Wo Sie in Santa Catalina, Palma essen: der Markt, Tapas, Brunch und herausragende Abendessen. Ehrliche Tipps, Preise und ob man reservieren muss.",
  },
  status: "published",
  source: "claude_browser",
  is_featured: false,
  hero_image_url: hero,
  updated_at: new Date().toISOString().slice(0, 10),
  imported_at: new Date().toISOString(),
};

const { error } = await sb.from("guides").insert(guide);
if (error) { console.error("Error:", error); process.exit(1); }
console.log("✓ Published:", guide.slug, "(" + guide.locale + ")");
console.log("  Sections:", guide.sections.length, "| FAQs:", guide.faqs.length, "| business_ids:", guide.sections.flatMap(s => s.business_ids).length, "| hero:", hero ? "set" : "none");
