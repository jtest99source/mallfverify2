import { readFileSync, writeFileSync } from "node:fs";

// Conservative keep/noise pass over the three healthcare-carve previews.
// Drops only clear non-vertical rows; leaves anything ambiguous for the carve regex.
const RULES = {
  physiotherapy: {
    file: "data/import-previews/physiotherapy-preview.json",
    drop: (r) => {
      const t = r.primary_type ?? "";
      return ["spa", "beauty_salon", "hair_salon", "nail_salon", "gym", "fitness_center"].includes(t);
    },
  },
  psychology: {
    file: "data/import-previews/psychology-preview.json",
    drop: (r) => {
      const name = (r.name ?? "").toLowerCase();
      const isPsy = /(psicolog|psiquiatr|psicoter|psycholog|psychiatr|psychother|psicólog|psicólog)/i.test(name);
      const isCoach = /(coach|coaching)/i.test(name);
      const isNutri = /(nutric|nutrition|dietist|dietética|metabolismo|hormonal)/i.test(name);
      // Drop coaches / nutrition practices that are NOT also a psychology practice.
      return (isCoach || isNutri) && !isPsy;
    },
  },
  opticians: {
    file: "data/import-previews/opticians-preview.json",
    drop: (r) => {
      const name = (r.name ?? "").toLowerCase();
      const t = r.primary_type ?? "";
      if (["shopping_mall", "jewelry_store", "department_store", "general_hospital"].includes(t)) return true;
      return /(sunglass|gafas de sol|shopping|joyer|jewel)/i.test(name);
    },
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
