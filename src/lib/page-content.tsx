import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconExternalLink, IconMapPin, IconPhone } from "@tabler/icons-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CTABox } from "@/components/CTABox";
import { FAQ } from "@/components/FAQ";
import { BusinessReviewPanel } from "@/components/BusinessReviewPanel";
import { BusinessHours } from "@/components/BusinessHours";
import { JsonLd } from "@/components/JsonLd";
import { BusinessImage, getBusinessImageUrl } from "@/components/BusinessImage";
import { categoryConfigs, getCategorySlugFromBusiness, isPublicCategorySlug, siteUrl, type CategorySlug } from "@/lib/data";
import { categoryLabelForBusiness, getCategoryCopy, t } from "@/lib/i18n-copy";
import { getBusinessAreaCategoryPages, getBusinessBySlug, getBusinessRankingContext, getBusinesses, getBusinessSlugsByCategory, getRelatedBusinesses, getRelatedRankings, type BusinessRankingPlacement } from "@/lib/repository";
import { createBreadcrumbSchema, createCollectionPageSchema, createFAQSchema, createLocalBusinessSchema } from "@/lib/schema";
import { MvScoreBadge } from "@/components/MvScoreBadge";
import { LanguageBadge } from "@/components/LanguageBadge";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { getEditorialImageForCategory } from "@/lib/unsplash";
import type { Business, FAQ as FAQType } from "@/types/business";

const businessSlugAliases: Partial<Record<CategorySlug, Record<string, string>>> = {
  restaurants: {
    "el-camino-palma": "el-camino",
    "vandal-palma": "vandal-palma-2",
    "el-patio": "el-patio-2",
    "santi-taura-palma": "dins-santi-taura",
    "illeta-camp-de-mar": "restaurante-illeta"
  },
  hotels: {
    "belmond-la-residencia-deia": "la-residencia-a-belmond-hotel-mallorca",
    "cap-rocat": "hotel-cap-rocat"
  },
  "beach-clubs": {
    "nikki-beach-mallorca": "nikki-beach-mallorca-2"
  },
  boats: {
    "mallorca-boat-hire": "mallorca-boat-hire-2"
  },
  activities: {
    "no-frills-excursions-2": "no-frills-excursions",
    "kayak-tour-mallorca": "kayak-tour-mallorca-2"
  },
  beaches: {
    "cala-mondrago": "cala-mondrago-2",
    "sa-calobra": "sa-calobra-2",
    "playa-de-cala-serena-2": "playa-de-cala-serena",
    "cala-petita": "cala-petita-2",
    "cala-tuent": "cala-tuent-2",
    "playa-de-cala-pi": "playa-de-cala-pi-2",
    "cala-deia": "cala-deia-2",
    "platja-d-alcudia-2": "platja-d-alcudia",
    "playa-de-muro": "platja-de-muro"
  }
};

function getBusinessSlugAlias(category: CategorySlug, slug: string) {
  return businessSlugAliases[category]?.[slug];
}

function getBusinessIdealFor(business: Business) {
  return business.idealFor?.length ? business.idealFor : business.bestFor;
}

function isGenericFaq(faq: FAQType) {
  const text = `${faq.question} ${faq.answer}`.toLowerCase();
  return [
    "datos públicos",
    "datos publicos",
    "revisión humana",
    "revision humana",
    "confirma horarios",
    "confirmar horarios",
    "puede requerir",
    "según los datos",
    "segun los datos"
  ].some((phrase) => text.includes(phrase));
}

