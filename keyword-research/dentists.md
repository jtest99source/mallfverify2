# Keyword research — Dentistas (Google, julio 2026)

> Fuente: SERPs reales de Google (autocomplete, People Also Ask, People Also Search For) capturadas por Benten el 23 jul 2026.
> Uso: base para guías/blog del vertical dental. Regla: contenido 100% relevante, sin relleno.
> Las preguntas técnicas/clínicas se responderán con input real de las clínicas (outreach en curso) — marcadas con 🦷.

---

## Cluster 1 — PRECIOS (la intención dominante, aparece en todos los formatos)

| Keyword / pregunta | Formato origen |
|---|---|
| dentist mallorca prices | autocomplete + PASF (×3 veces) |
| How much does it cost to see a dentist in Spain? | PAA (×2) |
| Is it cheaper to get your teeth done in Spain? | PAA (×2) |
| How much does a dental implant cost in Spain? | PAA |
| Are dental implants cheaper in Spain than the UK? | PAA |
| How much does it cost for braces in Spain? / how much braces cost in spain | PAA + autocomplete |
| Is braces free in Spain? | PAA |
| How much does teeth whitening cost in Spain? (+2 variantes) | PAA |

**Lectura:** el buscador tipo es británico/alemán comparando precios con su país. Ya tenemos datos de precios verificados en `dental-clinics-mallorca-2026` (implante €1.800-3.000 ES vs £2.000-3.500 UK).
**Acción:** guía dedicada **"Dental prices in Mallorca 2026"** (EN+DE) con tabla por tratamiento (limpieza, empaste, implante, ortodoncia, blanqueamiento) y comparativa UK/DE. 🦷 Pedir a clínicas rangos reales por tratamiento.

## Cluster 2 — URGENCIAS (gap claro, alta intención, poca competencia de calidad)

| Keyword / pregunta | Formato |
|---|---|
| emergency dentist mallorca | autocomplete + PASF |
| Can I get emergency dental treatment in Spain? | PAA (×2) |
| What is classed as a dental emergency? | PAA (×2) |
| What is the emergency number in Palma de Mallorca? | PAA |

**Lectura:** quien busca esto está en la isla CON dolor — conversión inmediata. Competencia actual: webs de clínicas individuales (centrourgenciasdentales.com). Tenemos **Urgencias Dentales Mallorca (4.8★, ~630 reseñas)** en la DB.
**Acción:** guía **"Emergency dentist in Mallorca — what to do"** (EN+DE): qué cuenta como urgencia, números útiles (112, 061), clínicas 24h/festivos verificadas por zona, qué esperar de precio. 🦷 Preguntar a clínicas: horarios reales de urgencias, qué atienden sin cita.

## Cluster 3 — POR ZONA (encaja 1:1 con nuestras páginas /areas/*/dentists)

Zonas pedidas por Google: **palma** (×4 formatos), **santa ponsa** (×3), **alcudia** (×2), **palma nova** (×2), **magaluf**, **bendinat**, **soller**.

**Estado:** tenemos /areas/{zona}/dentists en Palma, Inca, Manacor, Marratxí, Llucmajor, Sa Coma+. **Gap**: Santa Ponsa, Palmanova/Magaluf, Bendinat, Alcúdia, Sóller — comprobar inventario de dentistas en esas zonas y **importar los que falten** (el proceso de siempre con place_id).
**Acción:** priorizar import de dentistas en Santa Ponça/Calvià oeste y Alcúdia — son las zonas con demanda demostrada y donde ya tenemos clínicas verificadas por idioma (Advance, Art Mallorca).

## Cluster 4 — ESPECIALIDADES (sub-verticales con demanda propia)

| Especialidad | Keywords |
|---|---|
| Implantes | dental implants mallorca (PASF ×3), Is Spain good for dental implants? |
| Ortodoncia | orthodontist mallorca/palma (autocomplete EN+ES: ortodoncia mallorca, ortodoncista palma), Can I self refer to an orthodontist?, Can TMJ be fixed with orthodontics? 🦷 |
| Blanqueamiento | teeth whitening palma (PASF), What country has the best teeth whitening? |
| Holístico | holistic dentist mallorca (autocomplete — nicho curioso, poca competencia) |

**Acción:** de momento como secciones+FAQs dentro de las guías dental (no guías separadas hasta validar volumen). "Dental implants Mallorca" es la única candidata a guía propia (aparece en TODOS los PASF).

## Cluster 5 — IDIOMA/CONFIANZA (nuestro terreno)

- english dentist mallorca (autocomplete) → ya cubierto por `english-speaking-dentists-mallorca` ✓
- Does Spain have good dental care? (PAA ×2) → FAQ para guía general
- What is the 2 year rule for dentists? (PAA — es la regla NHS UK de perder plaza tras 2 años sin ir; MUY relevante para expats británicos) → FAQ potente para la guía EN 🦷

## FAQs sueltas aprovechables en guías generales

- "What is the 3 2 rule for implants?" / "What is the 80/20 rule in dentistry?" → técnicas; solo si una clínica las responde bien 🦷

## Descartadas (basura/irrelevante)

dentist near me · dentist ibiza · dentist appointment/office · orthodontist salary in spain · how to become a dentist in spain

**Descartadas por trivialidad (regla "Confianza IA alta = no tocar")**: "Are Magaluf and Mallorca the same?" y "mallorca or majorca which is correct" — geografía básica que las IAs responden de memoria sin citar a nadie; ponerlas como FAQ baja el nivel percibido. La *intención* de fondo ("¿toda la isla es como Magaluf?") sí vale, pero se sirve dentro de las guías ya planificadas `mallorca-nightlife-not-magaluf-30s-40s` y `palmanova-magaluf-couples-worth-it`, nunca como pregunta literal.

## Competencia observada en estas SERPs

- Rankean: webs de clínicas individuales (englishdentistinmallorca.com, A2 Dental Puerto Portals, British Orthodontics Santa Ponça, centrourgenciasdentales.com), agregadores médicos (WhatClinic, Dental Departures), mallorca.com (directorio).
- **Ningún contenido editorial neutral comparativo** = exactamente nuestro hueco (confirma la tesis GEO).

## Orden de ejecución sugerido

1. **Emergency dentist Mallorca** (EN+DE) — gap total, intención máxima
2. **Dental prices Mallorca 2026** (EN+DE) — la intención más repetida, ya tenemos datos base 🦷
3. Import dentistas Santa Ponça/Alcúdia → activa las páginas de zona con demanda
4. FAQs nuevas en guías existentes (2-year rule, Magaluf/Mallorca, Majorca spelling)
