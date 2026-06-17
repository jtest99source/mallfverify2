import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { categoryConfigs, getCategorySlugFromBusiness, siteUrl } from "@/lib/data";
import { getBusinessById, getGuideBySlug } from "@/lib/repository";
import { isLocale, type Locale } from "@/lib/i18n";
import { createArticleSchema, createBreadcrumbSchema, createFAQSchema, createSimpleItemListSchema } from "@/lib/schema";
import { generateSeoMetadata } from "@/lib/seo";
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
      <p key={i} className="mt-4 text-base leading-7 text-ink/75">
        {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
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

  return (
    <Link href={href} className="group grid grid-rows-[120px_1fr] rounded-md border border-borderline bg-white transition hover:-translate-y-0.5 hover:shadow-soft">
      <div
        className="rounded-t-md bg-sea bg-cover bg-center"
        style={image ? { backgroundImage: `linear-gradient(180deg, rgba(28,28,24,0.02), rgba(28,28,24,0.22)), url(${image})` } : { backgroundImage: "linear-gradient(135deg, #354030, #1C1C18)" }}
      />
      <div className="p-4">
        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-turquesa">{categoryConfigs[getCategorySlugFromBusiness(business.category)].singular}</p>
        <h3 className="mt-2 line-clamp-2 font-sans text-lg font-bold leading-tight text-ink">{getBusinessPublicName(business)}</h3>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-sage">{business.city || business.area || "Mallorca"}</p>
        <div className="mt-3 text-[11px] text-sage">
          {typeof business.rating === "number" && <span className="font-bold text-coral">★ {business.rating.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>}
          {typeof business.reviewsCount === "number" && <span> · {business.reviewsCount.toLocaleString("es-ES")} reseñas</span>}
        </div>
        <span className="mt-4 inline-flex text-[10px] font-bold uppercase tracking-[0.1em] text-coral">Ver ficha completa →</span>
      </div>
    </Link>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const guide = await getGuideBySlug(slug, safeLocale);
  if (!guide) return {};
  return generateSeoMetadata({
    title: guide.seo.title,
    description: guide.excerpt,
    path: `/${safeLocale}/guides/${slug}`,
    locale: safeLocale,
    type: "article",
    image: undefined,
    alternateLocales: ["es"],
    robots: safeLocale === "es" ? undefined : { index: false, follow: true }
  });
}

export default async function GuideDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const guide = await getGuideBySlug(slug, safeLocale);
  if (!guide) notFound();

  const businesses = await guideBusinesses(guide);
  const breadcrumbs = [
    { name: "Inicio", url: `${siteUrl}/${safeLocale}` },
    { name: "Guías", url: `${siteUrl}/${safeLocale}/guides` },
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
    createArticleSchema({ headline: guide.title, description: guide.excerpt, datePublished: guide.updatedAt, dateModified: guide.updatedAt, image: undefined, author: true, inLanguage: safeLocale }),
    ...(recommendedBusinesses.length ? [createSimpleItemListSchema(itemList)] : []),
    createFAQSchema(guide.faqs),
    createBreadcrumbSchema(breadcrumbs)
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_46%,#FFF8EC_100%)]">
      <article className="mx-auto max-w-4xl px-4 pb-10 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <Breadcrumbs items={[{ label: "Inicio", href: `/${safeLocale}` }, { label: "Guías", href: `/${safeLocale}/guides` }, { label: guide.title, href: `/${safeLocale}/guides/${guide.slug}` }]} />
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E8F72]">Actualizado {formatDate(guide.updatedAt, safeLocale)}</p>
        <h1 className="mt-3 font-sans text-3xl font-black text-[#10253D] sm:text-5xl">{guide.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-[#4B5B4D] sm:text-xl sm:leading-8">{guide.intro}</p>

        <div className="mt-6 rounded-md border border-[#E7DED0] border-l-4 border-l-[#B86B1D] bg-[#FFFDF7] px-5 py-4 text-base leading-7 text-[#4B5B4D] shadow-[0_14px_34px_rgba(27,46,75,0.04)] sm:mt-8 sm:px-6 sm:py-5 sm:text-lg sm:leading-8">
          {guide.excerpt}
        </div>

        <div className="mt-12 space-y-12">
          {guide.sections.map((section) => {
            const sectionHotels = (section.business_ids ?? [])
              .map((id) => businesses.get(id))
              .filter((business): business is Business => Boolean(business));

            return (
              <section key={section.heading} className="border-b border-borderline pb-10 last:border-b-0">
                <h2 className="font-sans text-2xl font-semibold leading-tight sm:text-3xl">{section.heading}</h2>
                {renderBody(section.body)}
                {section.best_for?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {section.best_for.map((tag) => (
                      <span key={tag} className="rounded-full border border-borderline bg-paper px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-olive">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {sectionHotels.length > 0 && (
                  <div className="mt-7">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-coral">
                      {categoryConfigs[getCategorySlugFromBusiness(sectionHotels[0].category)]?.label ?? "Recomendados"}
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

      <JsonLd data={jsonLd} />

    </main>
  );
}
