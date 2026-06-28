import Link from "next/link";
import {
  IconBuildingEstate,
  IconChecklist,
  IconExternalLink,
  IconHomeCheck,
  IconLanguage,
  IconMapPin,
  IconPhone,
  IconScale,
  IconShieldCheck,
  IconSparkles,
  IconTools,
  IconWorld
} from "@tabler/icons-react";
import { ExpertHeroSearch } from "@/components/ExpertHeroSearch";
import { ExpertsFilters } from "@/components/ExpertsFilters";
import { JsonLd } from "@/components/JsonLd";
import { RatingBadge } from "@/components/RatingBadge";
import { generateSeoMetadata } from "@/lib/seo";
import {
  expertProfiles,
  isExpertVerticalSlug,
  type ExpertProfile,
  type ExpertVerticalSlug
} from "@/data/expertProfiles";
import { LoadMoreExpertGrid } from "@/components/LoadMoreExpertGrid";
import { isLocale, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/data";
import { createBreadcrumbSchema, createFAQSchema } from "@/lib/schema";

const expertCopy = {
  es: {
    metaTitle: "Expertos en Mallorca para compradores, expats y residentes internacionales | Mallorca Verified",
    metaDescription:
      "Abogados, estate agents, dentistas, médicos y profesionales en inglés y alemán para compradores, expats y residentes internacionales en Mallorca. Selección editorial, no pago por aparecer.",
    eyebrow: "Mallorca Verified Experts",
    title: "Los profesionales que necesitas para vivir en Mallorca.",
    intro:
      "Google Maps no te dice si un abogado ha cerrado 200 transacciones con compradores extranjeros, si habla inglés de verdad o si cubre tu zona. Cada perfil aquí va más allá del nombre y el teléfono: especialidades reales, idiomas confirmados y señales públicas verificables. Selección editorial, no pago por aparecer.",
    primaryCta: "Buscar experto",
    secondaryCta: "Cómo verificamos",
    trustLine: "Sin posiciones de pago. Una ficha premium añade detalle — fotos, servicios, FAQ — pero nunca cambia la posición en el ranking.",
    pillarsEyebrow: "Primeras verticales",
    pillarsTitle: "Dónde empezamos",
    pillarsIntro:
      "Empezamos por los servicios donde hay más en juego: decisiones económicas importantes con mucha incertidumbre para residentes internacionales y compradores de vivienda.",
    criteriaEyebrow: "Cómo verificamos",
    criteriaTitle: "Qué incluye un perfil verificado",
    criteriaIntro:
      "Cada perfil va más allá de un nombre y un teléfono. Comprobamos qué hace realmente el profesional, a quién atiende y qué información pública lo respalda.",
    ctaTitle: "¿Tienes un despacho, estudio o servicio profesional en Mallorca?",
    ctaText:
      "Podemos revisar cómo aparece tu negocio online y qué te falta para que clientes internacionales te encuentren más fácilmente.",
    ctaButton: "Escríbenos",
    viewVertical: "Ver vertical",
    methodologyPath: "/es/metodologia",
    categories: [
      {
        slug: "english-speaking-lawyers-mallorca",
        icon: IconScale,
        title: "Abogados y fiscalistas",
        description:
          "Si compras, vendes, heredas o tienes un conflicto legal en Mallorca, necesitas a alguien que entienda el sistema español y te lo explique sin tecnicismos. Estos tienen historial real con clientes internacionales."
      },
      {
        slug: "architects-renovation-mallorca",
        icon: IconBuildingEstate,
        title: "Arquitectos y reformas",
        description:
          "Para reformar o construir en Mallorca sin las sorpresas habituales: licencias, vecinos, presupuestos que no se disparan. Estudios con experiencia demostrable en la isla."
      },
      {
        slug: "property-managers-mallorca",
        icon: IconHomeCheck,
        title: "Property managers y relocation",
        description:
          "Alguien que gestione lo que no puedes gestionar desde lejos — mantenimiento, proveedores, incidencias, coordinación. Para propiedades en Mallorca sin presencia constante."
      },
      {
        slug: "english-speaking-dentists-mallorca",
        icon: IconShieldCheck,
        title: "Dentistas",
        description:
          "Clínicas donde puedas describir el dolor en inglés, entender el presupuesto y no tener que traer traductor. Con pacientes internacionales habituales."
      },
      {
        slug: "english-speaking-doctors-mallorca",
        icon: IconShieldCheck,
        title: "Médicos y clínicas privadas",
        description:
          "Médicos y centros privados donde el diagnóstico se explica en inglés y los tiempos de espera no son los de la sanidad pública. Orientados a pacientes internacionales y familias expat."
      },
      {
        slug: "estate-agents-mallorca",
        icon: IconBuildingEstate,
        title: "Estate agents",
        description:
          "Agentes con track record demostrable en compradores extranjeros. No los que más publicidad tienen — los que más transacciones reales han cerrado con clientes internacionales."
      },
      {
        slug: "mortgage-brokers-mallorca",
        icon: IconChecklist,
        title: "Mortgage brokers",
        description:
          "Brokers con experiencia real en hipotecas para no residentes en España — una categoría con requisitos, plazos y bancos distintos a los de cualquier otro país europeo."
      },
      {
        slug: "aesthetic-medicine-mallorca",
        icon: IconSparkles,
        title: "Medicina estética",
        description:
          "Clínicas donde puedas discutir el tratamiento en inglés o alemán, entender exactamente qué se va a hacer y no tener que adivinar precios ni resultados."
      }
    ],
    criteria: [
      "Idiomas: inglés, alemán, español u otros — confirmados, no asumidos.",
      "Especialidades: qué hace realmente el profesional, no una descripción genérica.",
      "Zonas: qué áreas de Mallorca cubre.",
      "Información pública: web, reseñas, presencia local y datos verificables.",
      "FAQ: respuestas prácticas para compradores, expats y nuevos residentes."
    ],
    faqs: [
      {
        question: "¿Para quién es Mallorca Verified Experts?",
        answer:
          "Para compradores extranjeros, expats y residentes internacionales que necesitan profesionales en inglés o alemán en Mallorca. No es un directorio genérico — cada vertical está pensado para quien toma decisiones importantes sin red local."
      },
      {
        question: "¿En qué se diferencia de buscar en Google?",
        answer:
          "Google Maps no te dice si un abogado habla inglés de verdad, cuántas transacciones ha cerrado para compradores extranjeros o si conoce la normativa para no residentes. Aquí eso está contrastado y es explícito en cada perfil."
      },
      {
        question: "¿Se puede pagar para aparecer o subir posiciones?",
        answer:
          "No. Las posiciones no se compran. Una ficha premium puede añadir fotos, servicios, FAQ y datos prácticos — pero nunca cambia la posición en rankings ni en selecciones editoriales."
      }
    ],
    allFilter: "Todos",
    directoryEyebrow: "Directorio de profesionales",
    resultsLabel: "profesionales verificados",
    sortLabel: "Ordenar:",
    sortByReviews: "Más reseñas",
    sortByRating: "Mejor valoración",
    sortByName: "A-Z",
    languageLabel: "Idioma",
    labels: {
      languages: "Idiomas",
      specialties: "Especialidades",
      website: "Web",
      phone: "Teléfono",
      details: "Ver ficha"
    }
  },
  en: {
    metaTitle: "Experts in Mallorca for buyers, expats and international residents | Mallorca Verified",
    metaDescription:
      "Lawyers, estate agents, dentists, doctors and English and German-speaking professionals for buyers, expats and international residents in Mallorca. Editorial selection, not paid placement.",
    eyebrow: "Mallorca Verified Experts",
    title: "The professionals you need for life in Mallorca.",
    intro:
      "Google Maps won't tell you if a lawyer has closed 200 transactions for foreign buyers, whether they genuinely speak English, or if they cover your area. Every profile here goes beyond a name and phone number: real specialisms, confirmed languages and verifiable public signals. Editorial selection, not paid placement.",
    primaryCta: "Find an expert",
    secondaryCta: "How we verify",
    trustLine: "No paid placements. A premium profile adds detail — photos, services, FAQ — but never changes ranking position.",
    pillarsEyebrow: "First verticals",
    pillarsTitle: "Where we start",
    pillarsIntro:
      "We start with the services where the stakes are highest: important financial decisions with a lot of uncertainty for international residents and property buyers.",
    criteriaEyebrow: "How we verify",
    criteriaTitle: "What a verified expert profile includes",
    criteriaIntro:
      "Each profile goes beyond a name and a phone number. We check what the professional actually does, who they serve and what public information supports them.",
    ctaTitle: "Do you run a law firm, architecture studio or professional service in Mallorca?",
    ctaText:
      "We can review how your business appears online and what would make it easier for international clients to find and trust you.",
    ctaButton: "Get in touch",
    viewVertical: "Explore vertical",
    methodologyPath: "/en/methodology",
    categories: [
      {
        slug: "english-speaking-lawyers-mallorca",
        icon: IconScale,
        title: "Lawyers and tax advisors",
        description:
          "If you're buying, selling, inheriting or dealing with a legal issue in Mallorca, you need someone who understands Spanish law and explains it without jargon. These have a real track record with international clients."
      },
      {
        slug: "architects-renovation-mallorca",
        icon: IconBuildingEstate,
        title: "Architects and renovation",
        description:
          "For renovating or building in Mallorca without the usual surprises: permits, neighbours, budgets that don't spiral. Studios with demonstrable experience on the island."
      },
      {
        slug: "property-managers-mallorca",
        icon: IconHomeCheck,
        title: "Property managers and relocation",
        description:
          "Someone to handle what you can't manage from a distance — maintenance, contractors, incidents, coordination. For Mallorca properties without constant presence."
      },
      {
        slug: "english-speaking-dentists-mallorca",
        icon: IconShieldCheck,
        title: "Dentists",
        description:
          "Clinics where you can describe your symptoms in English, understand the quote and not need a translator. With verifiable records of international patients."
      },
      {
        slug: "english-speaking-doctors-mallorca",
        icon: IconShieldCheck,
        title: "Doctors and private clinics",
        description:
          "Private doctors and clinics where the diagnosis is explained in English and waiting times are not those of the public system. Focused on international patients and expat families."
      },
      {
        slug: "estate-agents-mallorca",
        icon: IconBuildingEstate,
        title: "Estate agents",
        description:
          "Agents with demonstrable track records with foreign buyers. Not the ones with the most advertising — the ones who have closed the most real transactions with international clients."
      },
      {
        slug: "mortgage-brokers-mallorca",
        icon: IconChecklist,
        title: "Mortgage brokers",
        description:
          "Brokers with real experience in non-resident mortgages in Spain — a category with different requirements, timelines and banks from anywhere else in Europe."
      },
      {
        slug: "aesthetic-medicine-mallorca",
        icon: IconSparkles,
        title: "Aesthetic medicine",
        description:
          "Clinics where you can discuss treatment in English or German, understand exactly what will be done and not have to guess at prices or results."
      }
    ],
    criteria: [
      "Languages: English, German, Spanish or others — confirmed, not assumed.",
      "Specialisms: what the professional actually does, not a generic description.",
      "Coverage: which areas of Mallorca they serve.",
      "Public information: website, reviews, local presence and verifiable data.",
      "FAQ: practical answers for buyers, expats and new residents."
    ],
    faqs: [
      {
        question: "Who is Mallorca Verified Experts for?",
        answer:
          "For foreign buyers, expats and international residents who need English or German-speaking professionals in Mallorca. This is not a generic directory — each vertical is designed for people making high-stakes decisions without a local network."
      },
      {
        question: "How is this different from searching on Google?",
        answer:
          "Google Maps won't tell you if a lawyer genuinely speaks English, how many transactions they've closed for foreign buyers, or whether they understand non-resident regulations. Here that's verified and explicit in every profile."
      },
      {
        question: "Can professionals pay to appear or move up?",
        answer:
          "No. Positions cannot be bought. A premium profile can add photos, services, FAQ and practical details — but it never changes ranking position or editorial selection."
      }
    ],
    allFilter: "All",
    directoryEyebrow: "Expert directory",
    resultsLabel: "verified professionals",
    sortLabel: "Sort:",
    sortByReviews: "Most reviewed",
    sortByRating: "Highest rated",
    sortByName: "A-Z",
    languageLabel: "Language",
    labels: {
      languages: "Languages",
      specialties: "Specialisms",
      website: "Website",
      phone: "Phone",
      details: "View profile"
    }
  },
  de: {
    metaTitle: "Experten auf Mallorca für Käufer, Expats und internationale Bewohner | Mallorca Verified",
    metaDescription:
      "Anwälte, Immobilienmakler, Zahnärzte, Ärzte und deutsch- und englischsprachige Profis für Käufer, Expats und internationale Bewohner auf Mallorca. Redaktionelle Auswahl, kein bezahltes Listing.",
    eyebrow: "Mallorca Verified Experts",
    title: "Die Profis, die du für das Leben auf Mallorca brauchst.",
    intro:
      "Google Maps sagt dir nicht, ob ein Anwalt 200 Transaktionen für ausländische Käufer abgeschlossen hat, ob er wirklich Englisch spricht oder ob er deine Region abdeckt. Jedes Profil hier geht über Name und Telefonnummer hinaus: echte Spezialisierungen, bestätigte Sprachen und überprüfbare öffentliche Signale. Redaktionelle Auswahl, kein Bezahlen für Sichtbarkeit.",
    primaryCta: "Experten finden",
    secondaryCta: "Wie wir prüfen",
    trustLine: "Positionen können nicht gekauft werden. Premium-Profile verbessern die Information, nicht das Ranking.",
    pillarsEyebrow: "Erste Bereiche",
    pillarsTitle: "Womit wir starten",
    pillarsIntro:
      "Wir beginnen mit den Bereichen, bei denen am meisten auf dem Spiel steht: wichtige finanzielle Entscheidungen mit viel Unsicherheit für internationale Residenten und Immobilienkäufer.",
    criteriaEyebrow: "Wie wir prüfen",
    criteriaTitle: "Was ein verifiziertes Expertenprofil enthält",
    criteriaIntro:
      "Jedes Profil geht über Name und Telefonnummer hinaus. Wir prüfen, was der Experte wirklich macht, wem er hilft und welche öffentlichen Informationen ihn stützen.",
    ctaTitle: "Führst du eine Kanzlei, ein Studio oder einen professionellen Service auf Mallorca?",
    ctaText:
      "Wir können prüfen, wie dein Unternehmen online erscheint und was fehlt, damit internationale Kunden dich leichter finden und kontaktieren.",
    ctaButton: "Schreib uns",
    viewVertical: "Bereich ansehen",
    methodologyPath: "/de/methodik",
    categories: [
      {
        slug: "english-speaking-lawyers-mallorca",
        icon: IconScale,
        title: "Anwälte und Steuerberater",
        description:
          "Spezialisten für Immobilienkauf, Due Diligence, Steuern für Nicht-Residenten, Erbschaften, Verträge und Beratung für internationale Kunden."
      },
      {
        slug: "architects-renovation-mallorca",
        icon: IconBuildingEstate,
        title: "Architekten und Renovierung",
        description:
          "Architekturbüros, Interior Designer, Bauunternehmen und technische Experten für Renovierung, Legalisierung oder Verbesserung einer Immobilie."
      },
      {
        slug: "property-managers-mallorca",
        icon: IconHomeCheck,
        title: "Property Manager und Relocation",
        description:
          "Services für den Umzug nach Mallorca, Immobilienverwaltung, Villenpflege, Koordination von Dienstleistern und den Alltag auf der Insel."
      },
      {
        slug: "english-speaking-dentists-mallorca",
        icon: IconShieldCheck,
        title: "Zahnärzte",
        description:
          "Zahnkliniken, Kieferorthopädie und Notfall-Zahnärzte für Expats, Familien und internationale Residenten."
      },
      {
        slug: "english-speaking-doctors-mallorca",
        icon: IconShieldCheck,
        title: "Ärzte und Privatkliniken",
        description:
          "Ärztezentren, GP-Praxen und private Kliniken für internationale Patienten auf Mallorca."
      },
      {
        slug: "estate-agents-mallorca",
        icon: IconBuildingEstate,
        title: "Estate Agents",
        description:
          "Immobilienagenturen mit soliden öffentlichen Signalen für ausländische Käufer, Verkäufer und Investoren."
      },
      {
        slug: "mortgage-brokers-mallorca",
        icon: IconChecklist,
        title: "Mortgage Broker",
        description:
          "Hypothekenbroker und Finanzierungsberater für internationale Käufer und Nicht-Residenten auf Mallorca."
      },
      {
        slug: "aesthetic-medicine-mallorca",
        icon: IconSparkles,
        title: "Ästhetische Medizin",
        description:
          "Kliniken für ästhetische Medizin, Dermatologie und Schönheitschirurgie mit Betreuung auf Englisch und/oder Deutsch auf Mallorca."
      }
    ],
    criteria: [
      "Echte Servicesprachen: Deutsch, Englisch, Spanisch oder weitere — bestätigt, nicht angenommen.",
      "Konkrete Spezialisierungen statt allgemeiner Beschreibungen.",
      "Abgedeckte Gebiete auf Mallorca.",
      "Öffentliche Informationen: offizielle Website, Bewertungen, lokale Präsenz und prüfbare Daten.",
      "Praktische FAQ für Käufer, Expats und neue Residenten."
    ],
    faqs: [
      {
        question: "Für wen ist Mallorca Verified Experts?",
        answer:
          "Für ausländische Käufer, Expats und internationale Bewohner, die deutsch- oder englischsprachige Profis auf Mallorca brauchen. Kein generisches Verzeichnis — jedes Segment ist für Menschen gedacht, die wichtige Entscheidungen ohne lokales Netzwerk treffen."
      },
      {
        question: "Was ist der Unterschied zu einer Google-Suche?",
        answer:
          "Google Maps verrät dir nicht, ob ein Anwalt wirklich Deutsch spricht, wie viele Transaktionen er für ausländische Käufer abgeschlossen hat oder ob er die Regelungen für Nicht-Residenten kennt. Hier ist das geprüft und in jedem Profil explizit angegeben."
      },
      {
        question: "Kann man für bessere Positionen bezahlen?",
        answer:
          "Nein. Positionen können nicht gekauft werden. Ein Premium-Profil kann Fotos, Services, FAQ und praktische Details ergänzen — ändert aber nie die Ranking-Position oder redaktionelle Auswahl."
      }
    ],
    allFilter: "Alle",
    directoryEyebrow: "Expertenverzeichnis",
    resultsLabel: "verifizierte Profis",
    sortLabel: "Sortieren:",
    sortByReviews: "Meistbewertet",
    sortByRating: "Bestbewertet",
    sortByName: "A-Z",
    languageLabel: "Sprache",
    labels: {
      languages: "Sprachen",
      specialties: "Spezialisierungen",
      website: "Website",
      phone: "Telefon",
      details: "Profil ansehen"
    }
  }
} as const;

function localizedList(list: Partial<Record<Locale, string[]>>, locale: Locale): string[] {
  return list[locale] ?? list.es ?? list.en ?? list.de ?? [];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const copy = expertCopy[safeLocale];
  return generateSeoMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: `/${safeLocale}/experts`,
    locale: safeLocale
  });
}

