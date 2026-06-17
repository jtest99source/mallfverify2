import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    title: "¿Tu negocio no aparece en esta lista?",
    text: "La ficha básica es gratuita. Escríbenos y la publicamos.",
    cta: "Añadir mi negocio",
    subject: "Quiero añadir mi negocio a Mallorca Verified"
  },
  en: {
    title: "Is your business missing from this list?",
    text: "The basic profile is free. Get in touch and we'll add it.",
    cta: "Add my business",
    subject: "Add my business to Mallorca Verified"
  },
  de: {
    title: "Fehlt dein Betrieb in dieser Liste?",
    text: "Das Basisprofil ist kostenlos. Schreib uns und wir fügen es hinzu.",
    cta: "Betrieb hinzufügen",
    subject: "Betrieb zu Mallorca Verified hinzufügen"
  }
} as const;

export function BusinessListCTA({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-[#BFE8D2] bg-[#F0FAF5] px-6 py-5 shadow-[0_8px_24px_rgba(14,143,114,0.06)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold text-[#10253D]">{text.title}</p>
        <p className="mt-1 text-[13px] leading-6 text-[#4B5B4D]">{text.text}</p>
      </div>
      <a
        href={`mailto:hola@mallorcaverified.com?subject=${encodeURIComponent(text.subject)}`}
        className="shrink-0 rounded-md bg-[#0E8F72] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_4px_14px_rgba(14,143,114,0.25)] transition-all duration-150 hover:bg-[#047857]"
      >
        {text.cta} →
      </a>
    </div>
  );
}
