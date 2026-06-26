"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconChevronDown, IconMapPin, IconSearch } from "@tabler/icons-react";
import { getCategoryCopy } from "@/lib/i18n-copy";
import type { CategorySlug } from "@/lib/data";
import type { Locale } from "@/lib/i18n";

type SearchLocation = {
  label: string;
  value: string;
};

type HomePlaceSearchProps = {
  locale: Locale;
  categories: CategorySlug[];
  locations: SearchLocation[];
};

const copy = {
  es: {
    category: "Qué buscas",
    location: "Dónde",
    allMallorca: "Toda Mallorca",
    submit: "Buscar",
    helper: "Elige categoría y zona. Si no hay suficientes resultados locales, usamos el ranking de toda Mallorca.",
  },
  en: {
    category: "What",
    location: "Where",
    allMallorca: "All Mallorca",
    submit: "Search",
    helper: "Choose a category and area. If local data is thin, we use the all-Mallorca ranking.",
  },
  de: {
    category: "Was",
    location: "Wo",
    allMallorca: "Ganz Mallorca",
    submit: "Suchen",
    helper: "Suche nach Kategorie und Ort. Wenn ein Ort wenig Ergebnisse hat, nutze die Mallorca-weite Rangliste.",
  },
} as const;

export function HomePlaceSearch({ locale, categories, locations }: HomePlaceSearchProps) {
  const router = useRouter();
  const labels = copy[locale];
  const rootRef = useRef<HTMLFormElement | null>(null);
  const [category, setCategory] = useState<CategorySlug>(categories[0] ?? "restaurants");
  const [location, setLocation] = useState("");
  const [openMenu, setOpenMenu] = useState<"category" | "location" | null>(null);
  const categoryOptions = useMemo(
    () => categories.map((slug) => ({ slug, label: getCategoryCopy(slug, locale).label })),
    [categories, locale]
  );
  const selectedCategoryLabel = categoryOptions.find((option) => option.slug === category)?.label ?? "";
  const selectedLocationLabel = locations.find((item) => item.value === location)?.label ?? labels.allMallorca;

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function toggleMenu(menu: "category" | "location") {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("area", location);
    const query = params.toString();
    router.push(`/${locale}/top/${category}${query ? `?${query}` : ""}`);
  }

  return (
    <form
      ref={rootRef}
      onSubmit={onSubmit}
      className="relative z-30 mx-auto mt-8 w-full max-w-[650px] overflow-visible rounded-md border border-white/20 bg-[#0A0A0A]/78 p-1 shadow-[0_28px_80px_rgba(0,0,0,0.58)] backdrop-blur-md"
    >
      <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_104px] sm:items-stretch">
        {/* WHAT */}
        <div className="relative z-40 px-5 py-3.5 sm:border-r sm:border-white/10">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
            {labels.category}
          </span>
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleMenu("category");
            }}
            className="flex h-10 w-full items-center gap-3 text-left"
            aria-expanded={openMenu === "category"}
          >
            <IconSearch aria-hidden="true" size={18} className="shrink-0 text-white/55" />
            <span className="min-w-0 flex-1 truncate text-[15px] font-black text-white">{selectedCategoryLabel}</span>
            <IconChevronDown
              aria-hidden="true"
              size={17}
              className={`shrink-0 text-white/40 transition-transform ${openMenu === "category" ? "rotate-180" : ""}`}
            />
          </button>
          {openMenu === "category" && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-[90] max-h-80 w-full min-w-64 overflow-y-auto rounded-md border border-[#E5E7EB] bg-[#FFFFFF] p-1 shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
              {categoryOptions.map((option) => (
                <button
                  key={option.slug}
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setCategory(option.slug);
                    setOpenMenu(null);
                  }}
                  className={`block w-full rounded-sm px-3 py-2.5 text-left text-sm font-bold transition ${
                    option.slug === category ? "bg-[#0A0A0A] text-white" : "text-[#0A0A0A] hover:bg-[#FFCC00]/18"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* WHERE */}
        <div className="relative z-40 border-t border-white/10 px-5 py-3.5 sm:border-t-0">
          <span className="mb-1.5 block text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
            {labels.location}
          </span>
          <button
            type="button"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleMenu("location");
            }}
            className="flex h-10 w-full items-center gap-3 text-left"
            aria-expanded={openMenu === "location"}
          >
            <IconMapPin aria-hidden="true" size={18} className="shrink-0 text-white/55" />
            <span className="min-w-0 flex-1 truncate text-[15px] font-black text-white">{selectedLocationLabel}</span>
            <IconChevronDown
              aria-hidden="true"
              size={17}
              className={`shrink-0 text-white/40 transition-transform ${openMenu === "location" ? "rotate-180" : ""}`}
            />
          </button>
          {openMenu === "location" && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-[90] max-h-80 w-full min-w-64 overflow-y-auto rounded-md border border-[#E5E7EB] bg-[#FFFFFF] p-1 shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
              <button
                type="button"
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setLocation("");
                  setOpenMenu(null);
                }}
                className={`block w-full rounded-sm px-3 py-2.5 text-left text-sm font-bold transition ${
                  location === "" ? "bg-[#0A0A0A] text-white" : "text-[#0A0A0A] hover:bg-[#FFCC00]/18"
                }`}
              >
                {labels.allMallorca}
              </button>
              {locations.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setLocation(item.value);
                    setOpenMenu(null);
                  }}
                  className={`block w-full rounded-sm px-3 py-2.5 text-left text-sm font-bold transition ${
                    item.value === location ? "bg-[#0A0A0A] text-white" : "text-[#0A0A0A] hover:bg-[#FFCC00]/18"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="m-1 inline-flex min-h-12 w-[calc(100%-0.5rem)] items-center justify-center rounded-sm bg-[#FFCC00] px-5 text-[11px] font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition-all duration-150 hover:bg-white sm:min-h-0 sm:w-[96px]"
        >
          {labels.submit}
        </button>
      </div>

    </form>
  );
}
