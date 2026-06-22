export * from "./types";
export * from "./providers/ciyuan";

import type { ImageGenerationRequest, ImageGenerationResult } from "./types";
import { generateWithCiyuan, remixWithCiyuan } from "./providers/ciyuan";
import {
  FIXED_IMAGE_OUTPUT,
} from "./types";

export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  return generateWithCiyuan({
    prompt: request.prompt,
    aspectRatio: FIXED_IMAGE_OUTPUT.aspectRatio,
    model: FIXED_IMAGE_OUTPUT.model,
    quality: FIXED_IMAGE_OUTPUT.quality,
    resolution: FIXED_IMAGE_OUTPUT.resolution,
  });
}

export async function remixImage(request: {
  prompt: string;
  sceneImageUrl?: string;
  sourceImageUrl: string;
  aspectRatio?: string;
  model?: string;
  quality?: string;
  resolution?: string;
}): Promise<ImageGenerationResult> {
  return remixWithCiyuan({
    prompt: request.prompt,
    imageUrls: [
      ...(request.sceneImageUrl ? [request.sceneImageUrl] : []),
      request.sourceImageUrl,
    ],
    aspectRatio: FIXED_IMAGE_OUTPUT.aspectRatio,
    resolution: FIXED_IMAGE_OUTPUT.resolution,
  });
}
