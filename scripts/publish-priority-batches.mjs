import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

const BATCHES = [
  { category: "hotel", limit: 75, label: "hoteles" },
  { category: "activity", limit: 50, label: "actividades" }
];

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

async function selectDraftBatch(supabase, category, limit) {
  const { data, error } = await supabase
    .from("businesses")
    .select("id")
    .eq("category", category)
    .eq("status", "draft")
    .order("authority_score", { ascending: false, nullsFirst: false })
    .order("reviews_count", { ascending: false, nullsFirst: false })
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((business) => business.id);
}

async function publishIds(supabase, ids) {
  if (!ids.length) return;

  const { error } = await supabase
    .from("businesses")
    .update({ status: "published" })
    .in("id", ids);

  if (error) throw error;
}

async function countByStatus(supabase, category, status) {
  const { count, error } = await supabase
    .from("businesses")
    .select("*", { count: "exact", head: true })
    .eq("category", category)
    .eq("status", status);

  if (error) throw error;
  return count ?? 0;
}

async function topPublished(supabase, category, limit) {
  const { data, error } = await supabase
    .from("businesses")
    .select("name,display_name,rating,reviews_count,authority_score,website")
    .eq("category", category)
    .eq("status", "published")
    .order("authority_score", { ascending: false, nullsFirst: false })
    .order("reviews_count", { ascending: false, nullsFirst: false })
    .order("rating", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
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

  const published = {};

  for (const batch of BATCHES) {
    const ids = await selectDraftBatch(supabase, batch.category, batch.limit);
    await publishIds(supabase, ids);
    published[batch.category] = ids.length;
  }

  const draftsRestantesPorCategoria = {};
  const totalPublishedPorCategoria = {};
  for (const batch of BATCHES) {
    draftsRestantesPorCategoria[batch.category] = await countByStatus(supabase, batch.category, "draft");
    totalPublishedPorCategoria[batch.category] = await countByStatus(supabase, batch.category, "published");
  }

  const top20Hoteles = await topPublished(supabase, "hotel", 20);
  const top20Actividades = await topPublished(supabase, "activity", 20);

  console.log(
    JSON.stringify(
      {
        hoteles_publicados: published.hotel ?? 0,
        actividades_publicadas: published.activity ?? 0,
        drafts_restantes_por_categoria: draftsRestantesPorCategoria,
        total_published_por_categoria: totalPublishedPorCategoria,
        top_20_hoteles_publicados: top20Hoteles,
        top_20_actividades_publicadas: top20Actividades
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
