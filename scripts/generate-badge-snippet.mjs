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

const badgeLink = `${SITE}/${locale}/badge?b=${b.slug}`;

console.log(`Negocio: ${name} [${b.status}]`);
console.log(`Ficha:   ${fichaUrl}`);
console.log(`Página personalizada del sello: ${badgeLink}\n`);
console.log(`── MENSAJE DE WHATSAPP (${locale}) — copiar y enviar ──────────`);
if (locale === "de") {
  console.log(`Hallo! 👋 Ihr Verifizierungssiegel von Mallorca Verified ist fertig. Es verlinkt direkt auf Ihr Profil und hilft, dass Google und unsere Leser Sie leichter finden. Hier ist Ihre persönliche Seite mit dem fertigen Code zum Kopieren (eine Zeile für die Fußzeile Ihrer Website): ${badgeLink} — Und wenn Sie möchten, richten wir es kostenlos für Sie ein. Kurze Antwort hier genügt 🙂`);
} else if (locale === "en") {
  console.log(`Hi! 👋 Your Mallorca Verified badge is ready. It links straight to your profile and helps Google and our readers find you. Here's your personal page with the ready-to-copy code (one line for your website footer): ${badgeLink} — And if you'd rather we set it up for you, it's free — just reply here 🙂`);
} else {
  console.log(`¡Hola! 👋 Ya está listo vuestro sello de verificación de Mallorca Verified. Enlaza directo a vuestra ficha y ayuda a que Google y nuestros lectores os encuentren mejor. Aquí tenéis vuestra página personalizada con el código listo para copiar (una línea para el pie de vuestra web): ${badgeLink} — Y si preferís, os lo instalamos nosotros gratis: me decís por aquí y listo 🙂`);
}
console.log(`\n── Snippets (por si os lo instalan ellos y los pedís a mano) ──`);
console.log("oscuro: " + snippet("dark"));
console.log("claro:  " + snippet("light"));
