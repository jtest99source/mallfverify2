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

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-sunset-spots-mallorca-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-sunset-spots-mallorca-2026",
  locale: "de",
  title: "Die besten Orte für den Sonnenuntergang auf Mallorca 2026",
  excerpt: "Mallorcas beste Sonnenuntergänge liegen an der West- und Südwestküste — vom berühmten durchlöcherten Felsen Sa Foradada bis zum ruhigen Sant Elm vor der Insel Dragonera.",
  intro: "Da die Sonne im Westen untergeht, konzentrieren sich Mallorcas beste Sonnenuntergangsorte an der West- und Südwestküste — den Klippen der Serra de Tramuntana und dem Abschnitt von Andratx bis Santa Ponça — statt im Norden oder Osten. Das sollte man wissen, bevor man eine Stunde zum falschen Ort fährt: Cap de Formentor etwa ist spektakulär, zeigt aber nach Norden und ist eher ein Ort für Sonnenaufgang und Panorama als für den Sonnenuntergang über dem Meer. Dieser Leitfaden zeigt die wirklich nach Westen ausgerichteten Orte, grob nach Aufwand geordnet, von Aussichtspunkten mit Bar, die man anfahren kann, bis zu Wanderungen, die mit Einsamkeit belohnen. Im Sommer geht die Sonne etwa zwischen 21 und 21:30 Uhr unter, im Winter näher an 17:30 Uhr, prüfen Sie also immer die genaue Uhrzeit des Tages, bevor Sie losfahren.",
  sections: [
    {
      heading: "Sa Foradada: der berühmte (Deià)",
      business_ids: [],
      body: "**Sa Foradada** — auch Na Foradada geschrieben — ist der meistfotografierte Sonnenuntergang der Insel, eine lange felsige Halbinsel auf dem Anwesen Son Marroig zwischen Valldemossa und Deià, mit einem natürlichen Loch im Felsen, durch das die untergehende Sonne scheint. Es gibt einen Aussichtspunkt direkt an der Straße und ein Bar-Restaurant (Na Foradada) auf der Klippe, dazu einen längeren Wanderweg hinunter zum Felsen selbst für alle, die der Menge auf der Hauptplattform entkommen wollen.\n\nEs liegt etwa 45 Minuten von Palma über die Ma-1110 Richtung Deià. Der Haken ist seine Berühmtheit: Es wird bei Sonnenuntergang sehr voll, und die Parkplätze entlang der Straße sind begrenzt und früh belegt, kommen Sie also deutlich vor Sonnenuntergang. Für das klassische Mallorca-Sonnenuntergangsfoto ist dies der Ort, aber wenn Sie Ruhe wollen, ist er es nicht — gehen Sie den Weg über den Hauptaussichtspunkt hinaus, um mehr Platz zu finden, oder wählen Sie einen der ruhigeren Orte weiter unten.",
    },
    {
      heading: "Mirador de Ses Barques: anfahrbar, mit Terrasse (Sóller)",
      business_ids: [],
      body: "Für einen Sonnenuntergang mit deutlich weniger Menschen und dem Komfort eines Tisches liegt der **Mirador de Ses Barques** auf 462 Metern an der Bergstraße Ma-10 zwischen Sóller und Sa Calobra. Er hat einen kleinen kostenlosen Aussichtspunkt und ein Restaurant mit Panoramaterrasse, das traditionelle mallorquinische Küche serviert, und ist mit dem Auto leicht erreichbar, mit Parkplatz direkt dort — keine Wanderung nötig.\n\nAnders als Sa Foradada liegt er zurückgesetzt über dem Meer statt an der Klippenkante, was einen weiten, gestaffelten Blick über Port de Sóller und die Küste bietet statt der Sonne, die direkt ins Wasser sinkt. Eine gute Wahl, wenn Sie einen entspannten Aperitivo mit Aussicht wollen statt eines Gerangels um einen Fotoplatz, und er funktioniert wunderbar den ganzen Tag, nicht nur bei Sonnenuntergang. Da er auf der Sóller-Seite liegt, verbindet er sich natürlich mit einem Tag im Sóller-Tal.",
    },
    {
      heading: "Sant Elm und Sa Dragonera: der Klassiker im Südwesten",
      business_ids: [],
      body: "An der Südwestspitze der Insel ist **Sant Elm** (San Telmo) ein kleines, entspanntes Küstendorf gegenüber der geschützten Insel **Sa Dragonera**, und es ist einer der lohnendsten Sonnenuntergänge Mallorcas. Das Besondere hier: Die Sonne sinkt nicht direkt ins offene Meer — sie geht hinter der langen, drachenrückenartigen Silhouette von Dragonera unter und taucht die Insel als Schatten vor einen rosa-orangen Himmel. Etwa 40 Minuten von Palma über Andratx, mit einem kleinen zentralen Parkplatz (rund 4 €) und einer Uferfront voller Bars und traditioneller Restaurants, sodass Sie einen ganzen Abend daraus machen können.\n\nFür die aufwandslose Variante gehen Sie einfach die Uferpromenade entlang und suchen sich einen Platz oder eine Terrasse. Für mehr tauscht die Wanderung hinauf zur Klosterruine **La Trapa** (etwa eine Stunde vom Dorf, mittelschwer, gutes Schuhwerk nötig) die Menge gegen Einsamkeit und einen noch weiteren Blick über Dragonera — planen Sie aber den Abstieg, da Sie ihn wahrscheinlich im Dunkeln machen, nehmen Sie also eine Lampe mit. Sant Elm eignet sich für Paare und alle, die die ruhige, authentische Seite der Insel wollen.",
    },
    {
      heading: "Einfache Aussichtspunkte nahe Palma: Santa Ponça und Cala Blava",
      business_ids: [],
      body: "Wenn Sie keine lange Fahrt wollen, liefern zwei Orte nahe Palma einen echten nach Westen gerichteten Sonnenuntergang. Der **Mirador de ses Illes Malgrats** bei Santa Ponça liegt etwa 25 Minuten von der Stadt über die Ma-1, gut ausgeschildert, mit Parkplatz in der Nähe und einem kurzen Weg zu den Klippen, wo die Sonne zwischen den kleinen Malgrats-Inseln ins Meer sinkt. Direkt am Aussichtspunkt gibt es keine Bars, bringen Sie also eigene Getränke mit — wie die meisten Einheimischen.\n\nSüdlich von Palma Richtung Llucmajor sind die Klippen von **Cala Blava** und der ruhige **Mirador des Balconet** (auch Pujador des Frares genannt) eine wenig bekannte Option, um den Sonnenuntergang in Ruhe zu erleben, abseits der belebteren Tramuntana-Orte. Beide sind die praktischen Wahlen für einen spontanen Abend, wenn Sie sich nicht auf eine über einstündige Fahrt in die Berge festlegen wollen.",
    },
    {
      heading: "Strände und Strandbars für einen barfüßigen Sonnenuntergang",
      business_ids: [],
      body: "Für den Sonnenuntergang mit den Füßen im Sand sind die nach Westen gerichteten Strände der Südküste die Wahl. **Es Trenc**, etwa 45 Minuten von Palma, ist ein langer, unbebauter Streifen, der nach Westen zeigt, was ihn zu einem schönen barfüßigen Sonnenuntergang macht, sobald sich die Tagesmenge lichtet. Näher an der Stadt fangen die Strände um **Santa Ponça** und die Buchten im Südwesten das Abendlicht gut ein und sind leicht erreichbar.\n\nWenn Sie lieber einen Cocktail in der Hand haben, hat der Südwesten Beachclubs und Klippenbars rund um die Aussicht — die Gegend um Port d'Andratx und Cala Llamp ist der klassische Streifen für einen Sonnenuntergangsdrink oder ein Abendessen am Meer, und die Uferfront von Port de Sóller funktioniert auf der Tramuntana-Seite gut. Auch Palma selbst hat Dachterrassen- und Uferbars, wenn Sie einen städtischen Sonnenuntergang wollen, ohne die Stadt zu verlassen. Diese tauschen die wilde Kulisse der Aussichtspunkte gegen Komfort und eine Getränkekarte, was an manchen Abenden genau das Richtige ist.",
    },
    {
      heading: "Ein Hinweis zu Cap de Formentor",
      business_ids: [],
      body: "Cap de Formentor taucht auf jeder Sonnenuntergangsliste auf, daher sei es klar gesagt: Die Halbinsel und ihr Leuchtturm an der Nordspitze Mallorcas sind wirklich spektakulär, aber die Lage zeigt nach Norden und Osten, sodass sie eher für den Sonnenaufgang und ihre Panorama-Klippenblicke gefeiert wird als für die ins Meer sinkende Sonne. Wenn Sie dramatische Kulisse suchen, liefert sie das zu jeder Tageszeit — aber für einen echten Sonnenuntergang über dem Wasser sind die Orte an der Westküste oben die bessere Wahl.\n\nAuch der Zugang macht Formentor im Sommer zu einem umständlichen Sonnenuntergangsziel: Etwa von Juni bis September dürfen Privatfahrzeuge nur früh morgens (bis rund 8 Uhr) zum Kap, danach müssen Sie einen Shuttlebus ab Port de Pollença nehmen, und es sind etwa 1h30 von Palma. Im Winter ist die Straße den ganzen Tag offen und weit ruhiger. Wenn Sie hinfahren, behandeln Sie es als Ziel für Kulisse und Sonnenaufgang, nicht für den Sonnenuntergang.",
    },
  ],
  faqs: [
    { question: "Wo ist der beste Ort für den Sonnenuntergang auf Mallorca?", answer: "Sa Foradada bei Deià ist der berühmteste, ein durchlöcherter Felsen an der Westküste, durch den die untergehende Sonne scheint, allerdings wird es sehr voll. Für etwas Ruhigeres bietet Sant Elm im Südwesten einen schönen Sonnenuntergang hinter der Insel Sa Dragonera, und der Mirador de Ses Barques bei Sóller gibt einen weiten Tramuntana-Blick von einer Terrasse mit weit weniger Menschen. Alle zeigen nach Westen oder Südwesten, wo Mallorcas beste Sonnenuntergänge liegen." },
    { question: "Was ist der beste Sonnenuntergangsort auf Mallorca ohne Auto?", answer: "Die einfachsten autofreien Optionen sind rund um Palma und seine Uferfront — der Paseo Marítimo, Dachbars und die westlichen Strände, mit dem EMT-Bus erreichbar — und Port de Sóller, das Sie mit dem historischen Zug und der Tram erreichen und das eine nach Westen gerichtete Bucht mit Uferbars hat. Die dramatischen Tramuntana-Aussichtspunkte wie Sa Foradada und Ses Barques brauchen wirklich ein Auto, da der öffentliche Verkehr dorthin begrenzt ist, besonders für die späte Rückfahrt im Dunkeln." },
    { question: "Was ist der beste Sonnenuntergangsort auf Mallorca für Paare?", answer: "Sant Elm ist die herausragende Wahl für Paare — ein ruhiges Küstendorf gegenüber Sa Dragonera, mit Uferrestaurants, in denen Sie zu Abend essen können, während die Sonne hinter der Insel untergeht. Der Mirador de Ses Barques bei Sóller ist eine weitere romantische, wenig überlaufene Wahl mit Terrassenrestaurant, und die Beachclubs um Port d'Andratx und Cala Llamp sind ideal, wenn Sie Cocktails und Meerblick statt eines Gerangels am Aussichtspunkt wollen." },
    { question: "Wann ist Sonnenuntergang auf Mallorca und wann sollte ich ankommen?", answer: "Der Sonnenuntergang auf Mallorca liegt im Hochsommer etwa zwischen 21 und 21:30 Uhr und im Hochwinter gegen 17:30 Uhr, prüfen Sie also die genaue Uhrzeit für Ihr Datum. Kommen Sie 30–45 Minuten früher, um zu parken und einen Platz zu finden, besonders an beliebten Orten wie Sa Foradada, wo die Parkplätze schnell voll sind. Nehmen Sie eine Jacke mit, da es nach Sonnenuntergang schnell kühl wird, und eine Lampe, wenn Sie im Dunkeln von einem Aussichtspunkt oder einer Wanderung zurückgehen." },
  ],
  seo: {
    title: "Die besten Orte für den Sonnenuntergang auf Mallorca 2026 | Mallorca Verified",
    description: "Mallorcas beste Sonnenuntergangsorte an der West- und Südwestküste: Sa Foradada, Ses Barques, Sant Elm und Sa Dragonera, einfache Aussichtspunkte nahe Palma, plus Strandbars.",
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
