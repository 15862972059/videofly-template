"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGE_MODELS, type ImageModel } from "@/ai/images/types";
import { getSupportedAspectRatios } from "@/ai/images/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TextToImageProps {
  onGenerate: (data: { jobId: string; objectKey: string; publicUrl: string }) => void;
  generating: boolean;
}

const modelOptions = Object.entries(IMAGE_MODELS).map(([key, value]) => ({
  value: key as ImageModel,
  label: value.name,
  description: value.description,
  provider: value.provider,
}));

const aspectRatioOptions = [
  { value: "1:1", label: "1:1" },
  { value: "3:4", label: "3:4" },
  { value: "9:16", label: "9:16" },
  { value: "16:9", label: "16:9" },
] as const;

export function TextToImage({ onGenerate, generating }: TextToImageProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<ImageModel>("minimax");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "3:4" | "9:16" | "16:9">("16:9");

  const supportedRatios = getSupportedAspectRatios(model);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError(null);

    try {
      const res = await fetch("/api/v1/image/generate/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model,
          aspectRatio,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error?.message || "Generation failed");
      }

      onGenerate(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-2 text-slate-950 dark:text-white">Describe your vision</h2>
          <p className="text-muted-foreground text-sm">
            Enter a detailed description to generate unique artwork
          </p>
        </div>

        <div className="w-full space-y-4">
          <textarea
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            placeholder="A beautiful sunset over the Eiffel Tower, golden hour lighting, cinematic composition..."
            className="min-h-[120px] resize-none w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
          />

          {/* Model Selection - Always visible on left */}
          <div className="flex gap-3">
            <div className="w-48">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Model</label>
              <Select
                value={model}
                onValueChange={(value: ImageModel) => {
                  setModel(value);
                  if (!getSupportedAspectRatios(value).includes(aspectRatio)) {
                    setAspectRatio(getSupportedAspectRatios(value)[0]);
                  }
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.provider}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-32">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Aspect Ratio</label>
              <Select
                value={aspectRatio}
                onValueChange={(value: "1:1" | "3:4" | "9:16" | "16:9") => setAspectRatio(value)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatioOptions.map((option) => {
                    const supported = supportedRatios.includes(option.value as "1:1" | "16:9" | "9:16" | "3:4");
                    if (!supported) return null;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="w-full gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Image
              </>
            )}
          </Button>
        </div>

        <div className="mt-6 flex gap-2 flex-wrap justify-center">
          {["Photorealistic", "Anime", "Oil Painting", "Digital Art", "Watercolor"].map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setPrompt((prev) => (prev ? `${prev}, ${style} style` : style))}
              className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
