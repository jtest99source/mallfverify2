import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { scoreAndSortImageCandidates } from "../src/lib/image-candidate-scoring";

const MIN_ASSIGN_SCORE = 45;

type ImageCandidate = {
  url?: string;
  source?: string;
  field?: string;
  extractionMethod?: string;
  confidence?: string;
  reason?: string;
  credit?: string;
  photoName?: string;
  imageQualityScore?: number;
  imageQualityReasons?: string[];
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

function getCreditFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

function hasUsableUrl(candidate?: ImageCandidate) {
  if (!candidate?.url?.trim()) return false;

  try {
    const url = new URL(candidate.url);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

async function countCoverage(supabase: any) {
  const rows: Array<{ primary_image_url: string | null }> = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("businesses")
      .select("primary_image_url")
      .in("status", ["published", "premium"])
      .range(from, from + pageSize - 1);

    if (error) throw error;
    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  const withImages = rows.filter((row: { primary_image_url: string | null }) => row.primary_image_url?.trim()).length;
  return {
    total_published_premium: rows.length,
    with_primary_image_url: withImages,
    without_primary_image_url: rows.length - withImages,
    coverage_percent: rows.length ? Math.round((withImages / rows.length) * 10000) / 100 : 0
  };
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();

  const rows: BusinessRow[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,name,display_name,primary_image_url,image_candidate_urls")
      .in("status", ["published", "premium"])
      .order("authority_score", { ascending: false, nullsFirst: false })
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Cannot read businesses. Details: ${error.message}`);
    }

    const page = (data ?? []) as BusinessRow[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }

  const beforeCoverage = await countCoverage(supabase);
  let processed = 0;
  let assigned = 0;
  let skippedAlreadyHadImage = 0;
  let skippedWithoutCandidate = 0;
  let skippedLowScore = 0;
  const topAssigned: Array<{ business: string; score: number; url: string; reasons: string[] }> = [];
  const worstDiscarded: Array<{ business: string; score: number; url: string; reasons: string[] }> = [];

  for (const business of rows) {
    processed += 1;

    if (business.primary_image_url?.trim()) {
      skippedAlreadyHadImage += 1;
      continue;
    }

    const candidates = Array.isArray(business.image_candidate_urls) ? business.image_candidate_urls : [];
    if (candidates.length === 0) {
      skippedWithoutCandidate += 1;
      continue;
    }

    const scored = scoreAndSortImageCandidates(candidates);
    const best = scored.find(hasUsableUrl);
    if (!best?.url) {
      skippedWithoutCandidate += 1;
      continue;
    }

    const score = best.imageQualityScore ?? -999;
    if (score < MIN_ASSIGN_SCORE) {
      skippedLowScore += 1;
      worstDiscarded.push({
        business: business.display_name || business.name,
        score,
        url: best.url,
        reasons: best.imageQualityReasons ?? []
      });
      continue;
    }

    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        primary_image_url: best.url,
        primary_image_source: best.source?.trim() || "official_website",
        primary_image_credit: best.credit?.trim() || getCreditFromUrl(best.url),
        primary_photo_name: best.photoName?.trim() || undefined,
        image_status: "candidate_assigned",
        image_candidate_urls: scored
      })
      .eq("id", business.id)
      .is("primary_image_url", null);

    if (updateError) {
      throw new Error(`Cannot assign best candidate to ${business.display_name || business.name}: ${updateError.message}`);
    }

    assigned += 1;
    topAssigned.push({
      business: business.display_name || business.name,
      score,
      url: best.url,
      reasons: best.imageQualityReasons ?? []
    });
  }

  topAssigned.sort((a, b) => b.score - a.score);
  worstDiscarded.sort((a, b) => a.score - b.score);
  const afterCoverage = await countCoverage(supabase);

  console.log(JSON.stringify({
    min_assign_score: MIN_ASSIGN_SCORE,
    processed,
    assigned,
    skipped_already_had_image: skippedAlreadyHadImage,
    skipped_without_candidate: skippedWithoutCandidate,
    skipped_low_score: skippedLowScore,
    top_images_assigned: topAssigned.slice(0, 30),
    worst_discarded: worstDiscarded.slice(0, 30),
    coverage_before: beforeCoverage,
    coverage_after: afterCoverage
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
