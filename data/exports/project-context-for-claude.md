# Project Context: Mallorca Verified — Blog Generation System

## Stack & Folder Structure
- **Framework:** Next.js 15 App Router (TypeScript + Tailwind CSS)
- **Database:** Supabase (PostgreSQL)
- **Site name:** Mallorca Verified — `mallorcaverified.com`
- **App directory:** `src/app/` — all routes inside `[locale]` dynamic segment
- **Key lib files:** `src/lib/repository.ts` (all DB queries), `src/lib/data.ts` (category config), `src/lib/i18n.ts`

---

## i18n / Locale Setup
- **3 locales:** `es`, `en`, `de` — default is `es`
- **Route structure:** `/{locale}/...` — e.g. `/es/restaurants/can-gusti`, `/en/hotels/...`
- **Implementation:** custom `[locale]` dynamic segment, no next-intl. `isLocale()` validates the segment.

---

## Business URL Structure
```
/{locale}/{categorySlug}/{businessSlug}
```
**Category slugs in use:**
`restaurants`, `hotels`, `beach-clubs`, `boats`, `activities`, `beaches`, `bars`, `cafes`, `bakeries`, `spas`, `gyms`, `rent-a-car`, `routes`, `excursions`

Each category has its own route: `src/app/[locale]/restaurants/[slug]/page.tsx` etc.

---

## Guides (Blog) URL Structure
```
/{locale}/guides/{guideSlug}
```
- **Index:** `/es/guides/` → shows editorial guides only (source != "generated")
- **Detail:** `/es/guides/mejores-restaurantes-palma`
- **Already built:** routing, rendering, business card embedding, FAQ schema, JSON-LD

---

## Guides Table Schema (Supabase)
```sql
guides (
  id text primary key,          -- e.g. "es-mejores-restaurantes-palma"
  slug text,                    -- e.g. "mejores-restaurantes-palma"
  locale text,                  -- "es" | "en" | "de"
  title text,
  excerpt text,
  intro text,
  sections jsonb,               -- [{heading, body, best_for[], business_ids[]}]
  faqs jsonb,                   -- [{question, answer}]
  seo jsonb,                    -- {title, description}
  hero_image_url text,
  status content_status,        -- 'draft' | 'published' | 'premium' | 'hidden'
  source text,                  -- 'manual' | 'editorial' | 'generated'
  is_featured boolean,
  updated_at date,
  unique(locale, slug)
)
```
Sections with `business_ids` render as linked business cards (image, name, rating, city, category label, "Ver ficha →").

---

## Business Data Fields — What's Available

### Always populated (all 5333 businesses):
| Field | Example |
|---|---|
| `id` | `google-ChIJ...` |
| `slug` | `can-gusti` |
| `name` | `Can Gusti` |
| `category` | `restaurant` |
| `status` | `published` |
| `city` / `area` | `Palma` |
| `address` | Full address string |
| `rating` | `4.5` |
| `reviews_count` | `955` |
| `authority_score` | `154.6` |
| `website` | URL |
| `phone` | `+34 ...` |
| `google_maps_url` | URL |
| `opening_hours` | Text block |
| `tags` | `["restaurant", "spanish_restaurant"]` |
| `primary_image_url` | Google Places photo URL |

### AI-enriched fields — ~1000 of 5333 have these (enrichment still running):
| Field | Content |
|---|---|
| `review_themes` | `[{icon, label}]` — e.g. "Cocina tradicional", "Trato familiar" |
| `review_pros` | `["Trato muy amable", "Platos tradicionales bien resueltos"]` |
| `services` | `[{icon, label}]` — dishes, amenities, service style |
| `category_attributes` | `{cuisine_types, signature_items, atmosphere_tags, best_for, service_notes, reservation_notes, price_signal}` |
| `featured_reviews` | `[{author, rating, text, text_translated, date, topic}]` — real Google reviews translated to ES |
| `faq_auto` | `[{question, answer}]` — 4 auto FAQs |
| `ai_description` | Short generic description |
| `review_summary` | Short summary |
| `ideal_for` | `["cena tranquila", "plan en pareja"]` |
| `what_to_expect` | Longer expectation text |

