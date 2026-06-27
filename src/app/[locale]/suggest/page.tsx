import { SuggestForm } from "@/components/SuggestForm";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";

const pageCopy = {
  es: {
    metaTitle: "Sugerir un negocio | Mallorca Verified",
    metaDescription: "¿Conoces algún negocio en Mallorca que debería estar en el directorio de referencia para residentes internacionales? Cuéntanoslo.",
    eyebrow: "Sugerir negocio",
    title: "¿Conoces un sitio que debería estar aquí?",
    description: "Mallorca Verified existe para que expats, compradores y residentes internacionales encuentren sitios buenos sin depender del azar. Si conoces un negocio que se lo ha ganado de verdad, cuéntanoslo.",
    trust: [
      "Revisión manual de cada sugerencia",
      "Sin coste si cumple el umbral de calidad",
      "Respondemos si nos dejas tu email"
    ]
  },
  en: {
    metaTitle: "Suggest a business | Mallorca Verified",
    metaDescription: "Know a business in Mallorca that should be in the reference directory for international residents? Tell us.",
    eyebrow: "Suggest a business",
    title: "Know a place that should be verified?",
    description: "Mallorca Verified exists so expats, buyers and international residents can find good places without relying on guesswork. If you know a business that's genuinely earned its reputation, tell us.",
    trust: [
      "Every suggestion reviewed manually",
      "Listed free if it meets the quality threshold",
      "We'll reply if you leave your email"
    ]
  },
  de: {
    metaTitle: "Betrieb vorschlagen | Mallorca Verified",
    metaDescription: "Kennst du einen Betrieb auf Mallorca, der im Referenzverzeichnis für internationale Bewohner sein sollte? Sag es uns.",
    eyebrow: "Betrieb vorschlagen",
    title: "Kennst du einen Ort, der hier sein sollte?",
    description: "Mallorca Verified gibt es damit Expats, Käufer und internationale Bewohner gute Orte finden, ohne auf Zufall angewiesen zu sein. Wenn du einen Betrieb kennst, der es wirklich verdient hat, sag es uns.",
    trust: [
      "Jeder Vorschlag wird manuell geprüft",
      "Kostenlos aufgenommen, wenn die Qualitätsschwelle erreicht wird",
      "Wir antworten, wenn du deine E-Mail angibst"
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
    path: `/${safeLocale}/suggest`,
    locale: safeLocale
  });
}

export default async function SuggestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const copy = pageCopy[safeLocale];

  return (
    <main className="min-h-screen bg-[#07101F] text-white">
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_480px] lg:items-start">

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00C37A]">{copy.eyebrow}</p>
            <h1 className="mt-4 font-display text-4xl font-black leading-tight text-white sm:text-5xl">{copy.title}</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/60">{copy.description}</p>
            <ul className="mt-8 space-y-3">
              {copy.trust.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/65">
                  <span className="mt-0.5 shrink-0 text-[#00C37A]">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6 sm:p-8">
            <SuggestForm locale={safeLocale} />
          </div>

        </div>
      </section>
    </main>
  );
}
