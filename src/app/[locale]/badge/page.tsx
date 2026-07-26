import { generateSeoMetadata } from "@/lib/seo";
import { isLocale, type Locale } from "@/lib/i18n";

// Reader-facing explainer for the "Verified on Mallorca Verified" badge:
// what it means when a business displays it and how to check it's genuine.
// The embed code is NOT public — it's delivered privately (WhatsApp) to
// verified businesses only, personalised with a link to their own listing.

const copy = {
  es: {
    eyebrow: "El sello de verificación",
    title: "Qué significa el sello de Mallorca Verified",
    intro:
      "Si ves este sello en la web de un negocio, significa que hemos contactado con él directamente, que nos ha confirmado sus datos, y que mantiene una ficha verificada activa en Mallorca Verified — con sus valoraciones reales de Google a la vista.",
    howTitle: "Cómo verificamos un negocio",
    how: [
      "Contactamos con cada negocio directamente (por WhatsApp) — no es un registro automático ni un directorio de pago.",
      "El negocio confirma sus datos: los idiomas en los que atiende, y la información de su ficha.",
      "Cada confirmación queda fechada. El año del sello se actualiza anualmente con la revisión de datos.",
      "Las valoraciones que mostramos son las públicas de Google — nosotros no las editamos ni las filtramos."
    ],
    checkTitle: "Cómo saber que un sello es auténtico",
    checkText:
      "Cada sello legítimo enlaza a la ficha verificada del propio negocio en mallorcaverified.com. Haz clic: si llegas a su ficha, con su nombre y sus valoraciones, es auténtico. Un sello que no enlaza a la ficha del negocio que lo muestra, no es válido.",
    bizTitle: "¿Tienes un negocio verificado?",
    bizText:
      "Si tu negocio ya está verificado, el sello es gratuito: respóndenos al mensaje de verificación por WhatsApp o escribe a hola@mallorcaverified.com y te enviamos tu código personalizado (una línea para el pie de tu web — y si lo prefieres, te lo instalamos nosotros).",
    bizCta: "Escribir a hola@mallorcaverified.com",
    fineprint:
      "El sello está reservado a negocios con ficha verificada activa. La confirmación de idiomas es una autodeclaración del negocio obtenida por contacto directo, con fecha. Que un negocio no muestre el sello no significa nada negativo: puede simplemente no haberlo instalado aún."
  },
  en: {
    eyebrow: "The verification badge",
    title: "What the Mallorca Verified badge means",
    intro:
      "If you see this badge on a business's website, it means we contacted them directly, they confirmed their details to us, and they hold an active verified listing on Mallorca Verified — with their real Google ratings in plain view.",
    howTitle: "How we verify a business",
    how: [
      "We contact every business directly (via WhatsApp) — it's not an automatic registration or a paid directory.",
      "The business confirms its details: the languages it serves clients in, and the information on its listing.",
      "Every confirmation is dated. The badge year updates annually with the data review.",
      "The ratings we show are the public Google ones — we don't edit or filter them."
    ],
    checkTitle: "How to tell a badge is genuine",
    checkText:
      "Every legitimate badge links to that business's own verified listing on mallorcaverified.com. Click it: if you land on their listing, with their name and their ratings, it's genuine. A badge that doesn't link to the listing of the business displaying it is not valid.",
    bizTitle: "Run a verified business?",
    bizText:
      "If your business is already verified, the badge is free: reply to our WhatsApp verification message or write to hola@mallorcaverified.com and we'll send your personalised code (one line for your website footer — or we'll install it for you).",
    bizCta: "Email hola@mallorcaverified.com",
    fineprint:
      "The badge is reserved for businesses with an active verified listing. Language confirmations are self-reported by each business via direct contact, and dated. A business not displaying the badge means nothing negative — it may simply not have installed it yet."
  },
  de: {
    eyebrow: "Das Verifizierungssiegel",
    title: "Was das Mallorca-Verified-Siegel bedeutet",
    intro:
      "Wenn Sie dieses Siegel auf der Website eines Betriebs sehen, heißt das: Wir haben ihn direkt kontaktiert, er hat uns seine Daten bestätigt, und er führt ein aktives geprüftes Profil auf Mallorca Verified — mit seinen echten Google-Bewertungen offen einsehbar.",
    howTitle: "Wie wir einen Betrieb prüfen",
    how: [
      "Wir kontaktieren jeden Betrieb direkt (per WhatsApp) — keine automatische Registrierung, kein bezahltes Verzeichnis.",
      "Der Betrieb bestätigt seine Daten: die Sprachen, in denen er Kunden betreut, und die Angaben seines Profils.",
      "Jede Bestätigung ist datiert. Die Jahreszahl des Siegels wird jährlich mit der Datenprüfung aktualisiert.",
      "Die angezeigten Bewertungen sind die öffentlichen von Google — wir bearbeiten und filtern sie nicht."
    ],
    checkTitle: "Woran Sie ein echtes Siegel erkennen",
    checkText:
      "Jedes legitime Siegel verlinkt auf das geprüfte Profil des jeweiligen Betriebs auf mallorcaverified.com. Klicken Sie darauf: Landen Sie auf dessen Profil — mit Name und Bewertungen — ist es echt. Ein Siegel, das nicht auf das Profil des Betriebs verlinkt, der es zeigt, ist ungültig.",
    bizTitle: "Sie führen einen geprüften Betrieb?",
    bizText:
      "Ist Ihr Betrieb bereits verifiziert, ist das Siegel kostenlos: Antworten Sie auf unsere WhatsApp-Nachricht oder schreiben Sie an hola@mallorcaverified.com — wir senden Ihnen Ihren personalisierten Code (eine Zeile für die Fußzeile Ihrer Website, auf Wunsch richten wir es ein).",
    bizCta: "E-Mail an hola@mallorcaverified.com",
    fineprint:
      "Das Siegel ist Betrieben mit aktivem geprüftem Eintrag vorbehalten. Sprachbestätigungen sind datierte Selbstauskünfte per Direktkontakt. Kein Siegel zu zeigen bedeutet nichts Negatives — der Betrieb hat es womöglich nur noch nicht eingebunden."
  }
} as const;

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
          <img src="/badge/mallorca-verified-2026-dark.svg" alt="Verified on Mallorca Verified 2026" width={224} height={58} />
          <span className="rounded-sm bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badge/mallorca-verified-2026-light.svg" alt="Verified on Mallorca Verified 2026" width={224} height={58} />
          </span>
        </div>

        <h2 className="font-display mt-12 text-2xl font-bold">{c.howTitle}</h2>
        <ol className="mt-4 grid gap-3">
          {c.how.map((step, index) => (
            <li key={index} className="flex gap-3 text-[15px] leading-7 text-white/70">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00C37A] text-xs font-black text-[#07101F]">{index + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        <h2 className="font-display mt-12 text-2xl font-bold">{c.checkTitle}</h2>
        <p className="mt-3 text-[15px] leading-7 text-white/70">{c.checkText}</p>

        <div className="mt-12 rounded-sm border border-[#00C37A]/25 bg-[#00C37A]/[0.06] p-6">
          <h2 className="font-display text-2xl font-bold">{c.bizTitle}</h2>
          <p className="mt-3 text-[15px] leading-7 text-white/70">{c.bizText}</p>
          <a
            href="mailto:hola@mallorcaverified.com?subject=Badge Mallorca Verified"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#00C37A] px-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#0A0A0A] hover:bg-white"
          >
            {c.bizCta}
          </a>
        </div>

        <p className="mt-10 text-xs leading-6 text-white/40">{c.fineprint}</p>
      </section>
    </main>
  );
}
