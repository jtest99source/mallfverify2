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
  'google-ChIJgTWMxUOXlxIRm9qj4TVCmUY', // Alize Boats
  'google-ChIJyaD684sslhIRcx27xSR8ewY', // Boats Rental Mallorca
  'google-ChIJcTV8Ui0tlhIR53r_RyqnI3w', // Mallorca Boat Hire
  'google-ChIJNQSoMTczlhIR9yyJsieR0pk', // Blue Sea Rent
  'google-ChIJBX-qzf6XlxIRsFlJqStBBCI', // Arenal Boat Charter
  'google-ChIJ67jGBKGWlxIRDfOzviZhDYg', // Captain Boleor
  'google-ChIJv6ndVYSXlxIRBlIktae6edY', // Sea U charter
  'google-ChIJ8xDfZm6SlxIRozjbyDLNYBE', // OASIS CATAMARAN
  'google-ChIJC-3kpkOSlxIRqE8vwHyaaPk', // Ecc Yacht Charter
  'google-ChIJO79-zHdblhIRDlU_dANMz7s', // Selecto Charter
  'google-ChIJ4UUv98QtlhIRow36fE3H-hU', // Coral Boats Mallorca
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
  id: 'en-cuanto-cuesta-alquilar-barco-mallorca',
  slug: 'cuanto-cuesta-alquilar-barco-mallorca',
  locale: 'en',
  title: 'How Much Does It Cost to Rent a Boat in Mallorca 2026',
  excerpt: 'Real 2026 boat rental prices in Mallorca by type: licence-free from ~150€ half day, day charters, skippered boats, catamarans and yachts.',
  intro: 'In 2026, a licence-free 15 hp motorboat in Mallorca costs roughly 150–250€ for a half day and 300–600€ for a full day, while a skippered day charter on a larger boat runs from around 500€ up to 2,500€ depending on size. Price is driven by four things: boat type, season, duration, and whether a skipper is included. July and August command the highest rates and the tightest availability; June and September cost noticeably less for near-identical weather. One 2026 change matters for planning: from 1 October 2026, licence-free rentals end nationwide, which pushes more demand toward skippered boats — but it does not raise in-season rental prices before that date.',
  sections: [
    {
      heading: 'Licence-free boats: what you actually pay',
      body: 'A licence-free boat is capped at 15 hp and 5 metres, seats up to 5–6 people, and is the cheapest way onto the water. For the 2026 season, expect around 150–250€ for a half day (typically 4 hours) and 300–600€ for a full day, depending on the operator, the boat and whether it is peak season. Platforms list entry-level licence-free boats around Palma from as low as 120€ per day in the shoulder season, though Alcúdia and the north tend to sit higher because demand is heavier.',
      business_ids: []
    },
    {
      heading: "Licence-free boats: what's included and what isn't",
      body: 'The quoted price normally covers the boat, mandatory safety equipment (life jackets, anchor), the pre-departure safety briefing and third-party liability insurance. Fuel is usually charged separately based on consumption — budget roughly 10–15€ for a typical half-day coastal run. Extras like snorkel gear, a paddleboard or a cool box may be included or added at boarding, so confirm before you pay. Most operators also hold a refundable deposit of around 300€ by card or cash. Real review data backs the ranges: renters at **Mallorca Boat Hire** in Port d\'Alcúdia report about 230€ for a 5-hour session, and operators such as **Alize Boats** in Can Pastilla and **Boats Rental Mallorca** in Alcúdia advertise similar structures with fuel on top.',
      business_ids: []
    },
    {
      heading: 'Skippered charters, catamarans and yachts: cost breakdown',
      body: 'Once you go beyond the 15 hp limit, a licence or a skipper is required, and prices climb by boat class. As a 2026 guide for the Palma area: mid-size RIBs and speedboats run roughly 500–1,000€ per day, and sailing boats and catamarans typically 900–2,500€ per day. For skippered experiences, fuel is generally included in the price — a meaningful difference from bareboat licence-free hire, where you pay for what you burn. Add the skipper cost where it is itemised separately: a professional skipper is commonly around 150–250€ per day on top of the boat.',
      business_ids: []
    },
    {
      heading: 'Shared catamaran trips: the cheapest skippered option',
      body: 'If you want a skippered boat without chartering the whole vessel, a shared catamaran day trip from Palma is the budget entry point, often including food, drinks and snorkelling. **OASIS CATAMARAN** runs half-day group sailings from the Palma seafront at a per-person rate far below a private charter. For a private boat with a captain in a premium marina, **Sea U charter** and **Ecc Yacht Charter Mallorca** operate out of Puerto Portals and Palma, where day rates reflect the higher-end location.',
      business_ids: []
    },
    {
      heading: 'What affects the price — season, zone, duration and extras',
      body: 'Season is the biggest lever. July and August are peak: prices rise and boats book out, so reserve well ahead. June and September deliver near-identical sea conditions for less money and better availability — the clearest way to cut cost without cutting quality. Zone matters too: the sheltered Bay of Alcúdia in the north and the Palma/Can Pastilla stretch have the densest supply of licence-free boats, which keeps entry prices competitive, while premium marinas like Puerto Portals and Port Adriano price higher for the same hours.',
      business_ids: []
    },
    {
      heading: 'Timing and hidden costs to plan for',
      body: 'Duration changes the maths: for most coastal routes, a 4-hour half day is enough to reach two or three coves with swim stops, so the full-day rate is only worth it if you plan to cover several areas or anchor all day. Beyond the headline price, budget for fuel on bareboat hire (10–15€ for a short run, more for larger engines), the refundable deposit (~300€), and optional extras. Booking in advance and choosing a weekday morning both lower cost and avoid the afternoon wind that builds in summer.',
      business_ids: []
    },
    {
      heading: 'Verified Picks on Mallorca Verified',
      body: 'Every operator below is an active Mallorca boat-rental business with a verified Google presence and a rating of 4.5★ or higher from real reviews — no paid placements. They span licence-free, skippered and catamaran options across the main price tiers.',
      business_ids: allBusinessIds
    }
  ],
  faqs: [
    {
      question: 'How much does it cost to rent a boat in Mallorca per day in 2026?',
      answer: 'In 2026, a licence-free 15 hp motorboat costs roughly 300–600€ for a full day and 150–250€ for a half day. Larger boats cost more: mid-size RIBs and speedboats run about 500–1,000€ per day, and sailing boats or catamarans typically 900–2,500€ per day. Fuel is usually extra on licence-free bareboat hire but included on skippered charters.'
    },
    {
      question: 'What is the cheapest way to rent a boat in Mallorca?',
      answer: 'The cheapest private option is a licence-free 15 hp boat, from around 150€ for a half day, split between up to 5–6 people. For a skippered experience on a budget, a shared catamaran day trip from Palma costs far less per person than a private charter and often includes food, drinks and snorkelling gear. Booking in June or September instead of July–August lowers prices further.'
    },
    {
      question: 'Is it cheaper to rent a boat with or without a skipper in Mallorca?',
      answer: 'Without a skipper is cheaper if you take a licence-free boat, from around 150€ half day, but you pay for fuel separately and are limited to 15 hp within 2 miles of the coast. A skippered charter costs more (a skipper adds roughly 150–250€ per day), but fuel is typically included and you can access larger, faster boats with no licence required. From 1 October 2026, licence-free rentals end, so a skippered boat becomes the only no-licence route.'
    },
    {
      question: 'When is the cheapest time to rent a boat in Mallorca?',
      answer: 'June and September are the cheapest months with good weather, offering lower rates and better availability than the July–August peak, when prices rise sharply and boats book out. Weekday mornings are cheaper and calmer than weekends, and booking in advance secures both the best price and the boat you want. Prices climb steeply in high summer regardless of boat type.'
    }
  ],
  seo: {
    title: 'How Much Does It Cost to Rent a Boat in Mallorca 2026 | Mallorca Verified',
    description: '2026 boat rental prices in Mallorca: licence-free from ~150€ half day, day charters 300–600€, skippered boats and catamarans 900–2,500€. What affects cost.'
  },
  hero_image_url: heroImageUrl,
  status: 'published',
  source: 'editorial-v2',
  is_featured: false,
  updated_at: new Date().toISOString().split('T')[0],
}

const { error } = await sb.from('guides').upsert(row, { onConflict: 'locale,slug' })
if (error) { console.error('Save error:', error.message); process.exit(1) }
console.log(`✅ Saved: en-cuanto-cuesta-alquilar-barco-mallorca`)
console.log(`   Sections: ${row.sections.length} | Picks linked: ${allBusinessIds.length}`)
console.log(`   Hero image: ${heroImageUrl ? 'yes' : 'none'}`)
