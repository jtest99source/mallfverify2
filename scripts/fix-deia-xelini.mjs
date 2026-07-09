import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const XELINI_ID = "google-ChIJ8_DQ31WSlxIR3Yv4Z0epDjk";

// 1. Hide the business (★3.9 — below quality bar)
const { error: hideErr } = await sb.from("businesses")
  .update({ status: "hidden", updated_at: new Date().toISOString().slice(0, 10) })
  .eq("id", XELINI_ID);
if (hideErr) { console.error("Hide error:", hideErr); process.exit(1); }
console.log("✓ Xelini hidden");

// 2. Strip its business_id from the Deià guide sections (both locales)
const { data: guides } = await sb.from("guides").select("id,locale,sections").eq("slug", "best-restaurants-deia-2026");
for (const g of guides ?? []) {
  const sections = g.sections.map(s => ({
    ...s,
    business_ids: (s.business_ids ?? []).filter(id => id !== XELINI_ID),
  }));
  const { error } = await sb.from("guides").update({ sections }).eq("id", g.id);
  if (error) { console.error(`Guide ${g.locale} error:`, error); continue; }
  console.log(`✓ Removed Xelini id from guide (${g.locale}) — now ${sections.flatMap(s => s.business_ids).length} business_ids`);
}
