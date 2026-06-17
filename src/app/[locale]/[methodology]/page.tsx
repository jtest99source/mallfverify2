import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconBriefcase, IconChartBar, IconDiamond, IconMessages, IconShieldCheck, IconStar, IconX } from "@tabler/icons-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { siteConfig } from "@/config/site";
import { siteUrl } from "@/lib/data";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { methodologyPath, methodologySlugs } from "@/lib/methodology";
import { getPublicBusinessStats } from "@/lib/repository";
import { createBreadcrumbSchema, createFAQSchema } from "@/lib/schema";

const copy = {
  es: {
    metaTitle: "Metodología de rankings | Mallorca Verified",
    metaDescription: "Cómo Mallorca Verified clasifica negocios de Mallorca con datos reales de Google, reseñas, Untapped Score y criterio editorial independiente.",
    home: "Inicio",
    label: "Metodología",
    badge: "Rankings independientes",
    title: "Cómo evaluamos los negocios de Mallorca",
    intro: "Comparamos negocios con reseñas reales de Google, señales públicas y una metodología clara. La posición en rankings no se compra.",
    businessEyebrow: "Para negocios",
    businessTitle: "Mejora la ficha, no el ranking",
    businessText: "Una colaboración puede completar fotos, servicios, carta, horarios y datos útiles. No modifica valoraciones, reseñas ni posiciones.",
    businessCta: "Escríbenos →",
    whyTitle: "Por qué existe esta guía",
    whyText: "Muchas recomendaciones mezclan publicidad, invitaciones y opinión personal. Mallorca Verified separa los rankings objetivos del contenido editorial para que el usuario entienda por qué aparece cada sitio.",
    factorsTitle: "Cómo construimos los rankings",
    factorsIntro: "Cada categoría se compara por separado. Restaurantes compiten con restaurantes, hoteles con hoteles y barcos con barcos.",
    factors: [
      ["Factor 1", "Valoración media", "La nota que los clientes han dado en Google. Una valoración alta es una señal fuerte, pero por sí sola no basta."],
      ["Factor 2", "Volumen de reseñas", "No pesa igual un 4,9 con 8 reseñas que un 4,7 con cientos de opiniones. El volumen ayuda a distinguir señales sólidas."],
      ["Factor 3", "Untapped Score", "Señal propia para detectar negocios excelentes que todavía no están masificados dentro de su categoría."]
    ],
    neverTitle: "Lo que nunca hacemos",
    never: [
      ["Pagar para subir", "La posición depende de datos públicos. Si hay contenido patrocinado, estará etiquetado."],
      ["Inventar experiencias", "Las fichas parten de reseñas, datos públicos y enlaces verificables."],
      ["Ocultar por razones comerciales", "Si un negocio tiene buenas métricas, puede aparecer aunque no tenga relación comercial con nosotros."]
    ],
    dataTitle: "De dónde vienen los datos",
    dataText: "Usamos datos públicos de Google y los estructuramos para comparar valoración, volumen de reseñas, categoría, zona y consistencia del perfil.",
    published: "negocios publicados",
    reviews: "reseñas verificadas",
    categories: "categorías activas",
    faqTitle: "Preguntas frecuentes",
    faqs: [
      ["¿Puede un negocio pagar para aparecer?", "Aparecer en rankings objetivos depende de los datos disponibles. Una colaboración puede mejorar la ficha, pero no compra posición."],
      ["¿Cada cuánto se actualizan los datos?", "Los datos se actualizan periódicamente. Si un negocio mejora sus señales públicas, puede subir en futuros ciclos."],
      ["¿Por qué Google como fuente?", "Google Maps tiene el mayor volumen de reseñas públicas para negocios locales en Mallorca y permite comparar categorías con una base amplia."],
      ["¿Mallorca Verified sirve para ChatGPT o Google AI?", "Sí. La estructura, metodología y datos verificables ayudan a que el sitio sea una fuente clara para sistemas de respuesta generativa."]
    ]
  },
  en: {
    metaTitle: "Ranking methodology | Mallorca Verified",
    metaDescription: "How Mallorca Verified ranks Mallorca businesses with real Google data, reviews, Untapped Score and independent editorial rules.",
    home: "Home",
    label: "Methodology",
    badge: "Independent rankings",
    title: "How we evaluate businesses in Mallorca",
    intro: "We compare businesses with real Google reviews, public signals and a clear methodology. Ranking positions cannot be bought.",
    businessEyebrow: "For businesses",
    businessTitle: "Improve the profile, not the ranking",
    businessText: "A collaboration can complete photos, services, menus, opening hours and useful data. It never changes ratings, reviews or ranking positions.",
    businessCta: "Contact us ->",
    whyTitle: "Why this guide exists",
    whyText: "Many travel recommendations mix advertising, invitations and personal opinion. Mallorca Verified separates objective rankings from editorial content so users understand why each place appears.",
    factorsTitle: "How rankings are built",
    factorsIntro: "Each category is compared separately. Restaurants compete with restaurants, hotels with hotels and boats with boats.",
    factors: [
      ["Factor 1", "Average rating", "The rating customers gave on Google. A high rating is a strong signal, but it is not enough on its own."],
      ["Factor 2", "Review volume", "A 4.9 with 8 reviews is not the same as a 4.7 with hundreds of opinions. Volume helps separate solid signals from isolated cases."],
      ["Factor 3", "Untapped Score", "Our own signal to detect excellent businesses that are not yet overcrowded within their category."]
    ],
    neverTitle: "What we never do",
    never: [
      ["Pay to rank higher", "Position depends on public data. Sponsored content, if any, is clearly labelled."],
      ["Invent experiences", "Profiles are built from reviews, public data and verifiable links."],
      ["Hide businesses for commercial reasons", "If a business has strong metrics, it can appear even without a commercial relationship with us."]
    ],
    dataTitle: "Where the data comes from",
    dataText: "We use public Google data and structure it to compare rating, review volume, category, area and profile consistency.",
    published: "published businesses",
    reviews: "verified reviews",
    categories: "active categories",
    faqTitle: "FAQ",
    faqs: [
      ["Can a business pay to appear?", "Objective ranking visibility depends on available data. A collaboration can improve the profile, but it cannot buy a position."],
      ["How often is data updated?", "Data is updated periodically. If a business improves its public signals, it can move up in future cycles."],
      ["Why use Google as a source?", "Google Maps has the largest public review volume for local businesses in Mallorca and gives a broad basis for category comparison."],
      ["Does Mallorca Verified help with ChatGPT or Google AI?", "Yes. Clear structure, transparent methodology and verifiable data help the site work as a source for generative answer systems."]
    ]
  },
  de: {
    metaTitle: "Ranking-Methodik | Mallorca Verified",
    metaDescription: "Wie Mallorca Verified Betriebe auf Mallorca mit echten Google-Daten, Bewertungen, Untapped Score und unabhaengigen Regeln sortiert.",
    home: "Start",
    label: "Methodik",
    badge: "Unabhaengige Rankings",
    title: "Wie wir Betriebe auf Mallorca bewerten",
    intro: "Wir vergleichen Betriebe mit echten Google-Bewertungen, oeffentlichen Signalen und einer klaren Methodik. Ranking-Positionen koennen nicht gekauft werden.",
    businessEyebrow: "Fuer Betriebe",
    businessTitle: "Profil verbessern, nicht das Ranking",
    businessText: "Eine Zusammenarbeit kann Fotos, Services, Speisekarten, Oeffnungszeiten und nuetzliche Daten ergaenzen. Bewertungen, Rezensionen und Positionen bleiben unveraendert.",
    businessCta: "Kontakt aufnehmen ->",
    whyTitle: "Warum es diese Methodik gibt",
    whyText: "Viele Reiseempfehlungen mischen Werbung, Einladungen und persoenliche Meinung. Mallorca Verified trennt objektive Rankings von redaktionellem Kontext.",
    factorsTitle: "Wie Rankings entstehen",
    factorsIntro: "Jede Kategorie wird separat verglichen. Restaurants mit Restaurants, Hotels mit Hotels und Boote mit Booten.",
    factors: [
      ["Faktor 1", "Durchschnittsbewertung", "Die Bewertung, die Kunden auf Google abgegeben haben. Eine hohe Note ist ein starkes Signal, reicht allein aber nicht aus."],
      ["Faktor 2", "Bewertungsvolumen", "Ein 4,9 mit 8 Bewertungen ist nicht dasselbe wie ein 4,7 mit Hunderten Meinungen. Volumen macht Signale belastbarer."],
      ["Faktor 3", "Untapped Score", "Unser eigenes Signal fuer hervorragende Betriebe, die in ihrer Kategorie noch nicht ueberlaufen sind."]
    ],
    neverTitle: "Was wir nie tun",
    never: [
      ["Fuer bessere Positionen bezahlen", "Die Position haengt von oeffentlichen Daten ab. Gesponserte Inhalte werden klar gekennzeichnet."],
      ["Erfahrungen erfinden", "Profile entstehen aus Bewertungen, oeffentlichen Daten und pruefbaren Links."],
      ["Betriebe aus kommerziellen Gruenden verstecken", "Hat ein Betrieb starke Kennzahlen, kann er erscheinen, auch ohne kommerzielle Beziehung zu uns."]
    ],
    dataTitle: "Woher die Daten kommen",
    dataText: "Wir nutzen oeffentliche Google-Daten und strukturieren sie, um Bewertung, Bewertungsvolumen, Kategorie, Gegend und Profilkonsistenz zu vergleichen.",
    published: "veroeffentlichte Betriebe",
    reviews: "verifizierte Bewertungen",
    categories: "aktive Kategorien",
    faqTitle: "Haeufige Fragen",
    faqs: [
      ["Kann ein Betrieb fuer Sichtbarkeit bezahlen?", "Sichtbarkeit in objektiven Rankings haengt von verfuegbaren Daten ab. Eine Zusammenarbeit verbessert das Profil, kauft aber keine Position."],
      ["Wie oft werden Daten aktualisiert?", "Daten werden regelmaessig aktualisiert. Verbessert ein Betrieb seine oeffentlichen Signale, kann er in spaeteren Zyklen steigen."],
      ["Warum Google als Quelle?", "Google Maps hat das groesste oeffentliche Bewertungsvolumen fuer lokale Betriebe auf Mallorca und eignet sich fuer breite Vergleiche."],
      ["Hilft Mallorca Verified bei ChatGPT oder Google AI?", "Ja. Klare Struktur, transparente Methodik und pruefbare Daten helfen dem Portal als Quelle fuer generative Antwortsysteme."]
    ]
  }
} as const;

