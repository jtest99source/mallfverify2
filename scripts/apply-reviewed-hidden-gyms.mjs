import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;
const OUTPUT_DIR = "reports";

const KEEP_HIDDEN_NAMES = [
  "Lidl Felanitx",
  "Supermercado Lidl Peguera",
  "PadelHouse & voleyshop",
  "APEX sports Cala Millor",
  "IRONFIT",
  "Kite and Yoga Mallorca",
  "Rafa Nadal Residence",
  "Centro de tecnificación deportiva Islas Baleares",
  "Parc de les Sorts",
  "Mallorca Championships",
  "Acadèmia Porto Cristo",
  "Comunidad Inspira Pollença",
  "Carol Foresti Pádel Trainer",
  "Fit Point Fitness",
  "Polideportivo Son Ferriol",
  "Polideportivo Municipal de Son Ferriol",
  "Mallorca Padel Indoor",
  "A2 Sports Padel",
  "Totalfit Manacor",
  "Totalfit Centre educatiu i esportiu",
  "Gimnasio de Santanyí",
  "CESAR GYM Alcúdia",
  "Dani Training",
  "GFGTRAINER",
  "Centro PERSONAL Alcúdia",
  "Toni Cifre",
  "Mery Delgado",
  "Marc Folch",
  "M&M CENTRE Porreres",
  "Polideportivo Sa Torre Manacor",
  "Centro Base 0 Fitness Porreres",
  "Centro de entrenamiento - Base 0 Fitness",
  "SUKHA Dance Peguera",
  "SUKHA Dance & Fitness",
  "Move with Karolina",
  "Adrián Benavides Manacor",
  "Adrián Benavides Centro de Entrenamiento Personal",
  "Rafa Ríos Inca",
  "Feelsport gym Pollença",
  "Aysla Wellness Club",
  "RADsport Son Servera"
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

function matchesKeepHidden(row, normalizedKeepNames) {
  const name = normalize(publicName(row));
  const slug = normalize(row.slug);
  return normalizedKeepNames.find(({ raw, normalized }) => {
    if (!normalized) return false;
    return name === normalized || name.includes(normalized) || normalized.includes(name) || slug === normalized || slug.includes(normalized);
  });
}

async function fetchHiddenGyms(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,status,category,city,area,municipality,address,rating,reviews_count,website,primary_type")
      .eq("category", "gym")
      .eq("status", "hidden")
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
  const hiddenRows = await fetchHiddenGyms(supabase);
  const normalizedKeepNames = KEEP_HIDDEN_NAMES.map((raw) => ({ raw, normalized: normalize(raw) }));
  const keepMatches = [];
  const publishRows = [];
  const matchedKeepNames = new Set();

  for (const row of hiddenRows) {
    const match = matchesKeepHidden(row, normalizedKeepNames);
    if (match) {
      keepMatches.push({ row, reason: match.raw });
      matchedKeepNames.add(match.raw);
    } else {
      publishRows.push(row);
    }
  }

  if (apply && publishRows.length) {
    const { error } = await supabase
      .from("businesses")
      .update({ status: "published", updated_at: new Date().toISOString().slice(0, 10) })
      .in("id", publishRows.map((row) => row.id));
    if (error) throw error;
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `hidden-gyms-reviewed-${apply ? "apply" : "dry-run"}-${stamp}.md`);
  const unmatchedKeepNames = KEEP_HIDDEN_NAMES.filter((name) => !matchedKeepNames.has(name));
  const lines = [
    "# Hidden Gyms Reviewed Decisions",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Apply: ${apply ? "yes" : "no"}`,
    "",
    "## Summary",
    "",
    `- Hidden gym rows before action: ${hiddenRows.length}`,
    `- Rows ${apply ? "published" : "to publish"}: ${publishRows.length}`,
    `- Rows kept hidden: ${keepMatches.length}`,
    `- Keep-hidden names requested: ${KEEP_HIDDEN_NAMES.length}`,
    `- Keep-hidden names not matched: ${unmatchedKeepNames.length}`,
    "",
    "## Kept Hidden",
    "",
    "| Name | Reason | Area | Rating | Reviews | Type | Website | Slug |",
    "|---|---|---|---:|---:|---|---|---|",
    ...keepMatches.map(({ row, reason }) => `| ${fmt(publicName(row))} | ${fmt(reason)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.slug)} |`),
    "",
    "## Unmatched Keep-Hidden Names",
    "",
    ...unmatchedKeepNames.map((name) => `- ${name}`),
    "",
    "## Published / To Publish",
    "",
    "| Name | Area | Rating | Reviews | Type | Website | Slug |",
    "|---|---|---|---:|---:|---|---|",
    ...publishRows
      .slice()
      .sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0))
      .map((row) => `| ${fmt(publicName(row))} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.slug)} |`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(JSON.stringify({ report: reportPath, apply, hidden_before: hiddenRows.length, publish: publishRows.length, keep_hidden: keepMatches.length, unmatched_keep_names: unmatchedKeepNames }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
