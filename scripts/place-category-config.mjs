export const PLACE_CATEGORY_CONFIGS = {
  bars: {
    businessCategory: "bar",
    singular: "bar",
    output: "data/import-previews/bars-preview.json",
    image: "/images/bar.svg",
    minRating: 4.0,
    minReviews: 30,
    searches: [
      // Palma — por tipo
      "best bars in Palma Mallorca",
      "cocktail bars Palma Mallorca",
      "tapas bars Palma Mallorca",
      "rooftop bars Palma Mallorca",
      "live music bars Palma Mallorca",
      "sports bars Palma Mallorca",
      "wine bars Palma Mallorca",
      "gin tonic bar Palma Mallorca",
      "shisha bar Palma Mallorca",
      "beach bars Palma Mallorca",

      // Palma — en español
      "bares de tapas Palma Mallorca",
      "coctelerías Palma Mallorca",
      "terrazas de copas Palma Mallorca",
      "bares de vinos Palma Mallorca",
      "bares de gin tonic Palma Mallorca",
      "vermut Palma Mallorca",
      "bares con música en directo Palma Mallorca",
      "bares con terraza Palma Mallorca",
      "bares nocturnos Palma Mallorca",
      "bar de copas Palma Mallorca",
      "terrazas Palma Mallorca",

      // Palma — por barrio
      "bars in Santa Catalina Palma",
      "bars in La Lonja Palma Mallorca",
      "bars in Old Town Palma Mallorca",
      "bars in Portixol Palma Mallorca",
      "bars in El Terreno Palma Mallorca",
      "bars in Playa de Palma Mallorca",
      "bars in Paseo Maritimo Palma Mallorca",

      // Tramuntana
      "bars in Soller Mallorca",
      "bars in Port de Soller Mallorca",
      "bars in Valldemossa Mallorca",
      "bars in Deia Mallorca",
      "bars in Fornalutx Mallorca",
      "bars in Banyalbufar Mallorca",

      // Norte
      "bars in Alcudia Mallorca",
      "bars in Port d'Alcudia Mallorca",
      "bars in Pollenca Mallorca",
      "bars in Port de Pollenca Mallorca",
      "bars in Can Picafort Mallorca",
      "bars in Playa de Muro Mallorca",

      // Este
      "bars in Cala Millor Mallorca",
      "bars in Cala Ratjada Mallorca",
      "bars in Porto Cristo Mallorca",
      "bars in Cala Bona Mallorca",
      "bars in Canyamel Mallorca",

      // Sureste
      "bars in Cala d'Or Mallorca",
      "bars in Portocolom Mallorca",
      "bars in Santanyi Mallorca",
      "bars in Cala Figuera Mallorca",
      "bars in Colonia de Sant Jordi Mallorca",
      "bars in Ses Salines Mallorca",

      // Sur y suroeste
      "bars in Santa Ponsa Mallorca",
      "bars in Palmanova Mallorca",
      "bars in Magaluf Mallorca",
      "bars in Peguera Mallorca",
      "bars in Port d'Andratx Mallorca",
      "bars in Camp de Mar Mallorca",
      "bars in S'Arenal Mallorca",

      // Interior
      "bars in Manacor Mallorca",
      "bars in Inca Mallorca",
      "bars in Binissalem Mallorca",
      "bars in Sineu Mallorca",
      "bars in Llucmajor Mallorca",

      // General — en español
      "bares con vistas Mallorca",
      "bares en la playa Mallorca",
      "bares de ambiente Mallorca",
      "mejores bares Mallorca"
    ]
  },

  cafes: {
    businessCategory: "cafe",
    singular: "cafeteria",
    output: "data/import-previews/cafes-preview.json",
    image: "/images/cafe.svg",
    minRating: 4.2,
    minReviews: 20,
    searches: [
      // Palma — en inglés por tipo
      "best cafes Palma Mallorca",
      "specialty coffee Palma Mallorca",
      "brunch cafes Palma Mallorca",
      "breakfast cafe Palma Mallorca",
      "coffee shops Palma Mallorca",
      "third wave coffee Palma Mallorca",
      "healthy brunch Palma Mallorca",
      "cake and coffee Palma Mallorca",

      // Palma — en español
      "cafeterías Palma Mallorca",
      "desayunos en Palma Mallorca",
      "café con terraza Palma Mallorca",
      "cafetería con encanto Palma Mallorca",
      "brunch en Palma Mallorca",
      "meriendas Palma Mallorca",
      "café de especialidad Palma Mallorca",
      "heladerías Palma Mallorca",
      "pastelerías y cafés Palma Mallorca",
      "cafetería tranquila Palma Mallorca",
      "desayuno saludable Palma Mallorca",

      // Palma — por barrio
      "cafes in Santa Catalina Palma",
      "cafes in Old Town Palma Mallorca",
      "cafes in La Lonja Palma Mallorca",
      "cafes in Portixol Palma Mallorca",
      "cafes in El Molinar Palma Mallorca",
      "cafes in Playa de Palma Mallorca",

      // Tramuntana
      "cafes in Soller Mallorca",
      "cafes in Port de Soller Mallorca",
      "cafes in Valldemossa Mallorca",
      "cafes in Deia Mallorca",
      "cafes in Fornalutx Mallorca",
      "cafes in Banyalbufar Mallorca",
      "cafes in Esporles Mallorca",

      // Norte
      "cafes in Pollenca Mallorca",
      "cafes in Port de Pollenca Mallorca",
      "cafes in Alcudia Mallorca",
      "cafes in Port d'Alcudia Mallorca",
      "cafes in Can Picafort Mallorca",
      "cafes in Playa de Muro Mallorca",

      // Este
      "cafes in Cala Millor Mallorca",
      "cafes in Cala Ratjada Mallorca",
      "cafes in Porto Cristo Mallorca",
      "cafes in S'Illot Mallorca",

      // Sureste
      "cafes in Cala d'Or Mallorca",
      "cafes in Portocolom Mallorca",
      "cafes in Santanyi Mallorca",
      "cafes in Campos Mallorca",
      "cafes in Ses Salines Mallorca",
      "cafes in Felanitx Mallorca",

      // Sur y suroeste
      "cafes in Santa Ponsa Mallorca",
      "cafes in Palmanova Mallorca",
      "cafes in Peguera Mallorca",
      "cafes in Andratx Mallorca",
      "cafes in S'Arenal Mallorca",

      // Interior
      "cafes in Manacor Mallorca",
      "cafes in Inca Mallorca",
      "cafes in Binissalem Mallorca",
      "cafes in Sineu Mallorca",
      "cafes in Santa Maria del Cami Mallorca",
      "cafes in Llucmajor Mallorca",
      "cafes in Campos Mallorca",

      // General
      "cafes with sea view Mallorca",
      "cafeterías con encanto Mallorca",
      "breakfast Mallorca"
    ]
  },

  nightlife: {
    businessCategory: "nightlife",
    singular: "nightlife venue",
    output: "data/import-previews/nightlife-preview.json",
    image: "/images/activity.svg",
    minRating: 3.8,
    minReviews: 100,
    searches: [
      "nightclubs Mallorca",
      "best clubs Mallorca",
      "nightlife Mallorca",
      "clubs Palma Mallorca",
      "nightlife Palma Mallorca",
      "discotecas Mallorca",
      "discotecas Palma Mallorca",
      "clubs Santa Catalina Palma",
      "clubs Paseo Maritimo Palma",
      "clubs Playa de Palma Mallorca",
      "nightlife Playa de Palma Mallorca",
      "clubs Magaluf Mallorca",
      "nightlife Magaluf Mallorca",
      "clubs Palmanova Mallorca",
      "clubs Santa Ponsa Mallorca",
      "clubs Cala Ratjada Mallorca",
      "nightlife Cala Ratjada Mallorca",
      "clubs Alcudia Mallorca",
      "clubs Port d'Alcudia Mallorca",
      "clubs Cala d'Or Mallorca",
      "beach party Mallorca",
      "live music club Mallorca",
      "late night bar Mallorca",
      "Diskothek Mallorca",
      "Nachtclub Mallorca",
      "Party Mallorca",
      "Clubs auf Mallorca",
      "Ausgehen Mallorca",
      "Nachtleben Palma Mallorca"
    ]
  },

  "car-dealers": {
    businessCategory: "car-dealer",
    singular: "car dealer",
    output: "data/import-previews/car-dealers-preview.json",
    image: "/images/placeholder.svg",
    minRating: 3.9,
    minReviews: 15,
    searches: [
      "used car dealer Mallorca",
      "car dealer Mallorca",
      "second hand cars Mallorca",
      "buy used car Mallorca",
      "coches segunda mano Mallorca",
      "compraventa coches Mallorca",
      "concesionario coches Mallorca",
      "coches ocasion Mallorca",
      "venta coches usados Palma Mallorca",
      "concesionario Palma Mallorca",
      "car dealer Palma Mallorca",
      "used cars Palma Mallorca",
      "car dealer Calvia Mallorca",
      "car dealer Manacor Mallorca",
      "car dealer Inca Mallorca",
      "car dealer Llucmajor Mallorca",
      "Autohandler Mallorca",
      "Gebrauchtwagen Mallorca",
      "Auto kaufen Mallorca",
      "Autoverkauf Mallorca"
    ]
  },

  healthcare: {
    businessCategory: "healthcare",
    singular: "clinic or healthcare provider",
    output: "data/import-previews/healthcare-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.0,
    minReviews: 8,
    searches: [
      "best private clinics Mallorca",
      "best clinics Mallorca",
      "top medical center Mallorca",
      "best doctors Mallorca",
      "best dentists Mallorca",
      "best dental clinic Mallorca",
      "best private hospital Mallorca",
      "best physiotherapy clinic Mallorca",
      "best medical specialists Mallorca",
      "private clinic Palma Mallorca",
      "medical center Palma Mallorca",
      "dentist Palma Mallorca",
      "dental clinic Palma Mallorca",
      "doctor Palma Mallorca",
      "private hospital Palma Mallorca",
      "clinica privada Mallorca",
      "clinica medica Mallorca",
      "centro medico Mallorca",
      "medico Mallorca",
      "dentista Mallorca",
      "clinica dental Mallorca",
      "hospital privado Mallorca",
      "fisioterapia Mallorca",
      "especialista medico Mallorca",
      "private doctor Mallorca",
      "emergency doctor Mallorca",
      "24h doctor Mallorca",
      "international clinic Mallorca",
      "English speaking doctor Mallorca",
      "English speaking dentist Mallorca",
      "German doctor Mallorca",
      "German dentist Mallorca",
      "arzt Mallorca deutsch",
      "deutscher Arzt Mallorca",
      "Zahnarzt Mallorca deutsch"
    ]
  },

  "real-estate": {
    businessCategory: "real-estate",
    singular: "real estate agency",
    output: "data/import-previews/real-estate-preview.json",
    image: "/images/placeholder.svg",
    minRating: 3.9,
    minReviews: 8,
    blockedTypes: [
      "jewelry_store",
      "clothing_store",
      "furniture_store",
      "home_goods_store",
      "grocery_store",
      "supermarket",
      "restaurant",
      "food",
      "store"
    ],
    searches: [
      "best real estate agencies Mallorca",
      "top real estate agencies Mallorca",
      "real estate agency Mallorca",
      "estate agents Mallorca",
      "property agency Mallorca",
      "inmobiliaria Mallorca",
      "agencia inmobiliaria Mallorca",
      "mejores inmobiliarias Mallorca",
      "mejores agencias inmobiliarias Mallorca",
      "real estate agency Palma Mallorca",
      "estate agents Palma Mallorca",
      "inmobiliaria Palma Mallorca",
      "agencia inmobiliaria Palma Mallorca",
      "best real estate agencies Palma Mallorca",
      "real estate agency Port d'Andratx Mallorca",
      "real estate agency Puerto Portals Mallorca",
      "estate agents Santa Ponsa Mallorca",
      "real estate agency Santa Ponsa Mallorca",
      "estate agents Puerto Portals Mallorca",
      "real estate agency Bendinat Mallorca",
      "real estate agency Portals Nous Mallorca",
      "estate agents Pollenca Mallorca",
      "estate agents Port de Pollenca Mallorca",
      "real estate Alcudia Mallorca",
      "real estate Soller Mallorca",
      "real estate Deia Mallorca",
      "real estate Santanyi Mallorca",
      "real estate Cala d'Or Mallorca",
      "real estate Manacor Mallorca",
      "real estate Inca Mallorca",
      "luxury real estate Mallorca",
      "buy property Mallorca",
      "comprar casa Mallorca",
      "Immobilienmakler Mallorca",
      "Immobilien Mallorca",
      "Immobilienmakler Palma Mallorca",
      "Haus kaufen Mallorca"
    ]
  },

  bakeries: {
    businessCategory: "bakery",
    singular: "horno o pasteleria",
    output: "data/import-previews/bakeries-preview.json",
    image: "/images/bakery.svg",
    minRating: 4.1,
    minReviews: 15,
    searches: [
      // Palma — en inglés
      "best bakeries Palma Mallorca",
      "artisan bakery Palma Mallorca",
      "cake shop Palma Mallorca",
      "pastry shop Palma Mallorca",
      "sourdough bakery Palma Mallorca",
      "croissants Palma Mallorca",
      "patisserie Palma Mallorca",

      // Palma — en español
      "pastelerías Palma Mallorca",
      "pastelerías artesanales Palma Mallorca",
      "panaderías artesanales Palma Mallorca",
      "panaderías Palma Mallorca",
      "hornos Palma Mallorca",
      "forn Palma Mallorca",
      "ensaimaderías Palma Mallorca",
      "ensaimada Palma Mallorca",
      "repostería artesanal Palma Mallorca",
      "bollería artesanal Palma Mallorca",

      // Palma — por barrio
      "bakeries in Santa Catalina Palma",
      "bakeries in Old Town Palma Mallorca",
      "bakeries in La Lonja Palma Mallorca",

      // Tramuntana
      "bakeries in Soller Mallorca",
      "bakeries in Port de Soller Mallorca",
      "bakeries in Valldemossa Mallorca",
      "bakeries in Deia Mallorca",
      "forn Soller Mallorca",
      "pasteleria Valldemossa Mallorca",

      // Norte
      "bakeries in Alcudia Mallorca",
      "bakeries in Port d'Alcudia Mallorca",
      "bakeries in Pollenca Mallorca",
      "bakeries in Port de Pollenca Mallorca",
      "bakeries in Can Picafort Mallorca",
      "forn Alcudia Mallorca",
      "ensaimada Pollenca Mallorca",

      // Este
      "bakeries in Cala Millor Mallorca",
      "bakeries in Cala Ratjada Mallorca",
      "bakeries in Manacor Mallorca",
      "bakeries in Porto Cristo Mallorca",

      // Sureste
      "bakeries in Santanyi Mallorca",
      "bakeries in Campos Mallorca",
      "bakeries in Ses Salines Mallorca",
      "bakeries in Cala d'Or Mallorca",
      "bakeries in Felanitx Mallorca",
      "forn Santanyi Mallorca",

      // Sur y suroeste
      "bakeries in Santa Ponsa Mallorca",
      "bakeries in Palmanova Mallorca",
      "bakeries in Peguera Mallorca",
      "bakeries in Andratx Mallorca",
      "bakeries in Llucmajor Mallorca",

      // Interior — el corazón de los hornos mallorquines
      "bakeries in Inca Mallorca",
      "bakeries in Sineu Mallorca",
      "bakeries in Binissalem Mallorca",
      "bakeries in Santa Maria del Cami Mallorca",
      "bakeries in Petra Mallorca",
      "bakeries in Montuiri Mallorca",
      "forn Inca Mallorca",
      "pasteleria Inca Mallorca",
      "ensaimada artesanal Mallorca",
      "coca de trampo Mallorca",
      "panellets Mallorca"
    ]
  },

  "rent-a-car": {
    businessCategory: "rent-a-car",
    singular: "alquiler de coches",
    output: "data/import-previews/rent-a-car-preview.json",
    image: "/images/placeholder.svg",
    minRating: 3.8,
    minReviews: 50,
    // Block anything that is clearly not car/moto rental: quads, tours, dealers, boats
    blockedTypes: [
      "bicycle_rental",
      "bicycle_store",
      "sporting_goods_store",
      "adventure_sports_center",
      "tour_agency",
      "travel_agency",
      "car_dealer",
      "car_repair",
      "boat_rental",
      "tourist_attraction",
      "amusement_park"
    ],
    // Block bike and quad rental companies Google classifies generically as "service"
    // "bike " / " bike" / "bikes" catches Bike Island, Paco's Rent A Bike, Clips Bikes
    // without catching "motorbike" (has no space around bike) or "e-bike" (caught by "e-bike")
    blockedNameKeywords: [
      "bicycle",
      "cycling",
      "ciclismo",
      "bike ",
      " bike",
      "bikes",
      "e-bike",
      "bicicleta",
      "biciclet",
      "bikeholiday",
      "quad",
      "buggy",
      "kids car"
    ],
    searches: [
      // Aeropuerto y Palma — en inglés
      "car rental Palma de Mallorca airport",
      "car hire Mallorca airport",
      "rent a car Palma Mallorca",
      "cheap car rental Mallorca",
      "premium car rental Mallorca",
      "local car rental Mallorca",
      "rent a car Palma city Mallorca",
      "luxury car rental Mallorca",
      "electric car rental Mallorca",

      // En español — coches y vehículos a motor
      "alquiler de coches Mallorca",
      "alquiler de coches Palma Mallorca",
      "alquiler de coches aeropuerto Mallorca",
      "alquiler de coches eléctricos Mallorca",
      "rent a car barato Mallorca",
      "alquiler de vehículos Mallorca",
      "alquiler sin tarjeta de crédito Mallorca",
      "coches de alquiler Mallorca",

      // Motos y scooters (sí son alquiler de vehículo, no bikes)
      "alquiler de motos Mallorca",
      "alquiler de moto Palma Mallorca",
      "alquiler de scooter Mallorca",
      "scooter rental Mallorca",
      "motorcycle rental Mallorca",
      "moped rental Mallorca",
      "motorbike rental Mallorca",

      // Por zona — solo coches
      "car rental Alcudia Mallorca",
      "car rental Port d'Alcudia Mallorca",
      "car rental Port de Pollenca Mallorca",
      "car rental Pollenca Mallorca",
      "car rental Cala Millor Mallorca",
      "car rental Cala Ratjada Mallorca",
      "car rental Porto Cristo Mallorca",
      "car rental Cala d'Or Mallorca",
      "car rental Portocolom Mallorca",
      "car rental Santa Ponsa Mallorca",
      "car rental Palmanova Mallorca",
      "car rental Magaluf Mallorca",
      "car rental Peguera Mallorca",
      "car rental Andratx Mallorca",
      "car rental Soller Mallorca",
      "car rental Manacor Mallorca",
      "car rental Inca Mallorca",
      "car rental Felanitx Mallorca"
    ]
  },

  spas: {
    businessCategory: "spa",
    singular: "spa",
    output: "data/import-previews/spas-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.2,
    minReviews: 15,
    // Block hotels, hair/nail salons, gyms, medical, restaurants, beaches
    blockedTypes: [
      "hotel",
      "resort_hotel",
      "lodging",
      "bed_and_breakfast",
      "motel",
      "hair_salon",
      "nail_salon",
      "barber_shop",
      "gym",
      "fitness_center",
      "restaurant",
      "food",
      "tourist_attraction",
      "natural_feature",
      "grocery_store",
      "store",
      "medical_clinic",
      "medical_center",
      "doctor",
      "dentist",
      "dental_clinic",
      "physiotherapist",
      "hospital",
      "skin_care_clinic"
    ],
    blockedNameKeywords: [
      "campus training"
    ],
    searches: [
      // Palma — en inglés
      "best spa Palma Mallorca",
      "day spa Palma Mallorca",
      "luxury spa Palma Mallorca",
      "couples massage Palma Mallorca",
      "thai massage Palma Mallorca",
      "beauty spa Palma Mallorca",
      "wellness center Palma Mallorca",
      "massage therapy Palma Mallorca",
      "facial treatment Palma Mallorca",
      "relaxation spa Palma Mallorca",

      // Palma — en español
      "masajes Palma Mallorca",
      "masajes relajantes Palma Mallorca",
      "centro de bienestar Palma Mallorca",
      "balneario Palma Mallorca",
      "masaje tailandés Palma Mallorca",
      "tratamientos faciales Palma Mallorca",
      "spa de día Palma Mallorca",
      "masajes terapéuticos Palma Mallorca",
      "centro de estética Palma Mallorca",
      "masajes deportivos Palma Mallorca",
      "spa con piscina Palma Mallorca",
      "bienestar y salud Palma Mallorca",

      // Palma — por barrio
      "spa in Santa Catalina Palma",
      "spa in Old Town Palma Mallorca",

      // Tramuntana
      "spa in Soller Mallorca",
      "spa in Port de Soller Mallorca",
      "spa in Valldemossa Mallorca",
      "spa in Deia Mallorca",
      "spa in Fornalutx Mallorca",
      "wellness spa Tramuntana Mallorca",
      "masajes Soller Mallorca",
      "masajes Valldemossa Mallorca",

      // Norte
      "spa in Alcudia Mallorca",
      "spa in Port d'Alcudia Mallorca",
      "spa in Port de Pollenca Mallorca",
      "spa in Pollenca Mallorca",
      "spa in Can Picafort Mallorca",
      "masajes Alcudia Mallorca",

      // Este
      "spa in Cala Millor Mallorca",
      "spa in Cala Ratjada Mallorca",
      "spa in Canyamel Mallorca",
      "masajes Cala Millor Mallorca",

      // Sureste
      "spa in Cala d'Or Mallorca",
      "spa in Portocolom Mallorca",
      "spa in Santanyi Mallorca",
      "masajes Cala d'Or Mallorca",

      // Sur y suroeste
      "spa in Santa Ponsa Mallorca",
      "spa in Palmanova Mallorca",
      "spa in Magaluf Mallorca",
      "spa in Peguera Mallorca",
      "spa in Port d'Andratx Mallorca",
      "spa in Llucmajor Mallorca",
      "masajes Peguera Mallorca",

      // General (eliminado "hotel spa Mallorca" — traía 128 hoteles)
      "wellness spa Mallorca",
      "day spa Mallorca",
      "spa de lujo Mallorca",
      "masajes Mallorca",
      "thalassotherapy Mallorca",
      "hammam Mallorca"
    ]
  },

  gyms: {
    businessCategory: "gym",
    singular: "gimnasio",
    output: "data/import-previews/gyms-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.0,
    minReviews: 20,
    searches: [
      // Palma — en inglés por tipo
      "best gyms Palma Mallorca",
      "fitness center Palma Mallorca",
      "crossfit Palma Mallorca",
      "pilates studio Palma Mallorca",
      "yoga studio Palma Mallorca",
      "personal trainer Palma Mallorca",
      "boxing gym Palma Mallorca",
      "24 hour gym Palma Mallorca",
      "fitness club Palma Mallorca",
      "martial arts Palma Mallorca",
      "padel club Palma Mallorca",
      "swimming pool gym Palma Mallorca",
      "functional training Palma Mallorca",

      // Palma — en español
      "gimnasios Palma Mallorca",
      "centros deportivos Palma Mallorca",
      "clases de yoga Palma Mallorca",
      "clases de pilates Palma Mallorca",
      "entrenamiento funcional Palma Mallorca",
      "pádel Palma Mallorca",
      "fitness Palma Mallorca",
      "zumba Palma Mallorca",
      "musculación Palma Mallorca",
      "artes marciales Palma Mallorca",
      "spinning Palma Mallorca",
      "pilates reformer Palma Mallorca",
      "crossfit Mallorca",
      "entrenamiento personal Palma Mallorca",
      "boxeo Palma Mallorca",
      "piscina deportiva Palma Mallorca",

      // Norte
      "gym Alcudia Mallorca",
      "gym Port d'Alcudia Mallorca",
      "gym Port de Pollenca Mallorca",
      "gym Pollenca Mallorca",
      "gym Can Picafort Mallorca",
      "padel Alcudia Mallorca",
      "fitness Alcudia Mallorca",

      // Este
      "gym Manacor Mallorca",
      "gym Cala Millor Mallorca",
      "gym Cala Ratjada Mallorca",
      "gym Porto Cristo Mallorca",
      "padel Manacor Mallorca",

      // Sureste
      "gym Cala d'Or Mallorca",
      "gym Santanyi Mallorca",
      "gym Felanitx Mallorca",
      "padel Cala d'Or Mallorca",

      // Sur y suroeste
      "gym Santa Ponsa Mallorca",
      "gym Palmanova Mallorca",
      "gym Magaluf Mallorca",
      "gym Peguera Mallorca",
      "gym S'Arenal Mallorca",
      "gym Llucmajor Mallorca",
      "padel Santa Ponsa Mallorca",

      // Interior
      "gym Inca Mallorca",
      "gym Manacor Mallorca",
      "gym Soller Mallorca",
      "padel Inca Mallorca",
      "gimnasio Inca Mallorca",
      "gimnasio Manacor Mallorca",

      // General
      "yoga Mallorca",
      "pilates Mallorca",
      "padel Mallorca",
      "gimnasios Mallorca"
    ]
  },

  routes: {
    businessCategory: "route",
    singular: "ruta o mirador",
    output: "data/import-previews/routes-preview.json",
    image: "/images/activity.svg",
    minRating: 4.3,
    minReviews: 20,
    searches: [
      // General — en inglés
      "viewpoints Mallorca",
      "hiking trails Mallorca",
      "easy walks Mallorca",
      "scenic routes Mallorca",
      "coastal walks Mallorca",
      "family walks Mallorca",
      "nature walks Mallorca",
      "mountain trails Mallorca",
      "birdwatching Mallorca",

      // General — en español
      "rutas de senderismo Mallorca",
      "rutas de montaña Mallorca",
      "miradores Mallorca",
      "caminos Mallorca",
      "rutas fáciles Mallorca",
      "excursiones a pie Mallorca",
      "senderismo Mallorca",
      "paseos por la naturaleza Mallorca",
      "rutas circulares Mallorca",
      "rutas con vistas al mar Mallorca",
      "rutas para principiantes Mallorca",
      "paseos por la costa Mallorca",
      "rutas en familia Mallorca",
      "rutas con niños Mallorca",
      "caminatas Mallorca",

      // Tramuntana — la zona de senderismo principal
      "senderismo Serra de Tramuntana Mallorca",
      "hiking trails Soller Mallorca",
      "hiking trails Valldemossa Mallorca",
      "hiking trails Deia Mallorca",
      "hiking trails Pollenca Mallorca",
      "hiking trails Banyalbufar Mallorca",
      "hiking trails Esporles Mallorca",
      "mirador Soller Mallorca",
      "rutas Tramuntana Mallorca",
      "rutas Soller Mallorca",
      "rutas Valldemossa Mallorca",
      "rutas Deia Mallorca",

      // Tramuntana — rutas específicas conocidas
      "Barranc de Biniaraix Mallorca",
      "Torrent de Pareis route Mallorca",
      "Camino del Archiduque Mallorca",
      "Puig de Massanella Mallorca",
      "Sa Calobra trail Mallorca",
      "Puig Major Mallorca",

      // Norte
      "Cap de Formentor viewpoint Mallorca",
      "mirador Formentor Mallorca",
      "hiking trails Alcudia Mallorca",
      "hiking trails Formentor Mallorca",
      "routes Cap Pinar Mallorca",
      "routes Cala de Sant Vicenc Mallorca",
      "hiking Pollenca Mallorca",
      "rutas norte Mallorca",

      // Este
      "hiking trails Arta Mallorca",
      "hiking trails Capdepera Mallorca",
      "routes Punta de n'Amer Mallorca",
      "rutas Arta Mallorca",
      "Cala Varques trail Mallorca",
      "rutas este Mallorca",

      // Sureste y sur
      "routes Cala Mondrago Mallorca",
      "routes Es Trenc Mallorca",
      "coastal walk Colonia de Sant Jordi Mallorca",
      "Cap Blanc Mallorca",
      "rutas sur Mallorca",
      "rutas sureste Mallorca",

      // Palma y alrededores
      "routes near Palma Mallorca",
      "walks Palma Mallorca",
      "mirador Palma Mallorca",
      "rutas cerca Palma Mallorca",

      // Sunset y miradores
      "sunset viewpoints Mallorca",
      "mirador atardecer Mallorca",
      "best viewpoints Mallorca",
      "scenic drives Mallorca"
    ]
  },

  excursions: {
    businessCategory: "excursion",
    singular: "excursion",
    output: "data/import-previews/excursions-preview.json",
    image: "/images/activity.svg",
    minRating: 4.2,
    minReviews: 20,
    searches: [
      // General — en inglés
      "best excursions Mallorca",
      "guided tours Mallorca",
      "day trips Mallorca",
      "private tours Mallorca",
      "cultural tours Mallorca",
      "boat excursions Mallorca",
      "food tours Mallorca",
      "wine tours Mallorca",
      "nature tours Mallorca",
      "family excursions Mallorca",
      "adventure tours Mallorca",

      // General — en español
      "excursiones Mallorca",
      "tours guiados Mallorca",
      "excursiones de un día Mallorca",
      "tours privados Mallorca",
      "rutas culturales Mallorca",
      "excursiones en barco Mallorca",
      "tours gastronómicos Mallorca",
      "excursiones en familia Mallorca",
      "visitas guiadas Mallorca",
      "rutas en bici Mallorca",
      "excursiones en bicicleta Mallorca",
      "paseos en barco Mallorca",
      "excursiones organizadas Mallorca",
      "tours en Mallorca",

      // Palma
      "walking tours Palma Mallorca",
      "tours en Palma Mallorca",
      "old town tours Palma Mallorca",
      "cathedral tours Palma Mallorca",
      "food tours Palma Mallorca",
      "visitas guiadas Palma Mallorca",
      "tours a pie Palma Mallorca",
      "segway tours Palma Mallorca",

      // Tramuntana
      "Tramuntana tours Mallorca",
      "Soller tours Mallorca",
      "Valldemossa tours Mallorca",
      "Deia tours Mallorca",
      "rutas Tramuntana Mallorca",
      "tours tren de Soller Mallorca",

      // Norte
      "Formentor tours Mallorca",
      "Alcudia tours Mallorca",
      "tours norte Mallorca",

      // Enoturismo
      "wine tours Binissalem Mallorca",
      "wine tours Santa Maria del Cami Mallorca",
      "cata de vinos Mallorca",
      "wine tasting Mallorca",
      "bodegas Mallorca",
      "olive oil tours Mallorca",
      "aceite de oliva Mallorca",

      // Cuevas
      "caves tours Mallorca",
      "Drach caves tours Mallorca",
      "Cuevas del Drach Mallorca",
      "Cuevas de Arta Mallorca",
      "cuevas Mallorca",

      // Aventura y naturaleza
      "kayak tours Mallorca",
      "e-bike tours Mallorca",
      "rutas en e-bike Mallorca",
      "horse riding tours Mallorca",
      "rutas a caballo Mallorca",
      "4x4 tours Mallorca",
      "sunset tours Mallorca",
      "atardecer tours Mallorca",
      "snorkeling tours Mallorca",

      // Cocina y mercados
      "cooking class Mallorca",
      "clases de cocina Mallorca",
      "market tours Mallorca",
      "mercado tours Mallorca",

      // Palma desde el mar
      "boat tours Palma Mallorca",
      "catamaran tours Mallorca",
      "sailing tours Mallorca",
      "velero tours Mallorca"
    ]
  },

  "aesthetic-medicine": {
    businessCategory: "healthcare",
    singular: "aesthetic medicine clinic",
    output: "data/import-previews/aesthetic-medicine-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.4,
    minReviews: 20,
    searches: [
      // English-speaking aesthetic clinics
      "english speaking aesthetic clinic Mallorca",
      "english speaking cosmetic clinic Mallorca",
      "botox clinic Mallorca english",
      "filler clinic Mallorca english",
      "aesthetic medicine Mallorca english",
      "cosmetic medicine Mallorca english speaking",
      "skin clinic Mallorca english",
      "laser clinic Mallorca english",
      "anti aging clinic Mallorca english",
      "aesthetic surgery Mallorca english",

      // German-speaking aesthetic clinics
      "Schönheitsklinik Mallorca",
      "Ästhetische Medizin Mallorca",
      "Schönheitsbehandlung Mallorca",
      "Botox Mallorca deutsch",
      "Filler Behandlung Mallorca",
      "Hautarzt Mallorca ästhetisch",
      "Laserbehandlung Mallorca deutsch",
      "Antiaging Klinik Mallorca",
      "kosmetische Klinik Mallorca",

      // Specific branded clinics known to serve expats
      "Beauty Clinic Mallorca Bendinat",
      "mySkin Mallorca",
      "MD Aesthetics Santa Ponsa",
      "CENSALUD Palma aesthetic",
      "OLIVA Aesthetic Mallorca",
      "Mallorca Medical Group",
      "Clínica Mediben Palma",

      // General terms
      "clinica estetica Mallorca",
      "medicina estetica Palma Mallorca",
      "cirugia estetica Mallorca",
      "dermatologia estetica Mallorca",
      "tratamientos esteticos Palma",
      "botox Palma Mallorca",
      "acido hialuronico Palma Mallorca",
      "depilacion laser Mallorca",
      "rejuvenecimiento facial Mallorca"
    ]
  },

  casinos: {
    businessCategory: "casino",
    singular: "casino",
    output: "data/import-previews/casinos-preview.json",
    image: "/images/placeholder.svg",
    minRating: 3.8,
    minReviews: 20,
    searches: [
      "casino Mallorca",
      "casino Palma Mallorca",
      "casino Magaluf Mallorca",
      "casino Calvia Mallorca",
      "casino Alcudia Mallorca",
      "casino Cala Millor Mallorca",
      "casino Manacor Mallorca",
      "casino Inca Mallorca",
      "Gran Casino Mallorca",
      "bingo Mallorca",
      "bingo Palma Mallorca",
      "salon de juego Mallorca",
      "salon de juegos Palma Mallorca",
      "sala de apuestas Mallorca",
      "sports betting Mallorca",
      "poker Mallorca",
      "poker Palma Mallorca",
      "tragaperras Mallorca",
      "casas de apuestas Palma Mallorca",
      "betting shop Mallorca"
    ]
  },

  vets: {
    businessCategory: "veterinarian",
    singular: "veterinary clinic",
    output: "data/import-previews/vets-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.2,
    minReviews: 20,
    searches: [
      "best veterinary clinic Mallorca",
      "veterinary clinic Palma Mallorca",
      "veterinary hospital Palma Mallorca",
      "emergency vet Mallorca",
      "24 hour vet Mallorca",
      "English speaking vet Mallorca",
      "German speaking vet Mallorca",
      "veterinario Palma Mallorca",
      "clinica veterinaria Palma Mallorca",
      "hospital veterinario Mallorca",
      "urgencias veterinarias Mallorca",
      "veterinario a domicilio Mallorca",
      "veterinaria Palma Mallorca",
      "veterinarios Palma centro",
      "clinica veterinaria Palma centro",
      "veterinario Santa Catalina Palma",
      "veterinario Son Espanyolet Palma",
      "veterinario El Terreno Palma",
      "veterinario Portixol Palma",
      "veterinario Molinar Palma",
      "veterinario Coll d'en Rabassa Palma",
      "veterinario Son Ferriol Palma",
      "veterinario Son Gotleu Palma",
      "veterinario Son Cotoner Palma",
      "veterinario Son Rapinya Palma",
      "veterinario La Vileta Palma",
      "veterinario Génova Palma",
      "veterinario Cala Major Palma",
      "veterinario Sant Agustí Palma",
      "veterinario Marratxi Mallorca",
      "veterinario Pont d'Inca Mallorca",
      "veterinari Palma Mallorca",
      "clínica veterinària Palma Mallorca",

      "veterinary clinic Calvia Mallorca",
      "veterinary clinic Santa Ponsa Mallorca",
      "veterinary clinic Palmanova Mallorca",
      "veterinary clinic Magaluf Mallorca",
      "veterinary clinic Andratx Mallorca",
      "veterinary clinic Soller Mallorca",
      "veterinary clinic Pollenca Mallorca",
      "veterinary clinic Alcudia Mallorca",
      "veterinary clinic Inca Mallorca",
      "veterinary clinic Manacor Mallorca",
      "veterinary clinic Cala Millor Mallorca",
      "veterinary clinic Cala Ratjada Mallorca",
      "veterinary clinic Cala d'Or Mallorca",
      "veterinary clinic Santanyi Mallorca",
      "veterinary clinic Llucmajor Mallorca",

      "veterinario Calvia Mallorca",
      "veterinario Santa Ponsa Mallorca",
      "veterinario Alcudia Mallorca",
      "veterinario Inca Mallorca",
      "veterinario Manacor Mallorca",
      "veterinario Cala Millor Mallorca",
      "veterinario Santanyi Mallorca"
    ]
  },

  // ---- Carve-outs of healthcare (detected later by name/type signal, no enum) ----

  physiotherapy: {
    businessCategory: "healthcare",
    singular: "clinica de fisioterapia",
    output: "data/import-previews/physiotherapy-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.2,
    minReviews: 5,
    // Keep the net wide: the carve regex re-filters by name/type signal afterwards.
    // Only block things that are clearly a different vertical.
    blockedTypes: [
      "dentist",
      "dental_clinic",
      "beauty_salon",
      "nail_salon",
      "hair_salon"
    ],
    searches: [
      // Español — tipo
      "fisioterapia Palma Mallorca",
      "clinica de fisioterapia Mallorca",
      "fisioterapeuta Palma Mallorca",
      "centro de fisioterapia Mallorca",
      "fisioterapia deportiva Mallorca",
      "fisioterapia y rehabilitacion Mallorca",
      "osteopatia Palma Mallorca",
      "osteopata Mallorca",
      "quiropractico Mallorca",
      "quiropractica Palma Mallorca",
      "rehabilitacion fisica Mallorca",
      "fisioterapia suelo pelvico Mallorca",
      // Inglés / Alemán (amplían el hallazgo, no filtran)
      "physiotherapy Palma Mallorca",
      "physiotherapist Mallorca",
      "physio clinic Mallorca",
      "osteopathy Mallorca",
      "chiropractor Mallorca",
      "Physiotherapie Mallorca",
      "Physiotherapeut Mallorca",
      "Osteopathie Mallorca",
      // Por zona
      "fisioterapia Alcudia Mallorca",
      "fisioterapia Manacor Mallorca",
      "fisioterapia Inca Mallorca",
      "fisioterapia Calvia Mallorca",
      "fisioterapia Santa Ponsa Mallorca",
      "fisioterapia Andratx Mallorca",
      "fisioterapia Soller Mallorca",
      "fisioterapia Pollenca Mallorca",
      "fisioterapia Llucmajor Mallorca",
      "fisioterapia Felanitx Mallorca",
      "fisioterapia Cala d'Or Mallorca",
      "fisioterapia Santanyi Mallorca",
      "fisioterapia Marratxi Mallorca",
      "fisioterapia Capdepera Mallorca"
    ]
  },

  psychology: {
    businessCategory: "healthcare",
    singular: "psicologo o centro de psicologia",
    output: "data/import-previews/psychology-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.3,
    minReviews: 3,
    // Exclude driving-licence psychotechnical centres & medical-certificate mills,
    // which Google returns under "psicólogo" but are not therapy practices.
    blockedNameKeywords: [
      "psicotecnic",
      "psicotécnic",
      "reconocimiento",
      "reconocimientos medicos",
      "autoescuela",
      "certificado medico",
      "centro medico psicotecnico"
    ],
    searches: [
      // Español — tipo
      "psicologo Palma Mallorca",
      "psicologa Mallorca",
      "centro de psicologia Mallorca",
      "psicologia clinica Mallorca",
      "psicoterapia Palma Mallorca",
      "gabinete de psicologia Mallorca",
      "terapia psicologica Mallorca",
      "terapia de pareja Mallorca",
      "psicologo infantil Mallorca",
      "psicologia infantil y juvenil Mallorca",
      "psiquiatra Palma Mallorca",
      "psicologo ansiedad depresion Mallorca",
      // Inglés / Alemán (amplían el hallazgo)
      "psychologist Palma Mallorca",
      "english speaking psychologist Mallorca",
      "psychotherapist Mallorca",
      "counselling Mallorca",
      "Psychologe Mallorca",
      "Psychotherapie Mallorca",
      "deutscher Psychologe Mallorca",
      "psychiatrist Mallorca",
      // Por zona
      "psicologo Alcudia Mallorca",
      "psicologo Manacor Mallorca",
      "psicologo Inca Mallorca",
      "psicologo Calvia Mallorca",
      "psicologo Santa Ponsa Mallorca",
      "psicologo Andratx Mallorca",
      "psicologo Soller Mallorca",
      "psicologo Pollenca Mallorca",
      "psicologo Llucmajor Mallorca",
      "psicologo Felanitx Mallorca",
      "psicologo Santanyi Mallorca",
      "psicologo Marratxi Mallorca"
    ]
  },

  opticians: {
    businessCategory: "healthcare",
    singular: "optica u oftalmologia",
    output: "data/import-previews/opticians-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.2,
    minReviews: 6,
    searches: [
      // Español — tipo
      "optica Palma Mallorca",
      "opticas Mallorca",
      "optico optometrista Mallorca",
      "optometrista Palma Mallorca",
      "centro optico Mallorca",
      "oftalmologo Palma Mallorca",
      "clinica oftalmologica Mallorca",
      "cirugia ocular Mallorca",
      "operacion de vista laser Mallorca",
      "revision de la vista Mallorca",
      // Inglés / Alemán
      "optician Palma Mallorca",
      "optometrist Mallorca",
      "ophthalmologist Mallorca",
      "eye clinic Mallorca",
      "laser eye surgery Mallorca",
      "Optiker Mallorca",
      "Augenarzt Mallorca",
      "Augenklinik Mallorca",
      // Por zona
      "optica Alcudia Mallorca",
      "optica Manacor Mallorca",
      "optica Inca Mallorca",
      "optica Calvia Mallorca",
      "optica Santa Ponsa Mallorca",
      "optica Andratx Mallorca",
      "optica Soller Mallorca",
      "optica Pollenca Mallorca",
      "optica Llucmajor Mallorca",
      "optica Felanitx Mallorca",
      "optica Santanyi Mallorca",
      "optica Cala d'Or Mallorca"
    ]
  },

  fertility: {
    businessCategory: "healthcare",
    singular: "clinica de fertilidad",
    output: "data/import-previews/fertility-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.0,
    minReviews: 3,
    blockedNameKeywords: ["veterinar", "banco de semen animal"],
    searches: [
      // Español
      "clinica de fertilidad Mallorca",
      "reproduccion asistida Mallorca",
      "clinica de reproduccion Mallorca",
      "fecundacion in vitro Mallorca",
      "tratamiento de fertilidad Palma Mallorca",
      "ginecologia y reproduccion Mallorca",
      "inseminacion artificial Mallorca",
      "ovodonacion Mallorca",
      // Inglés / Alemán
      "fertility clinic Mallorca",
      "IVF clinic Mallorca",
      "reproductive medicine Mallorca",
      "assisted reproduction Mallorca",
      "Kinderwunschklinik Mallorca",
      "Kinderwunsch Mallorca",
      "kunstliche Befruchtung Mallorca",
      // Zona (casi todo en Palma, pero por si acaso)
      "clinica fertilidad Palma Mallorca",
      "reproduccion asistida Palma Mallorca",
      "fertility Palma de Mallorca"
    ]
  },

  nutrition: {
    businessCategory: "healthcare",
    singular: "nutricionista o dietista",
    output: "data/import-previews/nutrition-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.3,
    minReviews: 5,
    blockedNameKeywords: ["herbolario", "herbalife", "herbalist", "supplement store", "tienda de suplementos", "gimnasio", "veterinar"],
    searches: [
      // Español
      "nutricionista Palma Mallorca",
      "dietista Mallorca",
      "clinica de nutricion Mallorca",
      "nutricion y dietetica Mallorca",
      "dietista nutricionista Palma Mallorca",
      "nutricion clinica Mallorca",
      "nutricion deportiva Mallorca",
      "endocrino nutricion Mallorca",
      // Inglés / Alemán
      "nutritionist Palma Mallorca",
      "dietitian Mallorca",
      "nutrition clinic Mallorca",
      "Ernahrungsberatung Mallorca",
      "Ernahrungsberater Mallorca",
      // Zona
      "nutricionista Manacor Mallorca",
      "nutricionista Inca Mallorca",
      "nutricionista Calvia Mallorca",
      "nutricionista Alcudia Mallorca",
      "nutricionista Llucmajor Mallorca",
      "dietista Santa Ponsa Mallorca"
    ]
  },

  pediatrics: {
    businessCategory: "healthcare",
    singular: "pediatra o clinica pediatrica",
    output: "data/import-previews/pediatrics-preview.json",
    image: "/images/placeholder.svg",
    minRating: 4.0,
    minReviews: 5,
    blockedNameKeywords: ["dental", "dentist", "veterinar", "guarderia", "escuela infantil"],
    searches: [
      // Español
      "pediatra Palma Mallorca",
      "clinica pediatrica Mallorca",
      "centro pediatrico Mallorca",
      "pediatria Palma Mallorca",
      "pediatra privado Mallorca",
      "consulta pediatrica Mallorca",
      // Inglés / Alemán
      "pediatrician Palma Mallorca",
      "paediatrician Mallorca",
      "pediatric clinic Mallorca",
      "Kinderarzt Mallorca",
      "Kinderarzt Palma Mallorca",
      "deutscher Kinderarzt Mallorca",
      // Zona
      "pediatra Manacor Mallorca",
      "pediatra Inca Mallorca",
      "pediatra Calvia Mallorca",
      "pediatra Alcudia Mallorca",
      "pediatra Santa Ponsa Mallorca",
      "pediatra Llucmajor Mallorca"
    ]
  }
};

export function getPlaceCategoryConfig(category) {
  const config = PLACE_CATEGORY_CONFIGS[category];
  if (!config) {
    throw new Error(`Unknown category "${category}". Use one of: ${Object.keys(PLACE_CATEGORY_CONFIGS).join(", ")}`);
  }
  return config;
}
