import Link from "next/link";
import {
  IconBeach,
  IconBed,
  IconChartBar,
  IconChevronRight,
  IconCircleCheckFilled,
  IconDiamond,
  IconMapPin,
  IconMountain,
  IconPencil,
  IconSailboat,
  IconShieldCheck,
  IconToolsKitchen2,
  IconUmbrella
} from "@tabler/icons-react";
import { GuideCard } from "@/components/GuideCard";
import { RatingBadge } from "@/components/RatingBadge";
import { categoryConfigs, getCategorySlugFromBusiness, type CategorySlug } from "@/lib/data";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { getGuides, getHomepageMiniRankingBusinesses, getPublicBusinessStats } from "@/lib/repository";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { methodologyPath } from "@/lib/methodology";
import { getEditorialImageForCategory, getEditorialImageForGuide } from "@/lib/unsplash";
import { SearchBox } from "@/components/LiveSearch";
import { CategoryPillsCarousel } from "@/components/CategoryPillsCarousel";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/data";
import type { Business } from "@/types/business";

const categoryIcons: Partial<Record<CategorySlug, typeof IconToolsKitchen2>> = {
  restaurants: IconToolsKitchen2,
  hotels: IconBed,
  "beach-clubs": IconUmbrella,
  boats: IconSailboat,
  activities: IconMountain,
  beaches: IconBeach
} as const;

const methodologyCopy = {
  es: {
    link: "Leer metodología completa →",
    items: [
      {
        Icon: IconChartBar,
        title: "El consenso, no una opinión",
        text: "Cada posición refleja lo que han valorado cientos o miles de personas reales. No un blog, no publicidad: la experiencia colectiva de quienes han estado allí."
      },
      {
        Icon: IconDiamond,
        title: "Lo mejor antes de que todo el mundo lo sepa",
        text: "El Untapped Score detecta negocios con valoración alta que todavía no están masificados. Excelentes según los datos, pero sin cola en la puerta."
      },
      {
        Icon: IconPencil,
        title: "Guías para planificar",
        text: "Las guías ayudan a elegir zona, ruta o tipo de experiencia, pero nunca cambian la posición de ningún negocio en rankings."
      }
    ]
  },
  en: {
    link: "Read full methodology ->",
    items: [
      {
        Icon: IconChartBar,
        title: "Consensus, not one opinion",
        text: "Each position reflects what hundreds or thousands of real visitors have rated. Not a blog, not advertising: the collective experience of people who have been there."
      },
      {
        Icon: IconDiamond,
        title: "Great places before everyone knows them",
        text: "The Untapped Score identifies highly rated places that are not yet overcrowded. Strong according to the data, without being on every list."
      },
      {
        Icon: IconPencil,
        title: "Context when it helps",
        text: "Editorial context can help you choose an area, route or type of experience, but it never changes ranking positions."
      }
    ]
  },
  de: {
    link: "Vollständige Methodik lesen →",
    items: [
      {
        Icon: IconChartBar,
        title: "Konsens, keine Einzelmeinung",
        text: "Jede Position zeigt, was Hunderte oder Tausende echte Besucher bewertet haben. Kein Blog, keine Werbung: die gemeinsame Erfahrung von Menschen, die dort waren."
      },
      {
        Icon: IconDiamond,
        title: "Starke Orte, bevor alle sie kennen",
        text: "Der Untapped Score erkennt sehr gut bewertete Orte, die noch nicht überlaufen sind. Stark nach Daten, aber nicht auf jeder Liste."
      },
      {
        Icon: IconPencil,
        title: "Kontext, wenn er hilft",
        text: "Redaktioneller Kontext hilft bei Gegend, Route oder Erlebnisart, ändert aber nie die Position eines Betriebs im Ranking."
      }
    ]
  }
} as const;

function businessHref(locale: Locale, business: Business) {
  return `/${locale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`;
}

function businessLocation(business: Business) {
  return business.city || business.area || "Mallorca";
}

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

function formatIntegerMetric(value: number, locale: Locale) {
  return value.toLocaleString(numberLocale(locale));
}

function formatMillionMetric(value: number, locale: Locale) {
  if (value < 1_000_000) return formatIntegerMetric(value, locale);
  return `${(value / 1_000_000).toLocaleString(numberLocale(locale), { maximumFractionDigits: 1 })}M+`;
}

