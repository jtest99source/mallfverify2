import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { siteConfig } from "@/config/site";
import { methodologyPath } from "@/lib/methodology";
import type { CategorySlug } from "@/lib/data";

const footerCategories: CategorySlug[] = ["restaurants", "hotels", "beach-clubs", "boats", "activities", "beaches", "bars", "spas"];

export function Footer({ locale }: { locale: Locale }) {
  const copy = t(locale);

  return (
    <footer className="border-t border-[#F1D3A2] bg-[#10253D] text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="text-center md:text-left">
          <p className="font-display text-lg font-bold tracking-tight text-[#FFD166] sm:text-2xl">{siteConfig.name}</p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/70 sm:mt-4 sm:line-clamp-none sm:leading-7">{copy.footer.description}</p>
          <a href={`mailto:${siteConfig.contactEmail}`} className="mt-3 inline-block text-sm text-[#FFD166]/80 hover:text-[#FFD166] sm:mt-4">{siteConfig.contactEmail}</a>
          <p className="mt-2 text-xs text-white/35 sm:mt-5">© {new Date().getFullYear()} Mallorca Verified</p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:gap-8">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD166] sm:mb-4">{copy.footer.categories}</p>
            <div className="grid gap-2 text-[12px] font-medium text-white/65 sm:gap-2.5">
              {footerCategories.map((slug) => (
                <Link key={slug} href={`/${locale}/rankings?category=${slug}`} className="hover:text-white">{getCategoryCopy(slug, locale).label}</Link>
              ))}
              <Link href={`/${locale}/rankings`} className="mt-1 font-bold text-[#FFD166]/80 hover:text-[#FFD166]">{copy.footer.allCategories} →</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD166] sm:mb-4">{copy.footer.site}</p>
            <div className="grid gap-2 text-[12px] font-medium text-white/65 sm:gap-2.5">
              <Link href={`/${locale}/rankings`} className="hover:text-white">Rankings</Link>
              {locale === "es" && <Link href={`/${locale}/guides`} className="hover:text-white">{copy.nav.guides}</Link>}
              <Link href={methodologyPath(locale)} className="hover:text-white">{copy.nav.methodology}</Link>
              <Link href={`/${locale}/business`} className="hover:text-white">{copy.nav.forBusinesses}</Link>
              <Link href={`/${locale}/privacy`} className="hover:text-white">{copy.footer.privacy}</Link>
              <Link href={`/${locale}/cookies`} className="hover:text-white">{copy.footer.cookies}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
