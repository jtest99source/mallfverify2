create extension if not exists pgcrypto;

do $$ begin
  create type business_category as enum ('restaurant', 'hotel', 'beach-club', 'boat-rental', 'activity', 'beach');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ranking_category as enum ('restaurants', 'hotels', 'beach-clubs', 'boats', 'activities', 'beaches');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_status as enum ('draft', 'published', 'premium', 'hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type priority_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

create table if not exists businesses (
  id text primary key,
  slug text not null,
  name text not null,
  category business_category not null,
  short_description text not null default '',
  description text not null default '',
  area text not null default '',
  address text,
  latitude numeric,
  longitude numeric,
  website text,
  instagram text,
  phone text,
  price_level text,
  tags text[] not null default '{}',
  best_for text[] not null default '{}',
  image text,
  gallery text[] not null default '{}',
  opening_hours text,
  faqs jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{"title":"","description":""}'::jsonb,
  updated_at date not null default current_date,
  google_place_id text,
  rating numeric(2,1),
  reviews_count integer,
  google_maps_url text,
  source text not null default 'manual',
  status content_status not null default 'draft',
  commercial_priority priority_level not null default 'low',
  client_potential priority_level not null default 'low',
  is_featured boolean not null default false,
  is_claimed boolean not null default false,
  raw_google_place jsonb,
  created_at timestamptz not null default now(),
  imported_at timestamptz,
  unique (category, slug),
  unique (google_place_id)
);

create table if not exists rankings (
  id text primary key,
  slug text not null,
  locale text not null default 'es',
  title text not null,
  hook text not null default '',
  intro text not null default '',
  category ranking_category not null,
  area text,
  faqs jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{"title":"","description":""}'::jsonb,
  updated_at date not null default current_date,
  status content_status not null default 'draft',
  source text not null default 'manual',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  imported_at timestamptz,
  unique (locale, slug)
);

create table if not exists ranking_items (
  id uuid primary key default gen_random_uuid(),
  ranking_id text not null references rankings(id) on delete cascade,
  position integer not null,
  business_id text references businesses(id) on delete set null,
  name text not null,
  description text not null default '',
  why_we_picked_it text not null default '',
  best_for text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (ranking_id, position)
);

create table if not exists guides (
  id text primary key,
  slug text not null,
  locale text not null default 'es',
  title text not null,
  excerpt text not null default '',
  intro text not null default '',
  sections jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  seo jsonb not null default '{"title":"","description":""}'::jsonb,
  updated_at date not null default current_date,
  status content_status not null default 'draft',
  source text not null default 'manual',
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  imported_at timestamptz,
  unique (locale, slug)
);

create index if not exists businesses_category_status_idx on businesses(category, status);
create index if not exists businesses_slug_idx on businesses(slug);
create index if not exists businesses_area_idx on businesses(area);
create index if not exists businesses_google_place_id_idx on businesses(google_place_id);
create index if not exists businesses_featured_idx on businesses(is_featured) where is_featured = true;
create index if not exists businesses_commercial_priority_idx on businesses(commercial_priority);
create index if not exists businesses_client_potential_idx on businesses(client_potential);
create index if not exists rankings_locale_status_idx on rankings(locale, status);
create index if not exists rankings_category_idx on rankings(category);
create index if not exists rankings_featured_idx on rankings(is_featured) where is_featured = true;
create index if not exists ranking_items_ranking_id_idx on ranking_items(ranking_id);
create index if not exists ranking_items_business_id_idx on ranking_items(business_id);
create index if not exists guides_locale_status_idx on guides(locale, status);
create index if not exists guides_featured_idx on guides(is_featured) where is_featured = true;

alter table businesses enable row level security;
alter table rankings enable row level security;
alter table ranking_items enable row level security;
alter table guides enable row level security;

drop policy if exists "Public can read visible businesses" on businesses;
create policy "Public can read visible businesses"
  on businesses for select
  using (status in ('published', 'premium'));

drop policy if exists "Public can read visible rankings" on rankings;
create policy "Public can read visible rankings"
  on rankings for select
  using (status in ('published', 'premium'));

drop policy if exists "Public can read items of visible rankings" on ranking_items;
create policy "Public can read items of visible rankings"
  on ranking_items for select
  using (
    exists (
      select 1 from rankings
      where rankings.id = ranking_items.ranking_id
      and rankings.status in ('published', 'premium')
    )
  );

drop policy if exists "Public can read visible guides" on guides;
create policy "Public can read visible guides"
  on guides for select
  using (status in ('published', 'premium'));
