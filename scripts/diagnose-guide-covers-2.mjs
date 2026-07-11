import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: guides } = await sb.from("guides")
  .select("slug,locale,title,hero_image_url,sections,updated_at")
  .in("status",["published","premium"])
  .order("updated_at",{ascending:false});

function broken(u){
  if(!u||!u.trim()) return "empty";
  if(u.includes("maps.googleapis.com/maps/api/place/photo")) return "legacy-broken";
  return null;
}

// business photos available per guide (to know if dedup would leave it black)
const allIds=[...new Set((guides||[]).flatMap(g=>(g.sections||[]).flatMap(s=>s.business_ids||[])))];
const imgMap=new Map();
for(let i=0;i<allIds.length;i+=300){
  const {data}=await sb.from("businesses").select("id,primary_image_url").in("id",allIds.slice(i,i+300));
  for(const r of data||[]) if(r.primary_image_url&&r.primary_image_url.startsWith("https://lh3")) imgMap.set(r.id,r.primary_image_url);
}

// Simulate the listing page dedup PER LOCALE (matches guides/page.tsx order: updated_at desc)
for(const loc of ["es","en","de"]){
  const list=(guides||[]).filter(g=>g.locale===loc);
  if(!list.length) continue;
  const seen=new Set();
  const blackOut=[];
  const emptyOrBroken=[];
  for(const g of list){
    const b=broken(g.hero_image_url);
    if(b){ emptyOrBroken.push(`${g.slug} (${b})`); }
    // candidate chain: hero → business photos
    const cand=[];
    if(g.hero_image_url && !b) cand.push(g.hero_image_url);
    for(const s of g.sections||[]) for(const id of s.business_ids||[]){ const u=imgMap.get(id); if(u) cand.push(u); }
    let chosen=null;
    for(const u of cand){ if(!seen.has(u)){ seen.add(u); chosen=u; break; } }
    if(!chosen) blackOut.push(g.slug);
  }
  console.log(`\n═══ [${loc}] ${list.length} guías ═══`);
  console.log(`  Renderizarían NEGRAS (tras dedup, sin editorial pool): ${blackOut.length}`);
  blackOut.forEach(s=>console.log(`    ✗ ${s}`));
  if(emptyOrBroken.length){ console.log(`  hero vacío/roto: ${emptyOrBroken.length}`); emptyOrBroken.forEach(s=>console.log(`    · ${s}`)); }
}

// Duplicate hero URLs across guides (the real dedup culprit), per locale
console.log(`\n═══ HERO DUPLICADOS (misma URL en varias guías, por locale) ═══`);
for(const loc of ["es","en","de"]){
  const list=(guides||[]).filter(g=>g.locale===loc && g.hero_image_url);
  const byUrl={};
  for(const g of list){ (byUrl[g.hero_image_url] ||= []).push(g.slug); }
  const dups=Object.entries(byUrl).filter(([,v])=>v.length>1);
  if(!dups.length){ console.log(`  [${loc}] sin duplicados ✓`); continue; }
  console.log(`  [${loc}]:`);
  for(const [url,slugs] of dups) console.log(`    ${url.slice(0,55)}…\n       → ${slugs.join(", ")}`);
}
