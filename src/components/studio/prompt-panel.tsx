"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  IMAGE_MODELS,
  type ImageModel,
  type ImageQuality,
  getImageCreditCost,
  getImageQualityOptions,
  normalizeImageQuality,
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
  imageInputOnly,
}: PromptPanelProps) {
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

  const qualityOptions = getImageQualityOptions(model);
  const creditCost = getImageCreditCost(model, quality);

  const handleGenerate = () => {
    if (classicScene) {
      onGenerate(customPrompt.trim());
    }
  };

  const handleModelChange = (value: ImageModel) => {
    onModelChange(value);
    onQualityChange(normalizeImageQuality(value, quality));
  };

  return (
    <section className="rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5" />
            Step 3
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">Refine and Generate</h3>
        </div>
        <div className="flex gap-2">
          <Select value={model} onValueChange={handleModelChange}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
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
          <Select value={quality} onValueChange={(v) => onQualityChange(v as ImageQuality)}>
            <SelectTrigger className="h-8 w-[112px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {qualityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-xs">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={aspectRatio} onValueChange={(v: "1:1" | "3:4" | "9:16" | "16:9") => onAspectRatioChange(v)}>
            <SelectTrigger className="h-8 w-[80px] text-xs">
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
      </div>

      <textarea
        value={customPrompt}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomPrompt(e.target.value)}
        placeholder={
          classicScene
            ? "Edit the prompt above to refine your result..."
            : "Describe the image you want to generate..."
        }
        className="min-h-[200px] rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-4 py-3 text-sm shadow-inner w-full resize-none"
      />

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-950 dark:bg-white px-4 py-4 text-white dark:text-slate-950 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Ready to generate</p>
          <p className="text-xs text-slate-300 dark:text-slate-600">
            Uses {creditCost} credit{creditCost > 1 ? "s" : ""}. Edit the prompt above or generate as-is. You can also view progress and results in your generation history.
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
