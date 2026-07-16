import Link from "next/link";
import { IconCircleCheckFilled, IconClock, IconShieldCheck } from "@tabler/icons-react";
import { HomePlaceSearch } from "@/components/HomePlaceSearch";
import { EditorialRankingCarousel } from "@/components/EditorialRankingCarousel";
import { getBusinessImageUrl } from "@/components/BusinessImage";
import { getHomepageMiniRankingBusinesses } from "@/lib/repository";
import { generateSeoMetadata } from "@/lib/seo";
import { methodologyPath } from "@/lib/methodology";
import { isLocale, type Locale } from "@/lib/i18n";
import { serviceCategorySlugs, type CategorySlug } from "@/lib/data";

// The money side of the site: non-leisure, professional services that internationals
// in Mallorca actually search for. Same ranking format as the homepage (Google
// rating + MV Score), reusing the shared carousel. The verified English/German
// language layer is announced as "coming soon" — it lands once outreach fills the data.

const SERVICE_CATEGORIES: CategorySlug[] = [...serviceCategorySlugs];

const serviceLocations = ["Palma", "Alcúdia", "Pollença", "Sóller", "Manacor", "Inca", "Santanyí", "Andratx", "Calvià", "Llucmajor"].map((location) => ({ label: location, value: location }));

type LocaleText = Record<Locale, string>;

const serviceModules: Array<{ category: CategorySlug; eyebrow: LocaleText; title: LocaleText; minReviews?: number }> = [
  {
    category: "dentists",
    eyebrow: { es: "Dentistas", en: "Dentists", de: "Zahnärzte" },
    title: { es: "Dentistas en Mallorca", en: "Dentists in Mallorca", de: "Zahnärzte auf Mallorca" }
  },
  {
    category: "aesthetic-clinics",
    eyebrow: { es: "Estética", en: "Aesthetics", de: "Ästhetik" },
    title: { es: "Medicina estética en Mallorca", en: "Aesthetic clinics in Mallorca", de: "Ästhetische Medizin auf Mallorca" }
  },
  {
    category: "physiotherapists",
    eyebrow: { es: "Fisioterapia", en: "Physiotherapy", de: "Physiotherapie" },
    title: { es: "Fisioterapeutas en Mallorca", en: "Physiotherapists in Mallorca", de: "Physiotherapeuten auf Mallorca" }
  },
  {
    category: "psychologists",
    eyebrow: { es: "Psicología", en: "Psychology", de: "Psychologie" },
    title: { es: "Psicólogos en Mallorca", en: "Psychologists in Mallorca", de: "Psychologen auf Mallorca" }
  },
  {
    category: "opticians",
    eyebrow: { es: "Óptica", en: "Opticians", de: "Optiker" },
    title: { es: "Ópticas y oftalmólogos en Mallorca", en: "Opticians in Mallorca", de: "Optiker auf Mallorca" }
  },
  {
    category: "nutritionists",
    eyebrow: { es: "Nutrición", en: "Nutrition", de: "Ernährung" },
    title: { es: "Nutricionistas en Mallorca", en: "Nutritionists in Mallorca", de: "Ernährungsberater auf Mallorca" }
  },
  {
    category: "pediatricians",
    eyebrow: { es: "Pediatría", en: "Pediatrics", de: "Kinderärzte" },
    title: { es: "Pediatras en Mallorca", en: "Pediatricians in Mallorca", de: "Kinderärzte auf Mallorca" }
  },
  {
    category: "gynecologists",
    eyebrow: { es: "Ginecología", en: "Gynecology", de: "Gynäkologie" },
    title: { es: "Ginecología y fertilidad en Mallorca", en: "Gynecology & fertility in Mallorca", de: "Gynäkologie & Kinderwunsch auf Mallorca" }
  },
  {
    category: "healthcare",
    eyebrow: { es: "Salud", en: "Health", de: "Gesundheit" },
    title: { es: "Médicos y clínicas en Mallorca", en: "Doctors & clinics in Mallorca", de: "Ärzte & Kliniken auf Mallorca" }
  },
  {
    category: "real-estate",
    eyebrow: { es: "Vivienda", en: "Property", de: "Immobilien" },
    title: { es: "Inmobiliarias en Mallorca", en: "Real estate agencies in Mallorca", de: "Immobilienagenturen auf Mallorca" }
  },
  {
    category: "property-management",
    eyebrow: { es: "Propiedades", en: "Property", de: "Immobilien" },
    title: { es: "Gestión de propiedades en Mallorca", en: "Property management in Mallorca", de: "Immobilienverwaltung auf Mallorca" }
  },
  {
    category: "renovations",
    eyebrow: { es: "Reformas", en: "Renovation", de: "Renovierung" },
    title: { es: "Reformas y arquitectura en Mallorca", en: "Renovations & architects in Mallorca", de: "Renovierung & Architekten auf Mallorca" }
  },
  {
    category: "pool-garden",
    eyebrow: { es: "Exteriores", en: "Outdoors", de: "Außenbereich" },
    title: { es: "Piscinas y jardinería en Mallorca", en: "Pools & gardening in Mallorca", de: "Pools & Gartenpflege auf Mallorca" }
  },
  {
    category: "lawyers",
    eyebrow: { es: "Legal", en: "Legal", de: "Recht" },
    title: { es: "Abogados en Mallorca", en: "Lawyers in Mallorca", de: "Anwälte auf Mallorca" }
  },
  {
    category: "tax-advisors",
    eyebrow: { es: "Fiscal", en: "Tax & admin", de: "Steuer" },
    title: { es: "Gestorías y asesores en Mallorca", en: "Tax advisors & gestorías in Mallorca", de: "Steuerberater auf Mallorca" }
  },
  {
    category: "vets",
    eyebrow: { es: "Mascotas", en: "Pets", de: "Haustiere" },
    title: { es: "Veterinarios en Mallorca", en: "Vets in Mallorca", de: "Tierärzte auf Mallorca" }
  },
  {
    category: "rent-a-car",
    eyebrow: { es: "Moverse", en: "Getting around", de: "Mobilität" },
    title: { es: "Alquiler de coches en Mallorca", en: "Car rental in Mallorca", de: "Mietwagen auf Mallorca" }
  },
  {
    category: "car-dealers",
    eyebrow: { es: "Coches", en: "Cars", de: "Autos" },
    title: { es: "Concesionarios en Mallorca", en: "Car dealers in Mallorca", de: "Autohäuser auf Mallorca" }
  }
];

