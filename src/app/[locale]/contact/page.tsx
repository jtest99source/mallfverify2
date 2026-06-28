import { ContactForm } from "@/components/ContactForm";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";

const pageCopy = {
  es: {
    metaTitle: "Solicitar auditoría de visibilidad | Mallorca Verified",
    metaDescription: "Auditamos tu visibilidad en Google, ChatGPT y Google AI sin coste. Somos los creadores de Mallorca Verified — sabemos qué funciona para negocios locales en Mallorca.",
    eyebrow: "Auditoría gratuita",
    title: "¿Apareces cuando alguien busca tu categoría en Mallorca?",
    description: "Analizamos tu presencia local sin coste: cómo apareces en Google, qué citan ChatGPT y Perplexity cuando alguien busca tu categoría, y qué frena tu visibilidad ahora mismo.",
    trust: [
      "Sin coste ni compromiso",
      "Respuesta en menos de 48h",
      "Somos los creadores de Mallorca Verified"
    ]
  },
  en: {
    metaTitle: "Request a visibility audit | Mallorca Verified",
    metaDescription: "We audit your visibility on Google, ChatGPT and Google AI at no cost. We built Mallorca Verified — the reference directory for international residents in Mallorca.",
    eyebrow: "Free audit",
    title: "Does your business appear when someone searches your category in Mallorca?",
    description: "We analyse your local presence at no cost: how you appear on Google, what ChatGPT and Perplexity cite when someone searches your category, and what's holding your visibility back right now.",
    trust: [
      "No cost, no commitment",
      "Response within 48 hours",
      "We built Mallorca Verified"
    ]
  },
  de: {
    metaTitle: "Sichtbarkeits-Audit anfordern | Mallorca Verified",
    metaDescription: "Wir analysieren deine Sichtbarkeit auf Google, ChatGPT und Google AI kostenlos. Wir haben Mallorca Verified aufgebaut — das Referenzverzeichnis für internationale Bewohner auf Mallorca.",
    eyebrow: "Kostenloses Audit",
    title: "Erscheinst du, wenn jemand deine Kategorie auf Mallorca sucht?",
    description: "Wir analysieren deine lokale Präsenz kostenlos: wie du auf Google erscheinst, was ChatGPT und Perplexity zitieren, wenn jemand deine Kategorie sucht, und was deine Sichtbarkeit gerade bremst.",
    trust: [
      "Kein Aufwand, keine Verpflichtung",
      "Antwort innerhalb von 48 Stunden",
      "Wir haben Mallorca Verified aufgebaut"
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
    <main className="min-h-screen bg-[#07101F] text-white">
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_480px] lg:items-start">

          <div className="text-center sm:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00C37A]">{copy.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-black leading-tight text-white sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">{copy.description}</p>
            <ul className="mt-8 space-y-3">
              {copy.trust.map((item) => (
                <li key={item} className="flex items-center justify-center gap-3 text-sm font-semibold text-white/70 sm:justify-start">
                  <span className="shrink-0 text-[#00C37A]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6 sm:p-8">
            <ContactForm locale={safeLocale} />
          </div>

        </div>
      </section>
    </main>
  );
}
