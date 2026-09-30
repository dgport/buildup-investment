"use client";

import { Link } from "@/i18n/routing";
import { PageLoader } from "@/components/shared/PageLoader";
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
  ArrowUpRight,
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
    return <PageLoader />;
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
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-teal-950">{t("title")}</p>
          <p className="text-sm text-slate-500 break-words">{user.firstname} {user.lastname}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={ROUTES.DASHBOARD} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-teal-900 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-600">
            <LayoutDashboard className="h-4 w-4" />{t("nav.dashboard")}
          </Link>
          <Link href={ROUTES.HOME} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-900 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
            {t("nav.backToSite")}<ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)] gap-6 lg:gap-8">
        <aside className="lg:sticky lg:top-6 self-start min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="hidden lg:flex items-center gap-2 px-3 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-700/60">{t("title")}</p>
          </div>
          <nav aria-label={t("title")} className="flex lg:flex-col gap-1 overflow-x-auto pb-1 lg:pb-0">
            {items.map(({ href, label, icon: Icon, badge, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 shrink-0 items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-teal-600",
                    active ? "bg-teal-900 text-white shadow-sm" : "text-teal-900 hover:bg-slate-100",
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
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
