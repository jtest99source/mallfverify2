import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

type ContentType = "homepage" | "categories" | "guides" | "rankings" | "all";

type Options = {
  dryRun: boolean;
  onlyMissing: boolean;
  force: boolean;
  type: ContentType;
};

type GuideRow = {
  id: string;
  title: string;
  slug: string;
  hero_image_url: string | null;
};

type RankingRow = GuideRow & {
  category: string;
};

type EditorialImageRow = {
  image_key: string;
  image_url: string | null;
};

type EditorialImageTarget = {
  imageKey: string;
  query: string;
  category: string | null;
};

type UnsplashPhoto = {
  id: string;
  alt_description?: string | null;
  description?: string | null;
  urls?: {
    regular?: string;
  };
  links?: {
    download_location?: string;
    html?: string;
  };
  user?: {
    name?: string;
    links?: {
      html?: string;
    };
  };
};

type SelectedUnsplashImage = {
  id: string;
  imageUrl: string;
  downloadUrl?: string;
  photographerName?: string;
  photographerUrl?: string;
  alt?: string;
};

const contentTypes: ContentType[] = ["homepage", "categories", "guides", "rankings", "all"];

const homepageTarget: EditorialImageTarget = {
  imageKey: "homepage_hero",
  query: "mallorca aerial coastline",
  category: "homepage"
};

const categoryTargets: EditorialImageTarget[] = [
  { imageKey: "category_restaurant", query: "mallorca restaurant mediterranean food", category: "restaurant" },
  { imageKey: "category_hotel", query: "mallorca luxury hotel pool", category: "hotel" },
  { imageKey: "category_beach_club", query: "mallorca beach club sunset", category: "beach-club" },
  { imageKey: "category_boat_rental", query: "mallorca sailboat sea", category: "boat-rental" },
  { imageKey: "category_activity", query: "mallorca adventure nature", category: "activity" },
  { imageKey: "category_beach", query: "mallorca cala turquoise water", category: "beach" }
];

function ensureHeroColumn(error: { message?: string } | null) {
  if (!error) return;
  if (error.message?.includes("hero_image_url")) {
    throw new Error("Missing hero_image_url column. Apply supabase/migrations/014_content_hero_images.sql before running this script.");
  }
  throw error;
}

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseOptions(): Options {
  const args = new Set(process.argv.slice(2));
  const typeArg = process.argv.find((arg) => arg.startsWith("--type="))?.split("=")[1] as ContentType | undefined;
  const type = typeArg && contentTypes.includes(typeArg) ? typeArg : "all";
  const force = args.has("--force");

  return {
    dryRun: args.has("--dry-run"),
    force,
    onlyMissing: !force && (args.has("--only-missing") || !args.has("--include-existing")),
    type
  };
}

function createClientFromEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false }
  });
}

function guideKeyword(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("alojarse") || normalized.includes("hotel")) return "mallorca hotel";
  if (normalized.includes("barco") || normalized.includes("boat")) return "mallorca sailboat sea";
  if (normalized.includes("playa") || normalized.includes("cala")) return "mallorca beach cala";
  if (normalized.includes("restaurante")) return "mallorca restaurant";
  return "mallorca mediterranean travel";
}

function rankingKeyword(title: string, category: string) {
  const titleWords = title
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ]+/gi, " ")
    .trim();
  const keywords: Record<string, string> = {
    hotels: "mallorca luxury hotel",
    restaurants: "mallorca restaurant",
    boats: "mallorca sailboat sea",
    activities: "mallorca adventure",
    beaches: "mallorca beach cala",
    "beach-clubs": "mallorca beach club"
  };
  return `${titleWords || "mallorca"} ${keywords[category] || "mallorca mediterranean travel"}`.trim();
}

