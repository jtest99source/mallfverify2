import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUTPUT_DIR = "reports";
const OUTPUT_PREVIEW = "data/import-previews/nightlife-preview.json";

const SOURCES = [
  {
    label: "general-topup",
    path: "data/import-previews/nightlife-general-topup-preview-2026-06-29T13-02-37-158Z.json",
    includes: [
      "Bar Ábaco",
      "Bar Nicolás",
      "Chapeau Palma",
      "Brassclub",
      "Agua Bar",
      "Shamrock Palma",
      "Gibson Bar",
      "the soho bar",
      "Atlantico Cocktail",
      "Es Princep Rooftop",
      "LAB Cocktail Bar",
      "Chakra",
      "Galactic Club",
      "Atomic Garden",
      "Up and Down",
      "La Bodeguita del Medio",
      "Intergalactic Bar",
      "DANCING COCKTAIL",
      "Cafe Lisboa",
      "LA MOVIDA Café Concierto",
      "Puerta 13",
      "Bar España",
      "FERVOR Palma",
      "Bar Cabrera",
      "La Pergola",
      "CatsMusics Jazz Club",
      "Xhaman Beach Club",
      "Chucca",
      "Bikkini Beach",
      "Marina Beach",
      "Anssia Gastrobeach",
      "El Chiringuito Beach House",
      "Balneario Illetas",
      "Purobeach Palma",
      "Purobeach Illetas",
      "Nikki Beach",
      "UM Beach House",
      "GALAXY Magaluf",
      "Red Lion",
      "Morgan's Pub",
      "JD Terrace Silent Disco",
      "Banana joe's",
      "Banana joes's",
      "Barbuda Beach",
      "ONEILLS",
      "Monroes",
      "The sunset bar",
      "Azur Beach Club",
      "McTavishes",
      "Splash Santa Ponça",
      "Flamingo's Pub",
      "Celts Well",
      "ALOHA Cocktail Bar",
      "The Crown",
      "PNG Sports Bar",
      "Calita Santa Ponça",
      "Dubliner Bar",
      "Mhares Sea Club",
      "Beach Club Gran Folies",
      "Beso Beach Mallorca",
      "Eclypse",
      "Savage Beach Club",
      "COCOA",
      "La Previa",
      "O'Malley's",
      "Shamrock Irish Pub Alcudia",
      "Legends Alcudia",
      "Port de la mar",
      "Faro Beach",
      "Sa Gavina Beach Club",
      "Coconar 17",
      "The Sea Club",
      "Cucum Beach House",
      "Tiki Beach",
      "Mosquito Sportbar",
      "The Nube",
      "Bora Bora",
      "Bahia Tropical",
      "Chucca Cala Rajada",
      "Beachclub Sa Cova",
      "Chocolate",
      "WunderBar",
      "Kalypsotuttifrutti",
      "Lola Cocktail",
      "Atlantis",
      "Mabu-Hay",
      "Budha Social Club",
      "Cala Gran Beach Club",
      "Egos Beach Club",
      "Egos Restaurant",
      "Aloha Cocktail Bar",
      "Cala Petita",
      "Dugan's Irish Pub",
      "Ponderosa Beach",
      "Barracuda",
      "Heaven Rooftop"
    ],
    skips: [
      "Replugged Vienna",
      "Bar Mallorca Alaquàs",
      "Restaurante Bar Mallorca",
      "Bar Mallorca Artés",
      "Menorca Experimental",
      "Es Corb Marí",
      "Ses Garces",
      "Puerto de Alcúdia",
      "Club de Mar",
      "FERGUS Style Cala Blanca",
      "Club Mac",
      "Mundo Fiesta Mallorca",
      "Sunlife Events Boat Charter",
      "Club Nautico Santa Ponça",
      "ShowGirls Lap Dance",
      "Femina Tabledance Club",
      "Stripclub Mallorca",
      "Anima Beach",
      "Brooklyn Club",
      "HavanaQ",
      "Sala Luna",
      "Amrum Beach Club",
      "EPIC Palma",
      "Beach Club H2O",
      "Soco Pool-Lounge",
      "Pure Azaya",
      "Malecon27",
      "Varadero Palma",
      "Manhattan's Santa Ponça",
      "Eden Paradise Karaoke",
      "Bar Havanna",
      "Mira Blau",
      "Cafe Milano",
      "Tropical Garden Cala d'Or",
      "Feestcafé Shooters",
      "Bar Havanna Arenal",
      "Bar Code 7",
      "Discoteca Living Music Club",
      "The Tavern Irish Pub Alcudia",
      "The Zanza Bar",
      "The Square Santa Ponça",
      "Keops Disco",
      "Beach Bar Paraiso",
      "ShowArena im Megapark",
      "Cartas Blancas Club Liberal",
      "Panama Jack Magaluf",
      "Jokers Club"
    ]
  },
  {
    label: "second-pass",
    path: "data/import-previews/nightlife-second-pass-preview-2026-06-29T13-16-47-592Z.json",
    includes: [
      "After Landing Cocktail Art",
      "Agabar",
      "Why Not?",
      "Bishop Wine Studio",
      "The Library STFU",
      "NOX",
      "Quentin'S Saloon",
      "Ginbo",
      "Coquetier",
      "Vinito vermuteria",
      "Turpial Cocktail Bar",
      "TROPICO BAR",
      "Amara",
      "Ventuno Bar",
      "Más Amor",
      "LAB",
      "Arlequin Restaurant & Cocktail Bar",
      "El Barito",
      "Café la Lonja",
      "Rooftop Sky Saratoga",
      "Skybar Almudaina",
      "Skybar Restaurant at Hotel Almudaina",
      "Latitude bar",
      "Hogan's Live Music",
      "Polka Bar",
      "Grand Siena",
      "Terra Restaurant & Cocktail Bar",
      "Vent Portixol",
      "GAELIC IRISH PUB",
      "Finnegan's Can Pastilla",
      "Auditorium de Palma",
      "Son Fusteret",
      "Hard Rock Cafe",
      "Finnegan's Magaluf",
      "Finnegan's Live Music Irish Pub",
      "Zeppelin Live Music Bar",
      "La Vista Bar and Kitchen",
      "The Three Brothers bar",
      "The Blue Bar",
      "Habana Suite",
      "The Three Lions Bar",
      "Windsor Bar",
      "JJ's Sports Lounge",
      "Sinky's Scottish Pub",
      "Eastenders Bar",
      "Moon Bar",
      "Dreams",
      "Papis Live Music",
      "Archies Bar",
      "Castaways Bar",
      "Taylor's Bebidas",
      "The Scotsman",
      "El Chaval Beach Club",
      "Roger's Beach Bar",
      "Alma Beach & Cocktail Bar",
      "Bar Rumba",
      "The Jaggy Thistle",
      "Daniel's Corner",
      "Sean's Place",
      "Green Man Cervecería",
      "Woodys Bar",
      "Mucky O'Marras",
      "Joker's Irish Pub Alcúdia",
      "Sgt Peppers",
      "Berganta Beach Club",
      "Doble A Beach Club",
      "Milano Beach",
      "Bar Los Amigos",
      "Café 3",
      "Smugglers",
      "La Bodeguita",
      "Mollys Irish Bistro",
      "Euphoria",
      "Yates's Sports Bar",
      "Sapoori Cala d'Or",
      "Papaya Polinesian Bar",
      "Bliss Marina",
      "Chiringuito Cala Sa Nau",
      "London Pub",
      "Jamaica Cocktail Bar",
      "Guap@s",
      "Pirates Can Picafort",
      "Trotter",
      "Geskes Bar",
      "Bar Europa",
      "THE RED LION",
      "William's Pub",
      "NUSA DUA BEACH CLUB"
    ],
    skips: [
      "O'Malley's Irish Pub",
      "LÕA",
      "Bar Café Coto",
      "Es Baluard Restaurante",
      "Cuit Hotel Nakar",
      "Purohotel Palma Bar",
      "BEATNIK Tapas",
      "Momo Portixol",
      "Momo Restaurant",
      "Bar Nosso",
      "proSecCo PORTIXOL",
      "Izizi Nunnak",
      "LILA PORTALS",
      "Lobster Club",
      "Restaurante Dolphin Palmanova",
      "Restaurante polideportivo Magaluf",
      "Bar-Restaurante Paraiso de Barbassa",
      "D&J chill Restaurant",
      "Bar Er Domi",
      "La Rubia Can Picafort",
      "Euforia Tapas",
      "Lennons Bar Magaluf",
      "Benny's Dinner",
      "Magaluf Club Pass",
      "MURO Beach",
      "Aubamar Rooftop",
      "Linekers Bar",
      "All Star's Beer House",
      "Font de sa cala",
      "Bar Sa Plaça",
      "Restaurante Bar Playa",
      "Bar Restaurante Cacatua",
      "Lennox The Pub",
      "Restaurante s'Ona Beach",
      "Magalluf Nite S L",
      "Peaky Blinders",
      "Singular Rooftop",
      "Rooftop El Llorenç",
      "Rusticonn Bar",
      "Chillout Magaluf",
      "Shepheartbar",
      "Stepps Music Bar",
      "Bar Diferent",
      "The Jolly Roger Pub",
      "Una Mas",
      "Bar Poker",
      "Bat Club",
      "Auditorio de Alcúdia",
      "MOAI Beach Club",
      "Boat House Bar",
      "O'Donnells",
      "Bogart Music Bar",
      "Pub Fernando",
      "Polinesian Bambu Tiki",
      "Playa Portals Nous Clavijo",
      "Playa Portals Nous Mallorca Clavijo",
      "Magaluf Square",
      "Es Pou Beach-bar"
    ]
  }
];

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

