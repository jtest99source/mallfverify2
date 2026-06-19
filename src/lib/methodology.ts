import type { Locale } from "@/lib/i18n";

export const methodologySlugs: Record<Locale, string> = {
  es: "metodologia",
  en: "methodology",
  de: "methodik"
};

export const aboutSlugs: Record<Locale, string> = {
  es: "quienes-somos",
  en: "about",
  de: "uber-uns"
};

export const editorialSlugs: Record<Locale, string> = {
  es: "politica-editorial",
  en: "editorial-policy",
  de: "redaktionelle-richtlinien"
};

export type StaticPageType = "methodology" | "about" | "editorial";

export function getStaticPageType(locale: Locale, slug: string): StaticPageType | null {
  if (slug === methodologySlugs[locale]) return "methodology";
  if (slug === aboutSlugs[locale]) return "about";
  if (slug === editorialSlugs[locale]) return "editorial";
  return null;
}

export function methodologyPath(locale: Locale) {
  return `/${locale}/${methodologySlugs[locale]}`;
}

export function aboutPath(locale: Locale) {
  return `/${locale}/${aboutSlugs[locale]}`;
}

export function editorialPath(locale: Locale) {
  return `/${locale}/${editorialSlugs[locale]}`;
}
