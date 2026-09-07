"use client";

import * as React from "react";

export function DirectionProvider({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
    document.documentElement.lang = locale;
  }, [locale]);

  return <>{children}</>;
}
