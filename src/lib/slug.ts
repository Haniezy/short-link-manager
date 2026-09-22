import { randomInt } from "node:crypto";
const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
export function generateSlug(): string {
  let slug = "";
  for (let i = 0; i < 6; i++) slug += ALPHABET[randomInt(ALPHABET.length)];
  return slug;
}
