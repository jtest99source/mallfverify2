// scripts/import-guide-botox-mallorca.mjs
// EN + DE, status DRAFT (publish via scripts/publish-estetica.mjs).
// Anchored on: (a) language verification from direct outreach (13 clinics EN,
// 5 DE fluent + 3 basic, July 2026 — sheet outreach-medicina-estetica.xlsx),
// (b) AEMPS regulation verified 2026-07-26 (prescription-only medicine,
// physician administration; regional monitoring by the Balearic authority),
// (c) published price lists only — NO invented ranges (survey in progress).
// Sensitive category: neutral tone, no "best clinic" claims, light disclaimer.
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

// The 13 responders — all matched to published businesses by Google cid.
const DE_FLUENT_IDS = [
  "google-ChIJAxaAXfGTlxIRbVN0KZXfcBU", // MEDISANS
  "google-ChIJW-NZfT2TlxIRBy0AYH5F_pU", // Dermathos
  "google-ChIJu_rmTYeTlxIRvt_xtzBq_UQ", // Mara Aesthetics
  "google-ChIJ83SRLldBlhIRcPUji5fnPes", // Mallorca Aesthetic Clinic - Cala Millor
  "google-ChIJ9y4jTURBlhIROvrv1TAsN2o"  // RB Centro Médico Estético
];
const EN_ONLY_IDS = [
  "google-ChIJB1o4NLaTlxIROkTorodZp_M", // The Skin Koncept
  "google-ChIJlQqWVFiSlxIRGrkPlk1Hvtw", // Soma Clinic
  "google-ChIJO1T1RADFlxIRG4MmfpWzC4Y", // OLIVA Inca
  "google-ChIJfbxy79aTlxIRkFkeOlrGcwg", // Luis Fogued
  "google-ChIJzepquNYtlhIR8KKFA28cuvU"  // Lumina - Dra. Noeli Utges
];
const DE_BASIC_IDS = [
  "google-ChIJ-brUyGHLlxIRP83YuV3HXTk", // Clínica Font
  "google-ChIJAUwnCwiTlxIRS9IEzYnYBWw", // GB Clinic
  "google-ChIJoURp8p6JlxIRlGyj9XQMCt8"  // MD AESTHETICS
];

