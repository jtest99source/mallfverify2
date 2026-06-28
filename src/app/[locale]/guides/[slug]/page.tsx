import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { categoryConfigs, getCategorySlugFromBusiness, siteUrl } from "@/lib/data";
import { getBusinessById, getGuideBySlug, getGuides } from "@/lib/repository";
import { isLocale, type Locale } from "@/lib/i18n";
import { createArticleSchema, createBreadcrumbSchema, createFAQSchema, createSimpleItemListSchema } from "@/lib/schema";
import { generateSeoMetadata } from "@/lib/seo";
import { t } from "@/lib/i18n-copy";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import type { Business } from "@/types/business";
import type { Guide } from "@/types/guide";

function sectionBusinessIds(guide: Guide) {
  return Array.from(new Set(guide.sections.flatMap((section) => section.business_ids ?? [])));
}

async function guideBusinesses(guide: Guide) {
  const entries = await Promise.all(sectionBusinessIds(guide).map(async (id) => [id, await getBusinessById(id)] as const));
  return new Map(entries.filter((entry): entry is readonly [string, Business] => Boolean(entry[1])));
}

function businessImage(business?: Business) {
  return business?.primaryImageUrl || business?.galleryImageUrls?.[0] || business?.imageCandidateUrls?.[0]?.url || business?.image;
}

async function firstGuideBusinessImage(guide: Guide) {
  const businesses = await guideBusinesses(guide);
  for (const id of sectionBusinessIds(guide)) {
    const image = businessImage(businesses.get(id));
    if (image) return image;
  }
  return undefined;
}

