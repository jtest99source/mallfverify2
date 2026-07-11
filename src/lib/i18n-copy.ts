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
      explore: "Places",
      guides: "Guías",
      methodology: "Metodología",
      forBusinesses: "Para negocios",
      categoriesVerified: "categorías · datos verificados",
      allRankings: "Ver todos los rankings"
    },
    home: {
      metaTitle: "Mallorca Verified | El directorio donde nadie paga por estar primero",
      metaDescription: "El directorio de Mallorca para expats, compradores y residentes internacionales. Restaurantes, hoteles, médicos, inmobiliarias — ordenados por reseñas reales de Google. Sin publicidad. Sin posiciones de pago.",
      eyebrow: "Para expats y residentes internacionales · Sin posiciones de pago",
      title: "El directorio de Mallorca donde nadie paga por estar primero.",
      intro: "Restaurantes, hoteles, médicos, abogados, inmobiliarias — ordenados por reseñas reales de Google. Ningún negocio ha pagado por su posición. Ninguno desaparece porque no pague. Filtra por categoría y zona, compara con datos.",
      exploreRankings: "Ver los mejores lugares",
      viewGuides: "Ver guías",
      verifiedBusinesses: "negocios verificados",
      analyzedReviews: "reseñas analizadas en Google",
      activeCategories: "categorías activas",
      signals: ["Reseñas reales de Google", "Independiente y sin anuncios", "Actualizado cada semana", "Para expats y visitantes"],
      selection: "Selección verificada",
      bestThisWeek: "Los más valorados de Mallorca",
      bestThisWeekIntro: "Lo que más se busca en Mallorca, ordenado por señal real: valoración, volumen y consistencia.",
      guidesEyebrow: "Guías editoriales",
      guidesTitle: "Planifica con contexto",
      guidesIntro: "¿Dónde comer en Palma? ¿Qué zona para dormir? Las guías tienen respuestas concretas — no listas genéricas.",
      businessTitle: "Más visibilidad para tu negocio en Mallorca",
      businessIntro: "Cada mes, miles de turistas, expats y compradores internacionales usan Mallorca Verified para decidir dónde van en la isla. Estar bien posicionado aquí significa más visibilidad ante la gente que importa. Cualquier negocio que cumple nuestros criterios puede listarse de forma gratuita.",
      businessCta: "Más información →"
    },
    rankings: {
      metaTitle: "Rankings de Mallorca sin tourist traps | Mallorca Verified",
      metaDescription: "Rankings de Mallorca basados en reseñas reales de Google para expats y residentes internacionales. Sin publicidad, sin posiciones de pago.",
      eyebrow: "Sin tourist traps · Sin posiciones de pago",
      title: "Los mejores sitios de Mallorca, filtrados de verdad.",
      intro: "Elige una categoría, filtra por zona y compara con calma. Todo lo que ves ha superado un umbral real de reseñas de Google — nada de tourist traps, nada de publicidad.",
      activeRanking: "Ranking activo",
      businessBoxEyebrow: "Para negocios",
      businessBoxTitle: "¿Gestionas un negocio en Mallorca?",
      businessBoxIntro: "Añade fotos reales, servicios, carta y datos actualizados. Una ficha completa aparece mejor en Google y es más fácil de citar en ChatGPT, Perplexity o Google AI.",
      businessBoxNote: "Las posiciones en rankings no cambian: solo enriquecemos la información disponible.",
      businessBoxCta: "Escríbenos",
      guidesEyebrow: "Guías para planificar",
      guidesTitle: "Cuando quieres contexto, no solo posiciones",
      guidesIntro: "Las guías son listas escritas para planes concretos: dónde ir según la zona, el momento del viaje, el presupuesto o lo que te apetece hacer.",
      viewGuides: "Ver guías"
    },
    guides: {
      eyebrow: "Mallorca con criterio",
      title: "Lo que funciona en Mallorca, según los datos",
      description: "Llevamos años cruzando reseñas reales de Google con conocimiento de la isla. Lo que aparece aquí no depende de la temporada ni de quién paga — depende de lo que dicen los datos.",
      viewRankings: "Ver rankings",
      goHome: "Ir a inicio",
      empty: "Estamos preparando nuevas guías editoriales. Mientras tanto, puedes comparar negocios directamente en los rankings.",
      updatedLabel: "Actualizado",
      recommended: "Recomendados",
      readGuide: "Leer guía",
      viewProfile: "Ver ficha completa →",
      reviews: "reseñas",
      breadcrumbGuides: "Guías"
    },
    footer: {
      description: "El portal de referencia para residentes internacionales, compradores y expats en Mallorca. Rankings basados en reseñas reales de Google — sin publicidad, sin posiciones de pago.",
      contact: "Contacto",
      categories: "Categorías",
      allCategories: "Ver todas las categorías",
      site: "Sitio",
      privacy: "Privacidad",
      cookies: "Cookies",
      about: "Quiénes somos",
      editorial: "Política editorial"
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
      sort: { ratio: "MV Score", rating: "Mejor valoración", reviews: "Más reseñas", hidden: "Joyas ocultas" }
    },
    business: {
      hiddenGem: "Joya oculta",
      viewDataReviews: "Ver datos y reseñas",
      fallbackLine: "Compara valoraciones, ubicación y reseñas de este negocio.",
      reviewsSection: "Valoración y reseñas",
      repeatedInReviews: "Lo más repetido en reseñas",
      whatPeopleLike: "Lo que más gusta",
      featuredReviews: "Reseñas recientes",
      viewAllGoogleReviews: "Ver todas las reseñas en Google",
      offers: "Qué ofrece",
      reviewsOnGoogle: "reseñas en Google",
      contact: "Contacto",
      price: "Precio",
      pricePer: "Precio /",
      howToGetThere: "Cómo llegar",
      googleMaps: "Ver en Google Maps",
      officialWebsite: "Web",
      related: "También puede encajar",
      profileCtaEyebrow: "¿Representas este negocio?",
      profileCtaTitle: "Haz que tu ficha trabaje para ti",
      profileCtaText: "Puedes aportar datos actualizados, mejores fotos, servicios, carta, condiciones de reserva o información práctica para que la ficha sea más completa — y más fácil de encontrar.",
      profileCtaNote: "Las colaboraciones editoriales no modifican ratings, reseñas ni posiciones en rankings.",
      profileCtaButton: "Escríbenos"
    },
    category: {
      breadcrumbHome: "Inicio",
      comparator: "Comparador objetivo",
      signalLine: "Ordenamos negocios del mismo tipo con señales verificables: valoración, reseñas, ubicación y consistencia de la ficha.",
      rankingByCategory: "Ranking por categoría",
      topIntro: "Una vista directa para comparar los mejor valorados sin ruido, publicidad ni posiciones compradas.",
      fullRanking: "Ver ranking completo",
      areaEyebrow: "Por zonas",
      relatedRankings: "Rankings relacionados",
      viewAll: "Ver todos",
      faqFresh: "¿La información de cada sitio está actualizada?",
      faqFreshAnswer: "Usamos datos de Google junto con selección editorial propia. Te recomendamos confirmar horarios, precios y reservas directamente con el negocio, especialmente en temporada alta.",
      topInMallorca: (label: string) => `Top ${label.toLowerCase()} en Mallorca`,
      byArea: (label: string) => `${label} por zona`,
      faqSort: (label: string) => `¿Cómo se ordenan los ${label.toLowerCase()}?`,
      faqSortAnswer: "Analizamos las reseñas reales de Google de cada negocio y los ordenamos por valoración media, volumen de reseñas y autoridad relativa dentro de la categoría. Las posiciones no se pueden comprar y nunca mezclamos tipos distintos de negocio.",
      relatedGuidesEyebrow: "Guías relacionadas",
      relatedGuidesTitle: (label: string) => `Planifica mejor: guías sobre ${label.toLowerCase()}`,
      relatedGuidesAreaTitle: (area: string) => `Guías sobre ${area}`,
      viewAllGuides: "Ver todas las guías"
    }
  },
  en: {
    nav: {
      explore: "Places",
      guides: "Guides",
      methodology: "Methodology",
      forBusinesses: "For businesses",
      categoriesVerified: "categories · Verified data",
      allRankings: "View all rankings"
    },
    home: {
      metaTitle: "Mallorca Verified | The directory where no one buys their ranking",
      metaDescription: "The Mallorca directory for expats, buyers and international residents. Restaurants, hotels, doctors, estate agents — ranked by real Google reviews. No ads. No paid positions.",
      eyebrow: "For expats and international residents · No paid rankings",
      title: "The Mallorca directory where no one buys their position.",
      intro: "Restaurants, hotels, doctors, lawyers, estate agents — all ranked by real Google reviews. Nothing appears here because it paid. Nothing disappears because it didn't. Filter by category and area, compare with data.",
      exploreRankings: "Find the best places",
      viewGuides: "View guides",
      verifiedBusinesses: "verified businesses",
      analyzedReviews: "Google reviews analysed",
      activeCategories: "active categories",
      signals: ["Real Google reviews", "Independent & ad-free", "Updated weekly", "For expats & visitors"],
      selection: "Verified selection",
      bestThisWeek: "Most rated in Mallorca",
      bestThisWeekIntro: "What people actually rate in Mallorca — ordered by real signal: rating, volume and consistency.",
      guidesEyebrow: "Editorial guides",
      guidesTitle: "Plan with context",
      guidesIntro: "Where to eat in Palma? Which area to stay in? Our guides give specific answers — not generic lists.",
      businessTitle: "More visibility for your business in Mallorca",
      businessIntro: "Every month, thousands of tourists, expats and international buyers use Mallorca Verified to decide where to go on the island. Being well-ranked here means more visibility with the people who matter. Any business meeting our criteria can list for free.",
      businessCta: "Learn more →"
    },
    rankings: {
      metaTitle: "Mallorca rankings without tourist traps | Mallorca Verified",
      metaDescription: "Mallorca rankings based on real Google reviews for expats and international residents. No tourist traps, no paid placements.",
      eyebrow: "No tourist traps · No paid placements",
      title: "The best of Mallorca, filtered for real.",
      intro: "Pick a category, filter by area and browse at your own pace. Everything here cleared a real Google review threshold — no tourist traps, no paid placements.",
      activeRanking: "Active ranking",
      businessBoxEyebrow: "For businesses",
      businessBoxTitle: "Do you run a business in Mallorca?",
      businessBoxIntro: "Add real photos, services, menus and up-to-date details. A complete profile is easier to find on Google — and easier to cite in ChatGPT, Perplexity or Google AI.",
      businessBoxNote: "Ranking positions stay the same — we only enrich the information available.",
      businessBoxCta: "Get in touch",
      guidesEyebrow: "Planning guides",
      guidesTitle: "When you want context, not just rankings",
      guidesIntro: "Guides are written for specific plans: where to go based on the area, time of year, budget or what you're in the mood for.",
      viewGuides: "View guides"
    },
    guides: {
      eyebrow: "Mallorca with authority",
      title: "What works in Mallorca, according to the data",
      description: "We've spent years cross-referencing real Google reviews with deep knowledge of the island. What appears here doesn't depend on the season or who pays — it depends on what the data says.",
      viewRankings: "View rankings",
      goHome: "Back to home",
      empty: "We're working on new editorial guides. In the meantime, you can compare businesses directly in the rankings.",
      updatedLabel: "Updated",
      recommended: "Recommended",
      readGuide: "Read guide",
      viewProfile: "View full profile →",
      reviews: "reviews",
      breadcrumbGuides: "Guides"
    },
    footer: {
      description: "The reference directory for international residents, buyers and expats in Mallorca. Rankings built on real Google reviews — no ads, no paid placements.",
      contact: "Contact",
      categories: "Categories",
      allCategories: "View all categories",
      site: "Site",
      privacy: "Privacy",
      cookies: "Cookies",
      about: "About us",
      editorial: "Editorial policy"
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
      sort: { ratio: "MV Score", rating: "Highest rating", reviews: "Most reviews", hidden: "Hidden gems" }
    },
    business: {
      hiddenGem: "Hidden gem",
      viewDataReviews: "View data and reviews",
      fallbackLine: "Profile with ratings, location and reviews available for comparison.",
      reviewsSection: "Rating and reviews",
      repeatedInReviews: "What reviewers keep mentioning",
      whatPeopleLike: "What people love",
      featuredReviews: "Recent reviews",
      viewAllGoogleReviews: "View all reviews on Google",
      offers: "What's on offer",
      reviewsOnGoogle: "reviews on Google",
      contact: "Contact",
      price: "Price",
      pricePer: "Price /",
      howToGetThere: "Getting there",
      googleMaps: "Open in Google Maps",
      officialWebsite: "Website",
      related: "You might also like",
      profileCtaEyebrow: "Do you represent this business?",
      profileCtaTitle: "Make your profile work harder",
      profileCtaText: "You can contribute up-to-date details, better photos, services, menus, booking info or practical notes to make the profile more useful — and easier to find.",
      profileCtaNote: "Editorial collaborations do not affect ratings, reviews or ranking positions.",
      profileCtaButton: "Get in touch"
    },
    category: {
      breadcrumbHome: "Home",
      comparator: "Objective comparison",
      signalLine: "We rank businesses of the same type using verifiable signals: rating, review volume, location and profile quality.",
      rankingByCategory: "Category ranking",
      topIntro: "A clear view of the top results — no noise, no ads, no paid placements.",
      fullRanking: "View full ranking",
      areaEyebrow: "By area",
      relatedRankings: "Related rankings",
      viewAll: "View all",
      faqFresh: "Is the information up to date?",
      faqFreshAnswer: "We use Google data combined with editorial checks. Always confirm opening hours, prices and reservations directly with the business — especially in peak season.",
      topInMallorca: (label: string) => `Top ${label.toLowerCase()} in Mallorca`,
      byArea: (label: string) => `${label} by area`,
      faqSort: (label: string) => `How are ${label.toLowerCase()} ranked?`,
      faqSortAnswer: "We analyse real Google reviews for each business, combining average rating, review volume and relative authority within the category. Rankings cannot be bought and we never mix different business types.",
      relatedGuidesEyebrow: "Related guides",
      relatedGuidesTitle: (label: string) => `Plan smarter: guides about ${label.toLowerCase()}`,
      relatedGuidesAreaTitle: (area: string) => `Guides about ${area}`,
      viewAllGuides: "View all guides"
    }
  },
  de: {
    nav: {
      explore: "Places",
      guides: "Guides",
      methodology: "Methodik",
      forBusinesses: "Für Betriebe",
      categoriesVerified: "Kategorien · Verifizierte Daten",
      allRankings: "Alle Rankings ansehen"
    },
    home: {
      metaTitle: "Mallorca Verified | Das Verzeichnis, in dem keine Position gekauft wird",
      metaDescription: "Das Mallorca-Verzeichnis für Expats, Käufer und internationale Bewohner. Restaurants, Hotels, Ärzte, Immobilienmakler — nach echten Google-Bewertungen sortiert. Keine Werbung. Keine gekauften Positionen.",
      eyebrow: "Für Expats und internationale Bewohner · Keine bezahlten Platzierungen",
      title: "Das Mallorca-Verzeichnis, in dem keine Position gekauft wird.",
      intro: "Restaurants, Hotels, Ärzte, Anwälte, Immobilienmakler — alle nach echten Google-Bewertungen sortiert. Kein Betrieb erscheint hier, weil er bezahlt hat. Keiner verschwindet, weil er nicht zahlt. Filtere nach Kategorie und Ort, vergleiche mit Daten.",
      exploreRankings: "Die besten Orte entdecken",
      viewGuides: "Guides ansehen",
      verifiedBusinesses: "verifizierte Betriebe",
      analyzedReviews: "Google-Bewertungen analysiert",
      activeCategories: "aktive Kategorien",
      signals: ["Echte Google-Bewertungen", "Unabhängig & werbefrei", "Wöchentlich aktualisiert", "Für Expats & Besucher"],
      selection: "Verifizierte Auswahl",
      bestThisWeek: "Am besten bewertet auf Mallorca",
      bestThisWeekIntro: "Was auf Mallorca wirklich bewertet wird — nach echten Signalen sortiert: Bewertung, Volumen und Konstanz.",
      guidesEyebrow: "Redaktionelle Guides",
      guidesTitle: "Mit Kontext planen",
      guidesIntro: "Wo in Palma essen? Welches Gebiet zum Übernachten? Unsere Guides geben konkrete Antworten — keine generischen Listen.",
      businessTitle: "Mehr Sichtbarkeit für deinen Betrieb auf Mallorca",
      businessIntro: "Jeden Monat nutzen tausende Touristen, Expats und internationale Käufer Mallorca Verified, um zu entscheiden, wohin sie auf der Insel gehen. Gut platziert zu sein bedeutet mehr Sichtbarkeit bei den richtigen Leuten. Jeder Betrieb, der unsere Kriterien erfüllt, kann sich kostenlos listen lassen.",
      businessCta: "Mehr erfahren →"
    },
    rankings: {
      metaTitle: "Mallorca-Rankings ohne Touristenfallen | Mallorca Verified",
      metaDescription: "Mallorca-Rankings auf Basis echter Google-Bewertungen für Expats und internationale Bewohner. Keine Touristenfallen, keine bezahlten Platzierungen.",
      eyebrow: "Keine Touristenfallen · Keine bezahlten Platzierungen",
      title: "Das Beste auf Mallorca — wirklich gefiltert.",
      intro: "Wähle eine Kategorie, filtere nach Ort und schau dich in Ruhe um. Alles hier hat eine echte Google-Bewertungsschwelle bestanden — keine Touristenfallen, keine Werbung.",
      activeRanking: "Aktives Ranking",
      businessBoxEyebrow: "Für Betriebe",
      businessBoxTitle: "Hast du einen Betrieb auf Mallorca?",
      businessBoxIntro: "Ergänze echte Fotos, Services, Speisekarte und aktuelle Details. Ein vollständiges Profil ist bei Google besser auffindbar — und für ChatGPT, Perplexity oder Google AI leichter zitierbar.",
      businessBoxNote: "Die Ranking-Positionen bleiben unverändert — wir ergänzen nur die verfügbaren Informationen.",
      businessBoxCta: "Schreib uns",
      guidesEyebrow: "Guides zur Planung",
      guidesTitle: "Mehr als nur ein Ranking",
      guidesIntro: "Unsere Guides sind für konkrete Pläne geschrieben: wohin je nach Gegend, Reisezeit, Budget oder Lust.",
      viewGuides: "Guides ansehen"
    },
    guides: {
      eyebrow: "Redaktionelle Guides",
      title: "Mallorca-Guides mit echten Daten",
      description: "Praktische Artikel zur Auswahl von Gegend, Restaurant, Hotel oder Aktivität auf Mallorca. Jede Empfehlung basiert auf überprüfbaren Profilen und echten Google-Daten.",
      viewRankings: "Rankings ansehen",
      goHome: "Zur Startseite",
      empty: "Wir arbeiten an neuen redaktionellen Guides. In der Zwischenzeit kannst du Betriebe direkt in den Rankings vergleichen.",
      updatedLabel: "Aktualisiert",
      recommended: "Empfohlen",
      readGuide: "Guide lesen",
      viewProfile: "Vollständiges Profil ansehen →",
      reviews: "Bewertungen",
      breadcrumbGuides: "Guides"
    },
    footer: {
      description: "Das Referenzverzeichnis für internationale Bewohner, Käufer und Expats auf Mallorca. Rankings auf Basis echter Google-Bewertungen — keine Werbung, keine bezahlten Platzierungen.",
      contact: "Kontakt",
      categories: "Kategorien",
      allCategories: "Alle Kategorien ansehen",
      site: "Website",
      privacy: "Datenschutz",
      cookies: "Cookies",
      about: "Über uns",
      editorial: "Redakt. Richtlinien"
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
      sort: { ratio: "MV Score", rating: "Beste Bewertung", reviews: "Meiste Bewertungen", hidden: "Geheimtipps" }
    },
    business: {
      hiddenGem: "Geheimtipp",
      viewDataReviews: "Daten und Bewertungen ansehen",
      fallbackLine: "Profil mit Bewertungen, Standort und Nutzermeinungen zum Vergleichen.",
      reviewsSection: "Bewertung und Rezensionen",
      repeatedInReviews: "Was in Rezensionen immer wieder auftaucht",
      whatPeopleLike: "Was besonders gut ankommt",
      featuredReviews: "Aktuelle Rezensionen",
      viewAllGoogleReviews: "Alle Rezensionen auf Google ansehen",
      offers: "Das Angebot",
      reviewsOnGoogle: "Rezensionen auf Google",
      contact: "Kontakt",
      price: "Preis",
      pricePer: "Preis /",
      howToGetThere: "Anfahrt",
      googleMaps: "In Google Maps öffnen",
      officialWebsite: "Webseite",
      related: "Könnte auch passen",
      profileCtaEyebrow: "Vertrittst du diesen Betrieb?",
      profileCtaTitle: "Lass dein Profil mehr für dich arbeiten",
      profileCtaText: "Du kannst aktuelle Infos, bessere Fotos, Services, Speisekarte, Buchungsdetails oder praktische Hinweise beisteuern, damit das Profil vollständiger und besser auffindbar wird.",
      profileCtaNote: "Redaktionelle Kooperationen ändern keine Bewertungen, Rezensionen oder Ranking-Positionen.",
      profileCtaButton: "Schreib uns"
    },
    category: {
      breadcrumbHome: "Start",
      comparator: "Objektiver Vergleich",
      signalLine: "Wir sortieren Betriebe desselben Typs anhand überprüfbarer Signale: Bewertung, Rezensionsvolumen, Lage und Profilqualität.",
      rankingByCategory: "Ranking nach Kategorie",
      topIntro: "Ein klarer Blick auf die besten Ergebnisse — ohne Ablenkung, ohne Werbung, ohne gekaufte Plätze.",
      fullRanking: "Vollständiges Ranking ansehen",
      areaEyebrow: "Nach Gegend",
      relatedRankings: "Verwandte Rankings",
      viewAll: "Alle ansehen",
      faqFresh: "Sind die Infos aktuell?",
      faqFreshAnswer: "Wir nutzen Google-Daten kombiniert mit redaktionellen Prüfungen. Öffnungszeiten, Preise und Reservierungen am besten direkt beim Betrieb bestätigen — besonders in der Hochsaison.",
      topInMallorca: (label: string) => `Top ${label.toLowerCase()} auf Mallorca`,
      byArea: (label: string) => `${label} nach Gegend`,
      faqSort: (label: string) => `Wie werden ${label.toLowerCase()} sortiert?`,
      faqSortAnswer: "Wir analysieren echte Google-Bewertungen für jeden Betrieb und ordnen nach Durchschnittsbewertung, Rezensionsvolumen und relativer Autorität innerhalb der Kategorie. Positionen können nicht gekauft werden und wir mischen nie verschiedene Betriebstypen.",
      relatedGuidesEyebrow: "Passende Guides",
      relatedGuidesTitle: (label: string) => `Besser planen: Guides über ${label.toLowerCase()}`,
      relatedGuidesAreaTitle: (area: string) => `Guides über ${area}`,
      viewAllGuides: "Alle Guides ansehen"
    }
  }
} as const;

