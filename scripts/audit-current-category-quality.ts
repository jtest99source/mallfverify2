import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  slug: string | null;
  name: string | null;
  display_name: string | null;
  category: string | null;
  status: string | null;
  city: string | null;
  area: string | null;
  address: string | null;
  rating: number | null;
  reviews_count: number | null;
  google_place_id: string | null;
  primary_type: string | null;
  raw_google_place: Record<string, unknown> | null;
};

const PAGE_SIZE = 1000;
const PUBLIC_STATUSES = ["published", "premium"];
const REVIEW_CATEGORIES = ["bar", "cafe", "car-dealer", "rent-a-car", "spa", "nightlife"];

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
  if (!url || !key) throw new Error("Missing Supabase env vars.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function fetchRows() {
  const supabase = createSupabaseClient();
  const rows: BusinessRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,city,area,address,rating,reviews_count,google_place_id,primary_type,raw_google_place")
      .in("status", [...PUBLIC_STATUSES, "draft"])
      .in("category", REVIEW_CATEGORIES)
      .order("category", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function publicName(row: BusinessRow) {
  return row.display_name?.trim() || row.name?.trim() || "";
}

function normalizeName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\b(mallorca|palma|illes balears|balearic islands|sl|s\.l\.|s\.l|sa|s\.a\.)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function rawTypes(row: BusinessRow) {
  const raw = row.raw_google_place;
  const rawTypes = raw && Array.isArray(raw.types) ? raw.types.filter((item): item is string => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...rawTypes].filter(Boolean))];
}

function searchText(row: BusinessRow) {
  return `${publicName(row)} ${row.address ?? ""} ${rawTypes(row).join(" ")}`.toLowerCase();
}

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function hasType(types: string[], terms: string[]) {
  return types.some((type) => terms.some((term) => type === term || type.includes(term)));
}

function categoryConcern(row: BusinessRow) {
  const category = row.category ?? "";
  const value = searchText(row);
  const types = rawTypes(row);

  if (category === "cafe") {
    const cafeSignals = hasType(types, ["cafe", "coffee_shop", "bakery", "ice_cream_shop"]) || hasAny(value, ["cafe", "cafeter", "coffee", "brunch", "bakery", "pasteler", "panader", "helader", "gelato"]);
    const suspectSignals = hasType(types, ["night_club", "bar", "lodging", "hotel", "car_rental", "real_estate_agency"]) || hasAny(value, ["pub", "cocktail", "discoteca", "nightclub", "hotel", "hostal", "rent a car"]);
    if (suspectSignals && !cafeSignals) return "Possible non-cafe/brunch: stronger bar/hotel/service signal than cafe signal";
    if (!cafeSignals) return "Weak cafe/brunch signal";
  }

  if (category === "bar") {
    const barSignals = hasType(types, ["bar", "pub", "wine_bar", "cocktail_bar", "night_club"]) || hasAny(value, ["bar", "pub", "cocktail", "vermut", "tapas"]);
    const cafeRestaurantSignals = hasAny(value, ["cafeter", "coffee", "bakery", "pasteler", "panader", "pizzeria", "ristorante", "restaurant"]) || hasType(types, ["cafe", "bakery"]);
    if (hasType(types, ["night_club"]) || hasAny(value, ["discoteca", "nightclub", "club "])) return "May belong in nightlife instead of bar";
    if (cafeRestaurantSignals && !barSignals) return "Possible cafe/restaurant rather than bar";
    if (!barSignals) return "Weak bar signal";
  }

  if (category === "car-dealer") {
    const dealerSignals = hasType(types, ["car_dealer"]) || hasAny(value, ["concesionario", "compraventa", "used car", "gebrauchtwagen", "autohaus", "vehiculo", "vehículo"]);
    const rentalSignals = hasType(types, ["car_rental"]) || hasAny(value, ["rent a car", "rental", "alquiler"]);
    const repairSignals = hasType(types, ["car_repair"]) || hasAny(value, ["taller", "workshop", "repair"]);
    if (rentalSignals && !dealerSignals) return "Looks like rent-a-car, not car dealer";
    if (repairSignals && !dealerSignals) return "Looks like workshop/repair, not car dealer";
    if (!dealerSignals) return "Weak car-dealer signal";
  }

  if (category === "rent-a-car") {
    const rentalSignals = hasType(types, ["car_rental"]) || hasAny(value, ["rent a car", "rental", "alquiler", "hire car"]);
    const nonCarSignals = hasAny(value, ["bike", "bicycle", "e-bike", "ebike", "cycling", "moto", "scooter", "limousine", "chauffeur"]) || hasType(types, ["bicycle_store", "chauffeur_service"]);
    if (nonCarSignals) return "May be bike/scooter/chauffeur rather than standard car rental";
    if (!rentalSignals) return "Weak rent-a-car signal";
  }

  if (category === "spa") {
    const adultSignals = hasAny(value, ["erotic", "tantra", "tántric", "tantric", "sensual"]);
    const healthcareSignals = hasAny(value, ["fisio", "physio", "fisioterapia", "clinic", "clínica"]) || hasType(types, ["physiotherapist", "medical", "doctor"]);
    const spaSignals = hasType(types, ["spa", "massage", "wellness", "beauty_salon"]) || hasAny(value, ["spa", "massage", "masaje", "wellness", "relax"]);
    if (adultSignals) return "Adult/tantric massage signal; likely should stay hidden";
    if (healthcareSignals && !spaSignals) return "Looks more healthcare/physio than spa";
    if (!spaSignals) return "Weak spa/wellness signal";
  }

  return null;
}

