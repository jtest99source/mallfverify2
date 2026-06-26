import Link from "next/link";
import {
  IconArrowUpRight,
  IconBed,
  IconCar,
  IconCarGarage,
  IconChartBar,
  IconCircleCheckFilled,
  IconCoffee,
  IconDiamond,
  IconGlass,
  IconHeartRateMonitor,
  IconHomeDollar,
  IconMapPin,
  IconMassage,
  IconMountain,
  IconMusic,
  IconSailboat,
  IconShieldCheck,
  IconToolsKitchen2,
  IconUmbrella
} from "@tabler/icons-react";
import { GuideCard } from "@/components/GuideCard";
import { getCategorySlugFromBusiness, publicCategorySlugs, type CategorySlug } from "@/lib/data";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { getGuides, getHomepageMiniRankingBusinesses, getPublicBusinessStats } from "@/lib/repository";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { methodologyPath } from "@/lib/methodology";
import { getEditorialImageForGuide } from "@/lib/unsplash";
import { HomePlaceSearch } from "@/components/HomePlaceSearch";
import { BusinessImage } from "@/components/BusinessImage";
import { RatingBadge } from "@/components/RatingBadge";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/data";
import type { Business } from "@/types/business";
import { expertProfiles } from "@/data/expertProfiles";

const categoryIcons: Partial<Record<CategorySlug, typeof IconToolsKitchen2>> = {
  restaurants: IconToolsKitchen2,
  hotels: IconBed,
  "beach-clubs": IconUmbrella,
  bars: IconGlass,
  cafes: IconCoffee,
  nightlife: IconMusic,
  boats: IconSailboat,
  activities: IconMountain,
  "rent-a-car": IconCar,
  "car-dealers": IconCarGarage,
  spas: IconMassage,
  healthcare: IconHeartRateMonitor,
  "real-estate": IconHomeDollar
} as const;

const homepageSearchLocations = [
  "Palma",
  "Alcúdia",
  "Pollença",
  "Cala Millor",
  "Sóller",
  "Can Picafort",
  "Cala d'Or",
  "Santa Ponça",
  "Peguera",
  "Cala Ratjada",
  "Andratx",
  "Manacor",
  "Inca",
  "Santanyí",
  "Llucmajor",
  "Palmanova",
  "Colonia de Sant Jordi",
  "Porto Cristo",
  "Magaluf",
  "Portocolom",
  "Cala Bona",
  "Portals Nous",
  "Playa de Muro"
].map((location) => ({ label: location, value: location }));

