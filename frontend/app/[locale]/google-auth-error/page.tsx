"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GoogleAuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("message") || "Authentication failed";

  useEffect(() => {
    console.error("Google auth error:", errorMessage);

    // Redirect to signin after 3 seconds
    const timer = setTimeout(() => {
      router.push("/signin");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, errorMessage]);

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
            <div className="h-16 w-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-400">
              Authentication Failed
            </h2>
            <p className="text-amber-100/70">
              {decodeURIComponent(errorMessage)}
            </p>
            <p className="text-sm text-amber-100/50">
              Redirecting to sign in...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-400/60" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
