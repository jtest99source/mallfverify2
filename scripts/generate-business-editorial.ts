import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { priceEstimateSchema, validateCategoryAttributes } from "../src/lib/business-attribute-schemas";

type BusinessCategory =
  | "restaurant"
  | "hotel"
  | "beach-club"
  | "boat-rental"
  | "activity"
  | "beach"
  | "bar"
  | "cafe"
  | "bakery"
  | "rent-a-car"
  | "car-dealer"
  | "real-estate"
  | "spa"
  | "gym"
  | "market"
  | "local-shop"
  | "museum"
  | "route"
  | "excursion";

type AttributeContractCategory = "restaurant" | "hotel" | "beach-club" | "boat-rental" | "activity" | "beach";

function attributeContractCategory(category: BusinessCategory): AttributeContractCategory {
  if (category === "bar" || category === "cafe" || category === "bakery" || category === "market") return "restaurant";
  if (category === "rent-a-car" || category === "car-dealer" || category === "real-estate" || category === "spa" || category === "gym" || category === "local-shop" || category === "museum" || category === "route" || category === "excursion") return "activity";
  return category;
}

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  category: BusinessCategory;
  status: string | null;
  area: string | null;
  city: string | null;
  municipality: string | null;
  price_level: string | null;
  price_estimate: PriceEstimate | null;
  category_attributes: unknown | null;
  featured_reviews: unknown | null;
  business_self_description: string | null;
  opening_hours: string | null;
  place_reviews: GoogleReview[] | null;
  raw_google_place: Record<string, unknown> | null;
  editorial_source: "ai" | "human" | "ai_then_human" | null;
  editorial_generated_at: string | null;
};

type GoogleReview = {
  authorName?: string | null;
  rating?: number | null;
  relativeTimeDescription?: string | null;
  text?: string | null;
};

type PriceEstimate = {
  amount_min?: number | null;
  amount_max?: number | null;
  level?: number | null;
  per_person_min?: number | null;
  per_person_max?: number | null;
  range_min?: number | null;
  range_max?: number | null;
  currency?: string | null;
  unit?: "person" | "night" | "day" | "half_day" | "charter" | "ticket" | "entry" | "menu" | null;
  label?: string | null;
  source?: "reviews" | "places" | "google_places" | "website" | "manual" | null;
  confidence?: "high" | "medium" | "low" | null;
  reported_by?: number | null;
  breakdown?: Array<{ range: string; votes: number }> | null;
  note?: string | null;
};

type Options = {
  only: string | null;
  category: string | null;
  force: boolean;
  dryRun: boolean;
  onlyMissing: boolean;
  previewPrompt: boolean;
  onlyNeedsRichEditorial: boolean;
  yes: boolean;
  limit: number | null;
  pauseMs: number;
  provider: "openai" | "anthropic";
};

const MASSIVE_LLM_THRESHOLD = 100;
const REVIEW_PROMPT_MAX_CHARS = 500;
const MIN_USEFUL_REVIEW_CHARS = 80;
const MIN_USEFUL_REVIEWS_FOR_LLM = 3;
const MAX_LLM_PARSE_RETRIES = 1;
const SUPABASE_PAGE_SIZE = 100;

class LlmQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LlmQuotaError";
  }
}

function isQuotaOrBillingError(status: number, body: string) {
  return status === 429 && /insufficient_quota|quota|billing|credit|rate[_ -]?limit/i.test(body);
}

const stringArrayJsonSchema = { type: "array", items: { type: "string" } } as const;
const priceSignalJsonSchema = { type: ["string", "null"], enum: ["good_value", "fair", "expensive", "mixed", null] } as const;

const categoryAttributeDataJsonSchemas = [
  {
    type: "object",
    additionalProperties: false,
    required: ["cuisine_types", "signature_items", "atmosphere_tags", "service_notes", "reservation_notes", "price_signal", "dietary_notes", "best_for"],
    properties: {
      cuisine_types: stringArrayJsonSchema,
      signature_items: stringArrayJsonSchema,
      atmosphere_tags: stringArrayJsonSchema,
      service_notes: stringArrayJsonSchema,
      reservation_notes: stringArrayJsonSchema,
      price_signal: priceSignalJsonSchema,
      dietary_notes: stringArrayJsonSchema,
      best_for: stringArrayJsonSchema
    }
  },
  {
    type: "object",
    additionalProperties: false,
    required: ["stay_type", "amenities", "room_notes", "food_board_notes", "family_friendliness", "location_strengths", "service_highlights", "cautions", "best_for"],
    properties: {
      stay_type: stringArrayJsonSchema,
      amenities: stringArrayJsonSchema,
      room_notes: stringArrayJsonSchema,
      food_board_notes: stringArrayJsonSchema,
      family_friendliness: stringArrayJsonSchema,
      location_strengths: stringArrayJsonSchema,
      service_highlights: stringArrayJsonSchema,
      cautions: stringArrayJsonSchema,
      best_for: stringArrayJsonSchema
    }
  },
  {
    type: "object",
    additionalProperties: false,
    required: ["setting", "food_drink_highlights", "atmosphere_tags", "daybed_or_pool_facilities", "reservation_notes", "price_signal", "music_vibe", "access_to_sea", "best_for"],
    properties: {
      setting: stringArrayJsonSchema,
      food_drink_highlights: stringArrayJsonSchema,
      atmosphere_tags: stringArrayJsonSchema,
      daybed_or_pool_facilities: stringArrayJsonSchema,
      reservation_notes: stringArrayJsonSchema,
      price_signal: priceSignalJsonSchema,
      music_vibe: stringArrayJsonSchema,
      access_to_sea: stringArrayJsonSchema,
      best_for: stringArrayJsonSchema
    }
  },
  {
    type: "object",
    additionalProperties: false,
    required: ["experience_type", "guided_or_skippered", "duration_notes", "route_or_stops", "included_extras", "safety_or_accessibility_notes", "price_signal", "group_fit", "best_for"],
    properties: {
      experience_type: { type: "string", enum: ["party_boat", "jet_ski", "private_sailing", "charter", "boat_tour", "unknown"] },
      guided_or_skippered: stringArrayJsonSchema,
      duration_notes: stringArrayJsonSchema,
      route_or_stops: stringArrayJsonSchema,
      included_extras: stringArrayJsonSchema,
      safety_or_accessibility_notes: stringArrayJsonSchema,
      price_signal: priceSignalJsonSchema,
      group_fit: stringArrayJsonSchema,
      best_for: stringArrayJsonSchema
    }
  },
  {
    type: "object",
    additionalProperties: false,
    required: ["activity_type", "main_highlights", "duration_notes", "ticket_or_booking_notes", "access_notes", "crowd_timing_notes", "guided_experience", "physical_difficulty", "best_for"],
    properties: {
      activity_type: stringArrayJsonSchema,
      main_highlights: stringArrayJsonSchema,
      duration_notes: stringArrayJsonSchema,
      ticket_or_booking_notes: stringArrayJsonSchema,
      access_notes: stringArrayJsonSchema,
      crowd_timing_notes: stringArrayJsonSchema,
      guided_experience: stringArrayJsonSchema,
      physical_difficulty: stringArrayJsonSchema,
      best_for: stringArrayJsonSchema
    }
  },
  {
    type: "object",
    additionalProperties: false,
    required: ["landscape_tags", "water_conditions", "terrain", "crowding", "access_and_parking", "facilities", "rentals_or_prices", "family_accessibility", "nearby_food", "best_time_notes"],
    properties: {
      landscape_tags: stringArrayJsonSchema,
      water_conditions: stringArrayJsonSchema,
      terrain: stringArrayJsonSchema,
      crowding: stringArrayJsonSchema,
      access_and_parking: stringArrayJsonSchema,
      facilities: stringArrayJsonSchema,
      rentals_or_prices: stringArrayJsonSchema,
      family_accessibility: stringArrayJsonSchema,
      nearby_food: stringArrayJsonSchema,
      best_time_notes: stringArrayJsonSchema
    }
  }
] as const;

const editorialJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "highlights",
    "review_sentiment",
    "review_themes",
    "review_pros",
    "services",
    "price_estimate",
    "category_attributes",
    "featured_reviews",
    "faq",
    "best_time"
  ],
  properties: {
    highlights: { type: "array", maxItems: 4, items: { type: "string", maxLength: 180 } },
    review_sentiment: {
      type: "object",
      additionalProperties: false,
      properties: {},
      required: []
    },
    review_themes: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "icon"],
        properties: {
          label: { type: "string", maxLength: 80 },
          icon: { type: ["string", "null"], maxLength: 40 }
        }
      }
    },
    review_pros: { type: "array", maxItems: 6, items: { type: "string", maxLength: 160 } },
    services: {
      type: "array",
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "icon"],
        properties: {
          label: { type: "string", maxLength: 80 },
          icon: { type: "string", maxLength: 40 }
        }
      }
    },
    price_estimate: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["amount_min", "amount_max", "currency", "unit", "label", "source", "confidence", "note", "reported_by"],
          properties: {
            amount_min: { type: ["number", "null"] },
            amount_max: { type: ["number", "null"] },
            currency: { type: ["string", "null"] },
            unit: { type: ["string", "null"], enum: ["person", "night", "day", "half_day", "charter", "ticket", "entry", "menu", null] },
            label: { type: ["string", "null"], maxLength: 80 },
            source: { type: ["string", "null"], enum: ["reviews", "places", "google_places", "website", "manual", null] },
            confidence: { type: ["string", "null"], enum: ["high", "medium", "low", null] },
            note: { type: ["string", "null"], maxLength: 260 },
            reported_by: { type: ["number", "null"] }
          }
        }
      ]
    },
    category_attributes: {
      type: "object",
      additionalProperties: false,
      required: ["schema_version", "confidence", "data"],
      properties: {
        schema_version: { type: "number", enum: [1] },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
        data: {
          anyOf: categoryAttributeDataJsonSchemas
        }
      }
    },
    featured_reviews: {
      type: "array",
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["author", "rating", "date", "text", "text_translated", "translated_from", "topic", "lang"],
        properties: {
          author: { type: ["string", "null"], maxLength: 120 },
          rating: { type: ["number", "null"] },
          date: { type: ["string", "null"], maxLength: 80 },
          text: { type: "string", maxLength: 420 },
          text_translated: { type: ["string", "null"], maxLength: 420 },
          translated_from: { type: ["string", "null"], maxLength: 12 },
          topic: { type: ["string", "null"], maxLength: 80 },
          lang: { type: ["string", "null"], maxLength: 12 }
        }
      }
    },
    faq: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["q", "a"],
        properties: {
          q: { type: "string", maxLength: 160 },
          a: { type: "string", maxLength: 420 }
        }
      }
    },
    best_time: { type: ["string", "null"], maxLength: 240 }
  }
} as const;

const editorialSchema = z.object({
  highlights: z.array(z.string().min(3).max(180)).min(1).max(4),
  review_sentiment: z.record(z.number().min(0).max(100)).optional().default({}),
  review_themes: z.array(z.object({
    label: z.string().min(3).max(80),
    icon: z.string().min(2).max(40).nullable().optional()
  })).max(6).default([]),
  review_pros: z.array(z.string().min(3).max(160)).max(6).default([]),
  services: z.array(z.object({
    label: z.string().min(2).max(80),
    icon: z.string().min(2).max(40)
  })).max(12).default([]),
  price_estimate: priceEstimateSchema.nullable().optional(),
  category_attributes: z.object({
    schema_version: z.literal(1),
    confidence: z.enum(["high", "medium", "low"]),
    data: z.unknown()
  }),
  featured_reviews: z.array(z.object({
    author: z.string().max(120).nullable().optional(),
    rating: z.number().min(1).max(5).nullable().optional(),
    date: z.string().max(80).nullable().optional(),
    text: z.string().min(20).max(420),
    text_translated: z.string().min(20).max(420).nullable().optional(),
    translated_from: z.string().max(12).nullable().optional(),
    topic: z.string().max(80).nullable().optional(),
    lang: z.string().max(12).nullable().optional()
  })).max(3).default([]),
  faq: z.array(z.object({
    q: z.string().min(8).max(160),
    a: z.string().min(20).max(420)
  })).min(0).max(5).default([]),
  best_time: z.string().min(3).max(240).nullable().optional()
});

type EditorialPayload = z.infer<typeof editorialSchema>;

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;

  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseArgs(): Options {
  const options: Options = {
    only: null,
    category: null,
    force: false,
    dryRun: false,
    onlyMissing: true,
    previewPrompt: false,
    onlyNeedsRichEditorial: false,
    yes: false,
    limit: null,
    pauseMs: 800,
    provider: (process.env.LLM_PROVIDER === "anthropic" ? "anthropic" : "openai")
  };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--only=")) options.only = arg.slice("--only=".length).trim() || null;
    else if (arg.startsWith("--slug=")) options.only = arg.slice("--slug=".length).trim() || null;
    else if (arg.startsWith("--category=")) options.category = arg.slice("--category=".length).trim() || null;
    else if (arg.startsWith("--limit=")) {
      const value = Number(arg.slice("--limit=".length));
      if (Number.isFinite(value) && value > 0) options.limit = Math.min(value, 1000);
    } else if (arg.startsWith("--pause-ms=")) {
      const value = Number(arg.slice("--pause-ms=".length));
      if (Number.isFinite(value) && value >= 0) options.pauseMs = value;
    } else if (arg.startsWith("--provider=")) {
      const value = arg.slice("--provider=".length);
      if (value === "openai" || value === "anthropic") options.provider = value;
    } else if (arg === "--force") options.force = true;
    else if (arg === "--only-needs-rich-editorial") {
      options.onlyNeedsRichEditorial = true;
      options.force = true;
    }
    else if (arg === "--only-missing") options.onlyMissing = true;
    else if (arg === "--include-generated") options.onlyMissing = false;
    else if (arg === "--preview-prompt") options.previewPrompt = true;
    else if (arg === "--yes") options.yes = true;
    else if (arg === "--dry-run") options.dryRun = true;
  }

  if (options.force) options.onlyMissing = false;

  return options;
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function businessName(business: BusinessRow) {
  return business.display_name?.trim() || business.name;
}

