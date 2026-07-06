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

const { data: existing } = await sb.from("guides").select("id").eq("slug", "best-day-trips-from-palma-mallorca-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "best-day-trips-from-palma-mallorca-2026",
  locale: "de",
  title: "Die besten Tagesausflüge ab Palma, Mallorca 2026",
  excerpt: "Die besten Tagesausflüge ab Palma mit Auto, Zug oder Bus — Tramuntana-Dörfer, spektakuläre Höhlen, wilde Strände und mittelalterliche Städte, mit ehrlichen Fahrzeiten.",
  intro: "Palma ist ein hervorragender Ausgangspunkt, um Mallorca zu erkunden, und die meisten Höhepunkte der Insel liegen 30 bis 90 Minuten Fahrt entfernt. Einige sind auch ohne Auto erreichbar — der historische Zug nach Sóller, der Bus nach Valldemossa — aber die lohnendsten Tagesausflüge, wie die kurvenreiche Straße nach Sa Calobra oder der wilde Strand von Es Trenc, brauchen wirklich ein eigenes Auto. Dieser Leitfaden geht die besten Tagesausflüge nach Richtung und nach Anreiseart durch, mit ehrlichen Fahrzeiten und dem, was Sie erwartet, sodass Sie einen Ausflug danach auswählen können, ob Sie fahren, öffentlich unterwegs sind oder einen entspannten halben statt eines ganzen Tages wollen.",
  sections: [
    {
      heading: "Tramuntana-Dörfer: Valldemossa, Deià und Sóller",
      business_ids: [],
      body: "Der klassische Tagesausflug ab Palma führt nordwestlich in die Serra de Tramuntana. **Valldemossa** (etwa 20–25 Minuten mit Auto oder Bus) ist ein malerisches Bergdorf, bekannt für seine Kartause und den Chopin-Bezug, am besten kombiniert mit einem Mittagessen in einem der Restaurants knapp abseits des Hauptplatzes. **Deià** (etwa 15 Minuten weiter an der Küstenstraße) ist kleiner, exklusiver und seit Robert Graves' Ankunft lange mit Künstlern und Schriftstellern verbunden.\n\n**Sóller** (rund 30 Minuten weiter) liegt in einem Zitrustal und ist der eine Tramuntana-Ausflug, den Sie ganz ohne Auto machen können: Der historische hölzerne Zug von 1912 fährt von Palmas Plaça d'Espanya, und eine anschließende Tram bringt Sie hinunter nach Port de Sóller an die Küste. Ein natürlicher voller Tag verbindet alle drei mit dem Auto zu einer Bergrunde, oder Sie machen Sóller als eigenständigen Zug-und-Tram-Ausflug. Wenn Sie fahren, stellen Sie sich auf langsame, kurvige Straßen ein — landschaftlich schön, aber nicht schnell.",
    },
    {
      heading: "Sa Calobra und der Torrent de Pareis",
      business_ids: [],
      body: "Für viele ist die Fahrt nach **Sa Calobra** der spektakulärste Tagesausflug der Insel, und die Straße ist dabei ebenso das Highlight wie das Ziel: eine Serie von Serpentinen, die sich durch die Tramuntana zu einer winzigen Bucht an der Nordküste hinabschraubt, rund 1h15–1h30 von Palma. Unten öffnet sich Sa Calobra zur Mündung des **Torrent de Pareis**, einer spektakulären Schlucht, in der der Canyon durch eine kurze begehbare Höhle aufs Meer trifft.\n\nEinige ehrliche Hinweise: Strand und Restaurants werden sehr voll, und das Essen hier ist schlecht, nehmen Sie also ein Picknick mit. Das Parken an der Bucht ist kostenpflichtig, rund 13 €, und der Betreiber bevorzugt eher Bargeld, kommen Sie also vor dem späten Vormittag an. Die komplette Schlucht des Torrent de Pareis von Escorca aus zu wandern ist eine anspruchsvolle Tour von 5–6 Stunden, die einen Guide und richtige Ausrüstung erfordert — sie beinhaltet Kletterpassagen und Wasserdurchquerungen und ist kein gemütlicher Spaziergang. Für die meisten Besucher sind die Fahrt, die Bucht und die Höhle der Tag.",
    },
    {
      heading: "Die Ostküste: Coves del Drach und Porto Cristo",
      business_ids: [],
      body: "Die Hauptattraktion der Ostküste sind die **Coves del Drach** in Porto Cristo, etwa 1h10 von Palma und eine der meistbesuchten Sehenswürdigkeiten Mallorcas. Die Höhlen sind wirklich beeindruckend in ihrem Ausmaß, mit riesigen Kammern voller Felsformationen, und der Besuch beinhaltet ein kurzes klassisches Konzert, live auf dem unterirdischen See gespielt, gefolgt von einer optionalen kurzen Bootsfahrt darüber.\n\nDer nützlichste Tipp ist, direkt über die offizielle Website der Coves del Drach zu buchen statt über einen Reiseveranstalter oder Wiederverkäufer, was oft mehr als das Doppelte kostet. Das Konzert wird bei ausgeschaltetem Licht gespielt, es ist also nicht ideal für kleine Kinder, die die Dunkelheit verunsichern kann. Porto Cristo selbst ist ein angenehmer Hafenort für ein anschließendes Mittagessen, und die nahen Coves dels Hams sind ein alternatives Höhlensystem, wenn Sie den größten Menschenmassen ausweichen wollen.",
    },
    {
      heading: "Wilde Strände: Es Trenc und der Süden",
      business_ids: [],
      body: "Wenn es bei Ihrem Tagesausflug wirklich um den Strand geht, fahren Sie an die Südküste. **Es Trenc** (etwa 45 Minuten von Palma) ist der berühmteste Naturstrand der Insel — ein langer Streifen weißen Sandes und flachen türkisfarbenen Wassers, umgeben von einem geschützten Naturpark, ohne jede Resortbebauung, was ihn gerade so besonders macht. Er wird in der Hochsaison genau deshalb voll, weil Sand und Wasser zu den besten der Insel gehören.\n\nKommen Sie früh und gut vorbereitet: Das Parken kostet rund 8 € und füllt sich, allerdings können Sie im nahen Colònia de Sant Jordi kostenlos parken und hinlaufen. Bringen Sie alles Nötige mit, da die Einrichtungen bewusst begrenzt sind. Als ruhigere Alternativen auf derselben Fahrt sind die Buchten weiter südöstlich um Santanyí — Cala Llombards und Cala Santanyí — kleiner, geschützter und auf ihre eigene Art wunderschön.",
    },
    {
      heading: "Der Norden: Altstadt von Alcúdia und Formentor",
      business_ids: [],
      body: "Der Norden verbindet Geschichte mit dramatischer Küste. Die **Altstadt von Alcúdia** (etwa 50 Minuten von Palma) ist von gut erhaltenen **mittelalterlichen Mauern** umgeben, die Sie für einen Blick über die Stadt begehen können, betreten durch das historische Tor **Porta de Mallorca**. Im Inneren finden sich enge Gassen, römische Ruinen, Cafés und ein lebhafter Markt — ein einfacher, zu Fuß machbarer halber Tag. Wie an jedem belebten Touristenort sollten Sie in der Hochsaison rund um das volle Tor auf Ihre Wertsachen achten.\n\nWeiter nördlich bietet die Halbinsel **Cap de Formentor** mit ihrem Leuchtturm einige der spektakulärsten Klippenblicke der Insel, an der äußersten Spitze jenseits von Port de Pollença. Beachten Sie, dass die schmale Straße nach Formentor im Sommer während der Stoßzeiten für Privatfahrzeuge gesperrt ist und stattdessen ein Shuttlebus fährt — prüfen Sie die aktuellen Zufahrtsregeln vor der Fahrt, da sie saisonal wechseln. Zusammen ergeben Alcúdia und Formentor einen vollen Tag im Norden.",
    },
    {
      heading: "Wie Sie wählen: mit Auto, Zug oder Bus",
      business_ids: [],
      body: "Richten Sie den Ausflug nach Ihrer Anreise aus. Ohne Auto sind Ihre besten Tagesausflüge **Sóller** (der historische Zug und die Tram ab Palma), **Valldemossa** (ein direkter Bus von etwa 30 Minuten) und **Palmas eigene Sehenswürdigkeiten**, wenn Sie einen entspannten Tag wollen — die Kathedrale La Seu ist einen kurzen Spaziergang vom Zentrum entfernt, kostet rund 10 € Eintritt und wird am besten online gebucht. Das TIB-Busnetz erreicht Alcúdia und die wichtigsten Orte und ist 2026 für registrierte Residenten auf Überlandstrecken kostenlos.\n\nMit dem Auto öffnet sich die Insel: Sa Calobra, Es Trenc, die Höhlen im Osten und die volle Tramuntana-Runde werden alle praktikabel, und Sie können zwei nahe Sehenswürdigkeiten an einem Tag verbinden. Als Faustregel planen Sie Berg- und Strandausflüge für den Vormittag — Tramuntana-Straßen sind ab Mittag langsam und voll, und Strände und Parkplätze füllen sich früh. Bestätigen Sie saisonale Details vorab: Straßensperrungen in Formentor, Öffnungszeiten der Höhlen und Strandparken variieren je nach Saison, und beliebte Sehenswürdigkeiten wie die Coves del Drach und die Kathedrale bucht man am besten online im Voraus.",
    },
  ],
  faqs: [
    { question: "Was sind die besten Tagesausflüge ab Palma ohne Auto?", answer: "Die besten autofreien Tagesausflüge ab Palma sind Sóller (mit dem historischen Zug von 1912 und der anschließenden Tram zum Hafen), Valldemossa (ein direkter Bus von etwa 30 Minuten) und Alcúdia (mit dem TIB-Busnetz, 2026 für Residenten auf Überlandstrecken kostenlos). Auch Palmas eigene Kathedrale, Altstadt und Uferpromenade ergeben einen einfachen, entspannten Tag. Für Sa Calobra, Es Trenc oder die Höhlen im Osten brauchen Sie wirklich ein Auto." },
    { question: "Wie weit ist Sa Calobra von Palma und lohnt es sich?", answer: "Sa Calobra ist rund 1h15–1h30 mit dem Auto von Palma entfernt, und die dramatische Serpentinenstraße durch die Tramuntana ist das Highlight des Ausflugs ebenso wie das Ziel. Die Bucht und die Mündung der Schlucht Torrent de Pareis sind wunderschön, aber es wird sehr voll, das Essen vor Ort ist schlecht (bringen Sie ein Picknick mit), und das Parken kostet rund 13 €. Kommen Sie vor dem späten Vormittag an und fahren Sie wegen der Strecke und der Landschaft." },
    { question: "Muss man die Coves del Drach im Voraus buchen?", answer: "Vorausbuchen ist empfehlenswert, und Sie sollten direkt über die offizielle Website der Coves del Drach buchen statt über einen Wiederverkäufer, was oft mehr als das Doppelte kostet. Der Besuch beinhaltet ein kurzes klassisches Konzert auf dem unterirdischen See und eine optionale Bootsfahrt. Es liegt etwa 1h10 von Palma nahe Porto Cristo, und der dunkle Konzertteil kann kleine Kinder verunsichern." },
    { question: "Was ist der beste Strand-Tagesausflug ab Palma?", answer: "Es Trenc, etwa 45 Minuten südlich von Palma, ist der berühmteste Naturstrand-Tagesausflug — ein langer, unbebauter Streifen weißen Sandes und flachen türkisfarbenen Wassers in einem geschützten Park. Kommen Sie früh, da das Parken (rund 8 €) sich füllt, allerdings können Sie im nahen Colònia de Sant Jordi kostenlos parken und hinlaufen. Als ruhigere Alternativen sind die Buchten um Santanyí wie Cala Llombards und Cala Santanyí kleiner und geschützter." },
  ],
  seo: {
    title: "Die besten Tagesausflüge ab Palma, Mallorca 2026 | Mallorca Verified",
    description: "Die besten Tagesausflüge ab Palma mit Auto, Zug oder Bus: Tramuntana-Dörfer, Sa Calobra, Coves del Drach, Es Trenc und Alcúdia — mit ehrlichen Fahrzeiten und Tipps.",
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
