export const locales = ["es", "en", "de"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function localeLabel(locale: Locale) {
  return { es: "Español", en: "English", de: "Deutsch" }[locale];
}
