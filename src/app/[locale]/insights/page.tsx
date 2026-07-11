import Link from "next/link";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";

const copy = {
  es: {
    metaTitle: "Informes de sector — datos de Mallorca | Mallorca Verified",
    metaDescription: "Informes de datos originales sobre los sectores de Mallorca, a partir de reseñas públicas verificadas. Cifras citables para prensa y negocios.",
    eyebrow: "Datos e informes",
    title: "Informes de sector",
    intro: "Análisis de datos originales sobre los sectores de Mallorca, construidos a partir de reseñas públicas verificadas. Cifras citables para medios y contexto útil para negocios.",
    reports: [
      { href: "insights/dental-mallorca-2026", tag: "Salud · 2026", title: "Clínicas dentales de Mallorca 2026", desc: "179 clínicas analizadas: la calidad ya no distingue, la visibilidad sí." }
    ],
    soon: "Más informes en camino: inmobiliarias, healthcare y más sectores."
  },
  en: {
    metaTitle: "Sector reports — Mallorca data | Mallorca Verified",
    metaDescription: "Original data reports on Mallorca's sectors, built from verified public reviews. Citable figures for press and businesses.",
    eyebrow: "Data & reports",
    title: "Sector reports",
    intro: "Original data analysis on Mallorca's sectors, built from verified public reviews. Citable figures for press and useful context for businesses.",
    reports: [
      { href: "insights/dental-mallorca-2026", tag: "Health · 2026", title: "Mallorca Dental Clinics 2026", desc: "179 clinics analysed: quality no longer sets them apart — visibility does." }
    ],
    soon: "More reports coming: estate agents, healthcare and other sectors."
  },
  de: {
    metaTitle: "Branchenreports — Mallorca-Daten | Mallorca Verified",
    metaDescription: "Originale Datenreports zu Mallorcas Branchen, aus verifizierten öffentlichen Bewertungen. Zitierfähige Zahlen für Presse und Betriebe.",
    eyebrow: "Daten & Reports",
    title: "Branchenreports",
    intro: "Originale Datenanalysen zu Mallorcas Branchen, aus verifizierten öffentlichen Bewertungen. Zitierfähige Zahlen für Medien und nützlicher Kontext für Betriebe.",
    reports: [
      { href: "insights/dental-mallorca-2026", tag: "Gesundheit · 2026", title: "Zahnkliniken auf Mallorca 2026", desc: "179 Kliniken analysiert: Qualität unterscheidet nicht mehr — Sichtbarkeit schon." }
    ],
    soon: "Weitere Reports folgen: Immobilienmakler, Healthcare und weitere Branchen."
  }
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safe = isLocale(locale) ? locale : "es";
  const c = copy[safe];
  return generateSeoMetadata({
    title: c.metaTitle,
    description: c.metaDescription,
    path: `/${safe}/insights`,
    locale: safe,
    alternateLocales: ["es", "en", "de"]
  });
}

export default async function InsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safe = (isLocale(locale) ? locale : "es") as Locale;
  const c = copy[safe];

  return (
    <main className="bg-[#07101F] text-white">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]">{c.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-black leading-[1.02] text-white sm:text-6xl">{c.title}</h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/60">{c.intro}</p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {c.reports.map((r) => (
            <Link key={r.href} href={`/${safe}/${r.href}`} className="group flex flex-col rounded-lg border border-white/[0.10] bg-[#0C1A2E] p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#00C37A]/40">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#00C37A]">{r.tag}</span>
              <h2 className="mt-3 font-display text-2xl font-black leading-tight text-white">{r.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/60">{r.desc}</p>
              <span className="mt-auto pt-5 text-[11px] font-black uppercase tracking-[0.1em] text-[#00C37A] group-hover:text-white">→</span>
            </Link>
          ))}
        </div>

        <p className="mt-8 text-sm text-white/40">{c.soon}</p>
      </section>
    </main>
  );
}