function fmt(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function rowLink(row: BusinessRow) {
  return row.slug ? `/${row.slug}` : row.id;
}

function tableRow(row: BusinessRow, note = "") {
  return `| ${fmt(publicName(row))} | ${fmt(row.category)} | ${fmt(row.status)} | ${fmt(row.city || row.area)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.google_place_id)} | ${fmt(rowLink(row))} | ${fmt(note)} |`;
}

function duplicateGroups(rows: BusinessRow[], keyFor: (row: BusinessRow) => string | null) {
  const groups = new Map<string, BusinessRow[]>();
  for (const row of rows) {
    const key = keyFor(row);
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}

function render(rows: BusinessRow[]) {
  const byCategory = new Map<string, BusinessRow[]>();
  for (const row of rows) {
    byCategory.set(row.category ?? "unknown", [...(byCategory.get(row.category ?? "unknown") ?? []), row]);
  }

  const suspectRows = rows
    .map((row) => ({ row, concern: categoryConcern(row) }))
    .filter((item): item is { row: BusinessRow; concern: string } => Boolean(item.concern));

  const publicRows = rows.filter((row) => PUBLIC_STATUSES.includes(row.status ?? ""));
  const placeDuplicates = duplicateGroups(rows, (row) => row.google_place_id ? row.google_place_id : null);
  const nameDuplicates = duplicateGroups(rows, (row) => {
    const key = normalizeName(publicName(row));
    return key.length >= 5 ? key : null;
  });
  const dealerNameDuplicates = duplicateGroups(
    rows.filter((row) => row.category === "car-dealer"),
    (row) => {
      const key = normalizeName(publicName(row));
      return key.length >= 5 ? key : null;
    }
  );

  const lines = [
    "# Category Quality Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Scope: public + draft rows for bar, cafe, car-dealer, rent-a-car, spa and nightlife. No database changes were made.",
    "",
    "## Counts",
    "",
    "| Category | Published/Premium | Draft | Total |",
    "|---|---:|---:|---:|",
    ...[...byCategory.entries()].sort().map(([category, categoryRows]) => {
      const publicCount = categoryRows.filter((row) => PUBLIC_STATUSES.includes(row.status ?? "")).length;
      const draftCount = categoryRows.filter((row) => row.status === "draft").length;
      return `| ${fmt(category)} | ${publicCount} | ${draftCount} | ${categoryRows.length} |`;
    }),
    "",
    "## Suspect Category Fits",
    "",
    "| Name | Category | Status | City/Area | Rating | Reviews | Primary type | Place ID | Slug/ID | Concern |",
    "|---|---|---|---|---:|---:|---|---|---|---|",
    ...suspectRows.map(({ row, concern }) => tableRow(row, concern)),
    "",
    "## Exact Google Place Duplicates",
    "",
    "| Google Place ID | Count | Rows |",
    "|---|---:|---|",
    ...placeDuplicates.map(([key, group]) => `| ${fmt(key)} | ${group.length} | ${fmt(group.map((row) => `${publicName(row)} (${row.category}, ${row.status}, ${row.city || row.area || "-"}, ${row.slug || row.id})`).join("; "))} |`),
    "",
    "## Repeated Names Across Reviewed Categories",
    "",
    "Repeated names are not automatically wrong: branches/franchises can be legitimate. Use this to spot accidental duplicate imports.",
    "",
    "| Normalized name | Count | Rows |",
    "|---|---:|---|",
    ...nameDuplicates.slice(0, 120).map(([key, group]) => `| ${fmt(key)} | ${group.length} | ${fmt(group.map((row) => `${publicName(row)} (${row.category}, ${row.status}, ${row.city || row.area || "-"}, place=${row.google_place_id || "-"})`).join("; "))} |`),
    "",
    "## Car Dealer Repeated Names",
    "",
    "| Normalized name | Count | Rows |",
    "|---|---:|---|",
    ...dealerNameDuplicates.map(([key, group]) => `| ${fmt(key)} | ${group.length} | ${fmt(group.map((row) => `${publicName(row)} (${row.status}, ${row.city || row.area || "-"}, place=${row.google_place_id || "-"})`).join("; "))} |`),
    ""
  ];

  return {
    text: lines.join("\n"),
    counts: [...byCategory.entries()].map(([category, categoryRows]) => ({
      category,
      public: categoryRows.filter((row) => PUBLIC_STATUSES.includes(row.status ?? "")).length,
      draft: categoryRows.filter((row) => row.status === "draft").length,
      total: categoryRows.length
    })),
    suspectCount: suspectRows.length,
    placeDuplicateGroups: placeDuplicates.length,
    nameDuplicateGroups: nameDuplicates.length,
    dealerNameDuplicateGroups: dealerNameDuplicates.length,
    publicChecked: publicRows.length,
    totalChecked: rows.length
  };
}

async function main() {
  loadLocalEnv();
  const rows = await fetchRows();
  const report = render(rows);
  if (!existsSync("reports")) mkdirSync("reports");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `category-quality-audit-${stamp}.md`);
  writeFileSync(reportPath, report.text, "utf8");
  console.log(JSON.stringify({ reportPath, ...report, text: undefined }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
