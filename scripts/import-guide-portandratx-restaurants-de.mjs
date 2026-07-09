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
  garden:"google-ChIJKyJVRvIhmBIRHLUDFGMfer4",
  fortuna:"google-ChIJwyxjirInmBIRNOPwrLdAh0M",
  universal:"google-ChIJFVzzOuknmBIRbciP8P141Qw",
  casaTon:"google-ChIJq6lHufYhmBIRAUSfKB1jlTw",
  gallega:"google-ChIJDz143qwmmBIRsrCOyjqISaE",
  galicia:"google-ChIJD3JZJq0mmBIRHChmdSQEc88",
  viva:"google-ChIJZ-7c8X0nmBIR4OT7sidfIpQ",
  canPaco:"google-ChIJMyb5SvogmBIR3GXsnPWpFUs",
  raco:"google-ChIJR8l0-XAhmBIRAfhFG9QOlqo",
  barCubano:"google-ChIJh8ACNWOKlxIRKa9z1mvQM3A",
};

const { data: enGuide } = await sb.from("guides").select("hero_image_url").eq("slug","best-restaurants-port-andratx-2026").eq("locale","en").maybeSingle();
const hero = enGuide?.hero_image_url ?? null;

const { data: existing } = await sb.from("guides").select("id").eq("slug","best-restaurants-port-andratx-2026").eq("locale","de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-restaurants-port-andratx-2026",
  locale: "de",
  title: "Die besten Restaurants in Port d'Andratx 2026",
  excerpt: "Wo Sie in der gehobenen Marina-Stadt im Südwesten Mallorcas essen — Fisch und Küche am Hafen sowie die günstigeren, lokalen Optionen eine kurze Fahrt landeinwärts.",
  intro: "Port d'Andratx ist eine gehobene Marina-Stadt an der Südwestspitze Mallorcas, etwa 30–35 Minuten von Palma, bekannt für ihren yachtgesäumten Hafen, Zweitwohnsitze und eine entsprechend bepreiste Gastronomie. Es ist einer der teureren Orte der Insel zum Essengehen, besonders die Restaurants direkt am Wasser, wo Sie ebenso für den Hafenblick wie für das Essen zahlen. Dennoch gibt es hier wirklich guten Fisch, ein paar preiswerte Ausnahmen und günstigere, lokale Optionen eine kurze Fahrt landeinwärts im Altstadtkern von **Andratx** selbst. Dieser Leitfaden trennt die Hafenrestaurants von den preiswerteren Alternativen und ist ehrlich dabei, wofür Sie zahlen und wo.",
  sections: [
    {heading:"Am Hafen: die Restaurants am Wasser",business_ids:[ID.garden,ID.fortuna,ID.universal],body:"Die erste Adresse fürs Essen liegt entlang der **Avinguda Almirante Riera Alemany** und der Promenade, wo die Restaurants direkt über dem Wasser sitzen. **Garden del Mar** (4,8 Sterne, ~80 Bewertungen) ist eine gut bewertete Adresse am Wasser mit frischem Fisch, Sushi und mediterranen Gerichten, wobei Rezensenten die Tische in erster Reihe am Hafen und die frischen Zutaten hervorheben, aber anmerken, dass der Service entspannt sein kann. **Fortuna** (4,8 Sterne, ~255 Bewertungen) ist ein alteingesessenes Fischrestaurant am Hafen, gelobt für Thunfisch-Tatar, gegrillten Fisch und Tempura-Garnelen, mit einem guten Menü, das mehrere Rezensenten überraschend preiswert nennen — auch wenn, wie bei vielen gut besuchten Adressen am Wasser, einige langsamen Service zu Stoßzeiten berichten.\n\n**La Universal** (4,7 Sterne, ~310 Bewertungen) ist ein etwas feineres Restaurant am Hafen mit Entenröllchen, Jakobsmuscheln und Wolfsbarsch unter den von Rezensenten geschätzten Gerichten, und es ist ehrlich anzumerken, dass Rezensenten selbst sagen, die Preise lägen etwas höher als bei den Nachbaradressen, ihrer Ansicht nach durch die Qualität gerechtfertigt. Dies sind die Tische für das klassische Port-d'Andratx-Erlebnis: Abendessen über dem Wasser mit Blick auf die Boote, zu Preisen der ersten Reihe."},
    {heading:"Fisch- und Meeresfrüchte-Spezialisten",business_ids:[ID.casaTon,ID.gallega,ID.galicia],body:"Port d'Andratx hat eine Ansammlung spezialisierter Fisch- und Meeresfrüchterestaurants, mehrere im galicischen Stil (die Galicier sind Spaniens Meeresfrüchte-Spezialisten). **Casa Ton** (4,7 Sterne, ~165 Bewertungen) ist eine kleine, persönliche Adresse, wo der Inhaber Toni am selben Tag gefangenen Fisch serviert, einfach mit Salat und Kartoffeln zubereitet, und Rezensenten heben immer wieder die roten Garnelen hervor — auch wenn ein oder zwei anmerken, dass die einfache Präsentation einen hohen Preis hat, es eignet sich also für alle, die Qualität über Beiwerk stellen. **Marisquería La Gallega** (4,4 Sterne, ~710 Bewertungen) und **Marisquería Galicia** (4,2 Sterne, ~650 Bewertungen) sind die zwei alteingesessenen galicischen Fischhäuser direkt neben dem Hafen an der Carrer Isaac Peral, beide mit gegrilltem Fisch, Langustinen, Paella und Meeresfrüchten für eine Mischung aus Einheimischen und Besuchern.\n\nBei den beiden Marisquerías beschreiben Rezensenten frischen Fisch (teils aus Galicien eingeflogen) und großzügige Portionen, zu Preisen, die sie für die Stadt allgemein als vernünftig bezeichnen — auch wenn es, da es Port d'Andratx ist, immer noch nicht günstig ist, wobei mehrere die üblichen Aufschläge einer Hafenstadt auf Extras wie Wasser anmerken. Für eine auf Fisch fokussierte statt einer aussichts-orientierten Mahlzeit sind dies die Wahl."},
    {heading:"Herausragendes Preis-Leistungs-Verhältnis: Restaurante Viva",business_ids:[ID.viva],body:"Ein Restaurant im Hafenbereich sticht dadurch hervor, dass es Qualität mit Preis-Leistung verbindet: **Restaurante Viva** (4,9 Sterne, ~220 Bewertungen), eine kleine Fusion-Adresse etwas zurück vom Wasser an der Carrer Isaac Peral. Rezensenten heben fachkundig zubereitete, kreative Gerichte, eine starke Weinkarte und eine herzliche, inhabergeführte Atmosphäre hervor — mit einem Drei-Gänge-Menü, das mehrere als ausgezeichnetes Preis-Leistungs-Verhältnis bei etwa 27–40 € pro Person beschreiben, deutlich weniger als die Tische am Wasser bei vergleichbarer Qualität. Der Inhaber ist dafür bekannt, am Ende des Service zu singen, was Rezensenten liebevoll erwähnen.\n\nEs ist auf das Abendessen ausgerichtet, klein und beliebt, eine Vorausbuchung ist also ratsam. Für alle, die eine wirklich gute Mahlzeit in Port d'Andratx ohne den vollen Aufschlag am Wasser wollen, ist dies die Adresse, die Rezensenten am durchgängigsten sowohl beim Essen als auch beim Preis bewerten — ein nützlicher Gegenpol zu den Adressen am Hafen."},
    {heading:"Günstiger und lokal: der Altstadtkern von Andratx",business_ids:[ID.canPaco,ID.raco,ID.barCubano],body:"Für einen echten Preissturz fahren Sie 4 km landeinwärts in den Altstadtkern von **Andratx** selbst, wo die Restaurants ein lokaleres Publikum zu deutlich niedrigeren Preisen als der Hafen bedienen. **Mesón Can Paco** (4,3 Sterne, ~830 Bewertungen) ist ein traditionelles Restaurant mit Terrassenblick am Hang, wiederholt gelobt für seine Paella, großzügige Portionen und, wie Rezensenten betonen, sehr vernünftige Preise — ein deutlicher Kontrast zum Hafen. **Es Racó d'es Puput** (4,6 Sterne, ~300 Bewertungen) ist eine kleine, beliebte Adresse für frisches hausgemachtes Essen zu fairen Preisen, gut für ein entspanntes Mittagessen.\n\nIm historischen oberen Teil der Stadt ist **Bar Cubano** (4,5 Sterne, ~880 Bewertungen) an der Plaça des Pou eine freundliche Café-Bar für Kaffee, Frühstück und Tapas, die Rezensenten für die Lage überraschend gut finden, zu Alltagspreisen. In der Stadt Andratx statt im Hafen zu essen ist der ehrliche Tipp für alle, die gutes lokales Essen ohne den Marina-Aufschlag wollen — Sie tauschen den Hafenblick gegen besseres Preis-Leistungs-Verhältnis und ein lokaleres Gefühl."},
    {heading:"Ist Port d'Andratx teuer, und muss man reservieren?",business_ids:[],body:"Um es direkt zu sagen: Ja, Port d'Andratx ist einer der teureren Orte Mallorcas zum Essen, und besonders die Restaurants am Wasser verlangen einen Aufschlag für ihre Hafenlage — Rezensenten merken regelmäßig an, dass die Dinge hier 'standardmäßig teuer' sind, mit Aufschlägen selbst auf Basics wie abgefülltes Wasser. Das ist kein Grund, es zu meiden, aber es lohnt sich, mit realistischen Erwartungen hinzugehen: Am Hafen zahlen Sie teils für einen der schönsten Essensausblicke der Insel. Die preiswerten Optionen sind das Restaurante Viva etwas zurück vom Wasser, die galicischen Marisquerías für Fisch und der Altstadtkern von Andratx für lokale Preise.\n\nZur Buchung: Im Sommer füllen sich die beliebten Tische am Hafen und das Restaurante Viva, eine Vorausbuchung wird also empfohlen, besonders für einen Tisch am Wasser bei Sonnenuntergang oder für eine Gruppe. Viele Adressen sind auf das Abendessen ausgerichtet und einige schließen einen Tag unter der Woche, prüfen Sie also die Zeiten. Für ein Abendessen am Hafen zu einem besonderen Anlass reservieren Sie; bei den Adressen im Inland und den legeren Orten können Sie öfter einfach vorbeikommen."},
  ],
  faqs: [
    {question:"Was sind die besten Restaurants in Port d'Andratx?",answer:"Am Hafen sind Garden del Mar, Fortuna und La Universal gut bewertete Adressen am Wasser, und Casa Ton ist eine persönliche Fischadresse. Das Restaurante Viva, etwas zurück vom Wasser, sticht durch die Verbindung von hoher Qualität mit besserem Preis-Leistungs-Verhältnis hervor. Für galicischen Fisch sind Marisquería La Gallega und Marisquería Galicia die Spezialisten. Für niedrigere Preise hat der Altstadtkern von Andratx Mesón Can Paco und Es Racó d'es Puput. Eine Vorausbuchung ist im Sommer ratsam."},
    {question:"Ist Port d'Andratx teuer?",answer:"Ja — es ist einer der teureren Orte Mallorcas zum Essen, besonders die Restaurants am Wasser, wo Sie einen Aufschlag für den Hafenblick zahlen und Rezensenten Aufschläge selbst auf Basics wie Wasser anmerken. Günstiger essen Sie im Restaurante Viva etwas zurück vom Wasser, in den galicischen Fisch-Marisquerías oder indem Sie 4 km landeinwärts in den Altstadtkern von Andratx fahren, wo Orte wie Mesón Can Paco lokales Essen zu deutlich niedrigeren Preisen servieren."},
    {question:"Wo gibt es den besten Fisch in Port d'Andratx?",answer:"Für einfach zubereiteten frischen Fisch serviert Casa Ton den Tagesfang und ist für seine roten Garnelen bekannt, wenn auch zu einem hohen Preis. Die zwei alteingesessenen galicischen Marisquerías — Marisquería La Gallega und Marisquería Galicia an der Carrer Isaac Peral — sind auf gegrillten Fisch, Langustinen, Paella und Meeresfrüchte spezialisiert, teils aus Galicien eingeflogen, zu Preisen, die Rezensenten für die Stadt vernünftig nennen. Fortuna am Hafen ist ebenfalls für seinen Fisch und die Aussicht gut bewertet."},
    {question:"Gibt es günstigere Orte zum Essen in der Nähe von Port d'Andratx?",answer:"Ja — fahren Sie etwa 4 km landeinwärts in den Altstadtkern von Andratx, wo die Preise deutlich sinken. Mesón Can Paco wird für seine Paella und sehr vernünftige Preise mit Blick am Hang gelobt, Es Racó d'es Puput bietet frisches hausgemachtes Essen zu fairen Preisen, und Bar Cubano im historischen oberen Ort ist gut für Kaffee, Frühstück und Tapas zu Alltagspreisen. Am Hafen selbst bietet das Restaurante Viva das beste Verhältnis von Qualität und Preis."},
  ],
  seo: {title:"Die besten Restaurants in Port d'Andratx 2026",description:"Wo Sie in Port d'Andratx essen: Fisch und Küche am Hafen sowie preiswertere und lokale Optionen im Inland. Ehrliche Tipps, Preise und Buchungshinweise."},
  status: "published", source: "claude_browser", is_featured: false, hero_image_url: hero,
  updated_at: new Date().toISOString().slice(0,10), imported_at: new Date().toISOString(),
};

const { error } = await sb.from("guides").insert(guide);
if (error) { console.error("Error:", error); process.exit(1); }
console.log("✓ Published:", guide.slug, "(" + guide.locale + ")");
console.log("  Sections:", guide.sections.length, "| FAQs:", guide.faqs.length, "| business_ids:", guide.sections.flatMap(s=>s.business_ids).length, "| hero:", hero?"set":"none");
