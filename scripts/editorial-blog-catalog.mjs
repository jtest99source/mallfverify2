// scripts/editorial-blog-catalog.mjs
// Complete blog catalog for Mallorca Verified editorial guides.
// Imported by generate-editorial-guides.mjs — do not hardcode this list elsewhere.
//
// Fields:
//   tier            — 1 (island-wide) | 2 (by zone) | 3 (intent/practical) | 4 (GEO/conversational)
//   slug            — URL slug, also used as Supabase guide ID suffix
//   category        — single Supabase category, or null if multiCategories used
//   multiCategories — array of categories to OR-filter
//   city            — single city name, or null
//   multiCities     — array of cities to OR-filter (used for regional guides)
//   minRating       — minimum Google rating filter
//   minReviews      — minimum review count filter
//   limit           — max businesses to include (0 = informational, web-search-only)
//   minBusinesses   — minimum required before generating (default 3; set 0 for informational)
//   titles          — {es, en, de}
//   intent          — {es, en, de} — target search queries for the AI
//
// NOTE on broken categories:
//   beach, route, excursion, bakery businesses are hidden in Supabase (not published).
//   Entries using those categories must have minBusinesses: 0 to generate without business data.

export const BLOG_CATALOG = [

  // ══════════════════════════════════════════════════════════════════════════════
  // TIER 1 — Island-wide, high search volume + expat/nomad authority pieces
  // ══════════════════════════════════════════════════════════════════════════════

  {
    tier: 1,
    slug: 'mejores-restaurantes-mallorca',
    category: 'restaurant',
    minRating: 4.5,
    minReviews: 100,
    limit: 12,
    titles: {
      es: 'Mejores restaurantes en Mallorca 2026',
      en: 'Best Restaurants in Mallorca 2026',
      de: 'Die besten Restaurants auf Mallorca 2026',
    },
    intent: {
      es: 'donde comer bien en Mallorca, mejores restaurantes mallorca 2026',
      en: 'best restaurants in Mallorca, where to eat in Mallorca 2026',
      de: 'beste Restaurants Mallorca, wo essen Mallorca 2026',
    },
  },
  {
    tier: 1,
    slug: 'mejores-restaurantes-palma',
    category: 'restaurant',
    city: 'Palma',
    minRating: 4.4,
    minReviews: 80,
    limit: 12,
    titles: {
      es: 'Mejores restaurantes en Palma 2026',
      en: 'Best Restaurants in Palma de Mallorca 2026',
      de: 'Die besten Restaurants in Palma 2026',
    },
    intent: {
      es: 'donde comer en palma mallorca, mejores restaurantes palma 2026, restaurantes palma expat',
      en: 'best restaurants palma mallorca, where to eat palma 2026, restaurants palma expat',
      de: 'beste Restaurants Palma Mallorca 2026',
    },
  },
  {
    tier: 1,
    slug: 'mejores-hoteles-mallorca',
    category: 'hotel',
    minRating: 4.4,
    minReviews: 100,
    limit: 12,
    titles: {
      es: 'Mejores hoteles en Mallorca 2026',
      en: 'Best Hotels in Mallorca 2026',
      de: 'Die besten Hotels auf Mallorca 2026',
    },
    intent: {
      es: 'mejores hoteles mallorca 2026, hoteles bien valorados mallorca',
      en: 'best hotels mallorca 2026, top rated hotels mallorca',
      de: 'beste Hotels Mallorca 2026, top Hotels Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'mejores-hoteles-boutique-mallorca',
    category: 'hotel',
    minRating: 4.5,
    minReviews: 100,
    limit: 10,
    titles: {
      es: 'Mejores hoteles boutique en Mallorca 2026',
      en: 'Best Boutique Hotels in Mallorca 2026',
      de: 'Die besten Boutique-Hotels auf Mallorca 2026',
    },
    intent: {
      es: 'hoteles boutique mallorca, pequeños hoteles con encanto mallorca 2026',
      en: 'best boutique hotels mallorca 2026, small luxury hotels mallorca',
      de: 'Boutique Hotels Mallorca 2026, kleine Designhotels Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'hoteles-adults-only-mallorca',
    category: 'hotel',
    minRating: 4.4,
    minReviews: 80,
    limit: 10,
    titles: {
      es: 'Mejores hoteles adults only en Mallorca 2026',
      en: 'Best Adults Only Hotels in Mallorca 2026',
      de: 'Beste Adults-only Hotels auf Mallorca 2026',
    },
    intent: {
      es: 'hoteles adults only mallorca, hotel solo adultos mallorca 2026',
      en: 'adults only hotels mallorca 2026, no kids hotels mallorca',
      de: 'Adults-only Hotels Mallorca 2026, Erwachsenenhotels Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'hoteles-con-spa-mallorca',
    multiCategories: ['hotel', 'spa'],
    minRating: 4.4,
    minReviews: 50,
    limit: 12,
    titles: {
      es: 'Mejores hoteles con spa en Mallorca 2026',
      en: 'Best Hotels with Spa in Mallorca 2026',
      de: 'Beste Hotels mit Spa auf Mallorca 2026',
    },
    intent: {
      es: 'hoteles con spa mallorca, hotel spa mallorca 2026, bienestar mallorca',
      en: 'hotels with spa mallorca 2026, wellness hotels mallorca',
      de: 'Hotels mit Spa Mallorca 2026, Wellnesshotels Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'fincas-rurales-mallorca',
    category: 'hotel',
    minRating: 4.4,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Mejores fincas rurales en Mallorca 2026',
      en: 'Best Rural Fincas in Mallorca 2026',
      de: 'Die besten Fincas auf Mallorca 2026',
    },
    intent: {
      es: 'fincas rurales mallorca, casas rurales mallorca, agroturismo mallorca 2026',
      en: 'rural fincas mallorca 2026, country hotels mallorca, agrotourism mallorca',
      de: 'Fincas Mallorca 2026, Landhäuser Mallorca, Agrotourismus Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'mejores-beach-clubs-mallorca',
    category: 'beach-club',
    minRating: 4.3,
    minReviews: 50,
    limit: 10,
    titles: {
      es: 'Mejores beach clubs en Mallorca 2026',
      en: 'Best Beach Clubs in Mallorca 2026',
      de: 'Die besten Beach Clubs auf Mallorca 2026',
    },
    intent: {
      es: 'mejores beach clubs mallorca, beach clubs palma mallorca',
      en: 'best beach clubs mallorca 2026, beach clubs near palma',
      de: 'beste Beach Clubs Mallorca 2026',
    },
  },
  {
    tier: 1,
    slug: 'alquiler-de-barcos-mallorca',
    category: 'boat-rental',
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Alquiler de barcos en Mallorca 2026 — Guía completa',
      en: 'Boat Rental in Mallorca 2026 — Complete Guide',
      de: 'Bootsverleih auf Mallorca 2026 — Der komplette Guide',
    },
    intent: {
      es: 'alquiler barcos mallorca, alquilar barco mallorca 2026',
      en: 'boat rental mallorca 2026, hire a boat mallorca',
      de: 'Bootsverleih Mallorca 2026, Boot mieten Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'charter-velero-mallorca',
    category: 'boat-rental',
    minRating: 4.4,
    minReviews: 20,
    limit: 10,
    titles: {
      es: 'Alquiler de velero en Mallorca 2026 — Guía completa',
      en: 'Sailing Charter in Mallorca 2026 — Complete Guide',
      de: 'Segelcharter Mallorca 2026 — Der komplette Guide',
    },
    intent: {
      es: 'alquiler velero mallorca, charter velero mallorca 2026, sailing mallorca',
      en: 'sailing charter mallorca 2026, rent a sailboat mallorca',
      de: 'Segelcharter Mallorca 2026, Segelboot mieten Mallorca',
    },
  },
  {
    // Beaches are now hidden — pure informational guide via web search
    tier: 1,
    slug: 'mejores-playas-mallorca',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Mejores playas de Mallorca 2026 — Por zona y tipo',
      en: 'Best Beaches in Mallorca 2026 — By Zone and Type',
      de: 'Die schönsten Strände auf Mallorca 2026 — Nach Zone',
    },
    intent: {
      es: 'mejores playas mallorca, playas bonitas mallorca 2026, calas mallorca sin masificar',
      en: 'best beaches mallorca 2026, most beautiful beaches mallorca, quiet beaches mallorca',
      de: 'beste Strände Mallorca 2026, schönste Strände Mallorca, ruhige Strände Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'que-hacer-en-mallorca',
    category: 'activity',
    minRating: 4.3,
    minReviews: 30,
    limit: 12,
    titles: {
      es: 'Qué hacer en Mallorca 2026 — Las mejores actividades',
      en: 'Things to Do in Mallorca 2026 — Best Activities',
      de: 'Was tun auf Mallorca 2026 — Die besten Aktivitäten',
    },
    intent: {
      es: 'que hacer en mallorca, actividades mallorca 2026, planes mallorca expat nomada',
      en: 'things to do in mallorca 2026, best activities mallorca, mallorca activities expat',
      de: 'was tun Mallorca 2026, Aktivitäten Mallorca, Freizeitaktivitäten Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'mejores-spas-mallorca',
    category: 'spa',
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Mejores spas en Mallorca 2026',
      en: 'Best Spas in Mallorca 2026',
      de: 'Die besten Spas auf Mallorca 2026',
    },
    intent: {
      es: 'mejores spas mallorca, spa mallorca dia relax, bienestar mallorca',
      en: 'best spas mallorca 2026, spa day mallorca, wellness mallorca',
      de: 'beste Spas Mallorca 2026, Wellness Mallorca, Spa Tag Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'mejores-restaurantes-romanticos-mallorca',
    category: 'restaurant',
    minRating: 4.5,
    minReviews: 80,
    limit: 10,
    titles: {
      es: 'Mejores restaurantes románticos en Mallorca 2026',
      en: 'Most Romantic Restaurants in Mallorca 2026',
      de: 'Die romantischsten Restaurants auf Mallorca 2026',
    },
    intent: {
      es: 'restaurantes romanticos mallorca, cena romantica mallorca 2026, cena en pareja mallorca',
      en: 'romantic restaurants mallorca 2026, best restaurants for couples mallorca',
      de: 'romantische Restaurants Mallorca 2026, Candlelight Dinner Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'sunset-bars-mallorca',
    category: 'bar',
    minRating: 4.4,
    minReviews: 50,
    limit: 10,
    titles: {
      es: 'Los mejores bares para ver el atardecer en Mallorca 2026',
      en: 'Best Sunset Bars in Mallorca 2026',
      de: 'Die besten Sunset-Bars auf Mallorca 2026',
    },
    intent: {
      es: 'bares atardecer mallorca, sunset bar mallorca, donde ver puesta de sol mallorca',
      en: 'sunset bars mallorca 2026, best bars with sunset view mallorca',
      de: 'Sunset Bars Mallorca 2026, Sonnenuntergang Bars Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'mejores-wine-bars-mallorca',
    category: 'bar',
    minRating: 4.4,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Mejores wine bars y bodegas en Mallorca 2026',
      en: 'Best Wine Bars in Mallorca 2026',
      de: 'Die besten Weinbars auf Mallorca 2026',
    },
    intent: {
      es: 'wine bar mallorca, bares de vino mallorca 2026, bodegas mallorca donde ir',
      en: 'best wine bars mallorca 2026, wine tasting mallorca',
      de: 'Weinbars Mallorca 2026, Weinproben Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'nightlife-mallorca',
    category: 'nightlife',
    minRating: 3.8,
    minReviews: 100,
    limit: 10,
    titles: {
      es: 'Nightlife en Mallorca 2026 — Dónde salir de noche',
      en: 'Mallorca Nightlife Guide 2026 — Where to Go Out',
      de: 'Mallorca Nachtleben 2026 — Wo feiern gehen',
    },
    intent: {
      es: 'donde salir de noche mallorca, discotecas mallorca 2026, nightlife palma magaluf',
      en: 'mallorca nightlife guide 2026, best clubs palma mallorca, where to go out mallorca',
      de: 'Mallorca Nachtleben 2026, Clubs Palma Mallorca, ausgehen Mallorca',
    },
  },
  {
    // Pure informational — expat living guide, no business data needed
    tier: 1,
    slug: 'vivir-en-mallorca-guia-expat',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Vivir en Mallorca — Guía completa para expats 2026',
      en: 'Living in Mallorca — Complete Expat Guide 2026',
      de: 'Leben auf Mallorca — Kompletter Expat-Guide 2026',
    },
    intent: {
      es: 'vivir en mallorca, mudarse a mallorca expat, guia expat mallorca 2026, vida mallorca extranjero',
      en: 'living in mallorca expat guide 2026, moving to mallorca, mallorca relocation guide',
      de: 'auf Mallorca leben, Auswanderer Mallorca 2026, Expat Guide Mallorca, nach Mallorca auswandern',
    },
  },
  {
    tier: 1,
    slug: 'nomada-digital-mallorca',
    multiCategories: ['cafe', 'gym'],
    minRating: 4.3,
    minReviews: 30,
    limit: 8,
    minBusinesses: 0,
    titles: {
      es: 'Mallorca para nómadas digitales 2026 — Guía práctica',
      en: 'Mallorca for Digital Nomads 2026 — Practical Guide',
      de: 'Mallorca für digitale Nomaden 2026 — Praktischer Guide',
    },
    intent: {
      es: 'nomada digital mallorca, trabajar remoto mallorca, coworking palma mallorca 2026, vivir y trabajar mallorca',
      en: 'digital nomad mallorca 2026, remote work mallorca, best cafes work mallorca, coworking palma mallorca',
      de: 'digitaler Nomade Mallorca 2026, remote arbeiten Mallorca, coworking Palma Mallorca',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // TIER 2 — By zone, long tail
  // ══════════════════════════════════════════════════════════════════════════════

  {
    tier: 2,
    slug: 'que-ver-soller-mallorca',
    multiCategories: ['restaurant', 'hotel', 'activity', 'beach-club'],
    city: 'Sóller',
    minRating: 4.2,
    minReviews: 20,
    limit: 12,
    titles: {
      es: 'Qué ver y hacer en Sóller 2026 — Guía completa',
      en: 'What to See and Do in Sóller Mallorca 2026',
      de: 'Sóller Mallorca 2026 — Sehenswürdigkeiten und Aktivitäten',
    },
    intent: {
      es: 'que ver en soller mallorca, que hacer soller, guia soller mallorca 2026, vivir soller mallorca',
      en: 'what to do in soller mallorca, soller travel guide 2026, living in soller mallorca',
      de: 'Sóller Mallorca Sehenswürdigkeiten, was tun Sóller 2026',
    },
  },
  {
    tier: 2,
    slug: 'que-ver-pollensa-mallorca',
    multiCategories: ['restaurant', 'hotel', 'activity', 'beach-club'],
    city: 'Pollença',
    minRating: 4.2,
    minReviews: 20,
    limit: 12,
    titles: {
      es: 'Qué ver y hacer en Pollença 2026 — Guía completa',
      en: 'What to See and Do in Pollença Mallorca 2026',
      de: 'Pollença Mallorca 2026 — Sehenswürdigkeiten und Aktivitäten',
    },
    intent: {
      es: 'que ver en pollensa mallorca, que hacer pollenca, guia pollensa mallorca 2026',
      en: 'what to do in pollensa mallorca, pollensa travel guide 2026',
      de: 'Pollença Mallorca Sehenswürdigkeiten, was tun Pollença 2026',
    },
  },
  {
    tier: 2,
    slug: 'que-ver-alcudia-mallorca',
    multiCategories: ['restaurant', 'hotel', 'activity', 'beach-club'],
    city: 'Alcúdia',
    minRating: 4.2,
    minReviews: 20,
    limit: 12,
    titles: {
      es: 'Qué ver y hacer en Alcúdia 2026 — Guía completa',
      en: 'What to See and Do in Alcúdia Mallorca 2026',
      de: 'Alcúdia Mallorca 2026 — Sehenswürdigkeiten und Aktivitäten',
    },
    intent: {
      es: 'que ver en alcudia mallorca, que hacer alcudia, guia alcudia mallorca 2026',
      en: 'what to do in alcudia mallorca, alcudia travel guide 2026',
      de: 'Alcúdia Mallorca Sehenswürdigkeiten, was tun Alcúdia 2026',
    },
  },
  {
    tier: 2,
    slug: 'mejores-restaurantes-soller',
    category: 'restaurant',
    city: 'Sóller',
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Mejores restaurantes en Sóller 2026',
      en: 'Best Restaurants in Sóller Mallorca 2026',
      de: 'Die besten Restaurants in Sóller 2026',
    },
    intent: {
      es: 'restaurantes soller mallorca, donde comer soller',
      en: 'best restaurants soller mallorca, where to eat soller',
      de: 'beste Restaurants Sóller Mallorca 2026',
    },
  },
  {
    tier: 2,
    slug: 'mejores-hoteles-soller',
    category: 'hotel',
    city: 'Sóller',
    minRating: 4.3,
    minReviews: 50,
    limit: 10,
    titles: {
      es: 'Mejores hoteles en Sóller 2026',
      en: 'Best Hotels in Sóller Mallorca 2026',
      de: 'Die besten Hotels in Sóller 2026',
    },
    intent: {
      es: 'hoteles soller mallorca, donde dormir soller mallorca',
      en: 'best hotels soller mallorca 2026, where to stay soller',
      de: 'beste Hotels Sóller Mallorca 2026',
    },
  },
  {
    tier: 2,
    slug: 'mejores-restaurantes-pollensa',
    category: 'restaurant',
    city: 'Pollença',
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Mejores restaurantes en Pollença 2026',
      en: 'Best Restaurants in Pollença Mallorca 2026',
      de: 'Die besten Restaurants in Pollença 2026',
    },
    intent: {
      es: 'restaurantes pollensa mallorca, donde comer pollenca',
      en: 'best restaurants pollensa mallorca, where to eat pollenca',
      de: 'beste Restaurants Pollença Mallorca 2026',
    },
  },
  {
    tier: 2,
    slug: 'restaurantes-puerto-pollensa',
    category: 'restaurant',
    city: 'Pollença',
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Mejores restaurantes en Puerto Pollença 2026',
      en: 'Best Restaurants in Puerto Pollensa 2026',
      de: 'Die besten Restaurants in Port de Pollença 2026',
    },
    intent: {
      es: 'restaurantes puerto pollensa mallorca, donde comer puerto pollença 2026',
      en: 'best restaurants puerto pollensa mallorca 2026, where to eat port de pollenca',
      de: 'beste Restaurants Puerto Pollença Mallorca 2026',
    },
  },
  {
    tier: 2,
    slug: 'mejores-hoteles-pollensa',
    category: 'hotel',
    city: 'Pollença',
    minRating: 4.3,
    minReviews: 50,
    limit: 10,
    titles: {
      es: 'Mejores hoteles en Pollença 2026',
      en: 'Best Hotels in Pollença Mallorca 2026',
      de: 'Die besten Hotels in Pollença 2026',
    },
    intent: {
      es: 'hoteles pollensa mallorca, donde dormir pollença',
      en: 'best hotels pollensa mallorca 2026',
      de: 'beste Hotels Pollença Mallorca 2026',
    },
  },
  {
    tier: 2,
    slug: 'restaurantes-alcudia',
    category: 'restaurant',
    city: 'Alcúdia',
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Mejores restaurantes en Alcúdia 2026',
      en: 'Best Restaurants in Alcúdia Mallorca 2026',
      de: 'Die besten Restaurants in Alcúdia 2026',
    },
    intent: {
      es: 'restaurantes alcudia mallorca, donde comer alcudia 2026',
      en: 'best restaurants alcudia mallorca 2026, where to eat alcudia',
      de: 'beste Restaurants Alcúdia Mallorca 2026',
    },
  },
  {
    tier: 2,
    slug: 'hoteles-norte-mallorca',
    category: 'hotel',
    multiCities: ['Pollença', 'Alcúdia'],
    minRating: 4.3,
    minReviews: 50,
    limit: 12,
    titles: {
      es: 'Mejores hoteles en el norte de Mallorca 2026',
      en: 'Best Hotels in North Mallorca 2026',
      de: 'Die besten Hotels im Norden Mallorcas 2026',
    },
    intent: {
      es: 'hoteles norte mallorca, donde dormir norte mallorca 2026, hoteles pollença alcudia',
      en: 'best hotels north mallorca 2026, hotels pollensa alcudia mallorca',
      de: 'Hotels Nordmallorca 2026, Hotels Pollença Alcúdia',
    },
  },
  {
    // Beaches hidden — pure informational
    tier: 2,
    slug: 'playas-norte-mallorca',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Mejores playas del norte de Mallorca 2026',
      en: 'Best Beaches in North Mallorca 2026',
      de: 'Die schönsten Strände im Norden Mallorcas 2026',
    },
    intent: {
      es: 'playas norte mallorca, playas pollensa alcudia, mejores playas norte mallorca 2026',
      en: 'best beaches north mallorca 2026, beaches pollensa alcudia',
      de: 'Strände Nordmallorca 2026, Strände Pollença Alcúdia',
    },
  },
  {
    // Beaches hidden — pure informational
    tier: 2,
    slug: 'playas-sur-mallorca',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Mejores playas del sur de Mallorca 2026',
      en: 'Best Beaches in South Mallorca 2026',
      de: 'Die schönsten Strände im Süden Mallorcas 2026',
    },
    intent: {
      es: 'playas sur mallorca, mejores playas sur mallorca 2026, calas sur mallorca santanyi',
      en: 'best beaches south mallorca 2026, beaches santanyi ses salines mallorca',
      de: 'Strände Südmallorca 2026, schönste Strände Süden Mallorca',
    },
  },
  {
    tier: 2,
    slug: 'mejores-bares-palma',
    category: 'bar',
    city: 'Palma',
    minRating: 4.3,
    minReviews: 50,
    limit: 10,
    titles: {
      es: 'Mejores bares en Palma 2026',
      en: 'Best Bars in Palma de Mallorca 2026',
      de: 'Die besten Bars in Palma 2026',
    },
    intent: {
      es: 'mejores bares palma mallorca, donde tomar algo palma, bares palma expat',
      en: 'best bars palma mallorca 2026, where to drink palma, bars palma expat',
      de: 'beste Bars Palma Mallorca 2026',
    },
  },
  {
    tier: 2,
    slug: 'mejores-cafeterias-palma',
    category: 'cafe',
    city: 'Palma',
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Mejores cafeterías en Palma para desayunar 2026',
      en: 'Best Cafés in Palma de Mallorca 2026',
      de: 'Die besten Cafés in Palma 2026',
    },
    intent: {
      es: 'cafeterias palma mallorca, donde desayunar palma 2026, cafes trabajar palma',
      en: 'best cafes palma mallorca 2026, breakfast palma mallorca, cafes to work palma',
      de: 'beste Cafés Palma Mallorca 2026, Frühstück Palma',
    },
  },
  {
    tier: 2,
    slug: 'beach-clubs-palma',
    category: 'beach-club',
    city: 'Palma',
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Mejores beach clubs cerca de Palma 2026',
      en: 'Best Beach Clubs near Palma 2026',
      de: 'Beste Beach Clubs in der Nähe von Palma 2026',
    },
    intent: {
      es: 'beach clubs palma mallorca, beach club cerca palma 2026',
      en: 'best beach clubs near palma mallorca 2026',
      de: 'Beach Clubs Palma Mallorca 2026',
    },
  },
  {
    tier: 2,
    slug: 'alquiler-barcos-palma',
    category: 'boat-rental',
    city: 'Palma',
    minRating: 4.3,
    minReviews: 20,
    limit: 10,
    titles: {
      es: 'Alquiler de barcos en Palma de Mallorca 2026',
      en: 'Boat Rental in Palma de Mallorca 2026',
      de: 'Bootsverleih in Palma de Mallorca 2026',
    },
    intent: {
      es: 'alquiler barcos palma mallorca, alquilar barco palma 2026',
      en: 'boat rental palma mallorca 2026, hire boat palma',
      de: 'Bootsverleih Palma Mallorca 2026',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // TIER 3 — Practical guides: intent, itinerary, lifestyle, expat/nomad
  // ══════════════════════════════════════════════════════════════════════════════

  {
    tier: 3,
    slug: 'que-hacer-mallorca-3-dias',
    multiCategories: ['restaurant', 'activity', 'hotel'],
    minRating: 4.4,
    minReviews: 50,
    limit: 12,
    minBusinesses: 0,
    titles: {
      es: 'Qué hacer en Mallorca en 3 días — Itinerario completo 2026',
      en: '3 Days in Mallorca — The Perfect Itinerary 2026',
      de: '3 Tage Mallorca — Der perfekte Reiseplan 2026',
    },
    intent: {
      es: 'que hacer en mallorca en 3 dias, itinerario mallorca 3 dias 2026',
      en: '3 days in mallorca itinerary, what to do mallorca 3 days',
      de: '3 Tage Mallorca Reiseplan, Mallorca 3 Tage was tun',
    },
  },
  {
    tier: 3,
    slug: 'mallorca-en-una-semana',
    multiCategories: ['restaurant', 'hotel', 'activity'],
    minRating: 4.4,
    minReviews: 50,
    limit: 15,
    minBusinesses: 0,
    titles: {
      es: 'Mallorca en una semana — Itinerario completo 2026',
      en: 'One Week in Mallorca — The Perfect Itinerary 2026',
      de: 'Eine Woche Mallorca — Der perfekte Reiseplan 2026',
    },
    intent: {
      es: 'mallorca en una semana, itinerario mallorca 7 dias, que ver mallorca 7 dias 2026',
      en: 'one week mallorca itinerary, 7 days mallorca travel guide 2026',
      de: 'eine Woche Mallorca Reiseplan, 7 Tage Mallorca Programm 2026',
    },
  },
  {
    tier: 3,
    slug: 'mallorca-con-ninos',
    multiCategories: ['activity', 'restaurant'],
    minRating: 4.3,
    minReviews: 30,
    limit: 12,
    minBusinesses: 0,
    titles: {
      es: 'Mallorca con niños — Los mejores planes familiares 2026',
      en: 'Mallorca with Kids — Best Family Activities 2026',
      de: 'Mallorca mit Kindern — Die besten Familienausflüge 2026',
    },
    intent: {
      es: 'mallorca con ninos, planes familias mallorca, que hacer mallorca familia',
      en: 'mallorca with kids, family activities mallorca 2026',
      de: 'Mallorca mit Kindern 2026, Familienurlaub Mallorca',
    },
  },
  {
    tier: 3,
    slug: 'mallorca-en-pareja',
    multiCategories: ['restaurant', 'hotel', 'boat-rental', 'spa'],
    minRating: 4.4,
    minReviews: 50,
    limit: 12,
    titles: {
      es: 'Mallorca en pareja — Los mejores planes románticos 2026',
      en: 'Romantic Mallorca — Best Couples Activities 2026',
      de: 'Mallorca zu zweit — Die romantischsten Ausflüge 2026',
    },
    intent: {
      es: 'mallorca en pareja, planes romanticos mallorca, mallorca luna de miel',
      en: 'romantic mallorca, mallorca for couples 2026, honeymoon mallorca',
      de: 'Mallorca zu zweit, romantische Ausflüge Mallorca 2026',
    },
  },
  {
    tier: 3,
    slug: 'mallorca-luna-de-miel',
    multiCategories: ['hotel', 'restaurant', 'boat-rental', 'spa'],
    minRating: 4.5,
    minReviews: 50,
    limit: 12,
    titles: {
      es: 'Mallorca para la luna de miel 2026 — Los mejores planes',
      en: 'Mallorca Honeymoon Guide 2026 — Best Plans',
      de: 'Mallorca Flitterwochen 2026 — Der romantische Guide',
    },
    intent: {
      es: 'luna de miel mallorca, mallorca honeymoon, hoteles romanticos mallorca boda',
      en: 'mallorca honeymoon guide 2026, romantic hotels mallorca wedding',
      de: 'Mallorca Hochzeitsreise 2026, Flitterwochen Mallorca romantisch',
    },
  },
  {
    tier: 3,
    slug: 'mallorca-presupuesto-ajustado',
    multiCategories: ['restaurant', 'activity', 'cafe'],
    minRating: 4.3,
    minReviews: 50,
    limit: 12,
    titles: {
      es: 'Mallorca con presupuesto ajustado 2026 — Cómo aprovechar sin gastar de más',
      en: 'Mallorca on a Budget 2026 — How to Make the Most Without Overspending',
      de: 'Mallorca günstig 2026 — Urlaub ohne hohe Kosten',
    },
    intent: {
      es: 'mallorca barato, mallorca presupuesto bajo 2026, mallorca sin gastar mucho',
      en: 'mallorca on a budget 2026, cheap mallorca travel tips',
      de: 'Mallorca günstig 2026, Mallorca Urlaub sparen',
    },
  },
  {
    tier: 3,
    slug: 'mejor-epoca-para-ir-mallorca',
    multiCategories: ['activity', 'restaurant'],
    minRating: 4.3,
    minReviews: 30,
    limit: 8,
    minBusinesses: 0,
    titles: {
      es: 'Mejor época para ir a Mallorca — Por mes y tipo de viaje',
      en: 'Best Time to Visit Mallorca — By Month and Travel Type',
      de: 'Beste Reisezeit Mallorca — Nach Monat und Reiseart',
    },
    intent: {
      es: 'mejor epoca para ir a mallorca, cuando ir a mallorca, mallorca temporada 2026',
      en: 'best time to visit mallorca, when to go to mallorca 2026',
      de: 'beste Reisezeit Mallorca, wann nach Mallorca reisen 2026',
    },
  },
  {
    tier: 3,
    slug: 'mallorca-en-octubre',
    multiCategories: ['activity', 'restaurant'],
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    minBusinesses: 0,
    titles: {
      es: 'Mallorca en octubre 2026 — Qué esperar y qué hacer',
      en: 'Mallorca in October 2026 — What to Expect and Do',
      de: 'Mallorca im Oktober 2026 — Was erwartet Sie',
    },
    intent: {
      es: 'mallorca en octubre, mallorca octubre que hacer, tiempo mallorca octubre 2026',
      en: 'mallorca in october 2026, mallorca october weather what to do',
      de: 'Mallorca im Oktober 2026, Mallorca Oktober Wetter Aktivitäten',
    },
  },
  {
    tier: 3,
    slug: 'mallorca-en-mayo',
    multiCategories: ['activity', 'restaurant'],
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    minBusinesses: 0,
    titles: {
      es: 'Mallorca en mayo 2026 — Qué esperar y qué hacer',
      en: 'Mallorca in May 2026 — What to Expect and Do',
      de: 'Mallorca im Mai 2026 — Was erwartet Sie',
    },
    intent: {
      es: 'mallorca en mayo, mallorca mayo que hacer, tiempo mallorca mayo 2026',
      en: 'mallorca in may 2026, mallorca may weather what to do',
      de: 'Mallorca im Mai 2026, Mallorca Mai Wetter Aktivitäten',
    },
  },
  {
    tier: 3,
    slug: 'norte-vs-sur-mallorca',
    multiCategories: ['hotel', 'restaurant'],
    minRating: 4.3,
    minReviews: 30,
    limit: 12,
    minBusinesses: 0,
    titles: {
      es: 'Norte vs sur de Mallorca — ¿Dónde alojarse según tu viaje?',
      en: 'North vs South Mallorca — Where to Stay Based on Your Trip',
      de: 'Norden vs. Süden Mallorca — Wo übernachten?',
    },
    intent: {
      es: 'norte vs sur mallorca, diferencia norte sur mallorca, donde alojarse mallorca',
      en: 'north vs south mallorca, where to stay in mallorca north or south',
      de: 'Norden vs Süden Mallorca, wo übernachten Mallorca',
    },
  },
  {
    tier: 3,
    slug: 'palma-vs-soller',
    multiCategories: ['hotel', 'restaurant', 'activity'],
    multiCities: ['Palma', 'Sóller'],
    minRating: 4.3,
    minReviews: 50,
    limit: 12,
    minBusinesses: 0,
    titles: {
      es: 'Palma vs Sóller — ¿Dónde alojarse en Mallorca?',
      en: 'Palma vs Sóller — Where to Stay in Mallorca?',
      de: 'Palma vs. Sóller — Wo übernachten auf Mallorca?',
    },
    intent: {
      es: 'palma vs soller mallorca, diferencia palma soller, donde dormir mallorca palma o soller',
      en: 'palma vs soller mallorca, where to stay palma or soller mallorca',
      de: 'Palma vs Sóller Mallorca, wo übernachten Palma oder Sóller',
    },
  },
  {
    tier: 3,
    slug: 'puerto-pollensa-vs-alcudia',
    multiCategories: ['hotel', 'restaurant'],
    multiCities: ['Pollença', 'Alcúdia'],
    minRating: 4.3,
    minReviews: 30,
    limit: 12,
    minBusinesses: 0,
    titles: {
      es: 'Puerto Pollença vs Alcúdia — ¿Cuál elegir para tu viaje?',
      en: 'Puerto Pollensa vs Alcudia — Which Should You Choose?',
      de: 'Puerto Pollença vs. Alcúdia — Welches ist besser?',
    },
    intent: {
      es: 'puerto pollensa vs alcudia mallorca, diferencia pollensa alcudia, cual es mejor',
      en: 'puerto pollensa vs alcudia mallorca, which is better pollensa or alcudia',
      de: 'Puerto Pollença vs Alcúdia Mallorca, welcher Ort ist besser',
    },
  },
  {
    tier: 3,
    slug: 'alquilar-coche-mallorca',
    category: 'rent-a-car',
    minRating: 3.8,
    minReviews: 200,
    limit: 8,
    titles: {
      es: 'Alquilar coche en Mallorca 2026 — Guía práctica y consejos',
      en: 'Renting a Car in Mallorca 2026 — Practical Guide and Tips',
      de: 'Auto mieten Mallorca 2026 — Praktischer Guide',
    },
    intent: {
      es: 'alquilar coche mallorca, rent a car mallorca 2026, mejor empresa alquiler coches mallorca, aeropuerto mallorca coche',
      en: 'renting a car in mallorca 2026, car rental tips mallorca, car hire mallorca airport',
      de: 'Auto mieten Mallorca 2026, Mietwagen Mallorca Tipps, Autovermietung Mallorca Flughafen',
    },
  },
  {
    tier: 3,
    slug: 'mallorca-sin-coche',
    multiCategories: ['activity'],
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    minBusinesses: 0,
    titles: {
      es: 'Mallorca sin coche — Qué puedes hacer sin alquilar',
      en: 'Mallorca Without a Car — What You Can Do',
      de: 'Mallorca ohne Auto — Was ist möglich?',
    },
    intent: {
      es: 'mallorca sin coche, transporte mallorca sin coche, que ver mallorca sin alquilar coche',
      en: 'mallorca without a car, how to get around mallorca without car',
      de: 'Mallorca ohne Auto, Mallorca Urlaub ohne Mietwagen 2026',
    },
  },
  {
    tier: 3,
    slug: 'donde-alojarse-mallorca',
    category: 'hotel',
    minRating: 4.4,
    minReviews: 80,
    limit: 15,
    minBusinesses: 0,
    titles: {
      es: 'Dónde alojarse en Mallorca 2026 — Por zonas y tipo de viaje',
      en: 'Where to Stay in Mallorca 2026 — By Zone and Travel Type',
      de: 'Wo übernachten auf Mallorca 2026 — Nach Lage und Reiseart',
    },
    intent: {
      es: 'donde alojarse en mallorca, mejores zonas para dormir mallorca, donde quedarse mallorca 2026',
      en: 'where to stay in mallorca 2026, best areas to stay mallorca',
      de: 'wo übernachten Mallorca 2026, beste Gegend Mallorca',
    },
  },
  {
    tier: 3,
    slug: 'mejores-brunch-mallorca',
    category: 'cafe',
    minRating: 4.3,
    minReviews: 30,
    limit: 10,
    titles: {
      es: 'Mejores brunch en Mallorca 2026',
      en: 'Best Brunch in Mallorca 2026',
      de: 'Bester Brunch auf Mallorca 2026',
    },
    intent: {
      es: 'brunch mallorca, mejores brunch palma mallorca 2026',
      en: 'best brunch mallorca 2026, brunch palma mallorca',
      de: 'bester Brunch Mallorca 2026, Brunch Palma',
    },
  },
  {
    // Excursion businesses hidden — pure informational
    tier: 3,
    slug: 'mejores-excursiones-mallorca',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Mejores excursiones en Mallorca 2026 — Guía práctica',
      en: 'Best Excursions in Mallorca 2026 — Practical Guide',
      de: 'Die besten Ausflüge auf Mallorca 2026 — Praktischer Guide',
    },
    intent: {
      es: 'excursiones mallorca, mejores excursiones mallorca 2026, tours mallorca dia completo',
      en: 'best excursions mallorca 2026, day trips mallorca, tours mallorca',
      de: 'beste Ausflüge Mallorca 2026, Tagesausflüge Mallorca, Tours Mallorca',
    },
  },
  {
    tier: 3,
    slug: 'rent-a-car-mallorca',
    category: 'rent-a-car',
    minRating: 3.8,
    minReviews: 200,
    limit: 10,
    titles: {
      es: 'Mejor rent a car en Mallorca 2026 — Cómo elegir bien',
      en: 'Best Car Rental in Mallorca 2026 — How to Choose',
      de: 'Bester Mietwagen auf Mallorca 2026 — So wählt man richtig',
    },
    intent: {
      es: 'rent a car mallorca, alquiler coche mallorca 2026, mejor coche alquiler mallorca, seguro coche mallorca',
      en: 'car rental mallorca 2026, best rent a car mallorca, car hire insurance mallorca',
      de: 'Mietwagen Mallorca 2026, Auto mieten Mallorca, Versicherung Mietwagen Mallorca',
    },
  },
  // — New expat/nomad practical guides —
  {
    tier: 3,
    slug: 'medico-dentista-mallorca-extranjero',
    category: 'healthcare',
    minRating: 4.0,
    minReviews: 20,
    limit: 8,
    minBusinesses: 0,
    titles: {
      es: 'Médicos y dentistas en Mallorca para extranjeros 2026',
      en: 'Finding a Doctor or Dentist in Mallorca as a Foreigner 2026',
      de: 'Arzt und Zahnarzt auf Mallorca als Ausländer finden 2026',
    },
    intent: {
      es: 'medico extranjeros mallorca, dentista mallorca ingles, sanidad privada mallorca expat, clinica privada palma',
      en: 'doctor mallorca english speaking, dentist mallorca expat, private healthcare mallorca 2026, clinic palma english',
      de: 'Arzt Mallorca Englisch, Zahnarzt Mallorca Ausländer, Krankenversicherung Mallorca, Privatklinik Palma',
    },
  },
  {
    tier: 3,
    slug: 'comprar-coche-mallorca-expat',
    category: 'car-dealer',
    minRating: 3.9,
    minReviews: 15,
    limit: 6,
    minBusinesses: 0,
    titles: {
      es: 'Comprar coche en Mallorca — Guía para residentes y expats 2026',
      en: 'Buying a Car in Mallorca — Guide for Residents and Expats 2026',
      de: 'Auto kaufen auf Mallorca — Guide für Expats und Einwohner 2026',
    },
    intent: {
      es: 'comprar coche mallorca, coche segunda mano mallorca expat, concesionario mallorca 2026, matricular coche mallorca',
      en: 'buying a car in mallorca 2026, second hand car mallorca expat, car dealer mallorca, register car mallorca',
      de: 'Auto kaufen Mallorca 2026, Gebrauchtwagen Mallorca, Autohändler Mallorca, Auto anmelden Mallorca',
    },
  },
  {
    // Pure informational — neighborhood guide for expats
    tier: 3,
    slug: 'barrios-palma-donde-vivir',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Barrios de Palma para vivir — Comparativa por perfil 2026',
      en: 'Best Neighborhoods in Palma to Live In — By Profile 2026',
      de: 'Beste Viertel in Palma zum Leben — nach Profil 2026',
    },
    intent: {
      es: 'barrios palma mallorca vivir, donde vivir palma expat, mejores zonas palma residentes 2026, palma barrios comparativa',
      en: 'best neighborhoods palma mallorca to live, where to live palma expat 2026, palma neighborhoods comparison',
      de: 'beste Viertel Palma Mallorca wohnen, wo leben Palma Mallorca 2026, Wohnviertel Palma',
    },
  },
  {
    tier: 3,
    slug: 'inmobiliarias-mallorca-expat',
    category: 'real-estate',
    minRating: 3.9,
    minReviews: 8,
    limit: 8,
    minBusinesses: 0,
    titles: {
      es: 'Inmobiliarias en Mallorca para extranjeros — Guía 2026',
      en: 'Real Estate Agencies in Mallorca for Expats — Guide 2026',
      de: 'Immobilienmakler Mallorca für Ausländer — Guide 2026',
    },
    intent: {
      es: 'inmobiliaria mallorca extranjeros, agencia inmobiliaria mallorca expat, comprar alquilar mallorca 2026, piso mallorca extranjero',
      en: 'real estate agency mallorca expat 2026, buy property mallorca foreigner, apartment mallorca expat',
      de: 'Immobilienmakler Mallorca Ausländer 2026, Immobilien kaufen Mallorca, Wohnung Mallorca Ausländer',
    },
  },
  {
    tier: 3,
    slug: 'gimnasios-palma-mallorca',
    category: 'gym',
    city: 'Palma',
    minRating: 4.0,
    minReviews: 20,
    limit: 8,
    titles: {
      es: 'Mejores gimnasios en Palma de Mallorca 2026',
      en: 'Best Gyms in Palma de Mallorca 2026',
      de: 'Beste Fitnessstudios in Palma de Mallorca 2026',
    },
    intent: {
      es: 'gimnasios palma mallorca, gym palma 2026, crossfit pilates yoga palma, gimnasio expat palma',
      en: 'gyms palma mallorca 2026, fitness center palma, crossfit mallorca, gym expat palma',
      de: 'Fitnessstudio Palma Mallorca 2026, Gym Palma Mallorca, CrossFit Palma',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // TIER 4 — GEO pure / conversational — mostly web-search-driven
  // minBusinesses: 0 = generates even with no business data
  // ══════════════════════════════════════════════════════════════════════════════

  {
    tier: 4,
    slug: 'cuanto-cuesta-alquilar-barco-mallorca',
    category: 'boat-rental',
    minRating: 4.3,
    minReviews: 20,
    limit: 8,
    minBusinesses: 0,
    titles: {
      es: 'Cuánto cuesta alquilar un barco en Mallorca 2026',
      en: 'How Much Does It Cost to Rent a Boat in Mallorca 2026',
      de: 'Was kostet ein Bootsverleih auf Mallorca 2026',
    },
    intent: {
      es: 'cuanto cuesta alquilar barco mallorca, precio barco mallorca, alquiler barco con patron precio',
      en: 'how much does boat rental cost mallorca 2026, boat hire prices mallorca',
      de: 'Kosten Bootsverleih Mallorca 2026, Preise Boot mieten Mallorca',
    },
  },
  {
    tier: 4,
    slug: 'mejores-playas-familias-mallorca',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Mejores playas para familias en Mallorca 2026',
      en: 'Best Family Beaches in Mallorca 2026',
      de: 'Beste Familienstrände Mallorca 2026',
    },
    intent: {
      es: 'playas para familias mallorca, playas con niños mallorca, mejores playas tranquilas mallorca 2026',
      en: 'best family beaches mallorca 2026, beaches with kids mallorca calm',
      de: 'Familienstrände Mallorca 2026, beste Strände mit Kindern Mallorca',
    },
  },
  {
    tier: 4,
    slug: 'mallorca-turistas-cuando-menos-hay',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Cuándo hay menos turistas en Mallorca — Por mes y zona',
      en: 'When Are There Fewer Tourists in Mallorca — By Month',
      de: 'Wann gibt es weniger Touristen auf Mallorca — Nach Monat',
    },
    intent: {
      es: 'cuando hay menos turistas mallorca, mallorca temporada baja, mallorca fuera de temporada',
      en: 'when are there fewer tourists in mallorca, mallorca off season, quiet mallorca',
      de: 'Mallorca Nebensaison, wann weniger Touristen Mallorca',
    },
  },
  {
    tier: 4,
    slug: 'que-comer-mallorca-tipico',
    category: 'restaurant',
    minRating: 4.4,
    minReviews: 80,
    limit: 8,
    minBusinesses: 0,
    titles: {
      es: 'Qué comer en Mallorca — Los platos típicos que no te puedes perder',
      en: 'What to Eat in Mallorca — Traditional Food You Must Try',
      de: 'Was essen auf Mallorca — Typische Gerichte die man probieren muss',
    },
    intent: {
      es: 'que comer en mallorca, comida tipica mallorca, platos tipicos mallorca, gastronomia mallorca',
      en: 'what to eat in mallorca, typical food mallorca, traditional mallorca dishes',
      de: 'was essen Mallorca, typische Gerichte Mallorca, mallorquinische Küche',
    },
  },
  {
    tier: 4,
    slug: 'pa-amb-oli-mallorca-donde-comer',
    category: 'restaurant',
    minRating: 4.3,
    minReviews: 50,
    limit: 8,
    minBusinesses: 0,
    titles: {
      es: 'Pa amb oli en Mallorca — Dónde comerlo de verdad',
      en: 'Pa amb oli in Mallorca — Where to Eat It Properly',
      de: 'Pa amb oli Mallorca — Wo man es richtig isst',
    },
    intent: {
      es: 'pa amb oli mallorca, donde comer pa amb oli mallorca, mejor pa amb oli palma',
      en: 'pa amb oli mallorca where to eat, best pa amb oli palma mallorca',
      de: 'Pa amb oli Mallorca, wo Pa amb oli essen Mallorca',
    },
  },
  {
    tier: 4,
    slug: 'ensaimada-mallorca-mejores-pastelerias',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Ensaimada en Mallorca — Las mejores pastelerías 2026',
      en: 'Best Ensaimada in Mallorca — Top Bakeries 2026',
      de: 'Beste Ensaimada auf Mallorca — Top Bäckereien 2026',
    },
    intent: {
      es: 'mejor ensaimada mallorca, pastelerias ensaimada mallorca, donde comprar ensaimada mallorca 2026',
      en: 'best ensaimada mallorca, where to buy ensaimada mallorca 2026',
      de: 'beste Ensaimada Mallorca 2026, wo Ensaimada kaufen Mallorca',
    },
  },
  {
    tier: 4,
    slug: 'senderismo-tramuntana-mallorca',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Senderismo en la Serra de Tramuntana — Las mejores rutas 2026',
      en: 'Hiking in Serra de Tramuntana Mallorca 2026',
      de: 'Wandern Serra de Tramuntana Mallorca 2026',
    },
    intent: {
      es: 'senderismo tramuntana mallorca, rutas senderismo mallorca, hiking mallorca tramuntana 2026',
      en: 'hiking serra de tramuntana mallorca 2026, best hikes mallorca tramuntana',
      de: 'Wandern Tramuntana Mallorca 2026, Wanderwege Serra de Tramuntana',
    },
  },
  {
    tier: 4,
    slug: 'mercados-mallorca',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Mercados de Mallorca 2026 — Los mejores por zona y día',
      en: 'Markets in Mallorca 2026 — The Best by Zone and Day',
      de: 'Märkte auf Mallorca 2026 — Die besten nach Lage und Tag',
    },
    intent: {
      es: 'mercados mallorca, mercadillos mallorca, mercados artesania mallorca 2026',
      en: 'markets in mallorca 2026, craft markets mallorca, weekly markets mallorca',
      de: 'Märkte Mallorca 2026, Wochenmärkte Mallorca, Kunsthandwerk Mallorca',
    },
  },
  {
    tier: 4,
    slug: 'mallorca-en-moto-ruta',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Mallorca en moto 2026 — Las mejores rutas y consejos prácticos',
      en: 'Mallorca by Motorcycle 2026 — Best Routes and Tips',
      de: 'Mallorca mit dem Motorrad 2026 — Die besten Routen',
    },
    intent: {
      es: 'mallorca en moto, rutas moto mallorca, mallorca moto 2026 consejos',
      en: 'mallorca by motorcycle 2026, motorcycle routes mallorca, riding in mallorca',
      de: 'Mallorca mit Motorrad 2026, Motorradrouten Mallorca',
    },
  },
  // — New expat/nomad GEO guides —
  {
    tier: 4,
    slug: 'nie-mallorca-como-tramitar',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'NIE en Mallorca — Cómo tramitarlo paso a paso 2026',
      en: 'How to Get Your NIE in Mallorca 2026 — Step by Step',
      de: 'NIE auf Mallorca beantragen — Schritt für Schritt 2026',
    },
    intent: {
      es: 'nie mallorca, como sacar nie mallorca 2026, tramitar nie palma mallorca, nie numero extranjero',
      en: 'how to get nie mallorca 2026, nie application mallorca, nie number spain foreigners mallorca',
      de: 'NIE Mallorca beantragen 2026, NIE Nummer Spanien Mallorca, Ausländeridentifikationsnummer Mallorca',
    },
  },
  {
    tier: 4,
    slug: 'cuanto-cuesta-vivir-mallorca-2026',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Cuánto cuesta vivir en Mallorca 2026 — Guía de costes reales',
      en: 'Cost of Living in Mallorca 2026 — Real Expenses Guide',
      de: 'Lebenshaltungskosten Mallorca 2026 — Reale Ausgaben Guide',
    },
    intent: {
      es: 'cuanto cuesta vivir mallorca, coste vida mallorca 2026, precio alquiler palma mallorca, gastos mensuales mallorca',
      en: 'cost of living mallorca 2026, living expenses mallorca, rent prices palma mallorca, monthly costs mallorca',
      de: 'Lebenshaltungskosten Mallorca 2026, Mietpreise Palma Mallorca, monatliche Kosten Mallorca',
    },
  },
  {
    tier: 4,
    slug: 'alquilar-piso-mallorca-extranjero',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Alquilar piso en Mallorca siendo extranjero — Lo que debes saber',
      en: 'Renting a Flat in Mallorca as a Foreigner — What You Need to Know',
      de: 'Wohnung mieten auf Mallorca als Ausländer — Was man wissen muss',
    },
    intent: {
      es: 'alquilar piso mallorca extranjero, alquiler palma mallorca expat, como alquilar casa mallorca 2026, contrato alquiler mallorca',
      en: 'renting flat mallorca foreigner, apartment rental mallorca expat 2026, rental contract mallorca',
      de: 'Wohnung mieten Mallorca Ausländer 2026, Wohnungsmiete Palma Mallorca, Mietvertrag Mallorca',
    },
  },
  {
    tier: 4,
    slug: 'seguro-medico-mallorca-expat',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Seguro médico en Mallorca para extranjeros — Qué opciones hay 2026',
      en: 'Health Insurance in Mallorca for Expats — Your Options 2026',
      de: 'Krankenversicherung auf Mallorca für Ausländer — Optionen 2026',
    },
    intent: {
      es: 'seguro medico mallorca extranjero, sanidad mallorca expat, mutua privada mallorca 2026, seguro salud mallorca',
      en: 'health insurance mallorca expat 2026, private health insurance mallorca foreigner, sanitas mallorca',
      de: 'Krankenversicherung Mallorca Ausländer 2026, private Krankenversicherung Mallorca',
    },
  },
  {
    tier: 4,
    slug: 'internet-movil-mallorca-extranjero',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Internet y móvil en Mallorca para extranjeros — Guía 2026',
      en: 'Internet and Mobile Plans in Mallorca for Expats — Guide 2026',
      de: 'Internet und Mobilfunk auf Mallorca für Ausländer 2026',
    },
    intent: {
      es: 'internet mallorca extranjero, tarjeta sim mallorca, mejor operador mallorca 2026, fibra optica palma',
      en: 'internet mallorca expat, sim card mallorca 2026, mobile plan mallorca foreigner, fibre optic palma',
      de: 'Internet Mallorca Ausländer, SIM-Karte Mallorca 2026, Handyvertrag Mallorca, Glasfaser Palma',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // TIER 1 — Business interest + GEO gap (added jul 2026)
  // Inmobiliarias + authentic local content missing from original catalog
  // ══════════════════════════════════════════════════════════════════════════════

  {
    tier: 1,
    slug: 'comprar-propiedad-mallorca-extranjero',
    category: 'real-estate',
    minRating: 3.9,
    minReviews: 8,
    limit: 6,
    minBusinesses: 0,
    titles: {
      es: 'Comprar propiedad en Mallorca siendo extranjero — Guía paso a paso 2026',
      en: 'Buying Property in Mallorca as a Foreigner — Step by Step Guide 2026',
      de: 'Immobilien kaufen auf Mallorca als Ausländer — Schritt für Schritt 2026',
    },
    intent: {
      es: 'comprar piso mallorca extranjero, comprar casa mallorca no residente, proceso compra propiedad mallorca 2026, impuestos compra mallorca',
      en: 'buying property in mallorca as a foreigner 2026, how to buy a house in mallorca non resident, property purchase process mallorca, taxes buying mallorca',
      de: 'Immobilien kaufen Mallorca als Ausländer 2026, Haus kaufen Mallorca Nicht-Residenten, Kaufprozess Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'impuestos-compra-propiedad-mallorca',
    limit: 0,
    minBusinesses: 0,
    titles: {
      es: 'Impuestos y gastos al comprar propiedad en Mallorca 2026 — Lo que nadie te dice',
      en: 'Property Taxes and Costs When Buying in Mallorca 2026 — What Foreigners Need to Know',
      de: 'Steuern und Kosten beim Immobilienkauf auf Mallorca 2026 — Was Ausländer wissen müssen',
    },
    intent: {
      es: 'impuestos compra propiedad mallorca, gastos compraventa mallorca 2026, ITP mallorca extranjero, notario gestor mallorca compra',
      en: 'property taxes mallorca foreigner 2026, buying costs mallorca, ITP tax mallorca, notary fees mallorca property purchase',
      de: 'Steuern Immobilienkauf Mallorca 2026, Kaufnebenkosten Mallorca, ITP Mallorca Ausländer, Notarkosten Mallorca',
    },
  },
  {
    tier: 1,
    slug: 'restaurantes-autenticos-palma-locales',
    category: 'restaurant',
    city: 'Palma',
    minRating: 4.3,
    minReviews: 50,
    limit: 10,
    titles: {
      es: 'Dónde comen los mallorquines de verdad en Palma — Sin trampas turísticas',
      en: 'Where Locals Actually Eat in Palma Mallorca — No Tourist Traps',
      de: 'Wo die Einheimischen in Palma wirklich essen — Keine Touristenfallen',
    },
    intent: {
      es: 'donde comen los mallorquines palma, restaurantes locales palma mallorca, sin trampa turistica palma, autentico palma mallorca',
      en: 'where locals eat palma mallorca, authentic restaurants palma no tourist traps, local food palma mallorca 2026',
      de: 'wo essen Einheimische Palma Mallorca, authentische Restaurants Palma, keine Touristenfallen Palma',
    },
  },
  {
    tier: 1,
    slug: 'charter-barco-sin-patron-requisitos',
    category: 'boat-rental',
    minRating: 4.3,
    minReviews: 20,
    limit: 8,
    minBusinesses: 0,
    titles: {
      es: 'Alquilar barco sin patrón en Mallorca — Requisitos legales 2026',
      en: 'Renting a Boat Without a Skipper in Mallorca — Legal Requirements 2026',
      de: 'Boot ohne Skipper mieten auf Mallorca — Rechtliche Anforderungen 2026',
    },
    intent: {
      es: 'alquilar barco sin patron mallorca, requisitos alquiler barco sin licencia mallorca, que licencia necesito alquilar barco mallorca 2026',
      en: 'renting a boat without skipper mallorca 2026, boat hire no licence mallorca legal, what licence do i need to rent a boat mallorca',
      de: 'Boot mieten ohne Skipper Mallorca 2026, Bootsverleih ohne Lizenz Mallorca legal, welchen Führerschein brauche ich Mallorca Boot',
    },
  },
]
