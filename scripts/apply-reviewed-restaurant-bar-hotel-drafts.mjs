import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;
const OUTPUT_DIR = "reports";
const CATEGORIES = ["restaurant", "bar", "hotel"];

const RULES = {
  restaurant: { minRating: 4.0, minReviews: 50 },
  bar: { minRating: 4.0, minReviews: 30 },
  hotel: { minRating: 4.1, minReviews: 80 }
};

const RESTAURANT_PUBLISH = [
  "Lehne Burger",
  "AU IDO BURGER",
  "El cornudo",
  "Restaurante Hedonist Club",
  "Can Simoneta GASTRONOMIC",
  "Restaurant Es Revellar",
  "Restaurante Sorra",
  "Mr. Grill",
  "NOMON",
  "Motti Burger",
  "Restaurant Esencia",
  "La Pasión Art & Wine Bar",
  "La Pasión - Restaurant, Art & Wine Bar",
  "Little Brunch x Little Burger",
  "La Ola Restaurante",
  "Agapanto",
  "Charlie&Co",
  "ANIMA SINEU",
  "Restaurante Zezena",
  "La Palmera Capdepera",
  "MAR&DUIX",
  "PACO & BEGOÑA",
  "Triple A",
  "Qanat de Treurer",
  "Vorera"
];

const RESTAURANT_KEEP_DRAFT = [
  "Restaurante Singular",
  "Cas Padrins",
  "Il Tano Ciudad Jardín",
  "Mar Sea Club",
  "Hotelet ca n'Oms",
  "Hotelet de ca n'Oms",
  "House of sushi Alcudia",
  "Melassa Restaurant",
  "Restaurant Ses Comes Llubí",
  "DIVERSI",
  "Bar Ristopizza Flavour",
  "BUNSEN BURGER",
  "D'Elina",
  "Paris plage paguera"
];

const RESTAURANT_MOVE_TO_BAKERY = [
  "Pastisseria Ca Na Cati",
  "Forn del Santo Cristo",
  "Horno Santo Cristo",
  "Forn des Pont",
  "Forn San Agustin"
];

const RESTAURANT_MOVE_TO_CAFE = ["Can Menescal", "S'Espipellada"];

const RESTAURANT_HIDE = [
  "Pescados Miró",
  "Pescadería El Puerto de Marcos",
  "Peixateria Ciutat",
  "Sa Peixateria Mayol Mesquida",
  "Mercat Ecològic",
  "Peixos Diego",
  "Sa Botiga d'es Peix",
  "Peixateria Ca N'Aina",
  "Pescados Oliver",
  "Pescados Antonio Mesquida",
  "Arrocesmallorca"
];

const BAR_PUBLISH = [
  "EL BASTO COCTELERIA",
  "Sumiller Sineu",
  "Es Magatzem / The Warehouse",
  "VINOTECA",
  "Pamboleiro",
  "VERMUTERIA JUANITA"
];

const BAR_KEEP_DRAFT = [
  "Freedom Shisha Lounge"
];

const BAR_MOVE_TO_RESTAURANT = [
  "Tim's",
  "Sa Cova dets Ases",
  "Sa Fustería",
  "Meson El Quijote",
  "Ca'n Lluc",
  "Es Magatzem Fat y Salat",
  "Antic Celler San Toreó",
  "Mon de vins",
  "Es Trast",
  "de moniö"
];

const BAR_HIDE = ["The Jazz Lounge", "El Momento", "rooftop dining palma"];

const HOTEL_PUBLISH = [
  "Marins Naiya",
  "Finca Son Oms",
  "Hotel Son Xotano",
  "Finca Sa Bastida",
  "Hostal Boutique Canyamel"
];

const HOTEL_KEEP_DRAFT = [
  "Can Colom",
  "Apartaments Marina Sol i Pins",
  "Hotel Ca'n Reus",
  "Hotel de Interior Can Beia",
  "Ca'n Pera",
  "Casa Familiar Sa Vinya d'Es Trenc",
  "Apartamentos Maricel",
  "Hotel Nou Can Guillem",
  "Finca Rustica Ca'n Martorell"
];

