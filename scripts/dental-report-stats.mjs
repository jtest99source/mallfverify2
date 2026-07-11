import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

// Pull all dental clinics (healthcare + dental keyword), published
const KW=["dental","dentist","dentista","zahn","odont"];
const rows=[];
for(let from=0;;from+=1000){
  const {data}=await sb.from("businesses").select("name,municipality,city,area,rating,reviews_count,tags,primary_type,website,place_reviews").eq("category","healthcare").eq("status","published").range(from,from+999);
  rows.push(...(data||[])); if((data||[]).length<1000)break;
}
const dental=rows.filter(b=>{const h=[b.name,b.primary_type,Array.isArray(b.tags)?b.tags.join(" "):""].join(" ").toLowerCase();return KW.some(k=>h.includes(k));});

const n=dental.length;
const withR=dental.filter(b=>b.rating&&b.reviews_count);
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
const median=a=>{const s=[...a].sort((x,y)=>x-y);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;};

const ratings=withR.map(b=>b.rating);
const reviews=withR.map(b=>b.reviews_count);

// language flags from name/website
const eng=dental.filter(b=>/english|british|dentist\b/i.test((b.name||"")+" "+(b.website||""))).length;
const ger=dental.filter(b=>/zahn|deutsch|german/i.test((b.name||"")+" "+(b.website||""))).length;

// zone distribution
const byZone={};
for(const b of dental){const z=b.municipality||b.city||b.area||"?";byZone[z]=(byZone[z]||0)+1;}
const topZones=Object.entries(byZone).sort((a,b)=>b[1]-a[1]).slice(0,8);

// rating buckets
const bucket={"<4.0":0,"4.0–4.4":0,"4.5–4.7":0,"4.8–5.0":0};
for(const r of ratings){ if(r<4)bucket["<4.0"]++;else if(r<4.5)bucket["4.0–4.4"]++;else if(r<4.8)bucket["4.5–4.7"]++;else bucket["4.8–5.0"]++; }

// review-volume buckets (a proxy for online visibility)
const vb={"<50":0,"50–199":0,"200–499":0,"500+":0};
for(const v of reviews){ if(v<50)vb["<50"]++;else if(v<200)vb["50–199"]++;else if(v<500)vb["200–499"]++;else vb["500+"]++; }

console.log(`\n══════ INFORME DENTAL MALLORCA 2026 — datos reales ══════\n`);
console.log(`Clínicas dentales analizadas (publicadas): ${n}`);
console.log(`Rating medio del sector:      ${avg(ratings).toFixed(2)} ★`);
console.log(`Rating mediano:               ${median(ratings).toFixed(2)} ★`);
console.log(`Reseñas — media:              ${Math.round(avg(reviews))}`);
console.log(`Reseñas — mediana:            ${median(reviews)}`);
console.log(`Reseñas — máximo (líder):     ${Math.max(...reviews)}`);
console.log(`\nDistribución por rating:`);
for(const [k,v] of Object.entries(bucket)) console.log(`  ${k.padEnd(10)} ${String(v).padStart(3)}  ${"█".repeat(Math.round(v/n*40))}`);
console.log(`\nDistribución por volumen de reseñas (visibilidad online):`);
for(const [k,v] of Object.entries(vb)) console.log(`  ${k.padEnd(10)} ${String(v).padStart(3)}  ${"█".repeat(Math.round(v/n*40))}`);
console.log(`\nIdioma (aprox., por nombre/web):`);
console.log(`  Marca "English/British/Dentist": ${eng}`);
console.log(`  Marca "Zahnarzt/alemán":         ${ger}`);
console.log(`\nTop zonas por nº de clínicas:`);
for(const [z,c] of topZones) console.log(`  ${z.padEnd(22)} ${c}`);
console.log(`\n— El "gap": la mediana tiene ${median(reviews)} reseñas; el líder ${Math.max(...reviews)}. Ese hueco es el argumento de venta.`);
