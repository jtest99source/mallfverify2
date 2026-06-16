import { createClient } from "@supabase/supabase-js";
import { searchUnsplashPhotos } from "../src/lib/unsplash";
import { auditEditorialImageRows, fetchEditorialImagesForAudit, loadLocalEnv } from "./audit-editorial-images";
import { editorialImageSeeds, editorialSeedSlug, genericEditorialQueries, type SeedImage } from "./editorial-image-seeds";

type ExistingEditorialImage = {
  image_key: string;
  source_id: string | null;
  image_url: string | null;
};

type GuideSeedRow = {
  title: string;
};

type RankingSeedRow = {
  title: string;
  category: string;
};

function parseArgs() {
  return {
    onlyProblematic: process.argv.includes("--only-problematic")
  };
}

function imageUrlFor(photo: Awaited<ReturnType<typeof searchUnsplashPhotos>>[number]) {
  return photo.urls.regular || photo.urls.full || photo.urls.raw || null;
}

function buildUsedSets(rows: ExistingEditorialImage[], excludeImageKey?: string) {
  const sourceIds = new Set<string>();
  const imageUrls = new Set<string>();

  for (const row of rows) {
    if (row.image_key === excludeImageKey) continue;
    if (row.source_id?.trim()) sourceIds.add(row.source_id);
    if (row.image_url?.trim()) imageUrls.add(row.image_url);
  }

  return { sourceIds, imageUrls };
}

async function findUniquePhoto(queries: string[], usedSourceIds: Set<string>, usedImageUrls: Set<string>) {
  for (const query of queries) {
    const photos = await searchUnsplashPhotos(query, 12);
    for (const photo of photos) {
      const imageUrl = imageUrlFor(photo);
      if (!photo.id || !imageUrl) continue;
      if (usedSourceIds.has(photo.id)) continue;
      if (usedImageUrls.has(imageUrl)) continue;
      return { query, photo, imageUrl };
    }
  }

  return null;
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { data: guides, error: guidesError } = await supabase
    .from("guides")
    .select("title")
    .in("status", ["published", "premium"]);
  if (guidesError) throw guidesError;

  const { data: rankings, error: rankingsError } = await supabase
    .from("rankings")
    .select("title,category")
    .in("status", ["published", "premium"]);
  if (rankingsError) throw rankingsError;

  const dynamicSeeds: SeedImage[] = [
    ...((guides ?? []) as GuideSeedRow[]).map((guide) => ({
      image_key: `guide_${editorialSeedSlug(guide.title)}`,
      queries: genericEditorialQueries(guide.title, "travel guide"),
      category: "guide"
    })),
    ...((rankings ?? []) as RankingSeedRow[]).map((ranking) => ({
      image_key: `ranking_${editorialSeedSlug(ranking.title)}`,
      queries: genericEditorialQueries(ranking.title, ranking.category),
      category: ranking.category
    }))
  ];

  const seeds = [...editorialImageSeeds, ...dynamicSeeds];
  const existingRows = await fetchEditorialImagesForAudit(supabase) as ExistingEditorialImage[];
  const initialAudit = auditEditorialImageRows(existingRows);
  const problematic = new Set(initialAudit.problematic_image_keys);

  const seeded = [];
  const replaced = [];
  const skipped = [];
  const errors = [];

  for (const seed of seeds) {
    try {
      const existing = existingRows.find((row) => row.image_key === seed.image_key);
      const shouldReplace = options.onlyProblematic && problematic.has(seed.image_key);

      if (options.onlyProblematic && !shouldReplace) {
        skipped.push({ image_key: seed.image_key, reason: "not_problematic" });
        continue;
      }

      if (existing && !shouldReplace) {
        skipped.push({ image_key: seed.image_key, reason: "exists" });
        continue;
      }

      const { sourceIds, imageUrls } = buildUsedSets(existingRows, seed.image_key);
      const match = await findUniquePhoto(seed.queries, sourceIds, imageUrls);

      if (!match) {
        errors.push({ image_key: seed.image_key, queries: seed.queries, error: "No unique Unsplash result" });
        continue;
      }

      const row = {
        image_key: seed.image_key,
        source: "unsplash",
        source_id: match.photo.id,
        image_url: match.imageUrl,
        image_download_url: match.photo.links.download_location ?? null,
        photographer_name: match.photo.user?.name ?? null,
        photographer_url: match.photo.user?.links?.html ?? null,
        alt: match.photo.alt_description || match.photo.description || match.query,
        query: match.query,
        category: seed.category ?? null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("editorial_images")
        .upsert(row, { onConflict: "image_key" });

      if (error) throw error;

      const summary = {
        image_key: seed.image_key,
        query: match.query,
        source_id: match.photo.id,
        photographer_name: match.photo.user?.name ?? null
      };

      if (existing) replaced.push(summary);
      else seeded.push(summary);

      const index = existingRows.findIndex((item) => item.image_key === seed.image_key);
      const updatedRow = { image_key: seed.image_key, source_id: match.photo.id, image_url: match.imageUrl };
      if (index >= 0) existingRows[index] = updatedRow;
      else existingRows.push(updatedRow);
    } catch (error) {
      errors.push({
        image_key: seed.image_key,
        queries: seed.queries,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  const finalRows = await fetchEditorialImagesForAudit(supabase);
  const finalAudit = auditEditorialImageRows(finalRows);

  console.log(
    JSON.stringify(
      {
        mode: options.onlyProblematic ? "only_problematic" : "seed_missing",
        imagenes_auditadas: initialAudit.total,
        imagenes_creadas: seeded.length,
        imagenes_reemplazadas: replaced.length,
        duplicados_restantes: {
          source_id: finalAudit.duplicate_source_id,
          image_url: finalAudit.duplicate_image_url
        },
        image_keys_sin_imagen: finalAudit.missing_image_url,
        seeded,
        replaced,
        skipped,
        errors
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
