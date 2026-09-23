import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { AuthOverlaySlot } from "@/components/auth/auth-overlay";
import { Providers } from "@/components/providers";
import { readLocale } from "@/lib/locale-server";
import "./globals.css";
const latin = Manrope({ variable: "--font-latin", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const persian = Noto_Sans_Arabic({ variable: "--font-persian", subsets: ["arabic", "latin"], display: "swap" });
export async function generateMetadata(): Promise<Metadata> {
  const locale = await readLocale();
  return {
    title: { default: locale === "fa" ? "LinkFlow | لینک‌های کوتاه‌تر، ارتباط‌های بهتر" : "LinkFlow | Shorter links. Better connections.", template: "%s | LinkFlow" },
    description: locale === "fa" ? "لینک‌های کوتاه بسازید و آمار کلیک‌ها را ببینید." : "Create memorable short links and follow every click.",
  };
}
export default async function RootLayout({ children, auth }: { children: ReactNode; auth: ReactNode }) {
  const locale = await readLocale();
  return <html lang={locale} dir={locale === "fa" ? "rtl" : "ltr"} suppressHydrationWarning className={`${latin.variable} ${geistMono.variable} ${persian.variable}`}>
    <body><Providers>{children}<AuthOverlaySlot locale={locale}>{auth}</AuthOverlaySlot></Providers></body>
  </html>;
}
