import { db } from "@/db";
import { imageGenerationJobs } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface UserVideo {
  id: string;
  uuid: string;
  prompt: string;
  model: string;
  status: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  resolution: string | null;
  creditsUsed: number;
  createdAt: Date;
  completedAt: Date | null;
  errorMessage: string | null;
}

export interface UserVideosResult {
  videos: UserVideo[];
  totalVideos: number;
  totalPages: number;
}

/**
 * 获取指定用户的图片生成历史记录
 */
export async function getUserVideos({
  userId,
  page = 1,
  limit = 10,
  status,
}: {
  userId: string;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<UserVideosResult> {
  const offset = (page - 1) * limit;

  // 构建查询条件
  const whereConditions = [
    eq(imageGenerationJobs.userId, userId),
  ];

  if (status && status !== "all") {
    let queryStatus = status;
    if (status === "COMPLETED") queryStatus = "SUCCEEDED";
    if (status === "PENDING" || status === "GENERATING" || status === "UPLOADING") {
      whereConditions.push(sql`${imageGenerationJobs.status} IN ('QUEUED', 'RUNNING')`);
    } else {
      whereConditions.push(eq(imageGenerationJobs.status, queryStatus as any));
    }
  }

  const conditions = and(...whereConditions);

  // 并行查询总数和当前页数据
  const [totalResult, jobsResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(imageGenerationJobs).where(conditions),
    db
      .select({
        id: imageGenerationJobs.id,
        prompt: imageGenerationJobs.prompt,
        status: imageGenerationJobs.status,
        resultImageUrl: imageGenerationJobs.resultImageUrl,
        creditsUsed: imageGenerationJobs.creditsUsed,
        createdAt: imageGenerationJobs.createdAt,
        completedAt: imageGenerationJobs.completedAt,
        errorMessage: imageGenerationJobs.errorMessage,
        parameters: imageGenerationJobs.parameters,
      })
      .from(imageGenerationJobs)
      .where(conditions)
      .orderBy(desc(imageGenerationJobs.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  const totalVideos = totalResult[0]?.count || 0;
  const totalPages = Math.ceil(totalVideos / limit);

  const mappedVideos = jobsResult.map((job) => {
    let model = "gpt-image-2";
    if (job.parameters && typeof job.parameters === "object") {
      const params = job.parameters as Record<string, any>;
      if (params.model) model = params.model;
    }

    let mappedStatus = "pending";
    if (job.status === "SUCCEEDED") mappedStatus = "completed";
    else if (job.status === "FAILED") mappedStatus = "failed";
    else if (job.status === "RUNNING") mappedStatus = "generating";

    return {
      id: job.id,
      uuid: job.id,
      prompt: job.prompt || "",
      model,
      status: mappedStatus,
      videoUrl: job.resultImageUrl,
      thumbnailUrl: job.resultImageUrl,
      duration: null,
      resolution: null,
      creditsUsed: job.creditsUsed,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      errorMessage: job.errorMessage,
    };
  });

  return {
    videos: mappedVideos,
    totalVideos,
    totalPages,
  };
}

/**
 * 获取用户的图片生成统计信息
 */
export async function getUserVideoStats(userId: string) {
  const [totalResult, completedResult, failedResult, generatingResult] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(imageGenerationJobs)
        .where(eq(imageGenerationJobs.userId, userId)),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(imageGenerationJobs)
        .where(
          and(
            eq(imageGenerationJobs.userId, userId),
            eq(imageGenerationJobs.status, "SUCCEEDED")
          )
        ),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(imageGenerationJobs)
        .where(
          and(
            eq(imageGenerationJobs.userId, userId),
            eq(imageGenerationJobs.status, "FAILED")
          )
        ),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(imageGenerationJobs)
        .where(
          and(
            eq(imageGenerationJobs.userId, userId),
            sql`${imageGenerationJobs.status} IN ('QUEUED', 'RUNNING')`
          )
        ),
    ]);

  const total = totalResult[0]?.count || 0;
  const completed = completedResult[0]?.count || 0;
  const failed = failedResult[0]?.count || 0;
  const generating = generatingResult[0]?.count || 0;

  const successRate = total > 0 ? (completed / total) * 100 : 0;

  return {
    total,
    completed,
    failed,
    generating,
    successRate: Math.round(successRate * 10) / 10,
  };
}
