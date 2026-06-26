import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconChecklist,
  IconCircleCheck,
  IconExternalLink,
  IconLanguage,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
  IconWorld
} from "@tabler/icons-react";
import { JsonLd } from "@/components/JsonLd";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/data";
import { createBreadcrumbSchema, createFAQSchema } from "@/lib/schema";
import {
  expertVerticalSlugs,
  getExpertProfilesByVertical,
  isExpertVerticalSlug,
  type ExpertProfile,
  type ExpertVerticalSlug
} from "@/data/expertProfiles";

type ExpertSlug = ExpertVerticalSlug;

type VerticalCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  summary: string;
  bestForTitle: string;
  bestFor: string[];
  verifyTitle: string;
  verifyIntro: string;
  verification: string[];
  profileTitle: string;
  profileIntro: string;
  profileFields: string[];
  faq: Array<{ question: string; answer: string }>;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  backLabel: string;
};

const verticalCopy: Record<Locale, Partial<Record<ExpertSlug, VerticalCopy>>> = {
  es: {
    "english-speaking-lawyers-mallorca": {
      metaTitle: "Abogados que hablan inglés en Mallorca | Mallorca Verified Experts",
      metaDescription:
        "Selección de abogados en Mallorca que trabajan con compradores extranjeros, expats e inversores: compraventa, fiscalidad, herencias y asesoramiento para no residentes.",
      eyebrow: "Verified Experts · Legal",
      title: "Abogados que hablan inglés en Mallorca para compradores, expats e inversores",
      intro:
        "Comprar una vivienda, gestionar una herencia o crear una empresa en Mallorca requiere asesoramiento legal en el que puedas confiar. Estamos seleccionando despachos que trabajan con clientes internacionales, con información clara sobre idiomas, especialidades y experiencia real.",
      summary:
        "La mayoría de los directorios listan todos los despachos de la zona. Nosotros nos centramos en lo que los clientes internacionales realmente necesitan saber: idiomas reales, especialidad relevante y datos claros — no solo un nombre y un teléfono.",
      bestForTitle: "Para quién es esto",
      bestFor: [
        "Compradores extranjeros que adquieren una propiedad en Mallorca",
        "Expats con trámites de fiscalidad, NIE o residencia",
        "Inversores que constituyen una empresa o estructura en España",
        "Familias con herencias o planificación patrimonial"
      ],
      verifyTitle: "Qué mirar antes de contratar un abogado en Mallorca",
      verifyIntro:
        "Tanto si usas nuestro directorio como si buscas por tu cuenta, estas son las cosas que vale la pena comprobar.",
      verification: [
        "Idiomas que realmente hablan, no solo los que aparecen en la web.",
        "Especialidad real: inmobiliario, fiscal, herencias, derecho de empresa o relocation.",
        "Experiencia con clientes internacionales, no solo locales.",
        "Web con datos de contacto y nombre de los profesionales del equipo.",
        "Reputación consistente en fuentes públicas."
      ],
      profileTitle: "Qué incluye cada ficha",
      profileIntro:
        "Cada ficha va más allá de un nombre y un teléfono. Encontrarás los idiomas reales del despacho, sus principales especialidades, zonas de trabajo y respuestas a las preguntas más habituales de clientes internacionales.",
      profileFields: ["Especialidades", "Idiomas", "Zonas cubiertas", "Web oficial", "FAQ práctico", "Señales verificadas"],
      faq: [
        {
          question: "¿Por qué empezar por abogados que hablan inglés?",
          answer:
            "Porque es una búsqueda de alto riesgo: compradores extranjeros, residentes internacionales e inversores necesitan confiar en el profesional antes de contactarle, y encontrar información útil en internet no es fácil."
        },
        {
          question: "¿Los despachos pueden pagar para aparecer primeros?",
          answer:
            "No. Una colaboración puede mejorar la ficha con más información, fotos o FAQ, pero no altera la posición editorial."
        },
        {
          question: "¿Se incluirán despachos de toda la isla?",
          answer:
            "Sí. Cubriremos Palma, el suroeste, el norte y el interior. Lo importante es que el despacho trabaje con clientes internacionales, no que esté en un área concreta."
        }
      ],
      ctaTitle: "¿Tienes un despacho en Mallorca?",
      ctaText:
        "Podemos revisar cómo aparece tu despacho online y qué falta para que clientes internacionales te encuentren y confíen en ti más fácilmente.",
      ctaButton: "Escríbenos",
      backLabel: "Volver a Experts"
    },
    "architects-renovation-mallorca": {
      metaTitle: "Arquitectos y reformas en Mallorca | Mallorca Verified Experts",
      metaDescription:
        "Selección de arquitectos, estudios y empresas de reformas en Mallorca para propietarios e inversores internacionales: proyectos residenciales, villas, fincas y obra nueva.",
      eyebrow: "Verified Experts · Arquitectura",
      title: "Arquitectos y expertos en reformas en Mallorca para proyectos con criterio",
      intro:
        "Reformar, legalizar o mejorar una vivienda en Mallorca implica permisos, proveedores locales, presupuesto y decisiones técnicas que son difíciles de gestionar sin el equipo adecuado. Estamos seleccionando arquitectos, estudios y empresas de reformas que trabajan con propietarios internacionales.",
      summary:
        "El objetivo no es una lista larga, sino una lista útil. Separamos quién hace obra nueva, reforma integral, interiorismo, legalización o dirección técnica — para que puedas encontrar el perfil que encaja con tu proyecto.",
      bestForTitle: "Para quién es esto",
      bestFor: [
        "Compradores extranjeros que quieren reformar antes o después de comprar",
        "Propietarios que quieren ampliar, reformar o actualizar una villa o finca",
        "Inversores que necesitan legalización o dirección técnica",
        "Propietarios que buscan interiorismo para una propiedad en Mallorca"
      ],
      verifyTitle: "Qué mirar antes de contratar un arquitecto o empresa de reformas",
      verifyIntro:
        "Antes de contratar a alguien para un proyecto de vivienda en Mallorca, vale la pena comprobar estas cosas.",
      verification: [
        "Portfolio público con proyectos reales terminados, no solo renders.",
        "Tipo de servicio: arquitectura, reforma integral, interiorismo, dirección técnica o construcción.",
        "Experiencia con villas, fincas, apartamentos o el tipo de propiedad que tienes.",
        "Idiomas en los que trabajan, si vas a comunicarte en inglés o alemán.",
        "Zonas de Mallorca donde trabajan habitualmente."
      ],
      profileTitle: "Qué incluye cada ficha",
      profileIntro:
        "Cada ficha explica qué tipo de proyectos hace el estudio, en qué zonas trabaja y para qué tipo de cliente encaja — para que puedas decidir si tiene sentido contactarles.",
      profileFields: ["Tipo de proyecto", "Portfolio", "Idiomas", "Zonas", "Servicios", "FAQ de proceso"],
      faq: [
        {
          question: "¿Se incluirán constructores e interioristas, o solo arquitectos?",
          answer:
            "También constructores e interioristas, si tienen presencia clara y trabajan en proyectos residenciales. El criterio es la utilidad para el propietario, no el título profesional."
        },
        {
          question: "¿Cómo sé si un estudio tiene experiencia con clientes extranjeros?",
          answer:
            "En cada ficha indicaremos los idiomas en los que trabajan y si tienen proyectos con propietarios internacionales. Si no hay datos claros, no lo asumimos."
        },
        {
          question: "¿Una ficha premium afecta al ranking?",
          answer:
            "No. Una ficha premium puede añadir más información — portfolio, servicios, FAQ — pero no compra posición."
        }
      ],
      ctaTitle: "¿Diriges un estudio o empresa de reformas?",
      ctaText:
        "Podemos revisar tu visibilidad online y preparar una ficha útil para propietarios e inversores internacionales que buscan profesionales en Mallorca.",
      ctaButton: "Escríbenos",
      backLabel: "Volver a Experts"
    },
    "property-managers-mallorca": {
      metaTitle: "Property managers y relocation en Mallorca | Mallorca Verified Experts",
      metaDescription:
        "Selección de property managers, servicios de relocation y gestión de vivienda en Mallorca para propietarios, expats y compradores internacionales.",
      eyebrow: "Verified Experts · Property",
      title: "Property managers y relocation en Mallorca para vivir con menos fricción",
      intro:
        "Si tienes una propiedad en Mallorca pero no vives allí todo el año, necesitas alguien de confianza. Estamos seleccionando property managers, servicios de relocation y empresas de gestión de vivienda que trabajan con propietarios internacionales y expats.",
      summary:
        "Muchas empresas de este sector lo ofrecen todo en papel. Nos centramos en lo que hacen realmente: mantenimiento, llaves, coordinación de alquileres, limpieza o apoyo en la mudanza — no solo una lista de servicios sin respaldo.",
      bestForTitle: "Para quién es esto",
      bestFor: [
        "Propietarios de segunda residencia que necesitan gestión a distancia",
        "Expats que se mudan a Mallorca y necesitan ayuda para instalarse",
        "Inversores con propiedades de alquiler que necesitan coordinación",
        "Propietarios que pasan parte del año fuera de la isla"
      ],
      verifyTitle: "Qué mirar antes de contratar un property manager en Mallorca",
      verifyIntro:
        "La gestión de una propiedad depende de la confianza. Esto es lo que vale la pena comprobar antes de dar las llaves.",
      verification: [
        "Servicios concretos: no solo 'gestión integral', sino qué incluye exactamente.",
        "Zonas de Mallorca que cubren realmente.",
        "Idiomas en los que atienden.",
        "Web y presencia profesional que puedas verificar.",
        "Referencias o reseñas de clientes actuales."
      ],
      profileTitle: "Qué incluye cada ficha",
      profileIntro:
        "Cada ficha explica qué hace la empresa, para qué tipo de propiedad encaja y qué puede resolver — sin depender de frases promocionales.",
      profileFields: ["Servicios", "Idiomas", "Zonas", "Tipo de propiedad", "Urgencias", "FAQ práctico"],
      faq: [
        {
          question: "¿En qué se diferencia relocation de property management?",
          answer:
            "Relocation ayuda en la mudanza y el aterrizaje en la isla: buscar vivienda, trámites, colegios, proveedores. Property management gestiona la propiedad una vez instalado. Algunas empresas hacen ambas cosas."
        },
        {
          question: "¿Se pueden gestionar propiedades de alquiler vacacional?",
          answer:
            "Depende de la empresa. Algunas se especializan en alquiler vacacional, otras en viviendas de uso propio o de larga temporada. En cada ficha lo indicaremos con claridad."
        },
        {
          question: "¿Qué pasa si necesito ayuda urgente en la propiedad?",
          answer:
            "Indicaremos si la empresa ofrece atención de urgencias y en qué horarios. No todas lo hacen, y es importante saberlo antes de contratar."
        }
      ],
      ctaTitle: "¿Gestionas propiedades o ayudas a expats en Mallorca?",
      ctaText:
        "Podemos revisar tu presencia online y preparar una ficha clara para propietarios internacionales que buscan un gestor de confianza en Mallorca.",
      ctaButton: "Escríbenos",
      backLabel: "Volver a Experts"
    }
  },
  en: {
    "english-speaking-lawyers-mallorca": {
      metaTitle: "English-speaking lawyers in Mallorca | Mallorca Verified Experts",
      metaDescription:
        "A curated list of English-speaking lawyers in Mallorca for property buyers, expats and investors: conveyancing, tax, inheritance and legal advice for non-residents.",
      eyebrow: "Verified Experts · Legal",
      title: "English-speaking lawyers in Mallorca for buyers, expats and investors",
      intro:
        "Buying property, dealing with inheritance or setting up a business in Mallorca means you need legal advice you can actually trust. We're building a curated list of lawyers who work regularly with international clients — with clear information on languages, specialisms and real experience.",
      summary:
        "Most directories list every firm in the area. We focus on what international clients actually need to know: real language support, relevant specialism and clear details — not just a name and a phone number.",
      bestForTitle: "Who this is for",
      bestFor: [
        "Foreign buyers purchasing property in Mallorca",
        "Expats dealing with tax, NIE or residency paperwork",
        "Investors setting up a Spanish company or business structure",
        "Families navigating inheritance or estate planning"
      ],
      verifyTitle: "What to look for in a Mallorca lawyer",
      verifyIntro:
        "Whether you use our directory or search on your own, these are the things worth checking before you hire.",
      verification: [
        "Languages actually spoken — not just listed on a website.",
        "Real specialism: property, tax, inheritance, company law or relocation.",
        "Experience with international clients, not just local ones.",
        "A clear website with contact details and named professionals.",
        "Consistent reputation across public sources."
      ],
      profileTitle: "What each profile covers",
      profileIntro:
        "Each listing goes beyond a name and number. You'll find the firm's real languages, main specialisms, areas covered and answers to the questions international clients ask most.",
      profileFields: ["Specialisms", "Languages", "Areas covered", "Official website", "Practical FAQ", "Verified signals"],
      faq: [
        {
          question: "Why start with English-speaking lawyers?",
          answer:
            "Because it's a high-stakes search. Foreign buyers, expats and investors need to trust someone before handing over important decisions — and finding useful information online is harder than it should be."
        },
        {
          question: "Can firms pay to appear first?",
          answer:
            "No. A collaboration can add more detail to a profile — photos, services, FAQ — but it does not change editorial position."
        },
        {
          question: "Will you cover lawyers across the whole island?",
          answer:
            "Yes. We'll cover Palma, the southwest, the north and inland areas. What matters is that the firm works with international clients, not where their office is."
        }
      ],
      ctaTitle: "Do you run a law firm in Mallorca?",
      ctaText:
        "We can review how your firm appears online and what's missing for international clients to find and trust you more easily.",
      ctaButton: "Get in touch",
      backLabel: "Back to Experts"
    },
    "architects-renovation-mallorca": {
      metaTitle: "Architects and renovation experts in Mallorca | Mallorca Verified Experts",
      metaDescription:
        "A curated list of architects, renovation firms and interior designers in Mallorca for international homeowners and property buyers: villas, fincas, apartments and new builds.",
      eyebrow: "Verified Experts · Architecture",
      title: "Architects and renovation experts in Mallorca for better property projects",
      intro:
        "Renovating, legalising or improving a home in Mallorca involves permits, local contractors, planning rules and budget decisions that are hard to navigate without the right team. We're compiling verified profiles of architects, studios and renovation firms who work with international property owners.",
      summary:
        "The goal isn't a long list — it's a useful one. We focus on separating who handles full renovations from who does interior design, new builds or technical direction, so you can find the right fit for your project.",
      bestForTitle: "Who this is for",
      bestFor: [
        "Foreign buyers planning a renovation before or after purchase",
        "Homeowners wanting to expand, reform or update a villa or finca",
        "Investors needing legalisation or technical direction",
        "Anyone looking for interior design for a Mallorcan property"
      ],
      verifyTitle: "What to look for in a Mallorca architect or renovation firm",
      verifyIntro:
        "Before hiring anyone for a property project in Mallorca, it's worth checking these things.",
      verification: [
        "A public portfolio with real completed projects — not just renders.",
        "Service type: architecture, renovation, interior design, technical direction or construction.",
        "Experience with villas, fincas, apartments or the property type you have.",
        "Languages spoken, if you need to communicate in English or German.",
        "Areas of Mallorca where they actively work."
      ],
      profileTitle: "What each profile covers",
      profileIntro:
        "Each listing explains what kind of projects the firm handles, where they work and who they typically work with — so you can decide whether to get in touch.",
      profileFields: ["Project type", "Portfolio", "Languages", "Areas", "Services", "Process FAQ"],
      faq: [
        {
          question: "Will builders and interior designers be included, or only architects?",
          answer:
            "Builders and interior designers too, if they have a clear presence and work on residential projects. The criteria is usefulness for the homeowner, not professional title."
        },
        {
          question: "How do I know if a studio has experience with international clients?",
          answer:
            "Each profile will indicate the languages they work in and whether they have projects with international owners. If there's no clear evidence, we won't assume it."
        },
        {
          question: "Will a premium profile affect ranking?",
          answer:
            "No. A premium profile can add more detail — portfolio, services, FAQ — but it does not buy position."
        }
      ],
      ctaTitle: "Do you run a studio or renovation company in Mallorca?",
      ctaText:
        "We can review your online presence and build a profile that works for international homeowners and investors searching for professionals in Mallorca.",
      ctaButton: "Get in touch",
      backLabel: "Back to Experts"
    },
    "property-managers-mallorca": {
      metaTitle: "Property managers and relocation services in Mallorca | Mallorca Verified Experts",
      metaDescription:
        "A curated list of property managers, relocation services and home management companies in Mallorca for international owners, expats and second-home buyers.",
      eyebrow: "Verified Experts · Property",
      title: "Property managers and relocation services in Mallorca for smoother island life",
      intro:
        "If you own a property in Mallorca but don't live there full-time, you need someone you can rely on. We're building a curated list of property managers, relocation services and home management companies who work with international owners and expats.",
      summary:
        "Lots of companies in this space offer everything on paper. We focus on what they actually do: maintenance, key holding, rental coordination, cleaning or full relocation support — not just a list of services without evidence.",
      bestForTitle: "Who this is for",
      bestFor: [
        "Second-home owners who need someone to manage their property",
        "Expats relocating to Mallorca and needing help settling in",
        "Investors with rental properties who need day-to-day coordination",
        "Owners who spend part of the year abroad"
      ],
      verifyTitle: "What to look for in a property manager in Mallorca",
      verifyIntro:
        "Property management is a trust business. Here's what's worth checking before you hand over the keys.",
      verification: [
        "Concrete services listed — not just 'full property management'.",
        "Areas of Mallorca they actually cover.",
        "Languages spoken.",
        "A clear website and professional presence you can verify.",
        "References or reviews from existing clients."
      ],
      profileTitle: "What each profile covers",
      profileIntro:
        "Each listing explains what the company does, what kind of property it fits and what it can actually solve — without relying on promotional copy.",
      profileFields: ["Services", "Languages", "Areas", "Property type", "Emergency cover", "Practical FAQ"],
      faq: [
        {
          question: "What's the difference between relocation and property management?",
          answer:
            "Relocation helps you move and settle in: finding a home, paperwork, schools, suppliers. Property management handles the home once you're set up. Some companies do both."
        },
        {
          question: "Can property managers handle holiday rental properties?",
          answer:
            "Some specialise in holiday rentals, others in long-term or owner-occupied properties. We'll make it clear in each profile so you can find the right fit."
        },
        {
          question: "What if I need urgent help at the property?",
          answer:
            "We'll indicate whether a company offers emergency cover and during what hours. Not all of them do, and it's important to know before you sign anything."
        }
      ],
      ctaTitle: "Do you manage properties or help expats in Mallorca?",
      ctaText:
        "We can review your online presence and build a clear profile for international owners looking for a reliable manager in Mallorca.",
      ctaButton: "Get in touch",
      backLabel: "Back to Experts"
    }
  },
  de: {
    "english-speaking-lawyers-mallorca": {
      metaTitle: "Englischsprachige Anwälte auf Mallorca | Mallorca Verified Experts",
      metaDescription:
        "Kuratierte Auswahl englischsprachiger Anwälte auf Mallorca für Käufer, Expats und Investoren: Immobilienkauf, Steuern, Erbschaft und Rechtsberatung für Nicht-Residenten.",
      eyebrow: "Verified Experts · Legal",
      title: "Englischsprachige Anwälte auf Mallorca für Käufer, Expats und Investoren",
      intro:
        "Immobilienkauf, Erbschaft oder Unternehmensgründung auf Mallorca brauchen Rechtsberatung, der man wirklich vertrauen kann. Wir stellen eine kuratierte Auswahl von Anwaltskanzleien zusammen, die regelmäßig mit internationalen Mandanten arbeiten — mit klaren Angaben zu Sprachen, Spezialisierung und echter Erfahrung.",
      summary:
        "Die meisten Verzeichnisse listen jede Kanzlei in der Gegend. Wir konzentrieren uns auf das, was internationale Mandanten wirklich wissen müssen: echte Sprachkenntnisse, relevante Spezialisierung und klare Informationen — nicht nur ein Name und eine Telefonnummer.",
      bestForTitle: "Für wen ist das gedacht",
      bestFor: [
        "Ausländische Käufer, die eine Immobilie auf Mallorca erwerben",
        "Expats mit Steuer-, NIE- oder Aufenthaltsfragen",
        "Investoren, die ein Unternehmen oder eine Struktur in Spanien aufbauen",
        "Familien mit Erbschafts- oder Nachlassplanung"
      ],
      verifyTitle: "Worauf man bei einem Anwalt auf Mallorca achten sollte",
      verifyIntro:
        "Ob du unser Verzeichnis nutzt oder selbst suchst — das sind die Punkte, die sich lohnen zu prüfen.",
      verification: [
        "Tatsächlich gesprochene Sprachen — nicht nur auf der Website aufgelistet.",
        "Echte Spezialisierung: Immobilien, Steuern, Erbschaft, Gesellschaftsrecht oder Relocation.",
        "Erfahrung mit internationalen Mandanten, nicht nur lokalen.",
        "Eine klare Website mit Kontaktdaten und namentlich genannten Anwälten.",
        "Konsistente Reputation in öffentlichen Quellen."
      ],
      profileTitle: "Was jedes Profil enthält",
      profileIntro:
        "Jeder Eintrag geht über Name und Telefonnummer hinaus. Du findest die tatsächlichen Sprachen der Kanzlei, Hauptspezialisierungen, abgedeckte Gebiete und Antworten auf die häufigsten Fragen internationaler Mandanten.",
      profileFields: ["Spezialisierungen", "Sprachen", "Gebiete", "Offizielle Website", "Praktische FAQ", "Geprüfte Signale"],
      faq: [
        {
          question: "Warum mit englischsprachigen Anwälten beginnen?",
          answer:
            "Weil es eine Suche mit hohem Risiko ist. Ausländische Käufer, Expats und Investoren müssen jemandem vertrauen können — und nützliche Informationen online zu finden ist schwieriger als es sein sollte."
        },
        {
          question: "Können Kanzleien für bessere Positionen bezahlen?",
          answer:
            "Nein. Eine Zusammenarbeit kann ein Profil mit mehr Details ergänzen — Fotos, Services, FAQ — ändert aber die redaktionelle Position nicht."
        },
        {
          question: "Werden Kanzleien von der ganzen Insel abgedeckt?",
          answer:
            "Ja. Wir decken Palma, den Südwesten, den Norden und das Landesinnere ab. Entscheidend ist, dass die Kanzlei mit internationalen Mandanten arbeitet, nicht wo das Büro ist."
        }
      ],
      ctaTitle: "Führst du eine Kanzlei auf Mallorca?",
      ctaText:
        "Wir können prüfen, wie deine Kanzlei online erscheint und was fehlt, damit internationale Mandanten dich leichter finden und kontaktieren.",
      ctaButton: "Schreib uns",
      backLabel: "Zurück zu Experts"
    },
    "architects-renovation-mallorca": {
      metaTitle: "Architekten und Renovierung auf Mallorca | Mallorca Verified Experts",
      metaDescription:
        "Kuratierte Auswahl von Architekten, Renovierungsfirmen und Interior Designern auf Mallorca für internationale Eigentümer und Käufer: Villen, Fincas, Apartments und Neubauten.",
      eyebrow: "Verified Experts · Architektur",
      title: "Architekten und Renovierungsexperten auf Mallorca für bessere Immobilienprojekte",
      intro:
        "Eine Immobilie auf Mallorca zu renovieren, legalisieren oder verbessern bedeutet Genehmigungen, lokale Handwerker, Planungsregeln und Budgetentscheidungen — schwer zu navigieren ohne das richtige Team. Wir stellen verifizierte Profile von Architekten, Studios und Renovierungsfirmen zusammen, die mit internationalen Eigentümern arbeiten.",
      summary:
        "Das Ziel ist keine lange Liste, sondern eine nützliche. Wir unterscheiden, wer Komplettrenovierungen macht, wer Interior Design, Neubauten oder technische Leitung übernimmt — damit du den richtigen Ansprechpartner für dein Projekt findest.",
      bestForTitle: "Für wen ist das gedacht",
      bestFor: [
        "Ausländische Käufer, die vor oder nach dem Kauf renovieren wollen",
        "Eigentümer, die eine Villa oder Finca erweitern oder modernisieren möchten",
        "Investoren, die Legalisierung oder technische Leitung benötigen",
        "Eigentümer, die Interior Design für eine Immobilie auf Mallorca suchen"
      ],
      verifyTitle: "Worauf man bei einem Architekten oder Renovierungsunternehmen achten sollte",
      verifyIntro:
        "Bevor du jemanden für ein Immobilienprojekt auf Mallorca engagierst, lohnt es sich, diese Punkte zu prüfen.",
      verification: [
        "Ein öffentliches Portfolio mit echten abgeschlossenen Projekten — nicht nur Renderings.",
        "Art der Leistung: Architektur, Renovierung, Interior Design, technische Leitung oder Bau.",
        "Erfahrung mit Villen, Fincas, Apartments oder dem Immobilientyp, den du hast.",
        "Gesprochene Sprachen, wenn du auf Englisch oder Deutsch kommunizieren musst.",
        "Gebiete auf Mallorca, in denen das Team aktiv arbeitet."
      ],
      profileTitle: "Was jedes Profil enthält",
      profileIntro:
        "Jeder Eintrag erklärt, welche Art von Projekten das Büro übernimmt, wo es tätig ist und mit wem es typischerweise arbeitet — damit du entscheiden kannst, ob Kontakt sinnvoll ist.",
      profileFields: ["Projekttyp", "Portfolio", "Sprachen", "Gebiete", "Leistungen", "Prozess-FAQ"],
      faq: [
        {
          question: "Werden auch Bauunternehmen und Interior Designer aufgenommen?",
          answer:
            "Ja, wenn sie eine klare Präsenz haben und an Wohnprojekten arbeiten. Das Kriterium ist der Nutzen für den Eigentümer, nicht der Berufstitel."
        },
        {
          question: "Woran erkenne ich, ob ein Büro Erfahrung mit internationalen Kunden hat?",
          answer:
            "Jedes Profil gibt an, in welchen Sprachen gearbeitet wird und ob es Projekte mit internationalen Eigentümern gibt. Wenn keine klaren Belege vorhanden sind, nehmen wir es nicht an."
        },
        {
          question: "Beeinflusst ein Premium-Profil das Ranking?",
          answer:
            "Nein. Ein Premium-Profil kann mehr Details hinzufügen — Portfolio, Services, FAQ — kauft aber keine Position."
        }
      ],
      ctaTitle: "Führst du ein Studio oder Renovierungsunternehmen auf Mallorca?",
      ctaText:
        "Wir können deine Online-Präsenz prüfen und ein Profil erstellen, das für internationale Eigentümer und Investoren funktioniert, die Fachleute auf Mallorca suchen.",
      ctaButton: "Schreib uns",
      backLabel: "Zurück zu Experts"
    },
    "property-managers-mallorca": {
      metaTitle: "Property Manager und Relocation auf Mallorca | Mallorca Verified Experts",
      metaDescription:
        "Kuratierte Auswahl von Property Managern, Relocation-Services und Hausverwaltungen auf Mallorca für internationale Eigentümer, Expats und Zweitwohnungsbesitzer.",
      eyebrow: "Verified Experts · Property",
      title: "Property Manager und Relocation-Services auf Mallorca für entspanntes Inselleben",
      intro:
        "Wenn du eine Immobilie auf Mallorca besitzt, aber nicht das ganze Jahr dort lebst, brauchst du jemanden, dem du vertrauen kannst. Wir stellen eine kuratierte Auswahl von Property Managern, Relocation-Services und Hausverwaltungen zusammen, die mit internationalen Eigentümern und Expats arbeiten.",
      summary:
        "Viele Unternehmen in diesem Bereich bieten auf dem Papier alles an. Wir konzentrieren uns auf das, was sie wirklich tun: Wartung, Schlüsseldienst, Mietvermittlung, Reinigung oder Relocation-Unterstützung — nicht nur eine Liste ohne Belege.",
      bestForTitle: "Für wen ist das gedacht",
      bestFor: [
        "Zweitwohnungsbesitzer, die eine Fernverwaltung ihrer Immobilie brauchen",
        "Expats, die nach Mallorca ziehen und Hilfe beim Einleben brauchen",
        "Investoren mit Mietobjekten, die tägliche Koordination benötigen",
        "Eigentümer, die einen Teil des Jahres im Ausland verbringen"
      ],
      verifyTitle: "Worauf man bei einem Property Manager auf Mallorca achten sollte",
      verifyIntro:
        "Immobilienverwaltung ist Vertrauenssache. Das solltest du prüfen, bevor du die Schlüssel übergibst.",
      verification: [
        "Konkrete Leistungen — nicht nur 'komplette Immobilienverwaltung'.",
        "Gebiete auf Mallorca, die tatsächlich abgedeckt werden.",
        "Gesprochene Sprachen.",
        "Eine klare Website und professionelle Präsenz, die du überprüfen kannst.",
        "Referenzen oder Bewertungen von bestehenden Kunden."
      ],
      profileTitle: "Was jedes Profil enthält",
      profileIntro:
        "Jeder Eintrag erklärt, was das Unternehmen tut, für welche Immobilien es geeignet ist und was es konkret lösen kann — ohne Werbefloskeln.",
      profileFields: ["Leistungen", "Sprachen", "Gebiete", "Immobilientyp", "Notfallservice", "Praktische FAQ"],
      faq: [
        {
          question: "Was ist der Unterschied zwischen Relocation und Property Management?",
          answer:
            "Relocation hilft beim Umzug und Einleben: Wohnungssuche, Behördengänge, Schulen, Dienstleister. Property Management betreut die Immobilie danach. Manche Unternehmen machen beides."
        },
        {
          question: "Können Property Manager auch Ferienvermietungen betreuen?",
          answer:
            "Manche sind auf Ferienvermietung spezialisiert, andere auf Langzeitmiete oder selbst genutzte Immobilien. Wir machen es in jedem Profil deutlich, damit du den richtigen Partner findest."
        },
        {
          question: "Was, wenn ich dringend Hilfe bei der Immobilie brauche?",
          answer:
            "Wir geben an, ob ein Unternehmen Notfallservice anbietet und zu welchen Zeiten. Nicht alle tun das — und das solltest du wissen, bevor du einen Vertrag unterschreibst."
        }
      ],
      ctaTitle: "Verwaltest du Immobilien oder hilfst Expats auf Mallorca?",
      ctaText:
        "Wir können deine Online-Präsenz prüfen und ein klares Profil für internationale Eigentümer erstellen, die einen zuverlässigen Verwalter auf Mallorca suchen.",
      ctaButton: "Schreib uns",
      backLabel: "Zurück zu Experts"
    }
  }
};

