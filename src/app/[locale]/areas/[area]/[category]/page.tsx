import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GuideCard } from "@/components/GuideCard";
import { JsonLd } from "@/components/JsonLd";
import { LoadMoreBusinessGrid } from "@/components/LoadMoreBusinessGrid";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { getCategoryGuideKeywords, isCategorySlug, isPublicCategorySlug, siteUrl, type CategorySlug } from "@/lib/data";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessesByAreaAndCategory, getRelatedGuides } from "@/lib/repository";
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
  if (!isCategorySlug(category) || !isPublicCategorySlug(category)) return {};
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
  if (!isCategorySlug(category) || !isPublicCategorySlug(category)) notFound();

  const keywords = getCategoryGuideKeywords(category);
  const [{ areaName, businesses }, relatedGuides] = await Promise.all([
    getBusinessesByAreaAndCategory(area, category),
    getRelatedGuides(area, keywords, safeLocale, 3)
  ]);
  if (!businesses.length) notFound();

  const copy = t(safeLocale);
  const config = getCategoryCopy(category, safeLocale);
  const title = titleFor(areaName, category, safeLocale);
  const breadcrumbs = [
    { name: copy.category.breadcrumbHome, url: `${siteUrl}/${safeLocale}` },
    { name: config.label, url: `${siteUrl}/${safeLocale}/top/${category}` },
    { name: areaName, url: `${siteUrl}/${safeLocale}/areas/${area}/${category}` }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_48%,#FFFFFF_100%)]">
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: copy.category.breadcrumbHome, href: `/${safeLocale}` }, { label: config.label, href: `/${safeLocale}/top/${category}` }, { label: areaName, href: `/${safeLocale}/areas/${area}/${category}` }]} />
          <div className="mt-7 max-w-4xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.category.areaEyebrow}</p>
            <h1 className="mt-3 font-sans text-5xl font-black leading-none text-ink sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-olive">{copy.category.signalLine}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#E5E7EB] bg-white/80 p-4 shadow-[0_18px_45px_rgba(10,10,10,0.035)]">
          <p className="text-sm font-semibold text-olive">{businesses.length.toLocaleString(numberLocale(safeLocale))} {copy.filters.results}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${safeLocale}/top/${category}`} className="rounded-sm border border-white/[0.12] bg-[#0C1A2E] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/70 hover:border-white/30 hover:text-white">{copy.category.fullRanking}</Link>
            <a href="mailto:hola@mallorcaverified.com?subject=Business profile on Mallorca Verified" className="rounded-sm bg-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0C1A2E]">{copy.nav.forBusinesses} →</a>
          </div>
        </div>
        <LoadMoreBusinessGrid businesses={businesses} locale={safeLocale} />
      </section>

      {relatedGuides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
          <div className="border-t border-[#E5E7EB] pt-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.category.relatedGuidesEyebrow}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h2 className="text-2xl font-black text-ink sm:text-3xl">{copy.category.relatedGuidesAreaTitle(areaName)}</h2>
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

      <JsonLd data={[createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}
