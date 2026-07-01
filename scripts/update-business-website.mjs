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

function parseArgs() {
  const [slug, website] = process.argv.slice(2);
  if (!slug || !website) throw new Error("Usage: node scripts/update-business-website.mjs <slug> <website>");
  return { slug, website };
}

async function main() {
  loadLocalEnv();
  const { slug, website } = parseArgs();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error("Missing Supabase env vars.");

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: before, error: beforeError } = await supabase
    .from("businesses")
    .select("slug,name,status,category,website")
    .eq("slug", slug)
    .maybeSingle();
  if (beforeError) throw beforeError;
  if (!before) throw new Error(`Missing slug: ${slug}`);

  const { data: updated, error: updateError } = await supabase
    .from("businesses")
    .update({ website })
    .eq("slug", slug)
    .select("slug,name,status,category,website")
    .maybeSingle();
  if (updateError) throw updateError;

  console.log(JSON.stringify({ before, updated }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
