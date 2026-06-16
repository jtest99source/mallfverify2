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

function existsBonus(value) {
  return value && String(value).trim() ? 1 : 0;
}

function calculateAuthorityScore(business) {
  const rating = typeof business.rating === "number" ? business.rating : 0;
  const reviews = typeof business.reviews_count === "number" && business.reviews_count > 0 ? business.reviews_count : 1;
  const websiteExists = existsBonus(business.website);
  const phoneExists = existsBonus(business.phone);

  return Number((rating + Math.log(reviews) + websiteExists + phoneExists).toFixed(4));
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

  const { error: schemaError } = await supabase.from("businesses").select("authority_score").limit(1);
  if (schemaError) {
    throw new Error(`Missing authority_score column. Apply supabase/migrations/004_business_location_and_geo_fields.sql before scoring. Details: ${schemaError.message}`);
  }

  const { data, error } = await supabase
    .from("businesses")
    .select("id,rating,reviews_count,website,phone")
    .eq("category", "boat-rental");

  if (error) throw error;

  let updated = 0;

  for (const business of data ?? []) {
    const authorityScore = calculateAuthorityScore(business);
    const { error: updateError } = await supabase
      .from("businesses")
      .update({ authority_score: authorityScore })
      .eq("id", business.id);

    if (updateError) throw updateError;
    updated += 1;
  }

  const { count, error: countError } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("category", "boat-rental")
    .not("authority_score", "is", null);

  if (countError) throw countError;

  console.log(
    JSON.stringify(
      {
        updated,
        boat_rentals_with_authority_score: count ?? 0
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
