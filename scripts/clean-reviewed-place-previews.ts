import fs from "node:fs";
import path from "node:path";

type PreviewPlace = {
  name?: string;
  google_place_id?: string;
  rating?: number;
  reviews_count?: number;
  primary_type?: string;
};

type RemovalRule = {
  file: string;
  tokens: string[];
  reason: string;
};

const rules: RemovalRule[] = [
  {
    file: "data/import-previews/car-dealers-preview.json",
    tokens: ["Autos Mallorca", "ClickRent", "Die Autowerkstatt Mallorca"],
    reason: "No son concesionarios: alquiler/taller detectado en revision manual.",
  },
  {
    file: "data/import-previews/rent-a-car-preview.json",
    tokens: ["Limo Mallorca"],
    reason: "Servicio de limusina con conductor, fuera de rent-a-car self-drive.",
  },
  {
    file: "data/import-previews/spas-preview.json",
    tokens: [
      "Erotic Paradise",
      "Energy Tantric Massage",
      "Tantra Paraiso",
      "Natalia Grosso Dancer",
    ],
    reason: "Masajes adultos o categoria incorrecta para spas/wellness publico.",
  },
  {
    file: "data/import-previews/real-estate-preview.json",
    tokens: [
      "Parasol Property Mallorca",
      "JS Villas",
      "MONTEMAR FERIENIMMOBILIEN",
      "Mallorcaprivat Ferienappartements",
    ],
    reason: "Alquiler vacacional/lodging, no agencia inmobiliaria para compraventa/expats.",
  },
];

const reviewNotes = [
  "healthcare-preview.json: German Clinic Marbella queda para verificacion manual; no se elimina automaticamente.",
  "rent-a-car-preview.json: GT Rentals se mantiene como alquiler premium/chauffeur borderline ya publicado.",
  "rent-a-car-preview.json: ROIG Mobility & Experiences se mantiene por marca real de movilidad/alquiler.",
  "spas-preview.json: Lorena almagro hair spa queda para revision manual; no se elimina automaticamente.",
  "real-estate-preview.json: Inmobiliaria Port, Pine walk Apartments y Dickinson Villas quedan para revision manual.",
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function readJson(file: string): PreviewPlace[] {
  return JSON.parse(fs.readFileSync(file, "utf8")) as PreviewPlace[];
}

const reportLines: string[] = [
  "# Preview cleanup after manual review",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "Only clear false positives were removed. Borderline entries remain for manual review.",
  "",
  "## Removed",
  "",
];

let totalRemoved = 0;

for (const rule of rules) {
  const fullPath = path.join(process.cwd(), rule.file);
  const before = readJson(fullPath);
  const normalizedTokens = rule.tokens.map(normalize);
  const removed: PreviewPlace[] = [];
  const kept = before.filter((place) => {
    const normalizedName = normalize(place.name ?? "");
    const shouldRemove = normalizedTokens.some((token) => normalizedName.includes(token));
    if (shouldRemove) {
      removed.push(place);
      return false;
    }
    return true;
  });

  fs.writeFileSync(fullPath, `${JSON.stringify(kept, null, 2)}\n`);
  totalRemoved += removed.length;

  reportLines.push(
    `### ${rule.file}`,
    "",
    `Before: ${before.length}`,
    `After: ${kept.length}`,
    `Removed: ${removed.length}`,
    `Reason: ${rule.reason}`,
    "",
  );

  for (const place of removed) {
    reportLines.push(
      `- ${place.name ?? "(sin nombre)"} | ${place.rating ?? "n/a"}★ | ${place.reviews_count ?? "n/a"} reviews | ${place.primary_type ?? "n/a"} | ${place.google_place_id ?? "n/a"}`,
    );
  }

  reportLines.push("");
}

reportLines.push("## Kept For Manual Review", "");
for (const note of reviewNotes) {
  reportLines.push(`- ${note}`);
}
reportLines.push("", `Total removed: ${totalRemoved}`, "");

const reportPath = path.join(
  process.cwd(),
  "reports",
  `preview-cleanup-${new Date().toISOString().replace(/[:.]/g, "-")}.md`,
);
fs.writeFileSync(reportPath, reportLines.join("\n"));

console.log(`Removed ${totalRemoved} false positives.`);
console.log(`Report: ${path.relative(process.cwd(), reportPath)}`);