function businessLocation(business: BusinessRow) {
  return business.city || business.area || business.municipality || "Mallorca";
}

function categoryLabel(category: string) {
  return {
    restaurant: "restaurante",
    hotel: "hotel",
    "beach-club": "beach club",
    "boat-rental": "alquiler de barcos",
    activity: "actividad",
    beach: "playa o cala",
    bar: "bar",
    cafe: "cafeteria",
    bakery: "horno o pasteleria",
    "rent-a-car": "alquiler de coches",
    "car-dealer": "concesionario",
    "real-estate": "agencia inmobiliaria",
    spa: "spa",
    gym: "gimnasio",
    market: "mercado o tienda gourmet",
    "local-shop": "tienda local",
    museum: "museo o espacio cultural",
    route: "ruta o mirador",
    excursion: "excursion"
  }[category] ?? "negocio";
}

function categoryEditorialGuidance(category: string) {
  const guidance: Record<string, {
    angle: string;
    faqExamples: string[];
    avoidFaq: string;
    sentimentExample: string;
    serviceExample: string;
  }> = {
    restaurant: {
      angle: "Restaurante: describe cocina, ambiente, servicio y tipo de plan. Si hay menciones claras, distingue entre comida tranquila, cena especial, tapeo, terraza, vistas o plan familiar.",
      faqExamples: ["¿Para qué plan encaja?", "¿Es buena opción para cenar?", "¿El ambiente es tranquilo o animado?", "¿Conviene reservar?"],
      avoidFaq: "No preguntes por barcos, habitaciones, parking de playa o licencia.",
      sentimentExample: '{ "ambiente": 0-100, "servicio": 0-100, "comida": 0-100, "valor_precio": 0-100 }',
      serviceExample: '[{ "label": "Terraza", "icon": "sun" }, { "label": "Cócteles", "icon": "glass-cocktail" }]'
    },
    "beach-club": {
      angle: "Beach club: describe ambiente, musica, vistas, tumbonas o zona de playa/piscina, comida, cocteles y si encaja mas para comer, tomar algo o alargar la tarde.",
      faqExamples: ["¿Para qué plan encaja?", "¿Encaja más para comer o para tomar algo?", "¿El ambiente es tranquilo o animado?", "¿Es buena opción para ir en pareja?"],
      avoidFaq: "No preguntes por licencia nautica, habitaciones de hotel o senderismo.",
      sentimentExample: '{ "ambiente": 0-100, "servicio": 0-100, "comida_bebida": 0-100, "ubicacion": 0-100 }',
      serviceExample: '[{ "label": "Tumbonas", "icon": "umbrella" }, { "label": "Cócteles", "icon": "glass-cocktail" }]'
    },
    hotel: {
      angle: "Hotel: describe tipo de estancia, ubicacion, descanso, habitaciones, desayuno, piscina/spa si aparecen, trato y para quien encaja: pareja, familia, adultos, escapada o viaje comodo.",
      faqExamples: ["¿Para qué tipo de estancia encaja?", "¿Es buena opción para ir en pareja?", "¿Qué destaca de las habitaciones o instalaciones?", "¿La ubicación es cómoda?"],
      avoidFaq: "No preguntes por shisha, licencias nauticas ni si se puede tomar algo salvo que sea un hotel-restaurante claro.",
      sentimentExample: '{ "descanso": 0-100, "servicio": 0-100, "habitaciones": 0-100, "ubicacion": 0-100 }',
      serviceExample: '[{ "label": "Piscina", "icon": "pool" }, { "label": "Spa", "icon": "massage" }]'
    },
    "boat-rental": {
      angle: "Alquiler de barcos: describe confianza, trato, estado del barco, rutas, facilidad de reserva, patron/skipper, grupos y si encaja para familia, pareja o dia con amigos.",
      faqExamples: ["¿Se puede ir con patrón?", "¿Hace falta licencia?", "¿Para qué tipo de grupo encaja?", "¿Qué conviene confirmar antes de reservar?"],
      avoidFaq: "No preguntes por comida, habitaciones, tumbonas o ambiente de restaurante salvo que las resenas lo mencionen claramente.",
      sentimentExample: '{ "trato": 0-100, "barcos": 0-100, "reserva": 0-100, "experiencia": 0-100 }',
      serviceExample: '[{ "label": "Patrón", "icon": "sailboat" }, { "label": "Rutas privadas", "icon": "map-route" }]'
    },
    activity: {
      angle: "Actividad: describe experiencia, organizacion, guia/instructor, dificultad, duracion si aparece, seguridad y para quien encaja: parejas, familias, grupos o viajeros activos.",
      faqExamples: ["¿Para quién encaja la actividad?", "¿Es una experiencia tranquila o activa?", "¿Conviene reservar con antelación?", "¿Qué hay que tener en cuenta antes de ir?"],
      avoidFaq: "No preguntes por habitaciones, precio de carta, tumbonas o licencia nautica salvo que sea una actividad nautica y aparezca en los datos.",
      sentimentExample: '{ "experiencia": 0-100, "organizacion": 0-100, "guia": 0-100, "seguridad": 0-100 }',
      serviceExample: '[{ "label": "Guía", "icon": "user-star" }, { "label": "Reserva", "icon": "calendar" }]'
    },
    "real-estate": {
      angle: "Agencia inmobiliaria: describe confianza, trato, profesionalidad, comunicacion, idiomas si aparecen, conocimiento local, acompaniamiento en compraventa o alquiler y para quien encaja: compradores internacionales, vendedores, propietarios o inversores.",
      faqExamples: ["¿Encaja para compradores internacionales?", "¿Qué destaca del trato y la comunicación?", "¿Trabajan con compraventa, alquiler o ambos?", "¿Qué conviene confirmar antes de contactar?"],
      avoidFaq: "No preguntes por habitaciones, carta, tumbonas, entradas, licencias nauticas ni precios de menu. No afirmes que hablan ingles o aleman salvo evidencia clara en resenas, web o datos.",
      sentimentExample: '{ "trato": 0-100, "comunicacion": 0-100, "profesionalidad": 0-100, "conocimiento_local": 0-100 }',
      serviceExample: '[{ "label": "Compraventa", "icon": "home-dollar" }, { "label": "Clientes internacionales", "icon": "world" }, { "label": "Valoracion de propiedades", "icon": "clipboard-check" }]'
    },
    beach: {
      angle: "Playa o cala: describe paisaje, tipo de acceso, ambiente, servicios, agua, arena/roca, parking si aparece y para quien encaja: familias, snorkel, paseo, fotos o tranquilidad.",
      faqExamples: ["¿Qué tipo de playa es?", "¿Es cómoda para ir en familia?", "¿Cómo es el acceso?", "¿Hay servicios cerca?"],
      avoidFaq: "No preguntes por reservas, shisha, habitaciones o patron.",
      sentimentExample: '{ "paisaje": 0-100, "acceso": 0-100, "servicios": 0-100, "tranquilidad": 0-100 }',
      serviceExample: '[{ "label": "Parking", "icon": "parking" }, { "label": "Snorkel", "icon": "swimming" }]'
    }
  };

  const contractCategory = attributeContractCategory(category as BusinessCategory);
  return guidance[category] ?? guidance[contractCategory] ?? {
    angle: "Negocio local: describe caracter, trato, ubicacion, tipo de plan y para quien encaja.",
    faqExamples: ["¿Para qué plan encaja?", "¿Qué conviene confirmar antes de ir?", "¿El ambiente es tranquilo o animado?"],
    avoidFaq: "No uses preguntas que no encajen con la categoria.",
    sentimentExample: '{ "ambiente": 0-100, "servicio": 0-100, "experiencia": 0-100 }',
    serviceExample: '[{ "label": "Reserva", "icon": "calendar" }]'
  };
}

