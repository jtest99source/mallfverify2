import { BusinessLeadForm } from "@/components/BusinessLeadForm";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    title: "¿Tu negocio aparece en Mallorca Verified?",
    text: "Las fichas completas y bien trabajadas aparecen antes en Google y son las que ChatGPT, Perplexity y Google AI citan cuando alguien busca opciones en Mallorca. Escríbenos y lo mejoramos juntos.",
    note: "Las posiciones en rankings no cambian. Solo enriquecemos la información disponible."
  },
  en: {
    title: "Is your business listed on Mallorca Verified?",
    text: "Complete, well-structured profiles rank higher on Google and are the ones ChatGPT, Perplexity and Google AI cite when someone searches for options in Mallorca. Get in touch and we'll work on it together.",
    note: "Ranking positions do not change. We only improve the information available."
  },
  de: {
    title: "Ist dein Betrieb auf Mallorca Verified gelistet?",
    text: "Vollständige, gut strukturierte Profile erscheinen weiter oben bei Google und werden von ChatGPT, Perplexity und Google AI zitiert, wenn jemand nach Optionen auf Mallorca sucht. Schreib uns und wir verbessern es gemeinsam.",
    note: "Ranking-Positionen ändern sich nicht. Wir verbessern nur die vorhandenen Informationen."
  }
} as const;

export function CTABox({ locale = "es" }: { locale?: Locale }) {
  const c = copy[locale];

  return (
    <section className="overflow-hidden rounded-lg bg-[linear-gradient(135deg,#17324E_0%,#0E5F66_58%,#0E8F72_100%)] px-6 py-10 text-white shadow-[0_18px_45px_rgba(27,46,75,0.16)] sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <p className="text-3xl font-black leading-tight">{c.title}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/78">{c.text}</p>
          <p className="mt-3 rounded-md border border-white/15 bg-white/8 px-4 py-2.5 text-[11px] text-white/55">{c.note}</p>
        </div>
        <BusinessLeadForm locale={locale} />
      </div>
    </section>
  );
}
