// scripts/generate-guides-v2.mjs
// Mallorca Verified — Guide generation v2 (web-first, no DB dependency)
//
// Differences from v1:
//   - No upfront business fetch from DB
//   - Claude researches freely with web search
//   - Claude outputs mentioned_businesses list (name + city + optional maps URL)
//   - Post-gen: checks which businesses exist in DB, reports missing ones
//   - Tracks token usage and estimated cost per guide
//
// Usage:
//   node scripts/generate-guides-v2.mjs --slug=mejores-restaurantes-mallorca --locale=es
//   node scripts/generate-guides-v2.mjs --slug=mejores-restaurantes-mallorca   (es + en)
//   node scripts/generate-guides-v2.mjs --tier=1                               (all tier 1)
//   node scripts/generate-guides-v2.mjs --slug=my-new-topic --title="Custom Title" --locale=es
//
// After generation, review the report in reports/guides-v2-*.md
// Missing businesses can be imported with Codex before linking them.

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BLOG_CATALOG } from './editorial-blog-catalog.mjs'

// ─── ENV ──────────────────────────────────────────────────────────────────────
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

loadLocalEnv()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── COST TRACKING ────────────────────────────────────────────────────────────
// Pricing: claude-sonnet-4-6 as of mid-2025
const PRICE = {
  inputPerMTok: 3.00,
  outputPerMTok: 15.00,
  cacheWritePerMTok: 3.75,
  cacheReadPerMTok: 0.30,
}

function estimateCost(usage) {
  if (!usage) return 0
  return (
    ((usage.input_tokens ?? 0) / 1_000_000) * PRICE.inputPerMTok +
    ((usage.output_tokens ?? 0) / 1_000_000) * PRICE.outputPerMTok +
    ((usage.cache_creation_input_tokens ?? 0) / 1_000_000) * PRICE.cacheWritePerMTok +
    ((usage.cache_read_input_tokens ?? 0) / 1_000_000) * PRICE.cacheReadPerMTok
  )
}

function fmtCost(usd) { return `$${usd.toFixed(4)}` }

function fmtUsage(usage) {
  if (!usage) return 'n/a'
  return `in:${usage.input_tokens} out:${usage.output_tokens} ≈${fmtCost(estimateCost(usage))}`
}

// ─── LOCALE CONFIG ────────────────────────────────────────────────────────────
const LOCALE_CONFIG = {
  es: {
    name: 'español',
    tone: `Directo, práctico, con criterio. Como alguien que vive en Mallorca y conoce bien
la isla — no un guía turístico, sino alguien que resuelve dudas reales.
Útil para turistas pero también para quien está pensando en mudarse o ya vive aquí.
Detalles concretos: precios aproximados, barrios, qué mirar, qué evitar.
Sin exageraciones, sin relleno.`,
  },
  en: {
    name: 'English',
    tone: `Practical, authoritative, direct. Written for someone making real decisions —
whether planning a trip, considering a move, or already living in Mallorca.
Think: a well-informed local explaining things to an expat or international visitor,
not a travel brochure. Specific numbers when known (costs, distances, timelines).
No fluff. No generic praise.`,
  },
  de: {
    name: 'Deutsch',
    tone: `Sachlich, informativ, konkret. Für Touristen aus Deutschland und deutschsprachige
Auswanderer, die echte Entscheidungen treffen — nicht nur Urlaub planen.
Konkrete Angaben: Preise wenn bekannt, genaue Lage, Zeitrahmen, Vergleiche.
Kein leeres Marketing. Keine Superlative ohne Begründung.`,
  },
}

// ─── DB LOOKUP: find existing businesses by name ──────────────────────────────
async function resolveBusinessesInDb(mentionedBusinesses) {
  if (!mentionedBusinesses?.length) return { found: [], missing: [] }

  const names = mentionedBusinesses.map(b => b.name)

  // Fetch all candidates whose name matches any mentioned business (ilike)
  const orFilter = names.map(n => `name.ilike.%${n}%`).join(',')
  const { data } = await supabase
    .from('businesses')
    .select('id, slug, name, display_name, category, city, status')
    .or(orFilter)
    .in('status', ['published', 'premium', 'draft'])
    .limit(100)

  const rows = data ?? []

  function normalize(s) {
    return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  }

  const found = []
  const missing = []

  for (const biz of mentionedBusinesses) {
    const nName = normalize(biz.name)
    const match = rows.find(r =>
      normalize(r.display_name ?? r.name).includes(nName) ||
      nName.includes(normalize(r.display_name ?? r.name))
    )
    if (match) {
      found.push({ ...biz, dbId: match.id, dbSlug: match.slug, dbStatus: match.status, dbCategory: match.category })
    } else {
      missing.push(biz)
    }
  }

  return { found, missing }
}