function categoryAttributesPromptFor(category: BusinessCategory) {
  const contractCategory = attributeContractCategory(category);
  const contracts: Record<AttributeContractCategory, string> = {
    restaurant: `category_attributes debe ser:
{
  "schema_version": 1,
  "confidence": "high|medium|low",
  "data": {
    "cuisine_types": string[],
    "signature_items": string[],
    "atmosphere_tags": string[],
    "service_notes": string[],
    "reservation_notes": string[],
    "price_signal": "good_value|fair|expensive|mixed|null",
    "dietary_notes": string[],
    "best_for": string[]
  }
}`,
    hotel: `category_attributes debe ser:
{
  "schema_version": 1,
  "confidence": "high|medium|low",
  "data": {
    "stay_type": string[],
    "amenities": string[],
    "room_notes": string[],
    "food_board_notes": string[],
    "family_friendliness": string[],
    "location_strengths": string[],
    "service_highlights": string[],
    "cautions": string[],
    "best_for": string[]
  }
}`,
    "beach-club": `category_attributes debe ser:
{
  "schema_version": 1,
  "confidence": "high|medium|low",
  "data": {
    "setting": string[],
    "food_drink_highlights": string[],
    "atmosphere_tags": string[],
    "daybed_or_pool_facilities": string[],
    "reservation_notes": string[],
    "price_signal": "good_value|fair|expensive|mixed|null",
    "music_vibe": string[],
    "access_to_sea": string[],
    "best_for": string[]
  }
}`,
    "boat-rental": `category_attributes debe ser:
{
  "schema_version": 1,
  "confidence": "high|medium|low",
  "data": {
    "experience_type": "party_boat|jet_ski|private_sailing|charter|boat_tour|unknown",
    "guided_or_skippered": string[],
    "duration_notes": string[],
    "route_or_stops": string[],
    "included_extras": string[],
    "safety_or_accessibility_notes": string[],
    "price_signal": "good_value|fair|expensive|mixed|null",
    "group_fit": string[],
    "best_for": string[]
  }
}`,
    activity: `category_attributes debe ser:
{
  "schema_version": 1,
  "confidence": "high|medium|low",
  "data": {
    "activity_type": string[],
    "main_highlights": string[],
    "duration_notes": string[],
    "ticket_or_booking_notes": string[],
    "access_notes": string[],
    "crowd_timing_notes": string[],
    "guided_experience": string[],
    "physical_difficulty": string[],
    "best_for": string[]
  }
}`,
    beach: `category_attributes debe ser:
{
  "schema_version": 1,
  "confidence": "high|medium|low",
  "data": {
    "landscape_tags": string[],
    "water_conditions": string[],
    "terrain": string[],
    "crowding": string[],
    "access_and_parking": string[],
    "facilities": string[],
    "rentals_or_prices": string[],
    "family_accessibility": string[],
    "nearby_food": string[],
    "best_time_notes": string[]
  }
}`
  };

  return contracts[contractCategory];
}

function priceUnitGuidance(category: BusinessCategory) {
  const contractCategory = attributeContractCategory(category);
  return {
    restaurant: 'unit="person", label="por persona" solo si hay precio o gasto claro.',
    "beach-club": 'unit="person", label="por persona" solo si hay precio o gasto claro; si se habla claramente de tumbonas/camas, describe en note sin inventar importe.',
    hotel: 'unit="night", label="por noche" solo si hay precio o gasto claro.',
    "boat-rental": 'unit="charter", "day" o "half_day" segun evidencia; si no hay precio claro, price_estimate=null.',
    activity: 'unit="ticket" o "entry" si hay precio de entrada/ticket claro.',
    beach: 'normalmente price_estimate=null; usa unit="entry" solo si hay entrada/parking/alquiler con importe claro.'
  }[contractCategory];
}

function reviewTextFromRaw(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const review = value as Record<string, unknown>;
  const text = review.text;
  if (typeof text === "string") return text;
  if (text && typeof text === "object" && typeof (text as { text?: unknown }).text === "string") return (text as { text: string }).text;
  return null;
}

function rawReviews(rawGooglePlace?: Record<string, unknown> | null): GoogleReview[] {
  const reviews = rawGooglePlace?.reviews;
  if (!Array.isArray(reviews)) return [];

  return reviews
    .map((item): GoogleReview => {
      const review = item as Record<string, unknown>;
      const author = review.authorAttribution as Record<string, unknown> | undefined;
      return {
        authorName: typeof author?.displayName === "string" ? author.displayName : typeof review.author_name === "string" ? review.author_name : null,
        rating: typeof review.rating === "number" ? review.rating : null,
        relativeTimeDescription:
          typeof review.relativePublishTimeDescription === "string"
            ? review.relativePublishTimeDescription
            : typeof review.relative_time_description === "string"
              ? review.relative_time_description
              : null,
        text: reviewTextFromRaw(review)
      };
    })
    .filter((review) => review.text?.trim());
}

function businessReviews(business: BusinessRow) {
  const reviews = business.place_reviews?.length ? business.place_reviews : rawReviews(business.raw_google_place);
  return reviews
    .filter((review) => review.text?.trim())
    .map((review) => ({
      authorName: review.authorName ?? "Usuario Google",
      rating: review.rating ?? null,
      date: review.relativeTimeDescription ?? null,
      text: String(review.text).replace(/\s+/g, " ").trim()
    }));
}

