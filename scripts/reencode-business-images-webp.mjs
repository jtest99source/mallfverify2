import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import sharp from "sharp";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const l of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = l.indexOf("="); if (i < 0) continue;
    const k = l.slice(0, i).trim(), v = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const BUCKET = "business-photos";
const WIDTH = 1200;
const QUALITY = 78;
const CACHE = "31536000"; // 1 year
const CONCURRENCY = 6;
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const LIMIT = (() => { const a = args.find((x) => x.startsWith("--limit=")); return a ? parseInt(a.split("=")[1]) : null; })();

function lh3Sized(u) { return u.replace(/=[^=/]*$/, `=w${WIDTH}`); }
async function download(u) {
  try {
    const r = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (r.status !== 200) return null;
    if (!(r.headers.get("content-type") || "").startsWith("image")) return null;
    return Buffer.from(await r.arrayBuffer());
  } catch { return null; }
}
async function refetch(name) {
  if (!apiKey || !name) return null;
  const url = new URL(`https://places.googleapis.com/v1/${name}/media`);
  url.searchParams.set("maxWidthPx", String(WIDTH)); url.searchParams.set("skipHttpRedirect", "true");
  const r = await fetch(url, { headers: { "X-Goog-Api-Key": apiKey } });
  if (!r.ok) return null;
  const m = await r.json(); return m.photoUri || null;
}

// Candidates: published/premium, own images (our bucket or lh3), not already webp.
const cands = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("businesses")
    .select("id,name,primary_image_url,primary_photo_name")
    .in("status", ["published", "premium"])
    .not("primary_image_url", "is", null)
    .range(from, from + 999);
  if (error) throw error;
  const page = data || [];
  for (const b of page) {
    const u = b.primary_image_url;
    if (!u || u.endsWith(".webp")) continue;
    const ours = u.includes(`/${BUCKET}/`) || u.startsWith("https://lh3.googleusercontent.com");
    if (ours) cands.push(b);
  }
  if (page.length < 1000) break;
}
const work = LIMIT ? cands.slice(0, LIMIT) : cands;
console.log(`Candidatos (jpg propios, no webp): ${cands.length} · ${APPLY ? "PROCESANDO" : "DRY RUN"}: ${work.length}`);
if (!APPLY) { console.log("Añade --apply para ejecutar."); process.exit(0); }

let done = 0, failed = 0, inBytes = 0, outBytes = 0;
async function processOne(b) {
  const u = b.primary_image_url;
  let buf = await download(u.startsWith("https://lh3") ? lh3Sized(u) : u);
  if (!buf && b.primary_photo_name) { const fresh = await refetch(b.primary_photo_name); if (fresh) buf = await download(fresh); }
  if (!buf) { failed++; return; }
  let out;
  try { out = await sharp(buf).rotate().resize({ width: WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY }).toBuffer(); }
  catch { failed++; return; }
  const path = `${b.id}.webp`;
  const up = await sb.storage.from(BUCKET).upload(path, out, { contentType: "image/webp", upsert: true, cacheControl: CACHE });
  if (up.error) { failed++; return; }
  const pub = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error } = await sb.from("businesses").update({ primary_image_url: pub }).eq("id", b.id);
  if (error) { failed++; return; }
  done++; inBytes += buf.length; outBytes += out.length;
  if (done % 100 === 0) console.log(`  ${done}/${work.length}  in ${(inBytes / done / 1024).toFixed(0)}KB → out ${(outBytes / done / 1024).toFixed(0)}KB/img`);
}

// simple concurrency pool
let idx = 0;
async function worker() { while (idx < work.length) { const b = work[idx++]; await processOne(b); } }
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(`\nHecho: ${done} · fallos: ${failed}`);
if (done) console.log(`Peso medio: ${(inBytes / done / 1024).toFixed(0)}KB JPG → ${(outBytes / done / 1024).toFixed(0)}KB WebP (−${Math.round(100 - 100 * outBytes / inBytes)}%)`);
