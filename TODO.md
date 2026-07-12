# TODO — pendientes

Lista de tareas que quedan a la espera de una condición. Revisar de vez en cuando.

## ⏳ Bloquear la sección Experts en `robots.txt` (esperar a que se desindexe)

**Estado:** en espera. NO hacer todavía.

**Contexto:** la sección `/experts` está en construcción. La pusimos en `noindex` (ver
`src/app/[locale]/experts/layout.tsx`), la sacamos del sitemap, y el 2026-07-12 se pidió
la retirada temporal por prefijo en Google Search Console (`/en/experts`, `/es/experts`,
`/de/experts`).

**Por qué esperar:** para que Google *quite* una URL ya indexada necesita poder
rastrearla y **ver** el `noindex`. Si bloqueamos `/experts` en `robots.txt` ahora, Google
no podría leer el `noindex` y la sección se quedaría atascada en el índice. Primero
desindexar (vía noindex), luego bloquear el rastreo.

**Cuándo hacerlo:** cuando Experts ya NO aparezca en Google. Comprobar con:
- Buscar en Google `site:mallorcaverified.com/en/experts` → debe dar 0 resultados.
- O en Search Console → Inspección de URLs → una URL de experts → "no indexada".

**Qué hacer entonces:** añadir en `src/app/robots.ts` una regla `disallow: "/experts"`
(o `["/en/experts", "/es/experts", "/de/experts"]`) para el `userAgent: "*"`, y
opcionalmente para los bots de IA. Mantener el `noindex` del layout igualmente.

**Revertir todo (cuando Experts esté lista para publicarse):** borrar
`src/app/[locale]/experts/layout.tsx`, volver a añadir las URLs de experts al
`src/app/sitemap.ts`, y NO poner el disallow.
