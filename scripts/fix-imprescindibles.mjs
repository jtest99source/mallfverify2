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
const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY
const fields = 'place_id,name,formatted_address,geometry,rating,user_ratings_total,website,formatted_phone_number,photos,business_status'

function toSlug(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
}

// ── 1. IMPORT MISSING ────────────────────────────────────────────────────────

const toImport = [
  { placeId: 'ChIJrfX61J1alhIRrlv0d_yM-rw', category: 'restaurant' },
  { placeId: 'ChIJd6TYS_dRlhIRRxOhIdQSI2k', category: 'restaurant' },
  { placeId: 'ChIJJ9iDt0SSlxIRjTMWcgBy7ic', category: 'hotel' },
  { placeId: 'ChIJAa63siSTlxIRcJc1Vs08bec', category: 'car-dealer' },
  { placeId: 'ChIJSxxGMWvVlxIRjdrn6oGbMQI', category: 'spa' },
  { placeId: 'ChIJwfvyBWeSlxIRcTiK82Okw1I', category: 'gym' },
  { placeId: 'ChIJuVulK3GTlxIRj5ThtteP5A8', category: 'veterinarian' },
  { placeId: 'ChIJVVRbQhnFlxIRCTIcW1IyW98', category: 'veterinarian' },
  { placeId: 'ChIJ1y1_jP-SlxIRoGZQH7dkAAI', category: 'veterinarian' },
  { placeId: 'ChIJ0xeLnAQPlxIRmmzeU-j_13Y', category: 'real-estate' },
]

console.log('── IMPORTANDO NEGOCIOS FALTANTES ──────────────────────────')
for (const { placeId, category } of toImport) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}&language=en`
  )
  const { result: p, status } = await res.json()
  if (status !== 'OK') { console.error(`❌ ${placeId}: ${status}`); continue }

  const cityMatch = p.formatted_address?.match(/\d{5}\s+([^,]+)/)
  const city = cityMatch ? cityMatch[1].trim() : 'Palma'
  const photoRef = p.photos?.[0]?.photo_reference
  const imageUrl = photoRef
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`
    : null

  const row = {
    id: `google-${placeId}`,
    google_place_id: placeId,
    google_maps_url: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
    slug: toSlug(p.name),
    name: p.name,
    display_name: p.name,
    category,
    city,
    address: p.formatted_address,
    latitude: p.geometry?.location?.lat,
    longitude: p.geometry?.location?.lng,
    rating: p.rating,
    reviews_count: p.user_ratings_total,
    website: p.website,
    phone: p.formatted_phone_number,
    primary_image_url: imageUrl,
    status: 'published',
    source: 'google_places',
  }

  const { error } = await sb.from('businesses').upsert(row, { onConflict: 'id' })
  if (error) { console.error(`❌ ${p.name}: ${error.message}`); continue }
  console.log(`✅ ${p.name} | ${city} | ${p.rating}★ | ${category}`)
}

// ── 2. FIX CATEGORIES ────────────────────────────────────────────────────────

console.log('\n── CORRIGIENDO CATEGORÍAS ─────────────────────────────────')
const categoryFixes = [
  // Beach clubs mal categorizados como restaurant
  { id: 'google-ChIJNZ_PjqUmmBIRUcbKeHIy20c', name: 'Beach Club Gran Folies', category: 'beach-club' },
  { id: 'google-ChIJ3bweLcctlhIRLuhBCVF9vAc', name: 'NU Mallorca',            category: 'beach-club' },
  // Sa Bassa Rotja: estaba como spa, debería ser hotel
  { id: 'google-ChIJ6580H8CzlxIRSqpsrSlPNE8', name: 'Sa Bassa Rotja',         category: 'hotel' },
  // Can Joan de s'Aigo Sindicat: estaba como restaurant, debería ser bakery
  { id: 'google-ChIJs2r9gVuSlxIRiuG8823VKcY', name: "Can Joan de s'Aigo (Sindicat)", category: 'bakery' },
]

for (const { id, name, category } of categoryFixes) {
  const { error } = await sb.from('businesses').update({ category }).eq('id', id)
  if (error) { console.error(`❌ ${name}: ${error.message}`); continue }
  console.log(`✅ ${name} → category: ${category}`)
}

// ── 3. FIX STATUS (publish hidden/draft) ────────────────────────────────────

console.log('\n── PUBLICANDO NEGOCIOS EN HIDDEN/DRAFT ────────────────────')
const toPublish = [
  // Beach clubs hidden
  'google-ChIJ4a3aTKaWlxIRswFN7GZDDhk', // Purobeach Palma
  'google-ChIJBQj0SHeOlxIRCDE2oiizWik', // Balneario Illetas Beach Club
  // Bakeries (todas hidden/draft)
  'google-ChIJEUGWH06TlxIRWMOerVXhUb4', // Fika Farina
  'google-ChIJTU1qblqSlxIRgqyBztCvFs4', // Fornet de la Soca
  'google-ChIJWY_V1hSTlxIRY4PPSPE-9Zw', // La Petite Boulangerie
  'google-ChIJRRtwTlKSlxIRGhwzV7CmhAA', // Panadería S'Estació
  'google-ChIJCyAeI92NlxIR7izZSliccps', // Forn de San Agustín
  'google-ChIJR8eOD6aTlxIRGFYqVgsL0W0', // Pastisseria Real
  'google-ChIJe5eBAIqSlxIRUrbxVMbhhTI', // Ensaïmades Àngel
  // Nightlife hidden
  'google-ChIJVdyTIo-TlxIR8AEkvvmRKF0', // The Jazz Lounge
  // Healthcare hidden
  'google-ChIJSe0Z2HKTlxIRwLEp5uJROZA', // Hospital Verge de la Salut
  // Sa Bassa Rotja (hotel, was hidden)
  'google-ChIJ6580H8CzlxIRSqpsrSlPNE8',
  // Real estate hidden
  'google-ChIJk3B3f4eOlxIRBnkgMh677_4', // Private Property Mallorca
  'google-ChIJ4fJj6_uTlxIRBuguiLGS7cE', // Luxury on Mallorca
]

// Get names for logging
const { data: rows } = await sb.from('businesses').select('id, name').in('id', toPublish)
const nameMap = Object.fromEntries((rows ?? []).map(r => [r.id, r.name]))

const { error: pubError } = await sb.from('businesses').update({ status: 'published' }).in('id', toPublish)
if (pubError) {
  console.error(`❌ Bulk publish error: ${pubError.message}`)
} else {
  for (const id of toPublish) {
    console.log(`✅ published: ${nameMap[id] ?? id}`)
  }
}

console.log('\n🎉 Todo listo.')
