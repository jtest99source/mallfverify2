import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  slug: string | null;
  name: string | null;
  display_name: string | null;
  category: string | null;
  status: string | null;
  primary_type: string | null;
};

type AuditEntry = {
  name: string;
  category: string;
  status: string;
  primaryType: string;
  severity: string;
  suggested: string;
  slug: string;
  reason: string;
};

type Action =
  | { kind: "move"; slug: string; from: string; to: string; reason: string }
  | { kind: "hide"; slug: string; from?: string; reason: string };

type Result = {
  action: string;
  slug: string;
  name: string;
  from: string;
  to: string;
  status: "planned" | "applied" | "skipped" | "missing" | "conflict" | "error";
  note: string;
};

const DEFAULT_REPORT_PREFIX = "active-category-validity-";
const INVESTIGATE_SLUGS = new Set([
  "fun-island-buggy-quad-tours-sa-coma",
  "mallorca-rental-excursions",
  "beauty-keithy",
  "creperie-maduixa",
  "nikkisports",
  "hr-motor-palma",
  "padel-surf-mallorca-cala-millor-stand-up-paddle"
]);

const EXTRA_HIDES: Action[] = [
  {
    kind: "hide",
    slug: "auto-pc-balear-s-l",
    reason: "Manual validation: car_repair/workshop, not rent-a-car."
  },
  {
    kind: "hide",
    slug: "gt-rentals-alquiler-de-coches-de-lujo-en-mallorca-luxury-car-rental",
    reason: "Manual validation: chauffeur/luxury driver service, not standard rent-a-car."
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

function latestReportPath() {
  const reports = readdirSync("reports")
    .filter((file) => file.startsWith(DEFAULT_REPORT_PREFIX) && file.endsWith(".md"))
    .sort();
  const latest = reports.at(-1);
  if (!latest) throw new Error("No active-category-validity report found.");
  return join("reports", latest);
}

function argValue(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function splitMarkdownRow(line: string) {
  const cells: string[] = [];
  let current = "";
  let escaped = false;
  for (const char of line) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === "|") {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells.slice(1, -1);
}

function sectionRows(text: string, heading: string) {
  const start = text.indexOf(`## ${heading}`);
  if (start === -1) return [];
  const after = text.slice(start);
  const next = after.slice(4).search(/\n## /);
  const section = next === -1 ? after : after.slice(0, next + 4);
  return section
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| ") && !line.includes("|---"))
    .slice(1)
    .map((line): AuditEntry => {
      const cells = splitMarkdownRow(line);
      return {
        name: cells[0] ?? "",
        category: cells[1] ?? "",
        status: cells[2] ?? "",
        primaryType: cells[6] ?? "",
        severity: cells[7] ?? "",
        suggested: cells[8] ?? "",
        slug: cells[9] ?? "",
        reason: cells[10] ?? ""
      };
    })
    .filter((entry) => entry.slug && entry.slug !== "-");
}

function buildActions(reportText: string) {
  const actions: Action[] = [];
  const seen = new Set<string>();

  const add = (action: Action) => {
    const key = `${action.kind}:${action.slug}`;
    if (seen.has(key)) return;
    seen.add(key);
    actions.push(action);
  };

  for (const entry of sectionRows(reportText, "Move Candidates")) {
    if (INVESTIGATE_SLUGS.has(entry.slug)) continue;
    if (!entry.suggested || entry.suggested === "-") continue;
    add({
      kind: "move",
      slug: entry.slug,
      from: entry.category,
      to: entry.suggested,
      reason: `Audit move candidate: ${entry.reason}`
    });
  }

  for (const entry of sectionRows(reportText, "Manual Review")) {
    if (INVESTIGATE_SLUGS.has(entry.slug)) continue;
    const approvedPair =
      (entry.category === "bar" && entry.suggested === "restaurant") ||
      (entry.category === "cafe" && entry.suggested === "restaurant") ||
      (entry.category === "restaurant" && entry.suggested === "bar") ||
      (entry.category === "nightlife" && entry.suggested === "bar");
    if (!approvedPair) continue;
    add({
      kind: "move",
      slug: entry.slug,
      from: entry.category,
      to: entry.suggested,
      reason: `Manual validation from audit review: ${entry.reason}`
    });
  }

  for (const entry of sectionRows(reportText, "Exclude Candidates")) {
    if (INVESTIGATE_SLUGS.has(entry.slug)) continue;
    add({
      kind: "hide",
      slug: entry.slug,
      from: entry.category,
      reason: `Audit exclude candidate: ${entry.reason}`
    });
  }

  for (const action of EXTRA_HIDES) add(action);
  return actions;
}

function nameOf(row: BusinessRow | null) {
  return row?.display_name?.trim() || row?.name?.trim() || "-";
}

function renderReport(reportPath: string, results: Result[], apply: boolean) {
  const counts = results.reduce<Record<string, number>>((acc, result) => {
    acc[result.status] = (acc[result.status] ?? 0) + 1;
    return acc;
  }, {});
  return [
    "# Active Category Validity Apply Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${apply ? "APPLY" : "DRY RUN"}`,
    `Source report: ${reportPath}`,
    "",
    "## Summary",
    "",
    ...Object.entries(counts)
      .sort()
      .map(([status, count]) => `- ${status}: ${count}`),
    "",
    "## Results",
    "",
    "| Action | Slug | Name | From | To | Status | Note |",
    "|---|---|---|---|---|---|---|",
    ...results.map((result) =>
      `| ${result.action} | \`${result.slug}\` | ${result.name.replace(/\|/g, "/")} | ${result.from} | ${result.to} | ${result.status} | ${result.note.replace(/\|/g, "/")} |`
    ),
    ""
  ].join("\n");
}

async function fetchBySlug(supabase: ReturnType<typeof createSupabaseClient>, slug: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id,slug,name,display_name,category,status,primary_type")
    .eq("slug", slug);
  if (error) throw error;
  return (data ?? []) as BusinessRow[];
}

async function applyAction(supabase: ReturnType<typeof createSupabaseClient>, action: Action, apply: boolean): Promise<Result> {
  const rows = await fetchBySlug(supabase, action.slug);
  if (rows.length === 0) {
    return { action: action.kind, slug: action.slug, name: "-", from: action.kind === "move" ? action.from : action.from ?? "-", to: action.kind === "move" ? action.to : "hidden", status: "missing", note: "Slug not found." };
  }
  if (rows.length > 1) {
    return { action: action.kind, slug: action.slug, name: rows.map(nameOf).join("; "), from: rows.map((row) => row.category ?? "-").join("; "), to: action.kind === "move" ? action.to : "hidden", status: "conflict", note: "Multiple rows share this slug; skipped." };
  }

  const row = rows[0];
  if (action.kind === "move") {
    if (row.category !== action.from) {
      return { action: "move", slug: action.slug, name: nameOf(row), from: row.category ?? "-", to: action.to, status: row.category === action.to ? "skipped" : "conflict", note: row.category === action.to ? "Already in target category." : `Expected ${action.from}, found ${row.category ?? "-"}.` };
    }
    if (!apply) {
      return { action: "move", slug: action.slug, name: nameOf(row), from: action.from, to: action.to, status: "planned", note: action.reason };
    }
    const { error } = await supabase.from("businesses").update({ category: action.to }).eq("id", row.id);
    return { action: "move", slug: action.slug, name: nameOf(row), from: action.from, to: action.to, status: error ? "error" : "applied", note: error?.message ?? action.reason };
  }

  if (row.status === "hidden") {
    return { action: "hide", slug: action.slug, name: nameOf(row), from: row.category ?? "-", to: "hidden", status: "skipped", note: "Already hidden." };
  }
  if (action.from && row.category !== action.from) {
    return { action: "hide", slug: action.slug, name: nameOf(row), from: row.category ?? "-", to: "hidden", status: "conflict", note: `Expected category ${action.from}, found ${row.category ?? "-"}.` };
  }
  if (!apply) {
    return { action: "hide", slug: action.slug, name: nameOf(row), from: row.category ?? "-", to: "hidden", status: "planned", note: action.reason };
  }
  const { error } = await supabase.from("businesses").update({ status: "hidden" }).eq("id", row.id);
  return { action: "hide", slug: action.slug, name: nameOf(row), from: row.category ?? "-", to: "hidden", status: error ? "error" : "applied", note: error?.message ?? action.reason };
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const reportPath = argValue("report") ?? latestReportPath();
  const reportText = readFileSync(reportPath, "utf8");
  const actions = buildActions(reportText);
  const supabase = createSupabaseClient();
  const results: Result[] = [];

  for (const action of actions) {
    results.push(await applyAction(supabase, action, apply));
  }

  if (!existsSync("reports")) mkdirSync("reports");
  const outputPath = join("reports", `active-category-validity-${apply ? "apply" : "dry-run"}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(outputPath, renderReport(reportPath, results, apply), "utf8");

  const counts = results.reduce<Record<string, number>>((acc, result) => {
    acc[result.status] = (acc[result.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", source: reportPath, actions: actions.length, counts, outputPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
