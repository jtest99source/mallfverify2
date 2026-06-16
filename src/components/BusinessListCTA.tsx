import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    title: "¿Tu negocio no aparece en esta lista?",
    text: "Si gestionas un negocio en Mallorca que todavía no está en Mallorca Verified, escríbenos. La ficha básica es gratuita.",
    cta: "Añadir mi negocio"
  },
  en: {
    title: "Is your business missing from this list?",
    text: "If you manage a business in Mallorca that is not yet on Mallorca Verified, contact us. The basic profile is free.",
    cta: "Add my business"
  },
  de: {
    title: "Fehlt dein Betrieb in dieser Liste?",
    text: "Wenn du einen Betrieb auf Mallorca führst, der noch nicht auf Mallorca Verified ist, schreib uns. Das Basisprofil ist kostenlos.",
    cta: "Betrieb hinzufügen"
  }
} as const;

export function BusinessListCTA({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-[#E7DED0] bg-white px-6 py-5 shadow-[0_8px_24px_rgba(27,46,75,0.05)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold text-ink">{text.title}</p>
        <p className="mt-1 text-[13px] leading-6 text-sage">{text.text}</p>
      </div>
      <a
        href="mailto:hola@mallorcaverified.com?subject=Add my business to Mallorca Verified"
        className="shrink-0 rounded-md border border-ink bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink transition-all duration-150 hover:bg-ink hover:text-white"
      >
        {text.cta} →
      </a>
    </div>
  );
}
