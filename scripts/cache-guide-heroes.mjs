import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

const BUCKET="guide-heroes";
function bigLh3(u){ return u.includes("lh3.googleusercontent.com") ? u.replace(/=[^=/]*$/,"=w1400") : u; } // hero size
async function download(u){ const r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}}); if(!(r.status===200 && (r.headers.get("content-type")||"").startsWith("image"))) return null; return Buffer.from(await r.arrayBuffer()); }

// ensure bucket
const { data: buckets } = await sb.storage.listBuckets();
if(!(buckets||[]).some(b=>b.name===BUCKET)){
  const { error } = await sb.storage.createBucket(BUCKET,{public:true});
  if(error){ console.error("createBucket:",error.message); process.exit(1); }
  console.log(`✓ Bucket "${BUCKET}" creado (público)`);
} else console.log(`Bucket "${BUCKET}" ya existe`);

// all guide heroes still on external URLs (skip already-cached)
const { data: guides } = await sb.from("guides").select("slug,locale,hero_image_url").in("status",["published","premium"]);
const external=(guides||[]).filter(g=>g.hero_image_url && !g.hero_image_url.includes("/storage/v1/object/public/"));
const byUrl=new Map();
for(const g of external){ if(!byUrl.has(g.hero_image_url)) byUrl.set(g.hero_image_url,[]); byUrl.get(g.hero_image_url).push(g); }
console.log(`Portadas externas distintas a cachear: ${byUrl.size}\n`);

let ok=0, fail=0, bytes=0;
for(const [url,rows] of byUrl){
  const buf=await download(bigLh3(url));
  if(!buf){ fail++; console.log(`  ✗ ${rows[0].slug} (no descarga)`); continue; }
  const name=createHash("md5").update(url).digest("hex").slice(0,16)+".jpg";
  const up=await sb.storage.from(BUCKET).upload(name,buf,{contentType:"image/jpeg",upsert:true});
  if(up.error){ fail++; console.log(`  ✗ ${rows[0].slug} upload: ${up.error.message}`); continue; }
  const pub=sb.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
  // update every guide row using this url
  for(const r of rows){ await sb.from("guides").update({hero_image_url:pub}).eq("slug",r.slug).eq("locale",r.locale); }
  ok++; bytes+=buf.length;
  console.log(`  ✓ ${(buf.length/1024).toFixed(0).padStart(4)}KB  ${rows.map(r=>r.slug+"["+r.locale+"]").join(", ").slice(0,70)}`);
}
console.log(`\nCacheadas: ${ok} · fallos: ${fail} · total ${(bytes/1024/1024).toFixed(1)}MB`);
