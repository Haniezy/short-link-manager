import { beforeEach, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({
  signUp: { email: vi.fn() }, signIn: { email: vi.fn() }, signOut: vi.fn(),
}));
vi.mock("../src/lib/auth/server", () => ({ getAuth: () => auth }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { registerAction, loginAction, logoutAction } from "../src/actions/auth";

beforeEach(() => { vi.resetAllMocks(); });
it("normalizes email and delegates password auth to Neon", async () => {
  auth.signUp.email.mockResolvedValue({ data: { user: { email: "user@gmail.com" }, token: "token" }, error: null });
  const result = await registerAction({ email: " USER@GMAIL.COM ", password: "long-password", confirmPassword: "long-password" });
  expect(auth.signUp.email).toHaveBeenCalledWith({
    email: "user@gmail.com", password: "long-password", name: "user",
  });
  expect(result.data?.requiresEmailVerification).toBe(false);
});
it("reports required email verification instead of claiming a session", async () => {
  auth.signUp.email.mockResolvedValue({ data: { user: { email: "user@gmail.com" }, token: null }, error: null });
  expect((await registerAction({ email: "user@gmail.com", password: "long-password", confirmPassword: "long-password" })).data?.requiresEmailVerification).toBe(true);
});
it("validates both auth forms before contacting the provider", async () => {
  expect((await registerAction({ email: "invalid", password: "short" })).fieldErrors).toBeDefined();
  expect((await loginAction({ email: "user@gmail.com", password: "" })).error).toBeTruthy();
  expect(auth.signUp.email).not.toHaveBeenCalled();
  expect(auth.signIn.email).not.toHaveBeenCalled();
});
it("never returns raw auth provider errors", async () => {
  auth.signIn.email.mockResolvedValue({ data: null, error: { message: "PRIVATE_UPSTREAM_DETAILS" } });
  const result = await loginAction({ email: "user@gmail.com", password: "password" });
  expect(result.error).toBeTruthy();
  expect(JSON.stringify(result)).not.toContain("PRIVATE_UPSTREAM_DETAILS");
});
it("does not claim logout succeeded when Neon rejected it", async () => {
  auth.signOut.mockResolvedValue({ error: { message: "PRIVATE_UPSTREAM_DETAILS" } });
  expect((await logoutAction()).error).toBeTruthy();
  auth.signOut.mockResolvedValue({ error: null });
  expect(await logoutAction()).toEqual({ data: null, error: null });
});

it("rejects missing or mismatched password confirmation before contacting Neon", async () => {
  for (const confirmPassword of [undefined, "different-password"]) {
    const result = await registerAction({ email: "user@gmail.com", password: "long-password", confirmPassword });
    expect(result.fieldErrors?.confirmPassword).toBeDefined();
    expect(result.data).toBeNull();
  }
  expect(auth.signUp.email).not.toHaveBeenCalled();
});

it("rejects non-Gmail signup addresses before contacting Neon", async () => {
  for (const email of ["user@mi.com", "user@yahoo.com", "user@gmail", "user@gmail.com.evil.com", "user@sub.gmail.com"]) {
    const result = await registerAction({ email, password: "long-password", confirmPassword: "long-password" });
    expect(result.fieldErrors?.email).toBeDefined();
    expect(result.data).toBeNull();
  }
  expect(auth.signUp.email).not.toHaveBeenCalled();
});
