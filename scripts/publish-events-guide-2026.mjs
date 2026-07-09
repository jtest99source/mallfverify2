/**
 * Publica los guides de eventos verano 2026 (EN + DE) en Supabase.
 * Uso: node scripts/publish-events-guide-2026.mjs
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync } from "node:fs"
import { randomUUID } from "node:crypto"

function loadEnv() {
  if (!existsSync(".env.local")) return process.env
  const env = { ...process.env }
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const idx = trimmed.indexOf("=")
    if (idx < 0) continue
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1)
  }
  return env
}

const env = loadEnv()
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const guides = [
  // ─── ENGLISH ────────────────────────────────────────────────────────────────
  {
    id: "a7f3c1d2-e8b4-4f90-9abc-1234567890ab",
    slug: "best-events-mallorca-summer-2026",
    locale: "en",
    title: "Best Events in Mallorca This Summer 2026",
    excerpt: "What's actually worth your evening between now and September — real dates, honest tips, no tourist-brochure fluff.",
    intro: "Summer on this island is not short of things to do. The problem is the opposite: your inbox and every hotel lobby leaflet will tell you everything is \"unmissable.\" Most of it isn't. So we did the work — checked the official programmes, confirmed the dates, and cut the events down to the ones that genuinely earn a spot on your calendar. Some are world-class culture in stone courtyards. One is a stadium full of gourmet burgers. A couple are the kind of thing you'd only know about if a local told you. Here's the honest rundown.\n\nA quick note on timing: this is the summer 2026 line-up, and a few of the big spring events (the sardine fair, the June music festival) have already wrapped by the time high season hits. We've kept them in briefly so you know where they sit in the calendar, but the heart of this guide is July, August and the very start of September.",
    sections: [
      {
        heading: "Deià International Music Festival — chamber music with a sea view",
        body: "If you only do one \"cultured\" evening all summer, make it this one. The Deià International Music Festival has run since 1978 and is now one of the most respected classical festivals in Spain, built around intimate chamber music in genuinely spectacular settings.\n\n**What it is:** Around 50 concerts spanning everything from medieval to contemporary, plus jazz, flamenco and world music played with a classical spirit. Capacity at most concerts is capped at roughly 150 people, which is the whole point — you're close enough to catch the musicians' expressions.\n\n**When:** The festival runs from spring right through to autumn, with the densest concentration of concerts across July and the summer months. Check the official programme at dimf.com for exact dates, as concerts are spread across multiple venues on different evenings.\n\n**Where:** The main setting is Son Marroig, the historic clifftop estate of Archduke Ludwig Salvator just outside Deià, perched above the sea. For 2026 the festival has branched out further than ever — concerts also take place in Sineu, at Sa Bassa Rotja in Porreres, Palau March in Palma, and the Fundació Miró in Palma, plus dates on the other Balearic islands.\n\n**What to expect:** Warm evenings, a sunset backdrop, and world-class musicians in venues that are landmarks in their own right. A new feature this year is a series of concerts at Sa Bassa Rotja where you can combine the music with dinner, with slightly cheaper tickets for that pairing. The Fundació Miró series is themed around the music Miró himself loved, ending with an improvised concert played to projections of his work.\n\n**Practical tips:** Deià is about 45 minutes from Palma on winding mountain roads — that drive is part of the experience, but don't rush it, and don't plan on a quick getaway afterwards. Book tickets in advance through the official festival website; these are small venues and popular concerts sell out. The atmosphere is refined and calm — great for teens with a musical bent, less so for very young kids during longer performances. Pair it with an early dinner in Deià or a walk before the music starts."
      },
      {
        heading: "Atlàntida Mallorca Film Fest — the island turns into a cinema",
        body: "Created 16 years ago by the streaming platform Filmin, Atlàntida is billed as the world's largest hybrid film festival, and it's one of the ten best-regarded festivals in Spain. For ten days Palma fills with premieres, talks and open-air screenings.\n\n**What it is:** The 2026 edition packs in 141 films, 21 shorts, 25 concerts and 20 talks, with more than 300 guests. Half the programme are Spanish premieres. It closes with El ser querido, the new Rodrigo Sorogoyen film, presented in Mallorca alongside Javier Bardem and Vicky Luengo before its cinema release. The Masters of Cinema awards this year go to Trine Dyrholm, Gael García Bernal and Oscar-winning composer Alexandre Desplat.\n\n**When:** The in-person festival runs 24 July to 2 August 2026. If you can't get to a screening, the online edition continues on the Filmin platform (filmin.es) until 24 August. Programme and tickets: atlantidafilmfest.com.\n\n**Where:** Screenings and events are spread across Palma venues including La Misericòrdia, Ses Voltes, Es Baluard museum, CineCiutat, Sala Rívoli, Atlàntida Born and the Gran Meliá Victoria hotel.\n\n**The free bit worth knowing about:** As a prelude, Calvià hosted a free open-air night of cinema and music on the new Magaluf seafront promenade (Passeig Marítim Gabriel Escarrer Juliá) on 28 June — a big LED screen by the sea, a hammock zone, DJ sets and a film under the stars. That specific event has passed, but it signals Calvià's push to make Magaluf a cinema hub in 2026, so keep an eye on the town's programme for repeat open-air nights through summer.\n\n**Practical tips:** The festival mixes ticketed screenings with galas and talks — check the official Atlàntida programme for what needs a ticket and what's open. Ses Voltes, below the cathedral, is a beautiful open-air spot for evening screenings. Palma's centre is walkable; if you're driving in, use a car park near the old town rather than hunting for street parking during festival week."
      },
      {
        heading: "The Champions Burger & Cheesecake — Europe's biggest gourmet burger festival",
        body: "Yes, this is the one the headlines called \"Europe's biggest burger festival,\" and for once the hype is roughly accurate. It's a touring gourmet burger event that pulls in huge crowds, and 2026 brought it to Palma in an \"All Star\" format.\n\n**What it is:** A gathering of Spain's most awarded burger vendors serving their greatest-hits creations from food trucks — premium dry-aged beef, artisan buns, inventive toppings. This year it introduced a parallel concept, The Champions Cheesecake, bringing together some of Spain's most sought-after cheesecakes from leading pastry chefs. Previous editions drew more than 120,000 visitors.\n\n**When:** 20 June to 5 July 2026. Note this one is wrapping up right at the start of July, so if you're reading this in early July you may just catch the final days. Hours are 6pm–midnight Monday to Thursday, and midday–midnight Friday to Sunday.\n\n**Where:** Estadi Mallorca Son Moix, the RCD Mallorca football stadium in Palma — a bigger venue than the 2025 edition to handle the crowds.\n\n**Practical tips:** Entry is completely free; you only pay for what you eat and drink. It's card and electronic payment first, so don't rely on cash. The stadium is on several city bus lines with parking nearby. Go early to dodge the worst queues. Pets aren't allowed except guide dogs. If burgers are your thing and you missed this window, note that Palma also runs the separate Mallorca Burger Fest and BURGERMANIA earlier in the year — the island takes its burgers seriously."
      },
      {
        heading: "Copa del Rey MAPFRE — the bay turns into a sailing stage",
        body: "Palma's marquee sporting week, and a genuinely spectacular free spectacle if you know where to stand. The Copa del Rey (King's Cup) has been run by the Real Club Náutico de Palma since 1982 and is one of the most important regattas in the Mediterranean.\n\n**What it is:** A week of world-class competitive sailing in the Bay of Palma, drawing well over 100 teams from two dozen-plus countries and more than 1,700 sailors. King Felipe VI regularly competes, which adds to the prestige. The 2025 edition doubled as the ORC European Championship.\n\n**When:** 1 to 8 August 2026 — one week of races, social events and a prize-giving at the Almudaina Palace.\n\n**Where:** Racing happens out on the water, headquartered at the Real Club Náutico de Palma on the Palma waterfront. Schedule and details: regatacopadelrey.com.\n\n**Practical tips:** The regatta itself is a private competition, but watching is free from the Paseo Marítimo and the marinas. The best on-shore viewing is when the yachts leave harbour in the morning and return mid-afternoon — that's when you'll see the fleet up close. Walk or cycle the promenade; traffic around the marina is heavy all week. In the evenings the sailing crowd fills La Lonja and Santa Catalina, so expect lively tapas bars and terraces. Some operators run race-day boat excursions if you want to watch from the water."
      },
      {
        heading: "Late-July fiestas — Sant Jaume, Verge del Carme and Pollença's Patrona",
        body: "This is the local heartbeat of a Mallorcan summer, and it costs nothing. If you want to see how the island actually celebrates rather than how it markets itself, aim for these.\n\n**Verge del Carme (around 16 July):** The maritime procession honouring the patron saint of fishermen. Fishing boats decked in flowers process through the harbour. Best seen at Port de Pollença, Cala Rajada or Porto Cristo, which run programmes in the week leading up to the 16th.\n\n**Sant Jaume (around 25 July):** Alcúdia's old walled town comes alive with music, processions and street parties for its patron saint. Manacor, Santanyí and Calvià also celebrate Sant Jaume with live music, children's events and a correfoc (fire-run). Alcúdia's old town is pedestrianised during fiestas — park outside the walls and walk in through the Roman ruins.\n\n**Pollença's La Patrona (early August):** One of the island's legendary fiestas, compressing centuries of history into a week that culminates in the famous Moors and Christians mock battle and the dawn Alborada parade. The whole town effectively stops for it.\n\n**Practical tips:** These are free, crowded and genuinely local. Arrive early, be respectful (some are religious observances as much as parties), and don't drive into the town centres — park on the edge and walk. Nights run very late."
      },
      {
        heading: "A few more worth a mention",
        body: "**Festival Cap Rocat (31 July–2 August):** An exclusive opera and classical festival in the dramatic Cap Rocat fortress-hotel overlooking the Bay of Palma. The 2026 line-up is genuinely high-level: an opening gala with tenor Juan Diego Flórez (31 July), a Rudolf Buchbinder piano recital (1 August), and a concert version of Puccini's Tosca with Lise Davidsen, Freddie De Tommaso and Ludovic Tézier (2 August). Small, high-end and unlike anything else on the island — the opening night already sold out early. Tickets: festivalcaprocat.com.\n\n**Bellver Castle Music Festival (July):** Classical concerts in the round courtyard of Palma's hilltop Bellver Castle — one of the most atmospheric venues in the city.\n\n**Chopin / Pianino Festival, Valldemossa (July–August):** Piano recitals in the Carthusian monastery cells where Chopin wintered in 1838. Valldemossa is 17 minutes from Palma; parking is tight, so arrive well before evening concerts.\n\n**Patrona 2026 — the big free concert (5 September, Parc de la Mar, Palma):** Just past the summer line, but worth flagging. Palma's large-format free concert has moved to the Mare de Déu de la Salut fiestas and returns to the Parc de la Mar below the cathedral on 5 September, within a programme of activities running 5–8 September. Last year's edition packed the Parc de la Mar and Passeig Marítim; the 2026 line-up hadn't been announced at the time of writing, but access is free. Check the Ajuntament de Palma programme (palma.cat) closer to the date.\n\nOne note for the calendar: the Fira de la Sardina (the sardine fair at the Moll de Pescadors) and the Mallorca Live Festival in Calvià are both wonderful — but they ran in May and June respectively and have already finished for 2026. Note them for next year."
      },
      {
        heading: "Where to eat and drink around the venues",
        body: "**Around Palma waterfront (Copa del Rey, Atlàntida, Champions Burger):** La Lonja and Santa Catalina are your two anchors for after-event eating and drinking — La Lonja fills with sailing crews during regatta week, Santa Catalina is the nightlife hub with buzzing terraces. For the Champions Burger at Son Moix, it's a stadium on city bus lines, so plan to head back into the centre for a proper drink afterward.\n\n**Around Deià (Music Festival):** Deià's small centre has a cluster of romantic restaurants ideal for an early dinner before a Son Marroig concert. Build in time — everything here runs at mountain-village pace, and the drive back to Palma is 45 minutes of curves in the dark.\n\n**Around Valldemossa (Chopin/Pianino):** Just 17 minutes from Palma, it's an easy evening if you arrive before parking fills. Pair a monastery recital with a walk through the old town beforehand.\n\n**Getting around:** For the big Palma events, the smartest move is nearly always to leave the car. The Paseo Marítimo is walkable and cyclable; traffic during Copa del Rey and festival weeks is heavy. For fiestas in Alcúdia, Pollença and the ports, park on the edge of town and walk in — old centres are pedestrianised and full during fiestas. For Deià and Valldemossa, a car gives you flexibility the bus won't, but factor in mountain roads and limited parking.\n\nMallorca Verified is an independent directory. Dates and line-ups can change — always confirm with the official organiser before you travel."
      }
    ],
    faqs: [
      {
        question: "Which of these summer events are free?",
        answer: "Plenty. Watching the Copa del Rey from the promenade is free, the Champions Burger has free entry (you only pay for food), the late-July and August fiestas (Sant Jaume, Verge del Carme, Pollença's Patrona) are all free, and Patrona 2026 on 5 September is a free concert. The Deià festival, Atlàntida screenings, Cap Rocat and the classical recitals are ticketed."
      },
      {
        question: "Where do I actually buy tickets?",
        answer: "Always go to the official festival or organiser website. Confirmed official sites: Deià at dimf.com, Atlàntida at atlantidafilmfest.com (online screenings on filmin.es), Copa del Rey at regatacopadelrey.com, Cap Rocat at festivalcaprocat.com, and Mallorca Live (for next year) at mallorcalivefestival.com. For the fiestas and the September Patrona concert, the Ajuntament de Palma programme (palma.cat) is the source. Buying direct avoids inflated resale prices, and for the small Deià venues it's often the only way in."
      },
      {
        question: "How do I get to Deià for the music festival without driving?",
        answer: "It's tricky — Deià is a mountain village about 45 minutes from Palma, and public transport is limited, especially late at night when concerts end. Most people drive. If you'd rather not, look into a taxi or private transfer, and confirm your return ride before the concert, because getting a cab back after 10pm is not guaranteed."
      },
      {
        question: "Is the Champions Burger festival still on in July?",
        answer: "It runs 20 June to 5 July 2026, so early July is your last chance. After that, the island still has a strong burger scene year-round, plus separate events like Mallorca Burger Fest and BURGERMANIA at other times of year."
      },
      {
        question: "What's the best free spectacle if I only have one evening?",
        answer: "For atmosphere with zero cost: watch the Copa del Rey fleet return to harbour mid-afternoon in early August, then stay for the evening buzz in La Lonja. Or, if your dates line up, one of the late-July fiestas in Alcúdia or Pollença — that's the real island, and it's free."
      },
      {
        question: "Are these events family-friendly?",
        answer: "The fiestas and the Champions Burger are great for families. The Deià and classical festivals suit older kids and teens with a musical interest more than toddlers. The larger music and late-night festivals are firmly for the adult crowd."
      }
    ],
    seo: {
      title: "Best Events in Mallorca Summer 2026 | Mallorca Verified",
      description: "The events in Mallorca this summer that genuinely earn a spot on your calendar — from the Deià Music Festival and Copa del Rey to local fiestas, with real dates and honest tips."
    },
    status: "published",
    is_featured: false,
    source: "editorial"
  },

  // ─── GERMAN ─────────────────────────────────────────────────────────────────
  {
    id: "b8e4d2f3-a9c5-4e01-abcd-234567890abc",
    slug: "beste-events-mallorca-sommer-2026",
    locale: "de",
    title: "Die besten Events auf Mallorca im Sommer 2026",
    excerpt: "Was zwischen jetzt und September wirklich einen Abend wert ist — echte Termine, ehrliche Tipps, kein Hochglanz-Prospekt.",
    intro: "Der Sommer auf dieser Insel hat wahrlich keinen Mangel an Programm. Das Problem ist eher das Gegenteil: Ihr Postfach und jeder Flyer in der Hotellobby erklären Ihnen, dass alles \"unverzichtbar\" sei. Das meiste ist es nicht. Wir haben also die Arbeit übernommen — die offiziellen Programme geprüft, die Termine bestätigt und die Auswahl auf das reduziert, was wirklich einen Platz in Ihrem Kalender verdient. Manches ist Weltklasse-Kultur in steinernen Innenhöfen. Eines ist ein Stadion voller Gourmet-Burger. Ein paar Dinge kennt man nur, wenn ein Einheimischer davon erzählt. Hier ist die ehrliche Übersicht.\n\nEin kurzer Hinweis zum Timing: Dies ist das Programm für den Sommer 2026, und einige der großen Frühjahrsevents (die Sardinen-Messe, das Musikfestival im Juni) sind zu Beginn der Hochsaison bereits vorbei. Wir erwähnen sie kurz, damit Sie wissen, wo sie im Kalender liegen — der Schwerpunkt dieses Guides liegt aber auf Juli, August und dem Anfang September.",
    sections: [
      {
        heading: "Deià International Music Festival — Kammermusik mit Meerblick",
        body: "Wenn Sie den ganzen Sommer nur einen \"kultivierten\" Abend einplanen, dann diesen. Das Deià International Music Festival läuft seit 1978 und ist heute eines der angesehensten klassischen Festivals Spaniens — im Kern intime Kammermusik in wirklich spektakulären Kulissen.\n\n**Was es ist:** Rund 50 Konzerte von mittelalterlicher bis zeitgenössischer Musik, dazu Jazz, Flamenco und Weltmusik, gespielt im klassischen Geist. Die meisten Konzerte sind auf etwa 150 Plätze begrenzt — genau das ist der Reiz: Man sitzt nah genug, um die Mimik der Musiker zu sehen.\n\n**Wann:** Das Festival läuft vom Frühjahr bis in den Herbst, mit der dichtesten Konzertfolge im Juli und den Sommermonaten. Die genauen Termine finden Sie im offiziellen Programm auf dimf.com, da die Konzerte an verschiedenen Abenden über mehrere Spielstätten verteilt sind.\n\n**Wo:** Hauptschauplatz ist Son Marroig, das historische Klippengut von Erzherzog Ludwig Salvator kurz außerhalb von Deià, hoch über dem Meer gelegen. 2026 hat sich das Festival weiter ausgebreitet als je zuvor — Konzerte finden auch in Sineu, in Sa Bassa Rotja in Porreres, im Palau March in Palma und in der Fundació Miró in Palma statt, plus Termine auf den anderen Baleareninseln.\n\n**Was Sie erwartet:** Warme Abende, Sonnenuntergangskulisse und Weltklasse-Musiker an Orten, die für sich schon Sehenswürdigkeiten sind. Neu in diesem Jahr ist eine Konzertreihe in Sa Bassa Rotja, bei der man die Musik mit einem Abendessen verbinden kann — mit etwas günstigeren Tickets für diese Kombination. Die Reihe in der Fundació Miró widmet sich der Musik, die Miró selbst liebte, und endet mit einem improvisierten Konzert zu Projektionen seiner Werke.\n\n**Praktische Tipps:** Deià liegt etwa 45 Minuten von Palma entfernt über kurvige Bergstraßen — diese Fahrt gehört zum Erlebnis, aber planen Sie keine schnelle Rückkehr ein. Tickets im Voraus über die offizielle Festival-Website buchen; die Spielstätten sind klein und beliebte Konzerte sind schnell ausverkauft. Die Atmosphäre ist ruhig und gediegen — ideal für musikbegeisterte Jugendliche, weniger für sehr kleine Kinder bei längeren Aufführungen. Verbinden Sie es mit einem frühen Abendessen in Deià oder einem Spaziergang vor Konzertbeginn."
      },
      {
        heading: "Atlàntida Mallorca Film Fest — die Insel wird zum Kino",
        body: "Vor 16 Jahren von der Streaming-Plattform Filmin gegründet, gilt Atlàntida als das größte hybride Filmfestival der Welt und zählt zu den zehn angesehensten Festivals Spaniens. Zehn Tage lang füllt sich Palma mit Premieren, Gesprächen und Open-Air-Vorführungen.\n\n**Was es ist:** Die Ausgabe 2026 bringt 141 Filme, 21 Kurzfilme, 25 Konzerte und 20 Gesprächsrunden mit über 300 Gästen. Die Hälfte des Programms sind Spanien-Premieren. Zum Abschluss läuft El ser querido, der neue Film von Rodrigo Sorogoyen, in Mallorca vorgestellt mit Javier Bardem und Vicky Luengo noch vor dem Kinostart. Die Masters-of-Cinema-Preise gehen dieses Jahr an Trine Dyrholm, Gael García Bernal und den Oscar-prämierten Komponisten Alexandre Desplat.\n\n**Wann:** Das Präsenz-Festival läuft vom 24. Juli bis 2. August 2026. Wer keine Vorführung schafft: Die Online-Ausgabe läuft auf der Filmin-Plattform (filmin.es) noch bis zum 24. August. Programm und Tickets: atlantidafilmfest.com.\n\n**Wo:** Vorführungen und Veranstaltungen verteilen sich auf Spielstätten in Palma, darunter La Misericòrdia, Ses Voltes, das Museum Es Baluard, CineCiutat, die Sala Rívoli, Atlàntida Born und das Hotel Gran Meliá Victoria.\n\n**Der kostenlose Teil, den Sie kennen sollten:** Als Auftakt richtete Calvià am 28. Juni einen kostenlosen Open-Air-Abend aus Kino und Musik auf der neuen Strandpromenade von Magaluf (Passeig Marítim Gabriel Escarrer Juliá) aus — eine große LED-Leinwand am Meer, ein Hängematten-Bereich, DJ-Sets und ein Film unter den Sternen. Dieser konkrete Termin ist vorbei, aber er zeigt Calviàs Bestreben, Magaluf 2026 zu einem Kino-Zentrum zu machen — behalten Sie das Programm der Gemeinde für weitere Open-Air-Abende im Sommer im Auge.\n\n**Praktische Tipps:** Das Festival mischt ticketpflichtige Vorführungen mit Galas und Gesprächen — im offiziellen Atlàntida-Programm sehen Sie, was ein Ticket braucht und was offen ist. Ses Voltes unterhalb der Kathedrale ist ein wunderschöner Open-Air-Ort für Abendvorführungen. Das Zentrum von Palma ist gut zu Fuß erreichbar; wer mit dem Auto kommt, nutzt besser ein Parkhaus nahe der Altstadt, statt während der Festivalwoche einen Straßenplatz zu suchen."
      },
      {
        heading: "The Champions Burger & Cheesecake — Europas größtes Gourmet-Burger-Festival",
        body: "Ja, das ist das Event, das in den Schlagzeilen als \"Europas größtes Burger-Festival\" lief — und ausnahmsweise stimmt das ungefähr. Es ist ein tourendes Gourmet-Burger-Event mit riesigem Publikum, das 2026 in einem \"All Star\"-Format nach Palma kam.\n\n**Was es ist:** Eine Versammlung der prämiertesten Burger-Anbieter Spaniens, die ihre besten Kreationen aus Foodtrucks servieren — Premium-Dry-Aged-Beef, handwerkliche Buns, einfallsreiche Toppings. In diesem Jahr kam ein paralleles Konzept dazu, The Champions Cheesecake, das einige der begehrtesten Käsekuchen Spaniens von führenden Patissiers zusammenbringt. Frühere Ausgaben zogen über 120.000 Besucher an.\n\n**Wann:** 20. Juni bis 5. Juli 2026. Beachten Sie: Dieses Event endet gleich zu Beginn des Juli — wer dies Anfang Juli liest, erwischt vielleicht noch die letzten Tage. Öffnungszeiten: Montag bis Donnerstag 18–24 Uhr, Freitag bis Sonntag 12–24 Uhr.\n\n**Wo:** Estadi Mallorca Son Moix, das Fußballstadion von RCD Mallorca in Palma — größer als die Ausgabe 2025, um den Andrang zu bewältigen.\n\n**Praktische Tipps:** Der Eintritt ist völlig kostenlos; Sie zahlen nur, was Sie essen und trinken. Bezahlt wird bevorzugt mit Karte und elektronisch, verlassen Sie sich also nicht auf Bargeld. Das Stadion liegt an mehreren Stadtbuslinien mit Parkplätzen in der Nähe. Kommen Sie früh, um die schlimmsten Schlangen zu vermeiden. Haustiere sind außer Blindenhunden nicht erlaubt. Falls Sie dieses Zeitfenster verpasst haben: Palma veranstaltet zu anderen Jahreszeiten auch das separate Mallorca Burger Fest und BURGERMANIA — die Insel nimmt ihre Burger ernst."
      },
      {
        heading: "Copa del Rey MAPFRE — die Bucht wird zur Segelbühne",
        body: "Palmas sportliches Aushängeschild der Saison und ein wirklich spektakuläres, kostenloses Schauspiel, wenn man weiß, wo man steht. Die Copa del Rey (Königspokal) wird seit 1982 vom Real Club Náutico de Palma ausgetragen und ist eine der wichtigsten Regatten im Mittelmeer.\n\n**Was es ist:** Eine Woche Weltklasse-Wettkampfsegeln in der Bucht von Palma mit weit über 100 Teams aus mehr als zwei Dutzend Ländern und über 1.700 Seglern. König Felipe VI. tritt regelmäßig selbst an, was dem Ganzen zusätzlichen Glanz verleiht. Die Ausgabe 2025 war zugleich die ORC-Europameisterschaft.\n\n**Wann:** 1. bis 8. August 2026 — eine Woche mit Wettfahrten, Rahmenprogramm und einer Siegerehrung im Almudaina-Palast.\n\n**Wo:** Die Wettfahrten finden auf dem Wasser statt, mit Hauptquartier im Real Club Náutico de Palma an der Uferpromenade von Palma. Programm und Details: regatacopadelrey.com.\n\n**Praktische Tipps:** Die Regatta selbst ist ein privater Wettbewerb, aber das Zuschauen von der Paseo Marítimo und den Yachthäfen ist kostenlos. Am besten sieht man die Boote, wenn die Yachten morgens auslaufen und am frühen Nachmittag zurückkehren — dann kommt die Flotte nah heran. Gehen oder radeln Sie die Promenade entlang; der Verkehr rund um den Hafen ist die ganze Woche dicht. Abends füllt die Segel-Community La Lonja und Santa Catalina — rechnen Sie mit lebhaften Tapas-Bars und Terrassen. Einige Anbieter organisieren Bootsausflüge am Renntag, wenn Sie vom Wasser aus zuschauen möchten."
      },
      {
        heading: "Fiestas Ende Juli — Sant Jaume, Verge del Carme und Pollenças Patrona",
        body: "Das ist der lokale Herzschlag eines mallorquinischen Sommers, und er kostet nichts. Wenn Sie sehen wollen, wie die Insel wirklich feiert und nicht, wie sie sich vermarktet, zielen Sie auf diese Termine.\n\n**Verge del Carme (um den 16. Juli):** Die Seeprozession zu Ehren der Schutzpatronin der Fischer. Mit Blumen geschmückte Fischerboote ziehen durch den Hafen. Am schönsten in Port de Pollença, Cala Rajada oder Porto Cristo, die in der Woche vor dem 16. eigene Programme haben.\n\n**Sant Jaume (um den 25. Juli):** Die alte, ummauerte Altstadt von Alcúdia erwacht mit Musik, Prozessionen und Straßenfesten zu Ehren ihres Schutzpatrons. Auch Manacor, Santanyí und Calvià feiern Sant Jaume mit Live-Musik, Kinderprogramm und einem correfoc (Feuerlauf). Alcúdias Altstadt ist während der Fiestas autofrei — außerhalb der Mauern parken und durch die römischen Ruinen hineinlaufen.\n\n**Pollenças La Patrona (Anfang August):** Eine der legendärsten Fiestas der Insel, die Jahrhunderte an Geschichte in eine Woche presst, die im berühmten Mauren-und-Christen-Scheinkampf und der morgendlichen Alborada-Parade gipfelt. Der ganze Ort steht dafür praktisch still.\n\n**Praktische Tipps:** Diese Feste sind kostenlos, voll und wirklich lokal. Kommen Sie früh, seien Sie respektvoll (manche sind ebenso religiöse Anlässe wie Feiern) und fahren Sie nicht in die Ortszentren — am Rand parken und laufen. Die Nächte werden sehr lang."
      },
      {
        heading: "Ein paar weitere, die eine Erwähnung wert sind",
        body: "**Festival Cap Rocat (31. Juli–2. August):** Ein exklusives Opern- und Klassikfestival in der dramatischen Festung-Hotel-Anlage Cap Rocat mit Blick über die Bucht von Palma. Das Line-up 2026 ist wirklich hochkarätig: eine Eröffnungsgala mit Tenor Juan Diego Flórez (31. Juli), ein Klavierabend von Rudolf Buchbinder (1. August) und eine konzertante Fassung von Puccinis Tosca mit Lise Davidsen, Freddie De Tommaso und Ludovic Tézier (2. August). Klein, hochwertig und anders als alles andere auf der Insel — der Eröffnungsabend war früh ausverkauft. Tickets: festivalcaprocat.com.\n\n**Bellver Castle Music Festival (Juli):** Klassische Konzerte im Rundhof des auf einem Hügel gelegenen Castell de Bellver in Palma — eine der stimmungsvollsten Spielstätten der Stadt.\n\n**Chopin- / Pianino-Festival, Valldemossa (Juli–August):** Klavierabende in den Kartäuserzellen des Klosters, in dem Chopin 1838 überwinterte. Valldemossa liegt 17 Minuten von Palma; die Parkplätze sind knapp, kommen Sie also lange vor den Abendkonzerten an.\n\n**Patrona 2026 — das große Gratiskonzert (5. September, Parc de la Mar, Palma):** Knapp hinter der Sommergrenze, aber erwähnenswert. Palmas Großkonzert ist zu den Fiestas der Mare de Déu de la Salut gewandert und kehrt am 5. September an den Parc de la Mar unterhalb der Kathedrale zurück, eingebettet in ein Programm vom 5. bis 8. September. Letztes Jahr füllte die Ausgabe den Parc de la Mar und die Passeig Marítim; das Line-up für 2026 war bei Redaktionsschluss noch nicht bekannt, der Zugang ist aber kostenlos. Prüfen Sie das Programm des Ajuntament de Palma (palma.cat) näher am Termin.\n\nEin Hinweis für den Kalender: Die Fira de la Sardina (die Sardinen-Messe am Moll de Pescadors) und das Mallorca Live Festival in Calvià sind beide großartig — liefen aber im Mai bzw. Juni und sind für 2026 bereits vorbei. Notieren Sie sie für nächstes Jahr."
      },
      {
        heading: "Wo Sie rund um die Veranstaltungsorte essen und trinken",
        body: "**Rund um Palmas Uferbereich (Copa del Rey, Atlàntida, Champions Burger):** La Lonja und Santa Catalina sind Ihre beiden Ankerpunkte fürs Essen und Trinken nach den Events — La Lonja füllt sich während der Regattawoche mit Segelcrews, Santa Catalina ist das Nachtleben-Zentrum mit lebhaften Terrassen. Für den Champions Burger am Son Moix: Das ist ein Stadion an Stadtbuslinien, planen Sie also, für ein richtiges Getränk danach ins Zentrum zurückzufahren.\n\n**Rund um Deià (Musikfestival):** Deiàs kleines Zentrum hat mehrere romantische Restaurants, ideal für ein frühes Abendessen vor einem Konzert in Son Marroig. Planen Sie Zeit ein — hier läuft alles im Tempo eines Bergdorfs, und die Rückfahrt nach Palma sind 45 Minuten Kurven im Dunkeln.\n\n**Rund um Valldemossa (Chopin/Pianino):** Nur 17 Minuten von Palma, ein leichter Abend, wenn Sie vor dem Ansturm auf die Parkplätze ankommen. Verbinden Sie einen Klosterabend mit einem Spaziergang durch die Altstadt vorab.\n\n**Fortbewegung:** Für die großen Palma-Events ist es fast immer klüger, das Auto stehen zu lassen. Die Paseo Marítimo ist zu Fuß und mit dem Rad gut machbar; der Verkehr während Copa del Rey und Festivalwochen ist dicht. Für die Fiestas in Alcúdia, Pollença und den Häfen am Ortsrand parken und hineinlaufen — die Altstädte sind autofrei und während der Feste voll. Für Deià und Valldemossa gibt Ihnen ein Auto die Flexibilität, die der Bus nicht bietet, aber rechnen Sie mit Bergstraßen und knappen Parkplätzen.\n\nMallorca Verified ist ein unabhängiges Verzeichnis. Termine und Line-ups können sich ändern — bestätigen Sie sie immer beim offiziellen Veranstalter, bevor Sie anreisen."
      }
    ],
    faqs: [
      {
        question: "Welche dieser Sommer-Events sind kostenlos?",
        answer: "Einige. Die Copa del Rey von der Promenade aus zu verfolgen ist kostenlos, der Champions Burger hat freien Eintritt (Sie zahlen nur das Essen), die Fiestas Ende Juli und im August (Sant Jaume, Verge del Carme, Pollenças Patrona) sind allesamt gratis, und die Patrona 2026 am 5. September ist ein Gratiskonzert. Das Deià-Festival, die Atlàntida-Vorführungen, Cap Rocat und die Klassik-Abende sind ticketpflichtig."
      },
      {
        question: "Wo kaufe ich tatsächlich Tickets?",
        answer: "Immer über die offizielle Festival- oder Veranstalter-Website. Bestätigte offizielle Seiten: Deià auf dimf.com, Atlàntida auf atlantidafilmfest.com (Online-Vorführungen auf filmin.es), Copa del Rey auf regatacopadelrey.com, Cap Rocat auf festivalcaprocat.com und Mallorca Live (fürs nächste Jahr) auf mallorcalivefestival.com. Für die Fiestas und das Patrona-Konzert im September ist das Programm des Ajuntament de Palma (palma.cat) die Quelle. Der Direktkauf vermeidet überhöhte Wiederverkaufspreise, und bei den kleinen Deià-Spielstätten ist er oft der einzige Weg hinein."
      },
      {
        question: "Wie komme ich ohne Auto zum Musikfestival nach Deià?",
        answer: "Das ist heikel — Deià ist ein Bergdorf rund 45 Minuten von Palma, und der öffentliche Nahverkehr ist begrenzt, besonders spätabends, wenn die Konzerte enden. Die meisten fahren mit dem Auto. Wer das nicht möchte, prüft ein Taxi oder einen privaten Transfer und bestätigt die Rückfahrt vor dem Konzert, denn ein Taxi nach 22 Uhr ist nicht garantiert."
      },
      {
        question: "Läuft der Champions Burger im Juli noch?",
        answer: "Er läuft vom 20. Juni bis 5. Juli 2026, Anfang Juli ist also Ihre letzte Chance. Danach hat die Insel ganzjährig eine starke Burger-Szene, plus separate Events wie das Mallorca Burger Fest und BURGERMANIA zu anderen Zeiten im Jahr."
      },
      {
        question: "Was ist das beste kostenlose Schauspiel, wenn ich nur einen Abend habe?",
        answer: "Für Atmosphäre ohne Kosten: die Copa-del-Rey-Flotte am frühen Nachmittag Anfang August in den Hafen zurückkehren sehen und dann zum abendlichen Treiben in La Lonja bleiben. Oder, wenn die Termine passen, eine der Fiestas Ende Juli in Alcúdia oder Pollença — das ist die echte Insel, und sie ist kostenlos."
      },
      {
        question: "Sind diese Events familienfreundlich?",
        answer: "Die Fiestas und der Champions Burger sind toll für Familien. Das Deià- und die Klassik-Festivals passen eher zu älteren Kindern und Jugendlichen mit musikalischem Interesse als zu Kleinkindern. Die großen Musik- und Spätabend-Festivals sind klar auf ein erwachsenes Publikum ausgerichtet."
      }
    ],
    seo: {
      title: "Die besten Events auf Mallorca Sommer 2026 | Mallorca Verified",
      description: "Die Events auf Mallorca in diesem Sommer, die wirklich einen Abend wert sind — vom Deià-Musikfestival bis zur Copa del Rey und lokalen Fiestas, mit echten Terminen und ehrlichen Tipps."
    },
    status: "published",
    is_featured: false,
    source: "editorial"
  }
]

for (const guide of guides) {
  const { data, error } = await supabase
    .from("guides")
    .upsert(guide, { onConflict: "slug,locale" })
    .select("id,slug,locale")

  if (error) {
    console.error(`❌ ${guide.locale} — ${guide.slug}:`, error.message)
    process.exit(1)
  }

  console.log(`✅ ${guide.locale.toUpperCase()} — "${guide.title}" (id: ${data?.[0]?.id})`)
}

console.log("\nAmbos guides publicados.")
