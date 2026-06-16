import { CTABox } from "@/components/CTABox";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getBusinessAreaCategoryPages, getPublicBusinessStats } from "@/lib/repository";

const pageCopy = {
  es: {
    metaTitle: "Para negocios | Mallorca Verified",
    metaDescription: "Solicita una propuesta para revisar y enriquecer tu ficha en Mallorca Verified.",
    eyebrow: "Para negocios",
    title: "Mejora la ficha publica de tu negocio",
    intro: "Mallorca Verified compara negocios con datos y resenas. Si representas un negocio, puedes solicitar una propuesta para completar tu ficha con informacion fiable, fotos y detalles utiles.",
    contactEyebrow: "Contacto comercial",
    contactText: "Escribenos para revisar una ficha, aportar material o plantear una colaboracion editorial.",
    contactCta: "Escribenos ->",
    subject: "Quiero revisar mi ficha en Mallorca Verified",
    stats: {
      published: "Fichas publicadas",
      categories: "Categorias preparadas",
      reviews: "Resenas analizadas",
      pages: "Paginas locales"
    },
    workEyebrow: "Que se puede trabajar",
    workTitle: "Una ficha mas completa, sin tocar los rankings",
    workIntro: "El objetivo es que la informacion sea clara, verificable y util para quien esta decidiendo. Las valoraciones, resenas y posiciones siguen dependiendo de los datos.",
    products: [
      ["Ficha enriquecida", "Mejores fotos, enlaces correctos, servicios, carta, horarios, reservas y detalles practicos para que la ficha sea mas util."],
      ["Revision editorial", "Ordenamos la informacion visible y corregimos datos publicos para que el perfil se entienda rapido y no parezca incompleto."],
      ["Contexto por zona", "Conectamos la ficha con paginas por zona y categoria cuando tiene sentido para el usuario que esta comparando opciones."],
      ["Colaboracion editorial", "Valoramos cada caso antes de tocar nada: la colaboracion mejora la ficha, no compra valoraciones ni posiciones en rankings."]
    ],
    localContext: "Contexto local",
    areaTitle: "Paginas por zona y categoria",
    profiles: "fichas"
  },
  en: {
    metaTitle: "For businesses | Mallorca Verified",
    metaDescription: "Request a proposal to review and enrich your business profile on Mallorca Verified.",
    eyebrow: "For businesses",
    title: "Improve your public business profile",
    intro: "Mallorca Verified compares businesses with data and reviews. If you represent a business, you can request a proposal to complete your profile with reliable information, photos and useful details.",
    contactEyebrow: "Commercial contact",
    contactText: "Contact us to review a profile, send material or discuss an editorial collaboration.",
    contactCta: "Contact us ->",
    subject: "I want to review my Mallorca Verified profile",
    stats: {
      published: "Published profiles",
      categories: "Prepared categories",
      reviews: "Reviews analyzed",
      pages: "Local pages"
    },
    workEyebrow: "What can be improved",
    workTitle: "A richer profile, without changing rankings",
    workIntro: "The goal is clear, verifiable and useful information for people who are deciding. Ratings, reviews and positions still depend on data.",
    products: [
      ["Enhanced profile", "Better photos, correct links, services, menus, opening hours, bookings and practical details that make the profile more useful."],
      ["Editorial review", "We organize visible information and correct public details so the profile is easy to understand and does not feel incomplete."],
      ["Area context", "We connect the profile with area and category pages when it helps users compare options."],
      ["Editorial collaboration", "We review each case first: collaboration improves the profile, it does not buy ratings or ranking positions."]
    ],
    localContext: "Local context",
    areaTitle: "Pages by area and category",
    profiles: "profiles"
  },
  de: {
    metaTitle: "Fuer Betriebe | Mallorca Verified",
    metaDescription: "Fordere ein Angebot an, um dein Profil auf Mallorca Verified zu pruefen und zu ergaenzen.",
    eyebrow: "Fuer Betriebe",
    title: "Verbessere das oeffentliche Profil deines Betriebs",
    intro: "Mallorca Verified vergleicht Betriebe mit Daten und Bewertungen. Wenn du einen Betrieb vertrittst, kannst du ein Angebot anfordern, um dein Profil mit verlaesslichen Informationen, Fotos und nuetzlichen Details zu ergaenzen.",
    contactEyebrow: "Gewerblicher Kontakt",
    contactText: "Schreib uns, um ein Profil zu pruefen, Material einzureichen oder eine redaktionelle Zusammenarbeit zu besprechen.",
    contactCta: "Kontakt aufnehmen ->",
    subject: "Ich moechte mein Mallorca Verified Profil pruefen",
    stats: {
      published: "Veroeffentlichte Profile",
      categories: "Vorbereitete Kategorien",
      reviews: "Analysierte Bewertungen",
      pages: "Lokale Seiten"
    },
    workEyebrow: "Was verbessert werden kann",
    workTitle: "Ein vollstaendigeres Profil, ohne Rankings zu veraendern",
    workIntro: "Ziel sind klare, pruefbare und nuetzliche Informationen fuer Menschen, die gerade vergleichen. Bewertungen, Rezensionen und Positionen haengen weiterhin von den Daten ab.",
    products: [
      ["Erweitertes Profil", "Bessere Fotos, korrekte Links, Services, Speisekarten, Oeffnungszeiten, Buchungen und praktische Details."],
      ["Redaktionelle Pruefung", "Wir ordnen sichtbare Informationen und korrigieren oeffentliche Daten, damit das Profil schnell verstaendlich ist."],
      ["Kontext nach Gegend", "Wir verbinden das Profil mit Seiten nach Gegend und Kategorie, wenn es Nutzern beim Vergleichen hilft."],
      ["Redaktionelle Zusammenarbeit", "Wir pruefen jeden Fall zuerst: Zusammenarbeit verbessert das Profil, sie kauft keine Bewertungen oder Ranking-Positionen."]
    ],
    localContext: "Lokaler Kontext",
    areaTitle: "Seiten nach Gegend und Kategorie",
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
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-none text-[#10253D] sm:text-7xl">{copy.title}</h1>
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
        <div className="grid gap-3 md:grid-cols-4">
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
            </div>
            <a href={`mailto:hola@mallorcaverified.com?subject=${encodeURIComponent(copy.subject)}`} className="rounded-md bg-[#10253D] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-all duration-150 hover:bg-[#0E8F72]">{copy.contactCta}</a>
          </div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {areaPages.slice(0, 9).map((page) => (
              <a key={`${page.areaSlug}-${page.category}`} href={`/${safeLocale}/areas/${page.areaSlug}/${page.category}`} className="rounded-md border border-[#E7DED0] bg-[#FFFDF7] p-4 text-sm font-bold text-[#10253D] transition-all duration-150 hover:border-[#0E8F72] hover:bg-white">
                {page.count} {copy.profiles}: {page.area}
              </a>
            ))}
          </div>
        </section>

        <div className="mt-12"><CTABox locale={safeLocale} /></div>
      </section>
    </main>
  );
}
