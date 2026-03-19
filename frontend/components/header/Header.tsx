"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  locales,
  usePathname as useI18nPathname,
  useRouter,
} from "@/i18n/routing";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useLogout } from "@/lib/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

type Locale = "en" | "ka";

const LanguageFlags: Record<Locale, { src: string; alt: string }> = {
  en: { src: "/svg/English.svg", alt: "English" },
  ka: { src: "/svg/Georgian.svg", alt: "Georgian" },
};

const languageNames: Record<Locale, string> = {
  en: "English",
  ka: "ქართული",
};

function LocaleSwitcher() {
  const router = useRouter();
  const pathname = useI18nPathname();
  const currentLocale = useLocale() as Locale;

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    router.push(pathname, { locale: newLocale });
  };

  const currentFlag = LanguageFlags[currentLocale];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-white group transition-all duration-300 h-10 px-3">
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
          {(locales as unknown as Locale[]).map((locale) => {
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
                <span className="font-medium text-sm">
                  {languageNames[locale]}
                </span>
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ProfileDropdown() {
  const { data: user } = useCurrentUser();
  const signOutMutation = useLogout();
  const router = useRouter();
  const queryClient = useQueryClient();

  const initials =
    user?.firstname && user?.lastname
      ? `${user.firstname[0]}${user.lastname[0]}`.toUpperCase()
      : "U";

  const handleSignOut = () => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        // Invalidate all auth queries to force re-evaluation
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        router.push("/");
        router.refresh();
      },
    });
  };

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
        className="p-1.5 border-amber-400/20 bg-teal-950/98 backdrop-blur-xl text-white shadow-2xl rounded-2xl z-[60] w-44"
      >
        {/* User info header */}
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
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4 text-amber-400/70" />
              Dashboard
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="justify-start gap-3 w-full rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all text-sm py-2"
            onClick={handleSignOut}
            disabled={signOutMutation.isPending}
          >
            <LogOut className="h-4 w-4 text-red-400/70" />
            Sign Out
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-amber-100/80 hover:text-amber-300 hover:bg-white/[0.06] font-semibold rounded-xl h-10 px-4"
        asChild
      >
        <Link href="/signin">Sign In</Link>
      </Button>
      <Button
        size="sm"
        className="bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold rounded-xl h-10 px-4 shadow-md shadow-amber-400/20 transition-all duration-200"
        asChild
      >
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );
}

const navItems = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "All Property" },
  { href: "/contact", label: "Contact" },
];

const MAIN_PAGE_LOCALES = ["/", "/en", "/ka"];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: user, isLoading: authLoading } = useCurrentUser();
  const signOutMutation = useLogout();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Detect if we're on the homepage (accounting for locale prefixes)
  const isMainPage = MAIN_PAGE_LOCALES.some(
    (p) => pathname === p || pathname === p + "/",
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMainPage) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMainPage]);

  const isActive = (href: string) => pathname === href;

  const handleMobileSignOut = () => {
    signOutMutation.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["auth"] });
        router.push("/");
        router.refresh();
      },
    });
  };

  // On non-main pages: always solid opaque teal
  // On main page: transparent until scrolled
  const headerBg = isMainPage
    ? scrolled
      ? "bg-teal-950/95 backdrop-blur-md border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      : "bg-transparent"
    : "bg-teal-950 border-b border-amber-400/10 shadow-[0_4px_24px_rgba(0,0,0,0.3)]";

  return (
    <header
      className={cn(
        "left-0 right-0 z-50 transition-all duration-300",
        isMainPage ? "fixed top-0" : "block",
        headerBg,
      )}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      <div className="px-6 md:px-12 lg:px-16 xl:px-24">
        <div className="flex h-24 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 shrink-0 group">
            <img
              src="/Logo.png"
              alt="Build Up Investment"
              className="h-20 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-amber-400 leading-tight tracking-wide">
                Build Up Investment
              </span>
              <span className="text-[11px] font-semibold text-amber-100/50 tracking-[0.25em] uppercase">
                Strategic Growth Partners
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
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

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3">
              <LocaleSwitcher />
              {!authLoading && (user ? <ProfileDropdown /> : <AuthButtons />)}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 text-amber-400 hover:bg-white/[0.06] rounded-lg transition-colors border border-amber-400/20"
              aria-label="Toggle menu"
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
          mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0",
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

          {/* Mobile auth */}
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
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-amber-100/70 hover:bg-white/[0.06] hover:text-amber-300 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4 text-amber-400/70" />
                    Dashboard
                  </Link>
                  <button
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all text-left"
                    onClick={handleMobileSignOut}
                    disabled={signOutMutation.isPending}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-2">
                  <Link
                    href="/signin"
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-amber-100/80 border border-amber-400/20 hover:bg-white/[0.06] transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold bg-amber-400 hover:bg-amber-300 text-teal-950 transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Locale switcher */}
          <div className="mt-2 pt-2 border-t border-amber-400/10">
            <LocaleSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