const esCategoryCopy: Partial<Record<CategorySlug, CategoryCopy>> = {
  restaurants: { label: "Restaurantes", singular: "Restaurante", title: "Restaurantes en Mallorca", intro: "Restaurantes de Mallorca filtrados por valoración real de Google. Sin tourist traps, sin publicidad — desde terrazas frente al mar en Palma hasta rincones de interior que pocos conocen.", metaDescription: "Restaurantes en Mallorca filtrados por reseñas reales de Google. Sin tourist traps ni posiciones de pago. Ranking por zona, cocina y calidad verificada." },
  hotels: { label: "Hoteles", singular: "Hotel", title: "Hoteles en Mallorca", intro: "Hoteles boutique, rurales y de playa en Mallorca para compradores, expats y viajeros internacionales que quieren elegir con datos reales. La posición refleja calidad verificada, no quien pagó más.", metaDescription: "Hoteles en Mallorca ordenados con datos reales de Google para viajeros internacionales. Sin publicidad ni posiciones de pago. Compara antes de reservar." },
  "beach-clubs": { label: "Beach clubs", singular: "Beach club", title: "Beach clubs en Mallorca", intro: "Los mejores beach clubs de Mallorca según reseñas reales de Google. Para una comida larga, un atardecer con cócteles o un día de playa sin caer en el primero que aparece.", metaDescription: "Beach clubs en Mallorca filtrados por reseñas reales de Google. Sin tourist traps, sin publicidad. Ranking por zona, ambiente y calidad verificada." },
  boats: { label: "Barcos", singular: "Empresa de barcos", title: "Alquiler de barcos en Mallorca", intro: "Las mejores empresas de alquiler de barcos en Mallorca para visitantes y residentes internacionales. Con y sin patrón, por horas o días, desde Palma, Alcúdia, Andratx o Pollença.", metaDescription: "Alquiler de barcos en Mallorca con datos reales de Google, reseñas verificadas y operadores por zona. Ranking objetivo sin posiciones pagadas." },
  activities: { label: "Actividades", singular: "Actividad", title: "Actividades en Mallorca", intro: "Las mejores actividades en Mallorca para quien quiere explorar la isla de verdad: kayak, buceo, senderismo, bodegas, excursiones en barco y más, filtrados por calidad verificada.", metaDescription: "Actividades en Mallorca filtradas por reseñas reales de Google. Sin tourist traps: tours, kayak, buceo, aventura y planes por zona." },
  beaches: { label: "Playas y calas", singular: "Playa o cala", title: "Playas y calas de Mallorca", intro: "Las mejores playas y calas de Mallorca, desde las más accesibles hasta las más escondidas, con información práctica para quien llega sin red local.", metaDescription: "Playas y calas de Mallorca con contexto de acceso, zona y valoraciones públicas. Ranking independiente para elegir mejor. Sin publicidad." },
  bars: { label: "Bares", singular: "Bar", title: "Bares en Mallorca", intro: "Los mejores bares de Mallorca para tapas, cócteles, vermut o una cerveza con vistas. Filtrados por reseñas reales — sin tourist traps.", metaDescription: "Bares en Mallorca filtrados por reseñas reales de Google. Sin tourist traps ni posiciones pagadas. Coctelería, chiringuitos y tabernas." },
  cafes: { label: "Cafeterías", singular: "Cafetería", title: "Cafeterías y brunch en Mallorca", intro: "Las mejores cafeterías y sitios de brunch en Mallorca según reseñas reales de Google: specialty coffee, desayunos mallorquines, croissants y brunch de fin de semana.", metaDescription: "Cafeterías y brunch en Mallorca filtrados por reseñas reales de Google. Sin publicidad. Specialty coffee, desayunos y brunch por zona." },
  bakeries: { label: "Hornos y pastelerías", singular: "Horno o pastelería", title: "Hornos y pastelerías en Mallorca", intro: "Panaderías y pastelerías de Mallorca para ensaimadas, coques, pan artesanal y dulces tradicionales, ordenadas por reseñas reales.", metaDescription: "Hornos y pastelerías en Mallorca para ensaimadas, pan y dulces tradicionales, con reseñas reales de Google. Ranking independiente." },
  "rent-a-car": { label: "Rent a car", singular: "Alquiler de coches", title: "Alquiler de coches en Mallorca", intro: "Empresas de alquiler de coches en Mallorca para viajeros y residentes internacionales. Valoraciones reales para comparar antes de reservar — sin las trampas habituales en contratos o seguros.", metaDescription: "Alquiler de coches en Mallorca filtrado por reseñas reales de Google. Para residentes y viajeros internacionales. Sin publicidad." },
  spas: { label: "Spas y wellness", singular: "Spa", title: "Spas y centros de bienestar en Mallorca", intro: "Spas, wellness y centros de masaje en Mallorca filtrados por reseñas reales: desde hoteles de lujo hasta day spas y centros de bienestar urbanos.", metaDescription: "Spas y wellness en Mallorca filtrados por reseñas reales de Google. Sin publicidad. Por zona, tratamiento y calidad verificada." },
  gyms: { label: "Gimnasios", singular: "Gimnasio", title: "Gimnasios en Mallorca", intro: "Gimnasios en Mallorca para residentes internacionales: fitness, crossfit, yoga, pilates y funcional, ordenados por valoración real de Google por zona.", metaDescription: "Gimnasios en Mallorca para residentes internacionales. Fitness, crossfit, yoga y pilates ordenados por reseñas reales. Sin posiciones pagadas." },
  routes: { label: "Rutas y miradores", singular: "Ruta o mirador", title: "Rutas y miradores en Mallorca", intro: "Rutas de senderismo, miradores y caminos de Mallorca, desde la Serra de Tramuntana hasta paseos fáciles junto al mar.", metaDescription: "Rutas y miradores en Mallorca con contexto de acceso, zona y señales públicas para planificar. Ranking independiente sin publicidad." },
  excursions: { label: "Excursiones", singular: "Excursión", title: "Excursiones organizadas en Mallorca", intro: "Excursiones, tours y visitas guiadas en Mallorca: barco, 4x4, rutas culturales, gastronomía y planes de día completo.", metaDescription: "Excursiones en Mallorca con reseñas reales de Google: tours, visitas guiadas, barco y planes de día completo. Ranking sin publicidad." }
};

