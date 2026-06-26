import type { BusinessCategory } from "@/types/business";
import type { RankingCategory } from "@/types/ranking";
import { siteConfig } from "@/config/site";

export const siteUrl = siteConfig.url;

export const categoryConfigs = {
  restaurants: {
    label: "Restaurantes",
    singular: "Restaurante",
    businessCategory: "restaurant",
    icon: "IconToolsKitchen2",
    title: "Restaurantes en Mallorca",
    intro: "Los mejores restaurantes de Mallorca según valoración y reseñas reales de Google. Desde terrazas frente al mar en Palma hasta rincones de interior que pocos conocen.",
    faq: "¿Cómo elegimos restaurantes en Mallorca?",
    editorialContext: "Para elegir restaurante en Mallorca conviene comparar algo más que la nota media: volumen de reseñas, consistencia, zona, tipo de cocina, horarios y señales recientes. Palma concentra mucha oferta, pero Alcúdia, Sóller, Pollença, Santanyí o Cala d'Or también tienen restaurantes muy fuertes según el tipo de plan."
  },
  hotels: {
    label: "Hoteles",
    singular: "Hotel",
    businessCategory: "hotel",
    icon: "IconBed",
    title: "Hoteles en Mallorca",
    intro: "Hoteles boutique, rurales y de playa en Mallorca ordenados por calidad real. Elegir bien el hotel es elegir bien la zona: aquí tienes los datos para decidir.",
    faq: "¿Qué zona de Mallorca conviene para alojarse?",
    editorialContext: "En hoteles, la zona pesa tanto como la valoración. Palma funciona para vida urbana y restaurantes; el norte suele ser cómodo para familias; la Tramuntana encaja con calma y paisaje; el sureste es buena base para calas. Comparamos reseñas, volumen, ubicación y tipo de estancia."
  },
  "beach-clubs": {
    label: "Beach clubs",
    singular: "Beach club",
    businessCategory: "beach-club",
    icon: "IconUmbrella",
    title: "Beach clubs en Mallorca",
    intro: "Los mejores beach clubs de Mallorca para una comida larga, un atardecer con cócteles o un día de playa con hamaca, piscina y servicio. Ordenados por valoración real.",
    faq: "¿Qué beach club elegir cerca de Palma?",
    editorialContext: "No todos los beach clubs sirven para el mismo plan. Algunos son más restaurante, otros priorizan piscina, música o hamacas. Por eso comparamos valoración, reseñas, zona, facilidad de reserva, ambiente y encaje para parejas, grupos o familias."
  },
  boats: {
    label: "Barcos",
    singular: "Empresa de barcos",
    businessCategory: "boat-rental",
    icon: "IconSailboat",
    title: "Alquiler de barcos en Mallorca",
    intro: "Las mejores empresas de alquiler de barcos en Mallorca, con y sin patrón, por horas o días, desde Palma, Alcúdia, Andratx o Pollença. Verificadas con reseñas reales.",
    faq: "¿Dónde es más fácil alquilar barco por primera vez?",
    editorialContext: "Alquilar barco en Mallorca depende de la zona de salida, del tipo de embarcación y de si necesitas patrón. Palma, Alcúdia, Portocolom, Andratx y Pollença cubren planes muy distintos. Priorizamos operadores con reseñas consistentes, información clara y buena experiencia previa."
  },
  activities: {
    label: "Actividades",
    singular: "Actividad",
    businessCategory: "activity",
    icon: "IconMountain",
    title: "Actividades en Mallorca",
    intro: "Las mejores actividades en Mallorca: kayak, buceo, senderismo, visitas a bodegas, excursiones en barco y mucho más. Todos los operadores ordenados por calidad verificada.",
    faq: "¿Qué actividad hacer si solo tengo un día libre?",
    editorialContext: "Las actividades se comparan por calidad de la experiencia, reseñas, seguridad, duración y facilidad de reserva. Mallorca combina mar, montaña, cultura y gastronomía, así que el mejor plan depende del tiempo disponible, la zona y el tipo de viajero."
  },
  beaches: {
    label: "Playas y calas",
    singular: "Playa o cala",
    businessCategory: "beach",
    icon: "IconBeach",
    title: "Playas y calas de Mallorca",
    intro: "Las mejores playas y calas de Mallorca, desde las más accesibles hasta las más escondidas. Con información de acceso, tipo de arena y qué esperar en cada una.",
    faq: "¿Qué cala elegir si busco algo cómodo?",
    editorialContext: "La mejor cala no siempre es la más famosa. Valoramos acceso, entorno, servicios, tipo de arena o roca, saturación y encaje para familias, parejas o rutas de día completo. En verano conviene revisar horarios, parking y alternativas cercanas."
  },
  bars: {
    label: "Bares",
    singular: "Bar",
    businessCategory: "bar",
    icon: "IconGlass",
    title: "Bares en Mallorca",
    intro: "Los mejores bares de Mallorca para tapas, cócteles, vermut o una cerveza con vistas. Coctelería de autor en Palma, chiringuitos de playa y tabernas de pueblo.",
    faq: "¿Dónde tomar algo en Mallorca?",
    editorialContext: "Los bares funcionan por momento: aperitivo, tarde, noche, vistas, música o tapas. Ordenamos señales comparables de Google y añadimos contexto de zona para que sea fácil elegir sin mezclar planes que no compiten entre sí."
  },
  cafes: {
    label: "Cafeterías",
    singular: "Cafetería",
    businessCategory: "cafe",
    icon: "IconCoffee",
    title: "Cafeterías y brunch en Mallorca",
    intro: "Las mejores cafeterías y sitios de brunch en Mallorca. Specialty coffee, desayunos mallorquines, croissants y brunch de fin de semana verificados con reseñas reales.",
    faq: "¿Dónde desayunar bien en Mallorca?",
    editorialContext: "En cafeterías miramos valoración, volumen de reseñas, consistencia, tipo de desayuno, ubicación y si el lugar encaja para trabajar, desayunar rápido o hacer un brunch largo."
  },
  nightlife: {
    label: "Nightlife",
    singular: "Local nocturno",
    businessCategory: "nightlife",
    icon: "IconMusic",
    title: "Discotecas y nightlife en Mallorca",
    intro: "Clubs, discotecas y locales nocturnos de Mallorca para salir de noche con contexto real: zona, ambiente, reseñas y señales útiles antes de decidir.",
    faq: "¿Dónde salir de noche en Mallorca si vengo de fuera?",
    editorialContext: "En nightlife la nota media suele variar más que en otras categorías, así que miramos reseñas, volumen, zona, seguridad percibida, tipo de público y encaje para turistas, nómadas o residentes internacionales."
  },
  bakeries: {
    label: "Hornos y pastelerías",
    singular: "Horno o pastelería",
    businessCategory: "bakery",
    icon: "IconBread",
    title: "Hornos y pastelerías en Mallorca",
    intro: "Panaderías y pastelerías de Mallorca para ensaimadas, coques, pan artesanal y dulces tradicionales. Ordenadas por reseñas reales y señales verificables.",
    faq: "¿Dónde comprar ensaimadas en Mallorca?",
    editorialContext: "Los hornos y pastelerías se valoran por producto, tradición, reseñas recientes y facilidad de visita. En Mallorca hay mucha oferta local que merece ranking propio, especialmente fuera de las rutas más turísticas."
  },
  "rent-a-car": {
    label: "Rent a car",
    singular: "Alquiler de coches",
    businessCategory: "rent-a-car",
    icon: "IconCar",
    title: "Alquiler de coches en Mallorca",
    intro: "Empresas de alquiler de coches en Mallorca por aeropuerto, Palma o zonas turísticas. Valoraciones reales y puntos a revisar antes de reservar.",
    faq: "¿Cuánto cuesta alquilar un coche en Mallorca?",
    editorialContext: "En rent a car importan las reseñas recientes, la claridad de condiciones, depósitos, seguros, recogida y atención al cliente. Separarlo del resto de categorías evita comparar servicios muy distintos."
  },
  "car-dealers": {
    label: "Concesionarios",
    singular: "Compraventa de coches",
    businessCategory: "car-dealer",
    icon: "IconCarGarage",
    title: "Compraventa de coches en Mallorca",
    intro: "Concesionarios y compraventas de coches en Mallorca para residentes, expats y estancias largas que necesitan comparar opciones con datos reales.",
    faq: "¿Dónde comprar un coche de segunda mano en Mallorca?",
    editorialContext: "Para compraventa de coches priorizamos volumen de reseñas, claridad comercial, ubicación, experiencia postventa y señales de confianza. Es una categoría especialmente útil para expats y residentes nuevos."
  },
  spas: {
    label: "Spas y wellness",
    singular: "Spa",
    businessCategory: "spa",
    icon: "IconSpa",
    title: "Spas y centros de bienestar en Mallorca",
    intro: "Spas, wellness y centros de masaje en Mallorca: desde hoteles de lujo hasta day spas y tratamientos urbanos verificados con reseñas reales.",
    faq: "¿Cuál es el mejor spa de Mallorca?",
    editorialContext: "En bienestar no basta con mirar fotos. Comparamos reseñas, tipo de tratamiento, ubicación, facilidad de reserva y si el centro funciona para una visita puntual o para repetir."
  },
  gyms: {
    label: "Gimnasios",
    singular: "Gimnasio",
    businessCategory: "gym",
    icon: "IconBarbell",
    title: "Gimnasios en Mallorca",
    intro: "Gimnasios en Mallorca por zona: fitness, crossfit, yoga, pilates, funcional y centros deportivos ordenados por valoración real.",
    faq: "¿Qué gimnasio elegir en Palma de Mallorca?",
    editorialContext: "Los gimnasios se comparan por valoración, reseñas, ubicación, tipo de entrenamiento y señales de servicio. Es una categoría especialmente útil para residentes y estancias largas."
  },
  healthcare: {
    label: "Salud",
    singular: "Clínica o profesional sanitario",
    businessCategory: "healthcare",
    icon: "IconHeartRateMonitor",
    title: "Clínicas, médicos y dentistas en Mallorca",
    intro: "Clínicas privadas, médicos y dentistas en Mallorca orientados a extranjeros, expats y visitantes que necesitan resolver algo con rapidez.",
    faq: "¿Dónde encontrar médico o dentista que atienda a extranjeros en Mallorca?",
    editorialContext: "En salud miramos reseñas, volumen, especialidad, ubicación, claridad de contacto y señales de atención internacional. No sustituye consejo médico, pero ayuda a encontrar opciones verificables."
  },
  "real-estate": {
    label: "Inmobiliarias",
    singular: "Agencia inmobiliaria",
    businessCategory: "real-estate",
    icon: "IconHomeDollar",
    title: "Agencias inmobiliarias en Mallorca",
    intro: "Agencias inmobiliarias en Mallorca para comprar, alquilar o comparar zonas si vienes de fuera y necesitas señales públicas antes de contactar.",
    faq: "¿Qué agencia inmobiliaria elegir en Mallorca si soy extranjero?",
    editorialContext: "En real estate valoramos reseñas, volumen, zona, claridad de servicio y orientación a compradores o residentes internacionales. La posición nunca depende de acuerdos comerciales."
  },
  routes: {
    label: "Rutas y miradores",
    singular: "Ruta o mirador",
    businessCategory: "route",
    icon: "IconRoute",
    title: "Rutas y miradores en Mallorca",
    intro: "Rutas de senderismo, miradores y caminos de Mallorca, desde la Serra de Tramuntana hasta paseos fáciles junto al mar.",
    faq: "¿Qué ruta hacer en Mallorca para principiantes?",
    editorialContext: "En rutas importan dificultad, acceso, parking, época del año y seguridad. Clasificarlas por intención ayuda a evitar planes bonitos pero poco prácticos para el usuario."
  },
  excursions: {
    label: "Excursiones",
    singular: "Excursión",
    businessCategory: "excursion",
    icon: "IconCompass",
    title: "Excursiones organizadas en Mallorca",
    intro: "Excursiones, tours y visitas guiadas en Mallorca: barco, 4x4, rutas culturales, experiencias gastronómicas y planes de día completo.",
    faq: "¿Qué excursión contratar en Mallorca?",
    editorialContext: "Las excursiones se ordenan por calidad de experiencia, reseñas, claridad de itinerario, seguridad y facilidad de reserva. Es una categoría clave para visitantes que quieren resolver planes rápido."
  }
} as const;

