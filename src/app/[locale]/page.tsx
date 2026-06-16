import Link from "next/link";
import {
  IconArrowUpRight,
  IconBeach,
  IconBed,
  IconChartBar,
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
import { getGuides, getHomepageMiniRankingBusinesses } from "@/lib/repository";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { methodologyPath } from "@/lib/methodology";
import { getEditorialImageForCategory, getEditorialImageForGuide } from "@/lib/unsplash";
import { siteConfig } from "@/config/site";
import type { Business } from "@/types/business";

const categoryIcons: Partial<Record<CategorySlug, typeof IconToolsKitchen2>> = {
  restaurants: IconToolsKitchen2,
  hotels: IconBed,
  "beach-clubs": IconUmbrella,
  boats: IconSailboat,
  activities: IconMountain,
  beaches: IconBeach
} as const;

const methodologyItems = [
  {
    Icon: IconChartBar,
    title: "El consenso, no una opinión",
    text: "Cada posición refleja lo que han valorado cientos o miles de personas reales. No un blog, no publicidad — la experiencia colectiva de quienes han estado allí."
  },
  {
    Icon: IconDiamond,
    title: "Lo mejor antes de que todo el mundo lo sepa",
    text: "El Untapped Score detecta negocios con valoración alta que todavía no están masificados. Excelentes según los datos, pero sin cola en la puerta."
  },
  {
    Icon: IconPencil,
    title: "Guías para planificar",
    text: "Las guías ayudan a elegir zona, ruta o tipo de experiencia — pero nunca cambian la posición de ningún negocio en rankings."
  }
] as const;

function businessHref(locale: Locale, business: Business) {
  return `/${locale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`;
}

function businessLocation(business: Business) {
  return business.city || business.area || "Mallorca";
}

function RankingItem({ business, index, locale, highlight = false }: { business: Business; index: number; locale: Locale; highlight?: boolean }) {
  if (highlight) {
    return (
      <Link href={businessHref(locale, business)} className="mb-3 flex min-h-[136px] flex-col justify-between rounded-lg bg-[linear-gradient(135deg,#17324E_0%,#0E5F66_58%,#0E8F72_100%)] p-4 text-white shadow-[0_14px_28px_rgba(14,95,102,0.16)]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#FFD166]">#1 ahora</p>
            <IconArrowUpRight size={16} stroke={2} />
          </div>
          <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight">{getBusinessPublicName(business)}</h3>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RatingBadge rating={business.rating} reviewsCount={business.reviewsCount} compact />
          <span className="inline-flex items-center gap-1 text-[11px] text-white/75">
            <IconMapPin size={13} stroke={1.8} />
            {businessLocation(business)}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={businessHref(locale, business)} className="grid min-h-[66px] grid-cols-[2rem_1fr] items-center gap-3 rounded-md px-2 py-3 hover:bg-[#FFF8EC] sm:grid-cols-[2rem_1fr_auto]">
      <span className="text-xl font-black leading-none text-borderline">#{index + 1}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-ink">{getBusinessPublicName(business)}</span>
        <span className="mt-1 flex items-center gap-1 text-[11px] text-sage">
          <IconMapPin size={13} stroke={1.8} />
          <span className="truncate">{businessLocation(business)}</span>
        </span>
      </span>
      <span className="col-start-2 sm:col-start-auto">
        <RatingBadge rating={business.rating} reviewsCount={business.reviewsCount} compact />
      </span>
    </Link>
  );
}

function CategoryRankingCard({ category, businesses, locale }: { category: CategorySlug; businesses: Business[]; locale: Locale }) {
  const Icon = categoryIcons[category] ?? IconChartBar;
  const top = businesses[0];
  const label = categoryConfigs[category].label;

  return (
    <section className="flex h-full min-h-[420px] flex-col rounded-lg border border-borderline bg-white p-5 shadow-[0_16px_40px_rgba(27,46,75,0.04)]">
      <div className="mb-5 flex min-h-[86px] items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#F0FDF4] text-[#0E8F72]">
            <Icon size={20} stroke={1.8} />
          </div>
          <h2 className="mt-3 line-clamp-1 text-2xl font-black leading-tight text-ink">{label}</h2>
        </div>
        <Link href={`/${locale}/top/${category}`} className="shrink-0 rounded-md border border-borderline px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-ink hover:border-[#0E8F72] hover:text-[#0E8F72]" aria-label={`Ver ranking de ${label}`}>
          Ver ranking
        </Link>
      </div>

      {top && <RankingItem business={top} index={0} locale={locale} highlight />}

      <div className="mt-auto divide-y divide-borderline">
        {businesses.slice(1, 4).map((business, index) => (
          <RankingItem key={business.id} business={business} index={index + 1} locale={locale} />
        ))}
      </div>
    </section>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  return generateSeoMetadata({
    title: `${siteConfig.name} | La guía verificada de Mallorca`,
    description: "Restaurantes, hoteles, beach clubs, barcos, actividades y playas en Mallorca verificados con datos reales de Google y selección propia.",
    path: `/${safeLocale}`,
    locale: safeLocale
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const [latestGuides, restaurantsPalma, hotels, beachClubs, boats, activities, beaches, heroImage] = await Promise.all([
    getGuides(safeLocale, 4),
    getHomepageMiniRankingBusinesses("restaurants", 4, "Palma"),
    getHomepageMiniRankingBusinesses("hotels", 4),
    getHomepageMiniRankingBusinesses("beach-clubs", 4),
    getHomepageMiniRankingBusinesses("boats", 4),
    getHomepageMiniRankingBusinesses("activities", 4),
    getHomepageMiniRankingBusinesses("beaches", 4),
    getEditorialImageForCategory("beach")
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
      <section className="relative overflow-hidden px-4 pb-12 pt-14 text-white sm:px-6 lg:px-8">
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
              Mallorca · Actualizado a diario · Sin posiciones de pago
            </div>
            <h1 className="font-display text-balance text-4xl font-black leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Encuentra los mejores negocios de Mallorca
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
              Rankings basados en el consenso de miles de reseñas reales de Google. No la opinión de nadie en concreto — lo que reflejan es la experiencia colectiva de quienes han estado allí. Sin publicidad, sin posiciones de pago.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={`/${safeLocale}/rankings`} className="inline-flex min-h-12 items-center justify-center rounded-md bg-coral px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-coral/90">
                Explorar rankings
              </Link>
              <Link href={`/${safeLocale}/guides`} className="inline-flex min-h-12 items-center justify-center rounded-md border-2 border-white/60 px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:border-white hover:bg-white hover:text-ink">
                Ver guías
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { value: "1.648", label: "negocios verificados" },
              { value: "1,7M+", label: "reseñas analizadas en Google" },
              { value: "18", label: "categorías activas" }
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-white/12 bg-white/10 px-5 py-5 shadow-[0_18px_45px_rgba(0,0,0,0.12)] backdrop-blur">
                <div className="font-display text-4xl font-black leading-none text-[#FFD166]">{stat.value}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/78">
            {["Actualizado a diario", "Sin posiciones de pago", "Consenso real, no una opinión", "Metodología pública"].map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><IconCircleCheckFilled size={14} />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {(Object.entries(categoryConfigs) as [CategorySlug, (typeof categoryConfigs)[CategorySlug]][]).map(([slug, config]) => (
            <Link
              key={slug}
              href={`/${safeLocale}/rankings?category=${slug}`}
              className="shrink-0 whitespace-nowrap rounded-full border border-[#E7DED0] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink transition-all duration-150 hover:border-ink hover:bg-ink hover:text-white"
            >
              {config.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-7 max-w-3xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">Selección verificada</p>
          <h2 className="font-display mt-2 text-3xl font-black text-ink sm:text-4xl">Los más valorados esta semana</h2>
          <p className="mt-3 text-sm leading-7 text-sage">
            Cada categoría tiene su propio ranking para que no se mezclen hoteles, calas, restaurantes y experiencias que no compiten entre sí.
          </p>
        </div>
        <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categoryRankings.map((ranking) => (
            <CategoryRankingCard key={ranking.category} category={ranking.category} businesses={ranking.businesses} locale={safeLocale} />
          ))}
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-stretch gap-5 md:grid-cols-3">
          {methodologyItems.map(({ Icon, title, text }) => (
            <div key={title} className="flex h-full min-h-[154px] flex-col rounded-lg border border-[#E7DED0] bg-white/75 p-5 shadow-[0_16px_38px_rgba(27,46,75,0.035)]">
              <Icon size={24} stroke={1.8} className="text-[#0E8F72]" />
              <h2 className="mt-4 text-xl font-bold leading-tight text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-sage">{text}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-5 max-w-7xl">
          <Link href={methodologyPath(safeLocale)} className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink hover:text-[#0E8F72]">
            Leer metodología completa →
          </Link>
        </div>
      </section>

      {latestGuides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 pb-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0E8F72]">Guías editoriales</p>
            <h2 className="font-display mt-2 text-3xl font-black text-ink">Planifica tu viaje</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-sage">
              Artículos prácticos para elegir zona, ruta, restaurante, hotel, barco o cala con más contexto antes de reservar.
            </p>
          </div>
          <div className="grid items-stretch gap-px overflow-hidden rounded-lg border border-[#E7DED0] bg-[#E7DED0] shadow-[0_18px_45px_rgba(27,46,75,0.04)] md:grid-cols-2">
            {latestGuides.map((guide, index) => (
              <GuideCard key={guide.id} guide={guide} locale={safeLocale} editorialImage={guideImages[index]} />
            ))}
          </div>
        </section>
      )}

      <section className="px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#F1D3A2] bg-white/80 px-5 py-10 shadow-[0_18px_45px_rgba(27,46,75,0.04)]">
          <h2 className="text-3xl font-bold text-ink">¿Tu negocio está en Mallorca Verified?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-olive">
            Comprueba cómo aparece en rankings objetivos y qué señales influyen en su visibilidad. Si quieres una ficha más completa, podemos valorar una colaboración para trabajar datos, fotos, servicios, carta o enlaces oficiales.
          </p>
          <Link href={`/${safeLocale}/business`} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-sm bg-[#1B2E4B] px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">
            Solicitar propuesta
          </Link>
        </div>
      </section>
    </main>
  );
}
