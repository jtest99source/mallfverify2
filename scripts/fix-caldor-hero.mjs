import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

// gather all hero URLs currently in use to avoid duplicates
const { data: all } = await sb.from("guides").select("slug,locale,hero_image_url").in("status",["published","premium"]);
const used = new Set((all||[]).filter(g=>g.slug!=="cala-dor-vs-palma-where-to-stay-2026").map(g=>g.hero_image_url).filter(Boolean));

async function search(q,n=8){const r=await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=${n}&orientation=landscape&content_filter=high`,{headers:{Authorization:`Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`}});if(!r.ok)return [];const d=await r.json();return (d.results||[]).map(x=>x.urls?.regular).filter(Boolean);}

let hero=null;
for (const q of ["palma mallorca cathedral old town","cala dor mallorca marina harbour","mallorca coast town aerial"]) {
  const results = await search(q);
  hero = results.find(u => !used.has(u));
  if (hero) { console.log(`Picked from "${q}": ${hero.slice(0,60)}`); break; }
}
if (!hero) { console.error("Could not find a unique hero"); process.exit(1); }

const { error } = await sb.from("guides").update({ hero_image_url: hero }).eq("slug","cala-dor-vs-palma-where-to-stay-2026");
if (error) { console.error(error); process.exit(1); }
console.log("✓ Updated Cala d'Or vs Palma hero (all locales)");
