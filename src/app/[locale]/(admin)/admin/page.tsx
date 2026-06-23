import { db } from "@/db";
import { users, imageGenerationJobs, creditPackages, creditTransactions } from "@/db/schema";
import { count, eq, and, sql } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users as UsersIcon,
  Coins,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from "@/components/ui/icons";
import { Image as ImageIcon } from "lucide-react";

export default async function AdminDashboardPage() {
  // 获取统计数据
  const [
    totalUsersResult,
    totalImagesResult,
    totalCreditPackagesResult,
    completedImagesResult,
    failedImagesResult,
    pendingImagesResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(imageGenerationJobs),
    db.select({ count: count() }).from(creditPackages),
    db.select({ count: count() }).from(imageGenerationJobs).where(eq(imageGenerationJobs.status, "SUCCEEDED")),
    db.select({ count: count() }).from(imageGenerationJobs).where(eq(imageGenerationJobs.status, "FAILED")),
    db.select({ count: count() }).from(imageGenerationJobs).where(sql`${imageGenerationJobs.status} IN ('QUEUED', 'RUNNING')`),
  ]);

  const totalUsers = totalUsersResult[0]?.count || 0;
  const totalImages = totalImagesResult[0]?.count || 0;
  const completedImages = completedImagesResult[0]?.count || 0;
  const failedImages = failedImagesResult[0]?.count || 0;
  const pendingImages = pendingImagesResult[0]?.count || 0;

  // 计算图片生成成功率
  const totalFinishedImages = completedImages + failedImages;
  const successRate = totalFinishedImages > 0
    ? (completedImages / totalFinishedImages) * 100
    : 0;

  // 获取最近注册用户（最近7天）
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString();
  const recentUsersResult = await db
    .select({ count: count() })
    .from(users)
    .where(sql`${users.createdAt} >= ${sevenDaysAgoStr}::timestamp`);
  const recentUsers = recentUsersResult[0]?.count || 0;

  // 获取最近图片生成（最近7天）
  const recentImagesResult = await db
    .select({ count: count() })
    .from(imageGenerationJobs)
    .where(sql`${imageGenerationJobs.createdAt} >= ${sevenDaysAgoStr}::timestamp`);
  const recentImages = recentImagesResult[0]?.count || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          管理后台概览
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              总用户数
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              最近7天: +{recentUsers}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              图片生成总数
            </CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalImages}</div>
            <p className="text-xs text-muted-foreground">
              最近7天: +{recentImages}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              成功率
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {completedImages} / {totalFinishedImages} 完成
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              积分包总数
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditPackagesResult[0]?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              所有用户
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Image Status Breakdown */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              已完成
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedImages}</div>
            <p className="text-xs text-muted-foreground">
              {totalImages > 0 ? ((completedImages / totalImages) * 100).toFixed(1) : 0}% 的总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              失败
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedImages}</div>
            <p className="text-xs text-muted-foreground">
              {totalImages > 0 ? ((failedImages / totalImages) * 100).toFixed(1) : 0}% 的总数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              处理中
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingImages}</div>
            <p className="text-xs text-muted-foreground">
              {totalImages > 0 ? ((pendingImages / totalImages) * 100).toFixed(1) : 0}% 的总数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>
            常用管理功能
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="/admin/users"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <UsersIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">用户管理</div>
              <div className="text-sm text-muted-foreground">查看和管理用户</div>
            </div>
          </a>

          <a
            href="/admin/analytics"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">数据分析</div>
              <div className="text-sm text-muted-foreground">查看详细统计</div>
            </div>
          </a>

          <a
            href="/admin/settings"
            className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <Coins className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="font-medium">积分配置</div>
              <div className="text-sm text-muted-foreground">修改积分规则</div>
            </div>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
