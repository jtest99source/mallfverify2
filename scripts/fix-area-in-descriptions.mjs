// scripts/fix-area-in-descriptions.mjs
// Follow-up to fix-area-from-address.mjs: import-template descriptions bake the
// (previously wrong) area name into `description` / `seo`. For the businesses
// whose area was realigned, replace the stale area mention — ONLY inside
// template-generated text (import boilerplate), never in editorial copy.
// Usage: node scripts/fix-area-in-descriptions.mjs           (dry run)
//        node scripts/fix-area-in-descriptions.mjs --apply

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

// target area -> stale names that may remain in template text
const staleByArea = new Map([
  ["Sa Coma", ["Cala Millor"]],
  ["Son Servera", ["Cala Bona", "Cala Millor"]],
  ["El Toro", ["Santa Ponça", "Santa Ponsa"]],
  ["Costa de la Calma", ["Santa Ponça", "Santa Ponsa"]],
  ["Port de Pollença", ["Pollença", "Pollensa"]],
  ["Port d'Alcúdia", ["Alcúdia", "Alcudia"]],
  ["Port de Sóller", ["Sóller", "Soller"]],
  ["Port d'Andratx", ["Andratx"]],
  ["Can Pastilla", ["Palma"]],
  ["S'Arenal", ["Palma", "Artà", "Arta", "Sa Dragonera"]]
]);

const templateMarker = /(importad[oa] desde Google Places|pendiente de revisi[oó]n editorial|imported from Google Places)/i;

function replaceStale(text, stale, target) {
  let out = text;
  for (const old of stale) {
    // only the "en <area>" / "in <area>" slot of the template phrasing
    out = out.replaceAll(`en ${old}`, `en ${target}`).replaceAll(`in ${old}`, `in ${target}`);
  }
  return out;
}

const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("businesses")
    .select("id,slug,category,area,description,short_description,seo")
    .in("status", ["published"])
    .in("area", [...staleByArea.keys()])
    .order("id")
    .range(from, from + 999);
  if (error) throw error;
  rows.push(...(data ?? []));
  if (!data || data.length < 1000) break;
}

let fixed = 0;
const samples = [];
for (const b of rows) {
  const stale = staleByArea.get(b.area);
  const patch = {};

  for (const field of ["description", "short_description"]) {
    const text = b[field];
    if (typeof text !== "string" || !templateMarker.test(text)) continue;
    const next = replaceStale(text, stale, b.area);
    if (next !== text) patch[field] = next;
  }

  if (b.seo) {
    const raw = JSON.stringify(b.seo);
    if (templateMarker.test(raw)) {
      const next = replaceStale(raw, stale, b.area);
      if (next !== raw) patch.seo = JSON.parse(next);
    }
  }

  if (!Object.keys(patch).length) continue;
  fixed++;
  if (samples.length < 12) samples.push(`${b.category}/${b.slug}: ${Object.keys(patch).join(", ")}`);
  if (APPLY) {
    const { error } = await sb.from("businesses").update(patch).eq("id", b.id);
    if (error) console.error(`FAILED ${b.slug}: ${error.message}`);
  }
}

for (const s of samples) console.log(s);
console.log(`\nTotal con texto plantilla desactualizado: ${fixed} ${APPLY ? "(actualizados)" : "(dry run)"}`);
