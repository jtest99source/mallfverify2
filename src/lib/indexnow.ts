const INDEXNOW_KEY = "23af42b5d954480b9e13878f5a908988";
const SITE_URL = "https://www.mallorcaverified.com";

export async function submitToIndexNow(urls: string[]): Promise<void> {
  if (!urls.length) return;

  const chunks: string[][] = [];
  for (let i = 0; i < urls.length; i += 100) chunks.push(urls.slice(i, i + 100));

  for (const chunk of chunks) {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "mallorcaverified.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: chunk
      })
    });
    if (!res.ok) console.error(`IndexNow error: ${res.status}`);
  }
}
