import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { listImageGenerationJobs } from "@/services/image/generation-jobs";
import { getStorage } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20;
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : 0;
    const type = searchParams.get("type") as "TEXT" | "REMIX" | undefined;
    const status = searchParams.get("status") as "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | undefined;

    const jobs = await listImageGenerationJobs({ userId: user.id, status, type, limit, offset });

    const storage = getStorage();

    const mappedJobs = jobs.map((job) => ({
      id: job.id,
      user_id: job.userId,
      type: job.type.toLowerCase(),
      status: job.status.toLowerCase(),
      classic_image_id: job.classicImageId,
      prompt: job.prompt,
      source_image_key: job.sourceImageKey,
      result_image_key: job.resultImageKey,
      result_image_url: job.resultImageUrl ?? (job.resultImageKey ? storage.getPublicUrl(job.resultImageKey) : null),
      credits_reserved: job.creditsUsed,
      error_message: job.errorMessage,
      created_at: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
      completed_at: job.completedAt instanceof Date ? job.completedAt.toISOString() : job.completedAt,
    }));

    return apiSuccess({ jobs: mappedJobs, limit, offset });
  } catch (error) {
    return handleApiError(error);
  }
}