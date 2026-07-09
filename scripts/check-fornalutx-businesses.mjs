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
  { pid: "ChIJu0AhH6fplxIRFzQb3Yko0M8", name: "Groenk Bistro & Grill",    cat: "restaurant" },
  { pid: "ChIJK_odrX_olxIRhvl87SF8dFg", name: "Restaurant Cafe Med",        cat: "restaurant" },
  { pid: "ChIJ8fGguT2TlxIRZtpGVL-2Wd4", name: "Ritma Mallorca",              cat: "restaurant" },
  { pid: "ChIJbyAad9DplxIRKqHvb2Ruufo", name: "Can Benet by Don Pedro",      cat: "restaurant" },
  { pid: "ChIJpT6qVH_olxIRr7ncT3KAoZE", name: "Ca N'Antuna",                 cat: "restaurant" },
  { pid: "ChIJgVXCqXjolxIRxgW679MOyp0", name: "Restaurant Es Turó",          cat: "restaurant" },
  { pid: "ChIJ_3Xt0UrplxIRecjw0FnJPwA", name: "Forn de Barri",               cat: "cafe" },
  { pid: "ChIJPbFkxqjplxIRJj1q4vbD1Rc", name: "Corel·la Café",              cat: "cafe" },
  { pid: "ChIJ5TKPXwDplxIRt8uPxFayDIw", name: "Pruna Gelateria Artesana",   cat: "cafe" },
];

const { data } = await sb.from("businesses").select("id,google_place_id,name,status").in("google_place_id", BUSINESSES.map(b => b.pid));
const dbMap = new Map((data || []).map(r => [r.google_place_id, r]));

console.log(`In DB: ${dbMap.size}/${BUSINESSES.length}`);
for (const b of BUSINESSES) {
  const row = dbMap.get(b.pid);
  if (row) console.log(`  ✓ [${row.status}] ${row.name} (${row.id})`);
  else      console.log(`  ✗ MISSING: ${b.name} [${b.cat}]`);
}
