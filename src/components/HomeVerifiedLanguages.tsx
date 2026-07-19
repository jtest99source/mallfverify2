import Link from "next/link";
import { IconWorld, IconArrowUpRight, IconMapPin } from "@tabler/icons-react";
import type { Business } from "@/types/business";
import type { Locale } from "@/lib/i18n";
import { getCategorySlugFromBusiness } from "@/lib/data";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { BusinessImage } from "@/components/BusinessImage";
import { LanguageBadge } from "@/components/LanguageBadge";

const copy = {
  es: {
    eyebrow: "El diferenciador de Mallorca Verified",
    title: "Confirmado: te atienden en tu idioma",
    subtitle: "Contactamos directamente con cada negocio y confirmamos en qué idiomas atienden. Es su propia palabra, no una suposición nuestra.",
    cta: "Ver profesionales que hablan inglés",
    place: "en"
  },
  en: {
    eyebrow: "The Mallorca Verified difference",
    title: "Confirmed to serve you in your language",
    subtitle: "We contact each business directly and confirm which languages they work in. It's their own word, not our guess.",
    cta: "See English-speaking professionals",
    place: "in"
  },
  de: {
    eyebrow: "Der Mallorca-Verified-Unterschied",
    title: "Bestätigt: Service in deiner Sprache",
    subtitle: "Wir kontaktieren jeden Betrieb direkt und bestätigen, in welchen Sprachen er arbeitet. Es ist seine eigene Aussage, nicht unsere Vermutung.",
    cta: "Englischsprachige Fachleute ansehen",
    place: "in"
  }
} as const;

export function HomeVerifiedLanguages({ businesses, locale }: { businesses: Business[]; locale: Locale }) {
  if (!businesses.length) return null;
  const c = copy[locale];
  const items = businesses.slice(0, 8);

  return (
    <section className="border-b border-white/[0.08] bg-[#040D1A] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-[1360px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#00C37A]">
              <IconWorld size={15} stroke={2} /> {c.eyebrow}
            </p>
            <h2 className="font-display mt-3 text-4xl font-black leading-[0.96] text-white sm:text-5xl">{c.title}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">{c.subtitle}</p>
          </div>
          <Link
            href={`/${locale}/top/dentists?lang=en`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-sm bg-[#00C37A] px-5 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition hover:bg-white"
          >
            {c.cta} <IconArrowUpRight size={15} stroke={2.2} />
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((business) => (
            <Link
              key={business.id}
              href={`/${locale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-white/[0.10] bg-[#0C1A2E] transition-all duration-200 hover:-translate-y-1 hover:border-[#00C37A]/40"
            >
              <div className="relative h-32 overflow-hidden">
                <BusinessImage business={business} category={business.category} variant="card" className="h-full min-h-[128px] rounded-none p-0" />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-white/50">
                  <IconMapPin size={12} stroke={2} className="text-[#00C37A]" />
                  {business.city || business.area || "Mallorca"}
                </p>
                <h3 className="line-clamp-2 text-base font-bold leading-tight text-white">{getBusinessPublicName(business)}</h3>
                <div className="mt-auto pt-1">
                  <LanguageBadge business={business} locale={locale} variant="compact" tone="dark" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
