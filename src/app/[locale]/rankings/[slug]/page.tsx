import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FAQ } from "@/components/FAQ";
import { JsonLd } from "@/components/JsonLd";
import { categoryConfigs, getCategorySlugFromBusiness, siteUrl } from "@/lib/data";
import { getBusinessById, getRankingBySlug } from "@/lib/repository";
import { isLocale, type Locale } from "@/lib/i18n";
import { createArticleSchema, createBreadcrumbSchema, createFAQSchema, createItemListSchema } from "@/lib/schema";
import { generateSeoMetadata } from "@/lib/seo";
import { getEditorialImageForRanking } from "@/lib/unsplash";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import type { Business } from "@/types/business";
import type { Ranking } from "@/types/ranking";

function businessImage(business?: Business) {
  return business?.primaryImageUrl || business?.galleryImageUrls?.[0] || business?.imageCandidateUrls?.[0]?.url || business?.image;
}

async function firstRankingImage(ranking: Ranking) {
  for (const item of ranking.items) {
    if (!item.businessId) continue;
    const business = await getBusinessById(item.businessId);
    const image = businessImage(business);
    if (image) return image;
  }
  return undefined;
}

function businessHref(locale: Locale, business?: Business) {
  if (!business) return null;
  return `/${locale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`;
}

function hasInternalRankingData(text?: string) {
  if (!text) return false;
  return /scoring|authority_score|appears in|aparece en|tabler|\d+(?:[.,]\d+)?\/100/i.test(text);
}

function rankingDescription(ranking: Ranking) {
  const text = [ranking.intro, ranking.hook, ranking.seo.description].find((candidate) => candidate && !hasInternalRankingData(candidate));
  return text || "Una selección editorial de lugares recomendados en Mallorca, con negocios enlazados y criterios prácticos para elegir mejor.";
}

function truncate(text: string, length = 150) {
  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
}

function fallbackWhy(item: Ranking["items"][number], business?: Business) {
  const rankingTexts = [item.whyWePickedIt, item.description].filter((text): text is string => Boolean(text && !hasInternalRankingData(text)));
  const text = rankingTexts[0] || business?.editorialOpinion || business?.highlights?.[0];
  return text ? truncate(text) : "";
}

function cleanRankingFaqs(ranking: Ranking) {
  return ranking.faqs.map((faq) => ({
    question: faq.question,
    answer: hasInternalRankingData(faq.answer)
      ? "El orden combina señales públicas de reputación, calidad editorial y utilidad para el viajero. Revisamos el ranking para que sea práctico y fácil de comparar."
      : faq.answer
  }));
}

