# Mallorca Verified — Growth & Verticals Backlog

Documento vivo de estrategia. Captura objetivos actuales, ideas de nuevas
secciones/verticales, y el backlog de contenido editorial B2B (Tramuntana Digital).

Última actualización: 2026-07-09

---

## Objetivos actuales (lo que buscamos AHORA)

1. **Contenido editorial muy útil orientado a B2B / Tramuntana Digital.**
   No turismo genérico. Contenido que atraiga clientes de alto ticket local:
   clínicas, dentistas, inmobiliarias, healthcare. El lector objetivo es el
   *dueño del negocio*, no el turista.

2. **Menciones/backlinks de dominios con prestigio.**
   Que un boletín o medio diga "OH WOW, esto lo featureamos hoy". Los rankings
   por reseñas son una base sólida pero NO son ese gancho por sí solos.
   La sección de "experts" sería ideal para esto pero tardará semanas → buscamos
   secciones/verticales adicionales más rápidas de lanzar.

### Reframe estratégico
Los dominios de prestigio enlazan **datos originales y herramientas**, no opiniones.
Nadie enlaza "los mejores restaurantes". Sí enlazan *"según nuestros datos de 3,4M
reseñas y 6.741 negocios…"*. El foso es el **dataset propietario**. Toda vertical
nueva debería explotarlo.

Activos de datos que ya tenemos:
- 6.741 negocios publicados, 21 categorías, todas las zonas
- 3,4M+ reseñas de Google (rating + volumen)
- Texto de reseñas enriquecido (sentimiento, keywords)
- Precio / price_level, horarios, idiomas mencionados
- Ranking bayesiano por categoría y zona

---

## ESTADO ACTUAL (funcional)

- ✅ **Rankings por categoría** ordenados por reseñas reales — base del sitio
- ✅ **Guías editoriales** (EN/DE/ES) — SEO, pero compite con gigantes y aporta
  poco valor de negocio. No quitar, pero no es la palanca de crecimiento.
- 🔜 **Experts** — vertical prevista, alto valor para PR, pero semanas de trabajo

---

## LLUVIA DE IDEAS — nuevas secciones/verticales

### TIER 1 — Link-worthy (datos como noticia → menciones de prestigio)

- [ ] **Mallorca Data Report / "El Informe" anual**
  Publicación anual con datos propietarios: categorías más reseñadas, tendencias
  de rating por zona, dónde comen locales vs turistas (por idioma de reseñas),
  qué zonas mejoran. Los boletines y medios citan datos originales. Gancho de PR
  anual repetible. → El activo link-worthy #1.

- [ ] **Índice de precios de Mallorca (Cost Index)**
  "Cuánto cuesta X en Mallorca" por zona, con seguimiento temporal: café, menú,
  alquiler de barco, implante dental, spa… La prensa de expats/relocation cita
  datos de coste de vida constantemente. Evergreen + actualizable.

- [ ] **Datos de masificación / overtourism**
  Volumen y velocidad de reseñas como proxy de aglomeración: "playas/restaurantes
  más saturados por mes". Tema CALIENTE en prensa balear ahora mismo. Alto
  potencial de pickup mediático local (Diario de Mallorca, Última Hora, MZ).

- [ ] **Mallorca Verified Awards 2026**
  Premios anuales públicos por categoría/zona (la cara pública del sello). Los
  medios locales cubren premios y los ganadores enlazan de vuelta. Doble backlink
  (prensa + negocios). Se genera con el ranking existente.

### TIER 2 — Herramientas útiles (backlinks evergreen)

- [ ] **Mapa interactivo** de negocios verificados por categoría/zona — embebible
- [ ] **Buscador "que hable inglés/alemán"** (dentista, abogado, médico…)
  Herramienta genuinamente útil para expats. Foros de expats, sitios de
  relocation y hasta consulados enlazan estos recursos.
- [ ] **Perfiles de zona como data-profile** ("Vivir en Santa Catalina: X
  restaurantes, rating medio Y, nivel de precio Z") — enlazable por agencias
  de relocation e inmobiliarias.

### TIER 3 — B2B directo (sirve a Tramuntana Digital · Objetivo #1)

- [ ] **Informes de reputación por vertical**
  "Estado de la reputación de las clínicas dentales de Mallorca 2026" — informe
  descargable por sector (dental, inmobiliaria, healthcare). Es a la vez activo
  link-worthy Y material de venta para captar esas clínicas. → El puente perfecto
  entre Objetivo #1 y #2.

- [ ] **Benchmarks de reputación**
  "El dentista medio de Palma tiene X rating y Y reseñas. ¿Dónde estás tú?"
  Contenido que hace que un dueño piense "necesito ayuda con esto" → lead para
  Tramuntana.

- [ ] **Playbooks / casos B2B**
  "Cómo una clínica de Mallorca pasó de 50 a 500 reseñas". Posiciona a Tramuntana
  como el experto. Thought leadership.

---

## Backlog editorial B2B (Objetivo #1 — captar clínicas/dentistas/etc.)

Contenido dirigido al *dueño del negocio*, no al turista:
- [ ] Guía: reputación online para clínicas dentales en Mallorca
- [ ] Guía: cómo consiguen pacientes internacionales las clínicas (inglés/alemán)
- [ ] Informe de reputación dental Mallorca 2026 (descargable)
- [ ] Informe de reputación inmobiliaria Mallorca 2026
- [ ] Benchmark de reseñas por sector (dental, healthcare, real-estate)

---

## PARKED — Verified Badge / Sello (idea de backlinks, prototipo hecho)

Prototipo visual creado (artifact `badge-prototype-v1`). Convierte el ranking en
un activo que el negocio quiere enseñar → prueba social gratis + backlink recíproco.

Buena idea pero es palanca de **backlinks de negocios**, no de prestigio mediático.
Encaja mejor DESPUÉS de tener una vertical de datos (Tier 1). Para construirlo:
1. Generador de badge SVG dinámico `/badge/[slug].svg` (≈ como el OG image dinámico)
2. Página de perfil verificado `/negocio/[slug]` (destino del badge)
3. Snippet de embed en cada perfil

Datos del prototipo: Espíritu Libre, #1 de 58 restaurantes en Sóller (★4.9, 919 reseñas).

---

## Recomendación de secuencia (propuesta, a discutir)

1. **Informe por vertical (Tier 3)** primero — sirve a AMBOS objetivos: es
   contenido link-worthy Y material de venta de Tramuntana. Empezar por dental.
2. **Awards 2026 (Tier 1)** — rápido de generar sobre el ranking, gancho de PR.
3. **Índice de precios / Data Report (Tier 1)** — el activo mediático a medio plazo.
4. **Badge** cuando ya haya tráfico/autoridad que enseñar.
