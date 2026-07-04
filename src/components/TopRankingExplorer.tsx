"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconArrowUpRight, IconInfoCircle, IconMapPin } from "@tabler/icons-react";
import type { Business } from "@/types/business";
import type { Locale } from "@/lib/i18n";
import type { CategorySlug } from "@/lib/data";
import { getCategorySlugFromBusiness, publicCategorySlugs } from "@/lib/data";
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
const CATEGORIES_WITH_TYPE_FILTER = new Set(["healthcare"]);

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
    ratio:   { text: "Equilibra valoración y reseñas de Google. Un 4,3★ con 1.700 reseñas puede superar a un 5,0★ con 30.", link: "Ver metodología" },
    rating:  { text: "Ordenado por estrella media de Google, de mayor a menor.", link: null },
    reviews: { text: "Ordenado por número de reseñas de Google, de más a menos.", link: null },
    hidden:  { text: "Alta valoración pero pocas reseñas — negocios por descubrir.", link: null }
  },
  en: {
    ratio:   { text: "Balances Google rating and review volume. A 4.3★ with 1,700 reviews can outrank a 5.0★ with only 30.", link: "Read methodology" },
    rating:  { text: "Sorted by Google star rating, highest first.", link: null },
    reviews: { text: "Sorted by number of Google reviews, most reviewed first.", link: null },
    hidden:  { text: "Highly rated but not yet widely reviewed — hidden gems worth exploring.", link: null }
  },
  de: {
    ratio:   { text: "Wägt Google-Bewertung und Rezensionsanzahl ab. Ein 4,3★ mit 1.700 kann einen 5,0★ mit 30 übertreffen.", link: "Methodik lesen" },
    rating:  { text: "Nach Google-Sternebewertung sortiert, höchste zuerst.", link: null },
    reviews: { text: "Nach Anzahl der Google-Rezensionen sortiert, meiste zuerst.", link: null },
    hidden:  { text: "Hoch bewertet, aber noch wenig bekannt — Geheimtipps.", link: null }
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
    <article className="group bg-[#0C1A2E] ring-1 ring-white/[0.08] transition-colors duration-150 hover:bg-[#0C1A2E]">
      <Link href={`/${locale}/${categorySlug}/${business.slug}`} className="grid min-h-[118px] grid-cols-[52px_minmax(0,1fr)] sm:grid-cols-[64px_156px_minmax(0,1fr)_136px]">
        <div className="flex items-center justify-center border-r border-white/[0.08]">
          <span className="font-display text-2xl font-black text-[#00C37A]">#{rank}</span>
        </div>

        <div className="relative hidden min-h-[118px] overflow-hidden sm:block">
          <BusinessImage business={business} category={business.category} variant="card" className="h-full min-h-[118px] rounded-none p-0" />
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 bg-[#07101F]/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/70 backdrop-blur">
            <IconMapPin size={12} stroke={2} />
            {businessPlace(business)}
          </span>
        </div>

        <div className="min-w-0 border-r border-white/[0.08] p-4 sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {showCategory && categoryLabel && (
              <span className="rounded-full border border-white/[0.1] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-white/40">
                {categoryLabel}
              </span>
            )}
            <span className="inline-flex min-w-0 items-center gap-1 text-[11px] font-semibold text-white/35">
              <IconMapPin size={13} stroke={2} />
              <span className="truncate">{businessPlace(business)}</span>
            </span>
          </div>

          <h2 className="font-display mt-2 line-clamp-2 text-xl font-bold leading-tight text-white">{getBusinessPublicName(business)}</h2>
          {summary && <p className="mt-1.5 hidden max-w-2xl text-sm font-light leading-6 text-white/40 lg:line-clamp-1">{summary}</p>}
          {address && (
            <p className="mt-2 flex max-w-2xl gap-1.5 text-xs leading-5 text-white/35 sm:text-sm">
              <IconMapPin size={14} stroke={2} className="mt-0.5 shrink-0 text-white/28" />
              <span className="line-clamp-1">{address}</span>
            </p>
          )}

          <div className="mt-3 sm:hidden">
            <RatingBadge rating={business.rating} reviewsCount={business.reviewsCount} locale={locale} compact />
          </div>
        </div>

        <div className="hidden items-center justify-center p-4 text-center sm:flex">
          <div>
            {typeof business.rating === "number" && (
              <div className="font-display text-4xl font-black leading-none text-[#00C37A]">
                {business.rating.toLocaleString(numberLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </div>
            )}
            {typeof business.rating === "number" && (
              <div className="mt-1 flex justify-center gap-0.5 text-[10px] leading-none text-[#00C37A]">
                {Array.from({ length: 5 }, (_, starIndex) => (
                  <span key={starIndex} className={starIndex < Math.round(business.rating ?? 0) ? "opacity-100" : "opacity-22"}>
                    ★
                  </span>
                ))}
              </div>
            )}
            {typeof business.reviewsCount === "number" && (
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-white/30">
                {business.reviewsCount.toLocaleString(numberLocale(locale))} {locale === "es" ? "reseñas" : locale === "de" ? "Rezensionen" : "reviews"}
              </div>
            )}
            <span className="mt-3 inline-flex items-center gap-1 rounded-sm border border-white/[0.12] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-white/35 transition-colors group-hover:border-[#00C37A] group-hover:text-[#00C37A]">
              {locale === "de" ? "Details" : locale === "en" ? "Details" : "Ficha"}
              <IconArrowUpRight size={13} stroke={2} />
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

  const showTypeFilter = CATEGORIES_WITH_TYPE_FILTER.has(category) && facets.length > 0;

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
  const sortHelp = sortHelpCopy[locale][sort];
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
    <section className="relative bg-[#07101F] pb-14">
      {/* Mobile filters */}
      <div className="px-4 py-4 sm:hidden">
        <div className="mb-2">
          <select
            value={category}
            onChange={(event) => router.push(`/${locale}/top/${event.target.value}`)}
            className="h-10 w-full rounded-sm border border-white/[0.12] bg-[#0C1A2E] px-3 text-xs text-white focus:border-[#00C37A] focus:outline-none"
          >
            {publicCategorySlugs.map((cat) => (
              <option key={cat} value={cat}>{getCategoryCopy(cat, locale).label}</option>
            ))}
          </select>
        </div>
        {showTypeFilter && (
          <div className="mb-2">
            <select value={facetSlug} onChange={(event) => updateParam("type", event.target.value)} className="h-10 w-full rounded-sm border border-white/[0.12] bg-[#0C1A2E] px-3 text-xs text-white focus:border-[#00C37A] focus:outline-none">
              <option value={ALL}>{locale === "de" ? "Alle Typen" : locale === "en" ? "All types" : "Todos los tipos"}</option>
              {facets.map((facet) => (
                <option key={facet.slug} value={facet.slug}>{getLocalizedFacetLabel(facet.slug, facet.label, locale)}</option>
              ))}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <select value={sort} onChange={(event) => updateParam("sort", event.target.value)} className="h-10 rounded-sm border border-white/[0.12] bg-[#0C1A2E] px-3 text-xs text-white focus:border-[#00C37A] focus:outline-none">
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select value={place} onChange={(event) => updateParam("area", event.target.value)} className="h-10 rounded-sm border border-white/[0.12] bg-[#0C1A2E] px-3 text-xs text-white focus:border-[#00C37A] focus:outline-none">
            <option value={ALL}>{copy.filters.place}: {copy.filters.allPlaces}</option>
            {places.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/55">{totalCount} {copy.filters.results}</p>
          {sortHelp.link && (
            <Link href={methodologyPath(locale)} className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#00C37A]">
              <IconInfoCircle size={13} stroke={2} />
              {sortHelp.link}
            </Link>
          )}
        </div>
        <div className="mt-2 flex items-start gap-1.5 rounded-sm border border-white/[0.07] bg-white/[0.03] px-3 py-2">
          <IconInfoCircle size={12} stroke={2} className="mt-0.5 shrink-0 text-white/30" />
          <p className="text-[11px] leading-4 text-white/40">{sortHelp.text}</p>
        </div>
      </div>

      <div className="hidden px-4 py-5 lg:block lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-6 border-y border-white/[0.08] py-4">
          <div className="shrink-0">
            <div className="font-display text-xl font-bold text-white">{totalCount}</div>
            <div className="text-[11px] text-white/30">{copy.filters.results}</div>
          </div>
          <div className="h-8 w-px bg-white/[0.08]" />
          <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
            {locale === "de" ? "Kategorie" : locale === "en" ? "Category" : "Categoría"}
            <select
              value={category}
              onChange={(event) => router.push(`/${locale}/top/${event.target.value}`)}
              className="h-9 rounded-sm border border-white/[0.12] bg-[#0C1A2E] pl-4 pr-8 text-sm font-normal normal-case tracking-normal text-white focus:border-[#00C37A] focus:outline-none focus:ring-1 focus:ring-[#00C37A]"
            >
              {publicCategorySlugs.map((cat) => (
                <option key={cat} value={cat}>{getCategoryCopy(cat, locale).label}</option>
              ))}
            </select>
          </label>
          {showTypeFilter && (
            <>
              <div className="h-8 w-px bg-white/[0.08]" />
              <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                {locale === "de" ? "Typ" : locale === "en" ? "Type" : "Tipo"}
                <select value={facetSlug} onChange={(event) => updateParam("type", event.target.value)} className="h-9 rounded-sm border border-white/[0.12] bg-[#0C1A2E] pl-4 pr-8 text-sm font-normal normal-case tracking-normal text-white focus:border-[#00C37A] focus:outline-none focus:ring-1 focus:ring-[#00C37A]">
                  <option value={ALL}>{locale === "de" ? "Alle" : locale === "en" ? "All" : "Todos"}</option>
                  {facets.map((facet) => (
                    <option key={facet.slug} value={facet.slug}>{getLocalizedFacetLabel(facet.slug, facet.label, locale)}</option>
                  ))}
                </select>
              </label>
            </>
          )}
          <div className="h-8 w-px bg-white/[0.08]" />
          <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                {copy.filters.sortBy}
                <select value={sort} onChange={(event) => updateParam("sort", event.target.value)} className="h-9 rounded-sm border border-white/[0.12] bg-[#0C1A2E] pl-4 pr-8 text-sm font-normal normal-case tracking-normal text-white focus:border-[#00C37A] focus:outline-none focus:ring-1 focus:ring-[#00C37A]">
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
          </label>
              <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                {copy.filters.place}
                <select value={place} onChange={(event) => updateParam("area", event.target.value)} className="h-9 rounded-sm border border-white/[0.12] bg-[#0C1A2E] pl-4 pr-8 text-sm font-normal normal-case tracking-normal text-white focus:border-[#00C37A] focus:outline-none focus:ring-1 focus:ring-[#00C37A]">
                  <option value={ALL}>{copy.filters.allPlaces}</option>
                  {places.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
              <div className="ml-auto flex items-center gap-2 text-[11px] text-white/30">
                <IconInfoCircle size={13} stroke={2} className="shrink-0 text-white/25" />
                <span>{sortHelp.text}</span>
                {sortHelp.link && (
                  <Link href={methodologyPath(locale)} className="shrink-0 text-white/45 underline underline-offset-2 hover:text-[#00C37A]">
                    {sortHelp.link}
                  </Link>
                )}
              </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <ol className="grid gap-px bg-white/[0.08]">
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
          <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/35">{loadCopy.showing(shownCount, totalCount)}</p>
          {hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((value) => Math.min(value + PAGE_SIZE, filtered.length))}
              className="min-h-11 rounded-sm bg-[#00C37A] px-6 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition hover:-translate-y-0.5 hover:bg-white"
            >
              {loadCopy.loadMore}
            </button>
          )}
        </div>
      )}

      {!filtered.length && (
        <div className="mx-auto mt-6 max-w-7xl rounded-sm border border-white/[0.08] bg-[#0C1A2E] p-5 text-sm text-white/50 sm:mt-8 sm:p-6">
          <p>{copy.filters.noResults}</p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 min-h-10 rounded-sm bg-[#00C37A] px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] transition hover:bg-white"
          >
            {loadCopy.clearFilters}
          </button>
        </div>
      )}
    </section>
  );
}
