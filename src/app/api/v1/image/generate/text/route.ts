import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError, apiError } from "@/lib/api/response";
import { textGenerationRequestSchema } from "@/lib/validators/image";
import { generateTextImage } from "@/services/image/image-generation";

export async function POST(request: Request) {
  try {
    const user = await requireAuth(request);

    const body = await request.json();
    const parsed = textGenerationRequestSchema.safeParse(body);
    if (!parsed.success) {
      return apiError("Invalid request", 400, parsed.error.flatten());
    }

    const result = await generateTextImage({
      userId: user.id,
      prompt: parsed.data.prompt,
      aspectRatio: parsed.data.aspectRatio,
    });

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error);
  }
}
