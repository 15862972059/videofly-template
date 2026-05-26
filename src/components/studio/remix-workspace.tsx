"use client";

import { useEffect, useState } from "react";
import type { ClassicImageData } from "@/types/ai-photo";
import { PromptPanel } from "./prompt-panel";
import { PhotoUploadPanel } from "./photo-upload-panel";
import { RemixResultPanel } from "./remix-result-panel";
import { RemixScenePanel } from "./remix-scene-panel";
import { GenerationProgress } from "./generation-progress";
import { IMAGE_MODELS, type ImageModel, type ImageQuality } from "@/ai/images/types";
import { getSupportedAspectRatios, normalizeImageQuality } from "@/ai/images/types";
import { parseJsonApiResponse } from "@/lib/api/client-response";

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
        }),
      });

      const data = await parseJsonApiResponse<{
        success: boolean;
        data: { objectKey: string; publicUrl: string };
        error?: { message?: string };
      }>(res);
      if (!data.success) {
        throw new Error(data.error?.message || "Generation failed");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,460px)]">
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
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
          imageInputOnly
        />
      </div>

      <div className="space-y-5 xl:sticky xl:top-8 self-start">
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

      {error && (
        <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full border border-red-200 dark:border-red-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-destructive shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