async function fetchUnsplashImage(query: string, usedUrls: Set<string>) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("Missing UNSPLASH_ACCESS_KEY. Create one at https://unsplash.com/developers and add it to .env.local.");
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const params = new URLSearchParams({
      query,
      orientation: "landscape",
      content_filter: "high"
    });

    const response = await fetch(`https://api.unsplash.com/photos/random?${params.toString()}`, {
      headers: { Authorization: `Client-ID ${accessKey}` }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Unsplash API error ${response.status}: ${body}`);
    }

    const photo = (await response.json()) as UnsplashPhoto;
    const imageUrl = photo.urls?.regular;
    if (imageUrl && !usedUrls.has(imageUrl)) {
      usedUrls.add(imageUrl);
      return {
        id: photo.id,
        imageUrl,
        downloadUrl: photo.links?.download_location,
        photographerName: photo.user?.name,
        photographerUrl: photo.user?.links?.html,
        alt: photo.alt_description || photo.description || query
      } satisfies SelectedUnsplashImage;
    }
  }

  throw new Error(`Could not find a non-duplicated Unsplash image for "${query}".`);
}

async function loadUsedUrls(supabase: ReturnType<typeof createClientFromEnv>) {
  const usedUrls = new Set<string>();
  const [guidesResult, rankingsResult, editorialImagesResult] = await Promise.all([
    supabase.from("guides").select("hero_image_url").not("hero_image_url", "is", null),
    supabase.from("rankings").select("hero_image_url").not("hero_image_url", "is", null),
    supabase.from("editorial_images").select("image_url").not("image_url", "is", null)
  ]);

  ensureHeroColumn(guidesResult.error);
  ensureHeroColumn(rankingsResult.error);
  if (editorialImagesResult.error) throw editorialImagesResult.error;

  for (const row of [...(guidesResult.data ?? []), ...(rankingsResult.data ?? [])] as Array<{ hero_image_url?: string | null }>) {
    if (row.hero_image_url) usedUrls.add(row.hero_image_url);
  }

  for (const row of (editorialImagesResult.data ?? []) as Array<{ image_url?: string | null }>) {
    if (row.image_url) usedUrls.add(row.image_url);
  }

  return usedUrls;
}

async function assignEditorialImage(
  supabase: ReturnType<typeof createClientFromEnv>,
  target: EditorialImageTarget,
  options: Options,
  usedUrls: Set<string>
) {
  const { data, error } = await supabase
    .from("editorial_images")
    .select("image_key,image_url")
    .eq("image_key", target.imageKey)
    .maybeSingle();
  if (error) throw error;

  const existing = data as EditorialImageRow | null;
  if (options.onlyMissing && existing?.image_url) {
    console.log(`skip editorial ${target.imageKey}: already has image`);
    return;
  }

  if (options.dryRun) {
    console.log(`[dry-run] editorial ${target.imageKey}: ${target.query}`);
    return;
  }

  const image = await fetchUnsplashImage(target.query, usedUrls);
  const payload = {
    image_key: target.imageKey,
    source: "unsplash",
    source_id: image.id,
    image_url: image.imageUrl,
    image_download_url: image.downloadUrl ?? null,
    photographer_name: image.photographerName ?? null,
    photographer_url: image.photographerUrl ?? null,
    alt: image.alt ?? target.query,
    query: target.query,
    category: target.category
  };

  // Unsplash images require attribution in production; keep photographer/link metadata available for UI display.
  const { error: upsertError } = await supabase
    .from("editorial_images")
    .upsert(payload, { onConflict: "image_key" });
  if (upsertError) throw upsertError;
  console.log(`editorial ${target.imageKey}: ${image.imageUrl}`);
}

async function assignHomepage(supabase: ReturnType<typeof createClientFromEnv>, options: Options, usedUrls: Set<string>) {
  await assignEditorialImage(supabase, homepageTarget, options, usedUrls);
}

async function assignCategories(supabase: ReturnType<typeof createClientFromEnv>, options: Options, usedUrls: Set<string>) {
  for (const target of categoryTargets) {
    await assignEditorialImage(supabase, target, options, usedUrls);
  }
}

async function assignGuides(supabase: ReturnType<typeof createClientFromEnv>, options: Options, usedUrls: Set<string>) {
  let query = supabase.from("guides").select("id,title,slug,hero_image_url").order("updated_at", { ascending: false });
  if (options.onlyMissing) query = query.is("hero_image_url", null);
  const { data, error } = await query;
  ensureHeroColumn(error);

  for (const guide of (data ?? []) as GuideRow[]) {
    const keyword = guideKeyword(guide.title);
    if (options.dryRun) {
      console.log(`[dry-run] guide ${guide.slug}: ${keyword}`);
      continue;
    }

    const image = await fetchUnsplashImage(keyword, usedUrls);
    const { error: updateError } = await supabase.from("guides").update({ hero_image_url: image.imageUrl }).eq("id", guide.id);
    if (updateError) throw updateError;
    console.log(`guide ${guide.slug}: ${image.imageUrl}`);
  }
}

async function assignRankings(supabase: ReturnType<typeof createClientFromEnv>, options: Options, usedUrls: Set<string>) {
  let query = supabase.from("rankings").select("id,title,slug,category,hero_image_url").order("updated_at", { ascending: false });
  if (options.onlyMissing) query = query.is("hero_image_url", null);
  const { data, error } = await query;
  ensureHeroColumn(error);

  for (const ranking of (data ?? []) as RankingRow[]) {
    const keyword = rankingKeyword(ranking.title, ranking.category);
    if (options.dryRun) {
      console.log(`[dry-run] ranking ${ranking.slug}: ${keyword}`);
      continue;
    }

    const image = await fetchUnsplashImage(keyword, usedUrls);
    const { error: updateError } = await supabase.from("rankings").update({ hero_image_url: image.imageUrl }).eq("id", ranking.id);
    if (updateError) throw updateError;
    console.log(`ranking ${ranking.slug}: ${image.imageUrl}`);
  }
}

async function main() {
  loadLocalEnv();
  const options = parseOptions();
  const supabase = createClientFromEnv();
  const usedUrls = await loadUsedUrls(supabase);

  if (options.type === "homepage" || options.type === "all") await assignHomepage(supabase, options, usedUrls);
  if (options.type === "categories" || options.type === "all") await assignCategories(supabase, options, usedUrls);
  if (options.type === "guides" || options.type === "all") await assignGuides(supabase, options, usedUrls);
  if (options.type === "rankings" || options.type === "all") await assignRankings(supabase, options, usedUrls);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
