"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  ImageIcon,
  Loader2,
  RefreshCcw,
  Send,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
  X,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClassicImageData } from "@/types/ai-photo";
import type { ClassicImage } from "@/db";

const TEMPLATE_PAGE_SIZE = 15;

function ImageWithFallback({ src, alt, className, loading = "lazy" }: { src: string; alt: string; className?: string; loading?: "lazy" | "eager" }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-100 dark:bg-slate-800`}>
        <ImageIcon className="h-6 w-6 text-slate-300 dark:text-slate-600" />
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className={`${className} animate-pulse bg-slate-100 dark:bg-slate-800`} />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
        priority={loading === "eager"}
        className={`${className} transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0 absolute"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  );
}

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
  const tFilters = useTranslations("GalleryFilters");
  const model = "gpt-image-2" as const;
  const searchParams = useSearchParams();

  const [prompt, setPrompt] = useState(() => {
    return searchParams.get("prompt") || "";
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Template states
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<(ClassicImageData | ClassicImage)[]>([]);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [loadingMoreTemplates, setLoadingMoreTemplates] = useState(false);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ClassicImageData | ClassicImage | null>(null);

  const templateRequestIdRef = useRef(0);
  const fetchedSubcategoriesRef = useRef<string[] | null>(null);

  // Initialize/update prompt from search query param if present
  useEffect(() => {
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) {
      setPrompt(urlPrompt);
    }
  }, [searchParams]);

  // Load template by slug if present in query params
  useEffect(() => {
    const templateSlug = searchParams.get("template");
    if (templateSlug) {
      fetch(`/api/v1/gallery?slug=${encodeURIComponent(templateSlug)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data.images?.[0]) {
            setSelectedTemplate(data.data.images[0]);
          }
        })
        .catch(console.error);
    }
  }, [searchParams]);

  const fetchTemplates = useCallback(async (reset = false, offset = 0) => {
    const requestId = ++templateRequestIdRef.current;
    setLoadingTemplates(reset);
    setLoadingMoreTemplates(!reset);
    try {
      const params = new URLSearchParams();
      params.set("category", "Text-to-Image");
      if (activeSubcategory !== "all") {
        params.set("subcategory", activeSubcategory);
      }
      params.set("limit", TEMPLATE_PAGE_SIZE.toString());
      params.set("offset", offset.toString());

      const res = await fetch(`/api/v1/gallery?${params.toString()}`);
      const data = await res.json();
      
      if (requestId !== templateRequestIdRef.current) return;
      
      if (data.success) {
        const nextTemplates = Array.isArray(data.data.images) ? data.data.images : [];
        setTemplates((current) => (reset ? nextTemplates : [...current, ...nextTemplates]));
        setTotalTemplates(Number(data.data.total ?? nextTemplates.length));
        
        if (fetchedSubcategoriesRef.current) {
          setSubcategories(fetchedSubcategoriesRef.current);
        } else if (Array.isArray(data.data.categories)) {
          setSubcategories(data.data.categories);
          fetchedSubcategoriesRef.current = data.data.categories;
        }
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      if (requestId === templateRequestIdRef.current) {
        setLoadingTemplates(false);
        setLoadingMoreTemplates(false);
      }
    }
  }, [activeSubcategory]);

  // Fetch templates when dialog opens or category changes
  useEffect(() => {
    if (templateDialogOpen) {
      setTemplates([]);
      setTotalTemplates(0);
      fetchTemplates(true, 0);
    }
  }, [templateDialogOpen, activeSubcategory, fetchTemplates]);

  const handlePrefetchTemplates = () => {
    if (templates.length === 0 && !loadingTemplates) {
      void fetchTemplates(true, 0);
    }
  };

  const getSubcategoryLabel = (sub: string) => {
    if (sub === "all") return t("allTemplates");
    if (sub === "Photography & Realism") return tFilters("stylePhotographyRealism");
    if (sub === "Illustration & Art") return tFilters("styleIllustrationArt");
    if (sub === "Products & E-commerce") return tFilters("styleProductsEcommerce");
    if (sub === "Architecture & Spaces") return tFilters("styleArchitectureSpaces");
    if (sub === "Brand & Logos") return tFilters("styleBrandLogos");
    if (sub === "Characters & People") return tFilters("styleCharactersPeople");
    if (sub === "Scenes & Storytelling") return tFilters("styleScenesStorytelling");
    if (sub === "UI & Interfaces") return tFilters("styleUiInterfaces");
    if (sub === "Charts & Infographics") return tFilters("styleChartsInfographics");
    if (sub === "Posters & Typography") return tFilters("stylePostersTypography");
    if (sub === "History & Classical Themes") return tFilters("styleHistoryClassical");
    if (sub === "Other Use Cases") return tFilters("styleOtherUseCases");
    return sub;
  };

  const filteredTemplates = templates.filter((tpl) => {
    if (activeSubcategory === "all") return true;
    const sub = (tpl as ClassicImage).subcategory ?? (tpl as ClassicImageData).subcategory;
    return sub === activeSubcategory;
  });

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
                      onClick={() => setTemplateDialogOpen(true)}
                      onMouseEnter={handlePrefetchTemplates}
                      disabled={isWorking}
                      className="flex w-fit items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                      {t("useTemplate")}
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
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                  {t("useTemplate")}
                </h3>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {t("selectTemplateHint")}
                </p>
              </div>
            </div>

            {selectedTemplate && (
              <button
                type="button"
                onClick={() => setTemplateDialogOpen(true)}
                className="inline-flex min-h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                {t("change")}
              </button>
            )}
          </div>

          <div className="bg-slate-50 p-3 dark:bg-slate-900/50">
            {selectedTemplate ? (
              <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
                  <ImageWithFallback
                    src={(selectedTemplate as ClassicImage).heroImageUrl ?? (selectedTemplate as ClassicImageData).hero_image_url ?? ""}
                    alt={(selectedTemplate as ClassicImage).title ?? (selectedTemplate as ClassicImageData).title ?? ""}
                    className="h-full w-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent p-3">
                  <p className="truncate text-sm font-semibold text-white capitalize">
                    {(selectedTemplate as ClassicImage).title ?? (selectedTemplate as ClassicImageData).title ?? ""}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-white/75 capitalize">
                    {(selectedTemplate as ClassicImage).category ?? (selectedTemplate as ClassicImageData).category ?? ""}
                    {(selectedTemplate as ClassicImage).subcategory ?? (selectedTemplate as ClassicImageData).subcategory ? ` - ${(selectedTemplate as ClassicImage).subcategory ?? (selectedTemplate as ClassicImageData).subcategory}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="absolute right-2 top-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-slate-950/45 text-white transition hover:bg-slate-950/70"
                  aria-label="Clear selected template"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-slate-400 dark:border-slate-700 dark:bg-slate-950">
                <div className="mb-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
                  <ImageIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </div>
                <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {t("selectTemplateTitle")}
                </p>
                <button
                  type="button"
                  onClick={() => setTemplateDialogOpen(true)}
                  className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  {t("useTemplate")}
                </button>
              </div>
            )}
          </div>
        </section>

        {!selectedTemplate && (
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
        )}
      </aside>

      {error && (
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm text-destructive shadow-lg dark:border-red-800 dark:bg-slate-900">
          {error}
        </div>
      )}

      <Dialog open={templateDialogOpen} onOpenChange={(open) => {
        setTemplateDialogOpen(open);
        if (!open) {
          setActiveSubcategory("all");
        }
      }}>
        <DialogContent
          style={{ maxWidth: "85vw", width: "100%", maxHeight: "85vh", height: "80vh" }}
          className="p-0 overflow-hidden flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl gap-0"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-500" />
              {t("selectTemplateTitle")}
            </DialogTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t("selectTemplateHint")}
            </p>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            {/* Categories */}
            <aside className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50 p-4 lg:w-60 lg:border-b-0 lg:border-r">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  {tFilters("categories")}
                </p>
                {activeSubcategory !== "all" && (
                  <button
                    type="button"
                    onClick={() => setActiveSubcategory("all")}
                    className="cursor-pointer text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    {tFilters("clear")}
                  </button>
                )}
              </div>
              <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:max-h-none lg:grid-cols-1">
                <button
                  type="button"
                  onClick={() => setActiveSubcategory("all")}
                  className={`min-h-9 cursor-pointer rounded-xl px-3 py-2 text-left text-xs font-semibold tracking-wide transition-colors ${
                    activeSubcategory === "all"
                      ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                      : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {getSubcategoryLabel("all")}
                </button>
                {subcategories.length === 0 && loadingTemplates ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/40 dark:border-slate-800/40"
                    />
                  ))
                ) : (
                  subcategories.map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setActiveSubcategory(sub)}
                      className={`min-h-9 cursor-pointer rounded-xl px-3 py-2 text-left text-xs font-semibold tracking-wide transition-colors ${
                        activeSubcategory === sub
                          ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                          : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {getSubcategoryLabel(sub)}
                    </button>
                  ))
                )}
              </div>
            </aside>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {loadingTemplates ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800/80 animate-pulse border border-slate-200/40 dark:border-slate-800/40"
                    />
                  ))}
                </div>
              ) : templates.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="h-10 w-10 opacity-40 mb-2" />
                  <p className="text-sm font-medium">No templates found</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                    {templates.map((tpl, index) => {
                      const url = (tpl as ClassicImage).heroImageUrl ?? (tpl as ClassicImageData).hero_image_url ?? "";
                      const title = (tpl as ClassicImage).title ?? (tpl as ClassicImageData).title ?? "";
                      const promptVal = (tpl as ClassicImage).promptTemplate ?? (tpl as ClassicImageData).prompt_template ?? "";

                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            setPrompt(promptVal);
                            setSelectedTemplate(tpl);
                            setTemplateDialogOpen(false);
                            setActiveSubcategory("all");
                          }}
                          className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-indigo-500 hover:ring-2 hover:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-500 dark:hover:ring-indigo-900/50"
                        >
                          <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-slate-900">
                            <ImageWithFallback
                              src={url}
                              alt={title}
                              className="absolute inset-0 w-full h-full object-cover transition duration-350 group-hover:scale-105"
                              loading={index < 8 ? "eager" : "lazy"}
                            />
                          </div>
                          <div className="p-2 min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {title}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col items-center gap-3 pt-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t("showing", { count: templates.length, total: totalTemplates })}
                    </p>
                    {templates.length < totalTemplates && (
                      <button
                        type="button"
                        onClick={() => fetchTemplates(false, templates.length)}
                        disabled={loadingMoreTemplates}
                        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                      >
                        {loadingMoreTemplates ? t("loading") : t("loadMore")}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
