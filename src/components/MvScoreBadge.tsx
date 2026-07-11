import type { Locale } from "@/lib/i18n";
import { calculateMvScore } from "@/lib/mv-score";

const TOOLTIP: Record<Locale, string> = {
  es: "MV Score — señal propia de Mallorca Verified: valoración × volumen de reseñas (0–100)",
  en: "MV Score — Mallorca Verified's own signal: rating × review volume (0–100)",
  de: "MV Score — eigenes Signal von Mallorca Verified: Bewertung × Rezensionsvolumen (0–100)"
};

export function MvScoreBadge({
  rating,
  reviewsCount,
  locale = "es",
  className = ""
}: {
  rating?: number | null;
  reviewsCount?: number | null;
  locale?: Locale;
  className?: string;
}) {
  const score = calculateMvScore(rating, reviewsCount);
  if (score === null) return null;

  return (
    <span
      title={TOOLTIP[locale]}
      className={`inline-flex items-center gap-1 rounded-full bg-[#00C37A]/12 px-2 py-1 text-[11px] font-black leading-none text-[#00C37A] ring-1 ring-inset ring-[#00C37A]/25 ${className}`}
    >
      <span className="tracking-[0.04em]">MV</span>
      <span className="tabular-nums">{score}</span>
    </span>
  );
}
