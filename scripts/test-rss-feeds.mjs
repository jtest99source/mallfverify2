// Testea múltiples URL candidatas de feeds RSS mallorquines
const candidates = [
  // Última Hora — patterns comunes
  'https://www.ultimahora.es/rss.xml',
  'https://www.ultimahora.es/feed',
  'https://www.ultimahora.es/feed/',
  'https://www.ultimahora.es/rss/noticias.xml',
  'https://www.ultimahora.es/noticias/cultura/rss',
  // Mallorca Diario (WordPress → /feed/)
  'https://www.mallorcadiario.com/feed/',
  'https://www.mallorcadiario.com/rss/',
  // Mallorca Magazine ES
  'https://www.inmallorcamagazine.com/feed/',
  // Mallorca Journal DE
  'https://mallorca-journal.info/feed/',
  'https://mallorca-journal.info/rss/',
  // Mallorca.com
  'https://www.mallorca.com/feed/',
  // Aktivsucher (eventos/actividades)
  'https://www.aktivsucher-mallorca.com/rss',
  'https://www.aktivsucher-mallorca.com/feed/',
  // Mallorca Zeitung (ya funciona — verificar sección cultura)
  'https://www.mallorcazeitung.es/rss/kultur',
  'https://www.mallorcazeitung.es/rss/veranstaltungen',
]

for (const url of candidates) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MallorcaVerified EventRadar/1.0' },
      signal: AbortSignal.timeout(5000),
    })
    const ct = res.headers.get('content-type') || ''
    const isXml = ct.includes('xml') || ct.includes('rss') || ct.includes('atom')
    const body = await res.text()
    const hasItems = body.includes('<item') || body.includes('<entry')
    console.log(`${res.ok ? '✅' : '⚠️'} ${res.status} ${isXml ? '[XML]' : '[HTML]'} ${hasItems ? '[items]' : ''} — ${url}`)
  } catch (err) {
    console.log(`❌ ${err.message.slice(0, 40)} — ${url}`)
  }
}
