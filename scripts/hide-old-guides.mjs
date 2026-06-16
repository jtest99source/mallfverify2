/**
 * hide-old-guides.mjs
 *
 * Marca como 'hidden' todas las guías creadas por seed-guides.mjs
 * y las antiguas hardcodeadas.
 *
 * Uso: node scripts/hide-old-guides.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

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

const IDS_TO_HIDE = [
  "es-restaurantes-palma-que-aguantan",
  "es-playas-mallorca-sin-masificar",
  "es-mallorca-3-dias-sin-perder-tiempo",
  "es-donde-alojarse-mallorca-segun-lo-que-buscas",
  "es-beach-clubs-mallorca-nota-alta",
  "es-norte-mallorca-guia-completa",
  "es-excursiones-desde-palma-que-merecen",
  "es-senderismo-tramuntana-mallorca",
  "es-cenar-mallorca-vistas-al-mar",
  "es-mallorca-octubre-fuera-temporada",
];

const SLUGS_TO_HIDE = [
  "donde-alojarse-mallorca",
  "que-hacer-mallorca-3-dias",
  "guia-alquilar-barco-mallorca",
];

async function main() {
  loadLocalEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) throw new Error("Missing Supabase credentials in .env.local");

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data: byId, error: e1 } = await supabase
    .from("guides")
    .update({ status: "hidden" })
    .in("id", IDS_TO_HIDE)
    .select("id");

  if (e1) throw new Error(`Error ocultando por ID: ${e1.message}`);

  const { data: bySlug, error: e2 } = await supabase
    .from("guides")
    .update({ status: "hidden" })
    .in("slug", SLUGS_TO_HIDE)
    .select("slug");

  if (e2) throw new Error(`Error ocultando por slug: ${e2.message}`);

  console.log(`Ocultadas por ID: ${byId?.length ?? 0}`);
  console.log(`Ocultadas por slug: ${bySlug?.length ?? 0}`);
  console.log("Hecho.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
