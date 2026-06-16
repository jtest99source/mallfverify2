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
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div>
          <p className="font-display text-2xl font-bold tracking-tight text-[#FFD166]">{siteConfig.name}</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/70">{copy.footer.description}</p>
          <p className="mt-5 text-sm text-white/60">
            {copy.footer.contact}: <a href={`mailto:${siteConfig.contactEmail}`} className="text-[#FFD166] hover:text-white">{siteConfig.contactEmail}</a>
          </p>
          <p className="mt-6 text-xs text-white/35">© {new Date().getFullYear()} Mallorca Verified</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD166]">{copy.footer.categories}</p>
            <div className="grid gap-2.5 text-[12px] font-medium text-white/65">
              {footerCategories.map((slug) => (
                <Link key={slug} href={`/${locale}/rankings?category=${slug}`} className="hover:text-white">{getCategoryCopy(slug, locale).label}</Link>
              ))}
              <Link href={`/${locale}/rankings`} className="mt-1 font-bold text-[#FFD166]/80 hover:text-[#FFD166]">{copy.footer.allCategories} →</Link>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#FFD166]">{copy.footer.site}</p>
            <div className="grid gap-2.5 text-[12px] font-medium text-white/65">
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
