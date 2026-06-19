// scripts/submit-indexnow.mjs
// Submits all site URLs to IndexNow (Bing, Yandex, etc.)
// Usage: node scripts/submit-indexnow.mjs

import { existsSync, readFileSync } from 'node:fs'

const INDEXNOW_KEY = 'ac537f7eaf28a657d36d3a04ae1919e0'
const SITE_URL = 'https://mallorcaverified.com'
const LOCALES = ['es', 'en', 'de']
const GUIDE_LOCALES = ['es', 'en']

function loadLocalEnv() {
  if (!existsSync('.env.local')) return
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[k]) process.env[k] = v
  }
}

async function getPublishedSlugs() {
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

  const [businesses, guides] = await Promise.all([
    sb.from('businesses').select('slug,category').eq('status', 'published'),
    sb.from('guides').select('slug').eq('status', 'published').eq('source', 'editorial').eq('locale', 'es')
  ])

  return {
    businesses: businesses.data ?? [],
    guideSlugs: [...new Set((guides.data ?? []).map(g => g.slug))]
  }
}

const CATEGORIES = [
  'restaurants','hotels','beach-clubs','boats','activities',
  'beaches','bars','cafes','bakeries','spas','gyms','rent-a-car','routes','excursions'
]

function categoryPath(cat) {
  return cat
}

async function main() {
  loadLocalEnv()
  const { businesses, guideSlugs } = await getPublishedSlugs()

  const urls = new Set()

  // Core pages per locale
  for (const locale of LOCALES) {
    urls.add(`${SITE_URL}/${locale}`)
    urls.add(`${SITE_URL}/${locale}/rankings`)
    urls.add(`${SITE_URL}/${locale}/business`)
    for (const cat of CATEGORIES) {
      urls.add(`${SITE_URL}/${locale}/${categoryPath(cat)}`)
      urls.add(`${SITE_URL}/${locale}/top/${cat}`)
    }
  }

  // Methodology pages
  urls.add(`${SITE_URL}/es/metodologia`)
  urls.add(`${SITE_URL}/en/methodology`)
  urls.add(`${SITE_URL}/de/methodik`)

  // Guide pages (ES + EN)
  for (const locale of GUIDE_LOCALES) {
    urls.add(`${SITE_URL}/${locale}/guides`)
    for (const slug of guideSlugs) {
      urls.add(`${SITE_URL}/${locale}/guides/${slug}`)
    }
  }

  // Business pages per locale
  for (const b of businesses) {
    for (const locale of LOCALES) {
      urls.add(`${SITE_URL}/${locale}/${b.category}/${b.slug}`)
    }
  }

  const urlList = [...urls]
  console.log(`Submitting ${urlList.length} URLs to IndexNow...`)

  // Send in chunks of 100
  let sent = 0
  for (let i = 0; i < urlList.length; i += 100) {
    const chunk = urlList.slice(i, i + 100)
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: 'mallorcaverified.com',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: chunk
      })
    })
    if (res.ok || res.status === 202) {
      sent += chunk.length
      console.log(`  ✓ Chunk ${Math.ceil(i / 100) + 1}: ${chunk.length} URLs (HTTP ${res.status})`)
    } else {
      console.error(`  ✗ Chunk ${Math.ceil(i / 100) + 1}: HTTP ${res.status}`)
    }
  }

  console.log(`\nDone! ${sent}/${urlList.length} URLs submitted.`)
}

main().catch(console.error)
