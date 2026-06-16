import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { inferLocationFromTexts, isMoreSpecificLocation, type LocationInference } from "../src/lib/business-geo";

type BusinessRow = {
  id: string;
  name: string;
  area: string | null;
  city: string | null;
  municipality: string | null;
  address: string | null;
  raw_google_place: { formattedAddress?: string } | null;
};

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

function currentLocation(business: BusinessRow): LocationInference {
  return {
    area: business.area || "Mallorca",
    city: business.city || undefined,
    municipality: business.municipality || undefined
  };
}

function changed(current: LocationInference, next: LocationInference) {
  return current.area !== next.area || (current.city ?? null) !== (next.city ?? null) || (current.municipality ?? null) !== (next.municipality ?? null);
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
    .select("area,city,municipality,raw_google_place")
    .limit(1);

  if (schemaError) {
    throw new Error(`Missing location columns. Apply migration 004 before improving locations. Details: ${schemaError.message}`);
  }

  const { count: mallorcaBefore, error: countBeforeError } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("area", "Mallorca");

  if (countBeforeError) throw countBeforeError;

  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,area,city,municipality,address,raw_google_place")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const businesses = (data ?? []) as BusinessRow[];
  let updated = 0;
  const examples: Array<{ name: string; before: LocationInference; after: LocationInference }> = [];

  for (const business of businesses) {
    const before = currentLocation(business);
    const after = inferLocationFromTexts(
      business.address,
      business.name,
      business.raw_google_place?.formattedAddress
    );

    if (!changed(before, after) || !isMoreSpecificLocation(before, after)) continue;

    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        area: after.area,
        city: after.city ?? null,
        municipality: after.municipality ?? null
      })
      .eq("id", business.id);

    if (updateError) throw updateError;
    updated += 1;

    if (examples.length < 50) {
      examples.push({
        name: business.name,
        before,
        after
      });
    }
  }

  const { count: mallorcaAfter, error: countAfterError } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("area", "Mallorca");

  if (countAfterError) throw countAfterError;

  console.log(
    JSON.stringify(
      {
        businesses_procesados: businesses.length,
        businesses_actualizados: updated,
        area_mallorca_antes: mallorcaBefore ?? 0,
        area_mallorca_despues: mallorcaAfter ?? 0,
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
