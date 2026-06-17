"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  IconBook2,
  IconChevronDown,
  IconInfoCircle,
  IconMenu2,
  IconSearch,
  IconX
} from "@tabler/icons-react";
import { localeLabel, locales, type Locale } from "@/lib/i18n";
import { categoryConfigs, categoryGroups, type CategorySlug } from "@/lib/data";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import { methodologyPath } from "@/lib/methodology";
import { siteConfig } from "@/config/site";
import { SearchBox } from "@/components/LiveSearch";

function NavLogo({ locale }: { locale: Locale }) {
  return (
    <Link href={`/${locale}`} className="inline-flex shrink-0 items-center" aria-label={siteConfig.name}>
      <Image
        src="/brand/mallorca-verified-wordmark-test.png"
        alt={siteConfig.name}
        width={1909}
        height={692}
        priority
        className="h-9 w-auto max-w-[126px] object-contain sm:h-10 sm:max-w-[132px]"
      />
    </Link>
  );
}

function categoryHref(locale: Locale, slug: CategorySlug) {
  return `/${locale}/top/${slug}`;
}

export function Header({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const exploreCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearExploreCloseTimer() {
    if (exploreCloseTimer.current) {
      clearTimeout(exploreCloseTimer.current);
      exploreCloseTimer.current = null;
    }
  }

  function openExploreMenu() {
    clearExploreCloseTimer();
    setExploreOpen(true);
  }

  function closeExploreMenuSoon() {
    clearExploreCloseTimer();
    exploreCloseTimer.current = setTimeout(() => {
      setExploreOpen(false);
      exploreCloseTimer.current = null;
    }, 180);
  }

  function toggleExploreMenu() {
    clearExploreCloseTimer();
    setExploreOpen((value) => !value);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-[#E7DED0] bg-[#FFFDF7]/95 text-ink backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <NavLogo locale={locale} />
        <div className="hidden h-10 w-px bg-[#E7DED0] lg:block" />

        <nav className="hidden items-center gap-1 lg:flex">
          <div className="relative" onMouseEnter={openExploreMenu} onMouseLeave={closeExploreMenuSoon}>
            <button
              type="button"
              onClick={toggleExploreMenu}
              aria-expanded={exploreOpen}
              aria-haspopup="menu"
              className={`inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.08em] transition-all duration-150 ${exploreOpen ? "bg-ink text-white" : "text-sage hover:bg-white hover:text-ink"}`}
            >
              <IconSearch size={15} stroke={1.8} />
              {copy.nav.explore}
              <IconChevronDown size={13} stroke={2} className={`transition-transform duration-150 ${exploreOpen ? "rotate-180" : ""}`} />
            </button>
            {exploreOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-[600px] overflow-hidden rounded-xl border border-[#E7DED0] bg-white shadow-[0_24px_60px_rgba(27,46,75,0.18)]">
                <div className="border-b border-[#E7DED0] bg-[#F8FFFE] px-5 py-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0E8F72]">
                    {Object.keys(categoryConfigs).length} {copy.nav.categoriesVerified}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-px bg-[#F4F0E8] p-px">
                  {(Object.keys(categoryConfigs) as CategorySlug[]).map((slug) => (
                    <Link
                      key={slug}
                      href={categoryHref(locale, slug)}
                      onClick={() => setExploreOpen(false)}
                      className="flex items-center gap-2 bg-white px-4 py-3 text-sm font-semibold text-ink transition-all duration-100 hover:bg-[#F0FDF4] hover:text-[#0E8F72]"
                    >
                      {getCategoryCopy(slug, locale).label}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-[#E7DED0] bg-[#FFFDF7] px-5 py-3">
                  <Link href={`/${locale}/rankings`} onClick={() => setExploreOpen(false)} className="text-[10px] font-black uppercase tracking-[0.1em] text-[#0E8F72] hover:text-ink">
                    {copy.nav.allRankings} →
                  </Link>
                  {locale === "es" && (
                    <Link href={`/${locale}/guides`} onClick={() => setExploreOpen(false)} className="text-[10px] font-semibold uppercase tracking-[0.08em] text-sage hover:text-ink">
                      {copy.nav.guides}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {locale === "es" && (
            <Link href={`/${locale}/guides`} className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-sage transition-all duration-150 hover:bg-white hover:text-ink">
              <IconBook2 size={15} stroke={1.8} />
              {copy.nav.guides}
            </Link>
          )}
          <Link href={methodologyPath(locale)} className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-sage transition-all duration-150 hover:bg-white hover:text-ink">
            <IconInfoCircle size={15} stroke={1.8} />
            {copy.nav.methodology}
          </Link>
        </nav>

        <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
          <SearchBox locale={locale} variant="navbar" />
          <Link href={`/${locale}/business`} className="rounded-md bg-ink px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0E8F72]">
            {copy.nav.forBusinesses}
          </Link>
          <div className="flex items-center gap-1 text-[10px]">
            {locales.map((item) => (
              <Link key={item} href={`/${item}`} className={`rounded-md border px-2 py-1 uppercase tracking-[0.08em] transition-all duration-150 ${item === locale ? "border-ink bg-ink text-white" : "border-[#E7DED0] bg-white text-sage hover:border-ink hover:text-ink"}`}>
                {localeLabel(item)}
              </Link>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#E7DED0] bg-white text-ink lg:hidden"
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <IconX size={20} stroke={2} /> : <IconMenu2 size={20} stroke={2} />}
        </button>
      </div>

    </header>

    {mobileOpen && (
        <div className="fixed inset-0 z-50 flex h-dvh flex-col bg-[#FFFDF7] lg:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-[#E7DED0] px-4 py-3">
            <NavLogo locale={locale} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E7DED0] bg-white text-ink"
              aria-label="Cerrar menú"
            >
              <IconX size={18} stroke={2} />
            </button>
          </div>
          <div className="shrink-0 border-b border-[#E7DED0] px-4 py-4">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#0E8F72]">{copy.nav.explore}</p>
            <SearchBox locale={locale} variant="nav" />
          </div>
          <nav className="shrink-0 border-b border-[#E7DED0] px-4 py-3">
            <Link href={`/${locale}/rankings`} onClick={() => setMobileOpen(false)} className="flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-bold text-ink hover:bg-[#F4F0E8]">
              <IconSearch size={15} stroke={1.8} className="shrink-0 text-[#0E8F72]" />
              Rankings
            </Link>
            {locale === "es" && (
              <Link href={`/${locale}/guides`} onClick={() => setMobileOpen(false)} className="flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-bold text-ink hover:bg-[#F4F0E8]">
                <IconBook2 size={15} stroke={1.8} className="shrink-0 text-[#0E8F72]" />
                {copy.nav.guides}
              </Link>
            )}
            <Link href={methodologyPath(locale)} onClick={() => setMobileOpen(false)} className="flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-bold text-ink hover:bg-[#F4F0E8]">
              <IconInfoCircle size={15} stroke={1.8} className="shrink-0 text-[#0E8F72]" />
              {copy.nav.methodology}
            </Link>
          </nav>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-sage">{copy.nav.categoriesVerified}</p>
            {(Object.keys(categoryConfigs) as CategorySlug[]).map((slug) => (
              <Link
                key={slug}
                href={categoryHref(locale, slug)}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[42px] items-center rounded-md px-3 text-sm font-semibold text-ink hover:bg-[#F4F0E8]"
              >
                {getCategoryCopy(slug, locale).label}
              </Link>
            ))}
          </div>
          <div className="shrink-0 border-t border-[#E7DED0] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <Link href={`/${locale}/business`} onClick={() => setMobileOpen(false)} className="block rounded-md bg-ink px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0E8F72]">
              {copy.nav.forBusinesses}
            </Link>
            <div className="mt-3 flex gap-2">
              {locales.map((item) => (
                <Link key={item} href={`/${item}`} onClick={() => setMobileOpen(false)} className={`rounded-md border px-3 py-2 text-[11px] uppercase tracking-[0.08em] transition-all duration-150 ${item === locale ? "border-ink bg-ink text-white" : "border-[#E7DED0] bg-white text-sage hover:border-ink hover:text-ink"}`}>
                  {localeLabel(item)}
                </Link>
              ))}
            </div>
          </div>
        </div>
    )}
    </>
  );
}
