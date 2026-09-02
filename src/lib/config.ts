/**
 * Base URL of the deployed app, used to build full short URLs for copy/share.
 * Falls back to localhost during local development.
 */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

/** Build the full public short URL for a slug, e.g. https://site.com/r/abc123 */
export function shortUrl(slug: string): string {
  return `${BASE_URL}/r/${slug}`;
}
