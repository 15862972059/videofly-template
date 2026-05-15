"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PromptPanelProps {
  classicScene?: {
    slug: string;
    title: string;
    category: string;
    prompt_template: string;
  };
  aspectRatio: "1:1" | "3:4" | "9:16" | "16:9";
  onGenerate: (prompt: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PromptPanel({
  classicScene,
  aspectRatio,
  onGenerate,
  disabled,
  loading,
}: PromptPanelProps) {
  const [customPrompt, setCustomPrompt] = useState("");

  const handleGenerate = () => {
    if (classicScene) {
      onGenerate(customPrompt.trim());
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5" />
            Step 3
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">Refine and Generate</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Optional. We already preserve clothing, composition, and identity by default.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Output Ratio</p>
          <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">{aspectRatio}</p>
        </div>
      </div>

      {classicScene && (
        <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-[linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)] dark:bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)] p-4 text-sm">
          <p className="font-semibold text-slate-900 dark:text-white capitalize">{classicScene.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
            {classicScene.category} scene locked
          </p>
        </div>
      )}

      <textarea
        value={customPrompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomPrompt(e.target.value)}
        placeholder={
          classicScene
            ? 'Optional details... e.g. "warm smile, windswept hair, richer sunset glow"'
            : "Describe the image you want to generate..."
        }
        className="min-h-[132px] rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-4 py-3 text-sm shadow-inner w-full resize-none"
      />

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-950 dark:bg-white px-4 py-4 text-white dark:text-slate-950 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Ready to generate</p>
          <p className="text-xs text-slate-300 dark:text-slate-600">
            Uses 1 credit. The selected scene keeps its original framing.
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={disabled || loading}
          className="rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
        >
          {loading ? "Generating..." : "Generate Image"}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </section>
  );
}
