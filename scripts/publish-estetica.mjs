// scripts/publish-estetica.mjs
// Day-2 publish for the aesthetic vertical:
//   1. Flips the two Botox guide drafts to published
//   2. Reminds the remaining steps (language badges, heroes, cache)
// Usage: node scripts/publish-estetica.mjs
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

const targets = [
  ["botox-mallorca-prices-safety", "en"],
  ["botox-mallorca-kosten-sicherheit", "de"]
];
for (const [slug, locale] of targets) {
  const { data, error } = await sb.from("guides")
    .update({ status: "published", updated_at: new Date().toISOString().slice(0, 10) })
    .eq("slug", slug).eq("locale", locale).select("status");
  if (error) { console.error(`✗ ${locale}/${slug}: ${error.message}`); continue; }
  console.log(data?.length ? `✓ publicada ${locale}/${slug}` : `? no encontrada ${locale}/${slug}`);
}

console.log(`
Pasos restantes (en orden):
  1. node scripts/import-language-verification-estetica.mjs --apply   ← badges de idioma en las 13 fichas
  2. node scripts/backfill-guide-heroes.mjs                           ← hero de las 2 guías nuevas
  3. Revalidar (o esperar ISR 6h):
     /api/revalidate?secret=...&path=/en/guides/botox-mallorca-prices-safety
     /api/revalidate?secret=...&path=/de/guides/botox-mallorca-kosten-sicherheit
     /api/revalidate?secret=...&path=/en/guides  y /de/guides
`);