function makeFocusedVerticalCopy(input: {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  summary: string;
  bestForTitle: string;
  bestFor: string[];
  verifyTitle: string;
  verifyIntro: string;
  verification: string[];
  profileTitle: string;
  profileIntro: string;
  profileFields: string[];
  faq: Array<{ question: string; answer: string }>;
  ctaTitle: string;
  ctaText: string;
  ctaButton: string;
  backLabel: string;
}): VerticalCopy {
  return input;
}

const focusedVerticalCopy: Record<Locale, Partial<Record<ExpertSlug, VerticalCopy>>> = {
  es: {
    "english-speaking-dentists-mallorca": makeFocusedVerticalCopy({
      metaTitle: "Dentistas que hablan inglés en Mallorca | Mallorca Verified Experts",
      metaDescription: "Selección de clínicas dentales y dentistas en Mallorca para expats, residentes internacionales y familias: ortodoncia, urgencias, odontología general y atención privada.",
      eyebrow: "Verified Experts · Salud dental",
      title: "Dentistas y clínicas dentales en Mallorca para pacientes internacionales",
      intro: "Encontrar un dentista fiable en otro idioma no debería depender de suerte. Esta selección reúne clínicas con datos públicos sólidos, webs oficiales y señales útiles para expats, familias y residentes internacionales en Mallorca.",
      summary: "Publicamos perfiles técnicos con datos verificables: ubicación, web, idiomas probables, especialidad y señales públicas. No sustituye una recomendación médica; ayuda a comparar opciones con más contexto.",
      bestForTitle: "Para quién es esto",
      bestFor: ["Expats que necesitan atención dental en inglés o alemán", "Familias que buscan ortodoncia o clínica dental estable", "Residentes internacionales que quieren una clínica privada", "Visitantes con una urgencia dental"],
      verifyTitle: "Qué mirar antes de elegir dentista en Mallorca",
      verifyIntro: "En salud conviene ser especialmente prudente. Estos son los puntos que vale la pena comprobar antes de pedir cita.",
      verification: ["Web oficial con servicios y datos de contacto claros.", "Especialidad real: ortodoncia, urgencias, estética, implantes u odontología general.", "Idiomas de atención confirmados cuando estén publicados.", "Volumen y consistencia de reseñas públicas.", "Ubicación práctica para visitas de seguimiento."],
      profileTitle: "Qué incluye cada ficha",
      profileIntro: "Cada perfil resume el encaje de la clínica, su zona, señales verificadas y datos públicos para ayudarte a decidir a quién contactar.",
      profileFields: ["Especialidad", "Idiomas", "Zona", "Web oficial", "Teléfono", "Señales verificadas"],
      faq: [
        { question: "¿Esto es una recomendación médica?", answer: "No. Es una selección editorial basada en datos públicos. La elección final debe hacerse revisando la clínica, el profesional y tus necesidades concretas." },
        { question: "¿Traducís los nombres de las clínicas?", answer: "No. Mantenemos el nombre real que aparece en Google o en la web oficial para no romper búsquedas ni confundir al usuario." },
        { question: "¿Una clínica puede pagar para aparecer primera?", answer: "No. Una colaboración puede ampliar una ficha con más información, pero no compra posición editorial." }
      ],
      ctaTitle: "¿Gestionas una clínica dental en Mallorca?",
      ctaText: "Podemos revisar cómo aparece tu clínica online y qué información falta para que pacientes internacionales te encuentren y confíen antes.",
      ctaButton: "Escríbenos",
      backLabel: "Volver a Experts"
    }),
    "english-speaking-doctors-mallorca": makeFocusedVerticalCopy({
      metaTitle: "Médicos y clínicas que hablan inglés en Mallorca | Mallorca Verified Experts",
      metaDescription: "Clínicas privadas, médicos GP y centros médicos en Mallorca para expats, visitantes y residentes internacionales que necesitan atención en inglés o alemán.",
      eyebrow: "Verified Experts · Salud",
      title: "Médicos y clínicas privadas en Mallorca para pacientes internacionales",
      intro: "Cuando necesitas un médico en Mallorca, el idioma, la ubicación y el tipo de atención importan mucho. Esta selección reúne clínicas privadas y centros médicos relevantes para expats, visitantes y residentes internacionales.",
      summary: "El objetivo es ofrecer contexto verificable, no consejo médico. Cada ficha se apoya en datos públicos de Google Places y revisión editorial inicial.",
      bestForTitle: "Para quién es esto",
      bestFor: ["Expats que buscan médico GP o clínica privada", "Visitantes que necesitan atención rápida", "Familias internacionales recién llegadas", "Residentes que prefieren atención en inglés o alemán"],
      verifyTitle: "Qué mirar antes de pedir cita",
      verifyIntro: "En una búsqueda médica, los datos básicos tienen que estar claros antes de contactar.",
      verification: ["Tipo de centro: GP, clínica privada, urgencias o consulta médica.", "Idiomas publicados o muy claros por marca/web.", "Dirección, teléfono y web oficial verificables.", "Horario o disponibilidad si el caso es urgente.", "Reputación pública consistente."],
      profileTitle: "Qué incluye cada ficha",
      profileIntro: "Cada ficha muestra zona, especialidad general, idiomas probables, contacto y señales públicas para comparar opciones con calma.",
      profileFields: ["Tipo de atención", "Idiomas", "Zona", "Web oficial", "Teléfono", "Señales verificadas"],
      faq: [
        { question: "¿Esto sustituye una recomendación médica?", answer: "No. Es una guía editorial basada en datos públicos. Para decisiones médicas debes confirmar siempre con el centro o profesional." },
        { question: "¿Incluís hospitales públicos?", answer: "Esta vertical se centra primero en clínicas privadas y médicos útiles para pacientes internacionales." },
        { question: "¿Los perfiles premium cambiarán la posición?", answer: "No. Pueden añadir información útil, pero no alterar la selección ni la posición editorial." }
      ],
      ctaTitle: "¿Gestionas una clínica o consulta en Mallorca?",
      ctaText: "Podemos ayudarte a presentar información clara para pacientes internacionales sin convertir la ficha en publicidad.",
      ctaButton: "Escríbenos",
      backLabel: "Volver a Experts"
    }),
    "estate-agents-mallorca": makeFocusedVerticalCopy({
      metaTitle: "Estate agents en Mallorca para compradores internacionales | Mallorca Verified Experts",
      metaDescription: "Selección de agencias inmobiliarias en Mallorca para compradores extranjeros, vendedores e inversores: Palma, norte, este e interior de la isla.",
      eyebrow: "Verified Experts · Real estate",
      title: "Estate agents en Mallorca para comprar o vender con más contexto",
      intro: "Mallorca tiene muchísimas inmobiliarias, pero no todas son igual de útiles para un comprador internacional. Esta selección parte de señales públicas, reputación y presencia real en zonas clave de la isla.",
      summary: "No buscamos listar todo el mercado. Publicamos perfiles técnicos de agencias con datos sólidos para que compradores y vendedores puedan comparar sin perderse entre directorios genéricos.",
      bestForTitle: "Para quién es esto",
      bestFor: ["Compradores internacionales que buscan vivienda en Mallorca", "Vendedores que quieren comparar agencias locales", "Inversores que necesitan contexto por zona", "Propietarios que buscan una agencia con presencia verificable"],
      verifyTitle: "Qué mirar antes de elegir agencia inmobiliaria",
      verifyIntro: "Una buena agencia no es solo una web bonita. Conviene comprobar señales prácticas antes de contactar.",
      verification: ["Zona real de trabajo y tipo de propiedad.", "Web oficial con propiedades y equipo identificable.", "Volumen de reseñas y consistencia de reputación.", "Idiomas y trato con compradores internacionales.", "Especialización en venta residencial, lujo o mercado local."],
      profileTitle: "Qué incluye cada ficha",
      profileIntro: "Cada ficha resume reputación pública, zona, datos de contacto y encaje editorial para compradores o vendedores internacionales.",
      profileFields: ["Zona", "Tipo de cliente", "Web oficial", "Teléfono", "Reseñas", "Señales verificadas"],
      faq: [
        { question: "¿Se puede pagar para salir más arriba?", answer: "No. Las posiciones editoriales no se compran. Una ficha ampliada solo añade información útil." },
        { question: "¿Son agencias recomendadas oficialmente?", answer: "Son perfiles seleccionados por señales públicas y revisión inicial. Antes de contratar, conviene comparar servicios y condiciones." },
        { question: "¿Cubriréis zonas fuera de Palma?", answer: "Sí. La selección incluye norte, este, interior y suroeste cuando haya datos sólidos." }
      ],
      ctaTitle: "¿Tienes una agencia inmobiliaria en Mallorca?",
      ctaText: "Podemos revisar cómo te encuentran compradores internacionales y qué información falta para generar confianza.",
      ctaButton: "Escríbenos",
      backLabel: "Volver a Experts"
    }),
    "mortgage-brokers-mallorca": makeFocusedVerticalCopy({
      metaTitle: "Mortgage brokers en Mallorca para compradores extranjeros | Mallorca Verified Experts",
      metaDescription: "Selección de brokers hipotecarios y asesores de financiación en Mallorca para compradores internacionales, no residentes y operaciones inmobiliarias.",
      eyebrow: "Verified Experts · Hipotecas",
      title: "Mortgage brokers en Mallorca para financiar una compra con más claridad",
      intro: "Para un comprador extranjero, conseguir hipoteca en Mallorca puede ser una de las partes más confusas de la operación. Esta selección reúne brokers y consultores con señales claras para compradores internacionales y no residentes.",
      summary: "Una ficha técnica ayuda a comparar quién trabaja con no residentes, qué presencia pública tiene y cómo contactarle antes de entrar en una operación importante.",
      bestForTitle: "Para quién es esto",
      bestFor: ["Compradores internacionales que necesitan hipoteca en Mallorca", "No residentes que comparan financiación en España", "Propietarios que estudian refinanciación", "Inversores que necesitan asesoramiento hipotecario"],
      verifyTitle: "Qué mirar antes de elegir broker hipotecario",
      verifyIntro: "La financiación implica costes y condiciones importantes. Estas señales ayudan a filtrar mejor.",
      verification: ["Experiencia con no residentes y compradores internacionales.", "Web oficial con servicios claros.", "Reputación pública y volumen de reseñas.", "Idiomas de atención.", "Transparencia sobre el proceso y entidades con las que trabaja."],
      profileTitle: "Qué incluye cada ficha",
      profileIntro: "Cada perfil resume zona, idiomas, especialidad, señales verificadas y datos de contacto para iniciar una comparación seria.",
      profileFields: ["Hipotecas", "No residentes", "Idiomas", "Web oficial", "Teléfono", "Señales verificadas"],
      faq: [
        { question: "¿Mallorca Verified da asesoramiento hipotecario?", answer: "No. Solo organizamos información pública y perfiles técnicos. La decisión financiera debe tomarse con un profesional autorizado." },
        { question: "¿Por qué esta vertical importa para GEO?", answer: "Porque responde a una necesidad muy concreta de compradores extranjeros: financiar vivienda en Mallorca con contexto local." },
        { question: "¿Una ficha premium cambia el ranking?", answer: "No. Puede añadir FAQ, proceso y servicios, pero no compra posición." }
      ],
      ctaTitle: "¿Eres broker hipotecario o asesor financiero en Mallorca?",
      ctaText: "Podemos preparar una ficha clara para compradores internacionales que buscan financiación con contexto local.",
      ctaButton: "Escríbenos",
      backLabel: "Volver a Experts"
    }),
    "aesthetic-medicine-mallorca": makeFocusedVerticalCopy({
      metaTitle: "Medicina estética en Mallorca para expats | Mallorca Verified Experts",
      metaDescription: "Clínicas de medicina estética, dermatología y cirugía cosmética en Mallorca con atención en inglés y/o alemán para expats y residentes internacionales.",
      eyebrow: "Verified Experts · Medicina Estética",
      title: "Clínicas de medicina estética en Mallorca con atención en inglés o alemán",
      intro: "Encontrar una clínica estética de confianza en otro idioma no debería depender del azar. Esta selección reúne clínicas con datos públicos sólidos, web oficial verificada y señales claras de atención para pacientes internacionales.",
      summary: "Una ficha técnica permite comparar tratamientos, idiomas, zona y reputación pública antes de tomar una decisión.",
      bestForTitle: "Para quién es esto",
      bestFor: ["Expats y residentes que buscan tratamientos estéticos en inglés o alemán", "Turistas de larga estancia que necesitan un profesional de confianza", "Propietarios de segunda residencia que vienen varias veces al año", "Pacientes que buscan clínica para botox, fillers o dermatología estética"],
      verifyTitle: "Qué mirar antes de elegir una clínica estética",
      verifyIntro: "Los tratamientos médico-estéticos son decisiones importantes. Estas señales ayudan a filtrar mejor.",
      verification: ["Web oficial con tratamientos y equipo médico publicados.", "Idiomas confirmados: inglés, alemán u otros.", "Volumen y consistencia de reseñas públicas.", "Titulación médica verificable del equipo.", "Facilidad para consulta previa y presupuesto."],
      profileTitle: "Qué incluye cada ficha",
      profileIntro: "Cada perfil resume tratamientos, idiomas, zona, señales verificadas y contacto para comparar opciones con criterio.",
      profileFields: ["Especialidad", "Idiomas", "Zona", "Web oficial", "Teléfono", "Señales verificadas"],
      faq: [
        { question: "¿Esto reemplaza la consulta médica?", answer: "No. Es una selección editorial basada en datos públicos. Siempre confirma con el profesional antes de cualquier tratamiento." },
        { question: "¿Una clínica puede pagar para aparecer primero?", answer: "No. Una colaboración puede añadir más información al perfil, pero no compra posición editorial." },
        { question: "¿Incluís cirugía estética o solo medicina no invasiva?", answer: "Esta vertical incluye desde medicina estética no invasiva (botox, fillers) hasta dermatología y cirugía cosmética, según lo que ofrezca la clínica." }
      ],
      ctaTitle: "¿Tienes una clínica de medicina estética en Mallorca?",
      ctaText: "Podemos revisar cómo te encuentran pacientes internacionales y qué información falta para generar confianza antes de la primera consulta.",
      ctaButton: "Escríbenos",
      backLabel: "Volver a Experts"
    })
  },
  en: {},
  de: {}
};

