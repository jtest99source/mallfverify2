import { categoryConfigs, getCategorySlugFromBusiness, type CategorySlug } from "@/lib/data";
import type { Locale } from "@/lib/i18n";
import type { BusinessCategory } from "@/types/business";

export type CategoryCopy = {
  label: string;
  singular: string;
  title: string;
  intro: string;
  metaDescription: string;
};

export const uiCopy = {
  es: {
    nav: {
      explore: "Explorar",
      guides: "Guías",
      methodology: "Metodología",
      forBusinesses: "Para negocios",
      categoriesVerified: "categorías · Datos verificados",
      allRankings: "Ver todos los rankings"
    },
    home: {
      metaTitle: "Mallorca Verified | La guía verificada de Mallorca",
      metaDescription: "Restaurantes, hoteles, beach clubs, barcos, actividades y playas en Mallorca verificados con datos reales de Google y selección propia.",
      eyebrow: "Mallorca · Actualizado a diario · Sin posiciones de pago",
      title: "Encuentra los mejores negocios de Mallorca",
      intro: "Rankings basados en el consenso de miles de reseñas reales de Google. No la opinión de nadie en concreto: reflejan la experiencia colectiva de quienes han estado allí. Sin publicidad, sin posiciones de pago.",
      exploreRankings: "Explorar rankings",
      viewGuides: "Ver guías",
      verifiedBusinesses: "negocios verificados",
      analyzedReviews: "reseñas analizadas en Google",
      activeCategories: "categorías activas",
      signals: ["Actualizado a diario", "Sin posiciones de pago", "Consenso real, no una opinión", "Metodología pública"],
      selection: "Selección verificada",
      bestThisWeek: "Los más valorados esta semana",
      bestThisWeekIntro: "Los más valorados en cada categoría según el consenso de miles de reseñas reales de Google. Sin publicidad, sin posiciones de pago.",
      guidesEyebrow: "Guías editoriales",
      guidesTitle: "Planifica tu viaje",
      guidesIntro: "Artículos prácticos para elegir zona, ruta, restaurante, hotel, barco o cala con más contexto antes de reservar.",
      businessTitle: "¿Tu negocio está en Mallorca Verified?",
      businessIntro: "Comprueba cómo aparece en rankings objetivos y qué señales influyen en su visibilidad. Si quieres una ficha más completa, podemos valorar una colaboración para trabajar datos, fotos, servicios, carta o enlaces oficiales.",
      businessCta: "Solicitar propuesta"
    },
    rankings: {
      metaTitle: "Rankings objetivos de Mallorca | Mallorca Verified",
      metaDescription: "Rankings de Mallorca para comparar restaurantes, hoteles, playas, barcos y planes con datos reales de Google, contexto útil y sin publicidad.",
      eyebrow: "Actualizado a diario · Sin posiciones de pago · Consenso de reseñas verificadas",
      title: "Busca lo mejor de Mallorca sin perderte entre listas.",
      intro: "Elige una categoría, filtra por zona o tipo de plan y compara opciones con calma. Usamos reseñas reales de Google y señales públicas para que sea más fácil decidir dónde comer, dormir, reservar o pasar el día.",
      activeRanking: "Ranking activo",
      businessBoxEyebrow: "Para negocios",
      businessBoxTitle: "¿Gestionas un negocio en Mallorca?",
      businessBoxIntro: "Añade fotos reales, servicios, carta y datos actualizados. Una ficha completa aparece mejor en Google y es más fácil de citar en ChatGPT, Perplexity o Google AI.",
      businessBoxNote: "Las posiciones en rankings no cambian: solo enriquecemos la información disponible.",
      businessBoxCta: "Solicitar información",
      guidesEyebrow: "Guías para planificar",
      guidesTitle: "Cuando quieres contexto, no solo posiciones",
      guidesIntro: "Las guías son listas escritas para planes concretos: dónde ir según la zona, el momento del viaje, el presupuesto o lo que te apetece hacer.",
      viewGuides: "Ver guías"
    },
    footer: {
      description: "Rankings independientes de Mallorca basados en el consenso de miles de reseñas verificadas. La posición no se compra. Si hay contenido patrocinado en alguna parte del site, siempre está etiquetado.",
      contact: "Contacto",
      categories: "Categorías",
      allCategories: "Ver todas las categorías",
      site: "Sitio",
      privacy: "Privacidad",
      cookies: "Cookies"
    },
    filters: {
      searchPlaceholder: "Buscar un sitio concreto por nombre o zona...",
      sortBy: "Ordenar por",
      type: "Tipo",
      place: "Localidad",
      all: "Todos",
      allPlaces: "Todas",
      results: "resultados",
      noResults: "No hay resultados con esos filtros. Prueba con otra localidad o cambia el tipo.",
      sort: { ratio: "Recomendado", rating: "Mejor valoración", reviews: "Más reseñas", hidden: "Joyas ocultas" }
    },
    business: {
      hiddenGem: "Joya oculta",
      viewDataReviews: "Ver datos y reseñas",
      fallbackLine: "Ficha disponible para comparar valoraciones, ubicación y reseñas.",
      reviewsSection: "Valoración y reseñas",
      repeatedInReviews: "Lo más repetido en reseñas",
      whatPeopleLike: "Lo que más gusta",
      featuredReviews: "Reseñas destacadas",
      viewAllGoogleReviews: "Ver todas las reseñas en Google",
      offers: "Qué ofrece",
      reviewsOnGoogle: "reseñas en Google",
      contact: "Contacto",
      howToGetThere: "Cómo llegar",
      googleMaps: "Ver en Google Maps",
      officialWebsite: "Web oficial",
      related: "También puede encajar",
      profileCtaEyebrow: "¿Representas este negocio?",
      profileCtaTitle: "Solicita una revisión editorial de la ficha",
      profileCtaText: "Puedes aportar datos actualizados, mejores fotos, servicios, carta, condiciones de reserva o información práctica para que la ficha sea más completa.",
      profileCtaNote: "Las colaboraciones editoriales no modifican ratings, reseñas ni posiciones en rankings.",
      profileCtaButton: "Solicitar revisión"
    },
    category: {
      breadcrumbHome: "Inicio",
      comparator: "Comparador objetivo",
      signalLine: "Ordenamos negocios del mismo tipo con señales verificables: valoración, reseñas, ubicación y consistencia de la ficha.",
      rankingByCategory: "Ranking por categoría",
      topIntro: "Una vista directa para comparar los mejor posicionados sin ruido, publicidad ni posiciones compradas.",
      fullRanking: "Ver ranking completo",
      areaEyebrow: "Por zonas",
      relatedRankings: "Rankings relacionados",
      viewAll: "Ver todos",
      faqFresh: "¿La información de cada sitio está actualizada?",
      faqFreshAnswer: "Usamos datos de Google junto con selección editorial propia. Te recomendamos confirmar horarios, precios y reservas directamente con el negocio, especialmente en temporada alta.",
      topInMallorca: (label: string) => `Top ${label.toLowerCase()} en Mallorca`,
      byArea: (label: string) => `${label} por zona`,
      faqSort: (label: string) => `¿Cómo se ordenan los ${label.toLowerCase()}?`,
      faqSortAnswer: "Combinamos valoración media, volumen de reseñas y autoridad relativa dentro de la categoría. No vendemos posiciones ni mezclamos negocios de tipos distintos."
    }
  },
  en: {
    nav: {
      explore: "Explore",
      guides: "Guides",
      methodology: "Methodology",
      forBusinesses: "For businesses",
      categoriesVerified: "categories · Verified data",
      allRankings: "View all rankings"
    },
    home: {
      metaTitle: "Mallorca Verified | The verified guide to Mallorca",
      metaDescription: "Restaurants, hotels, beach clubs, boats, activities and beaches in Mallorca verified with real Google data and editorial checks.",
      eyebrow: "Mallorca · Updated daily · No paid placements",
      title: "Find the best places in Mallorca",
      intro: "Rankings based on the consensus of thousands of real Google reviews. Not one person’s opinion: they reflect the collective experience of people who have been there. No ads, no paid positions.",
      exploreRankings: "Explore rankings",
      viewGuides: "View guides",
      verifiedBusinesses: "verified businesses",
      analyzedReviews: "Google reviews analyzed",
      activeCategories: "active categories",
      signals: ["Updated daily", "No paid placements", "Real consensus, not one opinion", "Public methodology"],
      selection: "Verified selection",
      bestThisWeek: "Best rated this week",
      bestThisWeekIntro: "The best rated places in each category, based on thousands of real Google reviews. No ads, no paid positions.",
      guidesEyebrow: "Editorial guides",
      guidesTitle: "Plan your trip",
      guidesIntro: "Practical guides to choose an area, route, restaurant, hotel, boat or beach with more context before you book.",
      businessTitle: "Is your business on Mallorca Verified?",
      businessIntro: "See how your business appears in objective rankings and which signals influence visibility. For a richer profile, we can review data, photos, services, menus and official links.",
      businessCta: "Request a proposal"
    },
    rankings: {
      metaTitle: "Objective Mallorca rankings | Mallorca Verified",
      metaDescription: "Compare Mallorca restaurants, hotels, beaches, boats and things to do with real Google data, useful context and no paid placements.",
      eyebrow: "Updated daily · No paid placements · Verified review consensus",
      title: "Find the best of Mallorca without getting lost in lists.",
      intro: "Choose a category, filter by area or type of plan, and compare calmly. We use real Google reviews and public signals to make it easier to decide where to eat, stay, book or spend the day.",
      activeRanking: "Active ranking",
      businessBoxEyebrow: "For businesses",
      businessBoxTitle: "Do you manage a business in Mallorca?",
      businessBoxIntro: "Add real photos, services, menus and updated details. A complete profile is easier to find on Google and easier to cite in ChatGPT, Perplexity or Google AI.",
      businessBoxNote: "Ranking positions do not change: we only enrich the available information.",
      businessBoxCta: "Request information",
      guidesEyebrow: "Planning guides",
      guidesTitle: "When you need context, not just positions",
      guidesIntro: "Guides are written lists for specific plans: where to go depending on the area, timing, budget or what you feel like doing.",
      viewGuides: "View guides"
    },
    footer: {
      description: "Independent Mallorca rankings based on the consensus of thousands of verified reviews. Positions cannot be bought. Sponsored content, if any, is always clearly labelled.",
      contact: "Contact",
      categories: "Categories",
      allCategories: "View all categories",
      site: "Site",
      privacy: "Privacy",
      cookies: "Cookies"
    },
    filters: {
      searchPlaceholder: "Search by place name or area...",
      sortBy: "Sort by",
      type: "Type",
      place: "Location",
      all: "All",
      allPlaces: "All",
      results: "results",
      noResults: "No results with these filters. Try another location or type.",
      sort: { ratio: "Recommended", rating: "Best rating", reviews: "Most reviews", hidden: "Hidden gems" }
    },
    business: {
      hiddenGem: "Hidden gem",
      viewDataReviews: "View data and reviews",
      fallbackLine: "Profile available to compare ratings, location and reviews.",
      reviewsSection: "Rating and reviews",
      repeatedInReviews: "Most repeated in reviews",
      whatPeopleLike: "What people like most",
      featuredReviews: "Featured reviews",
      viewAllGoogleReviews: "View all reviews on Google",
      offers: "What it offers",
      reviewsOnGoogle: "reviews on Google",
      contact: "Contact",
      howToGetThere: "How to get there",
      googleMaps: "View on Google Maps",
      officialWebsite: "Official website",
      related: "You may also like",
      profileCtaEyebrow: "Do you represent this business?",
      profileCtaTitle: "Request an editorial review of this profile",
      profileCtaText: "You can provide updated details, better photos, services, menus, booking conditions or practical information to make the profile more complete.",
      profileCtaNote: "Editorial collaborations do not change ratings, reviews or ranking positions.",
      profileCtaButton: "Request review"
    },
    category: {
      breadcrumbHome: "Home",
      comparator: "Objective comparison",
      signalLine: "We rank businesses of the same type with verifiable signals: rating, reviews, location and profile consistency.",
      rankingByCategory: "Category ranking",
      topIntro: "A direct way to compare the strongest results without noise, ads or paid placements.",
      fullRanking: "View full ranking",
      areaEyebrow: "By area",
      relatedRankings: "Related rankings",
      viewAll: "View all",
      faqFresh: "Is the information up to date?",
      faqFreshAnswer: "We use Google data together with editorial checks. Always confirm opening hours, prices and bookings directly with the business, especially in high season.",
      topInMallorca: (label: string) => `Top ${label.toLowerCase()} in Mallorca`,
      byArea: (label: string) => `${label} by area`,
      faqSort: (label: string) => `How are ${label.toLowerCase()} ranked?`,
      faqSortAnswer: "We combine average rating, review volume and relative authority within the category. We do not sell positions or mix unrelated business types."
    }
  },
  de: {
    nav: {
      explore: "Entdecken",
      guides: "Guides",
      methodology: "Methodik",
      forBusinesses: "Für Betriebe",
      categoriesVerified: "Kategorien · Verifizierte Daten",
      allRankings: "Alle Rankings ansehen"
    },
    home: {
      metaTitle: "Mallorca Verified | Der verifizierte Guide für Mallorca",
      metaDescription: "Restaurants, Hotels, Beachclubs, Boote, Aktivitäten und Strände auf Mallorca, geprüft mit echten Google-Daten und redaktioneller Auswahl.",
      eyebrow: "Mallorca · Täglich aktualisiert · Keine bezahlten Platzierungen",
      title: "Finde die besten Orte auf Mallorca",
      intro: "Rankings auf Basis tausender echter Google-Bewertungen. Nicht die Meinung einer einzelnen Person: Sie spiegeln die gemeinsame Erfahrung von Menschen wider, die dort waren. Ohne Werbung, ohne gekaufte Positionen.",
      exploreRankings: "Rankings entdecken",
      viewGuides: "Guides ansehen",
      verifiedBusinesses: "verifizierte Betriebe",
      analyzedReviews: "Google-Bewertungen analysiert",
      activeCategories: "aktive Kategorien",
      signals: ["Täglich aktualisiert", "Keine bezahlten Platzierungen", "Echter Konsens, keine Einzelmeinung", "Öffentliche Methodik"],
      selection: "Verifizierte Auswahl",
      bestThisWeek: "Diese Woche am besten bewertet",
      bestThisWeekIntro: "Die bestbewerteten Orte je Kategorie, basierend auf tausenden echten Google-Bewertungen. Ohne Werbung, ohne gekaufte Positionen.",
      guidesEyebrow: "Redaktionelle Guides",
      guidesTitle: "Plane deine Reise",
      guidesIntro: "Praktische Guides zur Wahl von Gegend, Route, Restaurant, Hotel, Boot oder Strand mit mehr Kontext vor der Buchung.",
      businessTitle: "Ist dein Betrieb auf Mallorca Verified?",
      businessIntro: "Sieh, wie dein Betrieb in objektiven Rankings erscheint und welche Signale die Sichtbarkeit beeinflussen. Für ein vollständigeres Profil können wir Daten, Fotos, Services, Speisekarten und offizielle Links prüfen.",
      businessCta: "Angebot anfragen"
    },
    rankings: {
      metaTitle: "Objektive Mallorca-Rankings | Mallorca Verified",
      metaDescription: "Vergleiche Restaurants, Hotels, Strände, Boote und Aktivitäten auf Mallorca mit echten Google-Daten, hilfreichem Kontext und ohne bezahlte Platzierungen.",
      eyebrow: "Täglich aktualisiert · Keine bezahlten Platzierungen · Verifizierter Bewertungskonsens",
      title: "Finde das Beste auf Mallorca, ohne dich in Listen zu verlieren.",
      intro: "Wähle eine Kategorie, filtere nach Ort oder Art des Plans und vergleiche in Ruhe. Wir nutzen echte Google-Bewertungen und öffentliche Signale, damit die Entscheidung leichter fällt.",
      activeRanking: "Aktives Ranking",
      businessBoxEyebrow: "Für Betriebe",
      businessBoxTitle: "Betreibst du ein Geschäft auf Mallorca?",
      businessBoxIntro: "Ergänze echte Fotos, Services, Karten und aktuelle Details. Ein vollständiges Profil ist bei Google leichter auffindbar und für ChatGPT, Perplexity oder Google AI leichter zitierbar.",
      businessBoxNote: "Ranking-Positionen ändern sich nicht: Wir ergänzen nur die verfügbaren Informationen.",
      businessBoxCta: "Informationen anfragen",
      guidesEyebrow: "Guides zur Planung",
      guidesTitle: "Wenn du Kontext brauchst, nicht nur Positionen",
      guidesIntro: "Guides sind geschriebene Listen für konkrete Pläne: wohin je nach Gegend, Reisezeit, Budget oder Stimmung.",
      viewGuides: "Guides ansehen"
    },
    footer: {
      description: "Unabhängige Mallorca-Rankings auf Basis des Konsenses tausender verifizierter Bewertungen. Positionen können nicht gekauft werden. Gesponserte Inhalte werden immer klar gekennzeichnet.",
      contact: "Kontakt",
      categories: "Kategorien",
      allCategories: "Alle Kategorien ansehen",
      site: "Website",
      privacy: "Datenschutz",
      cookies: "Cookies"
    },
    filters: {
      searchPlaceholder: "Nach Ort, Name oder Gegend suchen...",
      sortBy: "Sortieren nach",
      type: "Typ",
      place: "Ort",
      all: "Alle",
      allPlaces: "Alle",
      results: "Ergebnisse",
      noResults: "Keine Ergebnisse mit diesen Filtern. Probiere einen anderen Ort oder Typ.",
      sort: { ratio: "Empfohlen", rating: "Beste Bewertung", reviews: "Meiste Bewertungen", hidden: "Geheimtipps" }
    },
    business: {
      hiddenGem: "Geheimtipp",
      viewDataReviews: "Daten und Bewertungen ansehen",
      fallbackLine: "Profil zum Vergleichen von Bewertungen, Lage und Rezensionen verfügbar.",
      reviewsSection: "Bewertung und Rezensionen",
      repeatedInReviews: "Am häufigsten in Rezensionen erwähnt",
      whatPeopleLike: "Was besonders gefällt",
      featuredReviews: "Ausgewählte Rezensionen",
      viewAllGoogleReviews: "Alle Rezensionen auf Google ansehen",
      offers: "Was angeboten wird",
      reviewsOnGoogle: "Rezensionen auf Google",
      contact: "Kontakt",
      howToGetThere: "Anfahrt",
      googleMaps: "Auf Google Maps ansehen",
      officialWebsite: "Offizielle Website",
      related: "Könnte auch passen",
      profileCtaEyebrow: "Vertrittst du diesen Betrieb?",
      profileCtaTitle: "Redaktionelle Prüfung des Profils anfragen",
      profileCtaText: "Du kannst aktuelle Daten, bessere Fotos, Services, Speisekarten, Buchungsbedingungen oder praktische Informationen einreichen, damit das Profil vollständiger wird.",
      profileCtaNote: "Redaktionelle Kooperationen ändern keine Bewertungen, Rezensionen oder Ranking-Positionen.",
      profileCtaButton: "Prüfung anfragen"
    },
    category: {
      breadcrumbHome: "Start",
      comparator: "Objektiver Vergleich",
      signalLine: "Wir ordnen Betriebe desselben Typs anhand überprüfbarer Signale: Bewertung, Rezensionen, Lage und Profilkonsistenz.",
      rankingByCategory: "Ranking nach Kategorie",
      topIntro: "Ein direkter Blick auf die stärksten Ergebnisse ohne Rauschen, Werbung oder gekaufte Platzierungen.",
      fullRanking: "Vollständiges Ranking ansehen",
      areaEyebrow: "Nach Gegend",
      relatedRankings: "Verwandte Rankings",
      viewAll: "Alle ansehen",
      faqFresh: "Sind die Informationen aktuell?",
      faqFreshAnswer: "Wir nutzen Google-Daten zusammen mit redaktionellen Prüfungen. Öffnungszeiten, Preise und Reservierungen solltest du besonders in der Hochsaison direkt beim Betrieb bestätigen.",
      topInMallorca: (label: string) => `Top ${label.toLowerCase()} auf Mallorca`,
      byArea: (label: string) => `${label} nach Gegend`,
      faqSort: (label: string) => `Wie werden ${label.toLowerCase()} sortiert?`,
      faqSortAnswer: "Wir kombinieren Durchschnittsbewertung, Bewertungsvolumen und relative Autorität innerhalb der Kategorie. Wir verkaufen keine Positionen und mischen keine unterschiedlichen Geschäftstypen."
    }
  }
} as const;

