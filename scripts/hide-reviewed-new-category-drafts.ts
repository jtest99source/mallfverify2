import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const decisions = [
  {
    slug: "sensitive-weed-club-alcudia-mallorca-weed-club",
    category: "nightlife",
    reason: "Cannabis association, not nightlife."
  },
  {
    slug: "ideal-property-mallorca",
    category: "real-estate",
    reason: "Travel agency / holiday rentals, not real estate sales for expats."
  },
  {
    slug: "mallorca-holiday-properties",
    category: "real-estate",
    reason: "Holiday properties / vacation rentals, not real estate sales."
  },
  {
    slug: "emerald-stay-mallorca",
    category: "real-estate",
    reason: "Rental accommodation, not real estate agency fit."
  },
  {
    slug: "mallorca-broker-real-estate",
    category: "real-estate",
    reason: "Only 8 reviews; held out of first public batch."
  },
  {
    slug: "7mallorca",
    category: "real-estate",
    reason: "Travel agency / holiday-rental fit, not a clean real estate sales agency."
  },
  {
    slug: "alquileres-drac-drac-holiday-rentals",
    category: "real-estate",
    reason: "Holiday rentals, not real estate sales or long-term relocation fit."
  },
  {
    slug: "villas2rent-mallorca",
    category: "real-estate",
    reason: "Vacation villa rentals, not real estate sales or long-term relocation fit."
  },
  {
    slug: "bellviure-luxury-villa-mallorca",
    category: "real-estate",
    reason: "Luxury vacation villa rental, not real estate sales or long-term relocation fit."
  },
  {
    slug: "fincasamallorca",
    category: "real-estate",
    reason: "Vacation-rental/travel-agency signal, not a clean real estate sales agency."
  },
  {
    slug: "palm-beach-mallorca-real-estate",
    category: "real-estate",
    reason: "No website; held out for credibility in first real-estate batch."
  },
  {
    slug: "futurinca",
    category: "real-estate",
    reason: "No website; held out for credibility in first real-estate batch."
  },
  {
    slug: "blue-mediterranean",
    category: "real-estate",
    reason: "No website and weak service primary type; held out of first real-estate batch."
  },
  {
    slug: "habitatge9",
    category: "real-estate",
    reason: "No phone and low review count; held out of first real-estate batch."
  },
  {
    slug: "first-mallorca-andratx",
    category: "real-estate",
    reason: "Borderline rating/review signal; held out of first real-estate batch."
  },
  {
    slug: "housetropia-psi-real-estate-personal-shopper-and-lawyer-house-hunter",
    category: "real-estate",
    reason: "Personal shopper / legal hybrid product, not a clean real estate agency listing."
  },
  {
    slug: "consulta-medica-dr-francisco-caro-gallego-puerto-pollensa",
    category: "healthcare",
    reason: "Local doctor listing without clear expat/English/German signal; held out of first public batch."
  },
  {
    slug: "mallorca-site",
    category: "real-estate",
    reason: "Weak service primary type and unclear fit; held out of first public batch."
  },
  {
    slug: "ims-medical-services-administrative-office",
    category: "healthcare",
    reason: "Administrative office, not a patient-facing clinic."
  },
  {
    slug: "hospital-joan-march",
    category: "healthcare",
    reason: "Public hospital, not private expat-oriented healthcare."
  },
  {
    slug: "hospital-virgen-de-la-salud",
    category: "healthcare",
    reason: "Public hospital network listing, not private expat-oriented healthcare."
  },
  {
    slug: "clinica-mediben-medicina-estetica-cirugia-estetica-dermatologia-medicina-capilar-ginecologia-depilacion-y-nutricion",
    category: "healthcare",
    reason: "Aesthetic medicine/beauty clinic; held out of healthcare places."
  },
  {
    slug: "mallorca-aesthetic-clinic",
    category: "healthcare",
    reason: "Aesthetic medicine clinic; held out of healthcare places."
  },
  {
    slug: "symmetry-clinic-vip",
    category: "healthcare",
    reason: "Aesthetic medicine clinic; held out of healthcare places."
  },
  {
    slug: "clinica-dental-althaus-bondulich",
    category: "healthcare",
    reason: "Residual draft blocked by image/photo quality; held for later manual rescue."
  },
  {
    slug: "clinica-dental-deutscher-zahnarzt-cala-millor-dr-med-dent-andreas-mann",
    category: "healthcare",
    reason: "Residual draft blocked by image/photo quality; held for later manual rescue."
  },
  {
    slug: "excelent-dent",
    category: "healthcare",
    reason: "Residual draft blocked by image/photo quality; held for later manual rescue."
  },
  {
    slug: "centros-medicos-alemanes-praxis-palmanova",
    category: "healthcare",
    reason: "Residual draft blocked by image/photo quality; held for later manual rescue."
  },
  {
    slug: "deutsche-augen-klinik-mallorca",
    category: "healthcare",
    reason: "Residual draft blocked by image/photo quality; held for later manual rescue."
  },
  {
    slug: "internistische-facharztpraxis-dr-dietz-zentrum-fur-innere-medizin-und-fruherkennung",
    category: "healthcare",
    reason: "Residual draft blocked by image/photo quality; held for later manual rescue."
  },
  {
    slug: "mallorcasa",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "amelia-inmobiliaria",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "gestpropiedad-inca",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "pegels-partner",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "mallorca-select",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "morey-inmobiliaria",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "casa-mia-real-estate-sl",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "kensington-finest-properties-international-santa-ponsa-mallorca",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "private-property-mallorca-personal-real-estate",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "fincas-roque-inmobiliaria",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "ca-vostra",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "luxury-on-mallorca",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "immobiliaria-soller-homes",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "ensenat-immobiliaria",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "unisono-luxury-homes-only-sl",
    category: "real-estate",
    reason: "Residual draft blocked by quality gates; held for later manual rescue."
  },
  {
    slug: "kallis-mallorca",
    category: "nightlife",
    reason: "Residual draft blocked by image/photo quality; held for later manual rescue."
  },
  {
    slug: "beauty-keithy",
    category: "nightlife",
    reason: "Below nightlife review threshold; held out of first public batch."
  },
  {
    slug: "cafe-rick-s",
    category: "nightlife",
    reason: "Below nightlife review threshold; held out of first public batch."
  },
  {
    slug: "trantor-gay-party-palma-de-mallorca",
    category: "nightlife",
    reason: "Below nightlife review threshold; held out of first public batch."
  },
  {
    slug: "egb-bar-de-copas",
    category: "nightlife",
    reason: "Below nightlife review threshold; held out of first public batch."
  },
  {
    slug: "autos-verona",
    category: "car-dealer",
    reason: "Residual draft blocked by image/photo quality; held for later manual rescue."
  }
];

