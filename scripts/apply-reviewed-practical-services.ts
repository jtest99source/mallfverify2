import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type BusinessRow = {
  id: string;
  slug: string;
  name: string | null;
  display_name: string | null;
  category: string | null;
  status: string | null;
  rating: number | null;
  reviews_count: number | null;
};

type Decision = {
  slug: string;
  category?: string;
  status: "published" | "hidden";
  note: string;
};

const publishDecisions: Decision[] = [
  { slug: "wiber-rent-a-car-mallorca", status: "published", category: "rent-a-car", note: "Approved rent-a-car candidate." },
  { slug: "centauro-alquiler-de-coches", status: "published", category: "rent-a-car", note: "Approved rent-a-car candidate." },
  { slug: "europcar-mallorca-palma-aeropuerto", status: "published", category: "rent-a-car", note: "Approved airport car rental candidate." },
  { slug: "gobycar-alquiler-de-coches-aeropuerto-palma-de-mallorca-pmi", status: "published", category: "rent-a-car", note: "Approved airport car rental candidate." },
  { slug: "europcar-mallorca-paguera", status: "published", category: "rent-a-car", note: "Approved rent-a-car candidate." },
  { slug: "auto-pc-balear-s-l", status: "published", category: "rent-a-car", note: "Approved rent-a-car candidate." },
  { slug: "lowcost-rent-a-car", status: "published", category: "rent-a-car", note: "Approved rent-a-car candidate." },
  { slug: "fc-rent-a-car", status: "published", category: "rent-a-car", note: "Approved rent-a-car candidate." },
  { slug: "planeta-rent-a-car-calas-ii", status: "published", category: "rent-a-car", note: "Approved rent-a-car candidate." },
  { slug: "gt-rentals-alquiler-de-coches-de-lujo-en-mallorca-luxury-car-rental", status: "published", category: "rent-a-car", note: "Approved luxury car rental candidate." },
  { slug: "national-car-rental", status: "published", category: "rent-a-car", note: "Approved rent-a-car candidate." },
  { slug: "ibacar-group", status: "published", category: "rent-a-car", note: "Approved rent-a-car candidate." },

  { slug: "furgoauto-manacor-venta-rent-a-car-taller", status: "published", category: "car-dealer", note: "Approved car dealer candidate." },
  { slug: "kaelum-club", status: "published", category: "nightlife", note: "Approved nightlife candidate." },
  { slug: "maraca-club-palma-balearic-islands", status: "published", category: "nightlife", note: "Approved nightlife candidate." },
  { slug: "villas-planet-inmobiliaria-planet-villas-vacaciones", status: "published", category: "real-estate", note: "Approved real-estate candidate." },
  { slug: "mairata-properties-inmobiliaria-en-mallorca", status: "published", category: "real-estate", note: "Approved real-estate candidate." },

  { slug: "kika-mas-centro-de-bienestar-naturopatia-y-masajes", status: "published", category: "spa", note: "Approved wellness/spa candidate." },
  { slug: "healthy-massage-mallorca", status: "published", category: "spa", note: "Approved massage/spa candidate." },
  { slug: "retreats-in-mallorca", status: "published", category: "spa", note: "Approved retreat/wellness candidate." },
  { slug: "masajes-terapeuticos-holisticos-palma", status: "published", category: "spa", note: "Approved massage/spa candidate." },
  { slug: "masajesyrelaxnatu", status: "published", category: "spa", note: "Approved massage/spa candidate." },
  { slug: "la-bonita-mallorca", status: "published", category: "spa", note: "Approved spa/wellness candidate." },
  { slug: "unit24palma", status: "published", category: "spa", note: "Approved spa/wellness candidate." },

  { slug: "fisiotur-training", status: "published", category: "healthcare", note: "Moved from spa to healthcare: physiotherapy." },
  { slug: "tufisio-soller", status: "published", category: "healthcare", note: "Moved from spa to healthcare: physiotherapy." }
];

