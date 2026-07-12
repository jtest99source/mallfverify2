import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["es", "en", "de"];

// Deprecated category listing pages (the old CategoryFilter UI). The live ranking
// lives at /{locale}/top/{category}; permanently redirect the old index URLs
// there. Detail pages /{locale}/{category}/{slug} keep working — they have an
// extra slug segment and don't match the length check below.
const RANKING_CATEGORIES = new Set([
  "restaurants", "hotels", "beach-clubs", "bars", "cafes", "bakeries", "nightlife",
  "activities", "boats", "rent-a-car", "car-dealers", "spas", "gyms", "casinos",
  "vets", "healthcare", "dentists", "aesthetic-clinics", "real-estate", "lawyers", "tax-advisors"
]);

export function middleware(request: NextRequest) {
  const segments = request.nextUrl.pathname.replace(/\/$/, "").split("/");
  const candidate = segments[1] ?? "";
  const locale = LOCALES.includes(candidate) ? candidate : "en";

  if (LOCALES.includes(candidate) && segments.length === 3 && RANKING_CATEGORIES.has(segments[2])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${candidate}/top/${segments[2]}`;
    return NextResponse.redirect(url, 308);
  }

  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
  return response;
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|favicon\\.ico|robots\\.txt|sitemap\\.xml|llms\\.txt).*)"]
};
