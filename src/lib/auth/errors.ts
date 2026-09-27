const UNAUTHENTICATED_CODES = new Set([
  "bad_jwt",
  "invalid_credentials",
  "session_expired",
  "session_not_found",
]);

type AuthFailure = { message?: string; status?: number; statusText?: string; code?: string };

function readStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const status = (error as AuthFailure).status;
  return typeof status === "number" ? status : undefined;
}

/**
 * A revoked, expired or malformed session is an ordinary signed-out state, not a service
 * outage. Treating the two differently keeps "your session ended" from being reported
 * as "the service is unavailable" after a password change revokes other sessions.
 */
export function isUnauthenticatedError(error: unknown): boolean {
  if (error === null || error === undefined) return false;
  if (readStatus(error) === 401) return true;
  if (typeof error !== "object") return false;
  const code = (error as AuthFailure).code;
  return typeof code === "string" && UNAUTHENTICATED_CODES.has(code.toLowerCase());
}
