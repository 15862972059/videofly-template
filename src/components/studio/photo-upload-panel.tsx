"use client";

import { useCallback, useState } from "react";
import { CheckCircle2, Upload, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoUploadPanelProps {
  onUpload: (objectKey: string, previewUrl: string) => void;
  onUploadStateChange?: (uploading: boolean) => void;
  onClear?: () => void;
  disabled?: boolean;
}

export function PhotoUploadPanel({
  onUpload,
  onUploadStateChange,
  onClear,
  disabled,
}: PhotoUploadPanelProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);
      setUploading(true);
      onUploadStateChange?.(true);

      try {
        if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
          throw new Error("Invalid file type. Please upload JPEG, PNG, WebP, or GIF.");
        }

        if (file.size > 10 * 1024 * 1024) {
          throw new Error("File too large. Maximum size is 10MB.");
        }

        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", "source");

        const res = await fetch("/api/v1/image/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error?.message || "Upload failed");
        }

        const json = await res.json();
        if (!json.success) throw new Error(json.error?.message || "Upload failed");
        onUpload(json.data.objectKey, previewUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
        setPreview(null);
      } finally {
        setUploading(false);
        onUploadStateChange?.(false);
      }
    },
    [onUpload, onUploadStateChange]
  );

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
            <UserRound className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-white">Source photo</h3>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">Portrait or subject image</p>
          </div>
        </div>
        {preview && (
          <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Ready
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-3 dark:bg-slate-900/50">
        {preview ? (
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <img
              src={preview}
              alt="Uploaded preview"
              className="h-[190px] w-full object-contain"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-2 top-2 h-8 rounded-lg bg-white/95 px-2.5 text-xs text-slate-900 shadow-sm hover:bg-white"
              onClick={() => {
                setPreview(null);
                onUploadStateChange?.(false);
                onClear?.();
              }}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Replace
            </Button>
          </div>
        ) : (
          <label className="flex h-[190px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center transition hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-500 dark:hover:bg-slate-900">
            <div className="mb-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
              <Upload className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Upload portrait</span>
            <span className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500 dark:text-slate-400">
              JPG, PNG, WebP, or GIF under 10MB.
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              disabled={disabled || uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      {(error || uploading) && (
        <div className="border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
          {error && <p className="text-destructive">{error}</p>}
          {uploading && <p className="text-slate-500 dark:text-slate-400">Uploading portrait...</p>}
        </div>
      )}
    </section>
  );
}
