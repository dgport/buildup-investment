"use client";

import { Check } from "lucide-react";

export const STEP_KEYS = ["basics", "location", "details", "amenities", "photos"] as const;
export type StepKey = (typeof STEP_KEYS)[number];

/** Vertical stepper on desktop, horizontal pill row on mobile. */
export function FormStepper({
  title,
  step,
  onSelect,
  stepLabel,
  progressLabel,
}: {
  title: string;
  step: number;
  onSelect: (step: number) => void;
  stepLabel: (key: StepKey) => string;
  progressLabel: string;
}) {
  const pct = Math.round(((step - 1) / (STEP_KEYS.length - 1)) * 100);

  return (
    <aside className="min-w-0 lg:sticky lg:top-28">
      <div className="rounded-[22px] bg-teal-950 text-white p-5 sm:p-6 shadow-xl shadow-teal-950/20 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 100% 0%, rgba(245,158,11,0.18), transparent 60%)" }}
        />
        <div className="relative">
          <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300/90 font-semibold">{progressLabel}</p>
          <h1 className="text-xl font-bold mt-1 mb-4">{title}</h1>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-5">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-500" style={{ width: `${Math.max(8, pct)}%` }} />
          </div>

          {/* Desktop: vertical list */}
          <ol className="hidden lg:flex flex-col gap-1">
            {STEP_KEYS.map((key, i) => {
              const id = i + 1;
              const done = id < step;
              const current = id === step;
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => onSelect(id)}
                    disabled={!done}
                    className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      current ? "bg-white/10 text-white" : done ? "text-teal-100 hover:bg-white/5" : "text-teal-100/40 cursor-default"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        done ? "bg-amber-400 text-teal-950" : current ? "bg-white text-teal-950" : "border border-white/20"
                      }`}
                    >
                      {done ? <Check className="w-3.5 h-3.5" /> : id}
                    </span>
                    <span className="font-semibold">{stepLabel(key)}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          {/* Mobile: pills */}
          <ol className="flex lg:hidden gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
            {STEP_KEYS.map((key, i) => {
              const id = i + 1;
              const done = id < step;
              const current = id === step;
              return (
                <li key={key} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onSelect(id)}
                    disabled={!done}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 h-8 text-xs font-semibold transition ${
                      current ? "bg-white text-teal-950" : done ? "bg-amber-400/90 text-teal-950" : "bg-white/10 text-teal-100/50"
                    }`}
                  >
                    {done ? <Check className="w-3 h-3" /> : <span>{id}.</span>}
                    {stepLabel(key)}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </aside>
  );
}
