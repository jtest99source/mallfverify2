/**
 * Cleans up the gym category:
 * - Hides: polideportivos, piscinas municipales, campos de fútbol, circuits, skateparks, Lidl, restaurants
 * - Recategorizes to "activity": padel clubs, tennis clubs, swimming clubs, climbing gyms
 * - Keeps: fitness gyms, yoga/pilates, martial arts, CrossFit, personal trainers
 *
 * Usage:
 *   node scripts/clean-gym-category.mjs           (dry-run)
 *   node scripts/clean-gym-category.mjs --apply   (apply changes)
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;
const OUTPUT_DIR = "reports";
const PUBLIC_STATUSES = new Set(["published", "premium"]);

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ").slice(0, 60);
}

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function normalizedText(row) {
  const raw = row.raw_google_place;
  const rawTypes = raw && Array.isArray(raw.types) ? raw.types.join(" ") : "";
  return `${publicName(row)} ${row.website ?? ""} ${row.address ?? ""} ${row.primary_type ?? ""} ${rawTypes}`
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function classify(row) {
  const text = normalizedText(row);
  const name = publicName(row).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  // — HIDE: clearly wrong for gym category —
  if (/polideportivo|poliesportiu|polideportiu|palacio municipal|pavilion municipal|pavelló|pabellón/.test(text)) {
    return { action: "hide", reason: "polideportivo municipal" };
  }
  if (/piscina municipal|piscines municipal|swimming pool municipal/.test(text)) {
    return { action: "hide", reason: "piscina municipal" };
  }
  if (/instituto municipal del deporte|ime palma|ime\.palma/.test(text)) {
    return { action: "hide", reason: "IME (Instituto Municipal del Deporte)" };
  }
  if (/campo (municipal|de futbol|de deportes)|athletic.?field|camp municipal/.test(text)) {
    return { action: "hide", reason: "campo municipal / campo de fútbol" };
  }
  if (/circuito|race.?course|motoclub|kartodrom/.test(text)) {
    return { action: "hide", reason: "circuito / race course" };
  }
  if (/skatepark|skate.?park/.test(text)) {
    return { action: "hide", reason: "skatepark" };
  }
  if (/lidl/.test(text)) {
    return { action: "hide", reason: "Lidl supermarket" };
  }
  if (/restaurante polideportivo|restaurante.*polideportivo/.test(name)) {
    return { action: "hide", reason: "restaurante en polideportivo" };
  }
  if (/union deportiva|club de futbol|rugby football club|club atletism/.test(text)) {
    return { action: "hide", reason: "club deportivo (fútbol/rugby/atletismo)" };
  }
  if (/pista de atletismo|athletics track/.test(text)) {
    return { action: "hide", reason: "pista de atletismo" };
  }
  if (/gesport balear.*cdm|cdm.*gesport/.test(text)) {
    return { action: "hide", reason: "CDM (Centro Deportivo Municipal)" };
  }
  if (/campusesport\.com|campus.?esport/.test(text)) {
    return { action: "hide", reason: "campus deportivo (no es gym)" };
  }
  if (/sports_complex/.test(row.primary_type ?? "") && /municipal|ime|ajuntament|ayuntamiento/.test(text)) {
    return { action: "hide", reason: "sports complex municipal" };
  }

  // — RECATEGORIZE to "activity": padel, tennis, climbing, swimming clubs —
  if (/padel|pàdel/.test(text) && !/gym|gimnasio|fitness/.test(text)) {
    return { action: "recategorize", newCategory: "activity", reason: "padel club" };
  }
  if (/tennis|tenis/.test(text) && !/gym|gimnasio|fitness/.test(text)) {
    return { action: "recategorize", newCategory: "activity", reason: "club de tenis" };
  }
  if (/rocodrom|rocódrom|climbing|escalada/.test(text) && !/gym|fitness/.test(text)) {
    return { action: "recategorize", newCategory: "activity", reason: "rocódromo / escalada" };
  }
  if (/club natacion|club de natacion|swim.?academy|natación/.test(text) && !/gym|fitness/.test(text)) {
    return { action: "recategorize", newCategory: "activity", reason: "club natación" };
  }
  if (/academia rafa nadal/.test(text)) {
    return { action: "recategorize", newCategory: "activity", reason: "academia de tenis (Rafa Nadal)" };
  }

  return { action: "keep", reason: "valid gym/fitness" };
}

async function fetchPublicGyms(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,status,category,city,area,municipality,rating,reviews_count,website,address,primary_type,raw_google_place")
      .eq("category", "gym")
      .in("status", ["published", "premium"])
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const supabase = createSupabaseClient();
  const rows = await fetchPublicGyms(supabase);

  const toHide = [];
  const toRecategorize = [];
  const toKeep = [];

  for (const row of rows) {
    const result = classify(row);
    if (result.action === "hide") toHide.push({ row, reason: result.reason });
    else if (result.action === "recategorize") toRecategorize.push({ row, reason: result.reason, newCategory: result.newCategory });
    else toKeep.push({ row, reason: result.reason });
  }

  // Sort by reviews desc for readability
  const byReviews = (a, b) => (b.row.reviews_count ?? 0) - (a.row.reviews_count ?? 0);
  toHide.sort(byReviews);
  toRecategorize.sort(byReviews);

  if (apply) {
    if (toHide.length) {
      const { error } = await supabase
        .from("businesses")
        .update({ status: "hidden", updated_at: new Date().toISOString().slice(0, 10) })
        .in("id", toHide.map((x) => x.row.id));
      if (error) throw error;
    }
    if (toRecategorize.length) {
      const { error } = await supabase
        .from("businesses")
        .update({ category: "activity", updated_at: new Date().toISOString().slice(0, 10) })
        .in("id", toRecategorize.map((x) => x.row.id));
      if (error) throw error;
    }
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const mode = apply ? "apply" : "dry-run";
  const reportPath = join(OUTPUT_DIR, `gym-cleanup-${mode}-${stamp}.md`);

  const lines = [
    "# Gym Category Cleanup",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${apply ? "APPLIED" : "DRY-RUN"}`,
    "",
    "## Summary",
    "",
    `- Public gym rows processed: ${rows.length}`,
    `- ${apply ? "Hidden" : "To hide"}: ${toHide.length}`,
    `- ${apply ? "Recategorized" : "To recategorize"} to activity: ${toRecategorize.length}`,
    `- Kept as gym: ${toKeep.length}`,
    "",
    `## ${apply ? "Hidden" : "To Hide"} (${toHide.length})`,
    "",
    "| Name | Reason | Area | Rating | Reviews | Slug |",
    "|---|---|---|---:|---:|---|",
    ...toHide.map(({ row, reason }) => `| ${fmt(publicName(row))} | ${fmt(reason)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.slug)} |`),
    "",
    `## ${apply ? "Recategorized" : "To Recategorize"} to Activity (${toRecategorize.length})`,
    "",
    "| Name | Reason | Area | Rating | Reviews | Slug |",
    "|---|---|---|---:|---:|---|",
    ...toRecategorize.map(({ row, reason }) => `| ${fmt(publicName(row))} | ${fmt(reason)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.slug)} |`),
    "",
    "## Kept as Gym (sample — top 30 by reviews)",
    "",
    "| Name | Area | Rating | Reviews | Slug |",
    "|---|---|---:|---:|---|",
    ...toKeep.slice().sort(byReviews).slice(0, 30).map(({ row }) => `| ${fmt(publicName(row))} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.slug)} |`)
  ];

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: reportPath, mode, processed: rows.length, hide: toHide.length, recategorize: toRecategorize.length, keep: toKeep.length }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
