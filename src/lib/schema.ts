import type { Business, BusinessCategory, FAQ } from "@/types/business";
import type { Ranking } from "@/types/ranking";
import { getCategorySlugFromBusiness, siteUrl } from "@/lib/data";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { siteConfig } from "@/config/site";

function formatCurrencyAmount(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, "");
}

function orientativeRangeFromExactPrice(value: number) {
  const midpoint = Math.max(5, Math.round(value / 5) * 5);
  const spread = midpoint <= 30 ? 5 : midpoint <= 80 ? 10 : 20;
  return {
    min: Math.max(0, midpoint - spread),
    max: midpoint + spread
  };
}

function formatPriceRange(business: Business) {
  const price = business.priceEstimate;
  const currency = price?.currency === "EUR" || !price?.currency ? "€" : price.currency;
  const min = price?.amount_min ?? price?.range_min ?? price?.per_person_min ?? null;
  const max = price?.amount_max ?? price?.range_max ?? price?.per_person_max ?? null;

  if (typeof min === "number" && typeof max === "number") {
    if (min === max) {
      const range = orientativeRangeFromExactPrice(min);
      return `${formatCurrencyAmount(range.min)}-${formatCurrencyAmount(range.max)} ${currency}`;
    }
    return `${formatCurrencyAmount(min)}-${formatCurrencyAmount(max)} ${currency}`;
  }
  if (typeof min === "number") return `from ${formatCurrencyAmount(Math.round(min / 5) * 5)} ${currency}`;
  if (typeof max === "number") return `up to ${formatCurrencyAmount(Math.round(max / 5) * 5)} ${currency}`;
  return business.priceLevel;
}

const schemaDayByName: Record<string, string> = {
  sunday: "Sunday",
  domingo: "Sunday",
  sonntag: "Sunday",
  monday: "Monday",
  lunes: "Monday",
  montag: "Monday",
  tuesday: "Tuesday",
  martes: "Tuesday",
  dienstag: "Tuesday",
  wednesday: "Wednesday",
  miercoles: "Wednesday",
  mittwoch: "Wednesday",
  thursday: "Thursday",
  jueves: "Thursday",
  donnerstag: "Thursday",
  friday: "Friday",
  viernes: "Friday",
  freitag: "Friday",
  saturday: "Saturday",
  sabado: "Saturday",
  samstag: "Saturday"
};

function normalizeSchemaDay(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toSchemaTime(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  const twelveHour = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (twelveHour) {
    let hours = Number(twelveHour[1]);
    const minutes = Number(twelveHour[2] ?? 0);
    const period = twelveHour[3].toUpperCase();
    if (period === "AM" && hours === 12) hours = 0;
    if (period === "PM" && hours !== 12) hours += 12;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  const twentyFourHour = trimmed.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (!twentyFourHour) return null;
  const hours = Number(twentyFourHour[1]);
  const minutes = Number(twentyFourHour[2] ?? 0);
  if (hours < 0 || hours > 24 || minutes < 0 || minutes > 59) return null;
  return `${Math.min(hours, 23).toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function openingHoursSpecification(openingHours?: string) {
  if (!openingHours?.trim()) return undefined;

  const specs = openingHours
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const separator = line.indexOf(":");
      if (separator === -1) return [];
      const day = schemaDayByName[normalizeSchemaDay(line.slice(0, separator))];
      const time = line.slice(separator + 1).trim();
      if (!day || /closed|cerrado|geschlossen/i.test(time)) return [];
      if (/open\s*24\s*hours|24\s*hours|abierto\s*24\s*h(?:oras)?|24\s*h|24\/7/i.test(time)) {
        return [{ "@type": "OpeningHoursSpecification", dayOfWeek: day, opens: "00:00", closes: "23:59" }];
      }

      return time
        .split(",")
        .map((part) => part.trim())
        .map((part) => {
          const [opensRaw, closesRaw] = part.split(/\s*[-–]\s*/);
          const opens = toSchemaTime(opensRaw ?? "");
          const closes = toSchemaTime(closesRaw ?? "");
          if (!opens || !closes) return null;
          return { "@type": "OpeningHoursSpecification", dayOfWeek: day, opens, closes };
        })
        .filter(Boolean);
    });

  return specs.length ? specs : undefined;
}

export function createLocalBusinessSchema(business: Business, locale = "es") {
  const typeByCategory: Partial<Record<BusinessCategory, string>> = {
    restaurant: "Restaurant",
    hotel: "Hotel",
    "beach-club": "LocalBusiness",
    "boat-rental": "SportsActivityLocation",
    activity: "TouristAttraction",
    beach: "LocalBusiness",
    bar: "BarOrPub",
    cafe: "CafeOrCoffeeShop",
    nightlife: "NightClub",
    bakery: "Bakery",
    "rent-a-car": "AutomotiveBusiness",
    spa: "HealthAndBeautyBusiness",
    gym: "ExerciseGym",
    healthcare: "MedicalBusiness",
    "real-estate": "RealEstateAgent",
    museum: "Museum",
    route: "TouristAttraction",
    excursion: "TouristTrip",
    market: "Store",
    "local-shop": "Store",
    "car-dealer": "AutoDealer"
  };

  const image = business.primaryImageUrl || business.galleryImageUrls?.[0] || business.image;
  const url = `${siteUrl}/${locale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`;
  const publicWebsite = ["instagram", "facebook", "tiktok", "linktree"].includes(business.websiteType ?? "") ? null : business.website;
  const priceRange = formatPriceRange(business);

  return {
    "@context": "https://schema.org",
    "@type": typeByCategory[business.category] ?? "LocalBusiness",
    "@id": `${url}#business`,
    name: getBusinessPublicName(business),
    description: business.editorialDescription || business.aiDescription || business.shortDescription || business.description,
    url,
    image,
    address: business.address,
    telephone: business.phone,
    priceRange,
    hasMap: business.googleMapsUrl,
    sameAs: publicWebsite ? [publicWebsite] : [],
    areaServed: business.area,
    inLanguage: locale,
    openingHoursSpecification: openingHoursSpecification(business.openingHours),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".rating-summary", ".business-contact-summary"]
    },
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

export function createSimpleItemListSchema({
  name,
  description,
  items
}: {
  name: string;
  description?: string;
  items: Array<{ position: number; name: string; url?: string; description?: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url,
      description: item.description
    }))
  };
}

export function createCollectionPageSchema({
  name,
  description,
  url,
  inLanguage
}: {
  name: string;
  description: string;
  url: string;
  inLanguage: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    inLanguage
  };
}

export function createArticleSchema({
  headline,
  description,
  datePublished,
  dateModified,
  image,
  author = false,
  inLanguage
}: {
  headline: string;
  description: string;
  datePublished?: string;
  dateModified: string;
  image?: string;
  author?: boolean;
  inLanguage?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished: datePublished ?? dateModified,
    dateModified,
    inLanguage,
    image,
    author: createOrganizationSchema(false),
    publisher: createOrganizationSchema(false)
  };
}

export function createOrganizationSchema(withContext = true) {
  return {
    ...(withContext ? { "@context": "https://schema.org" } : {}),
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/mallorca-verified-logo-ai-transparent.png`,
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
