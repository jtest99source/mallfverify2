import Link from "next/link";
import { CTABox } from "@/components/CTABox";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessAreaCategoryPages, getPublicBusinessStats } from "@/lib/repository";
import { getCategoryCopy } from "@/lib/i18n-copy";

const pageCopy = {
  es: {
    metaTitle: "Visibilidad en Google y en IA para negocios en Mallorca | Mallorca Verified",
    metaDescription: "Auditamos tu visibilidad en Google, ChatGPT y Google AI sin coste. Somos los creadores de Mallorca Verified — sabemos qué funciona para negocios locales en la isla.",
    eyebrow: "Para negocios en Mallorca",
    title: "Sé el primero que citan cuando alguien busca",
    intro: "Cada vez más viajeros usan ChatGPT, Perplexity o Google AI para decidir dónde ir en Mallorca. Nosotros construimos el directorio verificado más grande de la isla — y sabemos exactamente qué hace que un negocio aparezca primero.",
    contactEyebrow: "Auditoría gratuita",
    contactText: "Analizamos tu visibilidad en Google y en los sistemas de IA sin coste ni compromiso. Cuéntanos tu negocio.",
    contactCta: "Solicitar auditoría →",
    subject: "Solicitar auditoría de visibilidad",
    stats: {
      published: "Fichas publicadas",
      categories: "Categorías",
      reviews: "Reseñas analizadas",
      pages: "Páginas locales"
    },
    workEyebrow: "Cómo trabajamos",
    workTitle: "Desde la auditoría hasta la visibilidad",
    workIntro: "Empezamos analizando cómo apareces ahora — en Google, en ChatGPT y en Perplexity. A partir de ahí trabajamos lo que tiene más impacto.",
    products: [
      ["Auditoría de visibilidad", "Analizamos cómo apareces en Google y en los sistemas de IA. Te decimos qué está frenando tu visibilidad y qué se puede mejorar con datos reales."],
      ["Posicionamiento en IA", "Estructuramos tu contenido y datos para que ChatGPT, Perplexity y Google AI te citen cuando alguien busca opciones en Mallorca."],
      ["Ficha verificada", "Fotos reales, servicios, carta, horarios y descripción editorial en Mallorca Verified. Una ficha completa aparece antes y convence más."],
      ["SEO local", "Contenido optimizado para búsqueda local: páginas de zona, guías y textos que conectan tu negocio con las búsquedas de viajeros."]
    ],
    localContext: "Contexto local",
    areaTitle: "Páginas donde tu negocio puede aparecer",
    areaNote: "Cada una recibe búsquedas orgánicas de viajeros. Estar bien posicionado aquí multiplica tu visibilidad.",
    profiles: "fichas"
  },
  en: {
    metaTitle: "Google and AI visibility for businesses in Mallorca | Mallorca Verified",
    metaDescription: "Free visibility audit for your business on Google, ChatGPT and Google AI. We built Mallorca Verified — we know what works for local businesses on the island.",
    eyebrow: "For businesses in Mallorca",
    title: "Be the first one cited when someone searches",
    intro: "More and more travellers use ChatGPT, Perplexity or Google AI to decide where to go in Mallorca. We built the largest verified directory on the island — and we know exactly what makes a business show up first.",
    contactEyebrow: "Free audit",
    contactText: "We analyse your visibility on Google and AI systems at no cost, no commitment. Tell us about your business.",
    contactCta: "Request a free audit →",
    subject: "Request a visibility audit",
    stats: {
      published: "Published profiles",
      categories: "Categories",
      reviews: "Reviews analysed",
      pages: "Local pages"
    },
    workEyebrow: "How we work",
    workTitle: "From audit to visibility",
    workIntro: "We start by analysing how you appear right now — on Google, ChatGPT and Perplexity. From there we work on what has the most impact.",
    products: [
      ["Visibility audit", "We analyse how you appear on Google and AI systems. We tell you what's holding back your visibility and what can be improved with real data."],
      ["AI positioning", "We structure your content and data so ChatGPT, Perplexity and Google AI cite you when someone searches for options in Mallorca."],
      ["Verified listing", "Real photos, services, menus, opening hours and editorial description on Mallorca Verified. A complete listing ranks higher and converts better."],
      ["Local SEO", "Content optimised for local search: area pages, guides and copy that connects your business with traveller searches."]
    ],
    localContext: "Local context",
    areaTitle: "Pages where your business can appear",
    areaNote: "Each receives organic searches from travellers. Appearing here multiplies your visibility.",
    profiles: "profiles"
  },
  de: {
    metaTitle: "Google- und KI-Sichtbarkeit für Betriebe auf Mallorca | Mallorca Verified",
    metaDescription: "Kostenloses Sichtbarkeits-Audit für deinen Betrieb auf Google, ChatGPT und Google AI. Wir haben Mallorca Verified aufgebaut — wir wissen, was für lokale Betriebe funktioniert.",
    eyebrow: "Für Betriebe auf Mallorca",
    title: "Sei der Erste, der zitiert wird, wenn jemand sucht",
    intro: "Immer mehr Reisende nutzen ChatGPT, Perplexity oder Google AI, um zu entscheiden, wohin sie auf Mallorca gehen. Wir haben das größte verifizierte Verzeichnis der Insel aufgebaut — und wissen genau, was einen Betrieb an die erste Stelle bringt.",
    contactEyebrow: "Kostenloses Audit",
    contactText: "Wir analysieren deine Sichtbarkeit auf Google und in KI-Systemen kostenlos und ohne Verpflichtung. Erzähl uns von deinem Betrieb.",
    contactCta: "Audit anfordern →",
    subject: "Sichtbarkeits-Audit anfordern",
    stats: {
      published: "Veröffentlichte Profile",
      categories: "Kategorien",
      reviews: "Analysierte Bewertungen",
      pages: "Lokale Seiten"
    },
    workEyebrow: "Wie wir arbeiten",
    workTitle: "Vom Audit zur Sichtbarkeit",
    workIntro: "Wir beginnen damit zu analysieren, wie du aktuell erscheinst — auf Google, ChatGPT und Perplexity. Dann arbeiten wir an dem, was den größten Einfluss hat.",
    products: [
      ["Sichtbarkeits-Audit", "Wir analysieren, wie du auf Google und in KI-Systemen erscheinst. Wir sagen dir, was deine Sichtbarkeit bremst und was mit echten Daten verbessert werden kann."],
      ["KI-Positionierung", "Wir strukturieren deine Inhalte und Daten, damit ChatGPT, Perplexity und Google AI dich nennen, wenn jemand nach Optionen auf Mallorca sucht."],
      ["Verifiziertes Profil", "Echte Fotos, Leistungen, Speisekarte, Öffnungszeiten und redaktionelle Beschreibung auf Mallorca Verified. Ein vollständiges Profil erscheint weiter oben."],
      ["Lokales SEO", "Für lokale Suche optimierte Inhalte: Gebietsseiten, Guides und Texte, die deinen Betrieb mit Reisenden-Suchen verbinden."]
    ],
    localContext: "Lokaler Kontext",
    areaTitle: "Seiten, auf denen dein Betrieb erscheinen kann",
    areaNote: "Jede erhält organische Suchen von Reisenden. Gut positioniert zu sein multipliziert deine Sichtbarkeit.",
    profiles: "Profile"
  }
} as const;

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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const copy = pageCopy[safeLocale];
  return generateSeoMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: `/${safeLocale}/business`,
    locale: safeLocale
  });
}

