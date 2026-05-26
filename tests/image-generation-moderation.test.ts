// @vitest-environment node

import { beforeEach, describe, expect, test, vi } from "vitest";

const generateImageMock = vi.fn();
const remixImageMock = vi.fn();
const checkRateLimitMock = vi.fn();
const incrementRateLimitMock = vi.fn();
const getClassicImageBySlugMock = vi.fn();
const getClassicImageByIdMock = vi.fn();
const resolveSceneReferenceImageUrlMock = vi.fn();
const validateSourceImageUrlMock = vi.fn();
const createImageGenerationJobMock = vi.fn();
const updateImageGenerationJobStatusMock = vi.fn();
const freezeMock = vi.fn();
const settleMock = vi.fn();
const releaseMock = vi.fn();
const getStorageMock = vi.fn();

vi.mock("@/ai/images", () => ({
  generateImage: generateImageMock,
  remixImage: remixImageMock,
}));

vi.mock("@/services/image/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
  incrementRateLimit: incrementRateLimitMock,
}));

vi.mock("@/services/image/gallery", () => ({
  getClassicImageById: getClassicImageByIdMock,
  getClassicImageBySlug: getClassicImageBySlugMock,
}));

vi.mock("@/services/image/storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/services/image/storage")>();
  return {
    ...actual,
    resolveSceneReferenceImageUrl: resolveSceneReferenceImageUrlMock,
    validateSourceImageUrl: validateSourceImageUrlMock,
  };
});

vi.mock("@/services/image/generation-jobs", () => ({
  createImageGenerationJob: createImageGenerationJobMock,
  updateImageGenerationJobStatus: updateImageGenerationJobStatusMock,
}));

vi.mock("@/services/credit", () => ({
  creditService: {
    freeze: freezeMock,
    settle: settleMock,
    release: releaseMock,
  },
}));

vi.mock("@/lib/storage", () => ({
  getStorage: getStorageMock,
}));

describe("image generation Creem moderation", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.CREEM_API_KEY = "creem_test_abc";

    checkRateLimitMock.mockResolvedValue({ allowed: true, resetAt: Date.now() + 60000 });
    getClassicImageBySlugMock.mockResolvedValue({
      id: "classic_1",
      title: "Lantern Street",
      category: "portrait",
      prompt_template: "warm lantern street at dusk",
      hero_image_url: "/images/lantern.jpg",
    });
    resolveSceneReferenceImageUrlMock.mockResolvedValue("https://cdn.example.com/scene.jpg");
    validateSourceImageUrlMock.mockReturnValue(true);
    getStorageMock.mockReturnValue({
      getPublicUrl: vi.fn().mockReturnValue("https://cdn.example.com/source.jpg"),
    });
  });

  test("screens the user's raw remix prompt before model generation", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ decision: "flag" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { generateRemixImage } = await import("@/services/image/image-generation");

    await expect(
      generateRemixImage({
        userId: "user_1",
        classicImageSlug: "lantern-street",
        sourceImageKey: "images/user/source.png",
        prompt: "make the lighting more dramatic",
      })
    ).rejects.toThrow("violates our content policy");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      prompt: "make the lighting more dramatic",
      external_id: "user_user_1:image_remix:user_prompt",
    });
    expect(remixImageMock).not.toHaveBeenCalled();
    expect(freezeMock).not.toHaveBeenCalled();
  });

  test("starts a remix job without calling the image model", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ decision: "allow" }), { status: 200 })
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    createImageGenerationJobMock.mockResolvedValue({
      id: "job_1",
      status: "QUEUED",
    });
    freezeMock.mockResolvedValue({ success: true, holdId: 1 });

    const { startRemixImageGeneration } = await import("@/services/image/image-generation");

    const started = await startRemixImageGeneration({
      userId: "user_1",
      classicImageSlug: "lantern-street",
      sourceImageKey: "images/user/source.png",
      prompt: "make the lighting more dramatic",
      aspectRatio: "9:16",
    });

    expect(started.response).toEqual({
      jobId: "job_1",
      status: "QUEUED",
      creditsUsed: 5,
    });
    expect(remixImageMock).not.toHaveBeenCalled();
    expect(updateImageGenerationJobStatusMock).not.toHaveBeenCalledWith(
      "job_1",
      "RUNNING"
    );
  });

  test("blocks locally prohibited text prompts after Creem allows them", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ decision: "allow" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { startTextImageGeneration } = await import("@/services/image/image-generation");

    await expect(
      startTextImageGeneration({
        userId: "user_1",
        prompt: "generate a nude explicit portrait",
      })
    ).rejects.toThrow("violates our content policy");

    expect(fetchMock).toHaveBeenCalled();
    expect(createImageGenerationJobMock).not.toHaveBeenCalled();
    expect(freezeMock).not.toHaveBeenCalled();
    expect(generateImageMock).not.toHaveBeenCalled();
  });
});