focusedVerticalCopy.en = {
  "english-speaking-dentists-mallorca": { ...focusedVerticalCopy.es["english-speaking-dentists-mallorca"]!, metaTitle: "English-speaking dentists in Mallorca | Mallorca Verified Experts", metaDescription: "Dental clinics and dentists in Mallorca for expats, international residents and families: orthodontics, emergencies, general dentistry and private care.", title: "Dentists and dental clinics in Mallorca for international patients", intro: "Finding a reliable dentist in another language should not depend on luck. This selection brings together clinics with strong public data, official websites and useful signals for expats, families and international residents in Mallorca.", ctaButton: "Get in touch", backLabel: "Back to Experts" },
  "english-speaking-doctors-mallorca": { ...focusedVerticalCopy.es["english-speaking-doctors-mallorca"]!, metaTitle: "English-speaking doctors and clinics in Mallorca | Mallorca Verified Experts", metaDescription: "Private clinics, GP practices and medical centres in Mallorca for expats, visitors and international residents who need care in English or German.", title: "Private doctors and clinics in Mallorca for international patients", intro: "When you need a doctor in Mallorca, language, location and type of care matter. This selection brings together private clinics and medical centres relevant to expats, visitors and international residents.", ctaButton: "Get in touch", backLabel: "Back to Experts" },
  "estate-agents-mallorca": { ...focusedVerticalCopy.es["estate-agents-mallorca"]!, metaTitle: "Estate agents in Mallorca for international buyers | Mallorca Verified Experts", metaDescription: "A curated selection of estate agents in Mallorca for foreign buyers, sellers and investors: Palma, north, east and inland areas.", title: "Estate agents in Mallorca for buying or selling with more context", intro: "Mallorca has countless estate agencies, but not all are equally useful for international buyers. This selection starts from public signals, reputation and real presence in key island areas.", ctaButton: "Get in touch", backLabel: "Back to Experts" },
  "mortgage-brokers-mallorca": { ...focusedVerticalCopy.es["mortgage-brokers-mallorca"]!, metaTitle: "Mortgage brokers in Mallorca for foreign buyers | Mallorca Verified Experts", metaDescription: "Mortgage brokers and finance advisors in Mallorca for international buyers, non-residents and property purchases.", title: "Mortgage brokers in Mallorca for financing a purchase with more clarity", intro: "For foreign buyers, getting a mortgage in Mallorca can be one of the most confusing parts of the purchase. This selection brings together brokers and consultants with clear signals for international and non-resident buyers.", ctaButton: "Get in touch", backLabel: "Back to Experts" },
  "aesthetic-medicine-mallorca": { ...focusedVerticalCopy.es["aesthetic-medicine-mallorca"]!, metaTitle: "Aesthetic medicine clinics in Mallorca for expats | Mallorca Verified Experts", metaDescription: "Aesthetic medicine, cosmetic dermatology and cosmetic surgery clinics in Mallorca with care in English and/or German for expats and international residents.", title: "Aesthetic medicine clinics in Mallorca with English or German care", intro: "Finding a trustworthy aesthetic clinic in another language should not be left to chance. This selection brings together clinics with solid public data, verified official websites and clear signals for international patients.", ctaButton: "Get in touch", backLabel: "Back to Experts" }
};

