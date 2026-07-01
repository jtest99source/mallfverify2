import Link from "next/link";
import { notFound } from "next/navigation";
import {
  IconCircleCheck,
  IconExternalLink,
  IconLanguage,
  IconMapPin,
  IconPhone,
  IconShieldCheck,
  IconWorld
} from "@tabler/icons-react";
import { JsonLd } from "@/components/JsonLd";
import { RatingBadge } from "@/components/RatingBadge";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/data";
import { createBreadcrumbSchema, createFAQSchema } from "@/lib/schema";
import {
  expertProfiles,
  expertVerticalSlugs,
  getExpertProfile,
  isExpertVerticalSlug,
  type ExpertProfile,
  type ExpertVerticalSlug
} from "@/data/expertProfiles";

const profilePageCopy = {
  es: {
    backLabel: "Volver a la vertical",
    verifiedProfile: "Ficha técnica verificada",
    candidateProfile: "Ficha técnica en revisión",
    premiumProfile: "Ficha destacada",
    contact: "Detalles",
    call: "Llamar",
    languages: "Idiomas",
    specialties: "Especialidades",
    clientTypes: "Tipo de cliente",
    areas: "Zonas cubiertas",
    verification: "Señales verificadas",
    officialWebsite: "Web oficial",
    phone: "Teléfono",
    googleMaps: "Ver en Google Maps",
    lastVerified: "Última revisión",
    faq: "Preguntas frecuentes",
    noEditorial: "Perfil técnico basado en datos públicos y revisión editorial interna.",
    ctaTitle: "¿Representas este perfil?",
    ctaText:
      "Podemos revisar datos, servicios, idiomas, fotos y preguntas frecuentes para que la ficha sea más útil para clientes internacionales.",
    ctaButton: "Escríbenos"
  },
  en: {
    backLabel: "Back to vertical",
    verifiedProfile: "Verified technical profile",
    candidateProfile: "Technical profile under review",
    premiumProfile: "Featured profile",
    contact: "Details",
    call: "Call",
    languages: "Languages",
    specialties: "Specialisms",
    clientTypes: "Client type",
    areas: "Areas covered",
    verification: "Verified signals",
    officialWebsite: "Official website",
    phone: "Phone",
    googleMaps: "View on Google Maps",
    lastVerified: "Last checked",
    faq: "Frequently asked questions",
    noEditorial: "Technical profile based on public data and internal editorial review.",
    ctaTitle: "Do you represent this profile?",
    ctaText:
      "We can review details, services, languages, photos and FAQs so the profile becomes more useful for international clients.",
    ctaButton: "Get in touch"
  },
  de: {
    backLabel: "Zurück zum Bereich",
    verifiedProfile: "Verifiziertes technisches Profil",
    candidateProfile: "Technisches Profil in Prüfung",
    premiumProfile: "Hervorgehobenes Profil",
    contact: "Details",
    call: "Anrufen",
    languages: "Sprachen",
    specialties: "Spezialisierungen",
    clientTypes: "Kundentyp",
    areas: "Abgedeckte Gebiete",
    verification: "Geprüfte Signale",
    officialWebsite: "Offizielle Website",
    phone: "Telefon",
    googleMaps: "Auf Google Maps ansehen",
    lastVerified: "Zuletzt geprüft",
    faq: "Häufige Fragen",
    noEditorial: "Technisches Profil auf Basis öffentlicher Daten und interner redaktioneller Prüfung.",
    ctaTitle: "Vertrittst du dieses Profil?",
    ctaText:
      "Wir können Daten, Leistungen, Sprachen, Fotos und FAQ prüfen, damit das Profil für internationale Kunden nützlicher wird.",
    ctaButton: "Schreib uns"
  }
} as const;

function statusLabel(profile: ExpertProfile, locale: Locale) {
  const copy = profilePageCopy[locale];
  if (profile.status === "premium") return copy.premiumProfile;
  if (profile.status === "verified") return copy.verifiedProfile;
  return copy.candidateProfile;
}

function listSchema(name: string, items: string[]) {
  return items.length ? (
    <ul className="mt-3 grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm font-semibold leading-6 text-white">
          <IconCircleCheck size={17} stroke={1.8} className="mt-0.5 shrink-0 text-white" />
          {item}
        </li>
      ))}
    </ul>
  ) : (
    <p className="mt-3 text-sm leading-7 text-white/55">{name}</p>
  );
}

function localizedList(list: Partial<Record<Locale, string[]>>, locale: Locale) {
  return list[locale] ?? list.es ?? list.en ?? list.de ?? [];
}

