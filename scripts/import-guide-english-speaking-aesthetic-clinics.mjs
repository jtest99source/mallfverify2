// scripts/import-guide-english-speaking-aesthetic-clinics.mjs
// EN + DE, status DRAFT (publish via scripts/publish-estetica.mjs).
// Direct replica of the english-speaking-dentists playbook for the aesthetic
// vertical: 13 clinics with directly-confirmed languages (July 2026 outreach,
// outreach-medicina-estetica.xlsx), zones and ratings quoted from our DB.
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

const PALMA_IDS = [
  "google-ChIJAxaAXfGTlxIRbVN0KZXfcBU", // MEDISANS 4.7/654
  "google-ChIJW-NZfT2TlxIRBy0AYH5F_pU", // Dermathos 4.8/135
  "google-ChIJu_rmTYeTlxIRvt_xtzBq_UQ", // Mara Aesthetics 5/121
  "google-ChIJB1o4NLaTlxIROkTorodZp_M", // The Skin Koncept 4.9/157
  "google-ChIJAUwnCwiTlxIRS9IEzYnYBWw"  // GB Clinic 4.8/48
];
const BEYOND_PALMA_IDS = [
  "google-ChIJ83SRLldBlhIRcPUji5fnPes", // MAC Cala Millor 4.8/23
  "google-ChIJ9y4jTURBlhIROvrv1TAsN2o", // RB Cala Millor 5/7
  "google-ChIJoURp8p6JlxIRlGyj9XQMCt8", // MD AESTHETICS Santa Ponça 5/28
  "google-ChIJO1T1RADFlxIRG4MmfpWzC4Y", // OLIVA Inca 5/10
  "google-ChIJzepquNYtlhIR8KKFA28cuvU", // Lumina Alcúdia 5/8
  "google-ChIJ-brUyGHLlxIRP83YuV3HXTk"  // Clínica Font Sineu 4.9/108
];
const REST_IDS = [
  "google-ChIJlQqWVFiSlxIRGrkPlk1Hvtw", // Soma Clinic Palma 4.5/22
  "google-ChIJfbxy79aTlxIRkFkeOlrGcwg"  // Luis Fogued Palma 5/9
];

const AREA_TABLE_EN =
  "| Area | Confirmed clinics |\n| --- | --- |\n| **Palma** | MEDISANS, Dermathos, Mara Aesthetics, The Skin Koncept, GB Clinic, Soma Clinic, Luis Fogued |\n| **Cala Millor (east coast)** | Mallorca Aesthetic Clinic, RB Centro Médico Estético |\n| **Santa Ponça (southwest)** | MD AESTHETICS |\n| **Inca (centre)** | OLIVA Aesthetic & Hair Clinic |\n| **Alcúdia (north)** | Lumina — Dra. Noeli Utges |\n| **Sineu (centre)** | Clínica Font |";
const AREA_TABLE_DE =
  "| Gegend | Bestätigte Kliniken |\n| --- | --- |\n| **Palma** | MEDISANS, Dermathos, Mara Aesthetics, The Skin Koncept, GB Clinic, Soma Clinic, Luis Fogued |\n| **Cala Millor (Ostküste)** | Mallorca Aesthetic Clinic, RB Centro Médico Estético |\n| **Santa Ponça (Südwesten)** | MD AESTHETICS |\n| **Inca (Inselmitte)** | OLIVA Aesthetic & Hair Clinic |\n| **Alcúdia (Norden)** | Lumina — Dra. Noeli Utges |\n| **Sineu (Inselmitte)** | Clínica Font |";

