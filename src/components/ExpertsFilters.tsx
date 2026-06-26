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

  return (
    <aside className="rounded-lg border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_45px_rgba(10,10,10,0.045)] lg:sticky lg:top-20">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">{count} {copy.resultsLabel}</p>

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          navigate({ nextQuery: search });
        }}
      >
        <label className="grid gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">
          {copy.searchLabel}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.searchPlaceholder}
            className="h-11 rounded-md border border-[#E5E7EB] bg-white px-3 text-sm font-normal normal-case tracking-normal text-ink outline-none focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A]"
          />
        </label>
      </form>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">
          {copy.sortLabel}
          <select
            value={sortKey}
            onChange={(e) => navigate({ nextSort: e.target.value })}
            className="h-11 rounded-sm border-[#E5E7EB] bg-[#FFFFFF] text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0A0A0A] focus:ring-[#0A0A0A]"
          >
            <option value="reviews">{copy.sortByReviews}</option>
            <option value="rating">{copy.sortByRating}</option>
            <option value="name">{copy.sortByName}</option>
          </select>
        </label>
        <label className="grid gap-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">
          {copy.languageLabel}
          <select
            value={langFilter ?? ""}
            onChange={(e) => navigate({ nextLang: e.target.value || null })}
            className="h-11 rounded-sm border-[#E5E7EB] bg-[#FFFFFF] text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0A0A0A] focus:ring-[#0A0A0A]"
          >
            <option value="">{copy.allFilter}</option>
            <option value="English">English</option>
            <option value="Deutsch">Deutsch</option>
          </select>
        </label>
      </div>

      <div className="mt-5 border-t border-[#E5E7EB] pt-4">
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">{copy.categoryLabel}</p>
        <div className="grid gap-1.5">
          <button
            type="button"
            onClick={() => navigate({ nextVertical: null })}
            className={`rounded-md border px-3 py-2 text-left text-xs font-black uppercase tracking-[0.08em] transition ${!activeVertical ? "border-[#0A0A0A] bg-[#0A0A0A] text-white" : "border-[#E5E7EB] bg-white text-[#0A0A0A] hover:border-[#0A0A0A]"}`}
          >
            {copy.allFilter}
          </button>
          {categories.map((category) => (
            <button
              type="button"
              key={category.slug}
              onClick={() => navigate({ nextVertical: category.slug })}
              className={`rounded-md border px-3 py-2 text-left text-xs font-black uppercase tracking-[0.08em] transition ${activeVertical === category.slug ? "border-[#0A0A0A] bg-[#0A0A0A] text-white" : "border-[#E5E7EB] bg-white text-[#0A0A0A] hover:border-[#0A0A0A]"}`}
            >
              {category.title}
            </button>
          ))}
        </div>
      </div>

      {(activeVertical || langFilter || sortKey !== "reviews" || query) && (
        <button
          type="button"
          onClick={() => router.push(`/${locale}/experts`)}
          className="mt-4 min-h-10 w-full rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] hover:border-[#0A0A0A]"
        >
          {copy.clearFilters}
        </button>
      )}
    </aside>
  );
}
