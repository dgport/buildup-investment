"use client";

import { useLocale } from "next-intl";

export function DemoNotice({ compact = false }: { compact?: boolean }) {
  const ka = useLocale() === "ka";
  return (
    <p className={`rounded-lg border border-amber-200 bg-amber-50 text-amber-950 ${compact ? "px-2 py-1 text-xs font-semibold" : "my-3 p-3 text-sm"}`}>
      {compact
        ? (ka ? "სატესტო მაგალითი" : "Demo example")
        : (ka ? "სატესტო მაგალითი — ფოტოები, ფასები და პირობები დემონსტრაციისთვისაა და რეალურ შეთავაზებას არ წარმოადგენს." : "Demo example — photos, prices and details are for demonstration and do not represent a live offer.")}
    </p>
  );
}
