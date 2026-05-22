// @vitest-environment node

import { expect, test, vi } from "vitest";

import { Storage } from "@/lib/storage";
import {
  resolvePublicImageUrl,
  resolveSceneReferenceImageUrl,
} from "@/services/image/storage";

test("normalizes public storage domains without a protocol", () => {
  const storage = new Storage({
    endpoint: "https://example.r2.cloudflarestorage.com",
    region: "auto",
    accessKeyId: "test-access-key",
    secretAccessKey: "test-secret-key",
    bucket: "test-bucket",
    publicDomain: "storage.example.com",
  });

  expect(storage.getPublicUrl("images/result.png")).toBe(
    "https://storage.example.com/images/result.png"
  );
});

test("resolves relative public scene images to a public absolute URL", () => {
  expect(
    resolvePublicImageUrl("/images/gallery-japan-fuji-a.jpeg", {
      publicBaseUrl: "http://localhost:3005",
      fallbackBaseUrl: "https://ai2art.net",
    })
  ).toBe("https://ai2art.net/images/gallery-japan-fuji-a.jpeg");
});

test("keeps already public scene image URLs unchanged", () => {
  expect(
    resolvePublicImageUrl("https://cdn.example.com/scene.jpg", {
      publicBaseUrl: "https://ai2art.net",
    })
  ).toBe("https://cdn.example.com/scene.jpg");
});

test("uploads local scene assets to storage before using them as remix references", async () => {
  const storage = {
    uploadFile: vi.fn().mockResolvedValue({
      key: "images/system/scenes/images_gallery-japan-fuji-a.jpeg",
      url: "https://storage.example.com/images/system/scenes/images_gallery-japan-fuji-a.jpeg",
    }),
  };

  await expect(
    resolveSceneReferenceImageUrl("/images/gallery-japan-fuji-a.jpeg", storage)
  ).resolves.toBe(
    "https://storage.example.com/images/system/scenes/images_gallery-japan-fuji-a.jpeg"
  );

  expect(storage.uploadFile).toHaveBeenCalledTimes(1);
  expect(storage.uploadFile.mock.calls[0][0].key).toBe(
    "images/system/scenes/images_gallery-japan-fuji-a.jpeg"
  );
  expect(storage.uploadFile.mock.calls[0][0].contentType).toBe("image/jpeg");
  expect(storage.uploadFile.mock.calls[0][0].body.length).toBeGreaterThan(0);
});
