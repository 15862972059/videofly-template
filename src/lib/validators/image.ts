import { z } from "zod";

export const imageModelEnum = z.enum([
  "gpt-image-2",
]);

export const imageQualityEnum = z.enum([
  "auto",
]);

export const remixRequestSchema = z.object({
  classicImageId: z.string().optional(),
  classicImageSlug: z.string().optional(),
  sourceImageKey: z.string(),
  prompt: z.string().optional(),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).optional(),
  model: imageModelEnum.optional().default("gpt-image-2"),
  quality: imageQualityEnum.optional().default("auto"),
}).refine(
  (data) => data.classicImageId || data.classicImageSlug,
  { message: "Either classicImageId or classicImageSlug is required" }
);

export const textGenerationRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4"]).optional(),
  model: imageModelEnum.optional().default("gpt-image-2"),
  quality: imageQualityEnum.optional().default("auto"),
}).refine(
  (data) => !data.prompt || data.prompt.length <= 1000,
  { message: "Prompt must be under 1000 characters" }
);

export type RemixRequestInput = z.input<typeof remixRequestSchema>;
export type RemixRequestOutput = z.output<typeof remixRequestSchema>;
export type TextGenerationRequestInput = z.input<typeof textGenerationRequestSchema>;
export type TextGenerationRequestOutput = z.output<typeof textGenerationRequestSchema>;
export type ImageModel = z.infer<typeof imageModelEnum>;
export type ImageQuality = z.infer<typeof imageQualityEnum>;
