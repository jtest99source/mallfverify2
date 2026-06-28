"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

interface ExpertsFiltersCopy {
  sortLabel: string;
  sortByReviews: string;
  sortByRating: string;
  sortByName: string;
  languageLabel: string;
  allFilter: string;
  resultsLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  categoryLabel: string;
  clearFilters: string;
}

interface ExpertsFiltersProps {
  locale: Locale;
  sortKey: string;
  langFilter: string | null;
  activeVertical: string | null;
  query: string;
  count: number;
  categories: { slug: string; title: string }[];
  copy: ExpertsFiltersCopy;
}

export function ExpertsFilters({ locale, sortKey, langFilter, activeVertical, query, count, categories, copy }: ExpertsFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(query);

  function targetUrl({
    nextSort = sortKey,
    nextLang = langFilter,
    nextVertical = activeVertical,
    nextQuery = search
  }: {
    nextSort?: string;
    nextLang?: string | null;
    nextVertical?: string | null;
    nextQuery?: string;
  }) {
    const ps = new URLSearchParams();
    if (nextVertical) ps.set("v", nextVertical);
    if (nextSort !== "reviews") ps.set("s", nextSort);
    if (nextLang) ps.set("l", nextLang);
    if (nextQuery.trim()) ps.set("q", nextQuery.trim());
    const qs = ps.toString();
    return `/${locale}/experts${qs ? `?${qs}` : ""}`;
  }

  function navigate(options: Parameters<typeof targetUrl>[0]) {
    router.push(targetUrl(options));
  }

  const hasActiveFilters = !!(activeVertical || langFilter || sortKey !== "reviews" || query);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        <form
          className="flex min-w-[160px] flex-1 items-center rounded-sm border border-white/[0.12] bg-[#0C1A2E] px-3 focus-within:border-[#00C37A]/60"
          onSubmit={(event) => {
            event.preventDefault();
            navigate({ nextQuery: search });
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="h-9 flex-1 bg-transparent text-sm font-normal text-white outline-none placeholder:text-white/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); navigate({ nextQuery: "" }); }}
              className="pl-2 text-base text-white/35 hover:text-white"
            >
              ×
            </button>
          )}
        </form>

        <select
          value={langFilter ?? ""}
          onChange={(e) => navigate({ nextLang: e.target.value || null })}
          className="h-9 rounded-sm border border-white/[0.12] bg-[#0C1A2E] px-3 text-sm text-white focus:border-[#00C37A] [&_option]:text-[#0A0A0A]"
        >
          <option value="">{copy.languageLabel}</option>
          <option value="English">English</option>
          <option value="Deutsch">Deutsch</option>
        </select>

        <select
          value={sortKey}
          onChange={(e) => navigate({ nextSort: e.target.value })}
          className="h-9 rounded-sm border border-white/[0.12] bg-[#0C1A2E] px-3 text-sm text-white focus:border-[#00C37A] [&_option]:text-[#0A0A0A]"
        >
          <option value="reviews">{copy.sortByReviews}</option>
          <option value="rating">{copy.sortByRating}</option>
          <option value="name">{copy.sortByName}</option>
        </select>

        <span className="shrink-0 text-[11px] font-bold text-white/38">
          {count} {copy.resultsLabel}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => router.push(`/${locale}/experts`)}
            className="h-9 shrink-0 rounded-sm border border-white/[0.12] bg-white/[0.04] px-3 text-[10px] font-black uppercase tracking-[0.1em] text-white/60 hover:border-[#00C37A]/70 hover:text-white"
          >
            {copy.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}

