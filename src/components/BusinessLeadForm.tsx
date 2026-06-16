"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

export function BusinessLeadForm() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const page = typeof window !== "undefined" ? window.location.href : "";
    const subject = encodeURIComponent(`Solicitud ${siteConfig.name}: ${businessName || "negocio"}`);
    const body = encodeURIComponent([
      `Negocio: ${businessName}`,
      `Email: ${email}`,
      `Página vista: ${page}`,
      "",
      message || `Quiero revisar o mejorar mi ficha en ${siteConfig.name}.`
    ].join("\n"));

    window.location.href = `mailto:${siteConfig.contactEmail}?subject=${subject}&body=${body}`;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr]">
      <input
        value={businessName}
        onChange={(event) => setBusinessName(event.target.value)}
        placeholder="Nombre del negocio"
        className="min-h-12 border-white/30 bg-white/15 px-4 text-sm text-paper placeholder:text-sage focus:border-coral focus:ring-coral"
      />
      <input
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        type="email"
        placeholder="Email"
        className="min-h-12 border-white/30 bg-white/15 px-4 text-sm text-paper placeholder:text-sage focus:border-coral focus:ring-coral"
      />
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Qué necesitas"
        className="min-h-12 border-white/30 bg-white/15 px-4 text-sm text-paper placeholder:text-sage focus:border-coral focus:ring-coral md:col-span-2"
      />
      <button type="submit" className="min-h-12 rounded-md bg-coral px-6 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-coral/90 md:justify-self-start">
        Quiero aparecer
      </button>
    </form>
  );
}
