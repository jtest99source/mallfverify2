import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

// 1) verify a cached (storage) image renders publicly
const { data: cached } = await sb.from("businesses").select("name,primary_image_url").like("primary_image_url","%/storage/v1/object/public/%").limit(1).maybeSingle();
const r=await fetch(cached.primary_image_url);
console.log(`Cacheada pública: ${r.status} ${r.headers.get("content-type")}  ${cached.name}`);
console.log(`  URL: ${cached.primary_image_url}\n`);

// 2) size test: same lh3 photo at different widths
const { data: one } = await sb.from("businesses").select("primary_image_url").like("primary_image_url","https://lh3.googleusercontent.com%").limit(1).maybeSingle();
const base=one.primary_image_url;
for(const w of ["s4800-w1600","w1200","w800","w600"]){
  const u=base.replace(/=[^=/]*$/,`=${w}`);
  try{ const rr=await fetch(u); const buf=Buffer.from(await rr.arrayBuffer()); console.log(`  =${w.padEnd(12)} ${rr.status} ${(buf.length/1024).toFixed(0)}KB`); }
  catch(e){ console.log(`  =${w} ERR`); }
}
