import { z } from "zod";
import { slugSchema } from "./validation";

export function getShortUrl(slug: string): string {
  slugSchema.parse(slug);
  const base = z.url().parse(process.env.NEXT_PUBLIC_APP_URL);
  const url = new URL(base);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("Application URL is not configured correctly.");
  }
  return new URL(`/r/${slug}`, url.origin).toString();
}