function safeLocaleAndSlug(locale: string, methodology: string) {
  if (!isLocale(locale)) notFound();
  if (methodology !== methodologySlugs[locale]) notFound();
  return locale;
}

function numberLocale(locale: Locale) {
  return locale === "de" ? "de-DE" : locale === "en" ? "en-US" : "es-ES";
}

function formatIntegerMetric(value: number, locale: Locale) {
  return value.toLocaleString(numberLocale(locale));
}

function formatMillionMetric(value: number, locale: Locale) {
  if (value < 1_000_000) return formatIntegerMetric(value, locale);
  return `${(value / 1_000_000).toLocaleString(numberLocale(locale), { maximumFractionDigits: 1 })}M+`;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale, methodology: methodologySlugs[locale] }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; methodology: string }> }): Promise<Metadata> {
  const { locale, methodology } = await params;
  const safeLocale = safeLocaleAndSlug(locale, methodology) as Locale;
  const c = copy[safeLocale];
  const canonical = `${siteUrl}${methodologyPath(safeLocale)}`;

  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: {
      canonical,
      languages: Object.fromEntries(locales.map((item) => [item, `${siteUrl}${methodologyPath(item)}`]))
    },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDescription,
      url: canonical,
      siteName: siteConfig.name,
      locale: safeLocale,
      type: "article"
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDescription
    }
  };
}