function isUsefulReviewForEditorial(review: ReturnType<typeof businessReviews>[number]) {
  const text = review.text.trim();
  if (text.length >= MIN_USEFUL_REVIEW_CHARS) return true;
  const usefulSignals = [
    "servicio",
    "comida",
    "ambiente",
    "terraza",
    "habitacion",
    "desayuno",
    "piscina",
    "playa",
    "parking",
    "reserva",
    "venta",
    "compra",
    "comprar",
    "vender",
    "alquiler",
    "inmobiliaria",
    "propiedad",
    "property",
    "real estate",
    "house",
    "home",
    "apartment",
    "villa",
    "wohnung",
    "immobilien",
    "makler",
    "precio",
    "paella",
    "tapas",
    "cocktail",
    "coctel",
    "barco",
    "guia",
    "ruta",
    "masaje",
    "tratamiento"
  ];
  const normalized = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return text.length >= 45 && usefulSignals.some((signal) => normalized.includes(signal));
}

function editorialReviews(business: BusinessRow) {
  return businessReviews(business).filter(isUsefulReviewForEditorial);
}

function hasFeaturedReviews(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function categoryAttributesConfidence(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const confidence = (value as { confidence?: unknown }).confidence;
  return typeof confidence === "string" ? confidence : null;
}

function needsRichEditorial(business: BusinessRow) {
  const reviews = editorialReviews(business);
  if (reviews.length < MIN_USEFUL_REVIEWS_FOR_LLM) return false;
  if (!business.editorial_generated_at) return true;
  if (!hasFeaturedReviews(business.featured_reviews)) return true;
  return categoryAttributesConfidence(business.category_attributes) === "low";
}

function truncateForPrompt(value: string, maxChars = REVIEW_PROMPT_MAX_CHARS) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars - 1).trimEnd()}...`;
}

function priceLevelNumber(priceLevel?: string | null) {
  if (!priceLevel) return null;
  const normalized = priceLevel.trim();
  if (normalized.includes("€€€€")) return 4;
  if (normalized.includes("€€€")) return 3;
  if (normalized.includes("€€")) return 2;
  if (normalized.includes("€")) return 1;
  return null;
}

function buildMinimalPayload(business: BusinessRow, reviewsCount: number): EditorialPayload {
  const name = businessName(business);
  const category = categoryLabel(business.category);
  const location = businessLocation(business);

  return {
    highlights: [`${category} en ${location}`, "Ficha pendiente de mas contexto editorial"],
    review_sentiment: {},
    review_themes: [],
    review_pros: [],
    services: [],
    price_estimate: business.price_level
      ? {
          level: priceLevelNumber(business.price_level),
          source: "places",
          note: "Estimacion derivada del price_level de Google Places; sin rango exacto."
        }
      : null,
    category_attributes: {
      schema_version: 1,
      confidence: "low",
      data: emptyCategoryAttributesData(business.category)
    },
    featured_reviews: [],
    faq: [],
    best_time: null
  };
}

function emptyCategoryAttributesData(category: BusinessCategory) {
  const contractCategory = attributeContractCategory(category);
  const common = {
    restaurant: {
      cuisine_types: [],
      signature_items: [],
      atmosphere_tags: [],
      service_notes: [],
      reservation_notes: [],
      price_signal: null,
      dietary_notes: [],
      best_for: []
    },
    hotel: {
      stay_type: [],
      amenities: [],
      room_notes: [],
      food_board_notes: [],
      family_friendliness: [],
      location_strengths: [],
      service_highlights: [],
      cautions: [],
      best_for: []
    },
    "beach-club": {
      setting: [],
      food_drink_highlights: [],
      atmosphere_tags: [],
      daybed_or_pool_facilities: [],
      reservation_notes: [],
      price_signal: null,
      music_vibe: [],
      access_to_sea: [],
      best_for: []
    },
    "boat-rental": {
      experience_type: "unknown",
      guided_or_skippered: [],
      duration_notes: [],
      route_or_stops: [],
      included_extras: [],
      safety_or_accessibility_notes: [],
      price_signal: null,
      group_fit: [],
      best_for: []
    },
    activity: {
      activity_type: [],
      main_highlights: [],
      duration_notes: [],
      ticket_or_booking_notes: [],
      access_notes: [],
      crowd_timing_notes: [],
      guided_experience: [],
      physical_difficulty: [],
      best_for: []
    },
    beach: {
      landscape_tags: [],
      water_conditions: [],
      terrain: [],
      crowding: [],
      access_and_parking: [],
      facilities: [],
      rentals_or_prices: [],
      family_accessibility: [],
      nearby_food: [],
      best_time_notes: []
    }
  } satisfies Record<AttributeContractCategory, unknown>;

  return common[contractCategory];
}

function buildSystemPrompt(locale: "es") {
  return [
    `Eres un editor de una guia local de Mallorca. Escribes con criterio honesto, en ${locale}, basandote SOLO en las resenas y datos que te doy.`,
    "No inventas. Si algo no aparece en las resenas o datos, lo omites.",
    "Tono de guia local de confianza, ni publicitario ni robotico.",
    "Responde solo JSON valido, sin markdown, sin comentarios."
  ].join(" ");
}

function buildUserPrompt(business: BusinessRow, reviews: ReturnType<typeof businessReviews>) {
  const guidance = categoryEditorialGuidance(business.category);
  const reviewLines = reviews.map((review, index) => {
    return [
      `#${index + 1}`,
      `autor: ${review.authorName}`,
      `rating: ${review.rating ?? "desconocido"}`,
      `fecha: ${review.date ?? "desconocida"}`,
      `texto: ${truncateForPrompt(review.text)}`
    ].join("\n");
  });

  return `
Negocio:
- nombre: ${businessName(business)}
- categoria: ${business.category} (${categoryLabel(business.category)})
- zona: ${businessLocation(business)}
- price_level_places: ${business.price_level ?? "null"}
- price_estimate_places: ${business.price_estimate ? JSON.stringify(business.price_estimate) : "null"}
- opening_hours: ${business.opening_hours ?? "null"}
- business_self_description: ${business.business_self_description ?? "null"}

Enfoque editorial por categoria:
- ${guidance.angle}
- Ejemplos de FAQ utiles para esta categoria: ${guidance.faqExamples.join(" | ")}
- Evitar: ${guidance.avoidFaq}

Contrato category_attributes para esta categoria:
${categoryAttributesPromptFor(business.category)}

Regla de precio por categoria:
${priceUnitGuidance(business.category)}

Resenas reales de Google:
${reviewLines.join("\n\n")}

Devuelve exactamente este JSON, en espanol, sin markdown:
{
  "highlights": ["3-4 razones concretas de por que ir, redactadas como atributos editoriales objetivos, no como resumen de resenas"],
  "review_sentiment": {},
  "review_themes": [{ "label": "Ambiente acogedor", "icon": "sparkles" }],
  "review_pros": ["3 cosas que mas gustan, frases cortas"],
  "services": ${guidance.serviceExample},
  "price_estimate": { "amount_min": 30, "amount_max": 45, "currency": "EUR", "unit": "person", "label": "por persona", "source": "reviews", "confidence": "medium", "note": "solo si hay menciones explicitas de precio", "reported_by": null },
  "category_attributes": { "schema_version": 1, "confidence": "medium", "data": {} },
  "featured_reviews": [{ "author": "Marta G.", "rating": 5, "date": "hace 2 semanas", "text": "cita truncada a ~200 car.", "text_translated": null, "translated_from": null, "topic": "Ambiente - Sunset", "lang": "es" }],
  "faq": [{ "q": "Para que plan encaja?", "a": "respuesta objetiva basada en datos reales" }],
  "best_time": "ej. Atardecer entre semana; en agosto reservar, o null"
}

Reglas:
- review_themes: temas cualitativos, sin numeros, porcentajes ni mentions. Ordena por relevancia. Maximo 5-6 temas. Usa labels concretos ("Ambiente acogedor", "Servicio atento", "Cocteles", "Vistas al mar") e iconos Tabler validos ("sparkles", "mood-smile", "glass-cocktail", "sunset", "tools-kitchen-2", "music", "parking", "sailboat", "pool", "map-pin", "umbrella"). Recuerda que solo hay unas 5 resenas: no aparentes estadistica.
- review_sentiment: devuelve {}. No generes porcentajes 0-100 con solo 5 resenas.
- No generes secciones de negativos, puntos debiles, "cons", "lo malo" ni "a tener en cuenta" como juicio editorial. La voz de Mallorca Verified describe lo positivo y aporta datos practicos objetivos, no emite critica sobre calidad.
- Distingue hechos practicos de juicios de calidad. Mantener como dato neutro: accesibilidad, escaleras, si conviene reservar, afluencia, aparcamiento, duracion, horarios, temporada, si un barco hace paradas o no, profundidad del agua o algas ocasionales. Eliminar como voz editorial: calidad irregular, plato que no convence, mala relacion calidad-precio, habitaciones viejas/anticuadas, privacidad, servicio malo o advertencias con retintin.
- Reubica la informacion practica objetiva en campos neutros: reservation_notes, crowd_timing_notes, best_time_notes, access_notes, safety_or_accessibility_notes, route_or_stops, duration_notes, facilities o el campo equivalente de la categoria. Redacta como hecho: "No accesible para silla de ruedas", "En temporada alta puede haber mas afluencia", "El barco no hace paradas durante la salida".
- Para hoteles, category_attributes.data.cautions debe ser siempre []. Si hay informacion practica objetiva, integrala en room_notes, food_board_notes, location_strengths, family_friendliness o best_for sin tono negativo. Si es juicio de calidad, omitelo.
- Filtro de seguridad/legal: NO incluyas en highlights, FAQ, services ni category_attributes acusaciones de robo, estafa, fraude, agresion, intrusiones, discriminacion, problemas legales, incidentes graves de seguridad, plagas, intoxicaciones o higiene severa si salen de una sola resena o pueden ser difamatorios. Si algo podria danar gravemente la reputacion con base debil, omitelo.
- category_attributes: rellena EXACTAMENTE el contrato de la categoria. Si no hay evidencia, usa [] o null. No inventes campos, no cambies nombres, no anadas claves extra. confidence="high" solo si las resenas dan senales claras; "medium" si hay varias senales pero limitadas; "low" si son genericas.
- price_signal: con la nueva linea editorial, evita usarlo como juicio de calidad/precio. Usalo solo si hay una senal factual y neutra muy clara sobre nivel de precio; si la evidencia es una opinion tipo caro/barato/mala relacion calidad-precio, devuelve null y no editorialices.
- beach-club.daybed_or_pool_facilities: rellena solo si aparecen tumbonas, hamacas, daybeds, camas balinesas, piscina o facilities equivalentes. Si solo hay terraza/playa/comida, usa [].
- Para categoria beach: no uses vocabulario de negocio como servicio atento, carta, cocina o clientes. Habla de paisaje, agua, arena/roca, acceso, aparcamiento, servicios publicos, alquileres, masificacion y mejor momento. nearby_food solo si aparecen bares/restaurantes cercanos.
- price_estimate: solo si las resenas o price_estimate_places mencionan importes o gasto concreto. Usa amount_min/amount_max/currency/unit/label/source/confidence/note/reported_by. No generes precio a partir de opiniones subjetivas como caro, barato o mala relacion calidad-precio. Si no hay importes o rango claro, devuelve null. No derives rangos desde price_level_places.
- services: extrae 5-8 servicios, detalles o atributos mencionados por resenas si existen. Iconos de Tabler sin prefijo y reales; si dudas usa point. No devuelvas solo 2 si hay mas señales claras.
- featured_reviews: 2-3 resenas representativas, recientes y con texto sustancial. Trunca a unas 260 letras. Asigna topic corto y lang. Si lang no es "es", traduce el texto al espanol en text_translated y pon translated_from con el lang original. Si ya esta en espanol, text_translated=null.
- faq: preguntas que una persona se haria antes de decidir si ir, adaptadas a la categoria. Usa los ejemplos de "Enfoque editorial por categoria" como orientacion, pero no copies preguntas que no esten respaldadas por datos. Escribe en espanol correcto, con signos de apertura y cierre. Evita preguntas de inventario salvo que el detalle sea un factor diferencial importante. Nada de "¿Donde esta X?", "¿Que tipo de sitio es X?" o preguntas de relleno. Responde con tono directo, sin repetir "las resenas dicen"; minimo 3, maximo 5; si no hay datos suficientes, devuelve menos.
- Prohibido inventar horarios, servicios, precios concretos o condiciones no respaldadas. La ausencia de informacion sobre precio, reservas u horarios no es un punto negativo.
- Tienes tambien la descripcion que el propio negocio publica en business_self_description. Usala SOLO para extraer datos factuales como concepto, cocina, ubicacion o servicios. NO copies su tono promocional ni adjetivos publicitarios como "experiencia unica", "los mejores" o "exquisito". La opinion editorial debe basarse principalmente en resenas reales.
`.trim();
}

