import { expect, it } from "vitest";
import { isUnauthenticatedError } from "../src/lib/auth/errors";
import { safeReturnPath } from "../src/lib/validation";

it("treats a revoked or expired session as signed out rather than an outage", () => {
  expect(isUnauthenticatedError({ status: 401, code: "session_not_found" })).toBe(true);
  expect(isUnauthenticatedError({ status: 401, code: "session_expired" })).toBe(true);
  expect(isUnauthenticatedError({ status: 401, code: "bad_jwt" })).toBe(true);
  expect(isUnauthenticatedError({ code: "invalid_credentials" })).toBe(true);
});

it("still reports genuine upstream failures as outages", () => {
  expect(isUnauthenticatedError({ code: "network_timeout" })).toBe(false);
  expect(isUnauthenticatedError({ code: "network_dns" })).toBe(false);
  expect(isUnauthenticatedError({ status: 500, code: "internal_error" })).toBe(false);
  expect(isUnauthenticatedError({ status: 429, code: "over_request_rate_limit" })).toBe(false);
  expect(isUnauthenticatedError(new Error("fetch failed"))).toBe(false);
  expect(isUnauthenticatedError(null)).toBe(false);
  expect(isUnauthenticatedError(undefined)).toBe(false);
});

it("keeps internal deep links after signing in", () => {
  expect(safeReturnPath("/dashboard/links/6f1c2b3a-1111-4222-8333-444455556666")).toBe(
    "/dashboard/links/6f1c2b3a-1111-4222-8333-444455556666",
  );
  expect(safeReturnPath("/dashboard?page=3")).toBe("/dashboard?page=3");
  expect(safeReturnPath("/dashboard/profile")).toBe("/dashboard/profile");
  expect(safeReturnPath("/dashboard", "/signup")).toBe("/dashboard");
});

it("refuses return targets that would leave the site", () => {
  for (const hostile of [
    "https://evil.example/steal",
    "//evil.example/steal",
    "/\\evil.example/steal",
    "\\\\evil.example/steal",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "dashboard",
    "",
    "/dashboard\nSet-Cookie: a=b",
  ]) {
    expect(safeReturnPath(hostile)).toBe("/dashboard");
  }
  expect(safeReturnPath(undefined, "/signup")).toBe("/signup");
  expect(safeReturnPath(["/dashboard/profile", "/evil"])).toBe("/dashboard/profile");
  expect(safeReturnPath(`/${"a".repeat(3000)}`)).toBe("/dashboard");
});
