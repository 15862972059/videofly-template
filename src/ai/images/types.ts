export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "3:4";
  model?: ImageModel;
  imageUrls?: string[];
  quality?: ImageQuality;
  resolution?: ImageResolution;
}

export type ImageModel = "gpt-image-2";

export type ImageQuality = "low";

export type ImageResolution = "1k";

export const FIXED_IMAGE_OUTPUT = {
  model: "gpt-image-2",
  quality: "low",
  resolution: "1k",
  aspectRatio: "1:1",
  size: "1024x1024",
  format: "jpeg",
  creditCost: 1,
} as const;

export interface ImageQualityOption {
  value: ImageQuality;
  label: string;
  description: string;
  creditCost: number;
}

export interface ImageResolutionOption {
  value: ImageResolution;
  label: string;
  description: string;
  creditCost: number;
}

export const IMAGE_QUALITY_OPTIONS: Record<
  ImageModel,
  ImageQualityOption[]
> = {
  "gpt-image-2": [
    {
      value: "low",
      label: "Low",
      description: "Fast image generation",
      creditCost: 1,
    },
  ],
};

export const IMAGE_RESOLUTION_OPTIONS: Record<
  ImageModel,
  ImageResolutionOption[]
> = {
  "gpt-image-2": [
    {
      value: "1k",
      label: "1K",
      description: "Standard generation, fastest option",
      creditCost: 1,
    },
  ],
};

export function getImageQualityOptions(model: ImageModel): ImageQualityOption[] {
  return IMAGE_QUALITY_OPTIONS[model] || IMAGE_QUALITY_OPTIONS["gpt-image-2"];
}

export function getImageResolutionOptions(model: ImageModel): ImageResolutionOption[] {
  return IMAGE_RESOLUTION_OPTIONS[model] || IMAGE_RESOLUTION_OPTIONS["gpt-image-2"];
}

export function normalizeImageQuality(
  _model: ImageModel,
  _quality?: ImageQuality | string
): ImageQuality {
  return FIXED_IMAGE_OUTPUT.quality;
}

export function normalizeImageResolution(
  model: ImageModel,
  resolution?: ImageResolution | string
): ImageResolution {
  return FIXED_IMAGE_OUTPUT.resolution;
}

export function getImageCreditCost(
  model: ImageModel,
  _quality?: ImageQuality | string,
  resolution?: ImageResolution | string
): number {
  return FIXED_IMAGE_OUTPUT.creditCost;
}

export function resolveImageProviderSettings(
  _model: ImageModel,
  _quality?: ImageQuality | string,
  resolution?: ImageResolution | string
): { quality?: string; resolution?: ImageResolution } {
  return {
    quality: FIXED_IMAGE_OUTPUT.quality,
    resolution: FIXED_IMAGE_OUTPUT.resolution,
  };
}

export function resolveImageProviderModel(_model: ImageModel): string {
  return "gpt-image-2";
}

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
    supportsImageInput: boolean;
    /** Estimated generation duration in milliseconds (used for frontend progress bar) */
    estimatedDurationMs: number;
  }
> = {
  "gpt-image-2": {
    name: "GPT Image 2",
    description: "High quality image generation and editing",
    provider: "CiYuan",
    supportedAspectRatios: ["1:1"],
    isEnabled: true,
    supportsImageInput: true,
    estimatedDurationMs: 120_000,
  },
};

export function getSupportedAspectRatios(
  model: ImageModel
): ("1:1" | "16:9" | "9:16" | "3:4")[] {
  return IMAGE_MODELS[model]?.supportedAspectRatios || ["1:1"];
}

export function normalizeAspectRatio(
  ratio: string | undefined,
  model: ImageModel
): "1:1" | "16:9" | "9:16" | "3:4" {
  return FIXED_IMAGE_OUTPUT.aspectRatio;
}