const methodologyCopy = {
  es: {
    link: "Leer metodología completa →",
    items: [
      {
        Icon: IconShieldCheck,
        title: "Solo datos reales",
        text: "Cada negocio supera un umbral mínimo de reseñas verificadas en Google antes de aparecer. No hay excepciones: sin volumen real, sin posición."
      },
      {
        Icon: IconChartBar,
        title: "Posiciones que no se compran",
        text: "El ranking refleja valoración, volumen y consistencia — no quién paga más. Una ficha premium mejora la información disponible, no el puesto."
      },
      {
        Icon: IconDiamond,
        title: "Experts en tu idioma",
        text: "Para las decisiones que importan — comprar, mudarse, encontrar médico — nuestros Experts son profesionales seleccionados en inglés y alemán por criterio editorial, no por honorarios."
      }
    ]
  },
  en: {
    link: "Read full methodology →",
    items: [
      {
        Icon: IconShieldCheck,
        title: "Real data only",
        text: "Every business clears a minimum verified Google review threshold before it appears. No exceptions — no real volume, no position."
      },
      {
        Icon: IconChartBar,
        title: "Positions you can't buy",
        text: "Rankings reflect rating, volume and consistency — not who pays the most. A premium profile improves the information available, not the position."
      },
      {
        Icon: IconDiamond,
        title: "Experts in your language",
        text: "For the decisions that matter — buying, moving, finding a doctor — our Experts are English and German-speaking professionals selected on editorial criteria, not fees."
      }
    ]
  },
  de: {
    link: "Vollständige Methodik lesen →",
    items: [
      {
        Icon: IconShieldCheck,
        title: "Nur echte Daten",
        text: "Jeder Betrieb muss eine Mindestanzahl verifizierter Google-Bewertungen vorweisen, bevor er erscheint. Keine Ausnahmen — kein echtes Volumen, keine Position."
      },
      {
        Icon: IconChartBar,
        title: "Positionen, die man nicht kaufen kann",
        text: "Rankings basieren auf Bewertung, Volumen und Konsistenz — nicht darauf, wer am meisten zahlt. Ein Premium-Profil verbessert die verfügbaren Informationen, nicht die Position."
      },
      {
        Icon: IconDiamond,
        title: "Experts in deiner Sprache",
        text: "Für wichtige Entscheidungen — kaufen, umziehen, Arzt finden — sind unsere Experts deutsch- und englischsprachige Profis, ausgewählt nach redaktionellen Kriterien, nicht nach Gebühren."
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
  const isFirst = index === 0;
  return (
    <Link href={businessHref(locale, business)} className={`grid min-w-0 grid-cols-[1.6rem_minmax(0,1fr)] gap-x-2 gap-y-2 rounded-md px-2 py-3 transition-colors duration-150 sm:flex sm:items-center sm:gap-3 ${isFirst ? "bg-[#FFFBEE] hover:bg-[#FFF3B0]" : "hover:bg-[#F9FAFB]"}`}>
      <span className={`w-5 shrink-0 text-center text-xs font-black ${isFirst ? "text-[#C9A800]" : "text-[#6B7280]"}`}>#{index + 1}</span>
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-sm ${isFirst ? "font-bold text-ink" : "font-medium text-ink/80"}`}>{getBusinessPublicName(business)}</span>
        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-sage">
          <IconMapPin size={12} stroke={1.8} />
          <span className="truncate">{businessLocation(business)}</span>
        </span>
      </span>
      <span className="col-start-2 min-w-0 sm:col-auto">
        <div className={`inline-flex min-w-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] leading-none sm:whitespace-nowrap sm:text-[11px] ${isFirst ? "bg-[#0A0A0A] text-white" : "bg-[#F9FAFB] text-[#0A0A0A]"}`}>
          <span className={`font-extrabold ${isFirst ? "text-[#FFCC00]" : "text-[#C9A800]"}`}>★ {typeof business.rating === "number" ? business.rating.toLocaleString(locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : ""}</span>
          {typeof business.reviewsCount === "number" && <span className={isFirst ? "text-white/50" : "text-[#0A0A0A]/40"}>·</span>}
          {typeof business.reviewsCount === "number" && <span className="truncate">{business.reviewsCount.toLocaleString(locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES")}</span>}
        </div>
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
    <section className="group flex h-full min-w-0 flex-col rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_45px_rgba(10,10,10,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-[#0A0A0A] hover:shadow-[0_26px_70px_rgba(10,10,10,0.10)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#0A0A0A] text-[#FFCC00]">
            <Icon size={16} stroke={1.8} />
          </div>
          <h2 className="text-lg font-black leading-tight text-ink">{label}</h2>
        </div>
        <Link href={`/${locale}/top/${category}`} className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A] opacity-60 transition-opacity hover:opacity-100" aria-label={ariaLabel}>
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

function CarouselBusinessCard({ business, index, locale }: { business: Business; index: number; locale: Locale }) {
  return (
    <Link href={businessHref(locale, business)} className="group block w-[78vw] max-w-[330px] shrink-0 snap-start overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-[0_18px_45px_rgba(10,10,10,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-[#0A0A0A] hover:shadow-[0_28px_70px_rgba(10,10,10,0.12)] sm:w-[310px]">
      <BusinessImage business={business} category={business.category} variant="card" className="h-[190px] min-h-[190px]">
        <div className="flex h-full flex-col justify-between">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#0A0A0A] text-xs font-black text-white">#{index + 1}</span>
          <div>
            <p className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
              <IconMapPin size={12} stroke={2} />
              {businessLocation(business)}
            </p>
          </div>
        </div>
      </BusinessImage>
      <div className="p-4">
        <div className="mb-3 flex min-h-6 items-center justify-between gap-2">
          <RatingBadge rating={business.rating} reviewsCount={business.reviewsCount} locale={locale} compact />
        </div>
        <h3 className="line-clamp-2 text-lg font-black leading-tight text-[#0A0A0A]">{getBusinessPublicName(business)}</h3>
        <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-opacity group-hover:opacity-65">
          {locale === "de" ? "Ansehen" : locale === "en" ? "View details" : "Ver ficha"}
          <IconArrowUpRight size={13} stroke={2} />
        </div>
      </div>
    </Link>
  );
}

function EditorialRankingCarousel({
  title,
  eyebrow,
  href,
  businesses,
  locale
}: {
  title: string;
  eyebrow: string;
  href: string;
  businesses: Business[];
  locale: Locale;
}) {
  if (!businesses.length) return null;

  return (
    <section className="border-t border-[#0A0A0A] py-8 first:border-t-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex rounded-sm bg-[#0A0A0A] px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">{eyebrow}</p>
          <h3 className="font-display mt-1 text-2xl font-black leading-tight text-[#0A0A0A] sm:text-3xl">{title}</h3>
        </div>
        <Link href={href} className="hidden shrink-0 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-opacity hover:opacity-65 sm:inline-flex">
          {locale === "de" ? "Alle ansehen" : locale === "en" ? "View all" : "Ver todos"} →
        </Link>
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [&::-webkit-scrollbar]:hidden">
        <div className="flex snap-x gap-4 pr-6">
          {businesses.slice(0, 5).map((business, index) => (
            <CarouselBusinessCard key={business.id} business={business} index={index} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}

function expertHeroNudge(locale: Locale) {
  if (locale === "de") return "Brauchst du Anwalt, Arzt oder Immobilienmakler auf Deutsch?";
  if (locale === "en") return "Need a lawyer, doctor or estate agent in English?";
  return "¿Buscas abogado, médico o inmobiliaria en inglés?";
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
  const [latestGuides, restaurantsPalma, restaurantsSoller, hotels, beachClubs, bars, cafes, nightlife, boats, activities, rentACar, carDealers, spas, healthcare, realEstate, stats] = await Promise.all([
    getGuides(safeLocale, 4),
    getHomepageMiniRankingBusinesses("restaurants", 5, "Palma", 200),
    getHomepageMiniRankingBusinesses("restaurants", 5, "S\u00f3ller", 50),
    getHomepageMiniRankingBusinesses("hotels", 5, undefined, 100),
    getHomepageMiniRankingBusinesses("beach-clubs", 5, undefined, 100),
    getHomepageMiniRankingBusinesses("bars", 5, undefined, 80),
    getHomepageMiniRankingBusinesses("cafes", 5, undefined, 50),
    getHomepageMiniRankingBusinesses("nightlife", 5, undefined, 80),
    getHomepageMiniRankingBusinesses("boats", 5, "Palma", 50),
    getHomepageMiniRankingBusinesses("activities", 5, undefined, 200),
    getHomepageMiniRankingBusinesses("rent-a-car", 5, undefined, 80),
    getHomepageMiniRankingBusinesses("car-dealers", 5, undefined, 20),
    getHomepageMiniRankingBusinesses("spas", 5, undefined, 20),
    getHomepageMiniRankingBusinesses("healthcare", 5, undefined, 15),
    getHomepageMiniRankingBusinesses("real-estate", 5, undefined, 15),
    getPublicBusinessStats()
  ]);
  const guideImages = await Promise.all(latestGuides.map((guide) => (guide.heroImageUrl ? Promise.resolve(null) : getEditorialImageForGuide(guide.title))));

  const categoryRankings = [
    { category: "restaurants" as const, businesses: restaurantsPalma },
    { category: "hotels" as const, businesses: hotels },
    { category: "beach-clubs" as const, businesses: beachClubs },
    { category: "bars" as const, businesses: bars },
    { category: "cafes" as const, businesses: cafes },
    { category: "nightlife" as const, businesses: nightlife },
    { category: "boats" as const, businesses: boats },
    { category: "activities" as const, businesses: activities },
    { category: "rent-a-car" as const, businesses: rentACar },
    { category: "car-dealers" as const, businesses: carDealers },
    { category: "spas" as const, businesses: spas },
    { category: "healthcare" as const, businesses: healthcare },
    { category: "real-estate" as const, businesses: realEstate }
  ].filter((ranking) => ranking.businesses.length > 0);
  const editorialRankingModules = [
    {
      key: "restaurants-palma",
      title: safeLocale === "de" ? "Beste Restaurants in Palma" : safeLocale === "en" ? "Best restaurants in Palma" : "Mejores restaurantes en Palma",
      eyebrow: safeLocale === "de" ? "Essen gehen" : safeLocale === "en" ? "Eating out" : "Dónde comer",
      href: `/${safeLocale}/top/restaurants?area=Palma`,
      businesses: restaurantsPalma
    },
    {
      key: "restaurants-soller",
      title: safeLocale === "de" ? "Beste Restaurants in S\u00f3ller" : safeLocale === "en" ? "Best restaurants in S\u00f3ller" : "Mejores restaurantes en S\u00f3ller",
      eyebrow: safeLocale === "de" ? "Tramuntana" : safeLocale === "en" ? "Tramuntana" : "Tramuntana",
      href: `/${safeLocale}/top/restaurants?area=S%C3%B3ller`,
      businesses: restaurantsSoller
    },
    {
      key: "beach-clubs",
      title: safeLocale === "de" ? "Beachclubs, die wirklich gut bewertet sind" : safeLocale === "en" ? "Beach clubs people actually rate" : "Beach clubs que la gente sí valora",
      eyebrow: safeLocale === "de" ? "Sonne & Lunch" : safeLocale === "en" ? "Sun & lunch" : "Sol y comida",
      href: `/${safeLocale}/top/beach-clubs`,
      businesses: beachClubs
    },
    {
      key: "rent-a-car",
      title: safeLocale === "de" ? "Mietwagen ohne böse Überraschungen" : safeLocale === "en" ? "Car rentals without the usual surprises" : "Rent a car sin las sorpresas de siempre",
      eyebrow: safeLocale === "de" ? "Ankommen & fahren" : safeLocale === "en" ? "Arrive & drive" : "Llegar y moverse",
      href: `/${safeLocale}/top/rent-a-car`,
      businesses: rentACar
    },
    {
      key: "healthcare",
      title: safeLocale === "de" ? "Ärzte und Kliniken für internationale Bewohner" : safeLocale === "en" ? "Doctors and clinics for international residents" : "Médicos y clínicas para residentes internacionales",
      eyebrow: safeLocale === "de" ? "Praktisch" : safeLocale === "en" ? "Practical" : "Práctico",
      href: `/${safeLocale}/top/healthcare`,
      businesses: healthcare
    },
    {
      key: "real-estate",
      title: safeLocale === "de" ? "Immobilienagenturen für Käufer aus dem Ausland" : safeLocale === "en" ? "Real estate agencies for overseas buyers" : "Inmobiliarias para compradores extranjeros",
      eyebrow: safeLocale === "de" ? "Umziehen & kaufen" : safeLocale === "en" ? "Move & buy" : "Mudarse y comprar",
      href: `/${safeLocale}/top/real-estate`,
      businesses: realEstate
    }
  ].filter((module) => module.businesses.length > 0);
  const approvedExperts = expertProfiles.filter((profile) => profile.status !== "hidden");
  const expertMetricLabel =
    safeLocale === "de" ? "gepruefte Experten" : safeLocale === "en" ? "verified experts" : "expertos verificados";

  return (
    <main className="bg-white">
      <section className="relative z-20 overflow-visible bg-[#0A0A0A] px-4 pb-8 pt-10 text-white sm:pb-12 sm:pt-14 sm:px-6 lg:px-8">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#FFCC00]">
              <IconShieldCheck size={15} stroke={2} />
              {copy.home.eyebrow}
            </div>
            <h1 className="font-display text-balance text-3xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {copy.home.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
              {copy.home.intro}
            </p>
            <HomePlaceSearch locale={safeLocale} categories={[...publicCategorySlugs]} locations={homepageSearchLocations} />
            <div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-4">
              <Link href={`/${safeLocale}/top/restaurants`} className="inline-flex min-h-11 items-center justify-center rounded-md border border-white bg-white px-5 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#FFCC00]">
                {copy.home.exploreRankings}
              </Link>
              <Link href={`/${safeLocale}/experts`} className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/25 bg-transparent px-5 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all duration-150 hover:-translate-y-0.5 hover:border-white hover:bg-white hover:text-[#0A0A0A]">
                {safeLocale === "de" ? "Experten ansehen" : safeLocale === "en" ? "View experts" : "Ver expertos"}
              </Link>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-10 sm:grid-cols-4 sm:gap-4">
            {[
              { value: formatIntegerMetric(stats.publishedBusinesses, safeLocale), label: copy.home.verifiedBusinesses },
              { value: formatMillionMetric(stats.analyzedReviews, safeLocale), label: copy.home.analyzedReviews },
              { value: formatIntegerMetric(publicCategorySlugs.length, safeLocale), label: copy.home.activeCategories },
              { value: formatIntegerMetric(approvedExperts.length, safeLocale), label: expertMetricLabel }
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/15 bg-white/[0.06] px-3 py-3 shadow-[0_18px_45px_rgba(0,0,0,0.16)] sm:px-5 sm:py-5">
                <div className="font-display text-xl font-black leading-none text-[#FFCC00] sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-[9px] font-bold uppercase leading-tight tracking-[0.1em] text-white/60 sm:mt-2 sm:text-[10px] sm:tracking-[0.12em]">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 hidden flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/65 sm:flex">
            {copy.home.signals.map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><IconCircleCheckFilled size={14} className="text-[#FFCC00]" />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mb-2 max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.home.selection}</p>
          <h2 className="font-display mt-2 text-3xl font-black text-ink sm:text-5xl">
            {safeLocale === "de" ? "Mallorca-Rankings nach Kategorie" : safeLocale === "en" ? "Mallorca rankings, by category" : "Rankings de Mallorca por categoría"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#6B7280]">
            {copy.home.bestThisWeekIntro}
          </p>
        </div>
        <div className="divide-y divide-[#E5E7EB]">
          {editorialRankingModules.slice(0, 6).map((module) => (
            <EditorialRankingCarousel
              key={module.key}
              title={module.title}
              eyebrow={module.eyebrow}
              href={module.href}
              businesses={module.businesses}
              locale={safeLocale}
            />
          ))}
        </div>
        <div className="mt-2">
          <Link href={`/${safeLocale}/top/restaurants`} className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-opacity hover:opacity-65">
            {safeLocale === "de" ? "Alle Rankings ansehen" : safeLocale === "en" ? "View all rankings" : "Ver todos los rankings"}{" "}
            <span aria-hidden="true">{"\u2192"}</span>
          </Link>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-stretch gap-5 md:grid-cols-3">
          {methodology.items.map(({ Icon, title, text }) => (
            <div key={title} className="flex h-full min-h-[180px] flex-col rounded-lg border border-[#E5E7EB] bg-white p-7 shadow-[0_16px_38px_rgba(10,10,10,0.035)]">
              <Icon size={28} stroke={1.8} className="text-[#0A0A0A]" />
              <h2 className="mt-5 text-xl font-black leading-tight text-ink">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#6B7280]">{text}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-5 max-w-7xl">
          <Link href={methodologyPath(safeLocale)} className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink transition-opacity hover:opacity-65">
            {methodology.link}
          </Link>
        </div>
      </section>

      {safeLocale === "es" && latestGuides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 pb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.home.guidesEyebrow}</p>
            <h2 className="font-display mt-2 text-3xl font-black text-ink">{copy.home.guidesTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6B7280]">{copy.home.guidesIntro}</p>
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
            target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/${safeLocale}/top/restaurants?q={search_term_string}` },
            "query-input": "required name=search_term_string"
          }
        }
      ]} />

      <section className="bg-[#0A0A0A] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#FFCC00]">
              {safeLocale === "de" ? "Experten-Verzeichnis" : safeLocale === "en" ? "Expert Directory" : "Directorio de Expertos"}
            </p>
            <h2 className="font-display mt-3 text-3xl font-black text-white sm:text-4xl">
              {safeLocale === "de" ? "Profis in deiner Sprache" : safeLocale === "en" ? "Professionals in your language" : "Profesionales en tu idioma"}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/60">
              {safeLocale === "de"
                ? "Anwaelte, Immobilienmakler, Aerzte und mehr - kuratiert nach redaktionellen Kriterien, nicht nach Gebuehren."
                : safeLocale === "en"
                  ? "Lawyers, estate agents, doctors and more - curated on editorial criteria, not fees."
                  : "Abogados, agentes inmobiliarios, médicos y más - seleccionados por criterio editorial, no por tarifas."}
            </p>
          </div>
          <Link href={`/${safeLocale}/experts`} className="group inline-flex min-h-12 shrink-0 items-center gap-3 rounded-md border border-white/20 bg-white/10 px-7 text-[12px] font-black uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-white hover:text-[#0A0A0A]">
            {safeLocale === "de" ? "Experten ansehen" : safeLocale === "en" ? "View experts" : "Ver expertos"}
            <span className="text-xl leading-none transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      <section className="px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#E5E7EB] bg-white px-5 py-10 shadow-[0_18px_45px_rgba(10,10,10,0.04)]">
          <h2 className="text-3xl font-bold text-ink">{copy.home.businessTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6B7280]">{copy.home.businessIntro}</p>
          <Link href={`/${safeLocale}/business`} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-sm bg-[#0A0A0A] px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#262626]">
            {copy.home.businessCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
