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
}

// BLOG_CATALOG — imported from ./editorial-blog-catalog.mjs
// Edit that file to add/remove guides. Do not hardcode the catalog here.

// ─── LOCALE CONFIG ─────────────────────────────────────────────────────────────
const LOCALE_CONFIG = {
  es: {
    name: 'español',
    tone: `Local, cercano, con criterio. Como alguien de Mallorca que recomienda a un amigo.
Natural, directo, sin exageraciones. Menciona detalles concretos: platos, precios si se conocen,
barrios, para qué tipo de persona encaja cada sitio.`,
  },
  en: {
    name: 'English',
    tone: `Practical travel guide voice. Helpful, direct, internationally friendly.
Like a knowledgeable local giving honest advice to a visitor.
Mention specific details: what to order, which neighborhood, what type of traveler it suits.`,
  },
  de: {
    name: 'Deutsch',
    tone: `Informativer Reiseführer-Stil. Detailliert, verlässlich, sachlich aber warm.
Deutsche Touristen schätzen konkrete Informationen: Preise wenn bekannt, genaue Lage, praktische Tipps.
Keine leeren Superlative — lieber spezifische Details.`,
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
      category_attributes, featured_reviews, address
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

// ─── GENERATE ONE GUIDE VIA CLAUDE API + WEB SEARCH ───────────────────────────
async function generateGuide(blogConfig, locale, businesses) {
  const localeConfig = LOCALE_CONFIG[locale]
  const title = blogConfig.titles[locale]
  const intent = blogConfig.intent[locale]
  const businessContext = formatBusinessContext(businesses)
  const businessIds = businesses.map(b => b.id)
  const businessChunks = chunk(businessIds, 4)

  const systemPrompt = `You are an expert local editorial writer for Mallorca Verified, a trusted discovery platform for Mallorca, Spain.

Your job is to write genuinely useful editorial blog guides that:
- Sound like a knowledgeable local, not a marketing brochure
- Are specific, concrete and honest — no vague superlatives
- Reference real details from the businesses provided
- Use web search to find additional real context about specific businesses (their website, reviews, press mentions)
- Are optimized to be cited by AI systems (ChatGPT, Perplexity, Gemini) and rank in Google

Tone for ${localeConfig.name}: ${localeConfig.tone}

CRITICAL RULES:
- Never invent information. Only write what you can verify from the data or web search
- No marketing language: never say "unforgettable experience", "hidden gem", "magical", "stunning"
- Be specific: mention actual dishes, neighborhoods, prices if known, type of clientele
- Write like you are telling a friend, not selling to a tourist
- Each business should feel individual, not templated
- The intro must start with a real local insight, not generic praise of Mallorca
- FAQs must answer what people ACTUALLY ask Google and ChatGPT about this topic
- ALWAYS wrap business names in **double asterisks** when mentioning them in body text (e.g. **Can Gusti**, **Restaurante Es Cruce**) — this renders as bold and makes them visually distinct`

  const userPrompt = `Write a complete editorial blog guide in ${localeConfig.name}.

TITLE: ${title}
TARGET SEARCH QUERIES: ${intent}

BUSINESSES TO FEATURE (pre-filtered by rating and verified reviews):
${businessContext}

STEP 1 — Research:
Use web search to look up 3-4 of the most interesting businesses in this list.
Search for: "[business name] Mallorca reviews" or visit their website if available.
Find specific details: what dishes/services are famous, what makes them stand out, any press mentions.

STEP 2 — Write the guide in this exact JSON format:

{
  "title": "${title}",
  "excerpt": "[1 sentence, SEO-optimized, factual, under 155 characters. Describe what the guide covers — NO self-praise words like 'honesta', 'fiable', 'de confianza', 'definitiva'. Just what's in it.]",
  "intro": "[3-4 sentences. First sentence = real local insight or surprising fact. Set expectations honestly. No generic Mallorca praise. No 'Mallorca is a beautiful island'.]",
  "sections": [
    {
      "heading": "[section heading — thematic, not just 'Top picks']",
      "body": "[2-3 paragraphs. Reference specific businesses by name — always **bold** them like **Can Gusti** — with concrete details from your research. Each paragraph should answer a different question: what it is, why it stands out, who it suits. Natural prose, not a list.]",
      "business_ids": ${JSON.stringify(businessChunks[0] || businessIds.slice(0, 4))}
    },
    {
      "heading": "[second section — different angle: by neighborhood, experience type, or traveler profile]",
      "body": "[2-3 paragraphs. Different perspective from section 1. **Bold** business names like **Mesón Ca'n Pedro**. Practical details welcome: when to go, how to book, what to avoid.]",
      "business_ids": ${JSON.stringify(businessChunks[1] || businessIds.slice(4, 8))}
    }${businessChunks[2] ? `,
    {
      "heading": "[third section — broader context, tips, or niche picks]",
      "body": "[2-3 paragraphs. Can include practical advice, seasonal tips, or lesser-known options.]",
      "business_ids": ${JSON.stringify(businessChunks[2])}
    }` : ''}
  ],
  "faqs": [
    {
      "question": "[real question people search Google/ChatGPT about this topic]",
      "answer": "[direct, useful answer in 2-3 sentences. Factual, no fluff.]"
    },
    {
      "question": "[another real search query as a question]",
      "answer": "[direct answer]"
    },
    {
      "question": "[practical question: booking, pricing, best time, etc.]",
      "answer": "[direct answer]"
    },
    {
      "question": "[question about area, type, or comparison]",
      "answer": "[direct answer]"
    }
  ],
  "seo": {
    "title": "${title} | Mallorca Verified",
    "description": "[Under 155 chars. Include main keyword. Factual and compelling. No clickbait.]"
  }
}

IMPORTANT:
- Return ONLY valid JSON, no markdown code blocks, no explanation text
- All business_ids arrays must use EXACTLY the IDs listed above — do not modify them
- Each section body must mention at least 2-3 businesses from its business_ids by name
- Sections must feel editorially distinct — different angle, different details
- FAQs must be questions people actually search, not generic questions about the guide`

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
    hero_image_url: null,
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

  const locales = localeArg ? [localeArg] : ['es', 'en', 'de']

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

    for (const locale of locales) {
      try {
        const guide = await generateGuide(blogConfig, locale, businesses)
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