function RankingBusinessImage({ business, name }: { business?: Business; name: string }) {
  const image = businessImage(business);

  return (
    <div
      aria-label={name}
      className="h-20 w-[120px] shrink-0 rounded-md bg-sea bg-cover bg-center"
      style={image ? { backgroundImage: `url(${image})` } : { backgroundImage: "linear-gradient(135deg, #0A0A0A, #262626)" }}
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const ranking = await getRankingBySlug(slug, safeLocale);
  if (!ranking) return {};
  return generateSeoMetadata({
    title: ranking.seo.title,
    description: rankingDescription(ranking),
    path: `/${safeLocale}/rankings/${slug}`,
    locale: safeLocale,
    type: "article",
    image: ranking.heroImageUrl || (await firstRankingImage(ranking))
  });
}

export default async function RankingDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const ranking = await getRankingBySlug(slug, safeLocale);
  if (!ranking) notFound();
  const cleanFaqs = cleanRankingFaqs(ranking);

  const linkedBusinesses = await Promise.all(ranking.items.map((item) => (item.businessId ? getBusinessById(item.businessId) : Promise.resolve(undefined))));
  const rankingBusinessImage = await firstRankingImage(ranking);
  const rankingEditorialImage = !ranking.heroImageUrl && !rankingBusinessImage ? await getEditorialImageForRanking(ranking.title, ranking.category) : null;
  const rankingImage = ranking.heroImageUrl || rankingBusinessImage || rankingEditorialImage?.imageUrl;
  const breadcrumbs = [
    { name: "Inicio", url: `${siteUrl}/${safeLocale}` },
    { name: "Rankings", url: `${siteUrl}/${safeLocale}/rankings` },
    { name: ranking.title, url: `${siteUrl}/${safeLocale}/rankings/${ranking.slug}` }
  ];
  const itemListRanking = {
    ...ranking,
    intro: rankingDescription(ranking),
    items: ranking.items.map((item, index) => {
      const business = linkedBusinesses[index];
      const href = businessHref(safeLocale, business);
      return {
        ...item,
        url: href ? `${siteUrl}${href}` : undefined,
        schemaDescription: fallbackWhy(item, business)
      };
    })
  };

  return (
    <main>
      <section
        className="border-b border-white/[0.08] bg-[#07101F] px-4 py-10 sm:px-6 lg:px-8"
        data-attribution={rankingEditorialImage?.attribution}
        data-image-alt={rankingEditorialImage?.alt}
      >
        <div className="mx-auto max-w-5xl">
          <Breadcrumbs items={[{ label: "Inicio", href: `/${safeLocale}` }, { label: "Rankings", href: `/${safeLocale}/rankings` }, { label: ranking.title, href: `/${safeLocale}/rankings/${ranking.slug}` }]} />
          <div className="mt-8">
            <h1 className="max-w-3xl font-sans text-4xl font-black leading-tight text-ink">{ranking.title}</h1>
            <p className="mt-5 max-w-[680px] text-sm leading-7 text-sage">{rankingDescription(ranking)}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-[0.1em] text-olive">
              <span>Actualizado {ranking.updatedAt}</span>
              <span className="text-borderline">·</span>
              <span>{ranking.items.length} lugares analizados</span>
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <ol className="border-y border-linen">
          {ranking.items.map((item, index) => {
            const business = linkedBusinesses[index];
            const href = businessHref(safeLocale, business);
            const publicName = business ? getBusinessPublicName(business) : item.name;
            const location = business?.city || business?.area || ranking.area || "Mallorca";
            const categoryLabel = business ? categoryConfigs[getCategorySlugFromBusiness(business.category)].singular : ranking.category;
            const why = fallbackWhy(item, business);

            return (
              <li key={item.position} className="grid gap-4 border-b border-white/[0.08] bg-[#07101F] py-6 last:border-b-0 md:grid-cols-[64px_120px_1fr]">
                <div className="font-sans text-4xl font-black leading-none text-borderline">#{item.position}</div>
                <RankingBusinessImage business={business} name={publicName} />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-turquesa">{categoryLabel}</p>
                  <h2 className="mt-1 font-sans text-lg font-bold leading-tight text-ink">{publicName}</h2>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-sage">{location}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-sage">
                    {typeof business?.rating === "number" && <span className="font-bold text-coral">★ {business.rating.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span>}
                    {typeof business?.reviewsCount === "number" && <span>· {business.reviewsCount.toLocaleString("es-ES")} reseñas en Google</span>}
                  </div>
                  {why && (
                    <div className="mt-4">
                      <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-coral">Por qué lo elegimos</p>
                      <p className="mt-1 text-sm leading-7 text-olive">{why}</p>
                    </div>
                  )}
                  {item.bestFor.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.bestFor.map((tag) => (
                        <span key={tag} className="rounded-full border border-borderline bg-paper px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-olive">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {href && (
                    <Link href={href} className="mt-5 inline-flex rounded-sm border border-coral px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-coral transition hover:bg-coral hover:text-white">
                      Ver ficha completa →
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <FAQ faqs={cleanFaqs} locale={safeLocale} />
      </article>

      <JsonLd data={[createItemListSchema(itemListRanking as Ranking), createArticleSchema({ headline: ranking.title, description: rankingDescription(ranking), dateModified: ranking.updatedAt, image: rankingImage }), createFAQSchema(cleanFaqs), createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}
