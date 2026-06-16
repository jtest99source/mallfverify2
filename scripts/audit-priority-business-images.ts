import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

type PriorityBusinessRow = {
  display_name: string | null;
  name: string;
  category: string;
  authority_score: number | null;
  image_status: string | null;
  primary_image_url: string | null;
  website: string | null;
};

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

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function hasValue(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function percent(value: number, total: number) {
  return total ? Math.round((value / total) * 10000) / 100 : 0;
}

function markdownValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function renderMarkdown(report: {
  generated_at: string;
  totals: {
    total_priority_businesses: number;
    with_image: number;
    without_image: number;
    coverage_percent: number;
  };
  businesses: Array<{
    display_name: string;
    category: string;
    authority_score: number | null;
    image_status: string | null;
    primary_image_url: string | null;
    website: string | null;
  }>;
}) {
  return [
    "# Priority Business Image Audit",
    "",
    `Generated: ${report.generated_at}`,
    "",
    "Priority definition: `published` and `authority_score >= 170`.",
    "",
    "## Totals",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Total priority businesses | ${report.totals.total_priority_businesses} |`,
    `| With image | ${report.totals.with_image} |`,
    `| Without image | ${report.totals.without_image} |`,
    `| Coverage | ${report.totals.coverage_percent}% |`,
    "",
    "## Priority Businesses",
    "",
    "| # | Display name | Category | Authority | Image status | Primary image URL | Website |",
    "|---:|---|---|---:|---|---|---|",
    ...report.businesses.map((business, index) =>
      `| ${index + 1} | ${markdownValue(business.display_name)} | ${markdownValue(business.category)} | ${markdownValue(business.authority_score)} | ${markdownValue(business.image_status)} | ${markdownValue(business.primary_image_url)} | ${markdownValue(business.website)} |`
    ),
    ""
  ].join("\n");
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("display_name,name,category,authority_score,image_status,primary_image_url,website")
    .eq("status", "published")
    .gte("authority_score", 170)
    .order("authority_score", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Cannot audit priority business images. Details: ${error.message}`);
  }

  const rows = (data ?? []) as PriorityBusinessRow[];
  const withImage = rows.filter((row) => hasValue(row.primary_image_url)).length;
  const report = {
    generated_at: new Date().toISOString(),
    totals: {
      total_priority_businesses: rows.length,
      with_image: withImage,
      without_image: rows.length - withImage,
      coverage_percent: percent(withImage, rows.length)
    },
    businesses: rows.map((row) => ({
      display_name: row.display_name || row.name,
      category: row.category,
      authority_score: row.authority_score,
      image_status: row.image_status,
      primary_image_url: row.primary_image_url,
      website: row.website
    }))
  };

  mkdirSync("reports", { recursive: true });
  const markdownPath = "reports/priority-business-images-audit.md";
  const jsonPath = "reports/priority-business-images-audit.json";
  writeFileSync(markdownPath, renderMarkdown(report));
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(JSON.stringify({
    ...report.totals,
    report_files: {
      markdown: markdownPath,
      json: jsonPath
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
