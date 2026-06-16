import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

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
  | "spa"
  | "gym"
  | "route"
  | "excursion";

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
  rating: number | null;
  reviews_count: number | null;
  primary_type: string | null;
  place_attributes: Record<string, unknown> | null;
  place_reviews: Array<Record<string, unknown>> | null;
  raw_google_place: Record<string, unknown> | null;
  review_themes: unknown[] | null;
  review_pros: string[] | null;
  services: unknown[] | null;
  category_attributes: Record<string, unknown> | null;
};

type Options = {
  apply: boolean;
  category: string | null;
  limit: number;
  onlyMissing: boolean;
  onlySlugs: string[];
};

const PAGE_SIZE = 100;
const REVIEW_MAX_CHARS = 360;
const MAX_LIMIT = 500;

const signalSchema = z.object({
  review_themes: z.array(z.object({
    label: z.string().min(3).max(60),
    icon: z.string().min(2).max(40).nullable().optional()
  })).min(3).max(5),
  review_pros: z.array(z.string().min(8).max(130)).min(3).max(3)
});

type AiSignalPayload = z.infer<typeof signalSchema>;
type SignalPayload = AiSignalPayload & {
  services: Array<{ label: string; icon: string }>;
  category_attributes: {
    schema_version: 1;
    confidence: "high" | "medium" | "low";
    data: Record<string, unknown>;
  };
};

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
  const value = (name: string) => {
    const prefix = `--${name}=`;
    const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
    return arg ? arg.slice(prefix.length).trim() : null;
  };
  const limit = Number(value("limit") ?? 5);
  return {
    apply: process.argv.includes("--apply"),
    category: value("category"),
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), MAX_LIMIT) : 5,
    onlyMissing: !process.argv.includes("--include-generated"),
    onlySlugs: (value("only") ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  };
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function publicName(row: BusinessRow) {
  return row.display_name?.trim() || row.name;
}

function locationName(row: BusinessRow) {
  return row.city || row.area || row.municipality || "Mallorca";
}

function reviewText(review: Record<string, unknown>) {
  const direct = review.text;
  if (typeof direct === "string") return direct;
  if (direct && typeof direct === "object" && "text" in direct && typeof (direct as { text?: unknown }).text === "string") {
    return (direct as { text: string }).text;
  }
  return "";
}

function reviewRating(review: Record<string, unknown>) {
  return typeof review.rating === "number" ? review.rating : null;
}

function compactReviews(row: BusinessRow) {
  return (row.place_reviews ?? [])
    .map((review) => ({
      rating: reviewRating(review),
      text: reviewText(review).replace(/\s+/g, " ").trim().slice(0, REVIEW_MAX_CHARS)
    }))
    .filter((review) => review.text.length >= 40)
    .slice(0, 3);
}

function rawTypes(row: BusinessRow) {
  const rawTypesValue = Array.isArray(row.raw_google_place?.types)
    ? row.raw_google_place.types.filter((item): item is string => typeof item === "string")
    : [];
  return [...new Set([row.primary_type ?? "", ...rawTypesValue].filter(Boolean))].slice(0, 8);
}

function emptyRestaurantAttributes() {
  return {
    cuisine_types: [],
    signature_items: [],
    atmosphere_tags: [],
    service_notes: [],
    reservation_notes: [],
    price_signal: null,
    dietary_notes: [],
    best_for: []
  };
}

function emptyActivityAttributes() {
  return {
    activity_type: [],
    main_highlights: [],
    duration_notes: [],
    ticket_or_booking_notes: [],
    access_notes: [],
    crowd_timing_notes: [],
    guided_experience: [],
    physical_difficulty: [],
    best_for: []
  };
}

function emptyHotelAttributes() {
  return {
    stay_type: [],
    amenities: [],
    room_notes: [],
    food_board_notes: [],
    family_friendliness: [],
    location_strengths: [],
    service_highlights: [],
    cautions: [],
    best_for: []
  };
}

function emptyBeachAttributes() {
  return {
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
  };
}