Object.assign(focusedVerticalCopy.en["english-speaking-dentists-mallorca"]!, {
  bestForTitle: "Who this is for",
  bestFor: ["Expats who need dental care in English or German", "Families looking for orthodontics or a stable dental clinic", "International residents who prefer private dental care", "Visitors with a dental emergency"],
  verifyTitle: "What to check before choosing a dentist in Mallorca",
  verifyIntro: "Healthcare searches need extra care. These are the points worth checking before booking.",
  verification: ["Official website with clear services and contact details.", "Real specialism: orthodontics, emergencies, cosmetic dentistry, implants or general dentistry.", "Care languages confirmed when published.", "Volume and consistency of public reviews.", "Practical location for follow-up visits."],
  profileTitle: "What each profile includes",
  profileIntro: "Each profile summarises the clinic fit, area, verified signals and public data to help you decide who to contact.",
  profileFields: ["Specialism", "Languages", "Area", "Official website", "Phone", "Verified signals"],
  faq: [
    { question: "Is this medical advice?", answer: "No. It is an editorial selection based on public data. You should always check the clinic, professional and your own needs before booking." },
    { question: "Do you translate clinic names?", answer: "No. We keep the real name used on Google or the official website so searches remain accurate." },
    { question: "Can a clinic pay to appear first?", answer: "No. A collaboration can add more information to a profile, but it cannot buy editorial position." }
  ],
  ctaTitle: "Do you run a dental clinic in Mallorca?",
  ctaText: "We can review how your clinic appears online and what international patients need to trust it sooner."
});

