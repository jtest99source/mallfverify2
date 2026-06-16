import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { IconExternalLink, IconMapPin, IconPhone } from "@tabler/icons-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryFilter } from "@/components/CategoryFilter";
import { CTABox } from "@/components/CTABox";
import { FAQ } from "@/components/FAQ";
import { BusinessReviewPanel } from "@/components/BusinessReviewPanel";
import { BusinessHours } from "@/components/BusinessHours";
import { JsonLd } from "@/components/JsonLd";
import { BusinessImage, getBusinessImageUrl } from "@/components/BusinessImage";
import { categoryConfigs, getCategorySlugFromBusiness, siteUrl, type CategorySlug } from "@/lib/data";
import { categoryLabelForBusiness, getCategoryCopy, t } from "@/lib/i18n-copy";
import { getBusinessAreaCategoryPages, getBusinessBySlug, getBusinesses, getBusinessSlugsByCategory, getRelatedBusinesses, getRelatedRankings } from "@/lib/repository";
import { createBreadcrumbSchema, createCollectionPageSchema, createFAQSchema, createLocalBusinessSchema } from "@/lib/schema";
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

function getCombinedFaqs(business: Business, publicName: string, location: string) {
  const seen = new Set<string>();
  const combined: FAQType[] = [];
  const editorialFaqs = [...(business.faqAuto ?? []), ...business.faqs];
  const generated: FAQType[] = [
    {
      question: `¿Dónde está ${publicName}?`,
      answer: business.address ? `${publicName} está en ${business.address}.` : `${publicName} está en la zona de ${location}, Mallorca.`
    },
    {
      question: `¿Qué tipo de sitio es ${publicName}?`,
      answer: `${publicName} aparece en Mallorca Verified dentro de ${categoryLabel(business.category)}.`
    }
  ];

  if (typeof business.rating === "number" && typeof business.reviewsCount === "number") {
    generated.push({
      question: `¿Qué valoración tiene ${publicName}?`,
      answer: `${publicName} tiene una valoración de ${formatRating(business.rating)}/5 en Google, basada en ${business.reviewsCount.toLocaleString("es-ES")} reseñas.`
    });
  }

  if (business.website || business.googleMapsUrl) {
    generated.push({
      question: `¿Cómo puedo consultar horarios o reservar en ${publicName}?`,
      answer: business.website
        ? "La forma más fiable es consultar la web oficial antes de ir, especialmente para horarios, reservas y disponibilidad."
        : "La forma más fiable es revisar su ficha de Google Maps antes de ir, especialmente para horarios y disponibilidad."
    });
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

function renderStars(rating?: number) {
  if (typeof rating !== "number") return "Google";
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return "\u2605".repeat(filled) + "\u2606".repeat(5 - filled);
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

function formatPriceEstimate(priceEstimate: Business["priceEstimate"] | null | undefined, locale: Locale) {
  if (!priceEstimate) return null;
  const min = priceEstimate.amount_min ?? priceEstimate.range_min ?? priceEstimate.per_person_min ?? null;
  const max = priceEstimate.amount_max ?? priceEstimate.range_max ?? priceEstimate.per_person_max ?? null;
  const currency = priceEstimate.currency === "EUR" || !priceEstimate.currency ? "\u20ac" : priceEstimate.currency;

  let display: string | null = null;
  if (typeof min === "number" && typeof max === "number") {
    display = min === max ? `${min} ${currency}` : `${min}\u2013${max} ${currency}`;
  } else if (typeof min === "number") {
    display = `${min} ${currency}`;
  } else if (typeof max === "number") {
    display = `${max} ${currency}`;
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

function AddressBar({ business, location, locale }: { business: Business; location: string; locale: Locale }) {
  const copy = t(locale);
  const address = business.address || `${location}, Mallorca`;
  if (!address) return null;

  return (
    <div className="bg-paper">
      <div className="mx-auto flex max-w-[1200px] flex-col items-start gap-2 border border-t-0 border-borderline bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
        <div className="flex items-center gap-2 text-xs leading-5 text-sea">
          <IconMapPin aria-hidden="true" size={14} stroke={2} className="shrink-0 text-coral" />
          <span>{address}</span>
        </div>
        <a
          href={getDirectionsUrl(business)}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 text-[10px] font-bold uppercase tracking-[0.06em] text-turquesa underline-offset-4 hover:underline"
        >
          <span>{copy.business.howToGetThere}</span>
          <IconExternalLink aria-hidden="true" size={12} stroke={2} className="ml-1 inline-block align-[-2px]" />
        </a>
      </div>
    </div>
  );
}

function QuickScore({ business, locale }: { business: Business; locale: Locale }) {
  const copy = t(locale);
  if (typeof business.rating !== "number" && typeof business.reviewsCount !== "number") return null;

  return (
    <div className="rating-summary flex items-center gap-3 rounded-lg border border-[#FFD166]/60 bg-[linear-gradient(135deg,#17324E_0%,#0E5F66_58%,#0E8F72_100%)] p-4 shadow-[0_14px_28px_rgba(14,95,102,0.16)]">
      {typeof business.rating === "number" && <div className="text-4xl font-black leading-none text-[#FFD166]">{formatLocalizedRating(business.rating, locale)}</div>}
      <div>
        <div className="text-xs text-[#FFD166]">{renderStars(business.rating)}</div>
        <div className="mt-1 text-[11px] text-white/75">
          {typeof business.reviewsCount === "number" ? `${business.reviewsCount.toLocaleString(numberLocale(locale))} ${copy.business.reviewsOnGoogle}` : "Google"}
        </div>
      </div>
    </div>
  );
}

export function generateCategoryMetadata(category: CategorySlug, locale: string) {
  const safeLocale = isLocale(locale) ? locale : "es";
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
    description: `${publicName} - ${localizedCategoryLabel(business.category, safeLocale)}, ${location}, Mallorca.${ratingText} Mallorca Verified.`.slice(0, 180),
    path: `/${safeLocale}/${category}/${business.slug}`,
    locale: safeLocale
  });
}

export async function CategoryPage({ category, locale }: { category: CategorySlug; locale: Locale }) {
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
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_46%,#FFF8EC_100%)]">
      <section
        className="relative overflow-hidden border-b border-[#E7DED0] bg-[#FFFDF7] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        data-attribution={categoryImage?.attribution}
        data-image-alt={categoryImage?.alt}
      >
        {categoryImage?.imageUrl && (
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-[42%] bg-cover bg-center opacity-20 lg:block"
            style={{ backgroundImage: `linear-gradient(90deg,#FFFDF7 0%,rgba(255,253,247,0.18) 40%), url(${categoryImage.imageUrl})` }}
          />
        )}
        <div className="relative mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: copy.category.breadcrumbHome, href: `/${locale}` }, { label: config.label, href: `/${locale}/${category}` }]} />
          <div className="mt-6 max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">{copy.category.comparator}</p>
            <h1 className="mt-3 max-w-2xl text-3xl font-black leading-[1.05] text-[#10253D] sm:text-6xl">{config.title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#4B5B4D] sm:mt-5 sm:text-base sm:leading-8">{config.intro}</p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5F6F61] sm:mt-4 sm:leading-7">
              {copy.category.signalLine}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <CategoryFilter businesses={businesses} locale={locale} />
        <section className="mt-12 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-md border border-[#E7DED0] bg-[#FFFDF7] p-6 shadow-[0_16px_42px_rgba(27,46,75,0.06)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0E8F72]">{copy.category.rankingByCategory}</p>
            <h2 className="mt-2 text-3xl font-black text-[#10253D]">{copy.category.topInMallorca(config.label)}</h2>
            <p className="mt-4 text-sm leading-7 text-[#4B5B4D]">
              {copy.category.topIntro}
            </p>
            <Link href={`/${locale}/top/${category}`} className="mt-5 inline-flex rounded-sm bg-[#10253D] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">{copy.category.fullRanking}</Link>
          </div>
          {areaPages.length > 0 && (
            <div className="rounded-md border border-[#E7DED0] bg-[#FFF8EC] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0E8F72]">{copy.category.areaEyebrow}</p>
              <h2 className="mt-2 text-3xl font-black text-[#10253D]">{copy.category.byArea(config.label)}</h2>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {areaPages.map((page) => (
                  <Link key={`${page.areaSlug}-${page.category}`} href={`/${locale}/areas/${page.areaSlug}/${category}`} className="rounded-sm border border-[#E7DED0] bg-[#FFFDF7] p-4 text-sm font-bold text-[#10253D] hover:border-[#0E8F72] hover:bg-white">
                    {page.area} <span className="text-[#5F6F61]">({page.count})</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
        {relatedRankings.length > 0 && (
          <section className="mt-14 rounded-md border border-[#E7DED0] bg-[#FFFDF7] p-6">
            <div className="mb-5 flex items-end justify-between border-b border-[#E7DED0] pb-3">
              <h2 className="text-3xl font-bold text-[#10253D]">{copy.category.relatedRankings}</h2>
              <Link href={`/${locale}/rankings`} className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#0E8F72]">{copy.category.viewAll}</Link>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {relatedRankings.map((ranking) => (
                <Link key={ranking.id} href={`/${locale}/rankings/${ranking.slug}`} className="rounded-sm border border-[#E7DED0] bg-[#FFF8EC] p-5 text-sm font-bold text-[#10253D] hover:border-[#0E8F72] hover:bg-white">{ranking.title}</Link>
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
    <section className="mt-8 hidden overflow-hidden rounded-lg border border-[#F1D3A2] bg-[#FFF8EC] p-6 shadow-[0_18px_45px_rgba(27,46,75,0.06)] lg:block">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B86B1D]">{copy.business.profileCtaEyebrow}</p>
      <h2 className="mt-2 text-2xl font-black leading-tight text-ink">{copy.business.profileCtaTitle}</h2>
      <p className="mt-3 text-sm leading-7 text-olive">
        {copy.business.profileCtaText.replace("la ficha", `la ficha de ${businessName}`)}
      </p>
      <p className="mt-3 rounded-md border border-[#BFE8D2] bg-white px-4 py-3 text-xs font-semibold leading-5 text-[#047857]">
        {copy.business.profileCtaNote}
      </p>
      <Link href={`/${locale}/business`} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#1B2E4B] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_10px_22px_rgba(27,46,75,0.18)] hover:bg-[#0E8F72]">
        {copy.business.profileCtaButton}
      </Link>
    </section>
  );
}

export async function BusinessDetailPage({ category, locale, slug }: { category: CategorySlug; locale: Locale; slug: string }) {
  const alias = getBusinessSlugAlias(category, slug);
  if (alias) redirect(`/${locale}/${category}/${alias}`);

  const business = await getBusinessBySlug(category, slug);
  if (!business) notFound();

  const related = await getRelatedBusinesses(business);
  const publicName = getBusinessPublicName(business);
  const location = business.city || business.area || business.municipality || "Mallorca";
  const copy = t(locale);
  const faqs = getCombinedFaqs(business, publicName, location);
  const galleryImages = getBusinessGalleryImages(business);
  const heroImage = galleryImages[0] || getBusinessImageUrl(business);
  const priceValue = getBusinessPriceValue(business, locale);
  const publicWebsite = business.website && !isSocialWebsiteType(business.websiteType) ? business.website : null;
  const breadcrumbs = [
    { name: copy.category.breadcrumbHome, url: `${siteUrl}/${locale}` },
    { name: getCategoryCopy(category, locale).label, url: `${siteUrl}/${locale}/${category}` },
    { name: publicName, url: `${siteUrl}/${locale}/${category}/${business.slug}` }
  ];

  return (
    <main>
      <section className="bg-paper">
        <div
          className="relative mx-auto h-[clamp(280px,40vh,380px)] max-w-[1200px] overflow-hidden bg-ink bg-cover bg-center"
          style={heroImage ? { backgroundImage: `url(${heroImage})` } : undefined}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,18,14,0.90)_0%,rgba(20,18,14,0.30)_50%,transparent_100%)]" />
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-6 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start gap-3 sm:gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-4xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gold">{localizedCategoryLabel(business.category, locale)} · {location}</p>
                <h1 className="mt-2 text-3xl font-black leading-[0.98] text-paper [text-shadow:_0_2px_12px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-6xl">{publicName}</h1>
              </div>
              <div className="flex w-fit shrink-0 items-stretch gap-2">
              {(typeof business.rating === "number" || typeof business.reviewsCount === "number") && (
                <div className="flex h-[68px] min-w-[104px] shrink-0 flex-col items-center justify-center rounded-md border border-[#FFD166]/70 bg-[#10253D]/95 px-4 py-2.5 text-center shadow-[0_16px_40px_rgba(0,0,0,0.34)]">
                  {typeof business.rating === "number" && <div className="text-[22px] font-black leading-none text-[#FFD166]">{formatLocalizedRating(business.rating, locale)}</div>}
                  <div className="mt-1 text-[10px] tracking-[-0.08em] text-[#FFD166]">{renderStars(business.rating)}</div>
                  {typeof business.reviewsCount === "number" && <div className="mt-1 text-[9px] text-white/75">{business.reviewsCount.toLocaleString(numberLocale(locale))} {copy.business.reviewsOnGoogle.replace(" on Google", "").replace(" auf Google", "").replace(" en Google", "")}</div>}
                </div>
              )}
              {priceValue && (
                <div className="flex h-[68px] min-w-[104px] shrink-0 flex-col items-center justify-center rounded-md border border-[#FFD166]/70 bg-[#10253D]/95 px-4 py-2.5 text-center shadow-[0_16px_40px_rgba(0,0,0,0.34)]">
                  <div className="whitespace-nowrap text-[17px] font-black leading-none text-[#FFD166]">{priceValue.display}</div>
                  <div aria-hidden="true" className="mt-1 h-[10px]" />
                  {priceValue.label && <div className="mt-1 text-[7px] font-bold uppercase tracking-[0.06em] text-white/75">{priceValue.label}</div>}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <AddressBar business={business} location={location} locale={locale} />

      <div className="mx-auto grid max-w-[1200px] items-start gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8 lg:px-8">
        <article className="min-w-0">
          <BusinessReviewPanel business={business} locale={locale} />
          <BusinessProfileReviewCta businessName={publicName} locale={locale} />
        </article>

        <aside className="hidden rounded-md border border-borderline bg-white p-5 shadow-[0_18px_45px_rgba(28,28,24,0.05)] lg:block">
          <div className="lg:sticky lg:top-24">
            <section className="border-b border-linen pb-6">
              <QuickScore business={business} locale={locale} />
              {priceValue && (
                <div className="mt-3 flex items-center justify-between rounded-md border border-borderline bg-paper px-4 py-3">
                  <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-sage">{priceValue.label ? `${copy.business.pricePer} ${priceValue.label}` : copy.business.price}</span>
                  <span className="text-[19px] font-black leading-none text-ink">{priceValue.display}</span>
                </div>
              )}
              <div className="mt-4 grid gap-2">
                {business.googleMapsUrl && <a href={business.googleMapsUrl} target="_blank" rel="noreferrer" className="rounded-sm bg-ink px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-paper">{copy.business.googleMaps}</a>}
                {publicWebsite && <a href={publicWebsite} target="_blank" rel="noreferrer" className="rounded-sm border border-borderline px-4 py-3 text-center text-[11px] font-bold uppercase tracking-[0.1em] text-ink">{business.websiteType === "official_website" ? copy.business.officialWebsite : getWebsiteLabel(business.websiteType)}</a>}
              </div>
            </section>

            {business.category !== "boat-rental" && <BusinessHours openingHours={business.openingHours} locale={locale} />}

            {(business.address || business.phone) && (
              <section className="border-b border-linen py-6">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink">{copy.business.contact}</p>
                <div className="business-contact-summary grid gap-3 text-sm font-medium leading-6 text-ink">
                  {business.address && (
                    <div className="flex gap-2">
                      <IconMapPin aria-hidden="true" size={15} stroke={2} className="mt-1 shrink-0 text-coral" />
                      <span>{business.address}</span>
                    </div>
                  )}
                  {business.phone && (
                    <a href={`tel:${business.phone.replace(/\s+/g, "")}`} className="flex gap-2 hover:text-coral">
                      <IconPhone aria-hidden="true" size={15} stroke={2} className="mt-1 shrink-0 text-coral" />
                      <span>{business.phone}</span>
                    </a>
                  )}
                </div>
              </section>
            )}

            {related.length > 0 && (
              <section className="pt-6">
                <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-ink">{copy.business.related}</p>
                <div className="grid gap-3">
                  {related.map((item) => (
                    <Link key={item.id} href={`/${locale}/${getCategorySlugFromBusiness(item.category)}/${item.slug}`} className="grid grid-cols-[54px_1fr] gap-3 hover:bg-paper">
                      <BusinessImage business={item} category={item.category} variant="card" className="min-h-[54px] rounded-sm p-2" />
                      <div className="min-w-0 py-1">
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-coral">{localizedCategoryLabel(item.category, locale)} · {item.area}</p>
                        <p className="mt-1 line-clamp-2 text-base font-bold leading-tight text-ink">{getBusinessPublicName(item)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>
      <JsonLd data={[createLocalBusinessSchema(business, locale), createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}

export async function businessStaticParams(category: CategorySlug) {
  return getBusinessSlugsByCategory(category);
}
