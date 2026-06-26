// scripts/generate-editorial-guides.mjs
// Mallorca Verified — Blog editorial generation pipeline
// Uses Claude API with web search to write real editorial content
//
// Usage:
//   node scripts/generate-editorial-guides.mjs                          — all blogs, all locales
//   node scripts/generate-editorial-guides.mjs --tier=1                 — Tier 1 only
//   node scripts/generate-editorial-guides.mjs --tier=2                 — Tier 2 only
//   node scripts/generate-editorial-guides.mjs --tier=3                 — Tier 3 only
//   node scripts/generate-editorial-guides.mjs --slug=mejores-restaurantes-palma --locale=es
//
// Add to package.json scripts:
//   "guides:generate-editorial": "node scripts/generate-editorial-guides.mjs",
//   "guides:generate-editorial:tier1": "node scripts/generate-editorial-guides.mjs --tier=1",
//   "guides:generate-editorial:tier2": "node scripts/generate-editorial-guides.mjs --tier=2",
//   "guides:generate-editorial:tier3": "node scripts/generate-editorial-guides.mjs --tier=3"

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import { BLOG_CATALOG } from './editorial-blog-catalog.mjs'

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

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─── CATEGORY → URL SLUG MAP ──────────────────────────────────────────────────
const CATEGORY_SLUGS = {
  'restaurant': 'restaurants',
  'hotel': 'hotels',
  'bar': 'bars',
  'cafe': 'cafes',
  'beach-club': 'beach-clubs',
  'boat-rental': 'boats',
  'activity': 'activities',
  'beach': 'beaches',
  'spa': 'spas',
  'gym': 'gyms',
  'rent-a-car': 'rent-a-car',
  'bakery': 'bakeries',
  'route': 'routes',
  'excursion': 'excursions',
  'nightlife': 'nightlife',
  'car-dealer': 'car-dealers',
  'healthcare': 'healthcare',
  'real-estate': 'real-estate',
}

// BLOG_CATALOG — imported from ./editorial-blog-catalog.mjs
// Edit that file to add/remove guides. Do not hardcode the catalog here.

// ─── LOCALE CONFIG ─────────────────────────────────────────────────────────────
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

// ─── FETCH BUSINESSES FROM SUPABASE ───────────────────────────────────────────
async function fetchBusinesses(blogConfig) {
  const { category, city, multiCities, minRating, minReviews, limit, multiCategories } = blogConfig

  if (!limit) return []

  let query = supabase
    .from('businesses')
    .select(`
      id, slug, name, category, city, area, rating, reviews_count,
      authority_score, website, review_pros, review_themes,
      category_attributes, featured_reviews, address, primary_image_url
    `)
    .eq('status', 'published')
    .gte('rating', minRating)
    .gte('reviews_count', minReviews)
    .order('authority_score', { ascending: false })

  if (multiCategories) {
    query = query.in('category', multiCategories)
  } else if (category) {
    query = query.eq('category', category)
  }

  if (multiCities) {
    const filters = multiCities.flatMap(c => [`city.eq.${c}`, `area.eq.${c}`]).join(',')
    query = query.or(filters)
  } else if (city) {
    query = query.or(`city.eq.${city},area.eq.${city}`)
  }

  query = query.limit(limit * 3)

  const { data, error } = await query
  if (error) throw error

  return (data || []).slice(0, limit)
}

// ─── FORMAT BUSINESS CONTEXT FOR AI PROMPT ────────────────────────────────────
function formatBusinessContext(businesses) {
  return businesses.map((b, i) => {
    const pros = b.review_pros?.join(' / ') || null
    const themes = b.review_themes?.map(t => t.label).join(', ') || null
    const attrs = b.category_attributes?.data || null
    const location = b.city || b.area || 'Mallorca'

    const lines = [
      `${i + 1}. ${b.name}`,
      `   Categoría: ${b.category} | Ubicación: ${location}`,
      `   Rating: ${b.rating} estrellas (${b.reviews_count} reseñas Google)`,
      `   ID Supabase: ${b.id}`,
      `   Slug: ${b.slug}`,
      b.website ? `   Web: ${b.website}` : null,
      pros ? `   Lo que más gusta en reseñas: ${pros}` : null,
      themes ? `   Temas frecuentes: ${themes}` : null,
      attrs?.cuisine_types?.length ? `   Cocina: ${attrs.cuisine_types.join(', ')}` : null,
      attrs?.atmosphere_tags?.length ? `   Ambiente: ${attrs.atmosphere_tags.join(', ')}` : null,
      attrs?.best_for?.length ? `   Ideal para: ${attrs.best_for.join(', ')}` : null,
      attrs?.signature_items?.length ? `   Destacado: ${attrs.signature_items.join(', ')}` : null,
      attrs?.price_signal ? `   Precio: ${attrs.price_signal}` : null,
    ].filter(Boolean)

    return lines.join('\n')
  }).join('\n\n')
}

