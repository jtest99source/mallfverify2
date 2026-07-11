import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data } = await sb.from("guides").select("hero_image_url").in("status",["published","premium"]);
let storage=0,external=0,empty=0;
for(const g of data||[]){ if(!g.hero_image_url)empty++; else if(g.hero_image_url.includes("/storage/v1/object/public/"))storage++; else external++; }
console.log(`Guías: ${data.length} · en Storage: ${storage} · externas: ${external} · vacías: ${empty}`);
// verify one storage URL renders
const one=(data||[]).find(g=>g.hero_image_url&&g.hero_image_url.includes("/storage/"));
const r=await fetch(one.hero_image_url);
console.log(`Muestra Storage: ${r.status} ${r.headers.get("content-type")}`);
