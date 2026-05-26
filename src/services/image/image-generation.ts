import { generateImage, remixImage } from "@/ai/images";
import type { ImageModel, ImageQuality } from "@/ai/images/types";
import {
  IMAGE_MODELS,
  getImageCreditCost,
  normalizeImageQuality,
} from "@/ai/images/types";
import { creditService } from "@/services/credit";
import { getStorage } from "@/lib/storage";
import { getClassicImageById, getClassicImageBySlug } from "./gallery";
import {
  buildRemixPrompt,
  buildTextPrompt,
  inferRemixAspectRatio,
  isGeneratedRemixPrompt,
} from "./prompts";
import {
  persistGeneratedImage,
  shouldAllowTemporaryImageUrlFallback,
} from "./persist-result";
import { assertPromptAllowed } from "./safety";
import { assertCreemPromptAllowed } from "@/services/moderation/creem";
import {
  buildImageObjectKey,
  resolvePublicImageUrl,
  resolveSceneReferenceImageUrl,
  validateSourceImageUrl,
} from "./storage";
import {
  createImageGenerationJob,
  updateImageGenerationJobStatus,
} from "./generation-jobs";
import { checkRateLimit, incrementRateLimit } from "./rate-limit";

async function assertCreemPromptSequenceAllowed(input: {
  userPrompt?: string | null;
  finalPrompt: string;
  externalIdBase: string;
}): Promise<void> {
  const userPrompt = input.userPrompt?.trim();
  const finalPrompt = input.finalPrompt.trim();

  if (userPrompt) {
    await assertCreemPromptAllowed(userPrompt, {
      externalId: `${input.externalIdBase}:user_prompt`,
    });
  }

  if (!userPrompt || finalPrompt !== userPrompt) {
    await assertCreemPromptAllowed(finalPrompt, {
      externalId: `${input.externalIdBase}:final_prompt`,
    });
  }
}

