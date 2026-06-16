alter table businesses
  add column if not exists ideal_for jsonb,
  add column if not exists what_to_expect text,
  add column if not exists faq_auto jsonb;

create index if not exists businesses_ideal_for_gin_idx on businesses using gin (ideal_for);
