import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import XLSX from "xlsx";

const defaultSource = "C:/Users/user/Downloads/mallorcaverified_screening_by_municipality_v2.xlsx";
const source = process.argv[2] || defaultSource;
const output = process.argv[3] || `reports/screening-vs-db-${new Date().toISOString().slice(0, 10)}.md`;
const workbookOutput = output.replace(/\.md$/i, ".xlsx");

function loadEnv() {
  const envPath = ".env.local";
  if (!fs.existsSync(envPath)) return process.env;
  const env = { ...process.env };
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 0) continue;
    env[trimmed.slice(0, index)] = trimmed.slice(index + 1);
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

const categoryMap = {
  restaurants: "restaurant",
  hotels: "hotel",
  "beach clubs": "beach-club",
  "boat rental": "boat-rental",
  activities: "activity",
  beaches: "beach",
  bars: "bar",
  cafes: "cafe",
  bakeries: "bakery",
  spas: "spa",
  gyms: "gym",
  healthcare: "healthcare",
  "real estate": "real-estate",
  "rent a car": "rent-a-car",
  "car dealers": "car-dealer",
  casinos: "casino",
  vets: "veterinarian"
};

const priorityOrder = {
  "Must-have": 0,
  High: 1,
  Medium: 2,
  Low: 3
};

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\b(s\.?l\.?|sl|s\.a\.?|sa|mallorca|majorca|palma|soller|alcudia|andratx|calvia|manacor|inca|marratxi|pollenca|pollensa|santanyi|valldemossa|sineu|felanitx|campos|muro|petra|porreres|binissalem|llucmajor|esporles|estellencs|banyalbufar|fornalutx|bunyola|campaign|sencelles|montuiri|restaurant|restaurante|bar|cafe|cafeteria|hotel|hostal|finca|agroturismo|clinica|dental|inmobiliaria|real estate|properties|property|boats?|charter|rent a car|alquiler|spa|massage|masaje)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compact(value) {
  return normalize(value).replace(/\s+/g, "");
}

function tokens(value) {
  return new Set(normalize(value).split(" ").filter((token) => token.length > 1));
}

function jaccard(a, b) {
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size || !right.size) return 0;
  let intersection = 0;
  for (const item of left) if (right.has(item)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}

function locationText(row) {
  return normalize([row.municipality, row.city, row.area].join(" "));
}

function candidateLocationText(row) {
  return normalize([row.municipality, row.area_or_neighborhood].join(" "));
}

function categoryFor(row) {
  return categoryMap[String(row.category || "").toLowerCase()] || String(row.category || "").toLowerCase();
}

function scoreCandidate(candidate, business) {
  const names = business.__names || [business.name, business.display_name, business.original_name].filter(Boolean);
  const nameScore = Math.max(
    ...names.map((name) => {
      const candidateName = compact(candidate.business_name);
      const businessName = business.__compactNames?.get(name) || compact(name);
      if (candidateName && businessName && candidateName === businessName) return 1;
      if (candidateName && businessName && (candidateName.includes(businessName) || businessName.includes(candidateName)) && Math.min(candidateName.length, businessName.length) >= 7) return 0.92;
      return jaccard(candidate.business_name, name);
    })
  );
  const categoryScore = business.category === categoryFor(candidate) ? 1 : 0;
  const candidateLocation = candidateLocationText(candidate);
  const businessLocation = locationText(business);
  const locationScore =
    candidateLocation &&
    businessLocation &&
    (candidateLocation.includes(businessLocation) ||
      businessLocation.includes(candidateLocation) ||
      candidateLocation.split(" ").some((token) => token.length > 3 && businessLocation.includes(token)))
      ? 1
      : 0;

  return nameScore + categoryScore * 0.18 + locationScore * 0.12;
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = item.row[key] || "(blank)";
    counts[value] = (counts[value] || 0) + 1;
    return counts;
  }, {});
}

function tableValue(value) {
  return String(value || "").replace(/\|/g, "/");
}

async function fetchBusinesses() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const rows = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,original_name,display_name,category,status,municipality,city,area,google_place_id,google_maps_url")
      .range(from, from + pageSize - 1);

    if (error) throw error;
    rows.push(...(data || []));
    if ((data || []).length < pageSize) break;
  }

  return rows;
}

function readScreeningRows() {
  const workbook = XLSX.readFile(source);
  const sheet = workbook.Sheets.Screening;
  if (!sheet) throw new Error("Workbook does not contain a Screening sheet.");
  return XLSX.utils.sheet_to_json(sheet, { defval: "" }).map((row, index) => ({ ...row, __row: index + 2 }));
}

