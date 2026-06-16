import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["es", "en", "de"];

export function middleware(request: NextRequest) {
  const segments = request.nextUrl.pathname.split("/");
  const candidate = segments[1] ?? "";
  const locale = LOCALES.includes(candidate) ? candidate : "es";
  const response = NextResponse.next();
  response.headers.set("x-locale", locale);
  return response;
}

export const config = {
  matcher: ["/((?!_next|_vercel|api|favicon\\.ico|robots\\.txt|sitemap\\.xml|llms\\.txt).*)"]
};
