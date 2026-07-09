import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
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

const { data: bordoy } = await sb.from('businesses').select('id,name,status,category').eq('google_place_id','ChIJJ9iDt0SSlxIRjTMWcgBy7ic')
console.log('Can Bordoy:', JSON.stringify(bordoy, null, 2))

const { data: agency } = await sb.from('businesses').select('id,name,status,category,slug').eq('google_place_id','ChIJ0xeLnAQPlxIRmmzeU-j_13Y')
console.log('The Agency:', JSON.stringify(agency, null, 2))
