import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import * as XLSX from "xlsx";

const dentalSignalRegex = /(^|[^a-z])(dental|dentist|dentista|odontolog|ortodon|endodon|dentaire|zahnarzt)/;

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

function norm(s) {
  return (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function mapsUrl(b) {
  if (b.google_maps_url) return b.google_maps_url;
  if (b.google_place_id) return `https://www.google.com/maps/place/?q=place_id:${b.google_place_id}`;
  const q = encodeURIComponent(`${b.name} ${b.area || b.city || "Mallorca"}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

async function main() {
  loadLocalEnv();
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const pull = async (category) => {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb
        .from("businesses")
        .select("name,category,tags,website,reviews_count,google_maps_url,google_place_id,area,city,status")
        .eq("category", category)
        .in("status", ["published", "premium"])
        .range(from, from + 999);
      if (error) throw error;
      rows.push(...(data ?? []));
      if ((data ?? []).length < 1000) break;
    }
    return rows;
  };

  const targets = [
    {
      label: "Medicina estética",
      file: "reports/outreach-medicina-estetica.xlsx",
      rows: (await pull("healthcare")).filter((b) => (b.tags ?? []).includes("medicina-estetica")),
    },
    {
      label: "Inmobiliarias",
      file: "reports/outreach-real-estate.xlsx",
      rows: await pull("real-estate"),
    },
  ];

  for (const t of targets) {
    const sorted = t.rows.sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0));
    const sheet = sorted.map((b, i) => ({
      "#": i + 1,
      "Nombre": b.name,
      "URL Maps": mapsUrl(b),
      "Reseñas": b.reviews_count ?? 0,
      "Web": b.website || "",
    }));
    const ws = XLSX.utils.json_to_sheet(sheet);
    ws["!cols"] = [{ wch: 4 }, { wch: 45 }, { wch: 60 }, { wch: 9 }, { wch: 45 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t.label.substring(0, 31));
    XLSX.writeFile(wb, t.file);
    const conWeb = sheet.filter((r) => r.Web).length;
    console.log(`OK ${t.label}: ${sheet.length} negocios -> ${t.file} (con web: ${conWeb}, sin web: ${sheet.length - conWeb})`);
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
