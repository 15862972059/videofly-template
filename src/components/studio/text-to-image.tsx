"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ImageIcon,
  Loader2,
  Send,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NEW_USER_GIFT } from "@/config/pricing-user";
import {
  IMAGE_MODELS,
  getImageCreditCost,
} from "@/ai/images/types";
import { GenerationProgress } from "./generation-progress";
import { GenerationResult } from "./generation-result";
import { parseJsonApiResponse } from "@/lib/api/client-response";
import {
  type ImageGenerationStartPayload,
  waitForImageGenerationResult,
} from "@/lib/image-generation-client";

interface TextToImageProps {
  onGenerate: (data: { jobId: string; objectKey: string; publicUrl: string }) => void;
  generating: boolean;
  result: {
    jobId: string;
    objectKey: string;
    publicUrl: string;
  } | null;
  onClearResult: () => void;
}

const promptStyles = [
  { labelKey: "photorealistic", suffix: "photorealistic style, natural light, crisp details" },
  { labelKey: "anime", suffix: "anime style, clean line art, expressive lighting" },
  { labelKey: "oilPainting", suffix: "oil painting texture, layered brushwork, gallery lighting" },
  { labelKey: "digitalArt", suffix: "digital art style, polished composition, cinematic color" },
  { labelKey: "watercolor", suffix: "watercolor wash, soft edges, delicate paper texture" },
] as const;

const samplePrompt =
  "A cozy robot artist painting a glowing city skyline at sunset, cinematic lighting, vibrant colors, highly detailed digital art";

export function TextToImage({ onGenerate, generating, result, onClearResult }: TextToImageProps) {
  const t = useTranslations("Studio.textToImage");
  const model = "gpt-image-2" as const;
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const creditCost = getImageCreditCost(model);
  const isWorking = loading || generating;

  const handleGenerate = async () => {
    if (!prompt.trim() || isWorking) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/image/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await parseJsonApiResponse<{
        success: boolean;
        data: ImageGenerationStartPayload;
        error?: { message?: string; details?: unknown };
      }>(res);
      if (!data.success) {
        throw new Error(
          data.error?.message ||
          (data.error?.details ? String(data.error.details) : "Generation failed")
        );
      }

      const result = await waitForImageGenerationResult(data.data.jobId);
      onGenerate(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const addPromptStyle = (suffix: string) => {
    if (isWorking) return;
    setPrompt((current) => {
      const trimmed = current.trim();
      return trimmed ? `${trimmed}, ${suffix}` : suffix;
    });
  };

  const useSamplePrompt = () => {
    if (isWorking) return;
    setPrompt(samplePrompt);
  };

  return (
    <div className="relative grid min-h-[calc(100vh-13rem)] gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_392px]">
      <main className="flex min-h-[640px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{t("title")}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {IMAGE_MODELS[model]?.name ?? model}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-1 font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {t("fixedOutput")}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 bg-slate-50/70 p-4 dark:bg-slate-900/40">
          <GenerationProgress
            isGenerating={isWorking}
            estimatedDurationMs={IMAGE_MODELS[model]?.estimatedDurationMs ?? 30_000}
            modelName={IMAGE_MODELS[model]?.name ?? model}
          />

          <section className="flex min-h-[420px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                    {result ? t("generatedResultTitle") : t("resultTitle")}
                  </h3>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {result
                    ? t("generatedResultHint")
                    : t("resultHint")}
                </p>
              </div>

              {result && (
                <button
                  type="button"
                  onClick={onClearResult}
                  className="min-h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
                >
                  {t("newImage")}
                </button>
              )}
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-50 p-5 dark:bg-slate-900/50">
              {result ? (
                <div className="w-full max-w-[560px]">
                  <GenerationResult result={result} inline showActions aspectRatio="1:1" />
                </div>
              ) : (
                <div
                  className="flex w-full max-w-[560px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-slate-400 dark:border-slate-700 dark:bg-slate-950"
                  style={{ aspectRatio: "1 / 1", minHeight: 340 }}
                >
                  <div className="mb-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
                    <Send className="h-6 w-6 opacity-60" />
                  </div>
                  <p className="max-w-xs text-center text-sm font-medium text-slate-600 dark:text-slate-300">
                    {t("emptyTitle")}
                  </p>
                  <p className="mt-1 max-w-xs text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {t("emptyHint")}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="border-t border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                {t("prompt")}
              </div>
              {NEW_USER_GIFT.enabled && (
                <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                      {t("welcomeCredit", { credits: NEW_USER_GIFT.credits, cost: creditCost })}
                    </p>
                    <button
                      type="button"
                      onClick={useSamplePrompt}
                      disabled={isWorking}
                      className="w-fit rounded-lg bg-blue-600 px-3 py-1.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                      {t("trySamplePrompt")}
                    </button>
                  </div>
                </div>
              )}
              <textarea
                value={prompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
                placeholder={t("promptPlaceholder")}
                disabled={isWorking}
                className="min-h-[84px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-500 dark:focus:bg-slate-900 dark:focus:ring-slate-700"
              />
            </div>

            <div className="flex min-w-0 flex-col gap-3 lg:w-[332px]">
              <div className="grid grid-cols-[minmax(0,1fr)_88px] gap-2 text-xs">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t("outputSettings")}</p>
                  <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">
                    {t("fixedOutput")}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t("cost")}</p>
                  <p className="mt-0.5 font-semibold text-slate-800 dark:text-slate-100">
                    {creditCost}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isWorking}
                className="h-10 rounded-xl bg-blue-600 px-5 text-white shadow-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                {isWorking ? (
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
        </section>
      </main>

      <aside className="grid min-w-0 gap-4 self-start lg:grid-cols-2 xl:sticky xl:top-6 xl:grid-cols-1">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-white">{t("outputSettings")}</h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {t("outputSettingsHint")}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-3 dark:bg-slate-900/50">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-700 dark:bg-slate-950">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {t("fixedOutput")}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {t("fixedOutputHint")}
              </p>
            </div>
          </div>
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
              <WandSparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-white">{t("promptStarters")}</h3>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{t("promptStartersHint")}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 bg-slate-50 p-3 dark:bg-slate-900/50">
            {promptStyles.map((style) => (
              <button
                key={style.labelKey}
                type="button"
                onClick={() => addPromptStyle(style.suffix)}
                disabled={isWorking}
                className="min-h-9 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:text-white"
              >
                {t(`styles.${style.labelKey}`)}
              </button>
            ))}
          </div>
        </section>
      </aside>

      {error && (
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm text-destructive shadow-lg dark:border-red-800 dark:bg-slate-900">
          {error}
        </div>
      )}
    </div>
  );
}
