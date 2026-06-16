export type SeedImage = {
  image_key: string;
  queries: string[];
  category?: string;
};

export const editorialImageSeeds: SeedImage[] = [
  { image_key: "homepage_hero", queries: ["Mallorca coast", "Balearic Islands coast", "Mallorca Mediterranean landscape"], category: "homepage" },
  { image_key: "category_restaurant", queries: ["Mediterranean restaurant", "Mallorca restaurant terrace", "Balearic Islands restaurant"], category: "restaurant" },
  { image_key: "category_hotel", queries: ["Mallorca hotel", "Balearic Islands hotel", "Mediterranean boutique hotel"], category: "hotel" },
  {
    image_key: "category_beach_club",
    queries: ["Mallorca beach club", "Mediterranean beach club", "Balearic beach club", "luxury beach club Mallorca", "seaside lounge Mallorca"],
    category: "beach-club"
  },
  { image_key: "category_boat_rental", queries: ["yacht Mallorca", "Mallorca yacht charter", "Mediterranean sailing boat"], category: "boat-rental" },
  { image_key: "category_activity", queries: ["Mallorca hiking", "Mallorca mountains hiking", "Balearic Islands hiking"], category: "activity" },
  { image_key: "category_beach", queries: ["Mallorca beach", "Balearic Islands beach", "Mallorca cala"], category: "beach" },
  { image_key: "fallback_restaurant", queries: ["Mediterranean restaurant Mallorca", "restaurant terrace Mallorca", "Mediterranean dining"], category: "restaurant" },
  { image_key: "fallback_hotel", queries: ["Balearic Islands hotel", "Mallorca boutique hotel", "Mediterranean hotel exterior"], category: "hotel" },
  {
    image_key: "fallback_beach_club",
    queries: ["beach club terrace", "Mediterranean seaside restaurant", "Mallorca beach bar", "Balearic coast restaurant"],
    category: "beach-club"
  },
  { image_key: "fallback_boat_rental", queries: ["Mallorca yacht charter", "sailing Mallorca", "Mediterranean yacht"], category: "boat-rental" },
  { image_key: "fallback_activity", queries: ["Mallorca mountains hiking", "Mallorca outdoor activity", "Balearic hiking trail"], category: "activity" },
  { image_key: "fallback_beach", queries: ["Balearic Islands beach", "Mallorca turquoise beach", "Mediterranean cove"], category: "beach" }
];

export function genericEditorialQueries(title: string, category?: string) {
  const base = category || "Mallorca";
  return [
    `${title} Mallorca`,
    `${base} Mallorca`,
    `Balearic Islands ${base}`
  ];
}

export function editorialSeedSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_+|_+$)/g, "")
    .slice(0, 80);
}
