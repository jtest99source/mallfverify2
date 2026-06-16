alter table businesses
  add column if not exists image_candidate_urls jsonb default '[]'::jsonb;

create index if not exists businesses_image_candidate_urls_gin_idx
  on businesses using gin (image_candidate_urls);
