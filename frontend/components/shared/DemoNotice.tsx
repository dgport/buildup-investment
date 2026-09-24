"use client";

import { useLocale } from "next-intl";

export function DemoNotice({ compact = false }: { compact?: boolean }) {
  const ka = useLocale() === "ka";
  return (
    <p className={`text-slate-500 ${compact ? "text-xs" : "my-2 text-sm"}`}>
      {ka ? "საილუსტრაციო ნიმუში" : "Illustrative example"}
    </p>
  );
}
