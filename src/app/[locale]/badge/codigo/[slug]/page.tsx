import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { getCategorySlugFromBusiness } from "@/lib/data";
import type { BusinessCategory } from "@/types/business";
import { createSupabaseServerClient } from "@/lib/supabase";
import { siteConfig } from "@/config/site";
import { BadgeCopyBlock } from "@/components/BadgeCopyBlock";

// Private per-business badge-code page, delivered by direct link (WhatsApp).
// ONE dynamic route for every business — never linked from the site, noindex.

export const revalidate = 21600;

const copy = {
  es: {
    eyebrow: "Tu sello de verificación",
    title: (name: string) => `El sello de ${name}`,
    intro: (name: string) =>
      `${name} tiene una ficha verificada activa en Mallorca Verified. Este es tu sello personalizado: enlaza directamente a tu ficha, con tus valoraciones reales de Google. Copia el código de la variante que mejor encaje con tu web y pégalo en el pie de página (o donde prefieras).`,
    darkLabel: "Para webs de fondo oscuro",
    lightLabel: "Para webs de fondo claro",
    codeLabel: "Código (una línea, HTML)",
    copyLabel: "Copiar código",
    copiedLabel: "¡Copiado!",
    helpTitle: "¿Prefieres que lo instalemos nosotros?",
    helpText: "Respóndenos por WhatsApp o escribe a hola@mallorcaverified.com y lo dejamos puesto — es gratis.",
    fichaLabel: "Ver tu ficha verificada",
    aboutLabel: "Qué significa el sello"
  },
  en: {
    eyebrow: "Your verification badge",
    title: (name: string) => `The badge for ${name}`,
    intro: (name: string) =>
      `${name} holds an active verified listing on Mallorca Verified. This is your personalised badge: it links straight to your listing, with your real Google ratings. Copy the code for the variant that fits your website and paste it into your footer (or wherever you prefer).`,
    darkLabel: "For dark websites",
    lightLabel: "For light websites",
    codeLabel: "Code (one line, HTML)",
    copyLabel: "Copy code",
    copiedLabel: "Copied!",
    helpTitle: "Prefer us to install it for you?",
    helpText: "Reply on WhatsApp or write to hola@mallorcaverified.com and we'll set it up — free of charge.",
    fichaLabel: "View your verified listing",
    aboutLabel: "What the badge means"
  },
  de: {
    eyebrow: "Ihr Verifizierungssiegel",
    title: (name: string) => `Das Siegel für ${name}`,
    intro: (name: string) =>
      `${name} führt ein aktives geprüftes Profil auf Mallorca Verified. Dies ist Ihr personalisiertes Siegel: Es verlinkt direkt auf Ihr Profil mit Ihren echten Google-Bewertungen. Kopieren Sie den Code der passenden Variante und fügen Sie ihn in die Fußzeile Ihrer Website ein.`,
    darkLabel: "Für dunkle Websites",
    lightLabel: "Für helle Websites",
    codeLabel: "Code (eine Zeile, HTML)",
    copyLabel: "Code kopieren",
    copiedLabel: "Kopiert!",
    helpTitle: "Sollen wir es für Sie einrichten?",
    helpText: "Antworten Sie per WhatsApp oder schreiben Sie an hola@mallorcaverified.com — kostenlos.",
    fichaLabel: "Ihr geprüftes Profil ansehen",
    aboutLabel: "Was das Siegel bedeutet"
  }
} as const;

async function fetchBusiness(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("businesses")
    .select("slug,name,display_name,category,status")
    .eq("slug", slug)
    .in("status", ["published", "premium"])
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const business = await fetchBusiness(slug);
  const name = business?.display_name || business?.name || "Mallorca Verified";
  return {
    title: `${copy[safeLocale].title(name)} | Mallorca Verified`,
    robots: { index: false, follow: false }
  };
}

export default async function BadgeCodePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const c = copy[safeLocale];

  const business = await fetchBusiness(slug);
  if (!business) notFound();

  const name = business.display_name || business.name;
  const categorySlug = getCategorySlugFromBusiness(business.category as BusinessCategory);
  const fichaUrl = `${siteConfig.url}/${safeLocale}/${categorySlug}/${business.slug}`;
  const snippet = (variant: "dark" | "light") =>
    `<a href="${fichaUrl}" target="_blank" rel="noopener"><img src="${siteConfig.url}/badge/mallorca-verified-2026-${variant}.svg" alt="${name} — Verified on Mallorca Verified 2026" width="220" height="56" loading="lazy" style="border:0"></a>`;

  return (
    <main className="bg-[#07101F] text-white">
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00C37A]">{c.eyebrow}</p>
        <h1 className="font-display mt-3 text-3xl font-black leading-tight sm:text-5xl">{c.title(name)}</h1>
        <p className="mt-5 text-base leading-8 text-white/65">{c.intro(name)}</p>

        <div className="mt-10 rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-5 sm:p-6">
          <div className="flex items-center justify-center rounded-sm bg-[#0A1626] p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badge/mallorca-verified-2026-dark.svg" alt={`${name} — Verified on Mallorca Verified 2026`} width={224} height={58} />
          </div>
          <BadgeCopyBlock label={`${c.darkLabel} · ${c.codeLabel}`} code={snippet("dark")} copyLabel={c.copyLabel} copiedLabel={c.copiedLabel} />
        </div>

        <div className="mt-6 rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-5 sm:p-6">
          <div className="flex items-center justify-center rounded-sm bg-white p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badge/mallorca-verified-2026-light.svg" alt={`${name} — Verified on Mallorca Verified 2026`} width={224} height={58} />
          </div>
          <BadgeCopyBlock label={`${c.lightLabel} · ${c.codeLabel}`} code={snippet("light")} copyLabel={c.copyLabel} copiedLabel={c.copiedLabel} />
        </div>

        <div className="mt-10 rounded-sm border border-[#00C37A]/25 bg-[#00C37A]/[0.06] p-6">
          <h2 className="font-display text-xl font-bold">{c.helpTitle}</h2>
          <p className="mt-2 text-[15px] leading-7 text-white/70">{c.helpText}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-5 text-sm">
          <a href={fichaUrl} className="font-semibold text-[#00C37A] hover:text-white">{c.fichaLabel} →</a>
          <Link href={`/${safeLocale}/badge`} className="font-semibold text-white/50 hover:text-white">{c.aboutLabel} →</Link>
        </div>
      </section>
    </main>
  );
}
