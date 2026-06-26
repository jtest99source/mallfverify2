"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconChartBar, IconMapPin, IconSearch } from "@tabler/icons-react";
import { categoryConfigs, getCategorySlugFromBusiness, type CategorySlug } from "@/lib/data";
import { getCategoryCopy, t } from "@/lib/i18n-copy";
import type { BusinessCategory } from "@/types/business";
import type { Locale } from "@/lib/i18n";

type BusinessSearchItem = {
  type: "business";
  id: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  location: string;
  rating?: number | null;
  reviewsCount?: number | null;
  primaryImageUrl?: string | null;
};

type RankingSearchItem = {
  type: "ranking";
  id: string;
  name: string;
  categorySlug: CategorySlug;
  location?: string | null;
  count?: number;
  keywords?: string;
};

type SearchItem = BusinessSearchItem | RankingSearchItem;

type SearchBoxProps = {
  locale: Locale;
  variant?: "navbar" | "nav" | "hero";
  className?: string;
};

let cachedIndex: SearchItem[] | null = null;
let pendingIndex: Promise<SearchItem[]> | null = null;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function loadIndex() {
  if (cachedIndex) return cachedIndex;
  if (!pendingIndex) {
    pendingIndex = fetch("/api/search-index?v=2", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Search index request failed");
        return response.json() as Promise<SearchItem[]>;
      })
      .then((items) => {
        cachedIndex = items;
        return items;
      })
      .finally(() => {
        pendingIndex = null;
      });
  }
  return pendingIndex;
}

function categoryLabel(category: BusinessCategory, locale: Locale) {
  const slug = getCategorySlugFromBusiness(category);
  return getCategoryCopy(slug, locale).singular;
}

function itemHref(locale: Locale, item: SearchItem) {
  if (item.type === "ranking") {
    const params = new URLSearchParams();
    if (item.location) params.set("area", item.location);
    const query = params.toString();
    return `/${locale}/top/${item.categorySlug}${query ? `?${query}` : ""}`;
  }

  return `/${locale}/${getCategorySlugFromBusiness(item.category)}/${item.slug}`;
}

function itemSubtitle(item: SearchItem, locale: Locale) {
  if (item.type === "ranking") {
    const category = getCategoryCopy(item.categorySlug, locale).label;
    return item.location ? `Ranking - ${category} - ${item.location}` : `Ranking - ${category}`;
  }

  return `${categoryLabel(item.category, locale)} - ${item.location}`;
}

function itemSearchText(item: SearchItem, locale: Locale) {
  if (item.type === "ranking") {
    const config = categoryConfigs[item.categorySlug];
    return [
      item.name,
      config.label,
      config.singular,
      config.title,
      item.location,
      item.keywords,
      "mejores mejor ranking top recomendados recomendado mallorca"
    ]
      .filter(Boolean)
      .join(" ");
  }

  return `${item.name} ${item.location} ${categoryLabel(item.category, locale)}`;
}

function scoreItem(item: SearchItem, normalizedQuery: string, locale: Locale) {
  const haystack = normalize(itemSearchText(item, locale));
  const name = normalize(item.name);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const tokenMatches = tokens.filter((token) => haystack.includes(token)).length;

  if (!tokenMatches) return 0;

  let score = tokenMatches * 2;
  if (haystack.includes(normalizedQuery)) score += 4;
  if (name.startsWith(normalizedQuery)) score += 5;
  if (item.type === "ranking" && tokens.length >= 2) score += 2;
  return score;
}

