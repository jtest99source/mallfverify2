import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const copy = {
  es: {
    title: "¿Tu negocio no aparece en esta lista?",
    text: "La ficha básica es gratuita. Sugiérenos el local y lo revisamos.",
    cta: "Sugerir un negocio →"
  },
  en: {
    title: "Is your business missing from this list?",
    text: "The basic listing is free. Suggest the business and we'll review it.",
    cta: "Suggest a business →"
  },
  de: {
    title: "Fehlt dein Betrieb in dieser Liste?",
    text: "Das Basisprofil ist kostenlos. Schlage den Betrieb vor — wir prüfen ihn.",
    cta: "Betrieb vorschlagen →"
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
      <Link
        href={`/${locale}/suggest`}
        className="shrink-0 rounded-md bg-[#0E8F72] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_4px_14px_rgba(14,143,114,0.25)] transition-all duration-150 hover:bg-[#047857]"
      >
        {text.cta}
      </Link>
    </div>
  );
}
