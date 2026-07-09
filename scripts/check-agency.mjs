import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
function loadEnv() {
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue
    const i = t.indexOf('='); if (i < 0) continue
    const k = t.slice(0, i).trim(); const v = t.slice(i+1).trim().replace(/^["']|["']$/g,'')
    if (!process.env[k]) process.env[k] = v
  }
}
loadEnv()
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// slug would be "the-agency-mallorca"
const { data: bySlug } = await sb.from('businesses').select('id,name,status,category,slug,google_place_id').eq('slug','the-agency-mallorca')
console.log('By slug "the-agency-mallorca":', JSON.stringify(bySlug, null, 2))

// also search all real-estate businesses to see what slugs conflict
const { data: reSlug } = await sb.from('businesses').select('id,name,status,category,slug').eq('category','real-estate').ilike('slug','the-agency%')
console.log('real-estate "the-agency*":', JSON.stringify(reSlug, null, 2))
