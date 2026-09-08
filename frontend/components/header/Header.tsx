"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  locales,
  usePathname as useI18nPathname,
  useRouter as useI18nRouter,
  type Locale,
} from "@/i18n/routing";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCurrentUser, useLogout } from "@/lib/hooks/useAuth";
import { ROUTES } from "@/lib/constants/routes";

const LanguageFlags: Record<Locale, { src: string; alt: string }> = {
  en: { src: "/svg/English.svg", alt: "English" },
  ka: { src: "/svg/Georgian.svg", alt: "ქართული" },
};

function LocaleSwitcher() {
  const router = useI18nRouter();
  const pathname = useI18nPathname();
  const currentLocale = useLocale() as Locale;
  const t = useTranslations("common.language");

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    // With localePrefix "never" next-intl navigates to /<locale>/<path>; the
    // middleware stores the choice in the NEXT_LOCALE cookie and redirects back
    // to the unprefixed URL, re-rendering everything in the new language.
    router.replace(pathname, { locale: newLocale });
  };

  const currentFlag = LanguageFlags[currentLocale];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-white group transition-all duration-300 h-10 px-3"
          aria-label={t(currentLocale)}
        >
          <Image
            src={currentFlag.src}
            alt={currentFlag.alt}
            width={20}
            height={20}
            className="rounded-sm object-cover h-5 w-5"
          />
          <span className="font-semibold uppercase tracking-wider hidden sm:inline-block text-sm text-amber-100">
            {currentLocale}
          </span>
          <ChevronDown className="opacity-50 group-hover:opacity-100 transition-opacity h-3 w-3 text-amber-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="p-1.5 border-amber-400/20 bg-teal-950/98 backdrop-blur-xl text-white shadow-2xl rounded-2xl z-[60] w-40"
      >
        <div className="grid gap-1">
          {locales.map((locale) => {
            const flag = LanguageFlags[locale];
            const isActive = locale === currentLocale;
            return (
              <Button
                key={locale}
                variant="ghost"
                className={cn(
                  "justify-start gap-3 w-full rounded-xl hover:bg-amber-400/10 hover:text-amber-300 transition-all text-sm py-2",
                  isActive && "bg-amber-400/10 text-amber-400",
                )}
                onClick={() => handleLocaleChange(locale)}
              >
                <Image
                  src={flag.src}
                  alt={flag.alt}
                  width={20}
                  height={20}
                  className="rounded-sm h-5 w-5"
                />
                <span className="font-medium text-sm">{t(locale)}</span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function useSignOut() {
  const signOutMutation = useLogout();
  const router = useRouter();

  const signOut = () =>
    signOutMutation.mutate(undefined, {
      onSettled: () => {
        router.push(ROUTES.HOME);
        router.refresh();
      },
    });

  return { signOut, isPending: signOutMutation.isPending };
}

function ProfileDropdown() {
  const t = useTranslations("common.nav");
  const { data: user } = useCurrentUser();
  const { signOut, isPending } = useSignOut();

  const initials =
    user?.firstname && user?.lastname
      ? `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()
      : "U";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-white group transition-all duration-300 h-10 px-2">
          <div className="h-6 w-6 rounded-lg bg-amber-400 flex items-center justify-center">
            <span className="text-[10px] font-bold text-teal-950">
              {initials}
            </span>
          </div>
          <span className="hidden sm:block text-sm font-semibold text-amber-100 max-w-[100px] truncate">
            {user?.firstname}
          </span>
          <ChevronDown className="opacity-50 group-hover:opacity-100 transition-opacity h-3 w-3 text-amber-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="p-1.5 border-amber-400/20 bg-teal-950/98 backdrop-blur-xl text-white shadow-2xl rounded-2xl z-[60] w-52"
      >
        <div className="px-3 py-2 mb-1 border-b border-amber-400/10">
          <p className="text-sm font-semibold text-amber-100 truncate">
            {user?.firstname} {user?.lastname}
          </p>
          <p className="text-xs text-amber-100/40 truncate">{user?.email}</p>
        </div>

        <div className="grid gap-1 mt-1">
          <Button
            variant="ghost"
            className="justify-start gap-3 w-full rounded-xl hover:bg-amber-400/10 hover:text-amber-300 transition-all text-sm py-2"
            asChild
          >
            <Link href={ROUTES.DASHBOARD}>
              <LayoutDashboard className="h-4 w-4 text-amber-400/70" />
              {t("dashboard")}
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-3 w-full rounded-xl hover:bg-amber-400/10 hover:text-amber-300 transition-all text-sm py-2"
            asChild
          >
            <Link href={ROUTES.PROPERTY_NEW}>
              <Plus className="h-4 w-4 text-amber-400/70" />
              {t("addProperty")}
            </Link>
          </Button>

          {user?.role === "ADMIN" && (
            <Button
              variant="ghost"
              className="justify-start gap-3 w-full rounded-xl hover:bg-amber-400/10 hover:text-amber-300 transition-all text-sm py-2"
              asChild
            >
              <Link href={ROUTES.ADMIN_PROJECTS}>
                <ShieldCheck className="h-4 w-4 text-amber-400/70" />
                {t("admin")}
              </Link>
            </Button>
          )}

          <Button
            variant="ghost"
            className="justify-start gap-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-sm py-2"
            onClick={signOut}
            disabled={isPending}
          >
            <LogOut className="h-4 w-4 text-red-400/70" />
            {t("signout")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AuthButtons() {
  const t = useTranslations("common.nav");
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-amber-100/80 hover:text-amber-300 hover:bg-white/[0.06] font-semibold rounded-xl h-10 px-4"
        asChild
      >
        <Link href={ROUTES.SIGNIN}>{t("signin")}</Link>
      </Button>
      <Button
        size="sm"
        className="bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold rounded-xl h-10 px-4 shadow-md shadow-amber-400/20 transition-all duration-200"
        asChild
      >
        <Link href={ROUTES.SIGNUP}>{t("signup")}</Link>
      </Button>
    </div>
  );
}

const MAIN_PAGE_PATHS = ["/", "/en", "/ka"];

export default function Header() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: user, isLoading: authLoading } = useCurrentUser();
  const { signOut, isPending: signingOut } = useSignOut();

  const navItems = [
    { href: ROUTES.HOME, label: t("nav.home") },
    { href: ROUTES.PROPERTIES, label: t("nav.properties") },
    { href: ROUTES.PROJECTS, label: t("nav.projects") },
    { href: ROUTES.CONTACT, label: t("nav.contact") },
  ];

  const isMainPage = MAIN_PAGE_PATHS.some(
    (p) => pathname === p || pathname === p + "/",
  );

  // Close the mobile menu whenever the route changes ("adjust state during render")
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    if (!isMainPage) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMainPage]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const headerBg = isMainPage
    ? scrolled
      ? "bg-teal-950/95 backdrop-blur-md border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      : "bg-transparent"
    : "bg-teal-950 border-b border-amber-400/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]";

  return (
    <header
      className={cn(
        "left-0 right-0 z-50 transition-all duration-300",
        isMainPage ? "fixed top-0" : "sticky top-0",
        headerBg,
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      <div className="px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24">
        <div className="flex h-20 lg:h-24 items-center justify-between gap-4">
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-3 lg:gap-4 shrink-0 group"
          >
            <Image
              src="/Logo.png"
              alt={t("brand")}
              width={80}
              height={80}
              priority
              className="h-14 lg:h-20 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-base lg:text-lg font-bold text-amber-400 leading-tight tracking-wide">
                {t("brand")}
              </span>
              <span className="text-[10px] lg:text-[11px] font-semibold text-amber-100/50 tracking-[0.25em] uppercase">
                {t("tagline")}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center">
            {navItems.map((item, i) => (
              <div key={item.href} className="flex items-center">
                {i > 0 && <div className="w-px h-4 bg-amber-400/20 mx-1" />}
                <Link
                  href={item.href}
                  className={cn(
                    "relative px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-300 group/nav",
                    isActive(item.href)
                      ? "text-teal-950 bg-amber-400 shadow-md shadow-amber-400/20"
                      : "text-white hover:text-amber-300 hover:bg-white/[0.08]",
                  )}
                >
                  {item.label}
                  {!isActive(item.href) && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-px w-0 bg-amber-400/60 rounded-full transition-all duration-300 group-hover/nav:w-[calc(100%-2.5rem)]" />
                  )}
                </Link>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3">
              <LocaleSwitcher />
              {!authLoading && (user ? <ProfileDropdown /> : <AuthButtons />)}
            </div>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 text-amber-400 hover:bg-white/[0.06] rounded-lg transition-colors border border-amber-400/20"
              aria-label={t("nav.toggleMenu")}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 bg-teal-950/98 backdrop-blur-md border-t border-amber-400/10",
          mobileOpen ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col p-4 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                isActive(item.href)
                  ? "text-teal-950 bg-amber-400"
                  : "text-amber-100/70 hover:bg-white/[0.06] hover:text-amber-300",
              )}
            >
              <span
                className={cn(
                  "w-4 h-px transition-all duration-300",
                  isActive(item.href) ? "bg-teal-950" : "bg-amber-400/40",
                )}
              />
              {item.label}
            </Link>
          ))}

          {!authLoading && (
            <div className="mt-2 pt-2 border-t border-amber-400/10 flex flex-col gap-1">
              {user ? (
                <>
                  <div className="px-4 py-2">
                    <p className="text-sm font-semibold text-amber-100">
                      {user.firstname} {user.lastname}
                    </p>
                    <p className="text-xs text-amber-100/40">{user.email}</p>
                  </div>
                  <Link
                    href={ROUTES.DASHBOARD}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-100/70 hover:bg-white/[0.06] hover:text-amber-300 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4 text-amber-400/70" />
                    {t("nav.dashboard")}
                  </Link>
                  <Link
                    href={ROUTES.PROPERTY_NEW}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-100/70 hover:bg-white/[0.06] hover:text-amber-300 transition-all"
                  >
                    <Plus className="h-4 w-4 text-amber-400/70" />
                    {t("nav.addProperty")}
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link
                      href={ROUTES.ADMIN_PROJECTS}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-100/70 hover:bg-white/[0.06] hover:text-amber-300 transition-all"
                    >
                      <ShieldCheck className="h-4 w-4 text-amber-400/70" />
                      {t("nav.admin")}
                    </Link>
                  )}
                  <button
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all text-left"
                    onClick={signOut}
                    disabled={signingOut}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("nav.signout")}
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-2">
                  <Link
                    href={ROUTES.SIGNIN}
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-amber-100/80 border border-amber-400/20 hover:bg-white/[0.06] transition-all"
                  >
                    {t("nav.signin")}
                  </Link>
                  <Link
                    href={ROUTES.SIGNUP}
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-300 text-teal-950 transition-all"
                  >
                    {t("nav.signup")}
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="mt-2 pt-2 border-t border-amber-400/10">
            <LocaleSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
