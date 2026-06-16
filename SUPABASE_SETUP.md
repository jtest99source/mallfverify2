# SUPABASE_SETUP.md

## Objetivo

Configurar Supabase/Postgres como base de datos principal de Mallorca Verified para que las rutas actuales de Next.js lean negocios, rankings y guías desde tablas reales.

## Variables `.env` necesarias

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SITE_URL=https://mallorcaverified.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_PLACES_API_KEY=reserved-for-future-ingestion
```

### Explicación

- `NEXT_PUBLIC_SITE_URL`: dominio público usado para canonical, sitemap y JSON-LD.
- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: clave pública anon de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: clave privada server-side para scripts de importación y lecturas server-side.
- `GOOGLE_PLACES_API_KEY`: reservada para futura ingestión desde Google Places API. Actualmente no se usa en producción.

No expongas `SUPABASE_SERVICE_ROLE_KEY` en cliente, repositorios públicos ni variables `NEXT_PUBLIC_*`.

## Orden exacto de migraciones

Actualmente hay una sola migración:

```txt
supabase/migrations/001_geo_entity_engine.sql
```

Ejecutar en este orden:

1. Crear proyecto en Supabase.
2. Abrir Supabase SQL Editor.
3. Copiar el contenido de:

```txt
supabase/migrations/001_geo_entity_engine.sql
```

4. Ejecutar la SQL completa.
5. Confirmar que existen estas tablas:

```txt
businesses
rankings
ranking_items
guides
```

La migración también crea:

- enums: `business_category`, `ranking_category`, `content_status`, `priority_level`
- índices
- foreign keys
- RLS
- policies públicas de lectura para contenido `published` y `premium`

## Cómo importar datos

### Opción A: importar el contenido actual del proyecto

Usa esta opción para migrar los datos existentes de `src/data/*` a Supabase.

```bash
npm run db:import-local
```

Este script importa:

- restaurantes
- hoteles
- beach clubs
- barcos
- actividades
- playas/calas
- rankings
- guías
- items de rankings

Por defecto marca el contenido como:

```txt
status = published
source = manual_seed
```

### Opción B: importar desde JSON

```bash
npm run db:import -- path/to/content.json
```

Formato esperado:

```json
{
  "businesses": [],
  "rankings": [],
  "guides": []
}
```

### Opción C: importar businesses desde CSV

```bash
npm run db:import -- path/to/businesses.csv
```

El CSV se interpreta como negocios. Campos recomendados:

```txt
id,slug,name,category,shortDescription,description,area,address,website,instagram,phone,priceLevel,tags,bestFor,status,source,google_place_id,rating,reviews_count,google_maps_url,commercial_priority,client_potential,is_featured,is_claimed
```

Para arrays usa `|`:

```txt
palma|cena|parejas
```

Para JSON usa JSON válido:

```json
[{"question":"¿Conviene reservar?","answer":"Sí, especialmente en temporada alta."}]
```

## Cómo verificar que todo funciona

### 1. Verificar tablas en Supabase

En Supabase Table Editor comprueba que hay filas en:

```txt
businesses
rankings
ranking_items
guides
```

Comprueba que las filas visibles tienen:

```txt
status = published
```

o:

```txt
status = premium
```

Las filas `draft` y `hidden` no son públicas por RLS.

### 2. Verificar build

```bash
npm run build
```

Resultado esperado:

- build correcto
- rutas `[locale]` como dinámicas
- `/sitemap.xml` como dinámico

### 3. Verificar servidor local

```bash
npm run dev
```

Abrir:

```txt
http://localhost:3000/es
```

Rutas clave para comprobar:

```txt
http://localhost:3000/es/restaurants
http://localhost:3000/es/restaurants/vandal-palma
http://localhost:3000/es/rankings
http://localhost:3000/es/rankings/top-restaurantes-desconocidos-mallorca
http://localhost:3000/es/guides
http://localhost:3000/es/guides/guia-alquilar-barco-mallorca
http://localhost:3000/sitemap.xml
http://localhost:3000/robots.txt
```

### 4. Verificar lectura desde base de datos

Cambia temporalmente el nombre de un negocio en Supabase, por ejemplo:

```txt
Vandal Palma Test
```

Recarga:

```txt
http://localhost:3000/es/restaurants/vandal-palma
```

Si aparece el cambio, la ruta está leyendo desde Supabase.

### 5. Verificar RLS/status

Cambia una ficha de:

```txt
status = published
```

a:

```txt
status = hidden
```

La ficha ya no debería aparecer públicamente.

## Notas importantes

- `src/data/*` ya no renderiza la web. Solo sirve como seed inicial mediante `npm run db:import-local`.
- No crear nuevas páginas hardcodeadas para contenido editorial.
- A partir de ahora, businesses, rankings y guides deben venir de Supabase.
- Google Places queda preparado a nivel de campos y mapper, pero todavía no hay ingesta automática.
- Para producción, conviene usar `SUPABASE_SERVICE_ROLE_KEY` solo en servidor y scripts seguros.
