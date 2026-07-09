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

const coworkingIds = [
  'google-ChIJp_tJLIKTlxIRxKMKqO5SfSo',
  'google-ChIJHZ_Ae1aSlxIRTau8PHZPGAk',
  'google-ChIJk2kE1U6WlxIRIj5r0nSLcyE',
  'google-ChIJhSk8YB-TlxIRORGUNlkSnuc',
]

const { data: bizRows } = await sb.from('businesses')
  .select('primary_image_url, gallery_image_urls, image')
  .in('id', coworkingIds).limit(10)

let heroImageUrl = null
for (const b of bizRows ?? []) {
  const url = b.primary_image_url || b.gallery_image_urls?.[0] || b.image
  if (url) { heroImageUrl = url; break }
}

const row = {
  id: 'de-coste-vida-mallorca-2026',
  slug: 'coste-vida-mallorca-2026',
  locale: 'de',
  title: 'Lebenshaltungskosten auf Mallorca 2026 — Was Expats wirklich zahlen',
  excerpt: 'Eine Einzelperson braucht 2026 in Palma rund 2.000–2.300 €/Monat inkl. Miete; ein komfortables Expat-Budget liegt bei 2.500–3.500 €.',
  intro: 'Eine Einzelperson gibt 2026 in Palma rund 2.000–2.300 € pro Monat inklusive Miete aus, wobei eine Ein-Zimmer-Wohnung im Zentrum im Schnitt etwa 1.300–1.400 € kostet und Nebenkosten rund 250 € hinzukommen. Die Miete ist der entscheidende Kostenpunkt und sie steigt weiter: Die durchschnittliche Angebotsmiete auf Mallorca erreichte 2025 18,09 € pro Quadratmeter, ein Anstieg von 9% im Jahresvergleich. Mallorca ist teurer als Festlandstädte wie Valencia oder Sevilla und bei der Miete etwa auf dem Niveau von Madrid, aber deutlich günstiger als München oder London beim Essengehen und bei Dienstleistungen. Dieser Leitfaden schlüsselt Kategorie für Kategorie auf, was Expats tatsächlich zahlen, mit drei realistischen Monatsbudgets.',
  sections: [
    {
      heading: 'Miete: der größte Kostenpunkt und der Stand 2026',
      body: 'Bei der Miete tut Mallorca weh. In Palma kostet eine Ein-Zimmer-Wohnung im Zentrum durchschnittlich rund 1.300–1.480 € pro Monat, außerhalb des Zentrums sinkt sie auf etwa 1.000–1.100 €. Eine Drei-Zimmer-Wohnung liegt bei rund 2.400–2.500 € im Zentrum und 1.800–1.900 € in den Vororten. Die inselweite durchschnittliche Angebotsmiete erreichte 2025 18,09 € pro Quadratmeter, ein Sprung von 9% gegenüber dem Vorjahr, und 2026 hat diesen Trend nicht umgekehrt — das Kernproblem ist das Angebot, da Eigentümer Wohnungen in die renditestärkere Ferienvermietung umleiten.\n\nDie Gegend verändert die Rechnung erheblich. Santa Catalina und die Altstadt von Palma haben die höchsten Preise; die Randbezirke Palmas und Inlandsorte wie Inca, Manacor und Campanet sind deutlich günstiger. Der Südwesten (Santa Ponsa, Calvià, Bendinat) und der Norden (Pollença, Alcúdia) liegen im oberen Segment — eine möblierte 85-m²-Wohnung in einer gefragten Nordregion kann rund 1.800 € erreichen.\n\nEine praktische Warnung für Langzeitmieter: Die Maklerprovision bei einer Hauptwohnsitzmiete zahlt seit 2023 der Vermieter, nicht der Mieter, und die maximale Vorauszahlung beträgt drei Monatsmieten. Mallorca hat 2026 kein ausgewiesenes angespanntes Gebiet mit Mietpreisdeckel — nur jährliche Erhöhungen bei bestehenden Verträgen sind begrenzt, gebunden an den IRAV-Index.',
      business_ids: []
    },
    {
      heading: 'Nebenkosten, Internet und Mobilfunk',
      body: 'Die Grundnebenkosten für eine 85-m²-Wohnung — Strom, Wasser, Heizung/Kühlung und Müll — liegen im Schnitt bei rund 160–265 € pro Monat für ein bis zwei Personen, wobei die große Spanne hauptsächlich durch die Klimaanlage im Sommer und das Heizen im Winter entsteht. Strom ist der schwankende Teil; eine bescheidene Ein-Personen-Wohnung mit sparsamem Verbrauch liegt näher am unteren Ende, während eine Familie mit laufender Klimaanlage im Juli und August zum oberen Ende tendiert.\n\nHeiminternet (Glasfaser, weit verbreitet und schnell in Palma und den meisten Orten) kostet rund 30–45 € pro Monat. Ein Mobilfunktarif mit großzügigem Datenvolumen liegt bei etwa 10–20 € pro Monat. Spanien hat einige der niedrigsten Mobilfunk- und Breitbandpreise in Westeuropa — Expats aus Deutschland sparen hier direkt.\n\nRechnen Sie für einen Ein- bis Zwei-Personen-Haushalt mit rund 200–320 € pro Monat für Nebenkosten plus Konnektivität, im Hochsommer eher am oberen Ende.',
      business_ids: []
    },
    {
      heading: 'Lebensmittel, Essengehen und tägliche Ausgaben',
      body: 'Bei Lebensmitteln zeigt sich der Insel-Aufschlag: Essen ist teurer als auf dem Festland, weil so vieles importiert wird. Ein Paar gibt beim Einkauf in gängigen Supermärkten wie **Mercadona** rund 60–80 € pro Woche für Grundnahrungsmittel aus. Der Einkauf auf Frischmärkten wie dem **Mercat de l\'Olivar** in Palma senkt die Kosten für Obst und Gemüse.\n\nDas beste Preis-Leistungs-Verhältnis beim Essengehen bietet das menú del día — ein Mittagsmenü mit zwei bis drei Gängen, Brot und Getränk für 14–18 € an Werktagen. Das Abendessen in einem Mittelklasserestaurant liegt bei 25–40 € pro Person. Ein Kaffee kostet etwa 1,60–2 €, eine Caña (kleines Bier) 1,80–2,50 € und ein einheimisches Bier rund 4 €. Achten Sie auf Terraza-Aufschläge von 10–15% auf begehrten Terrassen und Cubierto-Gebühren von 1,50–3 € für Brot und Oliven.\n\nSelbstversorgung ist rund 50–70% günstiger als jede Mahlzeit auswärts. Die Hauptmahlzeit mittags statt abends einzunehmen spart 30–40% bei vergleichbaren Gerichten.',
      business_ids: []
    },
    {
      heading: 'Verkehr: Auto, Bus und Fortbewegung',
      body: 'Der öffentliche Nahverkehr ist günstig, mit einem Detail, das Expats übersehen: Das TIB-Netz aus Überlandbussen, Zug und Metro ist 2026 für registrierte Residenten kostenlos, schließt aber die städtischen EMT-Busse Palmas nicht ein (Einzelfahrt rund 2 €). Ein Resident, der aus einem Ort nach Palma pendelt, fährt die Überlandstrecke kostenlos, zahlt aber für Stadtbusse innerhalb Palmas.\n\nEin Auto zu unterhalten ist die teure Alternative. Kraftstoff ist auf den Balearen hoch und schwankend — Tankstellen in Inca, Manacor und Sa Pobla sind durchweg günstiger als in Touristenzonen, wo Unterschiede 10 Cent pro Liter übersteigen können. Hinzu kommen jährliche Kfz-Steuer (rund 80 €), ITV-Hauptuntersuchung (rund 30 €), Versicherung und Parken. Parkplätze im Zentrum Palmas sind knapp und gebührenpflichtig.\n\nFür einen autofreien Expat in Palma können monatliche Verkehrskosten unter 30 € liegen. Für einen Autobesitzer sind realistisch 200–350 € pro Monat einzuplanen.',
      business_ids: []
    },
    {
      heading: 'Monatliche Budget-Summen: drei Expat-Profile',
      body: 'Budget-Expat (1.800–2.200 €/Monat): Eine Ein-Zimmer-Wohnung außerhalb des Zentrums oder ein WG-Zimmer, Kochen zu Hause, kostenlose Überlandbusse, menú del día, minimale Klimaanlage. Realistisch für eine Einzelperson außerhalb des besten Palma, autofrei.\n\nKomfortabler Expat (2.500–3.500 €/Monat): Eine Ein-Zimmer-Wohnung im Zentrum Palmas oder im Südwesten, regelmäßiges Essengehen, Coworking-Mitgliedschaft, kleines Auto oder Taxis, Klimaanlage im Sommer. Das typische Budget für Remote-Arbeitende oder etablierte Alleinstehende.\n\nPremium-Lebensstil (4.500 €+/Monat): Zwei-Zimmer- oder Meerblick-Wohnung in bester Lage, häufiges Restaurantessen, Auto, private Krankenversicherung, Freizeit und Reisen. Paare und Familien liegen am oberen Ende dieses Bereichs.',
      business_ids: []
    },
    {
      heading: 'Verifizierte Auswahl auf Mallorca Verified',
      body: 'Dies sind Coworking-Spaces mit verifizierter Google-Präsenz und starken echten Bewertungen, nützlich für Remote-Arbeitende und Neuankömmlinge auf Mallorca.',
      business_ids: coworkingIds
    }
  ],
  faqs: [
    {
      question: 'Ist Mallorca im Vergleich zum spanischen Festland teuer zum Leben?',
      answer: 'Ja, Mallorca ist teurer als der Großteil des spanischen Festlands, vor allem bei Miete und Lebensmitteln. Die Mieten in Palma sind mit denen Madrids vergleichbar und übersteigen Städte wie Valencia oder Sevilla deutlich, und Lebensmittel kosten mehr wegen der Importe. Mallorca ist jedoch günstiger als Ibiza, und Essengehen, Mobilfunk und Internet liegen deutlich unter dem Niveau in Deutschland oder Großbritannien.'
    },
    {
      question: 'Wie viel braucht man, um auf Mallorca komfortabel zu leben, pro Monat?',
      answer: 'Eine Einzelperson braucht 2026 rund 2.500–3.500 € pro Monat für ein komfortables Leben auf Mallorca: Eine Ein-Zimmer-Wohnung im Zentrum Palmas (1.300–1.500 €), Nebenkosten (200–300 €), Lebensmittel, regelmäßiges Essengehen und ein kleines Auto oder Coworking. Sparsam lebende Einzelpersonen kommen mit 1.800–2.200 € aus, ein Premium-Lebensstil oder eine Familie liegt bei 4.500 € oder mehr.'
    },
    {
      question: 'Wie hoch ist die durchschnittliche Miete in Palma de Mallorca 2026?',
      answer: '2026 kostet eine Ein-Zimmer-Wohnung im Zentrum Palmas durchschnittlich rund 1.300–1.480 € pro Monat, außerhalb des Zentrums etwa 1.000–1.100 €. Eine Drei-Zimmer-Wohnung liegt bei rund 2.400–2.500 € im Zentrum und 1.800–1.900 € in den Vororten. Die inselweiten Angebotsmieten erreichten 2025 18,09 € pro Quadratmeter, ein Anstieg von 9% im Jahresvergleich.'
    },
    {
      question: 'Kann man auf Mallorca von einem Remote-Gehalt aus Deutschland leben?',
      answer: 'Ja, komfortabel, wenn Ihr Remote-Gehalt auf oder über dem deutschen Durchschnitt liegt. Ein Monatsbudget von 2.500–3.500 € deckt einen komfortablen Lebensstil für eine Einzelperson in Palma ab, was die meisten deutschen Fachgehälter nach Steuern übersteigen, und Sie sparen bei Essengehen, Mobilfunk und Internet. Der Hauptengpass ist die Miete — ein typisches Nettogehalt von 3.000–4.000 € lässt nach Mallorcas Kosten klar verfügbares Einkommen übrig.'
    }
  ],
  seo: {
    title: 'Lebenshaltungskosten auf Mallorca 2026 — Was Expats wirklich zahlen | Mallorca Verified',
    description: 'Eine Einzelperson braucht 2026 in Palma ~2.000–2.300 €/Monat inkl. Miete. Voller 2026-Überblick: Miete, Nebenkosten, Essen, Verkehr und drei Expat-Budgets.'
  },
  hero_image_url: heroImageUrl,
  status: 'published',
  source: 'editorial-v2',
  is_featured: false,
  updated_at: new Date().toISOString().split('T')[0],
}

const { error } = await sb.from('guides').upsert(row, { onConflict: 'locale,slug' })
if (error) { console.error('Save error:', error.message); process.exit(1) }
console.log(`✅ Saved: de-coste-vida-mallorca-2026`)
console.log(`   Sections: ${row.sections.length} | Coworkings linked: ${coworkingIds.length}`)
