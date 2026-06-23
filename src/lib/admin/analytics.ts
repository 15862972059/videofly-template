import { db } from "@/db";
import { users, imageGenerationJobs, creditTransactions, CreditTransType } from "@/db/schema";
import { count, eq, and, sql, desc, gte } from "drizzle-orm";

export type TimeRange = "today" | "7d" | "30d" | "90d" | "all";

export interface Stats {
  totalUsers: number;
  totalOrders: number;
  paidOrders: number;
  totalVideos: number; // 映射为图片总数
  firstVideoConversionRate: number; // 映射为首张图片转化率
  paymentConversionRate: number;
  videoSuccessRate: number; // 映射为图片生成成功率
  usersWithoutVideos: number; // 映射为未生成图片用户数
}

export interface FunnelData {
  registeredUsers: number;
  firstVideoUsers: number; // 映射为首张图片生成用户数
  successfulFirstVideoUsers: number; // 映射为首张图片成功用户数
}

export interface TrendDataPoint {
  date: string;
  registeredUsers: number;
  firstVideoUsers: number;
  successfulFirstVideoUsers: number;
  firstVideoConversionRate: number;
  firstVideoSuccessRate: number;
}

export interface AnalyticsData {
  stats: Stats;
  funnel: FunnelData;
  trend: TrendDataPoint[];
}

