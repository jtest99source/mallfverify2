import { toSlug } from "@/lib/slugs";
import type { CategorySlug } from "@/lib/data";
import type { Business } from "@/types/business";
import type { RankingCategory } from "@/types/ranking";

export type RankingFacet = {
  slug: string;
  label: string;
  title: string;
  intro: string;
  keywords: string[];
};

function facet(slug: string, label: string, title: string, keywords: string[]): RankingFacet {
  return {
    slug,
    label,
    title,
    intro: `${title} ordenados con señales comparables: valoración, volumen de reseñas y autoridad relativa dentro del mismo tipo de negocio.`,
    keywords
  };
}

export const rankingFacets = {
  restaurants: [
    facet("mediterraneo", "Mediterráneo", "Restaurantes mediterráneos en Mallorca", ["mediterranean", "mediterraneo", "mediterráneo", "mallorquin", "mallorquín"]),
    facet("tapas", "Tapas", "Restaurantes de tapas en Mallorca", ["tapas", "pinchos", "vermuteria", "vermutería", "taberna"]),
    facet("pizza", "Pizza", "Pizzerías en Mallorca", ["pizza", "pizzeria", "pizzería", "italian", "italiano", "trattoria"]),
    facet("brunch", "Brunch", "Brunch y cafés en Mallorca", ["brunch", "coffee", "cafe", "café", "desayuno", "bakery", "pasteleria", "pastelería"]),
    facet("carne", "Carne", "Restaurantes de carne en Mallorca", ["steak", "steakhouse", "carne", "grill", "asador", "brasa", "parrilla"]),
    facet("marisco", "Marisco", "Restaurantes de pescado y marisco", ["marisco", "pescado", "seafood", "fish", "fresco", "lonja"]),
    facet("sushi", "Sushi", "Restaurantes de sushi en Mallorca", ["sushi", "japanese", "japon", "japonés", "nikkei", "izakaya", "ramen"]),
    facet("mallorquin", "Mallorquín", "Restaurantes mallorquines tradicionales", ["mallorquin", "mallorquín", "tradicional", "celler", "sobrasada", "pa amb oli"]),
    facet("hamburguesas", "Hamburguesas", "Hamburgueserías en Mallorca", ["burger", "hamburguesa", "hamburguesería", "hamburgueseria"]),
    facet("arrocerias", "Arrocerías", "Arrocerías y paellas en Mallorca", ["arroz", "arroceria", "arrocería", "paella"])
  ],
  hotels: [
    facet("playa", "Playa", "Hoteles cerca de playa en Mallorca", ["playa", "beach", "mar", "sea", "cala"]),
    facet("spa", "Spa", "Hoteles con spa en Mallorca", ["spa", "wellness", "thermal", "thalasso", "masaje"]),
    facet("lujo", "Lujo", "Hoteles de lujo en Mallorca", ["lujo", "luxury", "grand", "resort", "5 star", "5 estrellas"]),
    facet("boutique", "Boutique", "Hoteles boutique en Mallorca", ["boutique", "small luxury", "interior", "design", "diseño"]),
    facet("rurales", "Rurales", "Hoteles rurales en Mallorca", ["rural", "finca", "agroturismo", "agroturisme", "country"]),
    facet("adults-only", "Adults only", "Hoteles adults only en Mallorca", ["adults", "adultos", "only adults", "+16", "+18", "+12"]),
    facet("familiares", "Familiares", "Hoteles familiares en Mallorca", ["family", "familia", "familias", "kids", "niños"])
  ],
  "beach-clubs": [
    facet("restaurante", "Restaurante", "Beach clubs para comer en Mallorca", ["restaurant", "restaurante", "food", "comida", "cocina"]),
    facet("fiesta", "Fiesta", "Beach clubs con ambiente en Mallorca", ["party", "fiesta", "music", "musica", "música", "dj", "club"]),
    facet("tranquilos", "Tranquilos", "Beach clubs tranquilos en Mallorca", ["tranquilo", "relajado", "quiet", "calm", "relax"]),
    facet("piscina", "Piscina", "Beach clubs con piscina en Mallorca", ["piscina", "pool", "daybed", "hamaca"]),
    facet("familiares", "Familiares", "Beach clubs familiares en Mallorca", ["family", "familia", "familias", "kids", "niños"])
  ],
  boats: [
    facet("excursiones", "Excursiones", "Excursiones en barco en Mallorca", ["tour", "excursion", "excursión", "trip", "boat tour"]),
    facet("veleros", "Veleros", "Salidas en velero en Mallorca", ["sailing", "sail", "velero", "vela", "llaut", "llaüt"]),
    facet("sin-licencia", "Sin licencia", "Barcos sin licencia en Mallorca", ["sin licencia", "without license", "no license"]),
    facet("con-patron", "Con patrón", "Alquiler de barcos con patrón", ["patron", "patrón", "skipper", "skippered", "captain", "capitan", "capitán"]),
    facet("jet-ski", "Jet ski", "Jet ski en Mallorca", ["jet ski", "jetski", "moto de agua", "watercraft"]),
    facet("catamaranes", "Catamaranes", "Catamaranes en Mallorca", ["catamaran", "catamarán"])
  ],
  activities: [
    facet("tours-excursiones", "Tours", "Tours y excursiones en Mallorca", ["tour", "excursion", "excursión", "guide", "guía", "visita"]),
    facet("aventura", "Aventura", "Actividades de aventura en Mallorca", ["adventure", "aventura", "quad", "buggy", "climb", "escalada", "tirolina"]),
    facet("acuaticas", "Acuáticas", "Actividades acuáticas en Mallorca", ["water", "acuatico", "acuático", "diving", "buceo", "kayak", "paddle", "snorkel", "surf"]),
    facet("museos-cultura", "Museos y cultura", "Museos y cultura en Mallorca", ["museum", "museo", "cultura", "cultural", "art", "arte", "gallery", "galeria"]),
    facet("bodegas", "Bodegas", "Bodegas y vino en Mallorca", ["bodega", "wine", "vino", "vineyard", "viñedo", "vinyes"]),
    facet("miradores", "Miradores", "Miradores y rutas escénicas en Mallorca", ["mirador", "viewpoint", "foradada", "talaia", "faro"]),
    facet("wellness-spa", "Wellness", "Wellness y spa en Mallorca", ["spa", "wellness", "yoga", "retreat", "masaje"])
  ],
  beaches: [
    facet("arena", "Arena", "Playas de arena en Mallorca", ["sand", "arena", "playa"]),
    facet("calas", "Calas", "Calas de Mallorca", ["cala", "calo", "caló"]),
    facet("naturales", "Naturales", "Playas naturales en Mallorca", ["natural", "parque", "wild", "salvaje", "virgen"]),
    facet("familiares", "Familiares", "Playas familiares en Mallorca", ["family", "familia", "familias", "kids", "niños", "arena", "facil", "fácil"]),
    facet("acceso-facil", "Acceso fácil", "Playas de acceso fácil en Mallorca", ["parking", "facil", "fácil", "acceso", "services", "servicios"]),
    facet("snorkel", "Snorkel", "Calas para snorkel en Mallorca", ["snorkel", "clear water", "agua clara", "roca", "rocky"]),
    facet("tramuntana", "Tramuntana", "Playas y calas de Tramuntana", ["tramuntana", "deia", "deià", "soller", "sóller", "escorca"])
  ],
  bars: [
    facet("tapas", "Tapas", "Bares de tapas en Mallorca", ["tapas", "pinchos", "vermut", "taberna"]),
    facet("cocteles", "Cócteles", "Coctelerías en Mallorca", ["cocktail", "coctel", "cóctel", "mixology"]),
    facet("terraza", "Terraza", "Bares con terraza en Mallorca", ["terraza", "terrace", "rooftop", "vistas"])
  ],
  cafes: [
    facet("brunch", "Brunch", "Brunch en Mallorca", ["brunch", "breakfast", "desayuno"]),
    facet("specialty-coffee", "Specialty coffee", "Cafés de especialidad en Mallorca", ["specialty", "coffee", "cafe", "café", "roaster"]),
    facet("pasteleria", "Pastelería", "Cafeterías con dulce en Mallorca", ["pasteleria", "pastelería", "bakery", "croissant", "ensaimada"])
  ],
  bakeries: [
    facet("ensaimadas", "Ensaimadas", "Hornos de ensaimadas en Mallorca", ["ensaimada", "pasteleria", "pastelería"]),
    facet("pan-artesano", "Pan artesano", "Panaderías artesanas en Mallorca", ["pan", "bread", "artesano", "masa madre"])
  ],
  spas: [
    facet("hotel-spa", "Hotel spa", "Spas de hotel en Mallorca", ["hotel", "spa", "wellness"]),
    facet("masajes", "Masajes", "Centros de masaje en Mallorca", ["massage", "masaje", "treatment", "tratamiento"])
  ],
  gyms: [
    facet("crossfit", "Crossfit", "Crossfit en Mallorca", ["crossfit", "functional", "funcional"]),
    facet("yoga-pilates", "Yoga y pilates", "Yoga y pilates en Mallorca", ["yoga", "pilates", "studio"])
  ],
  "rent-a-car": [
    facet("aeropuerto", "Aeropuerto", "Rent a car en el aeropuerto de Mallorca", ["airport", "aeropuerto", "terminal"]),
    facet("sin-franquicia", "Sin franquicia", "Rent a car sin franquicia en Mallorca", ["sin franquicia", "no excess", "full insurance"])
  ],
  "car-dealers": [
    facet("segunda-mano", "Segunda mano", "Coches de segunda mano en Mallorca", ["used", "segunda mano", "ocasión"]),
    facet("oficial", "Oficial", "Concesionarios oficiales en Mallorca", ["oficial", "dealer", "concesionario"])
  ],
  markets: [
    facet("producto-local", "Producto local", "Mercados con producto local en Mallorca", ["local", "mallorca", "gourmet", "artesano"]),
    facet("ecologico", "Ecológico", "Tiendas ecológicas en Mallorca", ["eco", "ecologico", "ecológico", "organic"])
  ],
  "local-shops": [
    facet("artesania", "Artesanía", "Tiendas de artesanía en Mallorca", ["artesania", "artesanía", "handmade"]),
    facet("moda", "Moda", "Tiendas de moda en Mallorca", ["fashion", "moda", "boutique"])
  ],
  museums: [
    facet("arte", "Arte", "Museos de arte en Mallorca", ["art", "arte", "gallery", "galeria"]),
    facet("historia", "Historia", "Museos históricos en Mallorca", ["history", "historia", "patrimonio"])
  ],
  routes: [
    facet("miradores", "Miradores", "Miradores en Mallorca", ["mirador", "viewpoint", "faro"]),
    facet("senderismo", "Senderismo", "Rutas de senderismo en Mallorca", ["hiking", "senderismo", "trail", "ruta"])
  ],
  excursions: [
    facet("barco", "Barco", "Excursiones en barco en Mallorca", ["boat", "barco", "catamaran", "catamarán"]),
    facet("guiadas", "Guiadas", "Visitas guiadas en Mallorca", ["guide", "guía", "guided", "tour"])
  ]
} satisfies Partial<Record<RankingCategory, RankingFacet[]>>;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function flattenValue(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return [String(value)];
  if (Array.isArray(value)) return value.flatMap(flattenValue);
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).flatMap(flattenValue);
  return [];
}

