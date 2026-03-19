"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { useForgotPassword } from "@/lib/hooks/useAuth";

const ForgotPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forgotPasswordMutation = useForgotPassword();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [fieldError, setFieldError] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (fieldError) setFieldError("");
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setFieldError("Email is required");
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError("Please provide a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) return;

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setEmail("");
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !forgotPasswordMutation.isPending) {
      handleSubmit();
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl bg-gradient-to-br from-teal-950 via-teal-900 to-teal-950 border-amber-400/20 relative overflow-hidden">
      {/* Decorative elements inside card */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="absolute top-1/4 -left-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 -right-16 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl" />
      </div>

      <CardHeader className="space-y-1 relative z-10">
        <CardTitle className="text-2xl font-bold text-center text-amber-400">
          Forgot Password?
        </CardTitle>
        <CardDescription className="text-center text-amber-100/60">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {forgotPasswordMutation.isError && (
          <Alert
            variant="destructive"
            className="bg-red-500/10 border-red-500/30 text-red-300"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(forgotPasswordMutation.error as any)?.response?.data?.message ||
                "Failed to send reset email. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {forgotPasswordMutation.isSuccess && (
          <Alert className="border-green-500/30 bg-green-500/10 text-green-300">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription>
              Password reset link has been sent to your email. Please check your
              inbox.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-amber-100/80">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={email}
              onChange={handleEmailChange}
              onKeyDown={handleKeyDown}
              className={`bg-teal-950/50 border-amber-400/20 text-white placeholder:text-amber-100/30 focus:border-amber-400 focus:ring-amber-400/20 ${
                fieldError ? "border-red-500" : ""
              }`}
              disabled={forgotPasswordMutation.isPending}
              autoComplete="email"
            />
            {fieldError && <p className="text-xs text-red-400">{fieldError}</p>}
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold shadow-md shadow-amber-400/20"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 relative z-10">
        <Button
          variant="ghost"
          className="w-full text-amber-100/70 hover:text-amber-300 hover:bg-white/[0.06]"
          onClick={() => router.push("/signin")}
          disabled={forgotPasswordMutation.isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>

        <div className="text-sm text-amber-100/50 text-center">
          Remember your password?{" "}
          <Link
            href="/signin"
            className="text-amber-400 hover:text-amber-300 hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
