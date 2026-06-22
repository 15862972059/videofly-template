"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { ImagePlus, Type } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Studio");
  const searchParams = useSearchParams();
  const [initialScene, setInitialScene] = useState<ClassicImageData | null>(null);
  const [sceneLoading, setSceneLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"remix" | "text2img">(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "text2img" || tabParam === "textToImage") return "text2img";
    if (tabParam === "remix") return "remix";
    if (searchParams.get("prompt")) return "text2img";
    return searchParams.get("scene") ? "remix" : "text2img";
  });
  const [textResult, setTextResult] = useState<{
    jobId: string;
    objectKey: string;
    publicUrl: string;
  } | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const sceneSlug = searchParams.get("scene");
    if (sceneSlug) {
      setActiveTab("remix");
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
    } else {
      const tabParam = searchParams.get("tab");
      if (tabParam === "text2img" || tabParam === "textToImage") {
        setActiveTab("text2img");
      } else if (tabParam === "remix") {
        setActiveTab("remix");
      } else if (searchParams.get("prompt")) {
        setActiveTab("text2img");
      }
    }
  }, [searchParams]);

  const tabs = [
    { id: "remix", label: t("tabs.remix"), icon: ImagePlus },
    { id: "text2img", label: t("tabs.textToImage"), icon: Type },
  ] as const;

  const handleTextResult = (data: { jobId: string; objectKey: string; publicUrl: string }) => {
    setTextResult(data);
    setGenerating(false);
  };

  if (sceneLoading) {
    return <CenteredSpinner text={t("loadingScene")} subtext={t("loadingSceneHint")} />;
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[1520px] flex-col">
      <div className="mb-5 inline-flex w-fit gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
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
        <div hidden={activeTab !== "remix"} className="h-full">
          <RemixWorkspace initialScene={initialScene ?? undefined} />
        </div>
        <div hidden={activeTab !== "text2img"} className="h-full">
          <TextToImage
            onGenerate={handleTextResult}
            generating={generating}
            result={textResult}
            onClearResult={() => setTextResult(null)}
          />
        </div>
      </div>
    </div>
  );
}

export default function StudioContent() {
  const t = useTranslations("Studio");

  return (
    <Suspense fallback={<CenteredSpinner text={t("loadingStudio")} subtext={t("loadingStudioHint")} />}>
      <StudioContentInner />
    </Suspense>
  );
}
