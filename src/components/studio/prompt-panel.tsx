"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildRemixSystemPrompt } from "@/services/image/prompts";

interface PromptPanelProps {
  classicScene?: {
    slug: string;
    title: string;
    category: string;
    prompt_template: string;
  };
  onGenerate: (prompt: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PromptPanel({
  classicScene,
  onGenerate,
  disabled,
  loading,
}: PromptPanelProps) {
  const t = useTranslations("Studio.promptPanel");
  const [customPrompt, setCustomPrompt] = useState("");
  const lastSceneRef = useRef<string | null>(null);

  useEffect(() => {
    if (classicScene && classicScene.slug !== lastSceneRef.current) {
      lastSceneRef.current = classicScene.slug;
      setCustomPrompt(buildRemixSystemPrompt(classicScene.title));
    }
  }, [classicScene]);

  const handleGenerate = () => {
    if (classicScene) {
      onGenerate(customPrompt.trim());
    }
  };

  return (
    <section className="border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-slate-400" />
            {t("prompt")}
          </div>
          <textarea
            value={customPrompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomPrompt(e.target.value)}
            placeholder={
              classicScene
                ? t("refinePlaceholder")
                : t("choosePlaceholder")
            }
            className="min-h-[84px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-500 dark:focus:bg-slate-900 dark:focus:ring-slate-700"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-3 lg:w-[332px]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t("fixedOutput")}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {t("fixedOutputHint")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                1 {t("credit")}
              </p>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={disabled || loading}
              className="h-10 min-w-[132px] rounded-xl bg-blue-600 px-5 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("generating")}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("generate")}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
