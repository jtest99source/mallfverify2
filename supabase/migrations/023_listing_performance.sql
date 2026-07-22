-- Performance: crawl traffic over ~26k ISR URLs saturated the Nano instance
-- (100% CPU + Disk IO budget exhausted on 2026-07-22).

-- Ordered composite index matching the public listing query
-- (getBusinesses: filter category+status, order is_featured desc,
-- authority_score desc nulls last, reviews_count desc nulls last, id)
-- so Postgres can read rows pre-sorted instead of sorting the whole
-- category on every listing render.
create index if not exists businesses_listing_order_idx
  on businesses (category, status, is_featured desc, authority_score desc nulls last, reviews_count desc nulls last, id);

-- Exact duplicate of the unique constraint index businesses_google_place_id_key.
drop index if exists businesses_google_place_id_idx;
