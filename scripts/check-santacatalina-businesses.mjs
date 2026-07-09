import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

const B=[
  ["ChIJvXCh7GeSlxIRg6SZs6guDy0","Mercat de Santa Catalina"],
  ["ChIJn-TlFwCTlxIRP-AqW8E98DQ","Vermoutique"],
  ["ChIJY1PgNQCTlxIRBEJ_zLxtSQg","La Mona Vermuteria"],
  ["ChIJV_97jguTlxIRa2-hs2tbJnc","Tapas Palma"],
  ["ChIJJfkxplqTlxIR56ViJw0J_s0","Buscando el Norte"],
  ["ChIJg1YbX12SlxIRmyffPwabrD4","El Perrito"],
  ["ChIJMbGD7GeSlxIR7aoZWR1hylU","Santina"],
  ["ChIJG5ARVJ2TlxIRU4MwNpoC2Go","Plant Shack"],
  ["ChIJBylJ2EeTlxIRgSPXhSp21b8","XO Bruncherie"],
  ["ChIJwW3NPQCTlxIRRC63WmFnWzs","Azuca - Urban Bistro"],
  ["ChIJhVOkx8GTlxIRhySy1AbPZhQ","Bistro Esencia"],
  ["ChIJM6xxZV2SlxIRiu3KOQJuHEQ","Infineat"],
  ["ChIJU2BnWhyTlxIRFtBscKdujMI","Bankai Palma"],
  ["ChIJCxiRkfqTlxIR48tGB2SzneE","Mama's Santa Catalina"],
  ["ChIJ-fKoK2aSlxIRSpaNEKLJog4","La Nueva Burguesa"],
];
const {data}=await sb.from("businesses").select("id,google_place_id,name,status,rating,reviews_count").in("google_place_id",B.map(x=>x[0]));
const m=new Map((data||[]).map(r=>[r.google_place_id,r]));
console.log(`In DB: ${m.size}/${B.length}`);
for(const [pid,name] of B){
  const r=m.get(pid);
  if(r) console.log(`  ✓ [${r.status}] ★${r.rating??"?"} (${r.reviews_count??0}r) ${r.name}`);
  else console.log(`  ✗ MISSING: ${name}  (${pid})`);
}
