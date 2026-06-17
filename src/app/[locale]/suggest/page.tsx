import { SuggestForm } from "@/components/SuggestForm";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";

const pageCopy = {
  es: {
    metaTitle: "Sugerir un negocio | Mallorca Verified",
    metaDescription: "¿Conoces algún negocio en Mallorca que no aparece en nuestros rankings? Sugiérenos el local y lo revisamos.",
    eyebrow: "Sugerir negocio",
    title: "¿Echas en falta algún local?",
    description: "Si conoces un restaurante, hotel, beach club, barco u otro negocio en Mallorca que no aparece en nuestros rankings, cuéntanos. Lo revisamos, verificamos los datos y lo añadimos si cumple los criterios.",
    trust: [
      "La ficha básica es siempre gratuita",
      "Revisamos cada sugerencia manualmente",
      "Respondemos si nos das tu email"
    ]
  },
  en: {
    metaTitle: "Suggest a business | Mallorca Verified",
    metaDescription: "Know a business in Mallorca that's missing from our rankings? Suggest it and we'll review it.",
    eyebrow: "Suggest a business",
    title: "Know a place we're missing?",
    description: "If you know a restaurant, hotel, beach club, boat company or other business in Mallorca that isn't in our rankings, let us know. We'll review it, verify the data and add it if it meets our criteria.",
    trust: [
      "Basic listings are always free",
      "We review every suggestion manually",
      "We'll reply if you leave your email"
    ]
  },
  de: {
    metaTitle: "Betrieb vorschlagen | Mallorca Verified",
    metaDescription: "Kennst du einen Betrieb auf Mallorca, der in unseren Rankings fehlt? Schlage ihn vor und wir prüfen ihn.",
    eyebrow: "Betrieb vorschlagen",
    title: "Fehlt ein Betrieb?",
    description: "Wenn du ein Restaurant, Hotel, Beachclub, Bootsvermieter oder anderen Betrieb auf Mallorca kennst, der nicht in unseren Rankings erscheint, sag es uns. Wir prüfen es, verifizieren die Daten und fügen es hinzu, wenn es unsere Kriterien erfüllt.",
    trust: [
      "Basisprofile sind immer kostenlos",
      "Wir prüfen jeden Vorschlag manuell",
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
            <SuggestForm locale={safeLocale} />
          </div>

        </div>
      </section>
    </main>
  );
}
