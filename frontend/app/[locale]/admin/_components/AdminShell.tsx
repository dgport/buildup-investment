"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  ArrowLeft,
  Building2,
  Factory,
  Home,
  Inbox,
  LayoutDashboard,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useCurrentUser, useHasToken } from "@/lib/hooks/useAuth";
import { useAdminStats } from "@/lib/hooks/useAdmin";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";

/** Client-side role gate + sidebar for every /admin page (the API enforces it too). */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();
  const hasToken = useHasToken();
  const { data: user, isLoading } = useCurrentUser();
  const isAdmin = user?.role === "ADMIN";
  const { data: stats } = useAdminStats(isAdmin ? locale : undefined);

  const items = [
    { href: ROUTES.ADMIN, label: t("nav.overview"), icon: LayoutDashboard, exact: true },
    { href: ROUTES.ADMIN_LISTINGS, label: t("nav.listings"), icon: Home, badge: stats?.properties.pending },
    { href: ROUTES.ADMIN_PROJECTS, label: t("nav.projects"), icon: Building2 },
    { href: ROUTES.ADMIN_DEVELOPERS, label: t("nav.developers"), icon: Factory },
    { href: ROUTES.ADMIN_LEADS, label: t("nav.leads"), icon: Inbox, badge: stats?.leads.new },
    { href: ROUTES.ADMIN_USERS, label: t("nav.users"), icon: Users },
    { href: ROUTES.ADMIN_SETTINGS, label: t("nav.settings"), icon: Settings },
  ];

  if (hasToken && isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-800" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-14 h-14 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-teal-950 mb-2">{t("forbidden")}</h1>
          <Link href={ROUTES.HOME} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-amber-600 mt-4">
            <ArrowLeft className="w-4 h-4" />
            {t("nav.backToSite")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[230px_1fr] gap-6">
        <aside className="lg:sticky lg:top-24 self-start">
          <div className="hidden lg:flex items-center gap-2 px-3 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700/60">{t("title")}</p>
          </div>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
            {items.map(({ href, label, icon: Icon, badge, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition",
                    active ? "bg-teal-900 text-white shadow" : "text-teal-900 hover:bg-white",
                  )}
                >
                  <Icon className={cn("w-4 h-4", active ? "text-amber-400" : "text-teal-600")} />
                  {label}
                  {!!badge && (
                    <span
                      className={cn(
                        "ml-auto min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center tabular-nums",
                        active ? "bg-amber-400 text-teal-950" : "bg-amber-100 text-amber-800",
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <Link
            href={ROUTES.HOME}
            className="hidden lg:inline-flex items-center gap-2 px-3 mt-4 text-xs font-medium text-slate-500 hover:text-teal-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("nav.backToSite")}
          </Link>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