export type CategorySlug = keyof typeof categoryConfigs;

export const publicCategorySlugs = [
  "restaurants",
  "hotels",
  "beach-clubs",
  "bars",
  "cafes",
  "nightlife",
  "activities",
  "boats",
  "rent-a-car",
  "car-dealers",
  "spas",
  "healthcare",
  "real-estate"
] as const satisfies CategorySlug[];

export type PublicCategorySlug = (typeof publicCategorySlugs)[number];

export function isPublicCategorySlug(value: string): value is PublicCategorySlug {
  return (publicCategorySlugs as readonly string[]).includes(value);
}

export const categoryGroups = {
  gastronomia: {
    label: "Gastronomía",
    categories: ["restaurants", "bars", "cafes"] as CategorySlug[]
  },
  alojamiento: {
    label: "Alojamiento",
    categories: ["hotels"] as CategorySlug[]
  },
  playa: {
    label: "Playa y náutico",
    categories: ["beach-clubs", "boats"] as CategorySlug[]
  },
  bienestar: {
    label: "Bienestar",
    categories: ["spas", "healthcare"] as CategorySlug[]
  },
  experiencias: {
    label: "Experiencias",
    categories: ["activities"] as CategorySlug[]
  },
  movilidad: {
    label: "Movilidad",
    categories: ["rent-a-car", "car-dealers", "real-estate"] as CategorySlug[]
  }
} as const;

