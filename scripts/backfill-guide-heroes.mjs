import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const DRY = process.argv.includes("--dry-run");

// Topical Unsplash queries for guides with no businesses (keyed by slug)
const UNSPLASH_TOPIC = {
  "best-day-trips-from-palma-mallorca-2026": "mallorca coast road mountains",
  "best-sunset-spots-mallorca-2026": "mallorca sunset sea coast",
  "cash-or-card-mallorca": "contactless card payment cafe",
  "getting-around-mallorca-without-car-2026": "soller vintage train mallorca",
  "coste-vida-mallorca-2026": "palma mallorca old town street",
};

// Only these hosts render reliably in a browser (self-contained, no API key needed).
// Our own Supabase Storage is the primary source since the image-caching migration.
function renderablePhoto(url){
  return typeof url === "string" && (
    url.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/`) ||
    url.startsWith("https://lh3.googleusercontent.com") ||
    url.startsWith("https://images.unsplash.com")
  );
}

async function searchUnsplash(q){
  const r=await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1&orientation=landscape&content_filter=high`,
    {headers:{Authorization:`Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`}});
  if(!r.ok) throw new Error(`Unsplash ${r.status}: ${await r.text()}`);
  const d=await r.json();
  return d.results?.[0]?.urls?.regular ?? null;
}

function heroBroken(url){
  if(!url || !url.trim()) return true;
  if(url.includes("maps.googleapis.com/maps/api/place/photo")) return true; // legacy, needs key
  return false;
}

// Load guides needing fix
const { data: guides } = await sb.from("guides")
  .select("id,slug,locale,hero_image_url,sections")
  .in("status",["published","premium"]);
const targets = (guides||[]).filter(g=>heroBroken(g.hero_image_url));

// Business photos
const allIds=[...new Set(targets.flatMap(g=>(g.sections||[]).flatMap(s=>s.business_ids||[])))];
const imgMap=new Map();
for(let i=0;i<allIds.length;i+=300){
  const {data}=await sb.from("businesses").select("id,primary_image_url").in("id",allIds.slice(i,i+300));
  for(const r of data||[]) if(renderablePhoto(r.primary_image_url)) imgMap.set(r.id,r.primary_image_url);
}

// cache unsplash by slug so en+de share the same image
const unsplashCache=new Map();
let fromBiz=0, fromUnsplash=0, skipped=0;

for(const g of targets){
  const ids=(g.sections||[]).flatMap(s=>s.business_ids||[]);
  let hero = ids.map(id=>imgMap.get(id)).find(Boolean) || null;

  if(!hero){
    const topic=UNSPLASH_TOPIC[g.slug];
    if(topic){
      if(!unsplashCache.has(g.slug)){
        unsplashCache.set(g.slug, DRY ? "(unsplash:"+topic+")" : await searchUnsplash(topic));
      }
      hero=unsplashCache.get(g.slug);
    }
  }

  if(!hero){ console.log(`  ⊘ no source: [${g.locale}] ${g.slug}`); skipped++; continue; }
  const src = imgMap.size && ids.map(id=>imgMap.get(id)).includes(hero) ? "biz" : "unsplash";
  if(src==="biz") fromBiz++; else fromUnsplash++;

  if(!DRY){
    const {error}=await sb.from("guides").update({hero_image_url:hero}).eq("id",g.id);
    if(error){ console.error(`  ✗ ${g.slug} (${g.locale}): ${error.message}`); continue; }
  }
  console.log(`  ${DRY?"(dry)":"✓"} [${g.locale}] ${g.slug} ← ${src} ${hero.slice(0,60)}`);
}

console.log(`\n${DRY?"[DRY RUN] ":""}Fixed: ${fromBiz} from business photos, ${fromUnsplash} from Unsplash, skipped ${skipped}`);
