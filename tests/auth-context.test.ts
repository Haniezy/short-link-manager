import { expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ cookie: "__Secure-neon-auth.session_token=old-token", set: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ toString: () => state.cookie, set: state.set }),
  headers: async () => new Headers({ cookie: "__Secure-neon-auth.session_token=old-token", origin: "http://localhost:3000" }),
}));
import { authRequestContext } from "../src/lib/auth/request-context";
it("reads the rotated session cookie even when request headers still have the revoked token", async () => {
  const context = await authRequestContext();
  expect(context.getCookies()).toContain("old-token");
  state.cookie = "__Secure-neon-auth.session_token=new-token; unrelated=private";
  expect(context.getCookies()).toContain("new-token");
  expect(context.getCookies()).not.toContain("old-token");
  expect(context.getCookies()).not.toContain("unrelated");
  expect(context.getOrigin()).toBe("http://localhost:3000");
});
