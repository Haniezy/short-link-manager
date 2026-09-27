import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ session: vi.fn(), avatar: vi.fn() }));
vi.mock("../src/lib/auth/server", () => ({ getAuth: () => ({ getSession: mocks.session }) }));
vi.mock("../src/lib/db/avatars", () => ({ getAvatarUrl: mocks.avatar }));
vi.mock("react", () => ({ cache: (fn: unknown) => fn }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
import { getCurrentUser } from "../src/lib/auth/session";
beforeEach(() => vi.resetAllMocks());
it("keeps a verified user signed in when photo storage fails", async () => {
  mocks.session.mockResolvedValue({ data: { user: { id: "user", email: "test@gmail.com", name: "Test" } }, error: null });
  mocks.avatar.mockRejectedValue(new Error("Database unavailable"));
  expect(await getCurrentUser()).toMatchObject({ id: "user", image: null });
});
it("still rejects authentication errors without querying photos", async () => {
  mocks.session.mockResolvedValue({ data: null, error: new Error("Provider unavailable") });
  await expect(getCurrentUser()).rejects.toThrow("Authentication is temporarily unavailable.");
  expect(mocks.avatar).not.toHaveBeenCalled();
});
it("does not treat an anonymous visitor as authenticated", async () => {
  mocks.session.mockResolvedValue({ data: null, error: null });
  expect(await getCurrentUser()).toBeNull();
  expect(mocks.avatar).not.toHaveBeenCalled();
});