function createProfessionalServiceSchema({
  profile,
  locale,
  verticalSlug
}: {
  profile: ExpertProfile;
  locale: Locale;
  verticalSlug: ExpertVerticalSlug;
}) {
  const url = `${siteUrl}/${locale}/experts/${verticalSlug}/${profile.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${url}#expert`,
    name: profile.name,
    url,
    description: profile.shortDescription[locale] ?? profile.shortDescription.es,
    address: profile.address,
    telephone: profile.phone,
    sameAs: [profile.website, profile.googleMapsUrl].filter(Boolean),
    areaServed: profile.areasServed,
    knowsLanguage: profile.languages,
    serviceType: localizedList(profile.specialties, locale),
    inLanguage: locale,
    aggregateRating:
      typeof profile.rating === "number" && typeof profile.reviewsCount === "number"
        ? {
            "@type": "AggregateRating",
            ratingValue: profile.rating,
            reviewCount: profile.reviewsCount
          }
        : undefined
  };
}

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    expertVerticalSlugs.flatMap((slug) =>
      expertProfiles
        .filter((profile) => profile.verticalSlug === slug && profile.status !== "hidden")
        .map((profile) => ({ locale, slug, profileSlug: profile.slug }))
    )
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string; slug: string; profileSlug: string }>;
}) {
  const { locale, slug, profileSlug } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  if (!isExpertVerticalSlug(slug)) {
    return generateSeoMetadata({
      title: "Mallorca Verified Experts",
      description: "Verified professional profiles in Mallorca.",
      path: `/${safeLocale}/experts`,
      locale: safeLocale
    });
  }
  const profile = getExpertProfile(slug, profileSlug);
  if (!profile) {
    return generateSeoMetadata({
      title: "Mallorca Verified Experts",
      description: "Verified professional profiles in Mallorca.",
      path: `/${safeLocale}/experts/${slug}`,
      locale: safeLocale
    });
  }
  return generateSeoMetadata({
    title: `${profile.name} | Mallorca Verified Experts`,
    description: profile.shortDescription[safeLocale] ?? profile.shortDescription.es ?? profile.name,
    path: `/${safeLocale}/experts/${slug}/${profile.slug}`,
    locale: safeLocale
  });
}