const enCategoryCopy: Partial<Record<CategorySlug, CategoryCopy>> = {
  restaurants: { label: "Restaurants", singular: "Restaurant", title: "Restaurants in Mallorca", intro: "Mallorca restaurants filtered by real Google ratings — no tourist traps, no paid placements. From seafront terraces in Palma to inland spots worth the trip.", metaDescription: "Restaurants in Mallorca filtered by real Google reviews. No tourist traps, no paid placements. Ranked by area, cuisine and verified quality." },
  hotels: { label: "Hotels", singular: "Hotel", title: "Hotels in Mallorca", intro: "Boutique, rural and beach hotels in Mallorca ranked by real quality signals, for international visitors and buyers who want data, not marketing. No paid placements.", metaDescription: "Hotels in Mallorca ranked with real Google data for international visitors. No paid placements. Compare by area and verified quality before booking." },
  "beach-clubs": { label: "Beach clubs", singular: "Beach club", title: "Beach clubs in Mallorca", intro: "The best beach clubs in Mallorca according to real Google reviews — for a long lunch, sunset cocktails or a beach day without falling for the first result on Google Maps.", metaDescription: "Beach clubs in Mallorca filtered by real Google reviews. No tourist traps, no paid placements. Ranked by area, atmosphere and verified quality." },
  boats: { label: "Boats", singular: "Boat rental company", title: "Boat rental in Mallorca", intro: "The best boat rental companies in Mallorca for international visitors and expats, with or without skipper, by the hour or day, from Palma, Alcúdia, Andratx or Pollença.", metaDescription: "Boat rental in Mallorca with real Google reviews, verified operators and area context. Objective ranking with no paid positions." },
  activities: { label: "Activities", singular: "Activity", title: "Things to do in Mallorca", intro: "The best things to do in Mallorca for people who want to explore the island properly: kayaking, diving, hiking, wineries, boat trips and more, filtered by verified quality.", metaDescription: "Things to do in Mallorca filtered by real Google reviews. No tourist traps: tours, kayaking, diving, adventure and activities by area." },
  beaches: { label: "Beaches and coves", singular: "Beach or cove", title: "Beaches and coves in Mallorca", intro: "The best beaches and coves in Mallorca, from easy-access beaches to hidden spots, with practical notes for visitors without a local network.", metaDescription: "Best beaches and coves in Mallorca with access context, area signals and public ratings. Independent guide with no paid placements." },
  bars: { label: "Bars", singular: "Bar", title: "Bars in Mallorca", intro: "The best bars in Mallorca for tapas, cocktails, vermouth or a beer with a view — filtered by real review signals, no tourist traps.", metaDescription: "Bars in Mallorca filtered by real Google reviews. No tourist traps, no paid positions. Cocktail bars, beach bars and village taverns." },
  cafes: { label: "Cafes", singular: "Cafe", title: "Cafes and brunch in Mallorca", intro: "The best cafes and brunch spots in Mallorca ranked by real Google ratings: specialty coffee, local breakfasts, croissants and weekend brunch.", metaDescription: "Cafes and brunch in Mallorca filtered by real Google ratings. No ads. Specialty coffee, breakfasts and brunch by area." },
  bakeries: { label: "Bakeries", singular: "Bakery", title: "Bakeries and pastry shops in Mallorca", intro: "Bakeries and pastry shops in Mallorca for ensaimadas, cocas, artisan bread and traditional sweets, ranked with real reviews.", metaDescription: "Bakeries and pastry shops in Mallorca for ensaimadas, bread and traditional sweets, ranked with real Google reviews." },
  "rent-a-car": { label: "Rent a car", singular: "Car rental", title: "Car rental in Mallorca", intro: "Car rental companies in Mallorca for international visitors and expats. Ranked by real Google ratings — without the usual traps in contracts or insurance.", metaDescription: "Car rental in Mallorca filtered by real Google reviews for international visitors. No paid placements. Compare before booking." },
  spas: { label: "Spas and wellness", singular: "Spa", title: "Spas and wellness centers in Mallorca", intro: "Spas, wellness and massage centres in Mallorca filtered by real Google reviews — from luxury hotel spas to day spas and urban treatments.", metaDescription: "Spas and wellness in Mallorca filtered by real Google reviews. No ads. By area, treatment and verified quality." },
  gyms: { label: "Gyms", singular: "Gym", title: "Gyms in Mallorca", intro: "Gyms in Mallorca for international residents: fitness, crossfit, yoga, pilates and functional training ranked by real Google ratings by area.", metaDescription: "Gyms in Mallorca for international residents. Fitness, crossfit, yoga and pilates ranked by real Google reviews. No paid placements." },
  routes: { label: "Routes and viewpoints", singular: "Route or viewpoint", title: "Routes and viewpoints in Mallorca", intro: "Hiking routes, viewpoints and paths in Mallorca, from the Serra de Tramuntana to easy walks by the sea.", metaDescription: "Routes and viewpoints in Mallorca with access context, area signals and public data to plan better. Independent ranking." },
  excursions: { label: "Excursions", singular: "Excursion", title: "Organized excursions in Mallorca", intro: "Excursions, tours and guided visits in Mallorca: boats, 4x4, culture, food experiences and full-day plans.", metaDescription: "Excursions in Mallorca with real Google reviews: tours, guided visits, boat trips and full-day plans. No paid placements." }
};

