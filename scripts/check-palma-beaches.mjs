import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const B=[
  ["ChIJXW4VFHeOlxIRbnB2nTnmw0Y","Platja d'Illetes"],
  ["ChIJ0b11p--NlxIRQVDPqFkZHtA","Cala Major"],
  ["ChIJgZ8dxFyWlxIRMzEwuH--jpQ","Playa de Palma"],
  ["ChIJH60znLmPlxIRpc3uMLrEmaw","Portals Nous Beach"],
  ["ChIJu3KqKDOJlxIRpDEaNL9VFTc","Palmanova Beach"],
];
const {data}=await sb.from("businesses").select("id,google_place_id,name,category,status,rating,reviews_count").in("google_place_id",B.map(x=>x[0]));
const m=new Map((data||[]).map(r=>[r.google_place_id,r]));
console.log(`In DB: ${m.size}/${B.length}`);
for(const [pid,name] of B){
  const r=m.get(pid);
  if(r) console.log(`  ✓ [${r.status}] ★${r.rating??"?"} (${r.reviews_count??0}r) ${r.name} [${r.category}] | id=${r.id}`);
  else console.log(`  ✗ MISSING: ${name}  (${pid})`);
}
