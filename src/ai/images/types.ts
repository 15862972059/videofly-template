export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "3:4";
  model?: ImageModel;
}

export type ImageModel = "minimax" | "flux-schnell" | "gpt-image-2" | "nano-banana-2";

export interface ImageGenerationResult {
  imageUrls?: string[];
  base64ImageList?: string[];
}

export const IMAGE_MODELS: Record<
  ImageModel,
  {
    name: string;
    description: string;
    provider: string;
    supportedAspectRatios: ("1:1" | "16:9" | "9:16" | "3:4")[];
    isEnabled: boolean;
  }
> = {
  minimax: {
    name: "MiniMax",
    description: "Fast and high quality, optimized for Asia markets",
    provider: "MiniMax",
    supportedAspectRatios: ["1:1", "16:9", "9:16", "3:4"],
    isEnabled: true,
  },
  "flux-schnell": {
    name: "Flux Schnell",
    description: "Very fast generation, low cost",
    provider: "Replicate",
    supportedAspectRatios: ["1:1", "16:9", "9:16", "3:4"],
    isEnabled: true,
  },
  "gpt-image-2": {
    name: "GPT Image 2",
    description: "OpenAI's latest image generation model",
    provider: "Replicate",
    supportedAspectRatios: ["1:1", "16:9", "9:16"],
    isEnabled: true,
  },
  "nano-banana-2": {
    name: "Nano Banana 2",
    description: "Google's efficient image generation model",
    provider: "Replicate",
    supportedAspectRatios: ["1:1"],
    isEnabled: true,
  },
};

export function getSupportedAspectRatios(
  model: ImageModel
): ("1:1" | "16:9" | "9:16" | "3:4")[] {
  return IMAGE_MODELS[model]?.supportedAspectRatios || ["1:1", "16:9", "9:16"];
}

export function normalizeAspectRatio(
  ratio: string | undefined,
  model: ImageModel
): "1:1" | "16:9" | "9:16" | "3:4" {
  const supported = getSupportedAspectRatios(model);
  const safeRatio = (ratio || supported[0]) as "1:1" | "16:9" | "9:16" | "3:4";
  if (supported.includes(safeRatio)) {
    return safeRatio;
  }
  return supported[0];
}
