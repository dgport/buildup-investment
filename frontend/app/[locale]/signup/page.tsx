"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
import { useSignUp } from "@/lib/hooks/useAuth";
import { authService } from "@/lib/services/auth.service";

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
}

const INITIAL_FORM: FormData = {
  firstname: "",
  lastname: "",
  email: "",
  password: "",
  phone: "",
};

export default function SignupPage() {
  const router = useRouter();
  const signUpMutation = useSignUp();

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormData, string>>
  >({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstname.trim()) errors.firstname = "First name is required";
    else if (formData.firstname.length < 2)
      errors.firstname = "First name must be at least 2 characters";

    if (!formData.lastname.trim()) errors.lastname = "Last name is required";
    else if (formData.lastname.length < 2)
      errors.lastname = "Last name must be at least 2 characters";

    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Please provide a valid email address";

    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 8)
      errors.password = "Password must be at least 8 characters";
    else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)
    )
      errors.password =
        "Password must contain uppercase, lowercase, number, and special character";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    signUpMutation.mutate(formData, {
      onSuccess: () => setTimeout(() => router.push("/signin"), 3000),
    });
  };

  const isPending = signUpMutation.isPending;

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
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-amber-100/60">
            Enter your information to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          {signUpMutation.isError && (
            <Alert className="bg-red-500/20 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {(signUpMutation.error as any)?.response?.data?.message ??
                  "Something went wrong. Please try again."}
              </AlertDescription>
            </Alert>
          )}

          {signUpMutation.isSuccess && (
            <Alert className="bg-green-500/20 border-green-500/30">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">
                Account created successfully! Redirecting to sign in...
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="text-amber-100/80">
                  First Name
                </Label>
                <Input
                  id="firstname"
                  name="firstname"
                  type="text"
                  placeholder="John"
                  value={formData.firstname}
                  onChange={handleChange}
                  disabled={isPending}
                  className={`bg-teal-900/50 border-amber-400/20 text-white placeholder:text-amber-100/30 focus:border-amber-400 focus:ring-amber-400/20 ${
                    fieldErrors.firstname ? "border-red-500" : ""
                  }`}
                />
                {fieldErrors.firstname && (
                  <p className="text-xs text-red-400">
                    {fieldErrors.firstname}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastname" className="text-amber-100/80">
                  Last Name
                </Label>
                <Input
                  id="lastname"
                  name="lastname"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastname}
                  onChange={handleChange}
                  disabled={isPending}
                  className={`bg-teal-900/50 border-amber-400/20 text-white placeholder:text-amber-100/30 focus:border-amber-400 focus:ring-amber-400/20 ${
                    fieldErrors.lastname ? "border-red-500" : ""
                  }`}
                />
                {fieldErrors.lastname && (
                  <p className="text-xs text-red-400">{fieldErrors.lastname}</p>
                )}
              </div>
            </div>

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
                disabled={isPending}
                className={`bg-teal-900/50 border-amber-400/20 text-white placeholder:text-amber-100/30 focus:border-amber-400 focus:ring-amber-400/20 ${
                  fieldErrors.email ? "border-red-500" : ""
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-amber-100/80">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isPending}
                  className={`bg-teal-900/50 border-amber-400/20 text-white placeholder:text-amber-100/30 focus:border-amber-400 focus:ring-amber-400/20 pr-10 ${
                    fieldErrors.password ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isPending}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-100/50 hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400">{fieldErrors.password}</p>
              )}
              <p className="text-xs text-amber-100/40">
                Must be at least 8 characters with uppercase, lowercase, number
                & symbol
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-amber-100/80">
                Phone (Optional)
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                disabled={isPending}
                className="bg-teal-900/50 border-amber-400/20 text-white placeholder:text-amber-100/30 focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-amber-400 hover:bg-amber-300 text-teal-950 font-bold rounded-xl h-11 shadow-md shadow-amber-400/20 transition-all duration-200"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-amber-400/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-teal-900 px-2 text-amber-100/40">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-amber-400/30 bg-amber-400/10 hover:bg-amber-400/20 text-amber-100 hover:text-amber-300 rounded-xl h-11 transition-all duration-200"
            onClick={() => authService.googleAuth()}
            disabled={isPending}
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
            Sign up with Google
          </Button>
        </CardContent>

        <CardFooter className="flex justify-center relative z-10">
          <p className="text-sm text-amber-100/60">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-amber-400 hover:text-amber-300 hover:underline font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
