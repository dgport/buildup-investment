"use client";

import { Phone, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { usePathname } from "next/navigation";

const CONTACT_PHONE = "+995 000 00 00 00";
const CONTACT_EMAIL = "digitalport@gmail.com";

export default function Footer() {
  const pathname = usePathname();
  const isAdminPath = pathname.includes("/admin");
  if (isAdminPath) return null;

  const isActive = (path: string) => pathname === path;

  const quickLinks = [
    { path: "/", label: "Home", isComingSoon: false },
    { path: "/properties", label: "All property", isComingSoon: false },
    { path: "/contact", label: "Contact", isComingSoon: false },
  ];

  return (
    <footer className="w-full bg-teal-950 relative overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

      {/* Background texture */}
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:32px_32px]" />

      {/* Glow blob */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-14">
          {/* Brand col */}
          <div className="lg:col-span-4 space-y-6">
            <a href="/" className="flex items-center gap-3 group w-fit">
              <img
                src="/Logo.png"
                className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
                alt="Build Up Investment"
              />
              <div className="flex flex-col">
                <span className="text-base font-bold text-amber-400 leading-tight tracking-wide">
                  Build Up Investment
                </span>
                <span className="text-[10px] font-semibold text-amber-100/50 tracking-[0.25em] uppercase">
                  Strategic Growth Partners
                </span>
              </div>
            </a>

            <p className="text-sm text-amber-100/50 leading-relaxed max-w-xs">
              Empowering your investment journey with strategic insights and
              premium opportunities in real estate development.
            </p>

            {/* Divider with year tag */}
            <div className="flex items-center gap-3 pt-2">
              <div className="h-px flex-1 bg-amber-400/15" />
              <span className="text-[10px] text-amber-400/40 tracking-widest font-medium">
                EST. 2020
              </span>
              <div className="h-px flex-1 bg-amber-400/15" />
            </div>
          </div>

          {/* Quick links col */}
          <div className="lg:col-span-3 lg:pl-8">
            <h3 className="text-[11px] font-bold mb-6 text-amber-400/70 tracking-[0.2em] uppercase">
              Navigation
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <a
                    href={link.isComingSoon ? "#" : link.path}
                    onClick={(e) => link.isComingSoon && e.preventDefault()}
                    className={`group/link text-sm inline-flex items-center gap-2 transition-all duration-300 ${
                      link.isComingSoon
                        ? "text-amber-100/25 cursor-not-allowed"
                        : isActive(link.path)
                          ? "text-amber-400 font-semibold"
                          : "text-amber-100/60 hover:text-amber-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-px transition-all duration-300 ${isActive(link.path) ? "bg-amber-400 w-6" : "bg-amber-400/30 group-hover/link:bg-amber-400 group-hover/link:w-6"}`}
                    />
                    <span className={link.isComingSoon ? "line-through" : ""}>
                      {link.label}
                    </span>
                    {link.isComingSoon && (
                      <span className="text-[8px] font-bold text-teal-950 bg-amber-400 px-1.5 py-0.5 rounded-full">
                        SOON
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact col */}
          <div className="lg:col-span-5">
            <h3 className="text-[11px] font-bold mb-6 text-amber-400/70 tracking-[0.2em] uppercase">
              Get In Touch
            </h3>
            <div className="space-y-3">
              <a
                href={`tel:${CONTACT_PHONE}`}
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
                  Batumi, Georgia
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-amber-400/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-amber-100/30 text-center md:text-left">
              © 2026 Build Up Investment. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-xs text-amber-100/30 hover:text-amber-300 transition-colors duration-300"
              >
                Privacy Policy
              </a>
              <div className="w-px h-3 bg-amber-400/20" />
              <a
                href="#"
                className="text-xs text-amber-100/30 hover:text-amber-300 transition-colors duration-300"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
