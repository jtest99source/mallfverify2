import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function searchUnsplash(query) {
  const r = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape&content_filter=high`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  );
  const data = await r.json();
  return data.results ?? [];
}

async function upsertImage(key, photo, altText) {
  const { error } = await sb.from("editorial_images").upsert({
    image_key: key,
    source: "unsplash",
    source_id: photo.id,
    image_url: photo.urls.regular,
    image_download_url: photo.links.download_location,
    photographer_name: photo.user.name,
    photographer_url: photo.user.links?.html,
    alt: altText,
    query: key,
    category: key,
  }, { onConflict: "image_key" });
  if (error) console.error(`✗ ${key}:`, error.message);
  else console.log(`✓ ${key} → ${photo.urls.regular.slice(0, 60)}...`);
}

// New categories to add
const NEW_CATEGORIES = [
  { key: "category_gym",     query: "gym fitness workout equipment",  alt: "Fitness gym equipment" },
  { key: "category_spa",     query: "luxury spa wellness pool",       alt: "Spa wellness center" },
  { key: "category_museum",  query: "museum art gallery interior",    alt: "Museum gallery" },
  { key: "category_bakery",  query: "artisan bakery pastry croissant",alt: "Artisan bakery" },
  { key: "category_bar",     query: "cocktail bar drinks night",      alt: "Cocktail bar" },
  { key: "category_nightlife", query: "nightclub music dance lights", alt: "Nightlife club" },
];

for (const { key, query, alt } of NEW_CATEGORIES) {
  const photos = await searchUnsplash(query);
  if (!photos.length) { console.log(`✗ No results for ${key}`); continue; }
  await upsertImage(key, photos[0], alt);
}
