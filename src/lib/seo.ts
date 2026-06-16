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
};

export function generateSeoMetadata({ title, description, path, locale, type = "website", image }: SeoInput): Metadata {
  const canonical = `${siteUrl}${path}`;
  const languages = Object.fromEntries(locales.map((item) => [item, `${siteUrl}${path.replace(`/${locale}`, `/${item}`)}`]));

  return {
    title,
    description,
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
