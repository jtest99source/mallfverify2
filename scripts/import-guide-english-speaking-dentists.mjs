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
  impress: "google-ChIJvbzl0DSTlxIRE4sTAudqln0",
  schurian: "google-ChIJbbP84rPFlxIRdN_GpVa_PGQ",
  urgencias: "google-ChIJ02SxLKyTlxIRr0BSTuivsz8",
  aureo: "google-ChIJOZ7pYISSlxIRJtFIeNyzL1s",
  osorio: "google-ChIJpVCrAn6NlxIRVXB1wi8ZVdQ",
  dentinet: "google-ChIJWc-symCSlxIRDf7co_rGe48",
  advance: "google-ChIJHeO4vnmPlxIRkEUhIzj21Vo",
  art: "google-ChIJRTCC7EeIlxIRQjolyAhYKio",
  sensident: "google-ChIJ5Rk9hAm5lxIR08GQY3VkBGk",
  calador: "google-ChIJ42ojRMNQlhIRrGQcTHIkhaA",
  mydentist: "google-ChIJSaZZTnOSlxIRE4gYsgpKUiI",
  mzl: "google-ChIJ5WA4cx2TlxIRvuXqtgaYb-g",
  garcias: "google-ChIJO4ZrAVuSlxIRWTVeO2MIeP8",
  endobalear: "google-ChIJnS90CFE5mRIRsB0WD6z7Yf0",
  vhd: "google-ChIJfyd4_5uTlxIRltT4dX2FLfA",
  ana: "google-ChIJQXGo5UFBlhIRJ2VF4wEnH2g",
  periodent: "google-ChIJdbamTViSlxIRnJcHTI7dddo",
  platon: "google-ChIJ_w9Cp2WSlxIRlroOI5jF0rY",
  paguera: "google-ChIJezRYjE4nmBIRkVaEpzaQpuo",
  balboa: "google-ChIJW5QayoA_lhIRMiR9bJeG3FY",
  fuentes: "google-ChIJVVUlZKhJlhIRaCFqq-OgJAU"
};

