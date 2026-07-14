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

  test("downloads remix reference images and submits form data to /images/edits", async () => {
    const fetchMock = vi.fn().mockImplementation((url) => {
      if (typeof url === "string" && url.startsWith("https://assets.example.com/")) {
        return Promise.resolve(new Response(new ArrayBuffer(10)));
      }
      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: [{ url: "https://cdn.example.com/remix.png" }],
          }),
          { status: 200 }
        )
      );
    });
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

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://assets.example.com/scene.jpg");
    expect(fetchMock.mock.calls[1]?.[0]).toBe("https://assets.example.com/person.png");
    
    const lastCall = fetchMock.mock.calls[2];
    expect(lastCall?.[0]).toBe("https://ciyuan.today/v1/images/edits");
    
    const sentBody = lastCall?.[1]?.body as FormData;
    expect(sentBody).toBeInstanceOf(FormData);
    expect(sentBody.get("model")).toBe("gpt-image-2");
    expect(sentBody.get("prompt")).toBe("Blend the person into the scene naturally");
    expect(sentBody.get("size")).toBe("1024x1024");
    expect(sentBody.get("quality")).toBe("low");
    expect(sentBody.get("format")).toBe("jpeg");
    expect(sentBody.get("n")).toBe("1");

    const images = sentBody.getAll("image");
    expect(images.length).toBe(2);
    expect(images[0]).toBeInstanceOf(Blob);
    expect(images[1]).toBeInstanceOf(Blob);
  });

  test("wraps remix API failures with context", async () => {
    const fetchMock = vi.fn().mockImplementation((url) => {
      if (typeof url === "string" && url.startsWith("https://assets.example.com/")) {
        return Promise.resolve(new Response(new ArrayBuffer(10)));
      }
      return Promise.reject(new TypeError("fetch failed"));
    });
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
