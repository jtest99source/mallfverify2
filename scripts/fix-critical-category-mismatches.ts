import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

type Action = {
  slug: string;
  id?: string;
  category?: string;
  status?: "hidden";
  newSlug?: string;
  note: string;
};

const MOVE_ACTIONS: Action[] = [
  { slug: "alameda-shop", category: "bakery", note: "bakery primary type" },
  { slug: "antojos-mallorca", category: "bakery", note: "bakery primary type" },
  { slug: "bake-dreams", category: "bakery", note: "bakery primary type" },
  { slug: "l-epicerie-bakery-specialty-coffee", category: "bakery", note: "bakery primary type" },
  { slug: "1962-cafe-gastrobar", category: "bar", note: "bar primary type" },
  { slug: "cafe-can-moix", category: "bar", note: "bar primary type" },
  { slug: "cafe-mint", category: "bar", note: "bar primary type" },
  { slug: "cafe-palmanova", category: "bar", note: "bar primary type" },
  { slug: "cafe-verde", category: "bar", note: "bar primary type" },
  { slug: "catsmusics-jazz-club", category: "bar", note: "bar primary type" },
  { slug: "u-gallet", category: "bar", note: "bar primary type" },
  { slug: "bar-cafe-coto", category: "cafe", note: "cafe primary type" },
  { slug: "cafe-bar-es-vaixell", category: "cafe", note: "cafe primary type" },
  { slug: "cafe-sa-fonda", category: "cafe", note: "cafe primary type" },
  { slug: "cafeteria-cafe-del-rosario-inca", category: "cafe", note: "cafe primary type" },
  { slug: "carsi-s-bakery-gluten-free", category: "cafe", note: "cafe primary type" },
  { slug: "dolc-sa-pobla", category: "cafe", note: "cafe primary type" },
  { slug: "flip-flop-bar", category: "cafe", note: "cafe primary type" },
  { slug: "forn-de-barri-2", category: "cafe", note: "cafe primary type" },
  { slug: "mariola-s-bakery", category: "cafe", note: "cafe primary type" },
  { slug: "pastisseria-la-rotonda", category: "cafe", note: "cafe primary type" },
  { slug: "reynes-cycling-cafe-bikes-bakes", category: "cafe", note: "cafe primary type" },
  { slug: "freedom-wellness-club", category: "gym", note: "fitness primary type" },
  { slug: "natur-holistic-studio", category: "gym", note: "fitness primary type" },
  { slug: "pensa-calma-the-health-space-osteopatia-pilates-reformer", category: "spa", note: "wellness primary type" },
  { slug: "cala-lliteres", category: "beach", note: "cala/natural coast" },
  { slug: "playa-de-mallorca", category: "beach", note: "beach name" },
  { slug: "faro-de-formentor", category: "route", note: "viewpoint/lighthouse, not cafe" },
  { slug: "mirador-de-alzamora", category: "route", note: "viewpoint" },
  { slug: "mirador-deia", category: "route", note: "viewpoint" },
  { slug: "mirador-del-faro-de-cap-formentor", category: "route", note: "viewpoint" },
  { slug: "mallorca-mar-excursiones", category: "excursion", note: "excursion operator" },
  { slug: "vibe-magaluf-excursions-events", category: "excursion", note: "excursion operator" },
  { slug: "vibe-palmanova-excursions-events", category: "excursion", note: "excursion operator" },
  { slug: "magaluf-discount-events-excursions", category: "excursion", note: "excursion operator" }
];

