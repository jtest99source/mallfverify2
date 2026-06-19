// scripts/backfill-guide-images.mjs
// Assigns unique Unsplash hero images to all guides with hero_image_url = null
//
// Usage:
//   node scripts/backfill-guide-images.mjs
//   node scripts/backfill-guide-images.mjs --dry-run   (show queries without saving)

import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'

function loadLocalEnv() {
  if (!existsSync('.env.local')) return
  const lines = readFileSync('.env.local', 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[k]) process.env[k] = v
  }
}

loadLocalEnv()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Deterministic index 0-9 based on slug — ensures each slug picks a different photo
function slugPickIndex(slug) {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 10
}

// Build a meaningful Unsplash query from a guide slug
function buildQuery(slug, title) {
  const cleaned = title
    .replace(/\b202\d\b/g, '')
    .replace(/—.*/g, '')
    .replace(/guía (completa|práctica)|los mejores|mejores?|best|die besten|(en|de|para|desde|in|auf) mallorca|mallorca/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Slug-based overrides for more precise photography
  if (slug.includes('playa') || slug.includes('beach') || slug.includes('cala')) return 'Mallorca beach cala turquoise water'
  if (slug.includes('barco') || slug.includes('velero') || slug.includes('boat') || slug.includes('charter')) return 'sailboat Mediterranean sea Mallorca'
  if (slug.includes('hotel') || slug.includes('finca')) return 'luxury hotel Mallorca pool terrace'
  if (slug.includes('restaurante') || slug.includes('restaurant') || slug.includes('cenar') || slug.includes('comer')) return 'restaurant Mallorca Mediterranean food'
  if (slug.includes('beach-club')) return 'beach club Mallorca luxury sunbeds sea'
  if (slug.includes('spa') || slug.includes('wellness')) return 'spa wellness Mallorca pool'
  if (slug.includes('tramuntana') || slug.includes('senderismo') || slug.includes('hiking') || slug.includes('norte')) return 'Serra de Tramuntana Mallorca mountains'
  if (slug.includes('sunset') || slug.includes('atardecer')) return 'Mallorca sunset sea golden hour'
  if (slug.includes('wine') || slug.includes('vino')) return 'wine bar Mallorca bodega'
  if (slug.includes('soller') || slug.includes('sóller')) return 'Sóller Mallorca village orange trees'
  if (slug.includes('pollensa') || slug.includes('pollença')) return 'Pollença Mallorca village port'
  if (slug.includes('palma')) return 'Palma de Mallorca old town cathedral'
  if (slug.includes('octubre') || slug.includes('mayo') || slug.includes('temporada')) return 'Mallorca autumn landscape sea'
  if (slug.includes('excursion') || slug.includes('actividad') || slug.includes('activity')) return 'Mallorca outdoor activities adventure'

  return cleaned.length > 4 ? `${cleaned} Mallorca` : 'Mallorca landscape aerial'
}

async function fetchUnsplash(query, pickIndex) {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) {
    console.error('  ✗ UNSPLASH_ACCESS_KEY not set in .env.local')
    return null
  }
  try {
    const params = new URLSearchParams({ query, per_page: '10', orientation: 'landscape', content_filter: 'high' })
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${key}` }
    })
    if (!res.ok) {
      console.error(`  ✗ Unsplash error ${res.status}`)
      return null
    }
    const data = await res.json()
    const results = data.results ?? []
    if (!results.length) return null
    return results[pickIndex % results.length]?.urls?.regular ?? null
  } catch (err) {
    console.error(`  ✗ Unsplash fetch error: ${err.message}`)
    return null
  }
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  if (isDryRun) console.log('DRY RUN — no changes will be saved\n')

  const { data: guides, error } = await supabase
    .from('guides')
    .select('id, slug, locale, title, hero_image_url')
    .eq('source', 'editorial')
    .is('hero_image_url', null)
    .order('slug')

  if (error) throw error
  if (!guides.length) {
    console.log('All guides already have hero images.')
    return
  }

  console.log(`Found ${guides.length} guides without hero images\n`)

  // Process each unique slug once, then apply to all locales of that slug
  const uniqueSlugs = [...new Set(guides.map(g => g.slug))]
  const slugToImage = new Map()
  const usedPhotoIds = new Set()

  for (const slug of uniqueSlugs) {
    const guide = guides.find(g => g.slug === slug)
    const query = buildQuery(slug, guide.title)
    const baseIndex = slugPickIndex(slug)

    process.stdout.write(`[${slug}]\n  query: "${query}" | pick #${baseIndex}\n`)

    if (!isDryRun) {
      // Fetch and pick, skipping already-used photo IDs
      const key = process.env.UNSPLASH_ACCESS_KEY
      if (!key) { console.error('  ✗ UNSPLASH_ACCESS_KEY missing'); continue }

      try {
        const params = new URLSearchParams({ query, per_page: '10', orientation: 'landscape', content_filter: 'high' })
        const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
          headers: { Authorization: `Client-ID ${key}` }
        })
        if (!res.ok) { console.log(`  ✗ Unsplash ${res.status}`); continue }
        const data = await res.json()
        const results = data.results ?? []

        if (!results.length) { console.log('  ✗ No results'); continue }

        let picked = null
        for (let i = 0; i < results.length; i++) {
          const candidate = results[(baseIndex + i) % results.length]
          if (!usedPhotoIds.has(candidate.id)) {
            picked = candidate
            usedPhotoIds.add(candidate.id)
            break
          }
        }
        if (!picked) picked = results[baseIndex % results.length] // fallback

        slugToImage.set(slug, picked.urls.regular)
        console.log(`  ✓ ${picked.urls.regular.slice(0, 72)}...`)
      } catch (err) {
        console.error(`  ✗ Error: ${err.message}`)
      }

      // Unsplash rate limit: 50 req/hour → stay safe with 1.5s delay
      await new Promise(r => setTimeout(r, 1500))
    }
  }

  if (isDryRun) {
    console.log('\nDry run complete. Run without --dry-run to apply changes.')
    return
  }

  // Update all guides
  let updated = 0
  let failed = 0
  for (const guide of guides) {
    const imageUrl = slugToImage.get(guide.slug)
    if (!imageUrl) { failed++; continue }

    const { error: updateErr } = await supabase
      .from('guides')
      .update({ hero_image_url: imageUrl })
      .eq('id', guide.id)

    if (updateErr) {
      console.error(`✗ Failed to update ${guide.id}: ${updateErr.message}`)
      failed++
    } else {
      updated++
    }
  }

  console.log(`\nDone! ${updated} updated, ${failed} failed`)
}

main().catch(console.error)
