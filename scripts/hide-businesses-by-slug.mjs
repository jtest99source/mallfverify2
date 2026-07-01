import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

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

function parseSlugs() {
  const slugs = process.argv.slice(2).filter(Boolean);
  if (!slugs.length) throw new Error("Usage: node scripts/hide-businesses-by-slug.mjs <slug> [slug...]");
  return slugs;
}

async function main() {
  loadLocalEnv();
  const slugs = parseSlugs();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase env vars.");

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: before, error: beforeError } = await supabase
    .from("businesses")
    .select("slug,name,status,category,website")
    .in("slug", slugs)
    .order("slug", { ascending: true });
  if (beforeError) throw beforeError;

  const found = new Set((before ?? []).map((row) => row.slug));
  const missing = slugs.filter((slug) => !found.has(slug));
  if (missing.length) throw new Error(`Missing slugs: ${missing.join(", ")}`);

  const { data: updated, error: updateError } = await supabase
    .from("businesses")
    .update({ status: "hidden" })
    .in("slug", slugs)
    .select("slug,name,status,category,website")
    .order("slug", { ascending: true });
  if (updateError) throw updateError;

  console.log(JSON.stringify({ before, updated }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