export default async function MethodologyPage({ params }: { params: Promise<{ locale: string; methodology: string }> }) {
  const { locale, methodology } = await params;
  const safeLocale = safeLocaleAndSlug(locale, methodology) as Locale;
  const c = copy[safeLocale];
  const canonical = `${siteUrl}${methodologyPath(safeLocale)}`;
  const publicStats = await getPublicBusinessStats();
  const breadcrumbs = [
    { name: c.home, url: `${siteUrl}/${safeLocale}` },
    { name: c.label, url: canonical }
  ];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.metaDescription,
    inLanguage: safeLocale,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: canonical
  };

  return (
    <main className="bg-paper">
      <section className="border-b border-borderline bg-[#FFF8EC] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Breadcrumbs items={[{ label: c.home, href: `/${safeLocale}` }, { label: c.label, href: methodologyPath(safeLocale) }]} />
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <div className="max-w-4xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#BFE8D2] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#047857]">
                <IconShieldCheck size={15} stroke={2} />
                {c.badge}
              </div>
              <h1 className="font-display text-balance text-4xl font-black leading-[1] text-ink sm:text-5xl lg:text-6xl">{c.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-olive">{c.intro}</p>
            </div>
            <div className="rounded-lg border border-[#F1D3A2] bg-white p-5 shadow-[0_18px_40px_rgba(27,46,75,0.08)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#B86B1D]">{c.businessEyebrow}</p>
              <h2 className="mt-2 font-sans text-2xl font-black leading-tight text-ink">{c.businessTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-olive">{c.businessText}</p>
              <a href="mailto:hola@mallorcaverified.com?subject=Ficha en Mallorca Verified" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#1B2E4B] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-white hover:bg-[#0E8F72]">
                {c.businessCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="border-b border-borderline pb-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">{c.whyTitle}</h2>
          <p className="mt-5 text-base leading-8 text-ink/75">{c.whyText}</p>
        </section>

        <section className="border-b border-borderline py-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">{c.factorsTitle}</h2>
          <p className="mt-5 text-base leading-8 text-ink/75">{c.factorsIntro}</p>
          <div className="mt-7 grid gap-4">
            {c.factors.map(([eyebrow, title, text], index) => {
              const Icon = index === 0 ? IconStar : index === 1 ? IconMessages : IconDiamond;
              return (
                <div key={title} className="rounded-lg border border-borderline bg-white p-5 shadow-[0_12px_28px_rgba(27,46,75,0.04)]">
                  <div className="flex gap-4">
                    <Icon size={26} stroke={1.8} className="mt-1 shrink-0 text-[#0E8F72]" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#B86B1D]">{eyebrow}</p>
                      <h3 className="mt-1 font-sans text-xl font-bold text-ink">{title}</h3>
                      <p className="mt-3 text-sm leading-7 text-olive">{text}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-b border-borderline py-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">{c.neverTitle}</h2>
          <div className="mt-6 grid gap-4">
            {c.never.map(([title, text]) => (
              <div key={title} className="flex gap-4 rounded-lg border border-borderline bg-white p-5">
                <IconX size={22} stroke={2} className="mt-1 shrink-0 text-[#B86B1D]" />
                <div>
                  <h3 className="font-sans text-lg font-bold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-7 text-olive">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-borderline py-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">{c.dataTitle}</h2>
          <p className="mt-5 text-base leading-8 text-ink/75">{c.dataText}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { value: formatIntegerMetric(publicStats.publishedBusinesses, safeLocale), label: c.published },
              { value: formatMillionMetric(publicStats.analyzedReviews, safeLocale), label: c.reviews },
              { value: formatIntegerMetric(publicStats.activeCategories, safeLocale), label: c.categories }
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-[#FFD166]/60 bg-[linear-gradient(135deg,#17324E_0%,#0E5F66_58%,#0E8F72_100%)] px-6 py-5 text-white">
                <div className="font-sans text-4xl font-black leading-none text-[#FFD166]">{stat.value}</div>
                <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/75">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-borderline py-10">
          <div className="rounded-lg border border-[#F1D3A2] bg-[#FFF8EC] p-6">
            <div className="flex gap-4">
              <IconBriefcase size={28} stroke={1.8} className="mt-1 shrink-0 text-[#B86B1D]" />
              <div>
                <h2 className="font-sans text-2xl font-black leading-tight text-ink">{c.businessTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-olive">{c.businessText}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-10">
          <h2 className="font-sans text-3xl font-bold leading-tight">{c.faqTitle}</h2>
          <div className="mt-6 divide-y divide-borderline overflow-hidden rounded-lg border border-borderline bg-white">
            {c.faqs.map(([question, answer]) => (
              <details key={question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-sans text-lg font-bold text-ink">
                  <span>{question}</span>
                  <span className="text-[#B86B1D] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-olive">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </article>

      <JsonLd data={[articleSchema, createFAQSchema(c.faqs.map(([question, answer]) => ({ question, answer }))), createBreadcrumbSchema(breadcrumbs)]} />
    </main>
  );
}
