"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconMapPin, IconShieldCheck } from "@tabler/icons-react";
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
    expertLabel: "Experto",
    locationLabel: "Localidad",
    allExperts: "Todos los expertos",
    allLocations: "Toda Mallorca",
    submit: "Buscar expertos",
    palma: "Palma de Mallorca",
    southwest: "Calvià / Costa de Calvià",
    northeast: "Alcúdia / Port d'Alcúdia",
    center: "Interior / Serra de Tramuntana"
  },
  en: {
    expertLabel: "Expert",
    locationLabel: "Location",
    allExperts: "All experts",
    allLocations: "All Mallorca",
    submit: "Search experts",
    palma: "Palma de Mallorca",
    southwest: "Calvià / Costa de Calvià",
    northeast: "Alcúdia / Port d'Alcúdia",
    center: "Interior / Tramuntana"
  },
  de: {
    expertLabel: "Experte",
    locationLabel: "Ort",
    allExperts: "Alle Experten",
    allLocations: "Ganz Mallorca",
    submit: "Experten suchen",
    palma: "Palma de Mallorca",
    southwest: "Calvià / Costa de Calvià",
    northeast: "Alcúdia / Port d'Alcúdia",
    center: "Inland / Tramuntana"
  }
} as const;

export function ExpertHeroSearch({
  locale,
  categories,
  initialVertical = null,
}: ExpertHeroSearchProps) {
  const router = useRouter();
  const c = copy[locale];
  const [vertical, setVertical] = useState(initialVertical ?? "");
  const [location, setLocation] = useState("");
  const [openMenu, setOpenMenu] = useState<"expert" | "location" | null>(null);
  const rootRef = useRef<HTMLFormElement | null>(null);

  const selectedExpertLabel = categories.find((cat) => cat.slug === vertical)?.title ?? c.allExperts;

  const locations = [
    { value: "palma", label: c.palma },
    { value: "southwest", label: c.southwest },
    { value: "northeast", label: c.northeast },
    { value: "center", label: c.center },
  ];
  const selectedLocationLabel = locations.find((l) => l.value === location)?.label ?? c.allLocations;

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (vertical) params.set("v", vertical);
    if (location) params.set("q", location);
    const qs = params.toString();
    router.push(`/${locale}/experts${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      ref={rootRef}
      onSubmit={onSubmit}
      className="relative z-30 mx-auto mt-8 w-full max-w-[650px] overflow-visible rounded-md border border-white/20 bg-[#07101F]/78 p-1 shadow-[0_28px_80px_rgba(0,0,0,0.58)] backdrop-blur-md"
    >
      <div className="grid sm:grid-cols-2 sm:items-stretch">
        {/* EXPERT TYPE */}
        <div className="relative z-40 px-5 py-4 sm:border-r sm:border-white/10">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenu((v) => v === "expert" ? null : "expert"); }}
            className="flex h-10 w-full items-center gap-3 text-left"
            aria-expanded={openMenu === "expert"}
          >
            <IconShieldCheck aria-hidden="true" size={18} className="shrink-0 text-white/55" />
            <span className="min-w-0 flex-1 truncate text-[15px] font-black text-white">{selectedExpertLabel}</span>
            <IconChevronDown aria-hidden="true" size={17} className={`shrink-0 text-white/40 transition-transform ${openMenu === "expert" ? "rotate-180" : ""}`} />
          </button>
          {openMenu === "expert" && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-[90] max-h-72 w-full min-w-56 overflow-y-auto rounded-md border border-[#E5E7EB] bg-[#FFFFFF] p-1 shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setVertical(""); setOpenMenu(null); }}
                className={`block w-full rounded-sm px-3 py-2.5 text-left text-sm font-bold transition ${vertical === "" ? "bg-[#07101F] text-white" : "text-[#0A0A0A] hover:bg-[#00C37A]/18"}`}
              >
                {c.allExperts}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setVertical(cat.slug); setOpenMenu(null); }}
                  className={`block w-full rounded-sm px-3 py-2.5 text-left text-sm font-bold transition ${cat.slug === vertical ? "bg-[#07101F] text-white" : "text-[#0A0A0A] hover:bg-[#00C37A]/18"}`}
                >
                  {cat.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LOCATION */}
        <div className="relative z-40 border-t border-white/10 px-5 py-4 sm:border-t-0">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setOpenMenu((v) => v === "location" ? null : "location"); }}
            className="flex h-10 w-full items-center gap-3 text-left"
            aria-expanded={openMenu === "location"}
          >
            <IconMapPin aria-hidden="true" size={18} className="shrink-0 text-white/55" />
            <span className="min-w-0 flex-1 truncate text-[15px] font-black text-white">{selectedLocationLabel}</span>
            <IconChevronDown aria-hidden="true" size={17} className={`shrink-0 text-white/40 transition-transform ${openMenu === "location" ? "rotate-180" : ""}`} />
          </button>
          {openMenu === "location" && (
            <div className="absolute left-0 top-[calc(100%+8px)] z-[90] max-h-72 w-full min-w-56 overflow-y-auto rounded-md border border-[#E5E7EB] bg-[#FFFFFF] p-1 shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
              <button
                type="button"
                onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setLocation(""); setOpenMenu(null); }}
                className={`block w-full rounded-sm px-3 py-2.5 text-left text-sm font-bold transition ${location === "" ? "bg-[#07101F] text-white" : "text-[#0A0A0A] hover:bg-[#00C37A]/18"}`}
              >
                {c.allLocations}
              </button>
              {locations.map((loc) => (
                <button
                  key={loc.value}
                  type="button"
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setLocation(loc.value); setOpenMenu(null); }}
                  className={`block w-full rounded-sm px-3 py-2.5 text-left text-sm font-bold transition ${loc.value === location ? "bg-[#07101F] text-white" : "text-[#0A0A0A] hover:bg-[#00C37A]/18"}`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-1 flex min-h-12 w-full items-center justify-center rounded-sm bg-[#00C37A] text-[11px] font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition-all duration-150 hover:bg-white"
      >
        {c.submit}
      </button>
    </form>
  );
}
