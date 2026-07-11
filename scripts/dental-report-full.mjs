import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const KW=["dental","dentist","dentista","zahn","odont"];
const rows=[];
for(let from=0;;from+=1000){ const {data}=await sb.from("businesses").select("name,municipality,city,area,rating,reviews_count,tags,primary_type,website").eq("category","healthcare").eq("status","published").range(from,from+999); rows.push(...(data||[])); if((data||[]).length<1000)break; }
const d=rows.filter(b=>{const h=[b.name,b.primary_type,Array.isArray(b.tags)?b.tags.join(" "):""].join(" ").toLowerCase();return KW.some(k=>h.includes(k));}).filter(b=>b.rating&&b.reviews_count);
const N=d.length;
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length, med=a=>{const s=[...a].sort((x,y)=>x-y);const m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;};
const R=d.map(b=>b.rating), V=d.map(b=>b.reviews_count);
const pct=n=>Math.round(n/N*100);
const rb={"<4.0":0,"4.0–4.4":0,"4.5–4.7":0,"4.8–5.0":0}; for(const r of R){if(r<4)rb["<4.0"]++;else if(r<4.5)rb["4.0–4.4"]++;else if(r<4.8)rb["4.5–4.7"]++;else rb["4.8–5.0"]++;}
const vb={"<50":0,"50–199":0,"200–499":0,"500+":0}; for(const v of V){if(v<50)vb["<50"]++;else if(v<200)vb["50–199"]++;else if(v<500)vb["200–499"]++;else vb["500+"]++;}
const eng=d.filter(b=>/english|british|dentist\b/i.test((b.name||"")+" "+(b.website||""))).length;
const ger=d.filter(b=>/zahn|deutsch|german/i.test((b.name||"")+" "+(b.website||""))).length;
const byZone={}; for(const b of d){const z=b.municipality||b.city||b.area||"?";byZone[z]=(byZone[z]||0)+1;}
const zones=Object.entries(byZone).sort((a,b)=>b[1]-a[1]).slice(0,7);
const leaders=[...d].sort((a,b)=>b.reviews_count-a.reviews_count).slice(0,5);

console.log(JSON.stringify({
  N, avgRating:+avg(R).toFixed(2), medRating:+med(R).toFixed(1),
  revMean:Math.round(avg(V)), revMedian:med(V), revMax:Math.max(...V),
  ratingBuckets:Object.entries(rb).map(([k,v])=>({k,v,p:pct(v)})),
  volBuckets:Object.entries(vb).map(([k,v])=>({k,v,p:pct(v)})),
  eng, ger,
  zones:zones.map(([z,c])=>({z,c})),
  leaders:leaders.map(b=>({name:b.name,rating:b.rating,reviews:b.reviews_count,zone:b.municipality||b.city||"Mallorca"})),
  pct48:pct(rb["4.8–5.0"]), pctInvisible:pct(vb["<50"]),
},null,2));
