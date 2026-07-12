import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/data";
import { siteConfig } from "@/config/site";

const defaultOgImage = `${siteUrl}/brand/mallorca-verified-logo-ai-concept.png`;

type SeoInput = {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  type?: "website" | "article";
  image?: string;
  alternateLocales?: readonly Locale[];
  robots?: Metadata["robots"];
};

export function generateSeoMetadata({ title, description, path, locale, type = "website", image, alternateLocales = locales, robots }: SeoInput): Metadata {
  const canonical = `${siteUrl}${path}`;
  const pathWithoutLocale = path.replace(new RegExp(`^/${locale}(?=/|$)`), "");
  const ogImage = image || defaultOgImage;
  const languages = Object.fromEntries([
    ...alternateLocales.map((item) => [item, `${siteUrl}/${item}${pathWithoutLocale}`]),
    ["x-default", `${siteUrl}/es${pathWithoutLocale}`]
  ]);

  return {
    title,
    description,
    // Only emit robots when explicitly provided — otherwise leave it unset so a
    // parent layout's robots (e.g. the noindexed /experts subtree) is inherited
    // instead of being clobbered by an explicit `undefined`.
    ...(robots ? { robots } : {}),
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      locale,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage]
    }
  };
}
