import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

const PUBLISH_LIMIT = 75;

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

  const { data: drafts, error: draftsError } = await supabase
    .from("businesses")
    .select("id,name,rating,reviews_count,authority_score,website")
    .eq("category", "boat-rental")
    .eq("status", "draft")
    .order("authority_score", { ascending: false, nullsFirst: false })
    .order("reviews_count", { ascending: false, nullsFirst: false })
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(PUBLISH_LIMIT);

  if (draftsError) throw draftsError;

  const ids = (drafts ?? []).map((business) => business.id);

  if (ids.length) {
    const { error: updateError } = await supabase
      .from("businesses")
      .update({ status: "published" })
      .in("id", ids);

    if (updateError) throw updateError;
  }

  const { count: remainingDrafts, error: remainingError } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("category", "boat-rental")
    .eq("status", "draft");

  if (remainingError) throw remainingError;

  const { count: totalPublishedBoats, error: publishedError } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("category", "boat-rental")
    .eq("status", "published");

  if (publishedError) throw publishedError;

  const { data: topPublished, error: topError } = await supabase
    .from("businesses")
    .select("name,rating,reviews_count,authority_score,website")
    .eq("category", "boat-rental")
    .eq("status", "published")
    .order("authority_score", { ascending: false, nullsFirst: false })
    .order("reviews_count", { ascending: false, nullsFirst: false })
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(10);

  if (topError) throw topError;

  console.log(
    JSON.stringify(
      {
        published_count: ids.length,
        remaining_drafts: remainingDrafts ?? 0,
        total_published_boats: totalPublishedBoats ?? 0,
        top_10_published_boats: topPublished ?? []
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
