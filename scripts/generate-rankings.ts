import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

type RankingConfig = {
  id: string;
  slug: string;
  title: string;
  category:
    | "boats"
    | "hotels"
    | "restaurants"
    | "beach-clubs"
    | "activities"
    | "beaches"
    | "bars"
    | "cafes"
    | "bakeries"
    | "spas"
    | "gyms"
    | "rent-a-car"
    | "routes"
    | "excursions";
  businessCategory:
    | "boat-rental"
    | "hotel"
    | "restaurant"
    | "beach-club"
    | "activity"
    | "beach"
    | "bar"
    | "cafe"
    | "bakery"
    | "spa"
    | "gym"
    | "rent-a-car"
    | "route"
    | "excursion";
  entityLabel: string;
  introSubject: string;
};

type BusinessRow = {
  id: string;
  name: string;
  display_name: string | null;
  slug: string;
  category: string;
  short_description: string;
  ai_description: string | null;
  editorial_description: string | null;
  area: string | null;
  city: string | null;
  rating: number | null;
  reviews_count: number | null;
  authority_score: number | null;
};

const RANKINGS: RankingConfig[] = [
  {
    id: "generated-top-boat-rentals-mallorca",
    slug: "top-boat-rentals-mallorca",
    title: "Top boat rentals in Mallorca",
    category: "boats",
    businessCategory: "boat-rental",
    entityLabel: "empresas de alquiler de barcos",
    introSubject: "alquiler de barcos y charters"
  },
  {
    id: "generated-top-hotels-mallorca",
    slug: "top-hotels-mallorca",
    title: "Top hotels in Mallorca",
    category: "hotels",
    businessCategory: "hotel",
    entityLabel: "hoteles",
    introSubject: "hoteles"
  },
  {
    id: "generated-top-restaurants-mallorca",
    slug: "top-restaurants-mallorca",
    title: "Top restaurants in Mallorca",
    category: "restaurants",
    businessCategory: "restaurant",
    entityLabel: "restaurantes",
    introSubject: "restaurantes"
  },
  {
    id: "generated-top-beach-clubs-mallorca",
    slug: "top-beach-clubs-mallorca",
    title: "Top beach clubs in Mallorca",
    category: "beach-clubs",
    businessCategory: "beach-club",
    entityLabel: "beach clubs",
    introSubject: "beach clubs"
  },
  {
    id: "generated-top-activities-mallorca",
    slug: "top-activities-mallorca",
    title: "Top activities in Mallorca",
    category: "activities",
    businessCategory: "activity",
    entityLabel: "actividades turisticas",
    introSubject: "actividades turisticas"
  },
  {
    id: "generated-top-beaches-mallorca",
    slug: "top-beaches-mallorca",
    title: "Top beaches in Mallorca",
    category: "beaches",
    businessCategory: "beach",
    entityLabel: "playas y calas",
    introSubject: "playas y calas"
  },
  {
    id: "generated-top-bars-mallorca",
    slug: "top-bars-mallorca",
    title: "Top bars in Mallorca",
    category: "bars",
    businessCategory: "bar",
    entityLabel: "bares",
    introSubject: "bares"
  },
  {
    id: "generated-top-cafes-mallorca",
    slug: "top-cafes-mallorca",
    title: "Top cafes in Mallorca",
    category: "cafes",
    businessCategory: "cafe",
    entityLabel: "cafeterias",
    introSubject: "cafeterias"
  },
  {
    id: "generated-top-bakeries-mallorca",
    slug: "top-bakeries-mallorca",
    title: "Top bakeries in Mallorca",
    category: "bakeries",
    businessCategory: "bakery",
    entityLabel: "hornos y pastelerias",
    introSubject: "hornos y pastelerias"
  },
  {
    id: "generated-top-spas-mallorca",
    slug: "top-spas-mallorca",
    title: "Top spas in Mallorca",
    category: "spas",
    businessCategory: "spa",
    entityLabel: "spas y centros wellness",
    introSubject: "spas y centros wellness"
  },
  {
    id: "generated-top-gyms-mallorca",
    slug: "top-gyms-mallorca",
    title: "Top gyms in Mallorca",
    category: "gyms",
    businessCategory: "gym",
    entityLabel: "gimnasios y centros deportivos",
    introSubject: "gimnasios"
  },
  {
    id: "generated-top-rent-a-car-mallorca",
    slug: "top-rent-a-car-mallorca",
    title: "Top rent a car in Mallorca",
    category: "rent-a-car",
    businessCategory: "rent-a-car",
    entityLabel: "empresas de rent a car",
    introSubject: "rent a car"
  },
  {
    id: "generated-top-routes-mallorca",
    slug: "top-routes-mallorca",
    title: "Top routes in Mallorca",
    category: "routes",
    businessCategory: "route",
    entityLabel: "rutas y miradores",
    introSubject: "rutas y miradores"
  },
  {
    id: "generated-top-excursions-mallorca",
    slug: "top-excursions-mallorca",
    title: "Top excursions in Mallorca",
    category: "excursions",
    businessCategory: "excursion",
    entityLabel: "excursiones",
    introSubject: "excursiones"
  }
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

function locationName(business: BusinessRow) {
  return business.city || business.area || "Mallorca";
}

function shortDescription(business: BusinessRow) {
  return business.editorial_description || business.ai_description || business.short_description || `${publicName(business)} en ${locationName(business)}.`;
}

function hook(config: RankingConfig, businesses: BusinessRow[]) {
  return `Ranking dinamico de ${config.entityLabel} en Mallorca, ordenado por autoridad interna, valoracion publica y volumen de resenas.`;
}

function intro(config: RankingConfig, businesses: BusinessRow[]) {
  const count = businesses.length;
  return `Seleccionamos automaticamente ${count} ${config.entityLabel} publicados en Mallorca usando senales de reputacion y presencia local. El orden prioriza authority_score, rating de Google y numero de resenas para crear una pagina GEO/SEO actualizable desde la base de datos.`;
}

function faqs(config: RankingConfig) {
  return [
    {
      question: `Como se ordena este ranking de ${config.introSubject} en Mallorca?`,
      answer: "El orden se genera automaticamente desde la base de datos usando authority_score, rating y numero de resenas."
    },
    {
      question: "El ranking se actualiza manualmente?",
      answer: "No necesariamente. El comando de generacion puede recalcular el ranking a partir de businesses publicados y guardar el resultado actualizado."
    },
    {
      question: "Que negocios aparecen en este ranking?",
      answer: "Solo aparecen negocios publicados. Los drafts, hidden y otros estados no visibles quedan fuera del ranking publico."
    }
  ];
}

async function generateRanking(supabase: any, config: RankingConfig) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,display_name,slug,category,short_description,ai_description,editorial_description,area,city,rating,reviews_count,authority_score")
    .eq("category", config.businessCategory)
    .in("status", ["published", "premium"])
    .order("authority_score", { ascending: false, nullsFirst: false })
    .order("rating", { ascending: false, nullsFirst: false })
    .order("reviews_count", { ascending: false, nullsFirst: false })
    .limit(20);

  if (error) throw error;

  const businesses = (data ?? []) as BusinessRow[];
  const updatedAt = new Date().toISOString().slice(0, 10);

  const rankingRow = {
    id: config.id,
    slug: config.slug,
    locale: "es",
    title: config.title,
    hook: hook(config, businesses),
    intro: intro(config, businesses),
    category: config.category,
    area: "Mallorca",
    faqs: faqs(config),
    seo: {
      title: `${config.title} | Mallorca Verified`,
      description: `Ranking actualizado de ${config.entityLabel} en Mallorca basado en authority_score, rating y resenas.`
    },
    updated_at: updatedAt,
    status: "published",
    source: "generated_geo",
    is_featured: true,
    imported_at: new Date().toISOString()
  };

  const { error: rankingError } = await supabase.from("rankings").upsert(rankingRow, { onConflict: "id" });
  if (rankingError) throw rankingError;

  const { error: deleteError } = await supabase.from("ranking_items").delete().eq("ranking_id", config.id);
  if (deleteError) throw deleteError;

  if (businesses.length) {
    const { error: itemsError } = await supabase.from("ranking_items").insert(
      businesses.map((business, index) => ({
        ranking_id: config.id,
        position: index + 1,
        business_id: business.id,
        name: publicName(business),
        description: shortDescription(business),
        why_we_picked_it: `${publicName(business)} aparece en ${locationName(business)} con rating ${business.rating ?? "N/A"}, ${business.reviews_count ?? 0} resenas y authority_score ${business.authority_score ?? "N/A"}.`,
        best_for: [
          locationName(business),
          business.rating ? `${business.rating}/5` : "rating pendiente",
          `${business.reviews_count ?? 0} resenas`
        ]
      }))
    );

    if (itemsError) throw itemsError;
  }

  return {
    slug: config.slug,
    category: config.businessCategory,
    items: businesses.length
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

  const { error: schemaError } = await supabase
    .from("businesses")
    .select("display_name,authority_score,city")
    .limit(1);

  if (schemaError) {
    throw new Error(`Missing GEO/display columns. Apply migrations 004 and 006 before generating rankings. Details: ${schemaError.message}`);
  }

  const results = [];
  for (const config of RANKINGS) {
    results.push(await generateRanking(supabase, config));
  }

  console.log(
    JSON.stringify(
      {
        generated_rankings: results.length,
        rankings: results
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
