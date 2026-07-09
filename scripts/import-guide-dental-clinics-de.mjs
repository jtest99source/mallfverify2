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
  ced:       "google-ChIJAY1Cv_mSlxIRibPD0Uxvag8",
  nueva:     "google-ChIJ-wHXqK6TlxIRrXqngNZvFDM",
  ziving:    "google-ChIJXz3u0lqSlxIRyBRkaELsOJw",
  pronova:   "google-ChIJX483P_aSlxIRF4m4LK9oeec",
  planas:    "google-ChIJU9OQoTOTlxIRVcXy5NZEjNA",
  coped:     "google-ChIJCZGbwVOSlxIRhpYmouwnJFs",
  ferrer:    "google-ChIJhyI7UqmTlxIRdz6lgJ1oZJg",
  seadent:   "google-ChIJRYuX4FqSlxIRYN80Y297JDk",
  urgencias: "google-ChIJGUVq7auTlxIRuhYtVmPTrN8",
  centroUrg: "google-ChIJ02SxLKyTlxIRr0BSTuivsz8",
  doring:    "google-ChIJoxFhwYkslhIRzQArv-pfmnE",
  schmieder: "google-ChIJAbs57X1AlhIR8Q7Hkz61OX0",
  vogelsang: "google-ChIJ41YXBn2SlxIRNNKKLyEFYKU",
  schurian:  "google-ChIJbbP84rPFlxIRdN_GpVa_PGQ",
  dentalCentre:"google-ChIJqdmcVLmJlxIRSVO8r3QztEE",
  spPractice:"google-ChIJS2wnWLmJlxIRdSxcUVmIgjM",
  platon:    "google-ChIJAw2AAghJlhIREHqvsCUdn_A",
  odonto:    "google-ChIJV9IGy11JlhIRdT9diTL4r38",
};

const { data: existing } = await sb.from("guides").select("id").eq("slug", "dental-clinics-mallorca-2026").eq("locale", "de").maybeSingle();
if (existing) { console.log("Already exists, skipping."); process.exit(0); }

