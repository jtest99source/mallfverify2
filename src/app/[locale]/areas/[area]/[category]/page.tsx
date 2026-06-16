import Link from "next/link";
import { notFound } from "next/navigation";
import { BusinessCard } from "@/components/BusinessCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { categoryConfigs, isCategorySlug, siteUrl } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessesByAreaAndCategory } from "@/lib/repository";
import { createBreadcrumbSchema } from "@/lib/schema";
import { generateSeoMetadata } from "@/lib/seo";

function titleFor(areaName: string, category: string) {
  const label = categoryConfigs[category as keyof typeof categoryConfigs].label;
  return `${label} en ${areaName}`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; area: string; category: string }> }) {
  const { locale, area, category } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  if (!isCategorySlug(category)) return {};
  const { areaName, businesses } = await getBusinessesByAreaAndCategory(area, category);
  if (!businesses.length) return {};
  const title = titleFor(areaName, category);
  return generateSeoMetadata({
    title: `${title} | Mallorca Verified`,
    description: `${title}: fichas comparables con rating, reseñas y datos verificables.`,
    path: `/${safeLocale}/areas/${area}/${category}`,
    locale: safeLocale
  });
}

export default async function AreaCategoryPage({ params }: { params: Promise<{ locale: string; area: string; category: string }> }) {
  const { locale, area, category } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  if (!isCategorySlug(category)) notFound();

  const { areaName, businesses } = await getBusinessesByAreaAndCategory(area, category);
  if (!businesses.length) notFound();

  const config = categoryConfigs[category];
  const title = titleFor(areaName, category);
  const breadcrumbs = [
    { name: "Inicio", url: `${siteUrl}/${safeLocale}` },
    { name: areaName, url: `${siteUrl}/${safeLocale}/areas/${area}/${category}` },
    { name: config.label, url: `${siteUrl}/${safeLocale}/areas/${area}/${category}` }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_48%,#FFF8EC_100%)]">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: "Inicio", href: `/${safeLocale}` }, { label: "Rankings", href: `/${safeLocale}/rankings` }, { label: areaName, href: `/${safeLocale}/areas/${area}/${category}` }]} />
          <div className="mt-7 max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">Ranking por zona</p>
            <h1 className="mt-3 font-sans text-5xl font-black leading-none text-ink sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-olive">
              Compara fichas publicadas en {areaName} usando señales verificables: rating, reseñas, categoría y autoridad relativa.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#E7DED0] bg-white/80 p-4 shadow-[0_18px_45px_rgba(27,46,75,0.035)]">
          <p className="text-sm font-semibold text-olive">{businesses.length} fichas en esta zona</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${safeLocale}/top/${category}`} className="rounded-sm border border-[#E7DED0] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink hover:border-[#0E8F72] hover:text-[#0E8F72]">Ver ranking general</Link>
            <Link href={`/${safeLocale}/business`} className="rounded-sm bg-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">Solicitar propuesta</Link>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {businesses.map((business) => <BusinessCard key={business.id} business={business} locale={safeLocale} />)}
        </div>
      </section>

      <JsonLd data={[createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}