async function fetchExistingNightlife(supabase) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("businesses")
      .select("google_place_id,slug,status,name,display_name,category,address")
      .eq("category", "nightlife")
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  return rows;
}

function skipReason(row, normalizedSkips) {
  const rowName = normalize(row.name);
  const match = normalizedSkips.find(({ raw, normalized }) => {
    if (!rowName || !normalized) return false;
    return rowName === normalized || rowName.includes(normalized) || normalized.includes(rowName);
  });
  return match ? `Claude skip: ${match.raw}` : null;
}

function includeReason(row, normalizedIncludes) {
  const rowName = normalize(row.name);
  const match = normalizedIncludes.find(({ raw, normalized }) => {
    if (!rowName || !normalized) return false;
    return rowName === normalized || rowName.includes(normalized) || normalized.includes(rowName);
  });
  return match ? `Claude include: ${match.raw}` : null;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const existingRows = await fetchExistingNightlife(supabase);
  const existingPlaceIds = new Map(
    existingRows
      .filter((row) => row.google_place_id)
      .map((row) => [row.google_place_id, row])
  );

  const approved = [];
  const excluded = [];
  const seenPlaceIds = new Map();

  for (const source of SOURCES) {
    if (!existsSync(source.path)) throw new Error(`Source preview not found: ${source.path}`);
    const rows = JSON.parse(readFileSync(source.path, "utf8"));
    const normalizedSkips = source.skips.map((raw) => ({ raw, normalized: normalize(raw) }));
    const normalizedIncludes = (source.includes ?? []).map((raw) => ({ raw, normalized: normalize(raw) }));

    for (const row of rows) {
      const existing = row.google_place_id ? existingPlaceIds.get(row.google_place_id) : null;
      if (existing) {
        excluded.push({ source: source.label, row, reason: `already in DB: ${existing.status}:${existing.slug}` });
        continue;
      }

      const skipped = skipReason(row, normalizedSkips);
      if (skipped) {
        excluded.push({ source: source.label, row, reason: skipped });
        continue;
      }

      const included = includeReason(row, normalizedIncludes);
      if (!included) {
        excluded.push({ source: source.label, row, reason: "not in Claude include list" });
        continue;
      }

      if (row.google_place_id && seenPlaceIds.has(row.google_place_id)) {
        excluded.push({ source: source.label, row, reason: `duplicate in reviewed previews: ${seenPlaceIds.get(row.google_place_id)}` });
        continue;
      }

      if (row.google_place_id) seenPlaceIds.set(row.google_place_id, source.label);
      approved.push({ ...row, category: "nightlife" });
    }
  }

  mkdirSync("data/import-previews", { recursive: true });
  writeFileSync(OUTPUT_PREVIEW, `${JSON.stringify(approved, null, 2)}\n`);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `nightlife-reviewed-combined-approved-filter-${stamp}.md`);
  const lines = [
    "# Nightlife Reviewed Combined Approved Filter",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Sources",
    "",
    ...SOURCES.map((source) => `- ${source.label}: ${source.path}`),
    "",
    "## Totals",
    "",
    `- Existing DB rows checked: ${existingRows.length}`,
    `- Approved rows written: ${approved.length}`,
    `- Excluded rows: ${excluded.length}`,
    `- Output preview: ${OUTPUT_PREVIEW}`,
    "",
    "## Approved",
    "",
    "| Name | Rating | Reviews | Type | Address |",
    "| --- | ---: | ---: | --- | --- |",
    ...approved.map((row) => `| ${fmt(row.name)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.address)} |`),
    "",
    "## Excluded",
    "",
    "| Source | Name | Reason | Rating | Reviews | Address |",
    "| --- | --- | --- | ---: | ---: | --- |",
    ...excluded.map(({ source, row, reason }) => `| ${fmt(source)} | ${fmt(row.name)} | ${fmt(reason)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.address)} |`)
  ];
  writeFileSync(reportPath, `${lines.join("\n")}\n`);

  console.log(JSON.stringify({ approved: approved.length, excluded: excluded.length, output_preview: OUTPUT_PREVIEW, report: reportPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
