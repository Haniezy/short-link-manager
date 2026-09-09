"use client";

import Image from "next/image";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  UserRound,
  ShieldCheck,
  SlidersHorizontal,
  Link2,
  CalendarDays,
  Activity,
  Check,
  Moon,
  Sun,
  Camera,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProfile, changeProfilePassword } from "@/lib/actions/profile";
import { toast } from "sonner";

const subscribe = () => () => {};

type Profile = { displayName: string; avatarUrl: string; bio: string };
function Section({
  title,
  hint,
  icon,
  children,
}: {
  title: string;
  hint: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-7">
      <div className="mb-7 flex items-start gap-3">
        <span className="rounded-2xl bg-primary/10 p-3 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
export function ProfilePage({
  email,
  initial,
  stats,
}: {
  email: string;
  initial: Profile;
  stats: { count: number; joined: string | null; lastActivity: string | null };
}) {
  const t = useTranslations("profile");
  const locale = useLocale();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const { resolvedTheme, setTheme } = useTheme();
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [visible, setVisible] = useState(false);
  const [brokenImage, setBrokenImage] = useState("");
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const date = (value: string | null, fallback: string) =>
    value
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "medium",
          timeZone: "UTC",
        }).format(new Date(value))
      : fallback;
  const fieldClass =
    "space-y-2 rounded-2xl border border-border/60 bg-background/50 p-4";
  return (
    <div className="mx-auto w-full max-w-5xl py-2">
      <Link
        href="/dashboard"
        className="mb-7 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {t("back")}
      </Link>
      <div className="mb-7">
        <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>
      <section className="relative mb-7 overflow-hidden rounded-[2rem] border border-primary/15 bg-card shadow-sm">
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[#30234f] via-[#514078] to-[#776098] sm:h-48">
          <div
            aria-hidden
            className="absolute -end-12 -top-40 size-96 rounded-full border-[45px] border-white/5"
          />
          <div
            aria-hidden
            className="absolute start-1/3 top-20 size-72 rounded-full border border-white/10"
          />
          <p className="relative px-7 pt-7 text-sm font-medium text-purple-100 sm:px-9">
            {t("hello")}
          </p>
        </div>
        <div className="relative flex flex-col gap-5 px-6 pb-8 sm:flex-row sm:items-start sm:gap-7 sm:px-9">
          <a
            href="#avatar"
            aria-label={t("avatar")}
            className="group relative -mt-16 flex h-36 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] border-[5px] border-card bg-secondary text-4xl font-bold text-primary shadow-lg sm:h-44 sm:w-40"
          >
            {saved.avatarUrl && brokenImage !== saved.avatarUrl ? (
              <Image
                unoptimized
                width={160}
                height={176}
                src={saved.avatarUrl}
                alt={t("photoAlt")}
                referrerPolicy="no-referrer"
                onError={() => setBrokenImage(saved.avatarUrl)}
                className="h-full w-full object-cover"
              />
            ) : (
              saved.displayName.slice(0, 1).toUpperCase()
            )}
            <span className="absolute inset-x-0 bottom-0 flex justify-center bg-black/40 py-2 text-white">
              <Camera className="size-4" />
            </span>
          </a>
          <div className="min-w-0 flex-1 sm:pt-5">
            <h2 className="break-words text-2xl font-bold">
              {saved.displayName}
            </h2>
            <p
              dir="ltr"
              className="mt-1 break-all text-start rtl:text-right text-sm text-muted-foreground"
            >
              {email}
            </p>
            <p className="mt-4 max-w-xl whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground">
              {saved.bio || t("emptyBio")}
            </p>
          </div>
        </div>
      </section>
      <div className="mb-7 grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: <Link2 />,
            label: t("links"),
            value: new Intl.NumberFormat(locale).format(stats.count),
          },
          {
            icon: <CalendarDays />,
            label: t("joined"),
            value: date(stats.joined, t("unknown")),
          },
          {
            icon: <Activity />,
            label: t("activity"),
            value: date(stats.lastActivity, t("none")),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5"
          >
            <span className="text-primary [&>svg]:size-5">{item.icon}</span>
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-sm font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Section
          title={t("personal")}
          hint={t("personalHint")}
          icon={<UserRound className="size-5" />}
        >
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              try {
                const result = await saveProfile(draft);
                if (result.error) toast.error(t(result.error));
                else {
                  setSaved({
                    ...draft,
                    displayName: draft.displayName.trim(),
                    bio: draft.bio.trim(),
                  });
                  setDraft({
                    ...draft,
                    displayName: draft.displayName.trim(),
                    bio: draft.bio.trim(),
                  });
                  toast.success(t("saved"));
                }
              } catch {
                toast.error(t("failed"));
              } finally {
                setBusy(false);
              }
            }}
          >
            <fieldset disabled={busy} className="space-y-4">
              <div className={fieldClass}>
                <label htmlFor="displayName" className="text-sm font-medium">
                  {t("name")}
                </label>
                <Input
                  id="displayName"
                  autoComplete="nickname"
                  required
                  maxLength={80}
                  value={draft.displayName}
                  onChange={(e) =>
                    setDraft({ ...draft, displayName: e.target.value })
                  }
                />
              </div>
              <div className={fieldClass}>
                <label htmlFor="email" className="text-sm font-medium">
                  {t("email")}
                </label>
                <Input
                  id="email"
                  dir="ltr"
                  readOnly
                  value={email}
                  aria-describedby="email-hint"
                  className="text-muted-foreground"
                />
                <p
                  id="email-hint"
                  className="text-xs leading-6 text-muted-foreground"
                >
                  {t("emailHint")}
                </p>
              </div>
              <div className={fieldClass}>
                <label htmlFor="avatar" className="text-sm font-medium">
                  {t("avatar")}
                </label>
                <Input
                  id="avatar"
                  type="url"
                  dir="ltr"
                  maxLength={2048}
                  placeholder="https://…"
                  value={draft.avatarUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, avatarUrl: e.target.value })
                  }
                  aria-describedby="avatar-hint"
                />
                <p id="avatar-hint" className="text-xs text-muted-foreground">
                  {t("avatarHint")}
                </p>
              </div>
              <div className={fieldClass}>
                <label htmlFor="bio" className="text-sm font-medium">
                  {t("bio")}
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  maxLength={400}
                  value={draft.bio}
                  onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                  className="w-full resize-y rounded-xl border border-input bg-transparent px-3 py-2 text-sm leading-7 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                />
                <p className="text-end text-xs text-muted-foreground">
                  {new Intl.NumberFormat(locale).format(draft.bio.length)} /{" "}
                  {new Intl.NumberFormat(locale).format(400)}
                </p>
              </div>
              <div aria-live="polite" className="text-xs text-muted-foreground">
                {dirty ? t("unsaved") : ""}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={!dirty || busy}>
                  <Check className="size-4" />
                  {busy ? t("saving") : t("save")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!dirty || busy}
                  onClick={() => setDraft(saved)}
                >
                  {t("cancel")}
                </Button>
              </div>
            </fieldset>
          </form>
        </Section>
        <div className="space-y-6">
          <Section
            title={t("preferences")}
            hint={t("preferencesHint")}
            icon={<SlidersHorizontal className="size-5" />}
          >
            <p className="mb-3 text-sm font-medium">{t("theme")}</p>
            <div className="grid grid-cols-2 gap-2">
              {(["light", "dark"] as const).map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  onClick={() => setTheme(value)}
                  className="h-12"
                  aria-pressed={mounted && resolvedTheme === value}
                >
                  {value === "light" ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                  {t(value)}
                </Button>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t pt-5">
              <span className="text-sm font-medium">{t("language")}</span>
              <LanguageToggle />
            </div>
          </Section>
          <Section
            title={t("security")}
            hint={t("securityHint")}
            icon={<ShieldCheck className="size-5" />}
          >
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                if (passwords.next !== passwords.confirm) {
                  toast.error(t("mismatch"));
                  return;
                }
                setPasswordBusy(true);
                try {
                  const result = await changeProfilePassword(
                    passwords.current,
                    passwords.next,
                  );
                  if (result.error) toast.error(t(result.error));
                  else {
                    setPasswords({ current: "", next: "", confirm: "" });
                    toast.success(t("passwordSaved"));
                  }
                } catch {
                  toast.error(t("failed"));
                } finally {
                  setPasswordBusy(false);
                }
              }}
            >
              <fieldset
                disabled={passwordBusy}
                className="space-y-4 disabled:opacity-60"
              >
                {(["current", "next", "confirm"] as const).map((key) => (
                  <div key={key} className="space-y-2">
                    <label
                      htmlFor={`password-${key}`}
                      className="text-sm font-medium"
                    >
                      {t(key)}
                    </label>
                    <Input
                      id={`password-${key}`}
                      type={visible ? "text" : "password"}
                      dir="ltr"
                      required
                      minLength={key === "current" ? 1 : 8}
                      maxLength={128}
                      autoComplete={
                        key === "current" ? "current-password" : "new-password"
                      }
                      value={passwords[key]}
                      onChange={(e) =>
                        setPasswords({ ...passwords, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
                <p className="text-xs leading-6 text-muted-foreground">
                  {t("passwordHint")}
                </p>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                  />
                  {t("show")}
                </label>
                <Button type="submit" variant="outline" className="w-full">
                  {passwordBusy ? t("saving") : t("change")}
                </Button>
              </fieldset>
            </form>
            <div className="mt-6 border-t pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-medium">{t("twoFactor")}</h3>
                <input
                  type="checkbox"
                  role="switch"
                  checked={false}
                  disabled
                  aria-label={t("twoFactor")}
                />
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {t("twoFactorHint")}
              </p>
              <span className="mt-2 inline-block rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                {t("unavailable")}
              </span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
