import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  category: string | null;
  status: string | null;
  city: string | null;
  area: string | null;
  municipality: string | null;
  rating: number | null;
  reviews_count: number | null;
};

type TargetLocation = {
  name: string;
  priority: "high" | "medium" | "low";
  type: "city" | "resort" | "port" | "village" | "region";
  aliases?: string[];
  note?: string;
};

const PAGE_SIZE = 1000;
const PUBLIC_STATUSES = ["published", "premium"];
const ACTIVE_CATEGORIES = [
  "restaurant",
  "hotel",
  "beach-club",
  "bar",
  "cafe",
  "nightlife",
  "activity",
  "boat-rental",
  "rent-a-car",
  "car-dealer",
  "spa",
  "healthcare",
  "real-estate"
];

const TARGET_LOCATIONS: TargetLocation[] = [
  { name: "Palma", priority: "high", type: "city" },
  { name: "Calvia", priority: "high", type: "region", aliases: ["Calvià", "Calvia", "Santa Ponça", "Palmanova", "Magaluf", "Peguera", "Portals Nous", "Illetas", "Puerto Portals"], note: "Core expat/tourist municipality; subareas matter." },
  { name: "Santa Ponsa", priority: "high", type: "resort", aliases: ["Santa Ponça", "Santa Ponsa"] },
  { name: "Palmanova", priority: "high", type: "resort" },
  { name: "Magaluf", priority: "medium", type: "resort" },
  { name: "Peguera", priority: "high", type: "resort", aliases: ["Peguera", "Paguera"] },
  { name: "Portals Nous", priority: "high", type: "resort" },
  { name: "Puerto Portals", priority: "high", type: "port" },
  { name: "Illetas", priority: "medium", type: "resort", aliases: ["Illetes", "Illetas"] },
  { name: "Andratx", priority: "high", type: "region", aliases: ["Andratx", "Port d'Andratx", "Puerto de Andratx", "Camp de Mar", "Sant Elm"] },
  { name: "Port d'Andratx", priority: "high", type: "port", aliases: ["Port d'Andratx", "Puerto de Andratx"] },
  { name: "Camp de Mar", priority: "medium", type: "resort" },
  { name: "Sant Elm", priority: "medium", type: "resort" },
  { name: "Soller", priority: "high", type: "village", aliases: ["Sóller", "Soller", "Port de Sóller", "Port de Soller"] },
  { name: "Port de Soller", priority: "high", type: "port", aliases: ["Port de Sóller", "Port de Soller"] },
  { name: "Deia", priority: "medium", type: "village", aliases: ["Deià", "Deia"] },
  { name: "Valldemossa", priority: "medium", type: "village" },
  { name: "Banyalbufar", priority: "low", type: "village" },
  { name: "Estellencs", priority: "low", type: "village" },
  { name: "Pollenca", priority: "high", type: "region", aliases: ["Pollença", "Pollenca", "Port de Pollença", "Port de Pollenca", "Puerto Pollensa"] },
  { name: "Port de Pollenca", priority: "high", type: "port", aliases: ["Port de Pollença", "Port de Pollenca", "Puerto Pollensa"] },
  { name: "Alcudia", priority: "high", type: "region", aliases: ["Alcúdia", "Alcudia", "Port d'Alcúdia", "Port d'Alcudia", "Puerto de Alcudia"] },
  { name: "Port d'Alcudia", priority: "high", type: "port", aliases: ["Port d'Alcúdia", "Port d'Alcudia", "Puerto de Alcudia"] },
  { name: "Playa de Muro", priority: "high", type: "resort", aliases: ["Playa de Muro", "Platja de Muro"] },
  { name: "Can Picafort", priority: "high", type: "resort" },
  { name: "Arta", priority: "medium", type: "village", aliases: ["Artà", "Arta"] },
  { name: "Capdepera", priority: "medium", type: "village" },
  { name: "Cala Ratjada", priority: "high", type: "resort" },
  { name: "Canyamel", priority: "medium", type: "resort" },
  { name: "Son Servera", priority: "medium", type: "village" },
  { name: "Cala Millor", priority: "high", type: "resort" },
  { name: "Cala Bona", priority: "medium", type: "resort" },
  { name: "Sa Coma", priority: "medium", type: "resort" },
  { name: "S'Illot", priority: "medium", type: "resort" },
  { name: "Porto Cristo", priority: "high", type: "port" },
  { name: "Manacor", priority: "high", type: "city" },
  { name: "Felanitx", priority: "medium", type: "village" },
  { name: "Portocolom", priority: "high", type: "port" },
  { name: "Cala d'Or", priority: "high", type: "resort" },
  { name: "Santanyi", priority: "high", type: "region", aliases: ["Santanyí", "Santanyi", "Cala Santanyí", "Cala Santanyi", "Cala Figuera", "Cala Llombards"] },
  { name: "Cala Figuera", priority: "medium", type: "port" },
  { name: "Colonia de Sant Jordi", priority: "high", type: "resort", aliases: ["Colònia de Sant Jordi", "Colonia de Sant Jordi"] },
  { name: "Campos", priority: "medium", type: "village" },
  { name: "Sa Rapita", priority: "medium", type: "resort", aliases: ["Sa Ràpita", "Sa Rapita"] },
  { name: "Llucmajor", priority: "medium", type: "region", aliases: ["Llucmajor", "S'Arenal", "Arenal"] },
  { name: "S'Arenal", priority: "medium", type: "resort", aliases: ["S'Arenal", "Arenal", "El Arenal"] },
  { name: "Inca", priority: "high", type: "city" },
  { name: "Binissalem", priority: "medium", type: "village" },
  { name: "Santa Maria del Cami", priority: "medium", type: "village", aliases: ["Santa Maria del Camí", "Santa Maria del Cami"] },
  { name: "Alaro", priority: "medium", type: "village", aliases: ["Alaró", "Alaro"] },
  { name: "Sineu", priority: "medium", type: "village" },
  { name: "Muro", priority: "medium", type: "village" },
  { name: "Sa Pobla", priority: "medium", type: "village" },
  { name: "Petra", priority: "low", type: "village" },
  { name: "Porreres", priority: "low", type: "village" },
  { name: "Montuiri", priority: "low", type: "village", aliases: ["Montuïri", "Montuiri"] },
  { name: "Algaida", priority: "low", type: "village" },
  { name: "Esporles", priority: "low", type: "village" },
  { name: "Lloseta", priority: "low", type: "village" },
  { name: "Selva", priority: "low", type: "village" },
  { name: "Campanet", priority: "low", type: "village" },
  { name: "Consell", priority: "low", type: "village" },
  { name: "Marratxi", priority: "medium", type: "region", aliases: ["Marratxí", "Marratxi"] }
];

