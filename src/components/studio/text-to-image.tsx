"use client";

import { useState } from "react";
import { Send, Loader2, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGE_MODELS, type ImageModel, type ImageQuality } from "@/ai/images/types";
import { GenerationProgress } from "./generation-progress";
import {
  getImageCreditCost,
  getImageQualityOptions,
  getSupportedAspectRatios,
  normalizeImageQuality,
} from "@/ai/images/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const modelOptions = Object.entries(IMAGE_MODELS).map(([key, value]) => ({
  value: key as ImageModel,
  label: value.name,
  description: value.description,
  provider: value.provider,
  isEnabled: value.isEnabled,
})).filter((option) => option.isEnabled);

const aspectRatioOptions = [
  { value: "1:1", label: "1:1" },
  { value: "3:4", label: "3:4" },
  { value: "9:16", label: "9:16" },
  { value: "16:9", label: "16:9" },
] as const;

const aspectRatioMap: Record<"1:1" | "3:4" | "9:16" | "16:9", string> = {
  "1:1": "1 / 1",
  "3:4": "3 / 4",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
};

export function TextToImage({ onGenerate, generating, result, onClearResult }: TextToImageProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ImageModel>("gpt-image-2");
  const [quality, setQuality] = useState<ImageQuality>("auto");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4" | "9:16" | "16:9">("16:9");
  const [loading, setLoading] = useState(false);

  const supportedRatios = getSupportedAspectRatios(model);
  const qualityOptions = getImageQualityOptions(model);
  const creditCost = getImageCreditCost(model, quality);
  const isWorking = loading || generating;

  const handleGenerate = async () => {
    if (!prompt.trim() || isWorking) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/image/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          quality,
          aspectRatio,
        }),
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

      const result = await waitForImageGenerationResult(data.data.jobId, {
        timeoutMs: IMAGE_MODELS[model]?.estimatedDurationMs
          ? IMAGE_MODELS[model].estimatedDurationMs * 3
          : 300_000,
      });
      onGenerate(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement("a");
    link.href = `/api/v1/image/download?url=${encodeURIComponent(result.publicUrl)}`;
    link.download = "ai-art-generation.png";
    link.click();
  };

  const handleShareX = () => {
    if (!result) return;
    const text = "Check out my AI-generated image!";
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(result.publicUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareReddit = () => {
    if (!result) return;
    const title = "My AI Art Creation";
    const url = `https://www.reddit.com/submit?title=${encodeURIComponent(title)}&url=${encodeURIComponent(result.publicUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="relative grid gap-8 xl:grid-cols-[minmax(0,600px)_minmax(360px,460px)]">
      <div>
        <section className="rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
                <Sparkles className="h-3.5 w-3.5" />
                Text to Image
              </div>
              <h3 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">Describe your vision</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter a detailed description to generate unique artwork
              </p>
            </div>
            <div className="flex gap-2">
              <div className="w-[120px]">
                <Select
                  value={model}
                  onValueChange={(value: ImageModel) => {
                    setModel(value);
                    setQuality(normalizeImageQuality(value, quality));
                    if (!getSupportedAspectRatios(value).includes(aspectRatio)) {
                      setAspectRatio(getSupportedAspectRatios(value)[0]);
                    }
                  }}
                  disabled={isWorking}
                >
                  <SelectTrigger className="h-8 text-xs">
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
              </div>
              <div className="w-[112px]">
                <Select
                  value={quality}
                  onValueChange={(value: ImageQuality) => setQuality(value)}
                  disabled={isWorking}
                >
                  <SelectTrigger className="h-8 text-xs">
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
              </div>
              <div className="w-[80px]">
                <Select
                  value={aspectRatio}
                  onValueChange={(value: "1:1" | "3:4" | "9:16" | "16:9") => setAspectRatio(value)}
                  disabled={isWorking}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectRatioOptions.map((option) => {
                      const supported = supportedRatios.includes(option.value as "1:1" | "16:9" | "9:16" | "3:4");
                      if (!supported) return null;
                      return (
                        <SelectItem key={option.value} value={option.value} className="text-xs">
                          {option.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            placeholder="A beautiful sunset over the Eiffel Tower, golden hour lighting, cinematic composition..."
            disabled={isWorking}
            className="min-h-[120px] rounded-2xl border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 px-4 py-3 text-sm shadow-inner w-full resize-none"
          />

          <div className="mt-3 flex gap-2 flex-wrap">
            {["Photorealistic", "Anime", "Oil Painting", "Digital Art", "Watercolor"].map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => !isWorking && setPrompt((prev) => (prev ? `${prev}, ${style} style` : style))}
                disabled={isWorking}
                className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors disabled:opacity-50"
              >
                {style}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-950 dark:bg-white px-4 py-4 text-white dark:text-slate-950 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Ready to generate</p>
              <p className="text-xs text-slate-300 dark:text-slate-600">
                Uses {creditCost} credit{creditCost > 1 ? "s" : ""}. Your image will appear on the right. You can also view progress and results in your generation history.
              </p>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isWorking}
              className="rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
            >
              {isWorking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Image
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </section>
      </div>

      <div className="xl:sticky xl:top-8 self-start space-y-5">
        <GenerationProgress
          isGenerating={isWorking}
          estimatedDurationMs={IMAGE_MODELS[model]?.estimatedDurationMs ?? 30_000}
          modelName={IMAGE_MODELS[model]?.name ?? model}
        />

        {result ? (
          <section className="rounded-[1.5rem] overflow-hidden border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
            <div
              className="relative overflow-hidden bg-slate-50 dark:bg-slate-800"
              style={{ aspectRatio: aspectRatioMap[aspectRatio] }}
            >
              <img
                src={result.publicUrl}
                alt="AI Generated"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent flex justify-between gap-2">
                <Button size="sm" className="gap-1.5 flex-1 bg-white text-slate-950 hover:bg-slate-100" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5" /> Save
                </Button>
                <Button size="sm" variant="secondary" className="gap-1.5 bg-slate-950/55 text-white hover:bg-slate-950/70 border border-white/15" onClick={handleShareX} aria-label="Share on X">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </Button>
                <Button size="sm" variant="secondary" className="gap-1.5 bg-slate-950/55 text-white hover:bg-slate-950/70 border border-white/15" onClick={handleShareReddit} aria-label="Share on Reddit">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547a8.303 8.303 0 0 0-2.636-.152c-.042.004-.084.012-.126.02v.001h-.009c-.035.006-.069.011-.104.02h-.003c-.074.017-.148.038-.22.063l-.002.001c-.067.023-.133.049-.198.078a2.463 2.463 0 0 0-.17.073l-.006.004-.163.069s-.003 0-.003.002c-.05.025-.1.05-.149.078l-.008.007-.152.078a5.308 5.308 0 0 0-.264.154l-.026.017c-.242.15-.472.32-.688.51l-.02.018c-.023.022-.048.044-.07.067l-3.187-1.015a1.25 1.25 0 0 1-.931-.119 1.249 1.249 0 1 1-.68 2.315c-.084-.021-.164-.052-.239-.091l2.855 1.621a8.347 8.347 0 0 0-.34 1.124L7.256 10.5c.016.011.03.023.046.034l-.046-.034A1.248 1.248 0 0 0 6.3 12.076c.305.371.715.604 1.138.662.074.01.148.015.222.011.066-.003.131-.014.195-.031l.001.001c.197-.05.38-.14.543-.264l1.91 1.34c-.108.127-.177.26-.23.38-.553.242-.982.556-1.13.8-.097.179-.1.349.036.515.084.072.2.115.299.145.218.18.686.181.934.085.735-.344.85-1.49.85-1.49h.001s.092-.71.46-1.159c.376-.458 1.009-.71 2.198-.905 2.51-.48 3.912-1.433 4.102-1.776.08-.06.163-.126.249-.198l-.08.022s2.136-1.096 2.522-1.156c.24-.05.484-.054.73-.05.295-.38.53-.772.718-1.158a8.395 8.395 0 0 0-.28-1.468c-.309-.747-.707-1.416-1.187-1.952l2.682.588zM8.58 16.891s.166.635.674.873c.44.058 1.114-.057 1.334-.68.2-.7-.026-1.362-.248-1.627 0 0-.645.263-1.76 1.434zM8.906 17a.5.5 0 0 1 .254.064l-.254-.064zm5.473-.164c.257.147.435.263.645.358.545.177 1.314.214 1.83-.028a.868.868 0 0 0 .421-.421c.146-.386-.096-.846-.8-1.295-.71-.38-1.524-.5-2.05-.572-.034.09-.058.211-.013.333.027.053.06.107.097.16.177.262.501.448.883.553.135.03.269.05.408.07.084.05.172.113.246.175-.257.06-.526.116-.79.083l-.008-.004c-.306-.09-.544-.299-.643-.568-.033-.046-.046-.097-.036-.143-.022.078-.02.164.01.247.037.095.104.19.208.282.223.208.545.364.99.36l.008.001c.143.004.253-.021.355-.06-.281.267-.563.436-.811.46z"/></svg>
                </Button>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-950 dark:text-white truncate">{prompt}</p>
              <button
                type="button"
                onClick={onClearResult}
                className="mt-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Generate another image
              </button>
            </div>
          </section>
        ) : !isWorking ? (
          <section className="rounded-[1.5rem] border border-dashed border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 shadow-[0_12px_32px_rgba(15,23,42,0.06)] flex items-center justify-center" style={{ aspectRatio: aspectRatioMap[aspectRatio], minHeight: 360 }}>
            <div className="text-center p-8">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <Send className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Your image will appear here</p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Enter a prompt and generate to get started</p>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
