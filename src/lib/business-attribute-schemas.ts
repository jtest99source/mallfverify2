import { z } from "zod";
import type { BusinessCategory } from "../types/business";

const confidenceSchema = z.enum(["high", "medium", "low"]);
const priceSignalSchema = z.enum(["good_value", "fair", "expensive", "mixed"]).nullable();
const stringArraySchema = z.array(z.string().min(1).max(160)).default([]);

const baseCategoryAttributesSchema = {
  schema_version: z.literal(1),
  confidence: confidenceSchema
};

export const priceEstimateSchema = z.object({
  amount_min: z.number().min(0).nullable().optional(),
  amount_max: z.number().min(0).nullable().optional(),
  currency: z.string().max(12).nullable().optional(),
  unit: z.enum(["person", "night", "day", "half_day", "charter", "ticket", "entry", "menu"]).nullable().optional(),
  label: z.string().max(80).nullable().optional(),
  source: z.enum(["reviews", "places", "google_places", "website", "manual"]).nullable().optional(),
  confidence: confidenceSchema.nullable().optional(),
  note: z.string().max(260).nullable().optional(),
  reported_by: z.number().min(0).nullable().optional(),
  level: z.number().min(1).max(4).nullable().optional(),
  per_person_min: z.number().min(0).nullable().optional(),
  per_person_max: z.number().min(0).nullable().optional(),
  range_min: z.number().min(0).nullable().optional(),
  range_max: z.number().min(0).nullable().optional(),
  breakdown: z.array(z.object({ range: z.string().max(40), votes: z.number().min(0) })).nullable().optional()
});

export const socialProfilesSchema = z.record(z.string().url()).default({});

export const restaurantAttributesDataSchema = z.object({
  cuisine_types: stringArraySchema,
  signature_items: stringArraySchema,
  atmosphere_tags: stringArraySchema,
  service_notes: stringArraySchema,
  reservation_notes: stringArraySchema,
  price_signal: priceSignalSchema,
  dietary_notes: stringArraySchema,
  best_for: stringArraySchema
});

export const hotelAttributesDataSchema = z.object({
  stay_type: stringArraySchema,
  amenities: stringArraySchema,
  room_notes: stringArraySchema,
  food_board_notes: stringArraySchema,
  family_friendliness: stringArraySchema,
  location_strengths: stringArraySchema,
  service_highlights: stringArraySchema,
  cautions: stringArraySchema,
  best_for: stringArraySchema
});

export const beachClubAttributesDataSchema = z.object({
  setting: stringArraySchema,
  food_drink_highlights: stringArraySchema,
  atmosphere_tags: stringArraySchema,
  daybed_or_pool_facilities: stringArraySchema,
  reservation_notes: stringArraySchema,
  price_signal: priceSignalSchema,
  music_vibe: stringArraySchema,
  access_to_sea: stringArraySchema,
  best_for: stringArraySchema
});

export const boatRentalAttributesDataSchema = z.object({
  experience_type: z.enum(["party_boat", "jet_ski", "private_sailing", "charter", "boat_tour", "unknown"]),
  guided_or_skippered: stringArraySchema,
  duration_notes: stringArraySchema,
  route_or_stops: stringArraySchema,
  included_extras: stringArraySchema,
  safety_or_accessibility_notes: stringArraySchema,
  price_signal: priceSignalSchema,
  group_fit: stringArraySchema,
  best_for: stringArraySchema
});

export const activityAttributesDataSchema = z.object({
  activity_type: stringArraySchema,
  main_highlights: stringArraySchema,
  duration_notes: stringArraySchema,
  ticket_or_booking_notes: stringArraySchema,
  access_notes: stringArraySchema,
  crowd_timing_notes: stringArraySchema,
  guided_experience: stringArraySchema,
  physical_difficulty: stringArraySchema,
  best_for: stringArraySchema
});

export const beachAttributesDataSchema = z.object({
  landscape_tags: stringArraySchema,
  water_conditions: stringArraySchema,
  terrain: stringArraySchema,
  crowding: stringArraySchema,
  access_and_parking: stringArraySchema,
  facilities: stringArraySchema,
  rentals_or_prices: stringArraySchema,
  family_accessibility: stringArraySchema,
  nearby_food: stringArraySchema,
  best_time_notes: stringArraySchema
});

export const categoryAttributeDataSchemas: Partial<Record<BusinessCategory, z.ZodTypeAny>> = {
  restaurant: restaurantAttributesDataSchema,
  hotel: hotelAttributesDataSchema,
  "beach-club": beachClubAttributesDataSchema,
  "boat-rental": boatRentalAttributesDataSchema,
  activity: activityAttributesDataSchema,
  beach: beachAttributesDataSchema
};

export const categoryAttributeSchemas: Partial<Record<BusinessCategory, z.ZodTypeAny>> = {
  restaurant: z.object({ ...baseCategoryAttributesSchema, data: restaurantAttributesDataSchema }),
  hotel: z.object({ ...baseCategoryAttributesSchema, data: hotelAttributesDataSchema }),
  "beach-club": z.object({ ...baseCategoryAttributesSchema, data: beachClubAttributesDataSchema }),
  "boat-rental": z.object({ ...baseCategoryAttributesSchema, data: boatRentalAttributesDataSchema }),
  activity: z.object({ ...baseCategoryAttributesSchema, data: activityAttributesDataSchema }),
  beach: z.object({ ...baseCategoryAttributesSchema, data: beachAttributesDataSchema }),
  bar: z.object({ ...baseCategoryAttributesSchema, data: restaurantAttributesDataSchema }),
  cafe: z.object({ ...baseCategoryAttributesSchema, data: restaurantAttributesDataSchema }),
  bakery: z.object({ ...baseCategoryAttributesSchema, data: restaurantAttributesDataSchema }),
  market: z.object({ ...baseCategoryAttributesSchema, data: restaurantAttributesDataSchema }),
  spa: z.object({ ...baseCategoryAttributesSchema, data: activityAttributesDataSchema }),
  gym: z.object({ ...baseCategoryAttributesSchema, data: activityAttributesDataSchema }),
  museum: z.object({ ...baseCategoryAttributesSchema, data: activityAttributesDataSchema }),
  route: z.object({ ...baseCategoryAttributesSchema, data: activityAttributesDataSchema }),
  excursion: z.object({ ...baseCategoryAttributesSchema, data: activityAttributesDataSchema }),
  "rent-a-car": z.object({ ...baseCategoryAttributesSchema, data: activityAttributesDataSchema }),
  "car-dealer": z.object({ ...baseCategoryAttributesSchema, data: activityAttributesDataSchema }),
  "real-estate": z.object({ ...baseCategoryAttributesSchema, data: activityAttributesDataSchema }),
  "local-shop": z.object({ ...baseCategoryAttributesSchema, data: activityAttributesDataSchema })
};

export function categoryAttributesSchemaFor(category: BusinessCategory) {
  return categoryAttributeSchemas[category];
}

export function validateCategoryAttributes(category: BusinessCategory, value: unknown) {
  const schema = categoryAttributesSchemaFor(category);
  if (!schema) return z.never().safeParse(value);
  return schema.safeParse(value);
}
