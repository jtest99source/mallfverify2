import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import path from "node:path";

const [, , inputPath] = process.argv;

if (!inputPath) {
  console.error("Usage: npm run db:import -- path/to/content.json|path/to/businesses.csv");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function toSnakeBusiness(business) {
  return {
    id: business.id,
    slug: business.slug,
    name: business.name,
    category: business.category,
    short_description: business.shortDescription ?? business.short_description ?? "",
    description: business.description ?? "",
    area: business.area ?? "",
    address: business.address ?? null,
    latitude: business.latitude ?? null,
    longitude: business.longitude ?? null,
    website: business.website ?? null,
    instagram: business.instagram ?? null,
    phone: business.phone ?? null,
    price_level: business.priceLevel ?? business.price_level ?? null,
    tags: business.tags ?? [],
    best_for: business.bestFor ?? business.best_for ?? [],
    image: business.image ?? null,
    gallery: business.gallery ?? [],
    opening_hours: business.openingHours ?? business.opening_hours ?? null,
    faqs: business.faqs ?? [],
    seo: business.seo ?? { title: "", description: "" },
    updated_at: business.updatedAt ?? business.updated_at ?? new Date().toISOString().slice(0, 10),
    google_place_id: business.googlePlaceId ?? business.google_place_id ?? null,
    rating: business.rating ?? null,
    reviews_count: business.reviewsCount ?? business.reviews_count ?? null,
    google_maps_url: business.googleMapsUrl ?? business.google_maps_url ?? null,
    source: business.source ?? "manual",
    status: business.status ?? "published",
    commercial_priority: business.commercialPriority ?? business.commercial_priority ?? "low",
    client_potential: business.clientPotential ?? business.client_potential ?? "medium",
    is_featured: business.isFeatured ?? business.is_featured ?? false,
    is_claimed: business.isClaimed ?? business.is_claimed ?? false,
    raw_google_place: business.rawGooglePlace ?? business.raw_google_place ?? null,
    imported_at: new Date().toISOString()
  };
}

function toSnakeRanking(ranking) {
  return {
    id: ranking.id,
    slug: ranking.slug,
    locale: ranking.locale ?? "es",
    title: ranking.title,
    hook: ranking.hook ?? "",
    intro: ranking.intro ?? "",
    category: ranking.category,
    area: ranking.area ?? null,
    faqs: ranking.faqs ?? [],
    seo: ranking.seo ?? { title: "", description: "" },
    updated_at: ranking.updatedAt ?? ranking.updated_at ?? new Date().toISOString().slice(0, 10),
    status: ranking.status ?? "published",
    source: ranking.source ?? "manual",
    is_featured: ranking.isFeatured ?? ranking.is_featured ?? false,
    imported_at: new Date().toISOString()
  };
}

function toSnakeGuide(guide) {
  return {
    id: guide.id,
    slug: guide.slug,
    locale: guide.locale ?? "es",
    title: guide.title,
    excerpt: guide.excerpt ?? "",
    intro: guide.intro ?? "",
    sections: guide.sections ?? [],
    faqs: guide.faqs ?? [],
    seo: guide.seo ?? { title: "", description: "" },
    updated_at: guide.updatedAt ?? guide.updated_at ?? new Date().toISOString().slice(0, 10),
    status: guide.status ?? "published",
    source: guide.source ?? "manual",
    is_featured: guide.isFeatured ?? guide.is_featured ?? false,
    imported_at: new Date().toISOString()
  };
}

function parseMaybeJson(value) {
  if (value === undefined || value === null || value === "") return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) return JSON.parse(trimmed);
  return trimmed.includes("|") ? trimmed.split("|").map((item) => item.trim()).filter(Boolean) : trimmed;
}

function parseCsv(content) {
  const rows = [];
  let field = "";
  let row = [];
  let quoted = false;
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];
    if (char === '"' && quoted && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  row.push(field);
  if (row.some((cell) => cell.trim() !== "")) rows.push(row);

  const [headers, ...records] = rows;
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header.trim(), parseMaybeJson(record[index])])));
}

async function upsertBusinesses(businesses = []) {
  if (!businesses.length) return;
  const { error } = await supabase.from("businesses").upsert(businesses.map(toSnakeBusiness), { onConflict: "id" });
  if (error) throw error;
  console.log(`Imported businesses: ${businesses.length}`);
}

async function upsertRankings(rankings = []) {
  for (const ranking of rankings) {
    const { error: rankingError } = await supabase.from("rankings").upsert(toSnakeRanking(ranking), { onConflict: "id" });
    if (rankingError) throw rankingError;

    if (ranking.items?.length) {
      const items = ranking.items.map((item) => ({
        ranking_id: ranking.id,
        position: item.position,
        business_id: item.businessId ?? item.business_id ?? null,
        name: item.name,
        description: item.description ?? "",
        why_we_picked_it: item.whyWePickedIt ?? item.why_we_picked_it ?? "",
        best_for: item.bestFor ?? item.best_for ?? []
      }));
      const { error: itemsError } = await supabase.from("ranking_items").upsert(items, { onConflict: "ranking_id,position" });
      if (itemsError) throw itemsError;
    }
  }
  if (rankings.length) console.log(`Imported rankings: ${rankings.length}`);
}

async function upsertGuides(guides = []) {
  if (!guides.length) return;
  const { error } = await supabase.from("guides").upsert(guides.map(toSnakeGuide), { onConflict: "id" });
  if (error) throw error;
  console.log(`Imported guides: ${guides.length}`);
}

const absolutePath = path.resolve(inputPath);
const raw = await readFile(absolutePath, "utf8");
const extension = path.extname(absolutePath).toLowerCase();

if (extension === ".csv") {
  await upsertBusinesses(parseCsv(raw));
} else {
  const content = JSON.parse(raw);
  await upsertBusinesses(content.businesses ?? []);
  await upsertRankings(content.rankings ?? []);
  await upsertGuides(content.guides ?? []);
}
