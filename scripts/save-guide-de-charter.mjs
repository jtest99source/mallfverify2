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
  'google-ChIJBX-qzf6XlxIRsFlJqStBBCI',
  'google-ChIJ67jGBKGWlxIRDfOzviZhDYg',
  'google-ChIJv52E9UuWlxIRTVBUtNJiRoE',
  'google-ChIJmfftN3IzlhIRUgW8P20eREw',
  'google-ChIJ4UUv98QtlhIRow36fE3H-hU',
  'google-ChIJreYI9IsslhIRjrSH-BEPMME',
  'google-ChIJGQB2ymGJlxIRUCPYH6JEavY',
  'google-ChIJNSXZP0iJlxIRF3pY9evpKpA',
  'google-ChIJO79-zHdblhIRDlU_dANMz7s',
  'google-ChIJJeH3T7iTlxIRAT-6fqnxNHA',
  'google-ChIJC-3kpkOSlxIRqE8vwHyaaPk',
  'google-ChIJcTV8Ui0tlhIR53r_RyqnI3w',
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
  id: 'de-charter-barco-sin-patron-requisitos',
  slug: 'charter-barco-sin-patron-requisitos',
  locale: 'de',
  title: 'Boot ohne Skipper mieten auf Mallorca — Rechtliche Anforderungen 2026',
  excerpt: 'Wie das Bootmieten ohne Skipper auf Mallorca 2026 funktioniert: die 5m/15-PS-Regel, Kosten und das Gesetz, das ab Oktober 2026 die füherscheinfreie Vermietung beendet.',
  intro: 'Bisher konnte jede Person über 18 Jahre auf Mallorca ein kleines Motorboot ohne nautische Qualifikation mieten, solange das Boot unter 5 Meter Länge und 15 PS blieb. Das ändert sich jetzt: Das Königliche Dekret 1188/2025, veröffentlicht im spanischen Amtsblatt am 30. Dezember 2025, beendet die füherscheinfreie Bootsvermietung landesweit ab dem 1. Oktober 2026. Ab diesem Datum benötigen Sie mindestens die Licencia de Navegación, um irgendein Motorboot zu mieten — auch die kleinen. Dieser Leitfaden erklärt, wie das Mieten ohne Skipper derzeit auf Mallorca funktioniert, was es kostet und was die neue Regelung bedeutet, wenn Sie eine Reise planen oder bereits hier leben.',
  sections: [
    {
      heading: 'Die rechtlichen Regeln: 5 Meter, 15 PS und die Änderung 2026',
      body: 'Nach den bis zur Sommersaison 2026 geltenden Regeln können Sie auf Mallorca ein Boot ohne jeglichen Führerschein mieten und fahren, sofern es zwei Bedingungen erfüllt: eine maximale Motorleistung von 15 PS (11,26 kW) und einen Rumpf von höchstens 5 Metern Länge. Sie müssen mindestens 18 Jahre alt sein und einen gültigen Ausweis vorlegen. Die Fahrt ist nur bei Tageslicht und innerhalb von 2 Seemeilen von der Küste erlaubt, und der Vermieter gibt vor dem Ablegen eine verpflichtende Sicherheitseinweisung — in der Regel 15 bis 30 Minuten. Diese Boote sind bauartbedingt langsam und fahren mit etwa 5 bis 8 Knoten, was ausreicht, um nahegelegene Buchten zu erreichen, sie aber innerhalb sicherer Grenzen hält. Jetskis waren nie von dieser Ausnahme erfasst und erfordern immer einen Führerschein.',
      business_ids: []
    },
    {
      heading: 'Was sich am 1. Oktober 2026 ändert',
      body: 'Das Königliche Dekret 1188/2025 beseitigt die Ausnahme der füherscheinfreien Vermietung für den gewerblichen Verleih. Ab dem 1. Oktober 2026 muss jedes Unternehmen, das Ihnen ein Motorboot vermietet, verlangen, dass Sie mindestens die Licencia de Navegación besitzen — die spanische Einstiegsqualifikation, die an einem einzigen Tag erworben werden kann und keine schriftliche Prüfung erfordert. Ein Verleih, der Ihnen nach diesem Datum ein Boot ohne Kontrolle Ihres Nachweises übergibt, verstößt gegen das Gesetz. Das Dekret gewährt den Unternehmen eine Übergangsfrist bis zu diesem Datum, und die Änderung wurde von der Dirección General de la Marina Mercante nach einer Zunahme von Vorfällen mit ungeschulten Mietern angestossen. Zwei Dinge sind wichtig zu wissen. Erstens bleibt die Ausnahme für den privaten, nicht gewerblichen Gebrauch bestehen: Wenn Ihnen ein Boot unter 5 m / 15 PS gehört, dürfen Sie es innerhalb derselben 2-Meilen- und Tageslicht-Grenzen weiterhin ohne Führerschein selbst fahren. Zweitens erfordert das Mieten eines Bootes mit professionellem Skipper überhaupt keinen Führerschein — die Pflicht gilt nur für denjenigen, der das Boot führt. Anbieter wie **Ecc Yacht Charter Mallorca** in Palma arbeiten ausschließlich nach diesem Modell mit Skipper, bei dem Sie als Passagier ohne rechtliche Verantwortung mitfahren.',
      business_ids: []
    },
    {
      heading: 'Kosten, Kaution und was Sie vor der Buchung prüfen sollten',
      body: 'Im Jahr 2026 beginnt die skipperlose Miete eines 15-PS-Bootes für bis zu 5 oder 6 Personen in der Hochsaison typischerweise bei etwa 150–180 € für einen halben Tag und kann je nach Datum, Boot und Ort zwischen rund 96 € und 500 € pro Tag liegen. Reale Bewertungsdaten bestätigen dies: Mieter bei **Mallorca Boat Hire** im Port d’Alcúdia berichten von etwa 230 € für eine 5-stündige Fahrt, und mehrere Anbieter weisen darauf hin, dass der Kraftstoff für eine typische Halbtagestour entlang der Küste etwa 10–12 € hinzukommt. Kraftstoff und Extras (Schnorchelausrüstung, Paddleboard) werden oft beim Einsteigen separat bezahlt, und die meisten Unternehmen behalten eine erstattbare Kaution von rund 300 € per Karte oder in bar ein. Klären Sie vor der Buchung, ob Kraftstoff inbegriffen ist, wie hoch die Kaution ist und wo genau der Treffpunkt liegt — eine wiederkehrende Beschwerde über die schwächsten Anbieter betrifft vage Anlegestellen und fehlende physische Büros, weshalb die Prüfung echter Google-Bewertungen vor der Zahlung einer Kaution wichtig ist.',
      business_ids: []
    },
    {
      heading: 'Saisonale Hinweise, Zonen und Sicherheit',
      body: 'Das Wetter ist der größte Einzelfaktor. Vermieter stornieren Ihre Buchung, wenn die Bedingungen unsicher sind, und für eine erste Ausfahrt sollten Sie Wind über 15 Knoten meiden — wenn sich Schaumkronen bilden, ist es Zeit zurückzukehren. Alle Passagiere sollten schwimmen können, und Sie müssen einen Abstand von 200 Metern zu gekennzeichneten Badezonen einhalten und in Küstennahe auf 3 Knoten abbremsen. Die Bucht von Alcúdia im Norden ist das beliebteste Startgebiet, weil sie groß, geschützt und mit erreichbaren Buchten übersät ist; Mieter dort weisen durchweg darauf hin, dass der Wind nachmittags zunimmt, weshalb Vormittagstermine für die Überquerung der Bucht die sicherere Wahl sind. Die Ostküste rund um Portocolom bietet schnellen Zugang zu Calas wie Cala d’Or, während der Südwesten (Santa Ponsa, El Arenal, Can Pastilla) sich für Tagesausfluege Richtung Cala Blava und die Höhlen eignet.',
      business_ids: []
    },
    {
      heading: 'Verifizierte Auswahl auf Mallorca Verified',
      body: 'Jedes der folgenden Unternehmen ist ein aktiver Mallorca-Bootsverleih mit verifizierter Google-Präsenz und einer Bewertung von 4,5★ oder höher aus echten Rezensionen — keine bezahlten Platzierungen, keine improvisierten Stände. Bestätigen Sie die Führerscheinanforderungen direkt bei jedem Anbieter für Buchungen ab dem 1. Oktober 2026.',
      business_ids: allBusinessIds
    }
  ],
  faqs: [
    {
      question: 'Kann ich 2026 auf Mallorca ein Boot ohne Führerschein mieten?',
      answer: 'Ja, aber nur bis zur Sommersaison 2026. Bis zum 1. Oktober 2026 dürfen Sie ein Boot ohne Führerschein mieten und fahren, wenn es einen Motor von maximal 15 PS hat und unter 5 Meter lang ist, Sie über 18 sind und innerhalb von 2 Seemeilen von der Küste bei Tageslicht bleiben. Ab dem 1. Oktober 2026 verlangt das Königliche Dekret 1188/2025 für jede Motorbootmiete mindestens die Licencia de Navegación.'
    },
    {
      question: 'Was kostet es, auf Mallorca ein Boot ohne Skipper zu mieten?',
      answer: 'Ein füherscheinfreies 15-PS-Boot für bis zu 5–6 Personen beginnt in der Hochsaison typischerweise bei etwa 150–180 € für einen halben Tag, wobei ganze Tage je nach Boot, Datum und Ort zwischen rund 96 € und 500 € liegen. Rechnen Sie mit einer erstattbaren Kaution von etwa 300 € sowie rund 10–12 € Kraftstoff für eine typische Halbtagestour entlang der Küste.'
    },
    {
      question: 'Brauche ich einen Führerschein, um auf Mallorca ein Boot mit Skipper zu mieten?',
      answer: 'Nein. Wenn das Boot mit einem professionellen Skipper vermietet wird, benötigen Sie keine nautische Qualifikation, da die rechtliche Pflicht nur für die Person gilt, die das Boot führt. Dies ist von der Regeländerung im Oktober 2026 nicht betroffen.'
    },
    {
      question: 'Wo mietet man auf Mallorca am besten ein Boot ohne Führerschein?',
      answer: 'Die Bucht von Alcúdia im Norden ist die erste Wahl für Anfänger, weil sie groß, geschützt und voller erreichbarer Buchten ist. Portocolom an der Ostküste sowie Santa Ponsa, El Arenal und Can Pastilla im Südwesten sind ebenfalls etablierte Verleihzentren. Buchen Sie nach Möglichkeit einen Vormittagstermin, da der Wind nachmittags zunimmt.'
    }
  ],
  seo: {
    title: 'Boot ohne Skipper mieten auf Mallorca — Rechtliche Anforderungen 2026 | Mallorca Verified',
    description: 'Boot ohne Skipper mieten auf Mallorca 2026: die 5m/15-PS-Regel ohne Führerschein, Kosten ab 150 € und das neue Gesetz zum Ende der füherscheinfreien Vermietung am 1. Oktober 2026.'
  },
  hero_image_url: heroImageUrl,
  status: 'published',
  source: 'editorial-v2',
  is_featured: false,
  updated_at: new Date().toISOString().split('T')[0],
}

const { error } = await sb.from('guides').upsert(row, { onConflict: 'locale,slug' })
if (error) { console.error('Save error:', error.message); process.exit(1) }
console.log(`✅ Saved: de-charter-barco-sin-patron-requisitos`)
console.log(`   Sections: ${row.sections.length} | Picks linked: ${allBusinessIds.length}`)