type HideResult = {
  slug: string;
  category: string;
  reason: string;
  status: string;
  matched: number;
  name?: string | null;
  previousStatus?: string | null;
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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function main() {
  loadLocalEnv();
  const apply = process.argv.includes("--apply");
  const supabase = createSupabaseClient();
  const results: HideResult[] = [];

  for (const decision of decisions) {
    const { data, error } = await supabase
      .from("businesses")
      .select("id,slug,name,display_name,category,status")
      .eq("slug", decision.slug)
      .eq("category", decision.category);

    if (error) throw error;
    const rows = data ?? [];

    if (rows.length !== 1) {
      results.push({ ...decision, status: rows.length === 0 ? "skipped" : "conflict", matched: rows.length });
      continue;
    }

    if (apply) {
      const { error: updateError } = await supabase
        .from("businesses")
        .update({ status: "hidden" })
        .eq("id", rows[0].id);
      if (updateError) throw updateError;
    }

    results.push({
      ...decision,
      status: apply ? "hidden" : "planned",
      matched: 1,
      name: rows[0].display_name || rows[0].name,
      previousStatus: rows[0].status
    });
  }

  if (!existsSync("reports")) mkdirSync("reports");
  const reportPath = join("reports", `reviewed-new-category-drafts-hide-${apply ? "apply" : "dry-run"}-${new Date().toISOString().replace(/[:.]/g, "-")}.md`);
  writeFileSync(reportPath, [
    "# Reviewed New Category Drafts Hide Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${apply ? "APPLY" : "DRY RUN"}`,
    "",
    "| Slug | Category | Matched | Status | Previous | Reason |",
    "|---|---|---:|---|---|---|",
    ...results.map((result) => `| ${result.slug} | ${result.category} | ${result.matched} | ${result.status} | ${result.previousStatus ?? "-"} | ${result.reason} |`),
    ""
  ].join("\n"), "utf8");

  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", reportPath, results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
