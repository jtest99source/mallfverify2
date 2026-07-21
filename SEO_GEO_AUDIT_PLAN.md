# Mallorca Verified — Auditoría SEO/GEO y Plan de Acción

> Fecha: 21 julio 2026. Auditoría en 3 frentes: SEO técnico (codebase), contenido/GEO, off-page (indexación, backlinks, competidores).
> Enfoque: acciones que mueven la aguja. Lo menor va al final, anotado.

---

## Diagnóstico en una frase

**La casa está bien construida pero nadie la enlaza y parte del contenido está escondido:** el on-page (schemas, metadata, E-E-A-T, calidad de guías) está por encima de la media, pero (1) el perfil de backlinks es ~0 y la entidad "Mallorca Verified" no existe fuera del dominio, (2) bugs de sitemap/hreflang dejan invisibles las 33 guías en alemán — tu segundo público, (3) las money pages área×categoría son thin content sin superficie citable, y (4) los temas Tier 1 del backlog con mayor intención comercial siguen sin publicar.

### Evidencia clave (off-page)

- Sitio indexado en Google/Bing (EN y DE), pero **cero visibilidad en 6/6 queries objetivo probadas** (best restaurants Palma, english speaking dentist mallorca, deutschsprachiger Zahnarzt Mallorca, beach clubs 2026, best areas to stay…).
- **Cero menciones externas** de "Mallorca Verified"/mallorcaverified.com en foros, Reddit, prensa o directorios. La búsqueda de marca devuelve competidores (mbook.es, mallorca.dev), no el sitio.
- **Sin citación en LLMs.** Los motores de respuesta citan lo que rankea top-10 o lo que se menciona en Reddit/foros; hoy no ocurre ninguna de las dos.
- Queries **ganables** identificadas: donde rankean blogs pequeños (beach clubs, where to stay, day trips, dentistas DE — mallorca-journal.info rankea con un simple listado editorial). Queries **no ganables** a corto plazo: las de agregador (Tripadvisor/TheFork).
- Detalle: fichas con title antiguo "| Mallorca Insider" aún en la SERP (ej. `/en/activities/celler-ramanya`).

---

## FASE 0 — Fixes técnicos que desbloquean lo ya construido (1-2 días de código)

Máximo ROI: horas de trabajo que activan contenido ya existente.

1. **Sitemap ([src/app/sitemap.ts](src/app/sitemap.ts), líneas ~21 y ~39):**
   - Emitir cada guía **en los locales en que realmente existe en la DB** — hoy solo emite `es`/`en`: las **33 guías DE están fuera del sitemap** y se anuncian URLs es/en de versiones que no existen.
   - Añadir `/services`, `/insights` y el informe `insights/dental-mallorca-2026` (indexables, estratégicos, hoy fuera).
