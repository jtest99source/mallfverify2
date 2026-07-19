import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import * as XLSX from "xlsx";

// Imports self-reported language verification from the dentist outreach sheet.
// Structured interpretation below was reviewed and confirmed by the user.
// Match to a business by the Google Maps `cid` in the sheet (most reliable),
// falling back to a normalized-name match. Usage: node ... [--apply]
function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const l of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = l.indexOf("="); if (i < 0) continue;
    const k = l.slice(0, i).trim(), v = l.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const APPLY = process.argv.includes("--apply");
const norm = (s) => (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

// Reviewed interpretation, keyed by the exact clinic name in the sheet.
const LANG = {
  "Clínica Dental Garcias.": { en: "basic", de: "basic" },
  "Clínica Dental Balboa": { en: "fluent", de: "fluent" },
  "Clínica Dental Fuentes y Rosselló | Dentista en Manacor": { en: "fluent" },
  "Impress Palma de Mallorca Alemanya": { en: "fluent", de: "basic" },
  "Clínica Dental Schurian | INCA | Mallorca": { en: "fluent", de: "fluent", other: ["norwegian", "hungarian", "slovak"] },
  "Centro Urgencias Dentales - Dentista": { en: "basic", de: "basic" },
  "Clínica Áureo | Clínica de Medicina Estética en Palma": { en: "fluent" },
  "Clínica de Ortodoncia Marina Osorio": { en: "fluent" },
  "Dentinet Clínica Dental": { en: "fluent" },
  "Advance Clínica Dental": { en: "fluent" },
  "Clínica Dental Art Mallorca": { en: "fluent", de: "fluent" },
  "Clínica Dental en Algaida | Mallorca | Sensident": { en: "fluent", de: "fluent", other: ["italian"] },
  "Centro Médico Cala d´Or SLU": { en: "fluent", de: "fluent", other: ["polish", "french"] },
  "My Dentist & Beauty": { en: "fluent" },
  "Clínica Dental Palma de Mallorca | MZL": { en: "fluent", de: "fluent" },
  "Clínica Dental Endobalear": { en: "fluent" },
  "VHD Dental Dr. Victor Hernández Darias": { en: "fluent", de: "fluent", other: ["swedish"] },
  "Clínica Dental Ana": { en: "fluent", de: "fluent", other: ["swedish", "french"] },
  "Clinica Periodent": { en: "fluent", de: "fluent" },
  "Platón Dental": { en: "fluent", de: "fluent" },
  "Clínica Dental Paguera": { en: "fluent", de: "fluent", other: ["italian", "romanian", "french", "portuguese"] }
};

async function findByCid(cid) {
  if (!cid) return [];
  const { data } = await sb.from("businesses").select("id,slug,name,category,status,google_maps_url").ilike("google_maps_url", `%cid=${cid}%`);
  return data ?? [];
}
async function allHealthcareish() {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await sb.from("businesses").select("id,slug,name,category,status,google_maps_url").in("status", ["published", "premium", "draft"]).range(from, from + 999);
    const p = data ?? []; rows.push(...p); if (p.length < 1000) break;
  }
  return rows;
}

const wb = XLSX.read(readFileSync("Dentistas_leads.ods"), { type: "buffer" });
const rows = XLSX.utils.sheet_to_json(wb.Sheets["Hoja1"], { header: 1, defval: "" });
const all = await allHealthcareish();

let matched = 0, missed = 0, applied = 0;
const misses = [];
for (const r of rows) {
  const name = String(r[0] || "").trim();
  const note = String(r[1] || "").trim();
  if (!name || !note) continue;
  const lang = LANG[name];
  if (!lang) { console.log(`  ? sin interpretación: ${name}`); continue; }

  const cid = (String(r[2] || "").match(/cid=(\d+)/) || [])[1];
  let hits = await findByCid(cid);
  let via = "cid";
  if (!hits.length) {
    const n = norm(name.split("|")[0]);
    hits = all.filter((b) => { const bn = norm(b.name); return bn && (bn.includes(n) || n.includes(bn)); });
    via = "name";
  }

  if (!hits.length) { missed++; misses.push(name); console.log(`  ✗ SIN MATCH: ${name} (cid ${cid || "-"})`); continue; }
  const b = hits[0];
  matched++;
  const payload = { ...lang, confirmedAt: "2026-07", source: "business_direct" };
  console.log(`  ✓ ${via.padEnd(4)} [${b.status}] ${b.name.slice(0, 40).padEnd(40)} ← ${name.slice(0, 30)}  ${JSON.stringify(payload)}`);
  if (hits.length > 1) console.log(`     ⚠️ ${hits.length} candidatos, uso el 1º`);
  if (APPLY) {
    const { error } = await sb.from("businesses").update({ language_verification: payload }).eq("id", b.id);
    if (error) console.log(`     ✗ update: ${error.message}`); else applied++;
  }
}
console.log(`\n${APPLY ? "APLICADO" : "DRY RUN"} · match ${matched} · sin match ${missed} · escritos ${applied}`);
if (misses.length) console.log("Sin match:", misses.join(" | "));