export function getFacet(category: CategorySlug, facetSlug: string) {
  return (rankingFacets[category] ?? []).find((item) => item.slug === facetSlug);
}

export function isFacetSlug(category: CategorySlug, facetSlug: string) {
  return Boolean(getFacet(category, facetSlug));
}

export function getBusinessFacetText(business: Business) {
  const rawTypes = business.rawGooglePlace && Array.isArray(business.rawGooglePlace.types) ? business.rawGooglePlace.types : [];
  const attributes = business.categoryAttributes?.data;
  return normalize(
    [
      business.name,
      business.displayName,
      business.originalName,
      business.shortDescription,
      business.description,
      business.area,
      business.city,
      business.municipality,
      business.websiteType,
      ...business.tags,
      ...business.bestFor,
      ...(business.idealFor ?? []),
      ...flattenValue(attributes),
      ...flattenValue(rawTypes)
    ]
      .filter(Boolean)
      .join(" ")
  );
}

export function businessMatchesFacet(business: Business, facet: RankingFacet) {
  const text = getBusinessFacetText(business);
  return facet.keywords.some((keyword) => text.includes(normalize(keyword)));
}

export function filterBusinessesByFacet(businesses: Business[], facet: RankingFacet) {
  return businesses.filter((business) => businessMatchesFacet(business, facet));
}

export function getPopularFacetsForBusinesses(category: CategorySlug, businesses: Business[], minCount = 3) {
  return (rankingFacets[category] ?? [])
    .map((item) => ({ ...item, count: filterBusinessesByFacet(businesses, item).length }))
    .filter((item) => item.count >= minCount)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "es"));
}

export function facetPath(locale: string, category: CategorySlug, facetSlug: string) {
  return `/${locale}/top/${category}/${toSlug(facetSlug)}`;
}
