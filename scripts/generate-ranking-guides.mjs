/**
 * generate-ranking-guides.mjs
 *
 * Genera automáticamente guías de ranking ("Los mejores X de Y, Mallorca")
 * desde los negocios publicados en Supabase.
 *
 * Uso: node scripts/generate-ranking-guides.mjs
 * Dry-run: node scripts/generate-ranking-guides.mjs --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

const DRY_RUN = process.argv.includes("--dry-run");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : null;
const MIN_CITY_BUSINESSES = 5; // mínimo por combinación ciudad+categoría para generar guía
const MAX_BUSINESS_IDS = 10;   // máximo de negocios por guía

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function rankScore(b) {
  if (b.authority_score != null) return b.authority_score;
  const rating = b.rating ?? 0;
  const reviews = b.reviews_count ?? 1;
  return rating * Math.log10(reviews + 1);
}

// ─── Configuración por categoría ─────────────────────────────────────────────

const CATEGORY_META = {
  restaurant: {
    slugNoun: "restaurantes",
    article: "Los",
    noun: "restaurantes",
    prep: "de",
    bodySection:
      "Ordenados por consenso de reseñas verificadas de Google. Los primeros combinan valoración alta con un volumen de reseñas que ya no deja margen al azar.",
    faqs: (city) => [
      {
        question: `¿Cómo se ordenan los restaurantes de ${city} en este ranking?`,
        answer:
          "Por consenso de reseñas verificadas de Google: se pondera la nota media y el número de reseñas. A mayor volumen, más representativa es la media. No hay posiciones de pago."
      },
      {
        question: `¿Todos los restaurantes de ${city} están en el ranking?`,
        answer:
          "No — solo los que superan los umbrales mínimos de valoración y número de reseñas que aplica Mallorca Verified."
      },
      {
        question: "¿Con qué frecuencia se actualiza?",
        answer:
          "Los datos se actualizan periódicamente. Un restaurante que baja de valoración pierde posición."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer:
          "No. Este ranking es exclusivamente por datos de reseñas verificadas. No hay acuerdos comerciales que afecten a la posición."
      }
    ],
    minCount: 5
  },

  hotel: {
    slugNoun: "hoteles",
    article: "Los",
    noun: "hoteles",
    prep: "de",
    bodySection:
      "Hoteles de todos los tipos seleccionados por consenso de reseñas verificadas. Boutique, rurales, de playa y urbanos — ordenados por valoración real, no por categoría de estrellas.",
    faqs: (city) => [
      {
        question: `¿Cómo se ordenan los hoteles de ${city}?`,
        answer:
          "Por consenso de reseñas verificadas de Google. Se pondera la nota media y el número de reseñas — los hoteles con más reseñas tienen una media más representativa."
      },
      {
        question: `¿Qué tipo de hoteles aparecen en el ranking de ${city}?`,
        answer:
          "Hoteles de todos los tipos que superen los umbrales mínimos: boutique, rurales, de playa, urbanos. El tipo no determina la posición — la determina la valoración real."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer:
          "No. Los rankings de Mallorca Verified son exclusivamente por datos verificados de reseñas."
      },
      {
        question: "¿Con qué frecuencia se actualiza?",
        answer: "Los datos se actualizan periódicamente. Un hotel que baja de nota pierde posición."
      }
    ],
    minCount: 4
  },

  "beach-club": {
    slugNoun: "beach-clubs",
    article: "Los",
    noun: "beach clubs y chiringuitos",
    prep: "de",
    bodySection:
      "Seleccionados por consenso de reseñas verificadas. Se incluyen tanto beach clubs como chiringuitos con valoración sostenida en temporada — no solo aperturas recientes.",
    faqs: (city) => [
      {
        question: `¿Cuáles son los mejores beach clubs de ${city}?`,
        answer:
          "Los primeros del ranking son los que tienen mejor valoración media con más reseñas verificadas de Google — indicador de satisfacción consistente, no puntual."
      },
      {
        question: "¿Hay que reservar con antelación?",
        answer:
          "En temporada alta, los beach clubs con mejor valoración tienen más demanda que oferta de hamacas. Reservar con 48-72 horas de antelación es lo recomendable en julio y agosto."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer: "No. El ranking es exclusivamente por datos de reseñas verificadas de Google."
      }
    ],
    minCount: 3
  },

  "boat-rental": {
    slugNoun: "alquiler-barcos",
    article: "Los",
    noun: "alquileres de barcos",
    prep: "en",
    bodySection:
      "Empresas seleccionadas por consenso de reseñas verificadas. Incluye alquiler con y sin patrón, catamaranes, veleros y lanchas — ordenados por valoración real.",
    faqs: (city) => [
      {
        question: `¿Cuál es la mejor empresa de alquiler de barcos en ${city}?`,
        answer:
          "Las primeras del ranking son las que tienen mejor valoración media con más reseñas verificadas — indicador de consistencia en el servicio, no de una sola buena experiencia."
      },
      {
        question: "¿Qué hace falta para alquilar un barco en Mallorca?",
        answer:
          "Depende del barco. Para embarcaciones de hasta cierta eslora no se necesita licencia en España. Para barcos más grandes, la mayoría de empresas ofrecen la opción de contratar patrón incluido."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer: "No. El ranking es exclusivamente por valoraciones verificadas de Google."
      }
    ],
    minCount: 3
  },

  activity: {
    slugNoun: "actividades",
    article: "Las",
    noun: "actividades",
    prep: "en",
    bodySection:
      "Actividades y experiencias seleccionadas por consenso de reseñas verificadas de Google. Náuticas, de aventura, culturales y de naturaleza.",
    faqs: (city) => [
      {
        question: `¿Qué actividades merecen la pena en ${city}?`,
        answer:
          "Las primeras del ranking son las que tienen mejor valoración sostenida según reseñas verificadas — indicador de que la experiencia funciona de forma consistente."
      },
      {
        question: "¿Hay que reservar con antelación?",
        answer:
          "Las actividades con más demanda — kayak guiado, excursiones en barco, rutas de senderismo — conviene reservarlas con varios días de antelación en temporada alta."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer: "No. El ranking es exclusivamente por datos de reseñas verificadas."
      }
    ],
    minCount: 4
  },

  beach: {
    slugNoun: "playas",
    article: "Las",
    noun: "playas y calas",
    prep: "de",
    bodySection:
      "Playas y calas seleccionadas por consenso de reseñas verificadas de Google. Ordenadas por valoración media y consistencia entre reseñas.",
    faqs: (city) => [
      {
        question: `¿Cuáles son las mejores playas y calas de ${city}?`,
        answer:
          "Las primeras del ranking acumulan mejor valoración media con más reseñas verificadas. El agua, el entorno y el nivel de masificación son los factores más mencionados."
      },
      {
        question: `¿Cuál es la mejor época para ir a las playas de ${city}?`,
        answer:
          "Septiembre y octubre ofrecen el mejor equilibrio entre temperatura del agua y nivel de afluencia. Julio y agosto tienen el mejor tiempo pero la mayor masificación."
      },
      {
        question: "¿Se necesita coche para llegar?",
        answer:
          "Depende de la playa. Las más céntricas suelen tener acceso en autobús. Las más apartadas requieren coche, especialmente las que tienen mejor nota pero menos infraestructura."
      }
    ],
    minCount: 3
  },

  bar: {
    slugNoun: "bares",
    article: "Los",
    noun: "bares",
    prep: "de",
    bodySection:
      "Bares seleccionados por consenso de reseñas verificadas de Google. Tapas, coctelerías, bares de vinos y terrazas — ordenados por valoración real.",
    faqs: (city) => [
      {
        question: `¿Dónde tomar algo en ${city}?`,
        answer:
          "Los bares mejor posicionados en el ranking son los que tienen valoración alta con más reseñas verificadas — indicador de que la calidad no es puntual sino consistente."
      },
      {
        question: `¿Hay bares de tapas buenos en ${city}?`,
        answer:
          "El ranking incluye bares de tapas diferenciados del resto. Los de tapas suelen tener valoraciones altas porque la dinámica genera reseñas frecuentes de clientela habitual."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer: "No. El ranking es exclusivamente por datos de reseñas verificadas de Google."
      }
    ],
    minCount: 4
  },

  cafe: {
    slugNoun: "cafeterias",
    article: "Las",
    noun: "cafeterías",
    prep: "de",
    bodySection:
      "Cafeterías seleccionadas por consenso de reseñas verificadas de Google. Cafés de especialidad, brunch y desayunos — ordenados por valoración sostenida.",
    faqs: (city) => [
      {
        question: `¿Dónde tomar el mejor café en ${city}?`,
        answer:
          "Las cafeterías primeras del ranking son las que tienen mejor valoración media con más reseñas. Generan satisfacción de forma consistente — no solo en temporada alta."
      },
      {
        question: `¿Hay cafés de especialidad en ${city}?`,
        answer:
          "El ranking incluye cafés de especialidad junto con cafeterías más tradicionales. Las reseñas de Google suelen mencionar explícitamente la calidad del café."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer: "No. El ranking es exclusivamente por datos de reseñas verificadas de Google."
      }
    ],
    minCount: 4
  },

  bakery: {
    slugNoun: "panaderias-pastelerias",
    article: "Las",
    noun: "panaderías y pastelerías",
    prep: "de",
    bodySection:
      "Panaderías y pastelerías seleccionadas por consenso de reseñas verificadas. Hornos tradicionales, pastelerías artesanales y especialidades mallorquinas.",
    faqs: (city) => [
      {
        question: `¿Dónde comprar ensaimada o pan artesanal en ${city}?`,
        answer:
          "Las panaderías y pastelerías del ranking son las que tienen mejor valoración con más reseñas verificadas — indicador de calidad consistente en producto y atención."
      },
      {
        question: `¿Hay hornos artesanales en ${city}?`,
        answer:
          "El ranking incluye hornos artesanales junto con pastelerías. Los que trabajan con masa madre o producto tradicional mallorquín suelen destacar en las reseñas."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer: "No. El ranking es exclusivamente por datos de reseñas verificadas de Google."
      }
    ],
    minCount: 3
  },

  "rent-a-car": {
    slugNoun: "alquiler-coches",
    article: "Los",
    noun: "alquileres de coches",
    prep: "en",
    bodySection:
      "Empresas de alquiler de coches, motos y bicicletas seleccionadas por consenso de reseñas verificadas de Google.",
    faqs: (city) => [
      {
        question: `¿Cuál es la mejor empresa de alquiler de coches en ${city}?`,
        answer:
          "Las primeras del ranking tienen mejor valoración media con más reseñas verificadas — indicador de consistencia en atención, estado de los vehículos y transparencia de precios."
      },
      {
        question: "¿Qué se necesita para alquilar un coche en Mallorca?",
        answer:
          "Carnet de conducir válido, tarjeta de crédito para la fianza, y tener al menos 21 años según la empresa. El europeo y la mayoría de internacionales son válidos en España."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer: "No. El ranking es exclusivamente por datos de reseñas verificadas de Google."
      }
    ],
    minCount: 3
  },

  spa: {
    slugNoun: "spas",
    article: "Los",
    noun: "spas y centros de bienestar",
    prep: "de",
    bodySection:
      "Spas y centros de bienestar seleccionados por consenso de reseñas verificadas. Masajes, tratamientos y spas de día — ordenados por valoración real.",
    faqs: (city) => [
      {
        question: `¿Cuáles son los mejores spas de ${city}?`,
        answer:
          "Los primeros del ranking tienen mejor valoración media con más reseñas. En spas, donde la experiencia es muy personal, el volumen de reseñas dice mucho sobre la consistencia."
      },
      {
        question: "¿Hay que reservar con antelación?",
        answer:
          "En temporada alta, los spas con mejor valoración tienen alta demanda. Reservar con al menos 48-72 horas de antelación es recomendable."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer: "No. El ranking es exclusivamente por datos de reseñas verificadas de Google."
      }
    ],
    minCount: 3
  },

  gym: {
    slugNoun: "gimnasios",
    article: "Los",
    noun: "gimnasios",
    prep: "de",
    bodySection:
      "Gimnasios y centros deportivos seleccionados por consenso de reseñas verificadas. Incluye estudios de yoga, pilates y pádel.",
    faqs: (city) => [
      {
        question: `¿Cuáles son los mejores gimnasios de ${city}?`,
        answer:
          "Los primeros del ranking tienen mejor valoración con más reseñas verificadas. Las reseñas de gimnasios suelen mencionar instalaciones, monitores y limpieza."
      },
      {
        question: `¿Hay clases de yoga o pilates en ${city}?`,
        answer:
          "El ranking incluye estudios especializados junto con gimnasios generales. Las reseñas detallan el tipo de clases disponibles."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer: "No. El ranking es exclusivamente por datos de reseñas verificadas de Google."
      }
    ],
    minCount: 3
  },

  route: {
    slugNoun: "rutas",
    article: "Las",
    noun: "rutas y miradores",
    prep: "cerca de",
    bodySection:
      "Rutas de senderismo, miradores y puntos de interés natural seleccionados por consenso de reseñas verificadas de Google.",
    faqs: (city) => [
      {
        question: `¿Cuáles son las mejores rutas cerca de ${city}?`,
        answer:
          "Las primeras del ranking acumulan mejor valoración con más reseñas. En rutas, las reseñas suelen mencionar la dificultad real, las vistas y el estado de la señalización."
      },
      {
        question: `¿Cuál es la mejor época para hacer senderismo cerca de ${city}?`,
        answer:
          "Octubre a mayo es la temporada ideal en Mallorca. El verano tiene temperaturas demasiado altas para rutas largas."
      },
      {
        question: "¿Hace falta equipamiento especial?",
        answer:
          "Para rutas fáciles, calzado con suela de agarre y agua suficiente. Para rutas de más de 4 horas o con desnivel, calzado de montaña y la ruta descargada offline en Wikiloc o AllTrails."
      }
    ],
    minCount: 3
  },

  excursion: {
    slugNoun: "excursiones",
    article: "Las",
    noun: "excursiones",
    prep: "desde",
    bodySection:
      "Excursiones y tours seleccionados por consenso de reseñas verificadas de Google. En barco, guiadas, en bicicleta y de naturaleza.",
    faqs: (city) => [
      {
        question: `¿Cuáles son las mejores excursiones desde ${city}?`,
        answer:
          "Las primeras del ranking tienen mejor valoración media con más reseñas verificadas — indicador de satisfacción consistente, no de reseñas recientes puntuales."
      },
      {
        question: "¿Hay que reservar con antelación?",
        answer:
          "En temporada alta, las excursiones con más demanda — en barco, guiadas a puntos icónicos — conviene reservarlas con varios días de antelación."
      },
      {
        question: "¿Se puede pagar para aparecer más arriba?",
        answer: "No. El ranking es exclusivamente por datos de reseñas verificadas de Google."
      }
    ],
    minCount: 4
  }
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  loadLocalEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // 1. Cargar todos los negocios publicados (paginando de 1000 en 1000)
  console.log("Cargando negocios publicados...");
  const businesses = [];
  const PAGE_SIZE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name, category, city, area, rating, reviews_count, authority_score")
      .in("status", ["published", "premium"])
      .not("rating", "is", null)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Error cargando negocios: ${error.message}`);
    businesses.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  console.log(`${businesses.length} negocios publicados encontrados.\n`);

  // 2. Agrupar por categoría + ciudad
  const groups = new Map();
  let skipped = 0;

  for (const b of businesses) {
    const city = (b.city || b.area || "").trim();
    if (!city || !b.category || !CATEGORY_META[b.category]) {
      skipped++;
      continue;
    }
    const key = `${b.category}::${city}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(b);
  }

  console.log(`${groups.size} combinaciones categoría+ciudad encontradas. (${skipped} negocios sin ciudad/categoría ignorados)\n`);

  // 3. Generar guías para cada grupo que supere el mínimo
  const today = new Date().toISOString().split("T")[0];
  const guides = [];
  const skippedGroups = [];

  for (const [key, groupBusinesses] of groups) {
    const [cat, city] = key.split("::");
    const meta = CATEGORY_META[cat];
    const minCount = meta.minCount ?? MIN_CITY_BUSINESSES;

    if (groupBusinesses.length < minCount) {
      skippedGroups.push(`${cat} en ${city} (${groupBusinesses.length} negocios, mín. ${minCount})`);
      continue;
    }

    // Ordenar por score y tomar los mejores
    const sorted = [...groupBusinesses].sort((a, b) => rankScore(b) - rankScore(a));
    const topIds = sorted.slice(0, MAX_BUSINESS_IDS).map((b) => b.id);

    const slug = `mejores-${meta.slugNoun}-${slugify(city)}`;
    const title = `${meta.article} mejores ${meta.noun} ${meta.prep} ${city}`;

    guides.push({
      id: `es-${slug}`,
      slug,
      locale: "es",
      status: "published",
      source: "generated",
      is_featured: false,
      updated_at: today,
      hero_image_url: null,
      title,
      excerpt: `${meta.noun.charAt(0).toUpperCase() + meta.noun.slice(1)} de ${city} seleccionados por consenso de reseñas verificadas de Google. Sin posiciones de pago — ordenados por valoración real.`,
      intro: `Mallorca Verified analiza las reseñas verificadas de Google para ordenar ${meta.article.toLowerCase()} ${meta.noun} ${meta.prep} ${city} por valoración real. Lo que aparece primero es lo que más satisfacción genera de forma consistente — no lo que ha pagado para estar ahí.`,
      sections: [
        {
          heading: `${meta.article} ${meta.noun} de ${city} que más valoraciones positivas acumulan`,
          body: meta.bodySection,
          business_ids: topIds
        }
      ],
      faqs: meta.faqs(city),
      seo: {
        title: `${title} | Mallorca Verified`,
        description: `${meta.noun.charAt(0).toUpperCase() + meta.noun.slice(1)} de ${city} seleccionados por consenso de reseñas verificadas. Ranking actualizado, sin posiciones de pago.`
      }
    });
  }

  console.log(`${guides.length} guías a generar. (${skippedGroups.length} grupos sin mínimo de negocios)\n`);

  if (DRY_RUN) {
    console.log("── DRY RUN — no se escribe nada en Supabase ──");
    console.log("\nEjemplos de guías que se generarían:");
    guides.slice(0, 10).forEach((g) => console.log(`  ${g.slug} (${g.sections[0].business_ids.length} negocios)`));
    if (guides.length > 10) console.log(`  ... y ${guides.length - 10} más.`);
    return;
  }

  const guidesToWrite = LIMIT ? guides.slice(0, LIMIT) : guides;
  if (LIMIT) console.log(`── Modo muestra: generando solo ${guidesToWrite.length} de ${guides.length} ──\n`);

  // 4. Upsert en lotes de 20
  const BATCH_SIZE = 20;
  let ok = 0;
  let failed = 0;

  for (let i = 0; i < guidesToWrite.length; i += BATCH_SIZE) {
    const batch = guidesToWrite.slice(i, i + BATCH_SIZE);
    const { error: upsertError } = await supabase
      .from("guides")
      .upsert(batch, { onConflict: "locale,slug" });

    if (upsertError) {
      console.error(`✗ Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${upsertError.message}`);
      failed += batch.length;
    } else {
      ok += batch.length;
      process.stdout.write(`✓ ${ok}/${guidesToWrite.length}\r`);
    }
  }

  console.log(`\n\nResultado: ${ok} guías generadas, ${failed} fallidas.`);

  // Muestra un resumen
  const byCategory = {};
  for (const g of guidesToWrite) {
    const cat = g.id.replace("es-mejores-", "").split("-")[0];
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  }
  console.log("\nGuías por categoría:");
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`  ${cat}: ${count}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
