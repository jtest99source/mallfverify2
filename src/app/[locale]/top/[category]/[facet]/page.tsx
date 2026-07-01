import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LoadMoreBusinessGrid } from "@/components/LoadMoreBusinessGrid";
import { isCategorySlug, isPublicCategorySlug, siteUrl } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { getBusinesses, getTopBusinessesByFacet } from "@/lib/repository";
import { createBreadcrumbSchema, createItemListSchema } from "@/lib/schema";
import { generateSeoMetadata } from "@/lib/seo";
import { methodologyPath } from "@/lib/methodology";
import { facetPath, getFacet, getPopularFacetsForBusinesses, type RankingFacet } from "@/lib/taxonomy";

type FacetWithCount = RankingFacet & { count: number };

const pageCopy = {
  es: {
    specificRanking: "Ranking específico",
    found: (count: string, category: string) => `Hemos encontrado ${count} fichas que encajan con este filtro dentro de ${category}.`,
    methodologyTitle: "Metodología",
    methodologyText: "El filtro se deriva de tipos, etiquetas y atributos de cada ficha. El orden final depende de valoración, reseñas y autoridad relativa.",
    methodologyCta: "Ver metodología"
  },
  en: {
    specificRanking: "Specific ranking",
    found: (count: string, category: string) => `We found ${count} profiles matching this filter within ${category}.`,
    methodologyTitle: "Methodology",
    methodologyText: "The filter is derived from profile types, tags and attributes. Final order depends on rating, reviews and relative authority.",
    methodologyCta: "View methodology"
  },
  de: {
    specificRanking: "Spezifische Rangliste",
    found: (count: string, category: string) => `Wir haben ${count} Profile gefunden, die zu diesem Filter innerhalb von ${category} passen.`,
    methodologyTitle: "Methodik",
    methodologyText: "Der Filter basiert auf Typen, Tags und Attributen der Profile. Die finale Reihenfolge hängt von Bewertung, Rezensionen und relativer Autorität ab.",
    methodologyCta: "Methodik ansehen"
  }
} as const;

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; facet: string }> }) {
  const { locale, category, facet } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  if (!isCategorySlug(category) || !isPublicCategorySlug(category)) return {};
  const rankingFacet = getFacet(category, facet);
  if (!rankingFacet) return {};

  return generateSeoMetadata({
    title: `${rankingFacet.title} | Mallorca Verified`,
    description: rankingFacet.intro,
    path: `/${safeLocale}/top/${category}/${facet}`,
    locale: safeLocale
  });
}

export default async function TopFacetPage({ params }: { params: Promise<{ locale: string; category: string; facet: string }> }) {
  const { locale, category, facet } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  if (!isCategorySlug(category) || !isPublicCategorySlug(category)) notFound();

  const rankingFacet = getFacet(category, facet);
  if (!rankingFacet) notFound();

  const [businesses, allCategoryBusinesses] = await Promise.all([
    getTopBusinessesByFacet(category, facet, 40),
    getBusinesses(category)
  ]);
  if (!businesses.length) notFound();

  const config = getCategoryCopy(category, safeLocale);
  const copy = t(safeLocale);
  const localCopy = pageCopy[safeLocale];
  const relatedFacets: FacetWithCount[] = getPopularFacetsForBusinesses(category, allCategoryBusinesses, 3)
    .filter((item: FacetWithCount) => item.slug !== rankingFacet.slug)
    .slice(0, 8);
  const breadcrumbs = [
    { name: copy.category.breadcrumbHome, url: `${siteUrl}/${safeLocale}` },
    { name: "Rankings", url: `${siteUrl}/${safeLocale}/top/restaurants` },
    { name: config.label, url: `${siteUrl}/${safeLocale}/top/${category}` },
    { name: rankingFacet.label, url: `${siteUrl}/${safeLocale}/top/${category}/${rankingFacet.slug}` }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_48%,#FFFFFF_100%)]">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: copy.category.breadcrumbHome, href: `/${safeLocale}` },
              { label: "Rankings", href: `/${safeLocale}/top/restaurants` },
              { label: config.label, href: `/${safeLocale}/top/${category}` },
              { label: rankingFacet.label, href: `/${safeLocale}/top/${category}/${rankingFacet.slug}` }
            ]}
          />
          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div className="max-w-4xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]">{localCopy.specificRanking}</p>
              <h1 className="mt-3 font-sans text-5xl font-black leading-none text-ink sm:text-6xl">{rankingFacet.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-olive">{rankingFacet.intro}</p>
              <p className="mt-3 text-sm leading-7 text-sage">
                {localCopy.found(businesses.length.toLocaleString(numberLocale(safeLocale)), config.label.toLowerCase())}
              </p>
            </div>
            <div className="rounded-lg border border-[#E5E7EB] bg-white/80 p-5 shadow-[0_18px_45px_rgba(10,10,10,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0A0A0A]">{localCopy.methodologyTitle}</p>
              <p className="mt-2 text-sm leading-7 text-olive">{localCopy.methodologyText}</p>
              <Link href={methodologyPath(safeLocale)} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-sm bg-ink px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0C1A2E]">
                {localCopy.methodologyCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {relatedFacets.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {relatedFacets.map((item) => (
              <Link key={item.slug} href={facetPath(safeLocale, category, item.slug)} className="rounded-full border border-white/[0.12] bg-[#0C1A2E] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-white/70 hover:border-white/30 hover:text-white">
                {item.label} · {item.count.toLocaleString(numberLocale(safeLocale))}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <LoadMoreBusinessGrid businesses={businesses} locale={safeLocale} ordered />
      </section>

      <JsonLd
        data={[
          createBreadcrumbSchema(breadcrumbs),
          createItemListSchema({
            title: rankingFacet.title,
            slug: `top/${category}/${rankingFacet.slug}`,
            items: businesses.map((business, index) => ({
              position: index + 1,
              name: business.displayName || business.name,
              description: business.shortDescription || business.description,
              bestFor: business.idealFor || business.tags
            }))
          } as any)
        ]}
      />
    </main>
  );
}
