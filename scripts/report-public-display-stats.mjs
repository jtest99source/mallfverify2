import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { categoryConfigs, publicCategorySlugs } from "../src/lib/data.ts";

const PAGE_SIZE = 1000;
const PUBLIC_STATUSES = ["published", "premium"];

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

function displayMillion(value) {
  return `${(value / 1_000_000).toFixed(1)}M`;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const publicBusinessCategories = new Set(publicCategorySlugs.map((slug) => categoryConfigs[slug].businessCategory));
  const countsByCategory = {};
  const countsByStatus = {};
  const rowsOutsidePublicCategories = {};
  let publishedBusinesses = 0;
  let analyzedReviews = 0;
  const activeCategories = new Set();

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("category,status,reviews_count")
      .in("status", PUBLIC_STATUSES)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;

    const page = data ?? [];
    for (const row of page) {
      countsByStatus[row.status] = (countsByStatus[row.status] ?? 0) + 1;
      if (!publicBusinessCategories.has(row.category)) {
        rowsOutsidePublicCategories[row.category] = (rowsOutsidePublicCategories[row.category] ?? 0) + 1;
        continue;
      }
      publishedBusinesses += 1;
      analyzedReviews += row.reviews_count ?? 0;
      activeCategories.add(row.category);
      countsByCategory[row.category] = (countsByCategory[row.category] ?? 0) + 1;
    }

    if (page.length < PAGE_SIZE) break;
  }

  console.log(JSON.stringify({
    display: {
      publishedBusinesses,
      analyzedReviews,
      analyzedReviewsShort: displayMillion(analyzedReviews),
      activeCategories: activeCategories.size,
      configuredPublicCategorySlugs: publicCategorySlugs.length
    },
    countsByCategory: Object.fromEntries(Object.entries(countsByCategory).sort((a, b) => b[1] - a[1])),
    countsByStatus,
    rowsOutsidePublicCategories
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
