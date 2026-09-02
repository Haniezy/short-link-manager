"use client";

import * as React from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type ActionResult, type FieldErrors } from "@/lib/result";
import {
  signInAction,
  signUpAction,
  type AuthSuccess,
} from "@/lib/actions/auth";

// Client-side validation schemas. These mirror the server rules in
// lib/actions/auth.ts so users get immediate feedback before a network
// round-trip; the server still re-validates as the source of truth.
const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters."),
});

function validateCredentialsClient(
  email: string,
  password: string,
): FieldErrors {
  const result = credentialsSchema.safeParse({ email, password });
  if (result.success) return {};
  const fe: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fe[key]) fe[key] = issue.message;
  }
  return fe;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="group/submit relative w-full overflow-hidden transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_10px_28px_-8px_oklch(0.575_0.205_294/0.55)] active:scale-[0.99] disabled:hover:scale-100"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-primary via-primary to-accent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px -z-10 opacity-0 transition-opacity duration-300 group-hover/submit:opacity-100"
        style={{
          background:
            "radial-gradient(circle at 50% 120%, oklch(1 0 0 / 0.3), transparent 60%)",
        }}
      />
      {pending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Please wait…
        </>
      ) : (
        <>
          {label}
          <ArrowRight className="ml-1 size-4 transition-transform duration-300 group-hover/submit:translate-x-0.5" />
        </>
      )}
    </Button>
  );
}

/**
 * Inline error message rendered directly under a form field. Rendered as a
 * real <p> tag with red destructive text so screen readers and users get a
 * clear, readable cue. The component is always mounted; when there's no
 * message, the margin/padding is collapsed so the layout doesn't shift.
 */
