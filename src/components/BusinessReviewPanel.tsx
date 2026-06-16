import type { Business, FeaturedReview, GoogleReview, ReviewTheme } from "@/types/business";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n-copy";

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

function prettyKey(key: string, locale: Locale) {
  const labels: Record<Locale, Record<string, string>> = {
    es: {
      ambiente: "Ambiente",
      servicio: "Servicio",
      comida: "Comida",
      comida_bebida: "Comida",
      ubicacion: "Ubicación",
      valor_precio: "Precio",
      descanso: "Descanso",
      habitaciones: "Habitaciones",
      trato: "Trato",
      barcos: "Barcos",
      reserva: "Reserva",
      experiencia: "Experiencia",
      organizacion: "Organización",
      guia: "Guía",
      seguridad: "Seguridad",
      paisaje: "Paisaje",
      acceso: "Acceso",
      servicios: "Servicios",
      tranquilidad: "Tranquilidad"
    },
    en: {
      ambiente: "Atmosphere",
      servicio: "Service",
      comida: "Food",
      comida_bebida: "Food",
      ubicacion: "Location",
      valor_precio: "Value",
      descanso: "Rest",
      habitaciones: "Rooms",
      trato: "Hospitality",
      barcos: "Boats",
      reserva: "Booking",
      experiencia: "Experience",
      organizacion: "Organization",
      guia: "Guide",
      seguridad: "Safety",
      paisaje: "Scenery",
      acceso: "Access",
      servicios: "Services",
      tranquilidad: "Quiet"
    },
    de: {
      ambiente: "Ambiente",
      servicio: "Service",
      comida: "Essen",
      comida_bebida: "Essen",
      ubicacion: "Lage",
      valor_precio: "Preis-Leistung",
      descanso: "Ruhe",
      habitaciones: "Zimmer",
      trato: "Gastfreundschaft",
      barcos: "Boote",
      reserva: "Buchung",
      experiencia: "Erlebnis",
      organizacion: "Organisation",
      guia: "Guide",
      seguridad: "Sicherheit",
      paisaje: "Landschaft",
      acceso: "Zugang",
      servicios: "Services",
      tranquilidad: "Ruhe"
    }
  };

  return labels[locale][key] ?? key.replace(/_/g, " ").replace(/^\w/, (letter) => letter.toUpperCase());
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
      <p>{review.text}</p>
      {review.topic && <span className="rv-review-tag">{review.topic}</span>}
    </article>
  );
}

function googleReviewText(review: GoogleReview) {
  const text = review.text?.replace(/\s+/g, " ").trim() ?? "";
  return text.length > 360 ? `${text.slice(0, 357).trim()}...` : text;
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

function sentimentFallbackThemes(sentiment: Business["reviewSentiment"], locale: Locale): ReviewTheme[] {
  return Object.entries(sentiment ?? {})
    .filter(([, value]) => typeof value === "number" && Number.isFinite(value))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, value]) => ({
      label: prettyKey(key, locale),
      icon: "point",
      mentions: Math.max(1, Math.round(value / 25))
    }));
}

export function BusinessReviewPanel({ business, locale }: { business: Business; locale: Locale }) {
  const copy = t(locale);
  const themes = (business.reviewThemes?.length ? business.reviewThemes : sentimentFallbackThemes(business.reviewSentiment, locale))
    .filter((theme) => theme.label?.trim())
    .slice(0, 6);
  const hasPros = Boolean(business.reviewPros?.length);
  const displayedReviews = business.featuredReviews?.length ? business.featuredReviews : googleReviewsAsFeatured(business.googleReviews);
  const hasFeaturedReviews = Boolean(displayedReviews.length);
  const hasServices = Boolean(business.services?.length) && !(business.category === "beach" && business.categoryAttributes);
  const rating = formatRating(business.rating, locale);

  if (!rating && !themes.length && !hasPros && !hasFeaturedReviews && !hasServices) return null;

  return (
    <section className="rv" aria-label={copy.business.reviewsSection}>
      {(rating || themes.length > 0) && (
        <div className="rv-block">
          <div className="rv-sec-title">{copy.business.reviewsSection}</div>
          <div className="rv-rating-hero">
            <div className="rv-rating-big">
              {rating && <div className="num">{rating}</div>}
              <div className="stars">{stars(business.rating)}</div>
              <div className="ct">
                {typeof business.reviewsCount === "number" ? `${business.reviewsCount.toLocaleString(numberLocale(locale))} ${copy.business.reviewsOnGoogle}` : "Google"}
              </div>
            </div>
            {themes.length > 0 && (
              <div className="rv-themes">
                <div className="rv-themes-title">{copy.business.repeatedInReviews}</div>
                {themes.map((theme) => (
                  <div className="rv-theme" key={`${theme.label}-${theme.icon ?? "theme"}`}>
                    <span>{theme.label}</span>
                    {theme.mentions > 0 && <span className="rv-theme-count">{theme.mentions}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {hasPros && (
        <div className="rv-block">
          <div className="rv-pc pros">
            <div className="rv-pc-title">{copy.business.whatPeopleLike}</div>
            {business.reviewPros?.slice(0, 4).map((item) => (
              <div className="rv-pc-item" key={item}><span aria-hidden="true">+</span>{item}</div>
            ))}
          </div>
        </div>
      )}

      {hasFeaturedReviews && (
        <div className="rv-block">
          <div className="rv-sec-title">{copy.business.featuredReviews}</div>
          {displayedReviews.slice(0, 3).map((review, index) => (
            <ReviewCard key={`${review.author ?? "review"}-${index}`} review={review} index={index} locale={locale} />
          ))}
          {business.googleMapsUrl && (
            <a href={business.googleMapsUrl} target="_blank" rel="noreferrer" className="rv-google-cta">
              {copy.business.viewAllGoogleReviews}
            </a>
          )}
        </div>
      )}

      {hasServices && (
        <div className="rv-block">
          <div className="rv-sec-title">{copy.business.offers}</div>
          <div className="rv-services">
            {business.services?.slice(0, 10).map((service) => (
              <div className="rv-service" key={`${service.icon}-${service.label}`}>
                {service.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