const esCategoryCopy: Record<CategorySlug, CategoryCopy> = {
  restaurants: { label: "Restaurantes", singular: "Restaurante", title: "Restaurantes en Mallorca", intro: "Los mejores restaurantes de Mallorca según valoración y reseñas reales de Google. Desde terrazas frente al mar en Palma hasta rincones de interior que pocos conocen.", metaDescription: "Los mejores restaurantes en Mallorca según miles de reseñas reales de Google. Ranking objetivo por zona, cocina y precio. Sin publicidad." },
  hotels: { label: "Hoteles", singular: "Hotel", title: "Hoteles en Mallorca", intro: "Hoteles boutique, rurales y de playa en Mallorca ordenados por calidad real. Elegir bien el hotel es elegir bien la zona: aquí tienes los datos para decidir.", metaDescription: "Hoteles en Mallorca ordenados con datos reales de Google, reseñas verificadas y contexto por zona. Compara antes de reservar. Sin publicidad." },
  "beach-clubs": { label: "Beach clubs", singular: "Beach club", title: "Beach clubs en Mallorca", intro: "Los mejores beach clubs de Mallorca para una comida larga, un atardecer con cócteles o un día de playa con hamaca, piscina y servicio.", metaDescription: "Beach clubs en Mallorca con valoraciones reales de Google, zonas, ambiente y señales útiles para elegir. Ranking independiente sin publicidad." },
  boats: { label: "Barcos", singular: "Empresa de barcos", title: "Alquiler de barcos en Mallorca", intro: "Las mejores empresas de alquiler de barcos en Mallorca, con y sin patrón, por horas o días, desde Palma, Alcúdia, Andratx o Pollença.", metaDescription: "Alquiler de barcos en Mallorca con datos reales de Google, reseñas verificadas y operadores por zona. Ranking objetivo sin posiciones pagadas." },
  activities: { label: "Actividades", singular: "Actividad", title: "Actividades en Mallorca", intro: "Las mejores actividades en Mallorca: kayak, buceo, senderismo, bodegas, excursiones en barco y mucho más, ordenadas por calidad verificada.", metaDescription: "Actividades en Mallorca ordenadas con reseñas reales de Google: tours, kayak, buceo, aventura y planes por zona. Sin publicidad." },
  beaches: { label: "Playas y calas", singular: "Playa o cala", title: "Playas y calas de Mallorca", intro: "Las mejores playas y calas de Mallorca, desde las más accesibles hasta las más escondidas, con información de acceso y qué esperar.", metaDescription: "Playas y calas de Mallorca con contexto de acceso, zona y valoraciones públicas. Ranking independiente para elegir mejor. Sin publicidad." },
  bars: { label: "Bares", singular: "Bar", title: "Bares en Mallorca", intro: "Los mejores bares de Mallorca para tapas, cócteles, vermut o una cerveza con vistas. Coctelería de autor, chiringuitos y tabernas.", metaDescription: "Bares en Mallorca para tapas, cócteles y copas, ordenados con reseñas reales de Google y señales por zona. Sin posiciones pagadas." },
  cafes: { label: "Cafeterías", singular: "Cafetería", title: "Cafeterías y brunch en Mallorca", intro: "Las mejores cafeterías y sitios de brunch en Mallorca: specialty coffee, desayunos mallorquines, croissants y brunch de fin de semana.", metaDescription: "Cafeterías y brunch en Mallorca con valoraciones reales de Google, zonas y señales útiles para desayunar o tomar café. Sin publicidad." },
  bakeries: { label: "Hornos y pastelerías", singular: "Horno o pastelería", title: "Hornos y pastelerías en Mallorca", intro: "Panaderías y pastelerías de Mallorca para ensaimadas, coques, pan artesanal y dulces tradicionales, ordenadas por reseñas reales.", metaDescription: "Hornos y pastelerías en Mallorca para ensaimadas, pan y dulces tradicionales, con reseñas reales de Google. Ranking independiente." },
  "rent-a-car": { label: "Rent a car", singular: "Alquiler de coches", title: "Alquiler de coches en Mallorca", intro: "Empresas de alquiler de coches en Mallorca por aeropuerto, Palma o zonas turísticas. Valoraciones reales y puntos a revisar antes de reservar.", metaDescription: "Alquiler de coches en Mallorca con reseñas reales de Google, zonas y señales para comparar antes de reservar. Ranking sin publicidad." },
  spas: { label: "Spas y wellness", singular: "Spa", title: "Spas y centros de bienestar en Mallorca", intro: "Spas, wellness y centros de masaje en Mallorca: desde hoteles de lujo hasta day spas y tratamientos urbanos verificados con reseñas reales.", metaDescription: "Spas y wellness en Mallorca con reseñas reales de Google, tratamientos, zonas y señales útiles para elegir. Ranking independiente." },
  gyms: { label: "Gimnasios", singular: "Gimnasio", title: "Gimnasios en Mallorca", intro: "Gimnasios en Mallorca por zona: fitness, crossfit, yoga, pilates, funcional y centros deportivos ordenados por valoración real.", metaDescription: "Gimnasios en Mallorca por zona, fitness, crossfit, yoga y pilates, ordenados con reseñas reales de Google. Sin posiciones pagadas." },
  routes: { label: "Rutas y miradores", singular: "Ruta o mirador", title: "Rutas y miradores en Mallorca", intro: "Rutas de senderismo, miradores y caminos de Mallorca, desde la Serra de Tramuntana hasta paseos fáciles junto al mar.", metaDescription: "Rutas y miradores en Mallorca con contexto de acceso, zona y señales públicas para planificar. Ranking independiente sin publicidad." },
  excursions: { label: "Excursiones", singular: "Excursión", title: "Excursiones organizadas en Mallorca", intro: "Excursiones, tours y visitas guiadas en Mallorca: barco, 4x4, rutas culturales, gastronomía y planes de día completo.", metaDescription: "Excursiones en Mallorca con reseñas reales de Google: tours, visitas guiadas, barco y planes de día completo. Ranking sin publicidad." }
};

