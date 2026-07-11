import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

// Bayesian-ish score: rating weighted by volume (so few-review 5.0s don't beat proven ones)
// score = (v/(v+m))*R + (m/(v+m))*C   with C≈global mean, m≈min-reviews prior
const C = 4.3, m = 50;
function score(r, v){ r=r??0; v=v??0; return (v/(v+m))*r + (m/(v+m))*C; }

// Pick a demonstrative category + zone with a clear, photogenic leader
async function rankZone(category, municipality){
  const { data } = await sb.from("businesses")
    .select("id,name,rating,reviews_count,municipality,city,area,primary_image_url,slug")
    .eq("category",category).eq("status","published")
    .eq("municipality",municipality);
  const ranked = (data||[])
    .filter(b=>b.rating && b.reviews_count)
    .map(b=>({...b,s:score(b.rating,b.reviews_count)}))
    .sort((a,b)=>b.s-a.s);
  return ranked;
}

for (const [cat,muni] of [["restaurant","Sóller"],["restaurant","Pollença"],["cafe","Palma"]]) {
  const r = await rankZone(cat,muni);
  if(!r.length) { console.log(`\n[${cat} / ${muni}] no data`); continue; }
  console.log(`\n═══ Top ${cat} in ${muni} (n=${r.length}) ═══`);
  r.slice(0,5).forEach((b,i)=>console.log(`  #${i+1}  ★${b.rating} (${b.reviews_count}r) score=${b.s.toFixed(3)}  ${b.name}  ${b.primary_image_url?"[img]":"[no-img]"}`));
}
