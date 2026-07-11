import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET="guide-heroes";

async function candidates(q){
  const r=await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=6&orientation=landscape&content_filter=high`,{headers:{Authorization:`Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`}});
  const d=await r.json();
  return (d.results||[]).map(x=>({url:x.urls?.regular, alt:x.alt_description||x.description||"", by:x.user?.name}));
}
// show a few options across queries so we pick a premium, non-cheesy one
for(const q of ["modern dental clinic interior minimal","dental clinic white architecture","clean modern medical interior"]){
  console.log(`\n【 ${q} 】`);
  for(const c of await candidates(q)) console.log(`  ${c.url?.slice(0,58)}  — ${(c.alt||"").slice(0,50)}`);
}
