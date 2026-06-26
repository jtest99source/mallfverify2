"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconArrowUpRight, IconInfoCircle, IconMapPin, IconSearch } from "@tabler/icons-react";
import type { Business } from "@/types/business";
import type { Locale } from "@/lib/i18n";
import type { CategorySlug } from "@/lib/data";
import { getCategorySlugFromBusiness } from "@/lib/data";
import { t, getCategoryCopy } from "@/lib/i18n-copy";
import { methodologyPath } from "@/lib/methodology";
import { BusinessImage } from "@/components/BusinessImage";
import { RatingBadge } from "@/components/RatingBadge";
import { businessMatchesFacet, getLocalizedFacetLabel, type RankingFacet } from "@/lib/taxonomy";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";

type FacetWithCount = RankingFacet & { count: number };
type SortKey = "ratio" | "reviews" | "rating" | "hidden";


const ALL = "all";
const PAGE_SIZE = 24;
const CAPPED_RESULT_THRESHOLD = 1000;
const SHOW_TYPE_FILTER = false;

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

const sortHelpCopy = {
  es: {
    title: "Por qué este orden",
    text: "Mejor equilibrio combina valoración y volumen de reseñas para que un 5,0 con muy pocas opiniones no pase por delante de un sitio más probado.",
    link: "Ver metodología"
  },
  en: {
    title: "Why this order",
    text: "Best overall balances rating and review volume, so a tiny 5.0 does not outrank a broadly trusted place by default.",
    link: "Read methodology"
  },
  de: {
    title: "Warum diese Reihenfolge",
    text: "Beste Gesamtwertung kombiniert Bewertung und Anzahl der Rezensionen, damit kleine 5,0-Profile nicht automatisch vor bewährten Orten stehen.",
    link: "Methodik lesen"
  }
} as const;

const placeholderDescriptionPattern =
  /(Google Places|datos de Google|importad[oa] desde Google|pendiente de revisi[oó]n|revision editorial|revisi[oó]n editorial|perfil encaja)/i;

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

