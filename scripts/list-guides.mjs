import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const { data } = await sb.from("guides").select("slug,locale,title,status").order("slug");
const bySlug = new Map();
for (const g of data ?? []) {
  if (!bySlug.has(g.slug)) bySlug.set(g.slug, { title: g.title, locales: [] });
  bySlug.get(g.slug).locales.push(g.locale);
}
console.log(`Total unique slugs: ${bySlug.size}\n`);
for (const [slug, info] of [...bySlug].sort()) {
  console.log(`[${info.locales.sort().join(",")}] ${slug}`);
}
