"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Spinner,
} from "@/components/ui/icons";
import { Image as ImageIcon } from "lucide-react";

interface UserVideo {
  id: string;
  uuid: string;
  prompt: string;
  model: string;
  status: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  creditsUsed: number;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
}

interface UserVideosDialogProps {
  userId: string;
  userName: string | null;
  userEmail: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserVideosDialog({
  userId,
  userName,
  userEmail,
  open,
  onOpenChange,
}: UserVideosDialogProps) {
  const [page, setPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [videos, setVideos] = React.useState<UserVideo[]>([]);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalVideos, setTotalVideos] = React.useState(0);
  const [stats, setStats] = React.useState<{
    total: number;
    completed: number;
    failed: number;
    generating: number;
    successRate: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);

  // 加载图片列表和统计信息
  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId,
        page: page.toString(),
        ...(statusFilter && statusFilter !== "all" ? { status: statusFilter } : {}),
      });

      const response = await fetch(`/api/v1/admin/user-videos?${params}`);
      if (!response.ok) {
        throw new Error("获取数据失败");
      }

      const data = await response.json();
      setVideos(data.videos);
      setTotalPages(data.totalPages);
      setTotalVideos(data.totalVideos);
      setStats(data.stats);
    } catch (error) {
      console.error("加载图片失败:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, page, statusFilter]);

  // 当对话框打开或筛选条件改变时重新加载
  React.useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  // 重置页码当筛选条件改变
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "COMPLETED":
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            已完成
          </Badge>
        );
      case "failed":
      case "FAILED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            失败
          </Badge>
        );
      case "generating":
      case "GENERATING":
        return (
          <Badge variant="default" className="gap-1 bg-yellow-600">
            <Spinner className="h-3 w-3 animate-spin" />
            生成中
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            待处理
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            用户图片历史
          </DialogTitle>
          <DialogDescription>
            {userName || userEmail} 的图片生成记录
          </DialogDescription>
        </DialogHeader>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">总图片数</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-xs text-muted-foreground">已完成</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-red-600">
                {stats.failed}
              </div>
              <div className="text-xs text-muted-foreground">失败</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.generating}
              </div>
              <div className="text-xs text-muted-foreground">生成中</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-2xl font-bold">
                {stats.successRate}%
              </div>
              <div className="text-xs text-muted-foreground">成功率</div>
            </div>
          </div>
        )}

        {/* 筛选器 */}
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="状态筛选" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="COMPLETED">已完成</SelectItem>
              <SelectItem value="GENERATING">生成中</SelectItem>
              <SelectItem value="FAILED">失败</SelectItem>
              <SelectItem value="PENDING">待处理</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 图片列表 */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : videos.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              暂无图片记录
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">提示词</TableHead>
                  <TableHead>模型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>图片预览</TableHead>
                  <TableHead>消耗积分</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="max-w-[300px]">
                      <div className="truncate" title={video.prompt}>
                        {video.prompt}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {video.model}
                    </TableCell>
                    <TableCell>{getStatusBadge(video.status)}</TableCell>
                    <TableCell>
                      {video.videoUrl ? (
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-fit"
                        >
                          <img
                            src={video.videoUrl}
                            alt="图片预览"
                            className="h-16 w-16 object-cover rounded border hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ) : video.errorMessage ? (
                        <span
                          className="text-xs text-red-600 cursor-help"
                          title={video.errorMessage}
                        >
                          失败
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{video.creditsUsed}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDistanceToNow(new Date(video.createdAt), {
                        addSuffix: true,
                        locale: zhCN,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              共 {totalVideos} 个图片，第 {page} / {totalPages} 页
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一页
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                下一页
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