async function main() {
  const screeningRows = readScreeningRows();
  const businesses = await fetchBusinesses();
  const exactName = new Map();
  const tokenIndex = new Map();

  for (const business of businesses) {
    business.__names = [business.name, business.display_name, business.original_name].filter(Boolean);
    business.__compactNames = new Map(business.__names.map((name) => [name, compact(name)]));
    business.__tokenText = business.__names.join(" ");
    business.__tokens = tokens(business.__tokenText);
  }

  for (const business of businesses) {
    for (const name of business.__names) {
      const key = business.__compactNames.get(name);
      if (!key) continue;
      if (!exactName.has(key)) exactName.set(key, []);
      exactName.get(key).push(business);
    }
    for (const token of business.__tokens) {
      if (token.length < 3) continue;
      if (!tokenIndex.has(token)) tokenIndex.set(token, []);
      tokenIndex.get(token).push(business);
    }
  }

  const classified = screeningRows.map((row) => {
    const key = compact(row.business_name);
    const exact = (exactName.get(key) || [])
      .map((business) => ({ business, score: scoreCandidate(row, business), kind: "exact" }))
      .sort((a, b) => b.score - a.score);

    let best = exact[0];
    if (!best) {
      const candidates = new Map();
      for (const token of tokens(row.business_name)) {
        if (token.length < 3) continue;
        for (const business of tokenIndex.get(token) || []) candidates.set(business.id, business);
      }
      best = Array.from(candidates.values())
        .map((business) => ({ business, score: scoreCandidate(row, business), kind: "fuzzy" }))
        .filter((match) => match.score >= 0.82)
        .sort((a, b) => b.score - a.score)[0];
    }

    let status = "missing";
    if (best?.score >= 1.05 || (best?.kind === "exact" && best.score >= 0.9)) status = "present";
    else if (best?.score >= 0.82) status = "possible_match";

    return { row, status, match: best };
  });

  const missing = classified.filter((item) => item.status === "missing");
  const possible = classified.filter((item) => item.status === "possible_match");
  const present = classified.filter((item) => item.status === "present");

  missing.sort(
    (a, b) =>
      (priorityOrder[a.row.priority] ?? 9) - (priorityOrder[b.row.priority] ?? 9) ||
      String(a.row.municipality).localeCompare(String(b.row.municipality), "es") ||
      String(a.row.category).localeCompare(String(b.row.category), "es") ||
      String(a.row.business_name).localeCompare(String(b.row.business_name), "es")
  );
  possible.sort(
    (a, b) =>
      String(a.row.municipality).localeCompare(String(b.row.municipality), "es") ||
      String(a.row.business_name).localeCompare(String(b.row.business_name), "es")
  );

  const lines = [];
  lines.push("# Screening vs DB report");
  lines.push("");
  lines.push(`Source: ${source}`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`- Screening rows: ${screeningRows.length}`);
  lines.push(`- DB businesses checked: ${businesses.length}`);
  lines.push(`- Present: ${present.length}`);
  lines.push(`- Possible matches to review: ${possible.length}`);
  lines.push(`- Missing / not found: ${missing.length}`);
  lines.push("");
  lines.push("## Missing by priority");
  for (const [key, value] of Object.entries(countBy(missing, "priority")).sort((a, b) => (priorityOrder[a[0]] ?? 9) - (priorityOrder[b[0]] ?? 9))) lines.push(`- ${key}: ${value}`);
  lines.push("");
  lines.push("## Missing by category");
  for (const [key, value] of Object.entries(countBy(missing, "category")).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"))) lines.push(`- ${key}: ${value}`);
  lines.push("");
  lines.push("## Missing candidates");
  lines.push("| Priority | Municipality | Area | Category | Business | Row |");
  lines.push("|---|---|---|---|---|---:|");
  for (const item of missing) {
    const row = item.row;
    lines.push(`| ${tableValue(row.priority)} | ${tableValue(row.municipality)} | ${tableValue(row.area_or_neighborhood)} | ${tableValue(row.category)} | ${tableValue(row.business_name)} | ${row.__row} |`);
  }
  lines.push("");
  lines.push("## Possible matches to review before importing");
  lines.push("| Municipality | Category | Screening business | Possible DB match | DB category/status | Score | Row |");
  lines.push("|---|---|---|---|---|---:|---:|");
  for (const item of possible) {
    const row = item.row;
    const business = item.match.business;
    lines.push(`| ${tableValue(row.municipality)} | ${tableValue(row.category)} | ${tableValue(row.business_name)} | ${tableValue(business.display_name || business.name)} | ${business.category}/${business.status} | ${item.match.score.toFixed(2)} | ${row.__row} |`);
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, lines.join("\n"));

  const resultWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    resultWorkbook,
    XLSX.utils.json_to_sheet(
      missing.map((item) => ({
        priority: item.row.priority,
        municipality: item.row.municipality,
        area_or_neighborhood: item.row.area_or_neighborhood,
        category: item.row.category,
        business_name: item.row.business_name,
        source_row: item.row.__row,
        verification_status: item.row.verification_status
      }))
    ),
    "Missing"
  );
  XLSX.utils.book_append_sheet(
    resultWorkbook,
    XLSX.utils.json_to_sheet(
      possible.map((item) => ({
        municipality: item.row.municipality,
        area_or_neighborhood: item.row.area_or_neighborhood,
        category: item.row.category,
        business_name: item.row.business_name,
        possible_db_match: item.match.business.display_name || item.match.business.name,
        db_category: item.match.business.category,
        db_status: item.match.business.status,
        db_slug: item.match.business.slug,
        score: Number(item.match.score.toFixed(2)),
        source_row: item.row.__row
      }))
    ),
    "Possible matches"
  );
  XLSX.writeFile(resultWorkbook, workbookOutput);

  console.log(
    JSON.stringify(
      {
        sourceRows: screeningRows.length,
        dbRows: businesses.length,
        present: present.length,
        possible: possible.length,
        missing: missing.length,
        report: output,
        workbook: workbookOutput,
        missingByPriority: countBy(missing, "priority"),
        missingByCategory: countBy(missing, "category")
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
