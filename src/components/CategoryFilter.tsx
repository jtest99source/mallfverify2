"use client";

import Link from "next/link";
import { IconDiamond, IconMessageCircle, IconStarFilled, IconTrendingUp } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessImage } from "@/components/BusinessImage";
import { RatingBadge } from "@/components/RatingBadge";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { getCategorySlugFromBusiness } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import { isUntapped } from "@/lib/untapped-score";
import type { Business } from "@/types/business";

type SortKey = "ratio" | "rating" | "reviews" | "untapped";

const ALL_AREAS = "all";
const ALL_TAGS = "all";

const copy = {
  es: {
    orderedBy: "Ordenado por",
    allAreas: "Todas las zonas",
    search: "Buscar",
    searchPlaceholder: "Nombre, zona o estilo",
    style: "Estilo",
    allStyles: "Todos los estilos",
    results: "resultados",
    bestResult: "Mejor resultado",
    hiddenGem: "Joya oculta",
    viewProfile: "Ver ficha",
    allResults: "Todos los resultados",
    sort: { ratio: "Recomendado", rating: "Mejor valoración", reviews: "Más reseñas", untapped: "Joyas ocultas" }
  },
  en: {
    orderedBy: "Sorted by",
    allAreas: "All areas",
    search: "Search",
    searchPlaceholder: "Name, area or style",
    style: "Style",
    allStyles: "All styles",
    results: "results",
    bestResult: "Best result",
    hiddenGem: "Hidden gem",
    viewProfile: "View profile",
    allResults: "All results",
    sort: { ratio: "Recommended", rating: "Best rating", reviews: "Most reviews", untapped: "Hidden gems" }
  },
  de: {
    orderedBy: "Sortiert nach",
    allAreas: "Alle Orte",
    search: "Suche",
    searchPlaceholder: "Name, Ort oder Stil",
    style: "Stil",
    allStyles: "Alle Stile",
    results: "Ergebnisse",
    bestResult: "Bestes Ergebnis",
    hiddenGem: "Geheimtipp",
    viewProfile: "Profil ansehen",
    allResults: "Alle Ergebnisse",
    sort: { ratio: "Empfohlen", rating: "Beste Bewertung", reviews: "Meiste Rezensionen", untapped: "Geheimtipps" }
  }
} as const;

const sortIcons: Record<SortKey, typeof IconTrendingUp> = {
  ratio: IconTrendingUp,
  rating: IconStarFilled,
  reviews: IconMessageCircle,
  untapped: IconDiamond
};

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

function descriptionFor(business: Business) {
  return business.editorialDescription || business.aiDescription || business.shortDescription || business.description;
}

function getBusinessTags(business: Business) {
  return business.idealFor?.length ? business.idealFor : business.tags;
}