const enGuide = {
  id: crypto.randomUUID(),
  slug: "english-speaking-dentists-mallorca",
  locale: "en",
  title: "English & German-Speaking Dentists in Mallorca: The Verified List (2026)",
  excerpt: "The verified list of English- and German-speaking dentists in Mallorca — clinics that confirmed, in their own words, which languages they treat patients in. By area, plus emergency and kids' dental care.",
  intro: "**Short answer: yes.** Nineteen dental clinics in Mallorca confirmed they treat patients in **fluent English**, and eleven of those in **fluent German** too — from Palma to Inca, Manacor and the resort coasts. And this isn't guessed from star ratings: we messaged each clinic on **WhatsApp** and asked them directly.\n\nBecause a cracked molar is bad enough without having to mime it at a reception desk. Below is the verified list, the multilingual clinics, a breakdown by area, and the practical questions every expat ends up asking. It's informational, not dental advice — clinics are highlighted on confirmed languages and public Google ratings, never on payment.",
  sections: [
    {
      heading: "How we verified who speaks what",
      business_ids: [],
      body: "We didn't infer this from review text or assume that a five-star rating means someone at the desk speaks English. We **contacted each clinic directly on WhatsApp** — the way most of Mallorca actually does business — and asked one plain question: which languages do you treat patients in? When a clinic tells us *fluent*, that's their word; when it's *basic*, we mark it basic, because \"we can manage\" and \"we'll run your whole consultation in German\" are very different things with a drill involved.\n\nTwo honest caveats. It's **self-reported** — the clinic's own word, not a certification by us — and the **absence of a clinic from this list doesn't mean it has no English**, only that we haven't confirmed it yet. Staff changes, so we re-check periodically, and every clinic profile shows the date we last confirmed it. You can browse the full, filterable list any time on our [dentists ranking](/en/top/dentists?lang=en)."
    },
    {
      heading: "Dentists in Mallorca that speak English",
      business_ids: [ID.impress, ID.dentinet, ID.mydentist, ID.endobalear, ID.aureo, ID.osorio, ID.fuentes],
      body: "Nineteen clinics confirmed **fluent English**. In **Palma**, the busiest by far is **Impress** (★4.8, 1,100+ reviews), with **Dentinet**, **My Dentist & Beauty**, **Endobalear**, **Clínica Áureo** and the orthodontics-focused **Marina Osorio** all confirming fluent English too. Out of the city, **Fuentes y Rosselló** in **Manacor** (★5.0) and **Advance** in **Calvià** are strong English-first options.\n\nThe full fluent-English list: Impress, Schurian (Inca), Áureo, Marina Osorio, Dentinet, Advance, Art Mallorca (Santa Ponça), Sensident (Algaida), Centro Médico Cala d'Or, My Dentist & Beauty, MZL, Endobalear, VHD, Ana (Cala Millor), Periodent, Platón, Paguera, Balboa and Fuentes y Rosselló. Two more — **Clínica Dental Garcias** and the emergency-focused **Centro de Urgencias Dentales**, both in Palma — confirmed **basic** English, fine for routine visits and handy to know."
    },
    {
      heading: "Dentists that also speak German (Deutschsprachige Zahnärzte)",
      business_ids: [ID.schurian, ID.art, ID.mzl, ID.vhd, ID.periodent, ID.platon],
      body: "Eleven of the clinics confirmed **fluent German** as well — the shortlist if Deutsch is your first language: **Schurian** (Inca), **Art Mallorca** (Santa Ponça), **Sensident** (Algaida), **Centro Médico Cala d'Or**, **MZL** (Palma), **VHD** (Palma), **Ana** (Cala Millor), **Periodent** (Palma), **Platón** (Palma), **Paguera** and **Balboa** (Cala Millor). Impress in Palma confirmed German at a basic level.\n\nUsefully, they cluster exactly where German residents and visitors do — the southwest around Santa Ponça and Peguera, the east coast around Cala Millor and Cala d'Or, and the interior around Inca — plus plenty of choice in central Palma."
    },
    {
      heading: "The multilingual clinics",
      business_ids: [ID.paguera, ID.calador, ID.ana, ID.sensident],
      body: "A handful go well beyond English and German. **Clínica Dental Paguera** in Peguera covers six languages — add Italian, Romanian, French and Portuguese. **Schurian** in Inca throws in Norwegian, Hungarian and Slovak. **Centro Médico Cala d'Or** adds Polish and French; **Clínica Dental Ana** in Cala Millor and **VHD** in Palma both add Swedish; **Sensident** in Algaida adds Italian. Worth bookmarking if your family WhatsApp group spans a few flags."
    },
    {
      heading: "English- and German-speaking dentists by area",
      business_ids: [ID.balboa, ID.advance, ID.garcias, ID.urgencias],
      body: "Where the verified clinics are, so you can pick one near where you live or stay:\n\n| Area | Verified clinics |\n| --- | --- |\n| **Palma** | Impress, Áureo, Marina Osorio, Dentinet, My Dentist & Beauty, MZL, Endobalear, VHD, Periodent, Platón, Garcias, Urgencias Dentales |\n| **Calvià / Santa Ponça / Peguera** | Advance, Art Mallorca, Paguera |\n| **Cala Millor** | Ana, Balboa |\n| **Cala d'Or** | Centro Médico Cala d'Or |\n| **Inca** | Schurian |\n| **Algaida** | Sensident |\n| **Manacor** | Fuentes y Rosselló |\n\nPalma has the widest choice, but the resort coasts and the interior are well covered — and the German-speaking clinics are, conveniently, concentrated in exactly the areas with the most German residents."
    }
  ],
  faqs: [
    { question: "Are there English-speaking dentists in Mallorca?", answer: "Yes — 19 dental clinics confirmed to us (by WhatsApp) that they treat patients in fluent English, from Palma to Inca, Manacor and the resort coasts, plus two more with basic English. Examples include Impress and Dentinet in Palma, Schurian in Inca and Fuentes y Rosselló in Manacor. It's self-reported by each clinic and confirmed by direct contact; the full, filterable list is on our dentists ranking." },
    { question: "Are there German-speaking dentists in Mallorca (deutschsprachiger Zahnarzt)?", answer: "Yes — 11 clinics confirmed fluent German, concentrated in the southwest (Santa Ponça, Peguera), the east coast (Cala Millor, Cala d'Or), the interior around Inca and central Palma. Examples: Schurian (Inca), Art Mallorca (Santa Ponça), Ana (Cala Millor) and VHD (Palma)." },
    { question: "How much does a dentist cost in Mallorca?", answer: "Dental care in Spain is almost entirely private, so you pay per treatment. Prices vary by clinic and treatment; a routine check-up is modest, and several clinics offer a free first consultation with a written quote (presupuesto) — always ask for the itemised quote up front. For major work like implants, Spain is generally cheaper than the private UK or Germany, though not as cheap as dedicated dental-tourism hubs like Turkey or Hungary." },
    { question: "Is there a 24-hour or emergency dentist in Mallorca?", answer: "For urgent problems, Centro de Urgencias Dentales in Palma is a dedicated emergency dental clinic. Many clinics also keep same-day or same-week slots — message ahead on WhatsApp describing the problem and they'll usually fit you in. Keep receipts and treatment notes for a possible travel-insurance claim; 112 is the public emergency number." },
    { question: "Can I find a children's dentist (odontopediatría) in Mallorca?", answer: "Yes — ask for odontopediatría when booking. Most of the Palma clinics on this verified list treat children, and the emergency clinics regularly see kids who fall ill on holiday." },
    { question: "Who is the best-rated dentist in Mallorca?", answer: "Several verified clinics sit at ★4.9–5.0 on Google. We rank by our MV Score, which combines the Google rating with review volume — so a 4.9 with 1,000 reviews outranks a 5.0 with 30. See the full ranking, filterable by English or German, on our dentists page." }
  ],
  seo: {
    title: "English & German-Speaking Dentists in Mallorca (Verified 2026)",
    description: "The verified list of English- and German-speaking dentists in Mallorca — 19 clinics confirmed fluent English, 11 fluent German, by area, plus emergency and kids' care. We asked them directly."
  },
  status: "published",
  source: "mallorca_verified_outreach",
  is_featured: true,
  hero_image_url: null,
  updated_at: new Date().toISOString().slice(0, 10),
  imported_at: new Date().toISOString()
};

