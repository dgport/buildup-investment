import createMiddleware from "next-intl/middleware";
import { LOCALE_COOKIE, routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

/** Routes that need a signed-in user (checked via the accessToken cookie). */
const PROTECTED_PATTERNS = [
  /^\/dashboard(\/|$)/,
  /^\/properties\/new(\/|$)/,
  /^\/properties\/[^/]+\/edit(\/|$)/,
];
const AUTH_ROUTES = ["/signin", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip a locale prefix (if any) to get the real path
  const strippedPath = pathname.replace(/^\/(en|ka)(?=\/|$)/, "") || "/";
  const localePrefix = pathname.match(/^\/(en|ka)(?=\/|$)/)?.[0] ?? "";

  const token = request.cookies.get("accessToken")?.value;

  const isProtected = PROTECTED_PATTERNS.some((re) => re.test(strippedPath));
  const isAuthRoute = AUTH_ROUTES.some((r) => strippedPath.startsWith(r));

  if (isProtected && !token) {
    const url = new URL(`${localePrefix}/signin`, request.url);
    url.searchParams.set("next", strippedPath);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(
      new URL(`${localePrefix}/dashboard`, request.url),
    );
  }

  // Locale = explicit prefix (language switcher) → NEXT_LOCALE cookie →
  // default (Georgian). The browser's Accept-Language is deliberately ignored
  // so every first-time visitor lands on the Georgian site.
  if (!localePrefix && !request.cookies.has(LOCALE_COOKIE)) {
    const headers = new Headers(request.headers);
    headers.delete("accept-language");
    return intlMiddleware(new NextRequest(request, { headers }));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
