import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: guides } = await sb.from("guides")
  .select("id,slug,locale,title,hero_image_url,sections")
  .in("status",["published","premium"]);

// business photo availability
const allIds=[...new Set((guides||[]).flatMap(g=>(g.sections||[]).flatMap(s=>s.business_ids||[])))];
const imgMap=new Map();
for(let i=0;i<allIds.length;i+=300){
  const {data}=await sb.from("businesses").select("id,primary_image_url").in("id",allIds.slice(i,i+300));
  for(const r of data||[]) if(r.primary_image_url) imgMap.set(r.id,r.primary_image_url);
}

function heroState(url){
  if(!url || !url.trim()) return "empty";
  if(url.includes("maps.googleapis.com/maps/api/place/photo")) return "legacy-broken"; // needs &key
  if(url.startsWith("https://lh3.googleusercontent.com")) return "ok-google";
  if(url.startsWith("https://images.unsplash.com")) return "ok-unsplash";
  if(url.startsWith("http")) return "ok-other";
  return "bad";
}

let counts={empty:0,"legacy-broken":0,"ok-google":0,"ok-unsplash":0,"ok-other":0,bad:0};
const needsFix=[];
for(const g of guides||[]){
  const st=heroState(g.hero_image_url);
  counts[st]++;
  if(st==="empty"||st==="legacy-broken"||st==="bad"){
    const ids=(g.sections||[]).flatMap(s=>s.business_ids||[]);
    const bizPhoto=ids.map(id=>imgMap.get(id)).find(Boolean);
    needsFix.push({id:g.id,slug:g.slug,locale:g.locale,state:st,bizPhoto:bizPhoto||null,nBiz:ids.length});
  }
}

console.log(`Total guide rows (all locales): ${guides.length}`);
console.log(`Hero states:`, JSON.stringify(counts,null,0));
console.log(`\nNeed a hero fix: ${needsFix.length}`);
const withBiz=needsFix.filter(n=>n.bizPhoto).length;
console.log(`  → ${withBiz} can reuse an existing business photo (FREE)`);
console.log(`  → ${needsFix.length-withBiz} have no business photo → need Unsplash/topical image`);
console.log(`\n── Detail ──`);
for(const n of needsFix.sort((a,b)=>a.slug.localeCompare(b.slug))){
  console.log(`  [${n.locale}] ${n.slug} | ${n.state} | biz=${n.nBiz} | reuse=${n.bizPhoto?"YES":"no"}`);
}
