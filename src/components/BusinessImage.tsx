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
    "radial-gradient(circle at 20% 20%, rgba(194,129,62,0.42), transparent 30%), linear-gradient(135deg, #354030 0%, #1C1C18 62%, #6B7860 100%)",
  hotel:
    "linear-gradient(135deg, rgba(232,200,136,0.34) 0 12%, transparent 12% 24%, rgba(200,191,168,0.2) 24% 36%, transparent 36%), linear-gradient(120deg, #1C1C18, #354030)",
  "beach-club":
    "radial-gradient(circle at 70% 30%, rgba(232,200,136,0.5), transparent 18%), repeating-linear-gradient(135deg, rgba(107,120,96,0.28) 0 2px, transparent 2px 20px), linear-gradient(135deg, #354030, #1C1C18)",
  "boat-rental":
    "repeating-linear-gradient(160deg, rgba(232,200,136,0.22) 0 1px, transparent 1px 26px), radial-gradient(circle at 25% 75%, rgba(194,129,62,0.38), transparent 24%), linear-gradient(135deg, #1C1C18, #354030)",
  activity:
    "linear-gradient(145deg, transparent 0 38%, rgba(232,200,136,0.24) 38% 42%, transparent 42%), radial-gradient(circle at 78% 18%, rgba(194,129,62,0.4), transparent 22%), linear-gradient(135deg, #354030, #4A5440)",
  beach:
    "radial-gradient(circle at 80% 20%, rgba(232,200,136,0.55), transparent 20%), linear-gradient(160deg, rgba(200,191,168,0.28) 0 22%, transparent 22% 44%, rgba(107,120,96,0.24) 44% 66%, transparent 66%), linear-gradient(135deg, #354030, #1C1C18)"
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

function hasRealBusinessImage(image?: string) {
  if (!image) return false;
  return !image.includes("placeholder") && !image.endsWith(".svg");
}

export function getBusinessImageUrl(business: Business) {
  if (hasRealBusinessImage(business.primaryImageUrl)) return business.primaryImageUrl;
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
      className={`editorial-texture flex items-end overflow-hidden bg-sea ${variantClasses[variant]} ${className}`}
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
