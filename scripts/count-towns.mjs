import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const rows=[];
for(let f=0;;f+=1000){const {data}=await sb.from("businesses").select("municipality,city,area").eq("status","published").range(f,f+999);rows.push(...(data||[]));if((data||[]).length<1000)break;}
const muni=new Set(rows.map(r=>(r.municipality||"").trim()).filter(Boolean));
const anyLoc=new Set(rows.map(r=>(r.municipality||r.city||r.area||"").trim()).filter(Boolean));
console.log("Municipios distintos:", muni.size, "| cualquier localidad:", anyLoc.size);
