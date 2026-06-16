import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { TopRankingExplorer } from "@/components/TopRankingExplorer";
import { categoryConfigs, isCategorySlug, siteUrl, type CategorySlug } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessesForFacetScan, getTopBusinessesByCategory } from "@/lib/repository";
import { createBreadcrumbSchema, createItemListSchema } from "@/lib/schema";
import { generateSeoMetadata } from "@/lib/seo";
import { getPopularFacetsForBusinesses } from "@/lib/taxonomy";

const TOP_CATEGORY_LIMIT = 1000;

function getTitle(category: CategorySlug) {
  const label = categoryConfigs[category].label;
  return `${label} en Mallorca`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string }> }) {
  const { locale, category } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  if (!isCategorySlug(category)) return {};
  const title = getTitle(category);
  return generateSeoMetadata({
    title: `${title} | Mallorca Verified`,
    description: `${title} ordenados con datos comparables: valoraci\u00f3n, volumen de rese\u00f1as y autoridad relativa.`,
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

  const config = categoryConfigs[category];
  const title = getTitle(category);
  const facets = getPopularFacetsForBusinesses(category, allCategoryBusinesses, category === "beach-clubs" || category === "boats" ? 3 : 5).slice(0, 12);
  const breadcrumbs = [
    { name: "Inicio", url: `${siteUrl}/${safeLocale}` },
    { name: "Rankings", url: `${siteUrl}/${safeLocale}/rankings` },
    { name: config.label, url: `${siteUrl}/${safeLocale}/top/${category}` }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_48%,#FFF8EC_100%)]">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: "Inicio", href: `/${safeLocale}` }, { label: "Rankings", href: `/${safeLocale}/rankings` }, { label: config.label, href: `/${safeLocale}/top/${category}` }]} />
          <div className="mt-7 max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">Ranking objetivo</p>
            <h1 className="mt-3 font-sans text-5xl font-black leading-none text-ink sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-olive">
              {"Lista basada en se\u00f1ales comparables de Google: valoraci\u00f3n, volumen de rese\u00f1as y autoridad relativa dentro de la misma categor\u00eda."}
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-[#F1D3A2] bg-white/70 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B86B1D]">Para negocios</p>
              <p className="mt-1 text-sm leading-6 text-olive">
                {"Puedes solicitar una propuesta para enriquecer tu ficha con informaci\u00f3n \u00fatil sin alterar posiciones del ranking."}
              </p>
            </div>
            <Link href={`/${safeLocale}/business`} className="mt-4 inline-flex min-h-10 shrink-0 items-center justify-center rounded-sm bg-ink px-4 text-[10px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72] sm:mt-0">
              Solicitar propuesta
            </Link>
          </div>
        </div>
      </section>

      <TopRankingExplorer businesses={businesses} locale={safeLocale} category={category} facets={facets} />

      <JsonLd data={[createBreadcrumbSchema(breadcrumbs), createItemListSchema({
        title,
        slug: `top/${category}`,
        items: businesses.map((business, index) => ({ position: index + 1, name: business.displayName || business.name, description: business.shortDescription || business.description, bestFor: business.idealFor || business.tags }))
      } as any)]} />
    </main>
  );
}
