import type { Business, BusinessCategory, FAQ } from "@/types/business";
import type { Ranking } from "@/types/ranking";
import { getCategorySlugFromBusiness, siteUrl } from "@/lib/data";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { siteConfig } from "@/config/site";

export function createLocalBusinessSchema(business: Business) {
  const typeByCategory: Partial<Record<BusinessCategory, string>> = {
    restaurant: "Restaurant",
    hotel: "Hotel",
    "beach-club": "LocalBusiness",
    "boat-rental": "SportsActivityLocation",
    activity: "TouristAttraction",
    beach: "Beach"
  };

  const image = business.primaryImageUrl || business.galleryImageUrls?.[0] || business.image;
  const url = `${siteUrl}/es/${getCategorySlugFromBusiness(business.category)}/${business.slug}`;
  const publicWebsite = ["instagram", "facebook", "tiktok", "linktree"].includes(business.websiteType ?? "") ? null : business.website;

  return {
    "@context": "https://schema.org",
    "@type": typeByCategory[business.category] ?? "LocalBusiness",
    name: getBusinessPublicName(business),
    description: business.shortDescription,
    url,
    image,
    address: business.address,
    telephone: business.phone,
    sameAs: publicWebsite ? [publicWebsite] : [],
    areaServed: business.area,
    aggregateRating:
      typeof business.rating === "number" && typeof business.reviewsCount === "number"
        ? {
            "@type": "AggregateRating",
            ratingValue: business.rating,
            reviewCount: business.reviewsCount
          }
        : undefined,
    geo:
      business.latitude && business.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: business.latitude,
            longitude: business.longitude
          }
        : undefined
  };
}

export function createFAQSchema(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };
}

export function createItemListSchema(ranking: Ranking) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: ranking.title,
    description: ranking.intro,
    itemListElement: ranking.items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: "url" in item && typeof item.url === "string" ? item.url : undefined,
      description: "schemaDescription" in item && typeof item.schemaDescription === "string" ? item.schemaDescription : item.description
    }))
  };
}

export function createArticleSchema({
  headline,
  description,
  dateModified,
  image,
  author = false
}: {
  headline: string;
  description: string;
  dateModified: string;
  image?: string;
  author?: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    dateModified,
    image,
    author: author ? createOrganizationSchema() : undefined,
    publisher: createOrganizationSchema()
  };
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.organizationDescription,
    sameAs: [] as string[]
  };
}

export function createBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
