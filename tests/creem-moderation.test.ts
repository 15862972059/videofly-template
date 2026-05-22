// @vitest-environment node

import { afterEach, describe, expect, test, vi } from "vitest";

import {
  CreemModerationRejectedError,
  CreemModerationUnavailableError,
  assertCreemPromptAllowed,
  resolveCreemModerationBaseUrl,
} from "@/services/moderation/creem";

describe("Creem prompt moderation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("uses the sandbox moderation endpoint for test keys", () => {
    expect(resolveCreemModerationBaseUrl("creem_test_abc")).toBe(
      "https://test-api.creem.io"
    );
  });

  test("uses the production moderation endpoint for live keys", () => {
    expect(resolveCreemModerationBaseUrl("creem_live_abc")).toBe(
      "https://api.creem.io"
    );
    expect(resolveCreemModerationBaseUrl("creem_abc")).toBe(
      "https://api.creem.io"
    );
  });

  test("allows prompts when Creem returns allow", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ decision: "allow" }), { status: 200 })
    );

    await expect(
      assertCreemPromptAllowed("a safe travel portrait", {
        apiKey: "creem_test_abc",
        externalId: "user_1",
        fetcher,
      })
    ).resolves.toBeUndefined();

    expect(fetcher).toHaveBeenCalledWith(
      "https://test-api.creem.io/v1/moderation/prompt",
      expect.objectContaining({
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": "creem_test_abc",
        },
      })
    );
  });

  test("blocks prompts when Creem returns deny or flag", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ decision: "flag" }), { status: 200 })
    );

    await expect(
      assertCreemPromptAllowed("borderline prompt", {
        apiKey: "creem_test_abc",
        fetcher,
      })
    ).rejects.toBeInstanceOf(CreemModerationRejectedError);
  });

  test("fails closed when moderation is unavailable", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("unavailable", { status: 503 }));

    await expect(
      assertCreemPromptAllowed("safe prompt", {
        apiKey: "creem_test_abc",
        fetcher,
      })
    ).rejects.toBeInstanceOf(CreemModerationUnavailableError);
  });
});
