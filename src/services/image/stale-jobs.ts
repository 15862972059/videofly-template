import { creditService } from "@/services/credit";
import {
  failStaleImageGenerationJob,
  failStaleImageGenerationJobs,
} from "./generation-jobs";

export const STALE_IMAGE_JOB_MS = 315_000;

function staleCutoff(now: Date): Date {
  return new Date(now.getTime() - STALE_IMAGE_JOB_MS);
}

async function releaseClaimedJob(jobId: string): Promise<void> {
  try {
    await creditService.release(jobId);
  } catch (error) {
    console.error(`[image-generation] Failed to release stale job ${jobId}:`, error);
  }
}

export async function reconcileStaleImageGenerationJobs(
  userId: string,
  now = new Date()
) {
  const jobs = await failStaleImageGenerationJobs(userId, staleCutoff(now));
  await Promise.all(jobs.map((job) => releaseClaimedJob(job.id)));
  return jobs;
}

export async function reconcileStaleImageGenerationJob(
  jobId: string,
  userId: string,
  now = new Date()
) {
  const job = await failStaleImageGenerationJob(
    jobId,
    userId,
    staleCutoff(now)
  );
  if (job) {
    await releaseClaimedJob(job.id);
  }
  return job;
}
