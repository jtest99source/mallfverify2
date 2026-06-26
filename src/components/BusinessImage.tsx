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
    "radial-gradient(circle at 20% 20%, rgba(255,204,0,0.10), transparent 30%), linear-gradient(135deg, #0A0A0A 0%, #262626 100%)",
  hotel:
    "radial-gradient(circle at 80% 20%, rgba(255,204,0,0.08), transparent 25%), linear-gradient(135deg, #171717 0%, #0A0A0A 100%)",
  "beach-club":
    "radial-gradient(circle at 70% 30%, rgba(255,204,0,0.12), transparent 35%), linear-gradient(135deg, #0A0A0A 0%, #262626 100%)",
  "boat-rental":
    "radial-gradient(circle at 25% 75%, rgba(255,204,0,0.12), transparent 30%), linear-gradient(135deg, #171717 0%, #0A0A0A 100%)",
  activity:
    "radial-gradient(circle at 78% 18%, rgba(255,204,0,0.10), transparent 25%), linear-gradient(135deg, #0A0A0A 0%, #262626 100%)",
  beach:
    "radial-gradient(circle at 60% 15%, rgba(255,204,0,0.14), transparent 32%), linear-gradient(160deg, #171717 0%, #0A0A0A 100%)"
};

const variantClasses: Record<BusinessImageVariant, string> = {
  card: "relative min-h-[132px] p-4",
  hero: "relative min-h-[360px] p-8",
  detail: "absolute inset-0"
};

const imageOverlays: Record<BusinessImageVariant, string> = {
  card: "linear-gradient(180deg, rgba(12,18,26,0.12), rgba(12,18,26,0.76))",
  hero: "linear-gradient(180deg, rgba(12,18,26,0.10), rgba(12,18,26,0.58))",
  detail: "linear-gradient(90deg, rgba(28,28,24,0.10), rgba(28,28,24,0))"
};

// Businesses where the primary Google photo is wrong (e.g. staff photo instead of building).
// Maps slug → list of gallery indices to try in order. The first valid URL wins.
// If none found, falls back to the scraped primaryImageUrl as usual.
const DIRECT_IMAGE_OVERRIDES: Record<string, string> = {
  "catedral-basilica-de-santa-maria-de-mallorca":
    "https://catedraldemallorca.org/wp-content/uploads/2025/05/CatedralInterior.jpg.webp"
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

  return (
    <div
      aria-label={imageUrl ? imageLabel : `Imagen editorial de ${categoryLabel} en ${location}, Mallorca`}
      className={`editorial-texture flex items-end overflow-hidden bg-[#0A0A0A] ${variantClasses[variant]} ${className}`}
      style={{ backgroundImage, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {!imageUrl && (
        <>
          <div className="absolute left-6 top-6 h-16 w-16 border border-gold/35" />
          <div className="absolute bottom-6 right-6 h-24 w-24 border border-sage/30" />
        </>
      )}
      {children && <div className="relative z-10 w-full [text-shadow:_0_2px_14px_rgba(0,0,0,0.82)]">{children}</div>}
    </div>
  );
}
