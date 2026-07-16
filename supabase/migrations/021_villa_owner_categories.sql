-- Villa-owner economy verticals for the Services hub: property management,
-- renovations (reformas + architects), and pool/garden maintenance. New real
-- categories (not carve-outs), so they need their own business_category enum
-- values before any rows can be imported.
alter type business_category add value if not exists 'property-management';
alter type business_category add value if not exists 'renovations';
alter type business_category add value if not exists 'pool-garden';

alter type ranking_category add value if not exists 'property-management';
alter type ranking_category add value if not exists 'renovations';
alter type ranking_category add value if not exists 'pool-garden';
