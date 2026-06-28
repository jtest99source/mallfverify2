import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideCard } from "@/components/GuideCard";
import { JsonLd } from "@/components/JsonLd";
import { TopRankingExplorer } from "@/components/TopRankingExplorer";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { getCategoryGuideKeywords, getCategorySlugFromBusiness, isCategorySlug, isPublicCategorySlug, publicCategorySlugs, siteUrl, type CategorySlug } from "@/lib/data";
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
    <main className="bg-[#07101F] text-white">
      <section className="bg-[#07101F] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
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
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/42">{copy.category.signalLine}</p>
          </div>
        </div>
      </section>

      <div className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#07101F]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2 px-4 py-3 sm:px-6 lg:px-8">
            {publicCategorySlugs.map((cat) => (
              <Link
                key={cat}
                href={`/${safeLocale}/top/${cat}`}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
                  cat === category
                    ? "bg-[#00C37A] text-[#0A0A0A]"
                    : "border border-white/[0.12] text-white/50 hover:border-white/30 hover:text-white"
                }`}
              >
                {getCategoryCopy(cat, safeLocale).label}
              </Link>
            ))}
          </div>
        </div>
      </div>

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
