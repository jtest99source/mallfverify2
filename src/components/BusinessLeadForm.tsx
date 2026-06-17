"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    businessName: "Nombre del negocio",
    email: "Tu email",
    message: "¿Qué necesitas? (opcional)",
    submit: "Escríbenos →",
    sending: "Enviando...",
    success: "¡Recibido! Te contactamos pronto.",
    error: "Error al enviar. Inténtalo de nuevo."
  },
  en: {
    businessName: "Business name",
    email: "Your email",
    message: "What do you need? (optional)",
    submit: "Contact us →",
    sending: "Sending...",
    success: "Received! We'll be in touch soon.",
    error: "Something went wrong. Please try again."
  },
  de: {
    businessName: "Name des Betriebs",
    email: "Deine E-Mail",
    message: "Was brauchst du? (optional)",
    submit: "Kontakt aufnehmen →",
    sending: "Wird gesendet...",
    success: "Erhalten! Wir melden uns bald.",
    error: "Fehler beim Senden. Bitte versuche es erneut."
  }
} as const;

export function BusinessLeadForm({ locale = "es" }: { locale?: Locale }) {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const c = copy[locale];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    try {
      const page = typeof window !== "undefined" ? window.location.href : "";
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, email, message, page }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[120px] items-center justify-center rounded-md border border-white/20 bg-white/10 px-6 py-5 text-center">
        <p className="text-sm font-semibold text-white">✓ {c.success}</p>
      </div>
    );
  }

  const inputClass =
    "w-full min-h-12 rounded-md border border-white/25 bg-white/10 px-4 text-sm text-white placeholder:text-white/45 outline-none transition-colors duration-150 focus:border-white/60 focus:bg-white/15";

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr]">
      <input
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        placeholder={c.businessName}
        required
        className={inputClass}
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder={c.email}
        className={inputClass}
      />
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={c.message}
        className={`${inputClass} md:col-span-2`}
      />
      {status === "error" && (
        <p className="text-xs text-red-300 md:col-span-2">{c.error}</p>
      )}
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-12 rounded-md bg-coral px-8 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-coral/90 disabled:opacity-60"
        >
          {status === "loading" ? c.sending : c.submit}
        </button>
      </div>
    </form>
  );
}
