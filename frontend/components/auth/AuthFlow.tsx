"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
} from "lucide-react";
import { PageLoader } from "@/components/shared/PageLoader";
import { authService } from "@/lib/services/auth.service";
import { authKeys, useSignIn, useSignUp } from "@/lib/hooks/useAuth";
import { removeAccessToken, setAccessToken } from "@/lib/utils/auth";
import {
  authErrorKey,
  safeAuthNext,
  strongPassword,
} from "@/lib/utils/auth-flow";

type Mode =
  | "signin"
  | "signup"
  | "forgot-password"
  | "reset-password"
  | "verify-email"
  | "google-auth-success"
  | "google-auth-error";
const primary =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-50";
const textLink =
  "font-medium text-teal-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700";

function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      role={error ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-sm leading-6 ${error ? "border-red-200 bg-red-50 text-red-800" : "border-teal-100 bg-teal-50 text-teal-900"}`}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
}) {
  const t = useTranslations("auth");
  const [visible, setVisible] = useState(false);
  const password = props.type === "password";
  const id = props.id || props.name;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-teal-950">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={password && visible ? "text" : props.type}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={`h-12 w-full rounded-xl border bg-white px-4 text-base text-teal-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/10 disabled:bg-slate-50 disabled:text-slate-500 ${password ? "pr-12" : ""} ${error ? "border-red-500" : "border-slate-300"}`}
        />
        {password && (
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={t(visible ? "hidePassword" : "showPassword")}
            aria-pressed={visible}
            className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-xl text-slate-500 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-teal-700"
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {hint && (
        <div id={`${id}-hint`} className="text-xs leading-5 text-slate-500">
          {hint}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordRules({ value }: { value: string }) {
  const t = useTranslations("auth");
  const rules: [boolean, string][] = [
    [value.length >= 8 && value.length <= 128, "ruleLength"],
    [/[A-Z]/.test(value) && /[a-z]/.test(value), "ruleLetters"],
    [/\d/.test(value), "ruleNumber"],
    [/[^A-Za-z0-9\s]/.test(value), "ruleSymbol"],
  ];
  return (
    <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      {rules.map(([valid, key]) => (
        <li
          key={key}
          className={`flex items-center gap-1.5 ${valid ? "text-teal-700" : ""}`}
        >
          <Check
            size={13}
            aria-hidden
            className={valid ? "opacity-100" : "opacity-30"}
          />
          {t(key)}
        </li>
      ))}
    </ul>
  );
}

function GoogleButton({ next, disabled }: { next: string; disabled: boolean }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    const reset = () => setLeaving(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);
  return (
    <button
      type="button"
      disabled={disabled || leaving}
      onClick={() => {
        setLeaving(true);
        authService.googleAuth(next, locale);
      }}
      className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-teal-950 transition hover:border-teal-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 disabled:opacity-50"
    >
      {leaving ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      {t("continueGoogle")}
    </button>
  );
}

function Frame({
  title,
  subtitle,
  children,
  tabs,
  next,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  tabs?: "signin" | "signup";
  next: string;
}) {
  const t = useTranslations("auth");
  return (
    <section className="flex min-h-[calc(100svh-5rem)] flex-col bg-white px-5 py-10 text-teal-950 sm:px-8 sm:py-14 lg:min-h-[calc(100svh-6rem)]">
      <div className="mx-auto my-auto w-full max-w-[440px]">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-900"
        >
          <ArrowLeft size={16} />
          {t("backHome")}
        </Link>
        <div className="mb-8">
          <div
            className="mb-5 h-1 w-10 rounded-full bg-amber-400"
            aria-hidden
          />
          <h1 className="text-3xl font-semibold leading-snug tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
        {tabs && (
          <nav
            aria-label={t("accountNavigation")}
            className="mb-7 flex border-b border-slate-200"
          >
            {(["signin", "signup"] as const).map((mode) => (
              <Link
                key={mode}
                href={`/${mode}?next=${encodeURIComponent(next)}`}
                aria-current={tabs === mode ? "page" : undefined}
                className={`-mb-px flex-1 border-b-2 pb-3 text-center text-sm font-semibold ${tabs === mode ? "border-teal-900 text-teal-950" : "border-transparent text-slate-400 hover:text-teal-800"}`}
              >
                {t(mode)}
              </Link>
            ))}
          </nav>
        )}
        <div className="space-y-5">{children}</div>
        <p className="mt-8 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-400">
          <Link className="hover:text-teal-800" href="/terms">
            {t("terms")}
          </Link>
          <span className="mx-2">·</span>
          <Link className="hover:text-teal-800" href="/privacy">
            {t("privacy")}
          </Link>
        </p>
      </div>
    </section>
  );
}

function useCooldown() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!seconds) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);
  return { seconds, start: () => setSeconds(60) };
}

function Resend({ initialEmail }: { initialEmail: string }) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState(initialEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const cooldown = useCooldown();
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending || cooldown.seconds) return;
    setPending(true);
    setError("");
    setSent(false);
    try {
      await authService.resendVerification(email.trim().toLowerCase());
      setSent(true);
      cooldown.start();
    } catch (e) {
      setError(t(authErrorKey(e)));
    } finally {
      setPending(false);
    }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Notice error>{error}</Notice>}
      {sent && <Notice>{t("resendSuccess")}</Notice>}
      <Field
        name="resend-email"
        label={t("email")}
        type="email"
        autoComplete="email"
        required
        maxLength={255}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={pending}
      />
      <button className={primary} disabled={pending || cooldown.seconds > 0}>
        {pending && <Loader2 size={16} className="animate-spin" />}
        {cooldown.seconds
          ? t("resendIn", { seconds: cooldown.seconds })
          : t(pending ? "sending" : "resendVerification")}
      </button>
    </form>
  );
}

function Credentials({ mode }: { mode: "signin" | "signup" }) {
  const signup = mode === "signup";
  const t = useTranslations("auth");
  const params = useSearchParams();
  const router = useRouter();
  const next = safeAuthNext(params.get("next"));
  const signIn = useSignIn();
  const signUp = useSignUp();
  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    email: params.get("email") || "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const pending = signIn.isPending || signUp.isPending;
  const update =
    (name: keyof typeof data) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setData({ ...data, [name]: event.target.value });
      setErrors({ ...errors, [name]: "" });
      setFailure("");
    };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;
    const problems: Record<string, string> = {};
    if (signup) {
      if (!/^[\p{L}\s'-]{2,50}$/u.test(data.firstname.trim()))
        problems.firstname = t("nameInvalid");
      if (!/^[\p{L}\s'-]{2,50}$/u.test(data.lastname.trim()))
        problems.lastname = t("nameInvalid");
      if (!strongPassword(data.password))
        problems.password = t("passwordComplexity");
      if (data.password !== data.confirmPassword)
        problems.confirmPassword = t("passwordsMismatch");
    }
    setErrors(problems);
    setFailure("");
    if (Object.keys(problems).length) return;
    const email = data.email.trim().toLowerCase();
    if (signup)
      signUp.mutate(
        {
          firstname: data.firstname.trim(),
          lastname: data.lastname.trim(),
          email,
          password: data.password,
          phone: data.phone.trim() || undefined,
        },
        { onError: (e) => setFailure(authErrorKey(e)) },
      );
    else
      signIn.mutate(
        { email, password: data.password, rememberMe: remember },
        {
          onSuccess: () => router.replace(next),
          onError: (e) => setFailure(authErrorKey(e)),
        },
      );
  };
  if (signUp.isSuccess)
    return (
      <Frame
        title={t(
          signUp.data.verificationEmailSent
            ? "signupSuccessTitle"
            : "accountSaved",
        )}
        subtitle={t("verificationNextStep")}
        next={next}
      >
        <Mail size={32} className="text-teal-700" aria-hidden />
        <Notice error={!signUp.data.verificationEmailSent}>
          {signUp.data.verificationEmailSent
            ? t("signupSuccessHint", { email: data.email })
            : t("signupEmailFailed")}
        </Notice>
        <p className="text-sm leading-6 text-slate-500">{t("checkSpam")}</p>
        <Resend initialEmail={data.email} />
        <Link
          className={`${textLink} block text-center text-sm`}
          href={`/signin?${new URLSearchParams({ next, email: data.email })}`}
        >
          {t("goToSignIn")}
        </Link>
      </Frame>
    );
  return (
    <Frame
      title={t(signup ? "createAccount" : "welcomeBack")}
      subtitle={t(signup ? "signupSubtitle" : "signinSubtitle")}
      tabs={mode}
      next={next}
    >
      <GoogleButton next={next} disabled={pending} />
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        {t("orEmail")}
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      {failure && (
        <Notice error>
          {t(failure)}
          {["notVerified", "emailExists"].includes(failure) && (
            <Link
              className="mt-2 block font-semibold underline"
              href={`/verify-email?${new URLSearchParams({ email: data.email, next })}`}
            >
              {t("resendVerification")}
            </Link>
          )}
          {failure === "googleOnly" && (
            <Link
              className="mt-2 block font-semibold underline"
              href={`/forgot-password?email=${encodeURIComponent(data.email)}`}
            >
              {t("addPassword")}
            </Link>
          )}
        </Notice>
      )}
      <form onSubmit={submit} className="space-y-5">
        {signup && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              name="firstname"
              label={t("firstName")}
              required
              minLength={2}
              maxLength={50}
              autoComplete="given-name"
              value={data.firstname}
              onChange={update("firstname")}
              error={errors.firstname}
              disabled={pending}
            />
            <Field
              name="lastname"
              label={t("lastName")}
              required
              minLength={2}
              maxLength={50}
              autoComplete="family-name"
              value={data.lastname}
              onChange={update("lastname")}
              error={errors.lastname}
              disabled={pending}
            />
          </div>
        )}
        <Field
          name="email"
          type="email"
          label={t("email")}
          required
          maxLength={255}
          placeholder="you@example.com"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={data.email}
          onChange={update("email")}
          disabled={pending}
        />
        <Field
          name="password"
          type="password"
          label={t("password")}
          required
          maxLength={128}
          autoComplete={signup ? "new-password" : "current-password"}
          value={data.password}
          onChange={update("password")}
          error={errors.password}
          disabled={pending}
          hint={signup ? <PasswordRules value={data.password} /> : undefined}
        />
        {signup ? (
          <>
            <Field
              name="confirmPassword"
              type="password"
              label={t("confirmPassword")}
              required
              autoComplete="new-password"
              maxLength={128}
              value={data.confirmPassword}
              onChange={update("confirmPassword")}
              error={errors.confirmPassword}
              disabled={pending}
            />
            <Field
              name="phone"
              type="tel"
              label={t("phoneOptional")}
              maxLength={40}
              autoComplete="tel"
              placeholder="+995"
              value={data.phone}
              onChange={update("phone")}
              disabled={pending}
            />
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                className="h-4 w-4 accent-teal-900"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={pending}
              />
              {t("rememberMe")}
            </label>
            <Link
              className={textLink}
              href={`/forgot-password?${new URLSearchParams({ email: data.email, next })}`}
            >
              {t("forgotPassword")}
            </Link>
          </div>
        )}
        <button type="submit" className={primary} disabled={pending}>
          {pending ? <Loader2 size={18} className="animate-spin" /> : null}
          {t(pending ? (signup ? "creatingAccount" : "signingIn") : mode)}
          {!pending && <ArrowRight size={17} />}
        </button>
      </form>
    </Frame>
  );
}

function PasswordFlow({ reset }: { reset: boolean }) {
  const t = useTranslations("auth");
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const next = safeAuthNext(params.get("next"));
  const token = params.get("token") || "";
  const [email, setEmail] = useState(params.get("email") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const cooldown = useCooldown();
  const invalid = reset && !/^[a-f0-9]{64}$/i.test(token);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending || invalid || cooldown.seconds) return;
    setError("");
    if (reset && !strongPassword(password)) {
      setError(t("passwordComplexity"));
      return;
    }
    if (reset && password !== confirm) {
      setError(t("passwordsMismatch"));
      return;
    }
    setPending(true);
    try {
      if (reset) {
        await authService.resetPassword({ token, password });
        removeAccessToken();
        queryClient.clear();
        window.history.replaceState(null, "", window.location.pathname);
      } else {
        await authService.forgotPassword({ email: email.trim().toLowerCase() });
        cooldown.start();
      }
      setSuccess(true);
    } catch (e) {
      setError(t(authErrorKey(e)));
    } finally {
      setPending(false);
    }
  };
  return (
    <Frame
      title={t(reset ? "setPasswordTitle" : "forgotPasswordTitle")}
      subtitle={t(reset ? "setPasswordSubtitle" : "forgotPasswordSubtitle")}
      next={next}
    >
      {error && <Notice error>{error}</Notice>}
      {invalid && !success ? (
        <>
          <Notice error>{t("linkExpired")}</Notice>
          <Link className={primary} href="/forgot-password">
            {t("requestNewLink")}
          </Link>
        </>
      ) : success && reset ? (
        <>
          <CheckCircle2 size={36} className="text-teal-700" aria-hidden />
          <Notice>{t("passwordSetSuccess")}</Notice>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          {success && (
            <Notice>
              {t("resetEmailSent")}
              <p className="mt-2">{t("checkSpam")}</p>
            </Notice>
          )}
          {reset ? (
            <>
              <Field
                name="password"
                type="password"
                label={t("newPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                maxLength={128}
                autoComplete="new-password"
                disabled={pending}
                hint={<PasswordRules value={password} />}
              />
              <Field
                name="confirmPassword"
                type="password"
                label={t("confirmPassword")}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                maxLength={128}
                autoComplete="new-password"
                disabled={pending}
              />
            </>
          ) : (
            <Field
              name="email"
              label={t("email")}
              type="email"
              required
              maxLength={255}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          )}
          <button
            type="submit"
            className={primary}
            disabled={pending || cooldown.seconds > 0}
          >
            {pending && <Loader2 size={18} className="animate-spin" />}
            {cooldown.seconds
              ? t("resendIn", { seconds: cooldown.seconds })
              : t(
                  pending ? "sending" : reset ? "setPassword" : "sendResetLink",
                )}
          </button>
          {reset && error && (
            <Link
              className={`${textLink} block text-center text-sm`}
              href="/forgot-password"
            >
              {t("requestNewLink")}
            </Link>
          )}
        </form>
      )}
      <Link
        className={`${textLink} block text-center text-sm`}
        href={`/signin?next=${encodeURIComponent(next)}`}
      >
        {t("backToSignIn")}
      </Link>
    </Frame>
  );
}

function Verification() {
  const t = useTranslations("auth");
  const params = useSearchParams();
  const next = safeAuthNext(params.get("next"));
  const token = params.get("token");
  const [status, setStatus] = useState(token ? "verifying" : "waiting");
  const [error, setError] = useState("");
  const request = useRef<Promise<unknown> | null>(null);
  useEffect(() => {
    if (!token) return;
    let active = true;
    request.current ??= authService.verifyEmail(token);
    request.current
      .then(() => {
        if (active) {
          setStatus("success");
          window.history.replaceState(null, "", window.location.pathname);
        }
      })
      .catch((e) => {
        if (active) {
          setStatus("error");
          setError(authErrorKey(e));
        }
      });
    return () => {
      active = false;
    };
  }, [token]);
  return (
    <Frame
      title={t(status === "success" ? "verified" : "verifyTitle")}
      subtitle={t(status === "success" ? "verifiedDefault" : "verifySubtitle")}
      next={next}
    >
      {status === "verifying" ? (
        <div
          role="status"
          className="flex items-center gap-3 py-6 text-sm text-slate-500"
        >
          <Loader2 size={24} className="animate-spin text-teal-800" />
          {t("verifying")}
        </div>
      ) : status === "success" ? (
        <CheckCircle2 size={36} className="text-teal-700" aria-hidden />
      ) : (
        <>
          {error && <Notice error>{t(error)}</Notice>}
          <p className="text-sm leading-6 text-slate-500">{t("checkSpam")}</p>
          <Resend initialEmail={params.get("email") || ""} />
        </>
      )}
      <Link
        className={
          status === "success"
            ? primary
            : `${textLink} block text-center text-sm`
        }
        href={`/signin?next=${encodeURIComponent(next)}`}
      >
        {t("goToSignIn")}
      </Link>
    </Frame>
  );
}

function GoogleResult({ failed }: { failed: boolean }) {
  const t = useTranslations("auth");
  const params = useSearchParams();
  const router = useRouter();
  const query = useQueryClient();
  const next = safeAuthNext(params.get("next"));
  const [error, setError] = useState(failed);
  const request = useRef<ReturnType<typeof authService.refreshToken> | null>(
    null,
  );
  useEffect(() => {
    if (failed) return;
    let active = true;
    request.current ??= authService.refreshToken();
    request.current
      .then(({ data }) => {
        if (active) {
          setAccessToken(data.accessToken, false);
          query.setQueryData(authKeys.currentUser, data.user);
          router.replace(next);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [failed, next, query, router]);
  return (
    <Frame
      title={t(error ? "authFailed" : "signingInWithGoogle")}
      subtitle={t(error ? "googleErrorHint" : "pleaseWait")}
      next={next}
    >
      {error ? (
        <>
          <GoogleButton next={next} disabled={false} />
          <Link
            href={`/signin?next=${encodeURIComponent(next)}`}
            className={`${textLink} block text-center text-sm`}
          >
            {t("backToSignIn")}
          </Link>
        </>
      ) : (
        <Loader2
          aria-label={t("pleaseWait")}
          className="animate-spin text-teal-800"
        />
      )}
    </Frame>
  );
}

export function AuthFlow({ mode }: { mode: Mode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      {mode === "signin" || mode === "signup" ? (
        <Credentials key={mode} mode={mode} />
      ) : mode === "forgot-password" || mode === "reset-password" ? (
        <PasswordFlow key={mode} reset={mode === "reset-password"} />
      ) : mode === "verify-email" ? (
        <Verification />
      ) : (
        <GoogleResult failed={mode === "google-auth-error"} />
      )}
    </Suspense>
  );
}
