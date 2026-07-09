import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const PAGE = 1000;
const PUBLIC = ["published", "premium"];

function reviewCount(v) {
  if (!Array.isArray(v)) return 0;
  return v.filter(r => {
    if (!r || typeof r !== "object") return false;
    const t = r.text;
    if (typeof t === "string") return t.trim().length > 0;
    return Boolean(t && typeof t === "object" && typeof t.text === "string" && t.text.trim());
  }).length;
}
function hasText(v) { return typeof v === "string" && v.trim().length > 0; }

// Fetch all published businesses
const rows = [];
for (let from = 0; ; from += PAGE) {
  const { data, error } = await sb
    .from("businesses")
    .select("id,slug,name,category,status,source,imported_at,updated_at,google_place_id,primary_image_url,primary_photo_name,photo_names,place_reviews,detail_enriched_at,reviews_count")
    .in("status", PUBLIC)
    .range(from, from + PAGE - 1);
  if (error) throw error;
  rows.push(...(data ?? []));
  if ((data ?? []).length < PAGE) break;
}

const analyzed = rows.map(r => {
  const hasReviews = reviewCount(r.place_reviews) > 0;
  const hasEnrichedAt = !!r.detail_enriched_at;
  const hasCover = hasText(r.primary_image_url);
  // can we even enrich the cover? need a google photo name somewhere
  const canGetPhoto = hasText(r.primary_photo_name) || (Array.isArray(r.photo_names) && r.photo_names.some(hasText));
  const canEnrich = !!r.google_place_id;
  return { ...r, hasReviews, hasEnrichedAt, hasCover, canGetPhoto, canEnrich };
});

const total = analyzed.length;
const missingReviews = analyzed.filter(r => !r.hasReviews);
const missingCover = analyzed.filter(r => !r.hasCover);
const missingBoth = analyzed.filter(r => !r.hasReviews && !r.hasCover);
const fullyEnriched = analyzed.filter(r => r.hasReviews && r.hasCover);
const noPlaceId = analyzed.filter(r => !r.canEnrich);
const coverNoPhotoName = missingCover.filter(r => !r.canGetPhoto);

// Breakdown by category for the un-enriched
function byCat(list) {
  const m = {};
  for (const r of list) m[r.category] = (m[r.category] ?? 0) + 1;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

// Console summary
console.log(`\n═══ ENRICHMENT AUDIT (published + premium) ═══`);
console.log(`Total published:        ${total}`);
console.log(`✓ Fully enriched:       ${fullyEnriched.length}  (reviews + cover)`);
console.log(`✗ Missing reviews:      ${missingReviews.length}`);
console.log(`✗ Missing cover photo:  ${missingCover.length}`);
console.log(`✗ Missing BOTH:         ${missingBoth.length}`);
console.log(`\nBlockers:`);
console.log(`  No google_place_id (can't enrich at all): ${noPlaceId.length}`);
console.log(`  Missing cover AND no photo name available: ${coverNoPhotoName.length}`);

console.log(`\n── Missing reviews by category ──`);
for (const [c, n] of byCat(missingReviews)) console.log(`  ${String(n).padStart(4)}  ${c}`);

console.log(`\n── Missing cover by category ──`);
for (const [c, n] of byCat(missingCover)) console.log(`  ${String(n).padStart(4)}  ${c}`);

// Recently imported (this session's guide businesses) — likely the unenriched batch
const recent = analyzed
  .filter(r => !r.hasReviews || !r.hasCover)
  .filter(r => r.imported_at)
  .sort((a, b) => String(b.imported_at).localeCompare(String(a.imported_at)))
  .slice(0, 40);

// Write report
mkdirSync("reports", { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = join("reports", `enrichment-audit-${stamp}.md`);
const md = [
  "# Enrichment Audit — published businesses without reviews/cover",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Enriched = place_reviews present (review import) + primary_image_url present (cover photo)`,
  "",
  "## Totals",
  "",
  `| Metric | Count |`,
  `|---|---:|`,
  `| Total published/premium | ${total} |`,
  `| ✓ Fully enriched (reviews + cover) | ${fullyEnriched.length} |`,
  `| ✗ Missing reviews | ${missingReviews.length} |`,
  `| ✗ Missing cover photo | ${missingCover.length} |`,
  `| ✗ Missing both | ${missingBoth.length} |`,
  `| No google_place_id (cannot enrich) | ${noPlaceId.length} |`,
  `| Missing cover & no photo name to use | ${coverNoPhotoName.length} |`,
  "",
  "## Missing reviews by category",
  "",
  "| Category | Count |",
  "|---|---:|",
  ...byCat(missingReviews).map(([c, n]) => `| ${c} | ${n} |`),
  "",
  "## Missing cover photo by category",
  "",
  "| Category | Count |",
  "|---|---:|",
  ...byCat(missingCover).map(([c, n]) => `| ${c} | ${n} |`),
  "",
  "## Most recently imported un-enriched (top 40 by imported_at)",
  "",
  "| Name | Category | imported_at | reviews | cover | place_id |",
  "|---|---|---|:-:|:-:|:-:|",
  ...recent.map(r => `| ${(r.name||"").replace(/\|/g,"\\|")} | ${r.category} | ${(r.imported_at||"").slice(0,10)} | ${r.hasReviews?"✓":"✗"} | ${r.hasCover?"✓":"✗"} | ${r.canEnrich?"✓":"✗"} |`),
  "",
  "## Businesses missing cover with NO photo name (need Places photo fetch or won't work)",
  "",
  ...(coverNoPhotoName.length ? coverNoPhotoName.slice(0, 60).map(r => `- ${r.name} (${r.slug}) — ${r.category}${r.canEnrich?"":" — NO place_id"}`) : ["_none_"]),
].join("\n");
writeFileSync(file, md + "\n", "utf8");
console.log(`\n✓ Report written: ${file}`);
