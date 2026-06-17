"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    title: "¿Tu negocio no aparece en esta lista?",
    text: "La ficha básica es gratuita. Sugiérenos el local y lo revisamos.",
    namePlaceholder: "Nombre del negocio",
    areaPlaceholder: "Zona o localidad",
    cta: "Sugerir negocio →",
    sending: "Enviando...",
    success: "¡Recibido! Lo revisamos y te añadimos pronto."
  },
  en: {
    title: "Is your business missing from this list?",
    text: "The basic profile is free. Suggest it and we'll review it.",
    namePlaceholder: "Business name",
    areaPlaceholder: "Area or town",
    cta: "Suggest business →",
    sending: "Sending...",
    success: "Received! We'll review it and add it soon."
  },
  de: {
    title: "Fehlt dein Betrieb in dieser Liste?",
    text: "Das Basisprofil ist kostenlos. Schlage den Betrieb vor — wir prüfen ihn.",
    namePlaceholder: "Name des Betriebs",
    areaPlaceholder: "Gegend oder Ort",
    cta: "Betrieb vorschlagen →",
    sending: "Wird gesendet...",
    success: "Erhalten! Wir prüfen und ergänzen ihn bald."
  }
} as const;

export function BusinessListCTA({ locale }: { locale: Locale }) {
  const text = copy[locale];
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const page = typeof window !== "undefined" ? window.location.href : "";
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: name, area, page }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  const inputClass =
    "min-h-10 w-full rounded-md border border-[#BFE8D2] bg-white px-3 text-sm text-[#10253D] placeholder:text-[#4B5B4D]/50 outline-none transition-colors focus:border-[#0E8F72]";

  return (
    <div className="rounded-lg border border-[#BFE8D2] bg-[#F0FAF5] px-6 py-5 shadow-[0_8px_24px_rgba(14,143,114,0.06)]">
      <p className="text-sm font-bold text-[#10253D]">{text.title}</p>
      <p className="mt-1 text-[13px] leading-6 text-[#4B5B4D]">{text.text}</p>

      {status === "success" ? (
        <p className="mt-4 text-sm font-semibold text-[#0E8F72]">✓ {text.success}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={text.namePlaceholder}
            required
            className={inputClass}
          />
          <input
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={text.areaPlaceholder}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 rounded-md bg-[#0E8F72] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_4px_14px_rgba(14,143,114,0.25)] transition-all duration-150 hover:bg-[#047857] disabled:opacity-60"
          >
            {status === "loading" ? text.sending : text.cta}
          </button>
        </form>
      )}
    </div>
  );
}
