import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  category: string | null;
  status: string | null;
  source: string | null;
  area: string | null;
  city: string | null;
  municipality: string | null;
  rating: number | null;
  reviews_count: number | null;
  google_place_id: string | null;
  primary_type: string | null;
  primary_image_url: string | null;
  primary_photo_name: string | null;
  photo_names: string[] | null;
  image_candidate_urls: unknown[] | null;
  raw_google_place: Record<string, unknown> | null;
};

const RESTAURANT_KEYWORDS = [
  { key: "sushi", label: "Sushi / japones" },
  { key: "japanese", label: "Sushi / japones" },
  { key: "pizza", label: "Pizza" },
  { key: "pizzeria", label: "Pizza" },
  { key: "burger", label: "Hamburguesas" },
  { key: "hamburg", label: "Hamburguesas" },
  { key: "steak", label: "Carne / steakhouse" },
  { key: "grill", label: "Carne / steakhouse" },
  { key: "asador", label: "Carne / steakhouse" },
  { key: "tapas", label: "Tapas" },
  { key: "paella", label: "Arrocerias / paella" },
  { key: "arroz", label: "Arrocerias / paella" },
  { key: "seafood", label: "Marisco / pescado" },
  { key: "marisco", label: "Marisco / pescado" },
  { key: "pescado", label: "Marisco / pescado" },
  { key: "brunch", label: "Brunch" },
  { key: "cafe", label: "Cafe / brunch" },
  { key: "cafeteria", label: "Cafe / brunch" },
  { key: "mallor", label: "Tradicional mallorquin" },
  { key: "mediterr", label: "Mediterraneo" },
  { key: "italian", label: "Italiano" },
  { key: "italiano", label: "Italiano" },
  { key: "thai", label: "Thai / asiatico" },
  { key: "indian", label: "Indio" },
  { key: "mexican", label: "Mexicano" }
] as const;