const deGuide = {
  id: crypto.randomUUID(),
  slug: "deutschsprachige-zahnaerzte-mallorca",
  locale: "de",
  title: "Deutschsprachige Zahnärzte auf Mallorca: Die geprüfte Liste (2026)",
  excerpt: "Die geprüfte Liste deutsch- und englischsprachiger Zahnärzte auf Mallorca — Kliniken, die uns selbst bestätigt haben, in welchen Sprachen sie behandeln. Nach Gegend, plus Notdienst und Kinderzahnheilkunde.",
  intro: "**Kurze Antwort: ja.** Elf Zahnkliniken auf Mallorca haben uns bestätigt, dass sie Patienten auf **fließend Deutsch** behandeln — und neunzehn auf fließend Englisch — von Palma über Inca und Manacor bis an die Urlaubsküsten. Und das ist nicht aus Bewertungen geraten: Wir haben jede Klinik direkt per **WhatsApp** angeschrieben und gefragt.\n\nDenn ein abgebrochener Backenzahn ist schlimm genug, ohne ihn am Empfang auch noch pantomimisch erklären zu müssen. Unten die geprüfte Liste, die mehrsprachigen Kliniken, eine Übersicht nach Gegend und die praktischen Fragen, die sich jeder Expat irgendwann stellt. Informativ, keine zahnärztliche Beratung — Kliniken werden nach bestätigten Sprachen und öffentlichen Google-Bewertungen hervorgehoben, nie nach Bezahlung.",
  sections: [
    {
      heading: "Wie wir geprüft haben, wer welche Sprache spricht",
      business_ids: [],
      body: "Wir haben das nicht aus Bewertungstexten abgeleitet oder angenommen, dass fünf Sterne bedeuten, dass am Empfang jemand Deutsch spricht. Wir haben **jede Klinik direkt per WhatsApp kontaktiert** — so, wie auf Mallorca das meiste läuft — und eine einfache Frage gestellt: In welchen Sprachen behandeln Sie Patienten? Sagt eine Klinik *fließend*, ist das ihre Aussage; sagt sie *Grundkenntnisse*, notieren wir Grundkenntnisse — denn \"wir kommen zurecht\" und \"wir machen die ganze Beratung auf Deutsch\" sind mit einem Bohrer im Spiel zwei sehr verschiedene Dinge.\n\nZwei ehrliche Hinweise. Es ist **selbst angegeben** — die eigene Aussage der Klinik, keine Zertifizierung durch uns — und das **Fehlen einer Klinik in dieser Liste bedeutet nicht, dass dort kein Deutsch gesprochen wird**, sondern nur, dass wir es noch nicht bestätigt haben. Da sich Personal ändert, prüfen wir regelmäßig nach, und jedes Klinikprofil zeigt das Datum der letzten Bestätigung. Die vollständige, filterbare Liste findest du in unserem [Zahnärzte-Ranking](/de/top/dentists?lang=de)."
    },
    {
      heading: "Zahnärzte auf Mallorca, die Deutsch sprechen",
      business_ids: [ID.schurian, ID.art, ID.mzl, ID.vhd, ID.periodent, ID.platon],
      body: "Elf Kliniken haben **fließend Deutsch** bestätigt — die engere Auswahl, wenn Deutsch deine Muttersprache ist: **Schurian** (Inca), **Art Mallorca** (Santa Ponça), **Sensident** (Algaida), **Centro Médico Cala d'Or**, **MZL** (Palma), **VHD** (Palma), **Ana** (Cala Millor), **Periodent** (Palma), **Platón** (Palma), **Paguera** und **Balboa** (Cala Millor). Impress in Palma bestätigte Deutsch auf Grundniveau.\n\nPraktischerweise liegen sie genau dort, wo auch die meisten deutschen Residenten und Urlauber sind — der Südwesten um Santa Ponça und Peguera, die Ostküste um Cala Millor und Cala d'Or, das Landesinnere um Inca — und dazu reichlich Auswahl im Zentrum von Palma."
    },
    {
      heading: "Zahnärzte, die auch Englisch sprechen",
      business_ids: [ID.impress, ID.dentinet, ID.fuentes, ID.advance],
      body: "Neunzehn Kliniken haben **fließend Englisch** bestätigt. In **Palma** ist **Impress** mit Abstand die meistbewertete (★4.8, über 1.100 Bewertungen), dazu **Dentinet**, **My Dentist & Beauty**, **Endobalear**, **Clínica Áureo** und die auf Kieferorthopädie spezialisierte **Marina Osorio**. Außerhalb der Stadt sind **Fuentes y Rosselló** in **Manacor** (★5.0) und **Advance** in **Calvià** starke englischsprachige Optionen.\n\nDie meisten deutschsprachigen Kliniken oben behandeln ebenfalls auf Englisch, sodass zweisprachige Familien fast immer eine passende Praxis in der Nähe finden."
    },
    {
      heading: "Die mehrsprachigen Kliniken",
      business_ids: [ID.paguera, ID.calador, ID.ana, ID.sensident],
      body: "Einige gehen weit über Deutsch und Englisch hinaus. **Clínica Dental Paguera** in Peguera deckt sechs Sprachen ab — dazu Italienisch, Rumänisch, Französisch und Portugiesisch. **Schurian** in Inca bringt Norwegisch, Ungarisch und Slowakisch mit. **Centro Médico Cala d'Or** ergänzt Polnisch und Französisch; **Ana** (Cala Millor) und **VHD** (Palma) sprechen zusätzlich Schwedisch; **Sensident** (Algaida) auch Italienisch. Praktisch, wenn der Familien-Chat mehrere Flaggen hat."
    },
    {
      heading: "Deutsch- und englischsprachige Zahnärzte nach Gegend",
      business_ids: [ID.balboa, ID.calador, ID.garcias, ID.urgencias],
      body: "Wo die geprüften Kliniken liegen, damit du eine in deiner Nähe findest:\n\n| Gegend | Geprüfte Kliniken |\n| --- | --- |\n| **Palma** | Impress, Áureo, Marina Osorio, Dentinet, My Dentist & Beauty, MZL, Endobalear, VHD, Periodent, Platón, Garcias, Urgencias Dentales |\n| **Calvià / Santa Ponça / Peguera** | Advance, Art Mallorca, Paguera |\n| **Cala Millor** | Ana, Balboa |\n| **Cala d'Or** | Centro Médico Cala d'Or |\n| **Inca** | Schurian |\n| **Algaida** | Sensident |\n| **Manacor** | Fuentes y Rosselló |\n\nPalma hat die größte Auswahl, aber die Urlaubsküsten und das Landesinnere sind gut abgedeckt — und die deutschsprachigen Kliniken liegen genau dort, wo die meisten deutschen Residenten wohnen."
    }
  ],
  faqs: [
    { question: "Gibt es deutschsprachige Zahnärzte auf Mallorca?", answer: "Ja — 11 Zahnkliniken haben uns per WhatsApp bestätigt, dass sie Patienten auf fließend Deutsch behandeln, vor allem im Südwesten (Santa Ponça, Peguera), an der Ostküste (Cala Millor, Cala d'Or), im Landesinneren um Inca und in Palma. Beispiele: Schurian (Inca), Art Mallorca (Santa Ponça), Ana (Cala Millor) und VHD (Palma). Es ist eine Selbstauskunft der Kliniken, durch direkten Kontakt bestätigt." },
    { question: "Gibt es englischsprachige Zahnärzte auf Mallorca?", answer: "Ja — 19 Kliniken haben fließend Englisch bestätigt, von Palma über Inca und Manacor bis an die Urlaubsküsten, dazu zwei weitere mit Grundkenntnissen. Beispiele sind Impress und Dentinet in Palma, Schurian in Inca und Fuentes y Rosselló in Manacor. Die vollständige, filterbare Liste findest du in unserem Zahnärzte-Ranking." },
    { question: "Was kostet ein Zahnarzt auf Mallorca?", answer: "Zahnmedizin ist in Spanien fast ausschließlich privat, du zahlst also pro Behandlung. Die Preise variieren je nach Klinik und Behandlung; eine Routinekontrolle ist günstig, und mehrere Kliniken bieten eine kostenlose Erstberatung mit schriftlichem Kostenvoranschlag (presupuesto) — frag immer vorher nach dem detaillierten Angebot. Bei größeren Arbeiten wie Implantaten ist Spanien in der Regel günstiger als privat in Deutschland, aber nicht so günstig wie reine Dentaltourismus-Ziele wie die Türkei oder Ungarn." },
    { question: "Gibt es einen Notdienst oder 24-Stunden-Zahnarzt auf Mallorca?", answer: "Für akute Probleme ist das Centro de Urgencias Dentales in Palma eine reine Notfall-Zahnklinik. Viele Praxen halten auch kurzfristige Termine frei — schreib vorab per WhatsApp mit einer Beschreibung des Problems. Bewahre Belege für eine mögliche Reiseversicherungs-Erstattung auf; 112 ist die öffentliche Notrufnummer." },
    { question: "Gibt es Kinderzahnärzte (odontopediatría) auf Mallorca?", answer: "Ja — frag bei der Buchung nach odontopediatría. Die meisten Palma-Kliniken auf dieser geprüften Liste behandeln Kinder, und die Notfallkliniken sehen regelmäßig Kinder, die im Urlaub krank werden." },
    { question: "Wer ist der bestbewertete Zahnarzt auf Mallorca?", answer: "Mehrere geprüfte Kliniken liegen bei ★4.9–5.0 auf Google. Wir ranken nach unserem MV Score, der die Google-Bewertung mit dem Rezensionsvolumen kombiniert — ein 4.9 mit 1.000 Bewertungen liegt also vor einem 5.0 mit 30. Das vollständige, nach Sprache filterbare Ranking findest du auf unserer Zahnärzte-Seite." }
  ],
  seo: {
    title: "Deutschsprachige Zahnärzte auf Mallorca (geprüft 2026)",
    description: "Die geprüfte Liste deutsch- und englischsprachiger Zahnärzte auf Mallorca — 11 Kliniken mit fließend Deutsch, 19 mit fließend Englisch, nach Gegend, plus Notdienst und Kinderzahnheilkunde."
  },
  status: "published",
  source: "mallorca_verified_outreach",
  is_featured: true,
  hero_image_url: null,
  updated_at: new Date().toISOString().slice(0, 10),
  imported_at: new Date().toISOString()
};

for (const guide of [enGuide, deGuide]) {
  const { data: existing } = await sb.from("guides").select("id").eq("slug", guide.slug).eq("locale", guide.locale).maybeSingle();
  if (existing) { console.log(`skip (exists): ${guide.slug} (${guide.locale})`); continue; }
  const { error } = await sb.from("guides").insert(guide);
  if (error) { console.error(`Error ${guide.locale}:`, error.message); process.exit(1); }
  console.log(`✓ Published: ${guide.slug} (${guide.locale}) · sections ${guide.sections.length} · faqs ${guide.faqs.length} · cards ${guide.sections.flatMap(s => s.business_ids).length}`);
}