async function callAnthropic(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY. Add it to .env.local.");

  const model = process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-20241022";
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    const message = `Anthropic API ${response.status}: ${body}`;
    if (isQuotaOrBillingError(response.status, body)) throw new LlmQuotaError(message);
    throw new Error(message);
  }

  const data = await response.json() as { content?: Array<{ type?: string; text?: string }> };
  const text = data.content?.find((part) => part.type === "text" && typeof part.text === "string")?.text;
  if (!text) throw new Error("Anthropic response did not include text content.");
  return text;
}

async function callOpenAI(systemPrompt: string, userPrompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY. Add it to .env.local.");

  const model = process.env.OPENAI_MODEL || "gpt-5.4-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_output_tokens: 1800,
      temperature: 0.2,
      text: {
        format: {
          type: "json_schema",
          name: "business_editorial_payload",
          strict: true,
          schema: editorialJsonSchema
        }
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    const message = `OpenAI API ${response.status}: ${body}`;
    if (isQuotaOrBillingError(response.status, body)) throw new LlmQuotaError(message);
    throw new Error(message);
  }

  const data = await response.json() as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  const text = data.output_text ?? data.output?.flatMap((item) => item.content ?? []).find((part) => part.type === "output_text" && typeof part.text === "string")?.text;
  if (!text) throw new Error("OpenAI response did not include output text.");
  return text;
}

