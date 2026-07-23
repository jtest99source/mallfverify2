// scripts/fix-area-from-address.mjs
// Fixes the `area` (and `city` when it was driving the display) of published
// businesses whose Google address locality proves they belong to a different
// town than the one assigned at import time. Curated pattern list only —
// spelling variants of the same place are deliberately left alone.
// Usage: node scripts/fix-area-from-address.mjs           (dry run)
//        node scripts/fix-area-from-address.mjs --apply

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
const APPLY = process.argv.includes("--apply");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// locality-as-in-Google-address -> canonical area label to store.
// Only distinct places misassigned at import; NOT spelling variants.
const localityToArea = new Map([
  ["Sa Coma", "Sa Coma"],
  ["Son Servera", "Son Servera"],
  ["El Toro", "El Toro"],
  ["Costa de la Calma", "Costa de la Calma"],
  ["Port de Pollença", "Port de Pollença"],
  ["Port d'Alcúdia", "Port d'Alcúdia"],
  ["Port de Sóller", "Port de Sóller"],
  ["Port d'Andratx", "Port d'Andratx"],
  ["Can Pastilla", "Can Pastilla"],
  ["S'Arenal", "S'Arenal"]
]);

function extractLocality(address) {
  if (!address) return null;
  const m = address.match(/(\d{5})\s+([^,]+?)\s*,\s*(Illes Balears|Islas Baleares|Balearic Islands|Spain|España)/i);
  if (!m) return null;
  return m[2].trim();
}

// Named-beach exception: a beach named after its resort keeps the resort's area
// even when Google's address locality points at the municipality town.
const slugExceptions = new Set(["platja-de-cala-millor", "platja-de-cala-bona"]);

const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("businesses")
    .select("id,slug,category,area,city,address")
    .in("status", ["published"])
    .order("id")
    .range(from, from + 999);
  if (error) throw error;
  rows.push(...(data ?? []));
  if (!data || data.length < 1000) break;
}

const byTarget = new Map();
let fixed = 0, failed = 0;
for (const b of rows) {
  if (slugExceptions.has(b.slug)) continue;
  const locality = extractLocality(b.address);
  if (!locality || !localityToArea.has(locality)) continue;
  const target = localityToArea.get(locality);
  const shown = b.city || b.area;
  if (shown === target) continue;

  const patch = { area: target };
  // city only drives the display when set — realign it too, never invent it.
  if (b.city) patch.city = target;

  if (!byTarget.has(target)) byTarget.set(target, []);
  byTarget.get(target).push(`${b.category}/${b.slug} (antes: ${shown})`);

  if (APPLY) {
    const { error } = await sb.from("businesses").update(patch).eq("id", b.id);
    if (error) { console.error(`FAILED ${b.slug}: ${error.message}`); failed++; continue; }
  }
  fixed++;
}

for (const [target, items] of [...byTarget.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n→ ${target}: ${items.length}`);
  for (const item of items.slice(0, 8)) console.log(`   ${item}`);
  if (items.length > 8) console.log(`   … y ${items.length - 8} más`);
}
console.log(`\nTotal: ${fixed} ${APPLY ? "actualizados" : "por actualizar (dry run)"}${failed ? `, ${failed} fallos` : ""}`);
