import { randomBytes } from "crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Generate a random, URL-safe slug of the given length (default 6).
 * Uses crypto for unpredictability; collisions are caught by the unique
 * constraint on insert and the action retries with a fresh slug.
 */
export function generateSlug(length = 6): string {
  const bytes = randomBytes(length);
  let slug = "";
  for (let i = 0; i < length; i += 1) {
    slug += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return slug;
}
