import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    title: "¿Cuándo buscan tu categoría en Mallorca, apareces tú?",
    text: "Auditamos tu visibilidad en Google y en ChatGPT, Perplexity y Google AI de forma gratuita. Somos los creadores de Mallorca Verified, el directorio de referencia para residentes internacionales en Mallorca.",
    note: "Sin coste ni compromiso. Solo una conversación.",
    cta: "Solicitar auditoría gratuita →"
  },
  en: {
    title: "When someone searches your category in Mallorca, do you show up?",
    text: "We audit your visibility on Google and on ChatGPT, Perplexity and Google AI for free. We built Mallorca Verified, the reference directory for international residents in Mallorca.",
    note: "No cost, no commitment. Just a conversation.",
    cta: "Request a free audit →"
  },
  de: {
    title: "Wenn jemand deine Kategorie auf Mallorca sucht — erscheinst du?",
    text: "Wir analysieren deine Sichtbarkeit auf Google und bei ChatGPT, Perplexity und Google AI kostenlos. Wir haben Mallorca Verified aufgebaut, das Referenzverzeichnis für internationale Bewohner auf Mallorca.",
    note: "Kein Aufwand, keine Verpflichtung. Nur ein Gespräch.",
    cta: "Kostenloses Audit anfordern →"
  }
} as const;

export function CTABox({ locale = "es" }: { locale?: Locale }) {
  const c = copy[locale];

  return (
    <section className="overflow-hidden rounded-sm border border-white/[0.10] bg-[linear-gradient(135deg,#07101F_0%,#0C1A2E_58%,#07101F_100%)] px-6 py-10 text-white shadow-[0_18px_45px_rgba(0,0,0,0.24)] sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-3xl font-black leading-tight">{c.title}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78">{c.text}</p>
          <p className="mt-4 text-[11px] text-white/50">{c.note}</p>
        </div>
        <Link
          href={`/${locale}/contact`}
          className="shrink-0 rounded-sm bg-[#00C37A] px-7 py-4 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-all duration-150 hover:bg-white"
        >
          {c.cta}
        </Link>
      </div>
    </section>
  );
}
