export interface ImageGenerationRequest {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "3:4";
  model?: ImageModel;
  imageUrls?: string[];
  quality?: ImageQuality;
  resolution?: ImageResolution;
}

export type ImageModel = "gpt-image-2";

export type ImageQuality = "auto";

export type ImageResolution = "1k" | "2k" | "4k";

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
      value: "auto",
      label: "Auto",
      description: "Automatic quality selection",
      creditCost: 5,
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
    {
      value: "2k",
      label: "2K",
      description: "Higher detail for sharing and light editing",
      creditCost: 2,
    },
    {
      value: "4k",
      label: "4K",
      description: "Largest output for presentation and print crops",
      creditCost: 5,
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
  return "auto";
}

export function normalizeImageResolution(
  model: ImageModel,
  resolution?: ImageResolution | string
): ImageResolution {
  const options = getImageResolutionOptions(model);
  const fallback = options[0]?.value ?? "1k";
  if (options.some((option) => option.value === resolution)) {
    return resolution as ImageResolution;
  }
  return fallback;
}

export function getImageCreditCost(
  model: ImageModel,
  _quality?: ImageQuality | string,
  resolution?: ImageResolution | string
): number {
  const effectiveResolution = normalizeImageResolution(model, resolution);
  return (
    getImageResolutionOptions(model).find((option) => option.value === effectiveResolution)
      ?.creditCost ?? IMAGE_QUALITY_OPTIONS[model]?.[0]?.creditCost ?? 5
  );
}

export function resolveImageProviderSettings(
  _model: ImageModel,
  _quality?: ImageQuality | string,
  resolution?: ImageResolution | string
): { quality?: string; resolution?: ImageResolution } {
  return { resolution: normalizeImageResolution("gpt-image-2", resolution) };
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
    supportedAspectRatios: ["1:1", "16:9", "9:16", "3:4"],
    isEnabled: true,
    supportsImageInput: true,
    estimatedDurationMs: 120_000,
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
