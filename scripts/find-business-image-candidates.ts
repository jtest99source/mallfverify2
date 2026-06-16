import { createClient } from "@supabase/supabase-js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const DEFAULT_LIMIT = 50;
const REQUEST_TIMEOUT_MS = 12000;
const SOCIAL_WEBSITE_TYPES = new Set(["instagram", "facebook", "tiktok", "linktree"]);

type ExtractionMethod = "meta" | "img" | "srcset" | "background";
type Confidence = "high" | "medium" | "low";
type SocialKey = "instagram" | "facebook" | "tiktok" | "linktree";
type SocialProfiles = Partial<Record<SocialKey | string, string>>;

type BusinessCandidateRow = {
  id: string;
  slug: string;
  name: string;
  display_name: string | null;
  category: string | null;
  website: string | null;
  website_type: string | null;
  image_candidate_urls: ImageCandidate[] | null;
  social_profiles: SocialProfiles | null;
};

type Options = {
  category: string | null;
  dryRun: boolean;
  limit: number | null;
  only: string | null;
  onlyMissing: boolean;
  yes: boolean;
};

type ImageCandidate = {
  url: string;
  source: "official_website";
  field?: "og:image" | "twitter:image" | "image_src" | "img" | "srcset" | "background";
  extractionMethod: ExtractionMethod;
  confidence: Confidence;
  reason: string;
  pageUrl: string;
  foundAt: string;
};

type FetchResult = {
  status: number;
  finalUrl: string;
  contentType: string;
  html: string;
  blocked: boolean;
};

const excludedUrlTerms = [
  "logo",
  "icon",
  "favicon",
  "sprite",
  "placeholder",
  "avatar",
  "badge",
  "tripadvisor",
  "google",
  "facebook",
  "pixel",
  "tracking",
  "analytics",
  "loader",
  "spinner"
];

const imageUrlHints = [
  "hero",
  "gallery",
  "photo",
  "image",
  "img",
  "upload",
  "media",
  "wp-content",
  "cdn",
  "assets",
  "files",
  "pictures"
];

