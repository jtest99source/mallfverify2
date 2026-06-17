"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";
import type { Business } from "@/types/business";
import type { Locale } from "@/lib/i18n";
import type { CategorySlug } from "@/lib/data";
import { t } from "@/lib/i18n-copy";
import { BusinessCard } from "@/components/BusinessCard";
import { businessMatchesFacet, type RankingFacet } from "@/lib/taxonomy";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";

type FacetWithCount = RankingFacet & { count: number };
type SortKey = "ratio" | "reviews" | "rating" | "hidden";

const ALL = "all";
const PAGE_SIZE = 24;

const loadMoreCopy = {
  es: {
    loadMore: "Cargar más",
    clearFilters: "Limpiar filtros",
    showing: (shown: string, total: string) => `Mostrando ${shown} de ${total}`
  },
  en: {
    loadMore: "Load more",
    clearFilters: "Clear filters",
    showing: (shown: string, total: string) => `Showing ${shown} of ${total}`
  },
  de: {
    loadMore: "Mehr laden",
    clearFilters: "Filter zuruecksetzen",
    showing: (shown: string, total: string) => `${shown} von ${total} angezeigt`
  }
} as const;

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function businessPlace(business: Business) {
  return business.city || business.area || business.municipality || "Mallorca";
}

function ratioScore(business: Business) {
  return (business.rating ?? 0) * Math.log((business.reviewsCount ?? 0) + 1);
}

