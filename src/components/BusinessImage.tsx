import type { Business, BusinessCategory } from "@/types/business";
import type { ReactNode } from "react";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { categoryConfigs, getCategorySlugFromBusiness } from "@/lib/data";

type BusinessImageVariant = "card" | "hero" | "detail";

type BusinessImageProps = {
  business: Business;
  category: BusinessCategory;
  variant: BusinessImageVariant;
  className?: string;
  children?: ReactNode;
};

const abstractBackgrounds: Partial<Record<BusinessCategory, string>> = {
  restaurant:
    "radial-gradient(circle at 20% 18%, rgba(255,204,0,0.24), transparent 28%), linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)",
  hotel:
    "radial-gradient(circle at 80% 18%, rgba(255,204,0,0.20), transparent 28%), linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)",
  "beach-club":
    "radial-gradient(circle at 70% 30%, rgba(255,204,0,0.22), transparent 35%), linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)",
  "boat-rental":
    "radial-gradient(circle at 25% 75%, rgba(255,204,0,0.22), transparent 30%), linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)",
  activity:
    "radial-gradient(circle at 78% 18%, rgba(255,204,0,0.20), transparent 25%), linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)",
  beach:
    "radial-gradient(circle at 60% 15%, rgba(255,204,0,0.20), transparent 32%), linear-gradient(160deg, #FFFFFF 0%, #F3F4F6 100%)"
};

const variantClasses: Record<BusinessImageVariant, string> = {
  card: "relative min-h-[132px] p-4",
  hero: "relative min-h-[360px] p-8",
  detail: "absolute inset-0"
};

const imageOverlays: Record<BusinessImageVariant, string> = {
  card: "linear-gradient(180deg, rgba(10,10,10,0.02), rgba(10,10,10,0.24))",
  hero: "linear-gradient(180deg, rgba(10,10,10,0.08), rgba(10,10,10,0.54))",
  detail: "linear-gradient(90deg, rgba(28,28,24,0.10), rgba(28,28,24,0))"
};

// Businesses where the primary Google photo is wrong (e.g. staff photo instead of building).
// Maps slug → list of gallery indices to try in order. The first valid URL wins.
// If none found, falls back to the scraped primaryImageUrl as usual.
const DIRECT_IMAGE_OVERRIDES: Record<string, string> = {
  "catedral-basilica-de-santa-maria-de-mallorca":
    "https://catedraldemallorca.org/wp-content/uploads/2025/05/CatedralInterior.jpg.webp",
  "illeta-camp-de-mar":
    "https://lh3.googleusercontent.com/place-photos/AJRVUZOUKjISFZlFHX6Nyh6myuMTvL5jvUv8zg7RykqUdG3dlsNWMHmGy3vIK0rqLMIRjHumvsoLrJM7I2CnTvyQYq2rx-zIX3YkqZ1uh5aYA4Il4neOu85H3_Hl_7ZC48H-f5TPqcQcP3JTqdLHR0cKZyGe=s4800-w1600",
  "restaurante-illeta":
    "https://lh3.googleusercontent.com/place-photos/AJRVUZOUKjISFZlFHX6Nyh6myuMTvL5jvUv8zg7RykqUdG3dlsNWMHmGy3vIK0rqLMIRjHumvsoLrJM7I2CnTvyQYq2rx-zIX3YkqZ1uh5aYA4Il4neOu85H3_Hl_7ZC48H-f5TPqcQcP3JTqdLHR0cKZyGe=s4800-w1600"
};

const GALLERY_INDEX_OVERRIDES: Record<string, number[]> = {
  "catedral-basilica-de-santa-maria-de-mallorca": [1, 2, 3, 4, 5],
};

function hasRealBusinessImage(image?: string) {
  if (!image) return false;
  return !image.includes("placeholder") && !image.endsWith(".svg");
}

export function getBusinessImageUrl(business: Business) {
  const slug = business.slug;
  if (slug && slug in DIRECT_IMAGE_OVERRIDES) return DIRECT_IMAGE_OVERRIDES[slug];

  if (slug && slug in GALLERY_INDEX_OVERRIDES) {
    const gallery = business.galleryImageUrls ?? [];
    for (const idx of GALLERY_INDEX_OVERRIDES[slug]) {
      const candidate = gallery[idx];
      if (hasRealBusinessImage(candidate)) return candidate;
    }
  }
  if (hasRealBusinessImage(business.primaryImageUrl)) return business.primaryImageUrl;
  for (const candidate of business.galleryImageUrls ?? []) {
    if (hasRealBusinessImage(candidate)) return candidate;
  }
  if (hasRealBusinessImage(business.image)) return business.image;
  return undefined;
}

export function BusinessImage({ business, category, variant, className = "", children }: BusinessImageProps) {
  const imageUrl = getBusinessImageUrl(business);
  const publicName = getBusinessPublicName(business);
  const categoryLabel = categoryConfigs[getCategorySlugFromBusiness(category)].singular;
  const location = business.city || business.area || business.municipality || "Mallorca";
  const imageLabel = `${publicName} - ${categoryLabel} en ${location}, Mallorca`;
  const backgroundImage = imageUrl
    ? `${imageOverlays[variant]}, url(${imageUrl})`
    : abstractBackgrounds[category] ?? abstractBackgrounds.activity;
  const childClassName = imageUrl
    ? "relative z-10 w-full [text-shadow:_0_2px_14px_rgba(0,0,0,0.82)]"
    : "relative z-10 w-full [text-shadow:none] [&_.text-white]:!text-[#0A0A0A]";

  return (
    <div
      aria-label={imageUrl ? imageLabel : `Imagen editorial de ${categoryLabel} en ${location}, Mallorca`}
      className={`editorial-texture flex items-end overflow-hidden ${imageUrl ? "bg-[#0A0A0A]" : "bg-[#F3F4F6]"} ${variantClasses[variant]} ${className}`}
      style={{ backgroundImage, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {!imageUrl && (
        <>
          <div className="absolute left-5 top-5 h-12 w-12 border border-[#0A0A0A]/15" />
          <div className="absolute bottom-5 right-5 h-20 w-20 border border-[#0A0A0A]/10" />
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FFCC00]" />
        </>
      )}
      {children && <div className={childClassName}>{children}</div>}
    </div>
  );
}
