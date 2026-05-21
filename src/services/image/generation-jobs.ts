import { and, count, desc, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db, imageGenerationJobs } from "@/db";

export type ImageGenerationType = "TEXT" | "REMIX";
export type ImageGenerationStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

export interface GenerationJobFilters {
  userId?: string;
  status?: ImageGenerationStatus;
  type?: ImageGenerationType;
  limit?: number;
  offset?: number;
}

export interface CreateImageGenerationJobInput {
  userId: string;
  type: ImageGenerationType;
  classicImageId?: string;
  prompt?: string;
  sourceImageKey?: string;
  creditsUsed?: number;
  parameters?: Record<string, unknown>;
}

export async function listImageGenerationJobs(filters: GenerationJobFilters = {}) {
  const conditions = [];

  if (filters.userId) {
    conditions.push(eq(imageGenerationJobs.userId, filters.userId));
  }
  if (filters.status) {
    conditions.push(eq(imageGenerationJobs.status, filters.status));
  }
  if (filters.type) {
    conditions.push(eq(imageGenerationJobs.type, filters.type));
  }

  const query = db
    .select()
    .from(imageGenerationJobs)
    .where(and(...conditions))
    .orderBy(desc(imageGenerationJobs.createdAt))
    .limit(filters.limit ?? 20);

  if (filters.offset !== undefined) {
    query.offset(filters.offset);
  }

  return query;
}

export async function countImageGenerationJobs(filters: GenerationJobFilters = {}) {
  const conditions = [];

  if (filters.userId) {
    conditions.push(eq(imageGenerationJobs.userId, filters.userId));
  }
  if (filters.status) {
    conditions.push(eq(imageGenerationJobs.status, filters.status));
  }
  if (filters.type) {
    conditions.push(eq(imageGenerationJobs.type, filters.type));
  }

  const result = await db
    .select({ total: count() })
    .from(imageGenerationJobs)
    .where(and(...conditions));
  return result[0]?.total ?? 0;
}

export async function getImageGenerationJobById(id: string) {
  const results = await db
    .select()
    .from(imageGenerationJobs)
    .where(eq(imageGenerationJobs.id, id))
    .limit(1);
  return results[0] ?? null;
}

export async function createImageGenerationJob(input: CreateImageGenerationJobInput) {
  const id = input.parameters?.["id"] as string ?? `job_${nanoid(12)}`;
  const [job] = await db
    .insert(imageGenerationJobs)
    .values({
      id,
      userId: input.userId,
      type: input.type,
      classicImageId: input.classicImageId ?? null,
      prompt: input.prompt ?? null,
      sourceImageKey: input.sourceImageKey ?? null,
      creditsUsed: input.creditsUsed ?? 0,
      parameters: input.parameters ?? null,
      status: "QUEUED",
    })
    .returning();
  return job ?? null;
}

export async function updateImageGenerationJobStatus(
  id: string,
  status: ImageGenerationStatus,
  updates?: {
    resultImageKey?: string;
    resultImageUrl?: string;
    errorMessage?: string;
  }
) {
  const data: Record<string, unknown> = {
    status,
    updatedAt: new Date(),
  };

  if (status === "SUCCEEDED" || status === "FAILED") {
    data.completedAt = new Date();
  }

  if (updates?.resultImageKey !== undefined) {
    data.resultImageKey = updates.resultImageKey;
  }
  if (updates?.resultImageUrl !== undefined) {
    data.resultImageUrl = updates.resultImageUrl;
  }
  if (updates?.errorMessage !== undefined) {
    data.errorMessage = updates.errorMessage;
  }

  const [updated] = await db
    .update(imageGenerationJobs)
    .set(data)
    .where(eq(imageGenerationJobs.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteImageGenerationJob(id: string, userId: string) {
  const [deleted] = await db
    .delete(imageGenerationJobs)
    .where(
      and(
        eq(imageGenerationJobs.id, id),
        eq(imageGenerationJobs.userId, userId)
      )
    )
    .returning();
  return deleted ?? null;
}