export default async function ExpertsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ v?: string; s?: string; l?: string; q?: string }>;
}) {
  const [{ locale }, { v, s, l, q }] = await Promise.all([params, searchParams]);
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const copy = expertCopy[safeLocale];
  const pageUrl = `${siteUrl}/${safeLocale}/experts`;
  const activeVertical = isExpertVerticalSlug(v ?? "") ? (v as ExpertVerticalSlug) : null;
  const sortKey = s === "rating" ? "rating" : s === "name" ? "name" : "reviews";
  const langFilter = l === "English" || l === "Deutsch" ? l : null;
  const query = (q ?? "").trim();
  const normalizedQuery = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const allApproved = expertProfiles.filter((p) => p.status !== "hidden");
  const displayedProfiles = (
    activeVertical ? allApproved.filter((p) => p.verticalSlug === activeVertical) : allApproved
  )
    .filter((p) => !langFilter || p.languages.includes(langFilter))
    .filter((p) => {
      if (!normalizedQuery) return true;
      const category = copy.categories.find((item) => item.slug === p.verticalSlug);
      const haystack = [
        p.name,
        p.location,
        category?.title,
        p.languages.join(" "),
        localizedList(p.specialties, safeLocale).join(" "),
        p.editorialNote?.[safeLocale]
      ]
        .filter(Boolean)
        .join(" ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (sortKey === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0);
    });
  const VERTICAL_COLORS: Record<string, string> = {
    "english-speaking-lawyers-mallorca":  "#00C37A",
    "architects-renovation-mallorca":     "#00C37A",
    "property-managers-mallorca":         "#00C37A",
    "english-speaking-dentists-mallorca": "#00C37A",
    "english-speaking-doctors-mallorca":  "#00C37A",
    "estate-agents-mallorca":             "#00C37A",
    "mortgage-brokers-mallorca":          "#00C37A",
    "aesthetic-medicine-mallorca":        "#00C37A",
  };
  const verticalColor = (slug: string) => VERTICAL_COLORS[slug] ?? "#0A0A0A";
  const breadcrumbs = createBreadcrumbSchema([
    { name: "Mallorca Verified", url: `${siteUrl}/${safeLocale}` },
    { name: "Experts", url: pageUrl }
  ]);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#experts`,
    name: copy.metaTitle,
    description: copy.metaDescription,
    url: pageUrl,
    inLanguage: safeLocale,
    about: copy.categories.map((category) => category.title),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: copy.categories.map((category, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: category.title,
        description: category.description
      }))
    }
  };

  const hasActiveSearch = !!(query || activeVertical || langFilter);

  return (
    <main className="bg-[#040D1A] text-white">
      {/* ── HERO ── */}
      <section className="border-b border-white/[0.08] bg-[#07101F] px-4 pb-12 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]">
            <IconShieldCheck size={13} stroke={2} />
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-black leading-[0.96] text-white sm:text-6xl lg:text-7xl">
            {safeLocale === "de"
              ? "Die richtigen Experten für dein Leben auf Mallorca."
              : safeLocale === "en"
              ? "The right experts for life in Mallorca."
              : "Los expertos que necesitas para vivir en Mallorca."}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/55">
            {safeLocale === "de"
              ? "Anwälte, Zahnärzte, Estate Agents und mehr — ausgewählt nach Daten, nicht nach Zahlung."
              : safeLocale === "en"
              ? "Lawyers, dentists, estate agents and more — selected on data, not payment."
              : "Abogados, dentistas, estate agents y más — seleccionados por datos, no por pago."}
          </p>
          <div className="mx-auto mt-8 max-w-2xl">
            <ExpertHeroSearch
              locale={safeLocale}
              categories={copy.categories.map(({ slug, title }) => ({ slug, title }))}
              initialQuery={query}
              initialVertical={activeVertical}
              initialLanguage={langFilter}
            />
          </div>
        </div>
      </section>

      {/* ── DIRECTORY ── */}
      <section className="px-4 pb-10 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          {hasActiveSearch ? (
            <>
              <ExpertsFilters
                locale={safeLocale}
                sortKey={sortKey}
                langFilter={langFilter}
                activeVertical={activeVertical}
                query={query}
                count={displayedProfiles.length}
                categories={copy.categories.map(({ slug, title }) => ({ slug, title }))}
                copy={{
                  sortLabel: copy.sortLabel,
                  sortByReviews: copy.sortByReviews,
                  sortByRating: copy.sortByRating,
                  sortByName: copy.sortByName,
                  languageLabel: copy.languageLabel,
                  allFilter: copy.allFilter,
                  resultsLabel: copy.resultsLabel,
                  searchLabel: safeLocale === "de" ? "Suche" : safeLocale === "en" ? "Search" : "Buscar",
                  searchPlaceholder: safeLocale === "de" ? "Name, Ort oder Spezialgebiet..." : safeLocale === "en" ? "Name, area or specialism..." : "Nombre, zona o especialidad...",
                  categoryLabel: safeLocale === "de" ? "Bereich" : safeLocale === "en" ? "Vertical" : "Vertical",
                  clearFilters: safeLocale === "de" ? "Filter loeschen" : safeLocale === "en" ? "Clear filters" : "Limpiar filtros",
                }}
              />
              <LoadMoreExpertGrid
                profiles={displayedProfiles}
                locale={safeLocale}
                categories={copy.categories.map(({ slug, title }) => ({ slug, title }))}
                verticalColors={VERTICAL_COLORS}
                activeVertical={activeVertical}
                labels={copy.labels as { languages: string; specialties: string; website: string; phone: string; details: string }}
              />
            </>
          ) : (
            <div className="space-y-16 py-4">
              {copy.categories.map((cat) => {
                const catProfiles = allApproved
                  .filter((p) => p.verticalSlug === cat.slug)
                  .sort((a, b) => (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0))
                  .slice(0, 3);
                if (!catProfiles.length) return null;
                return (
                  <div key={cat.slug}>
                    <div className="mb-5 flex items-center justify-between gap-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#00C37A]">{cat.title}</p>
                      <a
                        href={`/${safeLocale}/experts?v=${cat.slug}`}
                        className="shrink-0 text-[11px] font-black uppercase tracking-[0.1em] text-white/35 hover:text-white"
                      >
                        {safeLocale === "de" ? "Alle →" : safeLocale === "en" ? "See all →" : "Ver todos →"}
                      </a>
                    </div>
                    <LoadMoreExpertGrid
                      profiles={catProfiles}
                      locale={safeLocale}
                      categories={copy.categories.map(({ slug, title }) => ({ slug, title }))}
                      verticalColors={VERTICAL_COLORS}
                      activeVertical={cat.slug}
                      labels={copy.labels as { languages: string; specialties: string; website: string; phone: string; details: string }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CRITERIA + FAQ — no alternating backgrounds ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="text-center lg:text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00C37A]">{copy.criteriaEyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight text-white sm:text-4xl">{copy.criteriaTitle}</h2>
            <p className="mt-5 text-sm leading-7 text-white/60">{copy.criteriaIntro}</p>
          </div>
          <div className="grid gap-3">
            {copy.criteria.map((item, index) => (
              <div key={item} className="flex gap-4 rounded-sm border border-white/[0.08] p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-[#00C37A] text-xs font-black text-[#0A0A0A]">{index + 1}</span>
                <p className="text-sm font-semibold leading-6 text-white/65">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.16em] text-[#00C37A]">FAQ</p>
          <h2 className="mt-2 text-center font-display text-3xl font-black leading-tight text-white sm:text-4xl">{copy.faqs[0] ? (safeLocale === "de" ? "Häufige Fragen" : safeLocale === "en" ? "Frequently asked questions" : "Preguntas frecuentes") : ""}</h2>
          <div className="mt-8 grid gap-3">
            {copy.faqs.map((item) => (
              <details key={item.question} className="group rounded-sm border border-white/[0.08]">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-black text-white marker:hidden [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-[#00C37A] text-[#0A0A0A] transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="border-t border-white/[0.08] px-5 py-4 text-sm leading-7 text-white/60">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={[breadcrumbs, collectionSchema]} />
    </main>
  );
}