const commonCdnHosts = [
  "cloudinary.com",
  "imgix.net",
  "akamaihd.net",
  "cloudfront.net",
  "wp.com",
  "wixstatic.com",
  "squarespace-cdn.com",
  "cdninstagram.com",
  "fastly.net",
  "sirv.com",
  "ctfassets.net"
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

function parseArgs() {
  const options: Options = {
    category: null,
    dryRun: false,
    limit: DEFAULT_LIMIT,
    only: null,
    onlyMissing: false,
    yes: false
  };
  let limitProvided = false;

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith("--limit=")) {
      const value = Number(arg.split("=")[1]);
      if (Number.isFinite(value) && value > 0) {
        options.limit = Math.floor(value);
        limitProvided = true;
      }
    } else if (arg.startsWith("--category=")) {
      options.category = arg.split("=")[1]?.trim() || null;
    } else if (arg.startsWith("--only=")) {
      options.only = arg.split("=")[1]?.trim() || null;
    } else if (arg === "--only-missing") {
      options.onlyMissing = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--yes") {
      options.yes = true;
    }
  }

  if (options.only && !limitProvided) options.limit = 1;
  if (options.onlyMissing && !limitProvided && !options.only) options.limit = null;

  return options;
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function getRootUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.origin}/`;
  } catch {
    return value;
  }
}

function shouldTryRootUrl(value: string) {
  try {
    const url = new URL(value);
    return url.search.length > 30 || url.pathname.split("/").filter(Boolean).length > 1;
  } catch {
    return false;
  }
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getAttribute(tag: string, attribute: string) {
  const pattern = new RegExp(`${attribute}\\s*=\\s*(["'])(.*?)\\1`, "i");
  const match = tag.match(pattern);
  return match?.[2] ? decodeHtml(match[2].trim()) : null;
}

function normalizeImageUrl(value: string, pageUrl: string) {
  try {
    const url = new URL(decodeHtml(value.trim()), pageUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeSocialHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "").replace(/^m\./, "");
}

function getSocialKey(url: URL): SocialKey | null {
  const host = normalizeSocialHost(url.hostname);
  if (host === "instagram.com") return "instagram";
  if (host === "facebook.com" || host === "fb.com") return "facebook";
  if (host === "tiktok.com") return "tiktok";
  if (host === "linktr.ee") return "linktree";
  return null;
}

function getPathSegments(url: URL) {
  return url.pathname.split("/").map((segment) => segment.trim()).filter(Boolean);
}

function cleanSocialUrl(key: SocialKey, url: URL) {
  const segments = getPathSegments(url);
  if (segments.length === 0) return null;

  const first = segments[0].toLowerCase();
  if (key === "instagram") {
    if (["accounts", "create", "developer", "explore", "oauth", "p", "reel", "stories", "tv"].includes(first)) return null;
    return `https://instagram.com/${segments[0]}`;
  }

  if (key === "tiktok") {
    if (!segments[0].startsWith("@")) return null;
    if (["embed", "login", "share", "tag", "music", "discover"].includes(first)) return null;
    return `https://tiktok.com/${segments[0]}`;
  }

  if (key === "linktree") {
    if (["admin", "login", "marketplace", "register", "s", "share"].includes(first)) return null;
    return `https://linktr.ee/${segments[0]}`;
  }

  if (key === "facebook") {
    if (
      first === "sharer" ||
      first === "sharer.php" ||
      first === "share.php" ||
      first === "dialog" ||
      first === "plugins" ||
      first === "login" ||
      first === "help" ||
      first === "privacy" ||
      first === "events" ||
      first === "tr" ||
      first === "ads" ||
      first === "business" ||
      first === "privacy"
    ) {
      return null;
    }

    const canonicalSegments = segments.slice(0, Math.min(segments.length, 3));
    return `https://facebook.com/${canonicalSegments.join("/")}`;
  }

  return null;
}

function normalizeSocialUrl(value: string, pageUrl?: string): { key: SocialKey; url: string } | null {
  const normalizedValue = decodeHtml(value.trim()).replace(/\\\//g, "/");
  if (!normalizedValue) return null;

  try {
    const url = pageUrl ? new URL(normalizedValue, pageUrl) : new URL(normalizedValue);
    if (!["http:", "https:"].includes(url.protocol)) return null;

    const key = getSocialKey(url);
    if (!key) return null;

    const cleanUrl = cleanSocialUrl(key, url);
    if (!cleanUrl) return null;
    return { key, url: cleanUrl };
  } catch {
    return null;
  }
}

function socialSpecificity(value: string) {
  try {
    const url = new URL(value);
    return getPathSegments(url).join("/").length;
  } catch {
    return value.length;
  }
}

function setBestSocialProfile(profiles: SocialProfiles, candidate: { key: SocialKey; url: string }) {
  const existing = profiles[candidate.key];
  if (!existing || socialSpecificity(candidate.url) > socialSpecificity(existing)) {
    profiles[candidate.key] = candidate.url;
  }
}

function extractSocialProfiles(html: string, pageUrl: string): SocialProfiles {
  const profiles: SocialProfiles = {};

  for (const tagMatch of html.matchAll(/<(?:a|link)\b[^>]*>/gi)) {
    const href = getAttribute(tagMatch[0], "href");
    if (!href) continue;
    const candidate = normalizeSocialUrl(href, pageUrl);
    if (candidate) setBestSocialProfile(profiles, candidate);
  }

  for (const tagMatch of html.matchAll(/<meta\b[^>]*>/gi)) {
    const content = getAttribute(tagMatch[0], "content");
    if (!content) continue;
    const candidate = normalizeSocialUrl(content, pageUrl);
    if (candidate) setBestSocialProfile(profiles, candidate);
  }

  for (const match of html.matchAll(/https?:\\?\/\\?\/(?:www\.|m\.)?(?:instagram\.com|facebook\.com|fb\.com|tiktok\.com|linktr\.ee)\/[^\s"'<>),]+/gi)) {
    const candidate = normalizeSocialUrl(match[0], pageUrl);
    if (candidate) setBestSocialProfile(profiles, candidate);
  }

  return profiles;
}

function directSocialProfile(website: string | null, websiteType: string | null): SocialProfiles {
  if (!website || !websiteType || !SOCIAL_WEBSITE_TYPES.has(websiteType)) return {};
  const candidate = normalizeSocialUrl(website);
  return candidate ? { [candidate.key]: candidate.url } : {};
}

function isEmptySocialProfiles(value: SocialProfiles | null) {
  return !value || Object.keys(value).length === 0;
}

function sanitizeSocialProfiles(existing: SocialProfiles | null) {
  const sanitized: SocialProfiles = {};
  const entries = Object.entries(existing ?? {});

  for (const [key, value] of entries) {
    if (typeof value !== "string") continue;
    const normalized = normalizeSocialUrl(value);
    if (!normalized || normalized.key !== key) continue;
    sanitized[key] = normalized.url;
  }

  return {
    profiles: sanitized,
    removed: entries.length - Object.keys(sanitized).length
  };
}

function mergeSocialProfiles(existing: SocialProfiles | null, found: SocialProfiles) {
  const sanitized = sanitizeSocialProfiles(existing);
  const merged: SocialProfiles = { ...sanitized.profiles };
  const added: SocialProfiles = {};

  for (const [key, value] of Object.entries(found)) {
    if (!value || merged[key]) continue;
    merged[key] = value;
    added[key] = value;
  }

  return { merged, added, removed: sanitized.removed };
}

function isCommonCdn(url: URL) {
  const host = url.hostname.toLowerCase();
  return commonCdnHosts.some((cdnHost) => host.includes(cdnHost));
}

function hasImageExtension(url: URL) {
  return /\.(jpe?g|png|webp|avif)(?:$|[?#])/i.test(url.toString());
}

function looksLikeImageUrl(url: URL) {
  const text = decodeURIComponent(url.toString()).toLowerCase();
  return imageUrlHints.some((hint) => text.includes(hint));
}

function isExcludedImageUrl(value: string) {
  const text = decodeURIComponent(value).toLowerCase();
  return excludedUrlTerms.some((term) => text.includes(term));
}

function isAcceptableImageUrl(value: string, allowHintOnly: boolean) {
  try {
    const url = new URL(value);
    if (isExcludedImageUrl(url.toString())) return false;
    if (hasImageExtension(url) || isCommonCdn(url)) return true;
    return allowHintOnly && looksLikeImageUrl(url);
  } catch {
    return false;
  }
}

function getDimensions(tag: string) {
  const width = Number(getAttribute(tag, "width") ?? 0);
  const height = Number(getAttribute(tag, "height") ?? 0);
  return {
    width: Number.isFinite(width) ? width : 0,
    height: Number.isFinite(height) ? height : 0
  };
}

function hasLargeDimensions(width: number, height: number) {
  return width >= 600 || height >= 600 || (width >= 500 && height >= 350);
}

function getBestSrcsetUrl(srcset: string, pageUrl: string) {
  const candidates = srcset
    .split(",")
    .map((part) => {
      const [rawUrl, rawDescriptor] = part.trim().split(/\s+/, 2);
      const width = rawDescriptor?.endsWith("w") ? Number(rawDescriptor.replace("w", "")) : 0;
      const density = rawDescriptor?.endsWith("x") ? Number(rawDescriptor.replace("x", "")) : 0;
      const url = rawUrl ? normalizeImageUrl(rawUrl, pageUrl) : null;
      return { url, width: Number.isFinite(width) ? width : 0, density: Number.isFinite(density) ? density : 0 };
    })
    .filter((candidate) => candidate.url);

  candidates.sort((a, b) => b.width - a.width || b.density - a.density);
  return candidates[0] ?? null;
}

function pushCandidate(
  candidates: ImageCandidate[],
  input: {
    url: string | null;
    field: ImageCandidate["field"];
    extractionMethod: ExtractionMethod;
    confidence: Confidence;
    reason: string;
    pageUrl: string;
    allowHintOnly?: boolean;
  }
) {
  if (!input.url) return;
  if (!isAcceptableImageUrl(input.url, Boolean(input.allowHintOnly))) return;

  candidates.push({
    url: input.url,
    source: "official_website",
    field: input.field,
    extractionMethod: input.extractionMethod,
    confidence: input.confidence,
    reason: input.reason,
    pageUrl: input.pageUrl,
    foundAt: new Date().toISOString()
  });
}

function extractMetaCandidates(html: string, pageUrl: string) {
  const candidates: ImageCandidate[] = [];

  for (const tagMatch of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = tagMatch[0];
    const property = getAttribute(tag, "property")?.toLowerCase();
    const name = getAttribute(tag, "name")?.toLowerCase();
    const content = getAttribute(tag, "content");
    if (!content) continue;

    const field = property === "og:image" || property === "og:image:url" || property === "og:image:secure_url"
      ? "og:image"
      : name === "twitter:image" || name === "twitter:image:src"
        ? "twitter:image"
        : null;
    if (!field) continue;

    pushCandidate(candidates, {
      url: normalizeImageUrl(content, pageUrl),
      field,
      extractionMethod: "meta",
      confidence: "high",
      reason: `${field} meta tag`,
      pageUrl,
      allowHintOnly: true
    });
  }

  for (const tagMatch of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = tagMatch[0];
    const rel = getAttribute(tag, "rel")?.toLowerCase();
    const href = getAttribute(tag, "href");
    if (rel !== "image_src" || !href) continue;

    pushCandidate(candidates, {
      url: normalizeImageUrl(href, pageUrl),
      field: "image_src",
      extractionMethod: "meta",
      confidence: "high",
      reason: "link rel=image_src",
      pageUrl,
      allowHintOnly: true
    });
  }

  return candidates;
}

function extractImgCandidates(html: string, pageUrl: string) {
  const candidates: ImageCandidate[] = [];

  for (const tagMatch of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = tagMatch[0];
    const { width, height } = getDimensions(tag);
    const src = getAttribute(tag, "src") || getAttribute(tag, "data-src") || getAttribute(tag, "data-lazy-src");
    const srcset = getAttribute(tag, "srcset") || getAttribute(tag, "data-srcset") || getAttribute(tag, "data-lazy-srcset");
    const hasLargeAttrs = hasLargeDimensions(width, height);

    if (src) {
      const url = normalizeImageUrl(src, pageUrl);
      const allowHintOnly = !hasLargeAttrs;
      if (hasLargeAttrs || (url && looksLikeImageUrl(new URL(url)))) {
        pushCandidate(candidates, {
          url,
          field: "img",
          extractionMethod: "img",
          confidence: hasLargeAttrs ? "medium" : "low",
          reason: hasLargeAttrs ? `img dimensions ${width}x${height}` : "img URL looks like hero/gallery/photo/media",
          pageUrl,
          allowHintOnly
        });
      }
    }

    if (srcset) {
      const best = getBestSrcsetUrl(srcset, pageUrl);
      if (best?.url && (best.width >= 600 || best.density >= 2 || looksLikeImageUrl(new URL(best.url)))) {
        pushCandidate(candidates, {
          url: best.url,
          field: "srcset",
          extractionMethod: "srcset",
          confidence: best.width >= 900 ? "medium" : "low",
          reason: best.width ? `srcset candidate ${best.width}w` : `srcset candidate ${best.density}x`,
          pageUrl,
          allowHintOnly: best.width < 600
        });
      }
    }
  }

  return candidates;
}

function extractBackgroundCandidates(html: string, pageUrl: string) {
  const candidates: ImageCandidate[] = [];

  for (const match of html.matchAll(/background(?:-image)?\s*:\s*url\((['"]?)(.*?)\1\)/gi)) {
    const url = normalizeImageUrl(match[2], pageUrl);
    if (!url) continue;

    pushCandidate(candidates, {
      url,
      field: "background",
      extractionMethod: "background",
      confidence: looksLikeImageUrl(new URL(url)) ? "medium" : "low",
      reason: "inline background-image URL",
      pageUrl,
      allowHintOnly: true
    });
  }

  return candidates;
}

function confidenceWeight(confidence: Confidence) {
  if (confidence === "high") return 3;
  if (confidence === "medium") return 2;
  return 1;
}

function methodWeight(method: ExtractionMethod) {
  if (method === "meta") return 4;
  if (method === "srcset") return 3;
  if (method === "img") return 2;
  return 1;
}

function dedupeAndRankCandidates(candidates: ImageCandidate[]) {
  const map = new Map<string, ImageCandidate>();

  for (const candidate of candidates) {
    const existing = map.get(candidate.url);
    if (!existing) {
      map.set(candidate.url, candidate);
      continue;
    }

    const existingScore = confidenceWeight(existing.confidence) + methodWeight(existing.extractionMethod);
    const candidateScore = confidenceWeight(candidate.confidence) + methodWeight(candidate.extractionMethod);
    if (candidateScore > existingScore) map.set(candidate.url, candidate);
  }

  return Array.from(map.values()).sort((a, b) => (
    confidenceWeight(b.confidence) - confidenceWeight(a.confidence) ||
    methodWeight(b.extractionMethod) - methodWeight(a.extractionMethod)
  ));
}

function extractImageCandidates(html: string, pageUrl: string): ImageCandidate[] {
  return dedupeAndRankCandidates([
    ...extractMetaCandidates(html, pageUrl),
    ...extractImgCandidates(html, pageUrl),
    ...extractBackgroundCandidates(html, pageUrl)
  ]).slice(0, 8);
}

function looksBlocked(status: number, html: string) {
  if ([401, 403, 429].includes(status)) return true;
  const snippet = html.slice(0, 120000).toLowerCase();
  return /cloudflare|checking your browser|access denied|forbidden|captcha|cf-chl|enable javascript/.test(snippet);
}

async function fetchHomepage(url: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
      },
      redirect: "follow",
      signal: controller.signal
    });
    const contentType = response.headers.get("content-type") ?? "";
    const html = contentType.includes("text/html") || contentType.includes("application/xhtml")
      ? await response.text()
      : "";
    return {
      status: response.status,
      finalUrl: response.url || url,
      contentType,
      html,
      blocked: looksBlocked(response.status, html)
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchCandidatePages(website: string) {
  const urls = [website];
  const rootUrl = getRootUrl(website);
  if (shouldTryRootUrl(website) && rootUrl !== website) urls.push(rootUrl);

  const pages: FetchResult[] = [];
  const seen = new Set<string>();
  for (const url of urls) {
    if (seen.has(url)) continue;
    seen.add(url);
    pages.push(await fetchHomepage(url));
  }

  return pages;
}

function mergeCandidates(existing: ImageCandidate[] | null, found: ImageCandidate[]) {
  const merged = [...(Array.isArray(existing) ? existing : [])];
  const seen = new Set(merged.map((candidate) => candidate.url));

  for (const candidate of found) {
    if (seen.has(candidate.url)) continue;
    seen.add(candidate.url);
    merged.push(candidate);
  }

  return merged;
}

function formatSocialProfiles(profiles: SocialProfiles) {
  const entries = Object.entries(profiles).filter((entry): entry is [string, string] => Boolean(entry[1]));
  return entries.length ? entries.map(([key, url]) => `${key}: ${url}`).join(", ") : "-";
}

function incrementRecord(record: Record<string, number>, key: string | null | undefined, amount = 1) {
  const normalizedKey = key || "unknown";
  record[normalizedKey] = (record[normalizedKey] ?? 0) + amount;
}

function writeCoverageReport(input: {
  blocked: number;
  byCategory: Record<string, { processed: number; withSocials: number }>;
  byMethod: Record<ExtractionMethod, number>;
  byNetwork: Record<string, number>;
  candidatesFound: number;
  dryRun: boolean;
  errors: Array<{ name: string; slug: string; message: string }>;
  examples: Array<{ name: string; website: string; candidates: Array<{ url: string; method: string; confidence: string; reason: string }> }>;
  foundSocials: Array<{ name: string; slug: string; category: string | null; profiles: SocialProfiles }>;
  options: Options;
  processed: number;
  selected: number;
  skippedWithoutOfficialWebsite: Array<{ name: string; slug: string; category: string | null; websiteType: string | null }>;
  updatedImages: number;
  updatedSocials: number;
  withoutImages: number;
  withoutSocials: number;
}) {
  mkdirSync("reports", { recursive: true });
  const generatedAt = new Date().toISOString();
  const path = `reports/social-profiles-coverage-${generatedAt.replace(/[:.]/g, "-")}.md`;
  const lines = [
    "# Social Profiles Coverage",
    "",
    `Generated: ${generatedAt}`,
    `Dry run: ${input.dryRun ? "yes" : "no"}`,
    "",
    "## Scope",
    "",
    `- Selected: ${input.selected}`,
    `- Processed: ${input.processed}`,
    `- Updated social_profiles: ${input.updatedSocials}`,
    `- Updated image candidates: ${input.updatedImages}`,
    `- With at least one social found: ${input.foundSocials.length}`,
    `- Without socials found: ${input.withoutSocials}`,
    `- Blocked pages: ${input.blocked}`,
    `- Errors: ${input.errors.length}`,
    `- Options: category=${input.options.category ?? "-"}, only=${input.options.only ?? "-"}, only_missing=${input.options.onlyMissing ? "yes" : "no"}, limit=${input.options.limit ?? "all"}`,
    "",
    "## Networks",
    "",
    "| Network | Count |",
    "|---|---:|",
    ...Object.entries(input.byNetwork)
      .sort((a, b) => b[1] - a[1])
      .map(([network, count]) => `| ${network} | ${count} |`),
    "",
    "## By Category",
    "",
    "| Category | Processed | With socials |",
    "|---|---:|---:|",
    ...Object.entries(input.byCategory)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([category, stats]) => `| ${category} | ${stats.processed} | ${stats.withSocials} |`),
    "",
    "## Image Candidates",
    "",
    `- Candidates found: ${input.candidatesFound}`,
    `- Without images found: ${input.withoutImages}`,
    "",
    "| Method | Count |",
    "|---|---:|",
    ...Object.entries(input.byMethod).map(([method, count]) => `| ${method} | ${count} |`),
    "",
    "## Businesses With Social Profiles Found",
    "",
    ...(
      input.foundSocials.length
        ? input.foundSocials.map((item) => `- ${item.name} (${item.slug}) - ${item.category ?? "unknown"} - ${formatSocialProfiles(item.profiles)}`)
        : ["- None"]
    ),
    "",
    "## Businesses Without Official Website In Selection",
    "",
    ...(
      input.skippedWithoutOfficialWebsite.length
        ? input.skippedWithoutOfficialWebsite.map((item) => `- ${item.name} (${item.slug}) - ${item.category ?? "unknown"} - website_type=${item.websiteType ?? "-"}`)
        : ["- None"]
    ),
    "",
    "## Errors",
    "",
    ...(
      input.errors.length
        ? input.errors.map((item) => `- ${item.name} (${item.slug}) - ${item.message}`)
        : ["- None"]
    ),
    "",
    "## Image Examples",
    "",
    ...(
      input.examples.length
        ? input.examples.flatMap((example) => [
            `- ${example.name} - ${example.website}`,
            ...example.candidates.map((candidate) => `  - ${candidate.method}/${candidate.confidence}: ${candidate.url} (${candidate.reason})`)
          ])
        : ["- None"]
    )
  ];

  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
  return path;
}

async function main() {
  loadLocalEnv();
  const options = parseArgs();
  const supabase = createSupabaseClient();

  let query = supabase
    .from("businesses")
    .select("id,slug,name,display_name,category,website,website_type,image_candidate_urls,social_profiles")
    .in("status", ["published", "premium"])
    .not("website", "is", null)
    .order("authority_score", { ascending: false, nullsFirst: false });

  if (options.category) query = query.eq("category", options.category);
  if (options.only) query = query.eq("slug", options.only);

  const { data, error } = await query.limit(1000);

  if (error) {
    throw new Error(`Cannot read businesses. Apply supabase/migrations/009_business_image_candidates.sql and social_profiles migration first if fields are missing. Details: ${error.message}`);
  }

  const selectedRows = ((data ?? []) as BusinessCandidateRow[])
    .filter((business) => !options.onlyMissing || isEmptySocialProfiles(business.social_profiles))
    .slice(0, options.limit ?? undefined);

  if (!options.dryRun && selectedRows.length > 100 && !options.yes) {
    throw new Error(`Refusing to visit ${selectedRows.length} websites without --yes. Re-run with --dry-run first, then add --yes when ready.`);
  }

  let processed = 0;
  let updatedImages = 0;
  let updatedSocials = 0;
  let candidatesFound = 0;
  let withoutImages = 0;
  let withoutSocials = 0;
  let blocked = 0;
  const errors: Array<{ name: string; slug: string; message: string }> = [];
  const byMethod: Record<ExtractionMethod, number> = { meta: 0, img: 0, srcset: 0, background: 0 };
  const byNetwork: Record<string, number> = {};
  const byCategory: Record<string, { processed: number; withSocials: number }> = {};
  const examples: Array<{ name: string; website: string; candidates: Array<{ url: string; method: string; confidence: string; reason: string }> }> = [];
  const foundSocials: Array<{ name: string; slug: string; category: string | null; profiles: SocialProfiles }> = [];
  const skippedWithoutOfficialWebsite: Array<{ name: string; slug: string; category: string | null; websiteType: string | null }> = [];

  if (options.dryRun) {
    for (const business of selectedRows) {
      console.log(`${business.display_name || business.name} (${business.slug}) - ${business.category ?? "unknown"} - ${business.website}`);
    }
  }

  for (const business of selectedRows) {
    processed += 1;
    const name = business.display_name || business.name;
    const category = business.category ?? "unknown";
    byCategory[category] = byCategory[category] ?? { processed: 0, withSocials: 0 };
    byCategory[category].processed += 1;

    const website = business.website ? normalizeWebsiteUrl(business.website) : null;
    if (!website) {
      withoutImages += 1;
      withoutSocials += 1;
      continue;
    }

    try {
      const directProfiles = directSocialProfile(website, business.website_type);
      const isOfficialWebsite = business.website_type === "official_website";
      if (!isOfficialWebsite && Object.keys(directProfiles).length === 0) {
        skippedWithoutOfficialWebsite.push({ name, slug: business.slug, category: business.category, websiteType: business.website_type });
      }

      if (options.dryRun) continue;

      const pages = isOfficialWebsite ? await fetchCandidatePages(website) : [];
      if (pages.some((page) => page.blocked)) blocked += 1;

      const foundImages = isOfficialWebsite
        ? dedupeAndRankCandidates(
            pages.flatMap((page) => page.html ? extractImageCandidates(page.html, page.finalUrl) : [])
          ).slice(0, 8)
        : [];
      const foundProfiles = pages.reduce<SocialProfiles>((profiles, page) => {
        if (!page.html) return profiles;
        const extracted = extractSocialProfiles(page.html, page.finalUrl);
        for (const [key, value] of Object.entries(extracted)) {
          if (value) setBestSocialProfile(profiles, { key: key as SocialKey, url: value });
        }
        return profiles;
      }, { ...directProfiles });

      if (foundImages.length === 0) {
        withoutImages += 1;
      }

      const { merged: mergedProfiles, added, removed } = mergeSocialProfiles(business.social_profiles, foundProfiles);
      const hasNewSocials = Object.keys(added).length > 0;
      const hasSocialProfileChanges = hasNewSocials || removed > 0;
      if (!hasNewSocials) withoutSocials += 1;

      const updatePayload: { image_candidate_urls?: ImageCandidate[]; social_profiles?: SocialProfiles } = {};
      if (foundImages.length > 0) updatePayload.image_candidate_urls = mergeCandidates(business.image_candidate_urls, foundImages);
      if (hasSocialProfileChanges) updatePayload.social_profiles = mergedProfiles;

      if (Object.keys(updatePayload).length > 0) {
        const { error: updateError } = await supabase
          .from("businesses")
          .update(updatePayload)
          .eq("id", business.id);

        if (updateError) throw updateError;
      }

      if (foundImages.length > 0) {
        updatedImages += 1;
        candidatesFound += foundImages.length;
        for (const candidate of foundImages) byMethod[candidate.extractionMethod] += 1;
      }

      if (hasSocialProfileChanges) {
        updatedSocials += 1;
      }

      if (hasNewSocials) {
        byCategory[category].withSocials += 1;
        foundSocials.push({ name, slug: business.slug, category: business.category, profiles: added });
        for (const key of Object.keys(added)) incrementRecord(byNetwork, key);
      }

      if (examples.length < 10) {
        examples.push({
          name,
          website,
          candidates: foundImages.slice(0, 3).map((candidate) => ({
            url: candidate.url,
            method: candidate.extractionMethod,
            confidence: candidate.confidence,
            reason: candidate.reason
          }))
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push({ name, slug: business.slug, message });
      console.error(`Error with ${name}:`, message);
    }
  }

  const reportPath = writeCoverageReport({
    blocked,
    byCategory,
    byMethod,
    byNetwork,
    candidatesFound,
    dryRun: options.dryRun,
    errors,
    examples,
    foundSocials,
    options,
    processed,
    selected: selectedRows.length,
    skippedWithoutOfficialWebsite,
    updatedImages,
    updatedSocials,
    withoutImages,
    withoutSocials
  });

  console.log(JSON.stringify({
    selected: selectedRows.length,
    processed,
    updated_social_profiles: updatedSocials,
    updated_image_candidates: updatedImages,
    candidates_found: candidatesFound,
    socials_by_network: byNetwork,
    blocked,
    without_images: withoutImages,
    without_socials: withoutSocials,
    errors: errors.length,
    report: reportPath
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
