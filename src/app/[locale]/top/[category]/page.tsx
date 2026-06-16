import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BusinessListCTA } from "@/components/BusinessListCTA";
import { JsonLd } from "@/components/JsonLd";
import { TopRankingExplorer } from "@/components/TopRankingExplorer";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { getCategorySlugFromBusiness, isCategorySlug, siteUrl, type CategorySlug } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessesForFacetScan, getTopBusinessesByCategory } from "@/lib/repository";
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
  if (!isCategorySlug(category)) return {};
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
  if (!isCategorySlug(category)) notFound();

  const [businesses, allCategoryBusinesses] = await Promise.all([
    getTopBusinessesByCategory(category, TOP_CATEGORY_LIMIT),
    getBusinessesForFacetScan(category)
  ]);
  if (!businesses.length) notFound();

  const copy = t(safeLocale);
  const config = getCategoryCopy(category, safeLocale);
  const title = getTitle(category, safeLocale);
  const facets = getPopularFacetsForBusinesses(category, allCategoryBusinesses, category === "beach-clubs" || category === "boats" ? 3 : 5).slice(0, 12);
  const breadcrumbs = [
    { name: copy.category.breadcrumbHome, url: `${siteUrl}/${safeLocale}` },
    { name: "Rankings", url: `${siteUrl}/${safeLocale}/rankings` },
    { name: config.label, url: `${siteUrl}/${safeLocale}/top/${category}` }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_48%,#FFF8EC_100%)]">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: copy.category.breadcrumbHome, href: `/${safeLocale}` }, { label: "Rankings", href: `/${safeLocale}/rankings` }, { label: config.label, href: `/${safeLocale}/top/${category}` }]} />
          <div className="mt-7 max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">{copy.category.rankingByCategory}</p>
            <h1 className="mt-3 font-sans text-5xl font-black leading-none text-ink sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-olive">{copy.category.signalLine}</p>
          </div>

          <div className="mt-8">
            <BusinessListCTA locale={safeLocale} />
          </div>
        </div>
      </section>

      <TopRankingExplorer businesses={businesses} locale={safeLocale} category={category} facets={facets} />

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
