import type { Locale } from "@/lib/i18n";

// EN↔DE guide pairs published under different slugs per language.
// Same topic, translated slug — hreflang must link them as alternates.
const guideSlugPairs: Array<Partial<Record<Locale, string>>> = [
  { en: "best-beaches-mallorca", de: "schoenste-straende-mallorca" },
  { en: "mallorca-weather-by-month", de: "mallorca-wetter-nach-monat" },
  { en: "english-speaking-dentists-mallorca", de: "deutschsprachige-zahnaerzte-mallorca" },
  { en: "things-to-do-palma-mallorca", de: "sehenswuerdigkeiten-palma-mallorca" },
  { en: "things-to-know-about-mallorca", de: "mallorca-wissenswertes" },
  { en: "best-events-mallorca-summer-2026", de: "beste-events-mallorca-sommer-2026" },
  { es: "que-hacer-en-mallorca", en: "que-hacer-en-mallorca", de: "was-tun-auf-mallorca" },
  { en: "mallorca-prices-2026", de: "mallorca-preise-2026" },
  { en: "palmanova-magaluf-couples-worth-it", de: "palmanova-magaluf-fuer-paare" },
  { en: "botox-mallorca-prices-safety", de: "botox-mallorca-kosten-sicherheit" },
  { en: "english-speaking-aesthetic-clinics-mallorca", de: "deutschsprachige-schoenheitskliniken-mallorca" }
];

export function getGuideSlugForLocale(slug: string, locale: Locale): string {
  const pair = guideSlugPairs.find((entry) => Object.values(entry).includes(slug));
  return pair?.[locale] ?? slug;
}
