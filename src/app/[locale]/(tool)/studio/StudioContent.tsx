"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ImagePlus, Type } from "lucide-react";
import { RemixWorkspace } from "@/components/studio/remix-workspace";
import { TextToImage } from "@/components/studio/text-to-image";
import { GenerationResult } from "@/components/studio/generation-result";
import type { ClassicImageData } from "@/types/ai-photo";
import { getImageBySlug } from "@/data/classic-images";
import { cn } from "@/lib/utils";

export default function StudioContent() {
  const searchParams = useSearchParams();
  const [initialScene, setInitialScene] = useState<ClassicImageData | null>(null);
  const [activeTab, setActiveTab] = useState<"remix" | "text2img">("remix");
  const [textResult, setTextResult] = useState<{
    jobId: string;
    objectKey: string;
    publicUrl: string;
  } | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const sceneSlug = searchParams.get("scene");
    if (sceneSlug) {
      const scene = getImageBySlug(sceneSlug);
      if (scene) {
        setInitialScene(scene);
      }
    }
  }, [searchParams]);

  const tabs = [
    { id: "remix", label: "Image Remix", icon: ImagePlus },
    { id: "text2img", label: "Text to Image", icon: Type },
  ] as const;

  const handleTextResult = (data: { jobId: string; objectKey: string; publicUrl: string }) => {
    setTextResult(data);
    setGenerating(false);
  };

  return (
    <div className="mx-auto flex h-full w-full max-w-[1520px] flex-col">
      <div className="mb-8 inline-flex w-fit gap-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 p-1.5 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "remix" ? (
          <RemixWorkspace initialScene={initialScene ?? undefined} />
        ) : textResult ? (
          <div className="max-w-xl mx-auto">
            <GenerationResult result={textResult} aspectRatio="1:1" showActions />
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setTextResult(null)}
                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Generate another image
              </button>
            </div>
          </div>
        ) : (
          <TextToImage onGenerate={handleTextResult} generating={generating} />
        )}
      </div>
    </div>
  );
}
