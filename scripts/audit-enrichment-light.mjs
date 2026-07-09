import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

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

const PAGE = 500;
const PUBLIC = ["published", "premium"];

// Lightweight columns only — no jsonb payload
const rows = [];
for (let from = 0; ; from += PAGE) {
  const { data, error } = await sb
    .from("businesses")
    .select("category,detail_enriched_at,primary_image_url,google_place_id")
    .in("status", PUBLIC)
    .range(from, from + PAGE - 1);
  if (error) throw error;
  rows.push(...(data ?? []));
  if ((data ?? []).length < PAGE) break;
}

const hasText = v => typeof v === "string" && v.trim().length > 0;
const total = rows.length;
const missingReviews = rows.filter(r => !r.detail_enriched_at);
const missingCover = rows.filter(r => !hasText(r.primary_image_url));
const missingBoth = rows.filter(r => !r.detail_enriched_at && !hasText(r.primary_image_url));
const full = rows.filter(r => r.detail_enriched_at && hasText(r.primary_image_url));
const noPid = rows.filter(r => !r.google_place_id);

function byCat(list) {
  const m = {};
  for (const r of list) m[r.category] = (m[r.category] ?? 0) + 1;
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

console.log(`\n═══ ENRICHMENT AUDIT (post-run) ═══`);
console.log(`Total published:        ${total}`);
console.log(`✓ Reviews enriched:     ${total - missingReviews.length}`);
console.log(`✓ Cover photo set:      ${total - missingCover.length}`);
console.log(`✓ Fully enriched:       ${full.length}`);
console.log(`✗ Missing reviews:      ${missingReviews.length}`);
console.log(`✗ Missing cover:        ${missingCover.length}`);
console.log(`✗ Missing both:         ${missingBoth.length}`);
console.log(`  No google_place_id:   ${noPid.length}`);
if (missingReviews.length) {
  console.log(`\n── Still missing reviews by category ──`);
  for (const [c, n] of byCat(missingReviews)) console.log(`  ${String(n).padStart(4)}  ${c}`);
}
if (missingCover.length) {
  console.log(`\n── Still missing cover by category ──`);
  for (const [c, n] of byCat(missingCover)) console.log(`  ${String(n).padStart(4)}  ${c}`);
}
