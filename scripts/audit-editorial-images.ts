import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

type EditorialImageRow = {
  image_key: string;
  source_id: string | null;
  image_url: string | null;
};

export type EditorialImageAudit = {
  total: number;
  missing_image_url: string[];
  duplicate_source_id: { value: string; image_keys: string[] }[];
  duplicate_image_url: { value: string; image_keys: string[] }[];
  problematic_image_keys: string[];
};

export function loadLocalEnv() {
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

function findDuplicates(rows: EditorialImageRow[], field: "source_id" | "image_url") {
  const groups = new Map<string, string[]>();
  for (const row of rows) {
    const value = row[field]?.trim();
    if (!value) continue;
    groups.set(value, [...(groups.get(value) ?? []), row.image_key]);
  }

  return Array.from(groups.entries())
    .filter(([, imageKeys]) => imageKeys.length > 1)
    .map(([value, imageKeys]) => ({ value, image_keys: imageKeys }));
}

export function auditEditorialImageRows(rows: EditorialImageRow[]): EditorialImageAudit {
  const missingImageUrl = rows
    .filter((row) => !row.image_url?.trim())
    .map((row) => row.image_key);
  const duplicateSourceId = findDuplicates(rows, "source_id");
  const duplicateImageUrl = findDuplicates(rows, "image_url");
  const problematic = new Set<string>(missingImageUrl);

  for (const duplicate of [...duplicateSourceId, ...duplicateImageUrl]) {
    for (const imageKey of duplicate.image_keys.slice(1)) {
      problematic.add(imageKey);
    }
  }

  return {
    total: rows.length,
    missing_image_url: missingImageUrl,
    duplicate_source_id: duplicateSourceId,
    duplicate_image_url: duplicateImageUrl,
    problematic_image_keys: Array.from(problematic).sort()
  };
}

export async function fetchEditorialImagesForAudit(supabase: any) {
  const { data, error } = await supabase
    .from("editorial_images")
    .select("image_key,source_id,image_url")
    .order("image_key", { ascending: true });

  if (error) {
    throw new Error(`Cannot audit editorial_images. Apply supabase/migrations/007_editorial_images.sql first. Details: ${error.message}`);
  }

  return (data ?? []) as EditorialImageRow[];
}

async function main() {
  loadLocalEnv();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const rows = await fetchEditorialImagesForAudit(supabase);
  const audit = auditEditorialImageRows(rows);
  console.log(JSON.stringify(audit, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
