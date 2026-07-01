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

type MoveDecision = {
  slug: string;
  from: string;
  to: string;
  reason: string;
};

type HideDecision = {
  slug: string;
  reason: string;
};

type Result = {
  action: "move" | "hide";
  slug: string;
  name: string;
  from: string;
  to: string;
  status: "planned" | "applied" | "skipped" | "conflict" | "missing" | "error";
  reason: string;
  note: string;
};

const selectColumns = "id,slug,name,display_name,category,status,rating,reviews_count";

const moves: MoveDecision[] = [
  ...[
    "bierkonig",
    "stereo-mallorca",
    "sa-font-bierbrunnen",
    "enjoy-club",
    "mano-s-place-magaluf-illes-balears",
    "balus-bar-grill-lounge",
    "zar-society-discoteca-en-palma-de-mallorca",
    "friends-cala-ratjada",
    "thalassa-maritimo",
    "idem-coktail-bar",
    "cosmos-garden-mallorca-magaluf",
    "my-lounge",
    "times-square-music-club",
    "el-barbero",
    "underground-shisha-lounge-night-club",
    "goodfellas-music-bar",
    "enoteca-club",
    "kaelum-club",
    "maraca-club-palma-balearic-islands",
    "piano-bar",
    "reflex-disco-bar-restaurant",
    "es-gremi"
  ].map((slug) => ({ slug, from: "bar", to: "nightlife", reason: "Confirmed nightlife venue from manual review." })),
  ...["banana-club-mallorca-alcudia", "oceans-calvia-beach", "the-waterloo", "kallis-mallorca"].map((slug) => ({
    slug,
    from: "beach-club",
    to: "nightlife",
    reason: "Confirmed nightlife venue, not primarily a beach club."
  })),
  ...["gringos-bingo", "angels-bolero", "pirates-reloaded", "night-flight-club", "magaluf-square"].map((slug) => ({
    slug,
    from: "activity",
    to: "nightlife",
    reason: "Confirmed night entertainment or nightlife complex."
  })),
  ...["premium-car", "autocenter-mallorca-meisterbetrieb-sl", "furgoauto-manacor-venta-rent-a-car-taller"].map((slug) => ({
    slug,
    from: "rent-a-car",
    to: "car-dealer",
    reason: "Manual review says sales/dealer identity is primary."
  })),
  ...[
    "clinica-londres-cirurgia-i-medicina-estetica",
    "oliva-aesthetic-hair-clinic-clinica-estetica-y-capilar-mallorca",
    "clinica-palmamedica",
    "medisans-dra-marta-serna-medicina-y-cirugia-estetica",
    "tabatha-clinica-estetica-y-medicina-integral",
    "clinica-mesomedic-medicina-estetica-en-mallorca",
    "alberto-pranno-quiromasaje-profesional",
    "physiotherapist-mallorca-ramon-romero-mobile-massage-rehabilitation",
    "es-centre-centro-de-fisioterapia-en-palma",
    "pensa-calma-the-health-space-osteopatia-pilates-reformer",
    "masajes-belen-baserga",
    "physiotherapie-chiropraktik-und-massage-pto-andratx-chiropraktiker-und-osteopath-mallorca",
    "the-skin-koncept-medicina-estetica-palma-de-mallorca",
    "clinica-one-face-medicina-y-cirugia-estetica-facial",
    "dra-salome-pelle-clinica-estetica-y-medicina-estetica-mallorca",
    "fitsalud",
    "vitarium-centro-de-acupuntura-y-bienestar",
    "planas-salud-medicina-estetica"
  ].map((slug) => ({ slug, from: "spa", to: "healthcare", reason: "Medical, clinical or physiotherapy signal confirmed." })),
  ...["villas-planet-inmobiliaria-planet-villas-vacaciones", "mairata-properties-inmobiliaria-en-mallorca"].map((slug) => ({
    slug,
    from: "hotel",
    to: "real-estate",
    reason: "Manual review says real estate agency/vacation rental agency."
  })),
  ...["esrocodrom-rocodromo", "rocodrom-es-cau", "holistic-movement-colonia-de-sant-jordi", "forca-de-soller-gym-strength-training"].map((slug) => ({
    slug,
    from: "activity",
    to: "gym",
    reason: "Manual review says fitness/climbing gym, not activity."
  }))
];

