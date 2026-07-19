import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { siteConfig } from "@/config/site";
import { aboutPath, editorialPath, methodologyPath } from "@/lib/methodology";
import { publicCategorySlugs, type CategorySlug } from "@/lib/data";

// Casinos/betting intentionally hidden from the footer — clashes with the trust-directory brand
const footerCategories: CategorySlug[] = publicCategorySlugs.filter((slug) => slug !== "casinos");

export function Footer({ locale }: { locale: Locale }) {
  const copy = t(locale);

  return (
    <footer className="border-t border-[#07101F] bg-[#07101F] text-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-10 sm:px-6 sm:py-12 md:grid-cols-[1.4fr_1fr] lg:px-8">
        <div className="text-center md:text-left">
          <p className="font-display text-lg font-bold tracking-tight text-[#00C37A] sm:text-2xl">{siteConfig.name}</p>
          <p className="mt-3 text-sm leading-6 text-white/60 sm:mt-4 sm:leading-7">{copy.footer.description}</p>
          <a href={`mailto:${siteConfig.contactEmail}`} className="mt-3 inline-block text-sm text-[#00C37A]/80 hover:text-[#00C37A] sm:mt-4">{siteConfig.contactEmail}</a>
          <p className="mt-2 text-xs text-white/60 sm:mt-5">© {new Date().getFullYear()} Mallorca Verified</p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:gap-8">
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#00C37A] sm:mb-4">{copy.footer.categories}</p>
            <div className="grid gap-2 text-[12px] font-medium text-white/60 sm:gap-2.5">
              {footerCategories.map((slug) => (
                <Link key={slug} href={`/${locale}/top/${slug}`} className="hover:text-white">{getCategoryCopy(slug, locale).label}</Link>
              ))}
              <Link href={`/${locale}/top/restaurants`} className="mt-1 font-bold text-[#00C37A]/80 hover:text-[#00C37A]">{copy.footer.allCategories} →</Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.14em] text-[#00C37A] sm:mb-4">{copy.footer.site}</p>
            <div className="grid gap-2 text-[12px] font-medium text-white/60 sm:gap-2.5">
              <Link href={`/${locale}/top/restaurants`} className="hover:text-white">Rankings</Link>
              <Link href={`/${locale}/guides`} className="hover:text-white">{copy.nav.guides}</Link>
              <Link href={`/${locale}/experts`} className="hover:text-white">{locale === "de" ? "Experten" : "Experts"}</Link>
              <Link href={methodologyPath(locale)} className="hover:text-white">{copy.nav.methodology}</Link>
              <Link href={aboutPath(locale)} className="hover:text-white">{copy.footer.about}</Link>
              <Link href={editorialPath(locale)} className="hover:text-white">{copy.footer.editorial}</Link>
              <Link href={`/${locale}/business`} className="hover:text-white">{copy.nav.forBusinesses}</Link>
              <Link href={`/${locale}/insights`} className="hover:text-white">{locale === "es" ? "Informes" : locale === "de" ? "Reports" : "Reports"}</Link>
              <Link href={`/${locale}/privacy`} className="hover:text-white">{copy.footer.privacy}</Link>
              <Link href={`/${locale}/cookies`} className="hover:text-white">{copy.footer.cookies}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