const deCategoryCopy: Partial<Record<CategorySlug, CategoryCopy>> = {
  restaurants: { label: "Restaurants", singular: "Restaurant", title: "Restaurants auf Mallorca", intro: "Restaurants auf Mallorca, gefiltert nach echten Google-Bewertungen — keine Touristenfallen, keine Werbung. Von Terrassen am Meer in Palma bis zu starken Adressen im Inselinneren.", metaDescription: "Restaurants auf Mallorca gefiltert nach echten Google-Bewertungen. Keine Touristenfallen, keine bezahlten Plätze. Gerankt nach Lage, Küche und verifizierter Qualität." },
  hotels: { label: "Hotels", singular: "Hotel", title: "Hotels auf Mallorca", intro: "Boutique-, Land- und Strandhotels auf Mallorca, nach echten Qualitätssignalen gerankt, für internationale Reisende und Käufer, die Daten statt Marketing wollen.", metaDescription: "Hotels auf Mallorca nach echten Google-Daten für internationale Reisende. Keine Werbung, keine bezahlten Plätze. Vor der Buchung vergleichen." },
  "beach-clubs": { label: "Beachclubs", singular: "Beachclub", title: "Beachclubs auf Mallorca", intro: "Die besten Beachclubs auf Mallorca nach echten Google-Bewertungen — für einen langen Lunch, Cocktails zum Sonnenuntergang oder einen Strandtag ohne die erste Google-Maps-Falle.", metaDescription: "Beachclubs auf Mallorca gefiltert nach echten Google-Bewertungen. Keine Touristenfallen, keine Werbung. Nach Lage, Atmosphäre und verifizierter Qualität." },
  boats: { label: "Boote", singular: "Bootsvermieter", title: "Boot mieten auf Mallorca", intro: "Die besten Bootsvermieter auf Mallorca für internationale Besucher und Expats, mit oder ohne Skipper, stunden- oder tageweise, ab Palma, Alcúdia, Andratx oder Pollença.", metaDescription: "Boot mieten auf Mallorca mit echten Google-Bewertungen, geprüften Anbietern und Kontext zur Lage. Objektiv, ohne bezahlte Plätze." },
  activities: { label: "Aktivitäten", singular: "Aktivität", title: "Aktivitäten auf Mallorca", intro: "Die besten Aktivitäten auf Mallorca für alle, die die Insel wirklich erkunden wollen: Kajak, Tauchen, Wandern, Weingüter und mehr, gefiltert nach verifizierten Qualitätssignalen.", metaDescription: "Aktivitäten auf Mallorca gefiltert nach echten Google-Bewertungen. Keine Touristenfallen: Touren, Kajak, Tauchen, Abenteuer und Pläne nach Gegend." },
  beaches: { label: "Strände und Buchten", singular: "Strand oder Bucht", title: "Strände und Buchten auf Mallorca", intro: "Die besten Strände und Buchten auf Mallorca, von leicht erreichbaren bis zu versteckten Orten, mit praktischen Hinweisen für Besucher ohne lokales Netzwerk.", metaDescription: "Strände und Buchten auf Mallorca mit Zugang, Lage und öffentlichen Bewertungen. Unabhängiger Guide ohne bezahlte Plätze." },
  bars: { label: "Bars", singular: "Bar", title: "Bars auf Mallorca", intro: "Die besten Bars auf Mallorca für Tapas, Cocktails, Vermut oder ein Bier mit Aussicht — gefiltert nach echten Bewertungssignalen, keine Touristenfallen.", metaDescription: "Bars auf Mallorca gefiltert nach echten Google-Bewertungen. Keine Touristenfallen, keine Werbung. Cocktailbars, Strandbars und Dorftavernen." },
  cafes: { label: "Cafés", singular: "Café", title: "Cafés und Brunch auf Mallorca", intro: "Die besten Cafés und Brunch-Spots auf Mallorca nach echten Google-Bewertungen: Specialty Coffee, lokales Frühstück, Croissants und Wochenendbrunch.", metaDescription: "Cafés und Brunch auf Mallorca gefiltert nach echten Google-Bewertungen. Keine Werbung. Specialty Coffee, Frühstück und Brunch nach Gegend." },
  bakeries: { label: "Bäckereien", singular: "Bäckerei", title: "Bäckereien und Konditoreien auf Mallorca", intro: "Bäckereien und Konditoreien auf Mallorca für Ensaimadas, Cocas, handwerkliches Brot und traditionelle Süßwaren.", metaDescription: "Bäckereien und Konditoreien auf Mallorca für Ensaimadas, Brot und Süßes, sortiert mit echten Google-Bewertungen." },
  "rent-a-car": { label: "Mietwagen", singular: "Mietwagenanbieter", title: "Mietwagen auf Mallorca", intro: "Mietwagenanbieter auf Mallorca für internationale Besucher und Expats. Nach echten Google-Bewertungen gerankt — ohne die üblichen Fallen in Verträgen oder Versicherungen.", metaDescription: "Mietwagen auf Mallorca gefiltert nach echten Google-Bewertungen für internationale Besucher. Keine Werbung. Vor der Buchung vergleichen." },
  spas: { label: "Spas und Wellness", singular: "Spa", title: "Spas und Wellness auf Mallorca", intro: "Spas, Wellness- und Massagezentren auf Mallorca, gefiltert nach echten Google-Bewertungen — von Luxushotel-Spas bis zu Day Spas und urbanen Treatments.", metaDescription: "Spas und Wellness auf Mallorca gefiltert nach echten Google-Bewertungen. Keine Werbung. Nach Lage, Treatment und verifizierter Qualität." },
  gyms: { label: "Fitnessstudios", singular: "Fitnessstudio", title: "Fitnessstudios auf Mallorca", intro: "Fitnessstudios auf Mallorca für internationale Residenten: Fitness, Crossfit, Yoga, Pilates und Functional Training, nach echten Google-Bewertungen nach Gegend sortiert.", metaDescription: "Fitnessstudios auf Mallorca für internationale Residenten. Fitness, Crossfit, Yoga und Pilates nach echten Bewertungen. Keine bezahlten Plätze." },
  routes: { label: "Routen und Aussichtspunkte", singular: "Route oder Aussichtspunkt", title: "Routen und Aussichtspunkte auf Mallorca", intro: "Wanderrouten, Aussichtspunkte und Wege auf Mallorca, von der Serra de Tramuntana bis zu einfachen Spaziergängen am Meer.", metaDescription: "Routen und Aussichtspunkte auf Mallorca mit Zugang, Lage und öffentlichen Daten zur Planung. Unabhängig, ohne Werbung." },
  excursions: { label: "Ausflüge", singular: "Ausflug", title: "Organisierte Ausflüge auf Mallorca", intro: "Ausflüge, Touren und geführte Besuche auf Mallorca: Boot, 4x4, Kultur, Kulinarik und Tagespläne.", metaDescription: "Ausflüge auf Mallorca mit echten Google-Bewertungen: Touren, Führungen, Bootsausflüge und Tagespläne. Keine Werbung." }
};