async function callLlm(provider: Options["provider"], systemPrompt: string, userPrompt: string) {
  if (provider === "anthropic") return callAnthropic(systemPrompt, userPrompt);
  return callOpenAI(systemPrompt, userPrompt);
}

function extractJsonCandidate(text: string) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("LLM response does not contain a JSON object.");
  return cleaned.slice(start, end + 1);
}

function repairJsonCandidate(candidate: string) {
  return candidate
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/\u0000/g, "");
}

function parseJsonObject(text: string) {
  const candidate = extractJsonCandidate(text);
  try {
    return JSON.parse(candidate);
  } catch (error) {
    const repaired = repairJsonCandidate(candidate);
    if (repaired === candidate) throw error;
    return JSON.parse(repaired);
  }
}

function truncateText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function sanitizeStringArrays(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === "string" ? item.replace(/\s+/g, " ").trim() : sanitizeStringArrays(item))
      .filter((item) => !(typeof item === "string" && item.length === 0));
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitizeStringArrays(item)]));
  }
  return value;
}

function sanitizeParsedPayload(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const payload = value as Record<string, unknown>;

  if (Array.isArray(payload.featured_reviews)) {
    payload.featured_reviews = payload.featured_reviews.map((item) => {
      if (!item || typeof item !== "object") return item;
      const review = { ...(item as Record<string, unknown>) };
      if (typeof review.text === "string") review.text = truncateText(review.text, 420);
      if (typeof review.text_translated === "string") {
        const translated = truncateText(review.text_translated, 420);
        review.text_translated = translated.length >= 20 ? translated : null;
      }
      return review;
    });
  }

  if (payload.category_attributes && typeof payload.category_attributes === "object") {
    payload.category_attributes = sanitizeStringArrays(payload.category_attributes);
  }

  return payload;
}

function enforceEditorialPayloadRules(payload: EditorialPayload, business: BusinessRow): EditorialPayload {
  if (business.category !== "hotel") return payload;
  const data = payload.category_attributes.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return payload;

  return {
    ...payload,
    category_attributes: {
      ...payload.category_attributes,
      data: {
        ...data,
        cautions: []
      }
    }
  };
}

function parseJsonResponse(text: string, business: BusinessRow): EditorialPayload {
  const parsed = sanitizeParsedPayload(parseJsonObject(text));
  const payload = enforceEditorialPayloadRules(editorialSchema.parse(parsed), business);

  const categoryAttributes = validateCategoryAttributes(business.category, payload.category_attributes);
  if (!categoryAttributes.success) {
    throw new Error(`Invalid category_attributes for ${business.category}: ${categoryAttributes.error.message}`);
  }

  if (payload.price_estimate) {
    priceEstimateSchema.parse(payload.price_estimate);
  }

  return {
    ...payload,
    category_attributes: categoryAttributes.data
  };
}

function inferredPriceUnit(category: BusinessCategory): PriceEstimate["unit"] {
  if (category === "restaurant" || category === "beach-club" || category === "bar" || category === "cafe" || category === "bakery" || category === "market") return "person";
  if (category === "hotel") return "night";
  if (category === "activity" || category === "spa" || category === "gym" || category === "museum" || category === "route" || category === "excursion" || category === "local-shop") return "ticket";
  if (category === "boat-rental") return "charter";
  if (category === "rent-a-car") return "day";
  return null;
}

function priceLabelForUnit(unit: PriceEstimate["unit"]) {
  if (!unit) return null;
  const labels: Record<NonNullable<PriceEstimate["unit"]>, string> = {
    person: "por persona",
    night: "por noche",
    day: "por dia",
    half_day: "medio dia",
    charter: "por charter",
    ticket: "entrada",
    entry: "entrada",
    menu: "menu"
  };
  return labels[unit];
}

function normalizePriceEstimateForCategory(price: PriceEstimate | null | undefined, business: BusinessRow): PriceEstimate | null {
  if (!price) return null;

  const amountMin = price.amount_min ?? price.range_min ?? price.per_person_min ?? null;
  const amountMax = price.amount_max ?? price.range_max ?? price.per_person_max ?? null;
  const unit = price.unit ?? inferredPriceUnit(business.category);

  if (amountMin === null && amountMax === null && !price.level && !price.note) return null;

  return {
    ...price,
    amount_min: amountMin,
    amount_max: amountMax,
    currency: price.currency ?? "EUR",
    unit,
    label: price.label ?? priceLabelForUnit(unit),
    source: price.source ?? "google_places",
    confidence: price.confidence ?? "medium"
  };
}

function buildRetryPrompt(originalPrompt: string, error: string) {
  return [
    originalPrompt,
    "",
    "REINTENTO OBLIGATORIO:",
    `La respuesta anterior no se pudo guardar porque fallo la validacion: ${error}`,
    "Devuelve de nuevo TODO el objeto JSON completo, valido, sin markdown y siguiendo exactamente el schema indicado.",
    "No expliques el error. No anadas texto fuera del JSON."
  ].join("\n");
}

