import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const STAMP = "2026-06-29T18-25-00-660Z";
const OUTPUT_STAMP = new Date().toISOString().replace(/[:.]/g, "-");

const CATEGORIES = [
  "real-estate",
  "spas",
  "gyms",
  "nightlife",
  "rent-a-car",
  "car-dealers",
  "bakeries",
  "hotels",
  "casinos"
];

const MAIN_PREVIEWS = {
  "real-estate": "data/import-previews/real-estate-preview.json",
  spas: "data/import-previews/spas-preview.json",
  gyms: "data/import-previews/gyms-preview.json",
  nightlife: "data/import-previews/nightlife-preview.json",
  "rent-a-car": "data/import-previews/rent-a-car-preview.json",
  "car-dealers": "data/import-previews/car-dealers-preview.json",
  bakeries: "data/import-previews/bakeries-preview.json",
  hotels: "data/import-previews/hotels-preview.json",
  casinos: "data/import-previews/casinos-preview.json"
};

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function includesName(row, names) {
  const name = normalize(row.name);
  return names.some((item) => name === normalize(item) || name.includes(normalize(item)));
}

function hasText(row, keywords) {
  const text = normalize(`${row.name} ${row.address} ${row.website} ${row.primary_type} ${(row.types ?? []).join(" ")}`);
  return keywords.some((keyword) => text.includes(normalize(keyword)));
}

function hasType(row, types) {
  const allTypes = new Set([row.primary_type, ...(row.types ?? [])].filter(Boolean));
  return types.some((type) => allTypes.has(type));
}

const realEstateIncludeNames = [
  "GestPropiedad",
  "Engel & Völkers",
  "Engel & Volkers",
  "RE/MAX",
  "Inmuebles CBPisos",
  "Finques RBJ",
  "Mendopiso",
  "ALQUILER RIESGO ZERO",
  "Vidamar Consultors",
  "INMOBILIARIA GRUPO ROMA",
  "Mamá Inmobiliaria",
  "AMG INMOBILIARIA",
  "Prialtum Real Estate",
  "SAMPOL INMOBILIARIA",
  "Dray and Partners Mallorca",
  "AVS Properties",
  "Global AnKat Inmobiliaria",
  "Inmogestión Balear Campos",
  "TODO Mallorca CB",
  "Living Blue Mallorca-Campos",
  "Silvia Ibars SIS",
  "Sky Solutions Group",
  "INMO-LIVE HOMES"
];

const realEstateSkipNames = [
  "Autos Custodia",
  "Vanrell",
  "Salesca",
  "ClickRent",
  "Hiper Rent A Car",
  "Bohemi 40",
  "Autos Nifers",
  "OAC Sant Agustí",
  "DE PRADA & MOYA",
  "Dickinson Villas",
  "Pine Walk Apartments",
  "ESPOSITO RENT",
  "Coll aguilar",
  "Inmosenna",
  "Nova Mig",
  "Hella Helene Soller",
  "Inmobiliaria Cala d'Or Property Services"
];

const spaIncludeNames = [
  "bodii",
  "Luna Spa",
  "L'eSPAi de Jen",
  "Kahuna Mallorca",
  "Li Fish Spa",
  "TAPOVAN AYURVEDA",
  "Sawabona Massage",
  "Mans Massatges Manacor",
  "Bon Cos",
  "Thanya Thai Massage Portocristo",
  "SergioReMassage",
  "Serbona massage and beauty",
  "MASSAGE-THERAPIE by Birgit Schatz",
  "Sara Canales Estética Avanzada",
  "MUSE-QI",
  "Sandrine A. Yoga & Massage",
  "Estètica Ozon"
];

