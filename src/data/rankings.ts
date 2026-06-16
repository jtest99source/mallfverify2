import type { Ranking } from "@/types/ranking";

export const rankings: Ranking[] = [
  {
    id: "top-restaurantes-desconocidos-mallorca",
    slug: "top-restaurantes-desconocidos-mallorca",
    locale: "es",
    title: "Top 5 restaurantes desconocidos en Mallorca",
    hook: "Cinco sitios con criterio para salir del circuito mÃ¡s obvio sin convertir la cena en una aventura rara.",
    intro: "Mallorca tiene restaurantes muy visibles, pero tambiÃ©n lugares con personalidad que no siempre aparecen en las listas de siempre. Esta selecciÃ³n prioriza contexto, producto y una experiencia con sentido.",
    category: "restaurants",
    items: [
      { position: 1, businessId: "miceli-selva", name: "Miceli", description: "Cocina de mercado en Selva con ritmo de pueblo.", whyWePickedIt: "Lo elegimos porque obliga a salir de Palma y recompensa con una experiencia mÃ¡s pausada.", bestFor: ["interior", "cocina de mercado"] },
      { position: 2, businessId: "ca-na-toneta-caimari", name: "Ca Na Toneta", description: "Producto mallorquÃ­n y una lectura local sin ruido.", whyWePickedIt: "Tiene criterio local y encaja muy bien con una ruta por la Serra.", bestFor: ["producto local", "comida tranquila"] },
      { position: 3, businessId: "patiki-beach-soller", name: "Patiki Beach", description: "Comida relajada frente al mar en Port de SÃ³ller.", whyWePickedIt: "No pretende ser formal: es fresco, directo y muy Ãºtil en un dÃ­a de costa.", bestFor: ["mar", "amigos"] },
      { position: 4, businessId: "bodega-barahona-casa-manolo-ses-salines", name: "Casa Manolo", description: "ClÃ¡sico del sur para pescado y marisco.", whyWePickedIt: "Porque sigue siendo una alternativa sÃ³lida cuando el producto importa mÃ¡s que la decoraciÃ³n.", bestFor: ["pescado", "sur"] },
      { position: 5, businessId: "nama-deia", name: "Nama DeiÃ ", description: "AsiÃ¡tico con terraza en plena Tramuntana.", whyWePickedIt: "Aporta variedad en una zona donde muchos planes se parecen entre sÃ­.", bestFor: ["deiÃ ", "cena de verano"] }
    ],
    faqs: [{ question: "Â¿CuÃ¡l es la mejor zona para encontrar restaurantes menos turÃ­sticos?", answer: "El interior, SÃ³ller, DeiÃ  fuera de horas punta y algunos barrios de Palma suelen dar mejores resultados que las zonas mÃ¡s obvias de playa." }],
    seo: { title: "Top 5 restaurantes desconocidos en Mallorca | Mallorca Verified", description: "Cinco restaurantes en Mallorca para comer bien fuera de los planes mÃ¡s previsibles." },
    updatedAt: "2026-06-07"
  },
  {
    id: "mejores-beach-clubs-mallorca",
    slug: "mejores-beach-clubs-mallorca",
    locale: "es",
    title: "Mejores beach clubs de Mallorca",
    hook: "Opciones distintas segÃºn busques fiesta, vistas, comodidad cerca de Palma o un dÃ­a largo junto al mar.",
    intro: "No todos los beach clubs de Mallorca sirven para el mismo tipo de plan. Esta guÃ­a separa ambiente, ubicaciÃ³n y utilidad real para elegir mejor.",
    category: "beach-clubs",
    items: [
      { position: 1, businessId: "gran-folies-cala-llamp", name: "Gran Folies", description: "Roca, piscina y vistas en Cala Llamp.", whyWePickedIt: "Tiene una ubicaciÃ³n muy especial y un ambiente mÃ¡s adulto.", bestFor: ["vistas", "parejas"] },
      { position: 2, businessId: "purobeach-palma", name: "Purobeach Palma", description: "Plan cÃ³modo cerca de Palma.", whyWePickedIt: "Es prÃ¡ctico si quieres beach club sin montar una excursiÃ³n larga.", bestFor: ["palma", "tarde"] },
      { position: 3, businessId: "nikki-beach-mallorca", name: "Nikki Beach Mallorca", description: "Ambiente internacional y social.", whyWePickedIt: "Funciona cuando el objetivo es energÃ­a, mÃºsica y grupo.", bestFor: ["grupos", "celebraciÃ³n"] },
      { position: 4, businessId: "assona-portals", name: "Assona Portals", description: "Costa y cocina mediterrÃ¡nea en Portals.", whyWePickedIt: "Equilibra comida y entorno sin depender solo de la fiesta.", bestFor: ["comida", "parejas"] },
      { position: 5, businessId: "balneario-illetas", name: "Balneario Illetas", description: "Playa con servicios cerca de Palma.", whyWePickedIt: "No es el mÃ¡s exclusivo, pero resuelve muy bien un dÃ­a fÃ¡cil de playa.", bestFor: ["familias", "comodidad"] }
    ],
    faqs: [{ question: "Â¿QuÃ© beach club elegir cerca de Palma?", answer: "Purobeach Palma e Illetas son opciones cÃ³modas si no quieres conducir demasiado." }],
    seo: { title: "Mejores beach clubs de Mallorca | Mallorca Verified", description: "SelecciÃ³n editorial de beach clubs en Mallorca segÃºn ambiente, zona y tipo de plan." },
    updatedAt: "2026-06-07"
  },
  {
    id: "mejores-rutas-barco-palma",
    slug: "mejores-rutas-barco-palma",
    locale: "es",
    title: "Mejores rutas en barco desde Palma",
    hook: "Rutas fÃ¡ciles de entender si es tu primera vez alquilando barco en Mallorca.",
    intro: "Salir desde Palma permite hacer planes de medio dÃ­a o dÃ­a completo sin demasiada logÃ­stica. La ruta exacta dependerÃ¡ del mar, pero estas ideas ayudan a orientar la reserva.",
    category: "boats",
    area: "Palma",
    items: [
      { position: 1, businessId: "sail-trip-mallorca", name: "BahÃ­a de Palma en velero", description: "Una salida tranquila con navegaciÃ³n y baÃ±o si el mar acompaÃ±a.", whyWePickedIt: "Es una ruta fÃ¡cil para empezar y no exige un dÃ­a entero.", bestFor: ["parejas", "atardecer"] },
      { position: 2, businessId: "mallorca-boat-hire", name: "Palma a Portals", description: "Ruta cÃ³moda por el suroeste cercano.", whyWePickedIt: "Permite combinar costa, baÃ±o y vuelta sin apurar tiempos.", bestFor: ["grupos", "medio dÃ­a"] },
      { position: 3, name: "Palma a Illetas", description: "Plan corto para nadar cerca de la ciudad.", whyWePickedIt: "Es Ãºtil si tienes poco tiempo o no quieres pagar una salida larga.", bestFor: ["primer alquiler", "familias"] },
      { position: 4, name: "Palma a Cala Blava", description: "Costa baja, agua clara en buenos dÃ­as y regreso sencillo.", whyWePickedIt: "Funciona como alternativa al suroeste cuando las condiciones son favorables.", bestFor: ["baÃ±o", "dÃ­a relajado"] },
      { position: 5, name: "Atardecer en la bahÃ­a", description: "Salida corta centrada en luz, vistas y navegaciÃ³n suave.", whyWePickedIt: "No necesita demasiada ruta para sentirse especial.", bestFor: ["parejas", "celebraciÃ³n"] }
    ],
    faqs: [{ question: "Â¿QuÃ© ruta conviene si nunca he alquilado barco?", answer: "Una salida corta por la bahÃ­a o hacia Illetas suele ser mÃ¡s fÃ¡cil que intentar cubrir demasiada costa." }],
    seo: { title: "Mejores rutas en barco desde Palma | Mallorca Verified", description: "Ideas de rutas en barco desde Palma para medio dÃ­a, dÃ­a completo o atardecer." },
    updatedAt: "2026-06-07"
  }
];