const enCategoryCopy: Record<CategorySlug, CategoryCopy> = {
  restaurants: { label: "Restaurants", singular: "Restaurant", title: "Restaurants in Mallorca", intro: "The best restaurants in Mallorca ranked with real Google ratings and reviews, from seafront terraces in Palma to inland places worth knowing.", metaDescription: "Best restaurants in Mallorca ranked with real Google reviews, areas, cuisine signals and prices. Independent ranking with no paid placements." },
  hotels: { label: "Hotels", singular: "Hotel", title: "Hotels in Mallorca", intro: "Boutique, rural and beach hotels in Mallorca ranked by real quality signals. Choosing the right hotel also means choosing the right area.", metaDescription: "Hotels in Mallorca ranked with real Google data, verified review signals and area context. Compare before booking. No paid placements." },
  "beach-clubs": { label: "Beach clubs", singular: "Beach club", title: "Beach clubs in Mallorca", intro: "The best beach clubs in Mallorca for long lunches, sunset cocktails or a beach day with loungers, pool and service.", metaDescription: "Beach clubs in Mallorca ranked with real Google reviews, area, atmosphere and useful signals. Independent ranking with no ads." },
  boats: { label: "Boats", singular: "Boat rental company", title: "Boat rental in Mallorca", intro: "The best boat rental companies in Mallorca, with or without skipper, by the hour or day, from Palma, Alcudia, Andratx or Pollenca.", metaDescription: "Boat rental in Mallorca with real Google reviews, verified operators and area context. Objective ranking with no paid positions." },
  activities: { label: "Activities", singular: "Activity", title: "Things to do in Mallorca", intro: "The best activities in Mallorca: kayaking, diving, hiking, wineries, boat trips and more, ranked by verified quality signals.", metaDescription: "Things to do in Mallorca ranked with real Google reviews: tours, kayaking, diving, adventure and activities by area. No ads." },
  beaches: { label: "Beaches and coves", singular: "Beach or cove", title: "Beaches and coves in Mallorca", intro: "The best beaches and coves in Mallorca, from easy-access beaches to hidden spots, with access notes and what to expect.", metaDescription: "Best beaches and coves in Mallorca with access context, area signals and public ratings. Independent guide with no paid placements." },
  bars: { label: "Bars", singular: "Bar", title: "Bars in Mallorca", intro: "The best bars in Mallorca for tapas, cocktails, vermouth or a beer with a view: cocktail bars, beach bars and village taverns.", metaDescription: "Bars in Mallorca for tapas, cocktails and drinks, ranked with real Google reviews and area signals. No paid positions." },
  cafes: { label: "Cafes", singular: "Cafe", title: "Cafes and brunch in Mallorca", intro: "The best cafes and brunch spots in Mallorca: specialty coffee, local breakfasts, croissants and weekend brunch.", metaDescription: "Cafes and brunch in Mallorca with real Google ratings, area context and useful signals for coffee or breakfast. No ads." },
  bakeries: { label: "Bakeries", singular: "Bakery", title: "Bakeries and pastry shops in Mallorca", intro: "Bakeries and pastry shops in Mallorca for ensaimadas, cocas, artisan bread and traditional sweets, ranked with real reviews.", metaDescription: "Bakeries and pastry shops in Mallorca for ensaimadas, bread and traditional sweets, ranked with real Google reviews." },
  "rent-a-car": { label: "Rent a car", singular: "Car rental", title: "Car rental in Mallorca", intro: "Car rental companies in Mallorca by airport, Palma or tourist areas, with real ratings and points to check before booking.", metaDescription: "Car rental in Mallorca with real Google reviews, area context and signals to compare before booking. Independent ranking." },
  spas: { label: "Spas and wellness", singular: "Spa", title: "Spas and wellness centers in Mallorca", intro: "Spas, wellness and massage centers in Mallorca, from luxury hotel spas to day spas and urban treatments.", metaDescription: "Spas and wellness in Mallorca with real Google reviews, treatments, area context and useful signals to choose. No ads." },
  gyms: { label: "Gyms", singular: "Gym", title: "Gyms in Mallorca", intro: "Gyms in Mallorca by area: fitness, crossfit, yoga, pilates, functional training and sports centers ranked by real ratings.", metaDescription: "Gyms in Mallorca by area, fitness, crossfit, yoga and pilates, ranked with real Google reviews. No paid placements." },
  routes: { label: "Routes and viewpoints", singular: "Route or viewpoint", title: "Routes and viewpoints in Mallorca", intro: "Hiking routes, viewpoints and paths in Mallorca, from the Serra de Tramuntana to easy walks by the sea.", metaDescription: "Routes and viewpoints in Mallorca with access context, area signals and public data to plan better. Independent ranking." },
  excursions: { label: "Excursions", singular: "Excursion", title: "Organized excursions in Mallorca", intro: "Excursions, tours and guided visits in Mallorca: boats, 4x4, culture, food experiences and full-day plans.", metaDescription: "Excursions in Mallorca with real Google reviews: tours, guided visits, boat trips and full-day plans. No paid placements." }
};

