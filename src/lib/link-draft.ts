import { destinationSchema } from "./validation";

const key = "linkflow-link-draft";
const maxAge = 30 * 60 * 1000;

export function saveLinkDraft(url: string) {
  try { sessionStorage.setItem(key, JSON.stringify({ url, savedAt: Date.now() })); } catch { /* Storage may be disabled. */ }
}
export function readLinkDraft(): string {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (!value || typeof value.savedAt !== "number" || Date.now() - value.savedAt > maxAge) return "";
    const parsed = destinationSchema.safeParse(value.url);
    return parsed.success ? parsed.data : "";
  } catch { return ""; }
}
export function clearLinkDraft() {
  try { sessionStorage.removeItem(key); } catch { /* Storage may be disabled. */ }
}
