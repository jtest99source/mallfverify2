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
  'google-ChIJ54QhG66JlxIRhfimwfJdW18', // Immobilienmallorca.com
  'google-ChIJO5OouWeSlxIRgFM3dK5382E', // Chic Mallorca International
  'google-ChIJbYpLwWiSlxIRN2Zn6RZPFkI', // Engel & Völkers Palma Southwest
  'google-ChIJ04IPUbmJlxIROnWpozqHzeY', // Imperial Properties
  'google-ChIJzdU-LUWSlxIR3TtmJfjFxLE', // Engel & Völkers Palma Centre
  'google-ChIJt_uDAh7UlxIRfpZLCRcMJcY', // Balearic Properties - Savills
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
  id: 'en-inmobiliarias-mallorca-expat',
  slug: 'inmobiliarias-mallorca-expat',
  locale: 'en',
  title: 'Real Estate Agencies in Mallorca for Expats — Guide 2026',
  excerpt: 'How foreigners buy and rent in Mallorca in 2026: real costs, the 8–13% Balearic transfer tax, NIE, Golden Visa status, and verified agencies.',
  intro: 'Buying a resale property in Mallorca as a foreigner costs roughly 10–14% on top of the purchase price in taxes and fees, driven mainly by the Balearic transfer tax (ITP), which runs on a progressive scale from 8% to 13%. The island-wide average price hit €7,370 per square metre in 2026, up 9.8% year-on-year, according to the Steinbeis Transfer Institute study published in March 2026. Spain\'s property market has no nationality restrictions — any foreigner can buy — but one thing changed for good: the Golden Visa residency route ended in April 2025, so buying property no longer grants Spanish residency. This guide covers the full cost and process of buying or renting long-term as an expat, and the agencies that actually work with international clients.',
  sections: [
    {
      heading: 'Buying property in Mallorca as a foreigner: costs and process',
      body: 'The market is fully open: there are no nationality restrictions, no minimum purchase value, and no limit on how many properties a foreigner can own. What you need is an NIE (Número de Identificación de Extranjero, the tax ID mandatory for any purchase deed, tax payment or bank account), a Spanish bank account, and an independent lawyer. Non-residents can typically borrow 60–70% of the property\'s value from Spanish banks, over 20–25 year terms. The full process usually takes four to twelve weeks from accepted offer to completion before a notary.\n\nThe biggest single cost is the Balearic transfer tax (ITP) on resale homes, and it is progressive by band: 8% up to €400,000, 9% from €400,000 to €600,000, 10% from €600,000 to €1,000,000, 12% from €1,000,000 to €2,000,000, and 13% above €2,000,000. The common mistake is applying the top rate to the whole price — each band is taxed separately, so a €700,000 home has an effective rate around 8.7%, not 10%. New-build first sales are different: they carry 10% VAT plus 1.5% Stamp Duty (AJD) instead of ITP.\n\nOn top of the tax, budget notary fees (max ~0.5%), Land Registry fees (~0.5% or less), and legal fees (around 1–1.5%). As a planning rule for 2026, budget 10–14% total on top of the price for a resale property, or roughly 11.5–12% for a new build. Residents buying a primary home under €270,151 may qualify for reduced ITP rates, but these rarely apply to incoming foreign buyers.',
      business_ids: []
    },
    {
      heading: 'Long-term renting in Mallorca as an expat: what to expect',
      body: 'Long-term (larga temporada) rentals are governed by Spain\'s Ley de Arrendamientos Urbanos. A contract can be written for one year, but the tenant has the right to extend to a minimum of five years when the landlord is an individual, or seven years when the landlord is a company, on the same terms. On deposits, the law is specific: one month\'s rent as the legal fianza, plus optionally up to two months more as additional guarantee — a maximum of three months\' rent in total. Since 2023, agency commission on a habitual-residence rental is paid by the landlord, not the tenant, so be wary if an agent tries to charge you a finder\'s fee.\n\nTwo 2025–2026 points matter. First, annual rent increases on existing contracts are now tied to the IRAV index published by Spain\'s INE, which replaced the old IPC/CPI reference — a landlord cannot raise your rent by an arbitrary market figure. Second, Mallorca has no declared stressed zone (zona tensionada) as of 2026, because the Balearic government has so far rejected the declaration. That means the strictest rent caps on new contracts do not currently apply anywhere in Mallorca.\n\nThe practical problem in 2026 is supply, not rules. A structural shortage has pushed long-term rents up and thinned availability, especially in Palma and the southwest, as owners favour higher-yield tourist lets. Expect landlords to ask for proof of income, and note that non-EU and newly arrived renters are often turned away when approaching owners directly. This is where agencies earn their fee: firms like **Engel & Völkers Palma Southwest** and **Chic Mallorca International Real Estate** run dedicated rental desks that place expats, including non-EU arrivals relocating from outside the bloc.',
      business_ids: []
    },
    {
      heading: 'What to look for in an estate agent in Mallorca',
      body: 'Language and international focus matter most for expats. The agencies that genuinely serve foreign buyers operate in English and German as standard — **Immobilienmallorca.com** and the **Engel & Völkers** offices are explicitly German- and English-speaking, and **Balearic Properties - Savills Mallorca** and **Imperial Properties Inmobiliaria CB** market heavily to UK and Northern European buyers. A good agent coordinates the parts a foreigner cannot easily manage alone: the NIE, an independent lawyer (never the agent\'s own), the Nota Simple check, and completion by power of attorney if you cannot attend in person.\n\nThe essential red flag is the Nota Simple. Before you pay any reservation deposit, an independent lawyer must pull the Land Registry extract to confirm the seller owns the property and that it is free of debts, liens, illegal extensions or missing licences. Never let the agent\'s recommended lawyer double as your only legal check, and never sign an arras (deposit) contract before that review — under Spanish law, if you withdraw you forfeit the deposit, and if the seller withdraws they owe you double.\n\nVerify the agency has a physical office and a real track record. Check the Google rating against the number of reviews — a high score on three reviews tells you little, while a solid score across dozens of transactions is meaningful.',
      business_ids: []
    },
    {
      heading: 'Verified Picks on Mallorca Verified',
      body: 'Every agency below has a verified Google presence, an active physical office in Mallorca, and a documented focus on international and expat clients in English and German. Ratings and review counts are noted so you can weigh score against volume; always use your own independent lawyer regardless of which agency you work with.',
      business_ids: allBusinessIds
    }
  ],
  faqs: [
    {
      question: 'Can a foreigner buy property in Mallorca in 2026?',
      answer: 'Yes. Spain\'s property market has no nationality restrictions, no minimum purchase value, and no limit on how many properties a foreigner can own, including non-EU buyers such as UK and US nationals after Brexit. You need an NIE number, a Spanish bank account, and an independent lawyer to complete the purchase. Note that buying property no longer grants residency, since Spain ended the Golden Visa scheme in April 2025.'
    },
    {
      question: 'How much does it cost to buy a property in Mallorca including taxes and fees?',
      answer: 'Budget an extra 10–14% on top of the purchase price for a resale property. The main cost is the Balearic transfer tax (ITP), progressive from 8% up to €400,000 rising to 13% above €2,000,000, plus notary (~0.5%), Land Registry (~0.5%) and legal fees (1–1.5%). On a €400,000 resale home, that means roughly €40,000–€52,000 in additional costs; new builds instead pay 10% VAT plus 1.5% Stamp Duty.'
    },
    {
      question: 'Do I need an NIE to buy property in Mallorca?',
      answer: 'Yes. The NIE (Número de Identificación de Extranjero) is a mandatory tax identification number for every foreign buyer and is required to sign the purchase deed, pay taxes, open a Spanish bank account and connect utilities. You can apply at a Spanish consulate in your home country or in person in Spain. Without it you cannot legally complete a property purchase.'
    },
    {
      question: 'What are the rules for long-term renting in Mallorca as a foreigner in 2026?',
      answer: 'A long-term rental contract runs for a minimum of five years if the landlord is an individual (seven if a company), even if initially written for one year. The maximum upfront payment is three months\' rent: one month\'s legal deposit plus up to two months\' additional guarantee. Agency commission is paid by the landlord, not the tenant. Mallorca has no declared stressed zone as of 2026, so no rent cap applies to new contracts, though annual increases on existing contracts are limited to the IRAV index.'
    },
    {
      question: 'Where is the best area in Mallorca for expats to buy or rent?',
      answer: 'For international buyers who want services, an airport 15 minutes away and a large expat community, Palma and the southwest (Santa Ponsa, Bendinat, Portals) are the strongest choice, though the southwest approaches €10,000 per square metre. For better value, inland towns like Inca, Felanitx and Sa Pobla cost significantly less, while the north around Pollença suits those wanting a quieter, scenic base. Expats prioritising long-term rentals should focus on Palma, which has the deepest rental market despite tight 2026 supply.'
    }
  ],
  seo: {
    title: 'Real Estate Agencies in Mallorca for Expats — Guide 2026 | Mallorca Verified',
    description: 'Buying property in Mallorca as a foreigner in 2026: 8–13% transfer tax, NIE, Golden Visa ended, total costs 10–14%, and verified expat-focused agencies.'
  },
  hero_image_url: heroImageUrl,
  status: 'published',
  source: 'editorial-v2',
  is_featured: false,
  updated_at: new Date().toISOString().split('T')[0],
}

const { error } = await sb.from('guides').upsert(row, { onConflict: 'locale,slug' })
if (error) { console.error('Save error:', error.message); process.exit(1) }
console.log(`✅ Saved: en-inmobiliarias-mallorca-expat`)
console.log(`   Sections: ${row.sections.length} | Picks linked: ${allBusinessIds.length}`)
console.log(`   Hero image: ${heroImageUrl ? 'yes' : 'none'}`)
