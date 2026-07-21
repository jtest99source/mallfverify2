import Link from "next/link";
import { notFound } from "next/navigation";
import { FAQ } from "@/components/FAQ";
import { GuideCard } from "@/components/GuideCard";
import { JsonLd } from "@/components/JsonLd";
import { TopRankingExplorer } from "@/components/TopRankingExplorer";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { getCategoryGuideKeywords, getCategorySlugFromBusiness, isCategorySlug, isPublicCategorySlug, siteUrl, type CategorySlug } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessesForFacetScan, getRelatedGuides, getTopBusinessesByCategory } from "@/lib/repository";
import { createBreadcrumbSchema, createCollectionPageSchema, createFAQSchema, createSimpleItemListSchema } from "@/lib/schema";
import { generateSeoMetadata } from "@/lib/seo";
import { getPopularFacetsForBusinesses } from "@/lib/taxonomy";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";

const TOP_CATEGORY_LIMIT = 1000;

function getTitle(category: CategorySlug, locale: Locale) {
  return getCategoryCopy(category, locale).title;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  if (!isCategorySlug(category) || !isPublicCategorySlug(category)) return {};
  const title = getTitle(category, safeLocale);
  return generateSeoMetadata({
    title: `${title} | Mallorca Verified`,
    description: getCategoryCopy(category, safeLocale).metaDescription,
    path: `/${safeLocale}/top/${category}`,
    locale: safeLocale
  });
}

export default async function TopCategoryPage({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  if (!isCategorySlug(category) || !isPublicCategorySlug(category)) notFound();

  const keywords = getCategoryGuideKeywords(category);
  const [businesses, allCategoryBusinesses, relatedGuides] = await Promise.all([
    getTopBusinessesByCategory(category, TOP_CATEGORY_LIMIT),
    getBusinessesForFacetScan(category),
    getRelatedGuides(null, keywords, safeLocale, 3)
  ]);
  if (!businesses.length) notFound();

  const copy = t(safeLocale);
  const config = getCategoryCopy(category, safeLocale);
  const title = getTitle(category, safeLocale);
  const facets = getPopularFacetsForBusinesses(category, allCategoryBusinesses, category === "beach-clubs" || category === "boats" ? 3 : 5).slice(0, 12);
  const faqs = [
    { question: copy.category.faqSort(config.label), answer: copy.category.faqSortAnswer },
    { question: copy.category.faqFresh, answer: copy.category.faqFreshAnswer }
  ];
  const breadcrumbs = [
    { name: copy.category.breadcrumbHome, url: `${siteUrl}/${safeLocale}` },
    { name: "Rankings", url: `${siteUrl}/${safeLocale}/top/restaurants` },
    { name: config.label, url: `${siteUrl}/${safeLocale}/top/${category}` }
  ];

  return (
    <main className="bg-[#07101F] text-white">
      <section className="border-b border-white/[0.08] bg-[#0C1A2E] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/25">
            <Link href={`/${safeLocale}`} className="transition-colors hover:text-[#00C37A]">{copy.category.breadcrumbHome}</Link>
            <span>/</span>
            <Link href={`/${safeLocale}/top/restaurants`} className="transition-colors hover:text-[#00C37A]">Rankings</Link>
            <span>/</span>
            <span className="text-white/65">{config.label}</span>
          </div>
          <div className="mt-7 max-w-4xl">
            <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00C37A] before:h-px before:w-4 before:bg-[#00C37A]">{copy.category.rankingByCategory}</p>
            <h1 className="font-display mt-3 text-5xl font-black leading-none text-white sm:text-6xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">{copy.category.signalLine}</p>
          </div>
        </div>
      </section>

      {(category === "healthcare" || category === "real-estate") && (
        <div className="border-b border-white/[0.06] bg-[#07101F] px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {category === "healthcare" && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-sm border border-[#00C37A]/20 bg-[#00C37A]/[0.05] px-4 py-3">
                <p className="text-sm text-white/70">
                  {safeLocale === "de"
                    ? "Suchen Sie einen deutschsprachigen Arzt oder Zahnarzt?"
                    : safeLocale === "en"
                      ? "Looking for an English-speaking doctor or dentist?"
                      : "¿Buscas un médico o dentista que hable inglés o alemán?"}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/${safeLocale}/experts/english-speaking-doctors-mallorca`} className="text-xs font-bold text-[#00C37A] hover:text-white">
                    {safeLocale === "de" ? "Ärzte →" : safeLocale === "en" ? "Doctors →" : "Médicos →"}
                  </Link>
                  <Link href={`/${safeLocale}/experts/english-speaking-dentists-mallorca`} className="text-xs font-bold text-[#00C37A] hover:text-white">
                    {safeLocale === "de" ? "Zahnärzte →" : safeLocale === "en" ? "Dentists →" : "Dentistas →"}
                  </Link>
                </div>
              </div>
            )}
            {category === "real-estate" && (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-sm border border-[#00C37A]/20 bg-[#00C37A]/[0.05] px-4 py-3">
                <p className="text-sm text-white/70">
                  {safeLocale === "de"
                    ? "Suchen Sie einen deutschsprachigen Immobilienmakler?"
                    : safeLocale === "en"
                      ? "Looking for an English or German-speaking estate agent?"
                      : "¿Buscas un agente inmobiliario que hable inglés o alemán?"}
                </p>
                <Link href={`/${safeLocale}/experts/estate-agents-mallorca`} className="text-xs font-bold text-[#00C37A] hover:text-white">
                  {safeLocale === "de" ? "Makler-Profile →" : safeLocale === "en" ? "Agent profiles →" : "Agentes verificados →"}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <TopRankingExplorer businesses={businesses} locale={safeLocale} category={category} facets={facets} />

      {relatedGuides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="border-t border-white/[0.08] pt-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00C37A]">{copy.category.relatedGuidesEyebrow}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-bold text-white">{copy.category.relatedGuidesTitle(config.label)}</h2>
              <Link href={`/${safeLocale}/guides`} className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-white/40 hover:text-[#00C37A]">
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

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <FAQ faqs={faqs} locale={safeLocale} />
      </section>

      <JsonLd
        data={[
          createCollectionPageSchema({
            name: title,
            description: config.intro,
            url: `${siteUrl}/${safeLocale}/top/${category}`,
            inLanguage: safeLocale
          }),
          createFAQSchema(faqs),
          createBreadcrumbSchema(breadcrumbs),
          createSimpleItemListSchema({
            name: title,
            description: config.intro,
            items: businesses.slice(0, 20).map((business, index) => ({
              position: index + 1,
              name: getBusinessPublicName(business),
              url: `${siteUrl}/${safeLocale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`,
              description: business.shortDescription || business.description
            }))
          })
        ]}
      />
    </main>
  );
}