### Empty/null for most businesses:
`editorial_description`, `instagram`, `price_level`, `gallery_image_urls`, `best_for[]`

---

## Sample Enriched Business (restaurant)

```json
{
  "name": "Can Gusti",
  "category": "restaurant",
  "rating": 4.5,
  "reviews_count": 955,
  "authority_score": 154.6,
  "editorial_status": "ai_generated",
  "review_themes": [
    { "icon": "sparkles", "label": "Ambiente acogedor" },
    { "icon": "mood-smile", "label": "Servicio atento" },
    { "icon": "tools-kitchen-2", "label": "Cocina tradicional" },
    { "icon": "sparkles", "label": "Trato familiar" },
    { "icon": "sunset", "label": "Cena tranquila" }
  ],
  "review_pros": [
    "Trato muy amable",
    "Platos tradicionales bien resueltos",
    "Ambiente de casa familiar"
  ],
  "category_attributes": {
    "data": {
      "cuisine_types": ["tradicional", "mallorquina", "mediterránea"],
      "signature_items": ["paella", "cordero", "T-bone steak", "sobrasada omelette"],
      "atmosphere_tags": ["familiar", "acogedor", "tranquilo", "casero"],
      "best_for": ["cena tranquila", "comida tradicional", "plan en pareja"],
      "price_signal": "fair",
      "reservation_notes": ["Conviene ir con tiempo en la cena"]
    }
  },
  "featured_reviews": [
    {
      "author": "Jian Xiang Ang",
      "rating": 5,
      "text_translated": "21€ por un T-bone de 21 oz, perfectamente hecho. Can Gusti es un restaurante familiar encantador; da la impresión de que esta familia ha abierto su casa y te ha recibido para cenar. Volveré para probar la tortilla de sobrasada.",
      "date": "11 months ago",
      "topic": "Ambiente familiar"
    },
    {
      "author": "Oliver Smit",
      "rating": 5,
      "text_translated": "Con diferencia, nuestro favorito de esta parte de la isla. El cordero estaba increíble; comimos aquí varias veces durante nuestra estancia de dos semanas y volvimos en nuestra última noche.",
      "date": "7 months ago",
      "topic": "Servicio cercano"
    }
  ]
}
```

---

## Business Counts by Category
```
restaurant:   1256    bar:       559
hotel:         763    cafe:      379
spa:           286    gym:       335
boat-rental:   266    bakery:    252
rent-a-car:    211    beach:     220
activity:      400    route:     145
beach-club:    134    excursion: 126
TOTAL:        5333
```

## Cities with Most Coverage
Palma, Alcúdia, Pollença, Sóller, Cala Ratjada, Santanyí, Manacor, Can Picafort, Portocolom, Calvià, Andratx, Cala d'Or, Santa Ponça, Felanitx, Artà, Campos, Llucmajor, Inca, Muro, Sa Pobla

---

## Current Blog State
- **322 auto-generated ranking guides** in DB (`source: "generated"`) — e.g. `mejores-restaurantes-palma`, `mejores-hoteles-alcudia`. Top 10 businesses per category+city by authority_score.
- **0 editorial guides** currently live — old ones were hidden, new ones not written yet.
- The `/es/guides` index **excludes** `source: "generated"` guides — they're accessible by direct URL only.

---

## Upsert Pattern for New Guides
```js
await supabase.from("guides").upsert(guideObject, { onConflict: "locale,slug" });
```
Safe to re-run — updates without duplicating.

---

## Blockers / Things to Know
1. **Enrichment is ~19% done** (1000/5333). Non-enriched businesses only have name, rating, city, image. No signature dishes, atmosphere, or featured reviews yet.
2. **No editorial blog content exists yet.** The guides table and frontend rendering are fully built — only the content is missing.
3. **`source` field matters:** `"generated"` guides are excluded from the `/guides` index. Editorial content should use `"editorial"`.
4. **Business CTA URL pattern:** `/{locale}/{categorySlug}/{slug}` — e.g. `/es/restaurants/can-gusti`
5. **Guide sections support `business_ids[]`** — these render as cards with photo, name, rating, city and a link to the full listing.
