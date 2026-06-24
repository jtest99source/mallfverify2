import type { Locale } from "@/lib/i18n";
import aestheticMedicinePreview from "../../data/expert-previews/aesthetic-medicine-mallorca.json";
import architectsPreview from "../../data/expert-previews/architects-renovation-mallorca.json";
import dentistsPreview from "../../data/expert-previews/english-speaking-dentists-mallorca.json";
import doctorsPreview from "../../data/expert-previews/english-speaking-doctors-mallorca.json";
import estateAgentsPreview from "../../data/expert-previews/estate-agents-mallorca.json";
import mortgageBrokersPreview from "../../data/expert-previews/mortgage-brokers-mallorca.json";
import propertyManagersPreview from "../../data/expert-previews/property-managers-mallorca.json";

export const expertVerticalSlugs = [
  "english-speaking-lawyers-mallorca",
  "architects-renovation-mallorca",
  "property-managers-mallorca",
  "english-speaking-dentists-mallorca",
  "english-speaking-doctors-mallorca",
  "estate-agents-mallorca",
  "mortgage-brokers-mallorca",
  "aesthetic-medicine-mallorca"
] as const;

export type ExpertVerticalSlug = (typeof expertVerticalSlugs)[number];

export type ExpertProfileStatus = "candidate" | "verified" | "premium" | "hidden";
export type LocalizedList = Partial<Record<Locale, string[]>>;

export type ExpertProfile = {
  googlePlaceId: string;
  slug: string;
  verticalSlug: ExpertVerticalSlug;
  status: ExpertProfileStatus;
  name: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  googleMapsUrl?: string;
  rating?: number;
  reviewsCount?: number;
  languages: string[];
  specialties: LocalizedList;
  clientTypes: LocalizedList;
  areasServed: string[];
  verificationSignals: LocalizedList;
  shortDescription: Partial<Record<Locale, string>>;
  editorialNote?: Partial<Record<Locale, string>>;
  faqs?: Partial<Record<Locale, Array<{ question: string; answer: string }>>>;
  lastVerifiedAt?: string;
};

type ApprovedLegalProfileInput = {
  googlePlaceId: string;
  slug: string;
  name: string;
  location: string;
  address: string;
  phone: string;
  website: string;
  googleMapsUrl: string;
  rating: number;
  reviewsCount: number;
  status?: ExpertProfileStatus;
  languages?: string[];
  focus: {
    es: string;
    en: string;
    de: string;
  };
  specialties: LocalizedList;
  clientTypes?: LocalizedList;
  areasServed?: string[];
  note?: {
    es: string;
    en: string;
    de: string;
  };
  editorialNote?: {
    es: string;
    en: string;
    de: string;
  };
};

type ExpertPreviewCandidate = {
  google_place_id: string;
  name: string;
  rating: number;
  reviews_count: number;
  address: string;
  website?: string | null;
  phone?: string | null;
  google_maps_url?: string | null;
};

function makeApprovedLegalProfile(input: ApprovedLegalProfileInput): ExpertProfile {
  const languages = input.languages ?? ["Español", "English"];
  const areasServed = input.areasServed ?? [input.location, "Mallorca"];
  const clientTypes = input.clientTypes ?? {
    es: ["Compradores internacionales", "Expats y residentes extranjeros", "Propietarios en Mallorca"],
    en: ["International buyers", "Expats and foreign residents", "Mallorca property owners"],
    de: ["Internationale Käufer", "Expats und ausländische Residenten", "Immobilieneigentümer auf Mallorca"]
  };
  const note = input.note ?? {
    es: input.focus.es,
    en: input.focus.en,
    de: input.focus.de
  };

  return {
    googlePlaceId: input.googlePlaceId,
    slug: input.slug,
    verticalSlug: "english-speaking-lawyers-mallorca",
    status: input.status ?? "verified",
    name: input.name,
    location: input.location,
    address: input.address,
    phone: input.phone,
    website: input.website,
    googleMapsUrl: input.googleMapsUrl,
    rating: input.rating,
    reviewsCount: input.reviewsCount,
    languages,
    specialties: input.specialties,
    clientTypes,
    areasServed,
    verificationSignals: {
      es: [
        `Valoración pública de ${input.rating.toFixed(1)} sobre 5 con ${input.reviewsCount.toLocaleString("es-ES")} reseñas en Google.`,
        "Web oficial y teléfono publicados en Google Places.",
        "Negocio marcado como operativo en Google Places.",
        `Encaje editorial inicial: ${note.es}.`
      ],
      en: [
        `Public rating of ${input.rating.toFixed(1)} out of 5 with ${input.reviewsCount.toLocaleString("en-US")} Google reviews.`,
        "Official website and phone number listed in Google Places.",
        "Business marked as operational in Google Places.",
        `Initial editorial fit: ${note.en}.`
      ],
      de: [
        `Öffentliche Bewertung von ${input.rating.toFixed(1)} von 5 mit ${input.reviewsCount.toLocaleString("de-DE")} Google-Bewertungen.`,
        "Offizielle Website und Telefonnummer in Google Places gelistet.",
        "Unternehmen in Google Places als aktiv markiert.",
        `Erste redaktionelle Einordnung: ${note.de}.`
      ]
    },
    shortDescription: {
      es: `${input.name} figura en la selección legal y fiscal de Mallorca Verified para ${input.focus.es}. Perfil basado en datos públicos de Google Places y revisión editorial inicial.`,
      en: `${input.name} is included in Mallorca Verified's legal and tax expert selection for ${input.focus.en}. Profile based on public Google Places data and initial editorial review.`,
      de: `${input.name} ist Teil der Rechts- und Steuerexperten-Auswahl von Mallorca Verified für ${input.focus.de}. Profil auf Basis öffentlicher Google-Places-Daten und erster redaktioneller Prüfung.`
    },
    editorialNote: input.editorialNote,
    lastVerifiedAt: "2026-06-21"
  };
}

function findPreviewCandidate(candidates: ExpertPreviewCandidate[], googlePlaceId: string) {
  const candidate = candidates.find((item) => item.google_place_id === googlePlaceId);
  if (!candidate) throw new Error(`Missing approved expert preview candidate: ${googlePlaceId}`);
  return candidate;
}

function makeApprovedPreviewProfile({
  candidates,
  googlePlaceId,
  slug,
  verticalSlug,
  location,
  languages,
  focus,
  specialties,
  clientTypes,
  areasServed,
  note,
  editorialNote,
  status
}: {
  candidates: ExpertPreviewCandidate[];
  googlePlaceId: string;
  slug: string;
  verticalSlug: ExpertVerticalSlug;
  location: string;
  languages?: string[];
  focus: ApprovedLegalProfileInput["focus"];
  specialties: LocalizedList;
  clientTypes: LocalizedList;
  areasServed?: string[];
  note?: ApprovedLegalProfileInput["note"];
  editorialNote?: ApprovedLegalProfileInput["editorialNote"];
  status?: ExpertProfileStatus;
}): ExpertProfile {
  const candidate = findPreviewCandidate(candidates, googlePlaceId);
  const profileNote = note ?? focus;
  return {
    googlePlaceId,
    slug,
    verticalSlug,
    status: status ?? "verified",
    name: candidate.name,
    location,
    address: candidate.address,
    phone: candidate.phone || undefined,
    website: candidate.website || undefined,
    googleMapsUrl: candidate.google_maps_url || undefined,
    rating: candidate.rating,
    reviewsCount: candidate.reviews_count,
    languages: languages ?? ["Español", "English"],
    specialties,
    clientTypes,
    areasServed: areasServed ?? [location, "Mallorca"],
    verificationSignals: {
      es: [
        `Valoración pública de ${candidate.rating.toFixed(1)} sobre 5 con ${candidate.reviews_count.toLocaleString("es-ES")} reseñas en Google.`,
        "Web oficial publicada en Google Places.",
        "Negocio marcado como operativo en Google Places.",
        `Encaje editorial inicial: ${profileNote.es}.`
      ],
      en: [
        `Public rating of ${candidate.rating.toFixed(1)} out of 5 with ${candidate.reviews_count.toLocaleString("en-US")} Google reviews.`,
        "Official website listed in Google Places.",
        "Business marked as operational in Google Places.",
        `Initial editorial fit: ${profileNote.en}.`
      ],
      de: [
        `Öffentliche Bewertung von ${candidate.rating.toFixed(1)} von 5 mit ${candidate.reviews_count.toLocaleString("de-DE")} Google-Bewertungen.`,
        "Offizielle Website in Google Places gelistet.",
        "Unternehmen in Google Places als aktiv markiert.",
        `Erste redaktionelle Einordnung: ${profileNote.de}.`
      ]
    },
    shortDescription: {
      es: `${candidate.name} figura en la selección de Mallorca Verified para ${focus.es}. Perfil basado en datos públicos de Google Places y revisión editorial inicial.`,
      en: `${candidate.name} is included in Mallorca Verified's expert selection for ${focus.en}. Profile based on public Google Places data and initial editorial review.`,
      de: `${candidate.name} ist Teil der Experten-Auswahl von Mallorca Verified für ${focus.de}. Profil auf Basis öffentlicher Google-Places-Daten und erster redaktioneller Prüfung.`
    },
    editorialNote,
    lastVerifiedAt: "2026-06-21"
  };
}

const architectClientTypes = {
  es: ["Propietarios internacionales", "Compradores de vivienda", "Inversores y promotores"],
  en: ["International homeowners", "Property buyers", "Investors and developers"],
  de: ["Internationale Eigentümer", "Immobilienkäufer", "Investoren und Projektentwickler"]
};

const constructionClientTypes = {
  es: ["Propietarios internacionales", "Compradores que reforman", "Propiedades residenciales"],
  en: ["International homeowners", "Buyers planning renovations", "Residential properties"],
  de: ["Internationale Eigentümer", "Käufer mit Renovierungsplänen", "Wohnimmobilien"]
};

const propertyManagerClientTypes = {
  es: ["Propietarios no residentes", "Compradores internacionales", "Viviendas de segunda residencia"],
  en: ["Non-resident owners", "International buyers", "Second-home properties"],
  de: ["Nicht-residente Eigentümer", "Internationale Käufer", "Zweitwohnsitze"]
};

const architectureSpecialties = {
  es: ["Arquitectura residencial", "Reformas", "Dirección técnica", "Proyectos en Mallorca"],
  en: ["Residential architecture", "Renovation", "Technical direction", "Mallorca projects"],
  de: ["Wohnarchitektur", "Renovierung", "Technische Leitung", "Projekte auf Mallorca"]
};

const renovationSpecialties = {
  es: ["Reformas", "Construcción residencial", "Villas y viviendas", "Coordinación de obra"],
  en: ["Renovation", "Residential construction", "Villas and homes", "Project coordination"],
  de: ["Renovierung", "Wohnungsbau", "Villen und Häuser", "Projektkoordination"]
};

const propertyManagementSpecialties = {
  es: ["Gestión de propiedades", "Alquiler y mantenimiento", "Villas y segunda residencia", "Servicios para propietarios"],
  en: ["Property management", "Rental and maintenance", "Villas and second homes", "Owner services"],
  de: ["Immobilienverwaltung", "Vermietung und Wartung", "Villen und Zweitwohnsitze", "Eigentümer-Services"]
};

const dentistClientTypes = {
  es: ["Expats y residentes internacionales", "Familias en Mallorca", "Pacientes privados"],
  en: ["Expats and international residents", "Families in Mallorca", "Private patients"],
  de: ["Expats und internationale Residenten", "Familien auf Mallorca", "Privatpatienten"]
};

const doctorClientTypes = dentistClientTypes;

const estateAgentClientTypes = {
  es: ["Compradores internacionales", "Vendedores de vivienda", "Inversores inmobiliarios"],
  en: ["International buyers", "Home sellers", "Property investors"],
  de: ["Internationale Käufer", "Immobilienverkäufer", "Immobilieninvestoren"]
};

const mortgageBrokerClientTypes = {
  es: ["Compradores internacionales", "No residentes", "Propietarios que refinancian"],
  en: ["International buyers", "Non-residents", "Owners refinancing"],
  de: ["Internationale Käufer", "Nicht-Residenten", "Eigentümer mit Refinanzierungsbedarf"]
};

const dentalClinicSpecialties = {
  es: ["Odontología general", "Implantes", "Estética dental", "Atención privada"],
  en: ["General dentistry", "Implants", "Cosmetic dentistry", "Private care"],
  de: ["Allgemeine Zahnmedizin", "Implantate", "Ästhetische Zahnmedizin", "Private Behandlung"]
};

const orthodonticsSpecialties = {
  es: ["Ortodoncia", "Invisalign", "Tratamientos familiares", "Seguimiento dental"],
  en: ["Orthodontics", "Invisalign", "Family treatments", "Dental follow-up"],
  de: ["Kieferorthopädie", "Invisalign", "Behandlungen für Familien", "Zahnärztliche Nachsorge"]
};

const medicalClinicSpecialties = {
  es: ["Medicina privada", "Atención multilingüe", "Consulta médica", "Pacientes internacionales"],
  en: ["Private medicine", "Multilingual care", "Medical consultation", "International patients"],
  de: ["Private Medizin", "Mehrsprachige Betreuung", "Ärztliche Beratung", "Internationale Patienten"]
};

const pediatricSpecialties = {
  es: ["Pediatría privada", "Medicina infantil", "Consulta en alemán", "Pacientes jóvenes"],
  en: ["Private paediatrics", "Children's medicine", "German-language consultations", "Young patients"],
  de: ["Private Kinderheilkunde", "Kindermedizin", "Deutschsprachige Beratung", "Junge Patienten"]
};

const hnoSpecialties = {
  es: ["Otorrinolaringología", "ORL privada", "Consulta en alemán", "Pacientes internacionales"],
  en: ["ENT specialist", "Private otolaryngology", "German-language consultations", "International patients"],
  de: ["HNO-Facharzt", "Private HNO-Praxis", "Deutschsprachige Beratung", "Internationale Patienten"]
};

const estateAgentSpecialties = {
  es: ["Compraventa inmobiliaria", "Vivienda residencial", "Clientes internacionales", "Mercado local"],
  en: ["Property sales", "Residential homes", "International clients", "Local market"],
  de: ["Immobilienverkauf", "Wohnimmobilien", "Internationale Kunden", "Lokaler Markt"]
};

const mortgageBrokerSpecialties = {
  es: ["Hipotecas", "Compradores no residentes", "Financiación inmobiliaria", "Asesoramiento hipotecario"],
  en: ["Mortgages", "Non-resident buyers", "Property finance", "Mortgage advice"],
  de: ["Hypotheken", "Nicht-residente Käufer", "Immobilienfinanzierung", "Hypothekenberatung"]
};

