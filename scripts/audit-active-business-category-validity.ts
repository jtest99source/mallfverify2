import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Severity = "move" | "exclude" | "review";

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

type Decision = {
  severity: Severity;
  suggestedCategory?: string;
  reason: string;
};

const PAGE_SIZE = 250;
const PUBLIC_STATUSES = ["published", "premium"];
const CHECK_STATUSES = [...PUBLIC_STATUSES, "draft"];

const ACTIVE_CATEGORIES = [
  "restaurant",
  "hotel",
  "beach-club",
  "bar",
  "cafe",
  "nightlife",
  "activity",
  "boat-rental",
  "rent-a-car",
  "car-dealer",
  "gym",
  "spa",
  "healthcare",
  "real-estate"
];

function argValue(name: string) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function argList(name: string, fallback: string[]) {
  const value = argValue(name);
  if (!value) return fallback;
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

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
  const categories = argList("categories", ACTIVE_CATEGORIES);
  const statuses = argList("statuses", CHECK_STATUSES);
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,city,area,address,rating,reviews_count,google_place_id,primary_type,raw_google_place")
      .in("status", statuses)
      .in("category", categories)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as unknown as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function publicName(row: BusinessRow) {
  return row.display_name?.trim() || row.name?.trim() || "";
}

function rawTypes(row: BusinessRow) {
  const raw = row.raw_google_place;
  return raw && Array.isArray(raw.types)
    ? raw.types.filter((item): item is string => typeof item === "string")
    : [];
}

function primary(row: BusinessRow) {
  return (row.primary_type || "").toLowerCase();
}

function text(row: BusinessRow) {
  return normalizeSearchText(`${publicName(row)} ${row.address ?? ""}`);
}

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function hasPrimary(row: BusinessRow, values: string[]) {
  return values.includes(primary(row));
}

function hasRawType(row: BusinessRow, values: string[]) {
  const types = rawTypes(row);
  return types.some((type) => values.includes(type));
}

function normalizeName(value: string) {
  return normalizeSearchText(value)
    .replace(/\b(mallorca|palma|illes balears|balearic islands|sl|s l|sa|s a)\b/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function decide(row: BusinessRow): Decision | null {
  const category = row.category ?? "";
  const p = primary(row);
  const value = text(row);

  const serviceNoise = ["store", "supermarket", "discount_supermarket", "shopping_mall", "home_improvement_store", "furniture_store", "jewelry_store", "liquor_store", "wholesaler"];
  const lodging = ["hotel", "lodging", "resort_hotel", "bed_and_breakfast"];
  const medical = ["doctor", "medical_clinic", "hospital", "dentist", "physiotherapist", "chiropractor"];
  const restaurantPrimary = ["restaurant", "spanish_restaurant", "mediterranean_restaurant", "pizza_restaurant", "italian_restaurant", "hamburger_restaurant", "turkish_restaurant", "american_restaurant", "food"];
  const barPrimary = ["bar", "pub", "wine_bar", "cocktail_bar", "sports_bar", "lounge_bar"];
  const cafePrimary = ["cafe", "coffee_shop", "bakery", "ice_cream_shop", "dessert_shop", "brunch_restaurant", "breakfast_restaurant"];
  const cafeSignals = ["cafe", "caffe", "caff", "cafeter", "coffee", "brunch", "breakfast", "bakery", "panader", "pasteler", "gelato", "helader", "ice cream"];
  const carSalesSignals = ["venta", "sales", "dealer", "concesionario", "compraventa", "ocasion", "auto"];
  const activitySignals = ["paddle", "surf", "kayak", "diving", "buceo", "jet ski", "jetski", "quad", "buggy", "tour", "excursion", "experience", "aventura", "adventure", "rental"];
  const spaSignals = ["spa", "massage", "masaje", "wellness", "retreat", "relax", "bienestar", "sauna", "holistic"];
  const healthcareSignals = ["clinic", "clinica", "doctor", "dental", "dentist", "medical", "medicina", "physio", "fisio", "fisioterapia"];

  if (category === "bar") {
    if (p === "night_club" || hasAny(value, ["discoteca", "nightclub", "night club"])) {
      return { severity: "move", suggestedCategory: "nightlife", reason: "Primary/nightlife name signal" };
    }
    if (cafePrimary.includes(p) && !hasAny(value, ["bar", "pub", "cocktail", "wine", "vino", "tapas"])) {
      return { severity: "move", suggestedCategory: "cafe", reason: "Primary type is cafe/coffee/bakery and name has no bar signal" };
    }
    if (restaurantPrimary.includes(p) && hasAny(value, ["restaurant", "restaurante", "pizzeria", "bistro", "grill"]) && !hasAny(value, ["bar", "pub", "cocktail", "wine", "vino", "tapas"])) {
      return { severity: "review", suggestedCategory: "restaurant", reason: "Primary type is restaurant and name reads as food venue, not bar" };
    }
    if (serviceNoise.includes(p) || lodging.includes(p)) {
      return { severity: "exclude", reason: `Primary type ${p || "-"} is not a bar venue` };
    }
    return null;
  }

  if (category === "cafe") {
    if (p === "night_club") return { severity: "move", suggestedCategory: "nightlife", reason: "Primary type is night_club" };
    if (barPrimary.includes(p) && !hasAny(value, cafeSignals)) {
      return { severity: "move", suggestedCategory: "bar", reason: "Primary type is bar/pub/cocktail and name has no cafe/brunch signal" };
    }
    if (restaurantPrimary.includes(p) && !hasAny(value, cafeSignals)) {
      return { severity: "review", suggestedCategory: "restaurant", reason: "Primary type is restaurant and name has no cafe/brunch signal" };
    }
    if (serviceNoise.includes(p) || lodging.includes(p) || p === "car_rental" || p === "real_estate_agency") {
      return { severity: "exclude", reason: `Primary type ${p || "-"} is not cafe/brunch` };
    }
    return null;
  }

  if (category === "restaurant") {
    if (serviceNoise.includes(p) || p === "market") return { severity: "exclude", reason: `Primary type ${p || "-"} is not a restaurant` };
    if (p === "night_club") return { severity: "move", suggestedCategory: "nightlife", reason: "Primary type is night_club" };
    if (barPrimary.includes(p) && !hasAny(value, ["restaurant", "restaurante", "bistro", "grill", "tapas"])) {
      return { severity: "review", suggestedCategory: "bar", reason: "Primary type is bar and name reads more like drinks venue" };
    }
    return null;
  }

  if (category === "beach-club") {
    if (p === "night_club" && !hasAny(value, ["beach", "playa", "purobeach", "nikki", "balneario"])) {
      return { severity: "move", suggestedCategory: "nightlife", reason: "Primary type is night_club and no beach-club identity in name" };
    }
    if (serviceNoise.includes(p) || lodging.includes(p)) return { severity: "exclude", reason: `Primary type ${p || "-"} is not beach club` };
    return null;
  }

  if (category === "nightlife") {
    if (p === "night_club") return null;
    if (barPrimary.includes(p) && hasAny(value, ["club", "disco", "music", "karaoke", "late", "night", "party"])) return null;
    if (restaurantPrimary.includes(p)) return { severity: "review", suggestedCategory: "bar", reason: "Primary type is restaurant/food; verify nightlife identity" };
    if (serviceNoise.includes(p) || lodging.includes(p)) return { severity: "exclude", reason: `Primary type ${p || "-"} is not nightlife` };
    return null;
  }

  if (category === "rent-a-car") {
    if (p === "car_dealer") return { severity: "move", suggestedCategory: "car-dealer", reason: "Primary type is car_dealer" };
    const hasBikeSignal = hasAny(value, ["bike", "bicycle", "e bike", "ebike", "cycling", "vespa", "scooter"]) || hasRawType(row, ["bicycle_store"]);
    if (hasBikeSignal && hasAny(value, ["car", "cars", "auto", "rent a car", "alquiler"])) {
      return { severity: "review", reason: "Mixed car + bike/scooter rental signal; verify category manually" };
    }
    if (hasBikeSignal) {
      return { severity: "exclude", reason: "Bike/scooter/cycling signal, not standard car rental" };
    }
    if (p === "chauffeur_service" || hasAny(value, ["limousine", "chauffeur"])) {
      return { severity: "review", reason: "Chauffeur/limo signal; decide if it belongs in rent-a-car" };
    }
    if (p && !["car_rental", "transportation_service", "travel_agency"].includes(p) && !hasAny(value, ["rent a car", "rental", "car hire", "alquiler"])) {
      return { severity: "review", reason: `Primary type ${p} is not car_rental` };
    }
    return null;
  }

  if (category === "car-dealer") {
    if (p === "car_rental" && !hasAny(value, carSalesSignals)) {
      return { severity: "move", suggestedCategory: "rent-a-car", reason: "Primary type is car_rental and name has no sales/dealer signal" };
    }
    if (p === "car_repair" && !hasAny(value, carSalesSignals)) {
      return { severity: "exclude", reason: "Looks like car repair/workshop, not dealer" };
    }
    if (p && !["car_dealer", "store", "auto_parts_store", "car_repair"].includes(p) && !hasAny(value, carSalesSignals)) {
      return { severity: "review", reason: `Primary type ${p} is weak for car-dealer` };
    }
    return null;
  }

  if (category === "spa") {
    if (hasAny(value, ["erotic", "tantra", "tantric", "sensual"])) return { severity: "exclude", reason: "Adult/tantric massage signal" };
    if (medical.includes(p) || (p === "health" && hasAny(value, healthcareSignals) && !hasAny(value, spaSignals))) {
      return { severity: "move", suggestedCategory: "healthcare", reason: "Primary/name signal is medical/physio/healthcare" };
    }
    if (lodging.includes(p)) return { severity: "exclude", reason: "Hotel/lodging with spa signal, not independent spa listing" };
    if (["hair_salon", "nail_salon"].includes(p)) return { severity: "exclude", reason: "Hair/nail salon, not spa/wellness" };
    if (p && !["spa", "massage", "massage_spa", "massage_therapist", "wellness_center", "beauty_salon", "sauna", "health"].includes(p)) {
      return { severity: "review", reason: `Primary type ${p} is weak for spa` };
    }
    return null;
  }

  if (category === "healthcare") {
    if (["spa", "massage_spa", "beauty_salon", "hair_salon", "nail_salon"].includes(p) && !hasAny(value, healthcareSignals)) {
      return { severity: "move", suggestedCategory: "spa", reason: "Beauty/spa primary type with no healthcare name signal" };
    }
    if (serviceNoise.includes(p) || lodging.includes(p)) return { severity: "exclude", reason: `Primary type ${p || "-"} is not healthcare` };
    return null;
  }

  if (category === "real-estate") {
    if (lodging.includes(p) || hasAny(value, ["holiday rental", "ferien", "apartments", "appartements"])) {
      return { severity: "review", reason: "May be holiday rental/lodging rather than real estate agency" };
    }
    if (serviceNoise.includes(p)) return { severity: "exclude", reason: `Primary type ${p || "-"} is not real estate` };
    if (p && !["real_estate_agency", "consultant", "property_management_company"].includes(p) && !hasAny(value, ["real estate", "inmobiliaria", "immobilien", "property"])) {
      return { severity: "review", reason: `Primary type ${p} is weak for real-estate` };
    }
    return null;
  }

  if (category === "gym") {
    if (["discount_supermarket", "supermarket", "store"].includes(p)) return { severity: "exclude", reason: `Primary type ${p} is clearly not gym` };
    if (medical.includes(p) && hasAny(value, ["physio", "fisio", "clinic", "clinica"])) return { severity: "move", suggestedCategory: "healthcare", reason: "Physio/clinic signal, not gym" };
    return null;
  }

  if (category === "activity") {
    if (p === "car_rental") return { severity: "move", suggestedCategory: "rent-a-car", reason: "Primary type is car_rental" };
    if (p === "real_estate_agency") return { severity: "move", suggestedCategory: "real-estate", reason: "Primary type is real_estate_agency" };
    if (p === "gym" || hasAny(value, ["gym", "fitness", "crossfit", "rocodrom", "climbing"])) return { severity: "move", suggestedCategory: "gym", reason: "Fitness/climbing signal fits gyms better" };
    if ((serviceNoise.includes(p) || lodging.includes(p)) && hasAny(value, activitySignals)) {
      return { severity: "review", reason: `Primary type ${p || "-"} is weak, but name has activity signal` };
    }
    if (serviceNoise.includes(p) || lodging.includes(p)) return { severity: "exclude", reason: `Primary type ${p || "-"} is not activity` };
    return null;
  }

  if (category === "boat-rental") {
    if (p === "night_club") return { severity: "move", suggestedCategory: "nightlife", reason: "Primary type is night_club" };
    if (serviceNoise.includes(p) || lodging.includes(p)) return { severity: "exclude", reason: `Primary type ${p || "-"} is not boat rental` };
    return null;
  }

  if (category === "hotel") {
    if (p === "real_estate_agency") return { severity: "move", suggestedCategory: "real-estate", reason: "Primary type is real_estate_agency" };
    if (serviceNoise.includes(p)) return { severity: "exclude", reason: `Primary type ${p || "-"} is not hotel` };
    return null;
  }

  return null;
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

function fmt(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function tableRow(row: BusinessRow, decision: Decision) {
  return `| ${fmt(publicName(row))} | ${fmt(row.category)} | ${fmt(row.status)} | ${fmt(row.city || row.area)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(decision.severity)} | ${fmt(decision.suggestedCategory ?? "-")} | ${fmt(row.slug || row.id)} | ${fmt(decision.reason)} |`;
}

function render(rows: BusinessRow[]) {
  const decisions = rows
    .map((row) => ({ row, decision: decide(row) }))
    .filter((item): item is { row: BusinessRow; decision: Decision } => item.decision !== null);

  const byCategory = new Map<string, BusinessRow[]>();
  const byCategorySeverity = new Map<string, Record<Severity, number>>();
  for (const row of rows) {
    const category = row.category ?? "unknown";
    byCategory.set(category, [...(byCategory.get(category) ?? []), row]);
  }
  for (const { row, decision } of decisions) {
    const category = row.category ?? "unknown";
    const current = byCategorySeverity.get(category) ?? { move: 0, exclude: 0, review: 0 };
    current[decision.severity] += 1;
    byCategorySeverity.set(category, current);
  }

  const placeDuplicates = duplicateGroups(rows, (row) => row.google_place_id || null);
  const nameDuplicates = duplicateGroups(rows, (row) => {
    const key = normalizeName(publicName(row));
    return key.length >= 5 ? key : null;
  });

  const decisionTable = (severity: Severity) => [
    `## ${severity === "move" ? "Move Candidates" : severity === "exclude" ? "Exclude Candidates" : "Manual Review"}`,
    "",
    "| Name | Category | Status | City/Area | Rating | Reviews | Primary type | Severity | Suggested | Slug/ID | Reason |",
    "|---|---|---|---|---:|---:|---|---|---|---|---|",
    ...decisions
      .filter((item) => item.decision.severity === severity)
      .sort((a, b) => (a.row.category ?? "").localeCompare(b.row.category ?? "") || (b.row.reviews_count ?? 0) - (a.row.reviews_count ?? 0))
      .map(({ row, decision }) => tableRow(row, decision)),
    ""
  ];

  const lines = [
    "# Active Business Category Validity Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Scope: published/premium + draft rows in active public categories. No database changes were made.",
    "",
    "Important calibration: for bars and cafes this audit uses `primary_type` as the strong signal. Secondary Google `types` are not allowed to turn a cafe/bar into a restaurant by themselves.",
    "",
    "## Category Counts",
    "",
    "| Category | Published/Premium | Draft | Total | Move | Exclude | Review |",
    "|---|---:|---:|---:|---:|---:|---:|",
    ...[...byCategory.entries()].sort().map(([category, categoryRows]) => {
      const severity = byCategorySeverity.get(category) ?? { move: 0, exclude: 0, review: 0 };
      const publicCount = categoryRows.filter((row) => PUBLIC_STATUSES.includes(row.status ?? "")).length;
      const draftCount = categoryRows.filter((row) => row.status === "draft").length;
      return `| ${fmt(category)} | ${publicCount} | ${draftCount} | ${categoryRows.length} | ${severity.move} | ${severity.exclude} | ${severity.review} |`;
    }),
    "",
    ...decisionTable("move"),
    ...decisionTable("exclude"),
    ...decisionTable("review"),
    "## Exact Google Place Duplicates",
    "",
    "| Google Place ID | Count | Rows |",
    "|---|---:|---|",
    ...placeDuplicates.map(([key, group]) => `| ${fmt(key)} | ${group.length} | ${fmt(group.map((row) => `${publicName(row)} (${row.category}, ${row.status}, ${row.city || row.area || "-"}, ${row.slug || row.id})`).join("; "))} |`),
    "",
    "## Repeated Names",
    "",
    "Repeated names are often legitimate branches. Treat these as duplicate-review candidates, not automatic removals.",
    "",
    "| Normalized name | Count | Rows |",
    "|---|---:|---|",
    ...nameDuplicates.slice(0, 150).map(([key, group]) => `| ${fmt(key)} | ${group.length} | ${fmt(group.map((row) => `${publicName(row)} (${row.category}, ${row.status}, ${row.city || row.area || "-"}, place=${row.google_place_id || "-"})`).join("; "))} |`),
    ""
  ];

  return {
    text: lines.join("\n"),
    totalRows: rows.length,
    publicRows: rows.filter((row) => PUBLIC_STATUSES.includes(row.status ?? "")).length,
    draftRows: rows.filter((row) => row.status === "draft").length,
    decisions: decisions.length,
    move: decisions.filter((item) => item.decision.severity === "move").length,
    exclude: decisions.filter((item) => item.decision.severity === "exclude").length,
    review: decisions.filter((item) => item.decision.severity === "review").length,
    duplicatePlaceGroups: placeDuplicates.length,
    repeatedNameGroups: nameDuplicates.length,
    counts: [...byCategory.entries()].sort().map(([category, categoryRows]) => {
      const severity = byCategorySeverity.get(category) ?? { move: 0, exclude: 0, review: 0 };
      return {
        category,
        public: categoryRows.filter((row) => PUBLIC_STATUSES.includes(row.status ?? "")).length,
        draft: categoryRows.filter((row) => row.status === "draft").length,
        total: categoryRows.length,
        ...severity
      };
    })
  };
}

async function main() {
  loadLocalEnv();
  const rows = await fetchRows();
  const report = render(rows);
  if (!existsSync("reports")) mkdirSync("reports");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `active-category-validity-${stamp}.md`);
  writeFileSync(reportPath, report.text, "utf8");
  console.log(JSON.stringify({ reportPath, ...report, text: undefined }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
