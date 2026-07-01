import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const STAMP = "2026-06-29T17-59-16-668Z";
const OUTPUT_STAMP = new Date().toISOString().replace(/[:.]/g, "-");

const SOURCES = {
  restaurants: `data/import-previews/restaurants-zone-topup-clean-preview-${STAMP}.json`,
  bars: `data/import-previews/bars-zone-topup-clean-preview-${STAMP}.json`,
  cafes: `data/import-previews/cafes-zone-topup-clean-preview-${STAMP}.json`,
  healthcare: `data/import-previews/healthcare-zone-topup-clean-preview-${STAMP}.json`,
  vets: `data/import-previews/vets-zone-topup-clean-preview-${STAMP}.json`
};

const MAIN_PREVIEWS = {
  restaurants: "data/import-previews/restaurants-preview.json",
  bars: "data/import-previews/bars-preview.json",
  cafes: "data/import-previews/cafes-preview.json",
  healthcare: "data/import-previews/healthcare-preview.json",
  vets: "data/import-previews/vets-preview.json"
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

const restaurantIncludeExceptions = [
  "Ca'n Ribes",
  "SANTOSOL",
  "Ca'n Moixet",
  "Sa Ximada"
];

const restaurantSkipNames = [
  "Bar Galeon",
  "Bar Casa Paco",
  "vino y mas",
  "Mitj & Mitj Bar",
  "La Tapa Granaína",
  "Restaurante Savantry",
  "Bar Es Raconet d'Andratx",
  "Es Redol",
  "Papito's Coffee Bar",
  "Vermuteria Bar Mercat",
  "Bar Café Sa Picada",
  "Bar Mar y Montaña",
  "Es Fanals",
  "Sunset Lounge",
  "Bar Albatros",
  "Nomad Urban Food",
  "Oh Vermut",
  "Restaurante Trisquel Alhambra",
  "TECUN",
  "La Scalinata",
  "Bar l'aturada 2018",
  "La Taberna",
  "Rustic Cafè",
  "Bar Mora",
  "La Terrassa",
  "Bar Europa",
  "BAR PUPUT",
  "Lunita Beach",
  "Bar Güep Cafe",
  "Cap Blau Restaurant",
  "Restaurante El León Rojo",
  "DAYLA",
  "Bar Ca n'Ari",
  "Calala Bar",
  "Bar Kiko",
  "La Taberna de la Jenny",
  "Bar La guarida",
  "Bar Marprats",
  "WurstWerk",
  "Bar Mingo",
  "Bar sa Taverna",
  "Bar Sa Volta",
  "Bar Vermut",
  "Es Racó des Tren",
  "Bar Sa Font",
  "Contrabando Llucmajor",
  "Bar El Chateo",
  "Bar Ca'n Chame",
  "BAR SA RONDA",
  "Al gusto coffee",
  "Calma Beach Club",
  "Azúcar",
  "Es rebost de Ca'n mauro",
  "Vermuteria by Baudot 1926",
  "Fonoll Mari d'Arta"
];

const barSkipNames = [
  "THE KEBABISH",
  "Bleecker",
  "Las Olas",
  "MOROCCO Lounge",
  "Charlie&Co",
  "NAMORAH",
  "Linekers Bar",
  "Bar Casa Paco",
  "Cyril's bar",
  "Red Lion Magaluf",
  "Tim's",
  "Bar Cas Pobil",
  "Restaurante Savantry",
  "Bar-Bera",
  "Sa Botigueta bar",
  "Agapanto",
  "miga de nube",
  "La Nit",
  "Beach Bar paraiso",
  "Bell's Disco",
  "Ocolia",
  "Nomad Urban Food",
  "Lemon Lounge Bar",
  "Club Pollença",
  "Sea.Bar.Is",
  "La Rovina Vermutería",
  "Triple A",
  "Sa Ximada",
  "Celler Ca's Chato",
  "Bar Restaurante Cacatua",
  "Bar Sa Plaça",
  "Stop & Smile",
  "Natura beach",
  "Restaurante El León Rojo",
  "Bar Cosca Club",
  "Bar Estación",
  "ROMANÍ 41",
  "Es Celler de Manacor",
  "La Botte",
  "La Pasión",
  "Bar Restaurante 2+1",
  "Motti Burger",
  "ES CAÇADORS",
  "Calma Beach Club",
  "Restaurant sa Caleta",
  "Sa Font Bierbrunnen",
  "Cafe-Bar Yvonne",
  "Angels-Bolero",
  "Pessics",
  "Flamingo Bar",
  "Hattrick Night",
  "Bar Asociación Tercera edad"
];

const cafeIncludeNames = [
  "Sa Granja Cafè",
  "Mister McCoy's Island Ices",
  "HORNO SANTO CRISTO",
  "L'Epicerie Bakery & Specialty Coffee",
  "Espai Food Lovers",
  "Tentol Coffee Brunch",
  "Yogu&friends",
  "MILTON'S PIZZERIA BRUNCH CAFFE",
  "Brunxito Brunch & Bistro",
  "Bar Cafetería Bon Apetit",
  "Anima e Farina",
  "Urban bites",
  "1550 Milki",
  "NATUR Puerto Pollensa",
  "El Perrito Pont Roma",
  "Café Esportiu",
  "MuMa by Canpica",
  "Gelateria Carpe Diem",
  "La Boutique del Gelato",
  "Gelateria San Remo",
  "Pastisseria Gelabert",
  "Gran Cafe 1919",
  "Cafè Inca",
  "New Hackafe",
  "Es Racó",
  "Panaderia-Pastisseria-Cafeteria Oh La La",
  "Cafetería Novedades",
  "NATUR Inca",
  "DLOLA club",
  "CELLER TONET",
  "Delicias Doña Blanca",
  "DULCE MANIA",
  "La Montevideana",
  "Sa Foganya Manacor",
  "Can Nofre",
  "Sa Tafal Cafeteria",
  "BISTRO MERCAT",
  "Cafetería Centre Bahía",
  "Bar/Cafetería Aldea Blanca",
  "NOU CA'N NADAL",
  "Galette",
  "Pastisseria Ramis",
  "Cafe Mint",
  "Frühstücks Bistro Café Ally",
  "SANTÉ Vegan & Veggie",
  "MÁS Q COFFEE",
  "Eiscafe La Sirena",
  "Cafetería Heladería Osiris",
  "Cafe Luca",
  "Pastelería Cala Millor",
  "Burdo Restaurante y brunch",
  "Café Son Moll",
  "Noahs Lounge",
  "Cafeteria D&D",
  "cafeteria valiente",
  "Novo Pippos",
  "Norai",
  "El Olivo",
  "Porto bello",
  "Cafè Parisien",
  "Es Punt Cafè",
  "Cafeteria Teatre Artà",
  "Bar Ca'n Matemales",
  "Cafetería Almudaina",
  "Bar LA BICICLETTA CAFÉ",
  "Es bistró",
  "Bar Restaurante Chapeau",
  "Hi cream",
  "Cafe Norai",
  "La Magrana Bistró",
  "Cafeteria Moni",
  "Le bistrot du port",
  "Tacoffee",
  "Chilax",
  "Lubumba",
  "Típic sin Gluten",
  "MIG I MIG SA CANTINA",
  "Cafetería Reboreda",
  "Antares",
  "Lima & Limon",
  "TIRAMISÙ gelato",
  "Cafeteria PISCIS",
  "Cafeteria Las Palmas",
  "Café Chill Out La Playa",
  "Bella Mia",
  "Café val",
  "Backstube",
  "Piquer",
  "CREPERIA SA FONT",
  "Levante Cafe-Bistro",
  "Bistro Calle Cruz 20",
  "Cafetería Granja Ses Voltes",
  "Horno y Pastelería ses Delicias",
  "Pasteleria Pomar",
  "LAROTI Micropanadería",
  "Yass",
  "Es Cap De Cantó",
  "coco's sandwicheria",
  "Cafe & Sal",
  "Auba Cafè",
  "Bar Cafeteria Es Dolç",
  "Heladeria Colonial",
  "Panaderia Pons",
  "5illes EAT&DRINK",
  "Es carbón bistro",
  "Sa Foganya",
  "Laos Market Tapas",
  "Bar Gelateria Es Port",
  "Bar Delfín",
  "Cafe Can Moix",
  "Pax Gastrobar",
  "Ca'n Franky",
  "Pastisseria Cas Francès",
  "Forn de Can Vica",
  "Café El Guajiro",
  "La Taberna de Mou",
  "BRICCO cafe",
  "Cafè Pòrtol",
  "Café Del Parque",
  "Croissanterie La Supreme",
  "Cafeteria Can Ramon",
  "Cafè Can Jaume",
  "Cafetería Panadería Ca na Elena",
  "FORN SA CREU",
  "Ca s'Hereu Restaurante Cafè",
  "Perbacco"
];

const healthcareIncludeNames = [
  "Platón Dental",
  "Clínica Dental Vitaldent",
  "Clínica Dental Adeslas",
  "Més Dental",
  "THERAPIC FISIOTERAPIA",
  "Clínica Fisare",
  "MOU-TE Sport Center",
  "Centre Balanç",
  "Origen Cuidado Integral",
  "Clínica Dental Obrador",
  "Clínica Dental Dentrium Dents",
  "ANANDA Clínica dental",
  "Clínica Dental Balboa",
  "MASSAGE - THERAPIE by Birgit Schatz",
  "Clínica Ment",
  "Osteomed",
  "Arndt Weitendorff",
  "Clínica Dental Antònia Puigserver",
  "Centro médico Psicomedic Campos",
  "ClínicaLladó",
  "PodoStudi",
  "Centres Mèdics Canovas",
  "FisioVital",
  "Clínica Dental Marratxí",
  "Clínica dental PROESTETIC",
  "Clínica Morán",
  "Ser Feliz Centro Sanitario",
  "Centro de psicología Sònia Vila",
  "Llucia osteópata",
  "Miguel Butragueño Fisioterapeuta"
];

const vetsIncludeNames = [
  "Clínica Veterinaria S'Arenal",
  "Vicente Busquets Castañer",
  "Clínica Veterinaria Ses Salines",
  "RehabilitaCans",
  "Clínica Palmanord",
  "Sa Indioteria Clinica Veterinaria",
  "Centro Veterinario Palmanyola",
  "Veterinario Polaris",
  "Veterinàritx",
  "Veterinaria Son Sardina",
  "TramuntanaVets",
  "Clinica Veterinaria Santa Maria",
  "Veterinaris Alaró",
  "Clínica Veterinaria Huellas",
  "Centre Veterinari Part Forana",
  "Clínica Veterinària Lloseta",
  "Clínica Veterinària Pins",
  "Clínica Veterinària Sineu",
  "VETERINARI MURO",
  "Clinica veterinaria Navarro Vet",
  "Clinica Veterinaria Campos",
  "Centre Veterinari Capdepera",
  "Clínica Veterinaria Pel i Plomes",
  "ARO Veterinaria",
  "Clínica Veterinaria San Jorge",
  "Clínica Veterinaria Es Pla",
  "Felanitx vet"
];

function restaurantDecision(row) {
  if (includesName(row, restaurantIncludeExceptions)) return { include: true, reason: "Claude include exception" };
  if (includesName(row, restaurantSkipNames)) return { include: false, reason: "Claude skip name" };
  if ((row.reviews_count ?? 0) < 50) return { include: false, reason: "Claude global skip: <50 reviews" };
  if ((row.rating ?? 0) >= 4.2) return { include: true, reason: "Claude rule: rating >=4.2 and reviews >=50" };
  if ((row.rating ?? 0) === 4.1 && (row.reviews_count ?? 0) >= 500) return { include: true, reason: "Claude volume exception: 4.1 with 500+ reviews" };
  return { include: false, reason: "Claude global skip: rating below threshold" };
}

function barDecision(row) {
  if (includesName(row, barSkipNames)) return { include: false, reason: "Claude skip name" };
  if ((row.reviews_count ?? 0) < 50) return { include: false, reason: "Claude global skip: <50 reviews" };
  if ((row.rating ?? 0) < 4.2) return { include: false, reason: "Claude global skip: rating below 4.2" };
  return { include: true, reason: "Claude rule: bar candidate above threshold" };
}

function cafeDecision(row) {
  if (includesName(row, cafeIncludeNames)) return { include: true, reason: "Claude explicit include" };
  return { include: false, reason: "Not in Claude cafe include list" };
}

function healthcareDecision(row) {
  if (includesName(row, healthcareIncludeNames)) return { include: true, reason: "Claude explicit include" };
  if ((row.reviews_count ?? 0) < 50) return { include: false, reason: "Claude global skip: <50 reviews" };
  if (!row.website) return { include: false, reason: "Claude global skip: thin/no website" };
  if (hasText(row, ["estetica", "estética", "aesthetic", "beauty", "wellness", "farmacia", "optic", "optica", "gadget", "electroauto", "restaurant", "bar"])) {
    return { include: false, reason: "Claude global skip: aesthetic/wellness/non-healthcare" };
  }
  const healthcareTypes = ["medical_center", "medical_clinic", "doctor", "dentist", "dental_clinic", "physiotherapist", "hospital", "general_hospital"];
  if (healthcareTypes.includes(row.primary_type)) return { include: true, reason: "Claude healthcare rule: strong healthcare type, web, 50+ reviews" };
  return { include: false, reason: "Not in Claude explicit healthcare include list" };
}

function vetsDecision(row) {
  if (includesName(row, vetsIncludeNames)) return { include: true, reason: "Claude explicit include" };
  return { include: false, reason: "Claude vets skip/not explicit include" };
}

function decide(category, row) {
  if (category === "restaurants") return restaurantDecision(row);
  if (category === "bars") return barDecision(row);
  if (category === "cafes") return cafeDecision(row);
  if (category === "healthcare") return healthcareDecision(row);
  if (category === "vets") return vetsDecision(row);
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
  const source = SOURCES[category];
  if (!existsSync(source)) throw new Error(`Source preview not found: ${source}`);
  const rows = JSON.parse(readFileSync(source, "utf8"));
  const approved = [];
  const skipped = [];

  for (const row of rows) {
    const decision = decide(category, row);
    if (decision.include) approved.push({ ...row, approval_reason: decision.reason });
    else skipped.push({ ...row, skip_reason: decision.reason });
  }

  mkdirSync("data/import-previews", { recursive: true });
  const approvedBackup = `data/import-previews/${category}-zone-topup-claude-approved-preview-${OUTPUT_STAMP}.json`;
  const outputPreview = MAIN_PREVIEWS[category];
  writeFileSync(approvedBackup, `${JSON.stringify(approved, null, 2)}\n`, "utf8");
  writeFileSync(outputPreview, `${JSON.stringify(approved, null, 2)}\n`, "utf8");
  const report = writeReport(category, approved, skipped, outputPreview, approvedBackup);

  return {
    category,
    source,
    report,
    approved_backup: approvedBackup,
    main_preview: outputPreview,
    source_rows: rows.length,
    approved: approved.length,
    skipped: skipped.length
  };
}

function main() {
  const categories = process.argv.slice(2).find((arg) => arg.startsWith("--categories="))?.slice("--categories=".length).split(",") ?? Object.keys(SOURCES);
  const results = categories.map((category) => processCategory(category.trim()));
  console.log(JSON.stringify({ results }, null, 2));
}

main();
