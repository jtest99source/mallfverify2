import type { ContentStatus, FAQ } from "./business";
import type { Locale } from "@/lib/i18n";

export type RankingCategory =
  | "restaurants"
  | "hotels"
  | "beach-clubs"
  | "boats"
  | "activities"
  | "beaches"
  | "bars"
  | "cafes"
  | "bakeries"
  | "rent-a-car"
  | "car-dealers"
  | "spas"
  | "gyms"
  | "markets"
  | "local-shops"
  | "museums"
  | "routes"
  | "excursions";

export type Ranking = {
  id: string;
  slug: string;
  locale: Locale;
  title: string;
  hook: string;
  intro: string;
  heroImageUrl?: string;
  category: RankingCategory;
  area?: string;
  items: {
    position: number;
    businessId?: string;
    name: string;
    description: string;
    whyWePickedIt: string;
    bestFor: string[];
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
