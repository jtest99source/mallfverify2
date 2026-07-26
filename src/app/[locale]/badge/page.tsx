import { CopyButton } from "@/components/CopyButton";
import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";
import { getCategorySlugFromBusiness, siteUrl } from "@/lib/data";
import { getBusinessPublicName } from "@/lib/business-name-normalizer";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase";

// Badge delivery page, WhatsApp-outreach-first: each business gets ONE link
// (/badge?b=<slug>) that shows THEIR badge, THEIR one-line snippet with a copy
// button, and the "we install it for you" fallback. The generic page (no ?b=)
// just explains the program. Utility page for the backlink flow — not in nav.

const copy = {
  es: {
    eyebrow: "Para negocios verificados",
    title: "Tu sello de Mallorca Verified",
    titleGeneric: "El sello de verificación de Mallorca Verified",
    intro:
      "Este sello enlaza directamente a tu ficha verificada: tus clientes pueden comprobar tus valoraciones reales y ayuda a que Google y los asistentes de IA te encuentren.",
    yourCode: "Tu código — una sola línea, lista para pegar en el pie de tu web:",
    copy: "Copiar código",
    copied: "¡Copiado!",
    variantNote: "¿Tu web es de fondo claro? Usa esta variante:",
    stepsTitle: "Dónde pegarlo (2 minutos)",
    steps: [
      "WordPress: Apariencia → Widgets → HTML personalizado (zona del pie de página).",
      "Wix: Añadir → Insertar código → pegar en el pie.",
      "Squarespace: bloque de código en el footer.",
      "Cualquier otra web: pásale esta página a tu desarrollador — con esto le basta."
    ],
    helpTitle: "¿Prefieres que lo hagamos nosotros? Gratis.",
    helpText: "Respóndenos por WhatsApp al mensaje de verificación y nuestro equipo lo deja instalado por ti.",
    fineprint:
      "El sello está reservado a negocios con ficha verificada activa en Mallorca Verified. El año se actualiza anualmente junto con la revisión de datos.",
    genericNote: "¿Tu negocio está verificado y quieres el sello? Escríbenos por WhatsApp o a hola@mallorcaverified.com y te mandamos tu enlace personalizado."
  },
  en: {
    eyebrow: "For verified businesses",
    title: "Your Mallorca Verified badge",
    titleGeneric: "The Mallorca Verified badge",
    intro:
      "This badge links straight to your verified listing: your customers can check your real ratings, and it helps Google and AI assistants find you.",
    yourCode: "Your code — a single line, ready to paste into your website footer:",
    copy: "Copy code",
    copied: "Copied!",
    variantNote: "Light-background website? Use this variant:",
    stepsTitle: "Where to paste it (2 minutes)",
    steps: [
      "WordPress: Appearance → Widgets → Custom HTML (footer area).",
      "Wix: Add → Embed code → paste in the footer.",
      "Squarespace: code block in the footer.",
      "Any other site: send this page to your developer — it's all they need."
    ],
    helpTitle: "Rather we do it for you? Free.",
    helpText: "Reply to our WhatsApp verification message and our team will set it up for you.",
    fineprint:
      "The badge is reserved for businesses with an active verified listing on Mallorca Verified. The year updates annually together with the data review.",
    genericNote: "Verified business without your badge link yet? Message us on WhatsApp or at hola@mallorcaverified.com and we'll send your personalised link."
  },
  de: {
    eyebrow: "Für geprüfte Betriebe",
    title: "Ihr Mallorca-Verified-Siegel",
    titleGeneric: "Das Mallorca-Verified-Siegel",
    intro:
      "Dieses Siegel verlinkt direkt auf Ihr geprüftes Profil: Ihre Kunden können Ihre echten Bewertungen prüfen, und Google sowie KI-Assistenten finden Sie leichter.",
    yourCode: "Ihr Code — eine einzige Zeile, bereit für die Fußzeile Ihrer Website:",
    copy: "Code kopieren",
    copied: "Kopiert!",
    variantNote: "Website mit hellem Hintergrund? Nutzen Sie diese Variante:",
    stepsTitle: "Wo einfügen (2 Minuten)",
    steps: [
      "WordPress: Design → Widgets → Individuelles HTML (Fußzeile).",
      "Wix: Hinzufügen → Code einbetten → in der Fußzeile einfügen.",
      "Squarespace: Code-Block im Footer.",
      "Andere Website: Schicken Sie diese Seite Ihrem Entwickler — mehr braucht er nicht."
    ],
    helpTitle: "Sollen wir das übernehmen? Kostenlos.",
    helpText: "Antworten Sie auf unsere WhatsApp-Nachricht und unser Team richtet es für Sie ein.",
    fineprint:
      "Das Siegel ist Betrieben mit aktivem geprüftem Eintrag vorbehalten. Die Jahreszahl wird jährlich mit der Datenprüfung aktualisiert.",
    genericNote: "Geprüfter Betrieb ohne persönlichen Badge-Link? Schreiben Sie uns per WhatsApp oder an hola@mallorcaverified.com."
  }
} as const;