const IMPORT_PRIORITY_CATEGORIES = ["healthcare", "real-estate", "rent-a-car", "car-dealer", "spa", "boat-rental", "activity", "cafe", "bar", "restaurant"];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
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

async function fetchRows() {
  const supabase = createSupabaseClient();
  const rows: BusinessRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,category,status,city,area,municipality,rating,reviews_count")
      .in("status", PUBLIC_STATUSES)
      .in("category", ACTIVE_CATEGORIES)
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function rowLocations(row: BusinessRow) {
  return [row.city, row.area, row.municipality].filter((value): value is string => Boolean(value?.trim()));
}

function matchesTarget(row: BusinessRow, target: TargetLocation) {
  const aliases = [target.name, ...(target.aliases ?? [])].map(normalize);
  const locations = rowLocations(row).map(normalize);
  return locations.some((location) => aliases.includes(location));
}

function countByCategory(rows: BusinessRow[]) {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.category ?? "unknown", (counts.get(row.category ?? "unknown") ?? 0) + 1);
  return counts;
}

function cell(value: unknown) {
  return String(value ?? "-").replace(/\|/g, "/").replace(/\r?\n/g, " ").trim() || "-";
}

function priorityScore(target: TargetLocation) {
  return target.priority === "high" ? 3 : target.priority === "medium" ? 2 : 1;
}

