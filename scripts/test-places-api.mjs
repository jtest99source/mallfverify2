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

const apiKey = process.env.GOOGLE_PLACES_API_KEY;
if (!apiKey) { console.error("✗ No GOOGLE_PLACES_API_KEY found in .env.local"); process.exit(1); }
console.log(`Key loaded: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)} (len ${apiKey.length})`);

// Cheap test: Place Details for a known place_id (Palma Cathedral)
const pid = "ChIJWSkAXjPvlxIRwmkqVKqpkcU";
const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(pid)}`, {
  headers: {
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": "id,displayName,rating,userRatingCount",
  },
});
console.log(`HTTP ${r.status}`);
const body = await r.json();
if (r.ok) {
  console.log(`✓ API OK → ${body.displayName?.text} (★${body.rating}, ${body.userRatingCount} reviews)`);
} else {
  console.error("✗ API error:", JSON.stringify(body, null, 2));
  process.exit(1);
}
