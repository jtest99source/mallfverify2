import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

type BusinessImageAuditRow = {
  id: string;
  display_name: string | null;
  name: string;
  category: string;
  status: string | null;
  website: string | null;
  website_type: string | null;
  area: string | null;
  rating: number | null;
  reviews_count: number | null;
  authority_score: number | null;
  primary_image_url: string | null;
  image_candidate_urls: unknown[] | null;
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

function candidateCount(row: BusinessImageAuditRow) {
  return Array.isArray(row.image_candidate_urls) ? row.image_candidate_urls.length : 0;
}

function roundPercent(value: number) {
  return Math.round(value * 10000) / 100;
}

function sortByPriority(a: BusinessImageAuditRow, b: BusinessImageAuditRow) {
  return (
    (b.authority_score ?? -1) - (a.authority_score ?? -1) ||
    (b.reviews_count ?? -1) - (a.reviews_count ?? -1) ||
    (b.rating ?? -1) - (a.rating ?? -1)
  );
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|");
}

function renderMarkdown(report: {
  generated_at: string;
  totals: {
    total_businesses_published_premium: number;
    with_primary_image_url: number;
    without_primary_image_url: number;
    with_image_candidate_urls: number;
    without_image_candidate_urls: number;
  };
  by_category: Array<{
    category: string;
    total_published_premium: number;
    with_image: number;
    without_image: number;
    coverage_percent: number;
  }>;
  top_100_without_image: Array<{
    id: string;
    display_name: string;
    category: string;
    status: string | null;
    website: string | null;
    website_type: string | null;
    area: string | null;
    authority_score: number | null;
    reviews_count: number | null;
    rating: number | null;
    image_candidate_urls_count: number;
  }>;
  diagnosis: {
    without_image_with_official_website: number;
    without_image_with_instagram_facebook_tiktok: number;
    without_image_without_website: number;
  };
}) {
  const lines = [
    "# Business Images Audit",
    "",
    `Generated: ${report.generated_at}`,
    "",
    "## Totals",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Total businesses published/premium | ${report.totals.total_businesses_published_premium} |`,
    `| With primary_image_url | ${report.totals.with_primary_image_url} |`,
    `| Without primary_image_url | ${report.totals.without_primary_image_url} |`,
    `| With image_candidate_urls | ${report.totals.with_image_candidate_urls} |`,
    `| Without image_candidate_urls | ${report.totals.without_image_candidate_urls} |`,
    "",
    "## Breakdown By Category",
    "",
    "| Category | Total | With image | Without image | Coverage |",
    "|---|---:|---:|---:|---:|",
    ...report.by_category.map((row) =>
      `| ${formatValue(row.category)} | ${row.total_published_premium} | ${row.with_image} | ${row.without_image} | ${row.coverage_percent}% |`
    ),
    "",
    "## Diagnosis",
    "",
    "| Segment | Count |",
    "|---|---:|",
    `| Without image + official website | ${report.diagnosis.without_image_with_official_website} |`,
    `| Without image + Instagram/Facebook/TikTok | ${report.diagnosis.without_image_with_instagram_facebook_tiktok} |`,
    `| Without image + no website | ${report.diagnosis.without_image_without_website} |`,
    "",
    "## Top 100 Without Image",
    "",
    "| # | ID | Display name | Category | Status | Website type | Area | Authority | Reviews | Rating | Candidates | Website |",
    "|---:|---|---|---|---|---|---|---:|---:|---:|---:|---|",
    ...report.top_100_without_image.map((row, index) =>
      `| ${index + 1} | ${formatValue(row.id)} | ${formatValue(row.display_name)} | ${formatValue(row.category)} | ${formatValue(row.status)} | ${formatValue(row.website_type)} | ${formatValue(row.area)} | ${formatValue(row.authority_score)} | ${formatValue(row.reviews_count)} | ${formatValue(row.rating)} | ${row.image_candidate_urls_count} | ${formatValue(row.website)} |`
    ),
    ""
  ];

  return lines.join("\n");
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("id,display_name,name,category,status,website,website_type,area,rating,reviews_count,authority_score,primary_image_url,image_candidate_urls")
    .in("status", ["published", "premium"])
    .order("authority_score", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Cannot audit business images. Apply migrations 008 and 009 first if image fields are missing. Details: ${error.message}`);
  }

  const rows = (data ?? []) as BusinessImageAuditRow[];
  const withImage = rows.filter((row) => hasValue(row.primary_image_url));
  const withoutImage = rows.filter((row) => !hasValue(row.primary_image_url));
  const withCandidates = rows.filter((row) => candidateCount(row) > 0);
  const withoutCandidates = rows.filter((row) => candidateCount(row) === 0);

  const categoryMap = new Map<string, BusinessImageAuditRow[]>();
  for (const row of rows) {
    categoryMap.set(row.category, [...(categoryMap.get(row.category) ?? []), row]);
  }

  const byCategory = Array.from(categoryMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, categoryRows]) => {
      const categoryWithImage = categoryRows.filter((row) => hasValue(row.primary_image_url)).length;
      const total = categoryRows.length;
      return {
        category,
        total_published_premium: total,
        with_image: categoryWithImage,
        without_image: total - categoryWithImage,
        coverage_percent: total ? roundPercent(categoryWithImage / total) : 0
      };
    });

  const socialTypes = new Set(["instagram", "facebook", "tiktok"]);
  const top100WithoutImage = withoutImage
    .sort(sortByPriority)
    .slice(0, 100)
    .map((row) => ({
      id: row.id,
      display_name: row.display_name || row.name,
      category: row.category,
      status: row.status,
      website: row.website,
      website_type: row.website_type,
      area: row.area,
      authority_score: row.authority_score,
      reviews_count: row.reviews_count,
      rating: row.rating,
      image_candidate_urls_count: candidateCount(row)
    }));

  const report = {
    generated_at: new Date().toISOString(),
    totals: {
      total_businesses_published_premium: rows.length,
      with_primary_image_url: withImage.length,
      without_primary_image_url: withoutImage.length,
      with_image_candidate_urls: withCandidates.length,
      without_image_candidate_urls: withoutCandidates.length
    },
    by_category: byCategory,
    top_100_without_image: top100WithoutImage,
    diagnosis: {
      without_image_with_official_website: withoutImage.filter((row) => row.website_type === "official_website").length,
      without_image_with_instagram_facebook_tiktok: withoutImage.filter((row) => socialTypes.has(row.website_type ?? "")).length,
      without_image_without_website: withoutImage.filter((row) => !hasValue(row.website)).length
    }
  };

  mkdirSync("reports", { recursive: true });
  const jsonPath = "reports/business-images-audit.json";
  const markdownPath = "reports/business-images-audit.md";
  writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(markdownPath, renderMarkdown(report));

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
