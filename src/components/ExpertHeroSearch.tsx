"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconSearch, IconShieldCheck } from "@tabler/icons-react";
import type { Locale } from "@/lib/i18n";

type ExpertHeroSearchProps = {
  locale: Locale;
  categories: { slug: string; title: string }[];
  initialQuery?: string;
  initialVertical?: string | null;
  initialLanguage?: string | null;
};

const copy = {
  es: {
    searchLabel: "Qué necesitas",
    specialtyLabel: "Especialidad",
    allVerticals: "Todos los expertos",
    placeholder: "Abogado, dentista, gestor, inmobiliaria...",
    submit: "Buscar expertos",
    info: "La mayoría de expertos se concentran en Palma o cubren toda la isla."
  },
  en: {
    searchLabel: "What you need",
    specialtyLabel: "Specialism",
    allVerticals: "All experts",
    placeholder: "Lawyer, dentist, tax advisor, estate agent...",
    submit: "Search experts",
    info: "Most experts are based in Palma or cover the whole island."
  },
  de: {
    searchLabel: "Was du brauchst",
    specialtyLabel: "Fachgebiet",
    allVerticals: "Alle Experten",
    placeholder: "Anwalt, Zahnarzt, Steuerberater, Immobilien...",
    submit: "Experten suchen",
    info: "Die meisten Experten sind in Palma oder decken die ganze Insel ab."
  }
} as const;

export function ExpertHeroSearch({
  locale,
  categories,
  initialQuery = "",
  initialVertical = null,
}: ExpertHeroSearchProps) {
  const router = useRouter();
  const c = copy[locale];
  const [query, setQuery] = useState(initialQuery);
  const [vertical, setVertical] = useState(initialVertical ?? "");
  const [openMenu, setOpenMenu] = useState(false);
  const rootRef = useRef<HTMLFormElement | null>(null);
  const selectedLabel = categories.find((cat) => cat.slug === vertical)?.title ?? c.allVerticals;

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (vertical) params.set("v", vertical);
    const qs = params.toString();
    router.push(`/${locale}/experts${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="mx-auto w-full max-w-[650px]">
      <form
        ref={rootRef}
        onSubmit={onSubmit}
        className="relative z-30 overflow-visible rounded-md border border-white/20 bg-[#0A0A0A]/78 p-1 shadow-[0_28px_80px_rgba(0,0,0,0.58)] backdrop-blur-md"
      >
        <div className="grid sm:grid-cols-2 sm:items-stretch">
          {/* SEARCH */}
          <div className="px-5 py-4 sm:border-r sm:border-white/10">
            <div className="flex h-10 w-full items-center gap-3">
              <IconSearch aria-hidden="true" size={18} className="shrink-0 text-white/55" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={c.placeholder}
                className="min-w-0 flex-1 bg-transparent text-[15px] font-black text-white placeholder:font-normal placeholder:text-white/35 focus:outline-none"
              />
            </div>
          </div>

          {/* SPECIALTY */}
          <div className="relative z-40 border-t border-white/10 px-5 py-4 sm:border-t-0">
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenu((v) => !v); }}
              className="flex h-10 w-full items-center gap-3 text-left"
              aria-expanded={openMenu}
            >
              <IconShieldCheck aria-hidden="true" size={18} className="shrink-0 text-white/55" />
              <span className="min-w-0 flex-1 truncate text-[15px] font-black text-white">{selectedLabel}</span>
              <IconChevronDown aria-hidden="true" size={17} className={`shrink-0 text-white/40 transition-transform ${openMenu ? "rotate-180" : ""}`} />
            </button>
            {openMenu && (
              <div className="absolute left-0 top-[calc(100%+8px)] z-[90] max-h-72 w-full min-w-56 overflow-y-auto rounded-md border border-[#E5E7EB] bg-[#FFFFFF] p-1 shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
                <button
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setVertical(""); setOpenMenu(false); }}
                  className={`block w-full rounded-sm px-3 py-2.5 text-left text-sm font-bold transition ${vertical === "" ? "bg-[#0A0A0A] text-white" : "text-[#0A0A0A] hover:bg-[#FFCC00]/18"}`}
                >
                  {c.allVerticals}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setVertical(cat.slug); setOpenMenu(false); }}
                    className={`block w-full rounded-sm px-3 py-2.5 text-left text-sm font-bold transition ${cat.slug === vertical ? "bg-[#0A0A0A] text-white" : "text-[#0A0A0A] hover:bg-[#FFCC00]/18"}`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="mt-1 flex min-h-12 w-full items-center justify-center rounded-sm bg-[#FFCC00] text-[11px] font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition-all duration-150 hover:bg-white"
        >
          {c.submit}
        </button>
      </form>

      <p className="mt-4 text-center text-[11px] text-white/35">
        <span className="mr-1 text-[#FFCC00]/70">ℹ</span>
        {c.info}
      </p>
    </div>
  );
}
