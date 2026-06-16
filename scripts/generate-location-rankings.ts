import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

type BusinessCategory =
  | "restaurant"
  | "hotel"
  | "boat-rental"
  | "activity"
  | "beach-club"
  | "beach"
  | "bar"
  | "cafe"
  | "bakery"
  | "spa"
  | "gym"
  | "rent-a-car"
  | "route"
  | "excursion";
type RankingCategory =
  | "restaurants"
  | "hotels"
  | "boats"
  | "activities"
  | "beach-clubs"
  | "beaches"
  | "bars"
  | "cafes"
  | "bakeries"
  | "spas"
  | "gyms"
  | "rent-a-car"
  | "routes"
  | "excursions";

type CategoryConfig = {
  businessCategory: BusinessCategory;
  rankingCategory: RankingCategory;
  slugPart: string;
  labelPlural: string;
  labelSingular: string;
};

type LocationConfig = {
  label: string;
  slug: string;
};

type BusinessRow = {
  id: string;
  name: string;
  display_name: string | null;
  short_description: string;
  ai_description: string | null;
  editorial_description: string | null;
  area: string | null;
  city: string | null;
  municipality: string | null;
  rating: number | null;
  reviews_count: number | null;
  authority_score: number | null;
};

const CATEGORIES: CategoryConfig[] = [
  { businessCategory: "restaurant", rankingCategory: "restaurants", slugPart: "restaurants", labelPlural: "restaurantes", labelSingular: "restaurante" },
  { businessCategory: "hotel", rankingCategory: "hotels", slugPart: "hotels", labelPlural: "hoteles", labelSingular: "hotel" },
  { businessCategory: "boat-rental", rankingCategory: "boats", slugPart: "boat-rentals", labelPlural: "empresas de alquiler de barcos", labelSingular: "empresa de alquiler de barcos" },
  { businessCategory: "activity", rankingCategory: "activities", slugPart: "activities", labelPlural: "actividades turisticas", labelSingular: "actividad turistica" },
  { businessCategory: "beach-club", rankingCategory: "beach-clubs", slugPart: "beach-clubs", labelPlural: "beach clubs", labelSingular: "beach club" },
  { businessCategory: "beach", rankingCategory: "beaches", slugPart: "beaches", labelPlural: "playas y calas", labelSingular: "playa o cala" },
  { businessCategory: "bar", rankingCategory: "bars", slugPart: "bars", labelPlural: "bares", labelSingular: "bar" },
  { businessCategory: "cafe", rankingCategory: "cafes", slugPart: "cafes", labelPlural: "cafeterias", labelSingular: "cafeteria" },
  { businessCategory: "bakery", rankingCategory: "bakeries", slugPart: "bakeries", labelPlural: "hornos y pastelerias", labelSingular: "horno o pasteleria" },
  { businessCategory: "spa", rankingCategory: "spas", slugPart: "spas", labelPlural: "spas y centros wellness", labelSingular: "spa" },
  { businessCategory: "gym", rankingCategory: "gyms", slugPart: "gyms", labelPlural: "gimnasios y centros deportivos", labelSingular: "gimnasio" },
  { businessCategory: "rent-a-car", rankingCategory: "rent-a-car", slugPart: "rent-a-car", labelPlural: "empresas de rent a car", labelSingular: "rent a car" },
  { businessCategory: "route", rankingCategory: "routes", slugPart: "routes", labelPlural: "rutas y miradores", labelSingular: "ruta o mirador" },
  { businessCategory: "excursion", rankingCategory: "excursions", slugPart: "excursions", labelPlural: "excursiones", labelSingular: "excursion" }
];

