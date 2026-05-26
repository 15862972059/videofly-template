import { parseJsonApiResponse } from "@/lib/api/client-response";

export interface ImageGenerationStartPayload {
  jobId: string;
  status: "QUEUED" | "RUNNING";
  creditsUsed: number;
}

export interface ImageGenerationResultPayload {
  jobId: string;
  objectKey: string;
  publicUrl: string;
}

interface ImageGenerationJobResponse {
  success: boolean;
  data?: {
    job: {
      id: string;
      status: string;
      result_image_key: string | null;
      result_image_url: string | null;
      error_message: string | null;
    };
  };
  error?: { message?: string };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForImageGenerationResult(
  jobId: string,
  options: { intervalMs?: number; timeoutMs?: number } = {}
): Promise<ImageGenerationResultPayload> {
  const intervalMs = options.intervalMs ?? 2500;
  const timeoutMs = options.timeoutMs ?? 300_000;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await fetch(`/api/v1/image/generations/${encodeURIComponent(jobId)}`, {
      cache: "no-store",
    });
    const payload = await parseJsonApiResponse<ImageGenerationJobResponse>(response);

    if (!payload.success) {
      throw new Error(payload.error?.message || "Failed to fetch generation status");
    }

    const job = payload.data?.job;
    if (!job) {
      throw new Error("Generation job not found");
    }

    if (job.status === "succeeded" && job.result_image_key && job.result_image_url) {
      return {
        jobId: job.id,
        objectKey: job.result_image_key,
        publicUrl: job.result_image_url,
      };
    }

    if (job.status === "failed") {
      throw new Error(job.error_message || "Image generation failed");
    }

    await delay(intervalMs);
  }

  throw new Error("Image generation is still running. Please check your generation history.");
}