const spaSkipNames = [
  "Samadhi Hidro Spa",
  "Smile Thai Spa",
  "Cuerpo Erótico",
  "Angelis",
  "Marimón Tcuida",
  "Hebe Estética",
  "Centro de Estética Macarena Torres",
  "Wellnessfinca Mallorca",
  "Lorena almagro hair spa",
  "Lara andriolo",
  "Centre Terapèutic Cladera",
  "Jaume Perelló Sport Massage",
  "Metodo Naka",
  "GB Clinic"
];

const gymIncludeNames = [
  "Fisiotur Training",
  "Govinda Yoga",
  "Mysore House Mallorca",
  "F45 Training Palma Racket Club",
  "MOVIT Sport Club",
  "The Fit Family Tree",
  "Tenis y Pádel Son Rigo",
  "Taurus",
  "Mallorca Tenis Club",
  "Spartans Academy Mallorca",
  "Jap Calisthenics Center",
  "Round 1 by Dani Muñoz",
  "Club Natación la Salle",
  "Pádel La Salle",
  "Gimnasio Grech",
  "ESTELA YOGA",
  "Aelia Club Fitness para Mujeres",
  "Singular Fitness Puerto Portals",
  "Time4Fit Portals Nous",
  "Polideportivo Municipal Santa Ponsa",
  "Piscina Municipal Santa Ponça",
  "Polideportivo Galatzó",
  "We Athletes Training Club",
  "Club BeachVolley Balear",
  "PEGASUS ATHLETIC CLUB",
  "Sporting Club Portals Tennis & Padel",
  "Pista de Atletismo de Magaluf",
  "Polideportivo Municipal Peguera",
  "Tennis Academy Mallorca",
  "Palacio Municipal de Deportes Andratx",
  "Polideportivo Municipal Andratx Padel Club",
  "Sóller Tennis Club",
  "Fisic Fitness Club",
  "Poliesportiu Municipal Pollença",
  "Corsaris Rugby Football Club",
  "Piscina coberta Port de Pollença",
  "NOVE2 SALUT I RENDIMENT",
  "DINAMIS",
  "Jai Su",
  "Pavelló Municipal De Muro",
  "Pabellón de Sa Creu",
  "Polideportivo municipal Mateu Cañellas",
  "Palau Municipal d'Esports Inca",
  "Club Tenis Manacor",
  "Omya Terapias",
  "Polideportivo Municipal Virginia Torrecilla",
  "RA TENNIS ACADEMY",
  "Fussicamp Cala Millor",
  "Piscina cubierta Marcus Cooper Walz",
  "Mallorca Swim Academy",
  "Tenis Club Cala d'Or",
  "Cross Ses Salines",
  "Crossmbv Campos",
  "CLUB TENNIS SANTANYÍ",
  "Espai SA",
  "Polideportivo Municipal Campos",
  "Gesport Balear Campos",
  "Campo Municipal Deportes Campos",
  "BEST Centre",
  "Sport Padel Colonia",
  "SKATEPARK FELANITX",
  "Beats Training Club Marratxí",
  "Time4Fit Pont d'Inca Nou",
  "AKURE Pilates Studio",
  "María Zazo Yoga",
  "Open Marratxí",
  "Gimnasio SPARTA Sport I Salut",
  "Club de Pàdel Es Punt",
  "Movement",
  "Centre de Ioga Ca s'Oliba",
  "Miquel Pons Lladó",
  "Pavelló Antoni Ladaria",
  "Polideportivo Municipal de Sineu"
];

const gymSkipNames = [
  "Polideportivo La Salle",
  "San Fernando",
  "Real Club Deportivo Mallorca",
  "Club de Mar",
  "RCNP",
  "Portitxol",
  "Cala Gamba",
  "Gimnasio Fitness Center Ciudad Jardín",
  "Supera 24h Génova",
  "Banana Club Mallorca",
  "OUTXIDE",
  "Enjoy Club",
  "Cloud420",
  "Sóller Divers",
  "Octopus Mallorca",
  "Rancho Bonanza",
  "Kàrting Ca'n Picafort",
  "Freedom Boat Club",
  "WeBoat"
];

