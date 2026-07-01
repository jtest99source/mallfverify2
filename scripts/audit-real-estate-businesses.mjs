import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;
const PUBLIC_STATUSES = new Set(["published", "premium"]);
const OUTPUT_DIR = "reports";

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

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function websiteHost(url) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function rawTypes(row) {
  const raw = row.raw_google_place;
  const types = raw && Array.isArray(raw.types) ? raw.types.filter((item) => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...types].filter(Boolean))];
}

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function hasExpectedRealEstateSignal(row) {
  const types = rawTypes(row);
  const text = `${publicName(row)} ${row.address ?? ""} ${row.website ?? ""}`.toLowerCase();
  return types.some((type) => type.includes("real_estate")) || /real estate|inmobiliaria|immobilien|property|properties|estate agent/.test(text);
}

function languageSignal(row) {
  const text = [
    publicName(row),
    row.website,
    websiteHost(row.website),
    row.raw_google_place?.websiteUri,
    row.raw_google_place?.displayName?.text
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hasEnglish = /real estate|property|properties|estates|luxury|international|sotheby|savills|christie|john taylor|agency|home in mallorca|mallorca homes|buy a home|living blue|first mallorca|charles marlow|palma realtor|pollentia properties|sandberg|remax|re\/max/.test(text);
  const hasGerman = /immobilien|haus|mietb[oö]rse|engel|v[oö]lkers|kensington|dahler|minkner|porta-mallorquina|mallorcaimmobilien|deutsch|german/.test(text);
  if (hasEnglish && hasGerman) return "EN+DE signal";
  if (hasGerman) return "DE signal";
  if (hasEnglish) return "EN signal";
  return "No visible EN/DE signal";
}

function issueList(row) {
  const issues = [];
  const types = rawTypes(row);
  const businessStatus = row.raw_google_place?.businessStatus;
  const photosCount = Math.max(
    Array.isArray(row.place_photos) ? row.place_photos.length : 0,
    Array.isArray(row.photo_names) ? row.photo_names.length : 0,
    row.primary_photo_name ? 1 : 0,
    row.primary_image_url ? 1 : 0
  );

  if (businessStatus === "CLOSED_PERMANENTLY" || businessStatus === "CLOSED_TEMPORARILY") issues.push("closed_on_google");
  if (!row.google_place_id) issues.push("missing_google_place_id");
  if (!hasExpectedRealEstateSignal(row)) issues.push(`weak_real_estate_signal:${types.join(",") || "no_types"}`);
  if (!row.website) issues.push("missing_website");
  if (!row.phone) issues.push("missing_phone");
  if (!row.primary_image_url && !row.primary_photo_name) issues.push("missing_primary_image");
  if (!photosCount) issues.push("missing_photos");
  if (!row.area || row.area === "Mallorca") issues.push("generic_area");
  if (typeof row.rating !== "number") issues.push("missing_rating");
  if (typeof row.reviews_count !== "number") issues.push("missing_reviews_count");
  if (typeof row.rating === "number" && row.rating < 3.9) issues.push("below_rating_threshold");
  if (typeof row.reviews_count === "number" && row.reviews_count < 8) issues.push("below_review_threshold");
  if (!row.editorial_generated_at) issues.push("missing_editorial");
  if (!row.review_themes || !Array.isArray(row.review_themes) || !row.review_themes.length) issues.push("missing_review_themes");
  if (!row.services || !Array.isArray(row.services) || !row.services.length) issues.push("missing_services");
  if (!row.featured_reviews || !Array.isArray(row.featured_reviews) || !row.featured_reviews.length) issues.push("missing_featured_reviews");
  return issues;
}

function readiness(row, issues) {
  const language = languageSignal(row);
  const hasLanguageSignal = language !== "No visible EN/DE signal";
  const hardIssues = issues.filter((issue) =>
    [
      "closed_on_google",
      "missing_google_place_id",
      "missing_website",
      "missing_primary_image",
      "generic_area",
      "missing_rating",
      "missing_reviews_count",
      "below_rating_threshold",
      "below_review_threshold"
    ].some((prefix) => issue.startsWith(prefix))
  );

  if (hardIssues.length) return "Fix/review before outreach";
  if (!hasLanguageSignal) return "Keep as business, verify language before outreach";
  if (!row.editorial_generated_at) return "Good candidate, needs editorial enrichment";
  return "Outreach-ready candidate";
}

async function fetchRealEstateRows() {
  const supabase = createSupabaseClient();
  const fields = [
    "id",
    "slug",
    "name",
    "display_name",
    "category",
    "status",
    "area",
    "city",
    "municipality",
    "address",
    "google_place_id",
    "rating",
    "reviews_count",
    "website",
    "phone",
    "google_maps_url",
    "primary_type",
    "primary_image_url",
    "primary_photo_name",
    "photo_names",
    "place_photos",
    "place_reviews",
    "review_themes",
    "services",
    "featured_reviews",
    "editorial_generated_at",
    "raw_google_place",
    "updated_at"
  ].join(",");

  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select(fields)
      .eq("category", "real-estate")
      .order("reviews_count", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

function groupCount(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row) || "Unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function duplicateRows(rows) {
  const groups = new Map();
  for (const row of rows) {
    const host = websiteHost(row.website);
    if (!host) continue;
    if (!groups.has(host)) groups.set(host, []);
    groups.get(host).push(row);
  }
  return [...groups.entries()]
    .filter(([, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}

function renderReport(rows) {
  const audited = rows.map((row) => {
    const issues = issueList(row);
    return { row, issues, readiness: readiness(row, issues), language: languageSignal(row) };
  });

  const publicRows = audited.filter(({ row }) => PUBLIC_STATUSES.has(row.status));
  const byStatus = groupCount(rows, (row) => row.status);
  const byLanguage = groupCount(audited, (item) => item.language);
  const byReadiness = groupCount(audited, (item) => item.readiness);
  const byArea = groupCount(rows.filter((row) => PUBLIC_STATUSES.has(row.status)), (row) => row.city || row.area || row.municipality).slice(0, 30);
  const issueCounts = groupCount(audited.flatMap((item) => item.issues.map((issue) => ({ issue }))), (item) => item.issue);
  const duplicates = duplicateRows(rows);

  const allOutreachCandidates = audited
    .filter((item) => item.readiness === "Outreach-ready candidate" || item.readiness === "Good candidate, needs editorial enrichment")
    .filter((item) => item.language !== "No visible EN/DE signal")
    .filter((item) => PUBLIC_STATUSES.has(item.row.status))
    .sort((a, b) => (b.row.reviews_count ?? 0) - (a.row.reviews_count ?? 0));
  const outreachCandidates = allOutreachCandidates.slice(0, 100);

  const needsReview = audited
    .filter((item) => item.readiness === "Fix/review before outreach")
    .sort((a, b) => (b.row.reviews_count ?? 0) - (a.row.reviews_count ?? 0))
    .slice(0, 100);

  const languageUnknown = audited
    .filter((item) => item.readiness === "Keep as business, verify language before outreach")
    .sort((a, b) => (b.row.reviews_count ?? 0) - (a.row.reviews_count ?? 0))
    .slice(0, 60);

  return [
    "# Real Estate Business Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Total real-estate businesses | ${rows.length} |`,
    `| Public real-estate businesses | ${publicRows.length} |`,
    `| With visible EN/DE signal | ${audited.filter((item) => item.language !== "No visible EN/DE signal").length} |`,
    `| Outreach-ready or near-ready | ${allOutreachCandidates.length} |`,
    `| Needs fix/review before outreach | ${audited.filter((item) => item.readiness === "Fix/review before outreach").length} |`,
    `| Website duplicate groups | ${duplicates.length} |`,
    "",
    "## By Status",
    "",
    "| Status | Count |",
    "|---|---:|",
    ...byStatus.map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## By Language Signal",
    "",
    "| Signal | Count |",
    "|---|---:|",
    ...byLanguage.map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## By Readiness",
    "",
    "| Readiness | Count |",
    "|---|---:|",
    ...byReadiness.map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Public Coverage By Area",
    "",
    "| Area | Public businesses |",
    "|---|---:|",
    ...byArea.map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Issue Counts",
    "",
    "| Issue | Count |",
    "|---|---:|",
    ...issueCounts.map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Outreach-Ready / Near-Ready Candidates",
    "",
    "| Name | Signal | Readiness | Status | Area | Rating | Reviews | Website | Slug |",
    "|---|---|---|---|---|---:|---:|---|---|",
    ...outreachCandidates.map(({ row, language, readiness: state }) =>
      `| ${fmt(publicName(row))} | ${fmt(language)} | ${fmt(state)} | ${fmt(row.status)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.website)} | ${fmt(row.slug)} |`
    ),
    "",
    "## Public Businesses To Review Before Outreach",
    "",
    "| Name | Status | Area | Rating | Reviews | Issues | Website | Slug |",
    "|---|---|---|---:|---:|---|---|---|",
    ...needsReview.map(({ row, issues }) =>
      `| ${fmt(publicName(row))} | ${fmt(row.status)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(issues.join(", "))} | ${fmt(row.website)} | ${fmt(row.slug)} |`
    ),
    "",
    "## Good Businesses With No Visible EN/DE Signal",
    "",
    "These can stay as business-directory entries, but should not enter outreach until language is confirmed.",
    "",
    "| Name | Status | Area | Rating | Reviews | Website | Slug |",
    "|---|---|---|---:|---:|---|---|",
    ...languageUnknown.map(({ row }) =>
      `| ${fmt(publicName(row))} | ${fmt(row.status)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.website)} | ${fmt(row.slug)} |`
    ),
    "",
    "## Website Duplicate Groups",
    "",
    "| Website host | Businesses |",
    "|---|---|",
    ...duplicates.map(([host, items]) =>
      `| ${fmt(host)} | ${fmt(items.map((item) => `${publicName(item)} (${item.status}, ${item.slug})`).join("; "))} |`
    ),
    "",
    "## Suggested Next Step",
    "",
    "1. Review the `Public Businesses To Review Before Outreach` table for bad fits, missing websites/images, weak location data or closed status.",
    "2. Use the `Outreach-Ready / Near-Ready Candidates` table as the first real-estate business outreach queue.",
    "3. Do not import new real-estate businesses until the existing public set is cleaned and the language fit is verified for outreach candidates.",
    ""
  ].join("\n");
}

async function main() {
  loadLocalEnv();
  const rows = await fetchRealEstateRows();
  const report = renderReport(rows);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `real-estate-business-audit-${stamp}.md`);
  writeFileSync(reportPath, `${report}\n`, "utf8");
  console.log(JSON.stringify({ reportPath, rows: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