Object.assign(focusedVerticalCopy.en["english-speaking-doctors-mallorca"]!, {
  bestForTitle: "Who this is for",
  bestFor: ["Expats looking for a GP or private clinic", "Visitors who need fast medical attention", "International families newly arrived in Mallorca", "Residents who prefer care in English or German"],
  verifyTitle: "What to check before booking",
  verifyIntro: "In a medical search, the basic information should be clear before you contact anyone.",
  verification: ["Type of centre: GP, private clinic, emergency service or medical consultation.", "Languages published or clearly signalled by the brand or website.", "Verifiable address, phone and official website.", "Hours or availability if the case is urgent.", "Consistent public reputation."],
  profileTitle: "What each profile includes",
  profileIntro: "Each profile shows area, general specialism, likely languages, contact details and public signals to compare options calmly.",
  profileFields: ["Care type", "Languages", "Area", "Official website", "Phone", "Verified signals"],
  faq: [
    { question: "Does this replace medical advice?", answer: "No. It is an editorial guide based on public data. For medical decisions, always confirm with the centre or professional." },
    { question: "Do you include public hospitals?", answer: "This vertical starts with private clinics and doctors useful for international patients." },
    { question: "Will premium profiles change position?", answer: "No. They can add useful information, but they do not alter selection or editorial position." }
  ],
  ctaTitle: "Do you run a clinic or medical practice in Mallorca?",
  ctaText: "We can help you present clear information for international patients without turning the profile into advertising."
});

