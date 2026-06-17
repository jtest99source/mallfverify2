import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    title: "¿Cuándo buscan tu categoría en Mallorca, apareces tú?",
    text: "Auditamos tu visibilidad en Google y en ChatGPT, Perplexity y Google AI de forma gratuita. Somos los creadores de Mallorca Verified — sabemos qué funciona.",
    note: "Sin coste ni compromiso. Solo una conversación.",
    cta: "Solicitar auditoría gratuita →"
  },
  en: {
    title: "When someone searches your category in Mallorca, do you show up?",
    text: "We audit your visibility on Google and on ChatGPT, Perplexity and Google AI for free. We built Mallorca Verified — we know what works.",
    note: "No cost, no commitment. Just a conversation.",
    cta: "Request a free audit →"
  },
  de: {
    title: "Wenn jemand deine Kategorie auf Mallorca sucht — erscheinst du?",
    text: "Wir analysieren deine Sichtbarkeit auf Google und bei ChatGPT, Perplexity und Google AI kostenlos. Wir haben Mallorca Verified aufgebaut — wir wissen, was funktioniert.",
    note: "Kein Aufwand, keine Verpflichtung. Nur ein Gespräch.",
    cta: "Kostenloses Audit anfordern →"
  }
} as const;

export function CTABox({ locale = "es" }: { locale?: Locale }) {
  const c = copy[locale];

  return (
    <section className="overflow-hidden rounded-lg bg-[linear-gradient(135deg,#17324E_0%,#0E5F66_58%,#0E8F72_100%)] px-6 py-10 text-white shadow-[0_18px_45px_rgba(27,46,75,0.16)] sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-3xl font-black leading-tight">{c.title}</p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/78">{c.text}</p>
          <p className="mt-3 rounded-md border border-white/15 bg-white/8 px-4 py-2.5 text-[11px] text-white/55">{c.note}</p>
        </div>
        <Link
          href={`/${locale}/contact`}
          className="shrink-0 rounded-md bg-white px-7 py-4 text-[11px] font-black uppercase tracking-[0.1em] text-[#10253D] transition-all duration-150 hover:bg-[#FFD166]"
        >
          {c.cta}
        </Link>
      </div>
    </section>
  );
}
