import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { saveLinkDraft, readLinkDraft, clearLinkDraft } from "../src/lib/link-draft";
beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal("sessionStorage", { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) });
});
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });
it("retains the URL across auth and clears it after creation", () => {
  saveLinkDraft("https://example.com/article");
  expect(readLinkDraft()).toBe("https://example.com/article");
  clearLinkDraft();
  expect(readLinkDraft()).toBe("");
});
it("ignores unsafe and expired drafts", () => {
  saveLinkDraft("javascript:alert(1)");
  expect(readLinkDraft()).toBe("");
  vi.useFakeTimers(); saveLinkDraft("https://example.com");
  vi.advanceTimersByTime(31 * 60 * 1000);
  expect(readLinkDraft()).toBe("");
});
it("does not break forms when storage is unavailable", () => {
  vi.stubGlobal("sessionStorage", { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); }, removeItem: () => { throw new Error("blocked"); } });
  expect(() => saveLinkDraft("https://example.com")).not.toThrow();
  expect(readLinkDraft()).toBe("");
  expect(() => clearLinkDraft()).not.toThrow();
});
