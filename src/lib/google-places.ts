import type { BusinessCategory, PriorityLevel } from "@/types/business";
import { toSlug } from "@/lib/slugs";

type GooglePlace = {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  url?: string;
  website?: string;
  international_phone_number?: string;
  geometry?: {
    location?: {
      lat?: number;
      lng?: number;
    };
  };
};

export function mapGooglePlaceToBusinessInput(place: GooglePlace, category: BusinessCategory, defaults?: { area?: string; commercialPriority?: PriorityLevel; clientPotential?: PriorityLevel }) {
  const name = place.name ?? "Imported Google Place";
  return {
    id: place.place_id ?? toSlug(name),
    slug: toSlug(name),
    name,
    category,
    short_description: "",
    description: "",
    area: defaults?.area ?? "",
    address: place.formatted_address ?? null,
    latitude: place.geometry?.location?.lat ?? null,
    longitude: place.geometry?.location?.lng ?? null,
    website: place.website ?? null,
    phone: place.international_phone_number ?? null,
    google_place_id: place.place_id ?? null,
    rating: place.rating ?? null,
    reviews_count: place.user_ratings_total ?? null,
    google_maps_url: place.url ?? null,
    source: "google_places",
    status: "draft",
    commercial_priority: defaults?.commercialPriority ?? "low",
    client_potential: defaults?.clientPotential ?? "medium",
    is_featured: false,
    is_claimed: false,
    raw_google_place: place,
    imported_at: new Date().toISOString()
  };
}
