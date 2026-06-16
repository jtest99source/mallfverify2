alter table businesses
  add column if not exists place_photos jsonb default '[]'::jsonb,
  add column if not exists place_reviews jsonb default '[]'::jsonb,
  add column if not exists business_facts jsonb default '[]'::jsonb,
  add column if not exists visit_tips jsonb default '[]'::jsonb,
  add column if not exists editorial_opinion text,
  add column if not exists highlights jsonb default '[]'::jsonb,
  add column if not exists reservation_hint text,
  add column if not exists parking_hint text,
  add column if not exists season_hint text,
  add column if not exists detail_enriched_at timestamptz;
