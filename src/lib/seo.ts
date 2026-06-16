import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/data";
import { siteConfig } from "@/config/site";

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
  const languages = Object.fromEntries([
    ...alternateLocales.map((item) => [item, `${siteUrl}/${item}${pathWithoutLocale}`]),
    ["x-default", `${siteUrl}/es${pathWithoutLocale}`]
  ]);

  return {
    title,
    description,
    robots,
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
      images: image ? [{ url: image }] : undefined
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined
    }
  };
}
