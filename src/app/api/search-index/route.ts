import { NextResponse } from "next/server";
import { categoryConfigs, getCategorySlugFromBusiness, isPublicCategorySlug, publicCategorySlugs, type CategorySlug } from "@/lib/data";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase";
import type { BusinessCategory, ContentStatus } from "@/types/business";

export const dynamic = "force-dynamic";

type SearchBusinessRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  category: BusinessCategory;
  city: string | null;
  area: string | null;
  municipality: string | null;
  rating: number | null;
  reviews_count: number | null;
  primary_image_url: string | null;
  image: string | null;
  status: ContentStatus | null;
};

const publicStatuses: ContentStatus[] = ["published", "premium"];
const categorySlugs: CategorySlug[] = [...publicCategorySlugs];
const configuredCategories = new Set<BusinessCategory>(
  categorySlugs.map((slug) => categoryConfigs[slug].businessCategory)
);
const categoryKeywords: Partial<Record<CategorySlug, string>> = {
  restaurants: "restaurante restaurantes comer cena comida pizzeria hamburgueseria tapas paella sushi italiano",
  hotels: "hotel hoteles alojamiento dormir boutique rural resort",
  "beach-clubs": "beach club beachclub piscina hamacas playa day club",
  boats: "barco barcos lancha alquiler charter patron puerto",
  activities: "actividad actividades plan planes kayak buceo buggy aventura",
  bars: "bar bares copa copas coctel cocteles vermut tapas",
  cafes: "cafe cafeteria cafeterias brunch desayuno coffee specialty",
  nightlife: "discoteca club nightlife night club salir noche fiesta",
  "rent-a-car": "rent car coche alquiler aeropuerto rentacar rental",
  "car-dealers": "coche coches compraventa concesionario segunda mano used car dealer",
  spas: "spa wellness masaje masajes bienestar tratamiento",
  healthcare: "medico clinica doctor dentist dentista salud healthcare emergency",
  "real-estate": "inmobiliaria inmobiliarias real estate property agency alquiler compra casa"
};

function publicName(row: SearchBusinessRow) {
  return row.display_name?.trim() || row.name;
}

function locationFor(row: SearchBusinessRow) {
  return row.city || row.area || row.municipality || "Mallorca";
}

async function getSearchBusinesses() {
  if (!hasSupabaseConfig()) return [];

  const supabase = createSupabaseServerClient();
  const rows: SearchBusinessRow[] = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,city,area,municipality,rating,reviews_count,primary_image_url,image,status")
      .in("status", publicStatuses)
      .range(from, from + pageSize - 1);

    if (error) throw error;

    const page = ((data ?? []) as SearchBusinessRow[]).filter((row) => configuredCategories.has(row.category));
    rows.push(...page);

    if ((data ?? []).length < pageSize) break;
  }

  return rows;
}

export async function GET() {
  try {
    const businesses = await getSearchBusinesses();
    const businessItems = businesses.map((business) => ({
      type: "business" as const,
      id: business.id,
      name: publicName(business),
      slug: business.slug,
      category: business.category,
      location: locationFor(business),
      rating: business.rating ?? null,
      reviewsCount: business.reviews_count ?? null,
      primaryImageUrl: business.primary_image_url || business.image || null
    }));

    const businessesByCategory = new Map<CategorySlug, SearchBusinessRow[]>();
    for (const category of categorySlugs) businessesByCategory.set(category, []);
    for (const business of businesses) {
      const category = getCategorySlugFromBusiness(business.category);
      if (!isPublicCategorySlug(category)) continue;
      businessesByCategory.get(category)?.push(business);
    }

    const rankingItems = categorySlugs.flatMap((category) => {
      const config = categoryConfigs[category];
      const categoryBusinesses = businessesByCategory.get(category) ?? [];
      const countsByLocation = new Map<string, number>();

      for (const business of categoryBusinesses) {
        const location = locationFor(business);
        countsByLocation.set(location, (countsByLocation.get(location) ?? 0) + 1);
      }

      const categoryRanking = {
        type: "ranking" as const,
        id: `ranking:${category}`,
        name: config.title,
        categorySlug: category,
        count: categoryBusinesses.length,
        keywords: `${config.label} ${config.singular} ${categoryKeywords[category] ?? ""} mejores ${config.label} Mallorca ranking top`
      };

      const areaRankings = Array.from(countsByLocation.entries())
        .filter(([, count]) => count >= 3)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))
        .slice(0, 18)
        .map(([location, count]) => ({
          type: "ranking" as const,
          id: `ranking:${category}:${location}`,
          name: `Mejores ${config.label.toLowerCase()} en ${location}`,
          categorySlug: category,
          location,
          count,
          keywords: `${config.label} ${config.singular} ${categoryKeywords[category] ?? ""} mejores mejor ${location} Mallorca ranking top`
        }));

      return [categoryRanking, ...areaRankings];
    });

    return NextResponse.json([...rankingItems, ...businessItems], {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
      }
    });
  } catch (error) {
    console.error("Search index failed", error);
    return NextResponse.json([], { status: 200 });
  }
}