const en = {
  id: "en-english-speaking-aesthetic-clinics-mallorca",
  slug: "english-speaking-aesthetic-clinics-mallorca",
  locale: "en",
  title: "English-Speaking Aesthetic Clinics in Mallorca (2026) — Verified",
  excerpt:
    "13 aesthetic medicine clinics in Mallorca confirmed fluent English directly to us — five speak fluent German too. The verified list, by area, updated July 2026.",
  intro:
    "Short answer: yes — **13 verified aesthetic clinics in Mallorca have confirmed fluent English** directly to us, and five of them treat patients in fluent German as well. This isn't scraped from websites: we contact each clinic on Mallorca Verified directly and record what they confirm about the languages they actually consult in — dated, self-reported, and updated as more clinics reply. For anything injectable, being able to discuss expectations, medical history and aftercare in your own language isn't a comfort feature; it's part of informed consent. Below: the confirmed list, who also covers German, where the clinics are across the island, and what a properly run first appointment looks like under Spanish rules.",
  sections: [
    {
      heading: "The verified list — and how we check it",
      body:
        "Every clinic below confirmed its consultation languages to us by direct contact (WhatsApp) in July 2026. Two honesty notes that apply to everything on this page: the information is **self-reported by each clinic**, and the absence of a clinic here never means it doesn't speak English — it may simply not have answered yet (follow-ups are ongoing, and this list grows).\n\nThe Palma core: **MEDISANS** (Dra. Marta Serna — 4.7★ across 654 reviews, the most-reviewed clinic on this list), **Dermathos Clínica Dermatológica** (4.8★, dermatology-led), **Mara Aesthetics** (5.0★ across 121 reviews, a German-led plastic and aesthetic surgery practice), **The Skin Koncept** (4.9★), **GB Clinic** (4.8★), **Soma Clinic** and **Luis Fogued Dermoestética**.\n\nBeyond the capital, confirmed English extends to every corner of the island — Cala Millor, Santa Ponça, Inca, Alcúdia and Sineu — detailed in the by-area table below. For live language badges across the whole vertical, see the [aesthetic clinic rankings](/en/top/aesthetic-clinics).",
      business_ids: PALMA_IDS
    },
    {
      heading: "Clinics that also speak German (Deutschsprachige Kliniken)",
      body:
        "Five of the thirteen confirmed **fluent German**: **MEDISANS** and **Dermathos** in Palma, **Mara Aesthetics** — German-led, so German is the house language rather than an add-on — plus **Mallorca Aesthetic Clinic** in Cala Millor and **RB Centro Médico Estético**, which rounds out its languages with fluent Polish. Usefully for German-speaking residents, the two east-coast confirmations sit exactly where much of the German community lives.\n\nThree more clinics confirmed basic German alongside fluent English: **Clínica Font** (Sineu, 4.9★ across 108 reviews), **GB Clinic** (Palma) and **MD AESTHETICS** (Santa Ponça) — workable for treatment conversations, with English as the fallback for detail.",
      business_ids: BEYOND_PALMA_IDS.slice(0, 3)
    },
    {
      heading: "English- and German-speaking aesthetic clinics by area",
      body:
        "Where the confirmed clinics are, so you can pick one near where you live or stay:\n\n" + AREA_TABLE_EN + "\n\nThe pattern mirrors where internationals actually live: a dense Palma core, the German-leaning east coast around Cala Millor, the British- and Scandinavian-leaning southwest at Santa Ponça, and — more unusually — solid options inland at Inca and Sineu, which matters if you live in the island's centre and would rather not drive to Palma for a follow-up appointment.",
      business_ids: BEYOND_PALMA_IDS.slice(3)
    },
    {
      heading: "What a properly run first appointment looks like",
      body:
        "Aesthetic medicine in Spain is medicine. Botulinum toxin is a prescription-only medicine that must be administered by physicians — which means a legitimate clinic always starts with a **medical consultation**, in a language you fully understand, before anything is booked or injected. Expect questions about medical history and medication, a discussion of realistic outcomes and duration, and clarity about which authorised product is used and who — by name — treats you.\n\nThat's also your quality filter: a clinic that confirms your language, names its physician and starts with a consultation is showing you its compliance out loud. The full regulatory picture — who can legally inject in Spain, published pricing, and the five checks before choosing — is in our companion guide: [Botox in Mallorca: safety, rules and verified clinics](/en/guides/botox-mallorca-prices-safety).\n\nThis page is informational, not medical advice; treatment decisions belong in that consultation room.",
      business_ids: REST_IDS
    }
  ],
  faqs: [
    {
      question: "Are there English-speaking aesthetic clinics in Mallorca?",
      answer:
        "Yes — 13 verified clinics confirmed fluent English directly to us as of July 2026: MEDISANS, Dermathos, Mara Aesthetics, The Skin Koncept, GB Clinic, Soma Clinic and Luis Fogued in Palma; Mallorca Aesthetic Clinic and RB Centro Médico Estético in Cala Millor; MD AESTHETICS in Santa Ponça; OLIVA in Inca; Lumina in Alcúdia; and Clínica Font in Sineu. The information is self-reported by each clinic via direct contact and dated; clinics not listed may simply not have answered yet."
    },
    {
      question: "Are there German-speaking aesthetic clinics in Mallorca?",
      answer:
        "Five clinics confirmed fluent German: MEDISANS and Dermathos in Palma, the German-led Mara Aesthetics, Mallorca Aesthetic Clinic in Cala Millor and RB Centro Médico Estético (which also confirmed fluent Polish). Three more — Clínica Font, GB Clinic and MD AESTHETICS — confirmed basic German alongside fluent English. The east-coast options are conveniently located for the German-speaking community around Cala Millor and Sa Coma."
    },
    {
      question: "How does Mallorca Verified check which languages a clinic speaks?",
      answer:
        "By asking the clinic directly — we contact every verified business by WhatsApp and record what it confirms about the languages it consults in, with the date of confirmation. It's the clinic's own word, not a certification by us, and we say so transparently. Because it depends on clinics replying, absence from the list is never a negative signal: follow-ups are ongoing and the list is updated as answers arrive."
    },
    {
      question: "Why does the consultation language matter for Botox or fillers?",
      answer:
        "Because in Spain these are medical procedures: botulinum toxin is a prescription-only medicine administered by physicians, and the prior medical consultation — history, expectations, contraindications, aftercare — is where informed consent happens. Discussing that through gestures or a translation app is how misunderstandings occur. A clinic that consults fluently in your language removes the single most avoidable risk factor before any treatment starts."
    }
  ],
  seo: {
    title: "English-Speaking Aesthetic Clinics in Mallorca 2026 (Verified) | Mallorca Verified",
    description:
      "13 aesthetic clinics in Mallorca confirmed fluent English to us directly — 5 fluent German. Verified list by area: Palma, Cala Millor, Santa Ponça, Inca, Alcúdia."
  }
};

