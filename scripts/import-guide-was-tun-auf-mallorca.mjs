// scripts/import-guide-was-tun-auf-mallorca.mjs
// DE version of que-hacer-en-mallorca (EN/ES live). Same verified facts and
// business_ids as the EN source (updated 2026-07-03); natively adapted, not
// machine-translated. German slug per the guide-writing playbook; the slug
// pair is registered in src/lib/guide-alternates.ts for hreflang.
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

const slug = "was-tun-auf-mallorca";
const locale = "de";

const guide = {
  id: "de-was-tun-auf-mallorca",
  slug,
  locale,
  title: "Was tun auf Mallorca? Die besten Aktivitäten 2026",
  excerpt:
    "Der praktische Guide zu Mallorcas besten Aktivitäten 2026: Eintrittspreise, Buchungstipps, Saisonhinweise und geprüfte Empfehlungen für Kultur, Natur und Abenteuer.",
  intro:
    "Mallorca hat über 200 Strände und Buchten — und trotzdem verbringen viele Erstbesucher den halben Urlaub in der falschen Warteschlange zur falschen Jahreszeit. Zur Orientierung: Der Eintritt in die Kathedrale von Palma (La Seu) kostet rund 10 € pro Erwachsenem, die Cuevas del Drach verlangen 18 € — und sind an Sommervormittagen ohne Vorausbuchung komplett ausgebucht. Die Rückfahrkarte des Tren de Sóller ab Palma kostet online 30 €, das Kombiticket Zug plus Straßenbahn bis Port de Sóller 40 €. Dieser Guide erklärt, wie Mallorcas Aktivitäten-Landschaft wirklich funktioniert — von Höhlensystemen über die historische Eisenbahn bis zu Wassersport und Abendshows — damit Sie mit echter Logistik planen statt mit Wunschdenken.",
  sections: [
    {
      heading: "Wie Mallorcas Aktivitäten organisiert sind — und was das für Ihre Planung bedeutet",
      body:
        "Mallorcas Aktivitäten teilen sich sauber in vier Kategorien: Kultur und Geschichte (konzentriert auf Palma und die Altstädte), Naturattraktionen (die drei großen Höhlensysteme im Osten und Nordosten), Outdoor- und Wasseraktivitäten (inselweit, am besten von April bis Oktober) und Abendunterhaltung (rund um die Ferienorte im Südwesten). Welche Kategorie Sie vor sich haben, entscheidet darüber, wie früh Sie handeln müssen. Kulturstätten wie die **Catedral-Basílica de Santa María de Mallorca** und das **Castillo de Bellver** lassen sich in der Nebensaison meist noch am selben Tag besuchen — im Juli und August, wenn Kreuzfahrttage und Hochsaison zusammenfallen, geht ohne Online-Ticket dagegen wenig. Die Dachterrassen-Führung der Kathedrale etwa gibt es nur von Mai bis Oktober, und an klaren Sommertagen ist sie schnell ausverkauft.\n\nDie Höhlensysteme — **Cuevas del Drach**, **Cuevas de Artà** und **Cuevas Dels Hams** — arbeiten ganztägig mit Gruppenführungen zu festen Zeiten. Die Cuevas del Drach in Porto Cristo sind Mallorcas meistbesuchte Naturattraktion: Erwachsene zahlen 18 €, Kinder (2–12) 11 €. Die offizielle Website bietet einen Online-Rabatt und — entscheidend — die Reservierung eines festen Zeitfensters; die Vormittagstermine im Juli und August sind regelmäßig ausverkauft. In allen drei Höhlen liegt die Temperatur ganzjährig zwischen 17 °C und 21 °C — praktisch an Regentagen und in der Sommerhitze. Die Cuevas de Artà bei Canyamel sind kleiner, deutlich ruhiger und werden für die Qualität ihrer mehrsprachigen Führungen gelobt — die bessere Wahl für Familien, die mehr Erklärung und weniger Schlange wollen.\n\nOutdoor-Aktivitäten — Stand-up-Paddle- und Schnorcheltouren mit Anbietern wie **GoFurgo.tours**, Quad-Touren mit **Mallorquad** und Bootsausflüge entlang der Küste — laufen fast ausschließlich in Kleingruppen. Meist bleiben die Gruppen unter 12 Personen, Guides sind inklusive, Saison ist je nach Seegang etwa April bis Oktober. Für Residenten und Langzeitgäste sind das übrigens die Aktivitäten, die auch beim zweiten und dritten Mal tragen: andere Route, andere Buchten, mehr Erlebnis als Abfertigung.",
      business_ids: []
    },
    {
      heading: "Saisonzeiten, Preisrahmen und die häufigsten Planungsfehler",
      body:
        "Der größte Planungsfehler auf Mallorca ist, alle Monate gleich zu behandeln. Juli und August liefern das beste Strandwetter — Wassertemperaturen von 25–27 °C und Tageslicht bis nach 21 Uhr — aber jede größere Attraktion läuft am Kapazitätslimit. Organisierte Touren mit Transfer zu den Cuevas del Drach ab Palma kosten in der Hochsaison 45–65 € pro Person; auf eigene Faust sind es 18 € Eintritt. Der **Tren de Sóller** ist das Paradebeispiel für Saisonlogik: Die Rückfahrkarte Palma–Sóller kostet online 30 €, das Kombiticket mit Straßenbahn nach Port de Sóller 40 € — aber nur die Abfahrt um 10:10 Uhr hält planmäßig am Aussichtspunkt Mirador des Pujol den Banya mit Talblick, und genau diese ist zuerst voll. Von Mitte Dezember bis Ende Januar steht der Zug wegen Wartung komplett still.\n\nFür Residenten und alle, die länger auf der Insel leben, rechnet sich vieles anders. Das **Castillo de Bellver** ist sonntags gratis (sonst 4 € Eintritt). Die Kathedrale von Palma bietet freitags freien Eintritt für Residenten und Gebürtige der Diözese (Ticket trotzdem nötig). Die balearische Übernachtungssteuer (Ecotasa) gilt nur für Gäste in touristischen Unterkünften — im 4-Sterne-Hotel etwa 4 € pro Person und Tag ab 16 Jahren — nicht aber für Residenten oder private Langzeitmieten. Abendformate wie **Pirates Adventure** in Magaluf, eine Dinner-Show mit Akrobatik und Live-Performance, sollten Sie in der Hochsaison mindestens eine Woche im Voraus buchen.\n\nPreis-Benchmarks für 2026: Kulturelle Besuche (Höhlen, Burg, Aquarium) kosten je nach Ort 4–18 € pro Erwachsenem; geführte Halbtagestouren (SUP, Quad) 50–100 € pro Person; ganztägige Bootsausflüge oder private Erlebnisse beginnen bei etwa 150 € pro Person. Das **Palma Aquarium** mit seinem großen Haibecken ist die verlässliche Halbtagesoption für Familien — besonders an bedeckten Tagen, wenn der Strandplan platzt. **Puerto de Alcúdia** — Marina-Promenade und Uferzone — kostet nichts und trägt problemlos einen entspannten Nachmittag oder frühen Abend, gerade mit Kindern oder zwischen zwei geplanten Aktivitäten.",
      business_ids: []
    },
    {
      heading: "Verified Picks auf Mallorca Verified",
      body:
        "Jeder hier gelistete Betrieb ist über echte Google-Daten verifiziert — mindestens 4,3 Sterne bei Tausenden von Rezensionen. Das sind die Orte und Veranstalter, auf die sich dieser Guide bezieht, quer durch das gesamte Aktivitäten-Angebot der Insel.",
      business_ids: [
        "google-ChIJVY-vfUWSlxIRqoH9muibDFQ",
        "google-ChIJ_aPTXrBGlhIRHXI-HoVfGpI",
        "google-ChIJd7Q-FHGSlxIRof_ZMNOu1sg",
        "google-ChIJ0aPV-5yWlxIRM0tN163W2is",
        "google-ChIJ-wrbT4sVlhIRMQ4M4u-KPWU",
        "tren-soller",
        "google-ChIJd_NUQiaJlxIRZsPKyq1HjcQ",
        "google-ChIJnc0_gU-SlxIRrJYz4R7JujE",
        "google-ChIJU6krB4wslhIR7btwUzMAGoQ",
        "google-ChIJddKyaYZIlhIRibSYYAMh-wE",
        "google-ChIJZ7mOCbmXlxIR9wMQOxW-bjY",
        "google-ChIJ3wYWdL6JlxIRZsOPeXwPTc0"
      ]
    }
  ],
  faqs: [
    {
      question: "Was kann man auf Mallorca machen?",
      answer:
        "Die konstant am besten bewerteten Aktivitäten auf Mallorca 2026 verteilen sich auf drei Bereiche: Kultur in Palma (Kathedrale La Seu, Castillo de Bellver, Museo de La Seu), die Höhlensysteme im Osten (Cuevas del Drach in Porto Cristo, Cuevas de Artà bei Canyamel, Cuevas Dels Hams bei Manacor) und Outdoor-Erlebnisse inselweit — darunter die historische Eisenbahn Tren de Sóller, SUP- und Schnorcheltouren zu Buchten sowie geführte Quad-Routen. Für Familien sind das Palma Aquarium und ein Nachmittag am Puerto de Alcúdia verlässliche, unkomplizierte Optionen. Als Abendprogramm ist die Dinner-Show Pirates Adventure in Magaluf ein eigenständiges Erlebnis, das man im Voraus buchen sollte."
    },
    {
      question: "Was kosten Aktivitäten auf Mallorca 2026?",
      answer:
        "Kulturelle Attraktionen kosten 4–18 € pro Erwachsenem: Castillo de Bellver 4 € (sonntags gratis), die Kathedrale von Palma rund 10 €, die Cuevas del Drach 18 € für Erwachsene und 11 € für Kinder von 2–12 Jahren. Der Tren de Sóller kostet 23 € einfach bzw. 30 € hin und zurück (Palma–Sóller), das Kombiticket mit Straßenbahn nach Port de Sóller 40 €. Geführte Halbtagestouren (SUP, Quad, Schnorcheln) liegen bei 50–100 € pro Person; organisierte Tagestouren zu den Höhlen ab Palma inklusive Transfer bei 45–65 €. Kostenlos sind alle Strände Mallorcas, die Uferpromenade von Puerto de Alcúdia und der Sonntagseintritt ins Castillo de Bellver."
    },
    {
      question: "Muss man Aktivitäten auf Mallorca im Voraus buchen?",
      answer:
        "Bei Attraktionen mit festen Zeitfenstern wie den Cuevas del Drach und dem Tren de Sóller ist Vorausbuchung auch für Residenten sinnvoll — vor allem an Wochenenden von Mai bis September. Die 10:10-Uhr-Abfahrt des Tren de Sóller (die einzige mit planmäßigem Halt am Aussichtspunkt) ist zuerst ausverkauft und lässt sich online nur bis zu 7 Tage im Voraus buchen. Residenten profitieren von Gratis-Tagen: Castillo de Bellver jeden Sonntag, die Kathedrale freitags für Residenten und Gebürtige der Diözese. Die Ecotasa gilt nicht für Inselresidenten, sondern nur für Gäste in lizenzierten touristischen Unterkünften."
    },
    {
      question: "Cuevas del Drach oder Cuevas de Artà — welche Höhle lohnt sich mehr?",
      answer:
        "Die Cuevas del Drach sind die bekanntere und spektakulärere Wahl: Das Höhlensystem erstreckt sich über 1.200 Meter, und auf dem Martel-See — einem der größten unterirdischen Seen Europas — gibt es ein klassisches Live-Konzert von Booten aus. Die Cuevas de Artà sind kleiner, deutlich weniger überlaufen und werden konstant für die Qualität ihrer mehrsprachigen Führungen gelobt. Wer das Spektakel will und Menschenmengen aushält (im Sommer vorbuchen!), wählt die Cuevas del Drach. Wer einen ruhigeren, informativeren Besuch mit besserem Guide-Kontakt und kürzeren Wartezeiten vorzieht — etwa mit jüngeren Kindern — fährt mit den Cuevas de Artà besser."
    }
  ],
  seo: {
    title: "Was tun auf Mallorca? Die besten Aktivitäten 2026 | Mallorca Verified",
    description:
      "Die besten Aktivitäten auf Mallorca 2026: Eintrittspreise, Buchungstipps, Tropfsteinhöhlen, Tren de Sóller, Kultur in Palma und geprüfte Outdoor-Erlebnisse."
  },
  status: "published",
  source: "editorial",
  is_featured: true,
  hero_image_url: "https://wpavlaukshgdzqycmmrc.supabase.co/storage/v1/object/public/guide-heroes/f590553ef0db7e1c.jpg",
  updated_at: "2026-07-24",
  created_at: new Date().toISOString(),
  imported_at: new Date().toISOString()
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", slug).eq("locale", locale).maybeSingle();
if (existing) {
  console.log(`Ya existe ${locale}/${slug} — sin cambios.`);
} else {
  const { error } = await sb.from("guides").insert(guide);
  if (error) throw error;
  console.log(`Publicada ${locale}/${slug}: "${guide.title}"`);
}