const LOCATIONS: LocationConfig[] = [
  { label: "Palma", slug: "palma" },
  { label: "Alcudia", slug: "alcudia" },
  { label: "Andratx", slug: "andratx" },
  { label: "Calvia", slug: "calvia" },
  { label: "Soller", slug: "soller" },
  { label: "Port d'Alcudia", slug: "port-d-alcudia" },
  { label: "Port d'Andratx", slug: "port-d-andratx" },
  { label: "Puerto Portals", slug: "puerto-portals" },
  { label: "Cala d'Or", slug: "cala-d-or" },
  { label: "Playa de Muro", slug: "playa-de-muro" },
  { label: "Magaluf", slug: "magaluf" },
  { label: "Santa Ponca", slug: "santa-ponca" }
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

function publicName(business: BusinessRow) {
  return business.display_name?.trim() || business.name;
}

function descriptionFor(business: BusinessRow) {
  return business.editorial_description || business.ai_description || business.short_description || `${publicName(business)} en ${business.area ?? business.city ?? "Mallorca"}.`;
}

function locationFilter(query: any, location: LocationConfig) {
  return query.or(`area.eq.${location.label},city.eq.${location.label},municipality.eq.${location.label}`);
}

function buildTitle(category: CategoryConfig, location: LocationConfig) {
  return `Top ${category.labelPlural} en ${location.label}`;
}

function buildHook(category: CategoryConfig, location: LocationConfig) {
  return `Ranking GEO de ${category.labelPlural} en ${location.label}, generado desde businesses publicados y ordenado por reputacion, autoridad y volumen de resenas.`;
}

function buildIntro(category: CategoryConfig, location: LocationConfig, count: number) {
  return `Seleccionamos ${count} ${category.labelPlural} publicados en ${location.label} usando authority_score, rating de Google y numero de resenas. Esta pagina se actualiza desde la base de datos para cubrir busquedas locales en Mallorca con entidades reales y datos consistentes.`;
}

function buildFaqs(category: CategoryConfig, location: LocationConfig) {
  return [
    {
      question: `Como se eligen los ${category.labelPlural} en ${location.label}?`,
      answer: "El ranking se genera desde businesses publicados y se ordena por authority_score, numero de resenas y rating."
    },
    {
      question: `Por que aparece ${location.label} en este ranking?`,
      answer: "La ubicacion se infiere a partir de area, city o municipality normalizados en la base de datos."
    },
    {
      question: "Estos rankings son manuales?",
      answer: "No. Se generan automaticamente desde la base de datos y pueden actualizarse cuando cambian negocios, estados o puntuaciones."
    }
  ];
}

async function fetchBusinesses(supabase: any, category: CategoryConfig, location: LocationConfig) {
  let query = supabase
    .from("businesses")
    .select("id,name,display_name,short_description,ai_description,editorial_description,area,city,municipality,rating,reviews_count,authority_score")
    .eq("category", category.businessCategory)
    .in("status", ["published", "premium"])
    .order("authority_score", { ascending: false, nullsFirst: false })
    .order("reviews_count", { ascending: false, nullsFirst: false })
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(10);

  query = locationFilter(query, location);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as BusinessRow[];
}

async function rankingExists(supabase: any, slug: string) {
  const { data, error } = await supabase
    .from("rankings")
    .select("id")
    .eq("locale", "es")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function upsertRanking(supabase: any, category: CategoryConfig, location: LocationConfig, businesses: BusinessRow[]) {
  const slug = `top-${category.slugPart}-${location.slug}`;
  const id = `generated-location-${slug}`;
  const existed = await rankingExists(supabase, slug);
  const updatedAt = new Date().toISOString().slice(0, 10);

  const { error: rankingError } = await supabase.from("rankings").upsert(
    {
      id,
      slug,
      locale: "es",
      title: buildTitle(category, location),
      hook: buildHook(category, location),
      intro: buildIntro(category, location, businesses.length),
      category: category.rankingCategory,
      area: location.label,
      faqs: buildFaqs(category, location),
      seo: {
        title: `${buildTitle(category, location)} | Mallorca Verified`,
        description: `Ranking actualizado de ${category.labelPlural} en ${location.label}, Mallorca, basado en authority_score, rating y resenas.`
      },
      updated_at: updatedAt,
      status: "published",
      source: "generated_geo_location",
      is_featured: false,
      imported_at: new Date().toISOString()
    },
    { onConflict: "id" }
  );

  if (rankingError) throw rankingError;

  const { error: deleteError } = await supabase.from("ranking_items").delete().eq("ranking_id", id);
  if (deleteError) throw deleteError;

  const { error: itemsError } = await supabase.from("ranking_items").insert(
    businesses.map((business, index) => ({
      ranking_id: id,
      position: index + 1,
      business_id: business.id,
      name: publicName(business),
      description: descriptionFor(business),
      why_we_picked_it: `${publicName(business)} destaca en ${location.label} con rating ${business.rating ?? "N/A"}, ${business.reviews_count ?? 0} resenas y authority_score ${business.authority_score ?? "N/A"}.`,
      best_for: [
        location.label,
        business.rating ? `${business.rating}/5` : "rating pendiente",
        `${business.reviews_count ?? 0} resenas`
      ]
    }))
  );

  if (itemsError) throw itemsError;

  return {
    slug,
    category: category.businessCategory,
    location: location.label,
    items: businesses.length,
    existed
  };
}

async function main() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const created = [];
  const updated = [];
  const ignored = [];

  for (const category of CATEGORIES) {
    for (const location of LOCATIONS) {
      const businesses = await fetchBusinesses(supabase, category, location);
      if (businesses.length < 5) {
        ignored.push({
          category: category.businessCategory,
          location: location.label,
          items: businesses.length
        });
        continue;
      }

      const result = await upsertRanking(supabase, category, location, businesses);
      if (result.existed) updated.push(result);
      else created.push(result);
    }
  }

  const generated = [...created, ...updated].sort((a, b) => b.items - a.items);

  console.log(
    JSON.stringify(
      {
        rankings_creados: created.length,
        rankings_actualizados: updated.length,
        rankings_ignorados_por_falta_de_items: ignored.length,
        top_20_rankings_generados: generated.slice(0, 20),
        ignored_preview: ignored.slice(0, 20)
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
