"use client";

import { useEffect, useState } from "react";
import type { ClassicImageData } from "@/types/ai-photo";
import { PromptPanel } from "./prompt-panel";
import { PhotoUploadPanel } from "./photo-upload-panel";
import { RemixResultPanel } from "./remix-result-panel";
import { RemixScenePanel } from "./remix-scene-panel";
import { GenerationProgress } from "./generation-progress";
import {
  IMAGE_MODELS,
  type ImageModel,
  type ImageQuality,
  type ImageResolution,
} from "@/ai/images/types";
import { getSupportedAspectRatios, normalizeImageQuality } from "@/ai/images/types";
import { parseJsonApiResponse } from "@/lib/api/client-response";
import {
  type ImageGenerationStartPayload,
  waitForImageGenerationResult,
} from "@/lib/image-generation-client";

interface RemixWorkspaceProps {
  initialScene?: ClassicImageData;
}

export function RemixWorkspace({ initialScene }: RemixWorkspaceProps) {
  const [sourceImageKey, setSourceImageKey] = useState<string | null>(null);
  const [uploadingSource, setUploadingSource] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4" | "9:16" | "16:9">("9:16");
  const [selectedScene, setSelectedScene] = useState<ClassicImageData | null>(initialScene || null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ objectKey: string; publicUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ImageModel>("gpt-image-2");
  const [quality, setQuality] = useState<ImageQuality>("auto");
  const [resolution, setResolution] = useState<ImageResolution>("1k");

  useEffect(() => {
    if (initialScene) {
      setSelectedScene(initialScene);
    }
  }, [initialScene]);

  // Auto-adjust aspect ratio when model changes if current ratio is not supported
  useEffect(() => {
    const supported = getSupportedAspectRatios(model);
    if (!supported.includes(aspectRatio)) {
      setAspectRatio(supported[0]);
    }
  }, [model, aspectRatio]);

  const handleUpload = (objectKey: string, _previewUrl: string) => {
    setSourceImageKey(objectKey);
    setError(null);
  };

  const handleGenerate = async (prompt: string) => {
    if (!sourceImageKey || !selectedScene) {
      setError("Please upload a photo and select a scene");
      return;
    }

    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/v1/image/generate/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classicImageId: selectedScene.id,
          classicImageSlug: selectedScene.slug,
          sourceImageKey,
          prompt,
          aspectRatio,
          model,
          quality,
          resolution,
        }),
      });

      const data = await parseJsonApiResponse<{
        success: boolean;
        data: ImageGenerationStartPayload;
        error?: { message?: string };
      }>(res);
      if (!data.success) {
        throw new Error(data.error?.message || "Generation failed");
      }

      const completed = await waitForImageGenerationResult(data.data.jobId, {
        timeoutMs: IMAGE_MODELS[model]?.estimatedDurationMs
          ? IMAGE_MODELS[model].estimatedDurationMs * 3
          : 300_000,
      });
      setResult(completed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative grid min-h-[calc(100vh-13rem)] gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_392px]">
      <main className="flex min-h-[640px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Image Remix Workspace</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Compose a new image from your portrait and a selected scene.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {IMAGE_MODELS[model]?.name ?? model}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {aspectRatio}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {resolution.toUpperCase()}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {selectedScene ? "Scene ready" : "Choose scene"}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 bg-slate-50/70 p-4 dark:bg-slate-900/40">
          <GenerationProgress
            isGenerating={generating}
            estimatedDurationMs={IMAGE_MODELS[model]?.estimatedDurationMs ?? 60_000}
            modelName={IMAGE_MODELS[model]?.name ?? model}
          />
          <RemixResultPanel
            result={result}
            sourceImageKey={sourceImageKey}
            selectedScene={selectedScene}
            aspectRatio={aspectRatio}
          />
        </div>

        <PromptPanel
          classicScene={
            selectedScene
              ? {
                  slug: selectedScene.slug,
                  title: selectedScene.title,
                  category: selectedScene.category,
                  prompt_template: selectedScene.prompt_template,
                }
              : undefined
          }
          aspectRatio={aspectRatio}
          model={model}
          onAspectRatioChange={setAspectRatio}
          onModelChange={(nextModel) => {
            setModel(nextModel);
            setQuality(normalizeImageQuality(nextModel, quality));
          }}
          onGenerate={handleGenerate}
          disabled={generating || uploadingSource || !selectedScene || !sourceImageKey}
          loading={generating}
          quality={quality}
          onQualityChange={setQuality}
          resolution={resolution}
          onResolutionChange={setResolution}
          imageInputOnly
        />
      </main>

      <aside className="grid min-w-0 gap-4 self-start lg:grid-cols-2 xl:sticky xl:top-6 xl:grid-cols-1">
        <RemixScenePanel
          selectedScene={selectedScene}
          onSelect={setSelectedScene}
          onClear={() => setSelectedScene(null)}
        />
        <PhotoUploadPanel
          onUpload={handleUpload}
          onUploadStateChange={setUploadingSource}
          onClear={() => setSourceImageKey(null)}
          disabled={generating}
        />
      </aside>

      {error && (
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm text-destructive shadow-lg dark:border-red-800 dark:bg-slate-900">
          {error}
        </div>
      )}
    </div>
  );
}
