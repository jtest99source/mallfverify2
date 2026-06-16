import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

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

const OLD_SLUGS_TO_HIDE = [
  "donde-alojarse-mallorca",
  "que-hacer-mallorca-3-dias",
  "guia-alquilar-barco-mallorca"
];

const GUIDES = [
  {
    id: "es-restaurantes-palma-que-aguantan",
    slug: "restaurantes-palma-que-aguantan",
    locale: "es",
    status: "published",
    is_featured: true,
    source: "editorial",
    updated_at: "2026-06-14",
    hero_image_url: null,
    title: "Los restaurantes de Palma que aguantan la prueba del tiempo",
    excerpt:
      "Cientos de restaurantes abren cada año en Palma. Los que aparecen aquí mantienen nota alta con miles de reseñas encima. Eso ya no es suerte.",
    intro:
      "En Palma es fácil tener un buen restaurante un año. Mantenerlo es otra cosa. Los que aparecen en este ranking llevan tiempo funcionando con valoraciones altas y un volumen de reseñas suficiente como para que la media ya no dependa del mes de agosto. Mallorca Verified no recoge la impresión de nadie en concreto — recoge el consenso de quienes han estado allí.",
    sections: [
      {
        heading: "Santa Catalina: el barrio que cambió cómo come Palma",
        body: "Santa Catalina fue durante años el barrio del mercado de abastos y los bares de toda la vida. En algún momento de los últimos diez años pasó a ser la referencia gastronómica de la ciudad. No por moda — los datos lo confirman: concentra la mayor densidad de restaurantes con más de 4.4 de nota y más de 200 reseñas de Palma. Lo que funciona aquí lo hace con constancia: cocina de producto, carta corta, materia prima con criterio. Hay de todo — desde arroces y pescado hasta propuestas más creativas — pero el perfil común es el mismo: no hay trampa turística.",
        best_for: ["tapas y vinos", "cena en grupo", "cocina de mercado"]
      },
      {
        heading: "La Lonja y el casco antiguo: la nota aguanta",
        body: "La zona de La Lonja y el casco histórico tiene el atractivo de la arquitectura y la trampa de ser muy visitada por turistas que no repiten. Pese a eso, hay restaurantes que mantienen nota alta precisamente porque no dependen de ese tráfico — tienen clientela local y presencia en Google con cientos de reseñas reales. Son los que aguantan. Los demás van y vienen. La diferencia se ve en los datos: los mejores tienen nota sostenida a lo largo de distintas temporadas, no solo en verano.",
        best_for: ["cocina mediterránea", "terrazas", "vino local"]
      },
      {
        heading: "Portixol y El Molinar: frente al mar, con criterio",
        body: "Portixol y El Molinar son los barrios costeros más cercanos al centro de Palma — a diez minutos andando de la catedral, pero con otro ritmo. La oferta gastronómica aquí tiene un perfil más tranquilo: pescado fresco, vistas al agua, clientela habitual que repite. Los restaurantes con mejor nota en esta zona suelen tener más reseñas de locales que de turistas, lo que es una buena señal de que la calidad no es estacional.",
        best_for: ["pescado fresco", "atardecer", "ambiente tranquilo"]
      },
      {
        heading: "Qué hace que un restaurante de Palma aguante",
        body: "Hay un patrón claro en los restaurantes de Palma que mantienen nota alta con el tiempo. No es la carta más larga ni el local más bonito — es consistencia. Los que aparecen en los rankings de Mallorca Verified con nota por encima de 4.4 y más de 300 reseñas tienen en común producto reconocible, servicio sin fisuras, y precio alineado con lo que ofrecen. El Untapped Score de Mallorca Verified además identifica los que tienen esa nota alta sin estar todavía saturados — los que son buenos pero aún no tienen cola en la puerta.",
        best_for: ["primera vez en Palma", "cómo funciona el ranking"]
      }
    ],
    faqs: [
      {
        question: "¿Cuándo es mejor ir a cenar en Palma?",
        answer:
          "Fuera de julio y agosto, la ciudad está más tranquila y los restaurantes trabajan mejor. De mayo a junio y de septiembre a octubre es cuando las notas en Google tienden a ser más consistentes — hay clientela pero no saturación."
      },
      {
        question: "¿Hay que reservar con antelación en los restaurantes bien valorados de Palma?",
        answer:
          "En Santa Catalina y el casco antiguo, sí — especialmente en fin de semana y en temporada alta. Los restaurantes con más de 400 reseñas y nota superior a 4.5 suelen estar llenos. Reservar con dos o tres días de antelación es suficiente fuera de agosto."
      },
      {
        question: "¿Qué precio medio tienen los restaurantes con mejor nota de Palma?",
        answer:
          "La mayoría de los restaurantes con nota alta en Palma se mueven entre 25 y 50€ por persona con vino. Hay excepciones: algunos menús del día de calidad por debajo de 15€ y propuestas creativas por encima de 70€. El precio no determina la nota — hay locales económicos con valoraciones excelentes."
      },
      {
        question: "¿Los rankings de Mallorca Verified cambian con el tiempo?",
        answer:
          "Sí, los datos se actualizan para reflejar la valoración actual. Un restaurante que baja de nota pierde posición. Los que aparecen aquí lo hacen porque mantienen esa consistencia — no porque hayan tenido un buen mes."
      }
    ],
    seo: {
      title: "Restaurantes de Palma que aguantan el paso del tiempo | Mallorca Verified",
      description:
        "Los restaurantes de Palma con nota alta sostenida según miles de reseñas verificadas. Sin temporadas, sin trampas turísticas — solo lo que funciona de verdad."
    }
  },

  {
    id: "es-playas-mallorca-sin-masificar",
    slug: "playas-mallorca-sin-masificar",
    locale: "es",
    status: "published",
    is_featured: true,
    source: "editorial",
    updated_at: "2026-06-14",
    hero_image_url: null,
    title: "Las playas de Mallorca que todavía no están en todos los artículos",
    excerpt:
      "Mallorca tiene más de 80 calas. Las más conocidas tienen también las colas más largas. Estas son las que tienen nota alta en Google y todavía no las ha descubierto todo el mundo.",
    intro:
      "Cala d'Or, Cala Agulla, Cala Mesquida — hay calas en Mallorca que figuran en cualquier artículo de viajes. También tienen sus propios atascos en agosto. Lo que hace Mallorca Verified es cruzar los datos de valoración media con el volumen relativo de reseñas: las calas con nota muy alta pero pocas reseñas en comparación con las más famosas son las que todavía no están saturadas.",
    sections: [
      {
        heading: "Las calas del sureste que se escapan del mapa",
        body: "El sureste de Mallorca — entre Portocolom, Cala Santanyí y Cala Mondragó — tiene una concentración de calas con aguas de color increíble y muy poca infraestructura turística alrededor. Santanyí, Ses Salines y los municipios entre ellos tienen calas que no aparecen en los artículos genéricos porque no tienen chiringuito, no tienen aparcamiento fácil, y no tienen nombre en inglés en Google Maps. Tienen, en cambio, nota media por encima de 4.6 y reseñas que describen el agua como «la más transparente de Mallorca».",
        area: "Sureste",
        best_for: ["aguas cristalinas", "sin masificación", "naturaleza"]
      },
      {
        heading: "El norte: más allá de Formentor",
        body: "Formentor es la cala más fotografiada del norte de Mallorca. También es la más llena en verano. A pocos kilómetros, en la bahía de Pollença y alrededor de Cala de Sant Vicenç, hay calas que concentran notas altas con muchas menos visitas. El acceso suele ser más difícil — caminos de tierra, aparcamiento limitado — y eso es exactamente lo que las mantiene tranquilas. En temporada alta, la diferencia entre julio y septiembre en estas calas es enorme.",
        area: "Norte",
        best_for: ["familias", "aguas tranquilas", "sin turismo masivo"]
      },
      {
        heading: "El oeste: lo que no se ve desde la carretera",
        body: "La costa oeste de Mallorca — desde Port de Sóller hacia el sur, pasando por Banyalbufar y llegando a Port d'Andratx — tiene muy pocas calas, pero las que hay son excepcionales. Sant Elm, Camp de Mar, y algunas calas sin nombre oficial entre Andratx y Calvià tienen valoraciones muy altas con relativamente pocas reseñas. El acceso a algunas requiere caminar, lo cual actúa de filtro natural.",
        area: "Suroeste",
        best_for: ["senderismo + playa", "costa salvaje", "tranquilidad"]
      },
      {
        heading: "Cuándo ir para que no estén llenas",
        body: "La diferencia entre ir en agosto y en septiembre a una cala de nota alta en Mallorca puede ser la diferencia entre esperar para aparcar y encontrarla casi vacía. Los datos de reseñas muestran un patrón claro: las calas con mejor ratio nota/reseñas mantienen sus valoraciones altas en septiembre y octubre, cuando el calor todavía está pero el turismo ha bajado. Mayo también funciona para las que tienen acceso por tierra — el agua está fría, pero la experiencia visual es completa.",
        best_for: ["temporada baja", "planificación del viaje"]
      }
    ],
    faqs: [
      {
        question: "¿Qué cala de Mallorca tiene el agua más transparente?",
        answer:
          "Las calas del sureste — alrededor de Santanyí, Ses Salines y Portocolom — concentran las valoraciones más altas en ese aspecto. Cala Mondragó y las calas dentro del parque natural tienen aguas en tonos turquesa que aparecen repetidamente en las reseñas con más puntuación."
      },
      {
        question: "¿Cuál es la mejor época para ir a las calas de Mallorca sin masificación?",
        answer:
          "Septiembre y octubre son los meses con mejor relación clima-afluencia. El agua está caliente, hay mucho menos turismo, y los accesos están libres. Mayo funciona para las calas más grandes. Julio y agosto son inevitablemente los más llenos."
      },
      {
        question: "¿Hace falta coche para llegar a las calas menos conocidas de Mallorca?",
        answer:
          "Para la mayoría de calas con nota alta que no están en los artículos habituales, sí hace falta coche — o moto, que es mejor para los caminos más estrechos. Algunas tienen acceso solo a pie desde puntos de aparcamiento a distancia."
      },
      {
        question: "¿Son seguras para niños las calas poco conocidas?",
        answer:
          "Depende de la cala. Las del sureste y norte suelen tener aguas muy tranquilas y poca profundidad cerca de la orilla. Las del oeste son más abiertas al mar y pueden tener más oleaje. Las reseñas en Google suelen mencionar explícitamente si son aptas para niños."
      }
    ],
    seo: {
      title: "Playas de Mallorca sin masificar: las que no están en todos los artículos",
      description:
        "Las calas de Mallorca con nota alta y menos afluencia, seleccionadas por consenso de reseñas verificadas. Sureste, norte y costa oeste."
    }
  },

  {
    id: "es-mallorca-3-dias-sin-perder-tiempo",
    slug: "mallorca-3-dias-sin-perder-tiempo",
    locale: "es",
    status: "published",
    is_featured: true,
    source: "editorial",
    updated_at: "2026-06-14",
    hero_image_url: null,
    title: "Mallorca en 3 días: cómo organizarlo sin perder el tiempo",
    excerpt:
      "Tres días en Mallorca dan para mucho si no los pierdes en colas, restaurantes mediocres o playas que salen en todos los artículos. Esta ruta está construida con datos reales.",
    intro:
      "Mallorca es pequeña en kilómetros pero grande en oferta. En tres días se puede ver la ciudad, la sierra y la costa si hay criterio en la selección. Lo que sigue es una ruta construida con los datos de Mallorca Verified: los lugares con nota más sostenida y las combinaciones que maximizan el tiempo sin sorpresas desagradables.",
    sections: [
      {
        heading: "Día 1: Palma con criterio",
        body: "El primer día en Palma no debería gastarse en hacer la ruta turística habitual. La catedral merece una visita — es genuinamente impresionante — pero el resto del día funciona mejor sin agenda fija. Santa Catalina por la mañana, con desayuno en uno de los cafés del mercado o alrededores. Paseo por el casco antiguo hacia La Lonja. Comida en alguno de los restaurantes que aparecen en el ranking de Palma — los de nota más alta en esta zona suelen ser pequeños, así que ir antes de las 13:30 o después de las 15:00 evita la espera. Por la tarde, Portixol o El Molinar. Cena en Santa Catalina.",
        best_for: ["gastronomía", "casco histórico", "primera vez en Palma"]
      },
      {
        heading: "Día 2: Tramuntana, con paradas que valen",
        body: "El segundo día para la Serra de Tramuntana. La ruta clásica es Valldemossa-Deià-Sóller-Port de Sóller, y funciona. Lo que la hace mejor: salir antes de las 9, aparcar en Valldemossa antes de que lleguen los autobuses turísticos, y llegar a Port de Sóller para comer con calma. Los restaurantes con mejor nota en Port de Sóller suelen estar cerca del paseo marítimo y trabajan mejor fuera del pico del mediodía turístico. Sóller pueblo por la tarde, tren de vuelta a Palma si se quiere — el tren histórico es en sí mismo parte de la experiencia.",
        best_for: ["paisaje", "senderismo suave", "pueblos con encanto"]
      },
      {
        heading: "Día 3: cala con nota alta + tarde libre",
        body: "El tercer día para el agua. Desde Palma, las calas más accesibles con nota alta están en el suroeste (Cala Major, Illetas, Camp de Mar) o en la bahía hacia el este. Para ir más lejos — sureste o norte — hay que salir antes de las 9 para llegar con la cala relativamente tranquila. La tarde puede ser más libre: vuelta a Palma, paseo por el paseo marítimo, compras en el mercado de Santa Catalina si es jueves o viernes.",
        best_for: ["playa", "relajación", "última tarde en Mallorca"]
      },
      {
        heading: "Lo que no hay que hacer en 3 días en Mallorca",
        body: "Algunas decisiones hacen que tres días en Mallorca se conviertan en tres días de colas. Ir a Formentor en agosto sin reserva de parking resulta en una hora de espera en carretera. Comer en restaurantes del centro histórico con carta en cinco idiomas y sin reseñas recientes suele decepcionar. Intentar ver la isla de norte a sur en un día es agotador y no merece. Tres días bien elegidos dan más que cinco mal organizados.",
        best_for: ["planificación", "cómo no equivocarse"]
      }
    ],
    faqs: [
      {
        question: "¿Es suficiente 3 días para ver Mallorca?",
        answer:
          "Para tener una idea real de la isla, sí — si los tres días están bien elegidos. Se puede ver la ciudad, la montaña y el mar con calma. Para explorar en profundidad, una semana permite ir más lejos sin prisas."
      },
      {
        question: "¿En qué zona es mejor alojarse para un viaje de 3 días?",
        answer:
          "Palma es la opción que da más flexibilidad: buena gastronomía cerca, fácil acceso a coche de alquiler, y no hay que salir de la ciudad el primer día. Para más tranquilidad, Sóller o Port de Pollença son buenas bases, pero exigen más trayecto."
      },
      {
        question: "¿Hace falta coche de alquiler para 3 días en Mallorca?",
        answer:
          "Para aprovechar bien los tres días, sí. El transporte público llega a los puntos principales pero es lento y no llega a la mayoría de calas. Un coche pequeño cuesta poco y da libertad total."
      },
      {
        question: "¿Cuál es la mejor época para un viaje de 3 días a Mallorca?",
        answer:
          "Mayo, junio, septiembre y octubre son los meses con mejor relación clima-masificación. Julio y agosto tienen el mejor tiempo pero el mayor turismo. Noviembre a marzo tiene muy buen precio y Palma funciona bien, pero muchas calas y negocios de costa cierran."
      }
    ],
    seo: {
      title: "Mallorca en 3 días: itinerario sin perder el tiempo | Mallorca Verified",
      description:
        "Ruta de 3 días en Mallorca con Palma, Tramuntana y la mejor cala. Construida con datos de reseñas verificadas, sin colas ni restaurantes mediocres."
    }
  },

  {
    id: "es-donde-alojarse-mallorca-segun-lo-que-buscas",
    slug: "donde-alojarse-mallorca-segun-lo-que-buscas",
    locale: "es",
    status: "published",
    is_featured: false,
    source: "editorial",
    updated_at: "2026-06-14",
    hero_image_url: null,
    title: "Dónde alojarse en Mallorca según lo que quieres hacer",
    excerpt:
      "La zona donde te alojes en Mallorca cambia completamente el tipo de viaje que vas a tener. Esta guía cruza hoteles con nota alta con lo que cada zona ofrece de verdad.",
    intro:
      "Elegir dónde alojarse en Mallorca antes de saber qué se quiere hacer es el error más común. Mallorca es pequeña pero los tiempos de desplazamiento cambian mucho según la zona. Hay zonas perfectas para gastronomía y vida urbana, zonas para tranquilidad y naturaleza, y zonas para playa sin tener que moverse. Lo que sigue cruza la oferta de alojamiento con nota alta en cada zona con lo que esa zona da de verdad.",
    sections: [
      {
        heading: "Palma: para gastronomía, arquitectura y movilidad",
        body: "Palma es la mejor opción si el viaje incluye buena gastronomía, visitas culturales o si se quiere base central para moverse en coche. La ciudad tiene una concentración de hoteles boutique con nota alta en el casco histórico — especialmente en La Lonja, Santa Catalina y el centro — y el acceso al aeropuerto es de 15 minutos. El inconveniente: las calas buenas están a 30-45 minutos en coche. Para alguien que quiera playa todos los días, Palma obliga a desplazarse.",
        area: "Palma",
        best_for: ["gastronomía", "cultura", "primera vez en Mallorca"]
      },
      {
        heading: "El norte (Pollença, Alcúdia): para tranquilidad y playas largas",
        body: "El norte de Mallorca tiene el mejor equilibrio entre playa y tranquilidad. Pollença pueblo es uno de los más bonitos de la isla — con plaza, iglesia, y bares con nota alta — y Port de Pollença tiene aguas tranquilas perfectas para familias. Alcúdia tiene una de las playas más largas de Mallorca y un casco histórico bien conservado. Los hoteles con nota alta en estas zonas suelen ser más tranquilos que los de la costa sur. Inconveniente: está a una hora de Palma.",
        area: "Norte",
        best_for: ["familias", "tranquilidad", "senderismo + playa"]
      },
      {
        heading: "La Tramuntana (Sóller, Deià): para los que priorizan el paisaje",
        body: "Alojarse en la Serra de Tramuntana es una experiencia diferente. Sóller, Port de Sóller, Deià y Fornalutx tienen fincas, hoteles boutique y casas rurales con algunas de las notas más altas de toda Mallorca — precisamente porque quien va ahí lo hace con criterio y expectativas concretas. El paisaje es excepcional. El inconveniente: la playa es limitada y muchos sitios de la sierra requieren coche para cualquier movimiento.",
        area: "Tramuntana",
        best_for: ["parejas", "naturaleza", "desconexión"]
      },
      {
        heading: "El sureste (Cala d'Or, Portocolom): para los que priorizan el agua",
        body: "El sureste de Mallorca es donde están algunas de las calas con mejor nota de la isla. Cala d'Or, Portocolom y los alrededores de Santanyí tienen aguas turquesa, calas protegidas, y una oferta de alojamiento que va desde apartamentos sencillos hasta hoteles boutique con nota alta. La gastronomía no es tan densa como en Palma, pero hay restaurantes bien valorados. Está a una hora de Palma.",
        area: "Sureste",
        best_for: ["calas y agua cristalina", "tranquilidad", "parejas"]
      }
    ],
    faqs: [
      {
        question: "¿Cuál es la zona más bonita de Mallorca para alojarse?",
        answer:
          "Depende de lo que se busque. Para paisaje de sierra, la Tramuntana. Para calas con agua cristalina, el sureste. Para cultura y gastronomía, Palma. Para playa familiar y tranquila, el norte."
      },
      {
        question: "¿Cuánto cuestan los hoteles con buena nota en Mallorca?",
        answer:
          "Los hoteles con nota superior a 4.4 y más de 100 reseñas oscilan mucho según la zona y la temporada. En Palma, un hotel boutique en el centro sale entre 120 y 250€ la noche en temporada media. En la Tramuntana pueden llegar a 350-500€ en fincas con encanto. El sureste tiene buenas opciones desde 80-120€."
      },
      {
        question: "¿Cuál es la zona de Mallorca que tiene más hoteles con nota alta?",
        answer:
          "Palma concentra la mayor densidad de hoteles con nota superior a 4.3 y más de 100 reseñas. El norte tiene hoteles con notas muy altas pero menos volumen. La Tramuntana tiene los hoteles con las notas más altas de la isla, pero son menos y más caros."
      },
      {
        question: "¿Es mejor alojarse en el pueblo o en el puerto en el norte de Mallorca?",
        answer:
          "Depende del perfil: el puerto (Port de Pollença, Port d'Alcúdia) tiene más oferta de restaurantes y acceso directo al agua. El pueblo (Pollença, Alcúdia) tiene más autenticidad, arquitectura bonita y menos turismo masivo. Los dos están a 5-10 minutos en coche."
      }
    ],
    seo: {
      title: "Dónde alojarse en Mallorca según lo que buscas | Mallorca Verified",
      description:
        "Palma, norte, Tramuntana o sureste: cuál elegir según tu tipo de viaje. Datos de hoteles con nota alta en cada zona de Mallorca."
    }
  },

  {
    id: "es-beach-clubs-mallorca-nota-alta",
    slug: "beach-clubs-mallorca-nota-alta",
    locale: "es",
    status: "published",
    is_featured: false,
    source: "editorial",
    updated_at: "2026-06-14",
    hero_image_url: null,
    title: "Los beach clubs de Mallorca que no fallan",
    excerpt:
      "Mallorca tiene decenas de beach clubs. Algunos son memorables. Muchos son correctos. Y algunos son una decepción cara. Los datos marcan la diferencia.",
    intro:
      "Un beach club en Mallorca puede ser una de las mejores experiencias del viaje o una tarde de dinero tirado. La diferencia no está en la foto de Instagram — está en si el sitio funciona de verdad con clientela real que repite. Los que aparecen en los rankings de Mallorca Verified llevan temporadas con nota alta y reseñas que van más allá del ambiente: mencionan la calidad del servicio, la comida, y si merece lo que cuesta.",
    sections: [
      {
        heading: "Palma y alrededores: los que están cerca y no fallan",
        body: "Los beach clubs más cercanos a Palma — Illetas, Cala Major, Portixol, Puerto Portals — tienen la ventaja de la accesibilidad y la desventaja de estar en las zonas más concurridas. Los que mantienen nota alta en estas zonas lo hacen a pesar del tráfico turístico, lo que dice algo de su consistencia. Los de Puerto Portals y Portals Nous tienen un perfil más exclusivo — precios más altos, servicios más completos. Los de Portixol son más accesibles y con un ambiente más local.",
        area: "Palma y suroeste",
        best_for: ["sin coche desde Palma", "atardecer", "ambiente exclusivo"]
      },
      {
        heading: "La costa norte: más tranquilidad, igual de buenos",
        body: "La costa norte — Alcúdia, Port d'Alcúdia, Playa de Muro — tiene beach clubs con un perfil más familiar y aguas más tranquilas. Las notas aquí suelen ser altas porque el perfil del cliente es diferente: más familias, más estancias largas, más clientela que repite. El ambiente es menos «temporada de lujo» y más constante. Los chiringuitos de Playa de Muro, en particular, aparecen repetidamente en reseñas como uno de los mejores entornos de playa de Mallorca.",
        area: "Norte",
        best_for: ["familias", "aguas tranquilas", "ambiente relajado"]
      },
      {
        heading: "El sureste: los chiringuitos que nadie espera",
        body: "El sureste de Mallorca no tiene los beach clubs más conocidos de la isla, pero tiene algunos de los mejor valorados. Los chiringuitos cerca de Cala d'Or, Portocolom y Cala Figuera tienen notas consistentemente altas con menos afluencia que los del suroeste. Son más pequeños, más tranquilos, y la relación calidad-precio suele ser mejor. Para alguien que quiere nota alta sin el ambiente de discoteca de playa, el sureste es la opción.",
        area: "Sureste",
        best_for: ["tranquilidad", "relación calidad-precio", "calas pequeñas"]
      },
      {
        heading: "Qué mirar antes de reservar un beach club en Mallorca",
        body: "La nota media en Google no lo dice todo sobre un beach club, pero dice mucho. Hay que mirar también: el número de reseñas (un sitio con 4.8 y 40 reseñas puede ser un buen sitio local, pero no tiene la consistencia de uno con 4.5 y 800), la fecha de las reseñas más recientes (¿siguen siendo buenas este año?), y si las reseñas mencionan la comida o solo el entorno. Un beach club con 4.7 donde el 90% de las reseñas hablan de «las vistas» y ninguna de la cocina probablemente no merece el precio del menú.",
        best_for: ["cómo elegir", "planificación"]
      }
    ],
    faqs: [
      {
        question: "¿Hay que reservar con antelación en los beach clubs de Mallorca?",
        answer:
          "En los más conocidos y bien valorados del suroeste (Portals Nous, Illetas), sí — especialmente en julio y agosto. Los del norte y sureste suelen ser más accesibles sin reserva. En temporada alta, cualquier beach club con nota alta tiene más demanda que oferta de hamacas."
      },
      {
        question: "¿Cuánto cuesta un día en un beach club de Mallorca?",
        answer:
          "El rango es amplio. Los más exclusivos de la zona de Portals pueden costar entre 80 y 150€ por persona contando hamacas, bebidas y comida. Los chiringuitos de la costa norte o sureste con buena nota pueden salir entre 30 y 60€. Nota alta no implica siempre precio alto."
      },
      {
        question: "¿Cuál es la diferencia entre un chiringuito y un beach club en Mallorca?",
        answer:
          "En la práctica, el nombre no determina la calidad. Algunos chiringuitos tienen nota más alta que beach clubs de lujo. La diferencia real está en los servicios: los beach clubs suelen ofrecer hamacas con reserva y carta más elaborada. Los chiringuitos son más informales pero a veces con más autenticidad."
      },
      {
        question: "¿Qué beach clubs de Mallorca tienen la mejor nota en Google?",
        answer:
          "Los datos de Mallorca Verified muestran que los beach clubs con nota más consistente suelen estar fuera de las zonas más turísticas. Los del sureste y norte tienen notas altas con menos volumen turístico, lo que indica clientela más satisfecha de forma sostenida."
      }
    ],
    seo: {
      title: "Los beach clubs de Mallorca que no fallan | Mallorca Verified",
      description:
        "Los beach clubs y chiringuitos de Mallorca seleccionados por consenso de reseñas verificadas. Norte, suroeste y sureste — con datos reales de qué merece."
    }
  },

  {
    id: "es-norte-mallorca-guia-completa",
    slug: "norte-mallorca-guia-completa",
    locale: "es",
    status: "published",
    is_featured: false,
    source: "editorial",
    updated_at: "2026-06-14",
    hero_image_url: null,
    title: "El norte de Mallorca: lo que no sale en los artículos de siempre",
    excerpt:
      "Pollença, Alcúdia, Formentor. Los tres salen en todos los artículos. Lo que no sale es lo que hay entre medias — y los datos dicen que ahí también hay mucho que vale.",
    intro:
      "El norte de Mallorca tiene fama por tres cosas: Formentor, el casco histórico de Pollença, y la Playa de Muro. Las tres merecen estar en los artículos. Pero el norte tiene también un interior de pueblos tranquilos, una bahía con aguas perfectas para familias, y una gastronomía que no aparece en las listas de viaje porque requiere buscar un poco. Mallorca Verified cruza los datos de restaurantes, hoteles y actividades de esta zona con sus valoraciones reales.",
    sections: [
      {
        heading: "Pollença: el pueblo que funciona todo el año",
        body: "Pollença tiene algo que pocos pueblos de Mallorca consiguen: funcionar bien todo el año. Su plaza mayor, el mercado del domingo, las 365 escaleras del Calvari y la oferta de restaurantes con nota alta hacen que sea una de las bases más recomendables del norte. Los restaurantes mejor valorados de Pollença pueblo suelen ser pequeños, sin carta en cinco idiomas, y frecuentados por residentes. La nota media de los negocios de Pollença en Mallorca Verified es de las más altas de cualquier pueblo del interior de la isla.",
        area: "Pollença",
        best_for: ["cultura", "gastronomía local", "tranquilidad todo el año"]
      },
      {
        heading: "Port de Pollença: el puerto que no pierde la calma",
        body: "Port de Pollença tiene la ventaja de ser un puerto bonito que no se ha convertido en una zona de turismo de masas. Las aguas de la bahía son tranquilas — perfectas para familias y para kayak — y el paseo marítimo tiene restaurantes con nota alta sin los precios inflados de zonas más turísticas. Es más tranquilo que Port d'Alcúdia y más auténtico que Can Picafort. Los hoteles con mejor nota en Port de Pollença tienen valoraciones especialmente altas en tranquilidad y calidad del entorno.",
        area: "Port de Pollença",
        best_for: ["familias", "kayak", "ambiente tranquilo"]
      },
      {
        heading: "Alcúdia: la ciudad romana que no es solo playa",
        body: "Alcúdia tiene dos caras: el casco histórico amurallado, que es genuinamente sorprendente y está poco masificado, y la costa (Port d'Alcúdia y Playa de Muro), que es la zona turística con más infraestructura del norte. Los datos de Mallorca Verified muestran que los negocios del casco histórico de Alcúdia tienen nota media más alta que los de la zona costera, precisamente porque hay menos turismo de paso. La Playa de Muro, por otro lado, aparece en las reseñas como una de las más valoradas de Mallorca por su arena fina y aguas poco profundas.",
        area: "Alcúdia",
        best_for: ["historia", "playa familiar", "autenticidad"]
      },
      {
        heading: "Cap de Formentor: ir bien o no ir",
        body: "Formentor es una de las imágenes más icónicas de Mallorca. También es una de las más saturadas en temporada alta. Lo que los datos sugieren a través de las reseñas: ir antes de las 9 de la mañana o después de las 18:00 cambia completamente la experiencia. En temporada alta, el acceso está restringido — solo se puede llegar en autobús desde Port de Pollença entre ciertas horas, lo que paradójicamente ha mejorado la experiencia según las reseñas recientes. La nota de Formentor en Google es de las más altas de cualquier punto natural de la isla.",
        area: "Formentor",
        best_for: ["paisaje", "fotografía", "madrugadores"]
      }
    ],
    faqs: [
      {
        question: "¿Cuál es mejor para alojarse, Pollença o Port de Pollença?",
        answer:
          "Pollença pueblo es mejor si se quiere autenticidad, gastronomía local y tranquilidad absoluta. Port de Pollença es mejor si se quiere acceso directo al agua y más oferta de restaurantes. Los datos muestran notas altas en los dos — es una cuestión de preferencia."
      },
      {
        question: "¿Cuánto tiempo hace falta para ver el norte de Mallorca?",
        answer:
          "Dos días bien organizados son suficientes para ver Pollença, Port de Pollença, Alcúdia y Formentor. Tres días permiten hacer alguna ruta de senderismo y conocer el interior. Una semana en el norte da para conocerlo bien sin prisas."
      },
      {
        question: "¿Hay buenos restaurantes en el norte de Mallorca?",
        answer:
          "Sí — es una de las zonas con más densidad de restaurantes bien valorados fuera de Palma. Pollença tiene varios con nota superior a 4.5 y más de 200 reseñas. Port de Pollença tiene opciones en el paseo marítimo con nota alta. Alcúdia casco histórico tiene restaurantes que aparecen en el ranking general de Mallorca."
      },
      {
        question: "¿Se puede ir al norte de Mallorca sin coche?",
        answer:
          "Con dificultad. Hay autobuses desde Palma a Alcúdia y Pollença, y servicio entre Port d'Alcúdia y Port de Pollença. Pero para Formentor (salvo en temporada alta con el servicio restringido), calas apartadas o el interior, el coche es necesario."
      }
    ],
    seo: {
      title: "El norte de Mallorca: guía completa más allá de Formentor | Mallorca Verified",
      description:
        "Pollença, Alcúdia, Port de Pollença y Formentor con datos reales. Lo que vale, cuándo ir y dónde comer en el norte de Mallorca según reseñas verificadas."
    }
  },

  {
    id: "es-excursiones-desde-palma-que-merecen",
    slug: "excursiones-desde-palma-que-merecen",
    locale: "es",
    status: "published",
    is_featured: false,
    source: "editorial",
    updated_at: "2026-06-14",
    hero_image_url: null,
    title: "Excursiones desde Palma que realmente merecen el día",
    excerpt:
      "Desde Palma se puede llegar a casi toda la isla en menos de una hora. El problema no es el acceso — es saber qué merece el trayecto.",
    intro:
      "Palma es un buen punto de partida para cualquier excursión en Mallorca. En una hora de coche se llega al norte, al sureste y a la Tramuntana. El problema es que hay demasiada oferta y no toda justifica el día. Lo que sigue es una selección de excursiones desde Palma basada en los datos de Mallorca Verified: los destinos con mayor concentración de puntos de interés con nota alta.",
    sections: [
      {
        heading: "Sóller y la Tramuntana: la excursión más valorada",
        body: "La ruta Palma-Valldemossa-Deià-Sóller-Port de Sóller es la excursión de día más popular de Mallorca — y los datos justifican esa popularidad. Los tres pueblos tienen nota alta en todos los indicadores: restaurantes, cafés, puntos de interés. El tren histórico de Sóller es uno de los elementos mejor valorados de toda la isla. El truco para que la excursión funcione: salir antes de las 9, hacer Valldemossa temprano antes de los autobuses, y llegar a Port de Sóller para comer. El regreso en tren a Palma es en sí mismo parte de la experiencia.",
        area: "Tramuntana",
        best_for: ["primera excursión desde Palma", "paisaje", "gastronomía"]
      },
      {
        heading: "El sureste: Santanyí, Portocolom y las calas",
        body: "El sureste es la excursión para priorizar el agua y el paisaje costero. Santanyí tiene mercado el miércoles y sábado — uno de los mejores del interior — y restaurantes con nota alta en el pueblo. Portocolom es un puerto pequeño con una bahía de aguas turquesa y chiringuitos bien valorados. Las calas entre Cala d'Or y Cala Mondragó están entre las más valoradas de Mallorca. El trayecto desde Palma es de unos 55 minutos. La excursión funciona mejor como día de playa más almuerzo en pueblo.",
        area: "Sureste",
        best_for: ["calas", "mercado artesanal", "día de playa"]
      },
      {
        heading: "Pollença y Formentor: el norte en un día",
        body: "El norte se hace en un día si hay criterio en la selección. Pollença por la mañana — la plaza, el Calvari, café en alguno de los bares con nota alta. Comida en Port de Pollença. Formentor a primera hora de la tarde (si hay restricción de acceso en temporada alta, el autobús sale de Port de Pollença). Regreso a Palma por la tarde — el trayecto es de poco más de una hora. Lo que hay que evitar: intentar hacer también Alcúdia el mismo día.",
        area: "Norte",
        best_for: ["paisaje del norte", "primera visita al norte"]
      },
      {
        heading: "Las Cuevas del Drach: merece si se saben las reglas",
        body: "Las Cuevas del Drach, en Porto Cristo, son el punto de interés más visitado de Mallorca fuera de Palma. Las reseñas cuentan dos historias distintas: quien llega con las expectativas adecuadas (cuevas espectaculares, concierto de música clásica sobre el lago, visita guiada de una hora) sale encantado. Quien llega esperando algo sin aglomeraciones sale decepcionado. Los datos muestran nota alta pero con dispersión — exactamente lo que pasa cuando un sitio es masivo. Merece, pero hay que saber qué se va a encontrar.",
        area: "Este",
        best_for: ["familia", "cultura", "días de lluvia"]
      }
    ],
    faqs: [
      {
        question: "¿Cuál es la excursión de un día más recomendable desde Palma?",
        answer:
          "La ruta por la Tramuntana (Valldemossa-Deià-Sóller-Port de Sóller) es consistentemente la que genera las valoraciones más altas entre quienes la hacen. Combina paisaje, pueblos con encanto y buena gastronomía."
      },
      {
        question: "¿Cuánto tiempo se tarda en llegar al norte de Mallorca desde Palma?",
        answer:
          "Pollença está a unos 55 minutos desde Palma por la autopista. Port de Pollença, 5 minutos más. Alcúdia, 50 minutos. Formentor, unos 75 minutos desde Palma."
      },
      {
        question: "¿Merece la pena alquilar un coche para las excursiones desde Palma?",
        answer:
          "Sí, claramente. Los autobuses llegan a los núcleos principales pero no a las calas, no tienen la frecuencia de un coche propio y limitan mucho la flexibilidad. Un coche de alquiler por un día sale entre 30 y 60€ y hace que la excursión sea completamente distinta."
      },
      {
        question: "¿Hay excursiones desde Palma que se puedan hacer sin coche?",
        answer:
          "Sí — Sóller tiene el tren histórico desde Palma, que es en sí mismo una experiencia. Alcúdia tiene autobús directo. Para Valldemossa hay autobuses turísticos y de línea. El sureste es más difícil sin coche."
      }
    ],
    seo: {
      title: "Excursiones desde Palma que merecen el día | Mallorca Verified",
      description:
        "Tramuntana, sureste, norte y cuevas — las excursiones desde Palma seleccionadas con datos reales. Qué merece el trayecto y qué no vale la pena."
    }
  },

  {
    id: "es-senderismo-tramuntana-mallorca",
    slug: "senderismo-tramuntana-mallorca",
    locale: "es",
    status: "published",
    is_featured: false,
    source: "editorial",
    updated_at: "2026-06-14",
    hero_image_url: null,
    title: "Senderismo en la Serra de Tramuntana: por dónde empezar",
    excerpt:
      "La Serra de Tramuntana tiene cientos de rutas. Algunas para principiantes, algunas exigentes, algunas con vistas que justifican solas el viaje. Los datos ayudan a filtrar cuáles valen para cada perfil.",
    intro:
      "La Serra de Tramuntana, declarada Patrimonio de la Humanidad por la UNESCO, es el mejor sistema de senderismo de las Islas Baleares. Las rutas van desde paseos de una hora accesibles para cualquier persona hasta ascensos de ocho horas que requieren preparación. Lo que sigue es una selección de las rutas con más valoraciones positivas, ordenadas por dificultad y perfil.",
    sections: [
      {
        heading: "Rutas para empezar: paisaje sin esfuerzo excesivo",
        body: "Para quien nunca ha hecho senderismo en Mallorca, el Barranc de Biniaraix es el punto de entrada ideal. Salida desde Sóller o desde Biniaraix — un pueblo de cuarenta casas que está entre los más fotografiados de la isla — la ruta sube por un barranco con naranjos y olivos durante unas dos horas hasta el pueblo de Fornalutx. Es una ruta circular de dificultad baja, con muy buenas indicaciones y reseñas que mencionan el paisaje como uno de los mejores de la isla para una ruta tan asequible. El Camino del Archiduque, en Valldemossa, es otra opción similar — más abierto, con vistas al mar, y muy bien señalizado.",
        best_for: ["principiantes", "familias sin niños muy pequeños", "primera ruta en Mallorca"]
      },
      {
        heading: "Rutas intermedias: subir vale la pena",
        body: "El Puig de Massanella (1.365 m) es la cima más alta de Mallorca a la que se puede llegar de forma independiente. La ruta desde Comafreda dura entre cuatro y seis horas, el desnivel es significativo, y requiere calzado de montaña. Las vistas desde la cima son las mejores de la isla — en días claros se ve Menorca e Ibiza. Las reseñas son consistentemente altas: quien sube con preparación adecuada sale con una de las experiencias más valoradas de toda Mallorca. El Puig Tomir y el Puig Roig son alternativas de dificultad similar con menos afluencia.",
        best_for: ["senderistas con experiencia", "vistas espectaculares", "reto físico"]
      },
      {
        heading: "El Torrent de Pareis: solo para quienes saben",
        body: "El Torrent de Pareis es el cañón más profundo de las Baleares. La bajada desde Sa Calobra hasta el mar es una de las rutas más espectaculares de España, pero también una de las más exigentes en términos de orientación y condición física. No está señalizada como las otras rutas. Las reseñas son las más polarizadas de cualquier punto de interés natural de Mallorca: o es la mejor experiencia del viaje o es un día difícil con riesgo de perderse. Solo para quien tenga experiencia en montaña y vaya con buena información.",
        best_for: ["senderistas experimentados", "aventura", "sin niños"]
      },
      {
        heading: "Cuándo ir y qué llevar",
        body: "La temporada ideal para senderismo en la Tramuntana es de octubre a mayo. En verano, el calor hace que las rutas de media y alta montaña sean agotadoras y con riesgo de deshidratación. Noviembre, febrero y marzo tienen días perfectos para montaña — frescos, claros, sin gente. Lo esencial para cualquier ruta de más de dos horas: agua (más de lo que se cree necesario), calzado con suela de agarre, protección solar aunque no haga calor, y la ruta descargada en una app offline. Wikiloc y AllTrails tienen casi todas las rutas de la Tramuntana con valoraciones y notas actualizadas.",
        best_for: ["planificación del viaje", "primera vez en la Tramuntana"]
      }
    ],
    faqs: [
      {
        question: "¿Se puede hacer senderismo en la Tramuntana sin experiencia previa?",
        answer:
          "Sí — el Barranc de Biniaraix, el Camino del Archiduque y varios tramos del GR 221 son accesibles para principiantes con buen estado físico. Para rutas de más de cuatro horas o con desnivel significativo, se recomienda experiencia o ir con guía."
      },
      {
        question: "¿Hace falta guía para hacer senderismo en la Serra de Tramuntana?",
        answer:
          "Para la mayoría de rutas señalizadas, no. Las rutas del Barranc de Biniaraix, Camino del Archiduque y la subida al Puig de Massanella están bien marcadas y documentadas. Para el Torrent de Pareis o rutas fuera de senderos marcados, un guía local es muy recomendable."
      },
      {
        question: "¿Cuál es la mejor aplicación para hacer senderismo en Mallorca?",
        answer:
          "Wikiloc y AllTrails tienen las rutas principales de la Tramuntana con valoraciones de otros usuarios, fotos y notas actualizadas. Descargar la ruta para uso offline es imprescindible — la cobertura en zonas de montaña puede ser irregular."
      },
      {
        question: "¿Cuál es la mejor época para hacer senderismo en la Tramuntana?",
        answer:
          "Octubre a mayo es la temporada ideal. En verano el calor puede ser peligroso en rutas largas. Los meses de invierno (con buen tiempo) ofrecen rutas vacías y vistas excepcionales. La primavera tiene el añadido de la vegetación y las flores de los almendros y naranjos."
      }
    ],
    seo: {
      title: "Senderismo en la Serra de Tramuntana: rutas por nivel | Mallorca Verified",
      description:
        "Guía de senderismo en la Tramuntana de Mallorca: rutas para principiantes, intermedias y avanzadas. Cuándo ir, qué llevar y qué dicen las reseñas."
    }
  },

  {
    id: "es-cenar-mallorca-vistas-al-mar",
    slug: "cenar-mallorca-vistas-al-mar",
    locale: "es",
    status: "published",
    is_featured: false,
    source: "editorial",
    updated_at: "2026-06-14",
    hero_image_url: null,
    title: "Dónde cenar en Mallorca con vistas al mar que no sea una trampa",
    excerpt:
      "Hay muchos restaurantes con vistas al mar en Mallorca. Pocos tienen también buena nota en la cocina. Los datos separan los que merecen de los que viven de la localización.",
    intro:
      "En Mallorca es fácil encontrar una mesa con vistas al mar. Lo difícil es encontrar una mesa con vistas al mar y comida que esté a la altura. Los restaurantes que viven de la localización lo saben — y la nota media en Google de los restaurantes en primera línea suele ser más baja que la de los que están a una calle. Lo que sigue es una selección de los que tienen las dos cosas: vistas y nota alta.",
    sections: [
      {
        heading: "Portixol y El Molinar: vistas a la bahía de Palma",
        body: "Portixol y El Molinar son los barrios costeros más cercanos al centro de Palma — a diez minutos andando de la catedral. Los restaurantes con nota alta en esta zona suelen tener vistas directas a la bahía, clientela local habitual, y cocina de pescado y marisco que no está inflada por el factor «turista que no repite». La nota media de los restaurantes de Portixol es de las más altas de cualquier zona costera de Palma — lo que indica que las vistas aquí no vienen a costa de la calidad.",
        area: "Palma costa",
        best_for: ["pescado fresco", "vistas a la bahía", "ambiente local"]
      },
      {
        heading: "Port de Sóller: el escenario con más nota",
        body: "Port de Sóller tiene el escenario más dramático para cenar con vistas al mar de toda la isla: la bahía rodeada de montañas, el paseo marítimo, y el atardecer que llega tarde en verano. Los restaurantes del paseo con nota alta suelen tener carta de cocina mallorquina y pescado de la zona. Lo que distingue a los mejores de los que solo viven de la vista: las reseñas más recientes siguen siendo altas, no solo las de hace tres años cuando el sitio era nuevo.",
        area: "Port de Sóller",
        best_for: ["atardecer espectacular", "cocina mallorquina", "ocasión especial"]
      },
      {
        heading: "Portocolom: el puerto pequeño con nota grande",
        body: "Portocolom es el puerto más bonito del sureste de Mallorca — una bahía casi cerrada, colores de agua imposibles, casas de pescadores. Los restaurantes con nota alta en Portocolom tienen vistas directas a esa bahía y suelen ser pequeños, con poca rotación y carta centrada en el producto local. La combinación de nota alta y vistas aquí es más difícil de encontrar que en Palma, pero cuando se da, suele ser de las cenas más recordadas del viaje.",
        area: "Sureste",
        best_for: ["cena especial", "puerto pequeño", "producto local"]
      },
      {
        heading: "Lo que diferencia los que merecen de los que no",
        body: "La señal más clara de que un restaurante con vistas al mar en Mallorca es una trampa: nota inferior a 4.0 con muchas reseñas, o nota superior a 4.3 con muy pocas y todas muy recientes. Los restaurantes que llevan años con nota alta en zonas costeras son los que han resuelto el problema de servir buena comida y mantener un precio alineado a pesar de tener la localización a su favor. Los que solo tienen la vista suelen tener notas que reflejan exactamente eso.",
        best_for: ["cómo elegir", "planificación de cena"]
      }
    ],
    faqs: [
      {
        question: "¿Cuál es el mejor restaurante con vistas al mar en Mallorca?",
        answer:
          "No hay una respuesta única — depende de la zona y del tipo de cena. Para vistas con más escenario, Port de Sóller. Para combinación de vistas y gastronomía consistente, Portixol en Palma o Portocolom en el sureste. Los datos de Mallorca Verified muestran los que tienen nota alta sostenida en cada zona."
      },
      {
        question: "¿Hay que reservar para cenar con vistas al mar en Mallorca?",
        answer:
          "En los restaurantes con nota alta y vistas al mar, sí — especialmente en temporada alta. Las mesas con mejor vista suelen ser las primeras en ocuparse. Reservar con 48-72 horas de antelación en julio y agosto es lo mínimo para asegurar mesa."
      },
      {
        question: "¿Qué precio tiene cenar con vistas al mar en Mallorca?",
        answer:
          "Los restaurantes costeros con nota alta suelen estar entre 35 y 65€ por persona con vino. Los más exclusivos de zonas como Puerto Portals o Port de Sóller pueden superar los 80€. En Portocolom o Portixol hay opciones con nota alta por debajo de 45€."
      },
      {
        question: "¿Tienen buena cocina los restaurantes con vistas al mar en Mallorca?",
        answer:
          "Depende del restaurante. La tendencia general es que los de primera línea y muy conocidos tienen notas más bajas en cocina que en entorno. Los que tienen nota alta en ambos aspectos son los que aparecen en los rankings de Mallorca Verified — y suelen estar ligeramente apartados de la zona más turística."
      }
    ],
    seo: {
      title: "Dónde cenar con vistas al mar en Mallorca que no decepcione | Mallorca Verified",
      description:
        "Restaurantes con vistas al mar en Mallorca seleccionados por nota alta en cocina y entorno. Portixol, Port de Sóller, Portocolom y más zonas."
    }
  },

  {
    id: "es-mallorca-octubre-fuera-temporada",
    slug: "mallorca-octubre-fuera-temporada",
    locale: "es",
    status: "published",
    is_featured: false,
    source: "editorial",
    updated_at: "2026-06-14",
    hero_image_url: null,
    title: "Mallorca en octubre: lo que está abierto y lo que merece",
    excerpt:
      "Octubre en Mallorca es uno de los meses más infravalorados del año. El mar sigue caliente, los sitios tienen mucho menos gente, y casi todo lo que vale sigue abierto.",
    intro:
      "Octubre es el mes que muchos viajeros de Mallorca no consideran — y que los que han ido en octubre no cambian por agosto. El mar llega a 24-25°C, el clima es muy agradable, los sitios con nota alta tienen mesa sin reservar con antelación de semanas, y la isla funciona con otro ritmo. Hay cosas que cierran en octubre, pero los datos de Mallorca Verified muestran que casi todo lo que tiene nota alta sigue abierto.",
    sections: [
      {
        heading: "Por qué octubre en Mallorca es diferente",
        body: "La bajada de turismo en octubre es brusca — entre el 20 de septiembre y el 10 de octubre el volumen cae de forma muy visible. Lo que no cae igual: la temperatura del mar (que tarda en enfriarse), la calidad de la gastronomía (de hecho mejora — los restaurantes trabajan más tranquilos), y la calidad de las visitas a puntos de interés (sin colas, sin parking problemático, sin calor extremo). Las reseñas de octubre en Google tienden a ser más altas que las de agosto en muchas categorías — particularmente en restaurantes y hoteles, donde el servicio mejora con menos saturación.",
        best_for: ["viajeros que huyen del turismo masivo", "gastronomía", "senderismo"]
      },
      {
        heading: "Qué está abierto en octubre en Mallorca",
        body: "La gran mayoría de restaurantes, hoteles y actividades con nota alta siguen abiertos en octubre. Los que cierran antes son algunos chiringuitos de playa (a partir de mediados de octubre la mayoría cierra) y algunos hoteles de resort muy grandes enfocados en turismo de masa. En cambio, los hoteles boutique, los restaurantes de cualquier categoría, las actividades de montaña (de hecho octubre es temporada alta de senderismo), las excursiones en barco y los alquileres de coche funcionan perfectamente. La Serra de Tramuntana en octubre está en uno de sus mejores momentos.",
        best_for: ["planificación", "qué esperar en octubre"]
      },
      {
        heading: "Las actividades que mejoran en octubre",
        body: "Algunas cosas en Mallorca son directamente mejores en octubre que en verano. El senderismo es la más clara: las temperaturas hacen que rutas que en agosto son imposibles sean perfectas en octubre. El Puig de Massanella, el Barranc de Biniaraix o el Camino del Archiduque en octubre, con el paisaje post-verano y sin gente, son experiencias distintas. El ciclismo también mejora — en octubre la isla se llena de ciclistas, y hay grupos organizados de ruta por toda la Tramuntana. Las bodegas y el enoturismo en el interior (Binissalem, Santa Maria) están en plena vendimia.",
        best_for: ["senderismo", "ciclismo", "enoturismo", "naturaleza"]
      },
      {
        heading: "Dónde alojarse en Mallorca en octubre",
        body: "En octubre hay más flexibilidad de alojamiento que en verano — las opciones con nota alta tienen disponibilidad y los precios son entre un 30 y un 50% más bajos que en agosto. Palma funciona muy bien en octubre: la ciudad tiene vida propia, la gastronomía está en plena forma, y los días de lluvia (que pueden aparecer en otoño) tienen mucho donde ir. Los hoteles rurales y fincas de la Tramuntana en octubre tienen la oferta de senderismo literalmente en la puerta.",
        best_for: ["presupuesto más ajustado", "flexibilidad", "parejas"]
      }
    ],
    faqs: [
      {
        question: "¿Hace buen tiempo en Mallorca en octubre?",
        answer:
          "En general, sí. Octubre tiene temperaturas de 20-25°C, mucho sol, y el mar a 24-25°C — perfectamente bañable. Puede haber algún día de lluvia (octubre tiene más precipitación que los meses de verano), pero la mayoría de los días son soleados y muy agradables para cualquier actividad."
      },
      {
        question: "¿Siguen abiertos los restaurantes en Mallorca en octubre?",
        answer:
          "La gran mayoría sí. Los restaurantes con nota alta en Palma, el norte, la Tramuntana y el interior abren todo el año o hasta finales de octubre-noviembre. Algunos chiringuitos y restaurantes de playa muy estacionales cierran a mediados de octubre, pero la oferta gastronómica sigue siendo muy amplia."
      },
      {
        question: "¿Se puede bañar en el mar en Mallorca en octubre?",
        answer:
          "Sí — el mar Mediterráneo en Mallorca está a 24-25°C en octubre, que es más agradable que muchas playas en verano en el norte de Europa. Las calas del sureste mantienen sus colores increíbles en octubre. Es perfectamente posible pasar días de playa en las dos primeras semanas de octubre."
      },
      {
        question: "¿Qué precio tienen los hoteles en Mallorca en octubre?",
        answer:
          "Significativamente más bajos que en verano. Un hotel con nota alta que en agosto cuesta 200€ la noche puede bajar a 100-130€ en octubre. Los hoteles rurales de la Tramuntana son especialmente accesibles. Es el mejor momento para acceder a alojamientos con nota alta a precios razonables."
      }
    ],
    seo: {
      title: "Mallorca en octubre: qué está abierto y qué merece | Mallorca Verified",
      description:
        "Octubre en Mallorca: mar caliente, menos turismo, precios más bajos. Lo que sigue abierto, las actividades que mejoran y dónde alojarse según datos reales."
    }
  }
];

async function main() {
  loadLocalEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false }
  });

  // Ocultar guías antiguas
  console.log("Ocultando guías antiguas...");
  const { error: hideError, count } = await supabase
    .from("guides")
    .update({ status: "hidden" })
    .in("slug", OLD_SLUGS_TO_HIDE);

  if (hideError) {
    console.warn("Error ocultando guías antiguas:", hideError.message);
  } else {
    console.log(`Guías antiguas ocultadas: ${count ?? "?"}`);
  }

  // Insertar nuevas guías
  console.log(`\nInsertando ${GUIDES.length} guías nuevas...`);
  let ok = 0;
  let failed = 0;

  for (const guide of GUIDES) {
    const { error } = await supabase
      .from("guides")
      .upsert(guide, { onConflict: "locale,slug" });

    if (error) {
      console.error(`✗ ${guide.slug}: ${error.message}`);
      failed++;
    } else {
      console.log(`✓ ${guide.slug}`);
      ok++;
    }
  }

  console.log(`\nResultado: ${ok} insertadas, ${failed} fallidas.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