const hides: HideDecision[] = [
  { slug: "supermercados-dia", reason: "Supermarket false positive." },
  { slug: "auditorium-de-palma-de-mallorca", reason: "Concert hall, not nightlife." },
  { slug: "sensitive-weed-club-alcudia", reason: "Cannabis social club, not relevant for public Places." },
  { slug: "mundo-fiesta-mallorca", reason: "Party supplies shop, not a venue." },
  { slug: "rent-me-mallorca", reason: "Too hybrid: car rental, real estate and travel agency." },
  { slug: "merca-casa-mallorca", reason: "Furniture store, not real estate." },
  { slug: "babam-concept-store", reason: "Concept store, not real estate." },
  { slug: "casa-del-oro-mallorca", reason: "Jewelry store, not real estate." },
  { slug: "suzuki-skoda-inca", reason: "Weak car dealer signal; keep hidden pending manual review." }
];

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

function publicName(row: BusinessRow | null | undefined) {
  return row?.display_name?.trim() || row?.name?.trim() || "";
}

function hasApplyFlag() {
  return process.argv.includes("--apply");
}

function renderReport(results: Result[], apply: boolean) {
  const counts = results.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  const lines = [
    "# Category Decisions Apply Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${apply ? "APPLY" : "DRY RUN"}`,
    "",
    "## Summary",
    "",
    `- Planned: ${counts.planned ?? 0}`,
    `- Applied: ${counts.applied ?? 0}`,
    `- Skipped: ${counts.skipped ?? 0}`,
    `- Missing: ${counts.missing ?? 0}`,
    `- Conflicts: ${counts.conflict ?? 0}`,
    `- Errors: ${counts.error ?? 0}`,
    "",
    "## Results",
    "",
    "| Action | Slug | Name | From | To | Status | Note |",
    "|---|---|---|---|---|---|---|",
    ...results.map((item) =>
      `| ${item.action} | \`${item.slug}\` | ${item.name.replace(/\|/g, "/")} | ${item.from} | ${item.to} | ${item.status} | ${item.note.replace(/\|/g, "/")} |`
    )
  ];

  return lines.join("\n");
}

async function findRowsBySlug(supabase: ReturnType<typeof createSupabaseClient>, slug: string) {
  const { data, error } = await supabase.from("businesses").select(selectColumns).eq("slug", slug);
  if (error) throw error;
  return (data ?? []) as BusinessRow[];
}

async function findRowForMove(supabase: ReturnType<typeof createSupabaseClient>, decision: MoveDecision) {
  const { data, error } = await supabase.from("businesses").select(selectColumns).eq("slug", decision.slug).eq("category", decision.from);
  if (error) throw error;
  return (data ?? []) as BusinessRow[];
}

async function hasDestinationConflict(supabase: ReturnType<typeof createSupabaseClient>, row: BusinessRow, to: string) {
  const { data, error } = await supabase.from("businesses").select("id,slug,category").eq("slug", row.slug).eq("category", to);
  if (error) throw error;
  return (data ?? []).some((item) => item.id !== row.id);
}

