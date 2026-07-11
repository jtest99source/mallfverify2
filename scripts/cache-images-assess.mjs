import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

// counts by primary_image_url host
const rows=[];
for(let from=0;;from+=1000){
  const {data,error}=await sb.from("businesses").select("id,primary_image_url,primary_photo_name,status").range(from,from+999);
  if(error){console.error(error);break;}
  rows.push(...(data||[])); if((data||[]).length<1000)break;
}
let lh3=0, storage=0, other=0, none=0, lh3WithName=0;
for(const b of rows){
  const u=b.primary_image_url;
  if(!u){ none++; continue; }
  if(u.includes("lh3.googleusercontent.com")){ lh3++; if(b.primary_photo_name) lh3WithName++; }
  else if(u.includes("/storage/v1/object/public/")) storage++;
  else other++;
}
console.log(`Total businesses: ${rows.length}`);
console.log(`  primary_image_url = Google lh3 (a cachear): ${lh3}`);
console.log(`     …de esas, con primary_photo_name (re-fetch posible si muerta): ${lh3WithName}`);
console.log(`  ya en Supabase Storage: ${storage}`);
console.log(`  otra URL (web propia del negocio, etc.): ${other}`);
console.log(`  sin foto: ${none}`);

// storage buckets
const { data: buckets, error: bErr } = await sb.storage.listBuckets();
console.log(`\nStorage buckets:`, bErr ? "ERROR: "+bErr.message : (buckets||[]).map(b=>`${b.name} (public=${b.public})`).join(", ")||"(ninguno)");
