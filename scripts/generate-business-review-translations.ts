import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

type Locale = "es" | "en" | "de";

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  place_reviews: Array<Record<string, unknown>> | null;
  featured_reviews: Array<Record<string, unknown>> | null;
};

type Options = {
  apply: boolean;
  limit: number;
  onlySlugs: string[];
  includeGenerated: boolean;
  fromReport: string | null;
};

const PAGE_SIZE = 100;
const REVIEW_MAX_CHARS = 420;
const locales: Locale[] = ["es", "en", "de"];

const translatedReviewSchema = z.object({
  author: z.string().nullable(),
  rating: z.number().nullable(),
  date: z.string().nullable(),
  text: z.string().min(20).max(REVIEW_MAX_CHARS + 20),
  lang: z.string().nullable().optional(),
  translations: z.object({
    es: z.string().min(20).max(REVIEW_MAX_CHARS + 80),
    en: z.string().min(20).max(REVIEW_MAX_CHARS + 80),
    de: z.string().min(20).max(REVIEW_MAX_CHARS + 80)
  })
});

const responseSchema = z.object({
  featured_reviews: z.array(translatedReviewSchema).min(1).max(3)
});

type TranslatedReview = z.infer<typeof translatedReviewSchema>;

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

function parseArgs(): Options {
  const value = (name: string) => {
    const prefix = `--${name}=`;
    const arg = process.argv.slice(2).find((item) => item.startsWith(prefix));
    return arg ? arg.slice(prefix.length).trim() : null;
  };
  const limit = Number(value("limit") ?? 5);
  return {
    apply: process.argv.includes("--apply"),
    includeGenerated: process.argv.includes("--include-generated"),
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 5,
    onlySlugs: (value("only") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
    fromReport: value("from-report")
  };
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function textFromReview(review: Record<string, unknown>) {
  const value = review.text;
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "text" in value && typeof (value as { text?: unknown }).text === "string") {
    return (value as { text: string }).text;
  }
  return "";
}

function compactText(value: string) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > REVIEW_MAX_CHARS ? `${normalized.slice(0, REVIEW_MAX_CHARS - 3).trim()}...` : normalized;
}

function reviewRating(review: Record<string, unknown>) {
  return typeof review.rating === "number" ? review.rating : null;
}

function reviewAuthor(review: Record<string, unknown>) {
  const direct = review.author ?? review.authorName;
  return typeof direct === "string" && direct.trim() ? direct.trim() : null;
}

function reviewDate(review: Record<string, unknown>) {
  const direct = review.date ?? review.relativeTimeDescription;
  return typeof direct === "string" && direct.trim() ? direct.trim() : null;
}

function reviewLanguage(review: Record<string, unknown>) {
  const direct = review.lang ?? review.languageCode;
  return typeof direct === "string" && direct.trim() ? direct.trim() : null;
}

function hasTranslations(review: Record<string, unknown>) {
  const translations = review.translations;
  if (!translations || typeof translations !== "object" || Array.isArray(translations)) return false;
  return locales.every((locale) => typeof (translations as Record<string, unknown>)[locale] === "string");
}

function sourceReviews(row: BusinessRow) {
  const source = row.featured_reviews?.length ? row.featured_reviews : row.place_reviews ?? [];
  return source
    .map((review) => ({
      author: reviewAuthor(review),
      rating: reviewRating(review),
      date: reviewDate(review),
      text: compactText(textFromReview(review)),
      lang: reviewLanguage(review)
    }))
    .filter((review) => review.text.length >= 40)
    .slice(0, 3);
}

function needsTranslations(row: BusinessRow) {
  if (!row.featured_reviews?.length) return true;
  return row.featured_reviews.slice(0, 3).some((review) => !hasTranslations(review));
}

async function fetchBusinesses(supabase: ReturnType<typeof createSupabaseClient>, options: Options) {
  const rows: BusinessRow[] = [];
  for (let from = 0; rows.length < options.limit; from += PAGE_SIZE) {
    let query = supabase
      .from("businesses")
      .select("id,slug,name,display_name,place_reviews,featured_reviews")
      .in("status", ["published", "premium"])
      .not("place_reviews", "is", null)
      .order("authority_score", { ascending: false, nullsFirst: false })
      .range(from, from + PAGE_SIZE - 1);

    if (options.onlySlugs.length > 0) query = query.in("slug", options.onlySlugs);
    const { data, error } = await query;
    if (error) throw error;
    const page = ((data ?? []) as BusinessRow[])
      .filter((row) => sourceReviews(row).length > 0)
      .filter((row) => options.includeGenerated || needsTranslations(row));
    rows.push(...page);
    if ((data ?? []).length < PAGE_SIZE) break;
  }
  return rows.slice(0, options.limit);
}

