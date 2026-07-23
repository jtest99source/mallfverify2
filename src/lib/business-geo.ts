export type WebsiteType =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "tripadvisor"
  | "linktree"
  | "whatsapp"
  | "official_website";

export type LocationInference = {
  area: string;
  city?: string;
  municipality?: string;
};

const locationRules: Array<LocationInference & { patterns: string[] }> = [
  // Ports must NOT carry the parent town as `city`: the UI displays city||area,
  // so a parent-town city silently relabels the port as the town.
  { area: "Port d'Alcúdia", municipality: "Alcúdia", patterns: ["Port d'Alcúdia", "Port d'Alcudia", "Port Alcudia", "Puerto de Alcudia", "Puerto Alcudia", "Platja d'Alcúdia", "Platja d'Alcudia"] },
  { area: "Port de Pollença", municipality: "Pollença", patterns: ["Port de Pollença", "Port de Pollenca", "Puerto Pollensa", "Puerto de Pollensa", "Port Pollensa"] },
  { area: "Port de Sóller", municipality: "Sóller", patterns: ["Port de Sóller", "Port de Soller", "Puerto de Soller", "Port Soller"] },
  { area: "Port d'Andratx", municipality: "Andratx", patterns: ["Port d'Andratx", "Puerto de Andratx", "Puerto Andratx"] },
  { area: "Puerto Portals", municipality: "Calvià", patterns: ["Puerto Portals", "Portals Nous Marina", "Marina Portals"] },
  { area: "Portals Nous", municipality: "Calvià", patterns: ["Portals Nous"] },
  { area: "Santa Ponça", municipality: "Calvià", patterns: ["Santa Ponça", "Santa Ponca", "Santa Ponsa"] },
  { area: "Palmanova", municipality: "Calvià", patterns: ["Palmanova", "Palma Nova"] },
  { area: "Magaluf", municipality: "Calvià", patterns: ["Magaluf"] },
  { area: "Illetas", municipality: "Calvià", patterns: ["Illetas", "Illetes"] },
  { area: "Bendinat", municipality: "Calvià", patterns: ["Bendinat"] },
  { area: "Peguera", municipality: "Calvià", patterns: ["Peguera", "Paguera"] },
  { area: "Camp de Mar", municipality: "Andratx", patterns: ["Camp de Mar"] },
  { area: "Sa Dragonera", municipality: "Andratx", patterns: ["Sa Dragonera", "dragonera"] },
  { area: "Cala d'Or", municipality: "Santanyí", patterns: ["Cala d'Or", "Cala d Or", "Cala Dor"] },
  { area: "Cala Figuera", municipality: "Santanyí", patterns: ["Cala Figuera"] },
  { area: "Colonia de Sant Jordi", municipality: "Ses Salines", patterns: ["Colonia de Sant Jordi", "Colònia de Sant Jordi", "Colonia Sant Jordi"] },
  { area: "Sa Ràpita", municipality: "Campos", patterns: ["Sa Ràpita", "Sa Rapita"] },
  { area: "Portocolom", municipality: "Felanitx", patterns: ["Portocolom", "Porto Colom"] },
  { area: "Porto Cristo", municipality: "Manacor", patterns: ["Porto Cristo"] },
  // Distinct resort towns that share postal codes with a bigger neighbour —
  // without an explicit pattern they fell through to the postal fallback and
  // were mislabeled (e.g. every Sa Coma business shown as Cala Millor).
  { area: "Sa Coma", municipality: "Sant Llorenç des Cardassar", patterns: ["Sa Coma"] },
  { area: "S'Illot", municipality: "Sant Llorenç des Cardassar", patterns: ["S'Illot", "S Illot", "Cala Morlanda"] },
  { area: "Cala Bona", municipality: "Son Servera", patterns: ["Cala Bona"] },
  { area: "Cala Millor", municipality: "Sant Llorenç des Cardassar", patterns: ["Cala Millor"] },
  { area: "Son Servera", municipality: "Son Servera", patterns: ["Son Servera"] },
  { area: "El Toro", municipality: "Calvià", patterns: ["El Toro, Illes", "07180 El Toro"] },
  { area: "Costa de la Calma", municipality: "Calvià", patterns: ["Costa de la Calma"] },
  { area: "Can Pastilla", municipality: "Palma", patterns: ["Can Pastilla", "Ca'n Pastilla"] },
  { area: "S'Arenal", municipality: "Llucmajor", patterns: ["S'Arenal", "El Arenal"] },
  { area: "Cala Ratjada", municipality: "Capdepera", patterns: ["Cala Ratjada", "Cala Rajada"] },
  { area: "Playa de Muro", municipality: "Muro", patterns: ["Playa de Muro", "Platja de Muro"] },
  { area: "Can Picafort", municipality: "Santa Margalida", patterns: ["Can Picafort", "Ca'n Picafort"] },
  { area: "Alcúdia", city: "Alcúdia", municipality: "Alcúdia", patterns: ["Alcúdia", "Alcudia"] },
  { area: "Pollença", city: "Pollença", municipality: "Pollença", patterns: ["Pollença", "Pollenca", "Pollensa"] },
  { area: "Sóller", city: "Sóller", municipality: "Sóller", patterns: ["Sóller", "Soller"] },
  { area: "Andratx", city: "Andratx", municipality: "Andratx", patterns: ["Andratx"] },
  { area: "Calvià", municipality: "Calvià", patterns: ["Calvià", "Calvia"] },
  { area: "Santanyí", municipality: "Santanyí", patterns: ["Santanyí", "Santanyi"] },
  { area: "Felanitx", municipality: "Felanitx", patterns: ["Felanitx"] },
  { area: "Manacor", municipality: "Manacor", patterns: ["Manacor"] },
  { area: "Capdepera", municipality: "Capdepera", patterns: ["Capdepera"] },
  { area: "Artà", municipality: "Artà", patterns: ["Artà", "Arta"] },
  { area: "Deià", municipality: "Deià", patterns: ["Deià", "Deia"] },
  { area: "Valldemossa", municipality: "Valldemossa", patterns: ["Valldemossa"] },
  { area: "Banyalbufar", municipality: "Banyalbufar", patterns: ["Banyalbufar"] },
  { area: "Fornalutx", municipality: "Fornalutx", patterns: ["Fornalutx"] },
  { area: "Palma", city: "Palma", municipality: "Palma", patterns: ["Palma", "Palma de Mallorca"] }
];