function emptyBeachClubAttributes() {
  return {
    setting: [],
    food_drink_highlights: [],
    atmosphere_tags: [],
    daybed_or_pool_facilities: [],
    reservation_notes: [],
    price_signal: null,
    music_vibe: [],
    access_to_sea: [],
    best_for: []
  };
}

function emptyBoatAttributes() {
  return {
    experience_type: "unknown",
    guided_or_skippered: [],
    duration_notes: [],
    route_or_stops: [],
    included_extras: [],
    safety_or_accessibility_notes: [],
    price_signal: null,
    group_fit: [],
    best_for: []
  };
}

function emptyAttributesFor(category: BusinessCategory) {
  if (category === "hotel") return emptyHotelAttributes();
  if (category === "beach") return emptyBeachAttributes();
  if (category === "beach-club") return emptyBeachClubAttributes();
  if (category === "boat-rental") return emptyBoatAttributes();
  if (["restaurant", "bar", "cafe", "bakery"].includes(category)) return emptyRestaurantAttributes();
  return emptyActivityAttributes();
}

function truePlaceAttributeKeys(row: BusinessRow) {
  return Object.entries(row.place_attributes ?? {})
    .filter(([, value]) => value === true)
    .map(([key]) => key);
}

function optionKeys(row: BusinessRow, key: "paymentOptions" | "parkingOptions" | "accessibilityOptions") {
  const value = row.place_attributes?.[key];
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>)
    .filter(([, itemValue]) => itemValue === true)
    .map(([itemKey]) => itemKey);
}

function labelPlaceServices(row: BusinessRow) {
  const services: Array<{ label: string; icon: string }> = [];
  const add = (condition: boolean, label: string, icon: string) => {
    if (condition && !services.some((service) => service.label === label)) services.push({ label, icon });
  };
  const attrs = row.place_attributes ?? {};

  add(attrs.dineIn === true, "Comer en el local", "table");
  add(attrs.takeout === true, "Para llevar", "bag");
  add(attrs.delivery === true, "Entrega a domicilio", "truck");
  add(attrs.reservable === true, "Acepta reservas", "calendar");
  add(attrs.outdoorSeating === true, "Terraza", "sun");
  add(attrs.goodForGroups === true, "Bueno para grupos", "users");
  add(attrs.goodForChildren === true, "Apto para ni\u00f1os", "child");
  add(attrs.allowsDogs === true, "Admite perros", "dog");
  add(attrs.liveMusic === true, "M\u00fasica en directo", "music");
  add(attrs.servesBreakfast === true, "Desayuno", "coffee");
  add(attrs.servesBrunch === true, "Brunch", "coffee");
  add(attrs.servesLunch === true, "Comida", "plate");
  add(attrs.servesDinner === true, "Cena", "utensils");
  add(attrs.servesDessert === true, "Postres", "cake");
  add(attrs.servesVegetarianFood === true, "Opciones vegetarianas", "leaf");
  add(attrs.servesBeer === true, "Cerveza", "beer");
  add(attrs.servesWine === true, "Vino", "wine");
  add(attrs.servesCocktails === true, "C\u00f3cteles", "glass");
  add(optionKeys(row, "parkingOptions").length > 0, "Aparcamiento", "parking");
  add(optionKeys(row, "accessibilityOptions").length > 0, "Acceso adaptado", "accessibility");
  add(optionKeys(row, "paymentOptions").length > 0, "Pago con tarjeta", "credit-card");

  return services.slice(0, 10);
}

function genericServicesFor(row: BusinessRow) {
  const types = rawTypes(row).join(" ");
  const name = publicName(row).toLowerCase();
  const services: Array<{ label: string; icon: string }> = [];
  const add = (label: string, icon: string) => {
    if (!services.some((service) => service.label === label)) services.push({ label, icon });
  };

  if (row.category === "hotel") add("Alojamiento", "bed");
  if (row.category === "beach") add("Playa", "beach");
  if (row.category === "beach-club") add("Beach club", "umbrella");
  if (row.category === "boat-rental") add("Alquiler de barcos", "sailboat");
  if (row.category === "rent-a-car") {
    if (name.includes("bike") || name.includes("bici") || types.includes("bicycle")) add("Alquiler de bicicletas", "bike");
    else add("Alquiler de veh\u00edculos", "car");
  }
  if (row.category === "spa") add("Spa", "spa");
  if (row.category === "gym") add("Gimnasio", "barbell");
  if (row.category === "route") add("Ruta", "route");
  if (row.category === "excursion") add("Excursi\u00f3n", "compass");
  if (row.category === "activity") add("Actividad", "map");
  if (["restaurant", "bar", "cafe", "bakery"].includes(row.category)) {
    const label = row.category === "bar"
      ? "Bar"
      : row.category === "cafe"
        ? "Cafeter\u00eda"
        : row.category === "bakery"
          ? "Dulces y panader\u00eda"
          : "Restaurante";
    add(label, "utensils");
  }

  return services;
}

