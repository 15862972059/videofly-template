import { z } from "zod";

export const imageModelEnum = z.enum([
  "gpt-image-2",
]);

export const imageQualityEnum = z.enum([
  "low",
]);

export const imageResolutionEnum = z.enum([
  "1k",
]);

export const remixRequestSchema = z.object({
  classicImageId: z.string().optional(),
  classicImageSlug: z.string().optional(),
  sourceImageKey: z.string(),
  prompt: z.string().optional(),
}).refine(
  (data) => data.classicImageId || data.classicImageSlug,
  { message: "Either classicImageId or classicImageSlug is required" }
);

export const textGenerationRequestSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(5000, "Prompt must be under 5000 characters"),
});

export type RemixRequestInput = z.input<typeof remixRequestSchema>;
export type RemixRequestOutput = z.output<typeof remixRequestSchema>;
export type TextGenerationRequestInput = z.input<typeof textGenerationRequestSchema>;
export type TextGenerationRequestOutput = z.output<typeof textGenerationRequestSchema>;
export type ImageModel = z.infer<typeof imageModelEnum>;
export type ImageQuality = z.infer<typeof imageQualityEnum>;
export type ImageResolution = z.infer<typeof imageResolutionEnum>;
