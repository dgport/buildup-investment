"use client";

import { Home, Search, Heart, PlusCircle, UserRound, LayoutDashboard, Inbox, Users, ArrowUpRight } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useHasToken } from "@/lib/hooks/useAuth";

/** Thumb-reachable navigation. Editors and authentication keep their focused layout. */
export function MobileNavigation() {
  const pathname = usePathname();
  const t = useTranslations("common.mobileNav");
  const hasToken = useHasToken();
  const admin = pathname === "/admin" || pathname.startsWith("/admin/");
  if (/\/(new|edit)$/.test(pathname) || /^\/(signin|signup|forgot-password|reset-password|verify-email|google-auth-success|google-auth-error)(\/|$)/.test(pathname)) return null;
  const items = admin ? [
    { href: "/admin", label: "overview", icon: LayoutDashboard },
    { href: "/admin/listings", label: "listings", icon: Home },
    { href: "/admin/leads", label: "requests", icon: Inbox },
    { href: "/admin/users", label: "users", icon: Users },
    { href: "/", label: "site", icon: ArrowUpRight },
  ] : [
    { href: "/", label: "home", icon: Home },
    { href: "/properties", label: "search", icon: Search },
    { href: "/properties/new", label: "add", icon: PlusCircle },
    { href: "/saved", label: "saved", icon: Heart },
    { href: hasToken ? "/dashboard" : "/signin", label: "account", icon: UserRound },
  ];
  return (
    <nav data-mobile-navigation aria-label={t("navigation")} className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-teal-900/10 bg-white/95 backdrop-blur-xl shadow-[0_-4px_24px_rgb(4_47_46/0.08)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 mx-auto max-w-xl px-1">
        {items.map(({href,label,icon:Icon}) => {
          const active = pathname === href || (href !== "/" && href !== "/admin" && pathname.startsWith(`${href}/`));
          return <Link key={label} href={href} aria-current={active ? "page" : undefined} className={cn("min-w-0 min-h-16 flex flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-2 text-[10px] sm:text-[11px] text-center leading-4 font-semibold transition-colors active:bg-teal-50",active ? "text-teal-950" : "text-slate-500")}>
            <span className={cn("flex h-7 w-12 items-center justify-center rounded-full", active && "bg-teal-100", label === "add" && "bg-amber-400 text-teal-950")}><Icon className="size-5" aria-hidden /></span>
            <span className="max-w-full whitespace-nowrap">{t(label)}</span>
          </Link>;
        })}
      </div>
    </nav>
  );
}
