import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

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

function argValue(name) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function businessCategoryForImportCategory(category) {
  if (category === "real-estate") return "real-estate";
  if (category === "healthcare") return "healthcare";
  if (category === "spas") return "spa";
  if (category === "nightlife") return "nightlife";
  if (category === "gyms") return "gym";
  if (category === "boats") return "boat-rental";
  if (category === "activities") return "activity";
  if (category === "car-dealers") return "car-dealer";
  if (category === "cafes") return "cafe";
  if (category === "bakeries") return "bakery";
  if (category === "restaurants") return "restaurant";
  if (category === "hotels") return "hotel";
  if (category === "bars") return "bar";
  if (category === "casinos") return "casino";
  if (category === "vets") return "veterinarian";
  return category;
}

async function fetchExistingBusinesses(supabase, category) {
  const rows = [];
  const businessCategory = businessCategoryForImportCategory(category);
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("businesses")
      .select("google_place_id,slug,status,name,display_name,category,address,website")
      .eq("category", businessCategory)
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

function loadApprovedRows(path) {
  if (!path) return [];
  if (!existsSync(path)) throw new Error(`Approved preview file not found: ${path}`);
  return JSON.parse(readFileSync(path, "utf8"));
}

function exclusionReason(row, existingByPlaceId, existingByName, approvedByPlaceId, approvedByName) {
  if (row.google_place_id && existingByPlaceId.has(row.google_place_id)) {
    const existing = existingByPlaceId.get(row.google_place_id);
    return `already in DB: ${existing.status}:${existing.slug}`;
  }
  const normalizedName = normalize(row.name);
  if (normalizedName && existingByName.has(normalizedName)) {
    const existing = existingByName.get(normalizedName);
    return `already in DB by name: ${existing.status}:${existing.slug}`;
  }
  if (row.google_place_id && approvedByPlaceId.has(row.google_place_id)) {
    return "already in approved import preview";
  }
  if (normalizedName && approvedByName.has(normalizedName)) {
    return "already in approved import preview by name";
  }
  return null;
}

async function main() {
  loadLocalEnv();

  const category = argValue("category");
  const previewPath = argValue("preview");
  const approvedPath = argValue("approved");
  if (!category || !previewPath) {
    throw new Error("Usage: node scripts/report-topup-new-candidates.mjs --category=healthcare --preview=data/import-previews/file.json [--approved=data/import-previews/approved.json]");
  }

  const supabase = createSupabaseClient();
  const previewRows = JSON.parse(readFileSync(previewPath, "utf8"));
  const approvedRows = loadApprovedRows(approvedPath);
  const existingRows = await fetchExistingBusinesses(supabase, category);

  const existingByPlaceId = new Map(existingRows.filter((row) => row.google_place_id).map((row) => [row.google_place_id, row]));
  const existingByName = new Map(existingRows.map((row) => [normalize(row.display_name || row.name), row]).filter(([key]) => key));
  const approvedByPlaceId = new Set(approvedRows.map((row) => row.google_place_id).filter(Boolean));
  const approvedByName = new Set(approvedRows.map((row) => normalize(row.name)).filter(Boolean));

  const newRows = [];
  const excludedRows = [];
  for (const row of previewRows) {
    const reason = exclusionReason(row, existingByPlaceId, existingByName, approvedByPlaceId, approvedByName);
    if (reason) excludedRows.push({ ...row, exclusion_reason: reason });
    else newRows.push(row);
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `${category}-general-topup-new-candidates-${stamp}.md`);
  const lines = [
    `# ${category} General Top-Up New Candidates`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Source preview: ${previewPath}`,
    approvedPath ? `- Approved preview excluded: ${approvedPath}` : "- Approved preview excluded: -",
    `- Source preview rows: ${previewRows.length}`,
    `- Existing/approved rows removed: ${excludedRows.length}`,
    `- New rows for Claude review: ${newRows.length}`,
    "",
    "## New Candidates For Claude Review",
    "",
    "| Name | Rating | Reviews | Type | Website | Address |",
    "|---|---:|---:|---|---|---|",
    ...newRows.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
    "",
    "## Removed As Existing Or Already Approved",
    "",
    "| Reason | Name | Rating | Reviews | Type | Website | Address |",
    "|---|---|---:|---:|---|---|---|",
    ...excludedRows.map((row) => `| ${fmt(row.exclusion_reason)} | ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`)
  ];

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({
    report: reportPath,
    source_preview: previewPath,
    approved_excluded: approvedPath ?? null,
    source_rows: previewRows.length,
    removed_existing_or_approved: excludedRows.length,
    new_rows: newRows.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