function FieldError({ message }: { message?: string }) {
  if (!message) {
    // Reserve a stable vertical slot so neighbouring content doesn't jump
    // when an error appears/disappears. aria-hidden keeps it out of AT.
    return <p aria-hidden className="mt-0 h-0 text-xs leading-none" />;
  }
  return (
    <p
      role="alert"
      aria-live="polite"
      className="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-destructive"
    >
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

/**
 * Floating-label input with a leading icon. Renders an inline error message
 * beneath the field when `error` is set. The error styling automatically clears
 * the moment the user starts typing in the input.
 */
function FieldInput({
  id,
  name,
  type,
  label,
  icon: Icon,
  autoComplete,
  minLength,
  required,
  trailing,
  error,
  onValueChange,
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  trailing?: React.ReactNode;
  error?: string;
  onValueChange?: (value: string) => void;
}) {
  return (
    <div className="space-y-0">
      <div
        data-invalid={error ? "true" : undefined}
        className="group/field relative"
      >
        {/* Animated focus glow */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-primary/15 opacity-0 blur-md transition-opacity duration-500 group-data-[focused]/field:opacity-100"
        />

        <div
          className={`relative flex items-center rounded-lg border bg-background/60 transition-all duration-300 hover:border-primary/30 group-data-[focused]/field:border-primary/60 group-data-[focused]/field:bg-background/90 group-data-[focused]/field:shadow-[0_0_0_4px_oklch(0.575_0.205_294/0.12),0_8px_24px_-8px_oklch(0.575_0.205_294/0.35)] ${
            error
              ? "border-destructive/70 shadow-[0_0_0_4px_oklch(0.704_0.191_22.216/0.12)]"
              : "border-border group-data-[has-value]/field:border-primary/40"
          }`}
        >
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center transition-colors duration-300 group-data-[focused]/field:text-primary group-data-[has-value]/field:text-primary ${
              error ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            <Icon className="size-4" />
          </span>

          <Input
            id={id}
            name={name}
            type={type}
            autoComplete={autoComplete}
            minLength={minLength}
            required={required}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            onFocus={(e) => {
              e.currentTarget
                .closest(".group\\/field")
                ?.setAttribute("data-focused", "");
            }}
            onBlur={(e) => {
              e.currentTarget
                .closest(".group\\/field")
                ?.removeAttribute("data-focused");
            }}
            onInput={(e) => {
              const v = (e.target as HTMLInputElement).value;
              e.currentTarget
                .closest(".group\\/field")
                ?.toggleAttribute("data-has-value", v.length > 0);
              onValueChange?.(v);
            }}
            placeholder={label}
            className="h-10 w-full border-0 bg-transparent px-1 text-sm shadow-none ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {trailing && (
            <span className="flex shrink-0 items-center pr-2">{trailing}</span>
          )}
        </div>
      </div>

      <div id={error ? `${id}-error` : undefined} aria-hidden={!error}>
        <FieldError message={error} />
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = React.useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (password.length >= 12) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return Math.min(s, 4);
  }, [password]);

  if (!password) return null;

  const labels = ["Weak", "Fair", "Good", "Strong"];
  const colors = [
    "bg-destructive",
    "bg-orange-500",
    "bg-amber-400",
    "bg-emerald-500",
  ];

  return (
    <div className="mt-2 flex items-center gap-2 text-xs">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score - 1] : "bg-muted"
            }`}
          />
        ))}
      </div>
      <span className="font-medium text-muted-foreground">
        {labels[score - 1] ?? ""}
      </span>
    </div>
  );
}

function PasswordField({
  name: fieldName,
  autoComplete,
  error,
  onValueChange,
}: {
  name: string;
  autoComplete: string;
  error?: string;
  onValueChange?: (value: string) => void;
}) {
  const [show, setShow] = React.useState(false);
  const [value, setValue] = React.useState("");

  const handleChange = (v: string) => {
    setValue(v);
    onValueChange?.(v);
  };

  return (
    <div>
      <FieldInput
        id={fieldName}
        name={fieldName}
        type={show ? "text" : "password"}
        label="Password"
        icon={Lock}
        autoComplete={autoComplete}
        error={error}
        onValueChange={handleChange}
        trailing={
          <div className="flex items-center gap-1">
            {value.length > 0 &&
              (error ? (
                <X className="size-3.5 text-destructive" />
              ) : (
                <Check className="size-3.5 text-emerald-500" />
              ))}
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              tabIndex={-1}
              aria-label={show ? "Hide password" : "Show password"}
              className="grid size-7 place-items-center rounded-md text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground active:scale-95"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        }
      />
      {!error && <PasswordStrength password={value} />}
    </div>
  );
}

// The previous FormError banner was removed: a top-level error is now shown
// both as a Sonner toast (top of page) and as an inline <p> beneath the
// password field, so duplicating it in a white box above the form was noisy.

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction] = useActionState<ActionResult<AuthSuccess>, FormData>(
    action,
    { data: null, error: "" },
  );

  // Client-side validation errors keyed by field name. Populated when the user
  // submits the form with invalid data; cleared as they fix the offending
  // field. These are merged with server-side field errors for display.
  const [clientErrors, setClientErrors] = React.useState<FieldErrors>({});

  // Tracks which fields the user has edited since the last server response, so
  // we can hide their error messages without round-tripping. Cleared whenever
  // a new server response lands so the next submit re-surfaces server errors.
  const [clearedFields, setClearedFields] = React.useState<Set<string>>(
    () => new Set(),
  );

  // Reset the cleared-fields mask every time the server returns a fresh state.
  React.useEffect(() => {
    setClearedFields(new Set());
  }, [state]);

  // Handle the success outcome separately. Using `state.data.kind` as the
  // dependency means this only fires when the action actually succeeds —
  // and the "previously seen" ref prevents it from re-firing on re-renders
  // (e.g. React 19 strict-mode double-invoke).
  //
  // We delay the navigation long enough for Sonner to finish its fade-in
  // animation (~200ms) plus a brief readable pause, so the user actually
  // sees the success message before the page transitions away. Calling
  // router.push synchronously inside the effect races the toast portal and
  // the message disappears in the same frame.
  //
  // The cleanup intentionally does NOT cancel the timeout — under React 19
  // strict mode the effect runs twice in dev, and canceling here would
  // prevent the navigation from ever firing. The ref guard already ensures
  // we only schedule one toast per success result.
  const lastHandledKind = React.useRef<AuthSuccess["kind"] | null>(null);
  React.useEffect(() => {
    if (!state.data) return;
    if (lastHandledKind.current === state.data.kind) return;
    lastHandledKind.current = state.data.kind;

    toast.success(
      state.data.kind === "signed-up"
        ? "Account created — welcome!"
        : "Welcome back!",
      { duration: 2500 },
    );
    window.setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 900);
  }, [state.data, router]);

  // Handle form-level errors (no field binding). Same once-per-result guard.
  // When the server returns both a top-level message and field errors (e.g.
  // "Please fix the errors below."), we still want a toast so users know the
  // submit failed — the inline field messages alone can be easy to miss.
  const lastHandledError = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (state.data) return;
    if (!state.error) return;
    if (lastHandledError.current === state.error) return;
    lastHandledError.current = state.error;
    toast.error(state.error);
  }, [state]);

  const serverFieldErrors = state.fieldErrors ?? {};
  // When the server returns a top-level error with no field binding (e.g.
  // "Invalid email or password."), we still want to surface it inline so
  // it's anchored to the form rather than only floating in a toast. We
  // attach it to the password field since that's the most actionable one
  // for an auth failure.
  const formLevelError =
    Object.keys(serverFieldErrors).length === 0 && state.error
      ? state.error
      : undefined;

  const handleEdit = (name: string) => {
    setClearedFields((prev) => {
      if (prev.has(name)) return prev;
      const next = new Set(prev);
      next.add(name);
      return next;
    });
    // Clear the client error for this field as the user types; it will be
    // re-evaluated on the next submit if still invalid.
    setClientErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = (formData: FormData) => {
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const fe = validateCredentialsClient(email, password);
    if (Object.keys(fe).length > 0) {
      setClientErrors(fe);
      // Reset cleared-fields mask so any server errors are also re-shown if
      // present. Avoids the case where a user submits invalid data and we
      // silently swallow a previously-returned server error.
      setClearedFields(new Set());
      return;
    }

    setClientErrors({});
    formAction(formData);
  };

  const isSignup = mode === "signup";

  // Merge client and server errors. Client errors take precedence while the
  // user is fixing them; once cleared, server errors take over again.
  const mergedFieldErrors: FieldErrors = {
    ...serverFieldErrors,
    ...clientErrors,
  };
  const visibleMergedError = (name: string) =>
    clearedFields.has(name) ? undefined : mergedFieldErrors[name];

  return (
    <form action={handleSubmit} className="space-y-4" noValidate>
      <FieldInput
        id="email"
        name="email"
        type="email"
        label="you@example.com"
        icon={Mail}
        autoComplete="email"
        error={visibleMergedError("email")}
        onValueChange={() => handleEdit("email")}
      />

      <PasswordField
        name="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
        error={visibleMergedError("password") ?? formLevelError}
        onValueChange={() => handleEdit("password")}
      />

      {isSignup &&
        !visibleMergedError("password") &&
        !formLevelError && (
          <p className="-mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-primary" />
            At least 8 characters. Stronger passwords get a green score.
          </p>
        )}

      <SubmitButton label={isSignup ? "Create account" : "Log in"} />

      <div className="relative my-2 flex items-center text-xs uppercase tracking-wider text-muted-foreground/70">
        <span className="h-px flex-1 bg-border" />
        <span className="px-3">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="group/link inline-flex items-center gap-1 font-semibold text-foreground transition-colors duration-200 hover:text-primary"
        >
          {isSignup ? "Log in" : "Create one"}
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5" />
        </Link>
      </p>
    </form>
  );
}