async function generateEditorialPayload(provider: Options["provider"], business: BusinessRow, reviews: ReturnType<typeof businessReviews>) {
  const systemPrompt = buildSystemPrompt("es");
  const userPrompt = buildUserPrompt(business, reviews);
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_LLM_PARSE_RETRIES; attempt += 1) {
    const prompt = attempt === 0
      ? userPrompt
      : buildRetryPrompt(userPrompt, lastError instanceof Error ? lastError.message : String(lastError));
    const text = await callLlm(provider, systemPrompt, prompt);
    try {
      return parseJsonResponse(text, business);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_LLM_PARSE_RETRIES) {
        console.warn(`retry ${business.slug}: ${error instanceof Error ? error.message : String(error)}`);
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function updatePayload(payload: EditorialPayload, business: BusinessRow) {
  return {
    highlights: payload.highlights,
    review_sentiment: payload.review_sentiment,
    review_themes: payload.review_themes,
    review_pros: payload.review_pros,
    review_cons: [],
    services: payload.services,
    price_estimate: normalizePriceEstimateForCategory(payload.price_estimate ?? business.price_estimate ?? null, business),
    category_attributes: payload.category_attributes,
    featured_reviews: payload.featured_reviews,
    faq_auto: payload.faq.map((faq) => ({ question: faq.q, answer: faq.a })),
    season_hint: payload.best_time ?? null,
    editorial_generated_at: new Date().toISOString(),
    editorial_source: "ai"
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function reportPath() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return join("reports", `editorial-generation-${stamp}.md`);
}

function writeReport(result: {
  processed: Array<{ name: string; slug: string; reviews: number; mode: string }>;
  skipped: Array<{ name: string; slug: string; reason: string }>;
  errors: Array<{ name: string; slug: string; error: string }>;
  dryRun: boolean;
  stoppedEarly?: boolean;
  stopReason?: string | null;
}) {
  if (!existsSync("reports")) mkdirSync("reports");
  const lines = [
    "# Editorial Generation Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Dry run: ${result.dryRun ? "yes" : "no"}`,
    "",
    "## Totals",
    "",
    `- Processed: ${result.processed.length}`,
    `- Skipped: ${result.skipped.length}`,
    `- Errors: ${result.errors.length}`,
    `- Stopped early: ${result.stoppedEarly ? "yes" : "no"}`,
    ...(result.stopReason ? [`- Stop reason: ${result.stopReason}`] : []),
    "",
    "## Processed",
    "",
    ...result.processed.map((item) => `- ${item.name} (${item.slug}) - ${item.reviews} reviews - ${item.mode}`),
    "",
    "## Skipped",
    "",
    ...result.skipped.map((item) => `- ${item.name} (${item.slug}) - ${item.reason}`),
    "",
    "## Errors",
    "",
    ...result.errors.map((item) => `- ${item.name} (${item.slug}) - ${item.error}`)
  ];

  const path = reportPath();
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  return path;
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const supabase = createSupabaseClient();

  const { error: schemaError } = await supabase
    .from("businesses")
    .select("review_sentiment,review_themes,review_pros,review_cons,services,price_estimate,category_attributes,featured_reviews,business_self_description,editorial_generated_at,editorial_source")
    .limit(1);
  if (schemaError) {
    throw new Error(`Missing editorial AI columns. Apply migration 011_editorial_ai_fields.sql first. Details: ${schemaError.message}`);
  }

  const businesses: BusinessRow[] = [];
  const target = options.limit ?? Infinity;

  for (let from = 0; businesses.length < target; from += SUPABASE_PAGE_SIZE) {
    const to = Math.min(from + SUPABASE_PAGE_SIZE - 1, from + (target - businesses.length) - 1);
    let query = supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,area,city,municipality,price_level,price_estimate,category_attributes,featured_reviews,business_self_description,opening_hours,place_reviews,raw_google_place,editorial_source,editorial_generated_at")
      .in("status", ["published", "premium"])
      .order("authority_score", { ascending: false, nullsFirst: false })
      .range(from, to);

    if (options.category) query = query.eq("category", options.category);
    if (options.only) query = query.eq("slug", options.only);
    if (options.onlyMissing) query = query.is("editorial_generated_at", null);

    const { data, error } = await query;
    if (error) throw error;

    const page = (data ?? []) as BusinessRow[];
    businesses.push(...page);
    if (page.length < SUPABASE_PAGE_SIZE) break;
  }

  const selectedBusinesses = (options.onlyNeedsRichEditorial ? businesses.filter(needsRichEditorial) : businesses).slice(0, options.limit ?? undefined);
  const processed: Array<{ name: string; slug: string; reviews: number; mode: string }> = [];
  const skipped: Array<{ name: string; slug: string; reason: string }> = [];
  const errors: Array<{ name: string; slug: string; error: string }> = [];
  let stoppedEarly = false;
  let stopReason: string | null = null;

  console.log(JSON.stringify({
    dry_run: options.dryRun,
    preview_prompt: options.previewPrompt,
    only_missing: options.onlyMissing,
    only_needs_rich_editorial: options.onlyNeedsRichEditorial,
    scanned: businesses.length,
    selected: selectedBusinesses.length,
    provider: options.provider,
    estimated_llm_calls: options.dryRun || options.previewPrompt ? 0 : selectedBusinesses.length
  }, null, 2));

  if (!options.dryRun && !options.previewPrompt && selectedBusinesses.length > MASSIVE_LLM_THRESHOLD && !options.yes) {
    throw new Error(`Refusing to run ${selectedBusinesses.length} LLM calls without --yes. Re-run with --dry-run first, then add --yes when ready.`);
  }

  if (options.dryRun) {
    const path = writeReport({ processed: [], skipped: selectedBusinesses.map((business) => ({ name: businessName(business), slug: business.slug, reason: "dry-run selected" })), errors: [], dryRun: true });
    console.log(JSON.stringify({
      dry_run: true,
      scanned: businesses.length,
      selected: selectedBusinesses.length,
      estimated_llm_calls: 0,
      report: path
    }, null, 2));
    return;
  }

  if (options.previewPrompt) {
    const business = selectedBusinesses[0];
    if (!business) {
      console.log("No businesses selected.");
      return;
    }
    const reviews = editorialReviews(business);
    console.log([
      "===== SYSTEM PROMPT =====",
      buildSystemPrompt("es"),
      "",
      "===== USER PROMPT =====",
      buildUserPrompt(business, reviews)
    ].join("\n"));
    return;
  }

  for (const business of selectedBusinesses) {
    const name = businessName(business);
    const reviews = editorialReviews(business);

    if (business.editorial_source === "human" || business.editorial_source === "ai_then_human") {
      skipped.push({ name, slug: business.slug, reason: `protected editorial_source=${business.editorial_source}` });
      continue;
    }

    try {
      const payload = reviews.length < MIN_USEFUL_REVIEWS_FOR_LLM
        ? buildMinimalPayload(business, reviews.length)
        : await generateEditorialPayload(options.provider, business, reviews);

      if (!options.dryRun) {
        const { error: updateError } = await supabase.from("businesses").update(updatePayload(payload, business)).eq("id", business.id);
        if (updateError) throw updateError;
      }

      processed.push({
        name,
        slug: business.slug,
        reviews: reviews.length,
        mode: reviews.length < MIN_USEFUL_REVIEWS_FOR_LLM ? "minimal" : options.provider
      });
      console.log(`ok ${business.slug} (${reviews.length} useful reviews, ${reviews.length < MIN_USEFUL_REVIEWS_FOR_LLM ? "minimal" : options.provider})`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ name, slug: business.slug, error: message });
      console.error(`error ${business.slug}: ${message}`);
      if (error instanceof LlmQuotaError) {
        stoppedEarly = true;
        stopReason = `Stopped after LLM quota/billing error on ${business.slug}`;
        console.error(stopReason);
        break;
      }
    }

    if (options.pauseMs > 0) await sleep(options.pauseMs);
  }

  const path = writeReport({ processed, skipped, errors, dryRun: options.dryRun, stoppedEarly, stopReason });
  console.log(JSON.stringify({
    dry_run: options.dryRun,
    scanned: businesses.length,
    selected: selectedBusinesses.length,
    processed: processed.length,
    skipped: skipped.length,
    errors: errors.length,
    stopped_early: stoppedEarly,
    stop_reason: stopReason,
    report: path
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
