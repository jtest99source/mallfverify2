import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GuideCard } from "@/components/GuideCard";
import { JsonLd } from "@/components/JsonLd";
import { TopRankingExplorer } from "@/components/TopRankingExplorer";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { getCategoryGuideKeywords, getCategorySlugFromBusiness, isCategorySlug, isPublicCategorySlug, siteUrl, type CategorySlug } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessesForFacetScan, getRelatedGuides, getTopBusinessesByCategory } from "@/lib/repository";
import { createBreadcrumbSchema, createSimpleItemListSchema } from "@/lib/schema";
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
  const breadcrumbs = [
    { name: copy.category.breadcrumbHome, url: `${siteUrl}/${safeLocale}` },
    { name: "Rankings", url: `${siteUrl}/${safeLocale}/top/restaurants` },
    { name: config.label, url: `${siteUrl}/${safeLocale}/top/${category}` }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_48%,#FFFFFF_100%)]">
      <section className="px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: copy.category.breadcrumbHome, href: `/${safeLocale}` }, { label: "Rankings", href: `/${safeLocale}/top/restaurants` }, { label: config.label, href: `/${safeLocale}/top/${category}` }]} />
          <div className="mt-5 max-w-3xl sm:mt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.category.rankingByCategory}</p>
            <h1 className="mt-3 font-sans text-3xl font-black leading-[1.05] text-ink sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-olive sm:line-clamp-2">{copy.category.signalLine}</p>
          </div>
        </div>
      </section>

      <TopRankingExplorer businesses={businesses} locale={safeLocale} category={category} facets={facets} />

      {relatedGuides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="border-t border-[#E5E7EB] pt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.category.relatedGuidesEyebrow}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-black text-ink sm:text-3xl">{copy.category.relatedGuidesTitle(config.label)}</h2>
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
