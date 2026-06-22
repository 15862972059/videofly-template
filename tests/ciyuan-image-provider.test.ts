// @vitest-environment node

import { beforeEach, describe, expect, test, vi } from "vitest";

const downloadImageMock = vi.fn();
const configureGlobalFetchProxyMock = vi.fn();

vi.mock("@/lib/proxy", () => ({
  configureGlobalFetchProxy: configureGlobalFetchProxyMock,
}));

describe("CiYuan remix provider", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.CIYUAN_API_KEY = "test-key";
    process.env.CIYUAN_IMAGE_GENERATION_MODEL = undefined;
    process.env.CIYUAN_IMAGE_EDIT_MODEL = undefined;
  });

  test("uses gpt-image-2 for text generation by default", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ url: "https://cdn.example.com/generated.png" }],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { generateWithCiyuan } = await import("@/ai/images/providers/ciyuan");

    await expect(
      generateWithCiyuan({
        prompt: "A modern product photo",
        aspectRatio: "16:9",
        resolution: "4k" as never,
      })
    ).resolves.toEqual({
      imageUrls: ["https://cdn.example.com/generated.png"],
    });

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      model: "gpt-image-2",
      prompt: "A modern product photo",
      size: "1024x1024",
      quality: "low",
      format: "jpeg",
      n: 1,
    });
  });

  test("downloads remix reference images through the proxy-aware downloader", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ url: "https://cdn.example.com/remix.png" }],
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const { remixWithCiyuan } = await import("@/ai/images/providers/ciyuan");

    await expect(
      remixWithCiyuan({
        prompt: "Blend the person into the scene naturally",
        imageUrls: [
          "https://assets.example.com/scene.jpg",
          "https://assets.example.com/person.png",
        ],
        aspectRatio: "9:16",
      })
    ).resolves.toEqual({
      imageUrls: ["https://cdn.example.com/remix.png"],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://ciyuan.today/v1/images/generations");
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      model: "gpt-image-2-all",
      prompt: "Blend the person into the scene naturally",
      size: "1024x1024",
      quality: "low",
      format: "jpeg",
      n: 1,
      image: [
        "https://assets.example.com/scene.jpg",
        "https://assets.example.com/person.png",
      ],
    });
  });

  test("wraps remix API failures with context", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetchMock);

    const { remixWithCiyuan } = await import("@/ai/images/providers/ciyuan");

    await expect(
      remixWithCiyuan({
        prompt: "Blend the person into the scene naturally",
        imageUrls: ["https://assets.example.com/scene.jpg"],
        aspectRatio: "1:1",
      })
    ).rejects.toThrow(
      "Failed to call CiYuan image edit API: fetch failed"
    );
  });

  test("reports invalid JSON from text generation responses with context", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("<!DOCTYPE html><html><body>upstream error</body></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { generateWithCiyuan } = await import("@/ai/images/providers/ciyuan");

    await expect(
      generateWithCiyuan({
        prompt: "A modern product photo",
        aspectRatio: "16:9",
      })
    ).rejects.toThrow(
      "CiYuan image generation returned invalid JSON"
    );
  });
});
