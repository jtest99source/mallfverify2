import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Confidence = "high" | "medium" | "low";

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  category: string | null;
  status: string | null;
  area: string | null;
  city: string | null;
  rating: number | null;
  reviews_count: number | null;
  primary_type: string | null;
  raw_google_place: Record<string, unknown> | null;
};

type Suggestion = {
  row: BusinessRow;
  suggestedCategory: string;
  confidence: Confidence;
  reason: string;
  types: string[];
};

const PAGE_SIZE = 250;
const PUBLIC_STATUSES = ["published", "premium"];

const CATEGORY_ORDER = [
  "restaurant",
  "hotel",
  "beach-club",
  "boat-rental",
  "activity",
  "beach",
  "bar",
  "cafe",
  "bakery",
  "rent-a-car",
  "car-dealer",
  "spa",
  "gym",
  "market",
  "local-shop",
  "museum",
  "route",
  "excursion"
];

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

function parseArgs() {
  const args = process.argv.slice(2);
  const confidence = args.find((arg) => arg.startsWith("--confidence="))?.slice("--confidence=".length) as Confidence | undefined;
  const safeConfidence: Confidence = confidence === "medium" || confidence === "low" ? confidence : "high";
  return {
    apply: args.includes("--apply"),
    includeDrafts: args.includes("--include-drafts"),
    confidence: safeConfidence
  };
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasType(types: string[], ...expected: string[]) {
  return types.some((type) => expected.some((item) => type === item || type.includes(item)));
}

function nameIncludes(row: BusinessRow, ...keywords: string[]) {
  const value = normalize(`${row.display_name ?? ""} ${row.name}`);
  return keywords.some((keyword) => value.includes(normalize(keyword)));
}

function looksLikeExcursionOperator(row: BusinessRow) {
  return nameIncludes(row, "tour", "excursion", "guided", "visita guiada");
}

function looksLikeBeachName(row: BusinessRow) {
  return nameIncludes(row, "cala ", "platja", "playa", "calo ", "beach");
}

function looksLikeEquipmentActivity(row: BusinessRow) {
  return nameIncludes(
    row,
    "bike",
    "bicycle",
    "buggy",
    "charter",
    "dive",
    "hipico",
    "horse",
    "jet ski",
    "paddle",
    "quad",
    "rancho",
    "rental",
    "surf",
    "cycling"
  );
}

function looksLikeGuidedDayPlan(row: BusinessRow) {
  return nameIncludes(row, "culinary tour", "food tour", "nature tour", "wine tour", "excursion");
}

function looksLikeBroadActivityTour(row: BusinessRow) {
  return nameIncludes(row, "adventure tour", "greentours");
}

function rawTypes(row: BusinessRow) {
  const raw = row.raw_google_place;
  const types = raw && Array.isArray(raw.types) ? raw.types.filter((item): item is string => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...types].filter(Boolean))];
}

function publicName(row: BusinessRow) {
  return row.display_name?.trim() || row.name;
}

function primaryType(row: BusinessRow) {
  return row.primary_type ?? "";
}

function hasStrongCurrentCategory(row: BusinessRow, types: string[]) {
  const current = row.category;
  if (current === "hotel" && hasType(types, "hotel", "lodging", "resort_hotel")) return true;
  if (current === "restaurant" && hasType(types, "restaurant", "mediterranean_restaurant", "spanish_restaurant", "tapas_restaurant", "pizza_restaurant")) return true;
  if (current === "beach-club" && (nameIncludes(row, "beach club", "chiringuito", "balneario") || hasType(types, "restaurant", "bar", "beach"))) return true;
  if (current === "rent-a-car" && (primaryType(row) === "car_rental" || nameIncludes(row, "rent", "rental", "alquiler"))) return true;
  if (current === "boat-rental" && nameIncludes(row, "boat", "charter", "yacht", "sail", "llaut", "barco", "jet ski")) return true;
  if (current === "beach" && (nameIncludes(row, "cala", "playa", "platja", "calo") || hasType(types, "beach", "public_bath", "tourist_attraction"))) return true;
  if (current === "activity" && hasType(types, "tourist_attraction", "tour_operator", "travel_agency", "amusement_park", "sports_activity_location", "sports_club", "winery", "farm")) return true;
  if (current === "activity" && nameIncludes(row, "beachvolley", "sup ", "ocean trails")) return true;
  if (current === "route" && nameIncludes(row, "faro", "mirador", "sendero", "ruta", "puig", "camino")) return true;
  return false;
}

