import Link from "next/link";
import { CTABox } from "@/components/CTABox";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessAreaCategoryPages, getPublicBusinessStats } from "@/lib/repository";
import { getCategoryCopy } from "@/lib/i18n-copy";
import { isPublicCategorySlug, publicCategorySlugs } from "@/lib/data";

const pageCopy = {
  es: {
    metaTitle: "Visibilidad en Google y en IA para negocios en Mallorca | Mallorca Verified",
    metaDescription: "Auditamos tu visibilidad en Google, ChatGPT y Google AI sin coste. Somos los creadores de Mallorca Verified — sabemos qué funciona para negocios locales en la isla.",
    eyebrow: "Para negocios en Mallorca",
    title: "Sé el primero que citan cuando alguien busca",
    intro: "Cada vez más expats, compradores internacionales y viajeros usan ChatGPT, Perplexity o Google AI para decidir dónde ir en Mallorca. Nosotros construimos el directorio de referencia para residentes internacionales en la isla — y sabemos exactamente qué hace que un negocio aparezca primero.",
    proofLine: "Google, ChatGPT y Perplexity ya no leen una web como antes: buscan datos claros, confianza y contexto local.",
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
      ["Auditoría de visibilidad", "Empezamos siempre aquí. Analizamos cómo apareces en Google, ChatGPT y Perplexity, qué dice la IA de ti cuando alguien pregunta, y qué frena tu visibilidad ahora mismo."],
      ["Posicionamiento en IA", "Estructuramos tu información para que ChatGPT, Perplexity y Google AI te citen — no a un competidor — cuando alguien busca tu categoría en Mallorca."],
      ["Ficha verificada", "Fotos reales, servicios, carta, horarios y descripción editorial en Mallorca Verified. Una ficha completa es más fácil de citar para una IA y más convincente para un humano."],
      ["SEO local", "Páginas de zona, guías y textos que conectan tu negocio con búsquedas geográficas. Para que te encuentren compradores e internacionales en Google, no solo turistas de paso."]
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
    intro: "More and more expats, international buyers and travellers use ChatGPT, Perplexity or Google AI to decide where to go in Mallorca. We built the reference directory for international residents on the island — and we know exactly what makes a business show up first.",
    proofLine: "Google, ChatGPT and Perplexity no longer read a website like before: they look for clear data, trust and local context.",
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
      ["Visibility audit", "We always start here. We analyse how you appear on Google, ChatGPT and Perplexity, what AI says about you when someone asks, and what's limiting your visibility right now."],
      ["AI positioning", "We structure your information so ChatGPT, Perplexity and Google AI cite you — not a competitor — when someone searches for your category in Mallorca."],
      ["Verified listing", "Real photos, services, menu, hours and editorial description on Mallorca Verified. A complete listing is easier for an AI to cite and more convincing for a human."],
      ["Local SEO", "Area pages, guides and copy that connect your business to geographic searches. To be found by buyers and international residents on Google, not just passing tourists."]
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
    intro: "Immer mehr Expats, internationale Käufer und Reisende nutzen ChatGPT, Perplexity oder Google AI, um zu entscheiden, wohin sie auf Mallorca gehen. Wir haben das Referenzverzeichnis für internationale Bewohner auf der Insel aufgebaut — und wissen genau, was einen Betrieb an die erste Stelle bringt.",
    proofLine: "Google, ChatGPT und Perplexity lesen Websites nicht mehr wie früher: Sie suchen klare Daten, Vertrauen und lokalen Kontext.",
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
      ["Sichtbarkeits-Audit", "Wir fangen immer hier an. Wir analysieren, wie du auf Google, ChatGPT und Perplexity erscheinst, was KI über dich sagt, wenn jemand fragt, und was deine Sichtbarkeit gerade bremst."],
      ["KI-Positionierung", "Wir strukturieren deine Informationen, damit ChatGPT, Perplexity und Google AI dich — und nicht einen Mitbewerber — zitieren, wenn jemand nach deiner Kategorie auf Mallorca sucht."],
      ["Verifiziertes Profil", "Echte Fotos, Services, Speisekarte, Öffnungszeiten und redaktionelle Beschreibung auf Mallorca Verified. Ein vollständiges Profil ist für eine KI leichter zitierbar und für einen Menschen überzeugender."],
      ["Lokales SEO", "Gebietsseiten, Guides und Texte, die deinen Betrieb mit geografischen Suchanfragen verbinden. Damit dich Käufer und internationale Bewohner auf Google finden — nicht nur Durchgangstouristen."]
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
  const [rawAreaPages, publicStats] = await Promise.all([getBusinessAreaCategoryPages(5), getPublicBusinessStats()]);
  const areaPages = rawAreaPages.filter((page) => isPublicCategorySlug(page.category));
  const stats = [
    { label: copy.stats.published, value: formatIntegerMetric(publicStats.publishedBusinesses, safeLocale) },
    { label: copy.stats.categories, value: formatIntegerMetric(publicCategorySlugs.length, safeLocale) },
    { label: copy.stats.reviews, value: formatMillionMetric(publicStats.analyzedReviews, safeLocale) },
    { label: copy.stats.pages, value: `${areaPages.length}+` }
  ];

  return (
    <main className="bg-[#07101F] text-white">
      <section className="border-b border-white/[0.08] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]">{copy.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-black leading-[0.96] text-white sm:text-5xl lg:text-7xl">{copy.title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75">{copy.intro}</p>
            <div className="mx-auto mt-7 max-w-2xl rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-5 sm:mx-0">
              <span className="inline-block rounded-full bg-[#00C37A] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#0A0A0A]">ChatGPT · Perplexity · Google AI</span>
              <p className="mt-3 text-sm font-bold leading-7 text-white">{copy.proofLine}</p>
            </div>
          </div>
          <div className="rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#00C37A]">{copy.contactEyebrow}</p>
            <p className="mt-4 text-sm leading-7 text-white/70">{copy.contactText}</p>
            <Link href={`/${safeLocale}/contact`} className="mt-6 block rounded-sm bg-[#00C37A] px-5 py-4 text-center text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-all duration-150 hover:bg-white">{copy.contactCta}</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6">
              <p className="font-display text-4xl font-black text-[#00C37A]">{item.value}</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00C37A]">{copy.workEyebrow}</p>
            <h2 className="mt-3 font-display text-4xl font-black text-white">{copy.workTitle}</h2>
            <p className="mt-5 text-sm leading-7 text-white/70">{copy.workIntro}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {copy.products.map(([title, text], index) => (
              <article key={title} className="rounded-sm border border-white/[0.10] border-t-[#00C37A]/50 border-t-2 bg-[#0C1A2E] p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/25 hover:border-t-[#00C37A]">
                <div className="mb-4 flex h-7 w-7 items-center justify-center rounded-full bg-[#00C37A]/15 text-[10px] font-black text-[#00C37A]">0{index + 1}</div>
                <h3 className="text-lg font-black text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-white/70">{text}</p>
              </article>
            ))}
          </div>
        </div>

        <section className="mt-12 rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00C37A]">{copy.localContext}</p>
              <h2 className="mt-2 text-3xl font-black text-white">{copy.areaTitle}</h2>
              <p className="mt-1.5 text-sm text-white/55">{copy.areaNote}</p>
            </div>
            <Link href={`/${safeLocale}/contact`} className="rounded-sm bg-[#00C37A] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-all duration-150 hover:bg-white">{copy.contactCta}</Link>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {areaPages.slice(0, 9).map((page) => (
              <a key={`${page.areaSlug}-${page.category}`} href={`/${safeLocale}/areas/${page.areaSlug}/${page.category}`} className="group flex items-center justify-between rounded-sm border border-white/[0.10] bg-[#07101F] p-4 transition-all duration-150 hover:border-[#00C37A]/40">
                <div>
                  <p className="text-sm font-bold text-white group-hover:text-[#00C37A]">{getCategoryCopy(page.category, safeLocale).label} · {page.area}</p>
                  <p className="mt-0.5 text-xs font-semibold text-white/50">{page.count} {copy.profiles}</p>
                </div>
                <span className="text-[#00C37A] opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </a>
            ))}
          </div>
        </section>

        <div className="mt-12"><CTABox locale={safeLocale} /></div>
      </section>
    </main>
  );
}
