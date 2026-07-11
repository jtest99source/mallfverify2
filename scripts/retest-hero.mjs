import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
async function chk(u){ try{const r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}});return `${r.status} ${r.headers.get("content-type")}`;}catch(e){return "ERR "+e.message;} }
// a known-good business photo (Odontofamilia) vs a 403 guide hero (pollensa)
const {data:odo}=await sb.from("businesses").select("primary_image_url").eq("id","google-ChIJV9IGy11JlhIRdT9diTL4r38").maybeSingle();
const {data:pol}=await sb.from("guides").select("hero_image_url").eq("slug","best-restaurants-pollensa-2026").eq("locale","en").maybeSingle();
console.log("Odontofamilia business photo (era 200):");
console.log("  try1:", await chk(odo.primary_image_url));
console.log("  try2:", await chk(odo.primary_image_url));
console.log("Pollensa guide hero (dio 403):");
console.log("  try1:", await chk(pol.hero_image_url));
console.log("  try2:", await chk(pol.hero_image_url));
// are they the same photo host/format?
console.log("\nSame host:", new URL(odo.primary_image_url).host===new URL(pol.hero_image_url).host);
