"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowRight,
  Link2,
  Loader2,
  Type,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createLinkAction } from "@/lib/actions/links";
import type { ActionResult } from "@/lib/result";
import type { LinkWithClicks } from "@/lib/db/queries";

function SubmitButton() {
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
          Creating…
        </>
      ) : (
        <>
          Create short link
          <ArrowRight className="ml-1 size-4 transition-transform duration-300 group-hover/submit:translate-x-0.5" />
        </>
      )}
    </Button>
  );
}

function FieldError({ message }: { message?: string }) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className={`field-error mt-1.5 flex items-start gap-1.5 overflow-hidden text-xs text-destructive transition-all duration-300 ${
        message
          ? "max-h-6 translate-y-0 opacity-100"
          : "max-h-0 -translate-y-1 opacity-0"
      }`}
    >
      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      <span className="leading-tight">{message ?? "placeholder"}</span>
    </p>
  );
}

/**
 * Input with leading icon and inline error row, matching the style used in
 * the auth form.
 */
function FieldInput({
  id,
  name,
  type,
  label,
  icon: Icon,
  prefix,
  required,
  pattern,
  maxLength,
  error,
  onValueChange,
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prefix?: string;
  required?: boolean;
  pattern?: string;
  maxLength?: number;
  error?: string;
  onValueChange?: () => void;
}) {
  return (
    <div className="space-y-0">
      <div
        data-invalid={error ? "true" : undefined}
        className="group/field relative"
      >
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

          {prefix && (
            <span className="text-sm text-muted-foreground">{prefix}</span>
          )}

          <Input
            id={id}
            name={name}
            type={type}
            required={required}
            pattern={pattern}
            maxLength={maxLength}
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
              onValueChange?.();
            }}
            placeholder={label}
            className="h-10 w-full border-0 bg-transparent px-1 text-sm shadow-none ring-0 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </div>

      <div id={error ? `${id}-error` : undefined} aria-hidden={!error}>
        <FieldError message={error} />
      </div>
    </div>
  );
}

export function LinkForm() {
  const router = useRouter();
  const [state, formAction] = useActionState<
    ActionResult<LinkWithClicks>,
    FormData
  >(
    async (_prev, formData) => {
      const input = {
        destinationUrl: String(formData.get("destinationUrl") ?? ""),
        slug: String(formData.get("slug") ?? "") || undefined,
        title: String(formData.get("title") ?? "") || undefined,
      };
      return createLinkAction(input);
    },
    { data: null, error: "" },
  );

  const [clearedFields, setClearedFields] = React.useState<Set<string>>(
    () => new Set(),
  );

  // Reset the cleared-fields mask every time the server returns a fresh state.
  React.useEffect(() => {
    setClearedFields(new Set());
  }, [state]);

  // Handle the success outcome separately. Using `state.data` as the
  // dependency means this only fires when the action actually succeeds —
  // and the "previously seen" ref prevents it from re-firing on re-renders.
  const lastHandledData = React.useRef<LinkWithClicks | null>(null);
  React.useEffect(() => {
    if (!state.data) return;
    if (lastHandledData.current === state.data) return;
    lastHandledData.current = state.data;
    toast.success("Short link created!");
    router.push("/dashboard");
    router.refresh();
  }, [state.data, router]);

  // Handle form-level errors (no field binding). Same once-per-result guard.
  const lastHandledError = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (state.data) return;
    if (!state.error || state.fieldErrors) return;
    if (lastHandledError.current === state.error) return;
    lastHandledError.current = state.error;
    toast.error(state.error);
  }, [state]);

  const serverFieldErrors = state.fieldErrors ?? {};
  const visibleFieldError = (name: string) =>
    clearedFields.has(name) ? undefined : serverFieldErrors[name];
  const visibleFormError =
    !serverFieldErrors.destinationUrl && !serverFieldErrors.slug && state.error
      ? state.error
      : undefined;

  const handleEdit = (name: string) => {
    setClearedFields((prev) => {
      if (prev.has(name)) return prev;
      const next = new Set(prev);
      next.add(name);
      return next;
    });
  };

  if (state.data) return null;

  return (
    <form action={formAction} className="space-y-4">
      {visibleFormError && (
        <div
          role="alert"
          aria-live="assertive"
          className="form-error flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="leading-snug">{visibleFormError}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="destinationUrl" className="text-sm font-medium">
          Destination URL
        </label>
        <FieldInput
          id="destinationUrl"
          name="destinationUrl"
          type="url"
          label="https://example.com/very/long/path"
          icon={Link2}
          required
          error={visibleFieldError("destinationUrl")}
          onValueChange={() => handleEdit("destinationUrl")}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="slug" className="text-sm font-medium">
          Custom slug{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <FieldInput
          id="slug"
          name="slug"
          type="text"
          label="auto-generated"
          icon={Type}
          prefix="/r/"
          pattern="[a-zA-Z0-9-]+"
          error={visibleFieldError("slug")}
          onValueChange={() => handleEdit("slug")}
        />
        <p className="text-xs text-muted-foreground">
          Letters, numbers, and dashes. Leave blank to get a random 6-character
          slug.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Title{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <FieldInput
          id="title"
          name="title"
          type="text"
          label="My awesome link"
          icon={Type}
          maxLength={120}
          error={visibleFieldError("title")}
          onValueChange={() => handleEdit("title")}
        />
      </div>

      <SubmitButton />
    </form>
  );
}