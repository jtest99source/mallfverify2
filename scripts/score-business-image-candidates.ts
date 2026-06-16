import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { scoreAndSortImageCandidates } from "../src/lib/image-candidate-scoring";

type ImageCandidate = {
  url?: string;
  source?: string;
  field?: string;
  extractionMethod?: string;
  confidence?: string;
  reason?: string;
  imageQualityScore?: number;
  imageQualityReasons?: string[];
};

type BusinessRow = {
  id: string;
  name: string;
  display_name: string | null;
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

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("id,name,display_name,image_candidate_urls")
    .in("status", ["published", "premium"])
    .not("image_candidate_urls", "is", null)
    .order("authority_score", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Cannot read image candidates. Details: ${error.message}`);
  }

  const rows = (data ?? []) as BusinessRow[];
  let processed = 0;
  let updated = 0;
  let candidatesScored = 0;
  const topImages: Array<{ business: string; score: number; url: string; reasons: string[] }> = [];
  const worstImages: Array<{ business: string; score: number; url: string; reasons: string[] }> = [];

  for (const business of rows) {
    const candidates = Array.isArray(business.image_candidate_urls) ? business.image_candidate_urls : [];
    if (candidates.length === 0) continue;

    processed += 1;
    const scored = scoreAndSortImageCandidates(candidates);
    candidatesScored += scored.length;

    const { error: updateError } = await supabase
      .from("businesses")
      .update({ image_candidate_urls: scored })
      .eq("id", business.id);

    if (updateError) {
      throw new Error(`Cannot score candidates for ${business.display_name || business.name}: ${updateError.message}`);
    }

    updated += 1;

    const best = scored[0];
    if (best?.url && topImages.length < 20) {
      topImages.push({
        business: business.display_name || business.name,
        score: best.imageQualityScore ?? 0,
        url: best.url,
        reasons: best.imageQualityReasons ?? []
      });
    }

    const worst = scored[scored.length - 1];
    if (worst?.url) {
      worstImages.push({
        business: business.display_name || business.name,
        score: worst.imageQualityScore ?? 0,
        url: worst.url,
        reasons: worst.imageQualityReasons ?? []
      });
    }
  }

  worstImages.sort((a, b) => a.score - b.score);

  console.log(JSON.stringify({
    processed_businesses: processed,
    updated_businesses: updated,
    candidates_scored: candidatesScored,
    top_scored_images: topImages,
    worst_scored_images: worstImages.slice(0, 20)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
