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
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function normalizedText(row) {
  const raw = row.raw_google_place;
  const rawTypes = raw && Array.isArray(raw.types) ? raw.types.join(" ") : "";
  return `${publicName(row)} ${row.website ?? ""} ${row.address ?? ""} ${row.primary_type ?? ""} ${rawTypes}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function gymFamily(row) {
  const text = normalizedText(row);
  if (/hotel|resort|lodging|hostal|apartamentos/.test(text)) return "hotel_or_lodging";
  if (/shop|store|tienda|sporting goods|deportes /.test(text)) return "shop";
  if (/piscina|swimming pool|polideportivo|poliesportiu|sports complex|centro deportivo|municipal/.test(text)) return "municipal_or_sports_complex";
  if (/padel|tennis|tenis|club de tenis|sports club/.test(text)) return "padel_or_sports_club";
  if (/yoga|pilates|yogi|shala/.test(text)) return "yoga_pilates";
  if (/box|crossfit|cross training|crosstraining|functional|entrenamiento funcional|fitness center|gimnasio|gym|fitness|training club|personal trainer|entrenador/.test(text)) return "fitness_gym";
  if (/martial|muay thai|karate|aikido|bjj|jiu jitsu|boxeo|boxing|taekwondo|kickboxing/.test(text)) return "martial_arts";
  if (/dance|pole|aerial/.test(text)) return "dance_aerial";
  if (/health|fisio|physio|clinic|rehab|articular/.test(text)) return "health_overlap";
  return "other";
}

function concern(row) {
  const family = gymFamily(row);
  if (family === "hotel_or_lodging") return "hotel/lodging, not standalone gym";
  if (family === "shop") return "retail shop, not gym";
  if (family === "other") return "weak gym signal";
  if (family === "health_overlap") return "health/physio overlap, needs review";
  if ((row.reviews_count ?? 0) < 20) return "low reviews";
  if ((row.rating ?? 0) < 4.0) return "low rating";
  return null;
}

function groupCount(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row) || "-";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

async function fetchRows(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,status,category,city,area,municipality,address,rating,reviews_count,website,phone,google_place_id,primary_type,raw_google_place")
      .eq("category", "gym")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const rows = await fetchRows(supabase);
  const publicRows = rows.filter((row) => PUBLIC_STATUSES.has(row.status));
  const draftRows = rows.filter((row) => row.status === "draft");
  const hiddenRows = rows.filter((row) => row.status === "hidden");
  const suspectRows = publicRows.map((row) => ({ row, concern: concern(row) })).filter((item) => item.concern);
  const strongHiddenRows = hiddenRows
    .filter((row) => ["fitness_gym", "yoga_pilates", "martial_arts", "padel_or_sports_club", "municipal_or_sports_complex"].includes(gymFamily(row)))
    .filter((row) => (row.rating ?? 0) >= 4.3 && (row.reviews_count ?? 0) >= 50)
    .sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0));

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `gym-business-audit-${stamp}.md`);
  const lines = [
    "# Gym Business Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total gym rows: ${rows.length}`,
    `- Public gym rows: ${publicRows.length}`,
    `- Draft gym rows: ${draftRows.length}`,
    `- Hidden gym rows: ${hiddenRows.length}`,
    `- Public suspect rows: ${suspectRows.length}`,
    `- Strong hidden candidates: ${strongHiddenRows.length}`,
    "",
    "## Public Type Families",
    "",
    "| Family | Count |",
    "|---|---:|",
    ...groupCount(publicRows, gymFamily).map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Status Type Families",
    "",
    "| Status | Family | Count |",
    "|---|---|---:|",
    ...["published", "draft", "hidden", "premium"].flatMap((status) =>
      groupCount(rows.filter((row) => row.status === status), gymFamily).map(([key, count]) => `| ${fmt(status)} | ${fmt(key)} | ${count} |`)
    ),
    "",
    "## Public Areas",
    "",
    "| Area | Count |",
    "|---|---:|",
    ...groupCount(publicRows, (row) => row.city || row.area || row.municipality || "Mallorca").slice(0, 50).map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Public Suspects",
    "",
    "| Name | Status | Area | Rating | Reviews | Type | Family | Concern | Website | Slug |",
    "|---|---|---|---:|---:|---|---|---|---|---|",
    ...suspectRows.map(({ row, concern }) => `| ${fmt(publicName(row))} | ${fmt(row.status)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(gymFamily(row))} | ${fmt(concern)} | ${fmt(row.website)} | ${fmt(row.slug)} |`),
    "",
    "## Strong Hidden Candidates",
    "",
    "| Name | Family | Area | Rating | Reviews | Type | Website | Slug |",
    "|---|---|---|---:|---:|---|---|---|",
    ...strongHiddenRows
      .slice(0, 120)
      .map((row) => `| ${fmt(publicName(row))} | ${fmt(gymFamily(row))} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.slug)} |`),
    "",
    "## Top Public Rows",
    "",
    "| Name | Family | Area | Rating | Reviews | Type | Website | Slug |",
    "|---|---|---|---:|---:|---|---|---|",
    ...publicRows
      .slice()
      .sort((a, b) => ((b.reviews_count ?? 0) - (a.reviews_count ?? 0)) || ((b.rating ?? 0) - (a.rating ?? 0)))
      .slice(0, 100)
      .map((row) => `| ${fmt(publicName(row))} | ${fmt(gymFamily(row))} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.slug)} |`)
  ];

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: reportPath, rows: rows.length, public: publicRows.length, drafts: draftRows.length, hidden: hiddenRows.length, suspects: suspectRows.length, strong_hidden: strongHiddenRows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