Object.assign(esCategoryCopy, {
  nightlife: { label: "Nightlife", singular: "Local nocturno", title: "Discotecas y nightlife en Mallorca", intro: "Clubs, discotecas y locales nocturnos en Mallorca filtrados por reseñas reales de Google. Sin posiciones de pago — lo que aparece primero es lo que mejor valoran quienes han estado.", metaDescription: "Discotecas y nightlife en Mallorca filtrados por reseñas reales de Google. Sin posiciones pagadas. Por zona, ambiente y calidad verificada." },
  "car-dealers": { label: "Concesionarios", singular: "Compraventa de coches", title: "Compraventa de coches en Mallorca", intro: "Concesionarios y compraventas de coches para residentes, expats y estancias largas en Mallorca. Filtrados por reseñas reales para tomar la decisión con información.", metaDescription: "Compraventa de coches en Mallorca filtrada por reseñas reales para residentes y expats. Sin publicidad ni posiciones pagadas." },
  healthcare: { label: "Salud", singular: "Clínica o profesional sanitario", title: "Clínicas, médicos y dentistas en Mallorca", intro: "Clínicas privadas, médicos y dentistas en Mallorca orientados a extranjeros, expats y residentes internacionales. Contrastados con señales públicas verificables.", metaDescription: "Clínicas, médicos y dentistas en Mallorca para residentes internacionales. Reseñas reales y señales verificables. Sin publicidad." },
  "real-estate": { label: "Inmobiliarias", singular: "Agencia inmobiliaria", title: "Agencias inmobiliarias en Mallorca", intro: "Agencias inmobiliarias en Mallorca para compradores y residentes internacionales que quieren comparar opciones con datos reales, no con marketing.", metaDescription: "Agencias inmobiliarias en Mallorca para compradores internacionales. Reseñas reales, zonas y señales verificadas. Sin publicidad." }
} satisfies Partial<Record<CategorySlug, CategoryCopy>>);

