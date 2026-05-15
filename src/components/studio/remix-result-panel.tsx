"use client";

import { useMemo, useState } from "react";
import { DownloadCloud, ImageIcon, Sparkles } from "lucide-react";
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

  const panelCopy = useMemo(() => {
    if (result) return "Your refined composite is ready. Compare it against the original scene or download it.";
    if (sourceImageKey && hasSelectedScene) return "Your generated portrait will appear here with quick compare and export actions.";
    return "Choose a scene and upload a portrait to preview the final composite here.";
  }, [hasSelectedScene, result, sourceImageKey]);

  return (
    <section className="rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-5 py-5">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-900/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">
            <Sparkles className="h-3.5 w-3.5" />
            Final Result
          </div>
          <h3 className="text-lg font-semibold text-slate-950 dark:text-white">Preview</h3>
          <p className="max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">{panelCopy}</p>
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

      <div className="p-5">
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
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-200 dark:border-slate-700 bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.12),_transparent_45%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.06),_transparent_45%),linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)] px-6 py-10 text-slate-400">
            <div className="mb-4 rounded-full bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
              <ImageIcon className="h-8 w-8 opacity-60" />
            </div>
            <p className="max-w-xs text-center text-sm leading-6">
              {sourceImageKey && hasSelectedScene
                ? "Everything is ready. Generate a refined result to preview it here."
                : "Upload a portrait and pair it with a destination scene to unlock the result preview."}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-500">
              <DownloadCloud className="h-3.5 w-3.5" />
              Download and share controls appear after generation
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
