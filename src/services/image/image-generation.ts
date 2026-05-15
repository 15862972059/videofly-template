import { generateImage, remixImage } from "@/ai/images/minimax";
import { creditService } from "@/services/credit";
import { getStorage } from "@/lib/storage";
import { getClassicImageById, getClassicImageBySlug } from "./gallery";
import { buildRemixPrompt, buildTextPrompt,inferRemixAspectRatio } from "./prompts";
import { assertPromptAllowed } from "./safety";
import { buildImageObjectKey, validateSourceImageUrl } from "./storage";
import {
  createImageGenerationJob,
  updateImageGenerationJobStatus,
} from "./generation-jobs";
import { checkRateLimit, incrementRateLimit } from "./rate-limit";

const IMAGE_GENERATION_CREDIT_COST = 1;

export async function generateTextImage(input: {
  userId: string;
  prompt: string;
  aspectRatio?: string;
}): Promise<{
  jobId: string;
  objectKey: string;
  publicUrl: string;
}> {
  const rateLimit = await checkRateLimit(input.userId, "image:text");
  if (!rateLimit.allowed) {
    throw new Error(`Rate limit exceeded. Resets at ${new Date(rateLimit.resetAt).toISOString()}`);
  }

  const finalPrompt = buildTextPrompt({ userPrompt: input.prompt });
  assertPromptAllowed(finalPrompt);

  const job = await createImageGenerationJob({
    userId: input.userId,
    type: "TEXT",
    prompt: finalPrompt,
    creditsUsed: IMAGE_GENERATION_CREDIT_COST,
    parameters: { aspectRatio: input.aspectRatio },
  });

  if (!job) {
    throw new Error("Failed to create generation job");
  }

  try {
    await creditService.freeze({
      userId: input.userId,
      credits: IMAGE_GENERATION_CREDIT_COST,
      videoUuid: job.id,
    });

    await updateImageGenerationJobStatus(job.id, "RUNNING");

    const result = await generateImage({
      model: "image-01",
      prompt: finalPrompt,
      aspectRatio: input.aspectRatio || "1:1",
      imageCount: 1,
    });

    const imageUrl = result.imageUrls?.[0] ?? result.base64ImageList?.[0];
    if (!imageUrl) {
      throw new Error("MiniMax returned no image");
    }

    const key = buildImageObjectKey({
      userId: input.userId,
      kind: "result",
      filename: `${job.id}.png`,
    });

    const storage = getStorage();
    const uploaded = imageUrl.startsWith("http")
      ? await storage.downloadAndUpload({
          sourceUrl: imageUrl,
          key,
          contentType: "image/png",
        })
      : await storage.uploadFile({
          key,
          body: Buffer.from(imageUrl, "base64"),
          contentType: "image/png",
        });

    await updateImageGenerationJobStatus(job.id, "SUCCEEDED", {
      resultImageKey: uploaded.key,
      resultImageUrl: uploaded.url,
    });

    await creditService.settle(job.id);
    await incrementRateLimit(input.userId, "image:text");

    return {
      jobId: job.id,
      objectKey: uploaded.key,
      publicUrl: uploaded.url,
    };
  } catch (error) {
    await updateImageGenerationJobStatus(job.id, "FAILED", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    await creditService.release(job.id);
    throw error;
  }
}

export async function generateRemixImage(input: {
  userId: string;
  classicImageId?: string;
  classicImageSlug?: string;
  sourceImageKey: string;
  prompt?: string;
  aspectRatio?: string;
}): Promise<{
  jobId: string;
  objectKey: string;
  publicUrl: string;
}> {
  const rateLimit = await checkRateLimit(input.userId, "image:remix");
  if (!rateLimit.allowed) {
    throw new Error(`Rate limit exceeded. Resets at ${new Date(rateLimit.resetAt).toISOString()}`);
  }

  let classicImage = null;
  if (input.classicImageId) {
    classicImage = await getClassicImageById(input.classicImageId);
  } else if (input.classicImageSlug) {
    classicImage = await getClassicImageBySlug(input.classicImageSlug);
  }

  if (!classicImage) {
    throw new Error("Classic image not found");
  }

  const storage = getStorage();
  const sourceImageUrl = storage.getPublicUrl(input.sourceImageKey);
  if (!validateSourceImageUrl(sourceImageUrl)) {
    throw new Error("Invalid source image URL");
  }

  const finalPrompt = buildRemixPrompt({
    classicTitle: classicImage.title,
    classicCategory: classicImage.category,
    userPrompt: input.prompt,
    promptTemplate: classicImage.promptTemplate,
  });
  assertPromptAllowed(finalPrompt);

  const finalAspectRatio = input.aspectRatio ?? inferRemixAspectRatio({
    classicTitle: classicImage.title,
    heroImageUrl: classicImage.heroImageUrl,
  });

  const job = await createImageGenerationJob({
    userId: input.userId,
    type: "REMIX",
    classicImageId: classicImage.id,
    prompt: finalPrompt,
    sourceImageKey: input.sourceImageKey,
    creditsUsed: IMAGE_GENERATION_CREDIT_COST,
    parameters: { aspectRatio: finalAspectRatio },
  });

  if (!job) {
    throw new Error("Failed to create generation job");
  }

  try {
    await creditService.freeze({
      userId: input.userId,
      credits: IMAGE_GENERATION_CREDIT_COST,
      videoUuid: job.id,
    });

    await updateImageGenerationJobStatus(job.id, "RUNNING");

    const result = await remixImage({
      prompt: finalPrompt,
      sourceImageUrl,
      aspectRatio: finalAspectRatio,
    });

    const imageUrl = result.imageUrls?.[0] ?? result.base64ImageList?.[0];
    if (!imageUrl) {
      throw new Error("MiniMax returned no image");
    }

    const key = buildImageObjectKey({
      userId: input.userId,
      kind: "result",
      filename: `${job.id}.png`,
    });

    const uploaded = imageUrl.startsWith("http")
      ? await storage.downloadAndUpload({
          sourceUrl: imageUrl,
          key,
          contentType: "image/png",
        })
      : await storage.uploadFile({
          key,
          body: Buffer.from(imageUrl, "base64"),
          contentType: "image/png",
        });

    await updateImageGenerationJobStatus(job.id, "SUCCEEDED", {
      resultImageKey: uploaded.key,
      resultImageUrl: uploaded.url,
    });

    await creditService.settle(job.id);
    await incrementRateLimit(input.userId, "image:remix");

    return {
      jobId: job.id,
      objectKey: uploaded.key,
      publicUrl: uploaded.url,
    };
  } catch (error) {
    await updateImageGenerationJobStatus(job.id, "FAILED", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    await creditService.release(job.id);
    throw error;
  }
}
