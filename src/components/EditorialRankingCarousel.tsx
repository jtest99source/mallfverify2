import Link from "next/link";
import { IconArrowUpRight, IconMapPin } from "@tabler/icons-react";
import { BusinessImage } from "@/components/BusinessImage";
import { RatingBadge } from "@/components/RatingBadge";
import { MvScoreBadge } from "@/components/MvScoreBadge";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { getCategorySlugFromBusiness } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import type { Business } from "@/types/business";

// Shared editorial ranking carousel used by the homepage (leisure) and the
// /services hub. Keep it in one place so both surfaces stay in sync.

function businessHref(locale: Locale, business: Business) {
  return `/${locale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`;
}

function businessLocation(business: Business) {
  return business.city || business.area || "Mallorca";
}

function CarouselBusinessCard({ business, locale }: { business: Business; locale: Locale }) {
  return (
    <Link href={businessHref(locale, business)} className="group block w-[78vw] max-w-[330px] shrink-0 snap-start overflow-hidden bg-[#0C1A2E] ring-1 ring-white/[0.08] transition-all duration-200 hover:bg-[#0C1A2E] sm:w-[310px]">
      <BusinessImage business={business} category={business.category} variant="card" className="h-[200px] min-h-[200px] rounded-none p-3">
        <div className="flex h-full flex-col justify-between">
          <span className="inline-flex self-start items-center bg-[#00C37A] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">{locale === "de" ? "Empfohlen" : locale === "en" ? "Featured" : "Destacado"}</span>
          <div>
            <p className="inline-flex items-center gap-1 bg-[#07101F]/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/75 backdrop-blur">
              <IconMapPin size={12} stroke={2} />
              {businessLocation(business)}
            </p>
          </div>
        </div>
      </BusinessImage>
      <div className="p-4">
        <div className="mb-3 flex min-h-6 items-center gap-2">
          <MvScoreBadge rating={business.rating} reviewsCount={business.reviewsCount} locale={locale} />
          <RatingBadge rating={business.rating} reviewsCount={business.reviewsCount} locale={locale} compact />
        </div>
        <h3 className="font-display line-clamp-2 text-xl font-bold leading-tight text-white">{getBusinessPublicName(business)}</h3>
        <div className="mt-4 border-t border-white/[0.08] pt-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#00C37A]/75 transition-colors group-hover:text-[#00C37A]">
          {locale === "de" ? "Ansehen" : locale === "en" ? "View details" : "Ver ficha"}
          <IconArrowUpRight size={13} stroke={2} className="ml-1 inline" />
        </div>
      </div>
    </Link>
  );
}

export function EditorialRankingCarousel({
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
          {businesses.slice(0, 5).map((business) => (
            <CarouselBusinessCard key={business.id} business={business} locale={locale} />
          ))}
          <Link href={href} className="group flex w-[120px] shrink-0 snap-start flex-col items-center justify-center gap-3 rounded-sm border border-white/[0.08] bg-white/[0.02] text-center transition-all hover:border-[#00C37A]/40 hover:bg-white/[0.05]">
            <span className="text-2xl text-[#00C37A] transition-transform duration-200 group-hover:translate-x-1">→</span>
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/40 group-hover:text-[#00C37A]">
              {locale === "de" ? "Alle" : locale === "en" ? "View all" : "Ver todos"}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
