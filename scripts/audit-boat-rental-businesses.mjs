import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;

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

async function fetchRows(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("slug,name,display_name,status,city,area,municipality,rating,reviews_count,primary_type,website")
      .eq("category", "boat-rental")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

function countBy(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row) || "-";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const rows = await fetchRows(supabase);
  const previewRows = existsSync("data/import-previews/boats-preview.json")
    ? JSON.parse(readFileSync("data/import-previews/boats-preview.json", "utf8"))
    : [];

  mkdirSync("reports", { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `boat-rental-business-audit-${stamp}.md`);
  const publicRows = rows.filter((row) => row.status === "published" || row.status === "premium");
  const lines = [
    "# Boat Rental Business Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- DB boat-rental rows: ${rows.length}`,
    `- Preview unique rows: ${previewRows.length}`,
    "",
    "## DB Status Counts",
    "",
    "| Status | Count |",
    "|---|---:|",
    ...countBy(rows, (row) => row.status).map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## DB Type Counts",
    "",
    "| Type | Count |",
    "|---|---:|",
    ...countBy(rows, (row) => row.primary_type).slice(0, 30).map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Top Public Rows",
    "",
    "| Name | Area | Rating | Reviews | Type | Website | Slug |",
    "|---|---|---:|---:|---|---|---|",
    ...publicRows
      .slice()
      .sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0))
      .slice(0, 80)
      .map((row) => `| ${fmt(row.display_name || row.name)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.slug)} |`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: reportPath, db_boat_rental_rows: rows.length, preview_unique_rows: previewRows.length, status_counts: Object.fromEntries(countBy(rows, (row) => row.status)) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
