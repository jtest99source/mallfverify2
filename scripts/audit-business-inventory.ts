import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  category: string | null;
  status: string | null;
  editorial_generated_at: string | null;
  detail_enriched_at: string | null;
  primary_image_url: string | null;
  google_place_id: string | null;
};

const PAGE_SIZE = 500;

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

async function fetchRows() {
  const supabase = createSupabaseClient();
  const rows: BusinessRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,category,status,editorial_generated_at,detail_enriched_at,primary_image_url,google_place_id")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

function countBy<T extends string>(rows: BusinessRow[], keyFor: (row: BusinessRow) => T) {
  const counts = new Map<T, number>();
  for (const row of rows) counts.set(keyFor(row), (counts.get(keyFor(row)) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => String(a[0]).localeCompare(String(b[0])));
}

function render(rows: BusinessRow[]) {
  const publicRows = rows.filter((row) => row.status === "published" || row.status === "premium");
  const byStatus = countBy(rows, (row) => row.status ?? "unknown");
  const categories = [...new Set(rows.map((row) => row.category ?? "unknown"))].sort();

  const lines = [
    "# Business Inventory Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Total businesses: ${rows.length}`,
    `- Public businesses: ${publicRows.length}`,
    `- Draft businesses: ${rows.filter((row) => row.status === "draft").length}`,
    `- Hidden businesses: ${rows.filter((row) => row.status === "hidden").length}`,
    `- Public with Google place ID: ${publicRows.filter((row) => row.google_place_id).length}`,
    `- Public with primary image: ${publicRows.filter((row) => row.primary_image_url).length}`,
    `- Public detail enriched: ${publicRows.filter((row) => row.detail_enriched_at).length}`,
    `- Public with editorial generated: ${publicRows.filter((row) => row.editorial_generated_at).length}`,
    "",
    "## By Status",
    "",
    "| Status | Count |",
    "|---|---:|",
    ...byStatus.map(([status, count]) => `| ${status} | ${count} |`),
    "",
    "## Public By Category",
    "",
    "| Category | Public | Draft | Hidden | Detail enriched | With editorial | With image |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...categories.map((category) => {
      const categoryRows = rows.filter((row) => (row.category ?? "unknown") === category);
      const categoryPublic = categoryRows.filter((row) => row.status === "published" || row.status === "premium");
      return `| ${category} | ${categoryPublic.length} | ${categoryRows.filter((row) => row.status === "draft").length} | ${categoryRows.filter((row) => row.status === "hidden").length} | ${categoryPublic.filter((row) => row.detail_enriched_at).length} | ${categoryPublic.filter((row) => row.editorial_generated_at).length} | ${categoryPublic.filter((row) => row.primary_image_url).length} |`;
    }),
    ""
  ];

  return lines.join("\n");
}

async function main() {
  loadLocalEnv();
  const rows = await fetchRows();
  const text = render(rows);
  if (!existsSync("reports")) mkdirSync("reports");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `business-inventory-${stamp}.md`);
  writeFileSync(reportPath, text, "utf8");
  console.log(JSON.stringify({ reportPath, total: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