// ─── SPLIT ARRAY INTO CHUNKS ───────────────────────────────────────────────────
function chunk(arr, size) {
  return arr.reduce((acc, _, i) =>
    i % size === 0 ? [...acc, arr.slice(i, i + size)] : acc, [])
}

// ─── HERO IMAGE RESOLUTION ────────────────────────────────────────────────────
function slugPickIndex(slug) {
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 10
}

async function searchUnsplash(query, pickIndex = 0) {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return null
  try {
    const params = new URLSearchParams({ query, per_page: '10', orientation: 'landscape', content_filter: 'high' })
    const res = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${key}` }
    })
    if (!res.ok) return null
    const data = await res.json()
    const results = data.results ?? []
    if (!results.length) return null
    return results[pickIndex % results.length]?.urls?.regular ?? null
  } catch {
    return null
  }
}

function unsplashQueryForGuide(blogConfig) {
  const title = blogConfig.titles.es
  const cleaned = title
    .replace(/\b202\d\b/g, '')
    .replace(/—.*/g, '')
    .replace(/guía (completa|práctica)|los mejores|mejores|mejor|(en|de|para|desde) mallorca|mallorca/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.length > 6 ? `${cleaned} Mallorca` : 'Mallorca landscape'
}

async function resolveHeroImage(blogConfig, businesses) {
  for (const b of businesses) {
    if (b.primary_image_url) return b.primary_image_url
  }
  const query = unsplashQueryForGuide(blogConfig)
  const pickIndex = slugPickIndex(blogConfig.slug)
  console.log(`  Unsplash query: "${query}" (pick #${pickIndex})`)
  return searchUnsplash(query, pickIndex)
}

// ─── GENERATE ONE GUIDE VIA CLAUDE API + WEB SEARCH ───────────────────────────
async function generateGuide(blogConfig, locale, businesses, heroImageUrl) {
  const localeConfig = LOCALE_CONFIG[locale]
  const title = blogConfig.titles[locale]
  const intent = blogConfig.intent[locale]
  const businessContext = formatBusinessContext(businesses)
  const businessIds = businesses.map(b => b.id)
  const businessChunks = chunk(businessIds, 4)

  const systemPrompt = `You are the editorial voice of Mallorca Verified (mallorcaverified.com), an independent data-driven guide to Mallorca trusted by expats, digital nomads, and international tourists from the UK, Germany, and Northern Europe.

MISSION: Write the authoritative reference guide on this topic — the guide AI systems like ChatGPT, Perplexity, and Google AI Overview will cite when someone asks about this in Mallorca. Not a listicle. Not a marketing brochure. The guide a knowledgeable local would hand you.

GUIDE FORMAT — PRACTICAL FIRST:
The content is the guide. Businesses are the proof, not the content.
- A guide about renting a car should explain the process, what to check, typical costs, what to avoid — then reference specific rental companies as verified examples.
- A guide about restaurants should start from how to choose, what the zone means, how to navigate the options — then feature specific picks.
- The final section presents our verified picks from the Mallorca Verified directory. It does NOT drive the rest of the guide.

AUDIENCE: Write for THREE profiles simultaneously:
1. Expats / people considering or already living in Mallorca — practical logistics, what matters long-term, what's different from their home country
2. Digital nomads — infrastructure, daily practicalities, cost and flexibility
3. International tourists from UK/Germany — concrete planning, not inspiration

GEO OPTIMIZATION — mandatory in every guide:
- Include 3-5 citable facts with specific data (costs, timelines, quantities, comparisons). These are what AI systems extract and cite.
- Every FAQ answer must be a direct, complete response — AI tools quote these verbatim.
- No hedging without specifics. "It depends on X and Y" is fine. "It depends" alone is never acceptable.
- Write declarative statements, not vague impressions.

TONE for ${localeConfig.name}: ${localeConfig.tone}

STYLE RULES:
- Never invent information. Only write what you can verify from the data or web search.
- No marketing language: "unforgettable", "hidden gem", "magical", "stunning", "paradise" → banned
- **Bold** every business name in body text: **Can Gusti**, **Wiber Rent a Car**
- Intro = a real local insight or specific fact. Never "Mallorca is a beautiful island" or similar.
- FAQs must be questions people actually type into ChatGPT/Perplexity/Google — complete sentence questions with complete answers`

  const hasBusinesses = businesses.length > 0
  const verifiedPicksHeading = locale === 'es'
    ? 'Selección verificada en Mallorca Verified'
    : locale === 'de'
    ? 'Verifizierte Auswahl auf Mallorca Verified'
    : 'Verified Picks on Mallorca Verified'

  const verifiedPicksSection = hasBusinesses ? `,
    {
      "heading": "${verifiedPicksHeading}",
      "body": "[1-2 sentences. State the selection criteria briefly: minimum rating, review count, verified via real Google data. No fluff. This introduces the business cards below.]",
      "business_ids": ${JSON.stringify(businessIds)}
    }` : ''

  const businessResearchStep = hasBusinesses ? `
STEP 1 — Research:
Use web search to look up 2-3 of the most notable businesses or relevant recent data about this topic.
Look for: specific costs, recent changes, process details, what expats/visitors commonly report.
` : `
STEP 1 — Research:
Use web search to find recent, specific information about this topic in Mallorca.
Look for: official sources, specific costs, processes, timelines, common experiences reported by expats or tourists.
`

  const userPrompt = `Write a complete editorial guide in ${localeConfig.name}.

TITLE: ${title}
TARGET QUERIES (what people type into Google/ChatGPT/Perplexity): ${intent}
AUDIENCE: Expats, digital nomads, and international tourists (UK/Germany) dealing with or planning for this in Mallorca.

${hasBusinesses ? `VERIFIED BUSINESSES (pre-filtered by rating and reviews — use as concrete examples):
${businessContext}` : '(No businesses to feature — write a pure informational guide based on web research.)'}
${businessResearchStep}
STEP 2 — Write the guide in this exact JSON format:

FORMAT RULES:
- The guide is INFORMATIONAL FIRST. Practical content is the main value. Businesses appear as examples.
- The first two sections are practical/authoritative content. Businesses may be mentioned in passing (**bolded**) but are not the subject.
- The last section (if businesses exist) presents the verified picks — brief intro, then business cards.
- If no businesses, write 3 informational sections.

{
  "title": "${title}",
  "excerpt": "[1 sentence under 155 chars. Factual. What the guide actually covers. No 'honest', 'trusted', 'definitive', 'complete'. Just describe what's in it.]",
  "intro": "[3-4 sentences. First sentence = a specific fact, cost, rule, or comparison — something concrete. Set expectations for the reader. No 'Mallorca is a beautiful island' or equivalent.]",
  "sections": [
    {
      "heading": "[Practical heading: what to know, how it works, what to check — never 'Top picks' or 'Our recommendations']",
      "body": "[2-3 paragraphs of authoritative practical content. Include at least 2 specific data points (costs, timelines, conditions, comparisons). Businesses may appear as inline examples (**bolded**) but the paragraph is about the topic, not the business. Write for someone making a real decision.]",
      "business_ids": []
    },
    {
      "heading": "[Different practical angle — zones, profiles, common mistakes, what to avoid, seasonal factors, or comparisons]",
      "body": "[2-3 paragraphs. Different perspective from section 1. More specific, actionable content. Concrete enough that an AI system could extract and cite a specific fact from each paragraph.]",
      "business_ids": []
    }${verifiedPicksSection}
  ],
  "faqs": [
    {
      "question": "[Complete question people actually type into ChatGPT or Google about this topic in Mallorca]",
      "answer": "[Direct, complete answer in 2-3 sentences. Specific enough to cite. If cost: give a range. If process: give the steps. Never end without resolving the question.]"
    },
    {
      "question": "[Practical question: cost, process, timing, or requirement]",
      "answer": "[Direct answer with specific data. Numbers when possible.]"
    },
    {
      "question": "[Question from expat or nomad perspective — something they'd ask before moving or during a long stay]",
      "answer": "[Direct, complete answer]"
    },
    {
      "question": "[Zone, comparison, or 'which is better' type question]",
      "answer": "[Direct answer that commits to a position rather than hedging]"
    }
  ],
  "seo": {
    "title": "${title} | Mallorca Verified",
    "description": "[Under 155 chars. Main keyword. What the guide covers. No clickbait or self-praise.]"
  }
}

CRITICAL:
- Return ONLY valid JSON. No markdown code blocks. No text outside the JSON.
- business_ids in the verified picks section must use EXACTLY the IDs listed in VERIFIED BUSINESSES — do not change them
- The first two sections MUST have "business_ids": [] (empty arrays)
- Every FAQ answer must be a complete, self-contained response — these get cited verbatim by AI tools
- Do not add a fourth section`

  console.log(`    Calling Claude API with web search: ${title} [${locale}]`)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const textContent = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')

  const jsonMatch = textContent.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`No JSON found in Claude response for: ${title} [${locale}]`)
  }

  const guideData = JSON.parse(jsonMatch[0])

  return {
    id: `${locale}-${blogConfig.slug}`,
    slug: blogConfig.slug,
    locale,
    title: guideData.title,
    excerpt: guideData.excerpt,
    intro: guideData.intro,
    sections: guideData.sections,
    faqs: guideData.faqs,
    seo: guideData.seo,
    hero_image_url: heroImageUrl ?? null,
    status: 'published',
    source: 'editorial',
    is_featured: blogConfig.tier === 1,
    updated_at: new Date().toISOString().split('T')[0],
  }
}

