import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError, apiError } from "@/lib/api/response";
import { remixRequestSchema } from "@/lib/validators/image";
import { generateRemixImage } from "@/services/image/image-generation";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const parsed = remixRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid request", 400, parsed.error.flatten());
    }

    const result = await generateRemixImage({
      userId: user.id,
      classicImageId: parsed.data.classicImageId,
      classicImageSlug: parsed.data.classicImageSlug,
      sourceImageKey: parsed.data.sourceImageKey,
      prompt: parsed.data.prompt,
      aspectRatio: parsed.data.aspectRatio,
      model: parsed.data.model,
    });

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
