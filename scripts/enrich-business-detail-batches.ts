import { spawnSync } from "node:child_process";

type Options = {
  categories: string[];
  limit: number;
  maxRounds: number;
  pauseMs: number;
  batchSize: number | null;
  dryRun: boolean;
};

const DEFAULT_CATEGORIES = [
  "restaurant",
  "bar",
  "cafe",
  "hotel",
  "gym",
  "spa",
  "bakery",
  "rent-a-car",
  "route",
  "excursion"
];

function argValue(name: string) {
  const prefix = `--${name}=`;
  const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length).trim() : null;
}

function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function parseArgs(): Options {
  const categoriesArg = argValue("categories");
  return {
    categories: categoriesArg
      ? categoriesArg.split(",").map((item) => item.trim()).filter(Boolean)
      : DEFAULT_CATEGORIES,
    limit: parsePositiveInteger(argValue("limit"), 100),
    maxRounds: parsePositiveInteger(argValue("max-rounds"), 20),
    pauseMs: parsePositiveInteger(argValue("pause-ms"), 1500),
    batchSize: argValue("batch-size") ? parsePositiveInteger(argValue("batch-size"), 50) : null,
    dryRun: process.argv.includes("--dry-run")
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractFinalSummary(stdout: string) {
  const selectedMatches = [...stdout.matchAll(/"selected"\s*:\s*(\d+)/g)];
  const processedMatches = [...stdout.matchAll(/"processed"\s*:\s*(\d+)/g)];
  const updatedMatches = [...stdout.matchAll(/"updated"\s*:\s*(\d+)/g)];
  return {
    selected: selectedMatches.length ? Number(selectedMatches[selectedMatches.length - 1][1]) : null,
    processed: processedMatches.length ? Number(processedMatches[processedMatches.length - 1][1]) : null,
    updated: updatedMatches.length ? Number(updatedMatches[updatedMatches.length - 1][1]) : null
  };
}

function runEnrich(category: string, options: Options) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  const npmArgs = [
    "run",
    "businesses:enrich-detail-data",
    "--",
    "--include-drafts",
    "--only-missing",
    `--category=${category}`,
    `--limit=${options.limit}`,
    options.dryRun ? "--dry-run" : "--yes"
  ];

  if (options.batchSize) npmArgs.push(`--batch-size=${options.batchSize}`);

  const command = process.platform === "win32" ? "cmd.exe" : npmCommand;
  const args = process.platform === "win32" ? ["/d", "/s", "/c", npmCommand, ...npmArgs] : npmArgs;

  console.log(`\n> ${npmCommand} ${npmArgs.join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    if (result.error) console.error(result.error);
    throw new Error(`Enrich failed for ${category} with exit code ${result.status ?? "unknown"}.`);
  }

  return extractFinalSummary(result.stdout ?? "");
}

async function main() {
  const options = parseArgs();
  const totals: Array<{ category: string; rounds: number; selected: number; processed: number; updated: number }> = [];

  console.log(JSON.stringify({
    dry_run: options.dryRun,
    categories: options.categories,
    limit_per_round: options.limit,
    max_rounds_per_category: options.maxRounds,
    pause_ms_between_rounds: options.pauseMs
  }, null, 2));

  for (const category of options.categories) {
    let categorySelected = 0;
    let categoryProcessed = 0;
    let categoryUpdated = 0;
    let rounds = 0;

    while (rounds < options.maxRounds) {
      const summary = runEnrich(category, options);
      rounds += 1;
      const selected = summary.selected ?? 0;
      const processed = summary.processed ?? 0;
      const updated = summary.updated ?? 0;

      categorySelected += selected;
      categoryProcessed += processed;
      categoryUpdated += updated;

      if (selected === 0 || selected < options.limit || options.dryRun) break;
      if (options.pauseMs > 0) await sleep(options.pauseMs);
    }

    totals.push({
      category,
      rounds,
      selected: categorySelected,
      processed: categoryProcessed,
      updated: categoryUpdated
    });
  }

  console.log(JSON.stringify({ done: true, totals }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