function recommendationFor(target: TargetLocation, rows: BusinessRow[]) {
  const categories = countByCategory(rows);
  if (!rows.length) return target.priority === "high" ? "Import soon" : target.priority === "medium" ? "Import if strategic" : "Skip for now";
  if (rows.length < 5 && target.priority !== "low") return "Top up";
  if (categories.size < 3 && target.priority === "high") return "Top up category mix";
  return "OK";
}

function missingCategoriesFor(rows: BusinessRow[]) {
  const counts = countByCategory(rows);
  return IMPORT_PRIORITY_CATEGORIES.filter((category) => (counts.get(category) ?? 0) === 0).slice(0, 5);
}

function render(rows: BusinessRow[]) {
  const targetSummaries = TARGET_LOCATIONS.map((target) => {
    const matches = rows.filter((row) => matchesTarget(row, target));
    const categories = countByCategory(matches);
    const reviews = matches.reduce((sum, row) => sum + (row.reviews_count ?? 0), 0);
    return {
      target,
      rows: matches,
      categories,
      reviews,
      recommendation: recommendationFor(target, matches),
      missing: missingCategoriesFor(matches)
    };
  }).sort((a, b) => {
    const recommendationWeight = (value: string) => value === "Import soon" ? 4 : value === "Top up" ? 3 : value === "Top up category mix" ? 2 : value === "Import if strategic" ? 1 : 0;
    return recommendationWeight(b.recommendation) - recommendationWeight(a.recommendation)
      || priorityScore(b.target) - priorityScore(a.target)
      || a.rows.length - b.rows.length;
  });

  const unknownLocationCounts = new Map<string, number>();
  for (const row of rows) {
    const location = row.city || row.area || row.municipality || "Mallorca";
    const key = normalize(location);
    const known = TARGET_LOCATIONS.some((target) => [target.name, ...(target.aliases ?? [])].map(normalize).includes(key));
    if (!known) unknownLocationCounts.set(location, (unknownLocationCounts.get(location) ?? 0) + 1);
  }

  return [
    "# Mallorca Location Gap Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Public active places checked: ${rows.length}`,
    `- Target Mallorca locations checked: ${TARGET_LOCATIONS.length}`,
    `- Import-soon locations: ${targetSummaries.filter((item) => item.recommendation === "Import soon").length}`,
    `- Top-up locations: ${targetSummaries.filter((item) => item.recommendation.startsWith("Top up")).length}`,
    "",
    "## What Is Worth Importing",
    "",
    "| Location | Priority | Type | Current places | Categories | Reviews | Recommendation | Missing useful categories | Note |",
    "|---|---|---|---:|---:|---:|---|---|---|",
    ...targetSummaries
      .filter((item) => item.recommendation !== "OK" || item.target.priority !== "low")
      .map((item) => `| ${cell(item.target.name)} | ${item.target.priority} | ${item.target.type} | ${item.rows.length} | ${item.categories.size} | ${item.reviews.toLocaleString("en-US")} | ${item.recommendation} | ${cell(item.missing.join(", "))} | ${cell(item.target.note)} |`),
    "",
    "## Healthy Target Locations",
    "",
    "| Location | Priority | Current places | Categories | Reviews |",
    "|---|---|---:|---:|---:|",
    ...targetSummaries
      .filter((item) => item.recommendation === "OK")
      .sort((a, b) => b.rows.length - a.rows.length)
      .map((item) => `| ${cell(item.target.name)} | ${item.target.priority} | ${item.rows.length} | ${item.categories.size} | ${item.reviews.toLocaleString("en-US")} |`),
    "",
    "## Visible Locations Not In Target List",
    "",
    "These may be useful later, but should not drive the homepage search until intentionally grouped.",
    "",
    "| Location | Public places |",
    "|---|---:|",
    ...[...unknownLocationCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 80).map(([location, count]) => `| ${cell(location)} | ${count} |`),
    ""
  ].join("\n");
}

async function main() {
  loadLocalEnv();
  const rows = await fetchRows();
  const report = render(rows);
  if (!existsSync("reports")) mkdirSync("reports");
  const reportPath = join("reports", `location-gap-audit-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(reportPath, report, "utf8");
  console.log(JSON.stringify({ reportPath, checked: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