Object.assign(enCategoryCopy, {
  nightlife: { label: "Nightlife", singular: "Nightlife venue", title: "Nightlife in Mallorca", intro: "Clubs, late bars and nightlife venues in Mallorca filtered by real Google review signals. No paid placements — what ranks highest is what real visitors rated highest.", metaDescription: "Nightlife in Mallorca filtered by real Google reviews. No paid placements. Clubs, late bars and venues by area and verified quality." },
  "car-dealers": { label: "Car dealers", singular: "Car dealer", title: "Used car dealers in Mallorca", intro: "Car dealers and used car sellers in Mallorca for expats, international residents and longer stays. Filtered by real Google reviews to make the decision with real information.", metaDescription: "Used car dealers in Mallorca filtered by real Google reviews for expats and residents. No paid placements." },
  healthcare: { label: "Healthcare", singular: "Clinic or healthcare provider", title: "Doctors, clinics and dentists in Mallorca", intro: "Private clinics, doctors and dentists in Mallorca for foreigners, expats and international residents. Cross-referenced with public signals.", metaDescription: "Doctors, clinics and dentists in Mallorca for international residents. Real Google reviews and verifiable signals. No ads." },
  "real-estate": { label: "Real estate", singular: "Real estate agency", title: "Real estate agencies in Mallorca", intro: "Real estate agencies in Mallorca for international buyers and residents who want to compare options with real data, not marketing.", metaDescription: "Real estate agencies in Mallorca for international buyers. Real reviews, area context and verified signals. No ads." }
} satisfies Partial<Record<CategorySlug, CategoryCopy>>);

