// Hides businesses whose coordinates fall outside Mallorca.
//
// Google Places text search returns identically-named places elsewhere (the
// Mallorcan village "Lloret" pulls Lloret de Mar in Girona, "Petra" pulls
// Petra/Jordan, "Manacor" pulled a place in Andorra, plus Ibiza/Menorca leaks).
// Those rows were published with area="Mallorca" because their non-07xxx postal
// codes fell through to the fallback. This script flags them by bounding box and
// sets status="hidden" (reversible — no data is deleted).
//
// Usage:
//   node scripts/hide-out-of-mallorca-businesses.mjs            # dry-run (default)
//   node scripts/hide-out-of-mallorca-businesses.mjs --apply    # actually hides
//
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { isWithinMallorca } from "../src/lib/business-geo.ts";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const sep = trimmed.indexOf("=");
    if (sep === -1) continue;
    const key = trimmed.slice(0, sep).trim();
    const value = trimmed.slice(sep + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

const APPLY = process.argv.includes("--apply");

async function main() {
  loadLocalEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  const sb = createClient(url, key);

  // Pull every non-hidden business (all statuses) so we also stop out-of-island
  // drafts from ever being published.
  let all = [];
  let from = 0;
  const page = 1000;
  while (true) {
    const { data, error } = await sb
      .from("businesses")
      .select("id,name,category,status,area,city,address,latitude,longitude")
      .neq("status", "hidden")
      .range(from, from + page - 1);
    if (error) throw error;
    all = all.concat(data);
    if (data.length < page) break;
    from += page;
  }

  const outside = all.filter(
    (r) => typeof r.latitude === "number" && typeof r.longitude === "number" && !isWithinMallorca(r.latitude, r.longitude)
  );

  const byCategory = {};
  const byStatus = {};
  for (const r of outside) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  }

  console.log(`scanned (non-hidden): ${all.length}`);
  console.log(`outside Mallorca:     ${outside.length}`);
  console.log("by category:", JSON.stringify(byCategory));
  console.log("by status:  ", JSON.stringify(byStatus));

  // Write an audit report for the record / reversibility.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync("reports", { recursive: true });
  const reportPath = `reports/out-of-mallorca-hidden-${stamp}.md`;
  const lines = [
    `# Businesses outside Mallorca ${APPLY ? "(hidden)" : "(dry-run)"}`,
    ``,
    `Detected ${outside.length} businesses outside the Mallorca bounding box.`,
    `By category: ${JSON.stringify(byCategory)}`,
    `By status: ${JSON.stringify(byStatus)}`,
    ``,
    `| id | category | status | area | name | address | lat | lng |`,
    `|---|---|---|---|---|---|---|---|`,
    ...outside.map(
      (r) => `| ${r.id} | ${r.category} | ${r.status} | ${r.area ?? ""} | ${(r.name ?? "").replace(/\|/g, "/")} | ${(r.address ?? "").replace(/\|/g, "/")} | ${r.latitude} | ${r.longitude} |`
    )
  ];
  writeFileSync(reportPath, lines.join("\n"), "utf8");
  console.log(`report written: ${reportPath}`);

  if (!APPLY) {
    console.log("\nDRY RUN — nothing changed. Re-run with --apply to set status='hidden'.");
    return;
  }

  const ids = outside.map((r) => r.id);
  let hidden = 0;
  for (let i = 0; i < ids.length; i += 200) {
    const batch = ids.slice(i, i + 200);
    const { error } = await sb.from("businesses").update({ status: "hidden" }).in("id", batch);
    if (error) throw error;
    hidden += batch.length;
  }
  console.log(`\n✅ set status='hidden' on ${hidden} businesses.`);
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
