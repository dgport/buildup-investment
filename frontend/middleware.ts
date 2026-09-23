import createMiddleware from "next-intl/middleware";
import { LOCALE_COOKIE, routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { IS_RENT_SITE, RENT_URL, SALES_URL, propertySiteUrl } from "./lib/market";
import { API_BASE_URL } from "./lib/constants/env";

const intlMiddleware = createMiddleware(routing);

/** Routes that need a signed-in user (checked via the accessToken cookie). */
const PROTECTED_PATTERNS = [
  /^\/dashboard(\/|$)/,
  /^\/admin(\/|$)/,
  /^\/properties\/new(\/|$)/,
  /^\/properties\/[^/]+\/edit(\/|$)/,
];
const AUTH_ROUTES = ["/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip a locale prefix (if any) to get the real path
  const strippedPath = pathname.replace(/^\/(en|ka)(?=\/|$)/, "") || "/";
  const localePrefix = pathname.match(/^\/(en|ka)(?=\/|$)/)?.[0] ?? "";

  // Account management stays on one origin; both catalogues share the API.
  const centralRoute = /^\/(admin|dashboard|signin|signup|forgot-password|reset-password|verify-email|google-auth-success|google-auth-error|projects|developers|contact|listing-terms|privacy|terms)(\/|$)/.test(strippedPath)
    || /^\/properties\/(new|[^/]+\/edit)(\/|$)/.test(strippedPath);
  const deal = request.nextUrl.searchParams.get("dealType");
  const wrongCatalogue = strippedPath === "/properties" &&
    (IS_RENT_SITE ? deal === "SALE" : deal === "RENT" || deal === "DAILY_RENT");
  if ((IS_RENT_SITE && centralRoute) || wrongCatalogue) {
    const origin = IS_RENT_SITE ? SALES_URL : RENT_URL;
    return NextResponse.redirect(new URL(`${pathname}${request.nextUrl.search}`, origin), 308);
  }

  const detailId = strippedPath.match(/^\/properties\/([^/]+)\/?$/)?.[1];
  if (detailId && detailId !== "new") {
    try {
      const response = await fetch(`${API_BASE_URL}/properties/${encodeURIComponent(detailId)}`, {
        signal: AbortSignal.timeout(5000), cache: "no-store",
      });
      if (response.ok) {
        const property = await response.json() as { id: string; dealType: string };
        if ((property.dealType !== "SALE") !== IS_RENT_SITE) {
          const destination = new URL(propertySiteUrl(property));
          destination.pathname = `${localePrefix}${destination.pathname}`;
          destination.search = request.nextUrl.search;
          return NextResponse.redirect(destination, 308);
        }
      }
    } catch {
      // The detail page owns API error handling and repeats the market check.
    }
  }

  const token = request.cookies.get("accessToken")?.value;

  const isProtected = PROTECTED_PATTERNS.some((re) => re.test(strippedPath));
  const isAuthRoute = AUTH_ROUTES.some((r) => strippedPath.startsWith(r));

  if (isProtected && !token) {
    const url = new URL(`${localePrefix}/signin`, request.url);
    url.searchParams.set("next", `${strippedPath}${request.nextUrl.search}`);
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