function buildServices(row: BusinessRow) {
  const services = [...labelPlaceServices(row)];
  for (const service of genericServicesFor(row)) {
    if (!services.some((item) => item.label === service.label)) services.push(service);
  }
  return services.slice(0, 10);
}

function buildCategoryAttributes(row: BusinessRow): SignalPayload["category_attributes"] {
  const data = emptyAttributesFor(row.category) as Record<string, unknown>;
  const serviceLabels = labelPlaceServices(row).map((service) => service.label);
  const confidence: "high" | "medium" | "low" = serviceLabels.length > 0
    ? "high"
    : compactReviews(row).length >= 3
      ? "medium"
      : "low";

  if ("service_notes" in data) {
    data.service_notes = serviceLabels.filter((label) => !["Cerveza", "Vino", "C\u00f3cteles"].includes(label)).slice(0, 8);
  }
  if ("dietary_notes" in data && row.place_attributes?.servesVegetarianFood === true) {
    data.dietary_notes = ["Opciones vegetarianas"];
  }
  if ("best_for" in data) {
    const bestFor: string[] = [];
    if (row.place_attributes?.goodForGroups === true) bestFor.push("Grupos");
    if (row.place_attributes?.goodForChildren === true) bestFor.push("Familias");
    data.best_for = bestFor;
  }
  if ("access_notes" in data) {
    data.access_notes = serviceLabels.filter((label) => ["Aparcamiento", "Acceso adaptado"].includes(label));
  }
  if ("facilities" in data) {
    data.facilities = serviceLabels.filter((label) => ["Aparcamiento", "Acceso adaptado"].includes(label));
  }
  if ("family_accessibility" in data && row.place_attributes?.goodForChildren === true) {
    data.family_accessibility = ["Apto para ni\u00f1os"];
  }

  return {
    schema_version: 1,
    confidence,
    data
  };
}

function mergeWithAttributeShape(row: BusinessRow, payload: AiSignalPayload): SignalPayload {
  return {
    ...payload,
    services: buildServices(row),
    category_attributes: buildCategoryAttributes(row)
  };
}

function systemPrompt() {
  return [
    "Eres un extractor de senales para fichas de Mallorca Verified.",
    "No escribas editorial larga. No inventes. Usa solo resenas, atributos de Google y tipos de Google.",
    "Si algo no esta respaldado, omitelo. Tono familiar, claro y profesional.",
    "No menciones que 'las resenas dicen' en cada frase; usa formulaciones naturales pero prudentes.",
    "Prohibido acusaciones, problemas legales, higiene grave, fraude, robos o incidentes delicados.",
    "Devuelve solo JSON valido."
  ].join(" ");
}

function userPrompt(row: BusinessRow) {
  return JSON.stringify({
    task: "Genera senales breves para una ficha simetrica: maximo 5 temas y 3 pros.",
    business: {
      name: publicName(row),
      category: row.category,
      location: locationName(row),
      rating: row.rating,
      reviews_count: row.reviews_count,
      google_types: rawTypes(row)
    },
    reviews: compactReviews(row),
    rules: [
      "No inventes precios, productos concretos ni instalaciones no respaldadas.",
      "Usa lenguaje claro, familiar y profesional.",
      "No escribas frases largas ni tecnicas."
    ],
    required_output: {
      review_themes: [{ label: "Servicio atento", icon: "mood-smile" }],
      review_pros: [
        "El trato aparece como una senal positiva recurrente.",
        "La propuesta encaja para una visita sencilla y sin complicarse.",
        "El ambiente se menciona de forma favorable."
      ]
    }
  });
}

