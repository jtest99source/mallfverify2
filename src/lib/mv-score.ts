// MV Score — Mallorca Verified's own composite signal.
//
// It combines the two public Google factors we rank on — rating quality and
// review-volume confidence — into a single 0–100 number. It is deliberately on
// a 0–100 scale so it doesn't compete visually with Google's 0–5 rating, which
// stays visible alongside it. This is the number behind the "MV Score" sort
// (formerly "Best overall").
//
//   MV = (rating / 5) · (ln(reviews + 1) / ln(REF + 1)) · 100
//
// where REF is the review count at which volume confidence saturates. A high
// rating with few reviews scores lower than a slightly lower rating backed by
// hundreds of reviews — which is exactly why a 4.7 (800 reviews) outranks a
// 5.0 (12 reviews).

const VOLUME_REFERENCE = 1500;

export function calculateMvScore(rating?: number | null, reviewsCount?: number | null): number | null {
  if (typeof rating !== "number" || typeof reviewsCount !== "number") return null;
  if (rating <= 0 || reviewsCount <= 0) return null;

  const quality = Math.min(1, rating / 5);
  const confidence = Math.min(1, Math.log(reviewsCount + 1) / Math.log(VOLUME_REFERENCE + 1));
  return Math.round(quality * confidence * 100);
}

// Sort comparator that orders by MV Score desc, falling back to review volume so
// businesses that both hit the confidence ceiling are still ranked sensibly.
export function compareByMvScore(
  a: { rating?: number | null; reviewsCount?: number | null },
  b: { rating?: number | null; reviewsCount?: number | null }
): number {
  const scoreA = calculateMvScore(a.rating, a.reviewsCount) ?? -1;
  const scoreB = calculateMvScore(b.rating, b.reviewsCount) ?? -1;
  if (scoreA !== scoreB) return scoreB - scoreA;
  return (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
}
