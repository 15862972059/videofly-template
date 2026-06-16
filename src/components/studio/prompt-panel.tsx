"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  IMAGE_MODELS,
  type ImageModel,
  type ImageQuality,
  type ImageResolution,
  getImageCreditCost,
  getImageResolutionOptions,
  normalizeImageQuality,
  normalizeImageResolution,
} from "@/ai/images/types";
import { buildRemixSystemPrompt } from "@/services/image/prompts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromptPanelProps {
  classicScene?: {
    slug: string;
    title: string;
    category: string;
    prompt_template: string;
  };
  aspectRatio: "1:1" | "3:4" | "9:16" | "16:9";
  model: ImageModel;
  onAspectRatioChange: (value: "1:1" | "3:4" | "9:16" | "16:9") => void;
  onModelChange: (model: ImageModel) => void;
  onGenerate: (prompt: string) => void;
  disabled?: boolean;
  loading?: boolean;
  quality: ImageQuality;
  onQualityChange: (value: ImageQuality) => void;
  resolution: ImageResolution;
  onResolutionChange: (value: ImageResolution) => void;
  /** Filter to only models supporting image input (for remix mode) */
  imageInputOnly?: boolean;
}

export function PromptPanel({
  classicScene,
  aspectRatio,
  model,
  onAspectRatioChange,
  onModelChange,
  onGenerate,
  disabled,
  loading,
  quality,
  onQualityChange,
  resolution,
  onResolutionChange,
  imageInputOnly,
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

  const modelOptions = Object.entries(IMAGE_MODELS).map(([key, value]) => ({
    value: key as ImageModel,
    label: value.name,
    provider: value.provider,
    isEnabled: value.isEnabled,
    supportsImageInput: value.supportsImageInput,
  })).filter((option) => option.isEnabled && (!imageInputOnly || option.supportsImageInput));

  const aspectRatioOptions = [
    { value: "1:1", label: "1:1" },
    { value: "3:4", label: "3:4" },
    { value: "9:16", label: "9:16" },
    { value: "16:9", label: "16:9" },
  ] as const;

  const resolutionOptions = getImageResolutionOptions(model);
  const creditCost = getImageCreditCost(model, quality, resolution);

  const handleGenerate = () => {
    if (classicScene) {
      onGenerate(customPrompt.trim());
    }
  };

  const handleModelChange = (value: ImageModel) => {
    onModelChange(value);
    onQualityChange(normalizeImageQuality(value, quality));
    onResolutionChange(normalizeImageResolution(value, resolution));
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
          <div className="grid grid-cols-3 gap-2">
            <Select value={model} onValueChange={handleModelChange}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={resolution}
              onValueChange={(v) => onResolutionChange(v as ImageResolution)}
            >
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resolutionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label} - {option.creditCost} {t("credits")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={aspectRatio} onValueChange={(v: "1:1" | "3:4" | "9:16" | "16:9") => onAspectRatioChange(v)}>
              <SelectTrigger className="h-9 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aspectRatioOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-xs">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">
                {creditCost} {creditCost > 1 ? t("credits") : t("credit")}
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