export default async function ExpertProfilePage({
  params
}: {
  params: Promise<{ locale: string; slug: string; profileSlug: string }>;
}) {
  const { locale, slug, profileSlug } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  if (!isExpertVerticalSlug(slug)) notFound();
  const profile = getExpertProfile(slug, profileSlug);
  if (!profile) notFound();

  const copy = profilePageCopy[safeLocale];
  const description = profile.shortDescription[safeLocale] ?? profile.shortDescription.es ?? copy.noEditorial;
  const faqs = profile.faqs?.[safeLocale] ?? profile.faqs?.es ?? [];
  const specialties = localizedList(profile.specialties, safeLocale);
  const clientTypes = localizedList(profile.clientTypes, safeLocale);
  const verificationSignals = localizedList(profile.verificationSignals, safeLocale);
  const VERTICAL_COLORS: Record<string, string> = {
    "english-speaking-lawyers-mallorca":  "#00C37A",
    "architects-renovation-mallorca":     "#00C37A",
    "property-managers-mallorca":         "#00C37A",
    "english-speaking-dentists-mallorca": "#00C37A",
    "english-speaking-doctors-mallorca":  "#00C37A",
    "estate-agents-mallorca":             "#00C37A",
    "mortgage-brokers-mallorca":          "#00C37A",
  };
  const verticalAccentColor = VERTICAL_COLORS[slug] ?? "#0A0A0A";
  const pageUrl = `${siteUrl}/${safeLocale}/experts/${slug}/${profile.slug}`;
  const breadcrumbs = createBreadcrumbSchema([
    { name: "Mallorca Verified", url: `${siteUrl}/${safeLocale}` },
    { name: "Experts", url: `${siteUrl}/${safeLocale}/experts` },
    { name: profile.name, url: pageUrl }
  ]);
  const jsonLd = [
    createProfessionalServiceSchema({ profile, locale: safeLocale, verticalSlug: slug }),
    breadcrumbs,
    ...(faqs.length ? [createFAQSchema(faqs)] : [])
  ];

  return (
    <main className="bg-[#07101F] text-white">
      {/* Thin vertical-color accent bar at top */}
      <div className="h-1.5 w-full" style={{ backgroundColor: verticalAccentColor }} />

      {/* Hero */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            href={`/${safeLocale}/experts/${slug}`}
            className="text-[11px] font-black uppercase tracking-[0.12em] hover:text-[#0A0A0A]"
            style={{ color: verticalAccentColor }}
          >
            {copy.backLabel}
          </Link>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
            <div>
              <p
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]"
                style={{ color: verticalAccentColor }}
              >
                <IconShieldCheck size={15} stroke={2} />
                {statusLabel(profile, safeLocale)}
              </p>
              <h1 className="mt-4 max-w-5xl font-display text-4xl font-black leading-[0.98] text-white sm:text-5xl lg:text-6xl">
                {profile.name}
              </h1>
              {typeof profile.rating === "number" ? (
                <div className="mt-5">
                  <RatingBadge rating={profile.rating} reviewsCount={profile.reviewsCount} locale={safeLocale} />
                </div>
              ) : null}
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/55">{description}</p>
            </div>
            <aside className="overflow-hidden rounded-lg border border-white/[0.10] bg-[#0C1A2E] shadow-[0_18px_45px_rgba(10,10,10,0.07)]">
              <div className="h-1 w-full" style={{ backgroundColor: verticalAccentColor }} />
              <div className="p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: verticalAccentColor }}>
                  {copy.contact}
                </p>
                <div className="mt-4 grid gap-3">
                  <div className="flex items-start gap-3">
                    <IconMapPin size={16} stroke={1.8} className="mt-0.5 shrink-0 text-white" />
                    <span className="text-sm font-semibold leading-5 text-white">{profile.address ?? profile.location}</span>
                  </div>
                  {profile.phone ? (
                    <div className="flex items-center gap-3">
                      <IconPhone size={16} stroke={1.8} className="shrink-0 text-white" />
                      <span className="text-sm font-bold text-white">{profile.phone}</span>
                    </div>
                  ) : null}
                </div>
                <div className="mt-5 grid gap-2">
                  {profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-[44px] items-center justify-center gap-2 rounded-md px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: verticalAccentColor }}
                    >
                      <IconWorld size={15} stroke={2} />
                      {copy.officialWebsite}
                    </a>
                  ) : null}
                  {profile.phone ? (
                    <a
                      href={`tel:${profile.phone.replace(/\s+/g, "")}`}
                      className="flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-white/[0.10] bg-[#0C1A2E] px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-colors hover:border-[#07101F]"
                    >
                      <IconPhone size={15} stroke={2} />
                      {copy.call}
                    </a>
                  ) : null}
                  {profile.googleMapsUrl ? (
                    <a
                      href={profile.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-white/[0.10] bg-[#0C1A2E] px-4 text-[11px] font-black uppercase tracking-[0.1em] text-white transition-colors hover:border-[#07101F]"
                    >
                      <IconExternalLink size={15} stroke={2} />
                      {copy.googleMaps}
                    </a>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Attributes — contained card */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6 sm:p-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/55">{copy.languages}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.languages.map((l) => (
                  <span key={l} className="rounded-full border border-white/[0.12] bg-white/[0.06] px-3 py-1 text-sm font-bold text-white">
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/55">{copy.specialties}</p>
              <ul className="mt-3 grid gap-2">
                {specialties.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm font-semibold leading-5 text-white">
                    <IconCircleCheck size={15} stroke={1.8} className="mt-0.5 shrink-0" style={{ color: verticalAccentColor }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/55">{copy.clientTypes}</p>
              <ul className="mt-3 grid gap-2">
                {clientTypes.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm font-semibold leading-5 text-white">
                    <IconCircleCheck size={15} stroke={1.8} className="mt-0.5 shrink-0" style={{ color: verticalAccentColor }} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/55">{copy.areas}</p>
              <ul className="mt-3 grid gap-2">
                {profile.areasServed.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm font-semibold leading-5 text-white">
                    <IconCircleCheck size={15} stroke={1.8} className="mt-0.5 shrink-0" style={{ color: verticalAccentColor }} />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* Verified signals — tinted with vertical color */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p
            className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em]"
            style={{ color: verticalAccentColor }}
          >
            <IconShieldCheck size={16} stroke={2} />
            {copy.verification}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {verificationSignals.map((signal) => (
              <div key={signal} className="flex items-start gap-3 text-sm font-semibold leading-6 text-white">
                <IconCircleCheck size={17} stroke={1.8} className="mt-0.5 shrink-0" style={{ color: verticalAccentColor }} />
                {signal}
              </div>
            ))}
          </div>
          {profile.lastVerifiedAt ? (
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
              {copy.lastVerified}: {profile.lastVerifiedAt}
            </p>
          ) : null}
        </div>
      </section>

      {/* FAQ */}
      {faqs.length ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.16em]" style={{ color: verticalAccentColor }}>
              {copy.faq}
            </p>
            <div className="mt-6 grid gap-4">
              {faqs.map((item) => (
                <details key={item.question} className="group rounded-lg border border-white/[0.10] bg-[#0C1A2E]">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-white marker:hidden [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <span className="shrink-0 transition-transform duration-200 group-open:rotate-45" style={{ color: verticalAccentColor }}>
                      +
                    </span>
                  </summary>
                  <p className="border-t border-white/[0.10] px-5 py-4 text-sm leading-7 text-white/55">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6 sm:p-8 lg:p-10">
          <h2 className="max-w-3xl font-display text-3xl font-black leading-tight text-white sm:text-5xl">{copy.ctaTitle}</h2>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65">{copy.ctaText}</p>
          <Link
            href={`/${safeLocale}/contact`}
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-sm bg-[#00C37A] px-6 text-[11px] font-black uppercase tracking-[0.1em] text-[#0A0A0A] transition-all duration-150 hover:bg-white"
          >
            {copy.ctaButton}
          </Link>
        </div>
      </section>

      <JsonLd data={jsonLd} />
    </main>
  );
}