export default async function BusinessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const copy = pageCopy[safeLocale];
  const [areaPages, publicStats] = await Promise.all([getBusinessAreaCategoryPages(5), getPublicBusinessStats()]);
  const stats = [
    { label: copy.stats.published, value: formatIntegerMetric(publicStats.publishedBusinesses, safeLocale) },
    { label: copy.stats.categories, value: formatIntegerMetric(publicStats.activeCategories, safeLocale) },
    { label: copy.stats.reviews, value: formatMillionMetric(publicStats.analyzedReviews, safeLocale) },
    { label: copy.stats.pages, value: `${areaPages.length}+` }
  ];

  return (
    <main className="bg-[linear-gradient(180deg,#FFF8EC_0%,#FFFDF7_48%,#FFF8EC_100%)]">
      <section className="border-b border-[#E7DED0] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0E8F72]">{copy.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-[0.96] text-[#10253D] sm:text-5xl lg:text-7xl">{copy.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[#4B5B4D]">{copy.intro}</p>
          </div>
          <div className="rounded-lg border border-[#E7DED0] bg-[#FFFDF7] p-6 shadow-[0_18px_45px_rgba(27,46,75,0.06)]">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#B86B1D]">{copy.contactEyebrow}</p>
            <p className="mt-4 text-sm leading-7 text-[#4B5B4D]">{copy.contactText}</p>
            <Link href={`/${safeLocale}/contact`} className="mt-6 block rounded-md bg-[#10253D] px-5 py-4 text-center text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0E8F72]">{copy.contactCta}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-lg border border-[#E7DED0] bg-[#FFFDF7] p-6 shadow-sm">
              <p className="text-4xl font-black text-[#10253D]">{item.value}</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#5F6F61]">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0E8F72]">{copy.workEyebrow}</p>
            <h2 className="mt-3 text-4xl font-black text-[#10253D]">{copy.workTitle}</h2>
            <p className="mt-5 text-sm leading-7 text-[#4B5B4D]">{copy.workIntro}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {copy.products.map(([title, text]) => (
              <article key={title} className="rounded-lg border border-[#E7DED0] bg-[#FFFDF7] p-6 shadow-[0_14px_34px_rgba(27,46,75,0.04)]">
                <h3 className="text-2xl font-black text-[#10253D]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#4B5B4D]">{text}</p>
              </article>
            ))}
          </div>
        </div>

        <section className="mt-12 rounded-lg border border-[#E7DED0] bg-[#FFF8EC] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E7DED0] pb-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0E8F72]">{copy.localContext}</p>
              <h2 className="mt-2 text-3xl font-black text-[#10253D]">{copy.areaTitle}</h2>
              <p className="mt-1.5 text-sm text-[#5F6F61]">{copy.areaNote}</p>
            </div>
            <Link href={`/${safeLocale}/contact`} className="rounded-md bg-[#10253D] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0E8F72]">{copy.contactCta}</Link>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {areaPages.slice(0, 9).map((page) => (
              <a key={`${page.areaSlug}-${page.category}`} href={`/${safeLocale}/areas/${page.areaSlug}/${page.category}`} className="rounded-md border border-[#E7DED0] bg-[#FFFDF7] p-4 transition-all duration-150 hover:border-[#0E8F72] hover:bg-white">
                <p className="text-sm font-bold text-[#10253D]">{getCategoryCopy(page.category, safeLocale).label} · {page.area}</p>
                <p className="mt-1 text-xs font-semibold text-[#5F6F61]">{page.count} {copy.profiles}</p>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-12"><CTABox locale={safeLocale} /></div>
      </section>
    </main>
  );
}