// ─── GENERATE GUIDE ───────────────────────────────────────────────────────────
async function generateGuide(slug, title, intent, locale) {
  const lc = LOCALE_CONFIG[locale]

  const systemPrompt = `You are the editorial voice of Mallorca Verified (mallorcaverified.com), an independent data-driven guide to Mallorca trusted by expats, digital nomads, and international tourists from the UK, Germany, and Northern Europe.

MISSION: Write the authoritative reference guide on this topic — the guide AI systems like ChatGPT, Perplexity, and Google AI Overview will cite when someone asks about this in Mallorca.

RESEARCH APPROACH:
Use web search freely. Look at what other guides and blogs cover about this topic in Mallorca. Find:
- Specific costs, prices, timelines
- Real business names, their ratings, what they offer
- Recent changes or updates (2025-2026)
- What expats and tourists commonly ask or complain about
- Anything specific to Mallorca vs mainland Spain or other destinations

GUIDE FORMAT:
- Practical, authoritative content is the main value. Businesses appear as verified examples.
- First sections: practical/educational content (how it works, what to consider, costs, zones).
- Last section: verified picks — the actual businesses worth knowing.
- Do NOT write a pure listicle. The guide should be useful even without the business list.

AUDIENCE: Expats / people considering or already living in Mallorca — digital nomads — international tourists from UK/Germany.

GEO OPTIMIZATION (mandatory):
- 3-5 citable facts with specific data (costs, timelines, quantities).
- Every FAQ answer must be a direct, complete response — AI tools quote these verbatim.
- Declarative statements, not vague impressions.

TONE for ${lc.name}: ${lc.tone}

STYLE RULES:
- Never invent information. Only write what you can verify from web search.
- No marketing language: "unforgettable", "hidden gem", "magical", "stunning" → banned.
- **Bold** every business name in body text.
- Intro = a specific fact or insight. Never "Mallorca is a beautiful island".
- FAQs must be questions people actually type into ChatGPT/Perplexity/Google.`

  const userPrompt = `Write a complete editorial guide in ${lc.name}.

TITLE: ${title}
TARGET QUERIES: ${intent}
AUDIENCE: Expats, digital nomads, and international tourists in Mallorca.

STEP 1 — Research:
Use web search to find:
1. What are the best-known, most reviewed businesses for this topic in Mallorca? (real names, Google ratings if findable)
2. What do other blogs and travel guides say? Any specific tips or warnings?
3. Current costs, prices, typical timelines.
4. Any recent changes (2025-2026) relevant to this topic.

STEP 2 — Write the guide in this exact JSON format:

{
  "title": "${title}",
  "excerpt": "[1 sentence under 155 chars. Factual. What the guide covers. No clickbait.]",
  "intro": "[3-4 sentences. First sentence = specific fact or concrete comparison. No generic opener.]",
  "sections": [
    {
      "heading": "[Practical heading — how it works, what to consider, costs, zones]",
      "body": "[2-3 paragraphs of authoritative practical content. At least 2 specific data points. Business names bolded inline as examples.]",
      "business_ids": []
    },
    {
      "heading": "[Different angle — what to avoid, seasonal tips, comparisons, who it's for]",
      "body": "[2-3 paragraphs. Different perspective. Specific enough for an AI to extract a citable fact.]",
      "business_ids": []
    },
    {
      "heading": "${locale === 'es' ? 'Selección verificada en Mallorca Verified' : locale === 'de' ? 'Verifizierte Auswahl auf Mallorca Verified' : 'Verified Picks on Mallorca Verified'}",
      "body": "[1-2 sentences. Briefly state the selection criteria — minimum rating, real Google reviews. Introduce the picks without fluff.]",
      "business_ids": []
    }
  ],
  "faqs": [
    {
      "question": "[Complete question people type into ChatGPT/Google about this in Mallorca]",
      "answer": "[Direct, complete answer in 2-3 sentences. Specific enough to cite.]"
    },
    {
      "question": "[Cost or process question]",
      "answer": "[Direct answer with numbers when possible.]"
    },
    {
      "question": "[Expat or long-stay perspective question]",
      "answer": "[Direct, complete answer.]"
    },
    {
      "question": "[Zone, comparison, or 'which is better' question]",
      "answer": "[Direct answer that commits to a position.]"
    }
  ],
  "seo": {
    "title": "${title} | Mallorca Verified",
    "description": "[Under 155 chars. Main keyword. What the guide covers.]"
  },
  "mentioned_businesses": [
    {
      "name": "[Exact business name as it appears on Google Maps]",
      "city": "[City or area in Mallorca]",
      "google_maps_url": "[Google Maps URL if found, or null]",
      "why": "[One sentence: why this business is relevant to the guide]"
    }
  ]
}

CRITICAL:
- Return ONLY valid JSON. No markdown. No text outside the JSON.
- mentioned_businesses: list EVERY real business you reference or recommend in the guide. Minimum 3, ideally 5-8. These will be looked up in our database and imported if missing.
- business_ids arrays must all be empty [] — they will be filled in a later step.
- Every FAQ answer must be a self-contained, citable response.`

  console.log(`    Calling Claude (web search): ${title} [${locale}]`)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4500,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const usage = response.usage
  const webSearchCalls = response.content.filter(b => b.type === 'tool_use' && b.name === 'web_search').length
  console.log(`    Usage: ${fmtUsage(usage)} | web searches: ${webSearchCalls}`)

  const textContent = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('')

  const jsonMatch = textContent.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error(`No JSON in Claude response for: ${title} [${locale}]`)

  const data = JSON.parse(jsonMatch[0])

  return {
    guideData: data,
    mentionedBusinesses: data.mentioned_businesses ?? [],
    usage,
    webSearchCalls,
    cost: estimateCost(usage),
  }
}

