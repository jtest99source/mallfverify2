import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PAGE_SIZE = 1000;
const OUTPUT_DIR = "reports";

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

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function publicName(row) {
  return row.display_name?.trim() || row.name || "";
}

function normalizedText(row) {
  const raw = row.raw_google_place;
  const rawTypes = raw && Array.isArray(raw.types) ? raw.types.join(" ") : "";
  return `${publicName(row)} ${row.website ?? ""} ${row.address ?? ""} ${row.primary_type ?? ""} ${rawTypes}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function gymFamily(row) {
  const text = normalizedText(row);
  if (/hotel|resort|lodging|hostal|apartamentos/.test(text)) return "hotel_or_lodging";
  if (/shop|store|tienda|sporting goods|deportes /.test(text)) return "shop";
  if (/piscina|swimming pool|polideportivo|poliesportiu|sports complex|centro deportivo|municipal/.test(text)) return "municipal_or_sports_complex";
  if (/padel|tennis|tenis|club de tenis|sports club/.test(text)) return "padel_or_sports_club";
  if (/yoga|pilates|yogi|shala/.test(text)) return "yoga_pilates";
  if (/martial|muay thai|karate|aikido|bjj|jiu jitsu|boxeo|boxing|taekwondo|kickboxing/.test(text)) return "martial_arts";
  if (/dance|pole|aerial/.test(text)) return "dance_aerial";
  if (/box|crossfit|cross training|crosstraining|functional|entrenamiento funcional|fitness center|gimnasio|gym|fitness|training club|personal trainer|entrenador/.test(text)) return "fitness_gym";
  if (/health|fisio|physio|clinic|rehab|articular/.test(text)) return "health_overlap";
  return "other";
}

function tier(row) {
  const family = gymFamily(row);
  const rating = row.rating ?? 0;
  const reviews = row.reviews_count ?? 0;
  const hasWebsite = Boolean(row.website);

  if (["hotel_or_lodging", "shop"].includes(family)) return "likely_skip";
  if (family === "other") return "review_weak_signal";
  if (family === "health_overlap") return "review_health_overlap";
  if (reviews >= 100 && rating >= 4.3 && hasWebsite) return "tier_1_publish_candidates";
  if (reviews >= 50 && rating >= 4.3) return "tier_2_good_candidates";
  if (reviews >= 20 && rating >= 4.0) return "tier_3_small_or_thin";
  return "likely_skip_low_signal";
}

function tierLabel(key) {
  return {
    tier_1_publish_candidates: "Tier 1 - strongest publish candidates",
    tier_2_good_candidates: "Tier 2 - good candidates",
    tier_3_small_or_thin: "Tier 3 - small/thin but possible",
    review_health_overlap: "Review - health/physio overlap",
    review_weak_signal: "Review - weak gym signal",
    likely_skip: "Likely skip - hotel/shop",
    likely_skip_low_signal: "Likely skip - low rating/reviews"
  }[key] ?? key;
}

function tierInstruction(key) {
  return {
    tier_1_publish_candidates: "Claude: default should be INCLUDE unless category is clearly wrong.",
    tier_2_good_candidates: "Claude: include if it is a real gym, yoga/pilates studio, martial arts school, padel/sports club, or useful sports complex.",
    tier_3_small_or_thin: "Claude: be stricter. Include only if it fills a useful locality/type gap or has a strong brand/signal.",
    review_health_overlap: "Claude: decide whether this belongs in gyms, healthcare, or should stay hidden.",
    review_weak_signal: "Claude: inspect for category fit; most should stay hidden unless obviously valid.",
    likely_skip: "Claude: default should be SKIP unless there is a strong standalone gym reason.",
    likely_skip_low_signal: "Claude: default should be SKIP unless it fills an important gap."
  }[key] ?? "";
}

function groupCount(rows, keyFn) {
  const counts = new Map();
  for (const row of rows) {
    const key = keyFn(row) || "-";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])));
}

async function fetchHiddenRows(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,status,category,city,area,municipality,address,rating,reviews_count,website,phone,google_place_id,primary_type,raw_google_place")
      .eq("category", "gym")
      .eq("status", "hidden")
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

function rowLine(row) {
  return `| ${fmt(publicName(row))} | ${fmt(gymFamily(row))} | ${fmt(row.city || row.area || row.municipality)} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.website)} | ${fmt(row.slug)} |`;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const rows = await fetchHiddenRows(supabase);
  const sorted = rows.slice().sort((a, b) => {
    const tierDiff = tierOrder(tier(a)) - tierOrder(tier(b));
    if (tierDiff) return tierDiff;
    return (b.reviews_count ?? 0) - (a.reviews_count ?? 0) || (b.rating ?? 0) - (a.rating ?? 0);
  });

  const tiers = new Map();
  for (const row of sorted) {
    const key = tier(row);
    if (!tiers.has(key)) tiers.set(key, []);
    tiers.get(key).push(row);
  }

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join(OUTPUT_DIR, `hidden-gyms-claude-review-${stamp}.md`);
  const tierKeys = [
    "tier_1_publish_candidates",
    "tier_2_good_candidates",
    "tier_3_small_or_thin",
    "review_health_overlap",
    "review_weak_signal",
    "likely_skip",
    "likely_skip_low_signal"
  ];
  const lines = [
    "# Hidden Gyms Claude Review",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Goal: decide which hidden gym rows should be published, kept hidden, or moved. Include real gyms, fitness centers, yoga/pilates studios, martial arts schools, and meaningful padel/sports clubs. Skip hotels, shops, weak/irrelevant listings, and very thin individual trainers unless there is a strong reason.",
    "",
    "## Summary",
    "",
    `- Hidden gym rows reviewed: ${rows.length}`,
    "",
    "## Counts By Tier",
    "",
    "| Tier | Count |",
    "|---|---:|",
    ...tierKeys.map((key) => `| ${fmt(tierLabel(key))} | ${tiers.get(key)?.length ?? 0} |`),
    "",
    "## Counts By Family",
    "",
    "| Family | Count |",
    "|---|---:|",
    ...groupCount(rows, gymFamily).map(([key, count]) => `| ${fmt(key)} | ${count} |`)
  ];

  for (const key of tierKeys) {
    const tierRows = tiers.get(key) ?? [];
    lines.push(
      "",
      `## ${tierLabel(key)} (${tierRows.length})`,
      "",
      tierInstruction(key),
      "",
      "| Name | Family | Area | Rating | Reviews | Type | Website | Slug |",
      "|---|---|---|---:|---:|---|---|---|",
      ...tierRows.map(rowLine)
    );
  }

  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");
  console.log(JSON.stringify({ report: reportPath, hidden_rows: rows.length, tiers: Object.fromEntries(tierKeys.map((key) => [key, tiers.get(key)?.length ?? 0])) }, null, 2));
}

function tierOrder(key) {
  return {
    tier_1_publish_candidates: 1,
    tier_2_good_candidates: 2,
    tier_3_small_or_thin: 3,
    review_health_overlap: 4,
    review_weak_signal: 5,
    likely_skip: 6,
    likely_skip_low_signal: 7
  }[key] ?? 99;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
