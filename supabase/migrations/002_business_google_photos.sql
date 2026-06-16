alter table businesses
  add column if not exists primary_type text,
  add column if not exists primary_photo_name text,
  add column if not exists photo_names jsonb;

create index if not exists businesses_primary_type_idx on businesses(primary_type);
