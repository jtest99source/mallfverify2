import { readFileSync, writeFileSync } from "node:fs";

// Conservative keep/noise pass over the three healthcare-carve previews.
// Drops only clear non-vertical rows; leaves anything ambiguous for the carve regex.
const RULES = {
  "property-management": {
    file: "data/import-previews/property-management-preview.json",
    drop: (r) => ["lodging", "hotel", "restaurant", "supermarket", "grocery_store"].includes(r.primary_type ?? ""),
  },
  renovations: {
    file: "data/import-previews/renovations-preview.json",
    drop: (r) => /(inmobiliaria|real estate|tienda|leroy merlin|bauhaus)/i.test(`${r.name} ${r.primary_type ?? ""}`),
  },
  "pool-garden": {
    file: "data/import-previews/pool-garden-preview.json",
    drop: (r) => {
      const t = r.primary_type ?? "";
      if (["farm", "wholesaler", "store", "home_goods_store", "garden_center"].includes(t)) return true;
      return /(vivero|garden center|ferreteria)/i.test(r.name ?? "");
    },
  },
  gynecology: {
    file: "data/import-previews/gynecology-preview.json",
    drop: (r) => {
      const t = r.primary_type ?? "";
      if (["store", "shopping_mall", "department_store", "jewelry_store", "general_hospital"].includes(t)) return true;
      return /(veterinar|clinica dental|dental clinic|zahnarzt)/i.test(`${r.name} ${t}`);
    },
  },
  nutrition: {
    file: "data/import-previews/nutrition-preview.json",
    drop: (r) => {
      const name = (r.name ?? "").toLowerCase();
      const t = r.primary_type ?? "";
      if (["food_store", "grocery_store", "supermarket", "supplement_store", "store", "gym", "fitness_center"].includes(t)) return true;
      return /(tienda|suplement|fabrica|fábrica|herbolario|herbalife|gimnasio|entrenamiento|training center)/i.test(name);
    },
  },
  pediatrics: {
    file: "data/import-previews/pediatrics-preview.json",
    // Dental practices carve to dentists anyway; drop them + non-medical child services.
    drop: (r) => /(dental|dentist|ortodon|dentofacial|guarderia|guardería|escuela infantil|logopeda)/i.test(`${r.name} ${r.primary_type ?? ""}`),
  },
};

for (const [cat, rule] of Object.entries(RULES)) {
  const rows = JSON.parse(readFileSync(rule.file, "utf8"));
  const dropped = rows.filter(rule.drop);
  const kept = rows.filter((r) => !rule.drop(r));
  writeFileSync(rule.file, `${JSON.stringify(kept, null, 2)}\n`, "utf8");
  console.log(`${cat}: ${rows.length} -> ${kept.length} (dropped ${dropped.length})`);
  if (dropped.length) console.log(`   dropped: ${dropped.map((r) => r.name).join(" | ")}`);
}
