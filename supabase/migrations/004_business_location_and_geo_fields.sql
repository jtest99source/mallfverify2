alter table businesses
  add column if not exists city text,
  add column if not exists municipality text,
  add column if not exists island text default 'Mallorca',
  add column if not exists website_type text,
  add column if not exists social_profiles jsonb default '{}'::jsonb,
  add column if not exists authority_score numeric,
  add column if not exists geo_score numeric,
  add column if not exists editorial_status text default 'raw',
  add column if not exists ai_description text,
  add column if not exists editorial_description text,
  add column if not exists review_summary text;

create index if not exists businesses_area_idx on businesses(area);
create index if not exists businesses_city_idx on businesses(city);
create index if not exists businesses_municipality_idx on businesses(municipality);
create index if not exists businesses_authority_score_idx on businesses(authority_score desc);
create index if not exists businesses_boat_authority_score_idx
  on businesses(authority_score desc)
  where category = 'boat-rental';
create index if not exists businesses_geo_score_idx on businesses(geo_score desc);
create index if not exists businesses_editorial_status_idx on businesses(editorial_status);
