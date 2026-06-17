"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    defaultBusiness: "negocio",
    businessName: "Nombre del negocio",
    email: "Tu email",
    message: "¿Qué necesitas? (opcional)",
    defaultMessage: `Quiero revisar o mejorar mi ficha en ${siteConfig.name}.`,
    pageViewed: "Página vista",
    submit: "Escríbenos →"
  },
  en: {
    defaultBusiness: "business",
    businessName: "Business name",
    email: "Your email",
    message: "What do you need? (optional)",
    defaultMessage: `I want to review or improve my profile on ${siteConfig.name}.`,
    pageViewed: "Page viewed",
    submit: "Contact us ->"
  },
  de: {
    defaultBusiness: "Betrieb",
    businessName: "Name des Betriebs",
    email: "Deine E-Mail",
    message: "Was brauchst du? (optional)",
    defaultMessage: `Ich möchte mein Profil auf ${siteConfig.name} prüfen oder verbessern.`,
    pageViewed: "Gesehene Seite",
    submit: "Kontakt aufnehmen ->"
  }
} as const;

export function BusinessLeadForm({ locale = "es" }: { locale?: Locale }) {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const c = copy[locale];

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const page = typeof window !== "undefined" ? window.location.href : "";
    const subject = encodeURIComponent(`${siteConfig.name}: ${businessName || c.defaultBusiness}`);
    const body = encodeURIComponent(
      [
        `${c.businessName}: ${businessName}`,
        `Email: ${email}`,
        `${c.pageViewed}: ${page}`,
        "",
        message || c.defaultMessage
      ].join("\n")
    );
    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;
  }

  const inputClass =
    "w-full min-h-12 rounded-md border border-white/25 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none transition-colors duration-150 focus:border-white/60 focus:bg-white/15";

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr]">
      <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={c.businessName} className={inputClass} />
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={c.email} className={inputClass} />
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder={c.message} className={`${inputClass} md:col-span-2`} />
      <div className="md:col-span-2">
        <button
          type="submit"
          className="min-h-12 rounded-md bg-coral px-8 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-coral/90"
        >
          {c.submit}
        </button>
      </div>
    </form>
  );
}
