create table if not exists editorial_images (
  id uuid primary key default gen_random_uuid(),
  image_key text not null unique,
  source text not null default 'unsplash',
  source_id text,
  image_url text not null,
  image_download_url text,
  photographer_name text,
  photographer_url text,
  alt text,
  query text,
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists editorial_images_source_idx on editorial_images(source);
create index if not exists editorial_images_category_idx on editorial_images(category);
create index if not exists editorial_images_image_key_idx on editorial_images(image_key);

alter table editorial_images enable row level security;

drop policy if exists "Public can read editorial images" on editorial_images;
create policy "Public can read editorial images"
  on editorial_images for select
  using (true);