const deCategoryCopy: Record<CategorySlug, CategoryCopy> = {
  restaurants: { label: "Restaurants", singular: "Restaurant", title: "Restaurants auf Mallorca", intro: "Die besten Restaurants auf Mallorca, sortiert nach echten Google-Bewertungen: von Terrassen am Meer in Palma bis zu starken Adressen im Inselinneren.", metaDescription: "Beste Restaurants auf Mallorca mit echten Google-Bewertungen, Gegenden, Küchen-Signalen und Preisen. Unabhängig, ohne bezahlte Plätze." },
  hotels: { label: "Hotels", singular: "Hotel", title: "Hotels auf Mallorca", intro: "Boutique-, Land- und Strandhotels auf Mallorca, geordnet nach echten Qualitätssignalen. Das richtige Hotel bedeutet auch die richtige Gegend.", metaDescription: "Hotels auf Mallorca mit echten Google-Daten, Bewertungssignalen und Kontext zur Lage. Vergleichen vor der Buchung. Keine Werbung." },
  "beach-clubs": { label: "Beachclubs", singular: "Beachclub", title: "Beachclubs auf Mallorca", intro: "Die besten Beachclubs auf Mallorca für lange Lunches, Cocktails zum Sonnenuntergang oder einen Strandtag mit Liege, Pool und Service.", metaDescription: "Beachclubs auf Mallorca mit echten Google-Bewertungen, Lage, Atmosphäre und nützlichen Signalen. Unabhängig, ohne Werbung." },
  boats: { label: "Boote", singular: "Bootsvermieter", title: "Boot mieten auf Mallorca", intro: "Die besten Bootsvermieter auf Mallorca, mit oder ohne Skipper, stunden- oder tageweise, ab Palma, Alcudia, Andratx oder Pollenca.", metaDescription: "Boot mieten auf Mallorca mit echten Google-Bewertungen, geprüften Anbietern und Kontext zur Lage. Objektiv, ohne bezahlte Plätze." },
  activities: { label: "Aktivitäten", singular: "Aktivität", title: "Aktivitäten auf Mallorca", intro: "Die besten Aktivitäten auf Mallorca: Kajak, Tauchen, Wandern, Weingüter, Bootstouren und mehr, sortiert nach verifizierten Qualitätssignalen.", metaDescription: "Aktivitäten auf Mallorca mit echten Google-Bewertungen: Touren, Kajak, Tauchen, Abenteuer und Pläne nach Gegend. Keine Werbung." },
  beaches: { label: "Strände und Buchten", singular: "Strand oder Bucht", title: "Strände und Buchten auf Mallorca", intro: "Die besten Strände und Buchten auf Mallorca, von leicht erreichbaren Stränden bis zu versteckten Orten, mit Hinweisen zu Zugang und Eindruck.", metaDescription: "Strände und Buchten auf Mallorca mit Zugang, Lage und öffentlichen Bewertungen. Unabhängiger Guide ohne bezahlte Plätze." },
  bars: { label: "Bars", singular: "Bar", title: "Bars auf Mallorca", intro: "Die besten Bars auf Mallorca für Tapas, Cocktails, Vermut oder ein Bier mit Aussicht: Cocktailbars, Strandbars und Dorftavernen.", metaDescription: "Bars auf Mallorca für Tapas, Cocktails und Drinks, sortiert mit echten Google-Bewertungen und Lage-Signalen. Keine Werbung." },
  cafes: { label: "Cafes", singular: "Cafe", title: "Cafes und Brunch auf Mallorca", intro: "Die besten Cafes und Brunch-Spots auf Mallorca: Specialty Coffee, lokales Frühstück, Croissants und Wochenendbrunch.", metaDescription: "Cafes und Brunch auf Mallorca mit echten Google-Bewertungen, Lage und nützlichen Signalen für Kaffee oder Frühstück." },
  bakeries: { label: "Bäckereien", singular: "Bäckerei", title: "Bäckereien und Konditoreien auf Mallorca", intro: "Bäckereien und Konditoreien auf Mallorca für Ensaimadas, Cocas, handwerkliches Brot und traditionelle Süßwaren.", metaDescription: "Bäckereien und Konditoreien auf Mallorca für Ensaimadas, Brot und Süßes, sortiert mit echten Google-Bewertungen." },
  "rent-a-car": { label: "Mietwagen", singular: "Mietwagenanbieter", title: "Mietwagen auf Mallorca", intro: "Mietwagenanbieter auf Mallorca am Flughafen, in Palma oder in touristischen Gegenden, mit echten Bewertungen und Punkten vor der Buchung.", metaDescription: "Mietwagen auf Mallorca mit echten Google-Bewertungen, Lage-Kontext und Signalen zum Vergleichen vor der Buchung." },
  spas: { label: "Spas und Wellness", singular: "Spa", title: "Spas und Wellness auf Mallorca", intro: "Spas, Wellness- und Massagezentren auf Mallorca: von Luxushotel-Spas bis zu Day Spas und urbanen Treatments.", metaDescription: "Spas und Wellness auf Mallorca mit echten Google-Bewertungen, Treatments, Lage und nützlichen Signalen. Keine Werbung." },
  gyms: { label: "Fitnessstudios", singular: "Fitnessstudio", title: "Fitnessstudios auf Mallorca", intro: "Fitnessstudios auf Mallorca nach Gegend: Fitness, Crossfit, Yoga, Pilates, Functional Training und Sportzentren.", metaDescription: "Fitnessstudios auf Mallorca nach Gegend, Fitness, Crossfit, Yoga und Pilates, sortiert mit echten Google-Bewertungen." },
  routes: { label: "Routen und Aussichtspunkte", singular: "Route oder Aussichtspunkt", title: "Routen und Aussichtspunkte auf Mallorca", intro: "Wanderrouten, Aussichtspunkte und Wege auf Mallorca, von der Serra de Tramuntana bis zu einfachen Spaziergängen am Meer.", metaDescription: "Routen und Aussichtspunkte auf Mallorca mit Zugang, Lage und öffentlichen Daten zur Planung. Unabhängig, ohne Werbung." },
  excursions: { label: "Ausflüge", singular: "Ausflug", title: "Organisierte Ausflüge auf Mallorca", intro: "Ausflüge, Touren und geführte Besuche auf Mallorca: Boot, 4x4, Kultur, Kulinarik und Tagespläne.", metaDescription: "Ausflüge auf Mallorca mit echten Google-Bewertungen: Touren, Führungen, Bootsausflüge und Tagespläne. Keine Werbung." }
};

export const categoryCopy: Record<Locale, Record<CategorySlug, CategoryCopy>> = {
  es: esCategoryCopy,
  en: enCategoryCopy,
  de: deCategoryCopy
};

export function t(locale: Locale) {
  return uiCopy[locale];
}

export function getCategoryCopy(slug: CategorySlug, locale: Locale): CategoryCopy {
  return categoryCopy[locale][slug] ?? categoryCopy.es[slug] ?? categoryConfigs[slug];
}

export function categoryLabelForBusiness(category: BusinessCategory, locale: Locale) {
  return getCategoryCopy(getCategorySlugFromBusiness(category), locale).singular;
}