const CATEGORY_IDEAS = [
  { category: "bars", label: "Bares", googleTypes: ["bar", "pub", "wine_bar", "cocktail_bar"] },
  { category: "cafes", label: "Cafeterias / brunch", googleTypes: ["cafe", "coffee_shop", "brunch_restaurant"] },
  { category: "bakeries", label: "Hornos y pastelerias", googleTypes: ["bakery", "pastry_shop"] },
  { category: "car-rental", label: "Rent a car", googleTypes: ["car_rental"] },
  { category: "car-dealers", label: "Concesionarios", googleTypes: ["car_dealer", "used_car_dealer"] },
  { category: "spas", label: "Spas / wellness", googleTypes: ["spa", "massage", "wellness_center"] },
  { category: "gyms", label: "Gimnasios", googleTypes: ["gym", "fitness_center", "yoga_studio", "pilates_studio"] },
  { category: "museums", label: "Museos / cultura", googleTypes: ["museum", "art_gallery", "cultural_center"] },
  { category: "markets", label: "Mercados / gourmet", googleTypes: ["market", "grocery_store", "food_store"] },
  { category: "shops", label: "Tiendas locales", googleTypes: ["store", "shopping_mall", "boutique"] },
  { category: "viewpoints", label: "Miradores / rutas", googleTypes: ["tourist_attraction", "hiking_area", "scenic_point"] },
  { category: "excursions", label: "Excursiones organizadas", googleTypes: ["tour_operator", "travel_agency"] }
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

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

function arrayLength(value: unknown[] | null | undefined) {
  return Array.isArray(value) ? value.length : 0;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").toLowerCase();
}

function rawTypes(row: BusinessRow) {
  const raw = row.raw_google_place;
  const rawTypesValue = raw && Array.isArray(raw.types) ? raw.types.filter((item): item is string => typeof item === "string") : [];
  return [...new Set([...rawTypesValue, row.primary_type ?? ""].filter(Boolean))];
}

function publicName(row: BusinessRow) {
  return row.display_name || row.name;
}

function pct(part: number, total: number) {
  return total ? Math.round((part / total) * 10000) / 100 : 0;
}

function addCount(map: Map<string, number>, key: string | null | undefined, amount = 1) {
  const normalized = key?.trim() || "unknown";
  map.set(normalized, (map.get(normalized) ?? 0) + amount);
}

function table(rows: string[][]) {
  if (!rows.length) return "";
  const header = rows[0];
  const lines = [
    `| ${header.join(" |")} |`,
    `| ${header.map((_, index) => (index === 0 ? "---" : "---:")).join(" |")} |`,
    ...rows.slice(1).map((row) => `| ${row.join(" |")} |`)
  ];
  return lines.join("\n");
}

function safe(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|");
}

function inferRestaurantSubcategories(row: BusinessRow) {
  const haystack = [
    row.name,
    row.display_name,
    row.primary_type,
    ...rawTypes(row)
  ].map(normalize).join(" ");
  const labels = new Set<string>();
  for (const item of RESTAURANT_KEYWORDS) {
    if (haystack.includes(item.key)) labels.add(item.label);
  }
  return [...labels];
}

async function main() {
  loadLocalEnv();
  const db = supabase();
  const rows: BusinessRow[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await db
      .from("businesses")
      .select("id,slug,name,display_name,category,status,source,area,city,municipality,rating,reviews_count,google_place_id,primary_type,primary_image_url,primary_photo_name,photo_names,image_candidate_urls,raw_google_place")
      .in("status", ["published", "premium"])
      .order("reviews_count", { ascending: false, nullsFirst: false })
      .range(from, to);

    if (error) throw new Error(error.message);
    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  const total = rows.length;
  const withGooglePlace = rows.filter((row) => hasText(row.google_place_id)).length;
  const withImage = rows.filter((row) => hasText(row.primary_image_url)).length;
  const withPhotoNames = rows.filter((row) => arrayLength(row.photo_names) > 0 || hasText(row.primary_photo_name)).length;
  const withCandidates = rows.filter((row) => arrayLength(row.image_candidate_urls as unknown[] | null) > 0).length;

  const byCategory = new Map<string, BusinessRow[]>();
  const byType = new Map<string, number>();
  const byArea = new Map<string, number>();
  for (const row of rows) {
    const category = row.category ?? "unknown";
    byCategory.set(category, [...(byCategory.get(category) ?? []), row]);
    addCount(byArea, row.city || row.area || row.municipality);
    for (const type of rawTypes(row)) addCount(byType, type);
  }

  const restaurants = rows.filter((row) => row.category === "restaurants" || row.category === "restaurant");
  const restaurantSubcategoryCounts = new Map<string, number>();
  const restaurantUnclassified: BusinessRow[] = [];
  for (const row of restaurants) {
    const labels = inferRestaurantSubcategories(row);
    if (!labels.length) restaurantUnclassified.push(row);
    for (const label of labels) addCount(restaurantSubcategoryCounts, label);
  }

  const categoryIdeaRows = CATEGORY_IDEAS.map((idea) => {
    const matchingExisting = rows.filter((row) => rawTypes(row).some((type) => idea.googleTypes.includes(type as never)));
    return {
      ...idea,
      matchingExisting: matchingExisting.length,
      examples: matchingExisting.slice(0, 5).map(publicName)
    };
  });

  const missingImages = rows.filter((row) => !hasText(row.primary_image_url));
  const missingImageByCategory = [...byCategory.entries()].map(([category, categoryRows]) => {
    const missing = categoryRows.filter((row) => !hasText(row.primary_image_url));
    const withGoogle = missing.filter((row) => hasText(row.google_place_id));
    const withPhotos = missing.filter((row) => arrayLength(row.photo_names) > 0 || hasText(row.primary_photo_name));
    const withImageCandidates = missing.filter((row) => arrayLength(row.image_candidate_urls as unknown[] | null) > 0);
    return {
      category,
      total: categoryRows.length,
      missing: missing.length,
      missingPct: pct(missing.length, categoryRows.length),
      withGoogle: withGoogle.length,
      withPhotos: withPhotos.length,
      withImageCandidates: withImageCandidates.length
    };
  }).sort((a, b) => b.missing - a.missing);

  const topMissingImages = missingImages
    .slice()
    .sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0))
    .slice(0, 60);

  const generated = new Date().toISOString();
  const reportPath = `reports/growth-opportunities-${generated.replace(/[:.]/g, "-")}.md`;
  const lines = [
    "# Growth Opportunities Audit",
    "",
    `Generated: ${generated}`,
    "",
    "## Resumen",
    "",
    table([
      ["Metrica", "Valor"],
      ["Fichas publicadas/premium", String(total)],
      ["Con google_place_id", `${withGooglePlace} (${pct(withGooglePlace, total)}%)`],
      ["Con primary_image_url", `${withImage} (${pct(withImage, total)}%)`],
      ["Sin primary_image_url", `${total - withImage} (${pct(total - withImage, total)}%)`],
      ["Con nombres de fotos de Google", `${withPhotoNames} (${pct(withPhotoNames, total)}%)`],
      ["Con candidatos de imagen", `${withCandidates} (${pct(withCandidates, total)}%)`],
      ["Restaurantes actuales", String(restaurants.length)]
    ]),
    "",
    "## Cobertura Por Categoria",
    "",
    table([
      ["Categoria", "Total", "Sin foto", "% sin foto", "Sin foto + Google ID", "Sin foto + fotos Google", "Sin foto + candidatos"],
      ...missingImageByCategory.map((row) => [
        safe(row.category),
        String(row.total),
        String(row.missing),
        `${row.missingPct}%`,
        String(row.withGoogle),
        String(row.withPhotos),
        String(row.withImageCandidates)
      ])
    ]),
    "",
    "## Categorias Actuales",
    "",
    table([
      ["Categoria", "Total", "Rating medio", "Reviews totales"],
      ...[...byCategory.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([category, items]) => {
          const ratings = items.map((row) => row.rating).filter((value): value is number => typeof value === "number");
          const avgRating = ratings.length ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(2) : "-";
          const reviews = items.reduce((sum, row) => sum + (row.reviews_count ?? 0), 0);
          return [safe(category), String(items.length), avgRating, reviews.toLocaleString("es-ES")];
        })
    ]),
    "",
    "## Tipos De Google Mas Frecuentes",
    "",
    table([
      ["Tipo", "Fichas"],
      ...[...byType.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([type, count]) => [safe(type), String(count)])
    ]),
    "",
    "## Zonas Mas Frecuentes",
    "",
    table([
      ["Zona", "Fichas"],
      ...[...byArea.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([area, count]) => [safe(area), String(count)])
    ]),
    "",
    "## Subcategorias Potenciales De Restaurantes",
    "",
    table([
      ["Subcategoria", "Coincidencias"],
      ...[...restaurantSubcategoryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([label, count]) => [safe(label), String(count)])
    ]),
    "",
    `Restaurantes sin subcategoria detectada por nombre/tipos: ${restaurantUnclassified.length}`,
    "",
    "## Nuevas Categorias Candidatas",
    "",
    table([
      ["Categoria sugerida", "Slug", "Coincidencias ya presentes", "Ejemplos"],
      ...categoryIdeaRows.map((idea) => [
        idea.label,
        idea.category,
        String(idea.matchingExisting),
        safe(idea.examples.join(", "))
      ])
    ]),
    "",
    "## Top Fichas Sin Foto Por Reviews",
    "",
    table([
      ["#", "Nombre", "Categoria", "Zona", "Rating", "Reviews", "Google ID", "Fotos Google", "Candidatos"],
      ...topMissingImages.map((row, index) => [
        String(index + 1),
        safe(publicName(row)),
        safe(row.category),
        safe(row.city || row.area || row.municipality),
        safe(row.rating),
        safe(row.reviews_count),
        hasText(row.google_place_id) ? "si" : "no",
        String(arrayLength(row.photo_names) || (hasText(row.primary_photo_name) ? 1 : 0)),
        String(arrayLength(row.image_candidate_urls as unknown[] | null))
      ])
    ]),
    "",
    "## Recomendacion Operativa",
    "",
    "1. Importar/asignar fotos para fichas sin `primary_image_url` priorizando las que ya tienen `google_place_id`.",
    "2. Ejecutar primero candidatos de Google y asignacion automatica con score minimo; revisar manualmente las que queden sin candidato.",
    "3. Auditar restaurantes antes de importar mas: si el conteo es bajo o hay tipos mal clasificados, conviene ampliar queries por zona y subcategoria.",
    "4. Crear subcategorias de restaurantes como filtros/rankings derivados, no como categorias principales separadas.",
    "5. Para categorias nuevas, empezar por las de alta intencion comercial: rent a car, bares, cafeterias/brunch, hornos, spas y gimnasios.",
    ""
  ];

  mkdirSync("reports", { recursive: true });
  writeFileSync(reportPath, lines.join("\n"), "utf8");
  console.log(JSON.stringify({ reportPath, total, missingImages: missingImages.length, restaurants: restaurants.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
