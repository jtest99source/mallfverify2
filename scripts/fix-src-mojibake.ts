import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const roots = ["src"];
const extensions = new Set([".ts", ".tsx", ".mjs", ".md"]);

const replacements: Array<[string, string]> = [
  ["Ãƒâ€ž", "Ä"],
  ["Ãƒâ€“", "Ö"],
  ["ÃƒÅ“", "Ü"],
  ["ÃƒÂ¡", "á"],
  ["ÃƒÂ©", "é"],
  ["ÃƒÂ­", "í"],
  ["ÃƒÂ³", "ó"],
  ["ÃƒÂº", "ú"],
  ["ÃƒÂ±", "ñ"],
  ["ÃƒÂ¼", "ü"],
  ["ÃƒÂ¤", "ä"],
  ["ÃƒÂ¶", "ö"],
  ["ÃƒÂ§", "ç"],
  ["ÃƒÂ ", "à"],
  ["ÃƒÂ¨", "è"],
  ["ÃƒÂª", "ê"],
  ["ÃƒÂŸ", "ß"],
  ["ÃƒÂ", "Á"],
  ["Ãƒâ€°", "É"],
  ["ÃƒÂ", "Í"],
  ["Ãƒâ€œ", "Ó"],
  ["ÃƒÅ¡", "Ú"],
  ["Ãƒâ€˜", "Ñ"],
  ["Ã¡", "á"],
  ["Ã©", "é"],
  ["Ã­", "í"],
  ["Ã³", "ó"],
  ["Ãº", "ú"],
  ["Ã±", "ñ"],
  ["Ã¼", "ü"],
  ["Ã¤", "ä"],
  ["Ã¶", "ö"],
  ["Ã§", "ç"],
  ["Ã ", "à"],
  ["Ã¨", "è"],
  ["Ãª", "ê"],
  ["ÃŸ", "ß"],
  ["Ã„", "Ä"],
  ["Ã–", "Ö"],
  ["Ãœ", "Ü"],
  ["Ã", "Á"],
  ["Ã‰", "É"],
  ["Ã", "Í"],
  ["Ã“", "Ó"],
  ["Ãš", "Ú"],
  ["Ã‘", "Ñ"],
  ["Â¿", "¿"],
  ["Â¡", "¡"],
  ["Â·", "·"],
  ["Â«", "«"],
  ["Â»", "»"],
  ["Âº", "º"],
  ["Âª", "ª"],
  ["Â©", "©"],
  ["Â®", "®"],
  ["Â", ""],
  ["â€”", "—"],
  ["â€“", "–"],
  ["â€¢", "•"],
  ["â€¦", "…"],
  ["â€˜", "‘"],
  ["â€™", "’"],
  ["â€œ", "“"],
  ["â€", "”"],
  ["â‚¬", "€"]
];

function walk(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walk(path));
    else if (extensions.has(path.slice(path.lastIndexOf(".")))) files.push(path);
  }
  return files;
}

const changed: string[] = [];

for (const root of roots) {
  if (!existsSync(root)) continue;
  for (const file of walk(root)) {
    const before = readFileSync(file, "utf8");
    let after = before;
    for (const [bad, good] of replacements) {
      after = after.split(bad).join(good);
    }

    after = after
      .replace(/label: "Coches"/g, 'label: "Concesionarios"')
      .replace(/label: 'Coches'/g, "label: 'Concesionarios'");

    if (after !== before) {
      writeFileSync(file, after);
      changed.push(file);
    }
  }
}

console.log(JSON.stringify({ changed: changed.length, files: changed }, null, 2));
