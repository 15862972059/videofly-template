import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, test, vi } from "vitest";

import { GenerationProgress } from "@/components/studio/generation-progress";

let root: Root | null = null;

afterEach(() => {
  if (root) {
    act(() => {
      root?.unmount();
    });
    root = null;
  }
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("GenerationProgress", () => {
  test("advances while generation is active", () => {
    vi.useFakeTimers();

    let now = 1_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(now), 16)
    );
    vi.stubGlobal("cancelAnimationFrame", (id: number) => {
      window.clearTimeout(id);
    });

    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    act(() => {
      root?.render(createElement(GenerationProgress, {
        isGenerating: true,
        estimatedDurationMs: 120_000,
        modelName: "GPT Image 2",
      }));
    });

    act(() => {
      now += 10_000;
      vi.advanceTimersByTime(20);
    });

    const percentText = container.textContent?.match(/(\d+)%/)?.[1];
    expect(Number(percentText)).toBeGreaterThan(0);
  });
});
