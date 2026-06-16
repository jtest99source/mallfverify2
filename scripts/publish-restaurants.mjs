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

async function main() {
  loadLocalEnv();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { count: draftsBefore, error: draftsError } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("category", "restaurant")
    .eq("status", "draft");

  if (draftsError) throw draftsError;

  const { error: updateError } = await supabase
    .from("businesses")
    .update({ status: "published" })
    .eq("category", "restaurant")
    .eq("status", "draft");

  if (updateError) throw updateError;

  const { count: totalPublished, error: publishedError } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("category", "restaurant")
    .eq("status", "published");

  if (publishedError) throw publishedError;

  console.log(
    JSON.stringify(
      {
        drafts_convertidos: draftsBefore ?? 0,
        total_publicados: totalPublished ?? 0
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
