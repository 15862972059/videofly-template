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
    <div className="flex flex-1 flex-col min-w-0">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <UserRound className="h-3.5 w-3.5" />
            Step 2
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">
            Upload Your Photo
          </h3>
        </div>
        {preview && (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Uploaded
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] dark:bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)]">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Uploaded preview"
              className="h-[320px] w-full object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent p-5 text-white">
              <p className="text-sm font-semibold">Portrait ready</p>
              <p className="mt-1 text-xs text-white/75">
                We will preserve identity, outfit, and full-body framing.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="absolute right-4 top-4 rounded-full bg-white/90 text-slate-900 hover:bg-white"
              onClick={() => {
                setPreview(null);
                onUploadStateChange?.(false);
                onClear?.();
              }}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
        ) : (
          <label className="flex h-[320px] cursor-pointer flex-col items-center justify-center px-6 py-10 text-center transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <div className="mb-4 rounded-full bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
              <Upload className="h-7 w-7 text-slate-400" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Drop a portrait or click to upload</span>
            <span className="mt-2 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">
              JPEG, PNG, WebP, or GIF up to 10MB.
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

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {uploading && <p className="mt-3 text-sm text-slate-500">Uploading your portrait...</p>}
    </div>
  );
}
