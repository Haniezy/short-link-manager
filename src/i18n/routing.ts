export const routing = {
  locales: ["en", "fa"],
  defaultLocale: "en",
  localePrefix: "as-needed",
} as const;

export type Locale = (typeof routing.locales)[number];