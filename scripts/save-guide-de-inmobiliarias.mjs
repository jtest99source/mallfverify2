import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
function loadEnv() {
  if (!existsSync('.env.local')) return
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i+1).trim().replace(/^["']|["']$/g,'')
    if (!process.env[k]) process.env[k] = v
  }
}
loadEnv()
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const allBusinessIds = [
  'google-ChIJ54QhG66JlxIRhfimwfJdW18',
  'google-ChIJO5OouWeSlxIRgFM3dK5382E',
  'google-ChIJbYpLwWiSlxIRN2Zn6RZPFkI',
  'google-ChIJ04IPUbmJlxIROnWpozqHzeY',
  'google-ChIJzdU-LUWSlxIR3TtmJfjFxLE',
  'google-ChIJt_uDAh7UlxIRfpZLCRcMJcY',
]

const { data: bizRows } = await sb.from('businesses')
  .select('primary_image_url, gallery_image_urls, image')
  .in('id', allBusinessIds).limit(10)

let heroImageUrl = null
for (const b of bizRows ?? []) {
  const url = b.primary_image_url || b.gallery_image_urls?.[0] || b.image
  if (url) { heroImageUrl = url; break }
}

const row = {
  id: 'de-inmobiliarias-mallorca-expat',
  slug: 'inmobiliarias-mallorca-expat',
  locale: 'de',
  title: 'Immobilienmakler Mallorca für Ausländer — Guide 2026',
  excerpt: 'Wie Ausländer 2026 auf Mallorca kaufen und mieten: echte Kosten, die 8–13% Grunderwerbsteuer der Balearen, NIE, Golden-Visa-Status und geprüfte Makler.',
  intro: 'Der Kauf einer Bestandsimmobilie auf Mallorca kostet Ausländer rund 10–14% zusätzlich zum Kaufpreis an Steuern und Gebühren, hauptsächlich getrieben durch die balearische Grunderwerbsteuer (ITP), die progressiv von 8% bis 13% verläuft. Der inselweite Durchschnittspreis erreichte 2026 laut der im März 2026 veröffentlichten Studie des Steinbeis Transfer Institute 7.370 € pro Quadratmeter, ein Anstieg von 9,8% im Jahresvergleich. Spaniens Immobilienmarkt kennt keine Nationalitätsbeschränkungen — jeder Ausländer kann kaufen — aber eines hat sich endgültig geändert: Die Golden-Visa-Aufenthaltsregelung endete im April 2025, sodass ein Immobilienkauf keine spanische Aufenthaltsgenehmigung mehr gewährt. Dieser Leitfaden behandelt die vollständigen Kosten und den Ablauf beim Kauf oder bei der Langzeitmiete als Ausländer sowie die Makler, die wirklich mit internationalen Kunden arbeiten.',
  sections: [
    {
      heading: 'Immobilienkauf auf Mallorca als Ausländer: Kosten und Ablauf',
      body: 'Der Markt ist vollständig offen: Es gibt keine Nationalitätsbeschränkungen, keinen Mindestkaufwert und keine Begrenzung, wie viele Immobilien ein Ausländer besitzen darf. Was Sie benötigen, ist eine NIE (Número de Identificación de Extranjero, die für jede Kaufurkunde, Steuerzahlung oder Kontoeröffnung vorgeschriebene Steuernummer), ein spanisches Bankkonto und ein unabhängiger Anwalt. Nicht-Residenten können bei spanischen Banken in der Regel 60–70% des Immobilienwerts finanzieren, über Laufzeiten von 20–25 Jahren. Der gesamte Ablauf dauert üblicherweise vier bis zwölf Wochen vom akzeptierten Angebot bis zum Abschluss vor dem Notar.\n\nDie größte Einzelkosten ist die balearische Grunderwerbsteuer (ITP) auf Bestandsimmobilien, progressiv gestaffelt: 8% bis 400.000 €, 9% von 400.000 bis 600.000 €, 10% von 600.000 bis 1.000.000 €, 12% von 1.000.000 bis 2.000.000 € und 13% über 2.000.000 €. Der häufigste Fehler ist, den Höchstsatz auf den gesamten Preis anzuwenden — jede Stufe wird separat besteuert, sodass eine Immobilie für 700.000 € einen effektiven Satz von rund 8,7% hat, nicht 10%. Neubau-Erstverkäufe unterliegen stattdessen 10% Mehrwertsteuer plus 1,5% Stempelsteuer (AJD).\n\nZusätzlich kalkulieren Sie Notargebühren (max. ~0,5%), Grundbuchgebühren (~0,5%) und Anwaltskosten (etwa 1–1,5%). Planungsregel 2026: insgesamt 10–14% zusätzlich bei Bestandsimmobilien, rund 11,5–12% bei Neubauten.',
      business_ids: []
    },
    {
      heading: 'Langzeitmiete auf Mallorca als Ausländer: was Sie erwartet',
      body: 'Langzeitmieten (larga temporada) unterliegen dem spanischen Mietgesetz Ley de Arrendamientos Urbanos. Ein Vertrag kann für ein Jahr geschlossen werden, aber der Mieter hat das Recht auf Verlängerung auf mindestens fünf Jahre (Privatvermieter) oder sieben Jahre (Unternehmen). Die maximale Vorauszahlung beträgt drei Monatsmieten: eine gesetzliche Kaution plus optional bis zu zwei weitere. Seit 2023 zahlt der Vermieter die Maklerprovision bei Hauptwohnsitzmieten — nicht der Mieter.\n\nZwei wichtige Punkte 2025–2026: Erstens sind jährliche Mieterhöhungen bei bestehenden Verträgen an den IRAV-Index des INE gebunden, der den alten Verbraucherpreisindex ersetzt. Zweitens hat Mallorca kein ausgewiesenes angespanntes Gebiet (zona tensionada), da die Balearen-Regierung dies bisher abgelehnt hat — die strengsten Mietpreisdeckel für Neuverträge gelten daher nirgends auf der Insel.\n\nDas praktische Problem 2026 ist das Angebot. Ein struktureller Mangel hat Langzeitmieten verteuert und das Angebot verknappt, besonders in Palma und im Südwesten. Vermieter verlangen Einkommensnachweise, und Nicht-EU-Zuzügler werden bei direkter Kontaktaufnahme oft abgewiesen. Hier verdienen Makler ihre Provision: **Engel & Völkers Palma Southwest** und **Chic Mallorca International Real Estate** betreiben eigene Mietabteilungen für ausländische Kunden.',
      business_ids: []
    },
    {
      heading: 'Worauf Sie bei einem Immobilienmakler auf Mallorca achten sollten',
      body: 'Sprache und internationale Ausrichtung sind entscheidend. **Immobilienmallorca.com** und die **Engel & Völkers**-Büros arbeiten standardmäßig auf Deutsch und Englisch; **Balearic Properties - Savills Mallorca** und **Imperial Properties Inmobiliaria CB** richten sich an britische und nordeuropäische Käufer. Ein guter Makler koordiniert NIE, unabhängigen Anwalt, Nota-Simple-Prüfung und notfalls Vollmachtsabschluss.\n\nDas wichtigste Warnsignal ist die Nota Simple. Vor jeder Reservierungsanzahlung muss ein unabhängiger Anwalt den Grundbuchauszug einholen — zur Bestätigung von Eigentümerschaft und Lastenfreiheit. Unterschreiben Sie keinen Arras-Vertrag ohne diese Prüfung: Bei Rücktritt verlieren Sie die Anzahlung; bei Rücktritt des Verkäufers schuldet er Ihnen das Doppelte.\n\nPrüfen Sie physisches Büro und echte Erfolgsbilanz. Eine hohe Google-Bewertung bei drei Rezensionen sagt wenig; eine solide Bewertung über Dutzende Transaktionen ist aussagekräftig.',
      business_ids: []
    },
    {
      heading: 'Verifizierte Auswahl auf Mallorca Verified',
      body: 'Jeder der folgenden Makler hat eine verifizierte Google-Präsenz, ein aktives physisches Büro auf Mallorca und eine dokumentierte Ausrichtung auf internationale Kunden auf Englisch und Deutsch. Nutzen Sie stets Ihren eigenen unabhängigen Anwalt, unabhängig davon, mit welchem Makler Sie arbeiten.',
      business_ids: allBusinessIds
    }
  ],
  faqs: [
    {
      question: 'Kann ein Ausländer 2026 eine Immobilie auf Mallorca kaufen?',
      answer: 'Ja. Spaniens Immobilienmarkt kennt keine Nationalitätsbeschränkungen, keinen Mindestkaufwert und keine Begrenzung der Anzahl an Immobilien, auch für Nicht-EU-Käufer wie Briten und US-Bürger nach dem Brexit. Sie benötigen eine NIE-Nummer, ein spanisches Bankkonto und einen unabhängigen Anwalt. Beachten Sie: Ein Immobilienkauf gewährt seit April 2025 keine Aufenthaltsgenehmigung mehr — das Golden-Visa-Programm ist beendet.'
    },
    {
      question: 'Was kostet der Kauf einer Immobilie auf Mallorca inklusive Steuern und Gebühren?',
      answer: 'Kalkulieren Sie zusätzlich 10–14% zum Kaufpreis für eine Bestandsimmobilie. Hauptkostenpunkt ist die balearische ITP, progressiv von 8% bis 400.000 € auf 13% über 2.000.000 €, plus Notar (~0,5%), Grundbuch (~0,5%) und Anwalt (1–1,5%). Bei 400.000 € Kaufpreis sind das rund 40.000–52.000 € Zusatzkosten; Neubauten zahlen 10% MwSt. plus 1,5% Stempelsteuer.'
    },
    {
      question: 'Brauche ich eine NIE, um auf Mallorca eine Immobilie zu kaufen?',
      answer: 'Ja. Die NIE ist eine vorgeschriebene Steuernummer für jeden ausländischen Käufer — erforderlich für Kaufurkunde, Steuerzahlung, Bankkonto und Versorgungsanschlüsse. Beantragen Sie sie beim spanischen Konsulat in Ihrem Heimatland oder persönlich in Spanien. Ohne NIE ist ein rechtsgültiger Immobilienkauf nicht möglich.'
    },
    {
      question: 'Welche Regeln gelten 2026 für die Langzeitmiete auf Mallorca als Ausländer?',
      answer: 'Ein Langzeitmietvertrag läuft mindestens fünf Jahre (Privatvermieter) oder sieben Jahre (Unternehmen), auch bei einjährigem Vertragsabschluss. Maximale Vorauszahlung: drei Monatsmieten (eine gesetzliche Kaution plus bis zu zwei weitere). Die Maklerprovision zahlt der Vermieter. Mallorca hat 2026 kein angespanntes Gebiet, kein Mietpreisdeckel für Neuverträge; Erhöhungen bei Bestandsverträgen sind auf den IRAV-Index begrenzt.'
    },
    {
      question: 'Welche Gegend auf Mallorca ist für Ausländer am besten zum Kaufen oder Mieten?',
      answer: 'Für internationale Käufer mit Fokus auf Infrastruktur, kurze Flughafenentfernung und große Auswanderergemeinschaft sind Palma und der Südwesten (Santa Ponsa, Bendinat, Portals) die stärkste Wahl — allerdings mit fast 10.000 € pro Quadratmeter die teuerste Zone. Inlandsorte wie Inca, Felanitx und Sa Pobla bieten deutlich besseres Preis-Leistungs-Verhältnis; der Norden um Pollença eignet sich für eine ruhigere Basis. Langzeitmieter sollten sich auf Palma konzentrieren, das trotz knappem Angebot 2026 den tiefsten Mietmarkt bietet.'
    }
  ],
  seo: {
    title: 'Immobilienmakler Mallorca für Ausländer — Guide 2026 | Mallorca Verified',
    description: 'Immobilie kaufen auf Mallorca als Ausländer 2026: 8–13% Grunderwerbsteuer, NIE, Golden Visa beendet, Gesamtkosten 10–14% und geprüfte Makler.'
  },
  hero_image_url: heroImageUrl,
  status: 'published',
  source: 'editorial-v2',
  is_featured: false,
  updated_at: new Date().toISOString().split('T')[0],
}

const { error } = await sb.from('guides').upsert(row, { onConflict: 'locale,slug' })
if (error) { console.error('Save error:', error.message); process.exit(1) }
console.log(`✅ Saved: de-inmobiliarias-mallorca-expat`)
console.log(`   Sections: ${row.sections.length} | Picks linked: ${allBusinessIds.length}`)
