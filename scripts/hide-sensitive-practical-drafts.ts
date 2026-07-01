import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const decisions = [
  { slug: "limo-mallorca", note: "Excluded from rent-a-car publishing: chauffeur/limousine service, not clean self-drive car rental." },
  { slug: "erotic-paradise", note: "Excluded from spas publishing: adult erotic massage positioning." },
  { slug: "tantra-paraiso-tantric-massages-in-mallorca", note: "Excluded from spas publishing: tantric/adult massage positioning." },
  { slug: "energy-tantric-massage", note: "Excluded from spas publishing: tantric/adult massage positioning." }
];

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

async function main() {
  loadLocalEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const applied: string[] = [];

  for (const decision of decisions) {
    const { data, error } = await supabase
      .from("businesses")
      .update({
        status: "hidden",
        updated_at: new Date().toISOString()
      })
      .eq("slug", decision.slug)
      .eq("status", "draft")
      .select("slug,name,category,status");

    if (error) throw error;
    for (const row of data ?? []) {
      applied.push(`- ${row.name} (${row.slug}) - ${row.category}: ${decision.note}`);
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  mkdirSync("reports", { recursive: true });
  const reportPath = join("reports", `sensitive-practical-cleanup-${stamp}.md`);
  writeFileSync(
    reportPath,
    [
      "# Sensitive Practical Draft Cleanup",
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
      `Moved to hidden: ${applied.length}`,
      "",
      ...applied
    ].join("\n") + "\n"
  );

  console.log(JSON.stringify({ reportPath, hidden: applied.length }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
