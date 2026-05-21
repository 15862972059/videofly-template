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

export function RemixResultPanel({
  result,
  sourceImageKey,
  selectedScene,
  aspectRatio,
}: RemixResultPanelProps) {
  const [previewMode, setPreviewMode] = useState<"result" | "scene">("result");
  const hasSelectedScene = Boolean(selectedScene);
  const canCompare = Boolean(result && selectedScene?.hero_image_url);

  return (
    <section className="rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-4 py-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            Result
          </div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Preview</h3>
        </div>

        {canCompare && (
          <div className="inline-flex rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => setPreviewMode("scene")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${previewMode === "scene" ? "bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm" : "text-slate-500"}`}
            >
              Scene
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("result")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${previewMode === "result" ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm" : "text-slate-500"}`}
            >
              Result
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        {result && (!canCompare || previewMode === "result") ? (
          <GenerationResult result={result} inline showActions aspectRatio={aspectRatio} />
        ) : selectedScene && canCompare && previewMode === "scene" ? (
          <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800" style={{ aspectRatio: aspectRatio === "9:16" ? "9 / 16" : aspectRatio === "16:9" ? "16 / 9" : aspectRatio === "1:1" ? "1 / 1" : "3 / 4" }}>
            <img src={selectedScene.hero_image_url} alt={selectedScene.title} className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 text-white">
              <p className="text-sm font-semibold">{selectedScene.title}</p>
              <p className="text-xs text-white/75">{selectedScene.category}{selectedScene.subcategory ? ` • ${selectedScene.subcategory}` : ""}</p>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 dark:border-slate-700 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.12),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.06),_transparent_45%),linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)] px-6 py-10 text-slate-400">
            <div className="mb-3 rounded-full bg-white dark:bg-slate-800 p-3 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
              <ImageIcon className="h-6 w-6 opacity-60" />
            </div>
            <p className="max-w-xs text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
              {sourceImageKey && hasSelectedScene
                ? "Generate to preview result"
                : "Upload a portrait and select a scene"}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
