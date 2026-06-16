# Project Audit

Generated: 2026-06-08

## Executive Summary

Mallorca Verified is now operating as a GEO entity engine with 825 businesses, 515 published business pages, 26 published rankings, 3 guides, category rankings, location rankings, an internal admin panel, scoring, generated editorial content, and real map/entity data for almost all published records.

Since the previous audit:

- Beaches published increased from 5 to 50.
- Beach clubs published increased from 5 to 40.
- Global beach ranking now exists.
- Location rankings increased from 15 to 17.
- Missing coordinates / Google Maps URLs dropped from 35 to 3.
- Total sitemap URLs increased from 471 to 554.

The project is now ready to move into UX/design work, with three practical caveats: reduce generic `area = Mallorca`, manually resolve the 3 remaining map misses, and clean the few long display names.

## 1. Businesses By Category

| Category | Total | Published | Draft | Premium | Hidden |
|---|---:|---:|---:|---:|---:|
| restaurant | 210 | 210 | 0 | 0 | 0 |
| hotel | 205 | 80 | 125 | 0 | 0 |
| boat-rental | 119 | 80 | 39 | 0 | 0 |
| activity | 146 | 55 | 91 | 0 | 0 |
| beach-club | 60 | 40 | 20 | 0 | 0 |
| beach | 85 | 50 | 35 | 0 | 0 |

Total businesses: 825.

## 2. Indexable URLs

| Type | Count |
|---|---:|
| Businesses published/premium | 515 |
| Rankings published/premium | 26 |
| Guides published/premium | 3 |
| Static/index URLs | 10 |
| Total sitemap URLs | 554 |

Notes:

- Draft, hidden, and non-public entities are not indexable.
- Sitemap is currently generated for locale `es`.
- The indexable base is now strong enough for UX/design iteration without blocking GEO growth.

## 3. Problems Pending

| Issue | Count |
|---|---:|
| area = Mallorca | 148 |
| Missing coordinates | 3 |
| Missing google_maps_url | 3 |
| Missing display_name | 0 |
| Missing ai_description/editorial_description | 0 |
| Long display_name > 80 chars | 5 |

### Remaining Missing Maps

| Name | Category | Status | Area | Issue |
|---|---|---|---|---|
| El Camino | restaurant | published | Mallorca | Google returned low-confidence result |
| Cala Varques | beach | published | Mallorca | Google result lacked strong Balearic address signal |
| Cala Deia | beach | published | Deia | Google result lacked strong Balearic address signal |

These three should be fixed manually in admin or with a targeted override. The automated script correctly skipped them instead of risking false coordinates.

### area = Mallorca

There are still 148 records with generic area. This does not block the global category pages, but it limits future local pages like `top-beaches-santanyi`, `top-restaurants-soller`, or `top-activities-deia`.

Examples:

| Name | Category | Status |
|---|---|---|
| Mirador de Sa Foradada | activity | published |
| Patiki Beach | restaurant | published |
| Sa Calobra | beach | published |
| Assona Portals | beach-club | published |
| Mallorca Boat Hire | boat-rental | published |
| Miceli | restaurant | published |
| Nikki Beach Mallorca | beach-club | published |
| Es Trenc | beach | published |
| Bodegas de Binissalem | activity | published |

### Long Display Names

| Display name | Category | Status |
|---|---|---|
| Pleta de Mar Grand Luxury Hotel by nature, adults only - Preferred Hotels & Resorts | hotel | draft |
| West Coast Divers Mallorca-PADI Dive Resort, Tauchschule, Centro de Buceo, Diving Centre | activity | draft |
| Dive Inn Mallorca Tauchschule Tauchbasis fur Tauchen Tauchschnupperkurs PADI Open Water | activity | draft |
| Deportes de Agua\|Kitesurfing, Windsurfing, Wingfoil, Paddlesurf, Catamaran Center | activity | draft |
| Palma Diving. 10 years of teaching, 30 years of experience, 5 star padi dive center | activity | published |

Only one long-name issue is published. This is a small, high-leverage admin cleanup.

## 4. Rankings

| Metric | Count |
|---|---:|
| Total rankings | 26 |
| Published/premium rankings | 26 |
| Global generated rankings | 6 |
| Location rankings | 17 |
| Manual seed rankings | 3 |

### Ranking Sources

| Source | Count |
|---|---:|
| manual_seed | 3 |
| generated_geo | 6 |
| generated_geo_location | 17 |

### Categories Covered

| Category | Published rankings |
|---|---:|
| restaurants | 6 |
| hotels | 6 |
| boats | 7 |
| activities | 2 |
| beach-clubs | 4 |
| beaches | 1 |

Global rankings now exist for every major category:

- restaurants
- hotels
- boat rentals
- activities
- beach clubs
- beaches

### Location Rankings

| Ranking category | Locations |
|---|---|
| restaurants | Andratx, Cala d'Or, Palma, Port d'Andratx |
| hotels | Andratx, Cala d'Or, Calvia, Palma, Playa de Muro |
| boats | Andratx, Cala d'Or, Palma, Port d'Andratx, Puerto Portals |
| activities | Palma |
| beach-clubs | Calvia, Palma |
| beaches | - |

### Rankings Missing

No priority category/location combination currently has 5+ published businesses without a generated ranking. The generator is covering all eligible groups.

The next missing opportunities are not code problems; they require either more published businesses in specific locations or better location inference. Beaches have strong global coverage now, but no beach location ranking yet because no priority beach location currently reaches the 5 published item threshold.

## 5. Top 30 By Authority Score

