import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import * as XLSX from "xlsx";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim(); if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("="); if (i === -1) continue;
    const k = t.slice(0, i).trim(); const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
const norm = (s) => (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const dental = /(^|[^a-z])(dental|dentist|dentista|odontolog|ortodon|endodon|dentaire|zahnarzt)/;
const optica = /(^|[^a-z])(optic|oftalmolog|ophthalmolog|optometr|augenarzt|augenklinik|augenoptik)/;
const physio = /(^|[^a-z])(fisioterap|physiother|physio|kinesiolog|osteopat|quiropract|chiroprac)/;
const mental = /(^|[^a-z])(psicolog|psiquiatr|psycholog|psychiatr|psicoterap|psychotherap|salud mental|mental health)/;
const gynecology = /(^|[^a-z])(fertil|reproduccion asistida|reproduccion humana|reproductiv|fecundacion|ivf|kinderwunsch|inseminacion|ovodona|ginecolog|gynecolog|gynaecolog|gynakolog|frauenarzt|obstetric)/;
const pediatrics = /(^|[^a-z])(pediatr|paediatr|kinderarzt|pediatric)/;
const nutrition = /(^|[^a-z])(nutricion|nutricionist|dietetic|dietist|nutrition|ernahrungsberat)/;
function carve(b) {
  const s = norm([b.name, b.display_name, b.short_description, b.description, ...(b.tags ?? []), ...(b.best_for ?? [])].join(" "));
  if ((b.tags ?? []).includes("medicina-estetica")) return "aesthetic";
  if (dental.test(s)) return "dentists";
  if (optica.test(s)) return "opticians";
  if (physio.test(s)) return "physiotherapists";
  if (mental.test(s)) return "psychologists";
  if (gynecology.test(s)) return "gynecologists";
  if (pediatrics.test(s)) return "pediatricians";
  if (nutrition.test(s)) return "nutritionists";
  return "healthcare";
}
function mapsUrl(b) {
  if (b.google_maps_url) return b.google_maps_url;
  if (b.google_place_id) return `https://www.google.com/maps/place/?q=place_id:${b.google_place_id}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.area || b.city || "Mallorca"}`)}`;
}

async function main() {
  loadLocalEnv();
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const rows = [];
  for (let f = 0; ; f += 1000) {
    const { data, error } = await sb.from("businesses").select("name,display_name,short_description,description,tags,best_for,website,reviews_count,google_maps_url,google_place_id,area,city").eq("category", "healthcare").in("status", ["published", "premium"]).range(f, f + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < 1000) break;
  }
  const files = {
    gynecologists: "reports/outreach-ginecologia.xlsx",
  };
  const buckets = { gynecologists: [] };
  for (const b of rows) { const v = carve(b); if (buckets[v]) buckets[v].push(b); }
  for (const [v, file] of Object.entries(files)) {
    const sorted = buckets[v].sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0));
    const sheet = sorted.map((b, i) => ({ "#": i + 1, "Nombre": b.name, "URL Maps": mapsUrl(b), "Reseñas": b.reviews_count ?? 0, "Web": b.website || "" }));
    const ws = XLSX.utils.json_to_sheet(sheet);
    ws["!cols"] = [{ wch: 4 }, { wch: 45 }, { wch: 60 }, { wch: 9 }, { wch: 45 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, v.substring(0, 31));
    XLSX.writeFile(wb, file);
    const conWeb = sheet.filter((r) => r.Web).length;
    console.log(`OK ${v}: ${sheet.length} -> ${file} (con web ${conWeb}, sin web ${sheet.length - conWeb})`);
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
