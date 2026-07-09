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
  'google-ChIJp_tJLIKTlxIRxKMKqO5SfSo', // eWave
  'google-ChIJHZ_Ae1aSlxIRTau8PHZPGAk', // Cómodo&Co
  'google-ChIJk2kE1U6WlxIRIj5r0nSLcyE', // Bedndesk
  'google-ChIJhSk8YB-TlxIRORGUNlkSnuc', // Where to Work
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
  id: 'en-coste-vida-mallorca-2026',
  slug: 'coste-vida-mallorca-2026',
  locale: 'en',
  title: 'Cost of Living in Mallorca 2026 — What Expats Actually Pay',
  excerpt: 'A single person needs roughly €2,000–2,300/month in Palma including rent in 2026; a comfortable expat budget runs €2,500–3,500.',
  intro: 'A single person living in Palma in 2026 spends around €2,000–2,300 per month including rent, with a one-bedroom flat in the centre averaging roughly €1,300–1,400 and utilities adding about €250. Rent is the decisive cost and it keeps climbing: the average asking rent in Mallorca hit €18.09 per square metre in 2025, up 9% year-on-year. Mallorca is more expensive than mainland cities like Valencia or Seville and roughly on par with Madrid for rent, but noticeably cheaper than London or Munich for dining out and services. This guide breaks down what expats actually pay, category by category, with three realistic monthly budgets.',
  sections: [
    {
      heading: 'Rent: the biggest cost and where prices stand in 2026',
      body: 'Rent is where Mallorca hurts. In Palma, a one-bedroom apartment in the centre averages around €1,300–1,480 per month, dropping to roughly €1,000–1,100 outside the centre. A three-bedroom runs about €2,400–2,500 in the centre and €1,800–1,900 in the suburbs. The island-wide average asking rent reached €18.09 per square metre in 2025, a 9% jump on the year before, and 2026 has not reversed that trend — supply is the core problem, as owners divert flats to higher-yield tourist lets.\n\nArea changes the maths significantly. Palma\'s Santa Catalina and the old town command the highest prices; peripheral Palma districts and inland towns like Inca, Manacor and Campanet are markedly cheaper. The southwest (Santa Ponsa, Calvià, Bendinat) and the north (Pollença, Alcúdia) sit at the premium end — a furnished 85m² flat in a sought-after northern area can reach around €1,800.\n\nOne practical warning for long-stay renters: agency commission on a habitual-residence rental is paid by the landlord, not the tenant, since 2023, and the maximum upfront is three months (one month deposit plus up to two months guarantee). Mallorca has no declared rent-control stressed zone as of 2026, so there is no legal cap on new-contract prices — only annual increases on existing contracts are limited, tied to the IRAV index.',
      business_ids: []
    },
    {
      heading: 'Utilities, internet and mobile',
      body: 'Basic utilities for an 85m² apartment — electricity, water, heating/cooling and rubbish — average around €160–265 per month for one to two people, with the wide range driven mainly by air-conditioning use in summer and heating in winter. Electricity is the volatile part; a modest one-person flat with careful use lands nearer the bottom of that range, while a family running AC through July and August pushes toward the top.\n\nHome internet (fibre, widely available and fast in Palma and most towns) costs roughly €30–45 per month. A mobile plan with generous data runs about €10–20 per month. Spain has some of the lowest mobile and broadband prices in Western Europe, so this is one category where expats from the UK or Germany save money outright.\n\nBudget a combined utilities-plus-connectivity figure of roughly €200–320 per month for a one-to-two-person household, weighted toward the higher end in peak summer.',
      business_ids: []
    },
    {
      heading: 'Groceries, eating out and daily spending',
      body: 'Groceries are where Mallorca\'s island premium shows: food is more expensive than the mainland because so much is imported. A couple spends roughly €60–80 per week on basic groceries shopping at mainstream supermarkets like Mercadona, more if buying imported or specialty items. Shopping at fresh markets such as Mercat de l\'Olivar in Palma cuts produce costs.\n\nEating out spans a wide range. The single best value is the menú del día — a fixed-price two-to-three-course lunch with bread and a drink for €14–18 — offered at lunchtime on weekdays. Dinner at a mid-range restaurant runs €25–40 per person. A coffee is about €1.60–2, a caña (small beer) €1.80–2.50, and a domestic beer around €4. Watch for the terraza supplement of 10–15% for sitting on prime terraces, and cubierto charges of €1.50–3 for bread and olives.\n\nSelf-catering is roughly 50–70% cheaper than eating every meal out. Eating your main meal at lunch rather than dinner saves 30–40% on similar dishes.',
      business_ids: []
    },
    {
      heading: 'Transport: car, bus and getting around',
      body: 'Public transport is genuinely cheap, with one crucial detail expats miss: the TIB interurban bus, train and metro network across Mallorca is free for registered residents in 2026, but this does not include Palma\'s urban EMT city buses, which still charge fares (a single ride is around €2). So a resident commuting from a town into Palma travels the intercity leg free but pays for city buses inside Palma.\n\nRunning a car is the expensive alternative. Fuel prices in the Balearics are high — stations in Inca, Manacor and Sa Pobla are consistently cheaper than airport, city-centre or tourist-zone stations, where differences can exceed 10 cents per litre. Add annual car tax (around €80), the ITV roadworthiness check (around €30), insurance and parking. Parking in central Palma is scarce and metered.\n\nFor a car-free expat based in Palma or a well-connected town, monthly transport can be under €30. For a car owner, realistically budget €200–350 per month once fuel, insurance, tax and parking are combined.',
      business_ids: []
    },
    {
      heading: 'Monthly budget totals: three expat profiles',
      body: 'Budget expat (€1,800–2,200/month): a one-bedroom flat outside the centre or a room in a shared flat, cooking at home, using the free intercity buses, eating out mainly via the menú del día, minimal AC. Realistic for a single person willing to live outside prime Palma and go car-free.\n\nComfortable expat (€2,500–3,500/month): a one-bedroom in central Palma or the southwest, regular dining out, a coworking membership, running a small car or generous taxi use, comfortable utility spending including summer AC. The typical remote-worker or established single expat budget.\n\nPremium lifestyle (€4,500+/month): a two-bedroom or sea-view flat in a prime zone, frequent restaurant dining, a car, private health insurance, and discretionary spending. Couples and families sit at the top of this band.',
      business_ids: []
    },
    {
      heading: 'Verified Picks on Mallorca Verified',
      body: 'These are coworking spaces with a verified Google presence and strong real-review ratings, useful for remote workers and new arrivals settling in Mallorca.',
      business_ids: coworkingIds
    }
  ],
  faqs: [
    {
      question: 'Is Mallorca expensive to live in compared to mainland Spain?',
      answer: 'Yes, Mallorca is more expensive than most of mainland Spain, mainly on rent and groceries. Palma\'s rents rival Madrid\'s and far exceed cities like Valencia or Seville, and food costs more because much of it is imported to the island. However, Mallorca is cheaper than Ibiza, and dining out, mobile and internet costs remain well below UK, German or Scandinavian levels.'
    },
    {
      question: 'How much do you need to live comfortably in Mallorca per month?',
      answer: 'A single person needs roughly €2,500–3,500 per month to live comfortably in Mallorca in 2026, covering a one-bedroom flat in central Palma or the southwest (€1,300–1,500), utilities (€200–300), groceries, regular dining out, and either a small car or a coworking membership. A budget-conscious single person can manage on €1,800–2,200 by living outside the centre and going car-free, while a premium lifestyle or a family runs €4,500 or more.'
    },
    {
      question: 'What is the average rent in Palma de Mallorca in 2026?',
      answer: 'In 2026, a one-bedroom apartment in central Palma averages around €1,300–1,480 per month, dropping to roughly €1,000–1,100 outside the centre. A three-bedroom averages about €2,400–2,500 in the centre and €1,800–1,900 in the suburbs. Island-wide asking rents reached €18.09 per square metre in 2025, up 9% year-on-year, and prices remain high due to short supply.'
    },
    {
      question: 'Can you live in Mallorca on a remote work salary from the UK or Germany?',
      answer: 'Yes, comfortably, if your remote salary is at or above the UK/German average. A €2,500–3,500 monthly budget covers a comfortable single-person lifestyle in Palma, which most UK or German professional salaries exceed after tax, and you gain on dining, mobile and internet costs versus home. The main squeeze is rent — a typical €3,000–4,000 net monthly salary leaves clear disposable income after Mallorca\'s costs.'
    }
  ],
  seo: {
    title: 'Cost of Living in Mallorca 2026 — What Expats Actually Pay | Mallorca Verified',
    description: 'A single person needs ~€2,000–2,300/month in Palma including rent in 2026. Full 2026 breakdown: rent, utilities, food, transport, and three expat budgets.'
  },
  hero_image_url: heroImageUrl,
  status: 'published',
  source: 'editorial-v2',
  is_featured: false,
  updated_at: new Date().toISOString().split('T')[0],
}

const { error } = await sb.from('guides').upsert(row, { onConflict: 'locale,slug' })
if (error) { console.error('Save error:', error.message); process.exit(1) }
console.log(`✅ Saved: en-coste-vida-mallorca-2026`)
console.log(`   Sections: ${row.sections.length} | Coworkings linked: ${coworkingIds.length}`)
console.log(`   Hero image: ${heroImageUrl ? 'yes' : 'none'}`)