class AnalyticsService {
  private getTimeFilter(range: TimeRange): Date | null {
    if (range === "all") return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case "today":
        return today;
      case "7d":
        return new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "30d":
        return new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "90d":
        return new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return null;
    }
  }

  private buildTimeCondition(timeFilter: Date | null) {
    if (!timeFilter) return sql`true`;
    return sql`${users.createdAt} >= ${timeFilter.toISOString()}::timestamp`;
  }

  private buildImageTimeCondition(timeFilter: Date | null) {
    if (!timeFilter) return sql`true`;
    return sql`${imageGenerationJobs.createdAt} >= ${timeFilter.toISOString()}::timestamp`;
  }

  private buildTransactionTimeCondition(timeFilter: Date | null) {
    if (!timeFilter) return sql`true`;
    return sql`${creditTransactions.createdAt} >= ${timeFilter.toISOString()}::timestamp`;
  }

  async getStats(range: TimeRange): Promise<Stats> {
    const timeFilter = this.getTimeFilter(range);
    const timeCondition = this.buildTimeCondition(timeFilter);
    const imageTimeCondition = this.buildImageTimeCondition(timeFilter);
    const transactionTimeCondition = this.buildTransactionTimeCondition(timeFilter);

    // Parallel queries for better performance
    const [
      totalUsersResult,
      totalOrdersResult,
      paidOrdersResult,
      totalImagesResult,
      completedImagesResult,
      failedImagesResult,
      usersWithImagesResult,
      payingUsersResult,
    ] = await Promise.all([
      // 1. Total users
      db.select({ count: count() }).from(users).where(timeCondition),

      // 2. Total orders (ORDER_PAY + SUBSCRIPTION)
      db
        .select({ count: count() })
        .from(creditTransactions)
        .where(
          and(
            transactionTimeCondition,
            sql`${creditTransactions.transType} IN (${CreditTransType.ORDER_PAY}, ${CreditTransType.SUBSCRIPTION})`
          )
        ),

      // 3. Paid orders (unique orderNo)
      db
        .select({ count: count() })
        .from(creditTransactions)
        .where(
          and(
            transactionTimeCondition,
            sql`${creditTransactions.transType} IN (${CreditTransType.ORDER_PAY}, ${CreditTransType.SUBSCRIPTION})`
          )
        )
        .then((result) => {
          // Get unique order numbers
          return db
            .selectDistinct({ orderNo: creditTransactions.orderNo })
            .from(creditTransactions)
            .where(
              and(
                transactionTimeCondition,
                sql`${creditTransactions.transType} IN (${CreditTransType.ORDER_PAY}, ${CreditTransType.SUBSCRIPTION})`,
                sql`${creditTransactions.orderNo} IS NOT NULL`
              )
            )
            .then((orders) => ({ count: orders.length }));
        }),

      // 4. Total image generation jobs
      db
        .select({ count: count() })
        .from(imageGenerationJobs)
        .where(imageTimeCondition),

      // 5. Completed images (SUCCEEDED)
      db
        .select({ count: count() })
        .from(imageGenerationJobs)
        .where(and(imageTimeCondition, eq(imageGenerationJobs.status, "SUCCEEDED"))),

      // 6. Failed images (FAILED)
      db
        .select({ count: count() })
        .from(imageGenerationJobs)
        .where(and(imageTimeCondition, eq(imageGenerationJobs.status, "FAILED"))),

      // 7. Users who generated at least one image
      db
        .selectDistinct({ userId: imageGenerationJobs.userId })
        .from(imageGenerationJobs)
        .where(imageTimeCondition)
        .then((result) => ({ count: result.length })),

      // 8. Users who made at least one payment
      db
        .selectDistinct({ userId: creditTransactions.userId })
        .from(creditTransactions)
        .where(
          and(
            transactionTimeCondition,
            sql`${creditTransactions.transType} IN (${CreditTransType.ORDER_PAY}, ${CreditTransType.SUBSCRIPTION})`
          )
        )
        .then((result) => ({ count: result.length })),
    ]);

    const totalUsers = totalUsersResult[0]?.count || 0;
    const totalOrders = totalOrdersResult[0]?.count || 0;
    const paidOrders = paidOrdersResult.count || 0;
    const totalVideos = totalImagesResult[0]?.count || 0;
    const completedImages = completedImagesResult[0]?.count || 0;
    const failedImages = failedImagesResult[0]?.count || 0;
    const usersWithImages = usersWithImagesResult.count || 0;
    const payingUsers = payingUsersResult.count || 0;

    // Calculate rates
    const firstVideoConversionRate = totalUsers > 0 ? (usersWithImages / totalUsers) * 100 : 0;
    const paymentConversionRate = totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0;

    const totalFinishedImages = completedImages + failedImages;
    const videoSuccessRate = totalFinishedImages > 0 ? (completedImages / totalFinishedImages) * 100 : 0;

    // Users who haven't generated any image
    const usersWithoutVideos = totalUsers - usersWithImages;

    return {
      totalUsers,
      totalOrders,
      paidOrders,
      totalVideos,
      firstVideoConversionRate: Math.round(firstVideoConversionRate * 10) / 10,
      paymentConversionRate: Math.round(paymentConversionRate * 10) / 10,
      videoSuccessRate: Math.round(videoSuccessRate * 10) / 10,
      usersWithoutVideos,
    };
  }

  async getFunnelData(range: TimeRange): Promise<FunnelData> {
    const timeFilter = this.getTimeFilter(range);
    const timeCondition = this.buildTimeCondition(timeFilter);
    const imageTimeCondition = this.buildImageTimeCondition(timeFilter);

    // Get total registered users
    const [totalUsersResult] = await Promise.all([
      db.select({ count: count() }).from(users).where(timeCondition),
    ]);

    const registeredUsers = totalUsersResult[0]?.count || 0;

    // Get users with their first image job
    const firstImagesQuery = db
      .select({
        userId: imageGenerationJobs.userId,
        status: imageGenerationJobs.status,
        createdAt: imageGenerationJobs.createdAt,
        rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${imageGenerationJobs.userId} ORDER BY ${imageGenerationJobs.createdAt} ASC)`.as("rn"),
      })
      .from(imageGenerationJobs)
      .where(imageTimeCondition)
      .as("first_images");

    const firstImagesResult = await db
      .select({
        userId: firstImagesQuery.userId,
        status: firstImagesQuery.status,
      })
      .from(firstImagesQuery)
      .where(sql`${firstImagesQuery.rn} = 1`);

    const firstVideoUsers = firstImagesResult.length;
    const successfulFirstVideoUsers = firstImagesResult.filter((v) => v.status === "SUCCEEDED").length;

    return {
      registeredUsers,
      firstVideoUsers,
      successfulFirstVideoUsers,
    };
  }

  async getTrendData(range: TimeRange): Promise<TrendDataPoint[]> {
    const timeFilter = this.getTimeFilter(range);
    const startDate = timeFilter || new Date(0); // Epoch if no filter

    // Determine the number of days based on range
    const daysMap = { today: 1, "7d": 7, "30d": 30, "90d": 90, all: 365 };
    const days = daysMap[range] || 30;

    // Generate date series
    const dates: string[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      dates.push(date.toISOString().split("T")[0]);
    }

    // Get daily registrations
    const dailyRegistrations: Record<string, number> = {};
    const registrationData = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`.as("date"),
        count: count(),
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    registrationData.forEach((row) => {
      dailyRegistrations[row.date] = row.count;
    });

    // Get users with their first image by date
    const firstImageData = await db
      .select({
        userId: imageGenerationJobs.userId,
        createdAt: imageGenerationJobs.createdAt,
        status: imageGenerationJobs.status,
        rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${imageGenerationJobs.userId} ORDER BY ${imageGenerationJobs.createdAt} ASC)`.as("rn"),
      })
      .from(imageGenerationJobs)
      .where(gte(imageGenerationJobs.createdAt, startDate));

    // Group first images by date
    const dailyFirstImages: Record<string, { total: number; successful: number }> = {};

    firstImageData.forEach((row) => {
      if (row.rn === 1) {
        const date = new Date(row.createdAt).toISOString().split("T")[0];
        if (!dailyFirstImages[date]) {
          dailyFirstImages[date] = { total: 0, successful: 0 };
        }
        dailyFirstImages[date].total++;
        if (row.status === "SUCCEEDED") {
          dailyFirstImages[date].successful++;
        }
      }
    });

    // Build trend data
    const trend: TrendDataPoint[] = dates.map((date) => {
      const registeredUsers = dailyRegistrations[date] || 0;
      const firstImageDataVal = dailyFirstImages[date] || { total: 0, successful: 0 };
      const firstVideoUsers = firstImageDataVal.total;
      const successfulFirstVideoUsers = firstImageDataVal.successful;

      const firstVideoConversionRate = registeredUsers > 0 ? (firstVideoUsers / registeredUsers) * 100 : 0;
      const firstVideoSuccessRate = firstVideoUsers > 0 ? (successfulFirstVideoUsers / firstVideoUsers) * 100 : 0;

      return {
        date,
        registeredUsers,
        firstVideoUsers,
        successfulFirstVideoUsers,
        firstVideoConversionRate: Math.round(firstVideoConversionRate * 10) / 10,
        firstVideoSuccessRate: Math.round(firstVideoSuccessRate * 10) / 10,
      };
    });

    return trend;
  }

  async getAnalyticsData(range: TimeRange): Promise<AnalyticsData> {
    const [stats, funnel, trend] = await Promise.all([
      this.getStats(range),
      this.getFunnelData(range),
      this.getTrendData(range),
    ]);

    return {
      stats,
      funnel,
      trend,
    };
  }
}

export const analyticsService = new AnalyticsService();
