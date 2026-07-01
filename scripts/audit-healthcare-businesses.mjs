import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;
const OUTPUT_DIR = "reports";
const PUBLIC_STATUSES = new Set(["published", "premium"]);

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

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function rawTypes(row) {
  const raw = row.raw_google_place;
  const types = raw && Array.isArray(raw.types) ? raw.types.filter((item) => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...types].filter(Boolean))];
}

function typeFamily(row) {
  const types = rawTypes(row);
  const text = `${publicName(row)} ${row.website ?? ""}`.toLowerCase();
  if (types.some((type) => type.includes("dentist") || type.includes("dental")) || /dent|zahnarzt|dental/.test(text)) return "dentist";
  if (types.some((type) => ["hospital", "medical_clinic", "medical_center", "urgent_care_center"].includes(type)) || /clinic|clinica|clínica|medical|hospital|policlinic|policl[ií]nic/.test(text)) return "clinic";
  if (types.some((type) => ["doctor", "health"].includes(type)) || /doctor|arzt|m[eé]dico|medico|gp\b/.test(text)) return "doctor";
  if (types.some((type) => type.includes("physiotherapist") || type.includes("chiropractor")) || /fisio|physio|fisioterapia|chiro/.test(text)) return "physio";
  if (/aesthetic|est[eé]tica|botox|derma|laser|skin|capilar|hair/.test(text)) return "aesthetic";
  return "other";
}

function languageSignal(row) {
  const text = [
    publicName(row),
    row.website,
    row.raw_google_place?.websiteUri,
    row.raw_google_place?.displayName?.text,
    row.address
  ].filter(Boolean).join(" ").toLowerCase();

  const en = /english|british|international|expat|medical centre|medical center|doctor mallorca|gp|clinic|dental clinic|mallorcadent|doctor spain|portals nous medical|juaneda|palma clinic/.test(text);
  const de = /deutsch|deutscher|deutsche|arzt|ärzte|zahnarzt|zahn|praxis|klinik|dr\. med|centro medico aleman|alem[aá]n/.test(text);
  if (en && de) return "EN+DE signal";
  if (de) return "DE signal";
  if (en) return "EN signal";
  return "No visible EN/DE signal";
}

function issues(row) {
  const list = [];
  const family = typeFamily(row);
  const types = rawTypes(row);
  const photos = Math.max(
    Array.isArray(row.place_photos) ? row.place_photos.length : 0,
    Array.isArray(row.photo_names) ? row.photo_names.length : 0,
    row.primary_photo_name ? 1 : 0,
    row.primary_image_url ? 1 : 0
  );

  if (!["clinic", "doctor", "dentist", "physio"].includes(family)) list.push(`weak_healthcare_signal:${family}:${types.join(",") || "-"}`);
  if (family === "aesthetic") list.push("aesthetic_or_beauty_healthcare_review");
  if (!row.website) list.push("missing_website");
  if (!row.phone) list.push("missing_phone");
  if (!photos) list.push("missing_photos");
  if (!row.primary_image_url && !row.primary_photo_name) list.push("missing_primary_image");
  if (!row.place_reviews || !Array.isArray(row.place_reviews) || row.place_reviews.length < 3) list.push("few_place_reviews");
  return list;
}

function readiness(row) {
  if (!PUBLIC_STATUSES.has(row.status)) return "Not public";
  const family = typeFamily(row);
  const signal = languageSignal(row);
  const hasSignal = signal !== "No visible EN/DE signal";
  const reviews = row.reviews_count ?? 0;
  const rating = row.rating ?? 0;
  const issue = issues(row);
  if (!["clinic", "doctor", "dentist", "physio"].includes(family) || issue.some((item) => item.startsWith("weak_healthcare_signal") || item === "aesthetic_or_beauty_healthcare_review")) return "Fix/review before outreach";
  if (hasSignal && rating >= 4.3 && reviews >= 15) return "Good candidate";
  if (hasSignal && rating >= 4.0 && reviews >= 8) return "Near-ready";
  return "Keep as business, verify language before outreach";
}

function groupCount(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row) || "-";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

async function fetchRows(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("slug,name,display_name,status,category,area,city,municipality,address,website,phone,rating,reviews_count,google_place_id,primary_type,raw_google_place,photo_names,primary_photo_name,place_photos,primary_image_url,place_reviews")
      .eq("category", "healthcare")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < PAGE_SIZE) break;
  }
  return rows;
}

function writeReport(rows) {
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const publicRows = rows.filter((row) => PUBLIC_STATUSES.has(row.status));
  const issueRows = rows.map((row) => ({ row, issues: issues(row) })).filter((item) => item.issues.length);
  const publicCandidates = publicRows
    .map((row) => ({ row, family: typeFamily(row), signal: languageSignal(row), readiness: readiness(row), issues: issues(row) }))
    .sort((a, b) => (b.row.reviews_count ?? 0) - (a.row.reviews_count ?? 0));

  const issueCounts = groupCount(issueRows.flatMap((item) => item.issues.map((issue) => ({ issue }))), (item) => item.issue);
  const path = join(OUTPUT_DIR, `healthcare-business-audit-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  const lines = [
    "# Healthcare Business Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "|---|---:|",
    `| Total healthcare businesses | ${rows.length} |`,
    `| Public healthcare businesses | ${publicRows.length} |`,
    `| With visible EN/DE signal | ${publicRows.filter((row) => languageSignal(row) !== "No visible EN/DE signal").length} |`,
    `| Good or near-ready public | ${publicCandidates.filter((item) => item.readiness === "Good candidate" || item.readiness === "Near-ready").length} |`,
    `| Needs fix/review public | ${publicCandidates.filter((item) => item.readiness === "Fix/review before outreach").length} |`,
    "",
    "## By Status",
    "",
    "| Status | Count |",
    "|---|---:|",
    ...groupCount(rows, (row) => row.status).map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Public By Type Family",
    "",
    "| Type family | Count |",
    "|---|---:|",
    ...groupCount(publicRows, typeFamily).map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Public By Area",
    "",
    "| Area | Count |",
    "|---|---:|",
    ...groupCount(publicRows, (row) => row.city || row.area || row.municipality).slice(0, 40).map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Issue Counts",
    "",
    "| Issue | Count |",
    "|---|---:|",
    ...issueCounts.map(([key, count]) => `| ${fmt(key)} | ${count} |`),
    "",
    "## Public Candidates",
    "",
    "| Name | Family | Signal | Readiness | Status | Area | Rating | Reviews | Website | Slug |",
    "|---|---|---|---|---|---|---:|---:|---|---|",
    ...publicCandidates.map(({ row, family, signal, readiness }) => `| ${fmt(publicName(row))} | ${fmt(family)} | ${fmt(signal)} | ${fmt(readiness)} | ${fmt(row.status)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.website)} | ${fmt(row.slug)} |`)
  ];
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  return path;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const rows = await fetchRows(supabase);
  const report = writeReport(rows);
  console.log(JSON.stringify({ report, rows: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
