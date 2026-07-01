import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  slug: string | null;
  name: string | null;
  display_name: string | null;
  category: string | null;
  status: string | null;
  rating: number | null;
  reviews_count: number | null;
  primary_type: string | null;
  address: string | null;
  google_place_id: string | null;
  website: string | null;
  google_maps_url: string | null;
};

const reportGroups = [
  {
    name: "practical-services",
    title: "Hidden Practical Services",
    categories: ["rent-a-car", "car-dealer", "spa"],
  },
  {
    name: "consumer-ready-categories",
    title: "Hidden Consumer Categories",
    categories: ["restaurant", "bar", "cafe", "beach-club", "hotel"],
  },
  {
    name: "nightlife",
    title: "Nightlife Status",
    categories: ["nightlife"],
    statuses: ["published", "premium", "draft", "hidden"],
  },
];

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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function publicName(row: BusinessRow) {
  return row.display_name?.trim() || row.name?.trim() || row.id;
}

function escapeCell(value: unknown) {
  return String(value ?? "-").replace(/\|/g, " ");
}

async function fetchRows(categories: string[], statuses: string[]) {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id,slug,name,display_name,category,status,rating,reviews_count,primary_type,address,google_place_id,website,google_maps_url")
    .in("category", categories)
    .in("status", statuses)
    .order("category", { ascending: true })
    .order("reviews_count", { ascending: false });

  if (error) throw error;
  return (data ?? []) as BusinessRow[];
}

function render(title: string, rows: BusinessRow[], categories: string[]) {
  const lines = [
    `# ${title}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Total rows: ${rows.length}`,
    "",
    "## Summary",
    "",
    "| Category | Total | Published | Premium | Draft | Hidden |",
    "|---|---:|---:|---:|---:|---:|",
  ];

  for (const category of categories) {
    const categoryRows = rows.filter((row) => row.category === category);
    lines.push(
      `| ${category} | ${categoryRows.length} | ${categoryRows.filter((row) => row.status === "published").length} | ${categoryRows.filter((row) => row.status === "premium").length} | ${categoryRows.filter((row) => row.status === "draft").length} | ${categoryRows.filter((row) => row.status === "hidden").length} |`,
    );
  }

  for (const category of categories) {
    const categoryRows = rows.filter((row) => row.category === category);
    lines.push("", `## ${category}`, "");
    if (!categoryRows.length) {
      lines.push("_No rows._", "");
      continue;
    }
    lines.push("| Name | Status | Rating | Reviews | Primary type | Slug | Google Place ID |");
    lines.push("|---|---|---:|---:|---|---|---|");
    for (const row of categoryRows) {
      lines.push(
        `| ${escapeCell(publicName(row))} | ${escapeCell(row.status)} | ${escapeCell(row.rating)} | ${escapeCell(row.reviews_count)} | ${escapeCell(row.primary_type)} | ${escapeCell(row.slug)} | ${escapeCell(row.google_place_id)} |`,
      );
    }
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  loadLocalEnv();
  if (!existsSync("reports")) mkdirSync("reports");
  const outputs = [];

  for (const group of reportGroups) {
    const rows = await fetchRows(group.categories, group.statuses ?? ["hidden"]);
    const text = render(group.title, rows, group.categories);
    const reportPath = join(
      "reports",
      `${group.name}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`,
    );
    writeFileSync(reportPath, text);
    outputs.push({ reportPath, rows: rows.length });
  }

  console.log(JSON.stringify(outputs, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
