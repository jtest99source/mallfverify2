import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "reports";

const RESTORE_TO_DRAFT_NAMES = [
  "Restaurante Singular",
  "Cas Padrins",
  "Il Tano Ciudad Jardín",
  "Mar Sea Club",
  "Hotelet ca n'Oms",
  "Hotelet de ca n'Oms",
  "House of sushi Alcudia",
  "Melassa Restaurant",
  "Restaurant Ses Comes Llubí",
  "DIVERSI",
  "Bar Ristopizza Flavour",
  "BUNSEN BURGER",
  "D'Elina",
  "Paris plage paguera"
];

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

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function matches(row, names) {
  const value = normalize(`${publicName(row)} ${row.slug}`);
  const rowName = normalize(publicName(row));
  if (!rowName) return null;
  return names.find((name) => {
    const needle = normalize(name);
    if (!needle) return false;
    return value === needle || value.includes(needle);
  });
}

async function fetchPublishedRestaurants(supabase) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,status,category,city,area,municipality,rating,reviews_count,primary_type,website")
      .eq("category", "restaurant")
      .eq("status", "published")
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const supabase = createSupabaseClient();
  const rows = await fetchPublishedRestaurants(supabase);
  const matched = [];
  const matchedNames = new Set();

  for (const row of rows) {
    const match = matches(row, RESTORE_TO_DRAFT_NAMES);
    if (!match) continue;
    matched.push({ row, reason: match });
    matchedNames.add(match);
  }

  if (apply && matched.length) {
    const { error } = await supabase
      .from("businesses")
      .update({ status: "draft", updated_at: new Date().toISOString().slice(0, 10) })
      .in("id", matched.map(({ row }) => row.id));
    if (error) throw error;
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `restaurant-keep-drafts-restore-${apply ? "apply" : "dry-run"}-${stamp}.md`);
  const missingNames = RESTORE_TO_DRAFT_NAMES.filter((name) => !matchedNames.has(name));
  const lines = [
    "# Restaurant Keep Drafts Restore",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Apply: ${apply ? "yes" : "no"}`,
    "",
    "## Summary",
    "",
    `- Names requested: ${RESTORE_TO_DRAFT_NAMES.length}`,
    `- Published rows matched: ${matched.length}`,
    `- Missing names: ${missingNames.length}`,
    "",
    "## Restored / To Restore",
    "",
    "| Name | Reason | Area | Rating | Reviews | Type | Slug |",
    "|---|---|---|---:|---:|---|---|",
    ...matched.map(({ row, reason }) => `| ${fmt(publicName(row))} | ${fmt(reason)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.slug)} |`),
    "",
    "## Missing",
    "",
    ...missingNames.map((name) => `- ${name}`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(JSON.stringify({ report: reportPath, apply, matched: matched.length, missing: missingNames }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
