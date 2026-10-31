"use client";

import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminLoadError({ retry, pending }: { retry: () => unknown; pending?: boolean }) {
  const t = useTranslations("admin.common");
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-center space-y-3">
      <p className="text-sm text-red-800">{t("loadError")}</p>
      <Button type="button" variant="outline" onClick={() => retry()} disabled={pending}>
        <RefreshCw className="mr-2 size-4" />{t("retry")}
      </Button>
    </div>
  );
}
