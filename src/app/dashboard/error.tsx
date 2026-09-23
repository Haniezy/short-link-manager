"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { toast.error(document.documentElement.lang === "fa" ? "بارگذاری اطلاعات انجام نشد؛ دوباره تلاش کنید." : "Could not load your data. Please try again.", { id: "dashboard-load-error" }); }, []);
  return <main className="dashboard-main dashboard-empty"><h1>LinkFlow</h1><p lang="fa" dir="rtl">بارگذاری اطلاعات انجام نشد. لطفاً دوباره تلاش کنید.</p><p lang="en" dir="ltr">We couldn’t load your data. Please try again.</p><Button onClick={reset}>تلاش دوباره · Try again</Button></main>;
}