function sortBusinesses(businesses: Business[], sort: SortKey) {
  return businesses.slice().sort((a, b) => {
    if (sort === "reviews") return (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
    if (sort === "rating") {
      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
      return ratingDiff || (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
    }
    if (sort === "hidden") {
      const hiddenDiff = (b.untappedScore ?? 0) - (a.untappedScore ?? 0);
      return hiddenDiff || ratioScore(b) - ratioScore(a);
    }
    return ratioScore(b) - ratioScore(a) || (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
  });
}

export function TopRankingExplorer({
  businesses,
  locale,
  category: _category,
  facets
}: {
  businesses: Business[];
  locale: Locale;
  category: CategorySlug;
  facets: FacetWithCount[];
}) {
  const copy = t(locale);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [sort, setSort] = useState<SortKey>((searchParams.get("sort") as SortKey) || "ratio");
  const [facetSlug, setFacetSlug] = useState(searchParams.get("type") ?? ALL);
  const [place, setPlace] = useState(searchParams.get("area") ?? ALL);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sortOptions: Array<{ value: SortKey; label: string }> = [
    { value: "ratio", label: copy.filters.sort.ratio },
    { value: "rating", label: copy.filters.sort.rating },
    { value: "reviews", label: copy.filters.sort.reviews },
    { value: "hidden", label: copy.filters.sort.hidden }
  ];

  const places = useMemo(() => {
    return Array.from(new Set(businesses.map(businessPlace).filter(Boolean))).sort((a, b) => a.localeCompare(b, locale));
  }, [businesses, locale]);

  const selectedFacet = facetSlug === ALL ? null : facets.find((facet) => facet.slug === facetSlug) ?? null;

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setSort((searchParams.get("sort") as SortKey) || "ratio");
    setFacetSlug(searchParams.get("type") ?? ALL);
    setPlace(searchParams.get("area") ?? ALL);
  }, [searchParams]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const isDefault = value === ALL || (key === "sort" && value === "ratio") || !value.trim();
    if (isDefault) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    const matches = businesses.filter((business) => {
      const searchable = normalizeText(
        [
          getBusinessPublicName(business),
          businessPlace(business),
          business.shortDescription,
          business.description,
          business.rating,
          business.reviewsCount
        ]
          .filter(Boolean)
          .join(" ")
      );

      return (
        (place === ALL || businessPlace(business) === place) &&
        (!selectedFacet || businessMatchesFacet(business, selectedFacet)) &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      );
    });

    return sortBusinesses(matches, sort);
  }, [businesses, place, query, selectedFacet, sort]);
  const visibleBusinesses = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const shownCount = Math.min(visibleCount, filtered.length).toLocaleString(numberLocale(locale));
  const totalCount = filtered.length.toLocaleString(numberLocale(locale));
  const loadCopy = loadMoreCopy[locale];

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [facetSlug, place, query, sort]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="relative mb-3">
        <IconSearch size={16} stroke={1.8} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage" />
        <input
          value={query}
          onChange={(event) => updateParam("q", event.target.value)}
          placeholder={copy.filters.searchPlaceholder}
          className="h-12 w-full rounded-lg border border-[#E7DED0] bg-white pl-11 pr-4 text-sm text-ink shadow-sm focus:border-[#0E8F72] focus:outline-none focus:ring-1 focus:ring-[#0E8F72]"
        />
      </div>
      {/* Mobile filters: sort chips + compact 2-col dropdowns */}
      <div className="sm:hidden">
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateParam("sort", option.value)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.06em] transition-colors ${
                sort === option.value
                  ? "bg-ink text-white"
                  : "border border-[#E7DED0] bg-white text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <select value={facetSlug} onChange={(event) => updateParam("type", event.target.value)} className="h-10 rounded-md border border-[#E7DED0] bg-[#FFFDF7] px-2 text-xs text-ink focus:border-[#0E8F72] focus:ring-[#0E8F72]">
            <option value={ALL}>{copy.filters.type}: {copy.filters.all}</option>
            {facets.map((facet) => (
              <option key={facet.slug} value={facet.slug}>{facet.label} ({facet.count})</option>
            ))}
          </select>
          <select value={place} onChange={(event) => updateParam("area", event.target.value)} className="h-10 rounded-md border border-[#E7DED0] bg-[#FFFDF7] px-2 text-xs text-ink focus:border-[#0E8F72] focus:ring-[#0E8F72]">
            <option value={ALL}>{copy.filters.place}: {copy.filters.allPlaces}</option>
            {places.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-sage">
          {filtered.length.toLocaleString(numberLocale(locale))} {copy.filters.results}
        </p>
      </div>

      {/* Desktop filters: existing 3-col grid */}
      <div className="hidden rounded-lg border border-[#E7DED0] bg-white/85 p-4 shadow-[0_18px_45px_rgba(27,46,75,0.035)] sm:block">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sage">
            {copy.filters.sortBy}
            <select value={sort} onChange={(event) => updateParam("sort", event.target.value)} className="h-11 rounded-sm border-[#E7DED0] bg-[#FFFDF7] text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0E8F72] focus:ring-[#0E8F72]">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sage">
            {copy.filters.type}
            <select value={facetSlug} onChange={(event) => updateParam("type", event.target.value)} className="h-11 rounded-sm border-[#E7DED0] bg-[#FFFDF7] text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0E8F72] focus:ring-[#0E8F72]">
              <option value={ALL}>{copy.filters.all}</option>
              {facets.map((facet) => (
                <option key={facet.slug} value={facet.slug}>{facet.label} ({facet.count})</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sage">
            {copy.filters.place}
            <select value={place} onChange={(event) => updateParam("area", event.target.value)} className="h-11 rounded-sm border-[#E7DED0] bg-[#FFFDF7] text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0E8F72] focus:ring-[#0E8F72]">
              <option value={ALL}>{copy.filters.allPlaces}</option>
              {places.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-sage sm:pb-3">
            {filtered.length.toLocaleString(numberLocale(locale))} {copy.filters.results}
          </div>
        </div>
      </div>

      <ol className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleBusinesses.map((business, index) => (
          <li key={business.id} className="relative h-full">
            <div className="absolute left-3 top-3 z-10 rounded-sm bg-ink px-3 py-1 text-xs font-bold text-white">#{index + 1}</div>
            <BusinessCard business={business} locale={locale} />
          </li>
        ))}
      </ol>

      {filtered.length > PAGE_SIZE && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-sage">{loadCopy.showing(shownCount, totalCount)}</p>
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((value) => Math.min(value + PAGE_SIZE, filtered.length))}
              className="min-h-11 rounded-md border border-[#E7DED0] bg-white px-6 text-[11px] font-bold uppercase tracking-[0.1em] text-ink shadow-sm transition hover:border-[#0E8F72] hover:text-[#0E8F72]"
            >
              {loadCopy.loadMore}
            </button>
          )}
        </div>
      )}

      {!filtered.length && (
        <div className="mt-6 rounded-lg border border-[#E7DED0] bg-white/85 p-5 text-sm text-olive sm:mt-8 sm:p-6">
          <p>{copy.filters.noResults}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 min-h-10 rounded-md border border-[#E7DED0] bg-white px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-ink transition hover:border-[#0E8F72] hover:text-[#0E8F72]"
          >
            {loadCopy.clearFilters}
          </button>
        </div>
      )}
    </section>
  );
}
