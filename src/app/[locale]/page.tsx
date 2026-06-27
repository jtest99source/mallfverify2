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
import { BusinessImage, getBusinessImageUrl } from "@/components/BusinessImage";
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
    <section className="group flex h-full min-w-0 flex-col rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_45px_rgba(10,10,10,0.05)] transition-all duration-200 hover:-translate-y-1 hover:border-[#07101F] hover:shadow-[0_26px_70px_rgba(10,10,10,0.10)] sm:p-5">
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

function CarouselBusinessCard({ business, index, locale }: { business: Business; index: number; locale: Locale }) {
  return (
    <Link href={businessHref(locale, business)} className="group block w-[78vw] max-w-[330px] shrink-0 snap-start overflow-hidden bg-[#111111] ring-1 ring-white/[0.08] transition-all duration-200 hover:bg-[#1A1A1A] sm:w-[310px]">
      <BusinessImage business={business} category={business.category} variant="card" className="h-[200px] min-h-[200px] rounded-none p-3">
        <div className="flex h-full flex-col justify-between">
          <span className="font-display inline-flex text-xl font-black leading-none text-[#00C37A]">#{index + 1}</span>
          <div>
            <p className="inline-flex items-center gap-1 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/75 backdrop-blur">
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
        <h3 className="font-display line-clamp-2 text-xl font-bold leading-tight text-white">{getBusinessPublicName(business)}</h3>
        <div className="mt-4 border-t border-white/[0.08] pt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-white/35 transition-colors group-hover:text-[#00C37A]">
          {locale === "de" ? "Ansehen" : locale === "en" ? "View details" : "Ver ficha"}
          <IconArrowUpRight size={13} stroke={2} className="ml-1 inline" />
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
    <section className="border-t border-white/[0.08] py-10 first:border-t-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00C37A] before:h-px before:w-4 before:bg-[#00C37A]">{eyebrow}</p>
          <h3 className="font-display mt-2 text-3xl font-bold leading-tight text-white sm:text-4xl">{title}</h3>
        </div>
        <Link href={href} className="hidden shrink-0 text-[12px] font-semibold tracking-[0.04em] text-white/40 transition-colors hover:text-[#00C37A] sm:inline-flex">
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
      <section className="relative z-20 flex min-h-[96vh] items-center justify-center overflow-visible bg-[#07101F] px-4 py-20 text-center text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 grid grid-cols-2 gap-px opacity-95 md:grid-cols-4">
          {heroPanels.map((business, index) => (
            <div
              key={business?.id ?? `fallback-${index}`}
              className="relative h-full min-h-full overflow-hidden bg-[#111111]"
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
                  <div className="absolute left-4 top-4 font-display text-xl font-black text-[#00C37A]">#{index + 1}</div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/45 backdrop-blur">
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
              {safeLocale === "de" ? "Echte Daten · Keine bezahlten Platzierungen" : safeLocale === "en" ? "Real data · No paid placements" : "Datos reales · Sin posiciones de pago"}
            </div>
            <h1 className="font-display mx-auto max-w-4xl text-balance text-5xl font-black leading-[0.92] text-white sm:text-7xl lg:text-[88px]">
              {safeLocale === "de" ? (
                <>Finde das <em className="italic text-[#00C37A]">Beste</em><br className="hidden sm:block" /> auf Mallorca.</>
              ) : safeLocale === "en" ? (
                <>Find the <em className="italic text-[#00C37A]">best</em><br className="hidden sm:block" /> in Mallorca.</>
              ) : (
                <>Encuentra lo <em className="italic text-[#00C37A]">mejor</em><br className="hidden sm:block" /> en Mallorca.</>
              )}
            </h1>
            <p className="mx-auto mt-6 max-w-[480px] text-base font-light leading-8 text-white/60 sm:text-[17px]">
              {safeLocale === "de"
                ? "Jedes Unternehmen hat eine echte Google-Bewertungsschwelle überschritten. Rankings basieren auf Daten — keine Werbung, keine Gebühren."
                : safeLocale === "en"
                ? "Every business cleared a real Google review threshold. Rankings built on data — not ads, not fees."
                : "Cada negocio supera un umbral real de reseñas de Google. Rankings basados en datos — sin anuncios, sin cuotas."}
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
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-white text-[11px] font-black text-[#0A0A0A]">#{index + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-base font-black leading-tight text-white">{getBusinessPublicName(business)}</span>
                      <span className="mt-1 flex min-w-0 items-center gap-2 text-[12px] font-semibold text-white/55">
                        <IconMapPin size={13} className="shrink-0 text-[#00C37A]" />
                        <span className="truncate">{businessLocation(business)}</span>
                      </span>
                      <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-white">
                        <span className="text-[#00C37A]">★ {typeof business.rating === "number" ? business.rating.toLocaleString(numberLocale(safeLocale), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : ""}</span>
                        {typeof business.reviewsCount === "number" && <span className="text-white/45">{business.reviewsCount.toLocaleString(numberLocale(safeLocale))}</span>}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </aside>
          )}

          <div className="mt-12 grid w-full max-w-[640px] grid-cols-2 border-t border-white/10 pt-8 sm:grid-cols-4">
            {[
              { value: formatIntegerMetric(stats.publishedBusinesses, safeLocale), label: copy.home.verifiedBusinesses },
              { value: formatMillionMetric(stats.analyzedReviews, safeLocale), label: copy.home.analyzedReviews },
              { value: formatIntegerMetric(publicCategorySlugs.length, safeLocale), label: copy.home.activeCategories },
              { value: formatIntegerMetric(approvedExperts.length, safeLocale), label: expertMetricLabel }
            ].map((stat) => (
              <div key={stat.label} className="border-white/10 px-3 py-2 sm:border-r last:border-r-0">
                <div className="font-display text-3xl font-black leading-none text-[#00C37A]">{stat.value}</div>
                <div className="mt-2 text-[10px] font-medium uppercase leading-tight tracking-[0.08em] text-white/30">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 hidden flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/45 sm:flex">
            {copy.home.signals.map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><IconCircleCheckFilled size={14} className="text-[#00C37A]" />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/[0.08] bg-[#07101F] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-[1360px] gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-24 lg:self-start">
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

      <section className="bg-[#111111] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]">
              {safeLocale === "de" ? "Methode" : safeLocale === "en" ? "Method" : "Metodo"}
            </p>
            <h2 className="font-display mt-3 text-4xl font-bold leading-none text-white">
              {safeLocale === "de" ? "Warum diese Reihenfolge?" : safeLocale === "en" ? "Why this order?" : "Por que este orden?"}
            </h2>
          </div>
            <Link href={methodologyPath(safeLocale)} className="hidden text-[12px] font-semibold tracking-[0.04em] text-white/40 transition-colors hover:text-[#00C37A] sm:inline-flex">
              {methodology.link}
            </Link>
          </div>
          <div className="grid border border-white/[0.08] md:grid-cols-3">
            {methodology.items.map(({ title, text }, index) => (
              <div key={title} className="border-b border-white/[0.08] p-8 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
                <div className="font-display text-5xl font-black leading-none text-[#00C37A]/30">{String(index + 1).padStart(2, "0")}</div>
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

      <section className="bg-[#00C37A] px-4 py-8 text-[#0A0A0A] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/55">
              {safeLocale === "de" ? "Experten-Verzeichnis" : safeLocale === "en" ? "Expert Directory" : "Directorio de Expertos"}
            </p>
            <h2 className="font-display mt-1 text-3xl font-black text-[#0A0A0A] sm:text-4xl">
              {safeLocale === "de" ? "Profis in deiner Sprache" : safeLocale === "en" ? "Professionals in your language" : "Profesionales en tu idioma"}
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-7 text-black/55">
              {safeLocale === "de"
                ? "Anwaelte, Immobilienmakler, Aerzte und mehr - kuratiert nach redaktionellen Kriterien, nicht nach Gebuehren."
                : safeLocale === "en"
                  ? "Lawyers, estate agents, doctors and more - curated on editorial criteria, not fees."
                  : "Abogados, agentes inmobiliarios, médicos y más - seleccionados por criterio editorial, no por tarifas."}
            </p>
          </div>
          <Link href={`/${safeLocale}/experts`} className="group inline-flex min-h-12 shrink-0 items-center gap-3 rounded-sm bg-[#07101F] px-7 text-[12px] font-black uppercase tracking-[0.1em] text-[#00C37A] transition-all duration-200 hover:bg-white hover:text-[#0A0A0A]">
            {safeLocale === "de" ? "Experten ansehen" : safeLocale === "en" ? "View experts" : "Ver expertos"}
            <span className="text-xl leading-none transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[minmax(0,1fr)_360px] md:items-center">
          <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00C37A]">
            {safeLocale === "de" ? "Fuer Unternehmen" : safeLocale === "en" ? "For businesses" : "Para negocios"}
          </p>
          <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">{copy.home.businessTitle}</h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/45">{copy.home.businessIntro}</p>
          <Link href={`/${safeLocale}/business`} className="mt-8 inline-flex min-h-12 items-center justify-center rounded-sm bg-[#00C37A] px-7 text-[12px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white">
            {copy.home.businessCta}
          </Link>
          </div>
          <div className="space-y-5 border-l border-white/[0.08] pl-8">
            {[
              { value: formatIntegerMetric(stats.publishedBusinesses, safeLocale), label: copy.home.verifiedBusinesses },
              { value: formatMillionMetric(stats.analyzedReviews, safeLocale), label: copy.home.analyzedReviews },
              { value: formatIntegerMetric(publicCategorySlugs.length, safeLocale), label: copy.home.activeCategories },
              { value: formatIntegerMetric(approvedExperts.length, safeLocale), label: expertMetricLabel }
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-3">
                <div className="font-display text-4xl font-black leading-none text-[#00C37A]">{stat.value}</div>
                <div className="text-sm text-white/35">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
