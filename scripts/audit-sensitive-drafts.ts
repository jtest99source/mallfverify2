import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase
    .from("businesses")
    .select("slug,name,display_name,category,status,primary_type,rating,reviews_count")
    .in("status", ["draft", "published"])
    .or(
      [
        "name.ilike.%tantra%",
        "name.ilike.%tantric%",
        "name.ilike.%erotic%",
        "display_name.ilike.%tantra%",
        "display_name.ilike.%tantric%",
        "display_name.ilike.%erotic%",
        "name.ilike.%limo%",
        "display_name.ilike.%limo%",
        "name.ilike.%chauffeur%",
        "display_name.ilike.%chauffeur%"
      ].join(",")
    )
    .order("category");

  if (error) throw error;
  console.table(data ?? []);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
