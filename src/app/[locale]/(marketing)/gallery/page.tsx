"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ClassicImageData } from "@/types/ai-photo";
import type { ClassicImage } from "@/db";
import { classicImages as localImages } from "@/data/classic-images";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { ClassicImageGrid } from "@/components/gallery/classic-image-grid";
import { ClassicImageDetailDialog } from "@/components/gallery/classic-image-detail-dialog";

const PAGE_SIZE = 15;

interface GalleryState {
  images: (ClassicImageData | ClassicImage)[];
  categories: string[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

function getLocalCategories(): string[] {
  const cats = [...new Set(localImages.map((img) => img.category))];
  return cats.sort();
}

function filterLocalImages(
  images: ClassicImageData[],
  category?: string,
  subcategory?: string,
  query?: string
): ClassicImageData[] {
  return images.filter((img) => {
    if (category && img.category !== category) return false;
    if (subcategory && img.subcategory !== subcategory) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !img.title.toLowerCase().includes(q) &&
        !(img.description ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

export default function GalleryPage() {
  const router = useRouter();
  const [state, setState] = useState<GalleryState>({
    images: [],
    categories: [],
    total: 0,
    hasMore: false,
    loading: true,
    loadingMore: false,
    error: null,
  });
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [activeSubcategory, setActiveSubcategory] = useState<string | undefined>();
  const [activeQuery, setActiveQuery] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<ClassicImageData | ClassicImage | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    void fetchGallery(true);
  }, [activeCategory, activeSubcategory, activeQuery]);

  const fetchGallery = async (reset = false) => {
    const nextOffset = reset ? 0 : state.images.length;

    setState((s) => ({
      ...s,
      loading: reset,
      loadingMore: !reset,
      error: null,
    }));

    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      if (activeSubcategory) params.set("subcategory", activeSubcategory);
      if (activeQuery) params.set("q", activeQuery);
      params.set("limit", PAGE_SIZE.toString());
      params.set("offset", nextOffset.toString());

      const res = await fetch(`/api/v1/gallery?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data.images)) {
          const nextImages = data.data.images as (ClassicImageData | ClassicImage)[];
          const total = Number(data.data.total ?? nextImages.length);

          setState((current) => {
            const images = reset ? nextImages : [...current.images, ...nextImages];

            return {
              images,
              categories: data.data.categories ?? current.categories,
              total,
              hasMore: images.length < total,
              loading: false,
              loadingMore: false,
              error: null,
            };
          });

          return;
        }
      }
      throw new Error("API fallback");
    } catch {
      const filtered = filterLocalImages(localImages, activeCategory, activeSubcategory, activeQuery);
      const nextImages = filtered.slice(nextOffset, nextOffset + PAGE_SIZE);

      setState({
        images: reset ? nextImages : [...state.images, ...nextImages],
        categories: getLocalCategories(),
        total: filtered.length,
        hasMore: nextOffset + nextImages.length < filtered.length,
        loading: false,
        loadingMore: false,
        error: null,
      });
    }
  };

  const handleSelect = (image: ClassicImageData | ClassicImage) => {
    setSelectedImage(image);
    setDetailOpen(true);
  };

  const handleUseScene = (image: ClassicImageData | ClassicImage) => {
    setDetailOpen(false);
    const slug = (image as ClassicImage).slug ?? (image as ClassicImageData).slug;
    router.push(`/studio?scene=${slug}`);
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Art Gallery</h1>
        <p className="text-muted-foreground text-lg">
          Browse iconic art scenes and remix your photos into masterpieces.
        </p>
      </div>

      <GalleryFilters
        categories={state.categories}
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        activeQuery={activeQuery}
        onCategoryChange={setActiveCategory}
        onSubcategoryChange={setActiveSubcategory}
        onQueryChange={setActiveQuery}
      />

      <div className="mt-8">
        {state.loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-xl bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : state.error ? (
          <div className="text-center py-12 text-destructive">
            {state.error}
          </div>
        ) : (
          <div className="space-y-6">
            <ClassicImageGrid images={state.images} onSelect={handleSelect} />

            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Showing {state.images.length} of {state.total} scenes
              </p>

              {state.hasMore && (
                <button
                  type="button"
                  onClick={() => void fetchGallery(false)}
                  disabled={state.loadingMore}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {state.loadingMore ? "Loading..." : "Load more"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <ClassicImageDetailDialog
        image={selectedImage}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUseScene={handleUseScene}
      />
    </div>
  );
}