function renderBody(text: string) {
  return text.split(/\n\n+/).map((para, i) => {
    const parts = para.split(/\*\*(.+?)\*\*/g);
    return (
      <p key={i} className="mt-4 text-[15px] leading-7 text-white/68 sm:text-base sm:leading-8">
        {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-bold text-[#00C37A]">{part}</strong> : part)}
      </p>
    );
  });
}

function formatDate(dateStr: string, locale: Locale): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    const nloc = locale === "de" ? "de-DE" : locale === "en" ? "en-GB" : "es-ES";
    return date.toLocaleDateString(nloc, { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function businessHref(locale: Locale, business: Business) {
  return `/${locale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`;
}

function HotelCard({ business, locale }: { business: Business; locale: Locale }) {
  const image = businessImage(business);
  const href = businessHref(locale, business);
  const gCopy = t(locale).guides;
  const nloc = locale === "de" ? "de-DE" : locale === "en" ? "en-GB" : "es-ES";

  return (
    <Link href={href} className="group grid grid-rows-[130px_1fr] rounded-sm border border-white/[0.10] bg-[#0C1A2E] transition hover:-translate-y-0.5 hover:border-[#00C37A]/40">
      <div
        className="rounded-t-sm bg-[#040D1A] bg-cover bg-center"
        style={image ? { backgroundImage: `url(${image})` } : undefined}
      />
      <div className="p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#00C37A]">
          {categoryConfigs[getCategorySlugFromBusiness(business.category)]?.singular}
        </p>
        <h3 className="mt-2 line-clamp-2 text-[15px] font-black leading-tight text-white">{getBusinessPublicName(business)}</h3>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/45">{business.city || business.area || "Mallorca"}</p>
        <div className="mt-2 text-[11px] text-white/55">
          {typeof business.rating === "number" && (
            <span className="font-bold text-[#FFCC00]">★ {business.rating.toLocaleString(nloc, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>
          )}
          {typeof business.reviewsCount === "number" && (
            <span> · {business.reviewsCount.toLocaleString(nloc)} {gCopy.reviews}</span>
          )}
        </div>
        <span className="mt-4 inline-flex text-[10px] font-black uppercase tracking-[0.1em] text-[#00C37A]">{gCopy.viewProfile} →</span>
      </div>
    </Link>
  );
}

function guideTopic(slug: string): string {
  if (/hotel|alojarse|boutique|adults.only/.test(slug)) return "accommodation";
  if (/restaurante|comer|cenar/.test(slug)) return "restaurants";
  if (/playa|cala/.test(slug)) return "beaches";
  if (/beach.club|sunset|bar|wine/.test(slug)) return "nightlife";
  if (/barco|velero|charter/.test(slug)) return "boats";
  if (/spa|senderismo|tramuntana/.test(slug)) return "wellness";
  return "planning";
}

async function getRelatedGuides(currentSlug: string, locale: Locale): Promise<Guide[]> {
  const all = await getGuides(locale);
  const others = all.filter((g) => g.slug !== currentSlug);
  const topic = guideTopic(currentSlug);
  const sameTopic = others.filter((g) => guideTopic(g.slug) === topic);
  const different = others.filter((g) => guideTopic(g.slug) !== topic);
  return [...sameTopic, ...different].slice(0, 3);
}

function RelatedGuides({ guides, locale, label }: { guides: Guide[]; locale: Locale; label: string }) {
  if (!guides.length) return null;
  return (
    <aside className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="border-t border-white/[0.08] pt-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00C37A]">{label}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/${locale}/guides/${guide.slug}`}
              className="group flex flex-col rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-4 transition hover:-translate-y-0.5 hover:border-[#00C37A]/40"
            >
              {guide.heroImageUrl && (
                <div
                  className="mb-4 h-28 rounded-sm bg-[#040D1A] bg-cover bg-center"
                  style={{ backgroundImage: `url(${guide.heroImageUrl})` }}
                />
              )}
              <p className="line-clamp-2 text-[14px] font-black leading-snug text-white">{guide.title}</p>
              <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-white/55">{guide.excerpt}</p>
              <span className="mt-auto pt-4 text-[10px] font-black uppercase tracking-[0.1em] text-[#00C37A]">
                {locale === "de" ? "Guide lesen →" : locale === "en" ? "Read guide →" : "Leer guía →"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const guide = await getGuideBySlug(slug, safeLocale);
  if (!guide) return {};
  const image = guide.heroImageUrl || (await firstGuideBusinessImage(guide));
  return generateSeoMetadata({
    title: guide.seo.title,
    description: guide.excerpt,
    path: `/${safeLocale}/guides/${slug}`,
    locale: safeLocale,
    type: "article",
    image,
    alternateLocales: ["es", "en"]
  });
}

export default async function GuideDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const guide = await getGuideBySlug(slug, safeLocale);
  if (!guide) notFound();

  const [businesses, relatedGuides] = await Promise.all([
    guideBusinesses(guide),
    getRelatedGuides(guide.slug, safeLocale)
  ]);
  const guideImage = guide.heroImageUrl || (await firstGuideBusinessImage(guide));
  const copy = t(safeLocale);
  const breadcrumbs = [
    { name: copy.category.breadcrumbHome, url: `${siteUrl}/${safeLocale}` },
    { name: copy.nav.guides, url: `${siteUrl}/${safeLocale}/guides` },
    { name: guide.title, url: `${siteUrl}/${safeLocale}/guides/${guide.slug}` }
  ];
  const recommendedBusinesses = sectionBusinessIds(guide)
    .map((id) => businesses.get(id))
    .filter((business): business is Business => Boolean(business));
  const itemList = {
    name: guide.title,
    description: guide.excerpt,
    items: recommendedBusinesses.map((business, index) => ({
      position: index + 1,
      name: getBusinessPublicName(business),
      description: business.editorialOpinion || business.shortDescription || business.description,
      url: `${siteUrl}${businessHref(safeLocale, business)}`,
      schemaDescription: business.editorialOpinion || business.shortDescription || business.description
    }))
  };
  const jsonLd = [
    createArticleSchema({ headline: guide.title, description: guide.excerpt, datePublished: guide.updatedAt, dateModified: guide.updatedAt, image: guideImage, author: true, inLanguage: safeLocale }),
    ...(recommendedBusinesses.length ? [createSimpleItemListSchema(itemList)] : []),
    createFAQSchema(guide.faqs),
    createBreadcrumbSchema(breadcrumbs)
  ];

  return (
    <main className="bg-[#07101F] text-white">
      <article className="mx-auto max-w-4xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <Breadcrumbs items={[{ label: copy.category.breadcrumbHome, href: `/${safeLocale}` }, { label: copy.nav.guides, href: `/${safeLocale}/guides` }, { label: guide.title, href: `/${safeLocale}/guides/${guide.slug}` }]} />
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">{copy.guides.updatedLabel} {formatDate(guide.updatedAt, safeLocale)}</p>
        <h1 className="mt-3 font-display text-3xl font-black leading-tight text-white sm:text-5xl">{guide.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/60 sm:text-lg sm:leading-8">{guide.intro}</p>

        <blockquote className="mt-6 border-l-2 border-[#00C37A] py-1 pl-5 text-[15px] leading-7 text-white/60 sm:mt-8 sm:text-base sm:leading-8">
          {guide.excerpt}
        </blockquote>

        <div className="mt-12 space-y-12">
          {guide.sections.map((section) => {
            const sectionHotels = (section.business_ids ?? [])
              .map((id) => businesses.get(id))
              .filter((business): business is Business => Boolean(business));

            return (
              <section key={section.heading} className="border-b border-white/[0.08] pb-10 last:border-b-0">
                <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">{section.heading}</h2>
                {renderBody(section.body)}
                {section.best_for?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {section.best_for.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/[0.10] bg-white/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white/55">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {sectionHotels.length > 0 && (
                  <div className="mt-7">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#00C37A]">
                      {categoryConfigs[getCategorySlugFromBusiness(sectionHotels[0].category)]?.label ?? copy.guides.recommended}
                    </p>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {sectionHotels.slice(0, 3).map((business) => (
                        <HotelCard key={business.id} business={business} locale={safeLocale} />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
        <FAQ faqs={guide.faqs} />
      </article>

      <RelatedGuides
        guides={relatedGuides}
        locale={safeLocale}
        label={safeLocale === "de" ? "Weitere Guides" : safeLocale === "en" ? "Related guides" : "Más guías"}
      />

      <JsonLd data={jsonLd} />
    </main>
  );
}
