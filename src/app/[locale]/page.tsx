import Link from "next/link";
import {
  IconBed,
  IconCar,
  IconCarGarage,
  IconCards,
  IconChartBar,
  IconCircleCheckFilled,
  IconCoffee,
  IconGlass,
  IconHeartRateMonitor,
  IconHomeDollar,
  IconMapPin,
  IconMassage,
  IconMountain,
  IconMusic,
  IconPaw,
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
import { getBusinessImageUrl } from "@/components/BusinessImage";
import { EditorialRankingCarousel } from "@/components/EditorialRankingCarousel";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/data";
import type { Business } from "@/types/business";

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
  casinos: IconCards,
  vets: IconPaw,
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
        <div className={`inline-flex min-w-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] leading-none sm:whitespace-nowrap sm:text-[11px] ${isFirst ? "bg-[#07101F] text-white" : "bg-[#F9FAFB] text-[#0A0A0A]"}`}>
          <span className={`font-extrabold ${isFirst ? "text-[#00C37A]" : "text-[#C9A800]"}`}>★ {typeof business.rating === "number" ? business.rating.toLocaleString(locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : ""}</span>
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
    <section className="group flex h-full min-w-0 flex-col rounded-lg border border-white/[0.10] bg-[#0C1A2E] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition-all duration-200 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_26px_70px_rgba(0,0,0,0.32)] sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#07101F] text-[#00C37A]">
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
      title: safeLocale === "de" ? "Ärzte und Kliniken auf Mallorca" : safeLocale === "en" ? "Doctors and clinics in Mallorca" : "Médicos y clínicas en Mallorca",
      eyebrow: safeLocale === "de" ? "Praktisch" : safeLocale === "en" ? "Practical" : "Práctico",
      href: `/${safeLocale}/top/healthcare`,
      businesses: healthcare
    },
    {
      key: "real-estate",
      title: safeLocale === "de" ? "Die besten Immobilienagenturen auf Mallorca" : safeLocale === "en" ? "Best real estate agencies in Mallorca" : "Mejores inmobiliarias de Mallorca",
      eyebrow: safeLocale === "de" ? "Immobilien" : safeLocale === "en" ? "Real estate" : "Inmobiliarias",
      href: `/${safeLocale}/top/real-estate`,
      businesses: realEstate
    }
  ].filter((module) => module.businesses.length > 0);
  const seenHeroBusinessIds = new Set<string>();
  const heroBusinesses = [
    ...restaurantsPalma,
    ...beachClubs,
    ...hotels,
    ...activities,
    ...restaurantsSoller,
    ...boats,
    ...bars,
    ...cafes
  ]
    .filter((business): business is Business => {
      if (!business || !getBusinessImageUrl(business)) return false;
      const businessId = String(business.id);
      if (seenHeroBusinessIds.has(businessId)) return false;
      seenHeroBusinessIds.add(businessId);
      return true;
    })
    .slice(0, 4);
  const heroFallbacks = [
    "linear-gradient(160deg,#202020,#080808)",
    "linear-gradient(160deg,#1f241f,#090909)",
    "linear-gradient(160deg,#231b14,#080808)",
    "linear-gradient(160deg,#101b1f,#070707)"
  ];
  const heroPanels = Array.from({ length: 4 }, (_, index) => heroBusinesses[index] ?? null);
  return (
    <main className="bg-[#07101F] text-white">
      <section className="relative z-20 flex min-h-[68vh] items-center justify-center overflow-visible bg-[#07101F] px-4 py-12 text-center text-white sm:min-h-[96vh] sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute inset-0 grid grid-cols-2 gap-px opacity-95 md:grid-cols-4">
          {heroPanels.map((business, index) => (
            <div
              key={business?.id ?? `fallback-${index}`}
              className="relative h-full min-h-full overflow-hidden bg-[#0C1A2E]"
              style={{
                backgroundImage: business
                  ? `linear-gradient(180deg,rgba(10,10,10,0.1),rgba(10,10,10,0.34)), url(${getBusinessImageUrl(business)})`
                  : heroFallbacks[index],
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="absolute inset-0 bg-[#07101F]/10" />
              {business && (
                <>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#07101F]/68 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/45 backdrop-blur">
                    {businessLocation(business)}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_72%_at_50%_43%,rgba(10,10,10,0.9)_0%,rgba(10,10,10,0.76)_48%,rgba(10,10,10,0.88)_100%),linear-gradient(to_bottom,rgba(10,10,10,0.78)_0%,rgba(10,10,10,0.42)_42%,rgba(10,10,10,0.95)_100%)]" />
        <div className="relative z-10 flex w-full max-w-[780px] flex-col items-center">
          <div className="w-full max-w-[780px]">
            <div className="mb-6 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00C37A] before:h-px before:w-6 before:bg-[#00C37A] after:h-px after:w-6 after:bg-[#00C37A]">
              {safeLocale === "de"
                ? <><span className="sm:hidden">Für Expats &amp; internationale Bewohner</span><span className="hidden sm:inline">Für Expats &amp; internationale Bewohner auf Mallorca</span></>
                : safeLocale === "en"
                ? <><span className="sm:hidden">For expats &amp; international residents</span><span className="hidden sm:inline">For expats &amp; international residents in Mallorca</span></>
                : <><span className="sm:hidden">Para expats y residentes internacionales</span><span className="hidden sm:inline">Para expats y residentes internacionales en Mallorca</span></>}
            </div>
            <h1 className="font-display mx-auto max-w-4xl text-balance text-[2.6rem] font-black leading-[0.92] text-white sm:text-7xl lg:text-[88px]">
              {safeLocale === "de" ? (
                <>Mallorca,<br className="hidden sm:block" /> <em className="italic text-[#00C37A]">nach echten Bewertungen gerankt.</em></>
              ) : safeLocale === "en" ? (
                <>Mallorca,<br className="hidden sm:block" /> <em className="italic text-[#00C37A]">ranked by real reviews.</em></>
              ) : (
                <>Mallorca,<br className="hidden sm:block" /> <em className="italic text-[#00C37A]">clasificada con datos reales.</em></>
              )}
            </h1>
            <p className="mx-auto mt-6 max-w-[480px] text-base font-light leading-8 text-white/60 sm:text-[17px]">
              {safeLocale === "de"
                ? "Rankings aus öffentlichen Google-Bewertungen — keine bezahlten Positionen, keine gesponserten Ergebnisse."
                : safeLocale === "en"
                ? "Rankings built on public Google Reviews — no paid positions, no sponsored results."
                : "Rankings construidos sobre Google Reviews públicas — sin posiciones de pago, sin resultados patrocinados."}
            </p>
            <HomePlaceSearch locale={safeLocale} categories={[...publicCategorySlugs]} locations={homepageSearchLocations} />
          </div>

          {restaurantsPalma.length > 0 && (
            <aside className="hidden">
              <div className="flex items-end justify-between border-b border-white/10 px-2 pb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00C37A]">
                    {safeLocale === "de" ? "Live Auswahl" : safeLocale === "en" ? "Live Selection" : "Seleccion editorial"}
                  </p>
                  <h2 className="mt-1 text-2xl font-black leading-none text-white">
                    {safeLocale === "de" ? "Palma, jetzt" : safeLocale === "en" ? "Palma, right now" : "Palma, ahora"}
                  </h2>
                </div>
                <Link href={`/${safeLocale}/top/restaurants?area=Palma`} className="text-[10px] font-black uppercase tracking-[0.1em] text-white/55 hover:text-white">
                  {safeLocale === "de" ? "Alle" : safeLocale === "en" ? "All" : "Todo"} {"\u2192"}
                </Link>
              </div>
              <div className="divide-y divide-white/10">
                {restaurantsPalma.slice(0, 4).map((business, index) => (
                  <Link key={business.id} href={businessHref(safeLocale, business)} className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 px-2 py-4 transition hover:bg-white/[0.06]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#00C37A] text-[11px] font-black text-[#0A0A0A]">#{index + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-base font-black leading-tight text-white">{getBusinessPublicName(business)}</span>
                      <span className="mt-1 flex min-w-0 items-center gap-2 text-[12px] font-semibold text-white/55">
                        <IconMapPin size={13} className="shrink-0 text-[#00C37A]" />
                        <span className="truncate">{businessLocation(business)}</span>
                      </span>
                      <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#040D1A] px-2.5 py-1 text-[11px] font-bold text-white">
                        <span className="text-[#00C37A]">★ {typeof business.rating === "number" ? business.rating.toLocaleString(numberLocale(safeLocale), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : ""}</span>
                        {typeof business.reviewsCount === "number" && <span className="text-white/45">{business.reviewsCount.toLocaleString(numberLocale(safeLocale))}</span>}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          )}

          <div className="mt-8 grid w-full max-w-[480px] grid-cols-3 border-t border-white/10 pt-6 sm:mt-12 sm:pt-8">
            {[
              { value: formatIntegerMetric(stats.publishedBusinesses, safeLocale), label: copy.home.verifiedBusinesses },
              { value: formatMillionMetric(stats.analyzedReviews, safeLocale), label: copy.home.analyzedReviews },
              { value: "56", label: safeLocale === "de" ? "Orte abgedeckt" : safeLocale === "en" ? "towns covered" : "municipios cubiertos" }
            ].map((stat) => (
              <div key={stat.label} className="border-white/10 px-3 py-2 sm:border-r last:border-r-0">
                <div className="font-display text-3xl font-black leading-none text-[#00C37A]">{stat.value}</div>
                <div className="mt-2 text-[10px] font-medium uppercase leading-tight tracking-[0.08em] text-white/30">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/45">
            {copy.home.signals.map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><IconCircleCheckFilled size={14} className="text-[#00C37A]" />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] bg-[#07101F] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-[1360px] gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="text-center lg:sticky lg:top-24 lg:self-start lg:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00C37A]">{copy.home.selection}</p>
          <h2 className="font-display mt-3 text-4xl font-bold leading-[0.96] text-white sm:text-5xl">
            {safeLocale === "de" ? "Mallorca-Rankings nach Kategorie" : safeLocale === "en" ? "Mallorca rankings, by category" : "Rankings de Mallorca por categoría"}
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/45">
            {copy.home.bestThisWeekIntro}
          </p>
          <Link href={`/${safeLocale}/top/restaurants`} className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#00C37A] px-5 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition hover:bg-white">
            {safeLocale === "de" ? "Alle Rankings" : safeLocale === "en" ? "All rankings" : "Todos los rankings"} {"\u2192"}
          </Link>
        </div>
        <div className="min-w-0 divide-y divide-white/[0.08] border-t border-white/[0.08]">
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
        </div>
      </section>

      <section className="border-b border-white/[0.08] bg-[#07101F] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex max-w-[1360px] flex-col items-start gap-6 rounded-lg border border-[#00C37A]/25 bg-[#00C37A]/[0.05] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00C37A]">
              {safeLocale === "de" ? "Für internationale Bewohner" : safeLocale === "en" ? "For internationals" : "Para residentes internacionales"}
            </p>
            <h2 className="font-display mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
              {safeLocale === "de"
                ? "Zahnarzt, Immobilienmakler oder Tierarzt gesucht?"
                : safeLocale === "en"
                  ? "Looking for a dentist, estate agent or vet?"
                  : "¿Buscas dentista, inmobiliaria o veterinario?"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/55">
              {safeLocale === "de"
                ? "Dienstleistungen, die für internationale Bewohner zählen — nach echten Bewertungen. Sprachverifizierung (EN/DE) demnächst."
                : safeLocale === "en"
                  ? "The services that matter to internationals — ranked on real reviews. English/German language verification coming soon."
                  : "Los servicios que importan a los residentes internacionales — clasificados por reseñas reales. Verificación de idioma (EN/DE) próximamente."}
            </p>
          </div>
          <Link href={`/${safeLocale}/services`} className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-sm bg-[#00C37A] px-6 text-[12px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition hover:bg-white">
            {safeLocale === "de" ? "Dienstleistungen ansehen" : safeLocale === "en" ? "Explore services" : "Ver servicios"} →
          </Link>
        </div>
      </section>

      <section className="bg-[#0C1A2E] px-4 py-10 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-6">
          <div className="text-center lg:text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]">
              {safeLocale === "de" ? "Methode" : safeLocale === "en" ? "Method" : "Método"}
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold leading-none text-white sm:text-4xl">
              {safeLocale === "de" ? "Wie unsere Rankings funktionieren" : safeLocale === "en" ? "How our rankings work" : "Cómo funcionan nuestros rankings"}
            </h2>
          </div>
            <Link href={methodologyPath(safeLocale)} className="hidden text-[12px] font-semibold tracking-[0.04em] text-white/40 transition-colors hover:text-[#00C37A] sm:inline-flex">
              {methodology.link}
            </Link>
          </div>
          <div className="grid border border-white/[0.08] md:grid-cols-2">
            {methodology.items.map(({ title, text }, index) => (
              <div key={title} className="border-b border-white/[0.08] p-5 text-center last:border-b-0 sm:p-8 md:border-b-0 md:border-r md:text-left md:last:border-r-0">
                <div className="font-display text-5xl font-black leading-none text-[#00C37A]/60">{String(index + 1).padStart(2, "0")}</div>
                <h2 className="font-display mt-5 text-2xl font-bold leading-tight text-white">{title}</h2>
                <p className="mt-3 text-sm font-light leading-7 text-white/42">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {safeLocale === "es" && latestGuides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-6 pb-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00C37A]">{copy.home.guidesEyebrow}</p>
            <h2 className="font-display mt-2 text-3xl font-bold text-white">{copy.home.guidesTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">{copy.home.guidesIntro}</p>
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

      <section className="px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[minmax(0,1fr)_360px] md:items-center md:gap-12">
          <div className="text-center md:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00C37A]">
            {safeLocale === "de" ? "Für Unternehmen" : safeLocale === "en" ? "For businesses" : "Para negocios"}
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">{copy.home.businessTitle}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45 sm:text-base sm:leading-8">{copy.home.businessIntro}</p>
          <Link href={`/${safeLocale}/business`} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-sm bg-[#00C37A] px-7 text-[12px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white">
            {copy.home.businessCta}
          </Link>
          </div>
          <div className="grid grid-cols-2 gap-px border border-white/[0.08] md:block md:space-y-5 md:border-0 md:border-l md:border-white/[0.08] md:bg-transparent md:pl-8">
            {[
              { value: formatIntegerMetric(stats.publishedBusinesses, safeLocale), label: copy.home.verifiedBusinesses },
              { value: formatMillionMetric(stats.analyzedReviews, safeLocale), label: copy.home.analyzedReviews }
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0C1A2E] p-4 md:flex md:items-baseline md:gap-3 md:bg-transparent md:p-0">
                <div className="font-display text-3xl font-black leading-none text-[#00C37A] md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-xs text-white/35 md:mt-0 md:text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