const hideDecisions: Decision[] = [
  { slug: "2gocycling", status: "hidden", note: "Excluded from rent-a-car: cycling tours." },
  { slug: "palma-on-bike-en-palma", status: "hidden", note: "Excluded from rent-a-car: bike rental/tours." },
  { slug: "via-verde-manacor-arta", status: "hidden", note: "Excluded from rent-a-car: cycling route, not a car rental business." },
  { slug: "mallorca-e-bikes", status: "hidden", note: "Excluded from rent-a-car: e-bikes." },
  { slug: "revelo-mallorca", status: "hidden", note: "Excluded from rent-a-car: bicycle brand/shop." }
];

const decisions = [...publishDecisions, ...hideDecisions];

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

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function parseFlag(flag: string) {
  return process.argv.includes(flag);
}

function publicName(row: BusinessRow) {
  return row.display_name?.trim() || row.name?.trim() || row.slug;
}

function fmt(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function reportLine(row: BusinessRow | null, decision: Decision, result: string) {
  return `| ${decision.slug} | ${fmt(row ? publicName(row) : "")} | ${fmt(row?.category)} | ${fmt(row?.status)} | ${decision.category ?? "-"} | ${decision.status} | ${fmt(row?.rating)} | ${fmt(row?.reviews_count)} | ${result} | ${decision.note} |`;
}

async function main() {
  loadLocalEnv();
  const apply = parseFlag("--apply");
  const supabase = createSupabaseClient();
  const slugs = decisions.map((decision) => decision.slug);

  const { data, error } = await supabase
    .from("businesses")
    .select("id,slug,name,display_name,category,status,rating,reviews_count")
    .in("slug", slugs);

  if (error) throw error;

  const rows = new Map((data ?? []).map((row) => [(row as BusinessRow).slug, row as BusinessRow]));
  const lines: string[] = [];
  let applied = 0;
  let planned = 0;
  let missing = 0;
  let skipped = 0;
  let errored = 0;

  for (const decision of decisions) {
    const row = rows.get(decision.slug) ?? null;
    if (!row) {
      missing += 1;
      lines.push(reportLine(null, decision, "missing"));
      continue;
    }

    const update: Record<string, string> = { status: decision.status };
    if (decision.category) update.category = decision.category;

    const alreadyMatches =
      row.status === decision.status &&
      (!decision.category || row.category === decision.category);

    if (alreadyMatches) {
      skipped += 1;
      lines.push(reportLine(row, decision, "skipped already matches"));
      continue;
    }

    if (!apply) {
      planned += 1;
      lines.push(reportLine(row, decision, "planned"));
      continue;
    }

    const { error: updateError } = await supabase
      .from("businesses")
      .update(update)
      .eq("id", row.id);

    if (updateError) {
      errored += 1;
      lines.push(reportLine(row, decision, `error: ${updateError.message}`));
      continue;
    }

    applied += 1;
    lines.push(reportLine(row, decision, "applied"));
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `reviewed-practical-services-${apply ? "apply" : "dry-run"}-${timestamp}.md`;
  const reportPath = join("reports", filename);
  mkdirSync("reports", { recursive: true });
  writeFileSync(
    reportPath,
    [
      "# Reviewed Practical Services Apply Report",
      "",
      `Generated: ${new Date().toISOString()}`,
      `Mode: ${apply ? "APPLY" : "DRY RUN"}`,
      "",
      "## Summary",
      "",
      `- Planned: ${planned}`,
      `- Applied: ${applied}`,
      `- Skipped: ${skipped}`,
      `- Missing: ${missing}`,
      `- Errors: ${errored}`,
      "",
      "## Decisions",
      "",
      "| Slug | Name | Current category | Current status | New category | New status | Rating | Reviews | Result | Note |",
      "|---|---|---|---|---|---|---:|---:|---|---|",
      ...lines,
      ""
    ].join("\n"),
    "utf8"
  );

  console.log(`Report written to ${reportPath}`);
  console.log({ planned, applied, skipped, missing, errored });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
