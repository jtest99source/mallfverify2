import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

// full dental universe
const KW=["dental","dentist","dentista","zahn","odont"];
const rows=[];
for(let from=0;;from+=1000){
  const {data}=await sb.from("businesses").select("id,name,slug,municipality,city,area,rating,reviews_count,tags,primary_type,website").eq("category","healthcare").eq("status","published").range(from,from+999);
  rows.push(...(data||[])); if((data||[]).length<1000)break;
}
const dental=rows.filter(b=>{const h=[b.name,b.primary_type,Array.isArray(b.tags)?b.tags.join(" "):""].join(" ").toLowerCase();return KW.some(k=>h.includes(k));}).filter(b=>b.rating&&b.reviews_count);

const N=dental.length;
const revs=dental.map(b=>b.reviews_count).sort((a,b)=>a-b);
const median=revs[Math.floor(revs.length/2)];
const leader=Math.max(...revs);
// rank by review volume (desc): 1 = most reviews
const byVol=[...dental].sort((a,b)=>b.reviews_count-a.reviews_count);
const rankOf=id=>byVol.findIndex(b=>b.id===id)+1;

const TARGETS=["Garcias","Balboa","Fuentes y Rossell","Antònia Puigserver","Puigserver","Son Verí","Son Veri"];
function findTarget(q){
  const ql=q.toLowerCase();
  return dental.find(b=>b.name.toLowerCase().includes(ql));
}

const wanted=[
  ["Clínica Dental Garcias","Garcias"],
  ["Clínica Dental Balboa","Balboa"],
  ["Clínica Dental Fuentes y Rosselló","Fuentes y Rossell"],
  ["Clínica Dental Antònia Puigserver","Puigserver"],
  ["Dental Son Verí","Son Ver"],
];

console.log(`\nSector dental: ${N} clínicas · mediana ${median} reseñas · líder ${leader} reseñas\n`);
console.log("═".repeat(70));
for(const [label,q] of wanted){
  const b=findTarget(q);
  if(!b){ console.log(`\n✗ NO ENCONTRADA: ${label}`); continue; }
  const rank=rankOf(b.id);
  const pct=Math.round((1-(rank-1)/N)*100);
  const vsMed=b.reviews_count-median;
  const gapLeader=leader-b.reviews_count;
  const loc=b.municipality||b.city||b.area||"Mallorca";
  console.log(`\n${b.name}  (${loc})`);
  console.log(`  Rating:   ★${b.rating}`);
  console.log(`  Reseñas:  ${b.reviews_count}   (mediana del sector: ${median})`);
  console.log(`  Puesto:   #${rank} de ${N} por volumen de reseñas  (top ${100-pct}% ⇢ percentil ${pct})`);
  console.log(`  vs mediana: ${vsMed>=0?"+":""}${vsMed}   ·   gap al líder: ${gapLeader} reseñas`);
  console.log(`  Web: ${b.website||"—"}`);
}
console.log("\n"+"═".repeat(70));
