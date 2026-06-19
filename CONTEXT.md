# Mallorca Verified — Contexto del proyecto

> Referencia para retomar trabajo entre sesiones. Actualizar cuando cambie algo relevante.

---

## Qué es esto

**Mallorca Verified** es un directorio verificado de negocios en Mallorca con dos líneas de negocio:

1. **Agencia GEO/SEO** — servicio de consultoría para negocios locales (posicionamiento en Google + IA). CTA principal: "Solicitar auditoría gratuita". Mallorca Verified actúa como credencial de expertise.
2. **Fichas premium** — ingresos recurrentes por fichas verificadas/destacadas en el directorio.

El posicionamiento editorial es siempre **audit-first**: el directorio demuestra que sabemos lo que hacemos, no al revés.

---

## Stack técnico

- **Next.js 15 App Router** — Server + Client Components, `params` es async
- **Tailwind CSS** — tokens: `paper=#FFF8EC`, `linen=#FFFDF7`, `ink=#1B2E4B`, `coral=#C4933F`, `turquesa=#059669`, `borderline=#E7DED0`
- **Supabase** — base de datos principal (negocios, guías)
- **Resend** — email server-side desde `noreply@mallorcaverified.com` → `hola@mallorcaverified.com`
- **i18n** — función `t(locale)` en `src/lib/i18n-copy.ts`, 3 locales en código pero guías solo ES+EN

---

## Locales

| Locale | Páginas generales | Guías |
|--------|-------------------|-------|
| ES     | ✅                | ✅     |
| EN     | ✅                | ✅     |
| DE     | ✅                | ❌ (eliminado de momento) |

El generador de guías (`generate-editorial-guides.mjs`) genera por defecto ES+EN. DE excluido hasta nuevo aviso.

---

## Sistema de guías — dos pipelines separados

### Pipeline 1: Seed manual (`scripts/seed-guides.mjs`)
- 10 guías ES escritas a mano con contenido editorial completo
- Ya están en Supabase con `status: published`
- Slugs:
  - `restaurantes-palma-que-aguantan`
  - `playas-mallorca-sin-masificar`
  - `mallorca-3-dias-sin-perder-tiempo`
  - `donde-alojarse-mallorca-segun-lo-que-buscas`
  - `beach-clubs-mallorca-nota-alta`
  - `norte-mallorca-guia-completa`
  - `excursiones-desde-palma-que-merecen`
  - `senderismo-tramuntana-mallorca`
  - `cenar-mallorca-vistas-al-mar`
  - `mallorca-octubre-fuera-temporada`
- **No tienen versión EN todavía** — estos slugs no están en el catálogo generativo

### Pipeline 2: Generativo con IA (`scripts/generate-editorial-guides.mjs`)
- Usa Claude API (`claude-sonnet-4-6`) + tool `web_search_20250305`
- Lee el catálogo de `scripts/editorial-blog-catalog.mjs`
- Busca negocios en Supabase, genera contenido editorial real, hace upsert
- **Nunca se ha ejecutado todavía** — 0 guías generadas por este pipeline
- Catálogo: **59 slugs**, 3 locales activos (ES+EN) = **118 guías potenciales**

### Catálogo (`scripts/editorial-blog-catalog.mjs`)
- **59 entradas** organizadas en 4 tiers:
  - Tier 1 (16): island-wide, alto volumen — restaurantes, hoteles, playas, barcos, beach clubs, spas, boutique, adults-only, fincas, veleros, wine bars, sunset bars
  - Tier 2 (16): por zona — Sóller, Pollença, Alcúdia, Palma barrios, norte/sur
  - Tier 3 (18): intent/itinerario — 3 días, con niños, en pareja, presupuesto, luna de miel, comparativas
  - Tier 4 (9): GEO puro/conversacional — preguntas tipo ChatGPT

### Comandos disponibles
```bash
npm run guides:generate-editorial              # todos (ES+EN)
npm run guides:generate-editorial:tier1        # solo tier 1
npm run guides:generate-editorial:tier2        # solo tier 2
npm run guides:generate-editorial:tier3        # solo tier 3
node scripts/generate-editorial-guides.mjs --slug=mejores-restaurantes-palma --locale=es
```

---

## Formularios y email

| Formulario | URL | API Route | Destino |
|-----------|-----|-----------|---------|
| Sugerir negocio | `/[locale]/suggest` | `POST /api/suggest` | `hola@mallorcaverified.com` |
| Auditoría/contacto | `/[locale]/contact` | `POST /api/lead` | `hola@mallorcaverified.com` |

- Provider: **Resend**, dominio `mallorcaverified.com` verificado
- API key en `.env.local` como `RESEND_API_KEY`
- Ambas páginas tienen layout 2 columnas: copy a la izquierda, form en tarjeta blanca a la derecha

---

## Páginas clave

| Página | Estado | Notas |
|--------|--------|-------|
| `/[locale]/business` | ✅ reescrita | Copy audit-first, CTAs → `/contact` (no más mailto) |
| `/[locale]/contact` | ✅ creada | "Solicitar auditoría gratuita", copy GEO/SEO agency |
| `/[locale]/suggest` | ✅ creada | "¿Echas en falta un local?", form → Supabase review queue |
| `/[locale]/guides` | ✅ i18n completo | ES+EN activo, DE excluido del footer |
| `/[locale]/guides/[slug]` | ✅ i18n completo | Todos los strings via `t(locale).guides.*` |

---

## Componentes clave

- `src/components/CTABox.tsx` — banner oscuro en páginas de categoría, CTA → `/contact`
- `src/components/BusinessListCTA.tsx` — card verde al final de listas, CTA → `/suggest`
- `src/components/ContactForm.tsx` — form de auditoría (Client Component)
- `src/components/SuggestForm.tsx` — form de sugerencia (Client Component)

---

## Pendiente relevante

- **Generar guías EN** del catálogo (el pipeline está listo, nunca se ha corrido)
- **Crear versiones EN** de las 10 guías del seed (diferente al catálogo generativo)
- **SEO/GEO técnico** — fixes identificados pero no aplicados:
  - og:image fallback por defecto
  - Organization schema: logo + sameAs
  - LocalBusiness schema: openingHours + @id
  - FAQ localization para EN
  - robots.txt: añadir CCBot, Diffbot, Bytespider
  - llms.txt: añadir sección "Example queries"

---

## Variables de entorno necesarias (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=          # para generate-editorial-guides.mjs
RESEND_API_KEY=              # para /api/lead y /api/suggest
```

---

## Git

- Rama: `main`
- Remote: GitHub, usuario `jt99test`
- Nombre del sitio en código: `Mallorca Verified` (rebranding de "Mallorca Insider" ya aplicado en `site.ts`)
