-- Self-reported language verification: languages a business confirmed it serves
-- clients in, gathered by direct outreach. It is the business's own word (source
-- = business_direct), not a certification by us. Shape:
--   { "en": "fluent"|"basic", "de": "fluent"|"basic",
--     "other": ["swedish", ...], "confirmedAt": "2026-07", "source": "business_direct" }
alter table businesses add column if not exists language_verification jsonb;