const postalCodeRules: Record<string, LocationInference> = {
  "07001": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07002": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07003": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07004": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07005": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07006": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07007": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07008": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07009": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07010": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07011": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07012": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07013": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07014": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07015": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07100": { area: "Sóller", city: "Sóller", municipality: "Sóller" },
  "07108": { area: "Port de Sóller", municipality: "Sóller" },
  "07109": { area: "Fornalutx", municipality: "Fornalutx" },
  "07110": { area: "Bunyola", municipality: "Bunyola" },
  "07120": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07121": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07122": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07140": { area: "Sencelles", municipality: "Sencelles" },
  "07141": { area: "Marratxí", municipality: "Marratxí" },
  "07142": { area: "Santa Eugènia", municipality: "Santa Eugènia" },
  "07143": { area: "Sencelles", municipality: "Sencelles" },
  "07144": { area: "Costitx", municipality: "Costitx" },
  "07150": { area: "Andratx", city: "Andratx", municipality: "Andratx" },
  "07157": { area: "Port d'Andratx", municipality: "Andratx" },
  "07159": { area: "Sant Elm", municipality: "Andratx" },
  "07160": { area: "Peguera", municipality: "Calvià" },
  "07170": { area: "Valldemossa", municipality: "Valldemossa" },
  "07179": { area: "Deià", municipality: "Deià" },
  "07180": { area: "Santa Ponça", municipality: "Calvià" },
  "07181": { area: "Calvià", municipality: "Calvià" },
  "07183": { area: "Costa de la Calma", municipality: "Calvià" },
  "07184": { area: "Calvià", municipality: "Calvià" },
  "07190": { area: "Esporles", municipality: "Esporles" },
  "07191": { area: "Banyalbufar", municipality: "Banyalbufar" },
  "07192": { area: "Estellencs", municipality: "Estellencs" },
  "07193": { area: "Bunyola", municipality: "Bunyola" },
  "07194": { area: "Puigpunyent", municipality: "Puigpunyent" },
  "07195": { area: "Galilea", municipality: "Puigpunyent" },
  "07196": { area: "Es Capdellà", municipality: "Calvià" },
  "07198": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07199": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07200": { area: "Felanitx", municipality: "Felanitx" },
  "07208": { area: "Cas Concos", municipality: "Felanitx" },
  "07210": { area: "Algaida", municipality: "Algaida" },
  "07220": { area: "Pina", municipality: "Algaida" },
  "07230": { area: "Montuïri", municipality: "Montuïri" },
  "07240": { area: "Sant Joan", municipality: "Sant Joan" },
  "07250": { area: "Vilafranca de Bonany", municipality: "Vilafranca de Bonany" },
  "07260": { area: "Porreres", municipality: "Porreres" },
  "07270": { area: "Felanitx", municipality: "Felanitx" },
  "07290": { area: "Ariany", municipality: "Ariany" },
  "07300": { area: "Inca", municipality: "Inca" },
  "07310": { area: "Campanet", municipality: "Campanet" },
  "07311": { area: "Búger", municipality: "Búger" },
  "07312": { area: "Mancor de la Vall", municipality: "Mancor de la Vall" },
  "07313": { area: "Selva", municipality: "Selva" },
  "07314": { area: "Caimari", municipality: "Selva" },
  "07315": { area: "Lluc", municipality: "Escorca" },
  "07316": { area: "Moscari", municipality: "Selva" },
  "07320": { area: "Santa Maria del Camí", municipality: "Santa Maria del Camí" },
  "07330": { area: "Consell", municipality: "Consell" },
  "07340": { area: "Alaró", municipality: "Alaró" },
  "07349": { area: "Orient", municipality: "Bunyola" },
  "07350": { area: "Binissalem", municipality: "Binissalem" },
  "07360": { area: "Lloseta", municipality: "Lloseta" },
  "07400": { area: "Alcúdia", city: "Alcúdia", municipality: "Alcúdia" },
  "07408": { area: "Playa de Muro", municipality: "Muro" },
  "07420": { area: "Sa Pobla", municipality: "Sa Pobla" },
  "07430": { area: "Llubí", municipality: "Llubí" },
  "07440": { area: "Muro", municipality: "Muro" },
  "07450": { area: "Santa Margalida", municipality: "Santa Margalida" },
  "07458": { area: "Can Picafort", municipality: "Santa Margalida" },
  "07460": { area: "Pollença", city: "Pollença", municipality: "Pollença" },
  "07469": { area: "Cala Sant Vicenç", municipality: "Pollença" },
  "07470": { area: "Port de Pollença", municipality: "Pollença" },
  "07500": { area: "Manacor", municipality: "Manacor" },
  "07510": { area: "Sineu", municipality: "Sineu" },
  "07518": { area: "Lloret de Vistalegre", municipality: "Lloret de Vistalegre" },
  "07519": { area: "Maria de la Salut", municipality: "Maria de la Salut" },
  "07520": { area: "Petra", municipality: "Petra" },
  "07529": { area: "Ariany", municipality: "Ariany" },
  "07530": { area: "Sant Joan", municipality: "Sant Joan" },
  "07540": { area: "Son Servera", municipality: "Son Servera" },
  "07550": { area: "Son Servera", municipality: "Son Servera" },
  "07559": { area: "Cala Bona", municipality: "Son Servera" },
  "07560": { area: "Cala Millor", municipality: "Sant Llorenç des Cardassar" },
  "07570": { area: "Artà", municipality: "Artà" },
  "07579": { area: "Colònia de Sant Pere", municipality: "Artà" },
  "07580": { area: "Capdepera", municipality: "Capdepera" },
  "07589": { area: "Canyamel", municipality: "Capdepera" },
  "07590": { area: "Cala Ratjada", municipality: "Capdepera" },
  "07600": { area: "S'Arenal", municipality: "Llucmajor" },
  "07609": { area: "Llucmajor", municipality: "Llucmajor" },
  "07610": { area: "Can Pastilla", municipality: "Palma" },
  "07611": { area: "Palma", city: "Palma", municipality: "Palma" },
  "07620": { area: "Llucmajor", municipality: "Llucmajor" },
  "07629": { area: "Randa", municipality: "Algaida" },
  "07630": { area: "Campos", municipality: "Campos" },
  "07638": { area: "Colonia de Sant Jordi", municipality: "Ses Salines" },
  "07639": { area: "Sa Ràpita", municipality: "Campos" },
  "07640": { area: "Ses Salines", municipality: "Ses Salines" },
  "07650": { area: "Santanyí", municipality: "Santanyí" },
  "07659": { area: "Cala Figuera", municipality: "Santanyí" },
  "07660": { area: "Cala d'Or", municipality: "Santanyí" },
  "07669": { area: "S'Horta", municipality: "Felanitx" },
  "07670": { area: "Portocolom", municipality: "Felanitx" },
  "07680": { area: "Porto Cristo", municipality: "Manacor" },
  "07687": { area: "S'Illot", municipality: "Manacor" },
  "07688": { area: "Cala Murada", municipality: "Manacor" },
  "07689": { area: "Cales de Mallorca", municipality: "Manacor" },
  "07690": { area: "Santanyí", municipality: "Santanyí" },
  "07691": { area: "Portopetro", municipality: "Santanyí" }
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesNormalized(value: string, pattern: string) {
  return normalize(value).includes(normalize(pattern));
}

function inferFromText(value?: string | null): LocationInference | null {
  if (!value) return null;

  for (const rule of locationRules) {
    if (rule.patterns.some((pattern) => includesNormalized(value, pattern))) {
      return {
        area: rule.area,
        city: rule.city,
        municipality: rule.municipality
      };
    }
  }

  return null;
}

function inferFromPostalCode(value?: string | null): LocationInference | null {
  const postalCode = value?.match(/\b(07[0-8]\d{2})\b/)?.[1];
  if (!postalCode) return null;
  return postalCodeRules[postalCode] ?? null;
}

export function detectWebsiteType(website?: string | null): WebsiteType | null {
  if (!website) return null;
  const value = website.toLowerCase();

  if (value.includes("instagram.com")) return "instagram";
  if (value.includes("facebook.com")) return "facebook";
  if (value.includes("tiktok.com")) return "tiktok";
  if (value.includes("tripadvisor.")) return "tripadvisor";
  if (value.includes("linktr.ee")) return "linktree";
  if (value.includes("wa.me") || value.includes("whatsapp")) return "whatsapp";

  return "official_website";
}

export function createSocialProfiles(website?: string | null, websiteType?: WebsiteType | null) {
  if (!website || !websiteType || websiteType === "official_website") return {};
  return { [websiteType]: website };
}

// Mallorca bounding box. Google Places text search returns identically-named
// places elsewhere (the Mallorcan village "Lloret" pulls in Lloret de Mar in
// Girona, "Petra" pulls in Petra/Jordan, "Manacor" pulled a place in Andorra…).
// Anything whose coordinates fall outside these bounds is not on the island and
// must never be imported or listed. Bounds are generous and cover all of
// Mallorca while excluding Ibiza (lng < 2.2), Menorca (lng > 3.6) and the
// mainland. Rows without coordinates are treated as valid (legacy tolerance).
export const MALLORCA_BOUNDS = { minLat: 39.2, maxLat: 40.0, minLng: 2.2, maxLng: 3.6 } as const;

export function isWithinMallorca(latitude?: number | null, longitude?: number | null): boolean {
  if (typeof latitude !== "number" || typeof longitude !== "number") return true;
  return (
    latitude >= MALLORCA_BOUNDS.minLat &&
    latitude <= MALLORCA_BOUNDS.maxLat &&
    longitude >= MALLORCA_BOUNDS.minLng &&
    longitude <= MALLORCA_BOUNDS.maxLng
  );
}

export function inferLocationFromAddress(address?: string | null): LocationInference {
  return inferFromText(address) ?? inferFromPostalCode(address) ?? { area: "Mallorca" };
}

export function inferLocationFromTexts(...values: Array<string | null | undefined>): LocationInference {
  for (const value of values) {
    const inferred = inferFromText(value) ?? inferFromPostalCode(value);
    if (inferred) return inferred;
  }

  return { area: "Mallorca" };
}

export function isMoreSpecificLocation(current: LocationInference, next: LocationInference) {
  if (!next.area || next.area === "Mallorca") return false;
  if (!current.area || current.area === "Mallorca") return true;
  if (current.area === next.area) return false;

  const currentMunicipality = current.municipality ?? current.city ?? current.area;
  const nextMunicipality = next.municipality ?? next.city ?? next.area;
  return current.area === nextMunicipality || currentMunicipality === nextMunicipality;
}

export function calculateAuthorityScore(input: { rating?: number | null; reviews_count?: number | null; website?: string | null; phone?: string | null }) {
  const rating = typeof input.rating === "number" ? input.rating : 0;
  const reviewsCount = typeof input.reviews_count === "number" ? input.reviews_count : 0;
  const websiteBonus = input.website ? 10 : 0;
  const phoneBonus = input.phone ? 5 : 0;

  return Number((rating * 20 + Math.log10(reviewsCount + 1) * 20 + websiteBonus + phoneBonus).toFixed(4));
}