const rentCarIncludeNames = [
  "AUTOS SAN SIRO",
  "Autos Cano",
  "Europcar Mallorca Playa De Palma",
  "Dollar",
  "Bohemi 40",
  "Autos Colonia",
  "Autos Verger",
  "Autos Nifers",
  "ClickRent Can Picafort",
  "GOBYCAR Can Picafort",
  "Microcost Rent a car"
];

const bakeryIncludeNames = [
  "Ammu Cannoli",
  "FORN de Sant Joan",
  "Tudurí Pastisseria i Cafè",
  "Santagloria Llonguet",
  "Heladeria Colonial",
  "Petit San Remo Can Picafort",
  "Julia's Café",
  "Dulce de Leche",
  "Panaderia Lozano",
  "La Mar Dolça",
  "Santagloria Coffee & Bakery",
  "Clement Panadería",
  "Le Carac",
  "Sweet Paradise Mallorca",
  "Heladería Antiuxixona Palmanova",
  "Forn Nou Son Sardina",
  "Panaderia Garau",
  "Rivareno Magaluf",
  "ES CUCURUTXO Portocolom",
  "Cafeteria Cala Ratjada",
  "Panadería Fornaris",
  "Panaderia Matias",
  "Forn i Pastisseria Gelabert",
  "Manjares",
  "Forn d'en Biel",
  "Waffelbäckerei-Mallorca",
  "Maná & Maná",
  "BORN-I-BO",
  "Konditorei Risitas",
  "Forn Del Norte Soller",
  "SA BAKERY CAFÈ",
  "Pastelería Mina",
  "Gelateria Des Port",
  "GELATERIA TOP GELATO",
  "Pastelería Aurora",
  "Panaderia Y Pasteleria Coll",
  "Es Forn",
  "Ca'n Damià",
  "Panaderia Buen Pastor",
  "Can Oliveret",
  "Can Pa",
  "Forn de Gènova",
  "Lento Forn i Pastisseria",
  "Forn Sant Bartomeu",
  "Pastelería Marc Tudurí",
  "Forn Can Matemales",
  "Cafeteria Forn Can Bet",
  "Can Salem",
  "FORN ES BLAT",
  "Pastisseria Forn de S'Horta",
  "Forn Cas Moix",
  "Forn Ca Na Juanita",
  "Forn Ca Na Juanaineta",
  "Panadería Y Luis Manjón",
  "Forn i Pastisseria Que Bo",
  "Forn Pastisseria Can Terés",
  "Forn Ca'n Simó",
  "Café forn SA BASSA NOVA",
  "Pastelería Mir",
  "Panord forn Muro",
  "Carsi's Bakery Gluten Free",
  "Pastelería Forn de C'al Rei",
  "Can Beño Manacor",
  "Felisa Bakery"
];

const casinoIncludeNames = [
  "Restaurante S'Hort Casino Mallorca",
  "Café Casino",
  "Gringos Bingo",
  "La Bicicleta Sports Bar"
];

const nightlifeSkipNames = [
  "EPIC Palma",
  "Sala Luna",
  "Brooklyn Club",
  "Mira Blau",
  "Malecon27",
  "Bar Havanna",
  "Discoteca Living Music Club",
  "Beach Side Portixol",
  "Restaurante Cocco",
  "Izizi Nunnak",
  "MK Arena",
  "Bar Cala Canta",
  "ShowGirls Lap Dance",
  "Cloud420",
  "RNA Club House",
  "Sunset Lounge",
  "Hotel & Restaurant Jardí d'Artà",
  "miga de nube",
  "Yannis Cafe",
  "Blend brunch",
  "Signature Coffee",
  "Finca Comassema",
  "Tim's",
  "MURO Beach",
  "HavanaQ",
  "Keops Disco",
  "Soco Pool-Lounge",
  "Fantasy Park",
  "Minigolf Bar Cristobal",
  "Cuevas de Génova",
  "Periplo Portixol",
  "Chalet Siena",
  "SART Club",
  "Magalluf Nite",
  "Waikiki",
  "Tiki Beach",
  "Flamingo Bar",
  "Bar Alhambra",
  "Sa Cova Bar",
  "5illes BEACH&SUNSET"
];

