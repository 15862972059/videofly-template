import { requireAuth } from "@/lib/api/auth";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { listImageGenerationJobs, countImageGenerationJobs } from "@/services/image/generation-jobs";

export async function GET(request: Request) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : 0;
    const type = searchParams.get("type") as "TEXT" | "REMIX" | undefined;
    const status = searchParams.get("status") as "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | undefined;

    const jobs = await listImageGenerationJobs({ userId: user.id, status, type, limit, offset });
    const total = await countImageGenerationJobs({ userId: user.id, status, type });

    return apiSuccess({ jobs, total, limit, offset });
  } catch (error) {
    return handleApiError(error);
  }
}
