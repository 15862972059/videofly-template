// @vitest-environment node

import { describe, expect, test, vi } from "vitest";

import { persistGeneratedImage } from "@/services/image/persist-result";

const imageUrl = "https://example.com/generated.jpg";

describe("persistGeneratedImage", () => {
  test("falls back to the temporary provider URL when storage upload fails in development", async () => {
    const storage = {
      downloadAndUpload: vi.fn().mockRejectedValue(new TypeError("fetch failed")),
      uploadFile: vi.fn(),
    };

    await expect(
      persistGeneratedImage({
        imageData: imageUrl,
        key: "images/user/result/test.jpg",
        contentType: "image/jpeg",
        storage,
        allowTemporaryUrlFallback: true,
      })
    ).resolves.toEqual({
      key: "temporary:images/user/result/test.jpg",
      url: imageUrl,
      temporary: true,
    });
  });

  test("keeps failing storage uploads fatal when fallback is disabled", async () => {
    const storage = {
      downloadAndUpload: vi.fn().mockRejectedValue(new TypeError("fetch failed")),
      uploadFile: vi.fn(),
    };

    await expect(
      persistGeneratedImage({
        imageData: imageUrl,
        key: "images/user/result/test.jpg",
        contentType: "image/jpeg",
        storage,
        allowTemporaryUrlFallback: false,
      })
    ).rejects.toThrow(
      "Failed to save generated image to storage: fetch failed"
    );
  });
});