const copy = {
  es: {
    eyebrow: "Para expats y residentes internacionales",
    title: "Servicios en Mallorca",
    titleAccent: "que de verdad importan.",
    subtitle: "Dentistas, médicos, inmobiliarias, veterinarios y más — clasificados por reseñas reales de Google y nuestro MV Score. Sin posiciones de pago.",
    comingSoon: "Verificación de idioma (inglés / alemán) — próximamente",
    signals: ["Datos reales de Google", "Sin posiciones de pago", "Idiomas verificados: en camino"],
    method: "Cómo funcionan los rankings"
  },
  en: {
    eyebrow: "For expats & international residents",
    title: "Services in Mallorca",
    titleAccent: "that actually matter.",
    subtitle: "Dentists, doctors, real estate, vets and more — ranked on real Google reviews and our MV Score. No paid positions.",
    comingSoon: "English / German language verification — coming soon",
    signals: ["Real Google data", "No paid positions", "Verified languages: coming soon"],
    method: "How our rankings work"
  },
  de: {
    eyebrow: "Für Expats & internationale Bewohner",
    title: "Dienstleistungen auf Mallorca",
    titleAccent: "die wirklich zählen.",
    subtitle: "Zahnärzte, Ärzte, Immobilien, Tierärzte und mehr — nach echten Google-Bewertungen und unserem MV Score. Keine bezahlten Positionen.",
    comingSoon: "Sprachverifizierung (Englisch / Deutsch) — demnächst",
    signals: ["Echte Google-Daten", "Keine bezahlten Positionen", "Verifizierte Sprachen: in Kürze"],
    method: "Wie unsere Rankings funktionieren"
  }
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const c = copy[safeLocale];
  return generateSeoMetadata({
    title: `${c.title} | Mallorca Verified`,
    description: c.subtitle,
    path: `/${safeLocale}/services`,
    locale: safeLocale
  });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const c = copy[safeLocale];

  const moduleBusinesses = await Promise.all(
    serviceModules.map((module) => getHomepageMiniRankingBusinesses(module.category, 5, undefined, module.minReviews))
  );
  const modules = serviceModules
    .map((module, index) => ({ ...module, businesses: moduleBusinesses[index] }))
    .filter((module) => module.businesses.length > 0);

  const heroSeen = new Set<string>();
  const heroBusinesses = modules
    .flatMap((module) => module.businesses)
    .filter((business) => {
      if (!getBusinessImageUrl(business)) return false;
      const id = String(business.id);
      if (heroSeen.has(id)) return false;
      heroSeen.add(id);
      return true;
    })
    .slice(0, 4);
  const heroFallbacks = [
    "linear-gradient(160deg,#202020,#080808)",
    "linear-gradient(160deg,#101b1f,#070707)",
    "linear-gradient(160deg,#1f241f,#090909)",
    "linear-gradient(160deg,#231b14,#080808)"
  ];
  const heroPanels = Array.from({ length: 4 }, (_, index) => heroBusinesses[index] ?? null);

  return (
    <main className="bg-[#07101F] text-white">
      <section className="relative overflow-visible border-b border-white/[0.08] bg-[#07101F] px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
        <div className="absolute inset-0 grid grid-cols-2 gap-px opacity-95 md:grid-cols-4">
          {heroPanels.map((business, index) => (
            <div
              key={business?.id ?? `fallback-${index}`}
              className="relative h-full min-h-full overflow-hidden bg-[#0C1A2E]"
              style={{
                backgroundImage: business
                  ? `linear-gradient(180deg,rgba(10,10,10,0.1),rgba(10,10,10,0.34)), url(${getBusinessImageUrl(business)})`
                  : heroFallbacks[index],
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="absolute inset-0 bg-[#07101F]/10" />
              {business && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#07101F]/68 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-white/45 backdrop-blur">
                  {business.city || business.area || "Mallorca"}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_72%_at_50%_43%,rgba(10,10,10,0.9)_0%,rgba(10,10,10,0.76)_48%,rgba(10,10,10,0.88)_100%),linear-gradient(to_bottom,rgba(10,10,10,0.78)_0%,rgba(10,10,10,0.42)_42%,rgba(10,10,10,0.95)_100%)]" />
        <div className="relative z-10 mx-auto flex w-full max-w-[780px] flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#00C37A] before:h-px before:w-6 before:bg-[#00C37A] after:h-px after:w-6 after:bg-[#00C37A]">
            {c.eyebrow}
          </div>
          <h1 className="font-display mx-auto max-w-3xl text-balance text-[2.5rem] font-black leading-[0.94] text-white sm:text-6xl">
            {c.title} <em className="italic text-[#00C37A]">{c.titleAccent}</em>
          </h1>
          <p className="mx-auto mt-6 max-w-[520px] text-base font-light leading-8 text-white/60">{c.subtitle}</p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#00C37A]/25 bg-[#00C37A]/[0.06] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#00C37A]/90">
            <IconClock size={14} stroke={2} />
            {c.comingSoon}
          </div>

          <HomePlaceSearch locale={safeLocale} categories={SERVICE_CATEGORIES} locations={serviceLocations} />

          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/45">
            {c.signals.map((item) => (
              <span key={item} className="inline-flex items-center gap-2"><IconCircleCheckFilled size={14} className="text-[#00C37A]" />{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1360px] divide-y divide-white/[0.08]">
          {modules.map((module) => (
            <EditorialRankingCarousel
              key={module.category}
              title={module.title[safeLocale]}
              eyebrow={module.eyebrow[safeLocale]}
              href={`/${safeLocale}/top/${module.category}`}
              businesses={module.businesses}
              locale={safeLocale}
            />
          ))}
        </div>
      </section>

      <section className="border-t border-white/[0.08] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <IconShieldCheck size={28} className="text-[#00C37A]" />
          <p className="text-sm leading-7 text-white/55">
            {safeLocale === "de"
              ? "Wir arbeiten mit den Unternehmen direkt, um Sprachen und Details zu bestätigen. Bis dahin basiert das Ranking auf öffentlichen Google-Bewertungen."
              : safeLocale === "en"
                ? "We're reaching out to each business to confirm languages and details. Until then, rankings are based on public Google reviews."
                : "Estamos contactando con cada negocio para confirmar idiomas y datos. Hasta entonces, el ranking se basa en reseñas públicas de Google."}
          </p>
          <Link href={methodologyPath(safeLocale)} className="text-[11px] font-black uppercase tracking-[0.1em] text-[#00C37A] hover:text-white">
            {c.method} →
          </Link>
        </div>
      </section>
    </main>
  );
}
