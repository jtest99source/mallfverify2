"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import type { Business } from "@/types/business";
import type { Locale } from "@/lib/i18n";
import type { CategorySlug } from "@/lib/data";
import { BusinessCard } from "@/components/BusinessCard";
import { businessMatchesFacet, type RankingFacet } from "@/lib/taxonomy";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";

type FacetWithCount = RankingFacet & { count: number };
type SortKey = "ratio" | "reviews" | "rating" | "hidden";

const ALL = "all";

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "ratio", label: "Recomendado" },
  { value: "rating", label: "Mejor valoración" },
  { value: "reviews", label: "Más reseñas" },
  { value: "hidden", label: "Joyas ocultas" }
];

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
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("ratio");
  const [facetSlug, setFacetSlug] = useState(ALL);
  const [place, setPlace] = useState(ALL);

  const places = useMemo(() => {
    return Array.from(new Set(businesses.map(businessPlace).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
  }, [businesses]);

  const selectedFacet = facetSlug === ALL ? null : facets.find((facet) => facet.slug === facetSlug) ?? null;

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

  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="relative mb-3">
        <IconSearch size={16} stroke={1.8} className="absolute left-4 top-1/2 -translate-y-1/2 text-sage" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar un sitio concreto por nombre o zona..."
          className="h-12 w-full rounded-lg border border-[#E7DED0] bg-white pl-11 pr-4 text-sm text-ink shadow-sm focus:border-[#0E8F72] focus:outline-none focus:ring-1 focus:ring-[#0E8F72]"
        />
      </div>
      <div className="rounded-lg border border-[#E7DED0] bg-white/85 p-4 shadow-[0_18px_45px_rgba(27,46,75,0.035)]">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sage">
            Ordenar por
            <select value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="h-11 rounded-sm border-[#E7DED0] bg-[#FFFDF7] text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0E8F72] focus:ring-[#0E8F72]">
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sage">
            Tipo
            <select value={facetSlug} onChange={(event) => setFacetSlug(event.target.value)} className="h-11 rounded-sm border-[#E7DED0] bg-[#FFFDF7] text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0E8F72] focus:ring-[#0E8F72]">
              <option value={ALL}>Todos</option>
              {facets.map((facet) => (
                <option key={facet.slug} value={facet.slug}>
                  {facet.label} ({facet.count})
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sage">
            Localidad
            <select value={place} onChange={(event) => setPlace(event.target.value)} className="h-11 rounded-sm border-[#E7DED0] bg-[#FFFDF7] text-sm font-normal normal-case tracking-normal text-ink focus:border-[#0E8F72] focus:ring-[#0E8F72]">
              <option value={ALL}>Todas</option>
              {places.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-sage sm:pb-3">
            {filtered.length.toLocaleString("es-ES")} resultados
          </div>
        </div>
      </div>

      <ol className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((business, index) => (
          <li key={business.id} className="relative h-full">
            <div className="absolute left-3 top-3 z-10 rounded-sm bg-ink px-3 py-1 text-xs font-bold text-white">#{index + 1}</div>
            <BusinessCard business={business} locale={locale} />
          </li>
        ))}
      </ol>

      {!filtered.length && (
        <div className="mt-8 rounded-lg border border-[#E7DED0] bg-white/85 p-6 text-sm text-olive">
          No hay resultados con esos filtros. Prueba con otra localidad o cambia el tipo.
        </div>
      )}
    </section>
  );
}
