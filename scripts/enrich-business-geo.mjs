import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { calculateAuthorityScore, createSocialProfiles, detectWebsiteType, inferLocationFromAddress } from "../src/lib/business-geo.ts";

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
    .select("city,municipality,island,website_type,social_profiles,authority_score,geo_score,editorial_status,ai_description,editorial_description,review_summary")
    .limit(1);

  if (schemaError) {
    throw new Error(`Missing GEO enrichment columns. Apply supabase/migrations/004_business_location_and_geo_fields.sql before running this command. Details: ${schemaError.message}`);
  }

  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id,name,address,rating,reviews_count,website,phone")
    .order("created_at", { ascending: true });

  if (error) throw error;

  const websiteTypeCounts = {
    official_website: 0,
    instagram: 0,
    facebook: 0,
    no_website: 0
  };

  let updated = 0;
  const scored = [];

  for (const business of businesses ?? []) {
    const websiteType = detectWebsiteType(business.website);
    const location = inferLocationFromAddress(business.address);
    const authorityScore = calculateAuthorityScore(business);

    if (!business.website) websiteTypeCounts.no_website += 1;
    else if (websiteType === "instagram") websiteTypeCounts.instagram += 1;
    else if (websiteType === "facebook") websiteTypeCounts.facebook += 1;
    else if (websiteType === "official_website") websiteTypeCounts.official_website += 1;

    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        area: location.area,
        city: location.city ?? null,
        municipality: location.municipality ?? null,
        island: "Mallorca",
        website_type: websiteType,
        social_profiles: createSocialProfiles(business.website, websiteType),
        authority_score: authorityScore,
        geo_score: authorityScore
      })
      .eq("id", business.id);

    if (updateError) throw updateError;
    updated += 1;
    scored.push({ id: business.id, name: business.name, authority_score: authorityScore });
  }

  scored.sort((a, b) => b.authority_score - a.authority_score);

  console.log(
    JSON.stringify(
      {
        businesses_procesados: businesses?.length ?? 0,
        businesses_actualizados: updated,
        official_website: websiteTypeCounts.official_website,
        instagram: websiteTypeCounts.instagram,
        facebook: websiteTypeCounts.facebook,
        sin_website: websiteTypeCounts.no_website,
        top_10_por_authority_score: scored.slice(0, 10)
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
