"use client";

import { useMemo, useState } from "react";
import { BusinessCard } from "@/components/BusinessCard";
import type { Locale } from "@/lib/i18n";
import type { Business } from "@/types/business";

const PAGE_SIZE = 24;

const copy = {
  es: {
    loadMore: "Cargar más",
    showing: (shown: string, total: string) => `Mostrando ${shown} de ${total}`
  },
  en: {
    loadMore: "Load more",
    showing: (shown: string, total: string) => `Showing ${shown} of ${total}`
  },
  de: {
    loadMore: "Mehr laden",
    showing: (shown: string, total: string) => `${shown} von ${total} angezeigt`
  }
} as const;

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

export function LoadMoreBusinessGrid({
  businesses,
  locale,
  ordered = false
}: {
  businesses: Business[];
  locale: Locale;
  ordered?: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleBusinesses = useMemo(() => businesses.slice(0, visibleCount), [businesses, visibleCount]);
  const hasMore = visibleCount < businesses.length;
  const c = copy[locale];
  const shown = Math.min(visibleCount, businesses.length).toLocaleString(numberLocale(locale));
  const total = businesses.length.toLocaleString(numberLocale(locale));

  const grid = (
    <>
      {visibleBusinesses.map((business, index) => (
        <li key={business.id} className="relative h-full list-none">
          {ordered && <div className="absolute left-3 top-3 z-10 rounded-sm bg-ink px-3 py-1 text-xs font-bold text-white">#{index + 1}</div>}
          <BusinessCard business={business} locale={locale} />
        </li>
      ))}
    </>
  );

  return (
    <div>
      {ordered ? (
        <ol className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{grid}</ol>
      ) : (
        <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{grid}</ul>
      )}

      {businesses.length > PAGE_SIZE && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-sage">{c.showing(shown, total)}</p>
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((value) => Math.min(value + PAGE_SIZE, businesses.length))}
              className="min-h-11 rounded-md border border-[#E7DED0] bg-white px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-ink shadow-sm transition hover:border-[#0E8F72] hover:text-[#0E8F72]"
            >
              {c.loadMore}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
