import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

async function ok(u){ try{const r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}});return r.status===200&&(r.headers.get("content-type")||"").startsWith("image");}catch{return false;} }

// 1) the specific cards from the screenshot
const names=["Bon Vi","Kingfisher","Ponderosa","Dakota","Il Chiringo"];
console.log("── Fichas de la captura ──");
for(const q of names){
  const {data}=await sb.from("businesses").select("name,category,status,primary_image_url,primary_photo_name,image").ilike("name",`%${q}%`).limit(2);
  for(const b of data||[]){
    let state="—";
    const u=b.primary_image_url;
    if(!u) state="NULL";
    else if(u.includes("/storage/")) state="storage✓";
    else if(u.includes("lh3.googleusercontent")) state=(await ok(u))?"lh3 vivo":"lh3 MUERTO(403)";
    else state="externa";
    console.log(`  [${b.status}] ${b.name.slice(0,32).padEnd(32)} img=${state.padEnd(14)} photo_name=${b.primary_photo_name?"sí":"NO"} image=${b.image||"—"}`);
  }
}

// 2) broader scope: how many published have a problem
console.log("\n── Alcance global (publicados) ──");
const rows=[];
for(let from=0;;from+=1000){
  const {data}=await sb.from("businesses").select("primary_image_url,primary_photo_name").eq("status","published").range(from,from+999);
  rows.push(...(data||[])); if((data||[]).length<1000)break;
}
let nullImg=0, lh3=0, storage=0, ext=0, nullNoName=0;
for(const b of rows){
  const u=b.primary_image_url;
  if(!u){ nullImg++; if(!b.primary_photo_name) nullNoName++; }
  else if(u.includes("/storage/")) storage++;
  else if(u.includes("lh3.googleusercontent")) lh3++;
  else ext++;
}
console.log(`  Publicados: ${rows.length}`);
console.log(`  primary_image_url NULL: ${nullImg}  (de esas, sin photo_name recuperable: ${nullNoName})`);
console.log(`  lh3 Google (riesgo de caducar): ${lh3}`);
console.log(`  ya en Storage: ${storage}   ·   externa: ${ext}`);

// 3) sample: how many of a random 40 lh3 are already dead?
const sample=rows.filter(b=>b.primary_image_url&&b.primary_image_url.includes("lh3")).slice(0,40);
let dead=0;
for(const b of sample){ if(!(await ok(b.primary_image_url))) dead++; }
console.log(`\n  Muestra de 40 lh3: ${dead} muertas (${Math.round(dead/40*100)}%) → estima ~${Math.round(dead/40*lh3)} fichas negras por caducidad`);
