-- Professional-services money verticals for the Services hub: lawyers and
-- tax advisors / gestorías. New real categories (not carve-outs), so they need
-- their own business_category enum values before any rows can be imported.
alter type business_category add value if not exists 'lawyer';
alter type business_category add value if not exists 'tax-advisor';

alter type ranking_category add value if not exists 'lawyer';
alter type ranking_category add value if not exists 'tax-advisor';