Object.assign(focusedVerticalCopy.en["estate-agents-mallorca"]!, {
  bestForTitle: "Who this is for",
  bestFor: ["International buyers searching for property in Mallorca", "Sellers comparing local agencies", "Investors who need area context", "Owners looking for an agency with verifiable presence"],
  verifyTitle: "What to check before choosing an estate agent",
  verifyIntro: "A good agency is not just a nice website. These practical signals are worth checking before contact.",
  verification: ["Real area of work and property type.", "Official website with properties and identifiable team.", "Review volume and reputation consistency.", "Languages and experience with international buyers.", "Specialism in residential sales, luxury or local market."],
  profileTitle: "What each profile includes",
  profileIntro: "Each profile summarises public reputation, area, contact details and editorial fit for international buyers or sellers.",
  profileFields: ["Area", "Client type", "Official website", "Phone", "Reviews", "Verified signals"],
  faq: [
    { question: "Can agencies pay to rank higher?", answer: "No. Editorial positions cannot be bought. An expanded profile only adds useful information." },
    { question: "Are these officially recommended agencies?", answer: "They are profiles selected from public signals and initial review. Before hiring, compare services and conditions." },
    { question: "Will you cover areas outside Palma?", answer: "Yes. The selection includes north, east, inland and southwest areas when the data is strong." }
  ],
  ctaTitle: "Do you run an estate agency in Mallorca?",
  ctaText: "We can review how international buyers find you and what information is missing to build trust."
});

Object.assign(focusedVerticalCopy.en["mortgage-brokers-mallorca"]!, {
  bestForTitle: "Who this is for",
  bestFor: ["International buyers who need a mortgage in Mallorca", "Non-residents comparing finance in Spain", "Owners considering refinancing", "Investors who need mortgage advice"],
  verifyTitle: "What to check before choosing a mortgage broker",
  verifyIntro: "Finance involves important costs and conditions. These signals help filter better.",
  verification: ["Experience with non-residents and international buyers.", "Official website with clear services.", "Public reputation and review volume.", "Service languages.", "Transparency around process and lenders."],
  profileTitle: "What each profile includes",
  profileIntro: "Each profile summarises area, languages, specialism, verified signals and contact details for serious comparison.",
  profileFields: ["Mortgages", "Non-residents", "Languages", "Official website", "Phone", "Verified signals"],
  faq: [
    { question: "Does Mallorca Verified give mortgage advice?", answer: "No. We organise public information and technical profiles. Financial decisions should be made with an authorised professional." },
    { question: "Why does this vertical matter for GEO?", answer: "Because it answers a very specific need from foreign buyers: financing property in Mallorca with local context." },
    { question: "Does a premium profile change ranking?", answer: "No. It can add FAQ, process and services, but it cannot buy position." }
  ],
  ctaTitle: "Are you a mortgage broker or finance advisor in Mallorca?",
  ctaText: "We can prepare a clear profile for international buyers looking for finance with local context."
});

Object.assign(focusedVerticalCopy.en["aesthetic-medicine-mallorca"]!, {
  bestForTitle: "Who this is for",
  bestFor: ["Expats and residents looking for aesthetic treatments in English or German", "Long-stay visitors who want a trusted professional", "Second-home owners who visit several times a year", "Patients seeking a clinic for botox, fillers or aesthetic dermatology"],
  verifyTitle: "What to check before choosing an aesthetic clinic",
  verifyIntro: "Aesthetic medical treatments are important decisions. These signals help you filter better.",
  verification: ["Official website with published treatments and medical team.", "Confirmed languages: English, German or others.", "Volume and consistency of public reviews.", "Verifiable medical qualifications of the team.", "Clear process for initial consultation and quote."],
  profileTitle: "What each profile includes",
  profileIntro: "Each profile summarises treatments, languages, area, verified signals and contact details to compare options with confidence.",
  profileFields: ["Specialism", "Languages", "Area", "Official website", "Phone", "Verified signals"],
  faq: [
    { question: "Does this replace medical advice?", answer: "No. It is an editorial selection based on public data. Always confirm with the professional before any treatment." },
    { question: "Can a clinic pay to appear first?", answer: "No. A collaboration can add more detail to a profile, but cannot buy editorial position." },
    { question: "Does this cover cosmetic surgery or only non-invasive treatments?", answer: "This vertical includes everything from non-invasive aesthetic medicine (botox, fillers) through to dermatology and cosmetic surgery, depending on what each clinic offers." }
  ],
  ctaTitle: "Do you run an aesthetic medicine clinic in Mallorca?",
  ctaText: "We can review how international patients find you and what information is missing to build trust before the first consultation."
});

focusedVerticalCopy.de = {
  "english-speaking-dentists-mallorca": { ...focusedVerticalCopy.es["english-speaking-dentists-mallorca"]!, metaTitle: "Englischsprachige Zahnärzte auf Mallorca | Mallorca Verified Experts", metaDescription: "Zahnkliniken und Zahnärzte auf Mallorca für Expats, internationale Residenten und Familien: Kieferorthopädie, Notfälle, allgemeine Zahnmedizin und private Behandlung.", title: "Zahnärzte und Zahnkliniken auf Mallorca für internationale Patienten", intro: "Einen verlässlichen Zahnarzt in einer anderen Sprache zu finden, sollte kein Zufall sein. Diese Auswahl bündelt Kliniken mit starken öffentlichen Daten, offiziellen Websites und nützlichen Signalen.", ctaButton: "Schreib uns", backLabel: "Zurück zu Experts" },
  "english-speaking-doctors-mallorca": { ...focusedVerticalCopy.es["english-speaking-doctors-mallorca"]!, metaTitle: "Englischsprachige Ärzte und Kliniken auf Mallorca | Mallorca Verified Experts", metaDescription: "Private Kliniken, GP-Praxen und medizinische Zentren auf Mallorca für Expats, Besucher und internationale Residenten.", title: "Private Ärzte und Kliniken auf Mallorca für internationale Patienten", intro: "Wenn du auf Mallorca einen Arzt brauchst, sind Sprache, Standort und Art der Behandlung entscheidend. Diese Auswahl sammelt relevante private Kliniken und medizinische Zentren.", ctaButton: "Schreib uns", backLabel: "Zurück zu Experts" },
  "estate-agents-mallorca": { ...focusedVerticalCopy.es["estate-agents-mallorca"]!, metaTitle: "Estate Agents auf Mallorca für internationale Käufer | Mallorca Verified Experts", metaDescription: "Kuratierte Auswahl von Immobilienagenturen auf Mallorca für ausländische Käufer, Verkäufer und Investoren: Palma, Norden, Osten und Inselinneres.", title: "Estate Agents auf Mallorca für Kauf oder Verkauf mit mehr Kontext", intro: "Mallorca hat sehr viele Immobilienagenturen, aber nicht jede ist für internationale Käufer gleich hilfreich. Diese Auswahl basiert auf öffentlichen Signalen, Reputation und echter lokaler Präsenz.", ctaButton: "Schreib uns", backLabel: "Zurück zu Experts" },
  "mortgage-brokers-mallorca": { ...focusedVerticalCopy.es["mortgage-brokers-mallorca"]!, metaTitle: "Mortgage Broker auf Mallorca für ausländische Käufer | Mallorca Verified Experts", metaDescription: "Hypothekenbroker und Finanzierungsberater auf Mallorca für internationale Käufer, Nicht-Residenten und Immobilienkäufe.", title: "Mortgage Broker auf Mallorca für eine klarere Immobilienfinanzierung", intro: "Für ausländische Käufer kann eine Hypothek auf Mallorca einer der unübersichtlichsten Teile des Kaufs sein. Diese Auswahl bündelt Broker und Berater mit klaren Signalen für internationale Käufer.", ctaButton: "Schreib uns", backLabel: "Zurück zu Experts" },
  "aesthetic-medicine-mallorca": { ...focusedVerticalCopy.es["aesthetic-medicine-mallorca"]!, metaTitle: "Ästhetische Medizin auf Mallorca für Expats | Mallorca Verified Experts", metaDescription: "Kliniken für ästhetische Medizin, kosmetische Dermatologie und Schönheitschirurgie auf Mallorca mit Betreuung auf Englisch und/oder Deutsch.", title: "Kliniken für ästhetische Medizin auf Mallorca mit Englisch oder Deutsch", intro: "Eine vertrauenswürdige Schönheitsklinik in einer anderen Sprache zu finden, sollte kein Zufall sein. Diese Auswahl bündelt Kliniken mit soliden öffentlichen Daten, geprüften Websites und klaren Signalen für internationale Patienten.", ctaButton: "Schreib uns", backLabel: "Zurück zu Experts" }
};

Object.assign(focusedVerticalCopy.de["english-speaking-dentists-mallorca"]!, {
  bestForTitle: "Für wen ist das gedacht",
  bestFor: ["Expats, die Zahnbehandlung auf Englisch oder Deutsch suchen", "Familien, die Kieferorthopädie oder eine feste Zahnklinik brauchen", "Internationale Residenten, die private Zahnmedizin bevorzugen", "Besucher mit zahnärztlichem Notfall"],
  verifyTitle: "Worauf man vor der Wahl eines Zahnarztes achten sollte",
  verifyIntro: "Bei Gesundheitsfragen lohnt sich besondere Sorgfalt. Diese Punkte solltest du vor der Terminbuchung prüfen.",
  verification: ["Offizielle Website mit klaren Leistungen und Kontaktdaten.", "Echte Spezialisierung: Kieferorthopädie, Notfälle, Ästhetik, Implantate oder allgemeine Zahnmedizin.", "Bestätigte Behandlungssprachen, wenn veröffentlicht.", "Volumen und Konsistenz öffentlicher Bewertungen.", "Praktischer Standort für Folgetermine."],
  profileTitle: "Was jedes Profil enthält",
  profileIntro: "Jedes Profil fasst Ausrichtung, Gebiet, geprüfte Signale und öffentliche Daten zusammen, damit du besser entscheiden kannst, wen du kontaktierst.",
  profileFields: ["Spezialisierung", "Sprachen", "Gebiet", "Offizielle Website", "Telefon", "Geprüfte Signale"],
  faq: [
    { question: "Ist das medizinische Beratung?", answer: "Nein. Es ist eine redaktionelle Auswahl auf Basis öffentlicher Daten. Klinik, Behandler und eigene Bedürfnisse sollten immer geprüft werden." },
    { question: "Übersetzt ihr Kliniknamen?", answer: "Nein. Wir behalten den echten Namen von Google oder der offiziellen Website bei, damit Suchanfragen korrekt bleiben." },
    { question: "Kann eine Klinik für Platz eins bezahlen?", answer: "Nein. Eine Zusammenarbeit kann mehr Informationen ergänzen, aber keine redaktionelle Position kaufen." }
  ],
  ctaTitle: "Führst du eine Zahnklinik auf Mallorca?",
  ctaText: "Wir können prüfen, wie deine Klinik online erscheint und welche Informationen internationale Patienten brauchen."
});

