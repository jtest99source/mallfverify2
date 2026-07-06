import { IconShieldCheck } from "@tabler/icons-react";
import { JsonLd } from "@/components/JsonLd";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/data";
import { createBreadcrumbSchema } from "@/lib/schema";

const copy = {
  es: {
    metaTitle: "Expertos en Mallorca para compradores, expats y residentes internacionales | Mallorca Verified",
    metaDescription: "Directorio de profesionales verificados en Mallorca para compradores internacionales, expats y residentes. Abogados, médicos, inmobiliarias y más. Próximamente.",
    eyebrow: "Mallorca Verified Experts",
    title: "¿Buscas un profesional en Mallorca que hable tu idioma?",
    intro: "Encontrar un médico, abogado o agente inmobiliario que hable inglés o alemán en Mallorca no debería ser tan difícil. Estamos construyendo el directorio de profesionales verificados más completo de la isla.",
    badge: "Próximamente",
    comingTitle: "Estamos verificando cada perfil",
    comingText: "Contactamos directamente con cada profesional para confirmar idiomas, especialidades y experiencia real con clientes internacionales. Sin perfiles de pago, sin listados genéricos.",
    cta: "Escríbenos y te orientamos",
    ctaHref: "mailto:hola@mallorcaverified.com",
  },
  en: {
    metaTitle: "Experts in Mallorca for buyers, expats and international residents | Mallorca Verified",
    metaDescription: "Directory of verified professionals in Mallorca for international buyers, expats and residents. Lawyers, doctors, estate agents and more. Coming soon.",
    eyebrow: "Mallorca Verified Experts",
    title: "Looking for a professional in Mallorca who speaks your language?",
    intro: "Finding a doctor, lawyer or estate agent who speaks English or German in Mallorca shouldn't be this hard. We're building the most complete directory of verified professionals on the island.",
    badge: "Coming soon",
    comingTitle: "We're verifying every profile",
    comingText: "We contact each professional directly to confirm languages, specialisms and real track record with international clients. No paid listings, no generic directories.",
    cta: "Get in touch",
    ctaHref: "mailto:hola@mallorcaverified.com",
  },
  de: {
    metaTitle: "Experten auf Mallorca für Käufer, Expats und internationale Bewohner | Mallorca Verified",
    metaDescription: "Verzeichnis verifizierter Profis auf Mallorca für internationale Käufer, Expats und Bewohner. Anwälte, Ärzte, Immobilienmakler und mehr. Demnächst.",
    eyebrow: "Mallorca Verified Experts",
    title: "Suchen Sie einen Fachmann auf Mallorca, der Ihre Sprache spricht?",
    intro: "Einen Arzt, Anwalt oder Immobilienmakler zu finden, der auf Mallorca Deutsch oder Englisch spricht, sollte nicht so schwer sein. Wir bauen das vollständigste Verzeichnis verifizierter Profis auf der Insel.",
    badge: "Demnächst",
    comingTitle: "Wir verifizieren jedes Profil",
    comingText: "Wir kontaktieren jeden Fachmann direkt, um Sprachen, Spezialisierungen und echte Erfahrung mit internationalen Kunden zu bestätigen. Keine bezahlten Listings, keine generischen Verzeichnisse.",
    cta: "Schreib uns",
    ctaHref: "mailto:hola@mallorcaverified.com",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const c = copy[safeLocale];
  return generateSeoMetadata({
    title: c.metaTitle,
    description: c.metaDescription,
    path: `/${safeLocale}/experts`,
    locale: safeLocale,
  });
}

export default async function ExpertsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const c = copy[safeLocale];
  const pageUrl = `${siteUrl}/${safeLocale}/experts`;

  const breadcrumbs = createBreadcrumbSchema([
    { name: "Mallorca Verified", url: `${siteUrl}/${safeLocale}` },
    { name: "Experts", url: pageUrl },
  ]);

  return (
    <main className="bg-[#040D1A] text-white">
      {/* ── HERO ── */}
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#00C37A]">
          <IconShieldCheck size={13} stroke={2} />
          {c.eyebrow}
        </p>

        <h1 className="mt-5 font-display text-4xl font-black leading-[1.05] text-white sm:text-6xl lg:text-7xl">
          {c.title}
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-white/55">
          {c.intro}
        </p>

        <div className="mt-10 flex flex-col items-center gap-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#00C37A]/30 bg-[#00C37A]/[0.07] px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] text-[#00C37A]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00C37A]" />
            {c.badge}
          </span>

          <h2 className="text-xl font-black text-white sm:text-2xl">{c.comingTitle}</h2>

          <p className="max-w-md text-sm leading-7 text-white/50">{c.comingText}</p>

          <a
            href={c.ctaHref}
            className="mt-2 inline-flex items-center gap-2 rounded-sm bg-[#00C37A] px-6 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-colors hover:bg-[#00a866]"
          >
            {c.cta} →
          </a>
        </div>
      </section>

      <JsonLd data={[breadcrumbs]} />
    </main>
  );
}
