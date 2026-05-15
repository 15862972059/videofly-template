import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError, apiError } from "@/lib/api/response";
import { getImageGenerationJobById } from "@/services/image/generation-jobs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const job = await getImageGenerationJobById(id);
    if (!job) {
      return apiError("Generation job not found", 404);
    }

    if (job.userId !== user.id && !user.isAdmin) {
      return apiError("Forbidden", 403);
    }

    return apiSuccess(job);
  } catch (error) {
    return handleApiError(error);
  }
}