const approvedDentistProfiles: ExpertProfile[] = [
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJCZGbwVOSlxIRhpYmouwnJFs", slug: "coped-ortodoncia", verticalSlug: "english-speaking-dentists-mallorca", location: "Palma", focus: { es: "ortodoncia con un volumen excepcional de reseñas en Palma", en: "orthodontics with exceptional review volume in Palma", de: "Kieferorthopädie mit außergewöhnlichem Bewertungsvolumen in Palma" }, specialties: orthodonticsSpecialties, clientTypes: dentistClientTypes }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJXz3u0lqSlxIRyBRkaELsOJw", slug: "ziving-tomas-sastre", verticalSlug: "english-speaking-dentists-mallorca", location: "Palma", focus: { es: "ortodoncia consolidada para familias y pacientes privados", en: "established orthodontics for families and private patients", de: "etablierte Kieferorthopädie für Familien und Privatpatienten" }, specialties: orthodonticsSpecialties, clientTypes: dentistClientTypes }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJX483P_aSlxIRF4m4LK9oeec", slug: "clinica-pronova", verticalSlug: "english-speaking-dentists-mallorca", location: "Palma", focus: { es: "clínica dental general con reputación pública muy fuerte", en: "general dental clinic with very strong public reputation", de: "allgemeine Zahnklinik mit sehr starker öffentlicher Reputation" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJAY1Cv_mSlxIRibPD0Uxvag8", slug: "clinica-dental-ced-palma-doctor-murad", verticalSlug: "english-speaking-dentists-mallorca", location: "Palma", focus: { es: "clínica dental en Palma con alto volumen de reseñas", en: "Palma dental clinic with high review volume", de: "Zahnklinik in Palma mit hohem Bewertungsvolumen" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJbbP84rPFlxIRdN_GpVa_PGQ", slug: "clinica-dental-schurian", verticalSlug: "english-speaking-dentists-mallorca", location: "Inca", languages: ["Español", "English", "Deutsch"], focus: { es: "clínica dental sólida para pacientes del centro y norte de Mallorca", en: "strong dental clinic for patients in central and northern Mallorca", de: "starke Zahnklinik für Patienten im Zentrum und Norden Mallorcas" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes, areasServed: ["Inca", "Centro de Mallorca", "Norte de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJKRCZg2GSlxIR7HH1DfnVSHI", slug: "clinica-dental-delgado", verticalSlug: "english-speaking-dentists-mallorca", location: "Palma", focus: { es: "clínica dental general con reputación consistente en Palma", en: "general dental clinic with consistent reputation in Palma", de: "allgemeine Zahnklinik mit konstanter Reputation in Palma" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJB33ZNvqSlxIRhcc98XD-JEE", slug: "clinica-dental-dentalita", verticalSlug: "english-speaking-dentists-mallorca", location: "Palma", focus: { es: "clínica dental general con volumen alto de reseñas", en: "general dental clinic with high review volume", de: "allgemeine Zahnklinik mit hohem Bewertungsvolumen" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJGUVq7auTlxIRuhYtVmPTrN8", slug: "urgencias-dentales-mallorca", verticalSlug: "english-speaking-dentists-mallorca", location: "Palma", focus: { es: "urgencias dentales, un nicho especialmente útil para residentes internacionales", en: "dental emergencies, a particularly useful niche for international residents", de: "Zahnärztliche Notfälle, ein besonders nützlicher Bereich für internationale Residenten" }, specialties: { es: ["Urgencias dentales", "Odontología general", "Dolor dental", "Atención privada"], en: ["Dental emergencies", "General dentistry", "Dental pain", "Private care"], de: ["Zahnärztliche Notfälle", "Allgemeine Zahnmedizin", "Zahnschmerzen", "Private Behandlung"] }, clientTypes: dentistClientTypes }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJoxFhwYkslhIRzQArv-pfmnE", slug: "dr-dirk-doring-puertoalcudiadent", verticalSlug: "english-speaking-dentists-mallorca", location: "Port d'Alcúdia", languages: ["Deutsch", "English", "Español"], focus: { es: "dentista alemán en el norte de Mallorca", en: "German dentist in northern Mallorca", de: "deutscher Zahnarzt im Norden Mallorcas" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes, areasServed: ["Port d'Alcúdia", "Alcúdia", "Norte de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJaf9VWImJlxIRgxTnQXdtdqI", slug: "dental-clinic-magaluf", verticalSlug: "english-speaking-dentists-mallorca", location: "Magaluf", languages: ["English", "Español"], focus: { es: "dentista británico explícito para residentes internacionales en el suroeste", en: "explicit British dentist profile for international residents in the southwest", de: "klar britisches Zahnarztprofil für internationale Residenten im Südwesten" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes, areasServed: ["Magaluf", "Calvià", "Suroeste de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJ8RWcorGOlxIRBASPaliXOfc", slug: "the-european-dental-practice", verticalSlug: "english-speaking-dentists-mallorca", location: "Santa Ponça", languages: ["English", "Deutsch", "Español"], focus: { es: "clínica dental con perfil internacional en el suroeste", en: "international dental practice in the southwest", de: "internationale Zahnarztpraxis im Südwesten" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes, areasServed: ["Santa Ponça", "Calvià", "Suroeste de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJV5aj_KqTlxIR_Ov44aMeeeQ", slug: "excellence-dental-health", verticalSlug: "english-speaking-dentists-mallorca", location: "Palma", languages: ["English", "Español"], focus: { es: "clínica dental en inglés con el mayor volumen de reseñas de Palma", en: "English-language dental clinic with the highest review volume in Palma", de: "englischsprachige Zahnklinik mit dem höchsten Bewertungsvolumen in Palma" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes, areasServed: ["Palma", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJ41YXBn2SlxIRNNKKLyEFYKU", slug: "clinica-dental-vogelsang", verticalSlug: "english-speaking-dentists-mallorca", location: "Palma", languages: ["Deutsch", "Español"], focus: { es: "clínica dental de nombre alemán con fuerte presencia en el este de Palma", en: "German-name dental clinic with strong presence in east Palma", de: "Zahnarztpraxis mit starker Präsenz im Osten Palmas" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes, areasServed: ["Palma", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJXXzR7-atlxIRlaxzeq1WLss", slug: "clinica-dental-nobledent", verticalSlug: "english-speaking-dentists-mallorca", location: "Campos", languages: ["Deutsch", "Español"], focus: { es: "dentista alemán para residentes del sur y sureste de Mallorca", en: "German dentist for residents in southern and southeast Mallorca", de: "Deutscher Zahnarzt für Residenten im Süden und Südosten Mallorcas" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes, areasServed: ["Campos", "Sur de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJAbs57X1AlhIR8Q7Hkz61OX0", slug: "schmieder-deutscher-zahnarzt", verticalSlug: "english-speaking-dentists-mallorca", location: "Cala Millor", languages: ["Deutsch"], focus: { es: "dentista alemán en Cala Millor para residentes del este de Mallorca", en: "German dentist in Cala Millor for east Mallorca residents", de: "Deutschsprachiger Zahnarzt in Cala Millor für Residenten im Osten Mallorcas" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes, areasServed: ["Cala Millor", "Este de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: dentistsPreview, googlePlaceId: "ChIJNbbE0osslhIRluDQ3KeauIg", slug: "dra-mckenzie-alcudia", verticalSlug: "english-speaking-dentists-mallorca", location: "Alcúdia", languages: ["English", "Deutsch"], focus: { es: "dentista bilingüe inglés-alemán en Alcúdia, norte de Mallorca", en: "bilingual English-German dentist in Alcúdia, north Mallorca", de: "Zweisprachige englisch-deutsche Zahnärztin in Alcúdia, Nordmallorca" }, specialties: dentalClinicSpecialties, clientTypes: dentistClientTypes, areasServed: ["Alcúdia", "Norte de Mallorca", "Mallorca"] })
];

const approvedDoctorProfiles: ExpertProfile[] = [
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJsYZehpiTlxIRLm6PkjIv_-A", slug: "clinica-premier-balear", verticalSlug: "english-speaking-doctors-mallorca", location: "Palma", focus: { es: "clínica privada premium para pacientes internacionales", en: "premium private clinic for international patients", de: "private Premium-Klinik für internationale Patienten" }, specialties: medicalClinicSpecialties, clientTypes: doctorClientTypes, status: "candidate" }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJgStjb9JBlhIRX3hX_Wx3W68", slug: "floydclinic-cala-millor", verticalSlug: "english-speaking-doctors-mallorca", location: "Cala Millor", languages: ["English", "Deutsch", "Español"], focus: { es: "clínica privada sólida en el este de Mallorca", en: "strong private clinic in eastern Mallorca", de: "starke Privatklinik im Osten Mallorcas" }, specialties: medicalClinicSpecialties, clientTypes: doctorClientTypes, areasServed: ["Cala Millor", "Este de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJs5FgGgCXlxIRLUWavX3f4ok", slug: "doctor-balear-24h", verticalSlug: "english-speaking-doctors-mallorca", location: "Can Pastilla", languages: ["Deutsch", "English", "Español"], focus: { es: "servicio médico 24h, especialmente útil para visitantes y residentes internacionales", en: "24h medical service, especially useful for visitors and international residents", de: "24h-Ärzteservice, besonders nützlich für Besucher und internationale Residenten" }, specialties: { es: ["Medicina privada", "Atención 24h", "Visitas médicas", "Pacientes internacionales"], en: ["Private medicine", "24h care", "Medical visits", "International patients"], de: ["Private Medizin", "24h-Betreuung", "Arztbesuche", "Internationale Patienten"] }, clientTypes: doctorClientTypes, areasServed: ["Can Pastilla", "Palma", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJMz8_6F2JlxIRFc0suYl_2y8", slug: "british-gp-practice", verticalSlug: "english-speaking-doctors-mallorca", location: "Calvià", languages: ["English"], focus: { es: "médico GP británico para expats y pacientes internacionales", en: "British GP practice for expats and international patients", de: "britische GP-Praxis für Expats und internationale Patienten" }, specialties: { es: ["Medicina general", "GP británico", "Pacientes internacionales", "Consulta privada"], en: ["General practice", "British GP", "International patients", "Private consultation"], de: ["Allgemeinmedizin", "Britischer GP", "Internationale Patienten", "Private Beratung"] }, clientTypes: doctorClientTypes, areasServed: ["Calvià", "Suroeste de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJl6PwhK3rlxIR6G537JjbyIY", slug: "clinic-santa-maria", verticalSlug: "english-speaking-doctors-mallorca", location: "Santa Maria del Camí", languages: ["Deutsch", "English", "Español"], focus: { es: "centro médico multilingüe en el interior de Mallorca", en: "multilingual medical centre in inland Mallorca", de: "mehrsprachiges Ärztezentrum im Inselinneren" }, specialties: medicalClinicSpecialties, clientTypes: doctorClientTypes, areasServed: ["Santa Maria del Camí", "Interior de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJNSDaggWJlxIRhSyUS8IqJvA", slug: "the-doctors-mc-palmanova", verticalSlug: "english-speaking-doctors-mallorca", location: "Palmanova", languages: ["English", "Español"], focus: { es: "centro médico con perfil inglés en Palmanova", en: "English-profile medical centre in Palmanova", de: "medizinisches Zentrum mit englischem Profil in Palmanova" }, specialties: medicalClinicSpecialties, clientTypes: doctorClientTypes, areasServed: ["Palmanova", "Calvià", "Suroeste de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJBWydxQW7lxIR8TEOxbOmGPE", slug: "dr-esser-medical-center", verticalSlug: "english-speaking-doctors-mallorca", location: "Peguera", languages: ["Deutsch", "English", "Español"], focus: { es: "centro médico alemán e internacional en el suroeste", en: "German and international medical centre in the southwest", de: "deutsches und internationales Ärztezentrum im Südwesten" }, specialties: medicalClinicSpecialties, clientTypes: doctorClientTypes, areasServed: ["Peguera", "Calvià", "Suroeste de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJU5vsJ60mmBIRoVO8k3FCmHk", slug: "clinica-port-dandratx-allmedica", verticalSlug: "english-speaking-doctors-mallorca", location: "Port d'Andratx", languages: ["Deutsch", "English", "Español"], focus: { es: "clínica privada internacional en Port d'Andratx", en: "international private clinic in Port d'Andratx", de: "internationale Privatklinik in Port d'Andratx" }, specialties: medicalClinicSpecialties, clientTypes: doctorClientTypes, areasServed: ["Port d'Andratx", "Andratx", "Suroeste de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJHwPvOcNQlhIRn446rlzeiLI", slug: "ambulanta-cala-dor", verticalSlug: "english-speaking-doctors-mallorca", location: "Cala d'Or", languages: ["Deutsch"], focus: { es: "consulta médica alemana en el sureste de Mallorca", en: "German medical practice in southeast Mallorca", de: "Deutsche Arztpraxis im Südosten Mallorcas" }, specialties: medicalClinicSpecialties, clientTypes: doctorClientTypes, areasServed: ["Cala d'Or", "Este de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJVVVVlWtFlhIRj_3cskhesHM", slug: "praxis-dr-walther", verticalSlug: "english-speaking-doctors-mallorca", location: "Cales de Mallorca", languages: ["Deutsch", "English"], focus: { es: "médico privada bilingüe alemán-inglés en Cales de Mallorca", en: "bilingual German-English private doctor in Cales de Mallorca", de: "zweisprachige deutsch-englische Privatpraxis in Cales de Mallorca" }, specialties: medicalClinicSpecialties, clientTypes: doctorClientTypes, areasServed: ["Cales de Mallorca", "Este de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJq_kcVXySlxIRlLOz35PM11c", slug: "kinderarzt-noack-palma", verticalSlug: "english-speaking-doctors-mallorca", location: "Palma", languages: ["Deutsch"], focus: { es: "pediatra alemán privado en Palma con alta valoración", en: "top-rated German private paediatrician in Palma", de: "Top-bewerteter deutscher Kinderarzt in Palma" }, specialties: pediatricSpecialties, clientTypes: doctorClientTypes, areasServed: ["Palma", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJ-ROzVHySlxIRcMsP8UvTmso", slug: "hno-mallorca", verticalSlug: "english-speaking-doctors-mallorca", location: "Palma", languages: ["Deutsch"], focus: { es: "especialista ORL en alemán en la Clínica Picasso de Palma", en: "German ENT specialist at Clínica Picasso Palma", de: "Deutschsprachiger HNO-Facharzt in der Clínica Picasso Palma" }, specialties: hnoSpecialties, clientTypes: doctorClientTypes, areasServed: ["Palma", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJwQqymVqSlxIRuh_Ak7feLk8", slug: "arztehaus-palma", verticalSlug: "english-speaking-doctors-mallorca", location: "Coll den Rabassa", languages: ["Deutsch"], focus: { es: "centro médico alemán multidisciplinar junto al aeropuerto de Palma", en: "German multidisciplinary medical centre near Palma airport", de: "Deutsches Ärztehaus (Medicum) in der Nähe des Flughafens Palma" }, specialties: medicalClinicSpecialties, clientTypes: doctorClientTypes, areasServed: ["Coll den Rabassa", "Palma", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJndE_YqSTlxIRIIrS4J2v_50", slug: "kinderarztpraxis-dr-haak", verticalSlug: "english-speaking-doctors-mallorca", location: "Palma", languages: ["Deutsch"], focus: { es: "pediatra alemán privado en el norte de Palma", en: "German private paediatrician in north Palma", de: "Deutschsprachige Kinderarztpraxis in Palma-Nord" }, specialties: pediatricSpecialties, clientTypes: doctorClientTypes, areasServed: ["Palma", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: doctorsPreview, googlePlaceId: "ChIJuyy_zQiSlxIR1PunKecauHA", slug: "kinderartzin-rittweiler", verticalSlug: "english-speaking-doctors-mallorca", location: "Palma", languages: ["Deutsch"], focus: { es: "pediatra alemana privada en Palma, junto al Paseo Marítimo", en: "German private paediatrician in Palma, near Paseo Marítimo", de: "Deutschsprachige Kinderärztin in Palma, nahe Paseo Marítimo" }, specialties: pediatricSpecialties, clientTypes: doctorClientTypes, areasServed: ["Palma", "Mallorca"] })
];

const approvedEstateAgentProfiles: ExpertProfile[] = [
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJDV2m9VOSlxIREnJsgyVjGvg", slug: "talaiot-asesores-inmobiliarios", verticalSlug: "estate-agents-mallorca", location: "Palma", focus: { es: "agencia inmobiliaria con el mayor volumen de reseñas de esta selección", en: "estate agency with the highest review volume in this selection", de: "Immobilienagentur mit dem höchsten Bewertungsvolumen dieser Auswahl" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJO-znWJnGk6MRi_IJSHTA-aY", slug: "coco-inmobiliaria", verticalSlug: "estate-agents-mallorca", location: "Palma", focus: { es: "agencia inmobiliaria con valoración máxima y volumen sólido", en: "estate agency with top rating and solid review volume", de: "Immobilienagentur mit Top-Bewertung und solidem Bewertungsvolumen" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJewtj0pKTlxIR_8EzhxhEPKs", slug: "molina-homes", verticalSlug: "estate-agents-mallorca", location: "Palma", focus: { es: "agencia inmobiliaria de Palma con señales públicas muy fuertes", en: "Palma estate agency with very strong public signals", de: "Immobilienagentur in Palma mit sehr starken öffentlichen Signalen" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJw4Yk_O-SlxIRrCSXpe8qTU0", slug: "inmobiliaria-inmogestion-balear", verticalSlug: "estate-agents-mallorca", location: "Palma", focus: { es: "agencia inmobiliaria sólida para compraventa residencial", en: "solid estate agency for residential property sales", de: "solide Immobilienagentur für Wohnimmobilien" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJzcst-VTFlxIRFdCwtijlkQo", slug: "inmobiliaria-sa-marina", verticalSlug: "estate-agents-mallorca", location: "Alcúdia", focus: { es: "agencia inmobiliaria fuerte en el norte de Mallorca", en: "strong estate agency in northern Mallorca", de: "starke Immobilienagentur im Norden Mallorcas" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Alcúdia", "Norte de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJLyKcWANJlhIRNuBZmt5d5fQ", slug: "gestpropiedad-manacor", verticalSlug: "estate-agents-mallorca", location: "Manacor", focus: { es: "agencia inmobiliaria destacada en el este de Mallorca", en: "notable estate agency in eastern Mallorca", de: "auffällige Immobilienagentur im Osten Mallorcas" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Manacor", "Este de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJ-dPfwPqSlxIRrrk94he-Y-c", slug: "inmobiliaria-living-palma", verticalSlug: "estate-agents-mallorca", location: "Palma", focus: { es: "agencia inmobiliaria de Palma para compraventa residencial", en: "Palma estate agency for residential property sales", de: "Immobilienagentur in Palma für Wohnimmobilien" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJgVi87vDFlxIR3S0sZ0snRUQ", slug: "inmoclaus", verticalSlug: "estate-agents-mallorca", location: "Inca", focus: { es: "servicios inmobiliarios con valoración máxima en el centro de la isla", en: "property services with top rating in central Mallorca", de: "Immobiliendienstleistungen mit Top-Bewertung im Zentrum Mallorcas" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Inca", "Centro de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJzV68zsUXlhIRJxqWe5H9yok", slug: "mayer-dau-immobilien", verticalSlug: "estate-agents-mallorca", location: "Cala Rajada", languages: ["Deutsch"], focus: { es: "agencia inmobiliaria alemana con valoración máxima en el noreste de Mallorca", en: "top-rated German property agency in northeast Mallorca", de: "Top-bewertete deutsche Immobilienagentur im Nordosten Mallorcas" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Cala Rajada", "Artà", "Noreste de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJq6o6DqmXlxIRT7iMNnBJ6Hg", slug: "bb-immobilien-mallorca", verticalSlug: "estate-agents-mallorca", location: "Llucmajor", languages: ["Deutsch"], focus: { es: "agencia inmobiliaria alemana en el sur de Mallorca", en: "German property agency in southern Mallorca", de: "Deutsche Immobilienagentur im Süden Mallorcas" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Llucmajor", "Sur de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJWZpehwHClxIRzw_d1evi3yA", slug: "living-blue-mallorca-alaro", verticalSlug: "estate-agents-mallorca", location: "Alaró", languages: ["Deutsch", "English", "Español"], focus: { es: "agencia inmobiliaria especializada en el interior de Mallorca", en: "specialist property agency in inland Mallorca", de: "Spezialisierte Immobilienagentur im Inselinneren Mallorcas" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Alaró", "Interior de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJX7jGoLfllxIRyjpaigLoQQ0", slug: "living-blue-mallorca-soller", verticalSlug: "estate-agents-mallorca", location: "Port de Sóller", languages: ["Deutsch", "English", "Español"], focus: { es: "agencia inmobiliaria especializada en el noroeste de Mallorca", en: "specialist property agency in northwest Mallorca", de: "Spezialisierte Immobilienagentur im Nordwesten Mallorcas" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Port de Sóller", "Sóller", "Tramuntana", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJAeKTdrLvlxIRopvjNlLK2oM", slug: "charles-marlow", verticalSlug: "estate-agents-mallorca", location: "Deià", languages: ["English", "Deutsch", "Español"], focus: { es: "agencia inmobiliaria premium para propiedades exclusivas en la Tramuntana", en: "premium property agency for high-end properties in the Tramuntana", de: "Hochwertige Immobilienagentur für Premiumimmobilien in der Tramuntana" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Deià", "Sóller", "Tramuntana", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJjUGjpZuOlxIR-TPSztB-PZ8", slug: "gram-mallorca", verticalSlug: "estate-agents-mallorca", location: "Cas Català-Illetes", languages: ["Deutsch", "English"], focus: { es: "gestión de activos inmobiliarios alemana especializada en el suroeste de Mallorca", en: "German real estate asset management specialising in southwest Mallorca", de: "Deutsches Immobilien-Asset-Management, spezialisiert auf den Südwesten Mallorcas" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Cas Català", "Illetes", "Suroeste de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJEz5IIuGNlxIR_88WUImVANo", slug: "herden-immobilien", verticalSlug: "estate-agents-mallorca", location: "Cas Català-Illetes", languages: ["Deutsch", "English"], focus: { es: "inmobiliaria alemana de referencia en el suroeste de Mallorca", en: "leading German property agency in southwest Mallorca", de: "Führende deutsche Immobilienagentur im Südwesten Mallorcas" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Cas Català", "Illetes", "Suroeste de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJr6xQ5QotlhIRdZVZMclucDE", slug: "dahler-alcudia", verticalSlug: "estate-agents-mallorca", location: "Alcúdia", languages: ["Deutsch", "English"], focus: { es: "marca alemana premium de propiedades en Alcúdia y el norte de Mallorca", en: "premium German property brand in Alcúdia and north Mallorca", de: "Deutsches Premiumimmobilienbüro in Alcúdia und Nordmallorca" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Alcúdia", "Norte de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJO5OouWeSlxIRgFM3dK5382E", slug: "chic-mallorca-international", verticalSlug: "estate-agents-mallorca", location: "Palma", languages: ["English", "Español"], focus: { es: "agencia inmobiliaria internacional en Palma con alto volumen de reseñas", en: "international property agency in Palma with high review volume", de: "Internationale Immobilienagentur in Palma mit hohem Bewertungsvolumen" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Palma", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJ4_LgDIVUlhIRNe4EaLXvkNc", slug: "mcr-mallorca-immobilien", verticalSlug: "estate-agents-mallorca", location: "Santanyí", languages: ["Deutsch"], focus: { es: "agencia inmobiliaria alemana especializada en el sureste de Mallorca", en: "German property agency specialising in southeast Mallorca", de: "Deutsche Immobilienagentur, spezialisiert auf den Südosten Mallorcas" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Santanyí", "Sureste de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJV5XKUxQXlhIRgYtbvozrUyM", slug: "huether-partner-mallorca", verticalSlug: "estate-agents-mallorca", location: "Porto Cristo", languages: ["Deutsch"], focus: { es: "agencia inmobiliaria alemana en Porto Cristo, este de Mallorca", en: "German property agency in Porto Cristo, east Mallorca", de: "Deutsche Immobilienagentur in Porto Cristo, Ostmallorca" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Porto Cristo", "Este de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: estateAgentsPreview, googlePlaceId: "ChIJk-F1B9WJlxIReeHD245imjg", slug: "casa-nova-properties", verticalSlug: "estate-agents-mallorca", location: "Santa Ponça", languages: ["Deutsch", "English"], focus: { es: "agencia inmobiliaria alemana en Santa Ponça con excelente reputación", en: "German-facing property agency in Santa Ponça with excellent reputation", de: "Deutschsprachige Immobilienagentur in Santa Ponça mit ausgezeichnetem Ruf" }, specialties: estateAgentSpecialties, clientTypes: estateAgentClientTypes, areasServed: ["Santa Ponça", "Calvià", "Suroeste de Mallorca", "Mallorca"] })
];

const approvedMortgageBrokerProfiles: ExpertProfile[] = [
  makeApprovedPreviewProfile({ candidates: mortgageBrokersPreview, googlePlaceId: "ChIJD7kK0xcqcw0ReUEAb70GcYA", slug: "fluent-finance-abroad", verticalSlug: "mortgage-brokers-mallorca", location: "Mallorca", languages: ["English", "Español"], focus: { es: "financiación para compradores no residentes e internacionales", en: "finance for non-resident and international buyers", de: "Finanzierung für nicht-residente und internationale Käufer" }, specialties: mortgageBrokerSpecialties, clientTypes: mortgageBrokerClientTypes }),
  makeApprovedPreviewProfile({ candidates: mortgageBrokersPreview, googlePlaceId: "ChIJ5Rka_ajVlxIRQbBt73Xts_A", slug: "pollenca-brokers", verticalSlug: "mortgage-brokers-mallorca", location: "Pollença", focus: { es: "broker hipotecario fuerte en el norte de Mallorca", en: "strong mortgage broker in northern Mallorca", de: "starker Hypothekenbroker im Norden Mallorcas" }, specialties: mortgageBrokerSpecialties, clientTypes: mortgageBrokerClientTypes, areasServed: ["Pollença", "Norte de Mallorca", "Mallorca"] }),
  makeApprovedPreviewProfile({ candidates: mortgageBrokersPreview, googlePlaceId: "ChIJJ_85JUWSlxIRU4dNCjxOeXU", slug: "lionsgate-capital", verticalSlug: "mortgage-brokers-mallorca", location: "Palma", languages: ["English", "Español"], focus: { es: "financiación hipotecaria premium para compradores internacionales", en: "premium mortgage finance for international buyers", de: "Premium-Hypothekenfinanzierung für internationale Käufer" }, specialties: mortgageBrokerSpecialties, clientTypes: mortgageBrokerClientTypes }),
  makeApprovedPreviewProfile({ candidates: mortgageBrokersPreview, googlePlaceId: "ChIJ81RBiNiTlxIRnauaUmwztd4", slug: "palmacredit", verticalSlug: "mortgage-brokers-mallorca", location: "Palma", focus: { es: "hipotecas y créditos con volumen sólido en Palma", en: "mortgages and credit advice with solid review volume in Palma", de: "Hypotheken und Kreditberatung mit solidem Bewertungsvolumen in Palma" }, specialties: mortgageBrokerSpecialties, clientTypes: mortgageBrokerClientTypes }),
  makeApprovedPreviewProfile({ candidates: mortgageBrokersPreview, googlePlaceId: "ChIJqweKYX-TlxIRIEArCG5mXSY", slug: "somos-finance-group", verticalSlug: "mortgage-brokers-mallorca", location: "Palma", focus: { es: "asesoramiento financiero e hipotecario para compradores", en: "financial and mortgage advice for buyers", de: "Finanz- und Hypothekenberatung für Käufer" }, specialties: mortgageBrokerSpecialties, clientTypes: mortgageBrokerClientTypes }),
  makeApprovedPreviewProfile({ candidates: mortgageBrokersPreview, googlePlaceId: "ChIJ4XIfLVuSlxIRqgAWjrfkkDQ", slug: "mallorca-mortgage-consultancy", verticalSlug: "mortgage-brokers-mallorca", location: "Palma", languages: ["English", "Español"], focus: { es: "consultoría hipotecaria explícitamente enfocada en Mallorca", en: "mortgage consultancy explicitly focused on Mallorca", de: "Hypothekenberatung mit klarem Mallorca-Fokus" }, specialties: mortgageBrokerSpecialties, clientTypes: mortgageBrokerClientTypes }),
  makeApprovedPreviewProfile({ candidates: mortgageBrokersPreview, googlePlaceId: "ChIJnejHGnbZcg0Rhw_C1I5cG94", slug: "mortgage-matters-spain", verticalSlug: "mortgage-brokers-mallorca", location: "Spain", languages: ["English", "Español"], focus: { es: "broker hipotecario internacional para compradores en España y Mallorca", en: "international mortgage broker for buyers in Spain and Mallorca", de: "internationaler Hypothekenbroker für Käufer in Spanien und auf Mallorca" }, specialties: mortgageBrokerSpecialties, clientTypes: mortgageBrokerClientTypes, areasServed: ["Mallorca", "Spain"] })
];

const aestheticClientTypes = {
  es: ["Expats y residentes internacionales", "Turistas de larga estancia", "Residentes en segunda vivienda"],
  en: ["Expats and international residents", "Long-stay visitors", "Second-home residents"],
  de: ["Expats und internationale Residenten", "Langzeittouristen", "Zweitwohnsitzinhaber"]
};

const aestheticSpecialties = {
  es: ["Medicina estética", "Tratamientos faciales", "Rejuvenecimiento", "Procedimientos no invasivos", "Dermatología estética"],
  en: ["Aesthetic medicine", "Facial treatments", "Rejuvenation", "Non-invasive procedures", "Aesthetic dermatology"],
  de: ["Ästhetische Medizin", "Gesichtsbehandlungen", "Verjüngung", "Nicht-invasive Verfahren", "Ästhetische Dermatologie"]
};

const approvedAestheticMedicineProfiles: ExpertProfile[] = [
  makeApprovedPreviewProfile({
    candidates: aestheticMedicinePreview,
    googlePlaceId: "ChIJRYpGX4mTlxIRDV3cM0W88HE",
    slug: "oliva-aesthetic-hair-clinic",
    verticalSlug: "aesthetic-medicine-mallorca",
    location: "Palma",
    languages: ["English", "Español"],
    focus: {
      es: "medicina estética y restauración capilar en Palma",
      en: "aesthetic medicine and hair restoration in Palma",
      de: "ästhetische Medizin und Haarwiederherstellung in Palma"
    },
    specialties: {
      es: ["Medicina estética", "Restauración capilar", "Tratamientos faciales", "Rejuvenecimiento", "Inyectables"],
      en: ["Aesthetic medicine", "Hair restoration", "Facial treatments", "Rejuvenation", "Injectables"],
      de: ["Ästhetische Medizin", "Haarwiederherstellung", "Gesichtsbehandlungen", "Verjüngung", "Injektionen"]
    },
    clientTypes: aestheticClientTypes,
    areasServed: ["Palma", "Mallorca"],
    editorialNote: {
      es: "OLIVA Aesthetic & Hair Clinic es la clínica de medicina estética con mayor valoración de esta selección: 5 estrellas sobre 357 reseñas en Google, lo que la sitúa entre las clínicas mejor valoradas de la isla en cualquier especialidad médica. Combina medicina estética (botox, fillers, rejuvenecimiento facial) con tratamientos capilares avanzados en un mismo espacio, lo que la diferencia de la mayoría de clínicas de la competencia. Su web tiene versión en inglés completa.",
      en: "OLIVA Aesthetic & Hair Clinic holds the highest rating in this selection: 5 stars across 357 Google reviews, placing it among the best-rated clinics on the island in any medical specialty. It combines aesthetic medicine (botox, fillers, facial rejuvenation) with advanced hair treatments under one roof — a differentiator from most competitors. Their website has a full English version.",
      de: "OLIVA Aesthetic & Hair Clinic hält die höchste Bewertung dieser Auswahl: 5 Sterne auf 357 Google-Bewertungen, was sie zu einer der bestbewerteten Kliniken der Insel in jeder medizinischen Fachrichtung macht. Sie kombiniert ästhetische Medizin (Botox, Filler, Gesichtsverjüngung) mit fortgeschrittenen Haarbehandlungen unter einem Dach — ein Alleinstellungsmerkmal gegenüber den meisten Mitbewerbern. Die Website hat eine vollständige englische Version."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: aestheticMedicinePreview,
    googlePlaceId: "ChIJYwbumCiTlxIRfNA86shiVYQ",
    slug: "clinica-mediben",
    verticalSlug: "aesthetic-medicine-mallorca",
    location: "Palma",
    languages: ["English", "Deutsch", "Español", "Svenska"],
    focus: {
      es: "clínica multilingüe de medicina estética, dermatología y cirugía estética en Palma",
      en: "multilingual aesthetic medicine, dermatology and cosmetic surgery clinic in Palma",
      de: "mehrsprachige Klinik für ästhetische Medizin, Dermatologie und Schönheitschirurgie in Palma"
    },
    specialties: {
      es: ["Medicina estética", "Cirugía estética", "Dermatología", "Medicina capilar", "Ginecología", "Depilación láser", "Nutrición"],
      en: ["Aesthetic medicine", "Cosmetic surgery", "Dermatology", "Hair medicine", "Gynaecology", "Laser hair removal", "Nutrition"],
      de: ["Ästhetische Medizin", "Schönheitschirurgie", "Dermatologie", "Haarmedizin", "Gynäkologie", "Laser-Haarentfernung", "Ernährung"]
    },
    clientTypes: aestheticClientTypes,
    areasServed: ["Palma", "Mallorca"],
    editorialNote: {
      es: "Clínica Mediben destaca por ser una de las pocas clínicas estéticas de Mallorca que ofrece consulta en cuatro idiomas: español, inglés, alemán y sueco. Con 4.8 estrellas sobre 303 reseñas y un catálogo que cubre desde medicina estética e inyectables hasta dermatología, cirugía estética, ginecología y nutrición, funciona como una clínica integral para expats que buscan un solo punto de contacto sanitario en la isla.",
      en: "Clínica Mediben stands out as one of the few aesthetic clinics in Mallorca offering consultations in four languages: Spanish, English, German, and Swedish. With 4.8 stars across 303 reviews and a catalogue covering aesthetic medicine and injectables through to dermatology, cosmetic surgery, gynaecology, and nutrition, it operates as a comprehensive clinic for expats seeking a single healthcare point of contact on the island.",
      de: "Clínica Mediben sticht als eine der wenigen Schönheitskliniken auf Mallorca hervor, die Beratungen in vier Sprachen anbietet: Spanisch, Englisch, Deutsch und Schwedisch. Mit 4,8 Sternen auf 303 Google-Bewertungen und einem Angebot, das von ästhetischer Medizin und Injektionen über Dermatologie, Schönheitschirurgie und Gynäkologie bis hin zu Ernährungsberatung reicht, fungiert sie als umfassende Klinik für Expats, die auf der Insel einen einzigen medizinischen Ansprechpartner suchen."
    }
  })
];

const approvedArchitectProfiles: ExpertProfile[] = [
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJhQJ0R6STlxIRPXafCXjx0jY",
    slug: "ggvarq",
    verticalSlug: "architects-renovation-mallorca",
    location: "Palma",
    focus: {
      es: "arquitectura residencial y proyectos en Mallorca",
      en: "residential architecture and Mallorca property projects",
      de: "Wohnarchitektur und Immobilienprojekte auf Mallorca"
    },
    specialties: architectureSpecialties,
    clientTypes: architectClientTypes,
    editorialNote: {
      es: "GGVArq es un estudio de arquitectura de Palma con 72 reseñas y valoración perfecta de 5 estrellas, uno de los números más sólidos del sector en Mallorca donde las reseñas suelen ser escasas. El volumen y la valoración reflejan una base de clientes amplia para un estudio residencial, lo que sugiere experiencia consolidada y gestión de proyectos fiable.",
      en: "GGVArq is a Palma architecture studio with 72 reviews at a perfect 5 stars — one of the strongest track records in a vertical where reviews tend to be scarce. The combination of volume and rating for a residential studio suggests a broad and established client base with consistent project delivery.",
      de: "GGVArq ist ein Architekturstudio in Palma mit 72 Bewertungen und einer perfekten 5-Sterne-Note — eine der stärksten Bilanzen in einem Bereich, wo Bewertungen selten sind. Die Kombination aus Volumen und Bewertung deutet auf eine breite und etablierte Kundenbasis mit konsistenter Projektabwicklung hin."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJo0pdKSKTlxIRtKWFIAR0h0c",
    slug: "sancho-ferrer-arquitectura",
    verticalSlug: "architects-renovation-mallorca",
    location: "Palma",
    focus: {
      es: "arquitectura y proyectos residenciales para propietarios",
      en: "architecture and residential projects for property owners",
      de: "Architektur und Wohnprojekte für Eigentümer"
    },
    specialties: architectureSpecialties,
    clientTypes: architectClientTypes,
    editorialNote: {
      es: "Sancho Ferrer Arquitectura es un estudio de Palma con valoración sólida en Google, especializado en proyectos residenciales para propietarios en Mallorca. El perfil combina arquitectura y dirección de obra en un mismo equipo, lo que simplifica la gestión para compradores internacionales que reforman o construyen desde fuera.",
      en: "Sancho Ferrer Arquitectura is a Palma studio with a strong Google rating, specialising in residential projects for property owners in Mallorca. The profile combines architecture and site management under the same team, which simplifies the process for international buyers renovating or building from abroad.",
      de: "Sancho Ferrer Arquitectura ist ein Studio in Palma mit einer soliden Google-Bewertung, spezialisiert auf Wohnprojekte für Immobilieneigentümer auf Mallorca. Das Profil vereint Architektur und Bauleitung im gleichen Team — was den Prozess für internationale Käufer vereinfacht, die von außerhalb renovieren oder bauen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJgQmXgZ_WlxIRRJhlj45gtMQ",
    slug: "gabriel-cantarellas-reig-arquitecto",
    verticalSlug: "architects-renovation-mallorca",
    location: "Pollença",
    focus: {
      es: "arquitectura en el norte de Mallorca",
      en: "architecture in northern Mallorca",
      de: "Architektur im Norden Mallorcas"
    },
    specialties: architectureSpecialties,
    clientTypes: architectClientTypes,
    areasServed: ["Pollença", "Norte de Mallorca", "Mallorca"],
    editorialNote: {
      es: "Gabriel Cantarellas Reig es un arquitecto con base en Pollença, especializado en proyectos residenciales en el norte de Mallorca. Es una de las pocas opciones de arquitectura con presencia verificada fuera de Palma, relevante para propietarios en Puerto Pollença, Alcúdia o el interior norte que prefieren un profesional local con conocimiento del territorio.",
      en: "Gabriel Cantarellas Reig is an architect based in Pollença, specialising in residential projects in northern Mallorca. He is one of the few verified architecture options outside Palma — relevant for property owners in Puerto Pollença, Alcúdia or the northern interior who prefer a local professional with knowledge of the area.",
      de: "Gabriel Cantarellas Reig ist ein in Pollença ansässiger Architekt, spezialisiert auf Wohnprojekte im Norden Mallorcas. Er ist eine der wenigen verifizierten Architekturoptionen außerhalb von Palma — relevant für Eigentümer in Puerto Pollença, Alcúdia oder dem nördlichen Inselinneren, die einen lokalen Fachmann mit Gebietskenntnis bevorzugen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJ0RaYrvzNlxIRiNcboqjdrRI",
    slug: "miquel-moll-alzina-arquitecte",
    verticalSlug: "architects-renovation-mallorca",
    location: "Sa Pobla",
    languages: ["Català", "Español", "English"],
    focus: {
      es: "arquitectura trilingüe para proyectos residenciales",
      en: "trilingual architecture for residential projects",
      de: "mehrsprachige Architektur für Wohnprojekte"
    },
    specialties: architectureSpecialties,
    clientTypes: architectClientTypes,
    areasServed: ["Sa Pobla", "Norte de Mallorca", "Mallorca"],
    editorialNote: {
      es: "Miquel Moll Alzina es un arquitecto con base en Sa Pobla que trabaja en catalán, español e inglés — un perfil trilingüe poco habitual en el sector que lo hace accesible tanto a propietarios locales como internacionales. Su ubicación en el norte de la isla lo convierte en una alternativa sólida a los estudios de Palma para proyectos en esa zona.",
      en: "Miquel Moll Alzina is an architect based in Sa Pobla working in Catalan, Spanish and English — an unusual trilingual profile in the sector that makes him accessible to both local and international property owners. His location in the north of the island makes him a solid alternative to Palma studios for projects in that area.",
      de: "Miquel Moll Alzina ist ein in Sa Pobla ansässiger Architekt, der auf Katalanisch, Spanisch und Englisch arbeitet — ein ungewöhnlich dreisprachiges Profil im Sektor, das ihn sowohl für lokale als auch internationale Eigentümer zugänglich macht. Seine Lage im Norden der Insel macht ihn zu einer soliden Alternative zu Palma-Studios für Projekte in dieser Region."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJtwJw148slhIRNGT9Fm14p4Q",
    slug: "espais-dos-m",
    verticalSlug: "architects-renovation-mallorca",
    location: "Port d'Alcúdia",
    focus: {
      es: "arquitectura y diseño en Alcúdia y norte de Mallorca",
      en: "architecture and design in Alcúdia and northern Mallorca",
      de: "Architektur und Design in Alcúdia und im Norden Mallorcas"
    },
    specialties: architectureSpecialties,
    clientTypes: architectClientTypes,
    areasServed: ["Port d'Alcúdia", "Alcúdia", "Norte de Mallorca", "Mallorca"],
    editorialNote: {
      es: "Espais Dos M es un estudio de arquitectura y diseño en Port d'Alcúdia, con presencia en el norte de Mallorca. La combinación de arquitectura y diseño de interiores en un mismo estudio es útil para propietarios que quieren gestionar reforma y interiorismo desde un solo punto de contacto en la zona de Alcúdia.",
      en: "Espais Dos M is an architecture and design studio in Port d'Alcúdia, with a presence in northern Mallorca. The combination of architecture and interior design under one studio is useful for property owners who want to handle renovation and interiors from a single point of contact in the Alcúdia area.",
      de: "Espais Dos M ist ein Architektur- und Designstudio in Port d'Alcúdia mit Präsenz im Norden Mallorcas. Die Kombination aus Architektur und Innenarchitektur in einem Studio ist nützlich für Eigentümer, die Renovierung und Interieur von einem einzigen Ansprechpartner im Raum Alcúdia aus verwalten möchten."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJ4_J9iJaTlxIR0zqr_KVW7h4",
    slug: "e20-arquitectos",
    verticalSlug: "architects-renovation-mallorca",
    location: "Palma",
    focus: {
      es: "estudio de arquitectura para proyectos residenciales",
      en: "architecture studio for residential projects",
      de: "Architekturstudio für Wohnprojekte"
    },
    specialties: architectureSpecialties,
    clientTypes: architectClientTypes,
    editorialNote: {
      es: "E20 Arquitectos es un estudio de arquitectura en Palma centrado en proyectos residenciales. La presencia verificada en Google con reseñas de clientes reales lo posiciona entre los estudios con mayor trazabilidad pública de la isla — relevante para propietarios que quieren contrastar experiencias antes de contratar un arquitecto.",
      en: "E20 Arquitectos is a Palma architecture studio focused on residential projects. A verified Google presence with real client reviews places them among the most publicly traceable studios on the island — relevant for property owners who want to cross-check experiences before hiring an architect.",
      de: "E20 Arquitectos ist ein Architekturstudio in Palma mit Schwerpunkt auf Wohnprojekten. Eine verifizierte Google-Präsenz mit echten Kundenbewertungen positioniert sie unter den öffentlich am besten nachverfolgbaren Studios der Insel — relevant für Eigentümer, die Erfahrungen prüfen möchten, bevor sie einen Architekten beauftragen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJ-TbTrP6TlxIRnvc2Xd7T05s",
    slug: "auba-studio",
    verticalSlug: "architects-renovation-mallorca",
    location: "Palma",
    focus: {
      es: "estudio de arquitectura y diseño para proyectos en Mallorca",
      en: "architecture and design studio for Mallorca projects",
      de: "Architektur- und Designstudio für Projekte auf Mallorca"
    },
    specialties: architectureSpecialties,
    clientTypes: architectClientTypes,
    editorialNote: {
      es: "Auba Studio es un estudio de arquitectura y diseño en Palma con enfoque en proyectos residenciales en Mallorca. El posicionamiento de diseño diferencia el estudio de los estudios técnicos más convencionales — relevante para propietarios que buscan un resultado estético cuidado además de la gestión técnica del proyecto.",
      en: "Auba Studio is an architecture and design practice in Palma focused on residential projects in Mallorca. The design positioning differentiates it from more conventional technical firms — relevant for property owners who want a considered aesthetic result alongside technical project management.",
      de: "Auba Studio ist ein Architektur- und Designbüro in Palma mit Fokus auf Wohnprojekte auf Mallorca. Die Designausrichtung unterscheidet das Studio von konventionelleren technischen Büros — relevant für Eigentümer, die neben dem technischen Projektmanagement auch ein durchdachtes ästhetisches Ergebnis suchen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJ1dYp3nCSlxIR0V_aXLWgAlk",
    slug: "gras-reynes-arquitectos",
    verticalSlug: "architects-renovation-mallorca",
    location: "Palma",
    focus: {
      es: "arquitectura reconocida para proyectos residenciales y de diseño",
      en: "recognised architecture for residential and design-led projects",
      de: "anerkanntes Architekturbüro für Wohn- und Designprojekte"
    },
    specialties: architectureSpecialties,
    clientTypes: architectClientTypes,
    editorialNote: {
      es: "Gras Reynes Arquitectos es un estudio de arquitectura en Palma con reconocimiento público por proyectos residenciales y de diseño. La combinación de arquitectura de calidad y presencia en Google lo convierte en un perfil verificable para propietarios exigentes que buscan un estudio con trayectoria reconocida en la isla.",
      en: "Gras Reynes Arquitectos is a Palma architecture studio with public recognition for residential and design-led projects. The combination of quality architecture and a verifiable Google presence makes them a credible option for discerning property owners looking for a studio with an established track record on the island.",
      de: "Gras Reynes Arquitectos ist ein Architekturbüro in Palma mit öffentlicher Anerkennung für Wohn- und Designprojekte. Die Kombination aus Architekturqualität und einer verifizierbaren Google-Präsenz macht sie zu einer glaubwürdigen Option für anspruchsvolle Eigentümer, die ein Studio mit etablierter Erfolgsbilanz auf der Insel suchen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJOYfXxfONlxIRaz0K_qXThOY",
    slug: "cosendra",
    verticalSlug: "architects-renovation-mallorca",
    location: "Palma",
    focus: {
      es: "reformas y construcción residencial en Palma",
      en: "renovation and residential construction in Palma",
      de: "Renovierung und Wohnungsbau in Palma"
    },
    specialties: renovationSpecialties,
    clientTypes: constructionClientTypes,
    editorialNote: {
      es: "COSENDRA es una empresa constructora de Palma con 87 reseñas y una valoración de 4.8, cifras poco habituales en el sector de la construcción donde el volumen de reseñas suele ser mucho más bajo. Trabajan en construcción y reforma residencial, y el nivel de detalle de las reseñas de clientes sugiere una comunicación sólida y gestión de proyecto organizada.",
      en: "COSENDRA is a Palma-based construction company with 87 Google reviews at 4.8 stars — unusually high volume for a building firm, where review counts tend to be much lower. They work in residential construction and renovation, and the depth of client reviews suggests consistent communication and organised project management.",
      de: "COSENDRA ist ein Bauunternehmen aus Palma mit 87 Google-Bewertungen bei 4,8 Sternen — ein ungewöhnlich hohes Volumen für eine Baufirma, wo Bewertungszahlen in der Regel viel niedriger liegen. Sie arbeiten im Wohn- und Renovierungsbau, und die Detailtiefe der Kundenbewertungen deutet auf konsistente Kommunikation und organisiertes Projektmanagement hin."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJW7cuyMRQlhIRddQqqQ450Zc",
    slug: "the-british-contractor",
    verticalSlug: "architects-renovation-mallorca",
    location: "Cala d'Or",
    languages: ["English", "Español"],
    focus: {
      es: "construcción y reformas con perfil claramente internacional",
      en: "construction and renovation with a clearly international profile",
      de: "Bau und Renovierung mit klar internationalem Profil"
    },
    specialties: renovationSpecialties,
    clientTypes: constructionClientTypes,
    areasServed: ["Cala d'Or", "Sureste de Mallorca", "Mallorca"],
    editorialNote: {
      es: "The British Contractor es probablemente la empresa de reformas más orientada a clientes angloparlantes de toda la isla: el nombre lo dice todo, y las reseñas de 5 estrellas respaldan la reputación. Basada en Cala d'Or, opera principalmente en el sureste de Mallorca con un perfil claramente internacional. Una opción directa para propietarios británicos o irlandeses que quieren evitar las barreras del idioma en obra.",
      en: "The British Contractor is probably the renovation firm on the island most explicitly oriented to English-speaking clients — the name says it all, and five-star reviews back the reputation. Based in Cala d'Or and operating mainly across southeast Mallorca, they bring a clearly international profile to residential construction. A straightforward option for British or Irish homeowners who want to avoid language barriers on site.",
      de: "The British Contractor ist wohl die am deutlichsten auf englischsprachige Kunden ausgerichtete Renovierungsfirma der Insel — der Name spricht für sich, und Fünf-Sterne-Bewertungen untermauern den Ruf. Mit Sitz in Cala d'Or und Schwerpunkt im Südosten Mallorcas haben sie ein klar internationales Profil. Eine direkte Option für britische oder irische Eigentümer, die Sprachbarrieren auf der Baustelle vermeiden wollen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJ8znAUWSSlxIRqHCuK8js0Go",
    slug: "drd-home",
    verticalSlug: "architects-renovation-mallorca",
    location: "Palma",
    focus: {
      es: "reformas, construcción y proyectos residenciales",
      en: "renovation, construction and residential projects",
      de: "Renovierung, Bau und Wohnprojekte"
    },
    specialties: renovationSpecialties,
    clientTypes: constructionClientTypes,
    editorialNote: {
      es: "DRD Home es una empresa de reformas y construcción residencial en Palma con presencia verificada en Google. Cubre tanto reformas parciales como proyectos de obra nueva, lo que la hace relevante para propietarios que quieren un único contratista para transformaciones residenciales completas en la isla.",
      en: "DRD Home is a renovation and residential construction company in Palma with a verified Google presence. They cover both partial renovations and new builds, making them relevant for property owners who want a single contractor for complete residential transformations on the island.",
      de: "DRD Home ist ein Renovierungs- und Wohnbauunternehmen in Palma mit verifizierter Google-Präsenz. Sie decken sowohl Teilrenovierungen als auch Neubauten ab — relevant für Eigentümer, die einen einzigen Auftragnehmer für vollständige Wohntransformationen auf der Insel wünschen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJWf4EpFWSlxIR9kiAcJW-EB8",
    slug: "construcciones-llull-sastre",
    verticalSlug: "architects-renovation-mallorca",
    location: "Palma",
    focus: {
      es: "empresa local consolidada para construcción y reformas",
      en: "established local firm for construction and renovation",
      de: "etabliertes lokales Unternehmen für Bau und Renovierung"
    },
    specialties: renovationSpecialties,
    clientTypes: constructionClientTypes,
    editorialNote: {
      es: "Construcciones Llull Sastre es una empresa constructora local consolidada en Palma, con raíces en la isla que sugieren conocimiento del terreno, proveedores y normativa local. El perfil de empresa familiar con años de actividad en Mallorca puede ser relevante para propietarios que valoran la estabilidad y el arraigo local frente a empresas de perfil más nuevo.",
      en: "Construcciones Llull Sastre is an established local construction firm in Palma, with island roots that suggest knowledge of the terrain, suppliers and local regulations. A family business profile with years of activity in Mallorca may appeal to property owners who value stability and local roots over newer entrants to the market.",
      de: "Construcciones Llull Sastre ist ein etabliertes lokales Bauunternehmen in Palma mit Wurzeln auf der Insel, die auf Kenntnis des Geländes, der Lieferanten und der lokalen Vorschriften hindeuten. Das Profil eines Familienunternehmens mit jahrelanger Tätigkeit auf Mallorca kann für Eigentümer relevant sein, die Stabilität und lokale Verwurzelung schätzen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJWV3I4UqTlxIRxhhQr1HHAcU",
    slug: "grupo-jjg",
    verticalSlug: "architects-renovation-mallorca",
    location: "Palma",
    focus: {
      es: "reformas integrales y obra residencial",
      en: "complete renovations and residential works",
      de: "Komplettsanierungen und Wohnbauarbeiten"
    },
    specialties: renovationSpecialties,
    clientTypes: constructionClientTypes,
    editorialNote: {
      es: "Grupo JJG es una empresa de reformas integrales y construcción residencial en Palma. El enfoque en obras completas — desde el proyecto hasta la entrega — lo hace útil para propietarios que no quieren coordinar múltiples subcontratas y prefieren un único interlocutor para toda la transformación de una vivienda.",
      en: "Grupo JJG is a complete renovation and residential construction company in Palma. The focus on turnkey projects — from planning to handover — makes them useful for property owners who do not want to coordinate multiple subcontractors and prefer a single point of contact for the full transformation of a home.",
      de: "Grupo JJG ist ein Unternehmen für Komplettrenovierungen und Wohnungsbau in Palma. Der Fokus auf schlüsselfertige Projekte — von der Planung bis zur Übergabe — macht sie nützlich für Eigentümer, die nicht mehrere Subunternehmer koordinieren möchten und einen einzigen Ansprechpartner für die vollständige Transformation einer Immobilie bevorzugen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJv3aR6HCJlxIRh2P11hjYwOg",
    slug: "apm-mallorca",
    verticalSlug: "architects-renovation-mallorca",
    location: "Santa Ponça",
    focus: {
      es: "construcción y reformas en el suroeste de Mallorca",
      en: "construction and renovation in southwest Mallorca",
      de: "Bau und Renovierung im Südwesten Mallorcas"
    },
    specialties: renovationSpecialties,
    clientTypes: constructionClientTypes,
    areasServed: ["Santa Ponça", "Suroeste de Mallorca", "Mallorca"],
    editorialNote: {
      es: "APM Mallorca es una empresa de construcción y reformas basada en Santa Ponça, con cobertura del suroeste de la isla — una de las zonas con mayor concentración de propietarios internacionales. La ubicación geográfica en el sudoeste la convierte en opción natural para proyectos en Calvià, Santa Ponça, Portals o Costa d'en Blanes.",
      en: "APM Mallorca is a construction and renovation company based in Santa Ponça, covering the southwest of the island — one of the areas with the highest concentration of international property owners. Their geographic position in the southwest makes them a natural choice for projects in Calvià, Santa Ponça, Portals or Costa d'en Blanes.",
      de: "APM Mallorca ist ein Bau- und Renovierungsunternehmen mit Sitz in Santa Ponça und Abdeckung des Südwestens der Insel — einem der Gebiete mit der höchsten Konzentration internationaler Eigentümer. Die geografische Lage im Südwesten macht sie zur natürlichen Wahl für Projekte in Calvià, Santa Ponça, Portals oder Costa d'en Blanes."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJmSJg_xGJlxIRnHJbIEuX1XQ",
    slug: "talayot-construction-mallorca",
    verticalSlug: "architects-renovation-mallorca",
    location: "Son Bugadelles",
    languages: ["English", "Español"],
    focus: {
      es: "construcción residencial para propietarios internacionales",
      en: "residential construction for international homeowners",
      de: "Wohnungsbau für internationale Eigentümer"
    },
    specialties: renovationSpecialties,
    clientTypes: constructionClientTypes,
    areasServed: ["Son Bugadelles", "Suroeste de Mallorca", "Mallorca"],
    editorialNote: {
      es: "Talayot Construction Mallorca opera en inglés y español desde Son Bugadelles, en el suroeste de la isla. El perfil bilingüe con nombre en inglés señala claramente una orientación a clientes angloparlantes — relevante para propietarios británicos, irlandeses o americanos que buscan una constructora con la que puedan comunicarse sin barreras desde el primer día.",
      en: "Talayot Construction Mallorca operates in English and Spanish from Son Bugadelles in the southwest of the island. The bilingual profile with an English name clearly signals an orientation towards English-speaking clients — relevant for British, Irish or American property owners looking for a construction firm they can communicate with without barriers from day one.",
      de: "Talayot Construction Mallorca arbeitet auf Englisch und Spanisch von Son Bugadelles im Südwesten der Insel. Das zweisprachige Profil mit englischem Namen signalisiert klar eine Ausrichtung auf englischsprachige Kunden — relevant für britische, irische oder amerikanische Eigentümer, die ein Bauunternehmen suchen, mit dem sie von Anfang an ohne Sprachbarrieren kommunizieren können."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJW8l-WGuTlxIRYomzh_mT3DQ",
    slug: "reformas-mallorca-perfect",
    verticalSlug: "architects-renovation-mallorca",
    location: "Marratxinet",
    focus: {
      es: "reformas residenciales y mejora de viviendas",
      en: "residential renovation and home improvement",
      de: "Wohnungsrenovierung und Modernisierung"
    },
    specialties: renovationSpecialties,
    clientTypes: constructionClientTypes,
    areasServed: ["Marratxinet", "Mallorca"],
    editorialNote: {
      es: "Reformas Mallorca Perfect es una empresa de reformas residenciales con base en Marratxinet, entre Palma y el interior de la isla. El nombre refleja una propuesta orientada a resultados finales de calidad — útil para propietarios que buscan reformas residenciales con un enfoque claro en el acabado y el detalle.",
      en: "Reformas Mallorca Perfect is a residential renovation company based in Marratxinet, between Palma and the island interior. The name reflects a results-focused proposition with emphasis on quality finish — useful for property owners looking for residential renovations with a clear focus on finish and detail.",
      de: "Reformas Mallorca Perfect ist ein Wohnungsrenovierungsunternehmen mit Sitz in Marratxinet, zwischen Palma und dem Inselinneren. Der Name spiegelt ein ergebnisorientiertes Konzept mit Schwerpunkt auf Qualitätsfinish wider — nützlich für Eigentümer, die Wohnungsrenovierungen mit klarem Fokus auf Ausführung und Details suchen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: architectsPreview,
    googlePlaceId: "ChIJh9GZbmyNlxIRIICvjP-ni7g",
    slug: "ferrer-constructions",
    verticalSlug: "architects-renovation-mallorca",
    location: "Cas Català-Illetes",
    languages: ["English", "Español"],
    focus: {
      es: "construcción y reformas en la zona de Illetes",
      en: "construction and renovation in the Illetes area",
      de: "Bau und Renovierung im Raum Illetes"
    },
    specialties: renovationSpecialties,
    clientTypes: constructionClientTypes,
    areasServed: ["Cas Català-Illetes", "Suroeste de Mallorca", "Mallorca"],
    editorialNote: {
      es: "Ferrer Constructions opera en inglés y español en Cas Català-Illetes, una zona premium del suroeste de Mallorca con alta concentración de villas de lujo y propietarios internacionales. El perfil bilingüe y la ubicación específica en Illetes la hacen especialmente relevante para propietarios de esa franja costera que buscan una constructora con presencia local.",
      en: "Ferrer Constructions operates in English and Spanish in Cas Català-Illetes, a premium area in southwest Mallorca with a high concentration of luxury villas and international owners. The bilingual profile and specific Illetes location make them especially relevant for property owners along that coastal strip looking for a builder with a local presence.",
      de: "Ferrer Constructions arbeitet auf Englisch und Spanisch in Cas Català-Illetes, einem Premiumgebiet im Südwesten Mallorcas mit hoher Konzentration an Luxusvillen und internationalen Eigentümern. Das zweisprachige Profil und die spezifische Lage in Illetes machen sie besonders relevant für Eigentümer entlang dieses Küstenstreifens, die ein Bauunternehmen mit lokaler Präsenz suchen."
    }
  })
];

const approvedPropertyManagerProfiles: ExpertProfile[] = [
  makeApprovedPreviewProfile({
    candidates: propertyManagersPreview,
    googlePlaceId: "ChIJq0xONU_XlxIRwqDn5ddH5FA",
    slug: "home-villas-360",
    verticalSlug: "property-managers-mallorca",
    location: "Pollença",
    focus: {
      es: "villas, alquiler y servicios para propietarios en el norte de Mallorca",
      en: "villas, rentals and owner services in northern Mallorca",
      de: "Villen, Vermietung und Eigentümer-Services im Norden Mallorcas"
    },
    specialties: propertyManagementSpecialties,
    clientTypes: propertyManagerClientTypes,
    areasServed: ["Pollença", "Norte de Mallorca", "Mallorca"],
    note: {
      es: "candidato de alto volumen; confirmar alcance exacto de property management antes de ampliar ficha.",
      en: "high-volume candidate; confirm exact property-management scope before expanding the profile.",
      de: "Kandidat mit hohem Volumen; genauen Umfang der Immobilienverwaltung vor Ausbau des Profils prüfen."
    },
    editorialNote: {
      es: "Home Villas 360 tiene 371 reseñas en Google con una valoración de 4.7, uno de los volúmenes más altos de toda la selección de property managers de la isla. Basada en Pollença, opera principalmente en el norte de Mallorca con foco en villas y propiedades de segunda residencia. El alto volumen de reseñas para este sector sugiere una operación consolidada — aunque recomendamos confirmar el alcance exacto de los servicios antes de contratar.",
      en: "Home Villas 360 has 371 Google reviews at 4.7 stars — one of the highest volumes among property managers on the island. Based in Pollença and operating mainly across northern Mallorca, they focus on villas and second-home properties. The review volume for this sector is unusually high, suggesting a well-established operation — though we recommend confirming the exact scope of services before hiring.",
      de: "Home Villas 360 hat 371 Google-Bewertungen bei 4,7 Sternen — eines der höchsten Volumen unter Property Managern auf der Insel. Mit Sitz in Pollença und Schwerpunkt im Norden Mallorcas betreuen sie hauptsächlich Villen und Zweitwohnsitze. Das Bewertungsvolumen ist für diesen Sektor ungewöhnlich hoch und deutet auf eine etablierte Operation hin — wir empfehlen jedoch, den genauen Leistungsumfang vor der Beauftragung zu bestätigen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: propertyManagersPreview,
    googlePlaceId: "ChIJkz2Eh5OSlxIRc8KLsl9yJ7k",
    slug: "limpiezas-munar-fullana",
    verticalSlug: "property-managers-mallorca",
    location: "Palma",
    focus: {
      es: "limpieza, mantenimiento y servicios operativos para propiedades",
      en: "cleaning, maintenance and operational property services",
      de: "Reinigung, Wartung und operative Immobilienservices"
    },
    specialties: {
      es: ["Limpieza", "Mantenimiento", "Servicios para villas", "Apoyo operativo"],
      en: ["Cleaning", "Maintenance", "Villa services", "Operational support"],
      de: ["Reinigung", "Wartung", "Villenservices", "Operative Unterstützung"]
    },
    clientTypes: propertyManagerClientTypes,
    note: {
      es: "fit parcial dentro de property management por limpieza y mantenimiento; no presentar como gestor integral.",
      en: "partial property-management fit through cleaning and maintenance; do not present as full-service management.",
      de: "Teilweise passend durch Reinigung und Wartung; nicht als vollständige Immobilienverwaltung darstellen."
    },
    editorialNote: {
      es: "Limpiezas Munar Fullana tiene 372 reseñas en Google con una valoración de 4.8 — un volumen excepcional para una empresa de servicios operativos. Aunque no es un gestor integral de propiedades, cubre limpieza, mantenimiento y servicios para villas, lo que la convierte en un apoyo operativo valioso para propietarios no residentes que necesitan mantener su propiedad en perfecto estado entre estancias.",
      en: "Limpiezas Munar Fullana has 372 Google reviews at 4.8 stars — an exceptional volume for an operational services company. While not a full property manager, they cover cleaning, maintenance and villa services, making them a valuable operational support for non-resident owners who need to keep their property in perfect condition between stays.",
      de: "Limpiezas Munar Fullana hat 372 Google-Bewertungen bei 4,8 Sternen — ein außergewöhnliches Volumen für ein operatives Dienstleistungsunternehmen. Obwohl kein vollständiger Immobilienverwalter, decken sie Reinigung, Wartung und Villenservices ab und sind damit eine wertvolle operative Unterstützung für Nicht-Residenten, die ihre Immobilie zwischen Aufenthalten in einwandfreiem Zustand halten möchten."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: propertyManagersPreview,
    googlePlaceId: "ChIJJxK4oqDWlxIRRr12ldarZ7Y",
    slug: "pollentia-properties-mallorca",
    verticalSlug: "property-managers-mallorca",
    location: "Pollença",
    focus: {
      es: "propiedades, gestión y servicios para propietarios en el norte de Mallorca",
      en: "properties, management and owner services in northern Mallorca",
      de: "Immobilien, Verwaltung und Eigentümer-Services im Norden Mallorcas"
    },
    specialties: propertyManagementSpecialties,
    clientTypes: propertyManagerClientTypes,
    areasServed: ["Pollença", "Norte de Mallorca", "Mallorca"],
    editorialNote: {
      es: "Pollentia Properties Mallorca opera desde Pollença cubriendo el norte de la isla, con un perfil que combina gestión de propiedades y servicios para propietarios. El nombre evoca Pollentia, la antigua ciudad romana de Alcúdia — un guiño al arraigo en la zona que puede ser relevante para propietarios en Puerto Pollença, Alcúdia y alrededores.",
      en: "Pollentia Properties Mallorca operates from Pollença covering the north of the island, with a profile combining property management and owner services. The name references Pollentia, the ancient Roman city of Alcúdia — a nod to local roots that may be relevant for property owners in Puerto Pollença, Alcúdia and surrounding areas.",
      de: "Pollentia Properties Mallorca arbeitet von Pollença aus und deckt den Norden der Insel ab, mit einem Profil, das Immobilienverwaltung und Eigentümerservices kombiniert. Der Name verweist auf Pollentia, die antike römische Stadt von Alcúdia — eine Anspielung auf lokale Verwurzelung, die für Eigentümer in Puerto Pollença, Alcúdia und Umgebung relevant sein kann."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: propertyManagersPreview,
    googlePlaceId: "ChIJMemsumgtlhIR4zynHsJdPJE",
    slug: "emerald-stay-mallorca",
    verticalSlug: "property-managers-mallorca",
    location: "Alcúdia",
    focus: {
      es: "alquiler, alojamiento y gestión operativa de estancias",
      en: "rental accommodation and operational stay management",
      de: "Vermietung, Unterkunft und operative Aufenthaltsverwaltung"
    },
    specialties: propertyManagementSpecialties,
    clientTypes: propertyManagerClientTypes,
    areasServed: ["Alcúdia", "Norte de Mallorca", "Mallorca"],
    editorialNote: {
      es: "Emerald Stay Mallorca gestiona alojamientos y estancias en Alcúdia, en el norte de la isla. El enfoque en rental y gestión operativa de estancias la convierte en una opción práctica para propietarios que quieren poner su propiedad en alquiler turístico con gestión profesional sin tener que coordinarlo desde fuera.",
      en: "Emerald Stay Mallorca manages accommodation and stays in Alcúdia in the north of the island. The focus on rentals and operational stay management makes them a practical option for property owners who want to put their home into tourist rental with professional management without having to coordinate it from outside Mallorca.",
      de: "Emerald Stay Mallorca verwaltet Unterkünfte und Aufenthalte in Alcúdia im Norden der Insel. Der Fokus auf Vermietung und operative Aufenthaltsverwaltung macht sie zu einer praktischen Option für Eigentümer, die ihre Immobilie in die Ferienvermietung mit professionellem Management geben möchten, ohne dies von außerhalb Mallorcas koordinieren zu müssen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: propertyManagersPreview,
    googlePlaceId: "ChIJqy7MAR6TlxIRAdrGNrtJeo8",
    slug: "keystone-yachts-real-estate-mallorca",
    verticalSlug: "property-managers-mallorca",
    location: "Palma",
    focus: {
      es: "real estate, servicios premium y apoyo a propietarios internacionales",
      en: "real estate, premium services and support for international owners",
      de: "Immobilien, Premium-Services und Unterstützung für internationale Eigentümer"
    },
    specialties: propertyManagementSpecialties,
    clientTypes: propertyManagerClientTypes,
    note: {
      es: "confirmar alcance residencial de property management antes de ampliar ficha.",
      en: "confirm residential property-management scope before expanding the profile.",
      de: "Umfang der Wohnimmobilienverwaltung vor Ausbau des Profils prüfen."
    },
    editorialNote: {
      es: "Keystone Yachts Real Estate combina servicios de real estate y apoyo a propietarios internacionales desde Palma, con un perfil premium que sugiere orientación a clientes de alto poder adquisitivo. El nombre evoca náutica y lifestyle — un posicionamiento interesante para propietarios que buscan gestión con un nivel de servicio más elevado.",
      en: "Keystone Yachts Real Estate combines real estate services and support for international owners from Palma, with a premium profile suggesting an orientation towards high-net-worth clients. The name evokes nautical lifestyle — an interesting positioning for property owners looking for management at a higher service level.",
      de: "Keystone Yachts Real Estate kombiniert Immobiliendienstleistungen und Unterstützung für internationale Eigentümer von Palma aus, mit einem Premium-Profil, das eine Ausrichtung auf vermögende Kunden andeutet. Der Name evoziert nautischen Lifestyle — eine interessante Positionierung für Eigentümer, die Verwaltung auf höherem Serviceniveau suchen."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: propertyManagersPreview,
    googlePlaceId: "ChIJzakBNTvVlxIRhAnt-PYxXlc",
    slug: "parasol-property-mallorca",
    verticalSlug: "property-managers-mallorca",
    location: "Binissalem",
    focus: {
      es: "servicios inmobiliarios y apoyo a propietarios en el interior de Mallorca",
      en: "property services and owner support in inland Mallorca",
      de: "Immobiliendienstleistungen und Eigentümerbetreuung im Inselinneren"
    },
    specialties: propertyManagementSpecialties,
    clientTypes: propertyManagerClientTypes,
    areasServed: ["Binissalem", "Interior de Mallorca", "Mallorca"],
    editorialNote: {
      es: "Parasol Property Mallorca opera desde Binissalem cubriendo el interior de la isla — una zona menos servida por property managers pero con creciente interés de propietarios que buscan casas de campo, fincas y segundas residencias alejadas de la costa. Una opción a tener en cuenta para propietarios en el interior que encuentran pocas alternativas verificadas.",
      en: "Parasol Property Mallorca operates from Binissalem covering the island interior — an area less served by property managers but with growing interest from owners looking for country homes, fincas and second residences away from the coast. An option worth considering for interior property owners who find few verified alternatives.",
      de: "Parasol Property Mallorca arbeitet von Binissalem aus und deckt das Inselinnere ab — ein Gebiet, das von Property Managern weniger versorgt wird, aber wachsendes Interesse von Eigentümern anzieht, die Landhäuser, Fincas und Zweitwohnsitze abseits der Küste suchen. Eine erwähnenswerte Option für Eigentümer im Inselinneren, die wenige verifizierte Alternativen finden."
    }
  }),
  makeApprovedPreviewProfile({
    candidates: propertyManagersPreview,
    googlePlaceId: "ChIJuQcj7E2SlxIR1Gk0bM964IU",
    slug: "mallorca-collection",
    verticalSlug: "property-managers-mallorca",
    location: "Palma",
    languages: ["English", "Español"],
    focus: {
      es: "gestión, alquiler y servicios para propiedades de perfil internacional",
      en: "management, rentals and services for internationally focused properties",
      de: "Verwaltung, Vermietung und Services für international ausgerichtete Immobilien"
    },
    specialties: propertyManagementSpecialties,
    clientTypes: propertyManagerClientTypes,
    editorialNote: {
      es: "Mallorca Collection trabaja en inglés y español desde Palma, con un perfil centrado en gestión, alquiler y servicios para propiedades de perfil internacional. El nombre y el idioma prioritario en inglés señalan claramente su audiencia objetivo: propietarios extranjeros que necesitan gestión profesional bilingüe para propiedades en la isla.",
      en: "Mallorca Collection operates in English and Spanish from Palma, focused on management, rentals and services for internationally oriented properties. The name and primary English language signal clearly their target audience: foreign property owners who need professional bilingual management for their properties on the island.",
      de: "Mallorca Collection arbeitet auf Englisch und Spanisch von Palma aus, mit Schwerpunkt auf Verwaltung, Vermietung und Services für international ausgerichtete Immobilien. Der Name und der englische Sprachschwerpunkt signalisieren klar ihre Zielgruppe: ausländische Eigentümer, die professionelle zweisprachige Verwaltung für ihre Immobilien auf der Insel benötigen."
    }
  })
];


export const expertProfiles: ExpertProfile[] = [
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJgc0-liKTlxIReOJYYUBEEVg",
    slug: "gestoria-portol",
    name: "Gestoría Pòrtol",
    location: "Palma",
    address: "Gran Via Asima, 15, 1º Izquierda, Nord, 07009 Polígon industrial de Son Castelló, Illes Balears",
    phone: "+34 971 90 80 95",
    website: "https://www.gestoriaportol.com/",
    googleMapsUrl: "https://maps.google.com/?cid=6345928393243550328&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.9,
    reviewsCount: 1989,
    focus: {
      es: "gestión administrativa, fiscal y contable para residentes y negocios",
      en: "administrative, tax and accounting support for residents and businesses",
      de: "Verwaltungs-, Steuer- und Buchhaltungsfragen für Residenten und Unternehmen"
    },
    specialties: {
      es: ["Gestoría", "Fiscalidad", "Contabilidad", "Trámites administrativos"],
      en: ["Gestoria services", "Tax advisory", "Accounting", "Administrative paperwork"],
      de: ["Gestoría-Service", "Steuerberatung", "Buchhaltung", "Behördengänge"]
    },
    editorialNote: {
      es: "Gestoría Pòrtol es la gestoría más valorada de Mallorca en Google, con casi 2.000 reseñas que reflejan décadas de trabajo con particulares, empresas y residentes internacionales. Cubre fiscalidad, contabilidad, trámites administrativos y relaciones con la Seguridad Social desde su sede en Palma. Una opción sólida para expats que necesitan gestión fiscal y administrativa en un solo punto.",
      en: "Gestoría Pòrtol is the highest-rated gestoría in Mallorca on Google, with nearly 2,000 reviews built over decades of work with individuals, companies and international residents. They cover tax, accounting, administrative paperwork and Social Security procedures from their office in Palma. A solid starting point for expats who want tax and admin management handled in one place.",
      de: "Gestoría Pòrtol ist die am besten bewertete Gestoría auf Mallorca bei Google, mit fast 2.000 Bewertungen aus jahrzehntelanger Arbeit mit Privatpersonen, Unternehmen und internationalen Residenten. Sie decken Steuern, Buchhaltung, Behördengänge und Sozialversicherungsfragen von ihrem Büro in Palma ab. Eine solide erste Anlaufstelle für Expats, die Steuer- und Verwaltungsaufgaben an einer Stelle bündeln möchten."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJOx6zWSeTlxIRH5UwoNQrapc",
    slug: "abogados-5-0",
    name: "Abogados 5.0",
    location: "Palma",
    address: "Carrer de les Parellades, 12A, 2°, Despacho 34, Centre, 07003 Palma, Illes Balears",
    phone: "+34 663 93 82 64",
    website: "https://www.abogados50.com/",
    googleMapsUrl: "https://maps.google.com/?cid=10910581239479047455&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.9,
    reviewsCount: 1090,
    focus: {
      es: "asesoramiento legal general con fuerte reputación pública en Palma",
      en: "general legal advice with strong public reputation in Palma",
      de: "allgemeine Rechtsberatung mit starker öffentlicher Reputation in Palma"
    },
    specialties: {
      es: ["Asesoramiento legal", "Extranjería", "Derecho civil", "Trámites legales"],
      en: ["Legal advice", "Immigration", "Civil law", "Legal paperwork"],
      de: ["Rechtsberatung", "Einwanderungsrecht", "Zivilrecht", "Rechtliche Formalitäten"]
    },
    editorialNote: {
      es: "Abogados 5.0 acumula más de mil reseñas en Google con una valoración de 4.9, lo que lo convierte en uno de los despachos más consultados de Palma. El nombre refleja una apuesta por la modernización del sector: atención ágil, comunicación clara y presencia online fuerte. Especialmente popular entre residentes e inmigrantes que buscan asesoría en extranjería, derecho civil o laboral.",
      en: "Abogados 5.0 has over a thousand Google reviews at 4.9 stars, making it one of the most consulted law firms in Palma. The name reflects a deliberate push towards a more modern, responsive legal practice: clear communication and a strong online presence. Particularly popular with residents and international clients looking for immigration, civil or employment advice.",
      de: "Abogados 5.0 hat über tausend Google-Bewertungen bei 4,9 Sternen und gehört damit zu den meistgefragten Kanzleien in Palma. Der Name steht für einen bewussten Modernisierungskurs: klare Kommunikation, schnelle Reaktionszeiten und starke Online-Präsenz. Besonders gefragt bei Residenten und internationalen Kunden für Einwanderungs-, Zivil- und Arbeitsrecht."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJSQCKLN1JlhIRj7cfzkpk02Y",
    slug: "abogados-extranjeria-oliver-chadid",
    name: "Abogados Extranjería Oliver Chadid",
    location: "Manacor",
    address: "Avinguda d'es Torrent, 8, 07500 Manacor, Illes Balears",
    phone: "+34 666 57 19 57",
    website: "https://oliverchadid.com/",
    googleMapsUrl: "https://maps.google.com/?cid=7409376084403140495&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.9,
    reviewsCount: 341,
    languages: ["Español", "English", "العربية"],
    focus: {
      es: "extranjería y trámites legales para residentes internacionales",
      en: "immigration and legal paperwork for international residents",
      de: "Einwanderungsrecht und rechtliche Formalitäten für internationale Residenten"
    },
    specialties: {
      es: ["Extranjería", "Residencia", "Nacionalidad", "Trámites para extranjeros"],
      en: ["Immigration", "Residency", "Nationality", "Foreign resident paperwork"],
      de: ["Einwanderungsrecht", "Aufenthalt", "Staatsangehörigkeit", "Formalitäten für Ausländer"]
    },
    areasServed: ["Manacor", "Mallorca"],
    editorialNote: {
      es: "Oliver Chadid está especializado en extranjería y trámites de residencia para no residentes, con una clientela que incluye hablantes de árabe, español e inglés. Con 341 reseñas y una valoración de 4.9 en Manacor, es una referencia clara para residentes internacionales del este y centro de la isla. El perfil multilingüe del despacho lo diferencia de la mayoría.",
      en: "Oliver Chadid specialises in immigration and residency paperwork for non-residents, with a client base that includes Arabic, Spanish and English speakers. With 341 reviews at 4.9 stars based in Manacor, it is a clear reference for international residents in the east and centre of the island. The firm's multilingual reach sets it apart from most local alternatives.",
      de: "Oliver Chadid ist auf Einwanderungsrecht und Aufenthaltsfragen für Nicht-Residenten spezialisiert, mit einer Mandantschaft aus Arabisch-, Spanisch- und Englischsprechern. Mit 341 Bewertungen und 4,9 Sternen in Manacor ist die Kanzlei ein klarer Anlaufpunkt für internationale Residenten im Osten und der Mitte der Insel. Der mehrsprachige Ansatz hebt sie von den meisten lokalen Alternativen ab."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJZ2V_9VySlxIRB7sOcvwXHPo",
    slug: "castell-abogados",
    status: "candidate",
    name: "Castell Abogados",
    location: "Palma",
    address: "Carrer del General Riera, 1, 3º D, Norte, 07003 Palma, Illes Balears",
    phone: "+34 684 45 04 50",
    website: "https://www.castellabogados.com/",
    googleMapsUrl: "https://maps.google.com/?cid=18022306181842647815&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.7,
    reviewsCount: 333,
    focus: {
      es: "asesoramiento legal para particulares, residentes y empresas",
      en: "legal advice for individuals, residents and companies",
      de: "Rechtsberatung für Privatpersonen, Residenten und Unternehmen"
    },
    specialties: {
      es: ["Asesoramiento legal", "Derecho civil", "Derecho mercantil", "Trámites legales"],
      en: ["Legal advice", "Civil law", "Commercial law", "Legal paperwork"],
      de: ["Rechtsberatung", "Zivilrecht", "Handelsrecht", "Rechtliche Formalitäten"]
    },
    editorialNote: {
      es: "Castell Abogados acumula 333 reseñas en Google con una valoración de 4.7, cifras sólidas para un despacho de Palma especializado en derecho civil y mercantil. El volumen de opiniones refleja una base de clientes estable y recurrente — una señal positiva para quienes buscan asesoramiento legal general en la isla.",
      en: "Castell Abogados has 333 Google reviews at 4.7 stars — solid figures for a Palma firm specialising in civil and commercial law. The review volume reflects a stable, recurring client base, a positive signal for those looking for general legal advice on the island.",
      de: "Castell Abogados hat 333 Google-Bewertungen bei 4,7 Sternen — solide Zahlen für eine Palma-Kanzlei, die auf Zivil- und Handelsrecht spezialisiert ist. Das Bewertungsvolumen spiegelt eine stabile, wiederkehrende Mandantschaft wider — ein positives Signal für alle, die allgemeine Rechtsberatung auf der Insel suchen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJp7l5-gSTlxIRgJlKOrjb9HA",
    slug: "de-prada-moya-abogados",
    name: "DE PRADA & MOYA Abogados",
    location: "Palma",
    address: "C. del Cardenal Rossell, 15, A, Platja de Palma i Pla de Sant Jordi, 07007 Coll den Rabassa, Illes Balears",
    phone: "+34 638 30 70 85",
    website: "http://www.depradamoya-realestate.com/",
    googleMapsUrl: "https://maps.google.com/?cid=8139372010863761792&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.9,
    reviewsCount: 258,
    focus: {
      es: "derecho inmobiliario y compraventa de propiedades en Mallorca",
      en: "real estate law and property purchase in Mallorca",
      de: "Immobilienrecht und Immobilienkauf auf Mallorca"
    },
    specialties: {
      es: ["Derecho inmobiliario", "Compraventa", "Real estate", "Asesoramiento legal"],
      en: ["Real estate law", "Property purchase", "Conveyancing", "Legal advice"],
      de: ["Immobilienrecht", "Immobilienkauf", "Kaufabwicklung", "Rechtsberatung"]
    },
    editorialNote: {
      es: "DE PRADA & MOYA está especializado en derecho inmobiliario y compraventa de propiedades en Mallorca, con 258 reseñas y una valoración de 4.9. El perfil combina asesoramiento legal con operaciones de real estate, lo que lo hace relevante para compradores internacionales que buscan acompañamiento jurídico en todo el proceso de adquisición.",
      en: "DE PRADA & MOYA specialises in real estate law and property transactions in Mallorca, with 258 reviews at 4.9 stars. The firm combines legal advice with property operations, making it relevant for international buyers who want legal support throughout the acquisition process.",
      de: "DE PRADA & MOYA ist auf Immobilienrecht und Immobilientransaktionen auf Mallorca spezialisiert, mit 258 Bewertungen bei 4,9 Sternen. Die Kanzlei kombiniert Rechtsberatung mit Immobilienoperationen — besonders relevant für internationale Käufer, die rechtliche Begleitung während des gesamten Kaufprozesses suchen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJr3sqPVGSlxIRzoUwzi1d7vk",
    slug: "sierra-abogados-inversiones",
    status: "candidate",
    name: "Sierra Abogados & Inversiones",
    location: "Palma",
    address: "C, Costa de Can Muntaner, nº 6, 3º, Centre, 07003 Palma, Illes Balears",
    phone: "+34 971 72 28 60",
    website: "https://www.sierraabogados.es/",
    googleMapsUrl: "https://maps.google.com/?cid=18009434411215390158&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.9,
    reviewsCount: 213,
    focus: {
      es: "asesoramiento legal vinculado a inversiones y operaciones patrimoniales",
      en: "legal advice connected to investments and asset-related matters",
      de: "Rechtsberatung rund um Investitionen und Vermögensfragen"
    },
    specialties: {
      es: ["Inversiones", "Asesoramiento legal", "Patrimonio", "Derecho inmobiliario"],
      en: ["Investments", "Legal advice", "Assets", "Real estate law"],
      de: ["Investitionen", "Rechtsberatung", "Vermögen", "Immobilienrecht"]
    },
    editorialNote: {
      es: "Sierra Abogados & Inversiones suma 213 reseñas con una valoración de 4.9, especializado en asesoramiento legal vinculado a inversiones y patrimonio. El perfil encaja especialmente bien para clientes con operaciones inmobiliarias complejas o intereses patrimoniales en Mallorca que requieren asesoría legal integrada.",
      en: "Sierra Abogados & Inversiones has 213 reviews at 4.9 stars, specialising in legal advice tied to investments and asset matters. The profile is particularly relevant for clients with complex property transactions or wealth interests in Mallorca who need integrated legal support.",
      de: "Sierra Abogados & Inversiones hat 213 Bewertungen bei 4,9 Sternen und ist auf Rechtsberatung rund um Investitionen und Vermögensfragen spezialisiert. Das Profil passt besonders gut für Mandanten mit komplexen Immobilientransaktionen oder Vermögensinteressen auf Mallorca, die integrierte Rechtsberatung benötigen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJkwRRPumSlxIRvI572Ga0Qus",
    slug: "plattesgroup",
    name: "PlattesGroup SL",
    location: "Palma",
    address: "Camí dels Reis, 308, Edificio 3A, 2°, Norte, 07010 Palma, Illes Balears",
    phone: "+34 971 67 94 18",
    website: "https://www.plattes.net/",
    googleMapsUrl: "https://maps.google.com/?cid=16952310301187608252&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.7,
    reviewsCount: 185,
    languages: ["Deutsch", "English", "Español"],
    focus: {
      es: "asesoría fiscal, patrimonial y de gestión para residentes internacionales",
      en: "tax, wealth and management advice for international residents",
      de: "Steuer-, Vermögens- und Managementberatung für internationale Residenten"
    },
    specialties: {
      es: ["Fiscalidad internacional", "Gestión patrimonial", "Asesoría para expats", "Consultoría"],
      en: ["International tax", "Wealth management", "Expat advisory", "Consulting"],
      de: ["Internationale Steuern", "Vermögensverwaltung", "Expat-Beratung", "Consulting"]
    },
    editorialNote: {
      es: "PlattesGroup es una de las pocas asesorías de Mallorca que opera en alemán, inglés y español, con 185 reseñas y valoración de 4.7. Se enfoca en fiscalidad internacional y gestión patrimonial para expats y residentes internacionales — un perfil poco común que lo diferencia claramente de los despachos locales generalistas.",
      en: "PlattesGroup is one of the few firms in Mallorca operating in German, English and Spanish, with 185 reviews at 4.7 stars. They focus on international tax and wealth management for expats and international residents — a niche profile that sets them clearly apart from generalist local firms.",
      de: "PlattesGroup ist eine der wenigen Kanzleien auf Mallorca, die auf Deutsch, Englisch und Spanisch arbeitet — mit 185 Bewertungen bei 4,7 Sternen. Der Schwerpunkt liegt auf internationaler Steuerberatung und Vermögensverwaltung für Expats und internationale Residenten — ein Nischenprofil, das sie klar von generalistischen Lokalkanzleien abhebt."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJj0-e5FuSlxIRV9GWtHdAhBM",
    slug: "gestoria-emprendix",
    name: "Gestoría Emprendix",
    location: "Palma",
    address: "Carrer de Sant Miquel, 30, 5ºA, Centre, 07002 Palma, Illes Balears",
    phone: "+34 871 95 20 75",
    website: "https://emprendix.com/",
    googleMapsUrl: "https://maps.google.com/?cid=1406319866521506135&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.8,
    reviewsCount: 176,
    focus: {
      es: "gestoría, trámites fiscales y apoyo administrativo para negocios",
      en: "gestoria services, tax paperwork and administrative support for businesses",
      de: "Gestoría-Service, Steuerformalitäten und administrative Unterstützung für Unternehmen"
    },
    specialties: {
      es: ["Gestoría", "Fiscalidad", "Autónomos y empresas", "Trámites administrativos"],
      en: ["Gestoria services", "Tax advisory", "Self-employed and companies", "Administrative paperwork"],
      de: ["Gestoría-Service", "Steuern", "Selbstständige und Unternehmen", "Behördengänge"]
    },
    editorialNote: {
      es: "Gestoría Emprendix tiene 176 reseñas en Google con una valoración de 4.8, orientada especialmente a autónomos y pequeñas empresas en Palma. La combinación de gestoría, fiscalidad y trámites administrativos en un solo punto la convierte en una opción práctica para emprendedores o freelancers que se instalan en la isla.",
      en: "Gestoría Emprendix has 176 Google reviews at 4.8 stars, focused especially on the self-employed and small businesses in Palma. Combining gestoria services, tax and administrative paperwork under one roof makes them a practical option for entrepreneurs or freelancers setting up in Mallorca.",
      de: "Gestoría Emprendix hat 176 Google-Bewertungen bei 4,8 Sternen und richtet sich besonders an Selbstständige und kleine Unternehmen in Palma. Die Kombination aus Gestoría-Service, Steuern und Behördengängen unter einem Dach macht sie zu einer praktischen Wahl für Unternehmer oder Freiberufler, die sich auf Mallorca niederlassen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJU1ZY5VOSlxIROBVyTmQ9JkY",
    slug: "abogadas-olmos",
    name: "Abogadas Olmos",
    location: "Palma",
    address: "Carrer del Bisbe Perelló, nº1, 5ºB, Centre, 07002 Palma, Illes Balears",
    phone: "+34 971 72 52 38",
    website: "http://abogadasolmos.com/",
    googleMapsUrl: "https://maps.google.com/?cid=5054795132792083768&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.8,
    reviewsCount: 116,
    focus: {
      es: "asesoramiento legal para particulares y residentes en Palma",
      en: "legal advice for individuals and residents in Palma",
      de: "Rechtsberatung für Privatpersonen und Residenten in Palma"
    },
    specialties: {
      es: ["Asesoramiento legal", "Derecho civil", "Trámites legales", "Consultas jurídicas"],
      en: ["Legal advice", "Civil law", "Legal paperwork", "Legal consultations"],
      de: ["Rechtsberatung", "Zivilrecht", "Rechtliche Formalitäten", "Juristische Beratung"]
    },
    editorialNote: {
      es: "Abogadas Olmos cuenta con 116 reseñas en Google con una valoración de 4.8, despacho de derecho civil en el centro de Palma. El nombre refleja una práctica liderada por mujeres abogadas, lo que resulta relevante para clientes que prefieren ese perfil para asuntos de familia, herencias o cuestiones personales.",
      en: "Abogadas Olmos has 116 Google reviews at 4.8 stars, a civil law practice in central Palma. The name reflects a woman-led firm — relevant for clients who prefer that profile for family matters, inheritance or personal legal issues.",
      de: "Abogadas Olmos hat 116 Google-Bewertungen bei 4,8 Sternen — eine auf Zivilrecht spezialisierte Kanzlei im Zentrum von Palma. Der Name spiegelt eine von Frauen geführte Praxis wider, was für Mandanten relevant sein kann, die dieses Profil für Familienrecht, Erbschaften oder persönliche Rechtsangelegenheiten bevorzugen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJaQ0UiFuTlxIRG8QNc_rr1Uk",
    slug: "natalia-rios-servicios-juridicos",
    status: "candidate",
    name: "Natalia Rios Servicios Jurídicos",
    location: "Palma",
    address: "Carrer de Josep Anselm Clavé, 8, Piso 6to 4a, Centre, 07002 Palma, Illes Balears",
    phone: "+34 640 15 60 86",
    website: "http://www.nataliarios.es/",
    googleMapsUrl: "https://maps.google.com/?cid=5320417995712742427&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.9,
    reviewsCount: 113,
    focus: {
      es: "servicios jurídicos para particulares y residentes internacionales",
      en: "legal services for individuals and international residents",
      de: "juristische Dienstleistungen für Privatpersonen und internationale Residenten"
    },
    specialties: {
      es: ["Servicios jurídicos", "Asesoramiento legal", "Derecho civil", "Trámites legales"],
      en: ["Legal services", "Legal advice", "Civil law", "Legal paperwork"],
      de: ["Juristische Dienstleistungen", "Rechtsberatung", "Zivilrecht", "Rechtliche Formalitäten"]
    },
    editorialNote: {
      es: "Natalia Rios Servicios Jurídicos suma 113 reseñas con una valoración de 4.9 desde el centro de Palma. El perfil unipersonal con alta valoración es una señal de atención directa y trato personalizado — relevante para residentes internacionales que prefieren trabajar con un único abogado de referencia en lugar de un despacho colectivo.",
      en: "Natalia Rios Servicios Jurídicos has 113 reviews at 4.9 stars, based in central Palma. A solo practice with a high rating is a signal of direct, personalised attention — relevant for international residents who prefer working with a single, consistent lawyer rather than a collective firm.",
      de: "Natalia Rios Servicios Jurídicos hat 113 Bewertungen bei 4,9 Sternen im Zentrum von Palma. Eine Einzelpraxis mit hoher Bewertung ist ein Signal für direkte, persönliche Betreuung — relevant für internationale Residenten, die lieber mit einem einzigen, konstanten Anwalt zusammenarbeiten als mit einer Gemeinschaftskanzlei."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJqRKUAlOSlxIRWSiKMui56xo",
    slug: "bufete-ferrer",
    name: "Bufete Ferrer",
    location: "Palma",
    address: "Carrer Del Sindicat, 69, 6B, Centre, 07002 Palma, Illes Balears",
    phone: "+34 971 22 93 39",
    website: "https://bufeteferrerabogados.es/",
    googleMapsUrl: "https://maps.google.com/?cid=1939848471444596825&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.9,
    reviewsCount: 103,
    focus: {
      es: "asesoramiento legal y fiscal para residentes y extranjeros",
      en: "legal and tax advice for residents and foreign clients",
      de: "Rechts- und Steuerberatung für Residenten und ausländische Mandanten"
    },
    specialties: {
      es: ["Fiscalidad", "Asesoramiento legal", "Extranjería", "Trámites legales"],
      en: ["Tax advisory", "Legal advice", "Immigration", "Legal paperwork"],
      de: ["Steuerberatung", "Rechtsberatung", "Einwanderungsrecht", "Rechtliche Formalitäten"]
    },
    editorialNote: {
      es: "Bufete Ferrer tiene 103 reseñas con valoración de 4.9 en el centro de Palma, cubriendo fiscalidad, extranjería y asesoramiento legal general. La combinación de fiscal y extranjería en un solo despacho es especialmente útil para expatriados que necesitan gestionar a la vez su situación fiscal y su estatus de residencia.",
      en: "Bufete Ferrer has 103 reviews at 4.9 stars in central Palma, covering tax, immigration and general legal advice. The combination of tax and immigration under one firm is especially useful for expats who need to manage their tax situation and residency status at the same time.",
      de: "Bufete Ferrer hat 103 Bewertungen bei 4,9 Sternen im Zentrum von Palma und deckt Steuern, Einwanderungsrecht und allgemeine Rechtsberatung ab. Die Kombination aus Steuer- und Einwanderungsrecht in einer Kanzlei ist besonders nützlich für Expats, die gleichzeitig ihre Steuersituation und ihren Aufenthaltsstatus regeln müssen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJq0HPsxDFlxIRV148cKiIXPI",
    slug: "jaume-perello-abogados",
    name: "Jaume Perelló Abogados",
    location: "Inca",
    address: "Plaça Santa Maria la Major, 12, 07300 Inca, Illes Balears",
    phone: "+34 663 87 95 39",
    website: "https://jperelloabogados.com/",
    googleMapsUrl: "https://maps.google.com/?cid=17463983712054828631&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.9,
    reviewsCount: 95,
    focus: {
      es: "asesoramiento legal en Inca e interior de Mallorca",
      en: "legal advice in Inca and inland Mallorca",
      de: "Rechtsberatung in Inca und im Inselinneren Mallorcas"
    },
    specialties: {
      es: ["Asesoramiento legal", "Derecho civil", "Trámites legales", "Interior de Mallorca"],
      en: ["Legal advice", "Civil law", "Legal paperwork", "Inland Mallorca"],
      de: ["Rechtsberatung", "Zivilrecht", "Rechtliche Formalitäten", "Inselinneres Mallorca"]
    },
    areasServed: ["Inca", "Interior de Mallorca", "Mallorca"],
    editorialNote: {
      es: "Jaume Perelló Abogados tiene 95 reseñas con valoración de 4.9 en Inca, cubriendo el interior y centro de Mallorca. Es una de las pocas opciones bien valoradas fuera del área metropolitana de Palma, relevante para propietarios o residentes en la zona de Inca, Binissalem o Sineu que prefieren asesoramiento legal de proximidad.",
      en: "Jaume Perelló Abogados has 95 reviews at 4.9 stars in Inca, covering inland and central Mallorca. It is one of the few well-rated options outside the Palma metropolitan area — relevant for property owners or residents in the Inca, Binissalem or Sineu area who prefer local legal advice.",
      de: "Jaume Perelló Abogados hat 95 Bewertungen bei 4,9 Sternen in Inca und deckt das Inselinnere und den Norden Mallorcas ab. Es ist eine der wenigen gut bewerteten Optionen außerhalb des Stadtgebiets von Palma — relevant für Eigentümer oder Residenten im Raum Inca, Binissalem oder Sineu, die lokale Rechtsberatung bevorzugen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJi0zAPESTlxIRC-xdTnhMBEE",
    slug: "nicolas-sosa-abogado-lawyer-rechtsanwalt",
    name: "Nicolas Sosa Abogado Lawyer Rechtsanwalt",
    location: "Palma",
    address: "La Rambla, 26, Piso 1, Centre, 07003 Palma, Illes Balears",
    phone: "+34 687 12 35 87",
    website: "https://nsabogado.com/",
    googleMapsUrl: "https://maps.google.com/?cid=4684953591966723083&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 5,
    reviewsCount: 83,
    languages: ["Español", "English", "Deutsch"],
    focus: {
      es: "asesoramiento legal multilingüe en español, inglés y alemán",
      en: "multilingual legal advice in Spanish, English and German",
      de: "mehrsprachige Rechtsberatung auf Spanisch, Englisch und Deutsch"
    },
    specialties: {
      es: ["Asesoramiento legal", "Servicios multilingües", "Derecho civil", "Clientes internacionales"],
      en: ["Legal advice", "Multilingual service", "Civil law", "International clients"],
      de: ["Rechtsberatung", "Mehrsprachiger Service", "Zivilrecht", "Internationale Mandanten"]
    },
    editorialNote: {
      es: "Nicolas Sosa es un abogado trilingüe que trabaja en español, inglés y alemán desde La Rambla de Palma, con 83 reseñas y valoración perfecta de 5 estrellas. La combinación de idiomas lo hace especialmente relevante para residentes alemanes, británicos o latinoamericanos que necesitan asesoramiento legal fiable. Su nombre explícitamente trilingüe en Google es ya una señal clara de a quién sirve.",
      en: "Nicolas Sosa is a trilingual lawyer working in Spanish, English and German from La Rambla in Palma, with 83 reviews at a perfect 5 stars. The language combination makes him especially relevant for German, British or Latin American residents who need reliable legal advice on the island. His explicitly trilingual Google listing is itself a clear signal of who he serves.",
      de: "Nicolas Sosa ist ein dreisprachiger Anwalt, der von der Rambla in Palma auf Spanisch, Englisch und Deutsch arbeitet — mit 83 Bewertungen und einer perfekten 5-Sterne-Note. Die Sprachkombination macht ihn besonders relevant für deutsche, britische oder lateinamerikanische Residenten, die auf der Insel zuverlässige Rechtsberatung suchen. Sein explizit dreisprachiger Google-Eintrag ist selbst ein klares Signal, wen er bedient."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJzaYKP1eSlxIRKFqwRj_934k",
    slug: "antonia-perello-company",
    status: "candidate",
    name: "Antonia Perelló Company",
    location: "Palma",
    address: "Carrer de Cecili Metel, 11, Centre, 07003 Palma, Illes Balears",
    phone: "+34 971 72 20 78",
    website: "https://www.perelloabogados.com/",
    googleMapsUrl: "https://maps.google.com/?cid=9934937751213333032&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 5,
    reviewsCount: 76,
    focus: {
      es: "herencias, patrimonio y asesoramiento legal familiar",
      en: "inheritance, estate and family-related legal advice",
      de: "Erbschaft, Vermögen und familienbezogene Rechtsberatung"
    },
    specialties: {
      es: ["Herencias", "Patrimonio", "Derecho civil", "Asesoramiento legal"],
      en: ["Inheritance", "Estate planning", "Civil law", "Legal advice"],
      de: ["Erbschaft", "Nachlassplanung", "Zivilrecht", "Rechtsberatung"]
    },
    editorialNote: {
      es: "Antonia Perelló Company tiene 76 reseñas con valoración perfecta de 5 estrellas en Palma, especializada en herencias, patrimonio y derecho de familia. La especialización en sucesiones es especialmente relevante para propietarios internacionales con bienes en Mallorca que necesitan planificación hereditaria transfronteriza.",
      en: "Antonia Perelló Company has 76 reviews at a perfect 5 stars in Palma, specialising in inheritance, estate and family law. The focus on succession matters is especially relevant for international property owners with assets in Mallorca who need cross-border estate planning.",
      de: "Antonia Perelló Company hat 76 Bewertungen mit einer perfekten 5-Sterne-Note in Palma und ist auf Erbschaft, Nachlass und Familienrecht spezialisiert. Der Schwerpunkt auf Erbangelegenheiten ist besonders relevant für internationale Eigentümer mit Vermögen auf Mallorca, die grenzüberschreitende Nachlassplanung benötigen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJizW4bBaTlxIRuh68WaPu8jg",
    slug: "pyr-asesores",
    status: "candidate",
    name: "PYR Asesores",
    location: "Palma",
    address: "Carrer Gremi de Sabaters, 21, LOCAL 7, Nord, 07009 Palma, Illes Balears",
    phone: "+34 871 55 22 77",
    website: "https://www.pyrasesores.es/",
    googleMapsUrl: "https://maps.google.com/?cid=4103604595840523962&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.8,
    reviewsCount: 72,
    focus: {
      es: "asesoría fiscal y contable para residentes, empresas y expats",
      en: "tax and accounting advice for residents, companies and expats",
      de: "Steuer- und Buchhaltungsberatung für Residenten, Unternehmen und Expats"
    },
    specialties: {
      es: ["Fiscalidad", "Contabilidad", "Asesoría para expats", "Empresas"],
      en: ["Tax advisory", "Accounting", "Expat advisory", "Companies"],
      de: ["Steuerberatung", "Buchhaltung", "Expat-Beratung", "Unternehmen"]
    },
    editorialNote: {
      es: "PYR Asesores tiene 72 reseñas con valoración de 4.8 en Palma, centrado en fiscalidad, contabilidad y asesoría para autónomos y empresas. La experiencia específica con expats lo sitúa por encima de los asesores generalistas para quienes llegan a Mallorca con obligaciones fiscales en más de un país.",
      en: "PYR Asesores has 72 reviews at 4.8 stars in Palma, focused on tax, accounting and advisory for the self-employed and companies. Specific experience with expats sets them above generalist advisors for those arriving in Mallorca with tax obligations in more than one country.",
      de: "PYR Asesores hat 72 Bewertungen bei 4,8 Sternen in Palma und ist auf Steuern, Buchhaltung und Beratung für Selbstständige und Unternehmen spezialisiert. Die spezifische Erfahrung mit Expats hebt sie über generalisierte Berater für diejenigen, die mit Steuerpflichten in mehr als einem Land nach Mallorca kommen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJ0ccLfaDWlxIRWWchER7BNr0",
    slug: "benavides-asociados",
    name: "Benavides Asociados",
    location: "Pollença",
    address: "Carrer de Cecili Metel, 29, 07460 Pollença, Illes Balears",
    phone: "+34 971 53 07 19",
    website: "http://benavidesasociados.com/",
    googleMapsUrl: "https://maps.google.com/?cid=13634297256791336793&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.9,
    reviewsCount: 72,
    focus: {
      es: "asesoría fiscal, contable y legal en el norte de Mallorca",
      en: "tax, accounting and legal support in northern Mallorca",
      de: "Steuer-, Buchhaltungs- und Rechtsunterstützung im Norden Mallorcas"
    },
    specialties: {
      es: ["Gestoría", "Fiscalidad", "Contabilidad", "Asesoramiento legal"],
      en: ["Gestoria services", "Tax advisory", "Accounting", "Legal support"],
      de: ["Gestoría-Service", "Steuerberatung", "Buchhaltung", "Rechtsunterstützung"]
    },
    areasServed: ["Pollença", "Norte de Mallorca", "Mallorca"],
    editorialNote: {
      es: "Benavides Asociados tiene 72 reseñas con valoración de 4.9 en Pollença, cubriendo el norte de Mallorca con gestoría, fiscalidad y asesoramiento legal. Es una de las opciones mejor valoradas fuera de Palma para quien vive o invierte en el norte de la isla y prefiere asesoría de proximidad.",
      en: "Benavides Asociados has 72 reviews at 4.9 stars in Pollença, covering northern Mallorca with gestoria, tax and legal services. It is one of the highest-rated options outside Palma for those who live or invest in the north of the island and prefer local advisory.",
      de: "Benavides Asociados hat 72 Bewertungen bei 4,9 Sternen in Pollença und deckt den Norden Mallorcas mit Gestoría, Steuerberatung und Rechtsdienstleistungen ab. Es ist eine der am besten bewerteten Optionen außerhalb von Palma für diejenigen, die im Norden der Insel leben oder investieren und lokale Beratung bevorzugen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJsfriRZSTlxIRMyR2VzyaToI",
    slug: "sbert-jaume-maritime-real-estate-law",
    name: "Sbert & Jaume, Maritime & Real Estate Law",
    location: "Palma",
    address: "Carrer de Francesc de Borja Moll, 9, Entl. B, Centre, 07003 Palma, Illes Balears",
    phone: "+34 677 72 82 59",
    website: "http://sbert-jaume.com/",
    googleMapsUrl: "https://maps.google.com/?cid=9389611857070138419&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 5,
    reviewsCount: 68,
    focus: {
      es: "derecho inmobiliario y marítimo para operaciones especializadas",
      en: "real estate and maritime law for specialist matters",
      de: "Immobilien- und Seerecht für spezialisierte Angelegenheiten"
    },
    specialties: {
      es: ["Derecho inmobiliario", "Derecho marítimo", "Compraventa", "Asesoramiento legal"],
      en: ["Real estate law", "Maritime law", "Property purchase", "Legal advice"],
      de: ["Immobilienrecht", "Seerecht", "Immobilienkauf", "Rechtsberatung"]
    },
    editorialNote: {
      es: "Sbert & Jaume es un despacho especializado en derecho inmobiliario y marítimo — una combinación poco habitual en Mallorca que lo convierte en referencia para operaciones vinculadas tanto a propiedades como a embarcaciones. Con 68 reseñas y valoración perfecta de 5 estrellas, destaca en un nicho muy concreto con fuerte presencia internacional.",
      en: "Sbert & Jaume is a firm specialising in real estate and maritime law — an unusual combination in Mallorca that makes them a reference for matters involving both property and boats. With 68 reviews at a perfect 5 stars, they stand out in a very specific niche with a strong international presence.",
      de: "Sbert & Jaume ist eine Kanzlei, die auf Immobilien- und Seerecht spezialisiert ist — eine ungewöhnliche Kombination auf Mallorca, die sie zur Anlaufstelle für Angelegenheiten macht, die sowohl Immobilien als auch Boote betreffen. Mit 68 Bewertungen und einer perfekten 5-Sterne-Note heben sie sich in einer sehr spezifischen Nische mit starker internationaler Präsenz hervor."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJt-5rtlKSlxIRYlGVumG_zeg",
    slug: "pro-quo-abogados-asesores",
    name: "Pro Quo Abogados y Asesores",
    location: "Palma",
    address: "Camí de l’Ullastre, 7, Llevant, 07120 Palma, Illes Balears",
    phone: "+34 871 95 10 67",
    website: "https://www.proquoabogados.com/asesoria-fiscal-mallorca/",
    googleMapsUrl: "https://maps.google.com/?cid=16775274613488046434&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.8,
    reviewsCount: 66,
    focus: {
      es: "asesoría fiscal y legal para particulares, autónomos y empresas",
      en: "tax and legal advice for individuals, self-employed professionals and companies",
      de: "Steuer- und Rechtsberatung für Privatpersonen, Selbstständige und Unternehmen"
    },
    specialties: {
      es: ["Fiscalidad", "Asesoramiento legal", "Autónomos", "Empresas"],
      en: ["Tax advisory", "Legal advice", "Self-employed professionals", "Companies"],
      de: ["Steuerberatung", "Rechtsberatung", "Selbstständige", "Unternehmen"]
    },
    editorialNote: {
      es: "Pro Quo Abogados y Asesores tiene 66 reseñas con valoración de 4.8 en Palma, combinando asesoría fiscal y legal para particulares, autónomos y empresas. El rango amplio de servicios lo hace útil para quien llega a Mallorca y necesita tanto gestionar sus obligaciones fiscales como resolver cuestiones legales desde el mismo punto.",
      en: "Pro Quo Abogados y Asesores has 66 reviews at 4.8 stars in Palma, combining tax and legal advice for individuals, self-employed professionals and companies. The broad service range makes them useful for those arriving in Mallorca who need to manage both tax obligations and legal matters from the same place.",
      de: "Pro Quo Abogados y Asesores hat 66 Bewertungen bei 4,8 Sternen in Palma und kombiniert Steuer- und Rechtsberatung für Privatpersonen, Selbstständige und Unternehmen. Das breite Leistungsspektrum macht sie nützlich für diejenigen, die nach Mallorca kommen und sowohl ihre Steuerpflichten als auch rechtliche Fragen an einer Stelle regeln möchten."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJgXT8S0WSlxIRm2fVtO34sgw",
    slug: "campaner-law-abogados",
    name: "Campaner Law Abogados",
    location: "Palma",
    address: "Carrer de Sant Miquel, 46, Esc. Izda. 1º - 5, Centre, 07002 Palma, Illes Balears",
    phone: "+34 871 11 62 47",
    website: "http://www.campaner.law/",
    googleMapsUrl: "https://maps.google.com/?cid=915067374134454171&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.9,
    reviewsCount: 66,
    focus: {
      es: "asesoramiento legal con perfil internacional en Palma",
      en: "legal advice with an international profile in Palma",
      de: "Rechtsberatung mit internationalem Profil in Palma"
    },
    specialties: {
      es: ["Asesoramiento legal", "Clientes internacionales", "Derecho civil", "Derecho penal"],
      en: ["Legal advice", "International clients", "Civil law", "Criminal law"],
      de: ["Rechtsberatung", "Internationale Mandanten", "Zivilrecht", "Strafrecht"]
    },
    editorialNote: {
      es: "Campaner Law tiene 66 reseñas con valoración de 4.9 en Palma, con un perfil explícitamente internacional y cobertura de derecho civil y penal. El nombre en inglés refleja una orientación clara hacia clientes extranjeros — relevante para no residentes que necesitan representación legal con fluidez en inglés.",
      en: "Campaner Law has 66 reviews at 4.9 stars in Palma, with an explicitly international profile covering civil and criminal law. The English-language name reflects a clear orientation towards foreign clients — relevant for non-residents who need legal representation with fluency in English.",
      de: "Campaner Law hat 66 Bewertungen bei 4,9 Sternen in Palma, mit einem explizit internationalen Profil und Abdeckung von Zivil- und Strafrecht. Der englischsprachige Name spiegelt eine klare Ausrichtung auf ausländische Mandanten wider — relevant für Nicht-Residenten, die rechtliche Vertretung mit Englischkenntnissen benötigen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJIRWt31mSlxIRa-8rqi2kSnc",
    slug: "raso-y-asociados",
    name: "Raso y Asociados",
    location: "Palma",
    address: "Carrer Femenies, 2, entresuelo A, Ponent, 07013 Palma, Illes Balears",
    phone: "+34 600 33 84 63",
    website: "https://www.rasoyasociados.com/",
    googleMapsUrl: "https://maps.google.com/?cid=8595863354825502571&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 4.8,
    reviewsCount: 62,
    focus: {
      es: "asesoramiento legal para particulares y residentes en Mallorca",
      en: "legal advice for individuals and residents in Mallorca",
      de: "Rechtsberatung für Privatpersonen und Residenten auf Mallorca"
    },
    specialties: {
      es: ["Asesoramiento legal", "Derecho civil", "Trámites legales", "Consultas jurídicas"],
      en: ["Legal advice", "Civil law", "Legal paperwork", "Legal consultations"],
      de: ["Rechtsberatung", "Zivilrecht", "Rechtliche Formalitäten", "Juristische Beratung"]
    },
    editorialNote: {
      es: "Raso y Asociados tiene 62 reseñas con valoración de 4.8 en Palma, despacho de derecho civil para particulares y residentes. El perfil generalista con buena valoración indica consistencia en el servicio — una opción sólida para quienes necesitan asesoramiento legal en Mallorca sin una especialidad muy concreta.",
      en: "Raso y Asociados has 62 reviews at 4.8 stars in Palma, a civil law firm for individuals and residents. A well-rated generalist profile indicates service consistency — a solid option for those who need legal advice in Mallorca without a highly specific area of law.",
      de: "Raso y Asociados hat 62 Bewertungen bei 4,8 Sternen in Palma — eine Zivilrechtskanzlei für Privatpersonen und Residenten. Ein gut bewertetes generalistisches Profil deutet auf Servicekonsistenz hin — eine solide Option für diejenigen, die Rechtsberatung auf Mallorca ohne ein sehr spezifisches Rechtsgebiet benötigen."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJC5puBsiTlxIRQwN5L-kK62A",
    slug: "pk-abogados-palma",
    name: "PK Abogados Palma",
    location: "Palma",
    address: "Carrer de, Av. de Jaume III, 3, 1 - 1ª, Centre, 07012 Palma, Illes Balears",
    phone: "+34 679 67 64 22",
    website: "https://inmojudicial.com/",
    googleMapsUrl: "https://maps.google.com/?cid=6983687643808203587&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 5,
    reviewsCount: 56,
    focus: {
      es: "derecho inmobiliario judicial y operaciones vinculadas a propiedad",
      en: "judicial real estate law and property-related matters",
      de: "gerichtliches Immobilienrecht und immobilienbezogene Angelegenheiten"
    },
    specialties: {
      es: ["Derecho inmobiliario", "Inmobiliario judicial", "Compraventa", "Asesoramiento legal"],
      en: ["Real estate law", "Judicial real estate", "Property purchase", "Legal advice"],
      de: ["Immobilienrecht", "Gerichtliches Immobilienrecht", "Immobilienkauf", "Rechtsberatung"]
    },
    editorialNote: {
      es: "PK Abogados Palma tiene 56 reseñas con valoración perfecta de 5 estrellas, especializado en derecho inmobiliario judicial — la parte más compleja de las operaciones de compraventa cuando surgen disputas o irregularidades. Un perfil de nicho con relevancia directa para compradores internacionales que afrontan litigios o complicaciones legales en transacciones inmobiliarias.",
      en: "PK Abogados Palma has 56 reviews at a perfect 5 stars, specialising in judicial real estate law — the most complex side of property transactions when disputes or irregularities arise. A niche profile with direct relevance for international buyers facing litigation or legal complications in property deals.",
      de: "PK Abogados Palma hat 56 Bewertungen mit einer perfekten 5-Sterne-Note und ist auf gerichtliches Immobilienrecht spezialisiert — die komplexeste Seite von Immobilientransaktionen, wenn Streitigkeiten oder Unregelmäßigkeiten auftreten. Ein Nischenprofil mit direkter Relevanz für internationale Käufer, die mit Rechtsstreitigkeiten oder rechtlichen Komplikationen bei Immobiliengeschäften konfrontiert sind."
    }
  }),
  makeApprovedLegalProfile({
    googlePlaceId: "ChIJOT0uuFOSlxIRA3m4Iu9vHD4",
    slug: "advocate-abroad",
    name: "Advocate Abroad",
    location: "Palma",
    address: "Carrer de Josep Anselm Clavé, 8, 7º 2ª, Centre, 07002 Palma, Illes Balears",
    phone: "+34 971 09 89 80",
    website: "https://advocateabroad.com/spain/lawyers/balearic-islands/palma-de-mallorca/",
    googleMapsUrl: "https://maps.google.com/?cid=4475575202569812227&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQQAhgEIAA",
    rating: 5,
    reviewsCount: 25,
    languages: ["English", "Español"],
    focus: {
      es: "asesoramiento legal para clientes internacionales y no residentes",
      en: "legal advice for international and non-resident clients",
      de: "Rechtsberatung für internationale und nicht-residente Mandanten"
    },
    specialties: {
      es: ["Clientes internacionales", "No residentes", "Derecho inmobiliario", "Asesoramiento legal"],
      en: ["International clients", "Non-residents", "Real estate law", "Legal advice"],
      de: ["Internationale Mandanten", "Nicht-Residenten", "Immobilienrecht", "Rechtsberatung"]
    },
    editorialNote: {
      es: "Advocate Abroad es una red de abogados orientada a clientes internacionales y no residentes, con 25 reseñas y valoración perfecta de 5 estrellas en Palma. El modelo de negocio está diseñado para expatriados que buscan asesoramiento legal desde el extranjero — útil para quien aún no vive en la isla pero ya tiene intereses jurídicos o inmobiliarios activos en ella.",
      en: "Advocate Abroad is a lawyer network focused on international and non-resident clients, with 25 reviews at a perfect 5 stars in Palma. Their business model is designed for expats seeking legal advice from abroad — useful for those who do not yet live on the island but already have active legal or property interests there.",
      de: "Advocate Abroad ist ein auf internationale und nicht-residente Mandanten ausgerichtetes Anwaltsnetzwerk mit 25 Bewertungen und einer perfekten 5-Sterne-Note in Palma. Das Geschäftsmodell ist für Expats konzipiert, die Rechtsberatung aus dem Ausland suchen — nützlich für diejenigen, die noch nicht auf der Insel leben, aber bereits aktive rechtliche oder immobilienbezogene Interessen dort haben."
    }
  }),
  ...approvedArchitectProfiles,
  ...approvedPropertyManagerProfiles,
  ...approvedDentistProfiles,
  ...approvedDoctorProfiles,
  ...approvedEstateAgentProfiles,
  ...approvedMortgageBrokerProfiles,
  ...approvedAestheticMedicineProfiles
];

export function getExpertProfilesByVertical(verticalSlug: ExpertVerticalSlug) {
  return expertProfiles.filter((profile) => profile.verticalSlug === verticalSlug && profile.status !== "hidden");
}

export function getExpertProfile(verticalSlug: ExpertVerticalSlug, profileSlug: string) {
  return getExpertProfilesByVertical(verticalSlug).find((profile) => profile.slug === profileSlug) ?? null;
}

export function isExpertVerticalSlug(value: string): value is ExpertVerticalSlug {
  return expertVerticalSlugs.includes(value as ExpertVerticalSlug);
}
