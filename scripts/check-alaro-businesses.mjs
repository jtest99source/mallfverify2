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
  { pid: "ChIJ10U6ktrDlxIRehKj5yXQpmY", name: "Sis Market Café",           cat: "restaurant" },
  { pid: "ChIJ_RN8PQTClxIRF9LRaXN126k", name: "El Trastero Cuina Bar",       cat: "restaurant" },
  { pid: "ChIJtYwPxGrDlxIRJilPGoMhZSA", name: "Gallardo Restaurante Pizzeria",cat: "restaurant" },
  { pid: "ChIJT2KVi7bDlxIR1MM1wDjF5CU", name: "Restaurant Terra Mar & Foc",  cat: "restaurant" },
  { pid: "ChIJBWfiphzClxIRep50kujhmBM", name: "Restaurant Traffic",          cat: "restaurant" },
  { pid: "ChIJKdy4bBzClxIRZl-NWjd7iak", name: "La Bufala Restaurante italiano",cat: "restaurant" },
  { pid: "ChIJm3cGcL-TlxIRvSDL0o4R8Mk", name: "Forastera",                   cat: "restaurant" },
];

const { data } = await sb.from("businesses").select("id,google_place_id,name,status").in("google_place_id", BUSINESSES.map(b => b.pid));
const dbMap = new Map((data || []).map(r => [r.google_place_id, r]));

console.log(`In DB: ${dbMap.size}/${BUSINESSES.length}`);
for (const b of BUSINESSES) {
  const row = dbMap.get(b.pid);
  if (row) console.log(`  ✓ [${row.status}] ${row.name} (${row.id})`);
  else      console.log(`  ✗ MISSING: ${b.name} [${b.cat}]`);
}
