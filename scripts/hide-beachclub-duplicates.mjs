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

const DUP_IDS = [
  "google-ChIJBQj0SHeOlxIRCDE2oiizWik", // balneario-illetas-beach-club (dup)
  "google-ChIJ4a3aTKaWlxIRswFN7GZDDhk", // purobeach-palma-beach-club (dup)
];

const { data, error } = await sb.from("businesses")
  .update({ status: "hidden", updated_at: new Date().toISOString().slice(0, 10) })
  .in("id", DUP_IDS)
  .select("id,name,status");
if (error) { console.error(error); process.exit(1); }
for (const b of data ?? []) console.log(`✓ hidden: ${b.name} (${b.id})`);
