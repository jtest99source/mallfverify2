import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import * as XLSX from "xlsx";

// Outreach Excel (Nombre / URL Maps / Reseñas / Web) for real-enum categories.
// Usage: node scripts/export-outreach-by-category.mjs --category=property-management --out=reports/outreach-gestion-propiedades.xlsx
function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim(); if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("="); if (i === -1) continue;
    const k = t.slice(0, i).trim(); const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
const arg = (n) => { const a = process.argv.slice(2).find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : null; };
const mapsUrl = (b) => b.google_maps_url || (b.google_place_id ? `https://www.google.com/maps/place/?q=place_id:${b.google_place_id}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.area || b.city || "Mallorca"}`)}`);

async function main() {
  loadLocalEnv();
  const category = arg("category"); const out = arg("out");
  if (!category || !out) throw new Error("Missing --category or --out");
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const rows = [];
  for (let f = 0; ; f += 1000) {
    const { data, error } = await sb.from("businesses").select("name,website,reviews_count,google_maps_url,google_place_id,area,city").eq("category", category).in("status", ["published", "premium"]).range(f, f + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < 1000) break;
  }
  rows.sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0));
  const sheet = rows.map((b, i) => ({ "#": i + 1, "Nombre": b.name, "URL Maps": mapsUrl(b), "Reseñas": b.reviews_count ?? 0, "Web": b.website || "" }));
  const ws = XLSX.utils.json_to_sheet(sheet);
  ws["!cols"] = [{ wch: 4 }, { wch: 45 }, { wch: 60 }, { wch: 9 }, { wch: 45 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, category.substring(0, 31));
  XLSX.writeFile(wb, out);
  const conWeb = sheet.filter((r) => r.Web).length;
  console.log(`OK ${category}: ${sheet.length} -> ${out} (con web ${conWeb}, sin web ${sheet.length - conWeb})`);
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
