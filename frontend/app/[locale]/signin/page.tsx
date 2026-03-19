"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Loader2, AlertCircle, Info } from "lucide-react";
import { useSignIn } from "@/lib/hooks/useAuth";
import { authService } from "@/lib/services/auth.service";

const SigninPage = () => {
  const router = useRouter();
  const signInMutation = useSignIn();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [googleAccountEmail, setGoogleAccountEmail] = useState<string | null>(
    null,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (name === "email" || name === "password") {
      setGoogleAccountEmail(null);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please provide a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    signInMutation.mutate(
      { ...formData, rememberMe },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (error: any) => {
          const errorMessage = error?.response?.data?.message || "";
          if (
            errorMessage.includes("Google") ||
            errorMessage.includes("add a password")
          ) {
            setGoogleAccountEmail(formData.email);
          }
        },
      },
    );
  };

  const handleGoogleSignin = () => {
    authService.googleAuth();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !signInMutation.isPending) {
      handleSubmit();
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
        <CardHeader className="space-y-1 relative z-10">
          <CardTitle className="text-2xl font-bold text-center text-amber-400">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center text-amber-100/60">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          {/* Google Account Error - Special Alert */}
          {googleAccountEmail && (
            <Alert className="bg-amber-400/10 border-amber-400/30">
              <Info className="h-4 w-4 text-amber-400" />
              <AlertTitle className="text-amber-100">
                Google Account Detected
              </AlertTitle>
              <AlertDescription className="text-amber-100/80">
                <p className="mb-3">
                  The account{" "}
                  <strong className="text-amber-400">
                    {googleAccountEmail}
                  </strong>{" "}
                  was created with Google.
                </p>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    onClick={handleGoogleSignin}
                    className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold"
                  >
                    Sign in with Google
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/forgot-password?email=${encodeURIComponent(googleAccountEmail)}`,
                      )
                    }
                    className="w-full border-amber-400/30 text-amber-100 hover:bg-amber-400/10 hover:text-amber-300"
                  >
                    Add a password to this account
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Regular Error Alert */}
          {signInMutation.isError && !googleAccountEmail && (
            <Alert className="bg-red-500/10 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {(signInMutation.error as any)?.response?.data?.message ||
                  "Invalid email or password. Please try again."}
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
                value={formData.email}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={`bg-teal-950/50 border-amber-400/20 text-white placeholder:text-amber-100/30 focus:border-amber-400 focus:ring-amber-400/20 ${
                  fieldErrors.email ? "border-red-500" : ""
                }`}
                disabled={signInMutation.isPending}
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-amber-100/80">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-amber-400 hover:text-amber-300 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
                  disabled={signInMutation.isPending}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-100/50 hover:text-amber-400 transition-colors"
                  disabled={signInMutation.isPending}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={signInMutation.isPending}
                className="border-amber-400/30 data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none text-amber-100/70 cursor-pointer hover:text-amber-100 transition-colors"
              >
                Remember me
              </label>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold shadow-lg shadow-amber-400/20 transition-all duration-200"
              disabled={signInMutation.isPending}
            >
              {signInMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-amber-400/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-teal-900/80 px-2 text-amber-100/50">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-amber-400/30 text-amber-100 hover:bg-amber-400/10 hover:text-amber-300 hover:border-amber-400/50 transition-all"
            onClick={handleGoogleSignin}
            disabled={signInMutation.isPending}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 relative z-10">
          <div className="text-sm text-amber-100/60 text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-amber-400 hover:text-amber-300 hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>

          <div className="text-xs text-amber-100/40 text-center">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="text-amber-400/80 hover:text-amber-400 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-amber-400/80 hover:text-amber-400 hover:underline"
            >
              Privacy Policy
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SigninPage;
