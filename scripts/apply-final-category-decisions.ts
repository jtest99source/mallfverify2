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
  city: string | null;
  area: string | null;
  google_place_id: string | null;
};

type UpdateAction = {
  label: string;
  match: Partial<Pick<BusinessRow, "slug" | "category" | "status" | "google_place_id">> & {
    city?: string;
    area?: string;
  };
  update: Record<string, string>;
  reason: string;
};

type Result = {
  label: string;
  matched: number;
  status: "planned" | "applied" | "skipped" | "conflict" | "error";
  before: string;
  update: string;
  note: string;
};

const actions: UpdateAction[] = [
  {
    label: "Beauty Keithy -> nightlife",
    match: { slug: "beauty-keithy", category: "bar" },
    update: { category: "nightlife" },
    reason: "Validated as nightlife: night_club primary_type in Palma."
  },
  {
    label: "Creperie Maduixa -> restaurant",
    match: { slug: "creperie-maduixa", category: "cafe" },
    update: { category: "restaurant" },
    reason: "Validated as restaurant/food venue: creperie with 456 reviews."
  },
  {
    label: "Sa Placa Campos -> restaurant + unique slug",
    match: { slug: "sa-placa", category: "cafe", area: "Campos" },
    update: { category: "restaurant", slug: "sa-placa-campos" },
    reason: "Validated as separate restaurant in Campos; unique slug avoids collision with Ses Salines."
  },
  {
    label: "El Olivo Cala Ratjada -> restaurant + unique slug",
    match: { slug: "el-olivo", category: "cafe", area: "Cala Ratjada" },
    update: { category: "restaurant", slug: "el-olivo-cala-ratjada" },
    reason: "Validated as separate restaurant in Cala Ratjada; unique slug avoids collision with Deia."
  },
  {
    label: "Hide Rosa Ballesteros Estetica Avanzada",
    match: { slug: "rosa-ballesteros-estetica-avanzada", category: "spa" },
    update: { status: "hidden" },
    reason: "Validated as aesthetics/beautician, not wellness spa."
  },
  {
    label: "Hide Mallorca Maderoterapia",
    match: { slug: "mallorca-maderoterapia-experta-en-remodelacion-de-la-figura", category: "spa" },
    update: { status: "hidden" },
    reason: "Validated as body aesthetics/maderoterapia, not wellness spa."
  },
  {
    label: "Hide Vandal Palma draft without place id",
    match: { slug: "vandal-palma", category: "restaurant", status: "draft", google_place_id: null },
    update: { status: "hidden" },
    reason: "Duplicate ghost draft without Google Place ID; published row has real place id."
  },
  {
    label: "Hide El Camino draft without place id",
    match: { slug: "el-camino-palma", category: "restaurant", status: "draft", google_place_id: null },
    update: { status: "hidden" },
    reason: "Duplicate ghost draft without Google Place ID; published row has real place id."
  }
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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function withRetry<T>(label: string, operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw new Error(`${label} failed after ${attempts} attempts: ${lastError instanceof Error ? lastError.message : String(lastError)}`);
}

function rowMatches(row: BusinessRow, match: UpdateAction["match"]) {
  for (const [key, value] of Object.entries(match)) {
    if (value === undefined) continue;
    const rowValue = row[key as keyof BusinessRow];
    if (value === null) {
      if (rowValue !== null) return false;
    } else if (rowValue !== value) {
      return false;
    }
  }
  return true;
}

function rowLabel(row: BusinessRow) {
  return `${row.display_name || row.name || row.id} (${row.slug ?? "-"}, ${row.category ?? "-"}, ${row.status ?? "-"}, ${row.city || row.area || "-"}, place=${row.google_place_id || "-"})`;
}

async function fetchCandidates(supabase: ReturnType<typeof createSupabaseClient>) {
  const slugs = [...new Set(actions.map((action) => action.match.slug).filter(Boolean))];
  const { data } = await withRetry("Fetch final decision candidates", async () => {
    const response = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,city,area,google_place_id")
      .in("slug", slugs);
    if (response.error) throw new Error(response.error.message);
    return response;
  }, 5);
  return (data ?? []) as BusinessRow[];
}

async function runAction(supabase: ReturnType<typeof createSupabaseClient>, candidates: BusinessRow[], action: UpdateAction, apply: boolean): Promise<Result> {
  const rows = candidates.filter((row) => rowMatches(row, action.match));
  if (rows.length === 0) {
    return { label: action.label, matched: 0, status: "skipped", before: "-", update: JSON.stringify(action.update), note: "No matching row; likely already applied or absent." };
  }
  if (rows.length > 1) {
    return { label: action.label, matched: rows.length, status: "conflict", before: rows.map(rowLabel).join("; "), update: JSON.stringify(action.update), note: "Multiple rows matched; skipped." };
  }
  if (!apply) {
    return { label: action.label, matched: 1, status: "planned", before: rowLabel(rows[0]), update: JSON.stringify(action.update), note: action.reason };
  }
  await withRetry(`Apply ${action.label}`, async () => {
    const response = await supabase.from("businesses").update(action.update).eq("id", rows[0].id);
    if (response.error) throw new Error(response.error.message);
    return response;
  }, 5);
  return {
    label: action.label,
    matched: 1,
    status: "applied",
    before: rowLabel(rows[0]),
    update: JSON.stringify(action.update),
    note: action.reason
  };
}

function render(results: Result[], apply: boolean) {
  const counts = results.reduce<Record<string, number>>((acc, result) => {
    acc[result.status] = (acc[result.status] ?? 0) + 1;
    return acc;
  }, {});
  return [
    "# Final Category Decisions Apply Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${apply ? "APPLY" : "DRY RUN"}`,
    "",
    "## Summary",
    "",
    ...Object.entries(counts).sort().map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## Results",
    "",
    "| Decision | Matched | Status | Before | Update | Note |",
    "|---|---:|---|---|---|---|",
    ...results.map((result) => `| ${result.label} | ${result.matched} | ${result.status} | ${result.before.replace(/\|/g, "/")} | \`${result.update}\` | ${result.note.replace(/\|/g, "/")} |`),
    ""
  ].join("\n");
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const supabase = createSupabaseClient();
  const candidates = await fetchCandidates(supabase);
  const results: Result[] = [];
  for (const action of actions) {
    results.push(await runAction(supabase, candidates, action, apply));
  }
  if (!existsSync("reports")) mkdirSync("reports");
  const reportPath = join("reports", `final-category-decisions-${apply ? "apply" : "dry-run"}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(reportPath, render(results, apply), "utf8");
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", reportPath, counts: results.reduce<Record<string, number>>((acc, result) => {
    acc[result.status] = (acc[result.status] ?? 0) + 1;
    return acc;
  }, {}) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
