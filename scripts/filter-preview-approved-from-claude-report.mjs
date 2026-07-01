import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

function argValue(name) {
  const prefix = `--${name}=`;
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length).trim() : null;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .toLowerCase();
}

function compact(value) {
  return normalize(value).replace(/\s+/g, "");
}

function strongTokens(value) {
  const stopwords = new Set(["the", "de", "del", "la", "el", "los", "las", "and", "y", "a", "of"]);
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !stopwords.has(token));
}

function categoryFromPreview(previewPath) {
  const name = basename(previewPath);
  if (name.endsWith("-preview.json")) return name.slice(0, -"-preview.json".length);
  return "approved";
}

function parseApprovedNames(reportText) {
  const includeStart = reportText.search(/\bINCLUDE\b/i);
  const skipStart = reportText.search(/\bSKIP\b/i);
  if (includeStart === -1) throw new Error("Could not find INCLUDE section in Claude report.");
  const includeText = reportText.slice(includeStart, skipStart === -1 ? undefined : skipStart);

  const names = [];
  for (const rawLine of includeText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^INCLUDE\b/i.test(line)) continue;
    if (/^Nombre\b/i.test(line)) continue;
    if (/^(Barcos|Tours|Wine|Aventura|Cultura|M[eé]dicos|Dentistas|Palma|Norte|Costa|Oeste|Interior)\b/i.test(line)) continue;
    if (/^[-|:]+$/.test(line)) continue;

    const tabParts = line.split(/\t+/).map((part) => part.trim()).filter(Boolean);
    const pipeParts = line.split("|").map((part) => part.trim()).filter(Boolean);
    const parts = tabParts.length > 1 ? tabParts : pipeParts.length > 1 ? pipeParts : null;
    if (!parts) continue;

    const name = parts[0]?.trim();
    if (!name || /^name$/i.test(name) || /^nombre$/i.test(name)) continue;
    if (/^rating$/i.test(name) || /^reviews$/i.test(name)) continue;
    names.push(name);
  }

  return [...new Set(names)];
}

function rowName(row) {
  return row.name || row.display_name || row.original_name || "";
}

function findMatch(rows, approvedName, usedIds) {
  const approvedNorm = normalize(approvedName);
  const approvedCompact = compact(approvedName);
  const approvedTokens = strongTokens(approvedName);

  const scored = rows
    .filter((row) => !usedIds.has(row.google_place_id || row.place_id || row.id || rowName(row)))
    .map((row) => {
      const name = rowName(row);
      const rowNorm = normalize(name);
      const rowCompact = compact(name);
      let score = 0;
      if (rowNorm === approvedNorm) score = 100;
      else if (rowCompact === approvedCompact) score = 98;
      else if (rowNorm.includes(approvedNorm) || approvedNorm.includes(rowNorm)) score = 88;
      else if (rowCompact.includes(approvedCompact) || approvedCompact.includes(rowCompact)) score = 84;
      else {
        const rowTokenSet = new Set(strongTokens(name));
        const matchingTokens = approvedTokens.filter((token) => rowTokenSet.has(token)).length;
        if (approvedTokens.length >= 2 && matchingTokens === approvedTokens.length) score = 80;
      }
      return { row, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.row ?? null;
}

function fmt(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|");
}

function main() {
  const previewPath = argValue("preview");
  const reportPath = argValue("report");
  const outputPreview = argValue("output") || previewPath;
  const category = argValue("category") || (previewPath ? categoryFromPreview(previewPath).replace(/-zone-topup-clean$/, "") : "approved");

  if (!previewPath || !reportPath) {
    throw new Error("Usage: node scripts/filter-preview-approved-from-claude-report.mjs --preview=data/import-previews/file.json --report=path/to/claude-report.txt [--category=activities] [--output=data/import-previews/activities-preview.json]");
  }
  if (!existsSync(previewPath)) throw new Error(`Preview not found: ${previewPath}`);
  if (!existsSync(reportPath)) throw new Error(`Claude report not found: ${reportPath}`);

  const rows = JSON.parse(readFileSync(previewPath, "utf8"));
  const approvedNames = parseApprovedNames(readFileSync(reportPath, "utf8"));
  const selected = [];
  const missing = [];
  const usedIds = new Set();

  for (const approvedName of approvedNames) {
    const match = findMatch(rows, approvedName, usedIds);
    if (!match) {
      missing.push(approvedName);
      continue;
    }
    selected.push({ ...match, approval_reason: "Claude approved" });
    usedIds.add(match.google_place_id || match.place_id || match.id || rowName(match));
  }

  const excluded = rows.filter((row) => !usedIds.has(row.google_place_id || row.place_id || row.id || rowName(row)));
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const approvedBackup = `data/import-previews/${category}-claude-approved-preview-${stamp}.json`;
  mkdirSync("data/import-previews", { recursive: true });
  mkdirSync("reports", { recursive: true });
  writeFileSync(outputPreview, `${JSON.stringify(selected, null, 2)}\n`, "utf8");
  writeFileSync(approvedBackup, `${JSON.stringify(selected, null, 2)}\n`, "utf8");

  const reportOut = join("reports", `${category}-claude-approved-filter-${stamp}.md`);
  const lines = [
    `# ${category} Claude Approved Filter`,
    "",
    `Generated: ${new Date().toISOString()}`,
    `Source preview: ${previewPath}`,
    `Claude report: ${reportPath}`,
    `Output preview: ${outputPreview}`,
    `Approved backup: ${approvedBackup}`,
    "",
    "## Totals",
    "",
    `- Source rows: ${rows.length}`,
    `- Approved names parsed: ${approvedNames.length}`,
    `- Rows written: ${selected.length}`,
    `- Excluded rows: ${excluded.length}`,
    `- Missing approved names: ${missing.length}`,
    "",
    "## Approved",
    "",
    "| Name | Rating | Reviews | Type | Address |",
    "| --- | ---: | ---: | --- | --- |",
    ...selected.map((row) => `| ${fmt(rowName(row))} | ${fmt(row.rating)} | ${fmt(row.reviews_count)} | ${fmt(row.primary_type)} | ${fmt(row.address)} |`),
    "",
    "## Missing",
    "",
    ...missing.map((name) => `- ${name}`)
  ];
  writeFileSync(reportOut, `${lines.join("\n")}\n`, "utf8");

  console.log(JSON.stringify({
    report: reportOut,
    output_preview: outputPreview,
    approved_backup: approvedBackup,
    source_rows: rows.length,
    approved_names: approvedNames.length,
    rows: selected.length,
    missing
  }, null, 2));
}

main();
