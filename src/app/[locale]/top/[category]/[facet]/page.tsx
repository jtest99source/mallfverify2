import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessCard } from "@/components/BusinessCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { categoryConfigs, isCategorySlug, siteUrl } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinesses, getTopBusinessesByFacet } from "@/lib/repository";
import { createBreadcrumbSchema, createItemListSchema } from "@/lib/schema";
import { generateSeoMetadata } from "@/lib/seo";
import { methodologyPath } from "@/lib/methodology";
import { facetPath, getFacet, getPopularFacetsForBusinesses } from "@/lib/taxonomy";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; category: string; facet: string }> }) {
  const { locale, category, facet } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  if (!isCategorySlug(category)) return {};
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
  if (!isCategorySlug(category)) notFound();

  const rankingFacet = getFacet(category, facet);
  if (!rankingFacet) notFound();

  const [businesses, allCategoryBusinesses] = await Promise.all([
    getTopBusinessesByFacet(category, facet, 40),
    getBusinesses(category)
  ]);
  if (!businesses.length) notFound();

  const config = categoryConfigs[category];
  const relatedFacets = getPopularFacetsForBusinesses(category, allCategoryBusinesses, 3).filter((item) => item.slug !== rankingFacet.slug).slice(0, 8);
  const breadcrumbs = [
    { name: "Inicio", url: `${siteUrl}/${safeLocale}` },
    { name: "Rankings", url: `${siteUrl}/${safeLocale}/rankings` },
    { name: config.label, url: `${siteUrl}/${safeLocale}/top/${category}` },
    { name: rankingFacet.label, url: `${siteUrl}/${safeLocale}/top/${category}/${rankingFacet.slug}` }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_48%,#FFF8EC_100%)]">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: `/${safeLocale}` },
              { label: "Rankings", href: `/${safeLocale}/rankings` },
              { label: config.label, href: `/${safeLocale}/top/${category}` },
              { label: rankingFacet.label, href: `/${safeLocale}/top/${category}/${rankingFacet.slug}` }
            ]}
          />
          <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
            <div className="max-w-4xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">Ranking específico</p>
              <h1 className="mt-3 font-sans text-5xl font-black leading-none text-ink sm:text-6xl">{rankingFacet.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-olive">{rankingFacet.intro}</p>
              <p className="mt-3 text-sm leading-7 text-sage">
                Hemos encontrado {businesses.length.toLocaleString("es-ES")} fichas que encajan con este filtro dentro de {config.label.toLowerCase()}.
              </p>
            </div>
            <div className="rounded-lg border border-[#F1D3A2] bg-white/80 p-5 shadow-[0_18px_45px_rgba(27,46,75,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B86B1D]">Metodología</p>
              <p className="mt-2 text-sm leading-7 text-olive">
                El filtro se deriva de tipos, etiquetas y atributos de cada ficha. El orden final depende de valoración, reseñas y autoridad relativa.
              </p>
              <Link href={methodologyPath(safeLocale)} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-sm bg-ink px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">
                Ver metodología
              </Link>
            </div>
          </div>
        </div>
      </section>

      {relatedFacets.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {relatedFacets.map((item) => (
              <Link key={item.slug} href={facetPath(safeLocale, category, item.slug)} className="rounded-full border border-[#E7DED0] bg-white px-3 py-2 text-[11px] font-bold uppercase tracking-[0.06em] text-ink hover:border-[#0E8F72] hover:text-[#0E8F72]">
                {item.label} · {item.count}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
        <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {businesses.map((business, index) => (
            <li key={business.id} className="relative">
              <div className="absolute left-3 top-3 z-10 rounded-sm bg-ink px-3 py-1 text-xs font-bold text-white">#{index + 1}</div>
              <BusinessCard business={business} locale={safeLocale} />
            </li>
          ))}
        </ol>
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
