// scripts/generate-badge-snippet.mjs
// Generates the personalized copy-paste badge snippet for a business.
// Usage: node scripts/generate-badge-snippet.mjs <business-slug> [en|es|de]
// Output: the one-line HTML snippet (dark + light variants) + the email paragraph.
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";

function loadEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("="); if (i < 0) continue;
    const k = line.slice(0, i).trim(), v = line.slice(i + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SITE = "https://www.mallorcaverified.com";
// businessCategory (DB) -> public URL segment
const CATEGORY_SLUG = {
  restaurant: "restaurants", hotel: "hotels", "beach-club": "beach-clubs", "boat-rental": "boats",
  activity: "activities", beach: "beaches", bar: "bars", cafe: "cafes", nightlife: "nightlife",
  bakery: "bakeries", "rent-a-car": "rent-a-car", "car-dealer": "car-dealers", spa: "spas",
  gym: "gyms", casino: "casinos", veterinarian: "vets", healthcare: "healthcare",
  "real-estate": "real-estate", lawyer: "lawyers", "tax-advisor": "tax-advisors",
  "property-management": "property-management", renovations: "renovations", "pool-garden": "pool-garden",
  excursion: "excursions", route: "routes", museum: "places", market: "places", "local-shop": "places"
};

const slug = process.argv[2];
const locale = process.argv[3] || "es";
if (!slug) { console.error("Uso: node scripts/generate-badge-snippet.mjs <business-slug> [en|es|de]"); process.exit(1); }

const { data: b, error } = await sb.from("businesses").select("slug,name,display_name,category,status").eq("slug", slug).maybeSingle();
if (error) throw error;
if (!b) { console.error(`No existe negocio con slug "${slug}"`); process.exit(1); }
const catSlug = CATEGORY_SLUG[b.category] ?? "places";
const name = b.display_name || b.name;
const fichaUrl = `${SITE}/${locale}/${catSlug}/${b.slug}`;

function snippet(variant) {
  return `<a href="${fichaUrl}" target="_blank" rel="noopener"><img src="${SITE}/badge/mallorca-verified-2026-${variant}.svg" alt="${name} — Verified on Mallorca Verified 2026" width="220" height="56" loading="lazy" style="border:0"></a>`;
}

console.log(`Negocio: ${name} [${b.status}]`);
console.log(`Ficha:   ${fichaUrl}\n`);
console.log("── Snippet (fondo oscuro de su web) ─────────────────────────");
console.log(snippet("dark"));
console.log("\n── Snippet (fondo claro de su web) ──────────────────────────");
console.log(snippet("light"));
console.log(`\n── Párrafo para el email (${locale}) ─────────────────────────`);
if (locale === "de") {
  console.log(`Als geprüfter Betrieb auf Mallorca Verified können Sie ab sofort unser Verifizierungssiegel auf Ihrer Website einbinden — es verlinkt direkt auf Ihr Profil und hilft Google und unseren Lesern, Sie leichter zu finden. Einfach diese eine HTML-Zeile in die Fußzeile Ihrer Website einfügen (Code unten). Wenn Sie möchten, übernimmt unser Team die Einbindung kostenlos — kurze Antwort genügt.`);
} else if (locale === "en") {
  console.log(`As a verified business on Mallorca Verified you can now add our verification badge to your website — it links straight to your profile and helps both Google and our readers find you. Just paste this single line of HTML into your website footer (code below). If you'd rather we handle it, our team will set it up for free — just reply to this message.`);
} else {
  console.log(`Como negocio verificado en Mallorca Verified, ya puedes añadir nuestro sello de verificación a tu web — enlaza directamente a tu ficha y ayuda tanto a Google como a nuestros lectores a encontrarte. Solo hay que pegar esta línea de HTML en el pie de tu web (código abajo). Y si lo prefieres, nuestro equipo te lo instala gratis — basta con responder a este mensaje.`);
}
console.log(`\nInstrucciones para no-técnicos: ${SITE}/${locale}/badge`);