async function findBusiness(slug: string) {
  if (!hasSupabaseConfig()) return null;
  const sb = createSupabaseServerClient();
  const { data } = await sb
    .from("businesses")
    .select("slug,name,display_name,category,status")
    .eq("slug", slug)
    .in("status", ["published", "premium"])
    .maybeSingle();
  return data ?? null;
}

function snippetFor(fichaUrl: string, name: string, variant: "dark" | "light") {
  return `<a href="${fichaUrl}" target="_blank" rel="noopener"><img src="${siteUrl}/badge/mallorca-verified-2026-${variant}.svg" alt="${name} — Verified on Mallorca Verified 2026" width="220" height="56" loading="lazy" style="border:0"></a>`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const c = copy[safeLocale];
  return generateSeoMetadata({
    title: `${c.titleGeneric} | Mallorca Verified`,
    description: c.intro.slice(0, 158),
    path: `/${safeLocale}/badge`,
    locale: safeLocale
  });
}

export default async function BadgePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ b?: string }> }) {
  const { locale } = await params;
  const { b } = await searchParams;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const c = copy[safeLocale];

  const business = b ? await findBusiness(b) : null;
  const name = business ? getBusinessPublicName(business as never) || business.display_name || business.name : null;
  const fichaUrl = business ? `${siteUrl}/${safeLocale}/${getCategorySlugFromBusiness(business.category)}/${business.slug}` : null;
  const dark = business && fichaUrl && name ? snippetFor(fichaUrl, name, "dark") : null;
  const light = business && fichaUrl && name ? snippetFor(fichaUrl, name, "light") : null;

  return (
    <main className="bg-[#07101F] text-white">
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00C37A]">{c.eyebrow}</p>
        <h1 className="font-display mt-3 text-4xl font-black leading-tight sm:text-5xl">
          {name ? `${c.title} — ${name}` : c.titleGeneric}
        </h1>
        <p className="mt-5 text-base leading-8 text-white/65">{c.intro}</p>

        <div className="mt-8 flex flex-wrap items-center gap-6 rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/badge/mallorca-verified-2026-dark.svg" alt="Verified on Mallorca Verified 2026 (dark)" width={220} height={56} />
          <span className="rounded-sm bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badge/mallorca-verified-2026-light.svg" alt="Verified on Mallorca Verified 2026 (light)" width={220} height={56} />
          </span>
        </div>

        {dark && light ? (
          <>
            <h2 className="font-display mt-12 text-2xl font-bold">{c.yourCode}</h2>
            <pre className="mt-4 overflow-x-auto rounded-sm border border-white/[0.10] bg-[#040D1A] p-4 text-xs leading-6 text-[#00C37A]">{dark}</pre>
            <div className="mt-3"><CopyButton text={dark} label={c.copy} copiedLabel={c.copied} /></div>

            <p className="mt-8 text-sm font-bold uppercase tracking-[0.1em] text-white/50">{c.variantNote}</p>
            <pre className="mt-3 overflow-x-auto rounded-sm border border-white/[0.10] bg-[#040D1A] p-4 text-xs leading-6 text-[#00C37A]">{light}</pre>
            <div className="mt-3"><CopyButton text={light} label={c.copy} copiedLabel={c.copied} /></div>
          </>
        ) : (
          <p className="mt-10 rounded-sm border border-[#00C37A]/25 bg-[#00C37A]/[0.06] p-5 text-[15px] leading-7 text-white/75">{c.genericNote}</p>
        )}

        <h2 className="font-display mt-12 text-2xl font-bold">{c.stepsTitle}</h2>
        <ol className="mt-4 grid gap-3">
          {c.steps.map((step, index) => (
            <li key={index} className="flex gap-3 text-[15px] leading-7 text-white/70">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00C37A] text-xs font-black text-[#07101F]">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <div className="mt-12 rounded-sm border border-[#00C37A]/25 bg-[#00C37A]/[0.06] p-6">
          <h2 className="font-display text-2xl font-bold">{c.helpTitle}</h2>
          <p className="mt-3 text-[15px] leading-7 text-white/70">{c.helpText}</p>
        </div>

        <p className="mt-10 text-xs leading-6 text-white/40">{c.fineprint}</p>
      </section>
    </main>
  );
}
