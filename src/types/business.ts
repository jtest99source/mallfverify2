export type BusinessCategory =
  | "restaurant"
  | "hotel"
  | "beach-club"
  | "boat-rental"
  | "activity"
  | "beach"
  | "bar"
  | "cafe"
  | "nightlife"
  | "bakery"
  | "rent-a-car"
  | "car-dealer"
  | "spa"
  | "gym"
  | "healthcare"
  | "real-estate"
  | "market"
  | "local-shop"
  | "museum"
  | "route"
  | "excursion";

export type PriceLevel = "€" | "€€" | "€€€" | "€€€€";

export type ContentStatus = "draft" | "published" | "premium" | "hidden";

export type PriorityLevel = "low" | "medium" | "high";

export type ImageStatus =
  | "missing"
  | "editorial_placeholder"
  | "uploaded"
  | "google_places"
  | "client_provided"
  | "candidate_assigned";

export type FAQ = {
  question: string;
  answer: string;
};

export type ImageCandidate = {
  url: string;
  source: "official_website" | "google_places";
  field?: "og:image" | "twitter:image" | "image_src" | "img" | "srcset" | "background" | "google_place_photo";
  extractionMethod?: "meta" | "img" | "srcset" | "background" | "google_places_photo";
  confidence?: "high" | "medium" | "low";
  reason?: string;
  imageQualityScore?: number;
  imageQualityReasons?: string[];
  pageUrl?: string;
  foundAt?: string;
  credit?: string;
  photoName?: string;
  widthPx?: number;
  heightPx?: number;
};

export type GoogleReview = {
  authorName?: string;
  authorUri?: string;
  rating?: number;
  relativeTimeDescription?: string;
  text?: string;
  languageCode?: string;
};

export type BusinessFact = {
  key?: string;
  label: string;
  value: string;
  source?: string;
};

export type VisitTip = {
  key?: string;
  label: string;
  value: string;
  source?: string;
};

export type PlacePhoto = {
  name?: string;
  widthPx?: number | null;
  heightPx?: number | null;
  credit?: string;
};

export type ReviewSentiment = Record<string, number>;

export type ReviewTheme = {
  label: string;
  icon?: string | null;
  mentions: number;
};

export type EditorialService = {
  label: string;
  icon: string;
};

export type AttributeConfidence = "high" | "medium" | "low";
export type PriceSignal = "good_value" | "fair" | "expensive" | "mixed";
export type PriceUnit = "person" | "night" | "day" | "half_day" | "charter" | "ticket" | "entry" | "menu";
export type PriceSource = "reviews" | "places" | "google_places" | "website" | "manual";

export type PriceEstimate = {
  amount_min?: number | null;
  amount_max?: number | null;
  level?: number | null;
  per_person_min?: number | null;
  per_person_max?: number | null;
  range_min?: number | null;
  range_max?: number | null;
  currency?: string | null;
  unit?: PriceUnit | null;
  label?: string | null;
  source?: PriceSource | null;
  confidence?: AttributeConfidence | null;
  reported_by?: number | null;
  breakdown?: Array<{ range: string; votes: number }> | null;
  note?: string | null;
};

export type FeaturedReview = {
  author?: string | null;
  rating?: number | null;
  date?: string | null;
  text: string;
  text_translated?: string | null;
  translated_from?: string | null;
  translations?: Partial<Record<"es" | "en" | "de", string>> | null;
  topic?: string | null;
  lang?: string | null;
};

export type EditorialSource = "ai" | "human" | "ai_then_human";

export type SocialProfiles = {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  website?: string;
  [key: string]: string | undefined;
};

export type RestaurantAttributes = {
  cuisine_types: string[];
  signature_items: string[];
  atmosphere_tags: string[];
  service_notes: string[];
  reservation_notes: string[];
  price_signal: PriceSignal | null;
  dietary_notes: string[];
  best_for: string[];
};

export type HotelAttributes = {
  stay_type: string[];
  amenities: string[];
  room_notes: string[];
  food_board_notes: string[];
  family_friendliness: string[];
  location_strengths: string[];
  service_highlights: string[];
  cautions: string[];
  best_for: string[];
};

export type BeachClubAttributes = {
  setting: string[];
  food_drink_highlights: string[];
  atmosphere_tags: string[];
  daybed_or_pool_facilities: string[];
  reservation_notes: string[];
  price_signal: PriceSignal | null;
  music_vibe: string[];
  access_to_sea: string[];
  best_for: string[];
};