async function callOpenAI(row: BusinessRow) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY.");
  const model = process.env.OPENAI_SIGNALS_MODEL || process.env.OPENAI_MODEL || "gpt-5.4-mini";

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userPrompt(row) }
      ],
      text: { format: { type: "json_object" } },
      max_output_tokens: 500
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${body}`);
  }

  const data = await response.json();
  const text = data.output_text ?? data.output?.flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content ?? []).find((part: { type?: string; text?: string }) => part.type === "output_text" && typeof part.text === "string")?.text;
  if (!text) throw new Error("OpenAI response did not include output text.");
  const parsed = signalSchema.parse(JSON.parse(text));
  return mergeWithAttributeShape(row, parsed);
}

async function fetchBusinesses(supabase: ReturnType<typeof createSupabaseClient>, options: Options) {
  const rows: BusinessRow[] = [];
  for (let from = 0; rows.length < options.limit; from += PAGE_SIZE) {
    let query = supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status,area,city,municipality,rating,reviews_count,primary_type,place_attributes,place_reviews,raw_google_place,review_themes,review_pros,services,category_attributes")
      .in("status", ["published", "premium"])
      .not("place_reviews", "is", null)
      .order("authority_score", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);

    if (options.category) query = query.eq("category", options.category);
    if (options.onlySlugs.length > 0) query = query.in("slug", options.onlySlugs);
    if (options.onlyMissing) query = query.or("review_themes.is.null,review_pros.is.null,services.is.null,category_attributes.is.null");

    const { data, error } = await query;
    if (error) throw error;
    const page = ((data ?? []) as BusinessRow[]).filter((row) => compactReviews(row).length > 0);
    rows.push(...page);
    if ((data ?? []).length < PAGE_SIZE) break;
  }
  return rows.slice(0, options.limit);
}

function renderReport(items: Array<{ row: BusinessRow; payload?: SignalPayload; error?: string }>, apply: boolean) {
  const lines = [
    "# Business Signals Sample",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Applied: ${apply ? "yes" : "no"}`,
    "",
    "## Samples",
    ""
  ];

  for (const item of items) {
    lines.push(`### ${publicName(item.row)} (${item.row.slug})`);
    lines.push("");
    lines.push(`- Category: ${item.row.category}`);
    lines.push(`- Location: ${locationName(item.row)}`);
    lines.push(`- Reviews used: ${compactReviews(item.row).length}`);
    if (item.error) {
      lines.push(`- Error: ${item.error}`);
      lines.push("");
      continue;
    }
    lines.push("");
    lines.push("```json");
    lines.push(JSON.stringify(item.payload, null, 2));
    lines.push("```");
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const supabase = createSupabaseClient();
  const businesses = await fetchBusinesses(supabase, options);
  const results: Array<{ row: BusinessRow; payload?: SignalPayload; error?: string }> = [];

  for (const row of businesses) {
    try {
      const payload = await callOpenAI(row);
      results.push({ row, payload });
      if (options.apply) {
        const { error } = await supabase
          .from("businesses")
          .update({
            review_sentiment: {},
            review_themes: payload.review_themes,
            review_pros: payload.review_pros,
            review_cons: [],
            services: payload.services,
            category_attributes: payload.category_attributes,
            editorial_source: "ai",
            editorial_generated_at: new Date().toISOString(),
            updated_at: new Date().toISOString().slice(0, 10)
          })
          .eq("id", row.id);
        if (error) throw error;
      }
    } catch (error) {
      results.push({ row, error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (!existsSync("reports")) mkdirSync("reports");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `business-signals-sample-${stamp}.md`);
  writeFileSync(reportPath, renderReport(results, options.apply), "utf8");
  console.log(JSON.stringify({
    mode: options.apply ? "apply" : "dry-run",
    reportPath,
    selected: businesses.length,
    generated: results.filter((item) => item.payload).length,
    errors: results.filter((item) => item.error).length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
