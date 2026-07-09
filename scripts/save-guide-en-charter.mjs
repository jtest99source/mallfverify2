// One-shot: save EN charter-barco-sin-patron-requisitos guide to DB
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
  'google-ChIJBX-qzf6XlxIRsFlJqStBBCI', // Arenal Boat Charter
  'google-ChIJ67jGBKGWlxIRDfOzviZhDYg', // Captain Boleor
  'google-ChIJv52E9UuWlxIRTVBUtNJiRoE', // boat-4-you.de
  'google-ChIJmfftN3IzlhIRUgW8P20eREw', // Alcudia Boat Rental
  'google-ChIJ4UUv98QtlhIRow36fE3H-hU', // Coral Boats Mallorca
  'google-ChIJreYI9IsslhIRjrSH-BEPMME', // Quest Heroes
  'google-ChIJGQB2ymGJlxIRUCPYH6JEavY', // Sea Mallorca
  'google-ChIJNSXZP0iJlxIRF3pY9evpKpA', // Seashore Boats
  'google-ChIJO79-zHdblhIRDlU_dANMz7s', // Selecto Charter
  'google-ChIJJeH3T7iTlxIRAT-6fqnxNHA', // Mistral Nautic
  'google-ChIJC-3kpkOSlxIRqE8vwHyaaPk', // ECC Yacht Charter
  'google-ChIJcTV8Ui0tlhIR53r_RyqnI3w', // Mallorca Boat Hire
]

// Find hero image from businesses
const { data: bizRows } = await sb.from('businesses')
  .select('primary_image_url, gallery_image_urls, image')
  .in('id', allBusinessIds)
  .limit(20)

let heroImageUrl = null
for (const b of bizRows ?? []) {
  const url = b.primary_image_url || b.gallery_image_urls?.[0] || b.image
  if (url) { heroImageUrl = url; break }
}
console.log('Hero image:', heroImageUrl ? heroImageUrl.slice(0, 60) + '...' : 'none')

