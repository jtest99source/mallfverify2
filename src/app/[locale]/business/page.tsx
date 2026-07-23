import Link from "next/link";
import { CTABox } from "@/components/CTABox";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessAreaCategoryPages, getPublicBusinessStats } from "@/lib/repository";
import { getCategoryCopy } from "@/lib/i18n-copy";
import { isPublicCategorySlug, publicCategorySlugs } from "@/lib/data";

const pageCopy = {
  es: {
    metaTitle: "Visibilidad para negocios en Mallorca | Mallorca Verified",
    metaDescription: "Turistas, expats y compradores internacionales usan Mallorca Verified para decidir dónde van en la isla. Más visibilidad para tu negocio — ficha gratuita disponible.",
    eyebrow: "Para negocios en Mallorca",
    title: "Llega a las personas que deciden dónde gastar en Mallorca",
    intro: "Turistas, expats y compradores internacionales usan Mallorca Verified para decidir dónde comer, dormir, explorar y gastar dinero en la isla. Nuestros rankings se construyen sobre datos públicos de Google y nuestras guías las leen personas que están planificando activamente su tiempo aquí. Mallorca Verified también trabaja directamente con negocios para ayudarles a ganar más visibilidad en la isla.",
    proofLine: "Miles de personas usan nuestros rankings cada mes para decidir dónde gastan dinero en la isla.",
    contactEyebrow: "Contacto",
    contactText: "Cuéntanos tu negocio y vemos cómo podemos ayudarte.",
    contactCta: "Contactar →",
    subject: "Consulta de negocio",
    stats: {
      published: "Fichas publicadas",
      categories: "Categorías",
      reviews: "Reseñas analizadas",
      towns: "Zonas cubiertas"
    },
    workEyebrow: "Cómo trabajamos con negocios",
    workTitle: "Visibilidad para la audiencia que importa",
    workIntro: "Empezamos revisando cómo apareces en el directorio y qué mejoraría tu visibilidad ante la audiencia correcta.",
    products: [
      ["Presencia en el directorio", "Tu negocio probablemente ya está listado. Revisamos cómo aparece, qué datos faltan y qué mejoraría su visibilidad."],
      ["Ficha completa", "Fotos, descripción, horarios, servicios. Una ficha completa aparece más en guías y resultados de IA. Actualizar es gratis."],
      ["Guías editoriales", "Nuestras guías llegan a turistas y expats en el momento que deciden. Aparecer en una guía es editorial, no de pago."],
      ["Visibilidad más amplia", "Para negocios que quieren ir más lejos: mayor presencia en Google, SEO local y ser citados por herramientas de IA cuando alguien busca tu categoría en Mallorca."]
    ],
    freeNote: "Cualquier negocio que cumpla nuestros criterios mínimos puede aparecer en Mallorca Verified de forma totalmente gratuita. ¿Ya estás en el directorio y quieres completar tu ficha? Escríbenos — no cuesta nada.",
    localContext: "Contexto local",
    areaTitle: "Páginas donde tu negocio puede aparecer",
    areaNote: "Cada una recibe búsquedas orgánicas de viajeros. Estar bien posicionado aquí multiplica tu visibilidad.",
    profiles: "fichas"
  },
  en: {
    metaTitle: "Visibility for businesses in Mallorca | Mallorca Verified",
    metaDescription: "Tourists, expats and international buyers use Mallorca Verified to decide where to go on the island. More visibility for your business — free listing available.",
    eyebrow: "For businesses in Mallorca",
    title: "Reach the people deciding where to spend in Mallorca",
    intro: "Tourists, expats and international buyers use Mallorca Verified when deciding where to eat, stay, explore and spend money on the island. Our rankings are built on public Google data and our guides are read by people actively planning their time here. Mallorca Verified also works directly with businesses to help them gain more visibility across the island.",
    proofLine: "Thousands of people use our rankings every month to decide where to spend money on the island.",
    contactEyebrow: "Get in touch",
    contactText: "Tell us about your business and we'll look at how we can help.",
    contactCta: "Contact us →",
    subject: "Business enquiry",
    stats: {
      published: "Published profiles",
      categories: "Categories",
      reviews: "Reviews analysed",
      towns: "Towns covered"
    },
    workEyebrow: "How we work with businesses",
    workTitle: "Visibility for the audience that matters",
    workIntro: "We start by looking at how you appear in the directory and what would improve your visibility with the right audience.",
    products: [
      ["Listing presence", "Your business is likely already in the directory. We look at how it appears, what data is missing and what would improve its visibility."],
      ["Complete profile", "Photos, description, opening hours, services. A complete profile appears more in guides and AI results — and it's free to update."],
      ["Editorial guides", "Our guides reach tourists and expats when they're deciding. Being mentioned in a guide is editorial, not paid."],
      ["Broader visibility", "For businesses that want to go further: a stronger Google presence, local SEO and being cited by AI tools when someone searches for your category in Mallorca."]
    ],
    freeNote: "Any business meeting our minimum criteria can be listed on Mallorca Verified for free. Already in the directory and want to complete your profile? Get in touch — it costs nothing.",
    localContext: "Local context",
    areaTitle: "Pages where your business can appear",
    areaNote: "Each receives organic searches from travellers. Appearing here multiplies your visibility.",
    profiles: "profiles"
  },
  de: {
    metaTitle: "Sichtbarkeit für Betriebe auf Mallorca | Mallorca Verified",
    metaDescription: "Touristen, Expats und internationale Käufer nutzen Mallorca Verified, um zu entscheiden, wohin sie auf der Insel gehen. Mehr Sichtbarkeit für deinen Betrieb — kostenloses Profil verfügbar.",
    eyebrow: "Für Betriebe auf Mallorca",
    title: "Erreiche die Menschen, die entscheiden, wo sie auf Mallorca Geld ausgeben",
    intro: "Touristen, Expats und internationale Käufer nutzen Mallorca Verified, wenn sie entscheiden, wo sie auf der Insel essen, schlafen, erkunden und Geld ausgeben. Unsere Rankings basieren auf öffentlichen Google-Daten und unsere Guides werden von Menschen gelesen, die ihren Aufenthalt aktiv planen. Mallorca Verified arbeitet auch direkt mit Betrieben zusammen, um ihnen mehr Sichtbarkeit auf der Insel zu verschaffen.",
    proofLine: "Tausende Menschen nutzen unsere Rankings jeden Monat, um zu entscheiden, wo sie ihr Geld auf der Insel ausgeben.",
    contactEyebrow: "Kontakt",
    contactText: "Erzähl uns von deinem Betrieb und wir schauen, wie wir helfen können.",
    contactCta: "Kontakt aufnehmen →",
    subject: "Betriebsanfrage",
    stats: {
      published: "Veröffentlichte Profile",
      categories: "Kategorien",
      reviews: "Analysierte Bewertungen",
      towns: "Orte abgedeckt"
    },
    workEyebrow: "Wie wir mit Betrieben arbeiten",
    workTitle: "Sichtbarkeit für die richtige Zielgruppe",
    workIntro: "Wir beginnen damit, zu schauen, wie du im Verzeichnis erscheinst und was deine Sichtbarkeit bei der richtigen Zielgruppe verbessern würde.",
    products: [
      ["Verzeichnispräsenz", "Dein Betrieb ist wahrscheinlich bereits gelistet. Wir schauen, wie er erscheint, was fehlt und was die Sichtbarkeit verbessern würde."],
      ["Vollständiges Profil", "Fotos, Beschreibung, Öffnungszeiten, Services. Ein vollständiges Profil erscheint mehr in Guides und KI-Ergebnissen — und das Update ist kostenlos."],
      ["Redaktionelle Guides", "Unsere Guides erreichen Touristen und Expats im Moment ihrer Entscheidung. In einem Guide erwähnt zu werden ist redaktionell, nicht bezahlt."],
      ["Breitere Sichtbarkeit", "Für Betriebe, die weiter gehen wollen: stärkere Google-Präsenz, lokales SEO und von KI-Tools zitiert werden, wenn jemand nach deiner Kategorie auf Mallorca sucht."]
    ],
    freeNote: "Jeder Betrieb, der unsere Mindestkriterien erfüllt, kann kostenlos auf Mallorca Verified gelistet werden. Bereits im Verzeichnis und Profil vervollständigen? Schreib uns — kostenlos.",
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
    { label: copy.stats.towns, value: formatIntegerMetric(publicStats.townsCovered, safeLocale) }
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
              <p className="text-sm font-bold leading-7 text-white">{copy.proofLine}</p>
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

        <div className="mt-8 rounded-sm border border-white/[0.06] bg-[#0C1A2E]/60 px-6 py-4">
          <p className="text-sm leading-7 text-white/50">{copy.freeNote}</p>
        </div>

        <section className="mt-8 rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6">
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
                </div>
                <span className="text-[#00C37A] opacity-0 transition-opacity group-hover:opacity-100">→</span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00C37A]">
                {safeLocale === "es" ? "Datos e informes" : safeLocale === "de" ? "Daten & Reports" : "Data & reports"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">
                {safeLocale === "es" ? "Informes de sector" : safeLocale === "de" ? "Branchenreports" : "Sector reports"}
              </h2>
              <p className="mt-1.5 max-w-2xl text-sm text-white/55">
                {safeLocale === "es"
                  ? "Analizamos sectores enteros de Mallorca con datos reales de reseñas. Mira cómo está tu categoría — y dónde está tu hueco."
                  : safeLocale === "de"
                  ? "Wir analysieren ganze Branchen Mallorcas mit echten Bewertungsdaten. Sehen Sie, wie Ihre Kategorie dasteht — und wo Ihre Lücke ist."
                  : "We analyse whole Mallorca sectors with real review data. See how your category stands — and where your gap is."}
              </p>
            </div>
            <Link href={`/${safeLocale}/insights`} className="rounded-sm border border-white/20 px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white/70 transition-all duration-150 hover:border-[#00C37A]/50 hover:text-white">
              {safeLocale === "es" ? "Ver informes →" : safeLocale === "de" ? "Reports ansehen →" : "View reports →"}
            </Link>
          </div>
          <div className="mt-5">
            <Link href={`/${safeLocale}/insights/dental-mallorca-2026`} className="group flex flex-col rounded-sm border border-white/[0.10] bg-[#07101F] p-5 transition-all duration-150 hover:border-[#00C37A]/40 sm:max-w-md">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#00C37A]">
                {safeLocale === "de" ? "Gesundheit · 2026" : safeLocale === "en" ? "Health · 2026" : "Salud · 2026"}
              </span>
              <span className="mt-2 text-lg font-black text-white group-hover:text-[#00C37A]">
                {safeLocale === "de" ? "Zahnkliniken auf Mallorca 2026" : safeLocale === "en" ? "Mallorca Dental Clinics 2026" : "Clínicas dentales de Mallorca 2026"}
              </span>
              <span className="mt-1.5 text-xs leading-6 text-white/55">
                {safeLocale === "de"
                  ? "179 Kliniken: Qualität unterscheidet nicht mehr — Sichtbarkeit schon."
                  : safeLocale === "en"
                  ? "179 clinics: quality no longer sets them apart — visibility does."
                  : "179 clínicas: la calidad ya no distingue, la visibilidad sí."}
              </span>
            </Link>
          </div>
        </section>

        <div className="mt-12"><CTABox locale={safeLocale} /></div>
      </section>
    </main>
  );
}
