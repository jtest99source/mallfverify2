import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

// Publishes draft rows of the given real-enum categories that meet the standing
// quality bar: own website OR >= 5 reviews.
// Usage: node scripts/publish-drafts-by-category.mjs --categories=property-management,renovations,pool-garden [--apply]
function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim(); if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("="); if (i === -1) continue;
    const k = t.slice(0, i).trim(); const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
const arg = (n) => { const a = process.argv.slice(2).find((x) => x.startsWith(`--${n}=`)); return a ? a.slice(n.length + 3) : null; };

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const categories = (arg("categories") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!categories.length) throw new Error("Missing --categories=a,b,c");
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  console.log(apply ? "APPLY MODE" : "DRY RUN (add --apply)");
  for (const category of categories) {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from("businesses").select("id,reviews_count,website_type").eq("category", category).eq("status", "draft").range(from, from + 999);
      if (error) throw error;
      rows.push(...(data ?? []));
      if ((data ?? []).length < 1000) break;
    }
    const publishable = rows.filter((b) => (b.reviews_count ?? 0) >= 5 || b.website_type === "official_website");
    console.log(`${category}: drafts ${rows.length} -> publicar ${publishable.length} | retenidos ${rows.length - publishable.length}`);
    if (!apply) continue;
    const ids = publishable.map((b) => b.id);
    for (let i = 0; i < ids.length; i += 200) {
      const { error } = await sb.from("businesses").update({ status: "published" }).in("id", ids.slice(i, i + 200));
      if (error) throw error;
    }
    console.log(`  ✓ ${category}: ${ids.length} publicados`);
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
