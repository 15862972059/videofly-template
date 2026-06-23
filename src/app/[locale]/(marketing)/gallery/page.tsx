"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { ClassicImageData } from "@/types/ai-photo";
import type { ClassicImage } from "@/db";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { ClassicImageGrid } from "@/components/gallery/classic-image-grid";
import { ClassicImageDetailDialog } from "@/components/gallery/classic-image-detail-dialog";
import { useLocaleRouter } from "@/i18n/navigation";

const PAGE_SIZE = 15;

export default function GalleryPage() {
  const router = useLocaleRouter();
  const t = useTranslations("GalleryPage");
  const requestIdRef = useRef(0);

  const [images, setImages] = useState<(ClassicImageData | ClassicImage)[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeMainTab, setActiveMainTab] = useState<"attractions" | "text2img">("attractions");
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [activeSubcategory, setActiveSubcategory] = useState<string | undefined>();
  const [activeQuery, setActiveQuery] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<ClassicImageData | ClassicImage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [sceneLoading, setSceneLoading] = useState(false);

  const fetchGallery = async (reset = false) => {
    const requestId = ++requestIdRef.current;
    const nextOffset = reset ? 0 : images.length;
    // We load categories if we are resetting AND categories list is empty
    const shouldLoadCategories = reset && categories.length === 0;

    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const params = new URLSearchParams();
      if (activeMainTab === "text2img") {
        params.set("category", "Text-to-Image");
        if (activeCategory) {
          params.set("subcategory", activeCategory);
        }
      } else {
        params.set("excludeCategory", "Text-to-Image");
        if (activeCategory) {
          params.set("category", activeCategory);
        }
      }
      if (activeSubcategory) params.set("subcategory", activeSubcategory);
      if (activeQuery) params.set("q", activeQuery);
      params.set("limit", PAGE_SIZE.toString());
      params.set("offset", nextOffset.toString());
      if (!shouldLoadCategories) params.set("includeCategories", "false");

      const res = await fetch(`/api/v1/gallery?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data.images)) {
          if (requestId !== requestIdRef.current) return;

          const nextImages = data.data.images as (ClassicImageData | ClassicImage)[];
          const nextTotal = Number(data.data.total ?? nextImages.length);

          setImages((current) => (reset ? nextImages : [...current, ...nextImages]));
          setTotal(nextTotal);
          if (data.data.categories) {
            setCategories(data.data.categories);
          }
          setLoading(false);
          setLoadingMore(false);
          return;
        }
      }
      throw new Error(t("apiError"));
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : t("loadError"));
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Reset category filters and clear categories directly in the tab change handler
  const handleTabChange = (tab: "attractions" | "text2img") => {
    setActiveMainTab(tab);
    setActiveCategory(undefined);
    setActiveSubcategory(undefined);
    setCategories([]); // Force reloading categories for the new tab
  };

  // Trigger fetch when tab, category, subcategory, or query changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "text2img" && activeMainTab !== "text2img") {
        handleTabChange("text2img");
        return;
      }
    }
    void fetchGallery(true);
  }, [activeMainTab, activeCategory, activeSubcategory, activeQuery]);

  const handleSelect = (image: ClassicImageData | ClassicImage) => {
    setSelectedImage(image);
    setDetailOpen(true);
  };

  const handleUseScene = (image: ClassicImageData | ClassicImage) => {
    const slug = (image as ClassicImage).slug ?? (image as ClassicImageData).slug;
    const category = (image as ClassicImage).category ?? (image as ClassicImageData).category;
    const prompt = (image as ClassicImage).promptTemplate ?? (image as ClassicImageData).prompt_template;

    setSceneLoading(true);
    setDetailOpen(false);

    if (category === "Text-to-Image" && prompt) {
      router.push(`/studio?tab=text2img&prompt=${encodeURIComponent(prompt)}&template=${slug}`);
    } else {
      router.push(`/studio?scene=${slug}`);
    }
  };

  const hasMore = images.length < total;

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground text-lg">
          {t("description")}
        </p>
      </div>

      <div className="mb-6 inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <button
          type="button"
          onClick={() => handleTabChange("attractions")}
          className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
            activeMainTab === "attractions"
              ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {t("tabAttractions")}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("text2img")}
          className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
            activeMainTab === "text2img"
              ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          }`}
        >
          {t("tabTextToImage")}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start">
        <GalleryFilters
          categories={categories}
          activeCategory={activeCategory}
          activeSubcategory={activeSubcategory}
          activeQuery={activeQuery}
          onCategoryChange={setActiveCategory}
          onSubcategoryChange={setActiveSubcategory}
          onQueryChange={setActiveQuery}
        />

        <div className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              {error}
            </div>
          ) : (
            <div className="space-y-6">
              <ClassicImageGrid images={images} onSelect={handleSelect} />

              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  {t("showing", { current: images.length, total: total })}
                </p>

                {hasMore && (
                  <button
                    type="button"
                    onClick={() => void fetchGallery(false)}
                    disabled={loadingMore}
                    className="cursor-pointer rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loadingMore ? t("loadingMore") : t("loadMore")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ClassicImageDetailDialog
        image={selectedImage}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setSceneLoading(false);
        }}
        onUseScene={handleUseScene}
        loading={sceneLoading}
      />
    </div>
  );
}