function decision(category, row) {
  if (category === "real-estate") {
    if (includesName(row, realEstateSkipNames)) return { include: false, reason: "Claude skip name/category mismatch" };
    if (includesName(row, realEstateIncludeNames)) return { include: true, reason: "Claude explicit include/brand include" };
    if ((row.reviews_count ?? 0) < 10 || (row.rating ?? 0) < 4.2) return { include: false, reason: "Claude skip: low signal" };
    if (hasText(row, ["rent a car", "holiday", "ferien", "villa rental", "apartment", "apartamentos", "abogados", "lawyer", "government"])) return { include: false, reason: "Claude skip: wrong vertical" };
    return { include: (row.reviews_count ?? 0) >= 50, reason: "Claude rule: real-estate candidate over threshold" };
  }

  if (category === "spas") {
    if (includesName(row, spaSkipNames)) return { include: false, reason: "Claude skip name" };
    if (includesName(row, spaIncludeNames)) return { include: true, reason: "Claude explicit include" };
    if ((row.reviews_count ?? 0) < 50) return { include: false, reason: "Claude skip: <50 reviews" };
    if (hasText(row, ["adult", "erotico", "hair spa", "aesthetic clinic", "medicina estetica", "instagram"])) return { include: false, reason: "Claude skip: wrong/thin spa fit" };
    return { include: hasText(row, ["spa", "massage", "masaje", "thai", "ayurveda", "wellness"]), reason: "Claude rule: spa/massage signal over threshold" };
  }

  if (category === "gyms") {
    if (includesName(row, gymSkipNames)) return { include: false, reason: "Claude skip name" };
    if (includesName(row, gymIncludeNames)) return { include: true, reason: "Claude explicit include" };
    if ((row.reviews_count ?? 0) < 50 || (row.rating ?? 0) < 4.2) return { include: false, reason: "Claude skip: low signal" };
    if (hasText(row, ["marina", "nautico", "boat", "cannabis", "discoteca", "nightlife", "karting", "rancho", "divers"])) return { include: false, reason: "Claude skip: wrong sport category" };
    return { include: hasText(row, ["gym", "fitness", "yoga", "pilates", "padel", "pádel", "tennis", "tenis", "polideportivo", "piscina", "sport", "deportes"]), reason: "Claude rule: gym/sports signal over threshold" };
  }

  if (category === "nightlife") {
    if (includesName(row, nightlifeSkipNames)) return { include: false, reason: "Claude skip name" };
    if ((row.reviews_count ?? 0) < 50 || (row.rating ?? 0) < 4.2) return { include: false, reason: "Claude skip: low signal" };
    if (hasText(row, ["hotel", "resort", "coffee shop", "brunch", "wedding venue", "cannabis"])) return { include: false, reason: "Claude skip: wrong nightlife fit" };
    return { include: true, reason: "Claude broad include list/rule for nightlife" };
  }

  if (category === "rent-a-car") {
    return includesName(row, rentCarIncludeNames)
      ? { include: true, reason: "Claude explicit include" }
      : { include: false, reason: "Claude explicit skip/not included" };
  }

  if (category === "car-dealers") {
    if ((row.reviews_count ?? 0) < 30 || (row.rating ?? 0) < 4.2) return { include: false, reason: "Claude rule: low dealer signal" };
    if (hasType(row, ["car_rental", "car_repair"]) || hasText(row, ["rent a car", "rental", "taller", "neumaticos", "neumáticos"])) return { include: false, reason: "Claude rule: not dealer" };
    return { include: hasText(row, ["car_dealer", "concesionario", "automoviles", "automóviles", "coches", "motor", "auto"]), reason: "Claude inferred dealer include" };
  }

  if (category === "bakeries") {
    return includesName(row, bakeryIncludeNames)
      ? { include: true, reason: "Claude explicit include" }
      : { include: false, reason: "Claude explicit skip/not in include list" };
  }

  if (category === "hotels") {
    if ((row.reviews_count ?? 0) < 50 || (row.rating ?? 0) < 4.2) return { include: false, reason: "Claude hotel rule: low signal" };
    if (hasText(row, ["airbnb", "property", "restaurant", "bar", "villa rental", "casa en alquiler"])) return { include: false, reason: "Claude hotel rule: wrong lodging fit" };
    return { include: hasType(row, ["hotel", "lodging", "resort_hotel", "extended_stay_hotel"]) || hasText(row, ["hotel", "hostal", "finca", "agroturismo", "apartamentos"]), reason: "Claude inferred hotel include" };
  }

  if (category === "casinos") {
    return includesName(row, casinoIncludeNames)
      ? { include: true, reason: "Claude explicit include" }
      : { include: false, reason: "Claude explicit casino skip/not included" };
  }

  throw new Error(`Unsupported category: ${category}`);
}

