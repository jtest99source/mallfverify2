import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type CleanupRule = {
  category: string;
  names: string[];
};

const rules: CleanupRule[] = [
  {
    category: "rent-a-car",
    names: [
      "eBike Mallorca",
      "Huerzeler – the cycling experience",
      "Mallorcatour Bike Rental SL",
      "Little Wheels e-mobility",
      "MultiServicios Baleares.Online",
      "Kristiantransfers",
    ],
  },
  {
    category: "spa",
    names: [
      "Apartamentos Club Simó by Senator",
      "Aparthotel Duva & Spa",
      "Inturotel Esmeralda Garden",
      "Fornalutx Petit Hotel",
      "Hotel Ca'n Roses",
      "Herbolario 72, Tienda y Consulta Naturista en Palma de Mallorca",
      "PORTOCALMA PORTOCOLOM",
    ],
  },
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

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function main() {
  loadLocalEnv();
  const supabase = createSupabaseClient();
  const lines = [
    "# Practical Services Draft Cleanup",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "These rows were moved from draft to hidden so they are not published or enriched by accident.",
    "",
  ];

  let totalHidden = 0;

  for (const rule of rules) {
    lines.push(`## ${rule.category}`, "");
    for (const name of rule.names) {
      const { data, error } = await supabase
        .from("businesses")
        .update({ status: "hidden" })
        .eq("category", rule.category)
        .eq("status", "draft")
        .eq("name", name)
        .select("id,name,category,status,rating,reviews_count,primary_type");

      if (error) throw error;
      const count = data?.length ?? 0;
      totalHidden += count;
      lines.push(`- ${name}: ${count} row(s) hidden`);
    }
    lines.push("");
  }

  lines.push(`Total hidden: ${totalHidden}`, "");

  if (!existsSync("reports")) mkdirSync("reports");
  const reportPath = join(
    "reports",
    `practical-services-draft-cleanup-${new Date().toISOString().replace(/[:.]/g, "-")}.md`,
  );
  writeFileSync(reportPath, `${lines.join("\n")}\n`);
  console.log(JSON.stringify({ totalHidden, reportPath }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
