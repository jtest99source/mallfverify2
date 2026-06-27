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
      <div className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-[#07101F] px-2.5 py-1 text-[10px] leading-none shadow-[0_8px_18px_rgba(0,0,0,0.22)] sm:whitespace-nowrap sm:text-[11px]">
        {typeof rating === "number" && <span className="font-extrabold text-[#FFCC00]">★ {formatRating(rating, locale)}</span>}
        {typeof rating === "number" && typeof reviewsCount === "number" && <span className="text-white/35">/</span>}
        <span className="truncate text-white/75">{typeof reviewsCount === "number" ? formatReviews(reviewsCount, locale) : "Google"}</span>
      </div>
    );
  }

  const verifiedLabel = locale === "es" ? "verificadas en Google" : locale === "de" ? "auf Google" : "on Google";

  return (
    <div className="inline-flex items-center gap-3 rounded-md bg-[#07101F] px-3 py-2 text-white shadow-[0_10px_22px_rgba(10,10,10,0.20)]">
      {typeof rating === "number" && <span className="text-2xl font-black text-[#FFCC00]">★ {formatRating(rating, locale)}</span>}
      <span className="text-xs leading-4 text-white/75">
        {typeof reviewsCount === "number" ? `${formatReviews(reviewsCount, locale)} ${verifiedLabel}` : "Google"}
      </span>
    </div>
  );
}