export function useSearchIndex() {
  const [results, setResults] = useState<SearchItem[]>(cachedIndex ?? []);
  const [isLoading, setIsLoading] = useState(!cachedIndex);

  useEffect(() => {
    let active = true;
    loadIndex()
      .then((items) => {
        if (active) setResults(items);
      })
      .catch(() => {
        if (active) setResults([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const search = (query: string, limit = 7, locale: Locale = "es") => {
    const normalizedQuery = normalize(query);
    if (normalizedQuery.length < 2) return [];

    return results
      .map((item) => ({ item, score: scoreItem(item, normalizedQuery, locale) }))
      .filter((result) => result.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.item.type !== b.item.type) return a.item.type === "ranking" ? -1 : 1;
        const weightA = a.item.type === "business" ? (a.item.reviewsCount ?? 0) : (a.item.count ?? 0);
        const weightB = b.item.type === "business" ? (b.item.reviewsCount ?? 0) : (b.item.count ?? 0);
        return weightB - weightA;
      })
      .slice(0, limit)
      .map((result) => result.item);
  };

  return { results, search, isLoading };
}

export function SearchBox({ locale, variant = "navbar", className = "" }: SearchBoxProps) {
  const router = useRouter();
  const copy = t(locale);
  const { search, isLoading } = useSearchIndex();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isHero = variant === "hero";
  const isNav = variant === "nav";

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const results = useMemo(() => search(debouncedQuery, 8, locale), [search, debouncedQuery, locale]);
  const showDropdown = open && normalize(query).length >= 2;
  const inputClass = isHero
    ? "h-14 w-full rounded-md border border-borderline bg-white px-12 text-base text-ink shadow-soft outline-none placeholder:text-[#525252] focus:border-[#0A0A0A]"
    : isNav
      ? "h-11 w-full rounded-md border border-borderline bg-linen px-10 text-sm text-ink outline-none placeholder:text-[#525252] focus:border-ink focus:bg-white"
      : "h-9 w-[220px] rounded-full border border-borderline bg-linen px-9 text-[12px] text-ink outline-none placeholder:text-[#525252] transition-all duration-200 focus:w-[300px] focus:border-ink focus:bg-white";

  return (
    <div ref={wrapperRef} className={`relative z-[90] ${className}`}>
      <IconSearch aria-hidden="true" size={isHero ? 22 : 15} className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#0A0A0A]" />
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Enter" && results[0]) router.push(itemHref(locale, results[0]));
        }}
        placeholder={locale === "de" ? "Ort oder Ranking suchen..." : locale === "en" ? "Search place or ranking..." : "Buscar local o ranking..."}
        className={inputClass}
      />
      {showDropdown && (
        <div className={`absolute z-[100] mt-2 overflow-hidden rounded-lg border border-borderline bg-white shadow-[0_22px_60px_rgba(10,10,10,0.22)] ${isHero ? "left-0 w-full" : "right-0 w-[min(390px,88vw)]"}`}>
          {isLoading ? (
            <p className="px-3 py-4 text-sm text-olive">{locale === "de" ? "Suche wird geladen..." : locale === "en" ? "Loading search..." : "Cargando búsqueda..."}</p>
          ) : results.length > 0 ? (
            <div className="max-h-[min(420px,calc(100vh-180px))] overflow-y-auto py-1">
              {results.map((item) => (
                <Link key={item.id} href={itemHref(locale, item)} onClick={() => setOpen(false)} className="grid grid-cols-[36px_1fr] gap-3 px-3 py-2.5 hover:bg-paper">
                  {item.type === "ranking" ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-[#F5F5F5] text-[#0A0A0A]">
                      <IconChartBar size={18} stroke={2} />
                    </div>
                  ) : (
                    <div className="h-9 w-9 rounded bg-linen bg-cover bg-center" style={item.primaryImageUrl ? { backgroundImage: `url(${item.primaryImageUrl})` } : undefined} />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[13px] font-bold leading-tight text-ink">{item.name}</p>
                    <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.08em] text-[#0A0A0A]">
                      {item.type === "ranking" && item.location ? <IconMapPin size={11} className="mr-1 inline-block align-[-1px]" /> : null}
                      {itemSubtitle(item, locale)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-3 py-4 text-sm text-olive">{copy.filters.noResults.replace(".", "")}: "{query.trim()}"</p>
          )}
        </div>
      )}
    </div>
  );
}

export const LiveSearch = SearchBox;