Object.assign(focusedVerticalCopy.de["english-speaking-doctors-mallorca"]!, {
  bestForTitle: "Für wen ist das gedacht",
  bestFor: ["Expats, die GP oder Privatklinik suchen", "Besucher, die schnelle medizinische Hilfe brauchen", "Internationale Familien, die neu auf Mallorca sind", "Residenten, die Betreuung auf Englisch oder Deutsch bevorzugen"],
  verifyTitle: "Worauf man vor der Terminbuchung achten sollte",
  verifyIntro: "Bei einer Arztsuche sollten die Basisdaten vor der Kontaktaufnahme klar sein.",
  verification: ["Art des Zentrums: GP, Privatklinik, Notdienst oder ärztliche Beratung.", "Sprachen, die auf Website oder Marke klar erkennbar sind.", "Prüfbare Adresse, Telefonnummer und offizielle Website.", "Öffnungszeiten oder Verfügbarkeit bei dringenden Fällen.", "Konsistente öffentliche Reputation."],
  profileTitle: "Was jedes Profil enthält",
  profileIntro: "Jedes Profil zeigt Gebiet, allgemeine Spezialisierung, wahrscheinliche Sprachen, Kontaktdaten und öffentliche Signale.",
  profileFields: ["Art der Betreuung", "Sprachen", "Gebiet", "Offizielle Website", "Telefon", "Geprüfte Signale"],
  faq: [
    { question: "Ersetzt das ärztliche Beratung?", answer: "Nein. Es ist ein redaktioneller Leitfaden auf Basis öffentlicher Daten. Medizinische Entscheidungen immer mit Zentrum oder Arzt klären." },
    { question: "Enthaltet ihr öffentliche Krankenhäuser?", answer: "Diese Vertikale startet mit privaten Kliniken und Ärzten, die für internationale Patienten nützlich sind." },
    { question: "Ändern Premium-Profile die Position?", answer: "Nein. Sie können nützliche Informationen ergänzen, verändern aber nicht Auswahl oder redaktionelle Position." }
  ],
  ctaTitle: "Führst du eine Klinik oder Praxis auf Mallorca?",
  ctaText: "Wir helfen dir, klare Informationen für internationale Patienten zu präsentieren, ohne das Profil in Werbung zu verwandeln."
});

Object.assign(focusedVerticalCopy.de["estate-agents-mallorca"]!, {
  bestForTitle: "Für wen ist das gedacht",
  bestFor: ["Internationale Käufer, die Immobilien auf Mallorca suchen", "Verkäufer, die lokale Agenturen vergleichen", "Investoren, die Kontext nach Gebiet brauchen", "Eigentümer, die eine Agentur mit prüfbarer Präsenz suchen"],
  verifyTitle: "Worauf man vor der Wahl einer Immobilienagentur achten sollte",
  verifyIntro: "Eine gute Agentur ist mehr als eine schöne Website. Diese praktischen Signale lohnen sich vor dem Kontakt.",
  verification: ["Tatsächliches Arbeitsgebiet und Immobilientyp.", "Offizielle Website mit Immobilien und erkennbarem Team.", "Bewertungsvolumen und konsistente Reputation.", "Sprachen und Erfahrung mit internationalen Käufern.", "Spezialisierung auf Wohnimmobilien, Luxus oder lokalen Markt."],
  profileTitle: "Was jedes Profil enthält",
  profileIntro: "Jedes Profil fasst öffentliche Reputation, Gebiet, Kontaktdaten und redaktionelle Einordnung für internationale Käufer oder Verkäufer zusammen.",
  profileFields: ["Gebiet", "Kundentyp", "Offizielle Website", "Telefon", "Bewertungen", "Geprüfte Signale"],
  faq: [
    { question: "Können Agenturen für bessere Positionen zahlen?", answer: "Nein. Redaktionelle Positionen können nicht gekauft werden. Ein erweitertes Profil ergänzt nur nützliche Informationen." },
    { question: "Sind das offiziell empfohlene Agenturen?", answer: "Es sind Profile, die anhand öffentlicher Signale und erster Prüfung ausgewählt wurden. Vor Beauftragung sollten Leistungen und Bedingungen verglichen werden." },
    { question: "Deckt ihr auch Gebiete außerhalb Palmas ab?", answer: "Ja. Die Auswahl umfasst Norden, Osten, Inselinneres und Südwesten, wenn die Daten stark genug sind." }
  ],
  ctaTitle: "Führst du eine Immobilienagentur auf Mallorca?",
  ctaText: "Wir können prüfen, wie internationale Käufer dich finden und welche Informationen für Vertrauen fehlen."
});

Object.assign(focusedVerticalCopy.de["mortgage-brokers-mallorca"]!, {
  bestForTitle: "Für wen ist das gedacht",
  bestFor: ["Internationale Käufer, die eine Hypothek auf Mallorca brauchen", "Nicht-Residenten, die Finanzierung in Spanien vergleichen", "Eigentümer, die Refinanzierung prüfen", "Investoren, die Hypothekenberatung benötigen"],
  verifyTitle: "Worauf man vor der Wahl eines Mortgage Brokers achten sollte",
  verifyIntro: "Finanzierung bedeutet wichtige Kosten und Bedingungen. Diese Signale helfen beim besseren Filtern.",
  verification: ["Erfahrung mit Nicht-Residenten und internationalen Käufern.", "Offizielle Website mit klaren Leistungen.", "Öffentliche Reputation und Bewertungsvolumen.", "Servicesprachen.", "Transparenz zu Prozess und Banken."],
  profileTitle: "Was jedes Profil enthält",
  profileIntro: "Jedes Profil fasst Gebiet, Sprachen, Spezialisierung, geprüfte Signale und Kontaktdaten für einen seriösen Vergleich zusammen.",
  profileFields: ["Hypotheken", "Nicht-Residenten", "Sprachen", "Offizielle Website", "Telefon", "Geprüfte Signale"],
  faq: [
    { question: "Gibt Mallorca Verified Hypothekenberatung?", answer: "Nein. Wir strukturieren öffentliche Informationen und technische Profile. Finanzielle Entscheidungen sollten mit autorisierten Fachleuten getroffen werden." },
    { question: "Warum ist diese Vertikale wichtig für GEO?", answer: "Sie beantwortet ein sehr konkretes Bedürfnis ausländischer Käufer: Immobilienfinanzierung auf Mallorca mit lokalem Kontext." },
    { question: "Ändert ein Premium-Profil das Ranking?", answer: "Nein. Es kann FAQ, Prozess und Services ergänzen, aber keine Position kaufen." }
  ],
  ctaTitle: "Bist du Mortgage Broker oder Finanzberater auf Mallorca?",
  ctaText: "Wir können ein klares Profil für internationale Käufer erstellen, die Finanzierung mit lokalem Kontext suchen."
});

Object.assign(focusedVerticalCopy.de["aesthetic-medicine-mallorca"]!, {
  bestForTitle: "Für wen ist das gedacht",
  bestFor: ["Expats und Residenten, die ästhetische Behandlungen auf Englisch oder Deutsch suchen", "Langzeittouristen, die einen vertrauenswürdigen Experten wollen", "Zweitwohnsitzinhaber, die mehrmals im Jahr kommen", "Patienten, die eine Klinik für Botox, Filler oder ästhetische Dermatologie suchen"],
  verifyTitle: "Worauf man vor der Wahl einer Schönheitsklinik achten sollte",
  verifyIntro: "Ästhetisch-medizinische Behandlungen sind wichtige Entscheidungen. Diese Signale helfen beim besseren Filtern.",
  verification: ["Offizielle Website mit veröffentlichten Behandlungen und Ärzteteam.", "Bestätigte Sprachen: Englisch, Deutsch oder weitere.", "Volumen und Konsistenz öffentlicher Bewertungen.", "Prüfbare medizinische Qualifikationen des Teams.", "Klarer Prozess für Erstberatung und Kostenvoranschlag."],
  profileTitle: "Was jedes Profil enthält",
  profileIntro: "Jedes Profil fasst Behandlungen, Sprachen, Gebiet, geprüfte Signale und Kontaktdaten zusammen, damit du Optionen fundiert vergleichen kannst.",
  profileFields: ["Spezialisierung", "Sprachen", "Gebiet", "Offizielle Website", "Telefon", "Geprüfte Signale"],
  faq: [
    { question: "Ersetzt das ärztliche Beratung?", answer: "Nein. Es ist eine redaktionelle Auswahl auf Basis öffentlicher Daten. Vor jeder Behandlung immer mit dem Fachmann bestätigen." },
    { question: "Kann eine Klinik für bessere Positionen bezahlen?", answer: "Nein. Eine Zusammenarbeit kann mehr Details ergänzen, aber keine redaktionelle Position kaufen." },
    { question: "Deckt das auch Schönheitschirurgie ab oder nur nicht-invasive Behandlungen?", answer: "Diese Vertikale umfasst alles von nicht-invasiver ästhetischer Medizin (Botox, Filler) über Dermatologie bis hin zur Schönheitschirurgie, je nach Angebot der jeweiligen Klinik." }
  ],
  ctaTitle: "Führst du eine Schönheitsklinik auf Mallorca?",
  ctaText: "Wir können prüfen, wie internationale Patienten dich finden und welche Informationen fehlen, um Vertrauen vor der ersten Beratung aufzubauen."
});

function getVertical(locale: Locale, slug: string) {
  if (!isExpertVerticalSlug(slug)) return null;
  return verticalCopy[locale][slug as ExpertSlug] ?? focusedVerticalCopy[locale][slug as ExpertSlug] ?? null;
}

export function generateStaticParams() {
  return locales.flatMap((locale) => expertVerticalSlugs.map((slug) => ({ locale, slug })));
}