const en = {
  id: "en-botox-mallorca-prices-safety",
  slug: "botox-mallorca-prices-safety",
  locale: "en",
  title: "Botox in Mallorca: Safety, Rules and Verified Clinics (2026)",
  excerpt:
    "Is Botox safe in Spain? What the law actually requires, which Mallorca clinics confirmed English and German directly to us, and how to vet a clinic properly.",
  intro:
    "Short answer: yes, Botox in Spain is tightly regulated — more tightly than many visitors expect. Botulinum toxin is a **prescription-only medicine** here: it can only be dispensed through an authorised pharmacy against an individual medical prescription, and Spanish health authorities state it must be administered by physicians with adequate experience. That single fact answers most of the safety question before you ever compare clinics. The rest is knowing who you'll actually be able to talk to: we contacted Mallorca's aesthetic clinics directly, and so far **13 verified clinics have confirmed fluent English** — five of them fluent German as well. This guide covers what the law requires, which clinics confirmed languages to us, what can honestly be said about prices in 2026, and the checks worth doing before anyone comes near your face. It's informational, not medical advice.",
  sections: [
    {
      heading: "Who is legally allowed to inject Botox in Spain?",
      body:
        "In Spain, botulinum toxin (the active substance behind Botox®, and the aesthetics-authorised Vistabel®) is regulated as a **prescription-only medicine**, not a cosmetic product. In practice that means three things. First, it can only be legally supplied through an authorised pharmacy, against an individual prescription — there is no legal over-the-counter or online route. Second, the Spanish medicines agency (AEMPS) states these medicines should only be administered by **physicians with sufficient experience** and the right equipment. Third, this isn't theoretical: health authorities — including the Balearic Islands' own product-control services — actively monitor compliance.\n\nThe practical consequence for anyone comparing offers: an injectable \"botox\" session offered by a beauty salon without a prescribing doctor on site isn't a bargain — it's outside the legal framework. A legitimate clinic will always run a prior medical consultation (that's where the prescription comes from), and will tell you without hesitation which physician is treating you and which authorised product they use.\n\nThe same logic extends to hyaluronic-acid fillers: while regulated differently (as medical devices), serious clinics in Spain treat them as medical procedures with a doctor's assessment first. If the person holding the syringe can't be identified as a colegiado physician, walk away.",
      business_ids: []
    },
    {
      heading: "English- and German-speaking aesthetic clinics — confirmed directly",
      body:
        "We contact every verified clinic directly (by WhatsApp) and record what they confirm about the languages they treat patients in. It's self-reported by the clinic and dated — and the absence of a badge never means a clinic *doesn't* speak your language; it may simply not have answered yet. As of July 2026, **13 aesthetic clinics have confirmed fluent English**.\n\n**German speakers have five clinics confirmed fluent**: **MEDISANS** (Dra. Marta Serna, Palma), **Dermathos Clínica Dermatológica**, **Mara Aesthetics** (German-led plastic and aesthetic surgery practice), **Mallorca Aesthetic Clinic** in Cala Millor — useful for the east coast — and **RB Centro Médico Estético**, which also confirmed fluent Polish. Three more confirmed basic German alongside fluent English: **Clínica Font**, **GB Clinic** and **MD AESTHETICS**.\n\nEnglish-only confirmations round out the list: **The Skin Koncept**, **Soma Clinic**, **OLIVA Aesthetic & Hair Clinic** in Inca, **Luis Fogued Dermoestética** and **Lumina** (Dra. Noeli Utges). Follow-ups with the rest of the island's clinics are ongoing, so this list grows — check the [aesthetic clinic rankings](/en/top/aesthetic-clinics) for the live picture with language badges.",
      business_ids: DE_FLUENT_IDS
    },
    {
      heading: "What Botox and fillers cost in Mallorca — what we can say honestly",
      body:
        "We don't publish price ranges we haven't verified, and generic \"Botox costs €X in Spain\" numbers found online are exactly that — generic. What we can say with sources: pricing transparency is improving, and some verified clinics now publish real prices on their own websites — Mara Aesthetics, for example, **publishes wrinkle-injection pricing starting at €300 per millilitre** for hyaluronic-acid fillers — and others, like MD AESTHETICS, share their full price list on request. Published list prices are the honest reference point: dated, attributable, and comparable.\n\nWe are currently collecting standardised 2026 prices (per area, per treatment, consultation policy, who injects) directly from the verified clinics on this page — the same direct-contact process behind the language badges above. This section will be updated with that table as responses come in.\n\nOne principle holds meanwhile: botulinum toxin is a physician-administered prescription medicine acquired through pharmacies, which puts a floor under legitimate costs. Prices dramatically below the local market are a signal to ask more questions — about the product, the dose, and above all the person injecting — not a reason to book faster.",
      business_ids: DE_BASIC_IDS
    },
    {
      heading: "How to vet an aesthetic clinic: five checks",
      body:
        "1. **Ask who treats you, by name** — and check the physician is a registered colegiado (the Balearic medical college register is public). A serious clinic volunteers this.\n2. **Expect a medical consultation first.** The prescription requirement makes a prior assessment non-negotiable; a clinic that skips straight to the syringe is skipping the law.\n3. **Ask which authorised product is used** and that it's pharmacy-sourced. Brand transparency is standard among legitimate clinics.\n4. **Judge the premises**: a sanitary-registered clinic, not a beauty salon back room. In the Balearics, authorised medical centres carry a registration you can ask about.\n5. **Distrust guaranteed outcomes.** Serious practitioners talk about realistic expectations, duration and side effects — never \"perfect results\".\n\nNone of this replaces professional medical advice — for indications, contraindications or complications, the conversation belongs with a physician.",
      business_ids: EN_ONLY_IDS
    }
  ],
  faqs: [
    {
      question: "Is it safe to get Botox in Spain?",
      answer:
        "Spain regulates botulinum toxin as a prescription-only medicine: it can only be dispensed by authorised pharmacies against an individual medical prescription, and the Spanish medicines agency (AEMPS) states it should only be administered by physicians with sufficient experience. The Balearic health authorities actively monitor compliance. Within that framework — a registered physician, an authorised product, a prior medical consultation — the legal safety architecture is strong. The risk lives outside it: unlicensed injectors and products without pharmacy traceability."
    },
    {
      question: "Who can legally inject Botox in Spain?",
      answer:
        "Physicians. Botulinum toxin is a prescription medicine in Spain, supplied through authorised pharmacies against an individual prescription, and per AEMPS guidance administered by doctors with adequate experience and equipment. A beauty salon offering injectables without a prescribing doctor on site is operating outside the legal framework. Before booking, ask for the treating physician's name and verify their registration with the medical college — legitimate clinics expect the question."
    },
    {
      question: "Are there English-speaking aesthetic clinics in Mallorca?",
      answer:
        "Yes — as of July 2026, 13 verified clinics confirmed fluent English directly to us, including MEDISANS, Dermathos, The Skin Koncept, Mara Aesthetics, GB Clinic, MD AESTHETICS and Mallorca Aesthetic Clinic in Cala Millor. Five of those also confirmed fluent German, and RB Centro Médico Estético confirmed fluent Polish as well. The information is self-reported by each clinic via direct contact and dated; clinics that haven't answered yet may still speak your language."
    },
    {
      question: "How much does Botox cost in Mallorca?",
      answer:
        "We only quote prices we can attribute. Mara Aesthetics, for example, publishes hyaluronic-acid filler pricing from €300 per millilitre, and MD AESTHETICS shares its full price list on request. We're currently collecting standardised 2026 prices directly from verified clinics and will publish the comparison table here. Until then, treat unusually cheap offers as a prompt for more questions — prescription medicine administered by a physician has a legitimate cost floor."
    }
  ],
  seo: {
    title: "Botox in Mallorca 2026: Safety, Rules & Verified Clinics | Mallorca Verified",
    description:
      "Is Botox safe in Spain? Prescription-only rules, 13 clinics with verified English (5 German), published prices and the five checks before choosing a clinic."
  }
};

