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
    title: "Los profesionales que necesitas cuando Mallorca deja de ser solo unas vacaciones",
    intro:
      "Google Maps no te dice si un abogado ha cerrado 200 transacciones para compradores extranjeros o si habla inglés de verdad. Cada perfil aquí va más allá del nombre y el teléfono: especialidades reales, idiomas confirmados, zona cubierta e historial público. Selección editorial, no pago por aparecer.",
    primaryCta: "Solicitar auditoría",
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
          "Especialistas en compraventa, due diligence, fiscalidad para no residentes, herencias, contratos y asesoría para extranjeros."
      },
      {
        slug: "architects-renovation-mallorca",
        icon: IconBuildingEstate,
        title: "Arquitectos y reformas",
        description:
          "Estudios, interioristas, constructores y técnicos para reformar, legalizar o mejorar una vivienda en Mallorca."
      },
      {
        slug: "property-managers-mallorca",
        icon: IconHomeCheck,
        title: "Property managers y relocation",
        description:
          "Servicios para mudarse, gestionar propiedades, mantener villas, coordinar proveedores y resolver el día a día en la isla."
      },
      {
        slug: "english-speaking-dentists-mallorca",
        icon: IconShieldCheck,
        title: "Dentistas",
        description:
          "Clínicas dentales, ortodoncia y urgencias para expats, familias y residentes internacionales en Mallorca."
      },
      {
        slug: "english-speaking-doctors-mallorca",
        icon: IconShieldCheck,
        title: "Médicos y clínicas privadas",
        description:
          "Centros médicos, GP y clínicas privadas con perfil útil para pacientes internacionales en Mallorca."
      },
      {
        slug: "estate-agents-mallorca",
        icon: IconBuildingEstate,
        title: "Estate agents",
        description:
          "Agencias inmobiliarias con señales sólidas para compradores extranjeros, vendedores e inversores."
      },
      {
        slug: "mortgage-brokers-mallorca",
        icon: IconChecklist,
        title: "Mortgage brokers",
        description:
          "Brokers hipotecarios y asesores de financiación para compradores internacionales y no residentes."
      },
      {
        slug: "aesthetic-medicine-mallorca",
        icon: IconSparkles,
        title: "Medicina estética",
        description:
          "Clínicas de medicina estética, dermatología estética y cirugía cosmética con atención en inglés y/o alemán en Mallorca."
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
    title: "The professionals you need when Mallorca stops being just a holiday",
    intro:
      "Google Maps won't tell you if a lawyer has closed 200 transactions for foreign buyers or genuinely speaks English. Every profile here goes beyond a name and phone number: real specialisms, confirmed languages, coverage area and a public track record. Editorial selection, not paid placement.",
    primaryCta: "Request an audit",
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
          "Specialists in property purchase, due diligence, non-resident tax, inheritance, contracts and advice for international clients."
      },
      {
        slug: "architects-renovation-mallorca",
        icon: IconBuildingEstate,
        title: "Architects and renovation",
        description:
          "Architecture studios, interior designers, builders and technical experts for renovating, legalising or improving a home in Mallorca."
      },
      {
        slug: "property-managers-mallorca",
        icon: IconHomeCheck,
        title: "Property managers and relocation",
        description:
          "Services for moving to Mallorca, managing properties, maintaining villas, coordinating providers and handling daily island needs."
      },
      {
        slug: "english-speaking-dentists-mallorca",
        icon: IconShieldCheck,
        title: "Dentists",
        description:
          "Dental clinics, orthodontics and emergency dentists for expats, families and international residents in Mallorca."
      },
      {
        slug: "english-speaking-doctors-mallorca",
        icon: IconShieldCheck,
        title: "Doctors and private clinics",
        description:
          "Medical centres, GP practices and private clinics useful for international patients in Mallorca."
      },
      {
        slug: "estate-agents-mallorca",
        icon: IconBuildingEstate,
        title: "Estate agents",
        description:
          "Estate agencies with solid public signals for foreign buyers, sellers and property investors."
      },
      {
        slug: "mortgage-brokers-mallorca",
        icon: IconChecklist,
        title: "Mortgage brokers",
        description:
          "Mortgage brokers and finance advisors for international buyers and non-residents purchasing in Mallorca."
      },
      {
        slug: "aesthetic-medicine-mallorca",
        icon: IconSparkles,
        title: "Aesthetic medicine",
        description:
          "Aesthetic medicine clinics, cosmetic dermatology and cosmetic surgery with English and/or German care in Mallorca."
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
    title: "Die Profis, die du brauchst, wenn Mallorca mehr als nur ein Urlaub wird",
    intro:
      "Google Maps verrät dir nicht, ob ein Anwalt 200 Transaktionen für ausländische Käufer abgeschlossen hat oder wirklich Englisch spricht. Jedes Profil hier geht über Namen und Telefonnummer hinaus: echte Spezialgebiete, bestätigte Sprachen, Abdeckungsgebiet und öffentliche Referenzen. Redaktionelle Auswahl, kein bezahltes Listing.",
    primaryCta: "Audit anfragen",
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

function DirectoryCard({
  profile,
  locale,
  verticalLabel,
  verticalColor,
  hideVertical,
  labels
}: {
  profile: ExpertProfile;
  locale: Locale;
  verticalLabel: string;
  verticalColor: string;
  hideVertical: boolean;
  labels: { languages: string; specialties: string; website: string; phone: string; details: string };
}) {
  const editorialNote = profile.editorialNote?.[locale];
  const specialties = localizedList(profile.specialties, locale);
  return (
    <article
      className="group flex min-h-[300px] flex-col overflow-hidden rounded-lg border border-l-4 border-[#E5E7EB] bg-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderLeftColor: verticalColor }}
    >
      <div className="flex flex-1 flex-col p-5">
        {/* Category + rating — same row, same as BusinessCard */}
        <div className={`flex flex-wrap items-center gap-2 ${!hideVertical && verticalLabel ? "justify-between" : "justify-end"}`}>
          {!hideVertical && verticalLabel ? (
            <p className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: verticalColor }}>
              {verticalLabel}
            </p>
          ) : null}
          <RatingBadge rating={profile.rating} reviewsCount={profile.reviewsCount} locale={locale} compact />
        </div>

        {/* Name + location */}
        <h3 className="mt-2 text-2xl font-black leading-tight text-[#0A0A0A]">{profile.name}</h3>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#6B7280]">
          <IconMapPin size={13} stroke={2} />
          {profile.location}
        </p>

        {/* Editorial note when available */}
        {editorialNote ? (
          <div className="mt-3 rounded-md bg-[#F9FAFB] px-3 py-2.5">
            <p className="mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#0A0A0A]">Editorial</p>
            <p className="line-clamp-2 text-xs leading-5 text-[#0A0A0A]">{editorialNote}</p>
          </div>
        ) : null}

        {/* Languages + specialties */}
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#6B7280]">{labels.languages}</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {profile.languages.map((l) => (
                <span key={l} className="rounded-full border border-[#E5E7EB] px-2.5 py-0.5 text-xs font-bold text-[#0A0A0A]">
                  {l}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#6B7280]">{labels.specialties}</dt>
            <dd className="mt-1.5 text-xs font-semibold leading-5 text-[#0A0A0A]">
              {specialties.slice(0, 3).join(", ")}
            </dd>
          </div>
        </dl>

        {/* Actions pushed to bottom */}
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {profile.website ? (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded border border-[#E5E7EB] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
            >
              <IconWorld size={13} stroke={1.8} />
              {labels.website}
            </a>
          ) : null}
          {profile.phone ? (
            <a
              href={`tel:${profile.phone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 rounded border border-[#E5E7EB] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] hover:border-[#0A0A0A] hover:text-[#0A0A0A]"
            >
              <IconPhone size={13} stroke={1.8} />
              {labels.phone}
            </a>
          ) : null}
          <Link
            href={`/${locale}/experts/${profile.verticalSlug}/${profile.slug}`}
            className="inline-flex items-center gap-1.5 rounded bg-[#0A0A0A] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-white hover:bg-[#262626]"
          >
            {labels.details}
            <IconExternalLink size={13} stroke={1.8} />
          </Link>
        </div>
      </div>
    </article>
  );
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
  const heroIntro = langFilter === "Deutsch"
    ? safeLocale === "de"
      ? "Deutschsprachige Profis für Expats, Käufer und internationale Residenten auf Mallorca — Anwälte, Zahnärzte, Immobilienmakler, Hypothekenbroker, Architekten, Ärzte und Property Manager."
      : safeLocale === "es"
      ? "Profesionales que hablan alemán para expats, compradores y residentes en Mallorca — abogados, dentistas, estate agents, brokers hipotecarios, arquitectos, médicos y property managers."
      : "German-speaking professionals for expats, buyers and residents in Mallorca — lawyers, dentists, estate agents, mortgage brokers, architects, doctors and property managers."
    : copy.intro;
  const faqIntro = {
    es: {
      title: "Preguntas frecuentes sobre Mallorca Verified Experts",
      text: "Resolvemos las dudas principales sobre seleccion, perfiles premium y fiabilidad de los datos antes de contactar con un profesional."
    },
    en: {
      title: "Frequently asked questions about Mallorca Verified Experts",
      text: "Key answers about selection, premium profiles and data reliability before you contact a professional."
    },
    de: {
      title: "Haeufige Fragen zu Mallorca Verified Experts",
      text: "Die wichtigsten Antworten zu Auswahl, Premium-Profilen und Datenverlaesslichkeit, bevor du einen Experten kontaktierst."
    }
  }[safeLocale];
  const VERTICAL_COLORS: Record<string, string> = {
    "english-speaking-lawyers-mallorca":  "#0A0A0A",
    "architects-renovation-mallorca":     "#0A0A0A",
    "property-managers-mallorca":         "#0A0A0A",
    "english-speaking-dentists-mallorca": "#0A0A0A",
    "english-speaking-doctors-mallorca":  "#0A0A0A",
    "estate-agents-mallorca":             "#0A0A0A",
    "mortgage-brokers-mallorca":          "#0A0A0A",
    "aesthetic-medicine-mallorca":        "#0A0A0A",
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

  return (
    <main className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_44%,#FFFFFF_100%)]">
      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0A0A0A]">
            <IconShieldCheck size={15} stroke={2} />
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-black leading-[0.98] text-[#0A0A0A] sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#6B7280]">{heroIntro}</p>
          <div className="mt-5 hidden flex-wrap gap-x-6 gap-y-2 text-[12px] font-semibold text-[#6B7280] sm:flex">
            <span className="inline-flex items-center gap-2">
              <IconLanguage size={14} className="shrink-0 text-[#0A0A0A]" />
              {safeLocale === "de" ? "Deutsch, Englisch, Spanisch" : safeLocale === "en" ? "English, Deutsch, Español" : "Español, English, Deutsch"}
            </span>
            <span className="inline-flex items-center gap-2">
              <IconChecklist size={14} className="shrink-0 text-[#0A0A0A]" />
              {safeLocale === "de" ? "Öffentliche Signale und redaktionelle Prüfung" : safeLocale === "en" ? "Public signals and editorial checks" : "Señales públicas y revisión editorial"}
            </span>
            <span className="inline-flex items-center gap-2">
              <IconShieldCheck size={14} className="shrink-0 text-[#0A0A0A]" />
              {safeLocale === "de" ? "Keine bezahlten Platzierungen" : safeLocale === "en" ? "No paid placements" : "Sin posiciones de pago"}
            </span>
          </div>
          <Link href={copy.methodologyPath} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-md border border-[#0A0A0A] bg-[#0A0A0A] px-5 text-[11px] font-black uppercase tracking-[0.1em] text-[#FFFFFF] shadow-[0_14px_30px_rgba(10,10,10,0.16)] hover:bg-[#262626]">
            {copy.secondaryCta}
          </Link>
          </div>
          <aside className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_22px_55px_rgba(10,10,10,0.09)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#0A0A0A] text-[#FFCC00]">
                <IconShieldCheck size={26} stroke={2} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0A0A0A]">
                  {safeLocale === "de" ? "Verified layer" : safeLocale === "en" ? "Verified layer" : "Capa verificada"}
                </p>
                <h2 className="text-lg font-black leading-tight text-[#0A0A0A]">
                  {safeLocale === "de" ? "Professionals with clear criteria" : safeLocale === "en" ? "Professionals with clear criteria" : "Profesionales con criterio claro"}
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                safeLocale === "de" ? "Sprache, Spezialisierung und Gebiet werden klar angegeben." : safeLocale === "en" ? "Language, specialism and area are made explicit." : "Idioma, especialidad y zona aparecen de forma clara.",
                safeLocale === "de" ? "Premium-Profile verbessern die Information, nicht die Position." : safeLocale === "en" ? "Premium profiles improve information, not position." : "Las fichas premium mejoran la información, no la posición.",
                safeLocale === "de" ? "Unternehmensnamen werden nicht künstlich übersetzt." : safeLocale === "en" ? "Business names are not artificially translated." : "Los nombres de empresas no se traducen artificialmente."
              ].map((item) => (
                <p key={item} className="rounded-md border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-3 text-sm font-semibold leading-6 text-[#6B7280]">
                  {item}
                </p>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { value: allApproved.length, label: safeLocale === "de" ? "Profile" : safeLocale === "en" ? "profiles" : "perfiles" },
                { value: copy.categories.length, label: safeLocale === "de" ? "Bereiche" : safeLocale === "en" ? "verticals" : "verticales" },
                { value: 3, label: safeLocale === "de" ? "Sprachen" : safeLocale === "en" ? "languages" : "idiomas" }
              ].map((stat) => (
                <div key={stat.label} className="rounded-md border border-[#FFCC00]/60 bg-[#0A0A0A] px-3 py-3 text-center">
                  <div className="text-2xl font-black leading-none text-[#FFCC00]">{stat.value}</div>
                  <div className="mt-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/75">{stat.label}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.directoryEyebrow}</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
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
            <div className="min-w-0">
              <LoadMoreExpertGrid
                profiles={displayedProfiles}
                locale={safeLocale}
                categories={copy.categories.map(({ slug, title }) => ({ slug, title }))}
                verticalColors={VERTICAL_COLORS}
                activeVertical={activeVertical}
                labels={copy.labels as { languages: string; specialties: string; website: string; phone: string; details: string }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#E5E7EB] bg-[#FFFFFF] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.criteriaEyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-black leading-tight text-[#0A0A0A] sm:text-5xl">{copy.criteriaTitle}</h2>
            <p className="mt-5 text-sm leading-7 text-[#6B7280]">{copy.criteriaIntro}</p>
          </div>
          <div className="grid gap-3">
            {copy.criteria.map((item, index) => (
              <div key={item} className="flex gap-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 shadow-[0_12px_30px_rgba(10,10,10,0.05)]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-xs font-black text-[#FFCC00]">{index + 1}</span>
                <p className="pt-1 text-sm font-semibold leading-6 text-[#0A0A0A]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0A0A0A]">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight text-[#0A0A0A] sm:text-5xl">{faqIntro.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#6B7280]">{faqIntro.text}</p>
          <div className="mt-8 grid gap-4 text-left">
            {copy.faqs.map((item) => (
              <details key={item.question} className="group rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] shadow-[0_12px_30px_rgba(10,10,10,0.05)]">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-5 text-sm font-black text-[#0A0A0A] marker:hidden [&::-webkit-details-marker]:hidden sm:px-6">
                  {item.question}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A] text-[#FFCC00] transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="border-t border-[#E5E7EB] px-5 py-5 text-sm leading-7 text-[#6B7280] sm:px-6">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#E5E7EB] bg-[#0A0A0A] p-6 text-white shadow-[0_24px_60px_rgba(10,10,10,0.16)] sm:p-8 lg:p-10">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FFCC00]">{copy.eyebrow}</p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-black leading-tight text-white sm:text-5xl">{copy.ctaTitle}</h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/75">{copy.ctaText}</p>
          <Link href={`/${safeLocale}/contact`} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-white px-6 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-all duration-150 hover:bg-[#FFFFFF]">
            {copy.ctaButton}
          </Link>
        </div>
      </section>

      <JsonLd data={[breadcrumbs, collectionSchema, createFAQSchema([...copy.faqs])]} />
    </main>
  );
}