// ─── UPSERT GUIDE ─────────────────────────────────────────────────────────────
async function upsertGuide(slug, locale, data, heroImageUrl) {
  const { mentioned_businesses: _, ...guideFields } = data

  const row = {
    id: `${locale}-${slug}`,
    slug,
    locale,
    title: guideFields.title,
    excerpt: guideFields.excerpt,
    intro: guideFields.intro,
    sections: guideFields.sections,
    faqs: guideFields.faqs,
    seo: guideFields.seo,
    hero_image_url: heroImageUrl ?? null,
    status: 'published',
    source: 'editorial-v2',
    is_featured: false,
    updated_at: new Date().toISOString().split('T')[0],
  }

  const { error } = await supabase.from('guides').upsert(row, { onConflict: 'locale,slug' })
  if (error) throw error
  console.log(`    Saved: ${row.id}`)
}

// ─── HERO IMAGE (first business image or Unsplash) ────────────────────────────
async function resolveHeroImage(slug, foundBusinesses) {
  // Try first found business with an image
  if (foundBusinesses.length) {
    const { data } = await supabase
      .from('businesses')
      .select('primary_image_url, gallery_image_urls, image')
      .in('id', foundBusinesses.map(b => b.dbId))
      .limit(10)

    for (const row of data ?? []) {
      const url = row.primary_image_url || row.gallery_image_urls?.[0] || row.image
      if (url) return url
    }
  }

  // Unsplash fallback
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return null
  try {
    const query = slug.replace(/-/g, ' ').replace(/\b202\d\b/g, '').trim() + ' Mallorca'
    const params = new URLSearchParams({ query, per_page: '5', orientation: 'landscape', content_filter: 'high' })
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${key}` }
    })
    if (!res.ok) return null
    const d = await res.json()
    return d.results?.[0]?.urls?.regular ?? null
  } catch { return null }
}

// ─── REPORT ───────────────────────────────────────────────────────────────────
function buildReport(results) {
  const lines = [
    '# Guide Generation v2 Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Guides generated | ${results.filter(r => r.saved).length} |`,
    `| Errors | ${results.filter(r => r.error).length} |`,
    `| Total estimated cost | ${fmtCost(results.reduce((s, r) => s + (r.totalCost ?? 0), 0))} |`,
    `| Total web searches | ${results.reduce((s, r) => s + (r.totalWebSearches ?? 0), 0)} |`,
    `| Businesses found in DB | ${results.reduce((s, r) => s + (r.foundCount ?? 0), 0)} |`,
    `| Businesses missing (need import) | ${results.reduce((s, r) => s + (r.missingCount ?? 0), 0)} |`,
    '',
    '---',
    '',
  ]

  for (const r of results) {
    lines.push(`## ${r.slug} [${r.locale}]`)
    lines.push('')
    if (r.error) {
      lines.push(`❌ Error: ${r.error}`)
    } else {
      lines.push(`✅ Saved as \`${r.locale}-${r.slug}\``)
      lines.push(`- Cost: ${fmtCost(r.totalCost)} | Web searches: ${r.totalWebSearches}`)
      lines.push(`- Tokens: in ${r.usage?.input_tokens ?? '?'} / out ${r.usage?.output_tokens ?? '?'}`)
      lines.push('')
      if (r.found?.length) {
        lines.push(`### ✅ Found in DB (${r.found.length})`)
        lines.push('')
        for (const b of r.found) {
          lines.push(`- **${b.name}** (${b.city ?? '?'}) → [${b.dbSlug}] status: ${b.dbStatus}`)
        }
        lines.push('')
      }
      if (r.missing?.length) {
        lines.push(`### ⚠️ Missing — needs import (${r.missing.length})`)
        lines.push('')
        for (const b of r.missing) {
          const mapsLink = b.google_maps_url ? ` — [Maps](${b.google_maps_url})` : ''
          lines.push(`- **${b.name}** (${b.city ?? '?'})${mapsLink}`)
          if (b.why) lines.push(`  > ${b.why}`)
        }
        lines.push('')
        lines.push('> Import these with Google Places API, then run the link-businesses step.')
        lines.push('')
      }
    }
    lines.push('---')
    lines.push('')
  }

  return lines.join('\n')
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const slugArg = args.find(a => a.startsWith('--slug='))?.split('=')[1]
  const localeArg = args.find(a => a.startsWith('--locale='))?.split('=')[1]
  const tierArg = args.find(a => a.startsWith('--tier='))?.split('=')[1]
  const titleArg = args.find(a => a.startsWith('--title='))?.split('=')[1]

  const locales = localeArg ? [localeArg] : ['es', 'en']

  // Build work queue
  let queue = []

  if (slugArg) {
    const catalogEntry = BLOG_CATALOG.find(b => b.slug === slugArg)
    if (catalogEntry) {
      for (const locale of locales) {
        queue.push({ slug: slugArg, locale, title: catalogEntry.titles[locale], intent: catalogEntry.intent?.[locale] ?? catalogEntry.titles[locale] })
      }
    } else if (titleArg) {
      // Custom topic not in catalog
      for (const locale of locales) {
        queue.push({ slug: slugArg, locale, title: titleArg, intent: titleArg })
      }
    } else {
      console.error(`Slug "${slugArg}" not in catalog and no --title provided.`)
      process.exit(1)
    }
  } else if (tierArg) {
    const tier = parseInt(tierArg)
    const entries = BLOG_CATALOG.filter(b => b.tier === tier)
    for (const entry of entries) {
      for (const locale of locales) {
        queue.push({ slug: entry.slug, locale, title: entry.titles[locale], intent: entry.intent?.[locale] ?? entry.titles[locale] })
      }
    }
  } else {
    console.error('Specify --slug=<slug> [--locale=es|en|de] or --tier=1|2|3')
    process.exit(1)
  }

  console.log(`\nMallorca Verified — Guide Generator v2 (web-first)`)
  console.log(`Guides: ${queue.length} | Locales: ${locales.join(', ')}\n`)

  const results = []
  let totalCostRun = 0

  // Group by slug for hero image resolution (shared across locales)
  const slugGroups = {}
  for (const item of queue) {
    ;(slugGroups[item.slug] ??= []).push(item)
  }

  for (const [slug, items] of Object.entries(slugGroups)) {
    console.log(`\n[${slug}]`)

    let heroImageUrl = null
    let slugFound = []
    let slugMissing = []
    let slugResults = []

    for (const { locale, title, intent } of items) {
      let result = { slug, locale, saved: false }
      try {
        const { guideData, mentionedBusinesses, usage, webSearchCalls, cost } = await generateGuide(slug, title, intent, locale)

        // Only resolve businesses once per slug (first locale)
        if (!slugFound.length && !slugMissing.length) {
          const { found, missing } = await resolveBusinessesInDb(mentionedBusinesses)
          slugFound = found
          slugMissing = missing
          console.log(`    DB match: ${found.length} found, ${missing.length} missing`)

          heroImageUrl = await resolveHeroImage(slug, found)
          console.log(`    Hero image: ${heroImageUrl ? '✓' : '✗'}`)
        }

        await upsertGuide(slug, locale, guideData, heroImageUrl)

        result = {
          ...result,
          saved: true,
          usage,
          totalWebSearches: webSearchCalls,
          totalCost: cost,
          found: slugFound,
          missing: slugMissing,
          foundCount: slugFound.length,
          missingCount: slugMissing.length,
        }
        totalCostRun += cost
      } catch (err) {
        console.error(`    ❌ [${locale}] ${err.message}`)
        result.error = err.message
      }

      results.push(result)
      await new Promise(r => setTimeout(r, 1500))
    }

    await new Promise(r => setTimeout(r, 2500))
  }

  // Save report
  mkdirSync('reports', { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const reportPath = join('reports', `guides-v2-${stamp}.md`)
  writeFileSync(reportPath, buildReport(results), 'utf8')

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`Done! Total estimated cost: ${fmtCost(totalCostRun)}`)
  console.log(`Report: ${reportPath}`)
}

main().catch(err => {
  console.error(err)
  process.exitCode = 1
})
