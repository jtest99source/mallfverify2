import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: guides } = await sb.from("guides").select("slug,locale,hero_image_url").in("status",["published","premium"]);
// distinct hero urls with the guides that use them
const byUrl=new Map();
for(const g of guides||[]){ if(!g.hero_image_url) continue; if(!byUrl.has(g.hero_image_url)) byUrl.set(g.hero_image_url,[]); byUrl.get(g.hero_image_url).push(`${g.slug}[${g.locale}]`); }

console.log(`Distinct hero URLs: ${byUrl.size}\n`);
const bad=[];
for(const [url,slugs] of byUrl){
  let status="ERR", ctype="";
  try{
    const r=await fetch(url,{method:"GET",headers:{"User-Agent":"Mozilla/5.0"}});
    status=r.status; ctype=r.headers.get("content-type")||"";
  }catch(e){ status="ERR:"+e.message.slice(0,30); }
  const ok = (String(status)==="200" && ctype.startsWith("image"));
  const host=new URL(url).host;
  if(!ok){ bad.push({url,slugs,status,ctype,host}); console.log(`✗ ${status} ${ctype.padEnd(12)} ${host}  → ${slugs.slice(0,3).join(", ")}${slugs.length>3?"…":""}`); }
}
console.log(`\n${bad.length} URL(s) rotas / no-imagen  (afectan a ${bad.reduce((n,b)=>n+b.slugs.length,0)} fichas de guía)`);
