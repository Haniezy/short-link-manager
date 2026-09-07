import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? routing.defaultLocale;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  return {
    locale: locale as (typeof routing.locales)[number],
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});