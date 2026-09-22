// Route Handlers return their own HTML; React error/not-found boundaries do not render here.
export function httpError(status: 404 | 503, head = false): Response {
  const title = status === 404 ? "Link not found" : "Temporarily unavailable";
  const message = status === 404
    ? "This short link does not exist or has been deleted."
    : "We could not open this link. Please try again in a moment.";
  return new Response(head ? null : `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title} | Short Link Manager</title><style>:root{color-scheme:light dark}body{font-family:system-ui,sans-serif;min-height:100svh;display:grid;place-items:center;margin:0;padding:24px;box-sizing:border-box}main{max-width:36rem}p{line-height:1.7}a{color:inherit}</style></head><body><main><p>${status}</p><h1>${title}</h1><p>${message}</p><a href="/dashboard">Go to dashboard</a></main></body></html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(status === 503 ? { "Retry-After": "30" } : {}),
    },
  });
}
