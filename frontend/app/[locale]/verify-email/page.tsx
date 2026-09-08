"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  AlertCircle,
} from "lucide-react";
import { authService } from "@/lib/services/auth.service";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/api";
import { ROUTES } from "@/lib/constants/routes";

type VerificationStatus =
  | "verifying"
  | "success"
  | "error"
  | "expired"
  | "already_verified";

function VerifyEmailContent() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage(t("noToken"));
      return;
    }

    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || t("verifiedDefault"));
        setCountdown(3);
      })
      .catch((err) => {
        const msg = getErrorMessage(err, "").toLowerCase();
        if (msg.includes("expired")) {
          setStatus("expired");
          setMessage(t("verifyExpiredHint"));
        } else if (msg.includes("already")) {
          setStatus("already_verified");
          setMessage(t("alreadyVerifiedHint"));
        } else {
          setStatus("error");
          setMessage(t("verifyFailedHint"));
        }
      });
  }, [searchParams, t]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      router.replace(ROUTES.SIGNIN);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  const handleResendEmail = async () => {
    const email = resendEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error(t("emailInvalid"));
      return;
    }

    setIsResending(true);
    setResendSuccess(false);
    try {
      await authService.resendVerification(email);
      setResendSuccess(true);
      setMessage(t("resendSuccess"));
      toast.success(t("resendSuccess"));
    } catch (err) {
      toast.error(getErrorMessage(err, t("resendFailed")));
    } finally {
      setIsResending(false);
    }
  };

  const goToSignIn = () => router.push(ROUTES.SIGNIN);

  const resendButton = (variant: "default" | "outline") => (
    <div className="space-y-2">
    <Input
      type="email"
      value={resendEmail}
      onChange={(e) => setResendEmail(e.target.value)}
      placeholder={t("resendPrompt")}
      autoComplete="email"
      className="bg-teal-950/50 border-amber-400/20 text-white placeholder:text-amber-100/30 focus:border-amber-400"
    />
    <Button
      onClick={handleResendEmail}
      variant={variant}
      disabled={isResending}
      className={
        variant === "default"
          ? "w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold rounded-xl h-11 shadow-md shadow-amber-400/20"
          : "w-full border-amber-400/30 bg-transparent text-amber-100 hover:bg-amber-400/10 hover:text-amber-300 rounded-xl h-11"
      }
    >
      {isResending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("sending")}
        </>
      ) : (
        <>
          <Mail className="mr-2 h-4 w-4" />
          {t("resendVerification")}
        </>
      )}
    </Button>
    </div>
  );

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("verifying")}</h2>
            <p className="text-amber-100/60">{t("verifyingHint")}</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("verified")}</h2>
            <p className="text-amber-100/60 mb-4">{message}</p>
            <Alert className="bg-green-500/10 border-green-500/30 mb-6">
              <AlertDescription className="text-green-300 text-sm">
                {t("redirectingIn", { seconds: countdown ?? 3 })}
              </AlertDescription>
            </Alert>
            <Button
              onClick={goToSignIn}
              className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold rounded-xl h-11 shadow-md shadow-amber-400/20"
            >
              {t("goToSignIn")}
            </Button>
          </div>
        );

      case "already_verified":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("alreadyVerified")}</h2>
            <p className="text-amber-100/60 mb-6">{message}</p>
            <Button
              onClick={goToSignIn}
              className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold rounded-xl h-11 shadow-md shadow-amber-400/20"
            >
              {t("goToSignIn")}
            </Button>
          </div>
        );

      case "expired":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("verifyExpired")}</h2>
            <p className="text-amber-100/60 mb-6">{message}</p>
            {resendSuccess ? (
              <Alert className="bg-green-500/10 border-green-500/30 mb-4">
                <Mail className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  {t("resendSuccess")}
                </AlertDescription>
              </Alert>
            ) : (
              resendButton("default")
            )}
          </div>
        );

      case "error":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">{t("verifyFailed")}</h2>
            <p className="text-amber-100/60 mb-6">{message}</p>
            <div className="space-y-3">
              {resendSuccess ? (
                <Alert className="bg-green-500/10 border-green-500/30">
                  <Mail className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    {t("resendSuccess")}
                  </AlertDescription>
                </Alert>
              ) : (
                resendButton("outline")
              )}
              <Button
                onClick={goToSignIn}
                variant="ghost"
                className="w-full text-amber-100/60 hover:text-amber-300 hover:bg-amber-400/10 rounded-xl h-11"
              >
                {t("backToSignIn")}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl bg-gradient-to-br from-teal-950 via-teal-900 to-teal-950 border-amber-400/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="absolute top-1/4 -left-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 -right-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
      </div>

      <CardHeader className="text-center relative z-10">
        <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/20">
          <Mail className="w-8 h-8 text-teal-950" />
        </div>
        <CardTitle className="text-2xl font-bold text-amber-400">{t("verifyTitle")}</CardTitle>
        <CardDescription className="text-amber-100/60">{t("verifySubtitle")}</CardDescription>
      </CardHeader>

      <CardContent className="relative z-10">{renderContent()}</CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Suspense>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
