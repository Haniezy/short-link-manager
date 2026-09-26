import { beforeEach, expect, it, vi } from "vitest";
import sharp from "sharp";
const current = vi.hoisted(() => vi.fn());
const save = vi.hoisted(() => vi.fn());
vi.mock("../src/lib/auth/session", () => ({ getCurrentUser: current }));
vi.mock("../src/lib/db/avatars", () => ({ saveAvatar: save }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { updateAvatarAction } from "../src/actions/avatar";
beforeEach(() => { vi.resetAllMocks(); current.mockResolvedValue({ id: "owner-a" }); save.mockResolvedValue("/avatars/test"); });
function upload(file: File) { const data = new FormData(); data.set("mode", "upload"); data.set("photo", file); data.set("userId", "someone-else"); return data; }
it("decodes, resizes and stores only for the signed-in owner", async () => {
  const png = await sharp({ create: { width: 640, height: 480, channels: 3, background: "#9279ef" } }).png().toBuffer();
  const result = await updateAvatarAction(upload(new File([new Uint8Array(png)], "photo.png", { type: "image/png" })));
  expect(result.error).toBeNull();
  expect(save.mock.calls[0][0]).toBe("owner-a");
  const meta = await sharp(save.mock.calls[0][1]).metadata();
  expect(meta.format).toBe("webp"); expect(meta.width).toBe(256); expect(meta.height).toBe(256);
});
it("rejects forged images, SVG and oversized uploads before storing", async () => {
  for (const file of [new File(["fake"], "photo.png", { type: "image/png" }), new File(["<svg/>"], "photo.svg", { type: "image/svg+xml" }), new File([new Uint8Array(512 * 1024 + 1)], "large.jpg", { type: "image/jpeg" })]) {
    expect((await updateAvatarAction(upload(file))).error).toBeTruthy();
  }
  expect(save).not.toHaveBeenCalled();
});
it("requires authentication and removes only the current user's photo", async () => {
  const data = new FormData(); data.set("mode", "remove");
  current.mockResolvedValue(null); expect((await updateAvatarAction(data)).error).toBeTruthy(); expect(save).not.toHaveBeenCalled();
  current.mockResolvedValue({ id: "owner-a" }); await updateAvatarAction(data); expect(save).toHaveBeenCalledWith("owner-a", null);
});
