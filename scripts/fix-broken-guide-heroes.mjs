import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

async function ok(u){ try{const r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}});return r.status===200 && (r.headers.get("content-type")||"").startsWith("image");}catch{return false;} }
async function unsplash(q){const r=await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=8&orientation=landscape&content_filter=high`,{headers:{Authorization:`Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`}});if(!r.ok)return [];const d=await r.json();return (d.results||[]).map(x=>x.urls?.regular).filter(Boolean);}

// per-slug Unsplash fallback topic
const TOPIC={
  "best-areas-stay-mallorca":"mallorca hotel terrace sea view",
  "soller-train-worth-it-guide":"soller vintage wooden train mallorca",
  "best-restaurants-pollensa-2026":"mediterranean restaurant terrace dinner",
  "best-restaurants-port-andratx-2026":"seafood restaurant harbour marina",
  "mejores-beach-clubs-mallorca":"mallorca beach club sunbeds sea",
};
const BROKEN_SLUGS=Object.keys(TOPIC);

// all currently-used hero urls (to keep uniqueness)
const { data: allG } = await sb.from("guides").select("slug,locale,hero_image_url,sections").in("status",["published","premium"]);
const usedHeroes=new Set((allG||[]).filter(g=>!BROKEN_SLUGS.includes(g.slug)).map(g=>g.hero_image_url).filter(Boolean));

for(const slug of BROKEN_SLUGS){
  const guides=(allG||[]).filter(g=>g.slug===slug);
  if(!guides.length){ console.log(`- ${slug}: not found`); continue; }
  // candidate business photos from this guide
  const ids=[...new Set(guides.flatMap(g=>(g.sections||[]).flatMap(s=>s.business_ids||[])))];
  let newHero=null;
  if(ids.length){
    const { data: biz } = await sb.from("businesses").select("id,primary_image_url").in("id",ids);
    const photos=(biz||[]).map(b=>b.primary_image_url).filter(u=>u&&u.startsWith("https://lh3"));
    for(const p of photos){ if(usedHeroes.has(p)) continue; if(await ok(p)){ newHero=p; break; } }
  }
  let src="business-photo";
  if(!newHero){
    src="unsplash";
    for(const u of await unsplash(TOPIC[slug])){ if(!usedHeroes.has(u) && await ok(u)){ newHero=u; break; } }
  }
  if(!newHero){ console.log(`✗ ${slug}: no working replacement found`); continue; }
  usedHeroes.add(newHero);
  const { error } = await sb.from("guides").update({hero_image_url:newHero}).eq("slug",slug);
  if(error){ console.error(`✗ ${slug}:`,error.message); continue; }
  console.log(`✓ ${slug}  ←(${src})  ${newHero.slice(0,58)}`);
}
console.log("\nDone.");
