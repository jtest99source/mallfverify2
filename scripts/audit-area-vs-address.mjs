// scripts/audit-area-vs-address.mjs
// Audits the `area` field of published businesses against the locality that
// appears in their Google address ("..., 07560 Sa Coma, Illes Balears").
// Read-only. Writes a grouped report to reports/area-vs-address-<ts>.md
// Usage: node scripts/audit-area-vs-address.mjs

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

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

// Locality = segment "07560 Sa Coma" right before the region suffix.
function extractLocality(address) {
  if (!address) return null;
  const m = address.match(/(\d{5})\s+([^,]+?)\s*,\s*(Illes Balears|Islas Baleares|Balearic Islands|Spain|España)/i);
  if (!m) return null;
  return { postal: m[1], locality: m[2].trim() };
}

function norm(s) {
  return String(s ?? "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b(de|del|la|el|les|las|los|sa|es|s'|d')\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Known naming variants that are the SAME place (not a misassignment).
const aliases = new Map([
  ["palma mallorca", "palma"],
  ["ciutat", "palma"],
  ["port alcudia", "puerto alcudia"],
  ["port pollenca", "puerto pollensa"],
  ["pollenca", "pollensa"],
  ["port andratx", "puerto andratx"],
  ["port soller", "puerto soller"],
  ["arenal", "s arenal"],
  ["colonia sant jordi", "colonia san jordi"],
  ["cala d or", "cala dor"]
]);
function canon(s) {
  const n = norm(s);
  return aliases.get(n) ?? n;
}

const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("businesses")
    .select("slug,category,status,area,city,address")
    .in("status", ["published"])
    .order("id")
    .range(from, from + 999);
  if (error) throw error;
  rows.push(...(data ?? []));
  if (!data || data.length < 1000) break;
}

const mismatches = [];
let noAddress = 0, noParse = 0, ok = 0;
for (const b of rows) {
  const parsed = extractLocality(b.address);
  if (!b.address) { noAddress++; continue; }
  if (!parsed) { noParse++; continue; }
  const shown = b.city || b.area;
  if (!shown || canon(shown) === canon(parsed.locality)) { ok++; continue; }
  mismatches.push({ ...b, locality: parsed.locality, postal: parsed.postal, shown });
}

// Group by (shown -> locality) pair
const groups = new Map();
for (const m of mismatches) {
  const key = `${m.shown} -> ${m.locality}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(m);
}
const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const lines = [];
lines.push(`# Auditoría area vs dirección — ${ts}`);
lines.push("");
lines.push(`Publicados: ${rows.length} · sin dirección: ${noAddress} · dirección no parseable: ${noParse} · coinciden: ${ok} · **desajustes: ${mismatches.length}**`);
lines.push("");
lines.push("Agrupado por patrón (mostrado → localidad real de Google). Los grupos grandes son errores sistémicos del import; los de 1-2 pueden ser variantes de nombre o calles homónimas — revisar antes de tocar.");
lines.push("");
for (const [key, items] of sorted) {
  lines.push(`## ${key} — ${items.length} negocios`);
  for (const m of items.slice(0, 50)) lines.push(`- \`${m.category}/${m.slug}\` (CP ${m.postal}) — ${m.address}`);
  if (items.length > 50) lines.push(`- … y ${items.length - 50} más`);
  lines.push("");
}
const outPath = `reports/area-vs-address-${ts}.md`;
writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Desajustes: ${mismatches.length} en ${sorted.length} patrones. Informe: ${outPath}`);
console.log("\nTop 20 patrones:");
for (const [key, items] of sorted.slice(0, 20)) console.log(`${String(items.length).padStart(4)}  ${key}`);
