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

const coworkings = [
  { placeId: 'ChIJp_tJLIKTlxIRxKMKqO5SfSo', name: 'eWave Coworking Mallorca' },
  { placeId: 'ChIJHZ_Ae1aSlxIRTau8PHZPGAk', name: 'Cómodo&Co Coworking Arxiduc' },
  { placeId: 'ChIJk2kE1U6WlxIRIj5r0nSLcyE', name: 'Bedndesk - Coliving & Coworking in Mallorca' },
  { placeId: 'ChIJhSk8YB-TlxIRORGUNlkSnuc', name: 'Where to Work Coworking Mallorca' },
]

function toSlug(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
}

const fields = 'place_id,name,formatted_address,geometry,rating,user_ratings_total,website,formatted_phone_number,photos,business_status'

for (const cw of coworkings) {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${cw.placeId}&fields=${fields}&key=${apiKey}&language=en`
  )
  const { result: p, status } = await res.json()
  if (status !== 'OK') { console.error(`❌ ${cw.name}: ${status}`); continue }

  const cityMatch = p.formatted_address?.match(/\d{5}\s+([^,]+)/)
  const city = cityMatch ? cityMatch[1].trim() : 'Palma'
  const photoRef = p.photos?.[0]?.photo_reference
  const imageUrl = photoRef
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${apiKey}`
    : null

  const row = {
    id: `google-${cw.placeId}`,
    google_place_id: cw.placeId,
    google_maps_url: `https://www.google.com/maps/place/?q=place_id:${cw.placeId}`,
    slug: toSlug(p.name),
    name: p.name,
    display_name: p.name,
    category: 'activity',
    city,
    address: p.formatted_address,
    latitude: p.geometry?.location?.lat,
    longitude: p.geometry?.location?.lng,
    rating: p.rating,
    reviews_count: p.user_ratings_total,
    website: p.website,
    phone: p.formatted_phone_number,
    primary_image_url: imageUrl,
    status: 'hidden',
    source: 'google_places',
  }

  const { error } = await sb.from('businesses').upsert(row, { onConflict: 'id' })
  if (error) { console.error(`❌ ${p.name}: ${error.message}`); continue }
  console.log(`✅ ${p.name} | ${city} | ${p.rating}★ | hidden | ${row.slug}`)
}
