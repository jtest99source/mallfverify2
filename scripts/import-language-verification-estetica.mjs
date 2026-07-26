// scripts/import-language-verification-estetica.mjs
// Language verification from the aesthetic-medicine outreach sheet
// (outreach-medicina-estetica.xlsx). Same rules as the dentist import:
// "medio" → basic, other languages → tags, empty response → not answered (skip).
// Match by Google Maps cid, fallback normalized name. Usage: node ... [--apply]
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import * as XLSX from "xlsx";

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

// Interpretation of the answers in the sheet (keyed by exact sheet name).
// NOTE Mara Aesthetics: "ingles nivel C2/B2" interpreted as fluent (B2+) — flagged for review.
const LANG = {
  "MEDISANS | Dra. Marta Serna | Medicina y Cirugía Estética": { en: "fluent", de: "fluent" },
  "The Skin Koncept - Medicina Estética Palma de Mallorca": { en: "fluent" },
  "Dermathos Clínica Dermatológica": { en: "fluent", de: "fluent" },
  "Mara Aesthetics S.L., Cirugía Plástica y Estética Mallorca (Mara Alemana)": { en: "fluent", de: "fluent" },
  "Clínica Font - Médicina Estética Mallorca": { en: "fluent", de: "basic" },
  "GB Clinic - Medicina estética avanzada en Palma de Mallorca | Same": { en: "fluent", de: "basic" },
  "MD AESTHETICS®| Same": { en: "fluent", de: "basic" },
  "Mallorca Aesthetic Clinic - Cala Millor": { en: "fluent", de: "fluent" },
  "Soma Clinic Centro Médico Estético": { en: "fluent" },
  "OLIVA Aesthetic & Hair Clinic | Clínica Estética y Capilar Inca | Medisan": { en: "fluent" },
  "Luis Fogued - Dermoestética": { en: "fluent" },
  "Lumina - Dra. Noeli Utges - Medicina Estética": { en: "fluent" },
  "RB Centro Médico Estético": { en: "fluent", de: "fluent", other: ["polish"] }
};

async function findByCid(cid) {
  if (!cid) return [];
  const { data } = await sb.from("businesses").select("id,slug,name,category,status,google_maps_url").ilike("google_maps_url", `%cid=${cid}%`);
  return data ?? [];
}
async function allBusinesses() {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await sb.from("businesses").select("id,slug,name,category,status,google_maps_url").in("status", ["published", "premium", "draft", "review", "hidden"]).range(from, from + 999);
    const p = data ?? []; rows.push(...p); if (p.length < 1000) break;
  }
  return rows;
}

const wb = XLSX.read(readFileSync("outreach-medicina-estetica.xlsx"), { type: "buffer" });
const rows = XLSX.utils.sheet_to_json(wb.Sheets["Medicina estética"], { header: 1, defval: "" });
const all = await allBusinesses();

let matched = 0, missed = 0, applied = 0;
const misses = [];
for (const r of rows) {
  const name = String(r[1] || "").trim();
  const resp = String(r[3] || "").trim();
  if (!name || !resp) continue;
  const lang = LANG[name];
  if (!lang) { console.log(`  ? respuesta sin interpretación en LANG: ${name} => "${resp}"`); continue; }

  const cid = (String(r[4] || "").match(/cid=(\d+)/) || [])[1];
  let hits = await findByCid(cid);
  let via = "cid";
  if (!hits.length) {
    const n = norm(name.split("|")[0].split(" - ")[0]);
    hits = all.filter((b) => { const bn = norm(b.name); return bn && (bn.includes(n) || n.includes(bn)); });
    via = "name";
  }

  if (!hits.length) { missed++; misses.push(name); console.log(`  ✗ SIN MATCH: ${name} (cid ${cid || "-"})`); continue; }
  const b = hits[0];
  matched++;
  const payload = { ...lang, confirmedAt: "2026-07", source: "business_direct" };
  console.log(`  ✓ ${via.padEnd(4)} [${b.status.padEnd(9)}] id=${b.id}`);
  console.log(`      ${b.name.slice(0, 55).padEnd(55)} ← ${JSON.stringify(payload)}`);
  if (hits.length > 1) console.log(`     ⚠️ ${hits.length} candidatos, uso el 1º`);
  if (APPLY) {
    const { error } = await sb.from("businesses").update({ language_verification: payload }).eq("id", b.id);
    if (error) console.log(`     ✗ update: ${error.message}`); else applied++;
  }
}
console.log(`\n${APPLY ? "APLICADO" : "DRY RUN"} · match ${matched} · sin match ${missed} · escritos ${applied}`);
if (misses.length) console.log("Sin match:", misses.join(" | "));
