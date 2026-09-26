import { beforeEach, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ updateUser: vi.fn(), changePassword: vi.fn(), signIn: { email: vi.fn() } }));
const currentUser = vi.hoisted(() => vi.fn());
vi.mock("../src/lib/auth/server", () => ({ getAuth: () => auth }));
vi.mock("../src/lib/auth/session", () => ({ getCurrentUser: currentUser }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { updateProfileAction, changePasswordAction } from "../src/actions/profile";
beforeEach(() => { vi.resetAllMocks(); currentUser.mockResolvedValue({ id: "user-a", email: "user@gmail.com" }); auth.signIn.email.mockResolvedValue({ data: { user: { id: "user-a" } }, error: null }); });
it("rejects anonymous profile and password changes", async () => {
  currentUser.mockResolvedValue(null);
  expect((await updateProfileAction({ name: "Name" })).error).toBeTruthy();
  expect((await changePasswordAction({ currentPassword: "old-password", newPassword: "new-password", confirmPassword: "new-password" })).error).toBeTruthy();
  expect(auth.updateUser).not.toHaveBeenCalled(); expect(auth.changePassword).not.toHaveBeenCalled();
});
it("validates name and password confirmation before calling Neon", async () => {
  expect((await updateProfileAction({ name: "  " })).fieldErrors?.name).toBeDefined();
  expect((await changePasswordAction({ currentPassword: "old-password", newPassword: "new-password", confirmPassword: "different" })).fieldErrors?.confirmPassword).toBeDefined();
  expect(auth.updateUser).not.toHaveBeenCalled(); expect(auth.changePassword).not.toHaveBeenCalled();
});
it("only updates the signed-in user's allowed name field", async () => {
  auth.updateUser.mockResolvedValue({ error: null });
  expect((await updateProfileAction({ name: " New Name ", id: "someone-else", email: "other@example.com" })).data).toEqual({ saved: true });
  expect(auth.updateUser).toHaveBeenCalledWith({ name: "New Name" });
});
it("requests revocation of other sessions and does not forward confirmation", async () => {
  auth.changePassword.mockResolvedValue({ error: null });
  expect((await changePasswordAction({ currentPassword: "old-password", newPassword: "new-password", confirmPassword: "new-password" })).error).toBeNull();
  expect(auth.signIn.email).toHaveBeenCalledWith({ email: "user@gmail.com", password: "new-password" });
  expect(auth.changePassword).toHaveBeenCalledWith({ currentPassword: "old-password", newPassword: "new-password", revokeOtherSessions: true });
});
it("sanitizes upstream errors and thrown exceptions", async () => {
  auth.updateUser.mockResolvedValue({ error: { message: "PRIVATE_PROVIDER_DATA" } });
  const result = await updateProfileAction({ name: "Name" });
  expect(result.error).toBeTruthy(); expect(JSON.stringify(result)).not.toContain("PRIVATE_PROVIDER_DATA");
  auth.changePassword.mockRejectedValue(new Error("PRIVATE_PROVIDER_DATA"));
  const password = await changePasswordAction({ currentPassword: "old-password", newPassword: "new-password", confirmPassword: "new-password" });
  expect(password.error).toBeTruthy(); expect(JSON.stringify(password)).not.toContain("PRIVATE_PROVIDER_DATA");
});
it("ignores photo URL fields in name updates", async () => {
  auth.updateUser.mockResolvedValue({ error: null });
  await updateProfileAction({ name: "Name", image: "https://example.com/photo.jpg" });
  expect(auth.updateUser).toHaveBeenCalledWith({ name: "Name" });
});

it("reports a completed password change accurately if session renewal fails", async () => {
  auth.changePassword.mockResolvedValue({ error: null });
  auth.signIn.email.mockRejectedValue(new Error("UPSTREAM_PRIVATE"));
  const result = await changePasswordAction({ currentPassword: "old-password", newPassword: "new-password", confirmPassword: "new-password" });
  expect(result).toEqual({ data: { saved: true, requiresSignIn: true }, error: null });
});
