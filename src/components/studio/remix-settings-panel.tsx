"use client";

import { ChevronDown, Settings2 } from "lucide-react";

const aspectRatioOptions = [
  { value: "1:1", label: "1:1", hint: "Square" },
  { value: "3:4", label: "3:4", hint: "Portrait" },
  { value: "9:16", label: "9:16", hint: "Phone" },
  { value: "16:9", label: "16:9", hint: "Landscape" },
] as const;

interface RemixSettingsPanelProps {
  aspectRatio: "1:1" | "3:4" | "9:16" | "16:9";
  onAspectRatioChange: (value: "1:1" | "3:4" | "9:16" | "16:9") => void;
}

export function RemixSettingsPanel({
  aspectRatio,
  onAspectRatioChange,
}: RemixSettingsPanelProps) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-400">
          <Settings2 className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Output Settings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Choose the final image shape.</p>
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Output Ratio
        </p>
        <div className="grid grid-cols-2 gap-2">
          {aspectRatioOptions.map((option) => {
            const active = option.value === aspectRatio;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onAspectRatioChange(option.value)}
                className={`rounded-2xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-slate-950 dark:border-white bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 hover:bg-white dark:hover:bg-slate-700"
                }`}
              >
                <div className="text-sm font-semibold">{option.label}</div>
                <div className={`mt-1 text-xs ${active ? "text-slate-300 dark:text-slate-600" : "text-slate-500"}`}>{option.hint}</div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
