import { getTranslations } from "next-intl/server";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

// Route Handlers do not render not-found.tsx. Return an actual HTML document
// with a 404 status, without a redirect or a client-side app bootstrap.
export async function notFoundResponse(locale: string): Promise<Response> {
  const language = locale === "fa" ? "fa" : "en";
  const t = await getTranslations({ locale: language, namespace: "notFound" });
  const prefix = language === "fa" ? "/fa" : "";
  return new Response(`<!doctype html>
<html lang="${language}" dir="${language === "fa" ? "rtl" : "ltr"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>404 · ${escapeHtml(t("title"))} · ShortLink</title>
<style>
:root{color-scheme:light;--bg:#faf5ff;--fg:#241b35;--muted:#685b7b;--primary:#7950d8}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){color-scheme:dark;--bg:#120e20;--fg:#eee9f8;--muted:#b2a7c6;--primary:#b395ff}}
:root[data-theme=dark]{color-scheme:dark;--bg:#120e20;--fg:#eee9f8;--muted:#b2a7c6;--primary:#b395ff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:1rem/1.8 system-ui,sans-serif;min-height:100dvh;display:grid;place-items:center;padding:1.5rem}
main{max-width:34rem;text-align:center}header{color:var(--primary);font-weight:700}h1{font-size:clamp(1.5rem,6vw,2.2rem);line-height:1.5;margin:.5rem 0}p{color:var(--muted)}nav{display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;margin-top:2rem}a{color:var(--primary);text-underline-offset:.3em;padding:.5rem}a:focus-visible{outline:2px solid var(--primary);outline-offset:4px;border-radius:.25rem}
</style>
<script>try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch{}</script>
</head><body><main><header>ShortLink · 404</header><h1>${escapeHtml(t("title"))}</h1><p>${escapeHtml(t("desc"))}</p><nav><a href="${prefix || "/"}">${escapeHtml(t("home"))}</a><a href="${prefix}/dashboard">${escapeHtml(t("dashboard"))}</a></nav></main></body></html>`, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
