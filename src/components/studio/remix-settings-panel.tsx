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
  isEnabled: value.isEnabled,
})).filter((option) => option.isEnabled);

export function RemixSettingsPanel({
  aspectRatio,
  onAspectRatioChange,
  model,
  onModelChange,
}: RemixSettingsPanelProps) {
  const currentModel = model || "gpt-image-2";
  const supportedRatios = modelOptions.find(m => m.value === currentModel)?.supportedAspectRatios || ["1:1", "16:9", "9:16", "3:4"];

  return (
    <section className="rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="mb-3 flex items-center gap-3">
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-400">
          <Settings2 className="h-3.5 w-3.5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Output Settings</h3>
        </div>
      </div>

      {onModelChange && (
        <div className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            AI Model
          </p>
          <Select
            value={currentModel}
            onValueChange={(value: ImageModel) => onModelChange(value)}
          >
            <SelectTrigger className="h-9">
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
      )}

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Output Ratio
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {aspectRatioOptions.map((option) => {
            const active = option.value === aspectRatio;
            const disabled = !supportedRatios.includes(option.value as "1:1" | "16:9" | "9:16" | "3:4");
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => !disabled && onAspectRatioChange(option.value)}
                disabled={disabled}
                className={`rounded-xl border px-2 py-2 text-center transition text-xs ${
                  active
                    ? "border-slate-950 dark:border-white bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                    : disabled
                    ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-700"
                }`}
              >
                <div className="text-sm font-semibold">{option.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
