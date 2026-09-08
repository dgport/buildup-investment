"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { setAccessToken } from "@/lib/utils/auth";
import { authKeys } from "@/lib/hooks/useAuth";
import { ROUTES } from "@/lib/constants/routes";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function GoogleAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const t = useTranslations("auth");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace(`${ROUTES.SIGNIN}?error=no_token`);
      return;
    }

    setAccessToken(token, true);
    queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
    // Clean the token from the URL/history before leaving
    window.history.replaceState(null, "", window.location.pathname);
    const timer = setTimeout(() => router.replace(ROUTES.DASHBOARD), 1200);
    return () => clearTimeout(timer);
  }, [router, searchParams, queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-2xl bg-gradient-to-br from-teal-950 via-teal-900 to-teal-950 border-amber-400/20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <div className="absolute top-1/4 -left-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
          <div className="absolute bottom-1/4 -right-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
        </div>
        <CardContent className="pt-8 pb-8 relative z-10">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-amber-400">{t("success")}</h2>
            <p className="text-amber-100/70">{t("signingInWithGoogle")}</p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GoogleAuthSuccess() {
  return (
    <Suspense>
      <GoogleAuthSuccessContent />
    </Suspense>
  );
}
