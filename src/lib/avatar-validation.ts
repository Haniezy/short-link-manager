import { z } from "zod";
export const avatarFileSchema = z.file().min(1, "Choose a photo.").max(512 * 1024, "Photo must be smaller than 512 KB.").mime(["image/jpeg", "image/png", "image/webp"], "Choose a JPG, PNG or WebP photo.");