Object.assign(deCategoryCopy, {
  nightlife: { label: "Nightlife", singular: "Nachtclub", title: "Nightlife auf Mallorca", intro: "Clubs, Diskotheken und späte Bars auf Mallorca, gefiltert nach echten Google-Bewertungssignalen. Keine bezahlten Plätze — was am höchsten rankt, hat echte Besucher überzeugt.", metaDescription: "Nightlife auf Mallorca gefiltert nach echten Google-Bewertungen. Keine Werbung. Clubs, Diskotheken und Bars nach Lage und verifizierter Qualität." },
  "car-dealers": { label: "Autohändler", singular: "Autohändler", title: "Gebrauchtwagenhändler auf Mallorca", intro: "Autohändler und Gebrauchtwagenanbieter auf Mallorca für Expats, internationale Residenten und längere Aufenthalte. Gefiltert nach echten Bewertungen für eine informierte Entscheidung.", metaDescription: "Gebrauchtwagenhändler auf Mallorca gefiltert nach echten Google-Bewertungen für Residenten und Expats. Keine Werbung." },
  healthcare: { label: "Gesundheit", singular: "Klinik oder Arztpraxis", title: "Ärzte, Kliniken und Zahnärzte auf Mallorca", intro: "Private Kliniken, Ärzte und Zahnärzte auf Mallorca für Ausländer, Expats und internationale Bewohner. Anhand öffentlicher Signale überprüft.", metaDescription: "Ärzte, Kliniken und Zahnärzte auf Mallorca für internationale Bewohner. Echte Bewertungen und prüfbare Signale. Keine Werbung." },
  "real-estate": { label: "Immobilien", singular: "Immobilienagentur", title: "Immobilienmakler auf Mallorca", intro: "Immobilienagenturen auf Mallorca für internationale Käufer und Bewohner, die Optionen mit echten Daten statt Marketing vergleichen wollen.", metaDescription: "Immobilienmakler auf Mallorca für internationale Käufer. Echte Bewertungen, Lage-Kontext und verifizierte Signale. Keine Werbung." }
} satisfies Partial<Record<CategorySlug, CategoryCopy>>);

