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
  area: string | null;
  city: string | null;
  rating: number | null;
  reviews_count: number | null;
  google_place_id: string | null;
  primary_type: string | null;
  raw_google_place: Record<string, unknown> | null;
};

type PreviewPlace = {
  google_place_id?: string | null;
  name?: string | null;
  category?: string | null;
  rating?: number | null;
  reviews_count?: number | null;
  address?: string | null;
  primary_type?: string | null;
  types?: string[];
  business_status?: string | null;
  raw_google_place?: Record<string, unknown> | null;
};

const PAGE_SIZE = 1000;
const NEW_PREVIEWS = [
  ["nightlife", "data/import-previews/nightlife-preview.json"],
  ["car-dealer", "data/import-previews/car-dealers-preview.json"],
  ["healthcare", "data/import-previews/healthcare-preview.json"],
  ["real-estate", "data/import-previews/real-estate-preview.json"]
] as const;

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
      .select("id,slug,name,display_name,category,status,area,city,rating,reviews_count,google_place_id,primary_type,raw_google_place")
      .order("id", { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function publicName(row: BusinessRow | PreviewPlace) {
  const value = "display_name" in row ? row.display_name || row.name : row.name;
  return value?.trim() || "";
}

function rawTypes(row: BusinessRow | PreviewPlace) {
  const raw = row.raw_google_place;
  const rowWithTypes = row as { types?: unknown };
  const directTypes = Array.isArray(rowWithTypes.types)
    ? rowWithTypes.types.filter((item): item is string => typeof item === "string")
    : [];
  const rawTypes = raw && Array.isArray(raw.types) ? raw.types.filter((item): item is string => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...directTypes, ...rawTypes].filter(Boolean))];
}

function text(row: BusinessRow | PreviewPlace) {
  return `${publicName(row)} ${(row as PreviewPlace).address ?? ""} ${rawTypes(row).join(" ")}`.toLowerCase();
}

function hasAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function hasType(types: string[], terms: string[]) {
  return types.some((type) => terms.some((term) => type === term || type.includes(term)));
}

