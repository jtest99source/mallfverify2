import { NextResponse } from "next/server";
import { getBusinesses } from "@/lib/repository";
import { categoryConfigs, type CategorySlug } from "@/lib/data";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import type { Business } from "@/types/business";

const categorySlugs = Object.keys(categoryConfigs) as CategorySlug[];

function imageFor(business: Business) {
  return business.primaryImageUrl || business.galleryImageUrls?.[0] || business.imageCandidateUrls?.[0]?.url || business.image || null;
}

export async function GET() {
  const groups = await Promise.all(categorySlugs.map((category) => getBusinesses(category)));
  const items = groups.flat().map((business) => ({
    id: business.id,
    name: getBusinessPublicName(business),
    slug: business.slug,
    category: business.category,
    location: business.city || business.area || business.municipality || "Mallorca",
    rating: business.rating ?? null,
    reviewsCount: business.reviewsCount ?? null,
    primaryImageUrl: imageFor(business)
  }));

  return NextResponse.json(items, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600"
    }
  });
}
