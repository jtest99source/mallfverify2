import Link from "next/link";
import { IconChartBar } from "@tabler/icons-react";
import { GuideCard } from "@/components/GuideCard";
import { JsonLd } from "@/components/JsonLd";
import { TopRankingExplorer } from "@/components/TopRankingExplorer";
import { BusinessListCTA } from "@/components/BusinessListCTA";
import { categoryConfigs, getCategorySlugFromBusiness, isCategorySlug, siteUrl, type CategorySlug } from "@/lib/data";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { getBusinessesForFacetScan, getGuides, getTopBusinessesByCategory } from "@/lib/repository";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getEditorialImageForGuide } from "@/lib/unsplash";
import { getPopularFacetsForBusinesses } from "@/lib/taxonomy";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { createSimpleItemListSchema } from "@/lib/schema";

const RANKING_LIMIT = 1000;

function categoryHref(locale: Locale, category: CategorySlug) {
  return `/${locale}/rankings?category=${category}`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const copy = t(safeLocale);
  return generateSeoMetadata({
    title: copy.rankings.metaTitle,
    description: copy.rankings.metaDescription,
    path: `/${safeLocale}/rankings`,
    locale: safeLocale
  });
}

export default async function RankingsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const query = (await searchParams) ?? {};
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const copy = t(safeLocale);
  const selectedCategory = isCategorySlug(query.category ?? "") ? (query.category as CategorySlug) : "restaurants";

  const [businesses, facetScanBusinesses, guides] = await Promise.all([
    getTopBusinessesByCategory(selectedCategory, RANKING_LIMIT),
    getBusinessesForFacetScan(selectedCategory),
    getGuides(safeLocale, 4)
  ]);
  const facets = getPopularFacetsForBusinesses(selectedCategory, facetScanBusinesses, selectedCategory === "restaurants" ? 5 : 3).slice(0, 14);
  const guideImages = await Promise.all(guides.map((guide) => (guide.heroImageUrl ? Promise.resolve(null) : getEditorialImageForGuide(guide.title))));
  const activeConfig = getCategoryCopy(selectedCategory, safeLocale);
  const rankingSchema = createSimpleItemListSchema({
    name: activeConfig.title,
    description: activeConfig.intro,
    items: businesses.slice(0, 10).map((business, index) => ({
      position: index + 1,
      name: getBusinessPublicName(business),
      url: `${siteUrl}/${safeLocale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`,
      description: business.editorialDescription || business.aiDescription || business.shortDescription || business.description
    }))
  });

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_46%,#FFF8EC_100%)]">
      <section className="px-4 pt-4 pb-3 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#BFE8D2] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#047857] sm:text-[11px]">
                <IconChartBar size={15} stroke={2} />
                {copy.rankings.eyebrow}
              </div>
              <h1 className="font-display max-w-4xl text-balance text-3xl font-black leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
                {copy.rankings.title}
              </h1>
              <p className="mt-4 hidden max-w-3xl text-sm leading-6 text-olive sm:mt-5 sm:block sm:leading-7">
                {copy.rankings.intro}
              </p>
            </div>
            <aside className="hidden overflow-hidden rounded-xl bg-[linear-gradient(135deg,#10253D_0%,#0E5F66_100%)] p-5 text-white shadow-[0_18px_45px_rgba(27,46,75,0.14)] lg:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#FFD166]">{copy.rankings.businessBoxEyebrow}</p>
              <h2 className="font-display mt-2 text-2xl font-black leading-tight text-white">{copy.rankings.businessBoxTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">{copy.rankings.businessBoxIntro}</p>
              <p className="mt-3 rounded-md border border-white/15 bg-white/8 px-3 py-2 text-[11px] text-white/55">
                {copy.rankings.businessBoxNote}
              </p>
              <Link href={`/${safeLocale}/business`} className="mt-5 inline-flex min-h-10 items-center rounded-md bg-[#C4933F] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#FFD166] hover:text-ink">
                {copy.rankings.businessBoxCta} →
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8">
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {(Object.keys(categoryConfigs) as CategorySlug[]).map((slug) => (
            <Link
              key={slug}
              href={categoryHref(safeLocale, slug)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-150 ${
                slug === selectedCategory
                  ? "border-ink bg-ink text-white"
                  : "border-[#E7DED0] bg-white text-ink hover:border-ink hover:bg-ink hover:text-white"
              }`}
            >
              {getCategoryCopy(slug, safeLocale).label}
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pb-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 max-w-4xl sm:mb-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">{copy.rankings.activeRanking}</p>
            <h2 className="font-display mt-2 text-2xl font-black text-ink sm:text-4xl">{activeConfig.title}</h2>
            <p className="mt-2 hidden text-sm leading-6 text-sage sm:mt-3 sm:block sm:leading-7">{activeConfig.intro}</p>
          </div>
        </div>
      </section>

      <TopRankingExplorer businesses={businesses} locale={safeLocale} category={selectedCategory} facets={facets} />

      <section className="mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 lg:px-8">
        <BusinessListCTA locale={safeLocale} />
      </section>

      {guides.length > 0 && safeLocale === "es" && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-4 pb-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">{copy.rankings.guidesEyebrow}</p>
              <h2 className="mt-2 text-3xl font-black text-ink">{copy.rankings.guidesTitle}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-sage">{copy.rankings.guidesIntro}</p>
            </div>
            <Link href={`/${safeLocale}/guides`} className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink hover:text-[#0E8F72]">
              {copy.rankings.viewGuides} →
            </Link>
          </div>
          <div className="grid items-stretch gap-px overflow-hidden rounded-lg border border-[#E7DED0] bg-[#E7DED0] shadow-[0_18px_45px_rgba(27,46,75,0.04)] md:grid-cols-2">
            {guides.map((guide, index) => (
              <GuideCard key={guide.id} guide={guide} locale={safeLocale} editorialImage={guideImages[index]} />
            ))}
          </div>
        </section>
      )}
      <JsonLd data={rankingSchema} />
    </main>
  );
}
