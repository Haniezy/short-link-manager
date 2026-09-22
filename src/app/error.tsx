"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 px-6 text-center">
    <h1 className="text-2xl font-bold">LinkFlow</h1>
    <p lang="fa" dir="rtl">بارگذاری صفحه انجام نشد. لطفاً دوباره تلاش کنید.</p>
    <p lang="en" dir="ltr">We couldn’t load this page. Please try again.</p>
    <Button onClick={reset}>تلاش دوباره · Try again</Button>
  </main>;
}
