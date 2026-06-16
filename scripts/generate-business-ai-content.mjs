import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;

  const lines = readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function shouldRegenerate() {
  return process.argv.slice(2).includes("--regenerate");
}

function shouldRegenerateEditorialOnly() {
  return process.argv.slice(2).includes("--editorial-only");
}

function publicName(business) {
  return business.display_name?.trim() || business.name;
}

function categoryLabel(category) {
  return {
    restaurant: "restaurante",
    hotel: "hotel",
    "beach-club": "beach club",
    "boat-rental": "alquiler de barcos",
    activity: "actividad",
    beach: "playa o cala"
  }[category] ?? "negocio";
}

function locationLabel(business) {
  return business.area || business.city || business.municipality || "Mallorca";
}

function sourceTypes(business) {
  const rawTypes = Array.isArray(business.raw_google_place?.types) ? business.raw_google_place.types : [];
  const tags = Array.isArray(business.tags) ? business.tags : [];
  return Array.from(new Set([business.primary_type, ...tags, ...rawTypes].filter(Boolean))).slice(0, 8);
}

function humanizeType(value) {
  return String(value).replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function specialtyLabel(business) {
  const ignoredTypes = new Set(["point of interest", "establishment", "food", "service"]);
  const types = sourceTypes(business)
    .map(humanizeType)
    .filter((type) => type && !ignoredTypes.has(type.toLowerCase()));

  if (types.length) return types.slice(0, 2).join(" y ");

  return {
    restaurant: "cocina local y experiencia gastronomica",
    hotel: "estancias en Mallorca",
    "beach-club": "planes junto al mar",
    "boat-rental": "salidas privadas y experiencias en la costa",
    activity: "planes y experiencias locales",
    beach: "paisaje costero y banos tranquilos"
  }[business.category] ?? "servicio local";
}

function editorialReputationPhrase(business) {
  if (typeof business.rating !== "number" || typeof business.reviews_count !== "number") {
    return "Su reputacion publica todavia necesita mas contexto editorial.";
  }

  if (business.rating >= 4.7 && business.reviews_count >= 500) {
    return `Destaca por una reputacion muy solida: ${business.rating} sobre 5 y ${business.reviews_count} resenas.`;
  }

  if (business.rating >= 4.4) {
    return `Mantiene valoraciones altas, con ${business.rating} sobre 5 y ${business.reviews_count} resenas.`;
  }

  return `Cuenta con ${business.rating} sobre 5 y ${business.reviews_count} resenas, una base util para valorar su trayectoria.`;
}

function websitePhrase(business) {
  if (!business.website) return "No se detecta una web publica en la ficha importada, asi que conviene confirmar detalles por telefono o Google Maps.";
  return "Tiene una web asociada, lo que ayuda a contrastar disponibilidad, condiciones y datos de contacto.";
}

function buildIdealFor(business) {
  const category = business.category;
  const types = sourceTypes(business).map(humanizeType);
  const output = [];

  if (category === "boat-rental") {
    output.push("comparar empresas de charter");
    output.push("planes de mar en Mallorca");
    output.push("reservas que requieren revision previa");
  } else if (category === "restaurant") {
    output.push("elegir por zona y resenas");
    output.push("viajeros que buscan referencias claras");
    output.push("comidas con informacion practica");
  } else if (category === "activity") {
    output.push("planificar actividades locales");
    output.push("comparar opciones por ubicacion");
    output.push("viajeros que revisan valoraciones");
  } else {
    output.push("comparar opciones en Mallorca");
    output.push("revisar datos publicos");
    output.push("planificar con contexto local");
  }

  for (const type of types) {
    if (output.length >= 5) break;
    if (type && !["point of interest", "establishment", "food", "service"].includes(type)) output.push(type);
  }

  return Array.from(new Set(output)).slice(0, 5);
}

function buildReviewSummary(business) {
  const name = publicName(business);
  const label = categoryLabel(business.category);

  if (typeof business.rating !== "number" || typeof business.reviews_count !== "number") {
    return `${name} aparece como ${label} en ${locationLabel(business)}, pero la ficha aun no tiene rating y volumen de resenas suficientes para una lectura publica solida.`;
  }

  const volume =
    business.reviews_count >= 1000
      ? "muy alto"
      : business.reviews_count >= 100
        ? "medio"
        : "limitado";

  return `${name} tiene una valoracion de ${business.rating} sobre 5 con un volumen ${volume} de resenas (${business.reviews_count}). Es una senal de reputacion util para ordenar prioridades, aunque la decision final debe apoyarse en datos actualizados del propio negocio.`;
}

function buildAiDescription(business) {
  const name = publicName(business);
  const label = categoryLabel(business.category);
  const location = locationLabel(business);
  const specialty = specialtyLabel(business);

  return `${name} es un ${label} ubicado en ${location}. Su perfil encaja especialmente con ${specialty}, dentro de una propuesta pensada para visitantes que buscan una experiencia clara en Mallorca. ${editorialReputationPhrase(business)}`;
}

function buildWhatToExpect(business) {
  const name = publicName(business);
  const label = categoryLabel(business.category);
  const location = locationLabel(business);

  return `${name} se presenta como ${label} en ${location}, con una ficha pensada para comparar sin ruido. Encontraras senales basicas de confianza, ubicacion, contacto y contexto publico. Si tiene web, usala para confirmar condiciones; si no, conviene revisar Google Maps o llamar antes de tomar una decision.`;
}

function buildFaqAuto(business) {
  const name = publicName(business);
  const label = categoryLabel(business.category);
  const location = locationLabel(business);

  return [
    {
      question: `Que tipo de negocio es ${name}?`,
      answer: `${name} aparece clasificado como ${label} en ${location}, segun los datos publicos disponibles.`
    },
    {
      question: `La informacion de ${name} esta verificada editorialmente?`,
      answer: "La ficha parte de datos publicos y puede requerir revision humana antes de considerarse una recomendacion editorial cerrada."
    },
    {
      question: `Que debo confirmar antes de contactar con ${name}?`,
      answer: "Confirma horarios, disponibilidad, precios, condiciones y servicios directamente con el negocio o sus canales oficiales."
    }
  ];
}

async function main() {
  loadLocalEnv();

  const regenerate = shouldRegenerate();
  const editorialOnly = shouldRegenerateEditorialOnly();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const { error: schemaError } = await supabase
    .from("businesses")
    .select("ideal_for,what_to_expect,faq_auto,ai_description,review_summary,editorial_status,display_name,editorial_description")
    .limit(1);

  if (schemaError) {
    throw new Error(`Missing AI/display name columns. Apply migrations 005 and 006 before running this command. Details: ${schemaError.message}`);
  }

  const targetStatus = regenerate || editorialOnly ? "ai_generated" : "raw";
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id,name,display_name,category,area,city,municipality,address,rating,reviews_count,website,phone,tags,primary_type,raw_google_place,editorial_status,editorial_description")
    .eq("editorial_status", targetStatus)
    .order("created_at", { ascending: true });

  if (error) throw error;

  let generated = 0;
  const errors = [];

  for (const business of businesses ?? []) {
    try {
      const payload = editorialOnly
        ? { ai_description: buildAiDescription(business) }
        : {
            ai_description: buildAiDescription(business),
            ideal_for: buildIdealFor(business),
            what_to_expect: buildWhatToExpect(business),
            review_summary: buildReviewSummary(business),
            faq_auto: buildFaqAuto(business),
            editorial_status: "ai_generated"
          };

      const { error: updateError } = await supabase.from("businesses").update(payload).eq("id", business.id);
      if (updateError) throw updateError;
      generated += 1;
    } catch (error) {
      errors.push({ id: business.id, name: publicName(business), error: error.message });
    }
  }

  console.log(
    JSON.stringify(
      {
        modo: editorialOnly ? "regenerate_editorial_content" : regenerate ? "regenerate_ai_generated" : "generate_raw",
        procesados: businesses?.length ?? 0,
        generados: generated,
        errores: errors
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
