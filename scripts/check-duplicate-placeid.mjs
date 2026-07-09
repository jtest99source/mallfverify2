import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const PIDS = ["ChIJBQj0SHeOlxIRCDE2oiizWik", "ChIJ4a3aTKaWlxIRswFN7GZDDhk"];

for (const pid of PIDS) {
  console.log(`\n═══ place_id ${pid} ═══`);
  // rows whose google_place_id column matches
  const { data: byCol } = await sb.from("businesses")
    .select("id,slug,name,category,status,source,detail_enriched_at,primary_image_url")
    .eq("google_place_id", pid);
  // rows whose id embeds the pid
  const { data: byId } = await sb.from("businesses")
    .select("id,slug,name,category,status,source,detail_enriched_at,primary_image_url,google_place_id")
    .eq("id", `google-${pid}`);

  console.log("  ── rows with google_place_id = pid ──");
  for (const r of byCol ?? []) console.log(`    [${r.status}] ${r.name} | id=${r.id} | slug=${r.slug} | enriched=${!!r.detail_enriched_at} | cover=${!!r.primary_image_url}`);
  console.log("  ── row with id = google-<pid> ──");
  for (const r of byId ?? []) console.log(`    [${r.status}] ${r.name} | id=${r.id} | slug=${r.slug} | gpid=${r.google_place_id} | enriched=${!!r.detail_enriched_at} | cover=${!!r.primary_image_url}`);
}
