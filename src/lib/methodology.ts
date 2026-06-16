import type { Locale } from "@/lib/i18n";

export const methodologySlugs: Record<Locale, string> = {
  es: "metodologia",
  en: "methodology",
  de: "methodik"
};

export function methodologyPath(locale: Locale) {
  return `/${locale}/${methodologySlugs[locale]}`;
}