function suggestCategory(row: BusinessRow): Suggestion | null {
  const current = row.category;
  const types = rawTypes(row);
  const primary = primaryType(row);
  const candidate = (suggestedCategory: string, confidence: Confidence, reason: string): Suggestion | null => {
    if (!suggestedCategory || suggestedCategory === current) return null;
    return { row, suggestedCategory, confidence, reason, types };
  };

  if (hasStrongCurrentCategory(row, types)) return null;

  if (primary === "car_rental" && looksLikeEquipmentActivity(row)) return null;
  if (primary === "car_rental") return candidate("rent-a-car", "high", "Google primary type car_rental");
  if (primary === "car_dealer" || primary === "used_car_dealer") return candidate("car-dealer", "high", "Google primary type car dealer");
  if (primary === "spa" || primary === "massage" || primary === "wellness_center") return candidate("spa", "high", "Google primary type spa/wellness");
  if (primary === "gym" || primary === "fitness_center" || primary === "yoga_studio" || primary === "pilates_studio") return candidate("gym", "high", "Google primary type fitness");
  if (primary === "museum" || primary === "art_gallery" || primary === "cultural_center") return candidate("museum", "high", "Google primary type culture/museum");
  if (primary === "bakery" || primary === "pastry_shop") return candidate("bakery", "high", "Google primary type bakery");
  if (primary === "cafe" || primary === "coffee_shop") return candidate("cafe", "high", "Google primary type cafe");
  if (primary === "bar" || primary === "pub" || primary === "wine_bar" || primary === "cocktail_bar") {
    return candidate("bar", "high", "Google primary type bar/pub/wine_bar");
  }
  if (primary === "beach") return candidate("beach", "high", "Google primary type beach");
  if (primary === "market" || primary === "grocery_store" || primary === "food_store" || primary === "liquor_store" || primary === "wine_store") return candidate("market", "high", "Google primary type market/food store");

  if (nameIncludes(row, "mirador", "sendero", "paseo", "ruta", "puig", "camino") || (nameIncludes(row, "trail") && !looksLikeEquipmentActivity(row))) {
    return candidate("route", "medium", "Name suggests route/viewpoint");
  }
  if (current === "activity" && looksLikeBeachName(row) && !looksLikeEquipmentActivity(row)) {
    return candidate("beach", "medium", "Name suggests beach/cove");
  }
  if (nameIncludes(row, "mercado", "market", "colmado", "gourmet", "bodega") && current !== "activity") return candidate("market", "medium", "Name suggests market/gourmet shop");
  if (looksLikeGuidedDayPlan(row) || (looksLikeExcursionOperator(row) && !looksLikeEquipmentActivity(row) && !looksLikeBroadActivityTour(row))) {
    return candidate("excursion", "medium", "Name suggests organized excursion");
  }
  if (nameIncludes(row, "boutique", "shop", "tienda", "store", "ceramica", "cerámica")) return candidate("local-shop", "medium", "Name suggests local shop");

  return null;
}

function confidenceRank(value: Confidence) {
  return value === "high" ? 3 : value === "medium" ? 2 : 1;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

async function fetchRows(includeDrafts: boolean) {
  const supabase = createSupabaseClient();
  const rows: BusinessRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,area,city,rating,reviews_count,primary_type,raw_google_place")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    query = includeDrafts ? query.in("status", [...PUBLIC_STATUSES, "draft"]) : query.in("status", PUBLIC_STATUSES);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const page = (data ?? []) as unknown as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  const seen = new Set<string>();
  return rows.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

function reportPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return join("reports", `category-reclassification-${stamp}.md`);
}

function renderReport(suggestions: Suggestion[], applied: Suggestion[]) {
  const counts = new Map<string, number>();
  for (const suggestion of suggestions) {
    const key = `${suggestion.row.category ?? "unknown"} -> ${suggestion.suggestedCategory}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const lines = [
    "# Category Reclassification Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Suggestions: ${suggestions.length}`,
    `- Applied: ${applied.length}`,
    "",
    "## Suggested Moves",
    "",
    "| Move | Count |",
    "|---|---:|",
    ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([move, count]) => `| ${formatValue(move)} | ${count} |`),
    "",
    "## Queue",
    "",
    "| # | Confidence | Name | Current | Suggested | Area | Rating | Reviews | Reason | Types | Slug |",
    "|---:|---|---|---|---|---|---:|---:|---|---|---|",
    ...suggestions.map((suggestion, index) => {
      const row = suggestion.row;
      return `| ${index + 1} | ${suggestion.confidence} | ${formatValue(publicName(row))} | ${formatValue(row.category)} | ${formatValue(suggestion.suggestedCategory)} | ${formatValue(row.city || row.area)} | ${formatValue(row.rating)} | ${formatValue(row.reviews_count)} | ${formatValue(suggestion.reason)} | ${formatValue(suggestion.types.join(", "))} | ${formatValue(row.slug)} |`;
    }),
    ""
  ];

  return lines.join("\n");
}

async function applySuggestions(suggestions: Suggestion[]) {
  if (!suggestions.length) return [];
  const supabase = createSupabaseClient();
  const applied: Suggestion[] = [];

  for (const suggestion of suggestions) {
    const { error } = await supabase
      .from("businesses")
      .update({
        category: suggestion.suggestedCategory,
        updated_at: new Date().toISOString().slice(0, 10)
      })
      .eq("id", suggestion.row.id);
    if (error) throw new Error(`${suggestion.row.slug}: ${error.message}`);
    applied.push(suggestion);
  }

  return applied;
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const rows = await fetchRows(options.includeDrafts);
  const suggestions = rows
    .map(suggestCategory)
    .filter((item): item is Suggestion => Boolean(item))
    .filter((item) => CATEGORY_ORDER.includes(item.suggestedCategory))
    .sort((a, b) =>
      confidenceRank(b.confidence) - confidenceRank(a.confidence) ||
      a.suggestedCategory.localeCompare(b.suggestedCategory) ||
      publicName(a.row).localeCompare(publicName(b.row), "es")
    );

  const applyable = suggestions.filter((item) => confidenceRank(item.confidence) >= confidenceRank(options.confidence));
  const applied = options.apply ? await applySuggestions(applyable) : [];

  if (!existsSync("reports")) mkdirSync("reports");
  const path = reportPath();
  writeFileSync(path, renderReport(suggestions, applied), "utf8");
  console.log(JSON.stringify({
    reportPath: path,
    suggestions: suggestions.length,
    applyable: applyable.length,
    applied: applied.length,
    mode: options.apply ? "apply" : "dry-run",
    confidence: options.confidence
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
