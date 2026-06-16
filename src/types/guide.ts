import type { ContentStatus, FAQ } from "./business";
import type { Locale } from "@/lib/i18n";

export type Guide = {
  id: string;
  slug: string;
  locale: Locale;
  title: string;
  excerpt: string;
  intro: string;
  heroImageUrl?: string;
  sections: {
    heading: string;
    body: string;
    area?: string;
    best_for?: string[];
    business_ids?: string[];
  }[];
  faqs: FAQ[];
  seo: {
    title: string;
    description: string;
  };
  updatedAt: string;
  status?: ContentStatus;
  source?: string;
  isFeatured?: boolean;
};