function fmt(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function isPublic(status: string | null) {
  return status === "published" || status === "premium";
}

function loadPreviews() {
  const byCategory = new Map<string, PreviewPlace[]>();
  const missing: string[] = [];
  for (const [category, path] of NEW_PREVIEWS) {
    if (!existsSync(path)) {
      missing.push(path);
      byCategory.set(category, []);
      continue;
    }
    byCategory.set(category, JSON.parse(readFileSync(path, "utf8")) as PreviewPlace[]);
  }
  return { byCategory, missing };
}

function previewCategoryFromBusiness(category: string) {
  if (category === "car-dealer") return "car-dealer";
  return category;
}

function suggestedFromSignals(row: BusinessRow) {
  const value = text(row);
  const types = rawTypes(row);
  const current = row.category ?? "unknown";

  const nightlifeSignal =
    hasType(types, ["night_club"]) ||
    hasAny(value, ["discoteca", "nightclub", "night club", "disco"]) ||
    (["bar", "activity"].includes(current) && hasType(types, ["live_music_venue", "concert_hall", "auditorium"]));

  if (current !== "nightlife" && ["beach-club", "bar", "restaurant", "activity"].includes(current) && nightlifeSignal) {
    return { suggested: "nightlife", reason: "Nightlife signal in Google types/name" };
  }

  const carDealerSignal =
    hasType(types, ["car_dealer"]) ||
    hasAny(value, ["concesionario", "compraventa", "coches de ocasion", "coches usados", "used cars", "car dealer", "gebrauchtwagen", "autohandler"]);
  if (current !== "car-dealer" && ["rent-a-car", "local-shop", "activity"].includes(current) && carDealerSignal) {
    return { suggested: "car-dealer", reason: "Car dealer signal in Google types/name" };
  }

  const healthcareSignal =
    hasType(types, ["doctor", "medical", "hospital", "dentist", "dental", "health"]) ||
    hasAny(value, ["doctor", "clinic", "clinica", "medical", "dentist", "dental", "arzt", "zahnarzt", "hospital"]);
  if (current !== "healthcare" && ["spa", "local-shop", "activity"].includes(current) && healthcareSignal) {
    return { suggested: "healthcare", reason: "Healthcare signal in Google types/name" };
  }

  const realEstateSignal =
    hasType(types, ["real_estate_agency"]) ||
    hasAny(value, ["real estate", "inmobiliaria", "immobilien", "property agency", "estate agent"]);
  if (current !== "real-estate" && ["local-shop", "activity"].includes(current) && realEstateSignal) {
    return { suggested: "real-estate", reason: "Real estate signal in Google types/name" };
  }

  return null;
}

function previewConcern(category: string, place: PreviewPlace) {
  const value = text(place);
  const types = rawTypes(place);

  if (category === "nightlife") {
    const strongNight = hasType(types, ["night_club"]) || hasAny(value, ["discoteca", "nightclub", "night club", "disco"]);
    const hybrid = hasAny(value, ["beach club", "beachclub", "purobeach", "nikki beach", "restaurant", "restaurante"]) || hasType(types, ["restaurant", "mediterranean_restaurant"]);
    if (strongNight) return null;
    if (hybrid) return "Hybrid/restaurant/beach-club signal; review before publishing as nightlife";
    if (!hasType(types, ["bar", "pub", "cocktail_bar", "lounge_bar", "event_venue", "live_music_venue"])) return "Weak nightlife type signal";
  }

  if (category === "healthcare") {
    const medical = hasType(types, ["doctor", "medical", "hospital", "dentist", "dental", "health"]);
    const beauty = hasType(types, ["beauty_salon", "massage_spa", "spa", "hair_care"]);
    if (!medical && beauty) return "Looks more like beauty/spa than healthcare";
    if (!medical) return "Weak healthcare type signal";
  }

  if (category === "car-dealer") {
    const carDealer = hasType(types, ["car_dealer"]) || hasAny(value, ["coches", "cars", "auto", "motor", "vehiculos", "vehicles", "concesionario"]);
    if (!carDealer) return "Weak car-dealer signal";
  }

  if (category === "real-estate") {
    const realEstate = hasType(types, ["real_estate_agency"]) || hasAny(value, ["real estate", "inmobiliaria", "immobilien", "property"]);
    if (!realEstate) return "Weak real-estate signal";
  }

  return null;
}

function render(rows: BusinessRow[], previews: Map<string, PreviewPlace[]>, missing: string[]) {
  const byPlaceId = new Map(rows.filter((row) => row.google_place_id).map((row) => [row.google_place_id as string, row]));
  const previewDuplicates: Array<{ category: string; place: PreviewPlace; existing: BusinessRow }> = [];
  const previewConcerns: Array<{ category: string; place: PreviewPlace; concern: string }> = [];
  const signalSuggestions: Array<{ row: BusinessRow; suggested: string; reason: string }> = [];

  for (const [category, places] of previews) {
    for (const place of places) {
      if (place.google_place_id && byPlaceId.has(place.google_place_id)) {
        previewDuplicates.push({ category, place, existing: byPlaceId.get(place.google_place_id)! });
      }
      const concern = previewConcern(category, place);
      if (concern) previewConcerns.push({ category, place, concern });
    }
  }

  for (const row of rows) {
    const suggestion = suggestedFromSignals(row);
    if (suggestion) signalSuggestions.push({ row, ...suggestion });
  }

  const duplicatesByTarget = previewDuplicates.filter((item) => previewCategoryFromBusiness(item.existing.category ?? "") !== item.category);
  const highConfidenceDuplicates = duplicatesByTarget.filter(({ category, place }) => {
    const types = rawTypes(place);
    if (category === "nightlife") return hasType(types, ["night_club"]) || hasAny(text(place), ["discoteca", "nightclub", "night club", "disco"]);
    if (category === "car-dealer") return hasType(types, ["car_dealer"]);
    if (category === "healthcare") return hasType(types, ["doctor", "medical", "hospital", "dentist", "dental"]);
    if (category === "real-estate") return hasType(types, ["real_estate_agency"]);
    return false;
  });
  const lines = [
    "# Places Category Fit Audit",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Businesses checked: ${rows.length}`,
    `- Missing preview files: ${missing.length ? missing.join(", ") : "none"}`,
    `- New preview duplicates already in Supabase: ${previewDuplicates.length}`,
    `- New preview duplicates with different current category: ${duplicatesByTarget.length}`,
    `- High-confidence existing rows to recategorize: ${highConfidenceDuplicates.length}`,
    `- Existing businesses with category-change signals: ${signalSuggestions.length}`,
    `- New preview rows needing manual review: ${previewConcerns.length}`,
    "",
    "## High-Confidence Existing Rows To Recategorize",
    "",
    "| Suggested | Current | Status | Name | Rating | Reviews | Existing slug | Types |",
    "|---|---|---|---|---:|---:|---|---|",
    ...highConfidenceDuplicates
      .sort((a, b) => (b.existing.reviews_count ?? b.place.reviews_count ?? 0) - (a.existing.reviews_count ?? a.place.reviews_count ?? 0))
      .slice(0, 200)
      .map(({ category, place, existing }) => `| ${fmt(category)} | ${fmt(existing.category)} | ${fmt(existing.status)} | ${fmt(publicName(existing) || publicName(place))} | ${fmt(existing.rating ?? place.rating)} | ${fmt(existing.reviews_count ?? place.reviews_count)} | ${fmt(existing.slug)} | ${fmt(rawTypes(place).join(", "))} |`),
    "",
    "## Existing Rows That Probably Need Category Review",
    "",
    "| Current | Suggested | Status | Name | Rating | Reviews | Area | Reason | Types | Slug |",
    "|---|---|---|---|---:|---:|---|---|---|---|",
    ...signalSuggestions
      .sort((a, b) => Number(isPublic(b.row.status)) - Number(isPublic(a.row.status)) || (b.row.reviews_count ?? 0) - (a.row.reviews_count ?? 0))
      .slice(0, 200)
      .map(({ row, suggested, reason }) => `| ${fmt(row.category)} | ${fmt(suggested)} | ${fmt(row.status)} | ${fmt(publicName(row))} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.city || row.area)} | ${fmt(reason)} | ${fmt(rawTypes(row).join(", "))} | ${fmt(row.slug)} |`),
    "",
    "## New Preview Rows Already Existing In Another Category",
    "",
    "| Preview category | Existing category | Status | Name | Rating | Reviews | Existing slug | Types |",
    "|---|---|---|---|---:|---:|---|---|",
    ...duplicatesByTarget
      .sort((a, b) => (b.existing.reviews_count ?? b.place.reviews_count ?? 0) - (a.existing.reviews_count ?? a.place.reviews_count ?? 0))
      .slice(0, 200)
      .map(({ category, place, existing }) => `| ${fmt(category)} | ${fmt(existing.category)} | ${fmt(existing.status)} | ${fmt(publicName(existing) || publicName(place))} | ${fmt(existing.rating ?? place.rating)} | ${fmt(existing.reviews_count ?? place.reviews_count)} | ${fmt(existing.slug)} | ${fmt(rawTypes(place).join(", "))} |`),
    "",
    "## New Preview Rows To Manually Review Before Import",
    "",
    "| Preview category | Name | Rating | Reviews | Concern | Types |",
    "|---|---|---:|---:|---|---|",
    ...previewConcerns
      .sort((a, b) => (b.place.reviews_count ?? 0) - (a.place.reviews_count ?? 0))
      .slice(0, 250)
      .map(({ category, place, concern }) => `| ${fmt(category)} | ${fmt(publicName(place))} | ${fmt(place.rating)} | ${fmt(place.reviews_count)} | ${fmt(concern)} | ${fmt(rawTypes(place).join(", "))} |`)
  ];

  return lines.join("\n") + "\n";
}

async function main() {
  loadLocalEnv();
  const rows = await fetchRows();
  const { byCategory, missing } = loadPreviews();
  const report = render(rows, byCategory, missing);
  mkdirSync("reports", { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `place-category-fit-${stamp}.md`);
  writeFileSync(reportPath, report, "utf8");
  console.log(JSON.stringify({ reportPath, rows: rows.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
