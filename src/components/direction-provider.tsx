"use client";

import * as React from "react";
import { DirectionProvider as BaseDirectionProvider } from "@base-ui/react/direction-provider";

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

  return (
    <BaseDirectionProvider direction={locale === "fa" ? "rtl" : "ltr"}>
      {children}
    </BaseDirectionProvider>
  );
}
