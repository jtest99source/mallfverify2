import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "reports";

const DECISIONS = {
  healthcare: {
    previewPath: "data/import-previews/healthcare-general-topup-preview-2026-06-29T12-31-06-652Z.json",
    outputPath: "data/import-previews/healthcare-preview.json",
    approvedPath: "data/import-previews/healthcare-approved-26-import-preview-2026-06-29.json",
    mode: "skip",
    names: [
      "Juaneda Hospital Mahón",
      "Juaneda Hospital Ciutadella",
      "CLINICA DENTAL MORENO GARCIA",
      "EónClinic. Dra. Marta Payá - Cirugía Plástica y Medicina Estética. Fisioterapia",
      "Clínica Áureo | Clínica de Medicina Estética en Palma",
      "Clínica de Medicina Estética en Palma de Mallorca - Klinik Ventura",
      "CM CLINIC – Medicina Estética y Cirugía Plástica en Mallorca",
      "GB Clinic - Medicina estética avanzada en Palma de Mallorca",
      "Clínica Mesomedic - Medicina Estética en Manacor",
      "Medicina Estética Mallorca - IBaME Port Pollensa",
      "Clínica Medical Oasis Playa de Palma",
      "MZK MEDICAL MALLORCA",
      "Fisiomallorca - Physiotherapy Mallorca",
      "Clinica EQUILIBRI",
      "Hospital Sant Joan de Déu :Mallorca Health Care",
      "Dr. Alejandro Moral Caballero, Médico general",
      "ArztZentrum Santa Ponsa",
      "Dr. Guillermo Til Pérez",
      "Besant",
      "Centro de Urología Andrología y Medicina Sexual",
      "Doctor in Cala Ratjada - Doctor Mallorca",
      "Centro Médico Porto Pi",
      "Medical Center Doctor Arzt Cala d'Or by IMS Medical",
      "Policlinic Cala Millor EMERGENCIES 24 horas",
      "Clínicas CRES Mallorca",
      "Dr. Juan Roig Cañellas. Especialista en Medicina del Deporte. Especialista U. en Trauma del Deporte.",
      "Germán Rehermann"
    ]
  },
  "real-estate": {
    previewPath: "data/import-previews/real-estate-general-topup-preview-2026-06-29T12-31-52-459Z.json",
    outputPath: "data/import-previews/real-estate-preview.json",
    mode: "include",
    names: [
      "Fincas Fiol",
      "Living Blue Mallorca - Santa María del Camí",
      "Inmobiliaria Film Houses",
      "BAUZÁ INMOBILIARIA",
      "JH Real Estate Mallorca",
      "Mallorca Mietbörse S.L. - Inmobiliaria Portixol",
      "Inmobiliaria en Palma · Balear Living",
      "KENSINGTON Finest Properties International - Arta / Mallorca",
      "Mallorcabyrån Real Estate",
      "Mundo Pisos Plaza París",
      "Fastighetsbyrån Palma de Mallorca",
      "Fine Estates Mallorca | Real Estate & Service",
      "PALMA ORIGEN BY INMOIB",
      "Vinci Group Real Estate Inmobiliaria Mallorca",
      "TaylorBuilding Real Estate | Inmobiliaria y Promotora en Mallorca.",
      "Smârthöme Mallorca - Real Estate",
      "Feelings Real Estate",
      "Kingsber Property Mallorca",
      "Ready to Live"
    ]
  }
};

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

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function argValue(name) {
  const arg = process.argv.slice(2).find((item) => item.startsWith(`--${name}=`));
  return arg ? arg.slice(name.length + 3).trim() : null;
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function categoryForDb(category) {
  return category === "real-estate" ? "real-estate" : category;
}

async function fetchExisting(supabase, category) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("businesses")
      .select("google_place_id,slug,status,name,display_name")
      .eq("category", categoryForDb(category))
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

function loadApprovedRows(path) {
  if (!path) return [];
  if (!existsSync(path)) throw new Error(`Approved file not found: ${path}`);
  return JSON.parse(readFileSync(path, "utf8"));
}

async function main() {
  loadLocalEnv();
  const category = argValue("category");
  const decision = DECISIONS[category];
  if (!decision) throw new Error(`Unknown category. Use one of: ${Object.keys(DECISIONS).join(", ")}`);

  const supabase = createSupabaseClient();
  const sourceRows = JSON.parse(readFileSync(decision.previewPath, "utf8"));
  const existingRows = await fetchExisting(supabase, category);
  const approvedRows = loadApprovedRows(decision.approvedPath);

  const existingPlaceIds = new Set(existingRows.map((row) => row.google_place_id).filter(Boolean));
  const existingNames = new Set(existingRows.map((row) => normalize(row.display_name || row.name)).filter(Boolean));
  const alreadyApprovedPlaceIds = new Set(approvedRows.map((row) => row.google_place_id).filter(Boolean));
  const alreadyApprovedNames = new Set(approvedRows.map((row) => normalize(row.name)).filter(Boolean));
  const decisionNames = new Set(decision.names.map(normalize));

  const newRows = [];
  const removedExisting = [];
  for (const row of sourceRows) {
    const rowName = normalize(row.name);
    if (
      (row.google_place_id && existingPlaceIds.has(row.google_place_id)) ||
      existingNames.has(rowName) ||
      (row.google_place_id && alreadyApprovedPlaceIds.has(row.google_place_id)) ||
      alreadyApprovedNames.has(rowName)
    ) {
      removedExisting.push(row);
    } else {
      newRows.push(row);
    }
  }

  let kept;
  let skipped;
  if (decision.mode === "include") {
    kept = newRows.filter((row) => decisionNames.has(normalize(row.name)));
    skipped = newRows.filter((row) => !decisionNames.has(normalize(row.name)));
  } else {
    kept = newRows.filter((row) => !decisionNames.has(normalize(row.name)));
    skipped = newRows.filter((row) => decisionNames.has(normalize(row.name)));
  }

  const missingDecisionNames = decision.mode === "include"
    ? [...decisionNames].filter((name) => !kept.some((row) => normalize(row.name) === name))
    : [...decisionNames].filter((name) => !skipped.some((row) => normalize(row.name) === name));

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${decision.outputPath.replace(/\.json$/, "")}-before-reviewed-topup-filter-${stamp}.json`;
  if (existsSync(decision.outputPath)) {
    writeFileSync(backupPath, readFileSync(decision.outputPath, "utf8"), "utf8");
  }
  writeFileSync(decision.outputPath, `${JSON.stringify(kept, null, 2)}\n`, "utf8");

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const reportPath = join(OUTPUT_DIR, `${category}-reviewed-topup-approved-filter-${stamp}.md`);
  const lines = [
    `# ${category} Reviewed Top-Up Approved Filter`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    "",
    `- Source preview: ${decision.previewPath}`,
    `- Source rows: ${sourceRows.length}`,
    `- Existing/already approved rows removed before decision filter: ${removedExisting.length}`,
    `- New rows evaluated: ${newRows.length}`,
    `- Approved rows kept in import preview: ${kept.length}`,
    `- Skipped rows: ${skipped.length}`,
    `- Output import preview: ${decision.outputPath}`,
    existsSync(backupPath) ? `- Previous output backup: ${backupPath}` : "- Previous output backup: -",
    missingDecisionNames.length ? `- Warning: decision names not matched: ${missingDecisionNames.join(", ")}` : "- Decision names not matched: 0",
    "",
    "## Kept For Import",
    "",
    "| Name | Rating | Reviews | Type | Website | Address |",
    "|---|---:|---:|---|---|---|",
    ...kept.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`),
    "",
    "## Skipped",
    "",
    "| Name | Rating | Reviews | Type | Website | Address |",
    "|---|---:|---:|---|---|---|",
    ...skipped.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.address)} |`)
  ];

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({
    category,
    report: reportPath,
    output_preview: decision.outputPath,
    backup: existsSync(backupPath) ? backupPath : null,
    kept: kept.length,
    skipped: skipped.length,
    removed_existing_or_approved: removedExisting.length,
    missing_decision_names: missingDecisionNames
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
