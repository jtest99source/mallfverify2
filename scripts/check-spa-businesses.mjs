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
  { pid: "ChIJMX-nYFOSlxIRMKRzTuMuW9w", name: "Hammam Al Ándalus Palma" },
  { pid: "ChIJZ83K5DCTlxIRwWXCwdOvsyE", name: "Anaya Massage & Spa" },
  { pid: "ChIJlc868vmTlxIRlceW_V-sx8E", name: "Pho Thong Thai Spa" },
  { pid: "ChIJf9h9LHCSlxIRnrk_SA92mgw", name: "Jasmine Thai Massage" },
  { pid: "ChIJLXMdlYmTlxIR0hXQUpQcBwQ", name: "Kotchakorn Thai Massage" },
  { pid: "ChIJb2tff3KTlxIRWFmGBFzqfBY", name: "Japanese Head Spa Mallorca" },
  { pid: "ChIJ9fY7O1qJlxIRHAC4g57xr_Y", name: "Spa Nura Santa Ponsa" },
  { pid: "ChIJzxIXZMfFlxIRbB5GHogPqcU", name: "Mentnature (Inca)" },
  { pid: "ChIJ2YzBUJaXlxIR793Lx5lB9Zg", name: "Mallorca Wellness Spa - Playa de Palma" },
  { pid: "ChIJ-ZP4lAM_lhIR8S_NijfXW2c", name: "Mallorca Wellness Spa - Costa dels Pins" },
  { pid: "ChIJZQ7_mv9BlhIRVLXJeiTfg0Y", name: "Mallorca Wellness Spa - Sa Coma" },
];

const { data } = await sb.from("businesses").select("id,google_place_id,name,status").in("google_place_id", BUSINESSES.map(b => b.pid));
const dbMap = new Map((data || []).map(r => [r.google_place_id, r]));

console.log(`In DB: ${dbMap.size}/${BUSINESSES.length}`);
for (const b of BUSINESSES) {
  const row = dbMap.get(b.pid);
  if (row) console.log(`  ✓ [${row.status}] ${row.name} (${row.id})`);
  else      console.log(`  ✗ MISSING: ${b.name}`);
}