export function getCategorySlugFromBusiness(category: BusinessCategory): CategorySlug {
  const entry = Object.entries(categoryConfigs).find(([, config]) => config.businessCategory === category);
  return (entry?.[0] ?? "restaurants") as CategorySlug;
}

export function getBusinessCategoryFromSlug(category: CategorySlug): BusinessCategory {
  return categoryConfigs[category].businessCategory;
}

export function isCategorySlug(value: string): value is CategorySlug {
  return value in categoryConfigs;
}

export function isRankingCategory(value: string): value is RankingCategory {
  return value in categoryConfigs;
}

const categoryGuideKeywords: Record<CategorySlug, string[]> = {
  restaurants: ["restauran", "comer", "dining", "gastronomía", "gastronom"],
  hotels: ["hotel", "alojam", "dormir", "stay"],
  "beach-clubs": ["beach club", "chiringuito", "playa"],
  boats: ["barco", "boat", "vela", "sail", "nautic"],
  activities: ["actividad", "activity", "excursión", "senderismo", "kayak", "que hacer", "things to do"],
  beaches: ["playa", "cala", "beach"],
  bars: ["bar", "cóctel", "cocktail", "vermut", "copa"],
  cafes: ["café", "cafe", "brunch", "desayuno", "coffee"],
  nightlife: ["nightlife", "discoteca", "noche", "club"],
  bakeries: ["ensaimada", "pastelería", "panadería", "bakery", "horno"],
  "rent-a-car": ["coche", "car rental", "alquiler de coche"],
  "car-dealers": ["compra", "concesionario", "segunda mano", "car"],
  spas: ["spa", "wellness", "bienestar", "masaje"],
  gyms: ["gimnasio", "gym", "fitness", "deporte"],
  healthcare: ["médico", "doctor", "dentista", "salud", "clínica", "health"],
  "real-estate": ["inmobiliaria", "property", "comprar casa", "real estate", "vivienda"],
  routes: ["ruta", "senderismo", "mirador", "trail", "hiking"],
  excursions: ["excursión", "tour", "visita", "excursion"]
};

export function getCategoryGuideKeywords(category: CategorySlug): string[] {
  return categoryGuideKeywords[category] ?? [];
}
