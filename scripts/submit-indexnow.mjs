// scripts/submit-indexnow.mjs
// Submits all site URLs to IndexNow (Bing, Yandex, etc.)
// URL source: the live sitemap.xml, so submissions always match what we
// actually advertise (previous version built URLs by hand and drifted:
// wrong business category slugs, missing DE guides).
// Usage: node scripts/submit-indexnow.mjs

const INDEXNOW_KEY = '23af42b5d954480b9e13878f5a908988'
const SITE_URL = 'https://www.mallorcaverified.com'

async function getSitemapUrls() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`)
  if (!res.ok) throw new Error(`sitemap.xml HTTP ${res.status}`)
  const xml = await res.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
  if (!urls.length) throw new Error('No <loc> entries found in sitemap.xml')
  return [...new Set(urls)]
}

async function main() {
  const urlList = await getSitemapUrls()
  console.log(`Submitting ${urlList.length} URLs from sitemap.xml to IndexNow...`)

  const payload = (chunk) => JSON.stringify({
    host: 'www.mallorcaverified.com',
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: chunk
  })

  // Yandex endpoint (works without BWM verification)
  // Bing endpoint (api.indexnow.org) requires IndexNow key registered in Bing Webmaster Tools
  const ENDPOINTS = [
    { name: 'Yandex', url: 'https://yandex.com/indexnow' },
    { name: 'Bing',   url: 'https://api.indexnow.org/indexnow' },
  ]

  for (const endpoint of ENDPOINTS) {
    console.log(`\nSubmitting to ${endpoint.name}...`)
    let sent = 0
    for (let i = 0; i < urlList.length; i += 100) {
      const chunk = urlList.slice(i, i + 100)
      const res = await fetch(endpoint.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: payload(chunk)
      })
      if (res.ok || res.status === 202) {
        sent += chunk.length
      } else {
        const body = await res.text().catch(() => '')
        console.error(`  ✗ Chunk ${Math.ceil(i / 100) + 1}: HTTP ${res.status} ${body.slice(0, 120)}`)
        break
      }
    }
    console.log(`  → ${sent}/${urlList.length} URLs accepted by ${endpoint.name}`)
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
