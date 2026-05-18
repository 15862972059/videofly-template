export * from "./types";
export * from "./providers/minimax";
export * from "./providers/replicate";

import type { ImageModel, ImageGenerationRequest, ImageGenerationResult } from "./types";
import { generateWithMiniMax, remixWithMiniMax } from "./providers/minimax";
import {
  generateWithFluxSchnell,
  generateWithGptImage2,
  generateWithNanoBanana2,
} from "./providers/replicate";
import { normalizeAspectRatio } from "./types";

export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResult> {
  const model = request.model || "minimax";
  const aspectRatio = normalizeAspectRatio(request.aspectRatio, model) as "1:1" | "16:9" | "9:16" | "3:4";

  switch (model) {
    case "flux-schnell":
      return generateWithFluxSchnell({ prompt: request.prompt, aspectRatio });
    case "gpt-image-2":
      return generateWithGptImage2({ prompt: request.prompt, aspectRatio });
    case "nano-banana-2":
      return generateWithNanoBanana2({ prompt: request.prompt, aspectRatio });
    case "minimax":
    default:
      return generateWithMiniMax({ prompt: request.prompt, aspectRatio });
  }
}

export async function remixImage(request: {
  prompt: string;
  sourceImageUrl: string;
  aspectRatio?: string;
  model?: ImageModel;
}): Promise<ImageGenerationResult> {
  // Currently only MiniMax supports remix
  // For Replicate models, we'd need to implement subject_reference differently
  const model = request.model || "minimax";

  if (model !== "minimax") {
    // Fallback to MiniMax for remix, or throw error
    console.warn(`Remix is only supported on MiniMax. Using MiniMax for model ${model}`);
  }

  return remixWithMiniMax({
    prompt: request.prompt,
    sourceImageUrl: request.sourceImageUrl,
    aspectRatio: request.aspectRatio,
  });
}