function writeReport(category, approved, skipped, outputPreview, approvedBackup) {
  mkdirSync("reports", { recursive: true });
  const reportPath = `reports/${category}-zone-topup-claude-approved-filter-${OUTPUT_STAMP}.md`;
  const lines = [
    `# ${category} Zone Top-Up Claude Approved Filter`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Approved preview: ${approvedBackup}`,
    `- Main preview overwritten for import: ${outputPreview}`,
    `- Approved rows: ${approved.length}`,
    `- Skipped rows: ${skipped.length}`,
    "",
    "## Approved",
    "",
    "| Name | Reason | Rating | Reviews | Type | Address |",
    "|---|---|---:|---:|---|---|",
    ...approved.map((row) => `| ${fmt(row.name)} | ${fmt(row.approval_reason)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.address)} |`),
    "",
    "## Skipped",
    "",
    "| Name | Reason | Rating | Reviews | Type | Address |",
    "|---|---|---:|---:|---|---|",
    ...skipped.map((row) => `| ${fmt(row.name)} | ${fmt(row.skip_reason)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.address)} |`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  return reportPath;
}

function processCategory(category) {
  const source = `data/import-previews/${category}-zone-topup-clean-preview-${STAMP}.json`;
  if (!existsSync(source)) throw new Error(`Source preview not found: ${source}`);
  const rows = JSON.parse(readFileSync(source, "utf8"));
  const approved = [];
  const skipped = [];

  for (const row of rows) {
    const verdict = decision(category, row);
    if (verdict.include) approved.push({ ...row, approval_reason: verdict.reason });
    else skipped.push({ ...row, skip_reason: verdict.reason });
  }

  mkdirSync("data/import-previews", { recursive: true });
  const approvedBackup = `data/import-previews/${category}-zone-topup-claude-approved-preview-${OUTPUT_STAMP}.json`;
  const outputPreview = MAIN_PREVIEWS[category];
  writeFileSync(approvedBackup, `${JSON.stringify(approved, null, 2)}\n`, "utf8");
  writeFileSync(outputPreview, `${JSON.stringify(approved, null, 2)}\n`, "utf8");

  return {
    category,
    source,
    report: writeReport(category, approved, skipped, outputPreview, approvedBackup),
    approved_backup: approvedBackup,
    main_preview: outputPreview,
    source_rows: rows.length,
    approved: approved.length,
    skipped: skipped.length
  };
}

function main() {
  const categories = process.argv.slice(2).find((arg) => arg.startsWith("--categories="))?.slice("--categories=".length).split(",") ?? CATEGORIES;
  const results = categories.map((category) => processCategory(category.trim()));
  console.log(JSON.stringify({ results }, null, 2));
}

main();
