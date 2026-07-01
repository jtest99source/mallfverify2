import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  slug: string;
  name: string | null;
  display_name: string | null;
  area: string | null;
  city: string | null;
  municipality: string | null;
  address: string | null;
  category: string | null;
  status: string | null;
  raw_google_place: unknown;
  place_reviews: unknown;
  place_attributes: unknown;
  business_facts: unknown;
  highlights: unknown;
};

const BAD_PATTERN = /Ã|Â|â€|â€¦|â€“|â€”|â‚¬|ï¿½/;
const TARGET_CATEGORIES = ["healthcare", "real-estate", "nightlife", "car-dealer"];
const TEXT_FIELDS = ["name", "display_name", "area", "city", "municipality", "address"] as const;
const JSON_FIELDS = ["raw_google_place", "place_reviews", "place_attributes", "business_facts", "highlights"] as const;

const CP1252_BYTES: Record<string, number> = {
  "€": 0x80,
  "‚": 0x82,
  "ƒ": 0x83,
  "„": 0x84,
  "…": 0x85,
  "†": 0x86,
  "‡": 0x87,
  "ˆ": 0x88,
  "‰": 0x89,
  "Š": 0x8a,
  "‹": 0x8b,
  "Œ": 0x8c,
  "Ž": 0x8e,
  "‘": 0x91,
  "’": 0x92,
  "“": 0x93,
  "”": 0x94,
  "•": 0x95,
  "–": 0x96,
  "—": 0x97,
  "˜": 0x98,
  "™": 0x99,
  "š": 0x9a,
  "›": 0x9b,
  "œ": 0x9c,
  "ž": 0x9e,
  "Ÿ": 0x9f
};

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function parseBooleanFlag(name: string) {
  return process.argv.includes(`--${name}`);
}

function toMojibakeBytes(value: string) {
  const bytes: number[] = [];
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code <= 0xff) bytes.push(code);
    else if (CP1252_BYTES[char] !== undefined) bytes.push(CP1252_BYTES[char]);
    else return null;
  }
  return Buffer.from(bytes);
}

function fixText(value: string) {
  if (!BAD_PATTERN.test(value)) return value;

  const bytes = toMojibakeBytes(value);
  const decoded = bytes?.toString("utf8");
  if (decoded && decoded !== value && !/�/.test(decoded)) return decoded;

  return value
    .replace(/ï¿½/g, "")
    .replace(/Â®/g, "®")
    .replace(/Âª/g, "ª")
    .replace(/Âº/g, "º")
    .replace(/Â·/g, "·")
    .replace(/Â´/g, "´")
    .replace(/Â/g, "")
    .replace(/â€¦/g, "…")
    .replace(/â€“/g, "–")
    .replace(/â€”/g, "—")
    .replace(/â‚¬/g, "€");
}

function fixJson(value: unknown): unknown {
  if (typeof value === "string") return fixText(value);
  if (Array.isArray(value)) return value.map(fixJson);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, fixJson(item)])
  );
}

function changed(before: unknown, after: unknown) {
  return JSON.stringify(before) !== JSON.stringify(after);
}

function nameOf(row: BusinessRow) {
  return row.display_name || row.name || row.slug;
}

async function main() {
  loadLocalEnv();
  const apply = parseBooleanFlag("apply");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars.");

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase
    .from("businesses")
    .select("id,slug,name,display_name,area,city,municipality,address,category,status,raw_google_place,place_reviews,place_attributes,business_facts,highlights")
    .eq("status", "draft")
    .in("category", TARGET_CATEGORIES)
    .order("category")
    .order("reviews_count", { ascending: false });

  if (error) throw error;

  const rows = (data ?? []) as BusinessRow[];
  const candidates: Array<{ row: BusinessRow; patch: Partial<BusinessRow>; notes: string[] }> = [];

  for (const row of rows) {
    const patch: Partial<BusinessRow> = {};
    const notes: string[] = [];

    for (const field of TEXT_FIELDS) {
      const before = row[field];
      if (typeof before !== "string") continue;
      const after = fixText(before);
      if (after !== before) {
        patch[field] = after;
        notes.push(`${field}: ${before} -> ${after}`);
      }
    }

    for (const field of JSON_FIELDS) {
      const before = row[field];
      const after = fixJson(before);
      if (changed(before, after)) {
        patch[field] = after as never;
        notes.push(`${field}: json text normalized`);
      }
    }

    if (notes.length) candidates.push({ row, patch, notes });
  }

  const lines = [
    `# Business Mojibake Fix ${apply ? "Apply" : "Dry Run"}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `Scope: draft businesses in ${TARGET_CATEGORIES.join(", ")}.`,
    "",
    `Candidates: ${candidates.length}`,
    ""
  ];

  for (const candidate of candidates) {
    lines.push(`## ${nameOf(candidate.row)}`, "", `- Category: ${candidate.row.category}`, `- Slug: ${candidate.row.slug}`);
    for (const note of candidate.notes) lines.push(`- ${note}`);
    lines.push("");
  }

  if (apply) {
    for (const candidate of candidates) {
      const { error: updateError } = await supabase.from("businesses").update(candidate.patch).eq("id", candidate.row.id);
      if (updateError) throw updateError;
    }
  }

  mkdirSync("reports", { recursive: true });
  const reportPath = join("reports", `business-mojibake-${apply ? "apply" : "dry-run"}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(reportPath, `${lines.join("\n")}\n`, "utf8");

  console.log(JSON.stringify({ apply, reportPath, candidates: candidates.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