async function applyMove(supabase: ReturnType<typeof createSupabaseClient>, decision: MoveDecision, apply: boolean): Promise<Result> {
  const rows = await findRowForMove(supabase, decision);
  if (rows.length === 0) {
    const anyRows = await findRowsBySlug(supabase, decision.slug);
    const note = anyRows.length
      ? `No row in expected category ${decision.from}. Found categories: ${anyRows.map((row) => row.category ?? "unknown").join(", ")}.`
      : "Slug not found.";
    return {
      action: "move",
      slug: decision.slug,
      name: publicName(anyRows[0]),
      from: decision.from,
      to: decision.to,
      status: anyRows.length ? "conflict" : "missing",
      reason: decision.reason,
      note
    };
  }

  if (rows.length > 1) {
    return {
      action: "move",
      slug: decision.slug,
      name: rows.map(publicName).join(", "),
      from: decision.from,
      to: decision.to,
      status: "conflict",
      reason: decision.reason,
      note: `Multiple rows found in ${decision.from}; skipping.`
    };
  }

  const row = rows[0];
  if (row.category === decision.to) {
    return {
      action: "move",
      slug: decision.slug,
      name: publicName(row),
      from: decision.from,
      to: decision.to,
      status: "skipped",
      reason: decision.reason,
      note: "Already in target category."
    };
  }

  if (await hasDestinationConflict(supabase, row, decision.to)) {
    return {
      action: "move",
      slug: decision.slug,
      name: publicName(row),
      from: decision.from,
      to: decision.to,
      status: "conflict",
      reason: decision.reason,
      note: `Another row already uses this slug in ${decision.to}.`
    };
  }

  if (!apply) {
    return {
      action: "move",
      slug: decision.slug,
      name: publicName(row),
      from: decision.from,
      to: decision.to,
      status: "planned",
      reason: decision.reason,
      note: decision.reason
    };
  }

  const { error } = await supabase.from("businesses").update({ category: decision.to }).eq("id", row.id);
  if (error) {
    return {
      action: "move",
      slug: decision.slug,
      name: publicName(row),
      from: decision.from,
      to: decision.to,
      status: "error",
      reason: decision.reason,
      note: error.message
    };
  }

  return {
    action: "move",
    slug: decision.slug,
    name: publicName(row),
    from: decision.from,
    to: decision.to,
    status: "applied",
    reason: decision.reason,
    note: decision.reason
  };
}

async function applyHide(supabase: ReturnType<typeof createSupabaseClient>, decision: HideDecision, apply: boolean): Promise<Result[]> {
  const rows = await findRowsBySlug(supabase, decision.slug);
  if (rows.length === 0) {
    return [
      {
        action: "hide",
        slug: decision.slug,
        name: "",
        from: "any",
        to: "hidden",
        status: "missing",
        reason: decision.reason,
        note: "Slug not found."
      }
    ];
  }

  const results: Result[] = [];
  for (const row of rows) {
    if (row.status === "hidden") {
      results.push({
        action: "hide",
        slug: decision.slug,
        name: publicName(row),
        from: row.category ?? "unknown",
        to: "hidden",
        status: "skipped",
        reason: decision.reason,
        note: "Already hidden."
      });
      continue;
    }

    if (!apply) {
      results.push({
        action: "hide",
        slug: decision.slug,
        name: publicName(row),
        from: row.category ?? "unknown",
        to: "hidden",
        status: "planned",
        reason: decision.reason,
        note: decision.reason
      });
      continue;
    }

    const { error } = await supabase.from("businesses").update({ status: "hidden" }).eq("id", row.id);
    results.push({
      action: "hide",
      slug: decision.slug,
      name: publicName(row),
      from: row.category ?? "unknown",
      to: "hidden",
      status: error ? "error" : "applied",
      reason: decision.reason,
      note: error?.message ?? decision.reason
    });
  }
  return results;
}

async function main() {
  loadLocalEnv();
  const apply = hasApplyFlag();
  const supabase = createSupabaseClient();
  const results: Result[] = [];

  for (const decision of moves) {
    results.push(await applyMove(supabase, decision, apply));
  }

  for (const decision of hides) {
    results.push(...(await applyHide(supabase, decision, apply)));
  }

  mkdirSync("reports", { recursive: true });
  const reportPath = join("reports", `category-decisions-${apply ? "apply" : "dry-run"}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(reportPath, renderReport(results, apply), "utf8");

  const byStatus = results.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Mode: ${apply ? "APPLY" : "DRY RUN"}`);
  console.log(`Planned: ${byStatus.planned ?? 0}`);
  console.log(`Applied: ${byStatus.applied ?? 0}`);
  console.log(`Skipped: ${byStatus.skipped ?? 0}`);
  console.log(`Missing: ${byStatus.missing ?? 0}`);
  console.log(`Conflicts: ${byStatus.conflict ?? 0}`);
  console.log(`Errors: ${byStatus.error ?? 0}`);
  console.log(`Report: ${reportPath}`);

  if (!apply) {
    console.log("Run again with -- --apply to update Supabase after reviewing the report.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
