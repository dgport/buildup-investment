import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  ...routing,
  localeDetection: true,
});

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/signin", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to get the real path
  const strippedPath = pathname.replace(/^\/(en|ka)/, "") || "/";
  const locale = pathname.match(/^\/(en|ka)/)?.[1] || routing.defaultLocale;

  const token = request.cookies.get("accessToken")?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => strippedPath.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => strippedPath.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL(`/${locale}/signin`, request.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Let next-intl handle everything else (locale detection, redirects, etc.)
  return intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
