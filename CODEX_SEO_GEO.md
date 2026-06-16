# Codex Task: SEO/GEO Optimization Pass

## Context

Mallorca Verified (`mallorcaverified.com`) is an independent editorial guide to Mallorca built with Next.js 15 App Router. It ranks businesses across 14 categories using real Google data. The site targets Spanish, English, and German speakers.

SEO/GEO = traditional search engine optimization + Generative Engine Optimization (making content easily citeable by AI systems like ChatGPT, Perplexity, Google AI Overview).

Infrastructure already in place:
- `src/middleware.ts` — sets `x-locale` header for dynamic `<html lang>`
- `public/llms.txt` — feeds AI crawlers
- `src/app/robots.ts` — explicit allow for GPTBot, ClaudeBot, PerplexityBot
- `src/lib/seo.ts` — `generateSeoMetadata()` with canonical + hreflang
- `src/lib/schema.ts` — JSON-LD helpers (LocalBusiness, Article, FAQ, ItemList, BreadcrumbList)
- Root layout has Organization JSON-LD and AI meta tags
- Homepage has WebSite + SearchAction JSON-LD

---

## Task List

### 1. Meta descriptions — category index pages

Files: `src/app/[locale]/restaurants/page.tsx`, `hotels/page.tsx`, `beach-clubs/page.tsx`, `boats/page.tsx`, `activities/page.tsx`, `beaches/page.tsx`, `bars/page.tsx`, `cafes/page.tsx`, `bakeries/page.tsx`, `spas/page.tsx`, `gyms/page.tsx`, `rent-a-car/page.tsx`, `routes/page.tsx`, `excursions/page.tsx`

**Problem:** Many category pages likely have generic or templated `description` values that don't reflect what AI systems need to surface them.

**Fix:** For each category page, ensure the meta description:
- Is 140–160 characters
- Mentions "Mallorca" + the category name
- Includes a signal of trust ("datos reales de Google", "sin publicidad")
- Is unique per category (not templated)

Example for restaurants:
```
"Los mejores restaurantes en Mallorca según miles de reseñas reales de Google. Ranking objetivo por zona, tipo de cocina y precio. Sin publicidad."
```

---

### 2. Meta descriptions — business detail pages

File: `src/lib/page-content.tsx` — the `generateBusinessMetadata` function

**Problem:** Business detail meta descriptions may be generic.

**Fix:** Ensure the description template includes:
- Business name
- Category
- Location (city/area)
- Rating if available
- "Mallorca Verified" brand signal

Example:
```
"${businessName} — ${category} en ${location}, Mallorca. Valoración ${rating}/5 basada en ${reviews} reseñas verificadas. Ficha en Mallorca Verified."
```

---

### 3. `ItemList` JSON-LD on rankings page

File: `src/app/[locale]/rankings/page.tsx`

**Problem:** The rankings page shows a dynamic list of businesses filtered by category, but has no `ItemList` structured data. AI systems use this to understand ranked content.

**Fix:** After fetching `businesses` (top results), add JSON-LD:
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Mejores {category} en Mallorca",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Business Name", "url": "https://..." },
    ...
  ]
}
```
Limit to top 10 businesses for schema. Import `createItemListSchema` from `src/lib/schema.ts` or build inline. Use `JsonLd` component from `src/components/JsonLd.tsx`.

---

### 4. `speakable` schema on business detail pages

File: `src/lib/page-content.tsx`

**Problem:** Voice search and AI systems benefit from `speakable` markup identifying the most relevant text sections.

**Fix:** Add `speakable` property to the `LocalBusiness` schema (already built in `createLocalBusinessSchema`):
```json
"speakable": {
  "@type": "SpeakableSpecification",
  "cssSelector": ["h1", ".business-description", ".rating-summary"]
}
```

Add appropriate class names to the rendered HTML elements and update the schema.

---

### 5. `dateModified` on guide pages

File: `src/app/[locale]/guides/[slug]/page.tsx`

**Problem:** The `Article` schema for guides may not include `dateModified` and `datePublished`, which AI systems and Google use to assess freshness.

**Fix:** Ensure the Article schema includes:
- `datePublished`: use guide `createdAt` from Supabase
- `dateModified`: use guide `updatedAt` from Supabase
- `author`: `{ "@type": "Organization", "name": "Mallorca Verified" }`
- `publisher`: same Organization
- `inLanguage`: locale code

---

### 6. Category pages — add `CollectionPage` schema

Files: All category index pages (restaurants, hotels, etc.)

**Problem:** Category listing pages have no structured data.

**Fix:** Add `CollectionPage` schema:
```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Mejores restaurantes en Mallorca",
  "description": "...",
  "url": "https://mallorcaverified.com/es/restaurants",
  "inLanguage": "es"
}
```

---

### 7. `hreflang` robustness check

File: `src/lib/seo.ts`

**Problem:** The current `hreflang` implementation uses `path.replace(/${locale}/, /${item}/)` which breaks if the locale string appears elsewhere in the path (e.g., a business named "es-cafe").

**Fix:** Replace with:
```typescript
const localePath = `/${locale}/`;
const languages = Object.fromEntries(
  locales.map((item) => [item, `${siteUrl}${path.replace(localePath, `/${item}/`)}`])
);
```
Or better, split on first segment only:
```typescript
const withoutLocale = path.replace(new RegExp(`^/${locale}`), "");
locales.map((item) => [item, `${siteUrl}/${item}${withoutLocale}`])
```

---

### 8. Add `x-default` hreflang

File: `src/lib/seo.ts`

**Problem:** Missing `x-default` hreflang entry. Without it, Google doesn't know which URL to show to unmatched languages.

**Fix:** In `generateSeoMetadata`, add `x-default` pointing to the Spanish version:
```typescript
alternates: {
  canonical,
  languages: {
    ...existingLanguages,
    "x-default": `${siteUrl}${path.replace(`/${locale}`, "/es")}`
  }
}
```

---

### 9. `robots` meta for admin/private pages

Files: `src/app/admin/**/*.tsx`

**Problem:** Admin pages should not be indexed.

**Fix:** Add to admin layout or each admin page:
```typescript
export const metadata = {
  robots: { index: false, follow: false }
};
```

---

### 10. Image `alt` text audit for business images

File: `src/components/BusinessImage.tsx`

**Problem:** Images may have generic or empty `alt` attributes, missing the SEO/AI signal opportunity.

**Fix:** Ensure alt text includes:
- Business name
- Category
- Location

Format: `"${businessName} — ${categoryLabel} en ${location}, Mallorca"`

---

## Implementation notes

- Do NOT change ranking logic or business data
- Do NOT modify Supabase queries beyond adding fields needed for schema
- All JSON-LD must use the `JsonLd` component from `src/components/JsonLd.tsx`
- All meta must go through `generateSeoMetadata` in `src/lib/seo.ts` or Next.js `Metadata` API
- Keep TypeScript strict — no `any` unless already present in the codebase
- Test with `npx tsc --noEmit` after changes

## Files NOT to touch

- `src/middleware.ts` (already done)
- `src/app/layout.tsx` (already done)
- `src/app/robots.ts` (already done)
- `src/app/sitemap.ts` (already done)
- `public/llms.txt` (already done)
- `src/lib/schema.ts` locale fix (already done)
