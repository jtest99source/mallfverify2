import Link from "next/link";
import {
  IconBuildingEstate,
  IconChecklist,
  IconHomeCheck,
  IconScale,
  IconShieldCheck,
  IconSparkles,
} from "@tabler/icons-react";
import { JsonLd } from "@/components/JsonLd";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/data";
import { createBreadcrumbSchema } from "@/lib/schema";

const expertCopy = {
  es: {
    metaTitle: "Expertos en Mallorca para compradores, expats y residentes internacionales | Mallorca Verified",
    metaDescription:
      "Abogados, estate agents, dentistas, médicos y profesionales en inglés y alemán para compradores, expats y residentes internacionales en Mallorca. Selección editorial, no pago por aparecer.",
    eyebrow: "Mallorca Verified Experts",
    title: "¿Buscas un profesional en Mallorca que hable tu idioma?",
    intro:
      "Encontrar un médico, abogado o agente inmobiliario que hable inglés o alemán en Mallorca no debería ser tan difícil. Estamos construyendo el directorio de profesionales verificados más completo de la isla.",
    buildingBadge: "En construcción",
    buildingTitle: "Estamos verificando cada perfil",
    buildingText:
      "Contactamos directamente con cada profesional para confirmar idiomas, especialidades y experiencia con clientes internacionales. Sin perfiles de pago, sin listados genéricos. Si necesitas una recomendación ahora, escríbenos.",
    buildingCta: "Escríbenos y te orientamos",
    buildingCtaHref: "mailto:hola@mallorcaverified.com",
    categoriesEyebrow: "Verticales en construcción",
    categoriesTitle: "Qué estamos verificando",
    comingSoonBadge: "Próximamente",
    criteriaEyebrow: "Cómo verificamos",
    criteriaTitle: "Qué incluye un perfil verificado",
    criteriaIntro:
      "Cada perfil va más allá de un nombre y un teléfono. Comprobamos qué hace realmente el profesional, a quién atiende y qué información pública lo respalda.",
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
      },
      {
        question: "¿Cuándo estará disponible?",
        answer:
          "Estamos verificando perfiles activamente. Si necesitas una recomendación ahora, escríbenos directamente a hola@mallorcaverified.com y te orientamos."
      }
    ],
    categories: [
      {
        slug: "english-speaking-lawyers-mallorca",
        icon: IconScale,
        title: "Abogados y fiscalistas",
        description:
          "Si compras, vendes, heredas o tienes un conflicto legal en Mallorca, necesitas a alguien que entienda el sistema español y te lo explique sin tecnicismos."
      },
      {
        slug: "architects-renovation-mallorca",
        icon: IconBuildingEstate,
        title: "Arquitectos y reformas",
        description:
          "Para reformar o construir en Mallorca sin las sorpresas habituales: licencias, vecinos, presupuestos que no se disparan."
      },
      {
        slug: "property-managers-mallorca",
        icon: IconHomeCheck,
        title: "Property managers y relocation",
        description:
          "Alguien que gestione lo que no puedes gestionar desde lejos — mantenimiento, proveedores, incidencias, coordinación."
      },
      {
        slug: "english-speaking-dentists-mallorca",
        icon: IconShieldCheck,
        title: "Dentistas",
        description:
          "Clínicas donde puedas describir el dolor en inglés, entender el presupuesto y no tener que traer traductor."
      },
      {
        slug: "english-speaking-doctors-mallorca",
        icon: IconShieldCheck,
        title: "Médicos y clínicas privadas",
        description:
          "Médicos y centros privados donde el diagnóstico se explica en inglés y los tiempos de espera no son los de la sanidad pública."
      },
      {
        slug: "estate-agents-mallorca",
        icon: IconBuildingEstate,
        title: "Estate agents",
        description:
          "Agentes con track record demostrable en compradores extranjeros. No los que más publicidad tienen — los que más transacciones reales han cerrado."
      },
      {
        slug: "mortgage-brokers-mallorca",
        icon: IconChecklist,
        title: "Mortgage brokers",
        description:
          "Brokers con experiencia real en hipotecas para no residentes en España — requisitos, plazos y bancos distintos a cualquier otro país europeo."
      },
      {
        slug: "aesthetic-medicine-mallorca",
        icon: IconSparkles,
        title: "Medicina estética",
        description:
          "Clínicas donde puedas discutir el tratamiento en inglés o alemán y entender exactamente qué se va a hacer."
      }
    ]
  },
  en: {
    metaTitle: "Experts in Mallorca for buyers, expats and international residents | Mallorca Verified",
    metaDescription:
      "Lawyers, estate agents, dentists, doctors and English and German-speaking professionals for buyers, expats and international residents in Mallorca. Editorial selection, not paid placement.",
    eyebrow: "Mallorca Verified Experts",
    title: "Looking for a professional in Mallorca who speaks your language?",
    intro:
      "Finding a doctor, lawyer or estate agent who speaks English or German in Mallorca shouldn't be this hard. We're building the most complete directory of verified professionals on the island.",
    buildingBadge: "Coming soon",
    buildingTitle: "We're verifying every profile",
    buildingText:
      "We contact each professional directly to confirm languages, specialisms and track record with international clients. No paid listings, no generic directories. If you need a recommendation now, get in touch.",
    buildingCta: "Get in touch",
    buildingCtaHref: "mailto:hola@mallorcaverified.com",
    categoriesEyebrow: "Verticals in progress",
    categoriesTitle: "What we're verifying",
    comingSoonBadge: "Coming soon",
    criteriaEyebrow: "How we verify",
    criteriaTitle: "What a verified expert profile includes",
    criteriaIntro:
      "Each profile goes beyond a name and a phone number. We check what the professional actually does, who they serve and what public information supports them.",
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
      },
      {
        question: "When will profiles be available?",
        answer:
          "We're actively verifying profiles. If you need a recommendation now, write to us directly at hola@mallorcaverified.com and we'll point you in the right direction."
      }
    ],
    categories: [
      {
        slug: "english-speaking-lawyers-mallorca",
        icon: IconScale,
        title: "Lawyers and tax advisors",
        description:
          "If you're buying, selling, inheriting or dealing with a legal issue in Mallorca, you need someone who understands Spanish law and explains it without jargon."
      },
      {
        slug: "architects-renovation-mallorca",
        icon: IconBuildingEstate,
        title: "Architects and renovation",
        description:
          "For renovating or building in Mallorca without the usual surprises: permits, neighbours, budgets that don't spiral."
      },
      {
        slug: "property-managers-mallorca",
        icon: IconHomeCheck,
        title: "Property managers and relocation",
        description:
          "Someone to handle what you can't manage from a distance — maintenance, contractors, incidents, coordination."
      },
      {
        slug: "english-speaking-dentists-mallorca",
        icon: IconShieldCheck,
        title: "Dentists",
        description:
          "Clinics where you can describe your symptoms in English, understand the quote and not need a translator."
      },
      {
        slug: "english-speaking-doctors-mallorca",
        icon: IconShieldCheck,
        title: "Doctors and private clinics",
        description:
          "Private doctors and clinics where the diagnosis is explained in English and waiting times are not those of the public system."
      },
      {
        slug: "estate-agents-mallorca",
        icon: IconBuildingEstate,
        title: "Estate agents",
        description:
          "Agents with demonstrable track records with foreign buyers. Not the ones with the most advertising — the ones who have closed the most real transactions."
      },
      {
        slug: "mortgage-brokers-mallorca",
        icon: IconChecklist,
        title: "Mortgage brokers",
        description:
          "Brokers with real experience in non-resident mortgages in Spain — different requirements, timelines and banks from anywhere else in Europe."
      },
      {
        slug: "aesthetic-medicine-mallorca",
        icon: IconSparkles,
        title: "Aesthetic medicine",
        description:
          "Clinics where you can discuss treatment in English or German and understand exactly what will be done."
      }
    ]
  },
  de: {
    metaTitle: "Experten auf Mallorca für Käufer, Expats und internationale Bewohner | Mallorca Verified",
    metaDescription:
      "Anwälte, Immobilienmakler, Zahnärzte, Ärzte und deutsch- und englischsprachige Profis für Käufer, Expats und internationale Bewohner auf Mallorca. Redaktionelle Auswahl, kein bezahltes Listing.",
    eyebrow: "Mallorca Verified Experts",
    title: "Suchen Sie einen Fachmann auf Mallorca, der Ihre Sprache spricht?",
    intro:
      "Einen Arzt, Anwalt oder Immobilienmakler zu finden, der auf Mallorca Deutsch oder Englisch spricht, sollte nicht so schwer sein. Wir bauen das vollständigste Verzeichnis verifizierter Profis auf der Insel.",
    buildingBadge: "Im Aufbau",
    buildingTitle: "Wir verifizieren jedes Profil",
    buildingText:
      "Wir kontaktieren jeden Fachmann direkt, um Sprachen, Spezialisierungen und Erfahrung mit internationalen Kunden zu bestätigen. Keine bezahlten Listings, keine generischen Verzeichnisse. Wenn Sie jetzt eine Empfehlung brauchen, schreiben Sie uns.",
    buildingCta: "Schreib uns",
    buildingCtaHref: "mailto:hola@mallorcaverified.com",
    categoriesEyebrow: "Bereiche im Aufbau",
    categoriesTitle: "Was wir verifizieren",
    comingSoonBadge: "Demnächst",
    criteriaEyebrow: "Wie wir prüfen",
    criteriaTitle: "Was ein verifiziertes Expertenprofil enthält",
    criteriaIntro:
      "Jedes Profil geht über Name und Telefonnummer hinaus. Wir prüfen, was der Experte wirklich macht, wem er hilft und welche öffentlichen Informationen ihn stützen.",
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
      },
      {
        question: "Wann sind die Profile verfügbar?",
        answer:
          "Wir verifizieren aktiv Profile. Wenn Sie jetzt eine Empfehlung brauchen, schreiben Sie uns direkt an hola@mallorcaverified.com."
      }
    ],
    categories: [
      {
        slug: "english-speaking-lawyers-mallorca",
        icon: IconScale,
        title: "Anwälte und Steuerberater",
        description:
          "Spezialisten für Immobilienkauf, Due Diligence, Steuern für Nicht-Residenten, Erbschaften und internationale Kunden."
      },
      {
        slug: "architects-renovation-mallorca",
        icon: IconBuildingEstate,
        title: "Architekten und Renovierung",
        description:
          "Architekturbüros und Bauunternehmen für Renovierung oder Neubau auf Mallorca ohne die üblichen Überraschungen."
      },
      {
        slug: "property-managers-mallorca",
        icon: IconHomeCheck,
        title: "Property Manager und Relocation",
        description:
          "Services für den Umzug nach Mallorca, Immobilienverwaltung und Koordination von Dienstleistern."
      },
      {
        slug: "english-speaking-dentists-mallorca",
        icon: IconShieldCheck,
        title: "Zahnärzte",
        description:
          "Zahnkliniken für Expats und internationale Residenten, die auf Deutsch oder Englisch betreuen."
      },
      {
        slug: "english-speaking-doctors-mallorca",
        icon: IconShieldCheck,
        title: "Ärzte und Privatkliniken",
        description:
          "Private Ärztezentren und Kliniken für internationale Patienten auf Mallorca."
      },
      {
        slug: "estate-agents-mallorca",
        icon: IconBuildingEstate,
        title: "Estate Agents",
        description:
          "Immobilienagenturen mit nachweisbarer Erfahrung mit ausländischen Käufern, Verkäufern und Investoren."
      },
      {
        slug: "mortgage-brokers-mallorca",
        icon: IconChecklist,
        title: "Mortgage Broker",
        description:
          "Hypothekenbroker für internationale Käufer und Nicht-Residenten — mit Erfahrung in den besonderen Anforderungen Spaniens."
      },
      {
        slug: "aesthetic-medicine-mallorca",
        icon: IconSparkles,
        title: "Ästhetische Medizin",
        description:
          "Kliniken für ästhetische Medizin mit Betreuung auf Englisch und/oder Deutsch auf Mallorca."
      }
    ]
  }
} as const;

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

