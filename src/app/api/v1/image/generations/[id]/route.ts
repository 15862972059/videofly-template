import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, apiError, handleApiError } from "@/lib/api/response";
import {
  deleteImageGenerationJob,
  getImageGenerationJobById,
} from "@/services/image/generation-jobs";
import { getStorage } from "@/lib/storage";
import { reconcileStaleImageGenerationJob } from "@/services/image/stale-jobs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    let job = await getImageGenerationJobById(id);

    if (!job || job.userId !== user.id) {
      return apiError("Generation job not found", 404);
    }

    const reconciled = await reconcileStaleImageGenerationJob(id, user.id);
    if (reconciled) {
      job = reconciled;
    }

    const storage = getStorage();
    return apiSuccess({
      job: {
        id: job.id,
        type: job.type.toLowerCase(),
        status: job.status.toLowerCase(),
        prompt: job.prompt,
        source_image_key: job.sourceImageKey,
        result_image_key: job.resultImageKey,
        result_image_url: job.resultImageUrl ?? (job.resultImageKey ? storage.getPublicUrl(job.resultImageKey) : null),
        error_message: job.errorMessage,
        created_at: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
        completed_at: job.completedAt instanceof Date ? job.completedAt.toISOString() : job.completedAt,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const deleted = await deleteImageGenerationJob(id, user.id);

    if (!deleted) {
      return apiError("Generation job not found", 404);
    }

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