| # | Name | Category | Status | Area | City | Rating | Reviews | Authority |
|---:|---|---|---|---|---|---:|---:|---:|
| 1 | Catedral-Basilica de Santa Maria de Mallorca | activity | published | Palma | Palma | 4.7 | 64966 | 205.2539 |
| 2 | Cuevas del Drach | activity | published | Porto Cristo | - | 4.3 | 67717 | 197.6141 |
| 3 | Castillo de Bellver | activity | published | Palma | Palma | 4.5 | 26092 | 193.3305 |
| 4 | Barca Samba | boat-rental | published | Palma | Palma | 4.9 | 6909 | 189.7896 |
| 5 | Iberostar Waves Playa de Muro | hotel | published | Playa de Muro | - | 4.8 | 7962 | 189.0215 |
| 6 | Cuevas de Arta | activity | published | Arta | - | 4.7 | 9693 | 188.7301 |
| 7 | Parque Natural de Mondrago | beach | published | Mallorca | - | 4.7 | 16036 | 188.1025 |
| 8 | GOJET Alcudia JET SKI tours | boat-rental | published | Alcudia | Alcudia | 4.9 | 4108 | 185.2747 |
| 9 | Alcudia Garden Aparthotel | hotel | published | Alcudia | Alcudia | 4.6 | 7785 | 184.8263 |
| 10 | Iberostar Selection Playa de Muro Village | hotel | published | Playa de Muro | - | 4.8 | 3902 | 182.828 |
| 11 | Puerto de Alcudia | activity | published | Alcudia | Alcudia | 4.5 | 13169 | 182.3917 |
| 12 | Cuevas Dels Hams | activity | published | Manacor | - | 4.3 | 11475 | 182.1958 |
| 13 | GoFurgo.tours-Paddlesurf y snorkel en las mejores calas de Baleares | activity | published | Mallorca | - | 5 | 2224 | 181.9466 |
| 14 | Mallorquad, Mallor'quad, Majorque quad | activity | published | Santa Ponca | - | 5 | 2220 | 181.931 |
| 15 | Restaurant Celler Ca'n Costa Alcudia | restaurant | published | Alcudia | Alcudia | 4.8 | 3118 | 180.8803 |
| 16 | Playa Santa Ponsa | beach | published | Santa Ponca | - | 4.4 | 7736 | 180.7715 |
| 17 | JET SKI MALLORCA-RIDE EXPERIENCES | activity | published | Camp de Mar | - | 5 | 1678 | 179.501 |
| 18 | JETSKI VICE MALLORCA RENTAL & TOURS CALA D'OR | activity | published | Cala d'Or | - | 5 | 1631 | 179.2544 |
| 19 | La nueva burguesa | restaurant | published | Palma | Palma | 4.8 | 2570 | 179.202 |
| 20 | Bombay Beach Indian Restaurant | restaurant | published | Port d'Alcudia | Alcudia | 4.9 | 1930 | 178.7156 |
| 21 | Restaurante Illeta | restaurant | published | Camp de Mar | - | 4.3 | 7671 | 178.6982 |
| 22 | Basico Gastrobar\|Alcudia Restaurant | restaurant | published | Alcudia | Alcudia | 4.7 | 3035 | 178.646 |
| 23 | NOU CALA BLAVA\|Mallorca restaurant | restaurant | published | Mallorca | - | 4.7 | 2905 | 178.2659 |
| 24 | Basico Steak House\|Alcudia Restaurant | restaurant | published | Alcudia | Alcudia | 4.7 | 2888 | 178.215 |
| 25 | Alua Boccaccio | hotel | published | Port d'Alcudia | Alcudia | 4.5 | 4446 | 177.9613 |
| 26 | Azuca-Urban Bistro | restaurant | published | Palma | Palma | 5 | 1398 | 177.9164 |
| 27 | Krishna Curry Bar Santa Catalina | restaurant | published | Palma | Palma | 4.9 | 1724 | 177.7358 |
| 28 | Restaurante Tabana | restaurant | published | Palma | Palma | 4.6 | 3397 | 177.6245 |
| 29 | Celler La Parra | restaurant | published | Pollenca | Pollenca | 4.6 | 3373 | 177.5629 |
| 30 | NU Mallorca | restaurant | published | Playa de Muro | - | 4.5 | 4191 | 177.4484 |

## 6. Recommendations

### Fix Before Redesign

1. Reduce `area = Mallorca` from 148 to under 75.
   - Prioritize published records first.
   - Beaches, beach clubs, and high-authority activities are the most valuable groups for local GEO pages.

2. Manually fix the 3 remaining map misses.
   - `El Camino`
   - `Cala Varques`
   - `Cala Deia`
   - The automated script skipped these correctly because the Google result was not confident enough.

3. Clean the 5 long display names.
   - Start with the published one: Palma Diving.
   - The other 4 are drafts, so they are less urgent.

4. Review the first viewport of category and ranking pages.
   - The entity base is now strong enough; visual hierarchy and UX can start carrying more weight.

### Leave For Later

1. Photo download/CDN pipeline.
   - Useful, but not blocking the GEO foundation.

2. Full admin authentication and roles.
   - Essential before production exposure, but fine to defer during internal iteration.

3. Premium/claim workflow.
   - Fields exist, but commercial flows should wait until public UX is more polished.

4. Deeper editorial refinement per category/location.
   - Start with top-ranking businesses after the design system stabilizes.

## 7. UX/Design Readiness

Yes, the project is ready to move into UX and visual design.

The data layer is no longer the blocker: categories are populated, weak categories have been published, rankings exist, pages are indexable, maps are mostly fixed, and admin editing is available. The remaining cleanup is important, but it can happen in parallel with design rather than before it.
