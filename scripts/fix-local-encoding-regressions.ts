import { readFileSync, writeFileSync } from "node:fs";

const replacement = "\uFFFD";

const replacementsByFile: Record<string, Array<[RegExp, string]>> = {
  "src/lib/page-content.tsx": [
    [new RegExp(`datos p${replacement}blicos`, "g"), "datos públicos"],
    [new RegExp(`revisi${replacement}n humana`, "g"), "revisión humana"],
    [new RegExp(`seg${replacement}n los datos`, "g"), "según los datos"],
    [new RegExp(`Was f${replacement}r ein Ort`, "g"), "Was für ein Ort"],
    [new RegExp(`${replacement}D${replacement}nde est${replacement}`, "g"), "¿Dónde está"],
    [new RegExp(` est${replacement} en `, "g"), " está en "],
    [new RegExp(`${replacement}Qu${replacement} tipo`, "g"), "¿Qué tipo"],
    [new RegExp(`${replacement}Qu${replacement} valoraci${replacement}n`, "g"), "¿Qué valoración"],
    [new RegExp(`valoraci${replacement}n de`, "g"), "valoración de"],
    [new RegExp(`rese${replacement}as`, "g"), "reseñas"],
    [new RegExp(`${replacement}ffnungszeiten pr${replacement}fen`, "g"), "Öffnungszeiten prüfen"],
    [new RegExp(`zuverl${replacement}ssigsten`, "g"), "zuverlässigsten"],
    [new RegExp(`f${replacement}r ${replacement}ffnungszeiten`, "g"), "für Öffnungszeiten"],
    [new RegExp(`Verf${replacement}gbarkeit`, "g"), "Verfügbarkeit"],
    [new RegExp(`${replacement}C${replacement}mo`, "g"), "¿Cómo"],
    [new RegExp(`m${replacement}s fiable`, "g"), "más fiable"],
    [new RegExp(`por d${replacement}a`, "g"), "por día"],
    [new RegExp(` ${replacement} `, "g"), " · "]
  ],
  "src/components/BusinessListCTA.tsx": [
    [new RegExp(`${replacement}Tu negocio`, "g"), "¿Tu negocio"],
    [new RegExp(`b${replacement}sica`, "g"), "básica"],
    [new RegExp(`Sugi${replacement}renos`, "g"), "Sugiérenos"],
    [new RegExp(` \\?`, "g"), " →"],
    [new RegExp(` ${replacement} `, "g"), " – "],
    [new RegExp(`pr${replacement}fen`, "g"), "prüfen"]
  ],
  "src/components/BusinessCard.tsx": [
    [new RegExp(`revisi${replacement}n`, "g"), "revisión"],
    [new RegExp(`Espa${replacement}a`, "g"), "España"],
    [new RegExp(replacement, "g"), "€"]
  ],
  "scripts/generate-business-editorial.ts": [
    [/Â¿/g, "¿"],
    [/quÃ©/g, "qué"],
    [/opciÃ³n/g, "opción"],
    [/CÃ³cteles/g, "Cócteles"],
    [/mÃ¡s/g, "más"],
    [/cÃ³moda/g, "cómoda"],
    [/ubicaciÃ³n/g, "ubicación"],
    [/patrÃ³n/g, "patrón"],
    [/PatrÃ³n/g, "Patrón"],
    [/quiÃ©n/g, "quién"],
    [/antelaciÃ³n/g, "antelación"],
    [/GuÃ­a/g, "Guía"],
    [/QuÃ©/g, "Qué"],
    [/cÃ³modo/g, "cómodo"],
    [/CÃ³mo/g, "Cómo"],
    [/â‚¬/g, "€"],
    [/seÃ±ales/g, "señales"],
    [/Â¿Donde/g, "¿Dónde"],
    [/Â¿Que/g, "¿Qué"],
    [/â€¦/g, "…"]
  ],
  "scripts/import-google-boats.ts": [
    [/revisiÃ³n/g, "revisión"]
  ]
};

const changed: string[] = [];

for (const [file, replacements] of Object.entries(replacementsByFile)) {
  let text = readFileSync(file, "utf8");
  const before = text;
  for (const [pattern, value] of replacements) {
    text = text.replace(pattern, value);
  }
  if (text !== before) {
    writeFileSync(file, text, "utf8");
    changed.push(file);
  }
}

console.log(JSON.stringify({ changed }, null, 2));
