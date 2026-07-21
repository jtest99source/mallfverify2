import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { GuideCard } from "@/components/GuideCard";
import { JsonLd } from "@/components/JsonLd";
import { LoadMoreBusinessGrid } from "@/components/LoadMoreBusinessGrid";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { getCategoryGuideKeywords, isCategorySlug, isPublicCategorySlug, siteUrl, type CategorySlug } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessesByAreaAndCategory, getRelatedGuides } from "@/lib/repository";
import { createBreadcrumbSchema, createCollectionPageSchema, createFAQSchema, createSimpleItemListSchema } from "@/lib/schema";
import { generateSeoMetadata } from "@/lib/seo";
import { getCategorySlugFromBusiness } from "@/lib/data";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import type { Business, FAQ as FAQType } from "@/types/business";

function titleFor(areaName: string, category: CategorySlug, locale: Locale) {
  const label = getCategoryCopy(category, locale).label;
  return locale === "es" ? `${label} en ${areaName}` : `${label} in ${areaName}`;
}

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

// Unique, data-driven intro + FAQs per area×category page. Every number comes
// straight from the businesses in the DB — no invented facts.
function areaCategorySummary(businesses: Business[], areaName: string, category: CategorySlug, locale: Locale) {
  const nloc = numberLocale(locale);
  const label = getCategoryCopy(category, locale).label;
  const lowerLabel = locale === "de" ? label : label.toLowerCase();
  const count = businesses.length;
  const rated = businesses.filter((b) => typeof b.rating === "number" && typeof b.reviewsCount === "number" && (b.reviewsCount ?? 0) > 0);
  const totalReviews = rated.reduce((sum, b) => sum + (b.reviewsCount ?? 0), 0);
  const avgRating = rated.length ? rated.reduce((sum, b) => sum + (b.rating ?? 0), 0) / rated.length : null;
  const avg = avgRating ? avgRating.toLocaleString(nloc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null;
  const top = businesses[0];
  const topName = top ? getBusinessPublicName(top) : null;
  const topRating = top && typeof top.rating === "number" ? top.rating.toLocaleString(nloc, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : null;
  const topReviews = top && typeof top.reviewsCount === "number" ? top.reviewsCount.toLocaleString(nloc) : null;
  const languageVerified = businesses.filter((b) => b.languageVerification?.en || b.languageVerification?.de).length;
  const countText = count.toLocaleString(nloc);
  const reviewsText = totalReviews.toLocaleString(nloc);

  const intro =
    locale === "en"
      ? [
          `Mallorca Verified tracks ${countText} ${lowerLabel} in ${areaName}, ranked by MV Score — Google rating combined with review volume, never paid placement.`,
          avg && totalReviews > 0 ? `Together they hold ${reviewsText} public Google reviews, averaging ${avg}/5.` : null,
          topName ? `${topName} currently tops the list.` : null,
          languageVerified > 0 ? `${languageVerified.toLocaleString(nloc)} of them have confirmed directly to us that they serve clients in English or German.` : null
        ]
      : locale === "de"
        ? [
            `Mallorca Verified führt ${countText} ${label} in ${areaName}, sortiert nach MV Score — Google-Bewertung kombiniert mit Bewertungsvolumen, ohne bezahlte Platzierungen.`,
            avg && totalReviews > 0 ? `Zusammen kommen sie auf ${reviewsText} öffentliche Google-Rezensionen, im Schnitt ${avg}/5.` : null,
            topName ? `${topName} führt die Liste aktuell an.` : null,
            languageVerified > 0 ? `${languageVerified.toLocaleString(nloc)} davon haben uns direkt bestätigt, dass sie Kunden auf Englisch oder Deutsch betreuen.` : null
          ]
        : [
            `En Mallorca Verified seguimos ${countText} ${lowerLabel} en ${areaName}, ordenados por MV Score — la combinación de valoración de Google y volumen de reseñas, sin posiciones pagadas.`,
            avg && totalReviews > 0 ? `Suman ${reviewsText} reseñas públicas en Google, con una media de ${avg}/5.` : null,
            topName ? `${topName} encabeza ahora mismo la lista.` : null,
            languageVerified > 0 ? `${languageVerified.toLocaleString(nloc)} han confirmado directamente que atienden en inglés o alemán.` : null
          ];

  const faqs: FAQType[] = [];
  if (locale === "en") {
    faqs.push({
      question: `How many ${lowerLabel} are listed in ${areaName}?`,
      answer: `Mallorca Verified currently lists ${countText} ${lowerLabel} in ${areaName}. The ranking updates as Google ratings and review counts change.`
    });
    if (topName && topRating && topReviews)
      faqs.push({
        question: `Which of the ${lowerLabel} in ${areaName} is rated highest?`,
        answer: `${topName} currently leads the ${areaName} list with ${topRating}/5 on Google from ${topReviews} reviews. Positions come from the MV Score (rating × review volume), not from paid placement.`
      });
    if (languageVerified > 0)
      faqs.push({
        question: `Are there ${lowerLabel} in ${areaName} with English or German-speaking staff?`,
        answer: `${languageVerified.toLocaleString(nloc)} of the ${countText} listed have confirmed directly to Mallorca Verified that they serve clients in English or German — look for the language badge on their profiles.`
      });
  } else if (locale === "de") {
    faqs.push({
      question: `Wie viele ${label} gibt es in ${areaName}?`,
      answer: `Mallorca Verified listet aktuell ${countText} ${label} in ${areaName}. Das Ranking wird laufend an Google-Bewertungen und Rezensionszahlen angepasst.`
    });
    if (topName && topRating && topReviews)
      faqs.push({
        question: `Wer führt das Ranking der ${label} in ${areaName} an?`,
        answer: `${topName} liegt aktuell vorn — ${topRating}/5 auf Google bei ${topReviews} Rezensionen. Die Reihenfolge ergibt sich aus dem MV Score (Bewertung × Rezensionsvolumen), nicht aus bezahlten Platzierungen.`
      });
    if (languageVerified > 0)
      faqs.push({
        question: `Gibt es in ${areaName} ${label} mit englisch- oder deutschsprachigem Service?`,
        answer: `${languageVerified.toLocaleString(nloc)} von ${countText} gelisteten Betrieben haben uns direkt bestätigt, dass sie Kunden auf Englisch oder Deutsch betreuen — erkennbar am Sprach-Badge im Profil.`
      });
  } else {
    faqs.push({
      question: `¿Cuántos ${lowerLabel} hay en ${areaName}?`,
      answer: `Mallorca Verified recoge actualmente ${countText} ${lowerLabel} en ${areaName}. El ranking se actualiza según cambian las valoraciones y reseñas de Google.`
    });
    if (topName && topRating && topReviews)
      faqs.push({
        question: `¿Quién encabeza el ranking de ${lowerLabel} en ${areaName}?`,
        answer: `${topName} lidera actualmente con ${topRating}/5 en Google (${topReviews} reseñas). El orden sale del MV Score (valoración × volumen de reseñas), no de posiciones pagadas.`
      });
    if (languageVerified > 0)
      faqs.push({
        question: `¿Hay ${lowerLabel} en ${areaName} que atiendan en inglés o alemán?`,
        answer: `${languageVerified.toLocaleString(nloc)} de los ${countText} listados han confirmado directamente a Mallorca Verified que atienden en inglés o alemán; busca la insignia de idioma en su ficha.`
      });
  }

  return { intro: intro.filter(Boolean).join(" "), faqs };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; area: string; category: string }> }) {
  const { locale, area, category } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  if (!isCategorySlug(category) || !isPublicCategorySlug(category)) return {};
  const { areaName, businesses } = await getBusinessesByAreaAndCategory(area, category);
  if (!businesses.length) return {};
  const title = titleFor(areaName, category, safeLocale);
  const intro = areaCategorySummary(businesses, areaName, category, safeLocale).intro;
  const description = intro.length > 158 ? `${intro.slice(0, 155).trimEnd()}…` : intro;
  return generateSeoMetadata({
    title: `${title} | Mallorca Verified`,
    description,
    path: `/${safeLocale}/areas/${area}/${category}`,
    locale: safeLocale
  });
}

