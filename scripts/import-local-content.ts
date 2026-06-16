import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { activities } from "../src/data/activities";
import { beachClubs } from "../src/data/beachClubs";
import { beaches } from "../src/data/beaches";
import { boats } from "../src/data/boats";
import { guides } from "../src/data/guides";
import { hotels } from "../src/data/hotels";
import { rankings } from "../src/data/rankings";
import { restaurants } from "../src/data/restaurants";
import type { Business } from "../src/types/business";
import type { Guide } from "../src/types/guide";
import type { Ranking } from "../src/types/ranking";

const businesses: Business[] = [...restaurants, ...hotels, ...beachClubs, ...boats, ...activities, ...beaches];

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

function businessRow(business: Business) {
  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    category: business.category,
    short_description: business.shortDescription,
    description: business.description,
    area: business.area,
    address: business.address ?? null,
    latitude: business.latitude ?? null,
    longitude: business.longitude ?? null,
    website: business.website ?? null,
    instagram: business.instagram ?? null,
    phone: business.phone ?? null,
    price_level: business.priceLevel ?? null,
    tags: business.tags,
    best_for: business.bestFor,
    image: business.image ?? null,
    gallery: business.gallery ?? [],
    opening_hours: business.openingHours ?? null,
    faqs: business.faqs,
    seo: business.seo,
    updated_at: business.updatedAt,
    google_place_id: business.googlePlaceId ?? null,
    rating: business.rating ?? null,
    reviews_count: business.reviewsCount ?? null,
    google_maps_url: business.googleMapsUrl ?? null,
    source: business.source ?? "manual_seed",
    status: business.status ?? "published",
    commercial_priority: business.commercialPriority ?? "low",
    client_potential: business.clientPotential ?? "medium",
    is_featured: business.isFeatured ?? false,
    is_claimed: business.isClaimed ?? false,
    imported_at: new Date().toISOString()
  };
}

function rankingRow(ranking: Ranking) {
  return {
    id: ranking.id,
    slug: ranking.slug,
    locale: ranking.locale,
    title: ranking.title,
    hook: ranking.hook,
    intro: ranking.intro,
    category: ranking.category,
    area: ranking.area ?? null,
    faqs: ranking.faqs,
    seo: ranking.seo,
    updated_at: ranking.updatedAt,
    status: ranking.status ?? "published",
    source: ranking.source ?? "manual_seed",
    is_featured: ranking.isFeatured ?? false,
    imported_at: new Date().toISOString()
  };
}

function guideRow(guide: Guide) {
  return {
    id: guide.id,
    slug: guide.slug,
    locale: guide.locale,
    title: guide.title,
    excerpt: guide.excerpt,
    intro: guide.intro,
    sections: guide.sections,
    faqs: guide.faqs,
    seo: guide.seo,
    updated_at: guide.updatedAt,
    status: guide.status ?? "published",
    source: guide.source ?? "manual_seed",
    is_featured: guide.isFeatured ?? false,
    imported_at: new Date().toISOString()
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

  const { error: businessesError } = await supabase.from("businesses").upsert(businesses.map(businessRow), { onConflict: "id" });
  if (businessesError) throw businessesError;

  for (const ranking of rankings) {
    const { error: rankingError } = await supabase.from("rankings").upsert(rankingRow(ranking), { onConflict: "id" });
    if (rankingError) throw rankingError;

    const { error: itemsError } = await supabase.from("ranking_items").upsert(
      ranking.items.map((item) => ({
        ranking_id: ranking.id,
        position: item.position,
        business_id: item.businessId ?? null,
        name: item.name,
        description: item.description,
        why_we_picked_it: item.whyWePickedIt,
        best_for: item.bestFor
      })),
      { onConflict: "ranking_id,position" }
    );
    if (itemsError) throw itemsError;
  }

  const { error: guidesError } = await supabase.from("guides").upsert(guides.map(guideRow), { onConflict: "id" });
  if (guidesError) throw guidesError;

  console.log(`Imported ${businesses.length} businesses, ${rankings.length} rankings and ${guides.length} guides.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
