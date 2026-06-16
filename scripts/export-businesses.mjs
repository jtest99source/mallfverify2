/**
 * export-businesses.mjs
 *
 * Exporta todos los negocios publicados a CSV.
 * Uso: node scripts/export-businesses.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}

function esc(val) {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function main() {
  loadLocalEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase credentials in .env.local");

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const rows = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,category,status,city,area,rating,reviews_count,authority_score,website,google_maps_url")
      .range(from, from + PAGE - 1)
      .order("category")
      .order("rating", { ascending: false });
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }

  const header = "id,slug,name,category,status,city,area,rating,reviews_count,authority_score,website,google_maps_url";
  const lines = rows.map((r) =>
    [r.id, r.slug, r.name, r.category, r.status, r.city, r.area, r.rating, r.reviews_count, r.authority_score, r.website, r.google_maps_url]
      .map(esc)
      .join(",")
  );

  const csv = [header, ...lines].join("\n");
  const out = `data/exports/businesses-${new Date().toISOString().slice(0, 10)}.csv`;
  const dir = out.split("/").slice(0, -1).join("/");
  if (!existsSync(dir)) (await import("node:fs")).mkdirSync(dir, { recursive: true });
  writeFileSync(out, csv, "utf8");

  console.log(`${rows.length} negocios exportados → ${out}`);

  // Resumen por categoría
  const byCategory = {};
  for (const r of rows) byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  console.log("\nPor categoría:");
  for (const [cat, n] of Object.entries(byCategory)) console.log(`  ${cat}: ${n}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
