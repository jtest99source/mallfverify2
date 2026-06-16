alter table businesses add column if not exists category_attributes jsonb;
alter table businesses add column if not exists business_self_description text;

comment on column businesses.category_attributes is
'Structured editorial attributes derived from reviews/Places by category. Expected shape: {"schema_version":1,"confidence":"high|medium|low","data":{...category-specific fields...}}.';

comment on column businesses.price_estimate is
'JSON price contract. Current target shape: {"amount_min":number|null,"amount_max":number|null,"currency":"EUR","unit":"person|night|day|half_day|charter|ticket|entry|menu|null","label":text|null,"source":"google_places|reviews|website|manual|null","confidence":"high|medium|low","note":text|null,"reported_by":number|null}. Legacy keys such as range_min/range_max/per_person_min/per_person_max remain supported by the app.';

comment on column businesses.social_profiles is
'Social links object, populated by import/crawler/manual sources. Expected keys: instagram, facebook, tiktok, website.';

comment on column businesses.business_self_description is
'Short factual description published by the business or returned by Google Places editorial/generative summaries; used as source material, not as final editorial copy.';
