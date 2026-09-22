"use client";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copy, type Locale } from "@/lib/locale";
export function DisplayControls({ locale }: { locale: Locale }) {
  const { resolvedTheme, setTheme } = useTheme(), router = useRouter();
  function toggleLanguage() {
    const next = locale === "fa" ? "en" : "fa";
    document.cookie = "linkflow-locale=" + next + ";path=/;max-age=31536000;SameSite=Lax";
    router.refresh();
  }
  return <div className="display-controls">
    <Button variant="ghost" className="language-toggle" onClick={toggleLanguage} aria-label={copy[locale].language}><span className={locale === "fa" ? "selected-language" : ""}>FA</span><span className="language-divider">/</span><span className={locale === "en" ? "selected-language" : ""}>EN</span></Button>
    <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label={copy[locale].theme}>
      <Moon className="dark:hidden" size={17} /><Sun className="hidden dark:block" size={17} />
    </Button>
  </div>;
}
