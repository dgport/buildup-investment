"use client";

import { MessageCircle, Phone } from "lucide-react";

interface Props {
  phone?: string | null;
  whatsappText?: string;
  callLabel: string;
  whatsappLabel: string;
  /** Optional extra action (e.g. "request a consultation") */
  action?: { label: string; onClick: () => void };
}

/** Fixed bottom bar with call / WhatsApp buttons, visible only on small screens. */
export function MobileContactBar({ phone, whatsappText, callLabel, whatsappLabel, action }: Props) {
  const clean = phone?.replace(/[^\d+]/g, "") ?? "";
  if (!clean && !action) return null;
  const wa = clean.replace(/^\+/, "");

  return (
    <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-amber-400/30 bg-teal-950/95 backdrop-blur-md px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.25)]">
      <div className="flex gap-2">
        {clean && (
          <a
            href={`tel:${clean}`}
            className="flex-1 h-11 rounded-xl bg-amber-400 text-teal-950 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            {callLabel}
          </a>
        )}
        {clean && (
          <a
            href={`https://wa.me/${wa}${whatsappText ? `?text=${encodeURIComponent(whatsappText)}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-11 rounded-xl border border-amber-400/40 text-amber-100 font-semibold text-sm flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {whatsappLabel}
          </a>
        )}
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="flex-1 h-11 rounded-xl bg-white text-teal-950 font-bold text-sm flex items-center justify-center gap-2"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