Object.assign(esCategoryCopy, {
  casinos: { label: "Casinos y apuestas", singular: "Casino", title: "Casinos y salas de juego en Mallorca", intro: "Casinos, bingos y salas de juego en Mallorca ordenados por reseñas reales, ubicación y señales públicas. Sin posiciones pagadas.", metaDescription: "Casinos, bingos y salas de juego en Mallorca con reseñas reales de Google. Ranking independiente por zona y reputación." }
} satisfies Partial<Record<CategorySlug, CategoryCopy>>);

Object.assign(esCategoryCopy, {
  vets: { label: "Veterinarios", singular: "Clínica veterinaria", title: "Veterinarios en Mallorca", intro: "Clínicas veterinarias, hospitales veterinarios y urgencias para mascotas en Mallorca ordenados por reseñas reales y señales públicas.", metaDescription: "Veterinarios en Mallorca con reseñas reales de Google. Clínicas, hospitales veterinarios y urgencias por zona." }
} satisfies Partial<Record<CategorySlug, CategoryCopy>>);

Object.assign(enCategoryCopy, {
  casinos: { label: "Casinos and betting", singular: "Casino", title: "Casinos and gaming rooms in Mallorca", intro: "Casinos, bingo halls and gaming rooms in Mallorca ranked by real public signals: reviews, location and reputation. No paid placements.", metaDescription: "Casinos, bingo halls and gaming rooms in Mallorca ranked with real Google reviews. Independent ranking by area and reputation." }
} satisfies Partial<Record<CategorySlug, CategoryCopy>>);

Object.assign(enCategoryCopy, {
  vets: { label: "Vets", singular: "Veterinary clinic", title: "Vets in Mallorca", intro: "Veterinary clinics, animal hospitals and emergency vets in Mallorca ranked by real Google reviews and public quality signals.", metaDescription: "Vets in Mallorca with real Google reviews. Veterinary clinics, animal hospitals and emergency care by area." }
} satisfies Partial<Record<CategorySlug, CategoryCopy>>);

Object.assign(deCategoryCopy, {
  casinos: { label: "Casinos und Spielhallen", singular: "Casino", title: "Casinos und Spielhallen auf Mallorca", intro: "Casinos, Bingohallen und Spielhallen auf Mallorca, sortiert nach echten öffentlichen Signalen: Bewertungen, Lage und Reputation. Keine bezahlten Plätze.", metaDescription: "Casinos, Bingohallen und Spielhallen auf Mallorca mit echten Google-Bewertungen. Unabhängiges Ranking nach Lage und Reputation." }
} satisfies Partial<Record<CategorySlug, CategoryCopy>>);

Object.assign(deCategoryCopy, {
  vets: { label: "Tierärzte", singular: "Tierarztpraxis", title: "Tierärzte auf Mallorca", intro: "Tierarztpraxen, Tierkliniken und Notdienste auf Mallorca, sortiert nach echten Google-Bewertungen und öffentlichen Qualitätssignalen.", metaDescription: "Tierärzte auf Mallorca mit echten Google-Bewertungen. Tierkliniken, Praxen und Notdienste nach Gegend." }
} satisfies Partial<Record<CategorySlug, CategoryCopy>>);

export const categoryCopy: Record<Locale, Partial<Record<CategorySlug, CategoryCopy>>> = {
  es: esCategoryCopy,
  en: enCategoryCopy,
  de: deCategoryCopy
};

export function t(locale: Locale) {
  return uiCopy[locale];
}

export function getCategoryCopy(slug: CategorySlug, locale: Locale): CategoryCopy {
  const fallback = categoryConfigs[slug];
  return categoryCopy[locale][slug] ?? categoryCopy.es[slug] ?? {
    label: fallback.label,
    singular: fallback.singular,
    title: fallback.title,
    intro: fallback.intro,
    metaDescription: fallback.intro
  };
}

export function categoryLabelForBusiness(category: BusinessCategory, locale: Locale) {
  return getCategoryCopy(getCategorySlugFromBusiness(category), locale).singular;
}