const HIDE_ACTIONS: Action[] = [
  { slug: "autocenter-mallorca-meisterbetrieb-sl", status: "hidden", note: "car dealer is not a public category now" },
  { slug: "avinae-wine-spirits", status: "hidden", note: "market/shop is not public now" },
  { slug: "can-llompart-sobrassada-de-mallorca", status: "hidden", note: "market/shop is not public now" },
  { slug: "fet-a-soller-botiga-port-de-soller", status: "hidden", note: "market/shop is not public now" },
  { slug: "mercado-de-pere-garau", status: "hidden", note: "market is not public now" },
  { slug: "mercado-de-sineu", status: "hidden", note: "market is not public now" },
  { slug: "mercado-santa-catalina", status: "hidden", note: "market is not public now" },
  { slug: "sol-y-tierra", status: "hidden", note: "market/shop is not public now" },
  { slug: "casal-de-barrio-santa-catalina", status: "hidden", note: "culture/museum is not public now" },
  { slug: "la-casa-de-robert-graves", status: "hidden", note: "museum is not public now" },
  { slug: "museo-de-la-seu-de-mallorca", status: "hidden", note: "museum is not public now" },
  { slug: "museo-sa-bassa-blanca-fundacion-yannick-y-ben-jakober", status: "hidden", note: "museum is not public now" },
  { slug: "son-marroig", status: "hidden", note: "museum is not public now" },
  { slug: "can-piza-boutique-winery", status: "hidden", note: "winery/shop is not public now" },
  { slug: "celler-sebastia-pastor-tienda-store", status: "hidden", note: "winery/shop is not public now" },
  { slug: "echelon-cycling-hub-bike-rental-boutique-bike-tours-mallorca", status: "hidden", note: "shop hybrid needs manual category decision" },
  { slug: "la-boutique-del-gelato-can-picafort", status: "hidden", note: "local shop is not public now" },
  { slug: "la-boutique-del-gelato-via-roma", status: "hidden", note: "local shop is not public now" },
  { slug: "ms-aestethic-boutique-centro-de-estetica-avanzada", status: "hidden", note: "local shop/beauty hybrid needs manual category decision" },
  { slug: "padelhouse-voleyshop", status: "hidden", note: "shop is not public now" },
  { slug: "pura-vida-mallorca-shop-kitesurf-wingfoil-efoil-sup-surf-shop-school", status: "hidden", note: "shop hybrid needs manual category decision" },
  { slug: "skuat-gym-boutique", status: "hidden", note: "boutique/gym hybrid needs manual category decision" },
  { slug: "tienda-de-surf-online-bellini-en-mallorca", status: "hidden", note: "shop is not public now" },
  { slug: "bodega-conde-de-suyrot", status: "hidden", note: "winery is not public now" },
  { slug: "bodega-son-prim", status: "hidden", note: "winery is not public now" },
  { slug: "bodega-son-vich-de-superna", status: "hidden", note: "winery is not public now" },
  { slug: "bodegas-can-vidalet", status: "hidden", note: "winery is not public now" },
  { slug: "bodegas-oliver-moragues", status: "hidden", note: "winery is not public now" },
  { slug: "mallorcajamon-alcudia-market-alimentacion", status: "hidden", note: "market/shop is not public now" },
  { slug: "supermercado-lidl", status: "hidden", note: "supermarket is not public now" },
  { slug: "bodega-son-puig", status: "hidden", note: "winery is not public now" },
  { slug: "mallorca-fashion-outlet", status: "hidden", note: "shopping mall is not public now" },
  { slug: "bauhaus-marratxi-mallorca", status: "hidden", note: "hardware store is not public now" },
  { slug: "happy-park-cala-millor", status: "hidden", note: "playground is not a target category now" },
  { slug: "parque-infantil-platja-de-palma-balneario-9", status: "hidden", note: "playground is not a target category now" },
  { slug: "parque-bosque-de-la-playa-de-palma", status: "hidden", note: "park needs manual route/beach decision" },
  { slug: "marina-de-cala-d-or", status: "hidden", note: "marina is not a target category now" }
];