function RankingItem({ business, index, locale }: { business: Business; index: number; locale: Locale }) {
  return (
    <Link href={businessHref(locale, business)} className="grid min-w-0 grid-cols-[1.6rem_minmax(0,1fr)] gap-x-2 gap-y-2 rounded-md px-2 py-3 transition-colors duration-150 hover:bg-[#FFF8EC] sm:flex sm:items-center sm:gap-3">
      <span className="w-5 shrink-0 text-center text-xs font-black text-borderline">#{index + 1}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink">{getBusinessPublicName(business)}</span>
        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-sage">
          <IconMapPin size={12} stroke={1.8} />
          <span className="truncate">{businessLocation(business)}</span>
        </span>
      </span>
      <span className="col-start-2 min-w-0 sm:col-auto">
        <RatingBadge rating={business.rating} reviewsCount={business.reviewsCount} locale={locale} compact />
      </span>
    </Link>
  );
}

function CategoryRankingCard({ category, businesses, locale }: { category: CategorySlug; businesses: Business[]; locale: Locale }) {
  const Icon = categoryIcons[category] ?? IconChartBar;
  const label = getCategoryCopy(category, locale).label;
  const rankingLabel = locale === "de" ? "Rangliste" : "Ranking";
  const ariaLabel = locale === "es" ? `Ver ranking de ${label}` : locale === "de" ? `Rangliste für ${label} ansehen` : `View ${label} ranking`;

  return (
    <section className="group flex h-full min-w-0 flex-col rounded-lg border border-[#E7DED0] border-t-2 border-t-[#0E8F72] bg-white p-4 shadow-[0_18px_45px_rgba(27,46,75,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(27,46,75,0.14)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#F0FDF4] text-[#0E8F72]">
            <Icon size={16} stroke={1.8} />
          </div>
          <h2 className="text-lg font-black leading-tight text-ink">{label}</h2>
        </div>
        <Link href={`/${locale}/top/${category}`} className="shrink-0 text-[9px] font-bold uppercase tracking-[0.08em] text-sage hover:text-[#0E8F72] sm:text-[10px] sm:tracking-[0.1em]" aria-label={ariaLabel}>
          {rankingLabel} →
        </Link>
      </div>
      <div className="divide-y divide-borderline">
        {businesses.map((business, index) => (
          <RankingItem key={business.id} business={business} index={index} locale={locale} />
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const copy = t(safeLocale);
  return generateSeoMetadata({
    title: copy.home.metaTitle,
    description: copy.home.metaDescription,
    path: `/${safeLocale}`,
    locale: safeLocale
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const copy = t(safeLocale);
  const methodology = methodologyCopy[safeLocale];
  const [latestGuides, restaurantsPalma, hotels, beachClubs, boats, activities, beaches, heroImage, stats] = await Promise.all([
    getGuides(safeLocale, 4),
    getHomepageMiniRankingBusinesses("restaurants", 5, "Palma", 200),
    getHomepageMiniRankingBusinesses("hotels", 5, undefined, 100),
    getHomepageMiniRankingBusinesses("beach-clubs", 5, undefined, 100),
    getHomepageMiniRankingBusinesses("boats", 5, "Palma", 50),
    getHomepageMiniRankingBusinesses("activities", 5, undefined, 200),
    getHomepageMiniRankingBusinesses("beaches", 5, undefined, 1000),
    getEditorialImageForCategory("beach"),
    getPublicBusinessStats()
  ]);
  const guideImages = await Promise.all(latestGuides.map((guide) => (guide.heroImageUrl ? Promise.resolve(null) : getEditorialImageForGuide(guide.title))));

  const categoryRankings = [
    { category: "restaurants" as const, businesses: restaurantsPalma },
    { category: "hotels" as const, businesses: hotels },
    { category: "beach-clubs" as const, businesses: beachClubs },
    { category: "boats" as const, businesses: boats },
    { category: "activities" as const, businesses: activities },
    { category: "beaches" as const, businesses: beaches }
  ].filter((ranking) => ranking.businesses.length > 0);

  return (
    <main className="bg-[#FFFDF7]">
      <section className="relative z-20 overflow-visible px-4 pb-8 pt-10 text-white sm:pb-12 sm:pt-14 sm:px-6 lg:px-8">
        {heroImage?.imageUrl ? (
          <>
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage.imageUrl})` }} />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,37,61,0.93)_0%,rgba(23,50,78,0.82)_48%,rgba(14,95,102,0.72)_100%)]" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(14,143,114,0.24),transparent_28%),linear-gradient(135deg,#10253D_0%,#17324E_48%,#0E5F66_100%)]" />
        )}
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#FFD166]">
              <IconShieldCheck size={15} stroke={2} />
              {copy.home.eyebrow}
            </div>
            <h1 className="font-display text-balance text-3xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {copy.home.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
              {copy.home.intro}
            </p>
            <SearchBox locale={safeLocale} variant="hero" className="mt-5 max-w-lg sm:mt-7" />
            <div className="mt-3 flex flex-wrap gap-3 sm:mt-4">
              <Link href={`/${safeLocale}/rankings`} className="inline-flex min-h-12 items-center justify-center rounded-md bg-coral px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-coral/90">
                {copy.home.exploreRankings}
              </Link>
              <Link href={`/${safeLocale}/guides`} className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-white/60 px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:border-white hover:bg-white hover:text-ink">
                {copy.home.viewGuides}
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-4">
            {[
              { value: formatIntegerMetric(stats.publishedBusinesses, safeLocale), label: copy.home.verifiedBusinesses },
              { value: formatMillionMetric(stats.analyzedReviews, safeLocale), label: copy.home.analyzedReviews },
              { value: formatIntegerMetric(stats.activeCategories, safeLocale), label: copy.home.activeCategories }
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/12 bg-white/10 px-3 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur sm:px-5 sm:py-5">
                <div className="font-display text-xl font-black leading-none text-[#FFD166] sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-white/70 sm:mt-2 sm:text-[10px] sm:tracking-[0.12em]">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 hidden flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/78 sm:flex">
            {copy.home.signals.map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><IconCircleCheckFilled size={14} />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <CategoryPillsCarousel locale={safeLocale} />
      </section>

      <section className="mx-auto max-w-[1360px] px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-5 max-w-3xl sm:mb-7">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">{copy.home.selection}</p>
          <h2 className="font-display mt-2 text-3xl font-black text-ink sm:text-4xl">{copy.home.bestThisWeek}</h2>
          <p className="mt-3 text-sm leading-7 text-sage">
            {copy.home.bestThisWeekIntro}
          </p>
        </div>
        <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#FFFDF7] to-transparent sm:w-20 lg:hidden" />
          <div className="pointer-events-none absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E7DED0] bg-white/95 text-ink shadow-[0_12px_28px_rgba(27,46,75,0.16)] md:hidden">
            <IconChevronRight size={20} stroke={2.4} />
          </div>
          <div className="flex snap-x gap-4 overflow-x-auto pb-5 pr-10 [scrollbar-width:none] sm:gap-5 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pr-0 [&::-webkit-scrollbar]:hidden">
          {categoryRankings.map((ranking) => (
            <div key={ranking.category} className="w-[88vw] max-w-[420px] shrink-0 snap-start sm:w-[420px] lg:w-auto">
              <CategoryRankingCard category={ranking.category} businesses={ranking.businesses} locale={safeLocale} />
            </div>
          ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-stretch gap-5 md:grid-cols-3">
          {methodology.items.map(({ Icon, title, text }) => (
            <div key={title} className="flex h-full min-h-[154px] flex-col rounded-lg border border-[#E7DED0] bg-white/75 p-5 shadow-[0_16px_38px_rgba(27,46,75,0.035)]">
              <Icon size={24} stroke={1.8} className="text-[#0E8F72]" />
              <h2 className="mt-4 text-xl font-bold leading-tight text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-sage">{text}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-5 max-w-7xl">
          <Link href={methodologyPath(safeLocale)} className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink hover:text-[#0E8F72]">
            {methodology.link}
          </Link>
        </div>
      </section>

      {safeLocale === "es" && latestGuides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 pb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">{copy.home.guidesEyebrow}</p>
            <h2 className="font-display mt-2 text-3xl font-black text-ink">{copy.home.guidesTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-sage">{copy.home.guidesIntro}</p>
          </div>
          <div className="grid items-stretch gap-5 md:grid-cols-2">
            {latestGuides.map((guide, index) => (
              <GuideCard key={guide.id} guide={guide} locale={safeLocale} editorialImage={guideImages[index]} />
            ))}
          </div>
        </section>
      )}

      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteConfig.name,
          url: siteUrl,
          description: siteConfig.description,
          inLanguage: safeLocale,
          potentialAction: {
            "@type": "SearchAction",
            target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/${safeLocale}/rankings?q={search_term_string}` },
            "query-input": "required name=search_term_string"
          }
        }
      ]} />

      <section className="px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#F1D3A2] bg-white/80 px-5 py-10 shadow-[0_18px_45px_rgba(27,46,75,0.04)]">
          <h2 className="text-3xl font-bold text-ink">{copy.home.businessTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-olive">{copy.home.businessIntro}</p>
          <Link href={`/${safeLocale}/business`} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-sm bg-[#1B2E4B] px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">
            {copy.home.businessCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
