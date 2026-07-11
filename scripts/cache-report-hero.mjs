import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET="guide-heroes";

const r=await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent("modern dental clinic interior")}&per_page=10&orientation=landscape&content_filter=high`,{headers:{Authorization:`Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`}});
const d=await r.json();
const results=(d.results||[]);
const pick=results.find(x=>/dental (office|room|clinic)|dentist/i.test(x.alt_description||x.description||"")) || results[0];
if(!pick){ console.error("no image"); process.exit(1); }
// hero-size render
const url=`${pick.urls.raw}&w=1600&q=80&fit=crop`;
console.log("Elegida:", (pick.alt_description||"").slice(0,60));

const buf=Buffer.from(await (await fetch(url)).arrayBuffer());
const name="report-dental-hero.jpg";
const up=await sb.storage.from(BUCKET).upload(name,buf,{contentType:"image/jpeg",upsert:true});
if(up.error){ console.error(up.error.message); process.exit(1); }
const pub=sb.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
console.log(`✓ ${(buf.length/1024).toFixed(0)}KB → ${pub}`);
