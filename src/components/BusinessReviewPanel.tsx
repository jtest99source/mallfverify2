import type { Business, FeaturedReview, GoogleReview } from "@/types/business";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n-copy";
import { ReviewText } from "@/components/ReviewText";

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

function formatRating(value: number | undefined, locale: Locale) {
  if (typeof value !== "number") return null;
  return value.toLocaleString(numberLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function stars(value?: number | null) {
  const rating = typeof value === "number" ? Math.round(value) : 0;
  return "★".repeat(Math.max(0, Math.min(5, rating))) + "☆".repeat(Math.max(0, 5 - rating));
}

function initial(review: FeaturedReview) {
  return (review.author?.trim().charAt(0) || "M").toUpperCase();
}

function ReviewCard({ review, index, locale }: { review: FeaturedReview; index: number; locale: Locale }) {
  const fallbackAuthor = locale === "es" ? "Cliente" : locale === "de" ? "Gast" : "Customer";
  return (
    <article className="rv-review">
      <div className="rv-review-top">
        <div className="rv-review-author">
          <div className={`rv-review-avatar ${index % 2 ? "rv-review-avatar-alt" : ""}`}>{initial(review)}</div>
          <div>
            <div className="rv-review-name">{review.author || fallbackAuthor}</div>
            {review.date && <div className="rv-review-meta">{review.date}</div>}
          </div>
        </div>
        <div className="rv-review-stars">{stars(review.rating)}</div>
      </div>
      <ReviewText text={review.text} locale={locale} />
    </article>
  );
}

function googleReviewText(review: GoogleReview) {
  return review.text?.replace(/\s+/g, " ").trim() ?? "";
}

function googleReviewsAsFeatured(reviews?: GoogleReview[]): FeaturedReview[] {
  return (reviews ?? [])
    .map((review) => ({
      author: review.authorName ?? null,
      rating: review.rating ?? null,
      date: review.relativeTimeDescription ?? null,
      text: googleReviewText(review),
      text_translated: null,
      translated_from: null,
      topic: null,
      lang: review.languageCode ?? null
    }))
    .filter((review) => review.text.length >= 40)
    .slice(0, 3);
}

export function BusinessReviewPanel({ business, locale }: { business: Business; locale: Locale }) {
  const copy = t(locale);
  const displayedReviews = googleReviewsAsFeatured(business.googleReviews);
  const hasFeaturedReviews = Boolean(displayedReviews.length);
  const rating = formatRating(business.rating, locale);

  if (!rating && !hasFeaturedReviews) return null;

  return (
    <section className="rv" aria-label={copy.business.reviewsSection}>
      {rating && (
        <div className="rv-block">
          <div className="rv-sec-title">{copy.business.reviewsSection}</div>
          <div className="rv-rating-hero">
            <div className="rv-rating-big">
              <div className="num">{rating}</div>
              <div className="stars">{stars(business.rating)}</div>
              <div className="ct">
                {typeof business.reviewsCount === "number" ? `${business.reviewsCount.toLocaleString(numberLocale(locale))} ${copy.business.reviewsOnGoogle}` : "Google"}
              </div>
            </div>
          </div>
        </div>
      )}

      {hasFeaturedReviews && (
        <div className="rv-block">
          <div className="rv-sec-title">{copy.business.featuredReviews}</div>
          {displayedReviews.map((review, index) => (
            <ReviewCard key={`${review.author ?? "review"}-${index}`} review={review} index={index} locale={locale} />
          ))}
          {business.googleMapsUrl && (
            <a href={business.googleMapsUrl} target="_blank" rel="noreferrer" className="rv-google-cta">
              {copy.business.viewAllGoogleReviews}
            </a>
          )}
        </div>
      )}
    </section>
  );
}