export default async function AreaCategoryPage({ params }: { params: Promise<{ locale: string; area: string; category: string }> }) {
  const { locale, area, category } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  if (!isCategorySlug(category) || !isPublicCategorySlug(category)) notFound();

  const keywords = getCategoryGuideKeywords(category);
  const [{ areaName, businesses }, relatedGuides] = await Promise.all([
    getBusinessesByAreaAndCategory(area, category),
    getRelatedGuides(area, keywords, safeLocale, 3)
  ]);
  if (!businesses.length) notFound();

  const copy = t(safeLocale);
  const config = getCategoryCopy(category, safeLocale);
  const title = titleFor(areaName, category, safeLocale);
  const summary = areaCategorySummary(businesses, areaName, category, safeLocale);
  const breadcrumbs = [
    { name: copy.category.breadcrumbHome, url: `${siteUrl}/${safeLocale}` },
    { name: config.label, url: `${siteUrl}/${safeLocale}/top/${category}` },
    { name: areaName, url: `${siteUrl}/${safeLocale}/areas/${area}/${category}` }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_48%,#FFFFFF_100%)]">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: copy.category.breadcrumbHome, href: `/${safeLocale}` }, { label: config.label, href: `/${safeLocale}/top/${category}` }, { label: areaName, href: `/${safeLocale}/areas/${area}/${category}` }]} />
          <div className="mt-7 max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.category.areaEyebrow}</p>
            <h1 className="mt-3 font-sans text-5xl font-black leading-none text-ink sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-olive">{summary.intro}</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-olive/80">{copy.category.signalLine}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#E5E7EB] bg-white/80 p-4 shadow-[0_18px_45px_rgba(10,10,10,0.035)]">
          <p className="text-sm font-semibold text-olive">{businesses.length.toLocaleString(numberLocale(safeLocale))} {copy.filters.results}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${safeLocale}/top/${category}`} className="rounded-sm border border-white/[0.12] bg-[#0C1A2E] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/70 hover:border-white/30 hover:text-white">{copy.category.fullRanking}</Link>
            <a href="mailto:hola@mallorcaverified.com?subject=Business profile on Mallorca Verified" className="rounded-sm bg-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0C1A2E]">{copy.nav.forBusinesses} →</a>
          </div>
        </div>
        <LoadMoreBusinessGrid businesses={businesses} locale={safeLocale} />
        <FAQ faqs={summary.faqs} locale={safeLocale} tone="light" />
      </section>

      {relatedGuides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="border-t border-[#E5E7EB] pt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.category.relatedGuidesEyebrow}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-black text-ink sm:text-3xl">{copy.category.relatedGuidesAreaTitle(areaName)}</h2>
              <Link href={`/${safeLocale}/guides`} className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A] opacity-60 hover:opacity-100">
                {copy.category.viewAllGuides} →
              </Link>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} locale={safeLocale} />
              ))}
            </div>
          </div>
        </section>
      )}

      <JsonLd
        data={[
          createCollectionPageSchema({
            name: title,
            description: summary.intro,
            url: `${siteUrl}/${safeLocale}/areas/${area}/${category}`,
            inLanguage: safeLocale
          }),
          createFAQSchema(summary.faqs),
          createSimpleItemListSchema({
            name: title,
            description: config.metaDescription,
            items: businesses.slice(0, 20).map((business, index) => ({
              position: index + 1,
              name: getBusinessPublicName(business),
              url: `${siteUrl}/${safeLocale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`,
              description: business.shortDescription || business.description
            }))
          }),
          createBreadcrumbSchema(breadcrumbs)
        ]}
      />
    </main>
  );
}
