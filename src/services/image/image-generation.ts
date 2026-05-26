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

interface AsyncImageGenerationResponse {
  jobId: string;
  status: "QUEUED" | "RUNNING";
  creditsUsed: number;
}

interface TextImageGenerationInput {
  userId: string;
  prompt: string;
  aspectRatio?: string;
  model?: ImageModel;
  quality?: ImageQuality;
}

interface TextImageGenerationTask {
  jobId: string;
  userId: string;
  prompt: string;
  aspectRatio?: string;
  model: ImageModel;
  quality: ImageQuality;
}

interface RemixImageGenerationInput {
  userId: string;
  classicImageId?: string;
  classicImageSlug?: string;
  sourceImageKey: string;
  prompt?: string;
  aspectRatio?: string;
  model?: ImageModel;
  quality?: ImageQuality;
}

interface RemixImageGenerationTask {
  jobId: string;
  userId: string;
  prompt: string;
  sourceImageUrl: string;
  sceneImageUrl: string;
  aspectRatio: string;
  model: ImageModel;
  quality: ImageQuality;
}

interface StartedImageGeneration<TTask> {
  response: AsyncImageGenerationResponse;
  task: TTask;
}

interface CompletedImageGeneration {
  jobId: string;
  objectKey: string;
  publicUrl: string;
}

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

export async function startTextImageGeneration(
  input: TextImageGenerationInput
): Promise<StartedImageGeneration<TextImageGenerationTask>> {
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

  try {
    const freezeResult = await creditService.freeze({
      userId: input.userId,
      credits: imageCreditCost,
      videoUuid: job.id,
    });
    if (!freezeResult.success) {
      throw new Error(`Insufficient credits. Required: ${imageCreditCost}`);
    }
  } catch (error) {
    await updateImageGenerationJobStatus(job.id, "FAILED", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }

  return {
    response: {
      jobId: job.id,
      status: job.status as "QUEUED" | "RUNNING",
      creditsUsed: imageCreditCost,
    },
    task: {
      jobId: job.id,
      userId: input.userId,
      prompt: finalPrompt,
      aspectRatio: input.aspectRatio,
      model: effectiveModel,
      quality: effectiveQuality,
    },
  };
}

export async function runStartedTextImageGeneration(
  task: TextImageGenerationTask
): Promise<CompletedImageGeneration> {
  let creditFrozen = true;

  try {
    await updateImageGenerationJobStatus(task.jobId, "RUNNING");

    console.log(`[text-generate] Job ${task.jobId}: Calling AI model ${task.model}...`);
    const result = await generateImage({
      prompt: task.prompt,
      aspectRatio: (task.aspectRatio || "1:1") as "1:1" | "16:9" | "9:16" | "3:4",
      model: task.model,
      quality: task.quality,
    });
    console.log(`[text-generate] Job ${task.jobId}: AI model returned successfully.`);

    const imageUrl = result.imageUrls?.[0] ?? result.base64ImageList?.[0];
    if (!imageUrl) {
      throw new Error("Image generation returned no image");
    }

    const key = buildImageObjectKey({
      userId: task.userId,
      kind: "result",
      filename: `${task.jobId}.png`,
    });

    const uploaded = await persistGeneratedImage({
      imageData: imageUrl,
      key,
      contentType: "image/png",
      storage: getStorage(),
      allowTemporaryUrlFallback: shouldAllowTemporaryImageUrlFallback(),
    });
    console.log(`[text-generate] Job ${task.jobId}: Image saved to ${uploaded.key}`);

    await creditService.settle(task.jobId);
    creditFrozen = false;

    await updateImageGenerationJobStatus(task.jobId, "SUCCEEDED", {
      resultImageKey: uploaded.key,
      resultImageUrl: uploaded.url,
    });

    await incrementRateLimit(task.userId, "image:text");

    return {
      jobId: task.jobId,
      objectKey: uploaded.key,
      publicUrl: uploaded.url,
    };
  } catch (error) {
    console.error(`[text-generate] Job ${task.jobId} failed:`, error);
    await updateImageGenerationJobStatus(task.jobId, "FAILED", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    if (creditFrozen) {
      try { await creditService.release(task.jobId); } catch {}
    }
    throw error;
  }
}

export async function generateTextImage(
  input: TextImageGenerationInput
): Promise<CompletedImageGeneration> {
  const started = await startTextImageGeneration(input);
  return runStartedTextImageGeneration(started.task);
}

export async function startRemixImageGeneration(
  input: RemixImageGenerationInput
): Promise<StartedImageGeneration<RemixImageGenerationTask>> {
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

  try {
    const freezeResult = await creditService.freeze({
      userId: input.userId,
      credits: imageCreditCost,
      videoUuid: job.id,
    });
    if (!freezeResult.success) {
      throw new Error(`Insufficient credits. Required: ${imageCreditCost}`);
    }
  } catch (error) {
    await updateImageGenerationJobStatus(job.id, "FAILED", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }

  return {
    response: {
      jobId: job.id,
      status: job.status as "QUEUED" | "RUNNING",
      creditsUsed: imageCreditCost,
    },
    task: {
      jobId: job.id,
      userId: input.userId,
      prompt: finalPrompt,
      sourceImageUrl,
      sceneImageUrl,
      aspectRatio: finalAspectRatio,
      model: effectiveModel,
      quality: effectiveQuality,
    },
  };
}

export async function runStartedRemixImageGeneration(
  task: RemixImageGenerationTask
): Promise<CompletedImageGeneration> {
  let creditFrozen = true;

  try {
    await updateImageGenerationJobStatus(task.jobId, "RUNNING");

    const result = await remixImage({
      prompt: task.prompt,
      sceneImageUrl: task.sceneImageUrl,
      sourceImageUrl: task.sourceImageUrl,
      aspectRatio: task.aspectRatio,
      model: task.model,
      quality: task.quality,
    });

    const imageUrl = result.imageUrls?.[0] ?? result.base64ImageList?.[0];
    if (!imageUrl) {
      throw new Error("Image generation returned no image");
    }

    const key = buildImageObjectKey({
      userId: task.userId,
      kind: "result",
      filename: `${task.jobId}.png`,
    });

    const uploaded = await persistGeneratedImage({
      imageData: imageUrl,
      key,
      contentType: "image/png",
      storage: getStorage(),
      allowTemporaryUrlFallback: shouldAllowTemporaryImageUrlFallback(),
    });

    await creditService.settle(task.jobId);
    creditFrozen = false;

    await updateImageGenerationJobStatus(task.jobId, "SUCCEEDED", {
      resultImageKey: uploaded.key,
      resultImageUrl: uploaded.url,
    });

    await incrementRateLimit(task.userId, "image:remix");

    return {
      jobId: task.jobId,
      objectKey: uploaded.key,
      publicUrl: uploaded.url,
    };
  } catch (error) {
    await updateImageGenerationJobStatus(task.jobId, "FAILED", {
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    if (creditFrozen) {
      try { await creditService.release(task.jobId); } catch {}
    }
    throw error;
  }
}

export async function generateRemixImage(
  input: RemixImageGenerationInput
): Promise<CompletedImageGeneration> {
  const started = await startRemixImageGeneration(input);
  return runStartedRemixImageGeneration(started.task);
}
