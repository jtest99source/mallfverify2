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

const BUSINESSES = [
  { pid: "ChIJ_Wydbk6SlxIRc5wKl1c1hcY", name: "Ca'n Joan de s'Aigo",     cat: "bakery" },
  { pid: "ChIJTU1qblqSlxIRgqyBztCvFs4", name: "Fornet de la Soca",        cat: "bakery" },
  { pid: "ChIJsZl3ukSSlxIRbIENsjonsK4", name: "Forn de La Glòria",        cat: "bakery" },
  { pid: "ChIJUVFTnlqSlxIRA40wlWye4nc", name: "Forn Fondo",               cat: "bakery" },
  { pid: "ChIJl5jNWb_FlxIR1D3lA5OoWkg", name: "Forn Sant Francesc (Inca)",cat: "bakery" },
  { pid: "ChIJ8Ye4do_JlxIRVA9NSG0IRjo", name: "Forn Can Toni (Sineu)",    cat: "bakery" },
  { pid: "ChIJ_YseA7nFlxIR4hoVBP2V0BQ", name: "Forn Can Delante (Inca)",  cat: "bakery" },
];

const { data } = await sb.from("businesses").select("id,google_place_id,name,status").in("google_place_id", BUSINESSES.map(b => b.pid));
const dbMap = new Map((data || []).map(r => [r.google_place_id, r]));

console.log(`In DB: ${dbMap.size}/${BUSINESSES.length}`);
for (const b of BUSINESSES) {
  const row = dbMap.get(b.pid);
  if (row) console.log(`  ✓ [${row.status}] ${row.name} (${row.id})`);
  else      console.log(`  ✗ MISSING: ${b.name} [${b.cat}]`);
}
