import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { normalizeBusinessName } from "../src/lib/business-name-normalizer";

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

  const { error: schemaError } = await supabase
    .from("businesses")
    .select("original_name,display_name,name_quality_status")
    .limit(1);

  if (schemaError) {
    throw new Error(`Missing display name columns. Apply supabase/migrations/006_business_display_name.sql before running this command. Details: ${schemaError.message}`);
  }

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id,name,original_name,display_name,name_quality_status")
    .order("created_at", { ascending: true });

  if (error) throw error;

  let updated = 0;
  const examples: { before: string; after: string }[] = [];

  for (const business of businesses ?? []) {
    const normalized = normalizeBusinessName(business);

    const changed =
      business.original_name !== normalized.original_name ||
      business.display_name !== normalized.display_name ||
      business.name_quality_status !== normalized.name_quality_status;

    if (!changed) continue;

    const { error: updateError } = await supabase
      .from("businesses")
      .update(normalized)
      .eq("id", business.id);

    if (updateError) throw updateError;

    updated += 1;
    if (examples.length < 20) {
      examples.push({
        before: business.name,
        after: normalized.display_name
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        procesados: businesses?.length ?? 0,
        actualizados: updated,
        ejemplos_antes_despues: examples
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
