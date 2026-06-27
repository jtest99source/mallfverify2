"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    businessName: "Nombre del negocio",
    contactName: "Tu nombre",
    email: "Tu email",
    website: "Web del negocio (opcional)",
    message: "¿Cuál es tu situación actual? ¿Qué objetivo tienes? (opcional)",
    submit: "Solicitar auditoría gratuita →",
    sending: "Enviando...",
    success: "¡Recibido! Te contactamos en menos de 48h.",
    error: "Error al enviar. Inténtalo de nuevo."
  },
  en: {
    businessName: "Business name",
    contactName: "Your name",
    email: "Your email",
    website: "Business website (optional)",
    message: "What's your current situation? What are you trying to achieve? (optional)",
    submit: "Request a free audit →",
    sending: "Sending...",
    success: "Received! We'll get back to you within 48h.",
    error: "Something went wrong. Please try again."
  },
  de: {
    businessName: "Name des Betriebs",
    contactName: "Dein Name",
    email: "Deine E-Mail",
    website: "Website des Betriebs (optional)",
    message: "Wie ist deine aktuelle Situation? Was möchtest du erreichen? (optional)",
    submit: "Kostenloses Audit anfordern →",
    sending: "Wird gesendet...",
    success: "Erhalten! Wir melden uns innerhalb von 48h.",
    error: "Fehler beim Senden. Bitte versuche es erneut."
  }
} as const;

export function ContactForm({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const page = typeof window !== "undefined" ? window.location.href : "";
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, contactName, email, website, message, page }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-sm border border-[#FFCC00]/40 bg-[#FFCC00]/10 px-8 py-10 text-center">
        <div>
          <p className="text-2xl text-[#FFCC00]">✓</p>
          <p className="mt-3 text-base font-semibold text-white">{c.success}</p>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-sm border border-white/[0.12] bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition-colors focus:border-[#FFCC00]/60 focus:ring-1 focus:ring-[#FFCC00]/30";

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder={c.businessName} required className={inputClass} />
        <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder={c.contactName} className={inputClass} />
      </div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder={c.email} required className={inputClass} />
      <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder={c.website} className={inputClass} />
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={c.message} rows={4} className={`${inputClass} resize-none`} />
      {status === "error" && <p className="text-xs text-red-500">{c.error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-1 rounded-sm bg-[#FFCC00] px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] transition-colors hover:bg-white disabled:opacity-60"
      >
        {status === "loading" ? c.sending : c.submit}
      </button>
    </form>
  );
}
