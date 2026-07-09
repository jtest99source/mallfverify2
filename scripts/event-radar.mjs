/**
 * Event Radar — agrega RSS de medios locales mallorquines y filtra eventos
 * Uso: node scripts/event-radar.mjs
 * Output: reports/event-radar-{fecha}.md
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const FEEDS = [
  // Google News RSS — más fiable que feeds individuales, agrega todos los medios
  {
    name: 'Google News — eventos Mallorca (ES)',
    url: 'https://news.google.com/rss/search?q=evento+festival+concierto+Mallorca&hl=es&gl=ES&ceid=ES:es',
    lang: 'es',
  },
  {
    name: 'Google News — events Mallorca (EN)',
    url: 'https://news.google.com/rss/search?q=event+festival+opening+Mallorca&hl=en&gl=ES&ceid=ES:en',
    lang: 'en',
  },
  {
    name: 'Google News — Veranstaltungen Mallorca (DE)',
    url: 'https://news.google.com/rss/search?q=Veranstaltung+Festival+Konzert+Mallorca&hl=de&gl=DE&ceid=DE:de',
    lang: 'de',
  },
  // Mallorca Zeitung — único feed directo que funciona
  {
    name: 'Mallorca Zeitung (DE)',
    url: 'https://www.mallorcazeitung.es/rss',
    lang: 'de',
  },
]

// Keywords que indican un evento (ES/EN/DE)
const EVENT_KEYWORDS = [
  'evento', 'eventos', 'festival', 'festivales', 'concierto', 'conciertos',
  'inauguración', 'feria', 'ferias', 'mercado', 'mercados', 'exposición',
  'fiesta', 'fiestas', 'actuación', 'apertura', 'gala', 'show', 'teatro',
  'espectáculo', 'verbena', 'noche de', 'semana de', 'jornada',
  'event', 'events', 'festival', 'concert', 'opening', 'market', 'fair',
  'exhibition', 'performance', 'party', 'gala', 'show', 'night of',
  'Veranstaltung', 'Konzert', 'Festival', 'Wochenmarkt', 'Ausstellung', 'Eröffnung',
  'Konzertabend', 'Fest', 'Party', 'Gala', 'Messe',
]


function extractText(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>(?:<\\!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i')
  const m = xml.match(re)
  return m ? m[1].trim() : ''
}

function extractRealUrl(block) {
  // Google News wraps the real URL inside the <description> <a href="..."> tag
  const m = block.match(/<description[^>]*>(?:<!\[CDATA\[)?[\s\S]*?<a href="([^"]+)"/)
  if (m) return m[1]
  return extractText(block, 'link')
}

function extractSource(block) {
  const m = block.match(/<source[^>]*>([^<]+)<\/source>/)
  return m ? m[1].trim() : ''
}

function stripHtml(s) {
  // Remove HTML tags; handle very long attributes by removing tag-by-tag
  return s.replace(/<[^>]*>/g, '').replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
}

function parseRSSItems(xml) {
  const items = []
  const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi
  let m
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1]
    const rawDesc = extractText(block, 'description')
    const mediaSource = extractSource(block)
    // Google News encodes description as HTML entities (&lt;a href=...) — skip it
    const trimmed = rawDesc.trimStart()
    const isHtmlContent = trimmed.startsWith('<') || trimmed.startsWith('&lt;')
    const desc = isHtmlContent ? '' : stripHtml(rawDesc)
    let title = stripHtml(extractText(block, 'title'))
    // Google News title format: "Article Title - Source Name" — strip the suffix
    if (mediaSource && title.endsWith(` - ${mediaSource}`)) {
      title = title.slice(0, -(` - ${mediaSource}`.length))
    }
    items.push({
      title,
      link: extractRealUrl(block),
      description: desc,
      pubDate: extractText(block, 'pubDate'),
      mediaSource,
    })
  }
  return items
}

function isEventItem(item) {
  const title = item.title.toLowerCase()
  const desc = item.description.toLowerCase()
  // El título O al menos 2 keywords en descripción deben matchear — reduce falsos positivos
  const titleMatch = EVENT_KEYWORDS.some(kw => title.includes(kw.toLowerCase()))
  if (titleMatch) return true
  const descMatches = EVENT_KEYWORDS.filter(kw => desc.includes(kw.toLowerCase())).length
  return descMatches >= 2
}

const MAX_AGE_DAYS = 60 // máximo 2 meses de antigüedad

function hasRecency(item) {
  if (!item.pubDate) return true
  const pub = new Date(item.pubDate)
  if (isNaN(pub)) return true
  const diffDays = (Date.now() - pub) / (1000 * 60 * 60 * 24)
  return diffDays <= MAX_AGE_DAYS
}

function cleanText(t) {
  return t
    .replace(/<[^>]+>/g, '') // strip HTML tags
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ').trim()
    .slice(0, 200)
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

const results = []
const feedStatus = []

for (const feed of FEEDS) {
  process.stdout.write(`Fetching ${feed.name}... `)
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'MallorcaVerified EventRadar/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const xml = await res.text()
    const items = parseRSSItems(xml)
    const events = items.filter(i => isEventItem(i) && hasRecency(i))
    console.log(`${items.length} items → ${events.length} eventos`)
    feedStatus.push(`✅ ${feed.name}: ${items.length} items, ${events.length} eventos encontrados`)
    for (const e of events) {
      results.push({ ...e, feedName: feed.name, lang: feed.lang })
    }
  } catch (err) {
    console.log(`❌ ${err.message}`)
    feedStatus.push(`❌ ${feed.name}: ${err.message}`)
  }
}

// De-duplicate by title similarity
const seen = new Set()
const unique = results.filter(r => {
  const key = r.title.toLowerCase().slice(0, 60)
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

// Sort by pubDate descending
unique.sort((a, b) => {
  const da = a.pubDate ? new Date(a.pubDate) : new Date(0)
  const db = b.pubDate ? new Date(b.pubDate) : new Date(0)
  return db - da
})

// ─── BUILD REPORT ─────────────────────────────────────────────────────────────

const date = new Date().toISOString().slice(0, 10)
const lines = [
  `# Event Radar — ${date}`,
  '',
  '## Estado de feeds',
  ...feedStatus.map(s => `- ${s}`),
  '',
  `## Eventos encontrados (${unique.length})`,
  '',
]

if (unique.length === 0) {
  lines.push('_No se encontraron eventos. Revisa que los feeds estén activos._')
} else {
  for (const e of unique) {
    const pub = e.pubDate ? new Date(e.pubDate).toLocaleDateString('es-ES') : '—'
    const medio = e.mediaSource || e.feedName
    const desc = e.description ? e.description.slice(0, 200) : ''
    lines.push(`### ${e.title}`)
    lines.push(`- **Medio:** ${medio} | **Fecha:** ${pub} | **Idioma:** ${e.lang.toUpperCase()}`)
    if (desc) lines.push(`- **Extracto:** ${desc}`)
    if (e.link) lines.push(`- **Link:** ${e.link}`)
    lines.push('')
  }
}

lines.push('---')
lines.push('_Generado por scripts/event-radar.mjs — ejecutar semanalmente_')

const outDir = 'reports'
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, `event-radar-${date}.md`)
writeFileSync(outPath, lines.join('\n'), 'utf8')

console.log(`\n📋 Reporte guardado en ${outPath}`)
console.log(`   ${unique.length} eventos únicos encontrados`)
