"use client";

import { useState } from "react";
import { ImageIcon, Sparkles } from "lucide-react";
import { GenerationResult } from "./generation-result";
import type { ClassicImageData } from "@/types/ai-photo";

interface RemixResultPanelProps {
  result: { objectKey: string; publicUrl: string } | null;
  sourceImageKey: string | null;
  selectedScene: ClassicImageData | null;
  aspectRatio: "1:1" | "3:4" | "9:16" | "16:9";
}

function getSceneDisplayUrl(scene: ClassicImageData) {
  return scene.thumbnail_url || scene.hero_image_url;
}

export function RemixResultPanel({
  result,
  sourceImageKey,
  selectedScene,
  aspectRatio,
}: RemixResultPanelProps) {
  const [previewMode, setPreviewMode] = useState<"result" | "scene">("result");
  const hasSelectedScene = Boolean(selectedScene);
  const sceneDisplayUrl = selectedScene ? getSceneDisplayUrl(selectedScene) : "";
  const canCompare = Boolean(result && sceneDisplayUrl);
  const canvasWidthClass = {
    "1:1": "max-w-[560px]",
    "3:4": "max-w-[460px]",
    "9:16": "max-w-[360px]",
    "16:9": "max-w-[780px]",
  }[aspectRatio];
  const aspectStyle = {
    aspectRatio:
      aspectRatio === "9:16"
        ? "9 / 16"
        : aspectRatio === "16:9"
          ? "16 / 9"
          : aspectRatio === "1:1"
            ? "1 / 1"
            : "3 / 4",
  };

  return (
    <section className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
              {result ? "Generated result" : selectedScene ? "Scene preview" : "Result preview"}
            </h3>
          </div>
          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
            {result
              ? "Save, share, or compare with the original scene."
              : "Your generated image will appear in this canvas."}
          </p>
        </div>

        {canCompare && (
          <div className="inline-flex shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setPreviewMode("scene")}
              className={`min-h-8 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                previewMode === "scene"
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Scene
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("result")}
              className={`min-h-8 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                previewMode === "result"
                  ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Result
            </button>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 p-5 dark:bg-slate-900/50">
        {result && (!canCompare || previewMode === "result") ? (
          <div className={`w-full ${canvasWidthClass}`}>
            <GenerationResult result={result} inline showActions aspectRatio={aspectRatio} />
          </div>
        ) : selectedScene && (canCompare ? previewMode === "scene" : true) ? (
          <div
            className={`relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${canvasWidthClass}`}
            style={aspectStyle}
          >
            <img src={sceneDisplayUrl} alt={selectedScene.title} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 text-white">
              <p className="text-sm font-semibold capitalize">{selectedScene.title}</p>
              <p className="text-xs text-white/75 capitalize">
                {selectedScene.category}{selectedScene.subcategory ? ` - ${selectedScene.subcategory}` : ""}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[340px] w-full max-w-[560px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-slate-400 dark:border-slate-700 dark:bg-slate-950">
            <div className="mb-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
              <ImageIcon className="h-6 w-6 opacity-60" />
            </div>
            <p className="max-w-xs text-center text-sm font-medium text-slate-600 dark:text-slate-300">
              {sourceImageKey && hasSelectedScene
                ? "Ready to generate"
                : "Upload a portrait and select a scene"}
            </p>
            <p className="mt-1 max-w-xs text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
              The result canvas stays focused here while controls live in the side rail and prompt bar.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
