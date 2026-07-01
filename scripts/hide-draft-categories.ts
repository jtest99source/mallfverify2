import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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

function parseCategories() {
  const value = process.argv.find((arg) => arg.startsWith("--categories="))?.split("=")[1];
  return (value ?? "")
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean);
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const categories = parseCategories();
  if (categories.length === 0) throw new Error("Pass --categories=spa,gym");

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("id,slug,name,display_name,category,status,rating,reviews_count,primary_type")
    .in("category", categories)
    .eq("status", "draft")
    .order("category")
    .order("reviews_count", { ascending: false });

  if (error) throw error;
  const rows = data ?? [];

  if (apply && rows.length > 0) {
    const { error: updateError } = await supabase
      .from("businesses")
      .update({ status: "hidden" })
      .in("id", rows.map((row) => row.id));
    if (updateError) throw updateError;
  }

  if (!existsSync("reports")) mkdirSync("reports");
  const reportPath = join(
    "reports",
    `hide-draft-categories-${apply ? "apply" : "dry-run"}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`
  );

  writeFileSync(reportPath, [
    "# Hide Draft Categories Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${apply ? "APPLY" : "DRY RUN"}`,
    `Categories: ${categories.join(", ")}`,
    `Matched drafts: ${rows.length}`,
    "",
    "| Name | Category | Rating | Reviews | Type | Slug |",
    "|---|---|---:|---:|---|---|",
    ...rows.map((row) => `| ${row.display_name || row.name} | ${row.category} | ${row.rating ?? "-"} | ${row.reviews_count ?? "-"} | ${row.primary_type ?? "-"} | ${row.slug} |`),
    ""
  ].join("\n"), "utf8");

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    reportPath,
    matched: rows.length,
    by_category: rows.reduce<Record<string, number>>((counts, row) => {
      counts[row.category] = (counts[row.category] ?? 0) + 1;
      return counts;
    }, {})
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
