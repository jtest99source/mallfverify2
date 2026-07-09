import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

const SLUGS = [
  "best-areas-stay-mallorca",
  "cash-or-card-mallorca",
  "soller-train-worth-it-guide",
  "best-events-mallorca-summer-2026",
  "coste-vida-mallorca-2026",
  "inmobiliarias-mallorca-expat",
];

const { data } = await sb.from("guides")
  .select("slug,locale,title,hero_image_url,sections")
  .in("slug", SLUGS)
  .order("slug");

for (const g of data||[]) {
  const ids = (g.sections||[]).flatMap(s=>s.business_ids||[]);
  console.log(`\n[${g.locale}] ${g.slug}`);
  console.log(`  hero_image_url: ${g.hero_image_url ? g.hero_image_url.slice(0,90) : "NULL"}`);
  console.log(`  business_ids: ${ids.length}`);
}

// Now HTTP-check each distinct hero url
const urls = [...new Set((data||[]).map(g=>g.hero_image_url).filter(Boolean))];
console.log(`\n── HTTP status of hero_image_urls ──`);
for (const u of urls) {
  try {
    const r = await fetch(u, { method:"HEAD" });
    console.log(`  ${r.status}  ${u.slice(0,80)}`);
  } catch(e) {
    console.log(`  ERR  ${u.slice(0,80)} → ${e.message}`);
  }
}