function getCombinedFaqs(business: Business, publicName: string, location: string, locale: Locale) {
  const seen = new Set<string>();
  const combined: FAQType[] = [];
  const editorialFaqs = [...(business.faqAuto ?? []), ...business.faqs];
  const localizedCategory = localizedCategoryLabel(business.category, locale);
  const generated: FAQType[] =
    locale === "en"
      ? [
          {
            question: `Where is ${publicName}?`,
            answer: business.address ? `${publicName} is at ${business.address}.` : `${publicName} is in the ${location} area of Mallorca.`
          },
          {
            question: `What type of place is ${publicName}?`,
            answer: `${publicName} is listed on Mallorca Verified as a ${localizedCategory.toLowerCase()}.`
          }
        ]
      : locale === "de"
        ? [
            {
              question: `Wo befindet sich ${publicName}?`,
              answer: business.address ? `${publicName} befindet sich hier: ${business.address}.` : `${publicName} liegt in der Gegend ${location} auf Mallorca.`
            },
            {
              question: `Was für ein Ort ist ${publicName}?`,
              answer: `${publicName} ist bei Mallorca Verified als ${localizedCategory} gelistet.`
            }
          ]
        : [
            {
              question: `¿Dónde está ${publicName}?`,
              answer: business.address ? `${publicName} está en ${business.address}.` : `${publicName} está en la zona de ${location}, Mallorca.`
            },
            {
              question: `¿Qué tipo de sitio es ${publicName}?`,
              answer: `${publicName} aparece en Mallorca Verified dentro de ${localizedCategory}.`
            }
          ];

  if (typeof business.rating === "number" && typeof business.reviewsCount === "number") {
    generated.push(
      locale === "en"
        ? {
            question: `What rating does ${publicName} have?`,
            answer: `${publicName} has a ${formatLocalizedRating(business.rating, locale)}/5 rating on Google, based on ${business.reviewsCount.toLocaleString(numberLocale(locale))} reviews.`
          }
        : locale === "de"
          ? {
              question: `Welche Bewertung hat ${publicName}?`,
              answer: `${publicName} hat eine Bewertung von ${formatLocalizedRating(business.rating, locale)}/5 auf Google, basierend auf ${business.reviewsCount.toLocaleString(numberLocale(locale))} Rezensionen.`
            }
          : {
              question: `¿Qué valoración tiene ${publicName}?`,
              answer: `${publicName} tiene una valoración de ${formatRating(business.rating)}/5 en Google, basada en ${business.reviewsCount.toLocaleString("es-ES")} reseñas.`
            }
    );
  }

  if (business.website || business.googleMapsUrl) {
    generated.push(
      locale === "en"
        ? {
            question: `How can I check hours or book at ${publicName}?`,
            answer: business.website
              ? "The safest option is to check the official website before visiting, especially for opening hours, bookings and availability."
              : "The safest option is to check its Google Maps listing before visiting, especially for opening hours and availability."
          }
        : locale === "de"
          ? {
              question: `Wie kann ich Öffnungszeiten prüfen oder bei ${publicName} reservieren?`,
              answer: business.website
                ? "Am zuverlässigsten ist die offizielle Website, besonders für Öffnungszeiten, Reservierungen und Verfügbarkeit."
                : "Am zuverlässigsten ist der Google-Maps-Eintrag, besonders für Öffnungszeiten und Verfügbarkeit."
            }
          : {
              question: `¿Cómo puedo consultar horarios o reservar en ${publicName}?`,
              answer: business.website
                ? "La forma más fiable es consultar la web oficial antes de ir, especialmente para horarios, reservas y disponibilidad."
                : "La forma más fiable es revisar su ficha de Google Maps antes de ir, especialmente para horarios y disponibilidad."
            }
    );
  }

  for (const faq of [...editorialFaqs, ...(editorialFaqs.length >= 3 ? [] : generated)]) {
    if (isGenericFaq(faq)) continue;
    const key = faq.question.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    combined.push(faq);
    if (combined.length >= 5) break;
  }

  return combined;
}

function getWebsiteLabel(websiteType?: string) {
  const labels: Record<string, string> = {
    official_website: "Web oficial"
  };

  return labels[websiteType ?? ""] ?? "Web";
}

function isSocialWebsiteType(websiteType?: string | null) {
  return ["instagram", "facebook", "tiktok", "linktree"].includes(websiteType ?? "");
}

function categoryLabel(category: Business["category"]) {
  const slug = getCategorySlugFromBusiness(category);
  return categoryConfigs[slug].singular;
}

function localizedCategoryLabel(category: Business["category"], locale: Locale) {
  return categoryLabelForBusiness(category, locale);
}

function isUsableImageUrl(url?: string) {
  return Boolean(url && !url.includes("placeholder") && !url.endsWith(".svg"));
}

