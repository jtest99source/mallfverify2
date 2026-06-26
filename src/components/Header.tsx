"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconBook2, IconInfoCircle, IconMenu2, IconShieldCheck, IconX } from "@tabler/icons-react";
import { localeLabel, locales, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n-copy";
import { methodologyPath } from "@/lib/methodology";
import { siteConfig } from "@/config/site";
import { SearchBox } from "@/components/LiveSearch";

function NavLogo({ locale }: { locale: Locale }) {
  return (
    <Link href={`/${locale}`} className="inline-flex shrink-0 flex-col leading-none text-[#FFCC00]" aria-label={siteConfig.name}>
      <span className="font-display text-[17px] font-black uppercase tracking-[0.05em]">Mallorca</span>
      <span className="font-display text-[17px] font-black uppercase tracking-[0.05em]">Verified</span>
    </Link>
  );
}

function expertsLabel(locale: Locale) {
  return locale === "de" ? "Experten" : "Experts";
}

function homeSearchHint(locale: Locale) {
  if (locale === "de") return "Nutze die Suche auf der Startseite, um Orte nach Kategorie und Gegend zu finden.";
  if (locale === "en") return "Use the homepage search to find places by category and area.";
  return "Usa el buscador de la home para encontrar sitios por categoría y zona.";
}

export function Header({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0A0A0A] text-white shadow-[0_1px_0_rgba(255,255,255,0.04)]">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <NavLogo locale={locale} />

          <nav className="hidden items-center gap-8 lg:flex">
            <Link href={`/${locale}/experts`} className="inline-flex h-9 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45 transition-colors duration-150 hover:text-white">
              {expertsLabel(locale)}
            </Link>
            {locale !== "de" && (
              <Link href={`/${locale}/guides`} className="inline-flex h-9 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45 transition-colors duration-150 hover:text-white">
                {copy.nav.guides}
              </Link>
            )}
            <Link href={methodologyPath(locale)} className="inline-flex h-9 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/45 transition-colors duration-150 hover:text-white">
              {copy.nav.methodology}
            </Link>
          </nav>

          <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
            <Link href={`/${locale}/business`} className="rounded-sm bg-[#FFCC00] px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-all duration-150 hover:bg-white">
              {copy.nav.forBusinesses}
            </Link>
            <div className="flex items-center gap-1 text-[10px]">
              {locales.map((item) => (
                <Link key={item} href={`/${item}`} className={`rounded-sm border px-2 py-1 uppercase tracking-[0.08em] transition-all duration-150 ${item === locale ? "border-white/15 bg-white/[0.08] text-white" : "border-white/[0.08] text-white/35 hover:border-white/25 hover:text-white"}`}>
                  {localeLabel(item)}
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/[0.12] bg-white/[0.06] text-white lg:hidden"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <IconX size={20} stroke={2} /> : <IconMenu2 size={20} stroke={2} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex h-dvh flex-col bg-[#0A0A0A] text-white lg:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3">
            <NavLogo locale={locale} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-white/[0.12] bg-white/[0.06] text-white"
              aria-label="Cerrar menú"
            >
              <IconX size={18} stroke={2} />
            </button>
          </div>
          <div className="shrink-0 border-b border-white/[0.08] px-4 py-4">
            <SearchBox locale={locale} variant="nav" />
          </div>
          <nav className="shrink-0 border-b border-white/[0.08] px-4 py-3">
            <Link href={`/${locale}/experts`} onClick={() => setMobileOpen(false)} className="group flex min-h-[44px] items-center gap-3 rounded-sm px-3 text-sm font-bold text-white/75 hover:bg-white/[0.08] hover:text-white">
              <IconShieldCheck size={15} stroke={1.8} className="shrink-0 text-[#FFCC00]" />
              {expertsLabel(locale)}
            </Link>
            {locale !== "de" && (
              <Link href={`/${locale}/guides`} onClick={() => setMobileOpen(false)} className="group flex min-h-[44px] items-center gap-3 rounded-sm px-3 text-sm font-bold text-white/75 hover:bg-white/[0.08] hover:text-white">
                <IconBook2 size={15} stroke={1.8} className="shrink-0 text-[#FFCC00]" />
                {copy.nav.guides}
              </Link>
            )}
            <Link href={methodologyPath(locale)} onClick={() => setMobileOpen(false)} className="group flex min-h-[44px] items-center gap-3 rounded-sm px-3 text-sm font-bold text-white/75 hover:bg-white/[0.08] hover:text-white">
              <IconInfoCircle size={15} stroke={1.8} className="shrink-0 text-[#FFCC00]" />
              {copy.nav.methodology}
            </Link>
          </nav>

          <div className="min-h-0 flex-1 px-4 py-5 text-sm leading-6 text-white/45">
            {homeSearchHint(locale)}
          </div>

          <div className="shrink-0 border-t border-white/[0.08] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <Link href={`/${locale}/business`} onClick={() => setMobileOpen(false)} className="block rounded-sm bg-[#FFCC00] px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-all duration-150 hover:bg-white">
              {copy.nav.forBusinesses}
            </Link>
            <div className="mt-3 flex gap-2">
              {locales.map((item) => (
                <Link key={item} href={`/${item}`} onClick={() => setMobileOpen(false)} className={`rounded-sm border px-3 py-2 text-[11px] uppercase tracking-[0.08em] transition-all duration-150 ${item === locale ? "border-white/15 bg-white/[0.08] text-white" : "border-white/[0.08] text-white/35 hover:border-white/25 hover:text-white"}`}>
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
