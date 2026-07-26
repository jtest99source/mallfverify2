import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";

// Instructions page for the "Verified on Mallorca Verified" badge — written for
// non-technical business owners: one line of HTML, or we install it for them.

const copy = {
  es: {
    eyebrow: "Para negocios verificados",
    title: "El sello de verificación de Mallorca Verified",
    intro:
      "Si tu negocio está verificado en Mallorca Verified, puedes mostrar el sello en tu web. Enlaza directamente a tu ficha, ayuda a tus clientes a comprobar tus valoraciones reales y mejora cómo te encuentran Google y los asistentes de IA.",
    stepsTitle: "Cómo añadirlo (2 minutos)",
    steps: [
      "Copia el código personalizado que te hemos enviado (una sola línea; si no lo tienes, escríbenos y te lo mandamos).",
      "Pégalo en el pie de página de tu web. En WordPress: Apariencia → Widgets → HTML personalizado. En Wix: Añadir → Insertar código. En Squarespace: bloque de código.",
      "Guarda y listo — el sello aparece y enlaza a tu ficha verificada."
    ],
    exampleTitle: "Así se ve el código (el tuyo llega personalizado):",
    helpTitle: "¿Prefieres que lo hagamos nosotros?",
    helpText:
      "Sin problema y sin coste: respóndenos al mensaje de verificación o escribe a hola@mallorcaverified.com y nuestro equipo lo deja instalado por ti.",
    helpCta: "Escribir a hola@mallorcaverified.com",
    fineprint:
      "El sello está reservado a negocios con ficha verificada activa en Mallorca Verified. El año se actualiza anualmente junto con la revisión de datos."
  },
  en: {
    eyebrow: "For verified businesses",
    title: "The Mallorca Verified badge",
    intro:
      "If your business is verified on Mallorca Verified, you can display the badge on your website. It links straight to your listing, lets your customers check your real ratings, and improves how Google and AI assistants find you.",
    stepsTitle: "How to add it (2 minutes)",
    steps: [
      "Copy the personalised code we sent you (a single line; if you don't have it, message us and we'll send it).",
      "Paste it into your website footer. WordPress: Appearance → Widgets → Custom HTML. Wix: Add → Embed code. Squarespace: code block.",
      "Save — the badge appears and links to your verified listing."
    ],
    exampleTitle: "What the code looks like (yours arrives personalised):",
    helpTitle: "Rather we do it for you?",
    helpText:
      "No problem and no cost: reply to our verification message or write to hola@mallorcaverified.com and our team will set it up for you.",
    helpCta: "Email hola@mallorcaverified.com",
    fineprint:
      "The badge is reserved for businesses with an active verified listing on Mallorca Verified. The year updates annually together with the data review."
  },
  de: {
    eyebrow: "Für geprüfte Betriebe",
    title: "Das Mallorca-Verified-Siegel",
    intro:
      "Wenn Ihr Betrieb auf Mallorca Verified geprüft ist, können Sie das Siegel auf Ihrer Website zeigen. Es verlinkt direkt auf Ihr Profil, lässt Ihre Kunden Ihre echten Bewertungen prüfen und verbessert, wie Google und KI-Assistenten Sie finden.",
    stepsTitle: "So fügen Sie es ein (2 Minuten)",
    steps: [
      "Kopieren Sie den personalisierten Code aus unserer Nachricht (eine einzige Zeile; falls er fehlt, schreiben Sie uns kurz).",
      "Fügen Sie ihn in die Fußzeile Ihrer Website ein. WordPress: Design → Widgets → Individuelles HTML. Wix: Hinzufügen → Code einbetten. Squarespace: Code-Block.",
      "Speichern — das Siegel erscheint und verlinkt auf Ihr geprüftes Profil."
    ],
    exampleTitle: "So sieht der Code aus (Ihrer kommt personalisiert):",
    helpTitle: "Sollen wir das übernehmen?",
    helpText:
      "Kein Problem und kostenlos: Antworten Sie auf unsere Verifizierungs-Nachricht oder schreiben Sie an hola@mallorcaverified.com — unser Team richtet es für Sie ein.",
    helpCta: "E-Mail an hola@mallorcaverified.com",
    fineprint:
      "Das Siegel ist Betrieben mit aktivem geprüftem Eintrag auf Mallorca Verified vorbehalten. Die Jahreszahl wird jährlich mit der Datenprüfung aktualisiert."
  }
} as const;

const EXAMPLE_SNIPPET = `<a href="https://www.mallorcaverified.com/es/healthcare/tu-negocio">
  <img src="https://www.mallorcaverified.com/badge/mallorca-verified-2026-dark.svg"
       alt="Verified on Mallorca Verified 2026" width="220" height="56">
</a>`;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "es";
  const c = copy[safeLocale];
  return generateSeoMetadata({
    title: `${c.title} | Mallorca Verified`,
    description: c.intro.slice(0, 158),
    path: `/${safeLocale}/badge`,
    locale: safeLocale
  });
}

export default async function BadgePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (isLocale(locale) ? locale : "es") as Locale;
  const c = copy[safeLocale];

  return (
    <main className="bg-[#07101F] text-white">
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#00C37A]">{c.eyebrow}</p>
        <h1 className="font-display mt-3 text-4xl font-black leading-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-5 text-base leading-8 text-white/65">{c.intro}</p>

        <div className="mt-8 flex flex-wrap items-center gap-6 rounded-sm border border-white/[0.10] bg-[#0C1A2E] p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/badge/mallorca-verified-2026-dark.svg" alt="Verified on Mallorca Verified 2026 (dark)" width={220} height={56} />
          <span className="rounded-sm bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badge/mallorca-verified-2026-light.svg" alt="Verified on Mallorca Verified 2026 (light)" width={220} height={56} />
          </span>
        </div>

        <h2 className="font-display mt-12 text-2xl font-bold">{c.stepsTitle}</h2>
        <ol className="mt-4 grid gap-3">
          {c.steps.map((step, index) => (
            <li key={index} className="flex gap-3 text-[15px] leading-7 text-white/70">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00C37A] text-xs font-black text-[#07101F]">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-sm font-bold uppercase tracking-[0.1em] text-white/50">{c.exampleTitle}</p>
        <pre className="mt-3 overflow-x-auto rounded-sm border border-white/[0.10] bg-[#040D1A] p-4 text-xs leading-6 text-[#00C37A]">{EXAMPLE_SNIPPET}</pre>

        <div className="mt-12 rounded-sm border border-[#00C37A]/25 bg-[#00C37A]/[0.06] p-6">
          <h2 className="font-display text-2xl font-bold">{c.helpTitle}</h2>
          <p className="mt-3 text-[15px] leading-7 text-white/70">{c.helpText}</p>
          <a
            href="mailto:hola@mallorcaverified.com?subject=Badge Mallorca Verified"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#00C37A] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white"
          >
            {c.helpCta}
          </a>
        </div>

        <p className="mt-10 text-xs leading-6 text-white/40">{c.fineprint}</p>
      </section>
    </main>
  );
}