export async function generateTextImage(input: {
  userId: string;
  prompt: string;
  aspectRatio?: string;
  model?: ImageModel;
  quality?: ImageQuality;
}): Promise<{
  jobId: string;
  objectKey: string;
  publicUrl: string;
}> {
  const rateLimit = await checkRateLimit(input.userId, "image:text");
  if (!rateLimit.allowed) {
    throw new Error(`Rate limit exceeded. Resets at ${new Date(rateLimit.resetAt).toISOString()}`);
  }

  const effectiveModel = "gpt-image-2";
  const effectiveQuality = normalizeImageQuality(effectiveModel, input.quality);
  const imageCreditCost = getImageCreditCost(effectiveModel, effectiveQuality);
  const finalPrompt = buildTextPrompt({ userPrompt: input.prompt });
  await assertCreemPromptSequenceAllowed({
    userPrompt: input.prompt,
    finalPrompt,
    externalIdBase: `user_${input.userId}:image_text`,
  });
  assertPromptAllowed(finalPrompt);

  const job = await createImageGenerationJob({
    userId: input.userId,
    type: "TEXT",
    prompt: finalPrompt,
    creditsUsed: imageCreditCost,
    parameters: {
      aspectRatio: input.aspectRatio,
      model: effectiveModel,
      quality: effectiveQuality,
    },
  });

  if (!job) {
    throw new Error("Failed to create generation job");
  }

  let creditFrozen = false;

  try {
    await creditService.freeze({
      userId: input.userId,
      credits: imageCreditCost,
      videoUuid: job.id,
    });
    creditFrozen = true;

    await updateImageGenerationJobStatus(job.id, "RUNNING");

    console.log(`[text-generate] Job ${job.id}: Calling AI model ${effectiveModel}...`);
    const result = await generateImage({
      prompt: finalPrompt,
      aspectRatio: (input.aspectRatio || "1:1") as "1:1" | "16:9" | "9:16" | "3:4",
      model: effectiveModel,
      quality: effectiveQuality,
    });
    console.log(`[text-generate] Job ${job.id}: AI model returned successfully.`);

    const imageUrl = result.imageUrls?.[0] ?? result.base64ImageList?.[0];
    if (!imageUrl) {
      throw new Error("Image generation returned no image");
    }

    const key = buildImageObjectKey({
      userId: input.userId,
      kind: "result",
      filename: `${job.id}.png`,
    });

    const uploaded = await persistGeneratedImage({
      imageData: imageUrl,
      key,
      contentType: "image/png",
      storage: getStorage(),
      allowTemporaryUrlFallback: shouldAllowTemporaryImageUrlFallback(),
    });
    console.log(`[text-generate] Job ${job.id}: Image saved to ${uploaded.key}`);

    await updateImageGenerationJobStatus(job.id, "SUCCEEDED", {
      resultImageKey: uploaded.key,
      resultImageUrl: uploaded.url,
    });

    await creditService.settle(job.id);
    creditFrozen = false;
    await incrementRateLimit(input.userId, "image:text");

    return {
      jobId: job.id,
      objectKey: uploaded.key,
      publicUrl: uploaded.url,
    };
  } catch (error) {
    console.error(`[text-generate] Job ${job.id} failed:`, error);
    await updateImageGenerationJobStatus(job.id, "FAILED", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    if (creditFrozen) {
      try { await creditService.release(job.id); } catch {}
    }
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
  model?: ImageModel;
  quality?: ImageQuality;
}): Promise<{
  jobId: string;
  objectKey: string;
  publicUrl: string;
}> {
  const rateLimit = await checkRateLimit(input.userId, "image:remix");
  if (!rateLimit.allowed) {
    throw new Error(`Rate limit exceeded. Resets at ${new Date(rateLimit.resetAt).toISOString()}`);
  }

  const effectiveModel = "gpt-image-2";
  const effectiveQuality = normalizeImageQuality(effectiveModel, input.quality);
  const imageCreditCost = getImageCreditCost(effectiveModel, effectiveQuality);

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
  const sceneImageUrl = await resolveSceneReferenceImageUrl(
    classicImage.hero_image_url,
    storage
  );
  if (!validateSourceImageUrl(sceneImageUrl)) {
    throw new Error("Invalid scene image URL");
  }

  const isFullPrompt = input.prompt ? isGeneratedRemixPrompt(input.prompt) : false;

  const finalPrompt = isFullPrompt && input.prompt
    ? input.prompt
    : buildRemixPrompt({
        classicTitle: classicImage.title,
        classicCategory: classicImage.category,
        userPrompt: input.prompt,
        promptTemplate: classicImage.prompt_template,
      });
  await assertCreemPromptSequenceAllowed({
    userPrompt: input.prompt,
    finalPrompt,
    externalIdBase: `user_${input.userId}:image_remix`,
  });
  assertPromptAllowed(finalPrompt);

  const finalAspectRatio = input.aspectRatio ?? inferRemixAspectRatio({
    classicTitle: classicImage.title,
    heroImageUrl: classicImage.hero_image_url,
  });

  const job = await createImageGenerationJob({
    userId: input.userId,
    type: "REMIX",
    classicImageId: classicImage.id,
    prompt: finalPrompt,
    sourceImageKey: input.sourceImageKey,
    creditsUsed: imageCreditCost,
    parameters: {
      aspectRatio: finalAspectRatio,
      model: effectiveModel,
      quality: effectiveQuality,
    },
  });

  if (!job) {
    throw new Error("Failed to create generation job");
  }

  let creditFrozenRemix = false;

  try {
    await creditService.freeze({
      userId: input.userId,
      credits: imageCreditCost,
      videoUuid: job.id,
    });
    creditFrozenRemix = true;

    await updateImageGenerationJobStatus(job.id, "RUNNING");

    const result = await remixImage({
      prompt: finalPrompt,
      sceneImageUrl,
      sourceImageUrl,
      aspectRatio: finalAspectRatio,
      model: effectiveModel,
      quality: effectiveQuality,
    });

    const imageUrl = result.imageUrls?.[0] ?? result.base64ImageList?.[0];
    if (!imageUrl) {
      throw new Error("Image generation returned no image");
    }

    const key = buildImageObjectKey({
      userId: input.userId,
      kind: "result",
      filename: `${job.id}.png`,
    });

    const uploaded = await persistGeneratedImage({
      imageData: imageUrl,
      key,
      contentType: "image/png",
      storage,
      allowTemporaryUrlFallback: shouldAllowTemporaryImageUrlFallback(),
    });

    await updateImageGenerationJobStatus(job.id, "SUCCEEDED", {
      resultImageKey: uploaded.key,
      resultImageUrl: uploaded.url,
    });

    await creditService.settle(job.id);
    creditFrozenRemix = false;
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
    if (creditFrozenRemix) {
      try { await creditService.release(job.id); } catch {}
    }
    throw error;
  }
}
