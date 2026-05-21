"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ExternalLink, ImageIcon, MapPin, RefreshCcw, Search, X } from "lucide-react";
import type { ClassicImageData } from "@/types/ai-photo";

interface RemixScenePanelProps {
  selectedScene: ClassicImageData | null;
  onSelect: (scene: ClassicImageData) => void;
  onClear: () => void;
}

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
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={`${className} transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0 absolute"}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  );
}

export function RemixScenePanel({ selectedScene, onSelect, onClear }: RemixScenePanelProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [images, setImages] = useState<ClassicImageData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchedCategoriesRef = useRef<string[] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (debouncedSearch) params.set("q", debouncedSearch);
      params.set("limit", "30");

      const res = await fetch(`/api/v1/gallery?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setImages(data.data.images);
        if (fetchedCategoriesRef.current) {
          setCategories(fetchedCategoriesRef.current);
        } else {
          setCategories(data.data.categories);
          fetchedCategoriesRef.current = data.data.categories;
        }
      }
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setLoading(false);
    }
  }, [category, debouncedSearch]);

  useEffect(() => {
    if (showPicker) {
      fetchImages();
    }
  }, [showPicker, category, debouncedSearch, fetchImages]);

  const handleSelect = (scene: ClassicImageData) => {
    onSelect(scene);
    setShowPicker(false);
    setSearch("");
    setDebouncedSearch("");
    setCategory(null);
  };

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">
            <ImageIcon className="h-3.5 w-3.5" />
            Step 1
          </div>
          <h3 className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">Select Scene</h3>
        </div>

        {selectedScene && (
          <button
            type="button"
            onClick={() => { setShowPicker(true); setSearch(""); setDebouncedSearch(""); setCategory(null); }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:border-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Replace
          </button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 dark:border-slate-700 bg-[linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] dark:bg-[linear-gradient(180deg,_#1e293b_0%,_#0f172a_100%)]">
        {selectedScene ? (
          <div className="relative">
            <ImageWithFallback
              src={selectedScene.hero_image_url}
              alt={selectedScene.title}
              className="h-[320px] w-full object-contain"
              loading="eager"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent p-5">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
                <MapPin className="h-3.5 w-3.5" />
                Selected scene
              </div>
              <p className="text-lg font-semibold text-white capitalize">{selectedScene.title}</p>
              <p className="mt-1 text-sm text-white/75 capitalize">
                {selectedScene.category}
                {selectedScene.subcategory ? ` • ${selectedScene.subcategory}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-950/45 text-white transition hover:bg-slate-950/70"
              aria-label="Clear selected scene"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : showPicker ? (
          <div className="p-4">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search scenes..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                type="button"
                onClick={() => setCategory(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  !category
                    ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                    category === cat
                      ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-[260px] overflow-y-auto">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))
              ) : images.length === 0 ? (
                <p className="col-span-3 text-center text-sm text-slate-400 py-8">No scenes found.</p>
              ) : (
                images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => handleSelect(img)}
                    className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary transition-all group"
                  >
                    <img
                      src={img.thumbnail_url}
                      alt={img.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-xs font-medium text-white capitalize truncate">{img.title}</p>
                      <p className="text-[10px] text-white/70 capitalize truncate">{img.category}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex h-[320px] flex-col items-center justify-center px-6 py-10 text-slate-400">
            <div className="mb-4 rounded-full bg-white dark:bg-slate-800 p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700">
              <ImageIcon className="h-7 w-7 opacity-50" />
            </div>
            <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-300">
              Choose a destination scene
            </p>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:border-slate-300 hover:text-slate-950 dark:hover:text-white"
            >
              Browse Gallery
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}