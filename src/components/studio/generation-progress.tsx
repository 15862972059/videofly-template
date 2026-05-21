"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Loader2, Clock } from "lucide-react";

interface GenerationProgressProps {
  /** Whether generation is in progress */
  isGenerating: boolean;
  /** Estimated total duration in milliseconds */
  estimatedDurationMs: number;
  /** Model name to display */
  modelName: string;
}

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  }
  return `${seconds}s`;
}

function formatEstimated(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return seconds > 0 ? `~${minutes}m ${seconds}s` : `~${minutes}m`;
  }
  return `~${totalSeconds}s`;
}

/**
 * Smooth progress bar with elapsed timer for image generation.
 * Progress follows an ease-out curve that slows down as it approaches 95%,
 * never reaching 100% until the actual result arrives.
 */
export function GenerationProgress({
  isGenerating,
  estimatedDurationMs,
  modelName,
}: GenerationProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  const tick = useCallback(() => {
    const now = Date.now();
    const elapsedMs = now - startTimeRef.current;
    setElapsed(elapsedMs);

    // Ease-out curve: fast start, slows as it approaches 95%
    // Uses asymptotic formula so it never reaches 100%
    const ratio = elapsedMs / estimatedDurationMs;
    const rawProgress = 1 - Math.exp(-2.5 * ratio);
    // Cap at 95% — the final jump to 100% happens when result arrives
    setProgress(Math.min(rawProgress * 100, 95));

    frameRef.current = requestAnimationFrame(tick);
  }, [estimatedDurationMs]);

  useEffect(() => {
    if (isGenerating) {
      startTimeRef.current = Date.now();
      setElapsed(0);
      setProgress(0);
      frameRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frameRef.current);
      if (progress > 0) {
        // Animate to 100% when done
        setProgress(100);
      }
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [isGenerating, tick, progress]);

  if (!isGenerating && progress === 0) return null;

  const isDone = !isGenerating && progress === 100;

  return (
    <div
      className={`rounded-2xl border bg-white/95 dark:bg-slate-900/95 shadow-[0_12px_32px_rgba(15,23,42,0.06)] overflow-hidden transition-all duration-500 ${
        isDone ? "border-emerald-200 dark:border-emerald-800" : "border-slate-200 dark:border-slate-700"
      }`}
    >
      {/* Progress bar */}
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full transition-all ${
            isDone
              ? "bg-emerald-500 duration-300"
              : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 duration-150"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-4 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {isGenerating ? (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
            </div>
          ) : (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950 dark:text-white truncate">
              {isGenerating ? "Generating with " : "Generated with "}
              <span className="text-indigo-600 dark:text-indigo-400">{modelName}</span>
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <Clock className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {formatElapsed(elapsed)}
                {isGenerating && (
                  <span className="text-slate-400 dark:text-slate-500">
                    {" "}/ {formatEstimated(estimatedDurationMs)}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <span className={`text-sm font-bold tabular-nums ${
            isDone
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-700 dark:text-slate-300"
          }`}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {isGenerating && (
        <div className="px-4 pb-3 -mt-1">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Please don&apos;t close this page. You can also check results in your generation history.
          </p>
        </div>
      )}
    </div>
  );
}
