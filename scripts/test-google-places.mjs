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

async function main() {
  loadLocalEnv();

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_PLACES_API_KEY. Add it to .env.local.");
  }

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.rating",
        "places.userRatingCount",
        "places.formattedAddress"
      ].join(",")
    },
    body: JSON.stringify({
      textQuery: "restaurants in Mallorca",
      languageCode: "es",
      regionCode: "ES",
      maxResultCount: 5
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Places API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  const places = data.places ?? [];

  if (!places.length) {
    console.log("No results found.");
    return;
  }

  console.log(`Google Places API New test: ${places.length} results\n`);
  for (const place of places) {
    console.log(`Nombre: ${place.displayName?.text ?? "N/A"}`);
    console.log(`Rating: ${place.rating ?? "N/A"}`);
    console.log(`Reviews: ${place.userRatingCount ?? "N/A"}`);
    console.log(`Address: ${place.formattedAddress ?? "N/A"}`);
    console.log(`google_place_id: ${place.id ?? "N/A"}`);
    console.log("---");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
