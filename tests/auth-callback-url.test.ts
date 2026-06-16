// @vitest-environment node

import { describe, expect, test } from "vitest";

import {
  getAuthCallbackURL,
  getDefaultAuthCallbackURL,
  getLocalizedPath,
  sanitizeCallbackPath,
} from "@/lib/auth/callback-url";

describe("auth callback URL helpers", () => {
  test("builds canonical default locale paths without an /en prefix", () => {
    expect(getLocalizedPath("en", "/studio")).toBe("/studio");
    expect(getDefaultAuthCallbackURL("en")).toBe("/studio");
  });

  test("builds non-default locale paths with the locale prefix", () => {
    expect(getLocalizedPath("zh", "/studio")).toBe("/zh/studio");
    expect(getDefaultAuthCallbackURL("zh")).toBe("/zh/studio");
  });

  test("uses safe relative from values", () => {
    const params = new URLSearchParams({ from: "/studio?scene=abc" });

    expect(getAuthCallbackURL(params, "en")).toBe("/studio?scene=abc");
  });

  test("rejects absolute external URLs", () => {
    expect(sanitizeCallbackPath("https://evil.com/path", "/studio")).toBe("/studio");
  });

  test("rejects protocol-relative URLs", () => {
    expect(sanitizeCallbackPath("//evil.com/path", "/studio")).toBe("/studio");
  });

  test("rejects auth pages to avoid redirect loops", () => {
    expect(sanitizeCallbackPath("/login", "/studio")).toBe("/studio");
    expect(sanitizeCallbackPath("/register", "/studio")).toBe("/studio");
    expect(sanitizeCallbackPath("/zh/login", "/zh/studio")).toBe("/zh/studio");
    expect(sanitizeCallbackPath("/zh/register", "/zh/studio")).toBe("/zh/studio");
  });
});