function businessArea(business: Business) {
  return business.city || business.area || "Mallorca";
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function ratioScore(business: Business) {
  return (business.rating ?? 0) * Math.log((business.reviewsCount ?? 0) + 1);
}

function sortBusinesses(businesses: Business[], sort: SortKey) {
  const sortable = sort === "untapped" ? businesses.filter((business) => typeof business.untappedScore === "number") : businesses;

  return sortable.slice().sort((a, b) => {
    if (sort === "rating") {
      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
    }

    if (sort === "reviews") return (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);

    if (sort === "untapped") {
      const untappedDiff = (b.untappedScore ?? 0) - (a.untappedScore ?? 0);
      if (untappedDiff !== 0) return untappedDiff;
      return ratioScore(b) - ratioScore(a);
    }

    const ratioDiff = ratioScore(b) - ratioScore(a);
    if (ratioDiff !== 0) return ratioDiff;
    return (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
  });
}

function getPopularTags(businesses: Business[], locale: Locale) {
  const counts = new Map<string, number>();
  for (const business of businesses) {
    for (const tag of getBusinessTags(business)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].localeCompare(b[0], numberLocale(locale));
    })
    .slice(0, 14)
    .map(([tag]) => tag);
}

export function CategoryFilter({ businesses, locale }: { businesses: Business[]; locale: Locale }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const c = copy[locale];

  const area = searchParams.get("area") || ALL_AREAS;
  const tag = searchParams.get("tag") || ALL_TAGS;
  const query = searchParams.get("q") || "";
  const sort = (searchParams.get("sort") || "ratio") as SortKey;

  const areas = useMemo(
    () => Array.from(new Set(businesses.map(businessArea).filter(Boolean))).sort((a, b) => a.localeCompare(b, numberLocale(locale))),
    [businesses, locale]
  );
  const tags = useMemo(() => getPopularTags(businesses, locale), [businesses, locale]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === ALL_AREAS || value === ALL_TAGS || (key === "sort" && value === "ratio")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    const matches = businesses.filter((business) => {
      const businessTags = getBusinessTags(business);
      const name = getBusinessPublicName(business);
      const searchable = normalizeText([name, businessArea(business), business.shortDescription, business.description, ...businessTags].filter(Boolean).join(" "));

      return (
        (area === ALL_AREAS || businessArea(business) === area) &&
        (tag === ALL_TAGS || businessTags.includes(tag)) &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      );
    });

    return sortBusinesses(matches, sort);
  }, [area, tag, query, sort, businesses]);

  const top = filtered[0];

  return (
    <div>
      <div className="rounded-lg border border-[#E7DED0] bg-white/80 p-4 shadow-[0_18px_45px_rgba(27,46,75,0.035)]">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="mr-2 text-[11px] font-bold uppercase tracking-[0.12em] text-sage">{c.orderedBy}</span>
          {(Object.keys(c.sort) as SortKey[]).map((key) => {
            const active = sort === key;
            const Icon = sortIcons[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateParam("sort", key)}
                className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-[11px] font-bold uppercase tracking-[0.08em] transition ${active ? "border-ink bg-ink text-white" : "border-[#E7DED0] bg-white text-ink hover:border-ink"}`}
              >
                <Icon size={15} stroke={1.8} />
                {c.sort[key]}
              </button>
            );
          })}
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {[ALL_AREAS, ...areas].map((item) => {
            const active = area === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => updateParam("area", item)}
                className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold ${active ? "border-verified bg-[#F0FDF4] text-verified" : "border-[#E7DED0] bg-white text-olive hover:border-ink hover:text-ink"}`}
              >
                {item === ALL_AREAS ? c.allAreas : item}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_auto] lg:items-end">
          <label className="grid gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-sage">
            {c.search}
            <input
              value={query}
              onChange={(event) => updateParam("q", event.target.value)}
              placeholder={c.searchPlaceholder}
              className="border-[#E7DED0] bg-[#FFFDF7] text-sm font-normal normal-case tracking-normal text-ink focus:border-ink focus:ring-ink"
            />
          </label>
          <label className="grid gap-1 text-[11px] font-bold uppercase tracking-[0.1em] text-sage">
            {c.style}
            <select value={tag} onChange={(event) => updateParam("tag", event.target.value)} className="border-[#E7DED0] bg-[#FFFDF7] text-sm font-normal normal-case tracking-normal text-ink focus:border-ink focus:ring-ink">
              <option value={ALL_TAGS}>{c.allStyles}</option>
              {tags.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-sage lg:pb-3">{filtered.length.toLocaleString(numberLocale(locale))} {c.results}</span>
        </div>
      </div>

      {top && (
        <section className="mt-8 grid overflow-hidden rounded-lg border border-[#E7DED0] bg-white/80 shadow-[0_18px_45px_rgba(27,46,75,0.04)] lg:grid-cols-[1.35fr_1fr]">
          <Link href={`/${locale}/${getCategorySlugFromBusiness(top.category)}/${top.slug}`} className="block">
            <BusinessImage business={top} category={top.category} variant="hero" className="min-h-[280px]">
              <div className="flex flex-wrap gap-2">
                <span className="bg-coral px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">{c.bestResult}</span>
                {isUntapped(top.untappedScore) && <span className="inline-flex items-center gap-1 bg-[#FEF3C7] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#92400E]"><IconDiamond size={12} /> {c.hiddenGem}</span>}
              </div>
              <h2 className="mt-4 font-sans text-4xl font-black leading-tight text-white">{getBusinessPublicName(top)}</h2>
              <div className="mt-3"><RatingBadge rating={top.rating} reviewsCount={top.reviewsCount} locale={locale} compact /></div>
            </BusinessImage>
          </Link>
          <div className="flex flex-col p-8">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sage">{businessArea(top)}</p>
            <p className="mt-4 flex-1 text-sm leading-7 text-olive">{descriptionFor(top)}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {getBusinessTags(top).slice(0, 4).map((item) => <span key={item} className="border border-[#E7DED0] bg-[#FFFDF7] px-3 py-1 text-[10px] text-olive">{item}</span>)}
            </div>
            <Link href={`/${locale}/${getCategorySlugFromBusiness(top.category)}/${top.slug}`} className="mt-6 w-fit rounded-sm bg-ink px-5 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">{c.viewProfile}</Link>
          </div>
        </section>
      )}

      <div className="mt-10 pb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-sage">{c.allResults}</div>
      <div className="mt-3 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((business) => <BusinessCard key={business.id} business={business} locale={locale} />)}
      </div>
    </div>
  );
}
