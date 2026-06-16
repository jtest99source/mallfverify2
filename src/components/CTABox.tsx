import { BusinessLeadForm } from "@/components/BusinessLeadForm";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    title: "Tu negocio aparece en Mallorca Verified?",
    text: "Solicita una propuesta para enriquecer tu ficha con fotos reales, servicios, carta, horarios y descripcion editorial. Una ficha bien trabajada es mas facil de encontrar en Google y de citar en respuestas de ChatGPT, Perplexity o Google AI cuando alguien pregunta por opciones en Mallorca.",
    note: "Las posiciones en rankings no cambian. Solo enriquecemos la informacion disponible."
  },
  en: {
    title: "Is your business listed on Mallorca Verified?",
    text: "Request a proposal to enrich your profile with real photos, services, menus, opening hours and editorial context. A well structured profile is easier to find on Google and easier to cite in ChatGPT, Perplexity or Google AI answers about Mallorca.",
    note: "Ranking positions do not change. We only improve the information available."
  },
  de: {
    title: "Ist dein Betrieb auf Mallorca Verified gelistet?",
    text: "Fordere ein Angebot an, um dein Profil mit echten Fotos, Services, Speisekarten, Oeffnungszeiten und redaktionellem Kontext zu ergaenzen. Ein gut strukturiertes Profil ist bei Google leichter auffindbar und fuer ChatGPT, Perplexity oder Google AI leichter zitierbar.",
    note: "Ranking-Positionen aendern sich nicht. Wir verbessern nur die verfuegbaren Informationen."
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