const HOTEL_HIDE = [
  "Agroturismo Son Penyaflor",
  "Hotel Samos",
  "Hotel Palma Bellver",
  "Globales Mimosa",
  "Sol Guadalupe",
  "Hotel Castell dels Hams",
  "TRH Jardín del Mar",
  "Globales Santa Ponsa Park",
  "Sol House Mallorca",
  "Globales Maioris",
  "HM Mar Blau",
  "Hotel Hesperia",
  "Caramelo Calviá Beach",
  "Hotel Kilimanjaro",
  "Hotel Agua Beach",
  "Hotel Raxa",
  "Petit Hotel Sant Salvador",
  "Petit Hotel Hostatgeria Sant Salvador",
  "Hotel Nura Santa Ponsa",
  "La Santa María Playa",
  "Senator Cala Millor",
  "Hostal Can Tiu",
  "Caprice Sa Coma Park",
  "Casa En Alquiler Vacacional",
  "Ideal Property El Palmeral",
  "Ideal Property Mallorca"
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

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function matches(row, names) {
  const value = normalize(`${publicName(row)} ${row.slug}`);
  return names.find((name) => {
    const needle = normalize(name);
    return value === needle || value.includes(needle) || needle.includes(normalize(publicName(row)));
  });
}

function rawTypes(row) {
  const raw = row.raw_google_place;
  const types = raw && Array.isArray(raw.types) ? raw.types.filter((item) => typeof item === "string") : [];
  return [...new Set([row.primary_type ?? "", ...types].filter(Boolean))];
}

function categoryFit(row) {
  const types = rawTypes(row);
  const text = normalize(`${publicName(row)} ${row.website ?? ""} ${types.join(" ")}`);
  if (row.category === "restaurant") {
    if (types.some((type) => type.includes("restaurant")) || /restaurant|restaurante|pizzeria|burger|tapas|grill|steak|cocina/.test(text)) return "good";
    if (/bar|cafe|bakery|hotel|lodging|store|market/.test(text)) return "review";
    return "weak";
  }
  if (row.category === "bar") {
    if (types.some((type) => type.includes("bar") || type === "pub") || /bar|pub|cocktail|wine|sports bar|chiringuito/.test(text)) return "good";
    if (/restaurant|cafe|hotel|store|market/.test(text)) return "review";
    return "weak";
  }
  if (row.category === "hotel") {
    if (types.some((type) => type.includes("hotel") || type === "lodging") || /hotel|hostal|resort|apartament|finca/.test(text)) return "good";
    if (/restaurant|bar|cafe|real estate|store/.test(text)) return "review";
    return "weak";
  }
  return "review";
}

function decisionTier(row) {
  const rule = RULES[row.category] ?? { minRating: 0, minReviews: 0 };
  const rating = row.rating ?? 0;
  const reviews = row.reviews_count ?? 0;
  const fit = categoryFit(row);
  if (fit === "good" && rating >= rule.minRating && reviews >= rule.minReviews) return "publish_candidates";
  if (fit === "good" && rating >= rule.minRating && reviews >= Math.floor(rule.minReviews * 0.5)) return "borderline_thin";
  if (fit !== "good") return "category_review";
  return "likely_skip_threshold";
}

async function fetchDrafts(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,status,category,city,area,municipality,address,rating,reviews_count,website,primary_type,raw_google_place")
      .in("category", CATEGORIES)
      .eq("status", "draft")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

function classify(row) {
  const tier = decisionTier(row);

  if (row.category === "restaurant") {
    if (matches(row, RESTAURANT_MOVE_TO_BAKERY)) return { action: "move", toCategory: "bakery", reason: "Claude: move to bakery" };
    if (matches(row, RESTAURANT_MOVE_TO_CAFE)) return { action: "move", toCategory: "cafe", reason: "Claude: move to cafe" };
    if (matches(row, RESTAURANT_HIDE)) return { action: "hide", reason: "Claude: skip restaurant category review" };
    if (matches(row, RESTAURANT_KEEP_DRAFT)) return { action: "keep_draft", reason: "Claude: keep draft" };
    if (tier === "publish_candidates") return { action: "publish", reason: "Claude: publish restaurant candidate block" };
    if (matches(row, RESTAURANT_PUBLISH)) return { action: "publish", reason: "Claude: publish restaurant borderline" };
    if (tier === "likely_skip_threshold") return { action: "hide", reason: "Claude: likely skip under 25 reviews" };
    return { action: "keep_draft", reason: `unmatched restaurant ${tier}` };
  }

  if (row.category === "bar") {
    if (matches(row, BAR_MOVE_TO_RESTAURANT)) return { action: "move", toCategory: "restaurant", reason: "Claude: move bar to restaurant" };
    if (matches(row, BAR_HIDE)) return { action: "hide", reason: "Claude: skip weak bar" };
    if (matches(row, BAR_KEEP_DRAFT)) return { action: "keep_draft", reason: "Claude: keep draft" };
    if (tier === "publish_candidates") return { action: "publish", reason: "Claude: publish bar candidate block" };
    if (matches(row, BAR_PUBLISH)) return { action: "publish", reason: "Claude: publish bar borderline/category review" };
    return { action: "keep_draft", reason: `unmatched bar ${tier}` };
  }

  if (row.category === "hotel") {
    if (matches(row, HOTEL_HIDE)) return { action: "hide", reason: "Claude: skip hotel" };
    if (matches(row, HOTEL_KEEP_DRAFT)) return { action: "keep_draft", reason: "Claude: keep hotel draft" };
    if (tier === "publish_candidates") return { action: "publish", reason: "Claude: publish hotel candidate block" };
    if (matches(row, HOTEL_PUBLISH)) return { action: "publish", reason: "Claude: publish hotel borderline" };
    if (tier === "likely_skip_threshold") return { action: "hide", reason: "Claude: skip hotel likely threshold" };
    return { action: "keep_draft", reason: `unmatched hotel ${tier}` };
  }

  return { action: "keep_draft", reason: "unhandled category" };
}

async function applyActions(supabase, decisions) {
  const now = new Date().toISOString().slice(0, 10);
  for (const { row, decision } of decisions) {
    if (decision.action === "publish") {
      const { error } = await supabase.from("businesses").update({ status: "published", updated_at: now }).eq("id", row.id);
      if (error) throw error;
    }
    if (decision.action === "hide") {
      const { error } = await supabase.from("businesses").update({ status: "hidden", updated_at: now }).eq("id", row.id);
      if (error) throw error;
    }
    if (decision.action === "move") {
      const { error } = await supabase.from("businesses").update({ category: decision.toCategory, updated_at: now }).eq("id", row.id);
      if (error) throw error;
    }
  }
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const supabase = createSupabaseClient();
  const rows = await fetchDrafts(supabase);
  const decisions = rows.map((row) => ({ row, decision: classify(row) }));

  if (apply) await applyActions(supabase, decisions);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `reviewed-restaurant-bar-hotel-drafts-${apply ? "apply" : "dry-run"}-${stamp}.md`);
  const actions = ["publish", "move", "hide", "keep_draft"];
  const lines = [
    "# Reviewed Restaurant Bar Hotel Drafts",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Apply: ${apply ? "yes" : "no"}`,
    "",
    "## Summary",
    "",
    `- Draft rows reviewed: ${rows.length}`,
    "",
    "| Category | Publish | Move | Hide | Keep draft |",
    "|---|---:|---:|---:|---:|",
    ...CATEGORIES.map((category) => {
      const group = decisions.filter(({ row }) => row.category === category);
      return `| ${category} | ${group.filter(({ decision }) => decision.action === "publish").length} | ${group.filter(({ decision }) => decision.action === "move").length} | ${group.filter(({ decision }) => decision.action === "hide").length} | ${group.filter(({ decision }) => decision.action === "keep_draft").length} |`;
    })
  ];

  for (const action of actions) {
    const group = decisions.filter(({ decision }) => decision.action === action);
    lines.push(
      "",
      `## ${action} (${group.length})`,
      "",
      "| Name | Category | To category | Area | Rating | Reviews | Type | Reason | Slug |",
      "|---|---|---|---|---:|---:|---|---|---|",
      ...group
        .sort((a, b) => (a.row.category.localeCompare(b.row.category) || (b.row.reviews_count ?? 0) - (a.row.reviews_count ?? 0)))
        .map(({ row, decision }) => `| ${fmt(publicName(row))} | ${fmt(row.category)} | ${fmt(decision.toCategory)} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(decision.reason)} | ${fmt(row.slug)} |`)
    );
  }

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: reportPath, apply, reviewed: rows.length, summary: Object.fromEntries(actions.map((action) => [action, decisions.filter(({ decision }) => decision.action === action).length])) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