async function callOpenAI(row: BusinessRow) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY.");
  const model = process.env.OPENAI_TRANSLATION_MODEL || process.env.OPENAI_SIGNALS_MODEL || process.env.OPENAI_MODEL || "gpt-5.4-mini";

  const run = async (feedback?: string) => fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [
            "Traduce resenas para una ficha turistica en es, en y de.",
            "No resumas, no mejores, no anadas informacion y conserva el tono del cliente.",
            "Si el texto original ya esta en un idioma, incluye tambien ese idioma en translations.",
            "Cada traduccion debe estar completamente en su idioma: es espanol, en ingles, de aleman.",
            "No mezcles alfabetos ni idiomas dentro de una traduccion.",
            "Devuelve solo JSON valido."
          ].join(" ")
        },
        {
          role: "user",
          content: JSON.stringify({
            business: row.display_name || row.name,
            reviews: sourceReviews(row),
            feedback,
            output: {
              featured_reviews: [{
                author: "string|null",
                rating: "number|null",
                date: "string|null",
                text: "texto original truncado",
                lang: "idioma original si se sabe",
                translations: { es: "espanol", en: "english", de: "deutsch" }
              }]
            }
          })
        }
      ],
      text: { format: { type: "json_object" } },
      max_output_tokens: 2200
    })
  });

  let response = await run();
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API ${response.status}: ${body}`);
  }

  const parseResponse = async (item: Response) => {
    const data = await item.json();
    const text = data.output_text ?? data.output?.flatMap((outputItem: { content?: Array<{ type?: string; text?: string }> }) => outputItem.content ?? []).find((part: { type?: string; text?: string }) => part.type === "output_text" && typeof part.text === "string")?.text;
    if (!text) throw new Error("OpenAI response did not include output text.");
    const parsed = responseSchema.parse(JSON.parse(text)).featured_reviews;
    validateTranslations(parsed);
    return parsed;
  };

  try {
    return await parseResponse(response);
  } catch (error) {
    response = await run(`Corrige el JSON anterior. Error: ${error instanceof Error ? error.message : String(error)}`);
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenAI API ${response.status}: ${body}`);
    }
    return parseResponse(response);
  }
}

function validateTranslations(reviews: TranslatedReview[]) {
  const unexpectedScripts = /[\u0600-\u06ff\u0590-\u05ff\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/;
  for (const review of reviews) {
    for (const locale of locales) {
      const text = review.translations[locale];
      if (unexpectedScripts.test(text)) {
        throw new Error(`Unexpected script in ${locale} translation: ${text.slice(0, 80)}`);
      }
    }
  }
}

function renderReport(items: Array<{ row: BusinessRow; reviews?: TranslatedReview[]; error?: string }>, apply: boolean) {
  const lines = [
    "# Business Review Translations",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Applied: ${apply ? "yes" : "no"}`,
    "",
    "## Items",
    ""
  ];

  for (const item of items) {
    lines.push(`### ${item.row.display_name || item.row.name} (${item.row.slug})`);
    if (item.error) {
      lines.push(`- Error: ${item.error}`, "");
      continue;
    }
    lines.push("", "```json", JSON.stringify(item.reviews, null, 2), "```", "");
  }

  return lines.join("\n");
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const supabase = createSupabaseClient();

  if (options.fromReport) {
    const applied = await applyFromReport(supabase, options.fromReport);
    console.log(JSON.stringify({ mode: "apply-from-report", reportPath: options.fromReport, applied }, null, 2));
    return;
  }

  const businesses = await fetchBusinesses(supabase, options);
  const results: Array<{ row: BusinessRow; reviews?: TranslatedReview[]; error?: string }> = [];

  for (const row of businesses) {
    try {
      const reviews = await callOpenAI(row);
      results.push({ row, reviews });
      if (options.apply) {
        const { error } = await supabase
          .from("businesses")
          .update({
            featured_reviews: reviews,
            updated_at: new Date().toISOString().slice(0, 10)
          })
          .eq("id", row.id);
        if (error) throw error;
      }
    } catch (error) {
      results.push({ row, error: error instanceof Error ? error.message : String(error) });
    }
  }

  if (!existsSync("reports")) mkdirSync("reports");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = join("reports", `business-review-translations-${stamp}.md`);
  writeFileSync(reportPath, renderReport(results, options.apply), "utf8");
  console.log(JSON.stringify({
    mode: options.apply ? "apply" : "dry-run",
    reportPath,
    selected: businesses.length,
    translated: results.filter((item) => item.reviews).length,
    errors: results.filter((item) => item.error).length
  }, null, 2));
}

async function applyFromReport(supabase: ReturnType<typeof createSupabaseClient>, reportPath: string) {
  const report = readFileSync(reportPath, "utf8");
  const sections = report.split(/^### /m).slice(1);
  let applied = 0;

  for (const section of sections) {
    const title = section.split(/\r?\n/, 1)[0] ?? "";
    const slug = title.match(/\(([^()]+)\)\s*$/)?.[1];
    const json = section.match(/```json\r?\n([\s\S]*?)\r?\n```/)?.[1];
    if (!slug || !json) continue;
    const reviews = z.array(translatedReviewSchema).parse(JSON.parse(json));
    validateTranslations(reviews);
    const { error } = await supabase
      .from("businesses")
      .update({
        featured_reviews: reviews,
        updated_at: new Date().toISOString().slice(0, 10)
      })
      .eq("slug", slug);
    if (error) throw error;
    applied += 1;
  }

  return applied;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