export type BoatRentalAttributes = {
  experience_type: "party_boat" | "jet_ski" | "private_sailing" | "charter" | "boat_tour" | "unknown";
  guided_or_skippered: string[];
  duration_notes: string[];
  route_or_stops: string[];
  included_extras: string[];
  safety_or_accessibility_notes: string[];
  price_signal: PriceSignal | null;
  group_fit: string[];
  best_for: string[];
};

export type ActivityAttributes = {
  activity_type: string[];
  main_highlights: string[];
  duration_notes: string[];
  ticket_or_booking_notes: string[];
  access_notes: string[];
  crowd_timing_notes: string[];
  guided_experience: string[];
  physical_difficulty: string[];
  best_for: string[];
};

export type BeachAttributes = {
  landscape_tags: string[];
  water_conditions: string[];
  terrain: string[];
  crowding: string[];
  access_and_parking: string[];
  facilities: string[];
  rentals_or_prices: string[];
  family_accessibility: string[];
  nearby_food: string[];
  best_time_notes: string[];
};

export type CategoryAttributeDataByCategory = {
  restaurant: RestaurantAttributes;
  hotel: HotelAttributes;
  "beach-club": BeachClubAttributes;
  "boat-rental": BoatRentalAttributes;
  activity: ActivityAttributes;
  beach: BeachAttributes;
};

export type AttributeBusinessCategory = keyof CategoryAttributeDataByCategory;

export type CategoryAttributes<C extends AttributeBusinessCategory = AttributeBusinessCategory> = {
  schema_version: 1;
  confidence: AttributeConfidence;
  data: CategoryAttributeDataByCategory[C];
};

export type AnyCategoryAttributes =
  | CategoryAttributes<"restaurant">
  | CategoryAttributes<"hotel">
  | CategoryAttributes<"beach-club">
  | CategoryAttributes<"boat-rental">
  | CategoryAttributes<"activity">
  | CategoryAttributes<"beach">;

export type Business = {
  id: string;
  slug: string;
  name: string;
  originalName?: string;
  displayName?: string;
  nameQualityStatus?: string;
  category: BusinessCategory;
  shortDescription: string;
  description: string;
  area: string;
  city?: string;
  municipality?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  instagram?: string;
  phone?: string;
  priceLevel?: PriceLevel;
  tags: string[];
  bestFor: string[];
  image?: string;
  primaryImageUrl?: string;
  primaryImageSource?: string;
  primaryImageCredit?: string;
  galleryImageUrls?: string[];
  imageStatus?: ImageStatus;
  imageCandidateUrls?: ImageCandidate[];
  gallery?: string[];
  openingHours?: string;
  faqs: FAQ[];
  seo: {
    title: string;
    description: string;
  };
  updatedAt: string;
  googlePlaceId?: string;
  rawGooglePlace?: Record<string, unknown>;
  photoNames?: string[];
  placePhotos?: PlacePhoto[];
  placeReviews?: GoogleReview[];
  businessFacts?: BusinessFact[];
  visitTips?: VisitTip[];
  editorialOpinion?: string;
  highlights?: string[];
  reservationHint?: string;
  parkingHint?: string;
  seasonHint?: string;
  detailEnrichedAt?: string;
  googleReviews?: GoogleReview[];
  rating?: number;
  reviewsCount?: number;
  googleMapsUrl?: string;
  source?: string;
  status?: ContentStatus;
  commercialPriority?: PriorityLevel;
  clientPotential?: PriorityLevel;
  isFeatured?: boolean;
  isClaimed?: boolean;
  isPromoted?: boolean;
  promotedLabel?: string;
  isFeaturedGuide?: boolean;
  authorityScore?: number;
  untappedScore?: number | null;
  websiteType?: string;
  aiDescription?: string;
  editorialDescription?: string;
  idealFor?: string[];
  whatToExpect?: string;
  reviewSummary?: string;
  faqAuto?: FAQ[];
  editorialStatus?: string;
  reviewSentiment?: ReviewSentiment;
  reviewThemes?: ReviewTheme[];
  reviewPros?: string[];
  reviewCons?: string[];
  services?: EditorialService[];
  priceEstimate?: PriceEstimate;
  categoryAttributes?: AnyCategoryAttributes;
  socialProfiles?: SocialProfiles;
  featuredReviews?: FeaturedReview[];
  businessSelfDescription?: string;
  editorialGeneratedAt?: string;
  editorialSource?: EditorialSource;
};
