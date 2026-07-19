import type { Business, LanguageLevel, LanguageVerification } from "@/types/business";
import type { Locale } from "@/lib/i18n";

type WithLang = Pick<Business, "languageVerification">;

export function getLanguageVerification(business: WithLang): LanguageVerification | null {
  const lv = business.languageVerification;
  if (!lv) return null;
  if (!lv.en && !lv.de && !(lv.other && lv.other.length)) return null;
  return lv;
}

export function isLanguageVerified(business: WithLang): boolean {
  return getLanguageVerification(business) !== null;
}

// True when the business confirmed English/German at any level (used by the filter).
export function speaksEnglish(business: WithLang): boolean {
  return !!getLanguageVerification(business)?.en;
}
export function speaksGerman(business: WithLang): boolean {
  return !!getLanguageVerification(business)?.de;
}

export function levelLabel(level: LanguageLevel, locale: Locale): string {
  if (level === "fluent") return locale === "de" ? "Fließend" : locale === "en" ? "Fluent" : "Fluido";
  return locale === "de" ? "Grundkenntnisse" : locale === "en" ? "Basic" : "Básico";
}

// Core English/German chips for the badge, in a stable order.
export type LanguageChip = { code: "en" | "de"; label: string; level: LanguageLevel };
export function coreLanguageChips(lv: LanguageVerification, locale: Locale): LanguageChip[] {
  const chips: LanguageChip[] = [];
  if (lv.en) chips.push({ code: "en", label: locale === "de" ? "Englisch" : locale === "en" ? "English" : "Inglés", level: lv.en });
  if (lv.de) chips.push({ code: "de", label: locale === "de" ? "Deutsch" : locale === "en" ? "German" : "Alemán", level: lv.de });
  return chips;
}

const OTHER_LABELS: Record<string, Record<Locale, string>> = {
  swedish: { es: "Sueco", en: "Swedish", de: "Schwedisch" },
  french: { es: "Francés", en: "French", de: "Französisch" },
  italian: { es: "Italiano", en: "Italian", de: "Italienisch" },
  polish: { es: "Polaco", en: "Polish", de: "Polnisch" },
  romanian: { es: "Rumano", en: "Romanian", de: "Rumänisch" },
  portuguese: { es: "Portugués", en: "Portuguese", de: "Portugiesisch" },
  norwegian: { es: "Noruego", en: "Norwegian", de: "Norwegisch" },
  hungarian: { es: "Húngaro", en: "Hungarian", de: "Ungarisch" },
  slovak: { es: "Eslovaco", en: "Slovak", de: "Slowakisch" },
  dutch: { es: "Neerlandés", en: "Dutch", de: "Niederländisch" },
  russian: { es: "Ruso", en: "Russian", de: "Russisch" }
};
export function otherLanguageLabel(code: string, locale: Locale): string {
  const entry = OTHER_LABELS[code.toLowerCase()];
  if (entry) return entry[locale];
  return code.charAt(0).toUpperCase() + code.slice(1);
}

// "Confirmed July 2026" style label from a "YYYY-MM" confirmedAt.
export function confirmedAtLabel(confirmedAt: string | undefined, locale: Locale): string | null {
  if (!confirmedAt) return null;
  const [y, m] = confirmedAt.split("-").map(Number);
  if (!y || !m) return null;
  const months: Record<Locale, string[]> = {
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]
  };
  return `${months[locale][m - 1]} ${y}`;
}
