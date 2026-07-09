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
  'google-ChIJgTWMxUOXlxIRm9qj4TVCmUY',
  'google-ChIJyaD684sslhIRcx27xSR8ewY',
  'google-ChIJcTV8Ui0tlhIR53r_RyqnI3w',
  'google-ChIJNQSoMTczlhIR9yyJsieR0pk',
  'google-ChIJBX-qzf6XlxIRsFlJqStBBCI',
  'google-ChIJ67jGBKGWlxIRDfOzviZhDYg',
  'google-ChIJv6ndVYSXlxIRBlIktae6edY',
  'google-ChIJ8xDfZm6SlxIRozjbyDLNYBE',
  'google-ChIJC-3kpkOSlxIRqE8vwHyaaPk',
  'google-ChIJO79-zHdblhIRDlU_dANMz7s',
  'google-ChIJ4UUv98QtlhIRow36fE3H-hU',
]

const { data: bizRows } = await sb.from('businesses')
  .select('primary_image_url, gallery_image_urls, image')
  .in('id', allBusinessIds).limit(20)

let heroImageUrl = null
for (const b of bizRows ?? []) {
  const url = b.primary_image_url || b.gallery_image_urls?.[0] || b.image
  if (url) { heroImageUrl = url; break }
}

const row = {
  id: 'de-cuanto-cuesta-alquilar-barco-mallorca',
  slug: 'cuanto-cuesta-alquilar-barco-mallorca',
  locale: 'de',
  title: 'Was kostet ein Bootsverleih auf Mallorca 2026',
  excerpt: 'Aktuelle Bootsmietpreise auf Mallorca 2026 nach Typ: führerscheinfrei ab ca. 150 € halber Tag, Tagescharter, Boote mit Skipper, Katamarane und Yachten.',
  intro: 'Im Jahr 2026 kostet ein führerscheinfreies 15-PS-Motorboot auf Mallorca etwa 150–250 € für einen halben Tag und 300–600 € für einen ganzen Tag, während ein Tagescharter mit Skipper auf einem größeren Boot je nach Größe bei rund 500 € beginnt und bis zu 2.500 € reicht. Der Preis hängt von vier Faktoren ab: Bootstyp, Saison, Dauer und ob ein Skipper inbegriffen ist. Juli und August haben die höchsten Preise und die knappste Verfügbarkeit; Juni und September kosten bei nahezu identischem Wetter deutlich weniger. Eine Änderung 2026 ist für die Planung wichtig: Ab dem 1. Oktober 2026 endet die führerscheinfreie Vermietung landesweit, was mehr Nachfrage auf Boote mit Skipper lenkt — die Mietpreise in der laufenden Saison vor diesem Datum steigen dadurch aber nicht.',
  sections: [
    {
      heading: 'Führerscheinfreie Boote: was Sie tatsächlich zahlen',
      body: 'Ein führerscheinfreies Boot ist auf 15 PS und 5 Meter begrenzt, bietet Platz für bis zu 5–6 Personen und ist der günstigste Weg aufs Wasser. Für die Saison 2026 sollten Sie mit etwa 150–250 € für einen halben Tag (in der Regel 4 Stunden) und 300–600 € für einen ganzen Tag rechnen, abhängig vom Anbieter, vom Boot und davon, ob Hochsaison ist. Plattformen listen einfache führerscheinfreie Boote rund um Palma in der Nebensaison bereits ab 120 € pro Tag, wobei Alcúdia und der Norden tendenziell höher liegen, weil die Nachfrage dort stärker ist.',
      business_ids: []
    },
    {
      heading: 'Führerscheinfreie Boote: was inbegriffen ist und was nicht',
      body: 'Der genannte Preis deckt normalerweise das Boot, die vorgeschriebene Sicherheitsausrüstung (Rettungswesten, Anker), die Sicherheitseinweisung vor dem Ablegen und die Haftpflichtversicherung ab. Kraftstoff wird meist separat nach Verbrauch berechnet — kalkulieren Sie etwa 10–15 € für eine typische Halbtagestour entlang der Küste. Extras wie Schnorchelausrüstung, ein Paddleboard oder eine Kühlbox können inbegriffen sein oder beim Einsteigen hinzukommen, klären Sie das also vor der Zahlung. Die meisten Anbieter behalten außerdem eine erstattbare Kaution von rund 300 € per Karte oder in bar ein. Reale Bewertungsdaten bestätigen die Spannen: Mieter bei **Mallorca Boat Hire** im Port d\'Alcúdia berichten von etwa 230 € für eine 5-stündige Fahrt, und Anbieter wie **Alize Boats** in Can Pastilla und **Boats Rental Mallorca** in Alcúdia bewerben ähnliche Strukturen mit Kraftstoff obendrauf.',
      business_ids: []
    },
    {
      heading: 'Charter mit Skipper, Katamarane und Yachten: Kostenaufstellung',
      body: 'Sobald Sie über die 15-PS-Grenze hinausgehen, ist ein Führerschein oder ein Skipper erforderlich, und die Preise steigen mit der Bootsklasse. Als Orientierung für 2026 im Raum Palma: mittelgroße RIBs und Speedboote kosten rund 500–1.000 € pro Tag, Segelboote und Katamarane typischerweise 900–2.500 € pro Tag. Bei Erlebnissen mit Skipper ist der Kraftstoff in der Regel im Preis enthalten — ein wesentlicher Unterschied zur führerscheinfreien Selbstfahrer-Miete, bei der Sie den Verbrauch zahlen. Rechnen Sie die Skipperkosten dort hinzu, wo sie separat ausgewiesen sind: ein professioneller Skipper kostet üblicherweise etwa 150–250 € pro Tag zusätzlich zum Boot.',
      business_ids: []
    },
    {
      heading: 'Gemeinsame Katamaran-Ausflüge: die günstigste Option mit Skipper',
      body: 'Wenn Sie ein Boot mit Skipper möchten, ohne das ganze Schiff zu chartern, ist ein gemeinsamer Katamaran-Tagesausflug ab Palma der günstige Einstieg, oft inklusive Essen, Getränken und Schnorcheln. **OASIS CATAMARAN** bietet Halbtags-Gruppenfahrten von der Uferpromenade Palmas zu einem Preis pro Person weit unter dem eines Privatcharters. Für ein privates Boot mit Kapitän in einem Premium-Hafen fahren **Sea U charter** und **Ecc Yacht Charter Mallorca** von Puerto Portals und Palma aus, wo die Tagespreise die gehobenere Lage widerspiegeln.',
      business_ids: []
    },
    {
      heading: 'Was den Preis beeinflusst — Saison, Zone, Dauer und Extras',
      body: 'Die Saison ist der größte Hebel. Juli und August sind Hochsaison: Die Preise steigen und die Boote sind ausgebucht, reservieren Sie also frühzeitig. Juni und September bieten nahezu identische Meeresbedingungen für weniger Geld und bei besserer Verfügbarkeit — der klarste Weg, Kosten zu senken, ohne bei der Qualität zu sparen. Auch die Zone zählt: Die geschützte Bucht von Alcúdia im Norden und der Abschnitt Palma/Can Pastilla haben das dichteste Angebot an führerscheinfreien Booten, was die Einstiegspreise wettbewerbsfähig hält, während Premium-Häfen wie Puerto Portals und Port Adriano für dieselben Stunden höher liegen.',
      business_ids: []
    },
    {
      heading: 'Zeitplanung und versteckte Kosten, die Sie einplanen sollten',
      body: 'Die Dauer verändert die Rechnung: Für die meisten Küstenrouten reicht ein halber Tag mit 4 Stunden, um zwei oder drei Buchten mit Badestopps zu erreichen, sodass sich der Ganztagespreis nur lohnt, wenn Sie mehrere Gebiete abfahren oder den ganzen Tag ankern möchten. Über den Grundpreis hinaus sollten Sie Kraftstoff bei Selbstfahrer-Miete einplanen (10–15 € für eine kurze Fahrt, mehr bei größeren Motoren), die erstattbare Kaution (~300 €) und optionale Extras. Frühzeitig zu buchen und einen Wochentag-Vormittag zu wählen senkt die Kosten und vermeidet den Nachmittagswind, der im Sommer aufkommt.',
      business_ids: []
    },
    {
      heading: 'Verifizierte Auswahl auf Mallorca Verified',
      body: 'Jeder der folgenden Anbieter ist ein aktiver Mallorca-Bootsverleih mit verifizierter Google-Präsenz und einer Bewertung von 4,5★ oder höher aus echten Rezensionen — keine bezahlten Platzierungen. Sie decken führerscheinfreie, skippergeführte und Katamaran-Optionen über die wichtigsten Preisklassen ab.',
      business_ids: allBusinessIds
    }
  ],
  faqs: [
    {
      question: 'Was kostet es 2026, auf Mallorca ein Boot pro Tag zu mieten?',
      answer: '2026 kostet ein führerscheinfreies 15-PS-Motorboot etwa 300–600 € für einen ganzen Tag und 150–250 € für einen halben Tag. Größere Boote kosten mehr: mittelgroße RIBs und Speedboote rund 500–1.000 € pro Tag, Segelboote oder Katamarane typischerweise 900–2.500 € pro Tag. Kraftstoff kommt bei führerscheinfreier Selbstfahrer-Miete meist hinzu, ist bei Charter mit Skipper aber inbegriffen.'
    },
    {
      question: 'Was ist der günstigste Weg, auf Mallorca ein Boot zu mieten?',
      answer: 'Die günstigste private Option ist ein führerscheinfreies 15-PS-Boot ab etwa 150 € für einen halben Tag, aufgeteilt auf bis zu 5–6 Personen. Für ein Erlebnis mit Skipper zum kleinen Preis kostet ein gemeinsamer Katamaran-Tagesausflug ab Palma pro Person weit weniger als ein Privatcharter und beinhaltet oft Essen, Getränke und Schnorchelausrüstung. Eine Buchung im Juni oder September statt Juli–August senkt die Preise zusätzlich.'
    },
    {
      question: 'Ist es auf Mallorca günstiger, ein Boot mit oder ohne Skipper zu mieten?',
      answer: 'Ohne Skipper ist günstiger, wenn Sie ein führerscheinfreies Boot nehmen, ab rund 150 € für einen halben Tag, aber Sie zahlen den Kraftstoff separat und sind auf 15 PS innerhalb von 2 Seemeilen zur Küste beschränkt. Ein Charter mit Skipper kostet mehr (ein Skipper schlägt mit etwa 150–250 € pro Tag zu Buche), dafür ist der Kraftstoff meist inbegriffen und Sie erhalten Zugang zu größeren, schnelleren Booten ohne Führerschein. Ab dem 1. Oktober 2026 endet die führerscheinfreie Vermietung, sodass ein Boot mit Skipper der einzige Weg ohne Führerschein wird.'
    },
    {
      question: 'Wann ist die günstigste Zeit, auf Mallorca ein Boot zu mieten?',
      answer: 'Juni und September sind die günstigsten Monate mit gutem Wetter und bieten niedrigere Preise und bessere Verfügbarkeit als die Hochsaison Juli–August, wenn die Preise stark steigen und die Boote ausgebucht sind. Wochentag-Vormittage sind günstiger und ruhiger als Wochenenden, und eine frühzeitige Buchung sichert sowohl den besten Preis als auch das gewünschte Boot.'
    }
  ],
  seo: {
    title: 'Was kostet ein Bootsverleih auf Mallorca 2026 | Mallorca Verified',
    description: 'Bootsmietpreise auf Mallorca 2026: führerscheinfrei ab ca. 150 € halber Tag, Tagescharter 300–600 €, Boote mit Skipper und Katamarane 900–2.500 €.'
  },
  hero_image_url: heroImageUrl,
  status: 'published',
  source: 'editorial-v2',
  is_featured: false,
  updated_at: new Date().toISOString().split('T')[0],
}

const { error } = await sb.from('guides').upsert(row, { onConflict: 'locale,slug' })
if (error) { console.error('Save error:', error.message); process.exit(1) }
console.log(`✅ Saved: de-cuanto-cuesta-alquilar-barco-mallorca`)
console.log(`   Sections: ${row.sections.length} | Picks linked: ${allBusinessIds.length}`)
