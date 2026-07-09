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

const { data } = await sb.from("businesses")
  .select("id,name")
  .in("status", ["published", "premium"])
  .is("google_place_id", null);

for (const b of data ?? []) {
  if (!b.id.startsWith("google-")) { console.log(`⊘ skip (id not google-*): ${b.name}`); continue; }
  const pid = b.id.slice("google-".length);
  if (!/^ChIJ/.test(pid)) { console.log(`⊘ skip (id doesn't embed a place_id): ${b.name} → ${pid}`); continue; }
  const { error } = await sb.from("businesses").update({ google_place_id: pid }).eq("id", b.id);
  if (error) console.error(`✗ ${b.name}: ${error.message}`);
  else console.log(`✓ ${b.name} → google_place_id = ${pid}`);
}
