"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconSearch } from "@tabler/icons-react";
import { categoryConfigs, getCategorySlugFromBusiness } from "@/lib/data";
import type { BusinessCategory } from "@/types/business";
import type { Locale } from "@/lib/i18n";

type SearchItem = {
  id: string;
  name: string;
  slug: string;
  category: BusinessCategory;
  location: string;
  rating?: number | null;
  reviewsCount?: number | null;
  primaryImageUrl?: string | null;
};

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
    pendingIndex = fetch("/api/search-index", { cache: "force-cache" })
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

function categoryLabel(category: BusinessCategory) {
  const slug = getCategorySlugFromBusiness(category);
  return categoryConfigs[slug].singular;
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

  const search = (query: string, limit = 7) => {
    const normalizedQuery = normalize(query);
    if (normalizedQuery.length < 2) return [];

    return results
      .map((item) => {
        const haystack = normalize(`${item.name} ${item.location} ${categoryLabel(item.category)}`);
        const starts = normalize(item.name).startsWith(normalizedQuery) ? 2 : 0;
        const includes = haystack.includes(normalizedQuery) ? 1 : 0;
        return { item, score: starts + includes };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score || (b.item.reviewsCount ?? 0) - (a.item.reviewsCount ?? 0))
      .slice(0, limit)
      .map((result) => result.item);
  };

  return { results, search, isLoading };
}

function resultHref(locale: Locale, item: SearchItem) {
  return `/${locale}/${getCategorySlugFromBusiness(item.category)}/${item.slug}`;
}

export function SearchBox({ locale, variant = "navbar", className = "" }: SearchBoxProps) {
  const router = useRouter();
  const { search } = useSearchIndex();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isHero = variant === "hero";

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

  const results = useMemo(() => search(debouncedQuery, 7), [search, debouncedQuery]);
  const showDropdown = open && normalize(query).length >= 2;
  const inputClass = isHero
    ? "h-14 w-full rounded-md border border-borderline bg-white px-12 text-base text-ink shadow-soft outline-none placeholder:text-sage focus:border-coral"
    : "h-9 w-[170px] rounded-full border border-borderline bg-linen px-9 text-[12px] text-ink outline-none placeholder:text-sage transition-all duration-200 focus:w-[280px] focus:border-ink focus:bg-white";

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <IconSearch aria-hidden="true" size={isHero ? 22 : 15} className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 ${isHero ? "text-coral" : "text-sage"}`} />
      <input
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Enter" && results[0]) router.push(resultHref(locale, results[0]));
        }}
        placeholder="Buscar..."
        className={inputClass}
      />
      {showDropdown && (
        <div className={`absolute z-50 mt-2 overflow-hidden rounded-lg border border-borderline bg-white shadow-soft ${isHero ? "left-0 w-full" : "right-0 w-[min(360px,88vw)]"}`}>
          {results.length > 0 ? (
            <div className="max-h-[420px] overflow-y-auto py-1">
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={resultHref(locale, item)}
                  onClick={() => setOpen(false)}
                  className="grid grid-cols-[36px_1fr] gap-3 px-3 py-2.5 hover:bg-paper"
                >
                  <div
                    className="h-9 w-9 rounded bg-linen bg-cover bg-center"
                    style={item.primaryImageUrl ? { backgroundImage: `url(${item.primaryImageUrl})` } : undefined}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-sans text-[13px] font-bold leading-tight text-ink">{item.name}</p>
                    <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-sage">
                      {categoryLabel(item.category)} · {item.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-3 py-4 text-sm text-olive">Sin resultados para «{query.trim()}»</p>
          )}
        </div>
      )}
    </div>
  );
}

export const LiveSearch = SearchBox;
