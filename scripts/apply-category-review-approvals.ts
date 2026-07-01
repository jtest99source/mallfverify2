import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type ChangedRow = {
  id: string;
  slug: string | null;
  name: string | null;
  category: string | null;
  status: string | null;
  rating: number | null;
  reviews_count: number | null;
  primary_type: string | null;
  google_place_id: string | null;
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

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function rowLine(row: ChangedRow) {
  return `| ${row.name?.replace(/\|/g, " ") ?? row.id} | ${row.slug ?? "-"} | ${row.rating ?? "-"} | ${row.reviews_count ?? "-"} | ${row.primary_type ?? "-"} | ${row.google_place_id ?? "-"} |`;
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const lines = [
    "# Category Review Approvals Applied",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Rows were moved from hidden to draft according to reports/codex-import-task-2026-06-24-category-review.md.",
    "",
  ];

  let total = 0;

  const rentACarExcluded = ["limo-mallorca", "vespa-rental-alcudia-vespa-lovers"];
  const { data: rentRows, error: rentError } = await supabase
    .from("businesses")
    .update({ status: "draft" })
    .eq("category", "rent-a-car")
    .eq("status", "hidden")
    .eq("primary_type", "car_rental")
    .not("slug", "in", `(${rentACarExcluded.map((slug) => `"${slug}"`).join(",")})`)
    .select("id,slug,name,category,status,rating,reviews_count,primary_type,google_place_id");

  if (rentError) throw rentError;
  total += rentRows?.length ?? 0;
  lines.push("## rent-a-car", "", `Moved to draft: ${rentRows?.length ?? 0}`, "");
  lines.push("| Name | Slug | Rating | Reviews | Primary type | Google Place ID |", "|---|---|---:|---:|---|---|");
  for (const row of (rentRows ?? []) as ChangedRow[]) lines.push(rowLine(row));
  lines.push("");

  const carDealerSlugs = ["autocenter-mallorca-meisterbetrieb-sl", "premium-car"];
  const { data: dealerRows, error: dealerError } = await supabase
    .from("businesses")
    .update({ status: "draft" })
    .eq("category", "car-dealer")
    .eq("status", "hidden")
    .in("slug", carDealerSlugs)
    .select("id,slug,name,category,status,rating,reviews_count,primary_type,google_place_id");

  if (dealerError) throw dealerError;
  total += dealerRows?.length ?? 0;
  lines.push("## car-dealer", "", `Moved to draft: ${dealerRows?.length ?? 0}`, "");
  lines.push("| Name | Slug | Rating | Reviews | Primary type | Google Place ID |", "|---|---|---:|---:|---|---|");
  for (const row of (dealerRows ?? []) as ChangedRow[]) lines.push(rowLine(row));
  lines.push("");

  const spaTypes = ["spa", "massage", "massage_spa", "wellness_center", "sauna"];
  const { data: spaRows, error: spaError } = await supabase
    .from("businesses")
    .update({ status: "draft" })
    .eq("category", "spa")
    .eq("status", "hidden")
    .in("primary_type", spaTypes)
    .select("id,slug,name,category,status,rating,reviews_count,primary_type,google_place_id");

  if (spaError) throw spaError;
  total += spaRows?.length ?? 0;
  lines.push("## spa", "", `Moved to draft: ${spaRows?.length ?? 0}`, "");
  lines.push("| Name | Slug | Rating | Reviews | Primary type | Google Place ID |", "|---|---|---:|---:|---|---|");
  for (const row of (spaRows ?? []) as ChangedRow[]) lines.push(rowLine(row));
  lines.push("");

  const hiddenConsumerSlugs = ["restaurant-manacor"];
  const { data: consumerRows, error: consumerError } = await supabase
    .from("businesses")
    .update({ status: "draft" })
    .eq("status", "hidden")
    .in("slug", hiddenConsumerSlugs)
    .select("id,slug,name,category,status,rating,reviews_count,primary_type,google_place_id");

  if (consumerError) throw consumerError;
  total += consumerRows?.length ?? 0;
  lines.push("## consumer hidden approvals", "", `Moved to draft: ${consumerRows?.length ?? 0}`, "");
  lines.push("| Name | Slug | Rating | Reviews | Primary type | Google Place ID |", "|---|---|---:|---:|---|---|");
  for (const row of (consumerRows ?? []) as ChangedRow[]) lines.push(rowLine(row));
  lines.push("", `Total moved to draft: ${total}`, "");

  if (!existsSync("reports")) mkdirSync("reports");
  const reportPath = join(
    "reports",
    `category-review-approvals-apply-${new Date().toISOString().replace(/[:.]/g, "-")}.md`,
  );
  writeFileSync(reportPath, `${lines.join("\n")}\n`);
  console.log(JSON.stringify({ totalMovedToDraft: total, reportPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
