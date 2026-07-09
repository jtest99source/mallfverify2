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
  { pid: "ChIJH-dWFCLVlxIRRzvK1jpLNGI", name: "Celler La Parra" },
  { pid: "ChIJ3xTxByDUlxIRUQhp10HEdoc", name: "Restaurant Celler El Molí" },
  { pid: "ChIJ0Rni5h_UlxIRhnPfn9xG6Zc", name: "La Placeta-Pollença" },
  { pid: "ChIJ18BYkaDWlxIRf216285g8h8", name: "Il Giardino" },
  { pid: "ChIJpWMN6qDWlxIRjMo_RvjkV1k", name: "Restaurant La Fonda de l'Aigua" },
  { pid: "ChIJl-bweQDXlxIRYGvd9GqVt9E", name: "Anima e Farina" },
  { pid: "ChIJ_2CT1yTVlxIRD9DQrWYDOF4", name: "Ca'n Pescador - Port de Pollença" },
  { pid: "ChIJSc1RFBHVlxIRQRUUHOrUegs", name: "Restaurant Ca'n Bella-vista" },
  { pid: "ChIJNWvk1afVlxIR4y7_R8fwQxo", name: "Vista Restaurant" },
  { pid: "ChIJRbfeM8vVlxIRailcMif0V6E", name: "Idilico Beach House" },
];

const { data } = await sb.from("businesses").select("id,google_place_id,name,status,rating,reviews_count").in("google_place_id", BUSINESSES.map(b => b.pid));
const dbMap = new Map((data || []).map(r => [r.google_place_id, r]));

console.log(`In DB: ${dbMap.size}/${BUSINESSES.length}`);
for (const b of BUSINESSES) {
  const row = dbMap.get(b.pid);
  if (row) console.log(`  ✓ [${row.status}] ★${row.rating ?? "?"} (${row.reviews_count ?? "?"}r) ${row.name}`);
  else      console.log(`  ✗ MISSING: ${b.name}`);
}
