import type { Locale } from "@/lib/i18n";

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

function formatRating(rating: number, locale: Locale) {
  return rating.toLocaleString(numberLocale(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

function formatReviews(reviewsCount: number, locale: Locale) {
  const label = locale === "es" ? "reseñas" : locale === "de" ? "Rezensionen" : "reviews";
  return `${reviewsCount.toLocaleString(numberLocale(locale))} ${label}`;
}

export function RatingBadge({
  rating,
  reviewsCount,
  compact = false,
  locale = "es"
}: {
  rating?: number;
  reviewsCount?: number;
  compact?: boolean;
  locale?: Locale;
}) {
  if (typeof rating !== "number" && typeof reviewsCount !== "number") return null;

  if (compact) {
    return (
      <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#F1D3A2] bg-[#FFF8EC] px-2 py-1 text-[10px] leading-none text-olive sm:whitespace-nowrap sm:text-[11px]">
        {typeof rating === "number" && <span className="font-extrabold text-star">★ {formatRating(rating, locale)}</span>}
        {typeof rating === "number" && typeof reviewsCount === "number" && <span className="text-sage">·</span>}
        <span className="truncate">{typeof reviewsCount === "number" ? formatReviews(reviewsCount, locale) : "Google"}</span>
      </div>
    );
  }

  const verifiedLabel = locale === "es" ? "verificadas en Google" : locale === "de" ? "auf Google" : "on Google";

  return (
    <div className="inline-flex items-center gap-3 rounded-md border border-[#FFD166]/60 bg-[linear-gradient(135deg,#17324E_0%,#0E5F66_58%,#0E8F72_100%)] px-3 py-2 text-white shadow-[0_10px_22px_rgba(14,95,102,0.12)]">
      {typeof rating === "number" && <span className="text-2xl font-black text-[#FFD166]">★ {formatRating(rating, locale)}</span>}
      <span className="text-xs leading-4 text-white/75">
        {typeof reviewsCount === "number" ? `${formatReviews(reviewsCount, locale)} ${verifiedLabel}` : "Google"}
      </span>
    </div>
  );
}

