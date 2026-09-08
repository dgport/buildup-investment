"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ROUTES } from "@/lib/constants/routes";
import { CONTACT_EMAIL, CONTACT_PHONE } from "@/lib/constants/contact";

export default function Footer() {
  const t = useTranslations("common");
  const pathname = usePathname();

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const quickLinks = [
    { path: ROUTES.HOME, label: t("nav.home") },
    { path: ROUTES.PROPERTIES, label: t("nav.properties") },
    { path: ROUTES.CONTACT, label: t("nav.contact") },
  ];

  return (
    <footer className="w-full bg-teal-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:32px_32px]" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-14">
          <div className="lg:col-span-4 space-y-6">
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-3 group w-fit"
            >
              <Image
                src="/Logo.png"
                width={56}
                height={56}
                className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
                alt={t("brand")}
              />
              <div className="flex flex-col">
                <span className="text-base font-bold text-amber-400 leading-tight tracking-wide">
                  {t("brand")}
                </span>
                <span className="text-[10px] font-semibold text-amber-100/50 tracking-[0.25em] uppercase">
                  {t("tagline")}
                </span>
              </div>
            </Link>

            <p className="text-sm text-amber-100/50 leading-relaxed max-w-xs">
              {t("footer.description")}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-amber-400/15" />
              <span className="text-[10px] text-amber-400/40 tracking-widest font-medium uppercase">
                {t("footer.est")}
              </span>
              <div className="h-px flex-1 bg-amber-400/15" />
            </div>
          </div>

          <div className="lg:col-span-3 lg:pl-8">
            <h3 className="text-[11px] font-bold mb-6 text-amber-400/70 tracking-[0.2em] uppercase">
              {t("footer.navigation")}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className={`group/link text-sm inline-flex items-center gap-2 transition-all duration-300 ${
                      isActive(link.path)
                        ? "text-amber-400 font-semibold"
                        : "text-amber-100/60 hover:text-amber-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-px transition-all duration-300 ${isActive(link.path) ? "bg-amber-400 w-6" : "bg-amber-400/30 group-hover/link:bg-amber-400 group-hover/link:w-6"}`}
                    />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <h3 className="text-[11px] font-bold mb-6 text-amber-400/70 tracking-[0.2em] uppercase">
              {t("footer.getInTouch")}
            </h3>
            <div className="space-y-3">
              <a
                href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-amber-400/10 hover:border-amber-400/30 hover:bg-white/[0.06] transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-400/20 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-sm text-amber-100/70 group-hover:text-amber-200 transition-colors font-medium">
                  {CONTACT_PHONE}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400/0 group-hover:text-amber-400/60 ml-auto transition-all duration-300 -translate-x-1 group-hover:translate-x-0" />
              </a>

              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-amber-400/10 hover:border-amber-400/30 hover:bg-white/[0.06] transition-all duration-300 group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-400/20 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-sm text-amber-100/70 group-hover:text-amber-200 transition-colors font-medium break-all">
                  {CONTACT_EMAIL}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400/0 group-hover:text-amber-400/60 ml-auto transition-all duration-300 -translate-x-1 group-hover:translate-x-0 flex-shrink-0" />
              </a>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-amber-400/10">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <span className="text-sm text-amber-100/60 font-medium">
                  {t("footer.location")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-amber-400/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-amber-100/30 text-center md:text-left">
              © {new Date().getFullYear()} {t("brand")}. {t("footer.rights")}
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-amber-100/30">
                {t("footer.privacy")}
              </span>
              <div className="w-px h-3 bg-amber-400/20" />
              <span className="text-xs text-amber-100/30">
                {t("footer.terms")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
