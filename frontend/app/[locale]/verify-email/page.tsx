"use client";

import { useState, useEffect, useRef } from "react";
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

type VerificationStatus =
  | "verifying"
  | "success"
  | "error"
  | "expired"
  | "already_verified";

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<VerificationStatus>("verifying");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null,
  );
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    verifyEmail();
  }, []);

  useEffect(() => {
    if (status === "success" && redirectCountdown === null) {
      setRedirectCountdown(3);
    }
  }, [status, redirectCountdown]);

  useEffect(() => {
    if (redirectCountdown === null || redirectCountdown <= 0) return;

    const timer = setTimeout(() => {
      if (redirectCountdown === 1) {
        window.location.href = "/signin";
      } else {
        setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  const verifyEmail = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please check your email link.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/auth/verify-email?token=${token}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(
          data.message || "Your email has been verified successfully!",
        );
      } else {
        if (response.status === 400) {
          if (data.message?.toLowerCase().includes("expired")) {
            setStatus("expired");
            setMessage(
              "Your verification link has expired. Please request a new one.",
            );
          } else if (
            data.message?.toLowerCase().includes("already verified") ||
            data.message?.toLowerCase().includes("already been verified")
          ) {
            setStatus("already_verified");
            setMessage(
              "This email has already been verified. You can sign in now.",
            );
          } else {
            setStatus("error");
            setMessage(
              data.message || "Verification failed. Please try again.",
            );
          }
        } else if (response.status === 404) {
          setStatus("error");
          setMessage(
            "Invalid verification link. Please check your email or request a new link.",
          );
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed. Please try again.");
        }
      }
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again later.");
    }
  };

  const handleResendEmail = async () => {
    const email = prompt("Please enter your email address:");

    if (!email) return;

    setIsResending(true);
    setResendSuccess(false);

    try {
      const response = await fetch(
        "http://localhost:3000/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setResendSuccess(true);
        setMessage("Verification email sent! Please check your inbox.");
      } else {
        alert(data.message || "Failed to resend email. Please try again.");
      }
    } catch (error) {
      alert("Something went wrong. Please try again later.");
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case "verifying":
        return (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-100 mb-2">
              Verifying your email...
            </h2>
            <p className="text-amber-100/60">
              Please wait while we verify your email address.
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">
              Email Verified!
            </h2>
            <p className="text-amber-100/60 mb-4">{message}</p>
            <Alert className="bg-green-500/10 border-green-500/30 mb-6">
              <AlertDescription className="text-green-300 text-sm">
                Redirecting you to sign in page in {redirectCountdown ?? 3}{" "}
                second{redirectCountdown !== 1 ? "s" : ""}...
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => (window.location.href = "/signin")}
              className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold rounded-xl h-11 shadow-md shadow-amber-400/20 transition-all duration-200"
            >
              Go to Sign In Now
            </Button>
          </div>
        );

      case "already_verified":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-12 h-12 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">
              Already Verified
            </h2>
            <p className="text-amber-100/60 mb-6">{message}</p>
            <Alert className="bg-blue-500/10 border-blue-500/30 mb-6">
              <AlertDescription className="text-blue-300 text-sm">
                Your email is already verified. You can proceed to sign in.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => (window.location.href = "/signin")}
              className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold rounded-xl h-11 shadow-md shadow-amber-400/20 transition-all duration-200"
            >
              Go to Sign In
            </Button>
          </div>
        );

      case "expired":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">
              Link Expired
            </h2>
            <p className="text-amber-100/60 mb-6">{message}</p>

            {resendSuccess ? (
              <Alert className="bg-green-500/10 border-green-500/30 mb-4">
                <Mail className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  Verification email sent! Please check your inbox.
                </AlertDescription>
              </Alert>
            ) : (
              <Button
                onClick={handleResendEmail}
                className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold rounded-xl h-11 shadow-md shadow-amber-400/20 transition-all duration-200"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            )}
          </div>
        );

      case "error":
        return (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-amber-100 mb-2">
              Verification Failed
            </h2>
            <p className="text-amber-100/60 mb-6">{message}</p>

            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full border-amber-400/30 bg-transparent text-amber-100 hover:bg-amber-400/10 hover:text-amber-300 rounded-xl h-11 transition-all duration-200"
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                onClick={() => (window.location.href = "/signin")}
                variant="ghost"
                className="w-full text-amber-100/60 hover:text-amber-300 hover:bg-amber-400/10 rounded-xl h-11 transition-all duration-200"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md shadow-2xl bg-gradient-to-br from-teal-950 via-teal-900 to-teal-950 border-amber-400/20 relative overflow-hidden">
        {/* Decorative elements inside card */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
          <div className="absolute top-1/4 -left-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
          <div className="absolute bottom-1/4 -right-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
        </div>

        <CardHeader className="text-center relative z-10">
          <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-400/20">
            <Mail className="w-8 h-8 text-teal-950" />
          </div>
          <CardTitle className="text-2xl font-bold text-amber-400">
            Email Verification
          </CardTitle>
          <CardDescription className="text-amber-100/60">
            Verify your email address to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10">{renderContent()}</CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