const guide = {
  id: crypto.randomUUID(),
  slug: "dental-clinics-mallorca-2026",
  locale: "de",
  title: "Zahnärzte auf Mallorca: Der komplette Leitfaden 2026",
  excerpt: "Ein praktischer Leitfaden zur Zahnarztsuche auf Mallorca — englisch- und deutschsprachige Praxen, zahnärztlicher Notdienst, Behandlungskosten im Vergleich zu Großbritannien und Deutschland und Praxen nach Gebiet.",
  intro: "Mallorca hat ein dichtes Netz privater Zahnarztpraxen, stark auf **Palma** konzentriert, aber über jede größere Stadt und Ferienregion verteilt, und viele richten sich gezielt an die große internationale Bevölkerung der Insel und ihre Besucher. Für Residenten und Touristen drehen sich die praktischen Fragen meist um Sprache, Notfallzugang, Versicherung und Kosten statt um klinische Details, und dieser Leitfaden konzentriert sich darauf. Zum Preis ein nützlicher Anhaltspunkt: Ein einzelnes Zahnimplantat mit Krone kostet in Spanien laut europäischen Kostenvergleichen 2026 typischerweise etwa 1.800–3.000 €, was allgemein unter den üblichen privaten Preisen in Großbritannien (2.000–3.500 £) und Deutschland (1.400–3.500 €) liegt, auch wenn Mallorca keines der ultragünstigen Zahntourismus-Ziele Europas wie die Türkei oder Ungarn ist. Dieser Leitfaden ist rein informativ und bietet keine medizinische oder zahnärztliche Beratung und stuft keine Praxis als klinisch überlegen ein; wo Praxen hervorgehoben werden, geschieht dies auf Basis verifizierter öffentlicher Google-Bewertungen, gesprochener Sprachen oder eines bestimmten Angebots, und das wird angegeben.",
  sections: [
    {
      heading: "Wie Zahnmedizin auf Mallorca für Ausländer funktioniert",
      business_ids: [],
      body: "Die Zahnversorgung in Spanien ist überwiegend **privat** — das öffentliche Gesundheitssystem deckt nur sehr begrenzte zahnärztliche Behandlungen ab (Extraktionen und akute Probleme für Residenten), sodass Residenten wie Besucher für Kontrollen, Füllungen, Zahnreinigung, Implantate und Kieferorthopädie private Praxen nutzen und pro Behandlung oder über eine private Zahnversicherung zahlen. Für einen Touristen bedeutet das, dass ein Zahnarztbesuch ein unkomplizierter privater Termin ist, meist innerhalb von ein bis zwei Tagen buchbar und zunehmend über **WhatsApp** organisiert, das viele Praxen für Buchung und Nachsorge nutzen.\n\nEine Erstberatung umfasst typischerweise eine Untersuchung und oft ein digitales Röntgenbild oder einen 3D-Scan, mit einem schriftlichen Kostenvoranschlag für jede Behandlung. Da Praxen um internationale Patienten konkurrieren, geben viele an, welche Sprachen ihre Zahnärzte sprechen, welche Versicherer sie akzeptieren und wie ihre Notfallverfügbarkeit aussieht. Als Ausländer sind die praktischen Dinge, die man vor der Buchung prüfen sollte: die gesprochenen Sprachen, ob die Praxis Ihre Versicherung annimmt, die Notfallzeiten und die Kosten der Erstberatung — behandelt in den folgenden Abschnitten.",
    },
    {
      heading: "Englischsprachige Zahnarztpraxen",
      business_ids: [ID.ced, ID.nueva, ID.ziving, ID.dentalCentre, ID.spPractice, ID.schurian],
      body: "Viele Praxen auf Mallorca werben mit englischsprachigen Zahnärzten, und mehrere sind faktisch auf internationale Patienten ausgerichtet. Im Zentrum von **Palma** gehören **Clínica Dental CED Palma - Doctor Murad** (4,9 Sterne, ~1.170 Bewertungen) und **Nueva Clínica Dental Palma** (4,9 Sterne, ~700 Bewertungen) zu den volumenstärksten, bestbewerteten Allgemeinpraxen, deren Rezensenten ausdrücklich englischsprachiges Personal erwähnen. **Ziving Tomas Sastre** am Passeig des Born (4,9 Sterne, ~1.600 Bewertungen) ist eine große, alteingesessene Praxis im Zentrum. Im Südwesten, rund um **Santa Ponsa**, sind **Dental Centre Mallorca** (4,6 Sterne) und **Santa Ponsa Dental Practice** (4,5 Sterne) britisch geführte Familienpraxen, deren Rezensenten die klare englische Kommunikation und ehrliche Beratung hervorheben.\n\nIm Inselinneren wird **Clínica Dental Schurian** in **Inca** (4,9 Sterne, ~840 Bewertungen) wiederholt von englischsprachigen Rezensenten gelobt, mehrere davon von Expats im Raum Alcúdia empfohlen. Diese Bewertungen spiegeln öffentliche Google-Bewertungswerte und -Volumina sowie von Rezensenten erwähnte Sprachen wider, kein klinisches Urteil — aber für einen Englischsprachigen, der klar verstanden werden möchte, sind Praxen, die sichtbar internationale Patienten betreuen, ein praktischer Ausgangspunkt.",
    },
    {
      heading: "Deutschsprachige Zahnarztpraxen (Deutscher Zahnarzt)",
      business_ids: [ID.doring, ID.schmieder, ID.vogelsang],
      body: "Mallorcas große deutsche Gemeinschaft und die hohen Besucherzahlen führen dazu, dass mehrere Praxen mit deutschsprachigen Zahnärzten werben, oft als **Deutscher Zahnarzt** bezeichnet. Im Norden ist **Zahnarzt Dr. Dirk Döring (\"PuertoAlcúdiaDent\")** in **Port d'Alcúdia** (4,9 Sterne, ~280 Bewertungen) ein deutscher Zahnarzt mit Bewertungen auf Deutsch und Englisch, die die klare Erklärung und WhatsApp-Buchung loben. An der Ostküste ist **SCHMIEDER Deutscher Zahnarzt** in **Cala Millor** (4,8 Sterne) eine deutsch geführte Praxis, deren Rezensenten größtenteils deutschsprachige Besucher sind, mehrere im Urlaub behandelt.\n\nIn **Palma** ist **Clínica Dental Vogelsang** (4,9 Sterne, ~205 Bewertungen) eine Praxis mit deutschem Namen, deren Rezensenten die ästhetische Zahnmedizin mit Dr. Lara Mielke und ein ruhiges, mehrsprachiges Team hervorheben. Wie bei den englischsprachigen Praxen werden diese hier auf Basis der von den Praxen beworbenen und von Rezensenten erwähnten Sprachen sowie ihrer öffentlichen Google-Bewertungen gruppiert — nicht aufgrund eines vergleichenden klinischen Anspruchs. Deutschsprachige Besucher im Norden und Osten sind relativ gut versorgt, wobei Palma die größte allgemeine Auswahl bietet.",
    },
    {
      heading: "Zahnärztlicher Not- und Bereitschaftsdienst",
      business_ids: [ID.urgencias, ID.centroUrg, ID.seadent],
      body: "Für akute Probleme — eine verlorene Füllung, einen abgebrochenen Zahn, akute Schmerzen oder einen Zahnunfall — gibt es auf Mallorca Praxen mit zahnärztlichem Notdienst (**urgencias**), mehrere davon auf Touristen ausgerichtet. In **Palma** sind **Urgencias Dentales Mallorca** (4,8 Sterne, ~630 Bewertungen) und **Centro Urgencias Dentales** (5,0 Sterne, ~510 Bewertungen) spezialisierte Notfall-Zahnarztpraxen, deren Rezensenten häufig eine Behandlung am selben Tag im Urlaub beschreiben, auch für Kinder. **SeaDent** an der Avinguda Jaume III (4,9 Sterne, ~500 Bewertungen) wirbt mit erweiterten Öffnungszeiten und Wochenendzeiten, wobei Rezensenten Nothilfe außerhalb der normalen Zeiten beschreiben, teils per Telefon oder WhatsApp koordiniert.\n\nFür einen Touristen ohne Termin ist der typische Ablauf, die Praxis anzurufen oder per WhatsApp das Problem zu schildern und einen Termin am selben oder nächsten Tag zu bekommen; wirklich akute Fälle werden oft schnell gesehen. Bewahren Sie jede Quittung und jeden Behandlungsbeleg auf, da Sie ihn möglicherweise später bei der Reiseversicherung geltend machen können (siehe unten). Außerhalb der Praxiszeiten ist die öffentliche Notrufnummer 112 für medizinische Notfälle zuständig, wobei routinemäßige Zahnschmerzen eher an private Notfallpraxen als an Krankenhäuser verwiesen werden.",
    },
    {
      heading: "Implantate, Invisalign und ästhetische Zahnmedizin",
      business_ids: [ID.planas, ID.pronova, ID.coped],
      body: "Praxen auf Mallorca bieten weithin **Zahnimplantate**, **Kieferorthopädie** einschließlich **Invisalign** und **ästhetische Zahnmedizin** an, und hier stellt sich die Frage des Zahntourismus. Für **Implantate** hat **Clínica Dental Dr. Estanislao Planas** in Palma (4,9 Sterne) Rezensenten, die international für Implantatarbeiten anreisen, und **Clínica Pronova** (4,9 Sterne, ~1.000 Bewertungen) ist eine große, moderne Praxis in Palma. Für **Kieferorthopädie und Invisalign** sticht **COped Ortodoncia** im Zentrum von Palma bei den öffentlichen Kennzahlen mit 5,0 Sternen aus über 3.000 Bewertungen hervor — eines der höchsten Bewertungsvolumina aller Praxen der Insel —, wobei Rezensenten ausdrücklich Invisalign erwähnen. Für **ästhetische** Arbeiten gehören Ziving Tomas Sastre und Clínica Dental Vogelsang zu denen, deren Rezensenten Veneers, Bonding und Lächelästhetik erwähnen.\n\nZu den Kosten: Europäische Vergleiche 2026 setzen ein einzelnes Implantat mit Krone in Spanien bei etwa 1.800–3.000 € an, allgemein unter den üblichen privaten Preisen in Großbritannien und Deutschland, sodass Mallorca für britische und deutsche Patienten günstiger sein kann als eine Behandlung zu Hause — mit dem praktischen Vorteil EU-regulierter Versorgung und, für Residenten, ohne Anreise. Es ist jedoch nicht so günstig wie dedizierte Zahntourismus-Zentren wie die Türkei oder Ungarn. Alle Zahlen hier sind Richtwerte aus öffentlichen Quellen; holen Sie stets einen detaillierten schriftlichen Kostenvoranschlag der Praxis ein, und dieser Leitfaden rät weder für noch gegen eine Behandlung.",
    },
    {
      heading: "Versicherung und Bezahlung",
      business_ids: [],
      body: "Die meisten Zahnbehandlungen auf Mallorca werden privat bezahlt, entweder aus eigener Tasche oder über eine **private Zahnversicherung**. Die wichtigsten in Spanien tätigen Versicherer — **Sanitas**, **Adeslas**, **DKV**, **Asisa** und **Mapfre** — bieten Zahntarife an, und viele Praxen geben an, mit welchen Versicherern sie zusammenarbeiten; DKV ist insbesondere in der deutschen Gemeinschaft der Insel weithin bekannt. Wenn Sie eine spanische private Kranken- oder Zahnversicherung haben, prüfen Sie vor der Buchung, welche lokalen Praxen im Netzwerk Ihres Versicherers sind, da Deckung und Zuzahlungen je nach Tarif variieren.\n\nEin wichtiger Punkt für Touristen: Die **EHIC** oder die britische **GHIC**-Karte deckt private Zahnbehandlungen in der Regel **nicht** ab — sie deckt staatlich erbrachte medizinisch notwendige Versorgung, und die öffentliche Zahnversorgung in Spanien ist sehr begrenzt. In der Praxis zahlt ein Tourist, der einen Zahnarzt braucht, fast immer privat. Die Reiseversicherung ist der relevantere Schutz: Viele Policen umfassen zahnärztliche Notfallbehandlungen zur Linderung akuter Schmerzen, bewahren Sie also alle Quittungen und Behandlungsbelege für die spätere Geltendmachung auf. Prüfen Sie das konkrete Zahnlimit Ihrer Police, bevor Sie sich darauf verlassen, da die Deckung in der Regel gedeckelt und auf Notfälle statt auf routinemäßige oder ästhetische Arbeiten beschränkt ist.",
    },
    {
      heading: "Zahnarztpraxen nach Gebiet",
      business_ids: [ID.ferrer, ID.platon, ID.odonto],
      body: "Über Palma hinaus haben die meisten Teile der Insel gut bewertete Praxen. In **Palma** selbst ist die Auswahl am größten — CED Palma, Nueva Clínica Dental, Pronova, Ziving Tomas Sastre, Dental Ferrer und COped (Kieferorthopädie) gehören zu den höher bewerteten. Im **Südwesten** (Calvià, Santa Ponsa, Paguera) sind Dental Centre Mallorca und Santa Ponsa Dental Practice etablierte britisch geführte Optionen, mit Centre Mèdic Juaneda Santa Ponça für umfassendere medizinische und zahnärztliche Bedürfnisse.\n\nIm **Norden** versorgt Dr. Dirk Döring in Port d'Alcúdia den Raum Alcúdia–Pollença, und Clínica Dental Schurian in **Inca** deckt das Inselinnere ab und ist bei Expats im Norden beliebt. An der **Ostküste** versorgt SCHMIEDER in Cala Millor den Raum Cala Millor–Sa Coma, und in **Manacor** sind **Platón Dental** (5,0 Sterne, ~100 Bewertungen) und **Clínica Dental Odontofamilia** (4,9 Sterne) gut bewertete lokale Praxen. Wo auch immer Sie wohnen, eine gut bewertete Praxis ist meist eine kurze Fahrt entfernt; diese Gruppierungen erfolgen nach öffentlicher Bewertung und Lage, nicht nach klinischem Vergleich.",
    },
    {
      heading: "Wie man als Ausländer einen Zahnarzt auswählt",
      business_ids: [],
      body: "Ein paar praktische Prüfungen helfen bei der Wahl einer Praxis auf Mallorca. Erstens die **Sprache**: Wenn Sie auf Englisch oder Deutsch behandelt werden möchten, bestätigen Sie das bei der Buchung — viele Praxen werben damit, und Bewertungen erwähnen es oft. Zweitens die **Versicherung**: Wenn Sie eine spanische Privatversicherung haben, prüfen Sie, ob die Praxis im Netzwerk Ihres Versicherers ist; als Tourist gehen Sie davon aus, dass Sie privat zahlen, und prüfen Sie das Zahnlimit Ihrer Reiseversicherung. Drittens die **Notfallverfügbarkeit**: Wenn Sie im Urlaub sind, notieren Sie sich, welche nahegelegenen Praxen urgencias anbieten und ob sie WhatsApp-Buchungen annehmen.\n\nSchließlich zu Kosten und Behandlung: Fragen Sie im Voraus nach der Gebühr für die Erstberatung, und für jede größere Arbeit (Implantate, Kieferorthopädie, Ästhetik) verlangen Sie einen detaillierten schriftlichen Kostenvoranschlag und lassen Sie sich nicht zu einer Behandlung drängen. Öffentliche Google-Bewertungen und Bewertungszahlen sind ein vernünftiger erster Filter für Zuverlässigkeit und Kommunikation, worauf sich die Hervorhebungen in diesem Leitfaden stützen — aber die richtige Praxis hängt von Ihren konkreten Bedürfnissen ab, und dieser Leitfaden ist informativ und kein Ersatz für professionelle Beratung.",
    },
  ],
  faqs: [
    { question: "Gibt es englischsprachige Zahnärzte auf Mallorca?", answer: "Ja, viele. In Palma haben volumenstarke Praxen wie Clínica Dental CED Palma (Doctor Murad), Nueva Clínica Dental Palma und Ziving Tomas Sastre Rezensenten, die englischsprachiges Personal erwähnen. Im Südwesten sind Dental Centre Mallorca und Santa Ponsa Dental Practice britisch geführt, und im Inselinneren ist Clínica Dental Schurian in Inca bei englischsprachigen Expats beliebt. Bestätigen Sie die Sprache bei der Buchung, da damit weithin geworben wird. Diese werden auf Basis öffentlicher Google-Bewertungen und von Rezensenten erwähnter Sprachen hervorgehoben, nicht aufgrund eines klinischen Urteils." },
    { question: "Wie finde ich einen Notfallzahnarzt auf Mallorca?", answer: "Mallorca hat spezialisierte zahnärztliche Notfallpraxen, hauptsächlich in Palma — Urgencias Dentales Mallorca und Centro Urgencias Dentales sind dedizierte Notfall-Zahnarztpraxen, und SeaDent wirbt mit erweiterten Öffnungszeiten und Wochenendzeiten. Der übliche Ablauf ist, die Praxis anzurufen oder per WhatsApp das Problem zu schildern und einen Termin am selben oder nächsten Tag zu bekommen; akute Fälle werden oft schnell gesehen. Bewahren Sie Quittungen und Behandlungsbelege für eine mögliche Geltendmachung bei der Reiseversicherung auf. Für einen allgemeinen medizinischen Notfall ist 112 die öffentliche Notrufnummer." },
    { question: "Ist eine Zahnbehandlung auf Mallorca günstiger als in Großbritannien oder Deutschland?", answer: "Für britische und deutsche Patienten allgemein ja, aber es ist kein ultragünstiges Ziel. Europäische Vergleiche 2026 setzen ein einzelnes Implantat mit Krone in Spanien bei etwa 1.800–3.000 € an, typischerweise unter den privaten Spannen in Großbritannien (2.000–3.500 £) und Deutschland (1.400–3.500 €), mit dem Vorteil EU-regulierter Versorgung. Mallorca ist jedoch teurer als dedizierte Zahntourismus-Zentren wie die Türkei oder Ungarn. Dies sind Richtwerte aus öffentlichen Quellen; holen Sie stets einen detaillierten schriftlichen Kostenvoranschlag der Praxis ein." },
    { question: "Deckt die EHIC oder eine Reiseversicherung einen Zahnarzt auf Mallorca?", answer: "Die EHIC oder die britische GHIC-Karte deckt private Zahnbehandlungen in der Regel nicht ab — sie deckt staatlich erbrachte medizinisch notwendige Versorgung, und die öffentliche Zahnversorgung Spaniens ist sehr begrenzt, sodass Touristen fast immer privat zahlen. Die Reiseversicherung ist relevanter: Viele Policen decken zahnärztliche Notfallbehandlungen zur Linderung akuter Schmerzen, in der Regel bis zu einem gedeckelten Limit und für Notfälle statt für routinemäßige oder ästhetische Arbeiten. Bewahren Sie alle Quittungen und Behandlungsbelege auf und prüfen Sie das konkrete Zahnlimit Ihrer Police, bevor Sie sich darauf verlassen." },
  ],
  seo: {
    title: "Zahnärzte auf Mallorca: Kompletter Leitfaden 2026",
    description: "Zahnarztsuche auf Mallorca: englisch- und deutschsprachige Praxen, Notdienst, Implantat- und Behandlungskosten vs. Großbritannien und Deutschland, Praxen nach Gebiet.",
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
