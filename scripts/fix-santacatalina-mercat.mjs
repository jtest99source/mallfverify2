import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv(){ if(!existsSync(".env.local"))return; for(const l of readFileSync(".env.local","utf8").split(/\r?\n/)){const i=l.indexOf("=");if(i<0)continue;const k=l.slice(0,i).trim(),v=l.slice(i+1).trim().replace(/^["']|["']$/g,"");if(!process.env[k])process.env[k]=v;}}
loadEnv();
const sb=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);

const WRONG = "google-ChIJvXCh7GeSlxIRg6SZs6guDy0";
const RIGHT = "mercado-santa-catalina";

// 1. Publish the market
const { error: pubErr } = await sb.from("businesses")
  .update({ status: "published", updated_at: new Date().toISOString().slice(0,10) })
  .eq("id", RIGHT).eq("status", "hidden");
if (pubErr) { console.error(pubErr); process.exit(1); }
console.log(`✓ Published business ${RIGHT}`);

// 2. Fix guide business_ids across all locales of the Santa Catalina guide
const { data: guides } = await sb.from("guides")
  .select("id,locale,sections").eq("slug","best-restaurants-santa-catalina-palma-2026");
for (const g of guides || []) {
  let changed = false;
  const sections = g.sections.map(s => ({
    ...s,
    business_ids: (s.business_ids||[]).map(id => { if(id===WRONG){changed=true;return RIGHT;} return id; }),
  }));
  if (!changed) { console.log(`  (${g.locale}) no change`); continue; }
  const { error } = await sb.from("guides").update({ sections }).eq("id", g.id);
  if (error) { console.error(`  ✗ ${g.locale}:`, error.message); continue; }
  console.log(`  ✓ (${g.locale}) business_id ${WRONG} → ${RIGHT}`);
}
