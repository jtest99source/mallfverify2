alter table businesses
  add column if not exists original_name text,
  add column if not exists display_name text,
  add column if not exists name_quality_status text default 'raw';

create index if not exists businesses_display_name_idx on businesses(display_name);
create index if not exists businesses_name_quality_status_idx on businesses(name_quality_status);