function compactAddress(address?: string) {
  if (!address) return null;
  return address
    .replace(/\s*,?\s*(Illes Balears|Islas Baleares|Balearic Islands|Spain|España)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function summaryFor(business: Business) {
  const text = business.editorialDescription || business.aiDescription || business.shortDescription || business.description;
  if (!text) return null;
  const cleaned = text.replace(/\s+/g, " ").trim();
  return placeholderDescriptionPattern.test(cleaned) ? null : cleaned;
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

function RankingBusinessRow({
  business,
  rank,
  locale,
  showCategory
}: {
  business: Business;
  rank: number;
  locale: Locale;
  showCategory: boolean;
}) {
  const categorySlug = getCategorySlugFromBusiness(business.category);
  const categoryLabel = categorySlug ? getCategoryCopy(categorySlug, locale).label : null;
  const address = compactAddress(business.address);
  const summary = summaryFor(business);

  return (
    <article className="group overflow-hidden rounded-lg border border-[#0A0A0A] bg-white shadow-[0_14px_34px_rgba(10,10,10,0.08)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(10,10,10,0.14)]">
      <Link href={`/${locale}/${categorySlug}/${business.slug}`} className="grid min-h-[134px] grid-cols-[42px_minmax(0,1fr)] sm:grid-cols-[50px_210px_minmax(0,1fr)] lg:grid-cols-[54px_250px_minmax(0,1fr)]">
        <div className="flex items-start justify-center bg-[#111111] px-2 py-4">
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded bg-[#0A0A0A] px-2 text-[11px] font-black text-white ring-1 ring-white/15">#{rank}</span>
        </div>

        <div className="relative hidden min-h-[134px] overflow-hidden sm:block">
          <BusinessImage business={business} category={business.category} variant="card" className="h-full min-h-[134px] p-0" />
          <div className="absolute right-2 top-2 hidden sm:block">
            <RatingBadge rating={business.rating} reviewsCount={business.reviewsCount} locale={locale} compact />
          </div>
        </div>

        <div className="min-w-0 p-4 sm:p-4 lg:px-5">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {showCategory && categoryLabel && (
              <span className="rounded-full border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#0A0A0A]">
                {categoryLabel}
              </span>
            )}
            <span className="inline-flex min-w-0 items-center gap-1 text-[11px] font-bold text-[#6B7280]">
              <IconMapPin size={13} stroke={2} />
              <span className="truncate">{businessPlace(business)}</span>
            </span>
          </div>

          <h2 className="mt-2 line-clamp-2 text-lg font-black leading-tight text-[#0A0A0A] sm:text-xl">{getBusinessPublicName(business)}</h2>
          {summary && <p className="mt-1.5 hidden max-w-2xl text-sm leading-6 text-[#6B7280] lg:line-clamp-1">{summary}</p>}
          {address && (
            <p className="mt-2 flex max-w-2xl gap-1.5 text-xs leading-5 text-[#6B7280] sm:text-sm">
              <IconMapPin size={14} stroke={2} className="mt-0.5 shrink-0 text-[#6B7280]" />
              <span className="line-clamp-1">{address}</span>
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="sm:hidden">
              <RatingBadge rating={business.rating} reviewsCount={business.reviewsCount} locale={locale} compact />
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-opacity group-hover:opacity-65">
              {locale === "de" ? "Ansehen" : locale === "en" ? "View details" : "Ver ficha"}
              <IconArrowUpRight size={14} stroke={2} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function TopRankingExplorer({
  businesses,
  locale,
  category,
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
  const isCappedResultSet = businesses.length >= CAPPED_RESULT_THRESHOLD && filtered.length >= CAPPED_RESULT_THRESHOLD;
  const totalCount = `${filtered.length.toLocaleString(numberLocale(locale))}${isCappedResultSet ? "+" : ""}`;
  const loadCopy = loadMoreCopy[locale];
  const sortHelp = sortHelpCopy[locale];
  const scopedSearchPlaceholder =
    locale === "de"
      ? `${getCategoryCopy(category, locale).label} nach Name oder Ort suchen...`
      : locale === "en"
        ? `Search ${getCategoryCopy(category, locale).label.toLowerCase()} by name or area...`
        : `Buscar ${getCategoryCopy(category, locale).label.toLowerCase()} por nombre o zona...`;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [facetSlug, place, query, sort]);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="relative mb-3 max-w-4xl">
        <IconSearch size={16} stroke={1.8} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0A0A0A]" />
        <input
          value={query}
          onChange={(event) => updateParam("q", event.target.value)}
          placeholder={scopedSearchPlaceholder}
          className="h-12 w-full rounded-md border border-[#E5E7EB] bg-white pl-11 pr-4 text-sm text-ink shadow-sm focus:border-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]"
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
                  : "border border-[#E5E7EB] bg-white text-ink"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className={`mt-2 grid gap-2 ${SHOW_TYPE_FILTER && facets.length > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
          {SHOW_TYPE_FILTER && facets.length > 0 && (
            <select value={facetSlug} onChange={(event) => updateParam("type", event.target.value)} className="h-10 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] px-2 text-xs text-ink focus:border-[#0A0A0A] focus:ring-[#0A0A0A]">
              <option value={ALL}>{copy.filters.type}: {copy.filters.all}</option>
              {facets.map((facet) => (
                <option key={facet.slug} value={facet.slug}>{getLocalizedFacetLabel(facet.slug, facet.label, locale)} ({facet.count})</option>
              ))}
            </select>
          )}
          <select value={place} onChange={(event) => updateParam("area", event.target.value)} className="h-10 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] px-2 text-xs text-ink focus:border-[#0A0A0A] focus:ring-[#0A0A0A]">
            <option value={ALL}>{copy.filters.place}: {copy.filters.allPlaces}</option>
            {places.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <p className="mt-2 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A]">
          {totalCount} {copy.filters.results}
        </p>
        <Link href={methodologyPath(locale)} className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A]">
          <IconInfoCircle size={13} stroke={2} />
          {sortHelp.link}
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,820px)]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-md border border-[#E5E7EB] bg-white p-4 shadow-[0_14px_36px_rgba(10,10,10,0.035)]">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">{totalCount} {copy.filters.results}</p>
            <div className="grid gap-3">
              <label className="grid gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">
                {copy.filters.sortBy}
                <select value={sort} onChange={(event) => updateParam("sort", event.target.value)} className="h-11 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] px-3 text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]">
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              {SHOW_TYPE_FILTER && facets.length > 0 && (
                <label className="grid gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">
                  {copy.filters.type}
                  <select value={facetSlug} onChange={(event) => updateParam("type", event.target.value)} className="h-11 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] px-3 text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]">
                    <option value={ALL}>{copy.filters.all}</option>
                    {facets.map((facet) => (
                      <option key={facet.slug} value={facet.slug}>{getLocalizedFacetLabel(facet.slug, facet.label, locale)} ({facet.count})</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="grid gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">
                {copy.filters.place}
                <select value={place} onChange={(event) => updateParam("area", event.target.value)} className="h-11 rounded-md border border-[#E5E7EB] bg-[#FFFFFF] px-3 text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]">
                  <option value={ALL}>{copy.filters.allPlaces}</option>
                  {places.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <details className="rounded-md border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs leading-5 text-[#6B7280]">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A]">
                  <IconInfoCircle size={13} stroke={2} />
                  {sortHelp.title}
                </summary>
                <p className="mt-2">{sortHelp.text}</p>
                <Link href={methodologyPath(locale)} className="mt-2 inline-flex text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] hover:opacity-65">
                  {sortHelp.link}
                </Link>
              </details>
            </div>
          </div>
        </aside>

        <ol className="grid gap-2.5">
          {visibleBusinesses.map((business, index) => {
            const isAllMode = facets.length === 0;
            return (
              <li key={business.id} className="relative">
                <RankingBusinessRow business={business} rank={index + 1} locale={locale} showCategory={isAllMode} />
              </li>
            );
          })}
        </ol>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A]">{loadCopy.showing(shownCount, totalCount)}</p>
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((value) => Math.min(value + PAGE_SIZE, filtered.length))}
              className="min-h-11 rounded-md border border-[#0A0A0A] bg-[#0A0A0A] px-6 text-[11px] font-black uppercase tracking-[0.1em] text-[#FFFFFF] shadow-[0_14px_30px_rgba(10,10,10,0.18)] transition hover:-translate-y-0.5 hover:bg-[#262626]"
            >
              {loadCopy.loadMore}
            </button>
          )}
        </div>
      )}

      {!filtered.length && (
        <div className="mt-6 rounded-lg border border-[#E5E7EB] bg-white/85 p-5 text-sm text-olive sm:mt-8 sm:p-6">
          <p>{copy.filters.noResults}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 min-h-10 rounded-md border border-[#E5E7EB] bg-white px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-ink transition hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
          >
            {loadCopy.clearFilters}
          </button>
        </div>
      )}
    </section>
  );
}
