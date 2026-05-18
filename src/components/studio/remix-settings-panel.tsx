"use client";

import { Settings2 } from "lucide-react";
import { IMAGE_MODELS, type ImageModel } from "@/ai/images/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const aspectRatioOptions = [
  { value: "1:1", label: "1:1", hint: "Square" },
  { value: "3:4", label: "3:4", hint: "Portrait" },
  { value: "9:16", label: "9:16", hint: "Phone" },
  { value: "16:9", label: "16:9", hint: "Landscape" },
] as const;

interface RemixSettingsPanelProps {
  aspectRatio: "1:1" | "3:4" | "9:16" | "16:9";
  onAspectRatioChange: (value: "1:1" | "3:4" | "9:16" | "16:9") => void;
  model?: ImageModel;
  onModelChange?: (model: ImageModel) => void;
}

const modelOptions = Object.entries(IMAGE_MODELS).map(([key, value]) => ({
  value: key as ImageModel,
  label: value.name,
  description: value.description,
  provider: value.provider,
  supportedAspectRatios: value.supportedAspectRatios,
}));

export function RemixSettingsPanel({
  aspectRatio,
  onAspectRatioChange,
  model,
  onModelChange,
}: RemixSettingsPanelProps) {
  const currentModel = model || "minimax";
  const supportedRatios = modelOptions.find(m => m.value === currentModel)?.supportedAspectRatios || ["1:1", "16:9", "9:16", "3:4"];

  return (
    <section className="rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-400">
          <Settings2 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Output Settings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Choose the final image shape and model.</p>
        </div>
      </div>

      {onModelChange && (
        <div className="mb-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            AI Model
          </p>
          <Select
            value={currentModel}
            onValueChange={(value: ImageModel) => onModelChange(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Output Ratio
        </p>
        <div className="grid grid-cols-2 gap-2">
          {aspectRatioOptions.map((option) => {
            const active = option.value === aspectRatio;
            const disabled = !supportedRatios.includes(option.value as "1:1" | "16:9" | "9:16" | "3:4");
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => !disabled && onAspectRatioChange(option.value)}
                disabled={disabled}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-slate-950 dark:border-white bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                    : disabled
                    ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-700"
                }`}
              >
                <div className="text-sm font-semibold">{option.label}</div>
                <div className={`mt-1 text-xs ${active ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}`}>{option.hint}</div>
              </button>
            );
          })}
        </div>
        {aspectRatio && !supportedRatios.includes(aspectRatio) && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            This model doesn&apos;t support {aspectRatio}. Please select a supported ratio.
          </p>
        )}
      </div>
    </section>
  );
}
