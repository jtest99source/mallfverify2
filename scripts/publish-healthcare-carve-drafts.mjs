import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

// Publishes healthcare-carve drafts (physiotherapists / psychologists / opticians)
// that meet the standing quality bar: own website OR >= 5 reviews.
// Usage: node scripts/publish-healthcare-carve-drafts.mjs [--apply]
function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const t = line.trim(); if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("="); if (i === -1) continue;
    const k = t.slice(0, i).trim(); const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
const norm = (s) => (s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const dental = /(^|[^a-z])(dental|dentist|dentista|odontolog|ortodon|endodon|dentaire|zahnarzt)/;
const optica = /(^|[^a-z])(optic|oftalmolog|ophthalmolog|optometr|augenarzt|augenklinik|augenoptik)/;
const physio = /(^|[^a-z])(fisioterap|physiother|physio|kinesiolog|osteopat|quiropract|chiroprac)/;
const mental = /(^|[^a-z])(psicolog|psiquiatr|psycholog|psychiatr|psicoterap|psychotherap|salud mental|mental health)/;
const fertility = /(^|[^a-z])(fertil|reproduccion asistida|reproduccion humana|reproductiv|fecundacion|ivf|kinderwunsch|inseminacion|ovodona)/;
const pediatrics = /(^|[^a-z])(pediatr|paediatr|kinderarzt|pediatric)/;
const nutrition = /(^|[^a-z])(nutricion|nutricionist|dietetic|dietist|nutrition|ernahrungsberat)/;

function carve(b) {
  const sig = norm([b.name, b.display_name, b.short_description, b.description, ...(b.tags ?? []), ...(b.best_for ?? [])].join(" "));
  if ((b.tags ?? []).includes("medicina-estetica")) return "aesthetic";
  if (dental.test(sig)) return "dentists";
  if (optica.test(sig)) return "opticians";
  if (physio.test(sig)) return "physiotherapists";
  if (mental.test(sig)) return "psychologists";
  if (fertility.test(sig)) return "fertility";
  if (pediatrics.test(sig)) return "pediatricians";
  if (nutrition.test(sig)) return "nutritionists";
  return "healthcare";
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from("businesses").select("id,name,display_name,short_description,description,tags,best_for,status,website,website_type,reviews_count").eq("category", "healthcare").eq("status", "draft").range(from, from + 999);
    if (error) throw error;
    rows.push(...(data ?? []));
    if ((data ?? []).length < 1000) break;
  }
  const targets = new Set(["fertility", "pediatricians", "nutritionists"]);
  const toPublish = { fertility: [], pediatricians: [], nutritionists: [] };
  const skipped = { fertility: 0, pediatricians: 0, nutritionists: 0 };
  for (const b of rows) {
    const v = carve(b);
    if (!targets.has(v)) continue;
    const publishable = (b.reviews_count ?? 0) >= 5 || b.website_type === "official_website";
    if (publishable) toPublish[v].push(b.id);
    else skipped[v] += 1;
  }
  console.log(apply ? "APPLY MODE" : "DRY RUN (add --apply to publish)");
  for (const v of Object.keys(toPublish)) {
    console.log(`${v}: publicar ${toPublish[v].length} | retenidos (sin web ni 5 reseñas) ${skipped[v]}`);
  }
  if (!apply) return;
  for (const v of Object.keys(toPublish)) {
    const ids = toPublish[v];
    for (let i = 0; i < ids.length; i += 200) {
      const batch = ids.slice(i, i + 200);
      const { error } = await sb.from("businesses").update({ status: "published" }).in("id", batch);
      if (error) throw error;
    }
    console.log(`  ✓ ${v}: ${ids.length} publicados`);
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1; });
