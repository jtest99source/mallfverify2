import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  category: string | null;
  status: string | null;
  google_place_id: string | null;
  rating: number | null;
  reviews_count: number | null;
  authority_score: number | null;
};

const PAGE_SIZE = 500;
const PUBLIC_STATUSES = ["published", "premium"];

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    includeDrafts: args.includes("--include-drafts"),
    allStatuses: args.includes("--all-statuses")
  };
}

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

function publicName(row: BusinessRow) {
  return row.display_name?.trim() || row.name;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

async function fetchRows(options: ReturnType<typeof parseArgs>) {
  const supabase = createSupabaseClient();
  const rows: BusinessRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,google_place_id,rating,reviews_count,authority_score")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (!options.allStatuses) {
      query = query.in("status", options.includeDrafts ? [...PUBLIC_STATUSES, "draft"] : PUBLIC_STATUSES);
    }

    const { data, error } = await query;
    if (error) throw error;
    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function duplicateGroups(rows: BusinessRow[], keyFor: (row: BusinessRow) => string | null) {
  const groups = new Map<string, BusinessRow[]>();
  for (const row of rows) {
    const key = keyFor(row);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}

function uniqueById(rows: BusinessRow[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

function renderReport(rows: BusinessRow[]) {
  const slugGroups = duplicateGroups(rows, (row) => row.slug ? `slug:${row.slug}` : null);
  const placeGroups = duplicateGroups(rows, (row) => row.google_place_id ? `place:${row.google_place_id}` : null);

  const lines = [
    "# Business Duplicate Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Public businesses checked: ${rows.length}`,
    `- Duplicate slug groups: ${slugGroups.length}`,
    `- Duplicate Google place groups: ${placeGroups.length}`,
    "",
    "## Duplicate Slugs",
    "",
    "| Key | Count | Businesses |",
    "|---|---:|---|",
    ...slugGroups.slice(0, 100).map(([key, group]) => `| ${formatValue(key)} | ${group.length} | ${formatValue(group.map((row) => `${publicName(row)} (${row.category}, ${row.status}, ${row.reviews_count ?? "-"} reviews, ${row.id})`).join("; "))} |`),
    "",
    "## Duplicate Google Places",
    "",
    "| Key | Count | Businesses |",
    "|---|---:|---|",
    ...placeGroups.slice(0, 100).map(([key, group]) => `| ${formatValue(key)} | ${group.length} | ${formatValue(group.map((row) => `${publicName(row)} (${row.slug}, ${row.category}, ${row.status}, ${row.reviews_count ?? "-"} reviews, ${row.id})`).join("; "))} |`),
    ""
  ];

  return { text: lines.join("\n"), slugGroups, placeGroups };
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const fetchedRows = await fetchRows(options);
  const rows = uniqueById(fetchedRows);
  const report = renderReport(rows);

  if (!existsSync("reports")) mkdirSync("reports");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `business-duplicates-${stamp}.md`);
  writeFileSync(reportPath, report.text, "utf8");

  console.log(JSON.stringify({
    reportPath,
    fetched: fetchedRows.length,
    checked: rows.length,
    include_drafts: options.includeDrafts,
    all_statuses: options.allStatuses,
    duplicate_slug_groups: report.slugGroups.length,
    duplicate_google_place_groups: report.placeGroups.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