2. **Hreflang de guías ([guides/[slug]/page.tsx](src/app/[locale]/guides/[slug]/page.tsx)):** `alternateLocales` está hardcodeado a `["es","en"]`. Reflejar los locales reales del slug (incluir `de` y self-ref). Mapear los **6 pares EN↔DE con slug divergente** como alternates (best-beaches↔schoenste-straende, weather-by-month↔wetter-nach-monat, english-speaking-dentists↔deutschsprachige-zahnaerzte, things-to-do-palma↔sehenswuerdigkeiten-palma, things-to-know↔wissenswertes, best-events↔beste-events). Hoy Google los ve como huérfanas.
3. **Ficha de negocio — FAQs muertas ([src/lib/page-content.tsx](src/lib/page-content.tsx) ~659 y ~812):** se computa `getCombinedFaqs(...)` pero **ni se renderiza ni se emite `FAQPage`**. Renderizar `<FAQ>` + añadir `createFAQSchema(faqs)` al JsonLd. Añadir también las reseñas visibles como `Review` dentro del `LocalBusiness`. Es contenido citable ya generado que no llega al HTML.
4. **Schemas en plantillas de listado:** `ItemList` en `/areas/[area]/[category]` (hoy solo Breadcrumb) y portar el `FAQPage`/`CollectionPage` de la plantilla muerta `CategoryPage` a `/top/[category]` (la URL viva tras el redirect del middleware).
5. **Heading FAQ hardcodeado en español ([src/components/FAQ.tsx:12](src/components/FAQ.tsx#L12)):** "Preguntas frecuentes" aparece en páginas EN/DE. Localizar.
6. **Rebranding residual:** buscar titles "Mallorca Insider" restantes en DB, corregir y pedir recrawl en Search Console. De paso: comprobar en Search Console qué % del sitemap está realmente indexado (la muestra visible en SERP es pequeña).
7. **`/de/guides` con hreflang no recíproco** — con el fix 1-2 queda resuelto (ya hay 33 guías DE que poblarán el índice).

## FASE 1 — Engordar las money pages área×categoría (la mayor palanca de citación on-page)

Las páginas tipo "Dentists in Palma" ([areas/[area]/[category]/page.tsx](src/app/[locale]/areas/[area]/[category]/page.tsx)) **ya existen y están en el sitemap**, pero son un H1 + una línea genérica idéntica en todas + grid. Son exactamente el tipo de página que ChatGPT/Perplexity citan, y hoy no tienen nada que citar.

- Generar con el pipeline un **párrafo único por combinación** con datos reales de la DB: "N dentistas verificados en Palma, rating medio X, Y con atención en inglés, rango de precios…". Datos, no relleno.
- Añadir 2-4 FAQs por combinación donde tenga sentido (las verticales money: dental, real estate, healthcare).
- Con el `ItemList` de Fase 0, esto convierte **cientos de URLs thin en páginas citables** de una tacada.

## FASE 2 — Autoridad y backlinks (el verdadero cuello de botella)

Con 0 backlinks, ni el mejor contenido rankea. Nada del resto funciona sin esto.

1. **Programa de badge "Verified on Mallorca Verified"** con enlace dofollow a la ficha — tu activo único: ya tienes relación con los negocios por el outreach de verificación de idioma. Incluir el snippet HTML en ese mismo email. 20-50 enlaces de dominios locales legítimos transforma un dominio con 0 backlinks. **Coste cero, empezar ya.**
2. **Altas gratuitas** (esta semana): TalkMajorca (foro+directorio), AngloInfo Balearics, LinkedIn company page, Crunchbase.
3. **Participación genuina continua** (2-3 h/semana): Reddit r/Mallorca, grupos FB "I have a question" (~20k), "Mallorca Business Locals & Expats". Responder con las guías cuando respondan la pregunta (dentistas EN/DE y "without a car" son perfectas). Doble efecto: backlinks/menciones + Reddit es fuente principal de citación de LLMs.
4. **Data PR a prensa local** (mes 1): nota data-driven usando `/insights` — "Los 10 restaurantes mejor valorados según 500.000 reseñas" — a **Majorca Daily Bulletin** (EN; publicidad@majorcadailybulletin.es) y **Mallorca Zeitung / Mallorca Magazin** (DE — encaja con tu vertical de verificación de alemán). Canal alternativo: mediapoolmallorca.com.
5. **Guest posts / colaboraciones** (mes 1-2): themallorcan.com, palmaweekly.com, euroweeklynews.com, humansofmallorca.com — ofrecer datos exclusivos (MV Score, rankings por reseñas) a cambio de atribución con enlace.
6. **HARO/Connectively, Qwoted, #journorequest** como "fundador de Mallorca Verified" para temas Baleares/expat/viajes España.

## FASE 3 — Cerrar los gaps de contenido Tier 1 (apuntando a queries ganables)

Publicado real: 70 temas (50 EN, 33 DE, 30 ES). Pero los temas de mayor intención comercial del propio backlog siguen sin existir:

1. **Handyman / Handwerker** (EN+DE) — "el hueco más señalado por todas las IAs". No existe.
2. **Veterinario EN / Tierarzt DE** con urgencias 24h. No existe.
3. **"Dónde comen los locales / not touristy" (EN+DE)** — consenso #1 de las 3 IAs; hoy solo existe en ES (`restaurantes-palma-que-aguantan`).
4. **Real estate en profundidad**: "buying property step by step", "property taxes foreigners don't expect" (EN/DE) — el gap de ticket más alto (€300K-1M+). Solo hay 1 guía.
5. **Concesionarios / used car as a foreigner** (EN+DE), **NIE 2026**, **health insurance expat**.
6. **Paridad DE del cluster money legacy**: hoteles, restaurantes, beach clubs, spas, rent-a-car hoy son EN+ES sin DE — el público alemán no tiene las categorías más buscadas.

Criterio de priorización dentro de la fase: primero lo que además apunta a **queries donde rankean blogs pequeños** (dentistas DE, beach clubs, where to stay) — ahí contenido + un puñado de backlinks basta para top-10, que es la puerta de entrada a la citación por LLMs.

## FASE 4 — Activos de datos link-worthy (`/insights`)

Solo existe 1 de los 5+ planificados (informe dental). Esta capa es el único linkbait natural del sitio y el material de venta de Tramuntana:

- **Cost Index Mallorca**, **Data Report anual**, informe **overtourism**, **Mallorca Verified Awards 2026**, benchmarks de reputación por vertical.
- Cada uno alimenta directamente la Fase 2 (data PR trimestral): los blogs y medios necesitan fuentes citables ("según Mallorca Verified, el 34%…").

## FASE 5 — Rendimiento e imágenes

- **Migrar heros y tarjetas a `next/image`**: hoy solo `BusinessGalleryMosaic` lo usa; el resto son `background-image` inline → sin srcset/AVIF, riesgo CLS, LCP subóptimo y **cero presencia en Google Images** (no hay `<img>` crawleable). `priority` en el hero, `sizes` correctos.
- Valorar `generateStaticParams` para fichas top y guías (`businessStaticParams` existe y no se usa) → HTML instantáneo al crawler.
- Verificar en view-source que `TopRankingExplorer`/`LoadMoreBusinessGrid` (client components) pintan el primer lote en el HTML inicial.

---

## Cosas pequeñas (anotadas, no urgentes)

- Title template `"%s"` sin sufijo de marca garantizado → `"%s | Mallorca Verified"` y limpiar marca de los titles en DB.
- `x-default` apunta a `/es`; para audiencia expat quizá mejor `/en` (decisión de negocio).
- Divergencia de locale por defecto: middleware `en` vs layout `es`.
- Footer enlaza `/experts` (noindex) sitewide.
- Verificar que existe `/public/llms.txt` (referenciado en layout).
- `SearchAction` de la home apunta a `/top/restaurants?q=` — verificar que procesa `?q=`.
- Markdown de guías no soporta `##`/`###` dentro de `section.body`.
- Home sin `ItemList` para los mini-rankings.
- Falta hub real `/top` o `/rankings` (el breadcrumb usa `/top/restaurants` como proxy).
- Eliminar código muerto `CategoryPage`/`generateCategoryMetadata` tras portar su FAQ/CollectionPage a `/top`.
- Byline humano con credenciales en el `Article` schema (hoy autor = Organization) para verticales sensibles.
- Actualizar `GEO_CONTEXT.md` (lista 4 guías publicadas; hay 70) para que el pipeline no duplique ni pierda contexto.
- Vigilar competidores directos del posicionamiento "verified": **mallorca.dev** y **mbook.es**.

## Orden sugerido

| Semana | Foco |
|---|---|
| 1 | Fase 0 completa + altas gratuitas + arrancar badge program en el outreach |
| 2-3 | Fase 1 (money pages) + primera nota de prensa data-driven |
| 3-6 | Fase 3 (Tier 1: handyman, vet, locals-eat, real estate) en paralelo con participación Reddit/FB continua |
| 6-10 | Fase 4 (Cost Index → data PR) + Fase 5 (next/image) + paridad DE legacy |