function getBusinessGalleryImages(business: Business) {
  const urls = [
    business.primaryImageUrl,
    ...(business.galleryImageUrls ?? []),
    ...(business.imageCandidateUrls ?? [])
      .slice()
      .sort((a, b) => (b.imageQualityScore ?? 0) - (a.imageQualityScore ?? 0))
      .map((candidate) => candidate.url),
    business.image
  ];
  const seen = new Set<string>();

  return urls.filter((url): url is string => {
    if (!url || url.includes("placeholder") || url.endsWith(".svg")) return false;
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function formatRating(rating: number) {
  return rating.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function formatLocalizedRating(rating: number, locale: Locale) {
  return rating.toLocaleString(numberLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function rankingCategoryLabel(category: CategorySlug, locale: Locale) {
  return getCategoryCopy(category, locale).label.toLowerCase();
}

function rankingScopeLabel(placement: BusinessRankingPlacement, category: CategorySlug, locale: Locale) {
  const categoryLabel = rankingCategoryLabel(category, locale);
  if (placement.scope === "island") return locale === "es" ? `${categoryLabel} de Mallorca` : locale === "de" ? `${categoryLabel} auf Mallorca` : `Mallorca ${categoryLabel}`;
  return locale === "es" ? `${categoryLabel} de ${placement.area}` : locale === "de" ? `${categoryLabel} in ${placement.area}` : `${placement.area} ${categoryLabel}`;
}

function rankingEyebrow(placement: BusinessRankingPlacement, category: CategorySlug, locale: Locale) {
  return locale === "es"
    ? `#${placement.position} en ${rankingScopeLabel(placement, category, locale)}`
    : `#${placement.position} in ${rankingScopeLabel(placement, category, locale)}`;
}

function rankingTotalLabel(placement: BusinessRankingPlacement, locale: Locale) {
  const total = placement.total.toLocaleString(numberLocale(locale));
  return locale === "es" ? `de ${total} rankeados` : locale === "de" ? `von ${total} gerankt` : `out of ${total} ranked`;
}

function rankingSecondaryLine(placement: BusinessRankingPlacement, category: CategorySlug, locale: Locale) {
  const label = rankingScopeLabel(placement, category, locale);
  return locale === "es" ? `también #${placement.position} en ${label}` : locale === "de" ? `auch #${placement.position} in ${label}` : `also #${placement.position} in ${label}`;
}

function priceLabelForUnit(unit: NonNullable<Business["priceEstimate"]>["unit"] | null | undefined, locale: Locale) {
  const labels: Record<Locale, Record<string, string>> = {
    es: {
      person: "",
      night: "por noche",
      day: "por día",
      half_day: "por media jornada",
      charter: "por salida",
      ticket: "entrada",
      entry: "entrada"
    },
    en: {
      person: "",
      night: "per night",
      day: "per day",
      half_day: "per half day",
      charter: "per charter",
      ticket: "ticket",
      entry: "entry"
    },
    de: {
      person: "",
      night: "pro Nacht",
      day: "pro Tag",
      half_day: "pro Halbtag",
      charter: "pro Ausfahrt",
      ticket: "Ticket",
      entry: "Eintritt"
    }
  };

  return unit ? labels[locale][unit] ?? null : null;
}

function formatCurrencyAmount(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2).replace(/\.?0+$/, "");
}

function orientativeRangeFromExactPrice(value: number) {
  const midpoint = Math.max(5, Math.round(value / 5) * 5);
  const spread = midpoint <= 30 ? 5 : midpoint <= 80 ? 10 : 20;
  return {
    min: Math.max(0, midpoint - spread),
    max: midpoint + spread
  };
}

function formatPriceEstimate(priceEstimate: Business["priceEstimate"] | null | undefined, locale: Locale) {
  if (!priceEstimate) return null;
  const min = priceEstimate.amount_min ?? priceEstimate.range_min ?? priceEstimate.per_person_min ?? null;
  const max = priceEstimate.amount_max ?? priceEstimate.range_max ?? priceEstimate.per_person_max ?? null;
  const currency = priceEstimate.currency === "EUR" || !priceEstimate.currency ? "\u20ac" : priceEstimate.currency;

  let display: string | null = null;
  if (typeof min === "number" && typeof max === "number") {
    if (min === max) {
      const range = orientativeRangeFromExactPrice(min);
      display = `${formatCurrencyAmount(range.min)}\u2013${formatCurrencyAmount(range.max)} ${currency}`;
    } else {
      display = `${formatCurrencyAmount(min)}\u2013${formatCurrencyAmount(max)} ${currency}`;
    }
  } else if (typeof min === "number") {
    display = `${formatCurrencyAmount(Math.round(min / 5) * 5)} ${currency}`;
  } else if (typeof max === "number") {
    display = `${formatCurrencyAmount(Math.round(max / 5) * 5)} ${currency}`;
  }

  if (!display) return null;
  const storedLabel = priceEstimate.label?.trim();
  const unitLabel = priceLabelForUnit(priceEstimate.unit, locale);
  const label = locale === "es" ? storedLabel || unitLabel || "" : unitLabel || storedLabel || "";
  return { display, label };
}

function getBusinessPriceValue(business: Business, locale: Locale) {
  return formatPriceEstimate(business.priceEstimate, locale);
}

function getDirectionsUrl(business: Business) {
  if (typeof business.latitude === "number" && typeof business.longitude === "number") {
    return `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
  }

  return business.googleMapsUrl ?? "#";
}

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

function truncateMetaDescription(text: string, limit = 160) {
  if (text.length <= limit) return text;
  const cut = text.lastIndexOf(" ", limit);
  return `${text.slice(0, cut > 120 ? cut : limit).trim()}...`;
}

function AddressBar({ business, location, locale }: { business: Business; location: string; locale: Locale }) {
  const copy = t(locale);
  const address = business.address || `${location}, Mallorca`;
  if (!address) return null;

  return (
    <div className="border-y border-white/[0.08] bg-[#07101F]">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
        <div className="flex items-center gap-2 text-xs leading-5 text-white/66">
          <IconMapPin aria-hidden="true" size={14} stroke={2} className="shrink-0 text-[#00C37A]" />
          <span className="sm:hidden">{location}, Mallorca</span>
          <span className="hidden sm:inline">{address}</span>
        </div>
        <a
          href={getDirectionsUrl(business)}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[10px] font-bold uppercase tracking-[0.06em] text-[#00C37A] underline-offset-4 hover:underline"
        >
          <span>{copy.business.howToGetThere}</span>
          <IconExternalLink aria-hidden="true" size={12} stroke={2} className="ml-1 inline-block align-[-2px]" />
        </a>
      </div>
    </div>
  );
}

function MobileBusinessActions({
  business,
  publicWebsite,
  locale
}: {
  business: Business;
  publicWebsite: string | null;
  locale: Locale;
}) {
  const copy = t(locale);
  const actions = [
    business.phone
      ? {
          href: `tel:${business.phone.replace(/\s+/g, "")}`,
          label: locale === "de" ? "Anrufen" : locale === "en" ? "Call" : "Llamar",
          Icon: IconPhone
        }
      : null,
    publicWebsite
      ? {
          href: publicWebsite,
          label: business.websiteType === "official_website" ? copy.business.officialWebsite : getWebsiteLabel(business.websiteType),
          Icon: IconExternalLink,
          external: true
        }
      : null,
    business.googleMapsUrl
      ? {
          href: business.googleMapsUrl,
          label: "Google Maps",
          Icon: IconMapPin,
          external: true
        }
      : null
  ].filter((action): action is { href: string; label: string; Icon: typeof IconPhone; external?: boolean } => Boolean(action));

  if (!actions.length) return null;

  return (
    <section className="bg-[#040D1A] px-4 pb-5 pt-3 lg:hidden">
      <div className="relative mx-auto max-w-[1440px]">
        <div className="grid grid-cols-3 gap-2">
          {actions.map(({ href, label, Icon, external }) => (
            <a
              key={`${href}-${label}`}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
              className="inline-flex min-h-11 min-w-0 items-center justify-center gap-2 rounded-sm border border-white/[0.12] bg-[#0C1A2E] px-3 text-center text-[11px] font-bold leading-tight text-white shadow-sm"
            >
              <Icon aria-hidden="true" size={14} stroke={2} className="text-[#00C37A]" />
              <span className="truncate">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessRankingCard({
  primary,
  island,
  category,
  locale
}: {
  primary?: BusinessRankingPlacement;
  island?: BusinessRankingPlacement;
  category: CategorySlug;
  locale: Locale;
}) {
  if (!primary) return null;
  const showSecondaryIsland = island && primary.scope !== "island";
  const heading =
    locale === "es"
      ? `Posición en ${rankingScopeLabel(primary, category, locale)}`
      : locale === "de"
        ? `Position in ${rankingScopeLabel(primary, category, locale)}`
        : `Position in ${rankingScopeLabel(primary, category, locale)}`;

  return (
    <section className="rounded-sm border border-white/[0.12] bg-[#091525] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/60">{heading}</p>
      <div className="mt-2 font-display text-6xl font-black leading-none text-[#00C37A]">#{primary.position}</div>
      <p className="mt-3 text-xs font-semibold text-white/50">{rankingTotalLabel(primary, locale)}</p>
      {showSecondaryIsland && (
        <div className="mt-4 border-t border-white/[0.08] pt-3 text-xs font-black uppercase tracking-[0.08em] text-white/60">
          {rankingSecondaryLine(island, category, locale)}
        </div>
      )}
    </section>
  );
}

export function generateCategoryMetadata(category: CategorySlug, locale: string) {
  const safeLocale = isLocale(locale) ? locale : "es";
  if (!isPublicCategorySlug(category)) return { robots: { index: false, follow: false } };
  const config = getCategoryCopy(category, safeLocale);
  return generateSeoMetadata({
    title: `${config.title} | Mallorca Verified`,
    description: config.metaDescription,
    path: `/${safeLocale}/${category}`,
    locale: safeLocale
  });
}

export async function generateBusinessMetadata(category: CategorySlug, locale: string, slug: string) {
  const safeLocale = isLocale(locale) ? locale : "es";
  if (!isPublicCategorySlug(category)) return { robots: { index: false, follow: false } };
  const business = await getBusinessBySlug(category, getBusinessSlugAlias(category, slug) ?? slug);
  if (!business) return {};
  const publicName = getBusinessPublicName(business);
  const location = business.city || business.area || business.municipality || "Mallorca";
  const copy = t(safeLocale);
  const ratingText =
    typeof business.rating === "number" && typeof business.reviewsCount === "number"
      ? ` ${formatLocalizedRating(business.rating, safeLocale)}/5, ${business.reviewsCount.toLocaleString(numberLocale(safeLocale))} ${copy.business.reviewsOnGoogle}.`
      : "";
  return generateSeoMetadata({
    title: business.seo.title,
    description: truncateMetaDescription(`${publicName} - ${localizedCategoryLabel(business.category, safeLocale)}, ${location}, Mallorca.${ratingText} Mallorca Verified.`),
    path: `/${safeLocale}/${category}/${business.slug}`,
    locale: safeLocale,
    image: getBusinessImageUrl(business) || business.primaryImageUrl || business.galleryImageUrls?.[0] || business.image
  });
}

export async function CategoryPage({ category, locale }: { category: CategorySlug; locale: Locale }) {
  if (!isPublicCategorySlug(category)) notFound();
  const copy = t(locale);
  const config = getCategoryCopy(category, locale);
  const rawConfig = categoryConfigs[category];
  const [businesses, relatedRankings, categoryImage] = await Promise.all([
    getBusinesses(category),
    getRelatedRankings(category),
    getEditorialImageForCategory(rawConfig.businessCategory)
  ]);
  const areaPages = (await getBusinessAreaCategoryPages(3)).filter((page) => page.category === category).slice(0, 9);
  const faqs = [
    {
      question: copy.category.faqSort(config.label),
      answer: copy.category.faqSortAnswer
    },
    {
      question: copy.category.faqFresh,
      answer: copy.category.faqFreshAnswer
    }
  ];

  return (
    <main className="bg-[#040D1A] text-white">
      <section
        className="relative overflow-hidden border-b border-white/[0.08] bg-[#07101F] px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
        data-attribution={categoryImage?.attribution}
        data-image-alt={categoryImage?.alt}
      >
        {categoryImage?.imageUrl && (
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-[42%] bg-cover bg-center opacity-20 lg:block"
            style={{ backgroundImage: `linear-gradient(90deg,#0A0A0A 0%,rgba(10,10,10,0.38) 42%,rgba(10,10,10,0.72) 100%), url(${categoryImage.imageUrl})` }}
          />
        )}
        <div className="relative mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: copy.category.breadcrumbHome, href: `/${locale}` }, { label: config.label, href: `/${locale}/${category}` }]} />
          <div className="mt-6 max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00C37A]">{copy.category.comparator}</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-black leading-[0.96] text-white sm:text-7xl">{config.title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8">{config.intro}</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">
              {copy.category.signalLine}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <CategoryFilter businesses={businesses} locale={locale} />
        <section className="mt-12 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6 shadow-[0_16px_42px_rgba(0,0,0,0.20)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00C37A]">{copy.category.rankingByCategory}</p>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight text-white">{copy.category.topInMallorca(config.label)}</h2>
            <p className="mt-4 text-sm leading-7 text-white/64">
              {copy.category.topIntro}
            </p>
            <Link href={`/${locale}/top/${category}`} className="mt-5 inline-flex rounded-sm bg-[#00C37A] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white">{copy.category.fullRanking}</Link>
          </div>
          {areaPages.length > 0 && (
            <div className="rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00C37A]">{copy.category.areaEyebrow}</p>
              <h2 className="mt-2 font-display text-3xl font-black leading-tight text-white">{copy.category.byArea(config.label)}</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {areaPages.map((page) => (
                  <Link key={`${page.areaSlug}-${page.category}`} href={`/${locale}/areas/${page.areaSlug}/${category}`} className="rounded-sm border border-white/[0.10] bg-[#040D1A] p-4 text-sm font-bold text-white hover:border-[#00C37A]/70">
                    {page.area} <span className="text-white/44">({page.count})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
        {relatedRankings.length > 0 && (
          <section className="mt-14 rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6">
            <div className="mb-5 flex items-end justify-between border-b border-white/[0.10] pb-3">
              <h2 className="font-display text-3xl font-bold text-white">{copy.category.relatedRankings}</h2>
              <Link href={`/${locale}/top/restaurants`} className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#00C37A]">{copy.category.viewAll}</Link>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {relatedRankings.map((ranking) => (
                <Link key={ranking.id} href={`/${locale}/rankings/${ranking.slug}`} className="rounded-sm border border-white/[0.10] bg-[#040D1A] p-5 text-sm font-bold text-white hover:border-[#00C37A]/70">{ranking.title}</Link>
              ))}
            </div>
          </section>
        )}
        <FAQ faqs={faqs} />
        <div className="mt-14"><CTABox locale={locale} /></div>
      </section>
      <JsonLd
        data={[
          createCollectionPageSchema({
            name: config.title,
            description: config.intro,
            url: `${siteUrl}/${locale}/${category}`,
            inLanguage: locale
          }),
          createFAQSchema(faqs),
          createBreadcrumbSchema([{ name: copy.category.breadcrumbHome, url: `${siteUrl}/${locale}` }, { name: config.label, url: `${siteUrl}/${locale}/${category}` }])
        ]}
      />
    </main>
  );
}

function BusinessProfileReviewCta({ businessName, locale }: { businessName: string; locale: Locale }) {
  const copy = t(locale);
  return (
    <section className="mt-8 hidden overflow-hidden rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)] lg:block">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00C37A]">{copy.business.profileCtaEyebrow}</p>
      <h2 className="mt-2 text-2xl font-black leading-tight text-white">{copy.business.profileCtaTitle}</h2>
      <p className="mt-3 text-sm leading-7 text-white/68">
        {copy.business.profileCtaText.replace("la ficha", `la ficha de ${businessName}`)}
      </p>
      <p className="mt-3 rounded-sm border border-white/[0.10] bg-white/[0.045] px-4 py-3 text-xs font-semibold leading-5 text-white/72">
        {copy.business.profileCtaNote}
      </p>
      <Link href={`/${locale}/business`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#00C37A] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] shadow-[0_10px_22px_rgba(0,195,122,0.12)] hover:bg-white">
        {copy.business.profileCtaButton}
      </Link>
    </section>
  );
}

function MobileBusinessClaimCta({ businessName, locale }: { businessName: string; locale: Locale }) {
  const copy = t(locale);
  return (
    <section className="mt-6 rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-4 lg:hidden">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#00C37A]">{copy.business.profileCtaEyebrow}</p>
      <h2 className="mt-2 text-xl font-black leading-tight text-white">{copy.business.profileCtaTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-white/68">
        {copy.business.profileCtaText.replace("la ficha", `la ficha de ${businessName}`)}
      </p>
      <Link href={`/${locale}/business`} className="mt-4 inline-flex min-h-10 items-center justify-center rounded-sm bg-[#00C37A] px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white">
        {copy.business.profileCtaButton}
      </Link>
    </section>
  );
}

export async function BusinessDetailPage({ category, locale, slug }: { category: CategorySlug; locale: Locale; slug: string }) {
  if (!isPublicCategorySlug(category)) notFound();
  const alias = getBusinessSlugAlias(category, slug);
  if (alias) redirect(`/${locale}/${category}/${alias}`);

  const business = await getBusinessBySlug(category, slug);
  if (!business) notFound();

  const [related, rankingContext] = await Promise.all([getRelatedBusinesses(business), getBusinessRankingContext(business, category)]);
  const publicName = getBusinessPublicName(business);
  const location = business.city || business.area || business.municipality || "Mallorca";
  const copy = t(locale);
  const faqs = getCombinedFaqs(business, publicName, location, locale);
  const galleryImages = getBusinessGalleryImages(business);
  const heroImage = getBusinessImageUrl(business) || galleryImages[0];
  const priceValue = getBusinessPriceValue(business, locale);
  const publicWebsite = business.website && !isSocialWebsiteType(business.websiteType) ? business.website : null;
  const primaryRanking = rankingContext.primary;
  const secondaryIslandRanking = rankingContext.island && primaryRanking?.scope !== "island" ? rankingContext.island : undefined;
  const heroMeta = [
    typeof business.rating === "number" ? `★ ${formatLocalizedRating(business.rating, locale)}` : null,
    typeof business.reviewsCount === "number" ? `${business.reviewsCount.toLocaleString(numberLocale(locale))} ${copy.business.reviewsOnGoogle}` : null,
    business.address || `${location}, Mallorca`,
    secondaryIslandRanking ? rankingSecondaryLine(secondaryIslandRanking, category, locale) : null
  ].filter(Boolean);
  const breadcrumbs = [
    { name: copy.category.breadcrumbHome, url: `${siteUrl}/${locale}` },
    { name: getCategoryCopy(category, locale).label, url: `${siteUrl}/${locale}/top/${category}` },
    { name: publicName, url: `${siteUrl}/${locale}/${category}/${business.slug}` }
  ];

  return (
    <main className="bg-[#040D1A] text-white">
      <section className="bg-[#040D1A]">
        <div
          className="relative h-[clamp(520px,72vh,780px)] overflow-hidden bg-[#07101F] bg-cover bg-center"
          style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,195,122,0.10),transparent_24%),linear-gradient(to_top,rgba(5,5,5,0.98)_0%,rgba(5,5,5,0.66)_42%,rgba(5,5,5,0.30)_100%)]" />
          <div className="absolute left-4 top-4 z-20 sm:left-8 lg:left-12">
            <Link
              href={`/${locale}/top/${category}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-black/60"
            >
              <IconArrowLeft size={13} stroke={2.5} />
              {getCategoryCopy(category, locale).label}
            </Link>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-10 sm:px-8 lg:px-12">
            <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-6">
              <div className="max-w-4xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">
                  {primaryRanking ? rankingEyebrow(primaryRanking, category, locale) : `${localizedCategoryLabel(business.category, locale)} · ${location}`}
                </p>
                <h1 className="mt-3 max-w-5xl [overflow-wrap:anywhere] font-display text-5xl font-black leading-[0.92] text-white [text-shadow:_0_2px_22px_rgba(0,0,0,0.65)] sm:text-7xl lg:text-8xl">{publicName}</h1>
                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <MvScoreBadge rating={business.rating} reviewsCount={business.reviewsCount} locale={locale} className="px-2.5 py-1.5 text-[13px]" />
                  {heroMeta.length > 0 && <p className="min-w-0 max-w-4xl break-words text-base font-semibold leading-7 text-white/78">{heroMeta.join(" · ")}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AddressBar business={business} location={location} locale={locale} />
      <MobileBusinessActions business={business} publicWebsite={publicWebsite} locale={locale} />
      {business.openingHours && business.category !== "boat-rental" && (
        <div className="border-t border-white/[0.08] bg-[#040D1A] px-4 text-white lg:hidden">
          <div className="mx-auto max-w-[1440px]">
            <BusinessHours openingHours={business.openingHours} locale={locale} />
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-[1440px] items-start gap-8 px-4 py-8 sm:px-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12 lg:px-12">
        <article className="min-w-0">
          {business.languageVerification && (
            <div className="mb-6">
              <LanguageBadge business={business} locale={locale} variant="full" tone="dark" />
            </div>
          )}
          <BusinessReviewPanel business={business} locale={locale} />
        </article>

        <aside className="hidden rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.38)] lg:block">
          <div className="lg:sticky lg:top-24">
            <section className="grid gap-4 border-b border-white/[0.08] pb-6">
              <BusinessRankingCard primary={primaryRanking} island={rankingContext.island} category={category} locale={locale} />
              {priceValue && (
                <div className="flex items-center justify-between rounded-sm border border-white/[0.10] bg-[#091525] px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-white/44">{priceValue.label ? `${copy.business.pricePer} ${priceValue.label}` : copy.business.price}</span>
                  <span className="text-[19px] font-black leading-none text-white">{priceValue.display}</span>
                </div>
              )}
              <div className="grid gap-2">
                {business.googleMapsUrl && <a href={business.googleMapsUrl} target="_blank" rel="noreferrer" className="rounded-sm bg-[#00C37A] px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white">{copy.business.googleMaps}</a>}
                {publicWebsite && <a href={publicWebsite} target="_blank" rel="noreferrer" className="rounded-sm border border-white/[0.14] px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:border-[#00C37A]/70">{business.websiteType === "official_website" ? copy.business.officialWebsite : getWebsiteLabel(business.websiteType)}</a>}
              </div>
            </section>

            {business.category !== "boat-rental" && <BusinessHours openingHours={business.openingHours} locale={locale} />}

            {(business.address || business.phone) && (
              <section className="border-b border-white/[0.08] py-6">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">{copy.business.contact}</p>
                <div className="business-contact-summary grid gap-3 text-sm font-medium leading-6 text-white/72">
                  {business.address && (
                    <div className="flex gap-2">
                      <IconMapPin aria-hidden="true" size={15} stroke={2} className="mt-1 shrink-0 text-[#00C37A]" />
                      <span>{business.address}</span>
                    </div>
                  )}
                  {business.phone && (
                    <a href={`tel:${business.phone.replace(/\s+/g, "")}`} className="flex gap-2 hover:text-[#00C37A]">
                      <IconPhone aria-hidden="true" size={15} stroke={2} className="mt-1 shrink-0 text-[#00C37A]" />
                      <span>{business.phone}</span>
                    </a>
                  )}
                </div>
              </section>
            )}

            {related.length > 0 && (
              <section className="pt-6">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-white">{copy.business.related}</p>
                <div className="grid gap-3">
                  {related.map((item) => (
                    <Link key={item.id} href={`/${locale}/${getCategorySlugFromBusiness(item.category)}/${item.slug}`} className="grid grid-cols-[54px_1fr] gap-3 rounded-sm hover:bg-white/[0.04]">
                      <BusinessImage business={item} category={item.category} variant="card" className="min-h-[54px] rounded-sm p-2" />
                      <div className="min-w-0 py-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#00C37A]">{localizedCategoryLabel(item.category, locale)} · {item.area}</p>
                        <p className="mt-1 line-clamp-2 text-base font-bold leading-tight text-white">{getBusinessPublicName(item)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>
      <section className="mx-auto max-w-[1440px] px-4 pb-8 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-3 rounded-sm border border-white/[0.08] bg-[#0C1A2E] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#00C37A]">
              {locale === "de" ? "Ihr Betrieb?" : locale === "en" ? "Your business?" : "¿Tu negocio?"}
            </p>
            <p className="mt-1 text-sm leading-6 text-white/55">
              {locale === "de"
                ? "Sind Sie der Inhaber? Vervollständigen Sie Ihr Profil kostenlos — mehr Infos, mehr Sichtbarkeit."
                : locale === "en"
                ? "Do you own this business? Complete your listing for free — more info, better visibility."
                : "¿Eres el dueño? Completa tu ficha de forma totalmente gratuita — más información, más visibilidad."}
            </p>
          </div>
          <Link
            href={`/${locale}/contact`}
            className="shrink-0 rounded-sm border border-white/[0.14] px-5 py-3 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:border-[#00C37A]/70 hover:text-[#00C37A]"
          >
            {locale === "de" ? "Kostenlos registrieren →" : locale === "en" ? "Get listed for free →" : "Contactar →"}
          </Link>
        </div>
      </section>

      <JsonLd data={[createLocalBusinessSchema(business, locale), createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}

export async function businessStaticParams(category: CategorySlug) {
  return getBusinessSlugsByCategory(category);
}