const SLUG_ACTIONS: Action[] = [
  { id: "google-ChIJOULuN2iTlxIRZeVknJRO1LY", slug: "ca-n-joan-de-s-aigo", newSlug: "ca-n-joan-de-s-aigo-bakery", note: "avoid duplicate public slug" },
  { id: "google-ChIJ_Wydbk6SlxIRc5wKl1c1hcY", slug: "ca-n-joan-de-s-aigo", newSlug: "ca-n-joan-de-s-aigo-cafe", note: "avoid duplicate public slug" },
  { id: "google-ChIJs2r9gVuSlxIRiuG8823VKcY", slug: "ca-n-joan-de-s-aigo", newSlug: "ca-n-joan-de-s-aigo-restaurant", note: "avoid duplicate public slug" },
  { id: "google-ChIJYUGCBSVUlhIRv1jj27wzL3g", slug: "cala-figuera", newSlug: "cala-figuera-boat-rental", note: "avoid duplicate public slug" },
  { id: "google-ChIJt3O3xLGAvRIRvHDK1JpJ-N8", slug: "cala-figuera", newSlug: "cala-figuera-beach", note: "avoid duplicate public slug" },
  { id: "google-ChIJHVud4yVUlhIRKikRYsl4VEg", slug: "cala-figuera", newSlug: "cala-figuera-hotel", note: "avoid duplicate public slug" },
  { id: "google-ChIJDy62XjiIlxIRtpjqkBoGCXE", slug: "jetxperience", newSlug: "jetxperience-activity", note: "avoid duplicate public slug" },
  { id: "google-ChIJM7KuaZ8tlhIRBtDKDCHuwco", slug: "jetxperience", newSlug: "jetxperience-boat-rental", note: "avoid duplicate public slug" },
  { id: "google-ChIJFUpEML7olxIRH3zr06Jt5so", slug: "tramuntana-tours", newSlug: "tramuntana-tours-excursion", note: "avoid duplicate public slug" },
  { id: "google-ChIJFUpEML7olxIRXyeqAK6gNBY", slug: "tramuntana-tours", newSlug: "tramuntana-tours-activity", note: "avoid duplicate public slug" },
  { id: "google-ChIJbcNxFQBVlhIRmnhBO6QZdZM", slug: "cala-s-almunia", status: "hidden", note: "duplicate place-like activity; beach profile remains public" },
  { id: "google-ChIJh87yxdlFlhIRE47gryUh_VM", slug: "cala-varques", status: "hidden", note: "duplicate place-like excursion; beach profile remains public" },
  { id: "google-ChIJ7y1B9kmWlxIRCsim7wtyY3U", slug: "bar-cabrera", newSlug: "bar-cabrera-bar", note: "avoid duplicate public slug" },
  { id: "google-ChIJYXyphGWSlxIRh2GO-wiIiH8", slug: "bar-cabrera", newSlug: "bar-cabrera-restaurant", note: "avoid duplicate public slug" },
  { id: "google-ChIJ5zZV_motlhIRYm0c2qMDqEQ", slug: "huerzeler-the-cycling-experience-bike-rental", newSlug: "huerzeler-the-cycling-experience-bike-rental-rent-a-car", note: "avoid duplicate public slug" },
  { id: "google-ChIJsf0dGm8tlhIRA7jPoBamGjI", slug: "huerzeler-the-cycling-experience-bike-rental", newSlug: "huerzeler-the-cycling-experience-bike-rental-excursion", note: "avoid duplicate public slug" }
];

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

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function applyActions(actions: Action[], dryRun: boolean) {
  const supabase = createSupabaseClient();
  const results: Array<Action & { matched: number }> = [];

  for (const action of actions) {
    const update = {
      ...(action.category ? { category: action.category } : {}),
      ...(action.status ? { status: action.status } : {}),
      ...(action.newSlug ? { slug: action.newSlug } : {}),
      updated_at: new Date().toISOString().slice(0, 10)
    };

    if (dryRun) {
      let query = supabase
        .from("businesses")
        .select("id", { count: "exact", head: true })
        .eq("slug", action.slug);
      if (action.id) query = query.eq("id", action.id);
      const { count, error } = await query;
      if (error) throw new Error(`${action.slug}: ${error.message}`);
      results.push({ ...action, matched: count ?? 0 });
      continue;
    }

    let query = supabase
      .from("businesses")
      .update(update)
      .eq("slug", action.slug)
      .select("id");
    if (action.id) query = query.eq("id", action.id);
    const { data, error } = await query;

    if (error) throw new Error(`${action.slug}: ${error.message}`);
    results.push({ ...action, matched: data?.length ?? 0 });
  }

  return results;
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const actions = [...MOVE_ACTIONS, ...HIDE_ACTIONS, ...SLUG_ACTIONS];
  const results = await applyActions(actions, !apply);
  const missing = results.filter((item) => item.matched === 0);

  console.log(JSON.stringify({
    mode: apply ? "apply" : "dry-run",
    moves: MOVE_ACTIONS.length,
    hides: HIDE_ACTIONS.length,
    slug_fixes: SLUG_ACTIONS.length,
    matched: results.filter((item) => item.matched > 0).length,
    missing: missing.map((item) => item.slug)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
