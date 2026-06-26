import type { Ranking } from "@/types/ranking";

export const rankings: Ranking[] = [
  {
    id: "top-restaurantes-desconocidos-mallorca",
    slug: "top-restaurantes-desconocidos-mallorca",
    locale: "es",
    title: "Top 5 restaurantes desconocidos en Mallorca",
    hook: "Cinco sitios con criterio para salir del circuito más obvio sin convertir la cena en una aventura rara.",
    intro: "Mallorca tiene restaurantes muy visibles, pero también lugares con personalidad que no siempre aparecen en las listas de siempre. Esta selección prioriza contexto, producto y una experiencia con sentido.",
    category: "restaurants",
    items: [
      { position: 1, businessId: "miceli-selva", name: "Miceli", description: "Cocina de mercado en Selva con ritmo de pueblo.", whyWePickedIt: "Lo elegimos porque obliga a salir de Palma y recompensa con una experiencia más pausada.", bestFor: ["interior", "cocina de mercado"] },
      { position: 2, businessId: "ca-na-toneta-caimari", name: "Ca Na Toneta", description: "Producto mallorquín y una lectura local sin ruido.", whyWePickedIt: "Tiene criterio local y encaja muy bien con una ruta por la Serra.", bestFor: ["producto local", "comida tranquila"] },
      { position: 3, businessId: "patiki-beach-soller", name: "Patiki Beach", description: "Comida relajada frente al mar en Port de Sóller.", whyWePickedIt: "No pretende ser formal: es fresco, directo y muy útil en un día de costa.", bestFor: ["mar", "amigos"] },
      { position: 4, businessId: "bodega-barahona-casa-manolo-ses-salines", name: "Casa Manolo", description: "Clásico del sur para pescado y marisco.", whyWePickedIt: "Porque sigue siendo una alternativa sólida cuando el producto importa más que la decoración.", bestFor: ["pescado", "sur"] },
      { position: 5, businessId: "nama-deia", name: "Nama Deià", description: "Asiático con terraza en plena Tramuntana.", whyWePickedIt: "Aporta variedad en una zona donde muchos planes se parecen entre sí.", bestFor: ["deià", "cena de verano"] }
    ],
    faqs: [{ question: "¿Cuál es la mejor zona para encontrar restaurantes menos turísticos?", answer: "El interior, Sóller, Deià fuera de horas punta y algunos barrios de Palma suelen dar mejores resultados que las zonas más obvias de playa." }],
    seo: { title: "Top 5 restaurantes desconocidos en Mallorca | Mallorca Verified", description: "Cinco restaurantes en Mallorca para comer bien fuera de los planes más previsibles." },
    updatedAt: "2026-06-07"
  },
  {
    id: "mejores-beach-clubs-mallorca",
    slug: "mejores-beach-clubs-mallorca",
    locale: "es",
    title: "Mejores beach clubs de Mallorca",
    hook: "Opciones distintas según busques fiesta, vistas, comodidad cerca de Palma o un día largo junto al mar.",
    intro: "No todos los beach clubs de Mallorca sirven para el mismo tipo de plan. Esta guía separa ambiente, ubicación y utilidad real para elegir mejor.",
    category: "beach-clubs",
    items: [
      { position: 1, businessId: "gran-folies-cala-llamp", name: "Gran Folies", description: "Roca, piscina y vistas en Cala Llamp.", whyWePickedIt: "Tiene una ubicación muy especial y un ambiente más adulto.", bestFor: ["vistas", "parejas"] },
      { position: 2, businessId: "purobeach-palma", name: "Purobeach Palma", description: "Plan cómodo cerca de Palma.", whyWePickedIt: "Es práctico si quieres beach club sin montar una excursión larga.", bestFor: ["palma", "tarde"] },
      { position: 3, businessId: "nikki-beach-mallorca", name: "Nikki Beach Mallorca", description: "Ambiente internacional y social.", whyWePickedIt: "Funciona cuando el objetivo es energía, música y grupo.", bestFor: ["grupos", "celebración"] },
      { position: 4, businessId: "assona-portals", name: "Assona Portals", description: "Costa y cocina mediterránea en Portals.", whyWePickedIt: "Equilibra comida y entorno sin depender solo de la fiesta.", bestFor: ["comida", "parejas"] },
      { position: 5, businessId: "balneario-illetas", name: "Balneario Illetas", description: "Playa con servicios cerca de Palma.", whyWePickedIt: "No es el más exclusivo, pero resuelve muy bien un día fácil de playa.", bestFor: ["familias", "comodidad"] }
    ],
    faqs: [{ question: "¿Qué beach club elegir cerca de Palma?", answer: "Purobeach Palma e Illetas son opciones cómodas si no quieres conducir demasiado." }],
    seo: { title: "Mejores beach clubs de Mallorca | Mallorca Verified", description: "Selección editorial de beach clubs en Mallorca según ambiente, zona y tipo de plan." },
    updatedAt: "2026-06-07"
  },
  {
    id: "mejores-rutas-barco-palma",
    slug: "mejores-rutas-barco-palma",
    locale: "es",
    title: "Mejores rutas en barco desde Palma",
    hook: "Rutas fáciles de entender si es tu primera vez alquilando barco en Mallorca.",
    intro: "Salir desde Palma permite hacer planes de medio día o día completo sin demasiada logística. La ruta exacta dependerá del mar, pero estas ideas ayudan a orientar la reserva.",
    category: "boats",
    area: "Palma",
    items: [
      { position: 1, businessId: "sail-trip-mallorca", name: "Bahía de Palma en velero", description: "Una salida tranquila con navegación y baño si el mar acompaña.", whyWePickedIt: "Es una ruta fácil para empezar y no exige un día entero.", bestFor: ["parejas", "atardecer"] },
      { position: 2, businessId: "mallorca-boat-hire", name: "Palma a Portals", description: "Ruta cómoda por el suroeste cercano.", whyWePickedIt: "Permite combinar costa, baño y vuelta sin apurar tiempos.", bestFor: ["grupos", "medio día"] },
      { position: 3, name: "Palma a Illetas", description: "Plan corto para nadar cerca de la ciudad.", whyWePickedIt: "Es útil si tienes poco tiempo o no quieres pagar una salida larga.", bestFor: ["primer alquiler", "familias"] },
      { position: 4, name: "Palma a Cala Blava", description: "Costa baja, agua clara en buenos días y regreso sencillo.", whyWePickedIt: "Funciona como alternativa al suroeste cuando las condiciones son favorables.", bestFor: ["baño", "día relajado"] },
      { position: 5, name: "Atardecer en la bahía", description: "Salida corta centrada en luz, vistas y navegación suave.", whyWePickedIt: "No necesita demasiada ruta para sentirse especial.", bestFor: ["parejas", "celebración"] }
    ],
    faqs: [{ question: "¿Qué ruta conviene si nunca he alquilado barco?", answer: "Una salida corta por la bahía o hacia Illetas suele ser más fácil que intentar cubrir demasiada costa." }],
    seo: { title: "Mejores rutas en barco desde Palma | Mallorca Verified", description: "Ideas de rutas en barco desde Palma para medio día, día completo o atardecer." },
    updatedAt: "2026-06-07"
  }
];
