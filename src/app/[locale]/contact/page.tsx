import { ContactForm } from "@/components/ContactForm";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";

const pageCopy = {
  es: {
    metaTitle: "Solicitar auditoría de visibilidad | Mallorca Verified",
    metaDescription: "Auditamos tu visibilidad en Google, ChatGPT y Google AI sin coste. Somos los creadores de Mallorca Verified — sabemos qué funciona para negocios locales en Mallorca.",
    eyebrow: "Auditoría gratuita",
    title: "¿Cómo de visible eres en Google y en los sistemas de IA?",
    description: "Analizamos tu presencia local sin coste: cómo apareces en Google, qué citan ChatGPT y Perplexity cuando alguien busca tu categoría en Mallorca, y qué está frenando tu visibilidad. Sin compromiso.",
    trust: [
      "Sin coste ni compromiso",
      "Respuesta en menos de 48h",
      "Creamos el directorio de referencia para residentes internacionales en Mallorca"
    ]
  },
  en: {
    metaTitle: "Request a visibility audit | Mallorca Verified",
    metaDescription: "We audit your visibility on Google, ChatGPT and Google AI at no cost. We built Mallorca Verified — the reference directory for international residents in Mallorca.",
    eyebrow: "Free audit",
    title: "How visible is your business on Google and AI systems?",
    description: "We analyse your local presence at no cost: how you appear on Google, what ChatGPT and Perplexity cite when someone searches your category in Mallorca, and what's holding back your visibility. No commitment.",
    trust: [
      "No cost, no commitment",
      "Response within 48 hours",
      "We built the reference directory for international residents in Mallorca"
    ]
  },
  de: {
    metaTitle: "Sichtbarkeits-Audit anfordern | Mallorca Verified",
    metaDescription: "Wir analysieren deine Sichtbarkeit auf Google, ChatGPT und Google AI kostenlos. Wir haben Mallorca Verified aufgebaut — das Referenzverzeichnis für internationale Bewohner auf Mallorca.",
    eyebrow: "Kostenloses Audit",
    title: "Wie sichtbar bist du auf Google und in KI-Systemen?",
    description: "Wir analysieren deine lokale Präsenz kostenlos: wie du auf Google erscheinst, was ChatGPT und Perplexity zitieren, wenn jemand deine Kategorie auf Mallorca sucht, und was deine Sichtbarkeit bremst. Ohne Verpflichtung.",
    trust: [
      "Kein Aufwand, keine Verpflichtung",
      "Antwort innerhalb von 48 Stunden",
      "Wir haben das Referenzverzeichnis für internationale Bewohner auf Mallorca aufgebaut"
    ]
  }
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const copy = pageCopy[safeLocale];
  return generateSeoMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: `/${safeLocale}/contact`,
    locale: safeLocale
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const copy = pageCopy[safeLocale];

  return (
    <main className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_50%,#FFFFFF_100%)] min-h-screen">
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_480px] lg:items-start">

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0A0A0A]">{copy.eyebrow}</p>
            <h1 className="mt-4 font-sans text-4xl font-black leading-tight text-ink sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink/65">{copy.description}</p>
            <ul className="mt-8 space-y-3">
              {copy.trust.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink/70">
                  <span className="mt-0.5 shrink-0 text-[#0A0A0A]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_45px_rgba(10,10,10,0.06)] sm:p-8">
            <ContactForm locale={safeLocale} />
          </div>

        </div>
      </section>
    </main>
  );
}