const de = {
  id: "de-botox-mallorca-kosten-sicherheit",
  slug: "botox-mallorca-kosten-sicherheit",
  locale: "de",
  title: "Botox auf Mallorca: Sicherheit, Regeln und geprüfte Kliniken (2026)",
  excerpt:
    "Ist Botox in Spanien sicher? Was das Gesetz wirklich verlangt, welche Kliniken uns Deutsch und Englisch direkt bestätigt haben und wie man eine Klinik seriös prüft.",
  intro:
    "Kurze Antwort: Ja — Botox ist in Spanien strenger reguliert, als viele Besucher erwarten. Botulinumtoxin ist hier ein **verschreibungspflichtiges Medikament**: Es darf nur über autorisierte Apotheken gegen ein individuelles ärztliches Rezept abgegeben werden, und die spanischen Gesundheitsbehörden stellen klar, dass es von erfahrenen Ärzten verabreicht werden muss. Dieser eine Fakt beantwortet den Großteil der Sicherheitsfrage, bevor man überhaupt Kliniken vergleicht. Der Rest ist die Frage, mit wem Sie tatsächlich sprechen können: Wir kontaktieren Mallorcas ästhetische Kliniken direkt — bisher haben **fünf geprüfte Kliniken fließendes Deutsch bestätigt**, drei weitere Grundkenntnisse, und 13 fließendes Englisch. Dieser Guide behandelt die Rechtslage, die bestätigten Kliniken, was sich 2026 ehrlich über Preise sagen lässt und die Checks, bevor jemand an Ihr Gesicht darf. Er informiert — er ersetzt keine ärztliche Beratung.",
  sections: [
    {
      heading: "Wer darf in Spanien legal Botox spritzen?",
      body:
        "In Spanien ist Botulinumtoxin (der Wirkstoff hinter Botox® und dem für Ästhetik zugelassenen Vistabel®) als **verschreibungspflichtiges Medikament** reguliert — nicht als Kosmetikprodukt. Praktisch bedeutet das dreierlei. Erstens: Die Abgabe läuft ausschließlich über autorisierte Apotheken gegen ein individuelles Rezept — einen legalen Weg ohne Rezept oder über Online-Shops gibt es nicht. Zweitens: Die spanische Arzneimittelbehörde (AEMPS) stellt klar, dass diese Medikamente nur von **Ärzten mit ausreichender Erfahrung** und passender Ausstattung verabreicht werden sollen. Drittens ist das keine Theorie: Die Gesundheitsbehörden — auch die Produktkontrolle der Balearen selbst — überwachen die Einhaltung aktiv.\n\nDie praktische Konsequenz beim Angebotsvergleich: Eine \"Botox\"-Behandlung im Kosmetikstudio ohne verschreibenden Arzt vor Ort ist kein Schnäppchen, sondern außerhalb des rechtlichen Rahmens. Eine seriöse Klinik führt immer zuerst eine ärztliche Konsultation durch (daher kommt das Rezept) und nennt ohne Zögern den behandelnden Arzt und das verwendete zugelassene Präparat.\n\nDieselbe Logik gilt für Hyaluron-Filler: Sie sind zwar anders reguliert (als Medizinprodukte), aber seriöse Kliniken in Spanien behandeln auch sie als medizinischen Eingriff mit vorheriger ärztlicher Einschätzung. Wenn die Person mit der Spritze nicht als kollegial registrierter Arzt identifizierbar ist: gehen.",
      business_ids: []
    },
    {
      heading: "Deutsch- und englischsprachige Kliniken — direkt bestätigt",
      body:
        "Wir kontaktieren jede geprüfte Klinik direkt (per WhatsApp) und dokumentieren, welche Sprachen sie für die Patientenbetreuung bestätigt. Die Angabe stammt von der Klinik selbst und ist datiert — und ein fehlendes Badge heißt nie, dass eine Klinik Ihre Sprache *nicht* spricht; sie hat womöglich nur noch nicht geantwortet. Stand Juli 2026 haben **fünf Kliniken fließendes Deutsch bestätigt**: **MEDISANS** (Dra. Marta Serna, Palma), **Dermathos Clínica Dermatológica**, **Mara Aesthetics** (deutsch geführte Praxis für plastische und ästhetische Chirurgie), die **Mallorca Aesthetic Clinic** in Cala Millor — praktisch für die Ostküste — und **RB Centro Médico Estético**, das zusätzlich fließendes Polnisch bestätigt hat.\n\nDrei weitere bestätigten Grundkenntnisse in Deutsch neben fließendem Englisch: **Clínica Font**, **GB Clinic** und **MD AESTHETICS**. Insgesamt haben 13 Kliniken fließendes Englisch bestätigt — darunter auch **The Skin Koncept**, **Soma Clinic**, **OLIVA** in Inca, **Luis Fogued Dermoestética** und **Lumina**.\n\nDie Nachfassrunde bei den übrigen Kliniken der Insel läuft — das Live-Bild mit Sprach-Badges zeigt das [Ranking der ästhetischen Kliniken](/de/top/aesthetic-clinics).",
      business_ids: DE_FLUENT_IDS
    },
    {
      heading: "Was Botox und Filler auf Mallorca kosten — was sich ehrlich sagen lässt",
      body:
        "Wir veröffentlichen keine Preisspannen, die wir nicht belegen können — und generische \"Botox kostet in Spanien X €\"-Zahlen aus dem Internet sind genau das: generisch. Belegbar ist: Die Preistransparenz nimmt zu, und einige geprüfte Kliniken veröffentlichen echte Preise auf der eigenen Website — Mara Aesthetics etwa **publiziert Preise für Faltenunterspritzung ab 300 € pro Milliliter** Hyaluronsäure — und andere, wie MD AESTHETICS, stellen ihre komplette Preisliste auf Anfrage bereit. Veröffentlichte Listenpreise sind der ehrliche Referenzpunkt: datiert, zuordenbar, vergleichbar.\n\nParallel sammeln wir gerade standardisierte 2026er-Preise (pro Zone, pro Behandlung, Beratungspolitik, wer spritzt) direkt bei den geprüften Kliniken dieser Seite — im selben Direktkontakt-Verfahren wie die Sprach-Badges oben. Diese Sektion wird mit der Vergleichstabelle aktualisiert, sobald die Antworten eingehen.\n\nBis dahin gilt ein Grundsatz: Botulinumtoxin ist ein arztpflichtiges, apothekenbezogenes Medikament — das setzt einen Boden unter die legitimen Kosten. Preise deutlich unter dem lokalen Markt sind ein Anlass für mehr Fragen (zum Präparat, zur Dosis, vor allem zur spritzenden Person) — kein Grund, schneller zu buchen.",
      business_ids: DE_BASIC_IDS
    },
    {
      heading: "Wie man eine ästhetische Klinik prüft: fünf Checks",
      body:
        "1. **Fragen Sie, wer Sie behandelt — namentlich.** Und prüfen Sie die Registrierung als Arzt (das Ärzteregister der Balearen ist öffentlich). Seriöse Kliniken nennen das von selbst.\n2. **Erwarten Sie zuerst eine ärztliche Konsultation.** Die Rezeptpflicht macht die Voruntersuchung nicht verhandelbar; wer direkt zur Spritze übergeht, überspringt das Gesetz.\n3. **Fragen Sie nach dem zugelassenen Präparat** und dem Apothekenbezug. Markentransparenz ist bei seriösen Kliniken Standard.\n4. **Beurteilen Sie die Räumlichkeiten**: eine sanitär registrierte Klinik, kein Hinterzimmer eines Kosmetikstudios. Autorisierte medizinische Zentren auf den Balearen tragen eine Registrierung, nach der man fragen kann.\n5. **Misstrauen Sie Ergebnisgarantien.** Seriöse Behandler sprechen über realistische Erwartungen, Wirkdauer und Nebenwirkungen — nie über \"perfekte Ergebnisse\".\n\nNichts davon ersetzt ärztlichen Rat — Indikationen, Kontraindikationen und Komplikationen gehören ins Gespräch mit einem Arzt.",
      business_ids: EN_ONLY_IDS
    }
  ],
  faqs: [
    {
      question: "Ist Botox in Spanien sicher?",
      answer:
        "Spanien reguliert Botulinumtoxin als verschreibungspflichtiges Medikament: Abgabe nur über autorisierte Apotheken gegen individuelles ärztliches Rezept, und die Arzneimittelbehörde AEMPS stellt klar, dass die Verabreichung Ärzten mit ausreichender Erfahrung vorbehalten ist. Die balearischen Gesundheitsbehörden überwachen die Einhaltung aktiv. Innerhalb dieses Rahmens — registrierter Arzt, zugelassenes Präparat, vorherige ärztliche Konsultation — ist die rechtliche Sicherheitsarchitektur stark. Das Risiko liegt außerhalb: bei nicht lizenzierten Behandlern und Produkten ohne Apotheken-Nachverfolgbarkeit."
    },
    {
      question: "Wer darf in Spanien legal Botox spritzen?",
      answer:
        "Ärzte. Botulinumtoxin ist in Spanien ein verschreibungspflichtiges Medikament, das über autorisierte Apotheken gegen individuelles Rezept bezogen wird und nach AEMPS-Vorgaben von erfahrenen Ärzten mit passender Ausstattung verabreicht werden soll. Ein Kosmetikstudio, das Injektables ohne verschreibenden Arzt anbietet, operiert außerhalb des rechtlichen Rahmens. Fragen Sie vor der Buchung nach dem Namen des behandelnden Arztes und prüfen Sie die Registrierung — seriöse Kliniken erwarten diese Frage."
    },
    {
      question: "Gibt es deutschsprachige ästhetische Kliniken auf Mallorca?",
      answer:
        "Ja — Stand Juli 2026 haben uns fünf geprüfte Kliniken fließendes Deutsch direkt bestätigt: MEDISANS, Dermathos, Mara Aesthetics (deutsch geführt), Mallorca Aesthetic Clinic in Cala Millor und RB Centro Médico Estético (zusätzlich fließendes Polnisch). Drei weitere — Clínica Font, GB Clinic und MD AESTHETICS — bestätigten Grundkenntnisse neben fließendem Englisch. Die Angaben sind Selbstauskünfte per Direktkontakt und datiert; Kliniken ohne Badge haben womöglich nur noch nicht geantwortet."
    },
    {
      question: "Was kostet Botox auf Mallorca?",
      answer:
        "Wir nennen nur Preise mit Quelle. Mara Aesthetics etwa publiziert Hyaluron-Filler ab 300 € pro Milliliter; MD AESTHETICS stellt die komplette Preisliste auf Anfrage bereit. Parallel sammeln wir standardisierte 2026er-Preise direkt bei den geprüften Kliniken und veröffentlichen hier die Vergleichstabelle. Bis dahin gilt: Auffällig billige Angebote sind ein Anlass für mehr Fragen — ein arztpflichtiges Apotheken-Medikament hat einen legitimen Kostenboden."
    }
  ],
  seo: {
    title: "Botox auf Mallorca 2026: Sicherheit, Regeln & geprüfte Kliniken | Mallorca Verified",
    description:
      "Ist Botox in Spanien sicher? Rezeptpflicht erklärt, 5 Kliniken mit bestätigtem Deutsch (13 Englisch), veröffentlichte Preise und 5 Checks vor der Klinikwahl."
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
