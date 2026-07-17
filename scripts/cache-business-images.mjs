import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

const BUCKET="business-photos";
const WIDTH=1200;
const args=process.argv.slice(2);
const LIMIT=(()=>{const a=args.find(x=>x.startsWith("--limit="));return a?parseInt(a.split("=")[1]):15;})();
const ALL=args.includes("--all");
const PAUSE=120;
const apiKey=process.env.GOOGLE_PLACES_API_KEY;

function smallUrl(u){ return u.replace(/=[^=/]*$/,`=w${WIDTH}`); } // swap lh3 size suffix
async function fetchFreshFromName(name){
  if(!apiKey) return null;
  const url=new URL(`https://places.googleapis.com/v1/${name}/media`);
  url.searchParams.set("maxWidthPx",String(WIDTH)); url.searchParams.set("skipHttpRedirect","true");
  const r=await fetch(url,{headers:{"X-Goog-Api-Key":apiKey}});
  if(!r.ok) return null;
  const m=await r.json(); return m.photoUri||null;
}
async function download(u){
  const r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}});
  if(!(r.status===200 && (r.headers.get("content-type")||"").startsWith("image"))) return null;
  return Buffer.from(await r.arrayBuffer());
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

// ensure bucket
const { data: buckets } = await sb.storage.listBuckets();
if(!(buckets||[]).some(b=>b.name===BUCKET)){
  const { error } = await sb.storage.createBucket(BUCKET,{public:true});
  if(error){ console.error("createBucket:",error.message); process.exit(1); }
  console.log(`✓ Bucket "${BUCKET}" creado (público)`);
} else console.log(`Bucket "${BUCKET}" ya existe`);

// candidates: lh3 primary_image_url, not yet cached, published first
const cands=[];
for(let from=0; ; from+=1000){
  const { data } = await sb.from("businesses")
    .select("id,name,primary_image_url,primary_photo_name,status")
    .like("primary_image_url","https://lh3.googleusercontent.com%")
    .order("status",{ascending:true})
    .range(from,from+999);
  cands.push(...(data||[]));
  if((data||[]).length<1000) break;
  if(!ALL && cands.length>=LIMIT) break;
}
const work = ALL ? cands : cands.slice(0,LIMIT);
console.log(`Candidatos: ${cands.length} · procesando: ${work.length}\n`);

let cached=0, refetched=0, failed=0, bytes=0;
for(let i=0;i<work.length;i++){
  const b=work[i];
  let buf=await download(smallUrl(b.primary_image_url));
  let via="stored";
  if(!buf && b.primary_photo_name){ const fresh=await fetchFreshFromName(b.primary_photo_name); if(fresh){ buf=await download(fresh); via="refetch"; } }
  if(!buf){ failed++; console.log(`  ✗ ${b.name.slice(0,40)}`); continue; }

  const path=`${b.id}.jpg`;
  const up=await sb.storage.from(BUCKET).upload(path,buf,{contentType:"image/jpeg",upsert:true,cacheControl:"31536000"});
  if(up.error){ failed++; console.log(`  ✗ upload ${b.name.slice(0,30)}: ${up.error.message}`); continue; }
  const pub=sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  const { error:updErr }=await sb.from("businesses").update({primary_image_url:pub}).eq("id",b.id);
  if(updErr){ failed++; console.log(`  ✗ db ${b.name.slice(0,30)}: ${updErr.message}`); continue; }

  cached++; if(via==="refetch") refetched++; bytes+=buf.length;
  if(!ALL || i%50===0) console.log(`  ✓ [${i+1}/${work.length}] ${via.padEnd(7)} ${(buf.length/1024).toFixed(0)}KB  ${b.name.slice(0,42)}`);
  if(PAUSE) await sleep(PAUSE);
}
console.log(`\nCacheadas: ${cached} (re-fetch: ${refetched}) · fallos: ${failed} · total ${(bytes/1024/1024).toFixed(1)}MB · media ${cached?(bytes/cached/1024).toFixed(0):0}KB/img`);
if(cached) console.log(`Proyección 7542 imgs ≈ ${(bytes/cached*7542/1024/1024/1024).toFixed(2)} GB`);
