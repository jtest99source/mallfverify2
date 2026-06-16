function formatRating(rating: number) {
  return rating.toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

function formatReviews(reviewsCount: number) {
  return `${reviewsCount.toLocaleString("es-ES")} reseñas`;
}

export function RatingBadge({ rating, reviewsCount, compact = false }: { rating?: number; reviewsCount?: number; compact?: boolean }) {
  if (typeof rating !== "number" && typeof reviewsCount !== "number") return null;

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#F1D3A2] bg-[#FFF8EC] px-2 py-1 text-[11px] leading-none text-olive">
        {typeof rating === "number" && <span className="font-extrabold text-star">★ {formatRating(rating)}</span>}
        {typeof rating === "number" && typeof reviewsCount === "number" && <span className="text-sage">·</span>}
        <span>{typeof reviewsCount === "number" ? formatReviews(reviewsCount) : "Google"}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-md border border-[#FFD166]/60 bg-[linear-gradient(135deg,#17324E_0%,#0E5F66_58%,#0E8F72_100%)] px-3 py-2 text-white shadow-[0_10px_22px_rgba(14,95,102,0.12)]">
      {typeof rating === "number" && <span className="text-2xl font-black text-[#FFD166]">★ {formatRating(rating)}</span>}
      <span className="text-xs leading-4 text-white/75">
        {typeof reviewsCount === "number" ? `${formatReviews(reviewsCount)} verificadas en Google` : "Google"}
      </span>
    </div>
  );
}
