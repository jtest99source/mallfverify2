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
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Dental clinics likely live under 'healthcare' category. Search by name/type keywords.
const KW = ["dental", "dentist", "dentista", "zahn", "odont", "clínica dental", "clinica dental"];

const rows = [];
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("businesses")
    .select("id,slug,name,category,status,area,city,municipality,rating,reviews_count,primary_type,tags,detail_enriched_at,primary_image_url")
    .in("status", ["published", "premium", "draft", "hidden"])
    .range(from, from + 999);
  if (error) throw error;
  rows.push(...(data ?? []));
  if ((data ?? []).length < 1000) break;
}

function isDental(b) {
  const hay = [
    b.name, b.slug, b.primary_type,
    Array.isArray(b.tags) ? b.tags.join(" ") : "",
  ].join(" ").toLowerCase();
  return KW.some(k => hay.includes(k));
}

const dental = rows.filter(isDental);
const byStatus = {};
const byCat = {};
for (const b of dental) {
  byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
  byCat[b.category] = (byCat[b.category] ?? 0) + 1;
}

console.log(`\n═══ DENTAL CLINICS in DB ═══`);
console.log(`Total matched: ${dental.length}`);
console.log(`By status:`, JSON.stringify(byStatus));
console.log(`By category:`, JSON.stringify(byCat));

const pub = dental.filter(b => b.status === "published" || b.status === "premium")
  .sort((a, b) => (b.reviews_count ?? 0) - (a.reviews_count ?? 0));
console.log(`\n── Published dental clinics (${pub.length}), by reviews ──`);
for (const b of pub) {
  const loc = b.city || b.municipality || b.area || "?";
  console.log(`  ★${b.rating ?? "?"} (${String(b.reviews_count ?? 0).padStart(4)}r) [${b.category}] ${b.name} — ${loc} ${b.detail_enriched_at ? "✓rev" : "✗rev"} ${b.primary_image_url ? "✓img" : "✗img"}`);
}
