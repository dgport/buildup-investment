"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setAccessToken } from "@/lib/utils/auth";
import { queryClient } from "@/lib/tanstack/query-client";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function GoogleAuthSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleSuccess = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          router.push("/signin?error=no_token");
          return;
        }

        setAccessToken(token, true);

        await queryClient.invalidateQueries({
          queryKey: ["auth", "currentUser"],
        });

        setTimeout(() => {
          router.push("/");
        }, 1500);
      } catch (error) {
        console.error("Error handling Google auth:", error);
        router.push("/signin?error=callback_failed");
      }
    };

    handleSuccess();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-2xl bg-gradient-to-br from-teal-950 via-teal-900 to-teal-950 border-amber-400/20 relative overflow-hidden">
        {/* Decorative elements inside card */}
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
            <h2 className="text-2xl font-bold text-amber-400">Success!</h2>
            <p className="text-amber-100/70">Signing you in with Google...</p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
