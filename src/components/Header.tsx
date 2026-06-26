"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { IconBook2, IconInfoCircle, IconMenu2, IconShieldCheck, IconX } from "@tabler/icons-react";
import { localeLabel, locales, type Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n-copy";
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
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 text-ink backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <NavLogo locale={locale} />
          <div className="hidden h-10 w-px bg-[#E5E7EB] lg:block" />

          <nav className="hidden items-center gap-2 lg:flex">
            <Link href={`/${locale}/experts`} className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/70 transition-all duration-150 hover:bg-ink hover:text-white">
              <IconShieldCheck size={15} stroke={1.8} />
              {expertsLabel(locale)}
            </Link>
            <div className="mx-1 h-5 w-px bg-[#E5E7EB]" />
            {locale !== "de" && (
              <Link href={`/${locale}/guides`} className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/70 transition-all duration-150 hover:bg-ink hover:text-white">
                <IconBook2 size={15} stroke={1.8} />
                {copy.nav.guides}
              </Link>
            )}
            <Link href={methodologyPath(locale)} className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/70 transition-all duration-150 hover:bg-ink hover:text-white">
              <IconInfoCircle size={15} stroke={1.8} />
              {copy.nav.methodology}
            </Link>
          </nav>

          <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
            <SearchBox locale={locale} variant="navbar" />
            <Link href={`/${locale}/business`} className="rounded-md bg-ink px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0A0A0A]">
              {copy.nav.forBusinesses}
            </Link>
            <div className="flex items-center gap-1 text-[10px]">
              {locales.map((item) => (
                <Link key={item} href={`/${item}`} className={`rounded-md border px-2 py-1 uppercase tracking-[0.08em] transition-all duration-150 ${item === locale ? "border-ink bg-ink text-white" : "border-[#E5E7EB] bg-white text-ink/65 hover:border-ink hover:bg-ink hover:text-white"}`}>
                  {localeLabel(item)}
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-ink lg:hidden"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <IconX size={20} stroke={2} /> : <IconMenu2 size={20} stroke={2} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex h-dvh flex-col bg-white lg:hidden">
          <div className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
            <NavLogo locale={locale} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-ink"
              aria-label="Cerrar menú"
            >
              <IconX size={18} stroke={2} />
            </button>
          </div>
          <div className="shrink-0 border-b border-[#E5E7EB] px-4 py-4">
            <SearchBox locale={locale} variant="nav" />
          </div>
          <nav className="shrink-0 border-b border-[#E5E7EB] px-4 py-3">
            <Link href={`/${locale}/experts`} onClick={() => setMobileOpen(false)} className="group flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-bold text-ink hover:bg-ink hover:text-white">
              <IconShieldCheck size={15} stroke={1.8} className="shrink-0 text-[#0A0A0A] group-hover:text-white" />
              {expertsLabel(locale)}
            </Link>
            {locale !== "de" && (
              <Link href={`/${locale}/guides`} onClick={() => setMobileOpen(false)} className="group flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-bold text-ink hover:bg-ink hover:text-white">
                <IconBook2 size={15} stroke={1.8} className="shrink-0 text-[#0A0A0A] group-hover:text-white" />
                {copy.nav.guides}
              </Link>
            )}
            <Link href={methodologyPath(locale)} onClick={() => setMobileOpen(false)} className="group flex min-h-[44px] items-center gap-3 rounded-md px-3 text-sm font-bold text-ink hover:bg-ink hover:text-white">
              <IconInfoCircle size={15} stroke={1.8} className="shrink-0 text-[#0A0A0A] group-hover:text-white" />
              {copy.nav.methodology}
            </Link>
          </nav>

          <div className="min-h-0 flex-1 px-4 py-5 text-sm leading-6 text-[#6B7280]">
            {homeSearchHint(locale)}
          </div>

          <div className="shrink-0 border-t border-[#E5E7EB] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
            <Link href={`/${locale}/business`} onClick={() => setMobileOpen(false)} className="block rounded-md bg-ink px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0A0A0A]">
              {copy.nav.forBusinesses}
            </Link>
            <div className="mt-3 flex gap-2">
              {locales.map((item) => (
                <Link key={item} href={`/${item}`} onClick={() => setMobileOpen(false)} className={`rounded-md border px-3 py-2 text-[11px] uppercase tracking-[0.08em] transition-all duration-150 ${item === locale ? "border-ink bg-ink text-white" : "border-[#E5E7EB] bg-white text-ink/65 hover:border-ink hover:bg-ink hover:text-white"}`}>
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