const profileDirectoryCopy = {
  es: {
    title: "Fichas técnicas en revisión",
    intro:
      "Aquí aparecerán los perfiles validados de esta vertical. Antes de publicarlos revisamos web oficial, datos de contacto, especialidad, idiomas y señales públicas.",
    emptyTitle: "Todavía no hemos publicado perfiles en esta vertical",
    emptyText:
      "Estamos preparando una primera selección. Preferimos publicar menos perfiles, pero con datos útiles y verificables, antes que llenar la página con un listado genérico.",
    labels: {
      languages: "Idiomas",
      specialties: "Especialidades",
      website: "Web oficial",
      phone: "Teléfono",
      details: "Ver ficha técnica",
      candidate: "En revisión",
      verified: "Verificado",
      premium: "Destacado"
    }
  },
  en: {
    title: "Technical profiles under review",
    intro:
      "Validated profiles will appear here after we check official website, contact details, specialisms, languages and public signals.",
    emptyTitle: "No profiles published in this vertical yet",
    emptyText:
      "We are preparing the first selection. Fewer useful, verifiable profiles are better than a generic directory that looks full but says little.",
    labels: {
      languages: "Languages",
      specialties: "Specialisms",
      website: "Official website",
      phone: "Phone",
      details: "View technical profile",
      candidate: "Under review",
      verified: "Verified",
      premium: "Featured"
    }
  },
  de: {
    title: "Technische Profile in Prüfung",
    intro:
      "Validierte Profile erscheinen hier, nachdem wir offizielle Website, Kontaktdaten, Spezialisierung, Sprachen und öffentliche Signale geprüft haben.",
    emptyTitle: "In diesem Bereich sind noch keine Profile veröffentlicht",
    emptyText:
      "Wir bereiten die erste Auswahl vor. Weniger nützliche und überprüfbare Profile sind besser als ein großes allgemeines Verzeichnis ohne klare Substanz.",
    labels: {
      languages: "Sprachen",
      specialties: "Spezialisierungen",
      website: "Offizielle Website",
      phone: "Telefon",
      details: "Technisches Profil ansehen",
      candidate: "In Prüfung",
      verified: "Verifiziert",
      premium: "Hervorgehoben"
    }
  }
} as const;

function getStatusLabel(profile: ExpertProfile, labels: (typeof profileDirectoryCopy)[Locale]["labels"]) {
  if (profile.status === "premium") return labels.premium;
  if (profile.status === "verified") return labels.verified;
  return labels.candidate;
}

function localizedList(list: Partial<Record<Locale, string[]>>, locale: Locale) {
  return list[locale] ?? list.es ?? list.en ?? list.de ?? [];
}

function ProfileCard({
  profile,
  locale,
  verticalSlug,
  labels
}: {
  profile: ExpertProfile;
  locale: Locale;
  verticalSlug: ExpertVerticalSlug;
  labels: (typeof profileDirectoryCopy)[Locale]["labels"];
}) {
  const description = profile.shortDescription[locale] ?? profile.shortDescription.es ?? "";
  const specialties = localizedList(profile.specialties, locale);
  return (
    <article className="rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-[0_16px_40px_rgba(10,10,10,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0A0A0A]">{getStatusLabel(profile, labels)}</p>
          <h3 className="mt-2 text-2xl font-black leading-tight text-[#0A0A0A]">{profile.name}</h3>
          <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#6B7280]">
            <IconMapPin size={15} stroke={1.8} />
            {profile.location}
          </p>
        </div>
        {typeof profile.rating === "number" ? (
          <span className="rounded-full border border-[#E5E7EB] bg-[#FFFFFF] px-3 py-1 text-sm font-black text-[#0A0A0A]">
            ★ {profile.rating.toFixed(1)}
          </span>
        ) : null}
      </div>
      {description ? <p className="mt-4 text-sm leading-7 text-[#6B7280]">{description}</p> : null}
      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#6B7280]">{labels.languages}</dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {profile.languages.map((item) => (
              <span key={item} className="rounded-full border border-[#E5E7EB] px-3 py-1 text-xs font-bold text-[#0A0A0A]">
                {item}
              </span>
            ))}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-black uppercase tracking-[0.12em] text-[#6B7280]">{labels.specialties}</dt>
          <dd className="mt-2 text-sm font-semibold leading-6 text-[#0A0A0A]">{specialties.slice(0, 3).join(", ")}</dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        {profile.website ? (
          <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] hover:border-[#0A0A0A] hover:text-[#0A0A0A]">
            <IconWorld size={15} stroke={1.8} />
            {labels.website}
          </a>
        ) : null}
        {profile.phone ? (
          <a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className="inline-flex items-center gap-2 rounded-md border border-[#E5E7EB] px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] hover:border-[#0A0A0A] hover:text-[#0A0A0A]">
            <IconPhone size={15} stroke={1.8} />
            {labels.phone}
          </a>
        ) : null}
        <Link href={`/${locale}/experts/${verticalSlug}/${profile.slug}`} className="inline-flex items-center gap-2 rounded-md bg-[#0A0A0A] px-4 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white hover:bg-[#262626]">
          {labels.details}
          <IconExternalLink size={14} stroke={1.8} />
        </Link>
      </div>
    </article>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const copy = getVertical(safeLocale, slug);
  if (!copy) {
    return generateSeoMetadata({
      title: "Mallorca Verified Experts",
      description: "Verified experts and professional services in Mallorca.",
      path: `/${safeLocale}/experts`,
      locale: safeLocale
    });
  }
  return generateSeoMetadata({
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: `/${safeLocale}/experts/${slug}`,
    locale: safeLocale
  });
}

export default async function ExpertVerticalPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const copy = getVertical(safeLocale, slug);
  if (!copy) notFound();
  const verticalSlug = slug as ExpertVerticalSlug;
  const expertProfiles = getExpertProfilesByVertical(verticalSlug);
  const profileCopy = profileDirectoryCopy[safeLocale];

  const pageUrl = `${siteUrl}/${safeLocale}/experts/${slug}`;
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Mallorca Verified", url: `${siteUrl}/${safeLocale}` },
    { name: "Experts", url: `${siteUrl}/${safeLocale}/experts` },
    { name: copy.title, url: pageUrl }
  ]);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${pageUrl}#vertical`,
    name: copy.metaTitle,
    description: copy.metaDescription,
    url: pageUrl,
    inLanguage: safeLocale,
    about: copy.bestFor,
    mainEntity: {
      "@type": "ItemList",
      name: copy.verifyTitle,
      itemListElement: copy.verification.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item
      }))
    }
  };

  return (
    <main className="bg-[linear-gradient(180deg,#FFFFFF_0%,#FFFFFF_48%,#FFFFFF_100%)]">
      <section className="border-b border-[#E5E7EB] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href={`/${safeLocale}/experts`} className="text-[11px] font-black uppercase tracking-[0.12em] text-[#0A0A0A] hover:text-[#0A0A0A]">
            {copy.backLabel}
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0A0A0A]">
                <IconShieldCheck size={15} stroke={2} />
                {copy.eyebrow}
              </p>
              <h1 className="mt-4 max-w-5xl text-balance font-display text-4xl font-black leading-[0.98] text-[#0A0A0A] sm:text-5xl lg:text-7xl">
                {copy.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-[#6B7280]">{copy.intro}</p>
            </div>
            <aside className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_45px_rgba(10,10,10,0.08)]">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0A0A0A]">{safeLocale === "de" ? "Unser Ansatz" : safeLocale === "en" ? "Our approach" : "Nuestro criterio"}</p>
              <p className="mt-4 text-sm font-semibold leading-7 text-[#0A0A0A]">{copy.summary}</p>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.bestForTitle}</p>
          <div className="mt-5 grid gap-3">
            {copy.bestFor.map((item) => (
              <div key={item} className="rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-bold text-[#0A0A0A] shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-[0_16px_40px_rgba(10,10,10,0.06)]">
          <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-[#0A0A0A]">
            <IconChecklist size={16} stroke={2} />
            {copy.verifyTitle}
          </p>
          <p className="mt-4 text-sm leading-7 text-[#6B7280]">{copy.verifyIntro}</p>
          <div className="mt-6 grid gap-3">
            {copy.verification.map((item) => (
              <div key={item} className="flex gap-3 text-sm font-semibold leading-6 text-[#0A0A0A]">
                <IconCircleCheck size={18} stroke={2} className="mt-0.5 shrink-0 text-[#0A0A0A]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[#E5E7EB] bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0A0A0A]">{copy.profileTitle}</p>
            <p className="mt-4 text-sm leading-7 text-[#6B7280]">{copy.profileIntro}</p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            {copy.profileFields.map((field, index) => (
              <span key={field} className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2 text-sm font-bold text-[#0A0A0A]">
                {index === 1 ? <IconLanguage size={16} stroke={1.8} /> : index === 2 ? <IconMapPin size={16} stroke={1.8} /> : <IconCircleCheck size={16} stroke={1.8} />}
                {field}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0A0A0A]">{profileCopy.title}</p>
          <p className="mt-4 text-sm leading-7 text-[#6B7280]">{profileCopy.intro}</p>
        </div>
        {expertProfiles.length ? (
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            {expertProfiles.map((profile) => (
              <ProfileCard
                key={profile.slug}
                profile={profile}
                locale={safeLocale}
                verticalSlug={verticalSlug}
                labels={profileCopy.labels}
              />
            ))}
          </div>
        ) : (
          <div className="mt-7 rounded-lg border border-[#E5E7EB] bg-white p-6 shadow-[0_16px_40px_rgba(10,10,10,0.05)]">
            <h3 className="text-xl font-black text-[#0A0A0A]">{profileCopy.emptyTitle}</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6B7280]">{profileCopy.emptyText}</p>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0A0A0A]">FAQ</p>
          <div className="mt-6 grid gap-4">
            {copy.faq.map((item) => (
              <details key={item.question} className="group rounded-lg border border-[#E5E7EB] bg-white">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-[#0A0A0A] marker:hidden [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span className="shrink-0 text-[#0A0A0A] transition-transform duration-200 group-open:rotate-45">＋</span>
                </summary>
                <p className="border-t border-[#E5E7EB] px-5 py-4 text-sm leading-7 text-[#6B7280]">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#E5E7EB] bg-[#0A0A0A] p-6 text-white shadow-[0_24px_60px_rgba(10,10,10,0.16)] sm:p-8 lg:p-10">
          <h2 className="max-w-3xl font-display text-3xl font-black leading-tight text-white sm:text-5xl">{copy.ctaTitle}</h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/75">{copy.ctaText}</p>
          <Link href={`/${safeLocale}/contact`} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-md bg-white px-6 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-all duration-150 hover:bg-[#FFFFFF]">
            {copy.ctaButton}
          </Link>
        </div>
      </section>

      <JsonLd data={[breadcrumbSchema, collectionSchema, createFAQSchema(copy.faq)]} />
    </main>
  );
}
