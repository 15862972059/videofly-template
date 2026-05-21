"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ImagePlus, Type } from "lucide-react";
import { RemixWorkspace } from "@/components/studio/remix-workspace";
import { TextToImage } from "@/components/studio/text-to-image";
import type { ClassicImageData } from "@/types/ai-photo";
import { cn } from "@/lib/utils";

function CenteredSpinner({ text, subtext }: { text: string; subtext?: string }) {
  return (
    <div className="flex h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700" />
          <div className="absolute inset-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-slate-950 dark:border-t-white" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-950 dark:text-white">{text}</p>
          {subtext && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

function StudioContentInner() {
  const searchParams = useSearchParams();
  const [initialScene, setInitialScene] = useState<ClassicImageData | null>(null);
  const [sceneLoading, setSceneLoading] = useState(false);
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
      setSceneLoading(true);
      fetch(`/api/v1/gallery?slug=${encodeURIComponent(sceneSlug)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.images?.[0]) {
            setInitialScene(data.data.images[0]);
          }
        })
        .catch(console.error)
        .finally(() => setSceneLoading(false));
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

  if (sceneLoading) {
    return <CenteredSpinner text="Loading Scene" subtext="Preparing your selected scene..." />;
  }

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
        ) : (
          <TextToImage
            onGenerate={handleTextResult}
            generating={generating}
            result={textResult}
            onClearResult={() => setTextResult(null)}
          />
        )}
      </div>
    </div>
  );
}

export default function StudioContent() {
  return (
    <Suspense fallback={<CenteredSpinner text="Loading Studio" subtext="Preparing your creative workspace..." />}>
      <StudioContentInner />
    </Suspense>
  );
}