export default async function ExpertsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const copy = expertCopy[safeLocale];
  const pageUrl = `${siteUrl}/${safeLocale}/experts`;

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
    <main className="bg-[#040D1A] text-white">
      {/* ── HERO ── */}
      <section className="border-b border-white/[0.08] bg-[#07101F] px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]">
            <IconShieldCheck size={13} stroke={2} />
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-black leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            {copy.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/55">
            {copy.intro}
          </p>
        </div>
      </section>

      {/* ── BUILDING STATE ── */}
      <section className="border-b border-white/[0.08] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#00C37A]/30 bg-[#00C37A]/[0.07] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-[#00C37A]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00C37A]" />
            {copy.buildingBadge}
          </span>
          <h2 className="mt-5 text-2xl font-black leading-tight text-white sm:text-3xl">
            {copy.buildingTitle}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/55">
            {copy.buildingText}
          </p>
          <Link
            href={copy.buildingCtaHref}
            className="mt-7 inline-flex items-center gap-2 rounded-sm bg-[#00C37A] px-6 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-colors hover:bg-[#00a866]"
          >
            {copy.buildingCta} →
          </Link>
        </div>
      </section>

      {/* ── CATEGORIES GRID ── */}
      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#00C37A]">{copy.categoriesEyebrow}</p>
          <h2 className="mt-2 text-3xl font-black text-white sm:text-4xl">{copy.categoriesTitle}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {copy.categories.map((cat) => (
              <div
                key={cat.slug}
                className="flex flex-col rounded-sm border border-white/[0.08] bg-[#0C1A2E] p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <cat.icon size={18} stroke={1.5} className="text-[#00C37A]" />
                  <span className="rounded-full border border-white/[0.10] px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-white/30">
                    {copy.comingSoonBadge}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-black leading-tight text-white">{cat.title}</h3>
                <p className="mt-2 text-[12px] leading-5 text-white/45">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CRITERIA ── */}
      <section className="border-t border-white/[0.08] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
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
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-white/[0.08] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.16em] text-[#00C37A]">FAQ</p>
          <h2 className="mt-2 text-center font-display text-3xl font-black leading-tight text-white sm:text-4xl">
            {safeLocale === "de" ? "Häufige Fragen" : safeLocale === "en" ? "Frequently asked questions" : "Preguntas frecuentes"}
          </h2>
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
