import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

// Only EN guides to mirror one listing page (the ES/DE render separately)
const { data: guides } = await sb.from("guides")
  .select("slug,locale,title,hero_image_url,sections")
  .eq("locale","en").in("status",["published","premium"])
  .order("updated_at",{ascending:false});

// gather all business_ids
const allIds = [...new Set((guides??[]).flatMap(g => (g.sections||[]).flatMap(s => s.business_ids||[])))];
const imgMap = new Map();
for (let i=0;i<allIds.length;i+=300){
  const chunk = allIds.slice(i,i+300);
  const { data } = await sb.from("businesses").select("id,primary_image_url,image").in("id",chunk);
  for (const r of data||[]) {
    const u = r.primary_image_url || (typeof r.image==="string" && r.image.startsWith("http") ? r.image : null);
    if (u) imgMap.set(r.id, u);
  }
}

let withHero=0, withBizPhoto=0, needFallback=0;
const fallbackList=[];
for (const g of guides||[]) {
  const ids = (g.sections||[]).flatMap(s=>s.business_ids||[]);
  const hasBizPhoto = ids.some(id=>imgMap.has(id));
  const hasHero = typeof g.hero_image_url==="string" && g.hero_image_url.trim();
  if (hasHero) withHero++;
  else if (hasBizPhoto) withBizPhoto++;
  else { needFallback++; fallbackList.push(`${g.title} (${g.slug}) — ${ids.length} biz ids, none with photo`); }
}

console.log(`EN guides: ${guides.length}`);
console.log(`  with hero_image_url:        ${withHero}`);
console.log(`  with a real business photo: ${withBizPhoto}`);
console.log(`  → rely on editorial pool:   ${needFallback}`);
console.log(`\nEditorial pool size: 12 distinct category images (deduplicated)`);
console.log(`So if >12 guides rely on the pool, the extras render BLACK.\n`);
console.log(`── Guides relying on the shared editorial pool ──`);
for (const f of fallbackList) console.log(`  • ${f}`);
