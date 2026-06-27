"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    name: "Nombre del negocio",
    area: "Zona o localidad",
    link: "Web o enlace de Google Maps (opcional)",
    email: "Tu email — te avisamos cuando lo añadamos (opcional)",
    notes: "Algo más que debamos saber (opcional)",
    submit: "Enviar sugerencia →",
    sending: "Enviando...",
    success: "¡Gracias! Lo revisamos y te añadimos pronto.",
    error: "Error al enviar. Inténtalo de nuevo."
  },
  en: {
    name: "Business name",
    area: "Area or town",
    link: "Website or Google Maps link (optional)",
    email: "Your email — we'll let you know when it's added (optional)",
    notes: "Anything else we should know? (optional)",
    submit: "Submit suggestion →",
    sending: "Sending...",
    success: "Thanks! We'll review it and add it soon.",
    error: "Something went wrong. Please try again."
  },
  de: {
    name: "Name des Betriebs",
    area: "Gegend oder Ort",
    link: "Website oder Google Maps-Link (optional)",
    email: "Deine E-Mail — wir informieren dich, wenn er hinzugefügt wird (optional)",
    notes: "Noch etwas, das wir wissen sollten? (optional)",
    submit: "Vorschlag senden →",
    sending: "Wird gesendet...",
    success: "Danke! Wir prüfen es und ergänzen es bald.",
    error: "Fehler beim Senden. Bitte versuche es erneut."
  }
} as const;

export function SuggestForm({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const page = typeof window !== "undefined" ? window.location.href : "";
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: name, area, link, email, notes, page }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[180px] items-center justify-center rounded-sm border border-[#00C37A]/40 bg-[#00C37A]/10 px-8 py-10 text-center">
        <div>
          <p className="text-2xl text-[#00C37A]">✓</p>
          <p className="mt-3 text-base font-semibold text-white">{c.success}</p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-sm border border-white/[0.12] bg-[#07101F] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#00C37A]/60 focus:ring-1 focus:ring-[#00C37A]/30";

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={c.name} required className={inputClass} />
      <input value={area} onChange={(e) => setArea(e.target.value)} placeholder={c.area} className={inputClass} />
      <input value={link} onChange={(e) => setLink(e.target.value)} placeholder={c.link} className={inputClass} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={c.email} className={inputClass} />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={c.notes} rows={3} className={`${inputClass} resize-none`} />
      {status === "error" && <p className="text-xs text-red-500">{c.error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-1 rounded-sm bg-[#00C37A] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] transition-colors hover:bg-white disabled:opacity-60"
      >
        {status === "loading" ? c.sending : c.submit}
      </button>
    </form>
  );
}