// ─── UPSERT GUIDE TO SUPABASE ──────────────────────────────────────────────────
async function upsertGuide(guide) {
  const { error } = await supabase
    .from('guides')
    .upsert(guide, { onConflict: 'locale,slug' })

  if (error) throw error
  console.log(`    Saved: ${guide.id}`)
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2)
  const tierArg = args.find(a => a.startsWith('--tier='))?.split('=')[1]
  const slugArg = args.find(a => a.startsWith('--slug='))?.split('=')[1]
  const localeArg = args.find(a => a.startsWith('--locale='))?.split('=')[1]

  const locales = localeArg ? [localeArg] : ['es', 'en']

  let catalog = BLOG_CATALOG
  if (tierArg) catalog = catalog.filter(b => b.tier === parseInt(tierArg))
  if (slugArg) catalog = catalog.filter(b => b.slug === slugArg)

  const total = catalog.length * locales.length
  console.log(`\nMallorca Verified — Editorial Blog Generator`)
  console.log(`Blogs: ${catalog.length} | Locales: ${locales.join(', ')} | Total guides: ${total}\n`)

  let successCount = 0
  let errorCount = 0

  for (const blogConfig of catalog) {
    console.log(`\n[Tier ${blogConfig.tier}] ${blogConfig.slug}`)

    let businesses
    try {
      businesses = await fetchBusinesses(blogConfig)
      console.log(`  ${businesses.length} businesses fetched`)

      const minBiz = blogConfig.minBusinesses ?? 3
      if (businesses.length < minBiz) {
        console.log(`  Skipping — not enough businesses (need ${minBiz}, got ${businesses.length})`)
        continue
      }
    } catch (err) {
      console.error(`  Error fetching businesses: ${err.message}`)
      errorCount++
      continue
    }

    const heroImageUrl = await resolveHeroImage(blogConfig, businesses)
    console.log(`  Hero image: ${heroImageUrl ? '✓' : '✗ none'}`)

    for (const locale of locales) {
      try {
        const guide = await generateGuide(blogConfig, locale, businesses, heroImageUrl)
        await upsertGuide(guide)
        successCount++
        await new Promise(r => setTimeout(r, 2000))
      } catch (err) {
        console.error(`  Error [${locale}]: ${err.message}`)
        errorCount++
      }
    }

    await new Promise(r => setTimeout(r, 3000))
  }

  console.log(`\nDone!`)
  console.log(`  ${successCount} guides generated successfully`)
  console.log(`  ${errorCount} errors`)
}

main().catch(console.error)
