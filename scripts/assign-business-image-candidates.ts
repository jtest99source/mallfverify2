import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

type ImageCandidate = {
  url?: string;
  source?: string;
  field?: string;
  pageUrl?: string;
};

type BusinessRow = {
  id: string;
  name: string;
  display_name: string | null;
  primary_image_url: string | null;
  image_candidate_urls: ImageCandidate[] | null;
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

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function getUsableCandidate(candidates: ImageCandidate[] | null) {
  if (!Array.isArray(candidates)) return null;

  for (const candidate of candidates) {
    const url = candidate?.url?.trim();
    if (!url) continue;

    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) continue;
      return {
        url: parsed.toString(),
        source: candidate.source?.trim() || "official_website"
      };
    } catch {
      continue;
    }
  }

  return null;
}

function getCreditFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,display_name,primary_image_url,image_candidate_urls")
    .in("status", ["published", "premium"])
    .order("authority_score", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Cannot read businesses. Apply supabase/migrations/009_business_image_candidates.sql first if image_candidate_urls is missing. Details: ${error.message}`);
  }

  const rows = (data ?? []) as BusinessRow[];
  let processed = 0;
  let assigned = 0;
  let skippedWithoutCandidate = 0;
  let skippedAlreadyHadImage = 0;
  const examples: Array<{ name: string; primary_image_url: string; source: string; credit: string | null }> = [];

  for (const business of rows) {
    processed += 1;

    if (business.primary_image_url?.trim()) {
      skippedAlreadyHadImage += 1;
      continue;
    }

    const candidate = getUsableCandidate(business.image_candidate_urls);
    if (!candidate) {
      skippedWithoutCandidate += 1;
      continue;
    }

    const credit = getCreditFromUrl(candidate.url);
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        primary_image_url: candidate.url,
        primary_image_source: candidate.source,
        primary_image_credit: credit,
        image_status: "candidate_assigned"
      })
      .eq("id", business.id)
      .is("primary_image_url", null);

    if (updateError) {
      throw new Error(`Cannot assign image candidate to ${business.display_name || business.name}: ${updateError.message}`);
    }

    assigned += 1;
    if (examples.length < 20) {
      examples.push({
        name: business.display_name || business.name,
        primary_image_url: candidate.url,
        source: candidate.source,
        credit
      });
    }
  }

  console.log(JSON.stringify({
    processed,
    assigned,
    skipped_without_candidate: skippedWithoutCandidate,
    skipped_already_had_image: skippedAlreadyHadImage,
    examples_assigned: examples
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
