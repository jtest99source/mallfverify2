"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useState } from "react";
import { IconLanguage, IconSearch, IconShieldCheck } from "@tabler/icons-react";
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
    search: "Que necesitas",
    vertical: "Especialidad",
    language: "Idioma",
    allVerticals: "Todos los expertos",
    allLanguages: "Cualquier idioma",
    placeholder: "Abogado, dentista, gestor, inmobiliaria...",
    submit: "Buscar expertos"
  },
  en: {
    search: "What you need",
    vertical: "Specialism",
    language: "Language",
    allVerticals: "All experts",
    allLanguages: "Any language",
    placeholder: "Lawyer, dentist, tax advisor, estate agent...",
    submit: "Search experts"
  },
  de: {
    search: "Was du brauchst",
    vertical: "Fachgebiet",
    language: "Sprache",
    allVerticals: "Alle Experten",
    allLanguages: "Jede Sprache",
    placeholder: "Anwalt, Zahnarzt, Steuerberater, Immobilien...",
    submit: "Experten suchen"
  }
} as const;

export function ExpertHeroSearch({
  locale,
  categories,
  initialQuery = "",
  initialVertical = null,
  initialLanguage = null
}: ExpertHeroSearchProps) {
  const router = useRouter();
  const c = copy[locale];
  const [query, setQuery] = useState(initialQuery);
  const [vertical, setVertical] = useState(initialVertical ?? "");
  const [language, setLanguage] = useState(initialLanguage ?? "");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (vertical) params.set("v", vertical);
    if (language) params.set("l", language);
    const qs = params.toString();
    router.push(`/${locale}/experts${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-7 overflow-hidden rounded-lg border border-white/10 bg-[#0A0A0A]/70 p-1.5 shadow-[0_28px_80px_rgba(0,0,0,0.34)] backdrop-blur sm:mt-8"
    >
      <div className="grid gap-px sm:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)_minmax(0,0.75fr)_auto]">
        <label className="grid gap-1 bg-[#0A0A0A] px-4 py-3">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">{c.search}</span>
          <span className="flex items-center gap-3">
            <IconSearch size={18} className="shrink-0 text-white/50" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={c.placeholder}
              className="h-9 min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-black text-white placeholder:text-white/35 focus:ring-0"
            />
          </span>
        </label>

        <label className="grid gap-1 bg-[#0A0A0A] px-4 py-3">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">{c.vertical}</span>
          <span className="flex items-center gap-3">
            <IconShieldCheck size={18} className="shrink-0 text-white/50" />
            <select
              value={vertical}
              onChange={(event) => setVertical(event.target.value)}
              className="h-9 min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-black text-white focus:ring-0 [&_option]:text-[#0A0A0A]"
            >
              <option value="">{c.allVerticals}</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.title}
                </option>
              ))}
            </select>
          </span>
        </label>

        <label className="grid gap-1 bg-[#0A0A0A] px-4 py-3">
          <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">{c.language}</span>
          <span className="flex items-center gap-3">
            <IconLanguage size={18} className="shrink-0 text-white/50" />
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="h-9 min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-black text-white focus:ring-0 [&_option]:text-[#0A0A0A]"
            >
              <option value="">{c.allLanguages}</option>
              <option value="English">English</option>
              <option value="Deutsch">Deutsch</option>
            </select>
          </span>
        </label>

        <button
          type="submit"
          className="min-h-14 rounded-md bg-[#FFCC00] px-8 text-[12px] font-black uppercase tracking-[0.14em] text-[#0A0A0A] transition hover:bg-white sm:min-h-full"
        >
          {c.submit}
        </button>
      </div>
    </form>
  );
}
