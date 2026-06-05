export * from "./types";
export * from "./providers/ciyuan";

import type { ImageGenerationRequest, ImageGenerationResult } from "./types";
import { generateWithCiyuan, remixWithCiyuan } from "./providers/ciyuan";
import {
  normalizeAspectRatio,
  normalizeImageQuality,
  normalizeImageResolution,
} from "./types";

export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const aspectRatio = normalizeAspectRatio(request.aspectRatio, "gpt-image-2") as
    | "1:1"
    | "16:9"
    | "9:16"
    | "3:4";

  return generateWithCiyuan({
    prompt: request.prompt,
    aspectRatio,
    model: "gpt-image-2",
    quality: normalizeImageQuality("gpt-image-2", request.quality),
    resolution: normalizeImageResolution("gpt-image-2", request.resolution),
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
  const aspectRatio = normalizeAspectRatio(request.aspectRatio, "gpt-image-2");

  return remixWithCiyuan({
    prompt: request.prompt,
    imageUrls: [
      ...(request.sceneImageUrl ? [request.sceneImageUrl] : []),
      request.sourceImageUrl,
    ],
    aspectRatio,
    resolution: normalizeImageResolution("gpt-image-2", request.resolution),
  });
}
