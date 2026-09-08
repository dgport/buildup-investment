"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common.errorPage");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-teal-950 mb-2">{t("title")}</h1>
        <p className="text-teal-800/70 mb-2">{t("description")}</p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-6 font-mono">ID: {error.digest}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Button onClick={reset} className="bg-teal-900 hover:bg-teal-800">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t("retry")}
          </Button>
          <Button variant="outline" asChild>
            <Link href={ROUTES.HOME}>
              <Home className="w-4 h-4 mr-2" />
              {t("home")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
