import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { LoadMoreBusinessGrid } from "@/components/LoadMoreBusinessGrid";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { isCategorySlug, siteUrl, type CategorySlug } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessesByAreaAndCategory } from "@/lib/repository";
import { createBreadcrumbSchema } from "@/lib/schema";
import { generateSeoMetadata } from "@/lib/seo";

function titleFor(areaName: string, category: CategorySlug, locale: Locale) {
  const label = getCategoryCopy(category, locale).label;
  return locale === "es" ? `${label} en ${areaName}` : `${label} in ${areaName}`;
}

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; area: string; category: string }> }) {
  const { locale, area, category } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  if (!isCategorySlug(category)) return {};
  const { areaName, businesses } = await getBusinessesByAreaAndCategory(area, category);
  if (!businesses.length) return {};
  const title = titleFor(areaName, category, safeLocale);
  return generateSeoMetadata({
    title: `${title} | Mallorca Verified`,
    description: `${title}: ${getCategoryCopy(category, safeLocale).metaDescription}`,
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

  const copy = t(safeLocale);
  const config = getCategoryCopy(category, safeLocale);
  const title = titleFor(areaName, category, safeLocale);
  const breadcrumbs = [
    { name: copy.category.breadcrumbHome, url: `${siteUrl}/${safeLocale}` },
    { name: areaName, url: `${siteUrl}/${safeLocale}/areas/${area}/${category}` },
    { name: config.label, url: `${siteUrl}/${safeLocale}/areas/${area}/${category}` }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_48%,#FFF8EC_100%)]">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: copy.category.breadcrumbHome, href: `/${safeLocale}` }, { label: "Rankings", href: `/${safeLocale}/rankings` }, { label: areaName, href: `/${safeLocale}/areas/${area}/${category}` }]} />
          <div className="mt-7 max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">{copy.category.areaEyebrow}</p>
            <h1 className="mt-3 font-sans text-5xl font-black leading-none text-ink sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-olive">{copy.category.signalLine}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#E7DED0] bg-white/80 p-4 shadow-[0_18px_45px_rgba(27,46,75,0.035)]">
          <p className="text-sm font-semibold text-olive">{businesses.length.toLocaleString(numberLocale(safeLocale))} {copy.filters.results}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${safeLocale}/top/${category}`} className="rounded-sm border border-[#E7DED0] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-ink hover:border-[#0E8F72] hover:text-[#0E8F72]">{copy.category.fullRanking}</Link>
            <a href="mailto:hola@mallorcaverified.com?subject=Business profile on Mallorca Verified" className="rounded-sm bg-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">{copy.nav.forBusinesses} →</a>
          </div>
        </div>
        <LoadMoreBusinessGrid businesses={businesses} locale={safeLocale} />
      </section>

      <JsonLd data={[createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}
