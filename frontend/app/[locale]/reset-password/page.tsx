"use client";

import { useState, useEffect, Suspense } from "react";
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
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { useResetPassword } from "@/lib/hooks/useAuth";

const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPasswordMutation = useResetPassword();

  const [formData, setFormData] = useState({
    token: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [tokenValid, setTokenValid] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setTokenValid(false);
    } else {
      setFormData((prev) => ({ ...prev, token }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
    ) {
      errors.password =
        "Password must contain uppercase, lowercase, number, and special character";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    resetPasswordMutation.mutate(
      { token: formData.token, password: formData.password },
      {
        onSuccess: () => {
          setTimeout(() => {
            router.push("/signin");
          }, 2000);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !resetPasswordMutation.isPending && tokenValid) {
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
          Set Your Password
        </CardTitle>
        <CardDescription className="text-center text-amber-100/60">
          Enter your new password below
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 relative z-10">
        {!tokenValid && (
          <Alert
            variant="destructive"
            className="bg-red-500/10 border-red-500/30 text-red-300"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invalid or missing token. Please request a new link.
            </AlertDescription>
          </Alert>
        )}

        {resetPasswordMutation.isError && (
          <Alert
            variant="destructive"
            className="bg-red-500/10 border-red-500/30 text-red-300"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(resetPasswordMutation.error as any)?.response?.data?.message ||
                "Failed to set password. The link may be expired or invalid."}
            </AlertDescription>
          </Alert>
        )}

        {resetPasswordMutation.isSuccess && (
          <Alert className="border-green-500/30 bg-green-500/10 text-green-300">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription>
              Password set successfully! Redirecting to sign in...
            </AlertDescription>
          </Alert>
        )}

        {tokenValid ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-amber-100/80">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`bg-teal-950/50 border-amber-400/20 text-white placeholder:text-amber-100/30 focus:border-amber-400 focus:ring-amber-400/20 pr-10 ${
                    fieldErrors.password ? "border-red-500" : ""
                  }`}
                  disabled={resetPasswordMutation.isPending}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-100/50 hover:text-amber-300"
                  disabled={resetPasswordMutation.isPending}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400">{fieldErrors.password}</p>
              )}
              <p className="text-xs text-amber-100/40">
                Must be at least 8 characters with uppercase, lowercase, number
                &amp; special character
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-amber-100/80">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`bg-teal-950/50 border-amber-400/20 text-white placeholder:text-amber-100/30 focus:border-amber-400 focus:ring-amber-400/20 pr-10 ${
                    fieldErrors.confirmPassword ? "border-red-500" : ""
                  }`}
                  disabled={resetPasswordMutation.isPending}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-100/50 hover:text-amber-300"
                  disabled={resetPasswordMutation.isPending}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-400">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold shadow-md shadow-amber-400/20"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting Password...
                </>
              ) : (
                "Set Password"
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-amber-100/60 mb-4">
              This link is invalid or has expired.
            </p>
            <Button
              onClick={() => router.push("/forgot-password")}
              className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold shadow-md shadow-amber-400/20"
            >
              Request New Link
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 relative z-10">
        <Button
          variant="ghost"
          className="w-full text-amber-100/70 hover:text-amber-300 hover:bg-white/[0.06]"
          onClick={() => router.push("/signin")}
          disabled={resetPasswordMutation.isPending}
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

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
