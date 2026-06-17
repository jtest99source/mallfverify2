import { CTABox } from "@/components/CTABox";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessAreaCategoryPages, getPublicBusinessStats } from "@/lib/repository";
import { getCategoryCopy } from "@/lib/i18n-copy";

const pageCopy = {
  es: {
    metaTitle: "Para negocios | Mallorca Verified",
    metaDescription: "Mejora tu visibilidad en Google, ChatGPT y Google AI. Enriquece tu ficha en Mallorca Verified con fotos reales, servicios y contenido editorial.",
    eyebrow: "Para negocios",
    title: "Sé el primero que citan cuando alguien busca",
    intro: "Cada vez más viajeros usan ChatGPT, Perplexity o Google AI para decidir dónde ir en Mallorca. Los negocios con fichas completas son los que estas herramientas citan primero. Trabajamos tu ficha para que estés ahí cuando alguien está decidiendo.",
    contactEyebrow: "Contacto directo",
    contactText: "Cuéntanos tu negocio y te explicamos qué podemos mejorar para aumentar tu visibilidad en Google y en los sistemas de IA.",
    contactCta: "Escríbenos →",
    subject: "Quiero mejorar mi ficha en Mallorca Verified",
    stats: {
      published: "Fichas publicadas",
      categories: "Categorías",
      reviews: "Reseñas analizadas",
      pages: "Páginas locales"
    },
    workEyebrow: "Qué se puede mejorar",
    workTitle: "Más visibilidad, sin cambiar los rankings",
    workIntro: "Una ficha completa aparece antes en Google y es más fácil de citar para la IA. Trabajamos el contenido para que el negocio esté donde la gente ya está buscando.",
    products: [
      ["Ficha enriquecida", "Fotos reales, servicios, carta, horarios, reservas y descripción editorial. Todo lo que necesita una ficha para aparecer y convencer."],
      ["Revisión editorial", "Ordenamos y corregimos la información pública para que el perfil sea claro, completo y transmita confianza."],
      ["Contexto por zona", "Conectamos la ficha con las páginas por zona y categoría para que aparezca en más búsquedas locales."],
      ["Posicionamiento en IA", "Estructuramos la información para que ChatGPT, Perplexity y Google AI citen el negocio cuando alguien pregunta por opciones en Mallorca."]
    ],
    localContext: "Contexto local",
    areaTitle: "Páginas donde tu negocio puede aparecer",
    areaNote: "Cada una recibe búsquedas orgánicas de viajeros. Estar bien posicionado aquí multiplica tu visibilidad.",
    profiles: "fichas"
  },
  en: {
    metaTitle: "For businesses | Mallorca Verified",
    metaDescription: "Boost your visibility on Google, ChatGPT and Google AI. Enrich your Mallorca Verified profile with real photos, services and editorial content.",
    eyebrow: "For businesses",
    title: "Be the first one cited when someone searches",
    intro: "More and more travellers use ChatGPT, Perplexity or Google AI to decide where to go in Mallorca. Businesses with complete profiles are the ones these tools cite first. We work on your profile so you're there when someone is making a decision.",
    contactEyebrow: "Get in touch",
    contactText: "Tell us about your business and we'll explain what we can improve to boost your visibility on Google and AI systems.",
    contactCta: "Get in touch →",
    subject: "I want to improve my Mallorca Verified profile",
    stats: {
      published: "Published profiles",
      categories: "Categories",
      reviews: "Reviews analysed",
      pages: "Local pages"
    },
    workEyebrow: "What can be improved",
    workTitle: "More visibility, without changing rankings",
    workIntro: "A complete profile ranks higher on Google and is easier for AI to cite. We work on the content so your business is where people are already searching.",
    products: [
      ["Enhanced profile", "Real photos, services, menus, opening hours, bookings and editorial description. Everything a profile needs to show up and convert."],
      ["Editorial review", "We organise and correct public information so the profile is clear, complete and trustworthy."],
      ["Area context", "We connect the profile with area and category pages to appear in more local searches."],
      ["AI positioning", "We structure the information so ChatGPT, Perplexity and Google AI cite the business when someone asks for options in Mallorca."]
    ],
    localContext: "Local context",
    areaTitle: "Pages where your business can appear",
    areaNote: "Each receives organic searches from travellers. Appearing here multiplies your visibility.",
    profiles: "profiles"
  },
  de: {
    metaTitle: "Für Betriebe | Mallorca Verified",
    metaDescription: "Steigere deine Sichtbarkeit auf Google, ChatGPT und Google AI. Vervollständige dein Profil auf Mallorca Verified mit echten Fotos, Leistungen und redaktionellen Inhalten.",
    eyebrow: "Für Betriebe",
    title: "Sei der Erste, der zitiert wird, wenn jemand sucht",
    intro: "Immer mehr Reisende nutzen ChatGPT, Perplexity oder Google AI, um zu entscheiden, wohin sie auf Mallorca gehen. Betriebe mit vollständigen Profilen werden von diesen Tools zuerst genannt. Wir arbeiten an deinem Profil, damit du präsent bist, wenn jemand eine Entscheidung trifft.",
    contactEyebrow: "Kontakt",
    contactText: "Erzähl uns von deinem Betrieb und wir erklären dir, was wir verbessern können, um deine Sichtbarkeit bei Google und in KI-Systemen zu steigern.",
    contactCta: "Schreib uns →",
    subject: "Ich möchte mein Mallorca Verified Profil verbessern",
    stats: {
      published: "Veröffentlichte Profile",
      categories: "Kategorien",
      reviews: "Analysierte Bewertungen",
      pages: "Lokale Seiten"
    },
    workEyebrow: "Was verbessert werden kann",
    workTitle: "Mehr Sichtbarkeit, ohne Rankings zu ändern",
    workIntro: "Ein vollständiges Profil erscheint weiter oben bei Google und ist für KI leichter zitierbar. Wir arbeiten am Inhalt, damit dein Betrieb dort ist, wo die Leute bereits suchen.",
    products: [
      ["Erweitertes Profil", "Echte Fotos, Leistungen, Speisekarten, Öffnungszeiten, Buchungen und redaktionelle Beschreibung. Alles, was ein Profil braucht, um zu erscheinen und zu überzeugen."],
      ["Redaktionelle Prüfung", "Wir ordnen und korrigieren öffentliche Informationen, damit das Profil klar, vollständig und vertrauenswürdig wirkt."],
      ["Kontext nach Gegend", "Wir verbinden das Profil mit Seiten nach Gegend und Kategorie, um in mehr lokalen Suchen zu erscheinen."],
      ["KI-Positionierung", "Wir strukturieren die Informationen so, dass ChatGPT, Perplexity und Google AI den Betrieb nennen, wenn jemand nach Optionen auf Mallorca fragt."]
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
            <a href={`mailto:hola@mallorcaverified.com?subject=${encodeURIComponent(copy.subject)}`} className="mt-6 block rounded-md bg-[#10253D] px-5 py-4 text-center text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0E8F72]">{copy.contactCta}</a>
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
            <a href={`mailto:hola@mallorcaverified.com?subject=${encodeURIComponent(copy.subject)}`} className="rounded-md bg-[#10253D] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0E8F72]">{copy.contactCta}</a>
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
