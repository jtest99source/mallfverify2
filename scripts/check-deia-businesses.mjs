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
  { pid: "ChIJWSkAXjPvlxIRwmkqVKqpkcU", name: "Balm Restaurant" },
  { pid: "ChIJYQSe2bjvlxIRhq4-R_e19qc", name: "Ca's Patró March" },
  { pid: "ChIJ9birlq3vlxIRKzLbXjfmePs", name: "El Olivo (La Residencia)" },
  { pid: "ChIJay6YFq3vlxIRL2rDAWJ5O4w", name: "Trattoria Italiana Deià" },
  { pid: "ChIJ8_DQ31WSlxIR3Yv4Z0epDjk", name: "Restaurante Xelini Deià" },
  { pid: "ChIJVU2CRK3vlxIRPstklewtUe4", name: "Cafè Sa Font Fresca" },
  { pid: "ChIJV7FvvjXvlxIRmwAxzB1VCrA", name: "Aura Deià" },
  { pid: "ChIJ4y8IaD_vlxIRO9QxiCeQEIM", name: "Cas Peixot" },
];

const { data } = await sb.from("businesses").select("id,google_place_id,name,status").in("google_place_id", BUSINESSES.map(b => b.pid));
const dbMap = new Map((data || []).map(r => [r.google_place_id, r]));

console.log(`In DB: ${dbMap.size}/${BUSINESSES.length}`);
for (const b of BUSINESSES) {
  const row = dbMap.get(b.pid);
  if (row) console.log(`  ✓ [${row.status}] ${row.name} (${row.id})`);
  else      console.log(`  ✗ MISSING: ${b.name}`);
}