const row = {
  id: 'en-charter-barco-sin-patron-requisitos',
  slug: 'charter-barco-sin-patron-requisitos',
  locale: 'en',
  title: 'Renting a Boat Without a Skipper in Mallorca — Legal Requirements 2026',
  excerpt: 'How skipperless boat hire works in Mallorca in 2026, the 5m/15hp rule, costs, and the October 2026 law that ends licence-free rentals.',
  intro: 'Until now, anyone over 18 could rent a small motorboat in Mallorca with no nautical qualification, as long as the boat stayed under 5 metres in length and 15 horsepower. That is about to change: Royal Decree 1188/2025, published in Spain’s official gazette on 30 December 2025, ends licence-free boat rental across the country from 1 October 2026. After that date you will need at least the Licencia de Navegación to hire any motorboat, even the small ones. This guide covers exactly how skipperless hire works in Mallorca right now, what it costs, and what the new rule means if you are planning a trip or already living here.',
  sections: [
    {
      heading: 'The legal rules: 5 metres, 15 horsepower, and the 2026 change',
      body: 'Under the rules in force through the 2026 summer season, you can rent and drive a boat in Mallorca without any licence provided it meets two conditions: a maximum engine power of 15 hp (11.26 kW) and a hull no longer than 5 metres. You must be at least 18 years old and present a valid ID. Navigation is restricted to daytime only and within 2 nautical miles of the coast, and the rental company gives a mandatory safety briefing — typically 15 to 30 minutes — before you leave the dock. These boats are slow by design, cruising at roughly 5 to 8 knots, which is enough to reach nearby coves but keeps them within safe limits. Jet skis have never qualified for this exemption and always require a licence.',
      business_ids: []
    },
    {
      heading: 'What changes on 1 October 2026',
      body: 'Royal Decree 1188/2025 eliminates the licence-free rental exemption for commercial hire. From 1 October 2026, any company renting you a motorboat must require you to hold at least the Licencia de Navegación — the entry-level Spanish nautical qualification, which can be obtained in a single day and involves no written exam. A rental firm that hands you a boat without checking your title after that date is breaking the law. The decree gives businesses a transition period until that date to adapt, and the change was driven by the Dirección General de la Marina Mercante following a rise in incidents involving untrained renters. Two things are worth knowing. First, the exemption survives for private, non-commercial use: if you own a boat under 5m/15hp, you can still drive it yourself without a licence within the same 2-mile daytime limits. Second, hiring a boat with a professional skipper included requires no licence at all — the obligation applies only to whoever is at the helm. Operators such as **Ecc Yacht Charter Mallorca** in Palma work exclusively on this skippered model, where you travel as a passenger with no legal responsibility.',
      business_ids: []
    },
    {
      heading: 'Costs, deposits, and what to check before you book',
      body: 'In 2026, skipperless hire of a 15 hp boat for up to 5 or 6 people typically starts around 150–180€ for a half day in peak season, and can run from roughly 96€ to 500€ per day depending on dates, boat and location. Real-world review data backs this up: renters at **Mallorca Boat Hire** in Port d’Alcúdia report paying around 230€ for a 5-hour session, and multiple operators note that fuel adds roughly 10–12€ for a typical half-day coastal run. Fuel and extras (snorkel gear, paddleboard) are often paid separately at boarding, and most companies hold a refundable deposit of around 300€ by card or cash. Confirm before booking whether fuel is included, what the deposit is, and where the meeting point actually is — a recurring complaint about the weakest operators involves vague dock locations and no physical office, which is exactly why checking real Google reviews before paying a deposit matters.',
      business_ids: []
    },
    {
      heading: 'Seasonal notes, zones, and safety',
      body: 'Weather is the single biggest variable. Rental companies will cancel your booking if conditions are unsafe, and for a first outing you should avoid winds above 15 knots — if you see whitecaps forming, it is time to head back. All passengers should be able to swim, and you must respect a 200-metre distance from marked swimming zones, slowing to 3 knots near the shore. The Bay of Alcúdia in the north is the most popular launch area because it is large, sheltered and dotted with reachable coves; renters there consistently note that afternoons get windier, so morning slots are the safer bet for crossing the bay. The east coast around Portocolom gives quick access to calas like Cala d’Or, while the southwest (Santa Ponsa, El Arenal, Can Pastilla) suits day trips toward Cala Blava and the caves. Each zone has established operators with strong track records rather than pop-up stands.',
      business_ids: []
    },
    {
      heading: 'Verified Picks on Mallorca Verified',
      body: 'Every business below is an active Mallorca boat-hire operator with a verified Google presence and a rating of 4.5★ or higher from real reviews — no paid placements, no pop-up stands. Confirm licence requirements directly with any operator for bookings dated on or after 1 October 2026.',
      business_ids: allBusinessIds
    }
  ],
  faqs: [
    {
      question: 'Can I rent a boat without a licence in Mallorca in 2026?',
      answer: 'Yes, but only through the 2026 summer season. Until 1 October 2026 you can rent and drive a boat with no licence if it has a maximum 15 hp engine and is under 5 metres long, you are over 18, and you stay within 2 nautical miles of the coast in daylight. From 1 October 2026, Royal Decree 1188/2025 requires renters to hold at least the Licencia de Navegación for any motorboat hire.'
    },
    {
      question: 'How much does it cost to rent a boat without a skipper in Mallorca?',
      answer: 'A 15 hp licence-free boat for up to 5–6 people typically starts around 150–180€ for a half day in high season, with full days ranging from roughly 96€ to 500€ depending on the boat, date and location. Expect a refundable deposit of about 300€, plus around 10–12€ in fuel for a typical half-day coastal run, and check whether snorkel gear and other extras are included or paid separately at boarding.'
    },
    {
      question: 'Do I need a licence to rent a boat with a skipper in Mallorca?',
      answer: 'No. If the boat comes with a professional skipper included, you need no nautical qualification, because the legal obligation applies only to the person operating the boat. This is unaffected by the October 2026 rule change and is the main way to access larger boats without a licence.'
    },
    {
      question: 'Where is the best place to rent a boat without a licence in Mallorca?',
      answer: 'The Bay of Alcúdia in the north is the top choice for first-timers because it is large, sheltered and full of reachable coves, with the widest selection of operators. Portocolom on the east coast and Santa Ponsa, El Arenal and Can Pastilla in the southwest are also well-established rental hubs. Book a morning slot where possible, since afternoon winds pick up and slow, low-power boats are harder to handle in chop.'
    }
  ],
  seo: {
    title: 'Renting a Boat Without a Skipper in Mallorca — Legal Requirements 2026 | Mallorca Verified',
    description: 'Skipperless boat hire in Mallorca 2026: the 5m/15hp no-licence rule, costs from 150€, and the new law ending licence-free rentals on 1 October 2026.'
  },
  hero_image_url: heroImageUrl,
  status: 'published',
  source: 'editorial-v2',
  is_featured: false,
  updated_at: new Date().toISOString().split('T')[0],
}

const { error } = await sb.from('guides').upsert(row, { onConflict: 'locale,slug' })
if (error) { console.error('Save error:', error.message); process.exit(1) }
console.log(`✅ Saved: en-charter-barco-sin-patron-requisitos`)
console.log(`   Sections: ${row.sections.length} | Picks linked: ${allBusinessIds.length}`)