const de = {
  id: "de-deutschsprachige-schoenheitskliniken-mallorca",
  slug: "deutschsprachige-schoenheitskliniken-mallorca",
  locale: "de",
  title: "Deutschsprachige Schönheitskliniken auf Mallorca (2026) — geprüft",
  excerpt:
    "Fünf ästhetische Kliniken auf Mallorca haben uns fließendes Deutsch direkt bestätigt, drei weitere Grundkenntnisse — die geprüfte Liste nach Gegend, Stand Juli 2026.",
  intro:
    "Kurze Antwort: Ja — **fünf geprüfte ästhetische Kliniken auf Mallorca haben uns fließendes Deutsch direkt bestätigt**, drei weitere Grundkenntnisse, und dreizehn insgesamt fließendes Englisch. Das ist nicht von Websites abgeschrieben: Wir kontaktieren jede Klinik auf Mallorca Verified direkt und dokumentieren, welche Sprachen sie für Beratung und Behandlung bestätigt — datiert, als Selbstauskunft, laufend aktualisiert. Bei allem, was gespritzt wird, ist die Beratungssprache kein Komfort-Extra: Erwartungen, Krankengeschichte und Nachsorge in der eigenen Sprache besprechen zu können, ist Teil der informierten Einwilligung. Unten: die bestätigte Liste, die Verteilung über die Insel und wie ein sauber geführter Ersttermin nach spanischen Regeln aussieht.",
  sections: [
    {
      heading: "Die geprüfte Liste — und wie wir sie erstellen",
      body:
        "Jede Klinik unten hat uns ihre Beratungssprachen im Juli 2026 per Direktkontakt (WhatsApp) bestätigt. Zwei Ehrlichkeits-Hinweise vorab: Die Angaben sind **Selbstauskünfte der Kliniken**, und das Fehlen einer Klinik heißt nie, dass dort kein Deutsch oder Englisch gesprochen wird — sie hat womöglich nur noch nicht geantwortet (die Nachfassrunde läuft, die Liste wächst).\n\n**Fließendes Deutsch bestätigt haben fünf Kliniken**: **MEDISANS** (Dra. Marta Serna — mit 4,7★ bei 654 Rezensionen die meistbewertete Klinik dieser Liste) und **Dermathos Clínica Dermatológica** (4,8★, dermatologisch geführt) in Palma, **Mara Aesthetics** (5,0★ bei 121 Rezensionen — deutsch geführt, Deutsch ist hier Haussprache, kein Zusatz), die **Mallorca Aesthetic Clinic** in Cala Millor und **RB Centro Médico Estético**, das zusätzlich fließendes Polnisch bestätigt hat. Praktisch: Die beiden Ostküsten-Bestätigungen liegen genau dort, wo ein großer Teil der deutschsprachigen Community lebt.\n\nDrei weitere Kliniken bestätigten Grundkenntnisse in Deutsch neben fließendem Englisch: **Clínica Font** (Sineu, 4,9★ bei 108 Rezensionen), **GB Clinic** (Palma) und **MD AESTHETICS** (Santa Ponça).",
      business_ids: PALMA_IDS
    },
    {
      heading: "Und auf Englisch? Die komplette bestätigte Liste",
      body:
        "Alle dreizehn Kliniken haben fließendes Englisch bestätigt — neben den fünf deutschsprachigen sind das **The Skin Koncept** (4,9★), **GB Clinic** (4,8★), **Soma Clinic** und **Luis Fogued Dermoestética** in Palma, **MD AESTHETICS** in Santa Ponça, **OLIVA Aesthetic & Hair Clinic** in Inca, **Lumina** (Dra. Noeli Utges) in Alcúdia und **Clínica Font** in Sineu. Für Paare und Familien mit gemischten Sprachen deckt die Liste damit beide Richtungen ab.\n\nDas Live-Bild mit Sprach-Badges über den gesamten Sektor zeigt das [Ranking der ästhetischen Kliniken](/de/top/aesthetic-clinics).",
      business_ids: BEYOND_PALMA_IDS.slice(0, 3)
    },
    {
      heading: "Deutsch- und englischsprachige Kliniken nach Gegend",
      body:
        "Wo die bestätigten Kliniken liegen — damit Sie eine in Ihrer Nähe wählen können:\n\n" + AREA_TABLE_DE + "\n\nDas Muster spiegelt, wo Internationale tatsächlich leben: ein dichter Kern in Palma, die deutsch geprägte Ostküste um Cala Millor, der britisch-skandinavisch geprägte Südwesten bei Santa Ponça — und, ungewöhnlicher, solide Optionen im Inselinneren (Inca, Sineu), was zählt, wenn man in der Inselmitte wohnt und für einen Folgetermin nicht nach Palma fahren will.",
      business_ids: BEYOND_PALMA_IDS.slice(3)
    },
    {
      heading: "Wie ein sauber geführter Ersttermin aussieht",
      body:
        "Ästhetische Medizin ist in Spanien Medizin. Botulinumtoxin ist ein verschreibungspflichtiges Medikament, das von Ärzten verabreicht werden muss — eine seriöse Klinik beginnt deshalb immer mit einer **ärztlichen Konsultation**, in einer Sprache, die Sie vollständig verstehen, bevor irgendetwas gebucht oder gespritzt wird. Erwarten Sie Fragen zu Krankengeschichte und Medikamenten, ein Gespräch über realistische Ergebnisse und Wirkdauer sowie Klarheit darüber, welches zugelassene Präparat verwendet wird und wer — namentlich — behandelt.\n\nDas ist zugleich Ihr Qualitätsfilter: Eine Klinik, die Ihre Sprache bestätigt, ihren Arzt benennt und mit einer Konsultation beginnt, zeigt ihre Regelkonformität von selbst. Das komplette Regulierungsbild — wer in Spanien legal spritzen darf, veröffentlichte Preise und die fünf Checks vor der Klinikwahl — steht im Begleit-Guide: [Botox auf Mallorca: Sicherheit, Regeln und geprüfte Kliniken](/de/guides/botox-mallorca-kosten-sicherheit).\n\nDiese Seite informiert — Behandlungsentscheidungen gehören ins Beratungszimmer.",
      business_ids: REST_IDS
    }
  ],
  faqs: [
    {
      question: "Gibt es deutschsprachige Schönheitskliniken auf Mallorca?",
      answer:
        "Ja — fünf geprüfte Kliniken haben uns fließendes Deutsch direkt bestätigt (Stand Juli 2026): MEDISANS und Dermathos in Palma, die deutsch geführte Mara Aesthetics, die Mallorca Aesthetic Clinic in Cala Millor und RB Centro Médico Estético, das zusätzlich fließendes Polnisch bestätigt hat. Drei weitere — Clínica Font (Sineu), GB Clinic (Palma) und MD AESTHETICS (Santa Ponça) — bestätigten Grundkenntnisse neben fließendem Englisch. Selbstauskunft per Direktkontakt, datiert; fehlende Kliniken haben womöglich nur noch nicht geantwortet."
    },
    {
      question: "Gibt es englischsprachige ästhetische Kliniken auf Mallorca?",
      answer:
        "Ja, dreizehn geprüfte Kliniken haben fließendes Englisch bestätigt — in Palma (MEDISANS, Dermathos, Mara Aesthetics, The Skin Koncept, GB Clinic, Soma Clinic, Luis Fogued), Cala Millor (Mallorca Aesthetic Clinic, RB), Santa Ponça (MD AESTHETICS), Inca (OLIVA), Alcúdia (Lumina) und Sineu (Clínica Font). Die Liste wächst mit jeder Antwort aus der laufenden Nachfassrunde."
    },
    {
      question: "Wie prüft Mallorca Verified die Sprachen einer Klinik?",
      answer:
        "Durch direkte Nachfrage: Wir kontaktieren jeden geprüften Betrieb per WhatsApp und dokumentieren, welche Beratungssprachen er bestätigt — mit Datum. Es ist die Selbstauskunft der Klinik, keine Zertifizierung durch uns, und genau so kennzeichnen wir es. Da die Liste von Antworten abhängt, ist Abwesenheit nie ein negatives Signal: Die Nachfassrunde läuft, und die Liste wird laufend aktualisiert."
    },
    {
      question: "Warum ist die Beratungssprache bei Botox oder Fillern wichtig?",
      answer:
        "Weil es in Spanien medizinische Eingriffe sind: Botulinumtoxin ist ein verschreibungspflichtiges, von Ärzten zu verabreichendes Medikament, und die vorherige ärztliche Konsultation — Krankengeschichte, Erwartungen, Kontraindikationen, Nachsorge — ist der Ort der informierten Einwilligung. Das per Gesten oder Übersetzungs-App zu führen, ist die vermeidbarste Fehlerquelle des gesamten Prozesses. Eine Klinik, die fließend in Ihrer Sprache berät, räumt diesen Risikofaktor aus, bevor die Behandlung beginnt."
    }
  ],
  seo: {
    title: "Deutschsprachige Schönheitskliniken Mallorca 2026 (geprüft) | Mallorca Verified",
    description:
      "5 ästhetische Kliniken auf Mallorca mit direkt bestätigtem Deutsch, 13 mit Englisch — die geprüfte Liste nach Gegend: Palma, Cala Millor, Santa Ponça, Inca, Alcúdia."
  }
};

for (const g of [en, de]) {
  const guide = {
    ...g,
    status: "draft",
    source: "editorial",
    is_featured: false,
    hero_image_url: null,
    updated_at: "2026-07-26",
    created_at: new Date().toISOString(),
    imported_at: new Date().toISOString()
  };
  const { data: existing } = await sb.from("guides").select("id").eq("slug", g.slug).eq("locale", g.locale).maybeSingle();
  if (existing) { console.log(`Ya existe ${g.locale}/${g.slug}`); continue; }
  const { error } = await sb.from("guides").insert(guide);
  if (error) throw error;
  console.log(`DRAFT creado ${g.locale}/${g.slug}: "${g.title}"`);
}
