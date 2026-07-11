import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const q=["Garcias","Balboa","Fuentes y Rossell","Puigserver","Son Ver"];
const {data}=await sb.from("businesses").select("name,slug,category,status").eq("category","healthcare");
for(const term of q){
  const b=(data||[]).find(x=>x.name.toLowerCase().includes(term.toLowerCase()));
  if(b) console.log(`[${b.status}] ${b.name}\n   /es/healthcare/${b.slug}`);
  else console.log(`NOT FOUND: ${term}`);
}
