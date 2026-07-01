import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_LIMIT = 500;
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

function argValue(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length).trim() : null;
}

function parsePositiveInt(value, fallback) {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parseArgs() {
  return {
    apply: process.argv.includes("--apply"),
    category: argValue("category"),
    updatedAt: argValue("updated-at"),
    limit: Math.min(parsePositiveInt(argValue("limit"), DEFAULT_LIMIT), 5000)
  };
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function getPhotoName(row) {
  if (hasText(row.primary_photo_name)) return row.primary_photo_name.trim();
  const names = arrayValue(row.photo_names).filter(hasText);
  if (names.length) return names[0].trim();
  const photos = arrayValue(row.place_photos);
  const photo = photos.find((item) => item && hasText(item.name));
  return photo?.name?.trim() ?? null;
}

function getPhotoCredit(row, photoName) {
  const photos = arrayValue(row.place_photos);
  const photo = photos.find((item) => item?.name === photoName);
  return hasText(photo?.credit) ? photo.credit.trim() : "Google Places";
}

async function fetchPhotoUri(apiKey, name) {
  const url = new URL(`https://places.googleapis.com/v1/${name}/media`);
  url.searchParams.set("maxWidthPx", "1600");
  url.searchParams.set("skipHttpRedirect", "true");

  const response = await fetch(url, { headers: { "X-Goog-Api-Key": apiKey } });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google photo media ${response.status}: ${body}`);
  }

  const media = await response.json();
  return typeof media.photoUri === "string" && media.photoUri.trim() ? media.photoUri : null;
}

async function fetchRows(supabase, options) {
  const rows = [];

  for (let from = 0; rows.length < options.limit; from += PAGE_SIZE) {
    let query = supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,updated_at,primary_image_url,primary_image_source,primary_image_credit,primary_photo_name,photo_names,place_photos,rating,reviews_count")
      .in("status", PUBLIC_STATUSES)
      .is("primary_image_url", null)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);

    if (options.category) query = query.eq("category", options.category);
    if (options.updatedAt) query = query.eq("updated_at", options.updatedAt);

    const { data, error } = await query;
    if (error) throw new Error(`Cannot fetch businesses: ${error.message}`);

    const page = data ?? [];
    for (const row of page) {
      if (getPhotoName(row)) rows.push(row);
      if (rows.length >= options.limit) break;
    }

    if (page.length < PAGE_SIZE) break;
  }

  return rows;
}

function markdownValue(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|");
}

function writeReport({ options, processed, assigned, errors, skippedWithoutUri, rows }) {
  const now = new Date().toISOString();
  mkdirSync("reports", { recursive: true });
  const file = join("reports", `google-place-primary-images-${now.replace(/[:.]/g, "-")}.md`);

  const lines = [
    "# Google Place Primary Images",
    "",
    `Generated: ${now}`,
    `Dry run: ${options.apply ? "no" : "yes"}`,
    `Category: ${options.category ?? "all"}`,
    `Updated at filter: ${options.updatedAt ?? "none"}`,
    "",
    "## Totals",
    "",
    `- Candidates with Google photo names: ${rows.length}`,
    `- Processed: ${processed}`,
    `- Assigned: ${assigned}`,
    `- Skipped without media URL: ${skippedWithoutUri}`,
    `- Errors: ${errors.length}`,
    "",
    "## Candidates",
    "",
    "| Name | Category | Rating | Reviews | Updated at | Slug |",
    "| --- | --- | ---: | ---: | --- | --- |",
    ...rows.slice(0, 500).map((row) => {
      const name = row.display_name || row.name;
      return `| ${markdownValue(name)} | ${markdownValue(row.category)} | ${markdownValue(row.rating)} | ${markdownValue(row.reviews_count)} | ${markdownValue(row.updated_at)} | ${markdownValue(row.slug)} |`;
    }),
    "",
    "## Errors",
    "",
    ...errors.map((error) => `- ${markdownValue(error.name)} (${markdownValue(error.slug)}): ${markdownValue(error.message)}`)
  ];

  writeFileSync(file, `${lines.join("\n")}\n`, "utf8");
  return file;
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const supabase = createSupabaseClient();
  const rows = await fetchRows(supabase, options);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (options.apply && !apiKey) {
    throw new Error("Missing GOOGLE_PLACES_API_KEY. It is required when using --apply.");
  }

  let processed = 0;
  let assigned = 0;
  let skippedWithoutUri = 0;
  const errors = [];

  if (options.apply) {
    for (const row of rows) {
      processed += 1;
      const name = getPhotoName(row);
      if (!name) continue;

      try {
        const photoUri = await fetchPhotoUri(apiKey, name);
        if (!photoUri) {
          skippedWithoutUri += 1;
          continue;
        }

        const { error } = await supabase
          .from("businesses")
          .update({
            primary_image_url: photoUri,
            primary_image_source: "google_places",
            primary_image_credit: getPhotoCredit(row, name),
            primary_photo_name: name,
            image_status: "google_places"
          })
          .eq("id", row.id)
          .is("primary_image_url", null);

        if (error) throw error;
        assigned += 1;
      } catch (error) {
        errors.push({
          name: row.display_name || row.name,
          slug: row.slug,
          message: error.message
        });
      }
    }
  }

  const report = writeReport({ options, processed, assigned, errors, skippedWithoutUri, rows });
  console.log(JSON.stringify({
    report,
    dry_run: !options.apply,
    candidates_with_google_photo_names: rows.length,
    processed,
    assigned,
    skipped_without_media_url: skippedWithoutUri,
    errors: errors.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
