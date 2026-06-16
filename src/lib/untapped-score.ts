export function calculateUntappedScore(
  rating: number,
  reviewsCount: number,
  maxReviewsInCategory: number,
  minReviewsThreshold = 10,
  minRatingThreshold = 4.3
): number | null {
  if (rating < minRatingThreshold) return null;
  if (reviewsCount < minReviewsThreshold) return null;
  if (maxReviewsInCategory <= 0) return null;

  // Rewards strong ratings while favoring places with fewer reviews than the category leaders.
  const ratingScore = Math.min(1, Math.max(0, (rating - minRatingThreshold) / (5 - minRatingThreshold)));
  const discoveryScore = 1 - Math.min(1, reviewsCount / maxReviewsInCategory);
  return Math.round((ratingScore * 0.65 + discoveryScore * 0.35) * 100);
}

export function isUntapped(score: number | null | undefined, threshold = 70): boolean {
  return typeof score === "number" && score >= threshold;
}
