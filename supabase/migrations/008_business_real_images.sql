alter table businesses
  add column if not exists primary_image_url text,
  add column if not exists primary_image_source text,
  add column if not exists primary_image_credit text,
  add column if not exists gallery_image_urls jsonb default '[]'::jsonb,
  add column if not exists image_status text default 'missing';

create index if not exists businesses_image_status_idx on businesses(image_status);
create index if not exists businesses_primary_image_source_idx on businesses(primary_image_source);
