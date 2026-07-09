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

const BUSINESSES = [
  { pid: "ChIJAY1Cv_mSlxIRibPD0Uxvag8", name: "CED Palma - Doctor Murad" },
  { pid: "ChIJ-wHXqK6TlxIRrXqngNZvFDM", name: "Nueva Clínica Dental Palma" },
  { pid: "ChIJXz3u0lqSlxIRyBRkaELsOJw", name: "Ziving Tomas Sastre" },
  { pid: "ChIJX483P_aSlxIRF4m4LK9oeec", name: "Clínica Pronova" },
  { pid: "ChIJU9OQoTOTlxIRVcXy5NZEjNA", name: "Dr. Estanislao Planas" },
  { pid: "ChIJCZGbwVOSlxIRhpYmouwnJFs", name: "COped Ortodoncia" },
  { pid: "ChIJhyI7UqmTlxIRdz6lgJ1oZJg", name: "Dental Ferrer" },
  { pid: "ChIJRYuX4FqSlxIRYN80Y297JDk", name: "SeaDent" },
  { pid: "ChIJGUVq7auTlxIRuhYtVmPTrN8", name: "Urgencias Dentales Mallorca" },
  { pid: "ChIJ02SxLKyTlxIRr0BSTuivsz8", name: "Centro Urgencias Dentales" },
  { pid: "ChIJoxFhwYkslhIRzQArv-pfmnE", name: "Dr. Dirk Döring (Alcúdia)" },
  { pid: "ChIJAbs57X1AlhIR8Q7Hkz61OX0", name: "SCHMIEDER Deutscher Zahnarzt" },
  { pid: "ChIJ41YXBn2SlxIRNNKKLyEFYKU", name: "Clínica Dental Vogelsang" },
  { pid: "ChIJbbP84rPFlxIRdN_GpVa_PGQ", name: "Clínica Dental Schurian Inca" },
  { pid: "ChIJqdmcVLmJlxIRSVO8r3QztEE", name: "Dental Centre Mallorca (Santa Ponsa)" },
  { pid: "ChIJS2wnWLmJlxIRdSxcUVmIgjM", name: "Santa Ponsa Dental Practice" },
  { pid: "ChIJAw2AAghJlhIREHqvsCUdn_A", name: "Platón Dental Manacor" },
  { pid: "ChIJV9IGy11JlhIRdT9diTL4r38", name: "Odontofamilia Manacor" },
];

const { data } = await sb.from("businesses").select("id,google_place_id,name,category,status,rating,reviews_count").in("google_place_id", BUSINESSES.map(b => b.pid));
const dbMap = new Map((data || []).map(r => [r.google_place_id, r]));

console.log(`In DB: ${dbMap.size}/${BUSINESSES.length}`);
for (const b of BUSINESSES) {
  const row = dbMap.get(b.pid);
  if (row) console.log(`  ✓ [${row.status}] ★${row.rating ?? "?"} (${row.reviews_count ?? "?"}r) ${row.name} [${row.category}]`);
  else      console.log(`  ✗ MISSING: ${b.name}`);
}
