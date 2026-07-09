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
  sis:      "google-ChIJ10U6ktrDlxIRehKj5yXQpmY",
  trastero: "google-ChIJ_RN8PQTClxIRF9LRaXN126k",
  gallardo: "google-ChIJtYwPxGrDlxIRJilPGoMhZSA",
  terramar: "google-ChIJT2KVi7bDlxIR1MM1wDjF5CU",
  traffic:  "google-ChIJBWfiphzClxIRep50kujhmBM",
  bufala:   "google-ChIJKdy4bBzClxIRZl-NWjd7iak",
  forastera:"google-ChIJm3cGcL-TlxIRvSDL0o4R8Mk",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-restaurants-alaro-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-alaro-2026",
  locale: "de",
  title: "Die besten Restaurants in Alaró 2026",
  excerpt: "Alaró spielt kulinarisch über seiner Größe. Wo Sie in diesem Dorf am Fuß der Tramuntana essen — das perfekte Mittagessen vor oder nach der Wanderung zur Burg.",
  intro: "Alaró ist ein lebendiges Dorf am Fuß der Serra de Tramuntana, etwa 40 Minuten von Palma, am bekanntesten für die dramatische Wanderung hinauf zur Burgruine Castell d'Alaró auf dem Felsen darüber. Es ist zugleich ein echtes kulinarisches Ziel für sich geworden, mit einer Ansammlung guter Restaurants rund um seine zwei Plätze — Plaça de la Vila und Plaça d'es Mercat —, von einem Italiener, den ein echter italienischer Koch führt, bis zu einer Craft-Brauerei und einem herausragenden Brunch-Ort. Dieser Leitfaden zeigt, wo Sie im Dorf gut essen, ob Sie ein Mittagessen nach dem Burgaufstieg oder ein Abendessen an einem Platz wollen, und ist auch ein beliebter Stopp für Radfahrer, die durch die Tramuntana fahren.",
  sections: [
    {
      heading: "Die Spitzenreiter: Sis Market Café und El Trastero",
      business_ids: [IDS.sis, IDS.trastero],
      body: "Zwei Orte führen das Dorf im Verhältnis von Qualität und Beständigkeit an. **Sis Market Café** an der Plaça d'es Mercat (4,8 Sterne, ~355 Bewertungen) ist das bestbewertete, ein Café-Restaurant mit schönem Innenhof, von Rezensenten gelobt für ausgezeichneten Brunch, Sandwiches, Kaffee und einen herzlichen Empfang, mit Öffnung auch an Wochenendabenden — eine Reservierung wird empfohlen, da es voll wird. **El Trastero Cuina Bar** an der kleinen Plaça de Cabrit i Bassa (4,7 Sterne, ~550 Bewertungen) ist ein Favorit fürs Abendessen, wobei Rezensenten frisches, gut zubereitetes Essen zu gutem Preis-Leistungs-Verhältnis, herzliche Gastgeber und eine schöne Außenlage mit Blick aufs Dorfleben hervorheben (Trinkgeld nur in bar).\n\nZusammen decken sie den Tag ab: Sis Market für einen Brunch oder ein Mittagessen tagsüber, El Trastero für ein entspanntes Abendessen an einem ruhigen Platz. Beide sind die sichersten Allround-Wahlen in Alaró und die, die man in der Saison vorab buchen sollte.",
    },
    {
      heading: "Italienisch richtig gemacht: Gallardo und La Bufala",
      business_ids: [IDS.gallardo, IDS.bufala],
      body: "Alaró hat zwei italienische Optionen, beide kennenswert. **Gallardo Restaurante Pizzeria** an der Plaça d'es Mercat (4,6 Sterne, ~295 Bewertungen) ist der Star — Rezensenten nennen es wiederholt das beste Restaurant im Dorf, im Alleingang von einem echten italienischen Koch gekocht, mit kreativen Gerichten jenseits des Üblichen, Pizza im römischen Stil in rechteckiger Form, einer guten Weinkarte und einer schönen Außenlage. Es ist auf das Abendessen ausgerichtet, und eine Reservierung wird empfohlen. **La Bufala** (4,3 Sterne, ~860 Bewertungen) ist der volumenstärkere, lockerere Italiener, in einem charmanten Innenhof, mit traditioneller Pizza und Pasta, großen Portionen und einem familienfreundlichen Innenhof — eine verlässliche, entspannte Wahl.\n\nZwischen den beiden ist Gallardo das, was man für ein besonderes, einfallsreiches italienisches Abendessen bucht, während La Bufala die einfache, publikumsfreundliche Option für einen lockeren Pizzaabend mit einer Gruppe oder Kindern ist.",
    },
    {
      heading: "Grill, lokale Klassiker und eine Craft-Brauerei",
      business_ids: [IDS.terramar, IDS.traffic, IDS.forastera],
      body: "Für einen mallorquinischen Grill lockt **Restaurant Terra Mar & Foc** (4,6 Sterne, ~400 Bewertungen) die Leute mit dem Duft des Holzkohlegrills von der Straße herein und serviert frisch gegrilltes Fleisch und Fisch, Tapas und großzügige Portionen — auch wenn ein oder zwei jüngere Rezensenten finden, die Preise seien gestiegen, es lohnt sich also, das zu prüfen. An der Plaça de la Vila ist **Restaurant Traffic** (4,3 Sterne) ein alteingesessener lokaler Favorit fürs Essen am Platz, durchweg gelobt für Grillgerichte, Paella und freundlichen Service an einem von Einheimischen genutzten Ort.\n\nFür etwas anderes ist **Forastera** eine kleine Craft-Brauerei und Brewpub, wo der Inhaber das Bier selbst braut und daneben guten Kaffee, Frühstück und hausgemachtes Essen serviert — ein einladender, familiärer Treffpunkt und ein bekannter Stopp für Rennradfahrer, die durch Alaró fahren. Die Öffnungszeiten sind begrenzt und können saisonal sein, prüfen Sie sie also, bevor Sie gezielt hinfahren.",
    },
    {
      heading: "Das Mittagessen mit der Wanderung zum Castell d'Alaró verbinden",
      business_ids: [],
      body: "Die meisten kommen wegen des **Castell d'Alaró** nach Alaró, der Burgruine auf dem Felsen hoch über dem Dorf, und eine Mahlzeit im Ort verbindet sich natürlich mit dem Aufstieg. Die volle Wanderung vom Dorf dauert etwa zwei Stunden hinauf, über eine Mischung aus Straße und unebenen Bergpfaden, oder Sie fahren einen Teil einer schmalen (aber asphaltierten) Straße hinauf zu einem Parkplatz nahe dem Restaurant Es Verger und gehen das letzte Stück — etwa eine Stunde von dort. Oben gibt es atemberaubende Panoramablicke über einen Großteil der Insel, ein paar Bänke und einen kleinen Kiosk mit Getränken und Snacks, der bekanntlich von Eseln beliefert wird.\n\nDer klassische Plan ist, morgens in der Kühle zu wandern und dann für ein spätes Mittagessen ins Dorf hinabzukommen — Sis Market Café oder Restaurant Traffic sind gut auf eine Mahlzeit nach der Wanderung eingestellt. Nehmen Sie viel Wasser mit, da es ungeschützt ist und der Kiosk oben knapp werden kann. Alaró ist auch ein beliebter Auftankstopp für Radfahrer, weshalb lockere Orte wie Forastera und die Dorfcafés den ganzen Tag über gut besucht sind.",
    },
  ],
  faqs: [
    { question: "Was sind die besten Restaurants in Alaró?", answer: "Sis Market Café (4,8 Sterne) ist das bestbewertete für Brunch und Mittagessen, und El Trastero Cuina Bar (4,7 Sterne) ist ein Favorit fürs Abendessen an einem ruhigen Platz. Für Italienisch wird Gallardo wiederholt das beste Restaurant im Dorf genannt, von einem echten italienischen Koch gekocht, während La Bufala die lockerere Innenhof-Option ist. Restaurant Terra Mar & Foc ist die Wahl für einen Holzkohlegrill, und Forastera ist eine charaktervolle Craft-Brauerei mit gutem Essen." },
    { question: "Lohnt sich Alaró?", answer: "Ja — Alaró ist eines der lohnendsten Dörfer am Fuß der Tramuntana, am bekanntesten für die dramatische Wanderung hinauf zur Burgruine Castell d'Alaró mit Panoramablick über die Insel und zunehmend für sein Essen. Etwa 40 Minuten von Palma, verbindet es eine echte Dorfatmosphäre mit einer Ansammlung guter Restaurants an seinen Plätzen und ist damit ideal für einen Tagesausflug, der den Burgaufstieg mit einem langen Mittagessen verbindet." },
    { question: "Wie weit ist Alaró von Palma?", answer: "Alaró ist etwa 40 Autominuten von Palma entfernt, in den Ausläufern der Serra de Tramuntana. Es ist ein einfacher Tagesausflug und ein beliebter für die Wanderung zum Castell d'Alaró in Kombination mit einem Mittagessen im Dorf. Es ist auch ein bekannter Stopp auf Radrouten durch die Tramuntana, sodass seine Cafés und lockeren Orte den ganzen Tag über mit Radfahrern gut besucht sind." },
    { question: "Muss man in Alaró reservieren?", answer: "Für die beliebtesten Orte ja — Sis Market Café, El Trastero und Gallardo werden alle voll, und eine Reservierung wird empfohlen, besonders an Wochenenden und fürs Abendessen in der Saison. Mehrere Restaurants in Alaró schließen zudem ein oder zwei Tage unter der Woche, und einige öffnen nur abends, es lohnt sich also, die Öffnungstage vorab zu prüfen, besonders wenn Sie Ihre Mahlzeit mit der Burgwanderung verbinden." },
  ],
  seo: {
    title: "Die besten Restaurants in Alaró 2026 | Mallorca Verified",
    description: "Wo Sie in Alaró essen, Mallorca: die besten Restaurants an den Plätzen, vom italienischen Koch Gallardo bis zum Brunch im Sis Market — plus die Wanderung zum Castell d'Alaró.",
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
