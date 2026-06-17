import { ContactForm } from "@/components/ContactForm";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";

const pageCopy = {
  es: {
    metaTitle: "Colabora con nosotros | Mallorca Verified",
    metaDescription: "¿Gestionas un negocio en Mallorca? Trabaja con nosotros para mejorar tu visibilidad en Google y en los sistemas de IA.",
    eyebrow: "Colabora con nosotros",
    title: "Haz que tu negocio sea más fácil de encontrar",
    description: "Una ficha completa en Mallorca Verified aparece antes en Google y es la que ChatGPT, Perplexity y Google AI citan cuando alguien busca opciones en Mallorca. Cuéntanos tu negocio y te explicamos qué podemos mejorar.",
    trust: [
      "Las posiciones en rankings no se modifican",
      "Solo enriquecemos la información disponible",
      "Respondemos en menos de 48 horas"
    ]
  },
  en: {
    metaTitle: "Work with us | Mallorca Verified",
    metaDescription: "Do you run a business in Mallorca? Work with us to improve your visibility on Google and AI systems.",
    eyebrow: "Work with us",
    title: "Make your business easier to find",
    description: "A complete profile on Mallorca Verified ranks higher on Google and is the one ChatGPT, Perplexity and Google AI cite when someone searches for options in Mallorca. Tell us about your business and we'll explain what we can improve.",
    trust: [
      "Ranking positions are never modified",
      "We only enrich the available information",
      "We respond within 48 hours"
    ]
  },
  de: {
    metaTitle: "Mit uns zusammenarbeiten | Mallorca Verified",
    metaDescription: "Betreibst du ein Unternehmen auf Mallorca? Arbeite mit uns, um deine Sichtbarkeit bei Google und in KI-Systemen zu verbessern.",
    eyebrow: "Mit uns zusammenarbeiten",
    title: "Mach deinen Betrieb leichter auffindbar",
    description: "Ein vollständiges Profil auf Mallorca Verified erscheint weiter oben bei Google und wird von ChatGPT, Perplexity und Google AI zitiert, wenn jemand nach Optionen auf Mallorca sucht. Erzähl uns von deinem Betrieb und wir erklären dir, was wir verbessern können.",
    trust: [
      "Ranking-Positionen werden nie verändert",
      "Wir ergänzen nur die verfügbaren Informationen",
      "Wir antworten innerhalb von 48 Stunden"
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
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_50%,#FFF8EC_100%)] min-h-screen">
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_480px] lg:items-start">

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#0E8F72]">{copy.eyebrow}</p>
            <h1 className="mt-4 font-sans text-4xl font-black leading-tight text-ink sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-ink/65">{copy.description}</p>
            <ul className="mt-8 space-y-3">
              {copy.trust.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink/70">
                  <span className="mt-0.5 shrink-0 text-[#0E8F72]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-[#E7DED0] bg-white p-6 shadow-[0_18px_45px_rgba(27,46,75,0.06)] sm:p-8">
            <ContactForm locale={safeLocale} />
          </div>

        </div>
      </section>
    </main>
  );
}
