"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ExternalLink, ImageIcon, MapPin, RefreshCcw, Search, X } from "lucide-react";
import type { ClassicImageData } from "@/types/ai-photo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RemixScenePanelProps {
  selectedScene: ClassicImageData | null;
  onSelect: (scene: ClassicImageData) => void;
  onClear: () => void;
}

const PICKER_PAGE_SIZE = 18;

function getSceneDisplayUrl(scene: ClassicImageData) {
  return scene.thumbnail_url || scene.hero_image_url;
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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchedCategoriesRef = useRef<string[] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchImages = useCallback(async (reset = false, offset = 0) => {
    const requestId = ++requestIdRef.current;
    setLoading(reset);
    setLoadingMore(!reset);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (debouncedSearch) params.set("q", debouncedSearch);
      params.set("limit", PICKER_PAGE_SIZE.toString());
      params.set("offset", offset.toString());

      const res = await fetch(`/api/v1/gallery?${params.toString()}`);
      const data = await res.json();
      if (requestId !== requestIdRef.current) return;
      if (data.success) {
        const nextImages = Array.isArray(data.data.images) ? data.data.images : [];
        setImages((current) => (reset ? nextImages : [...current, ...nextImages]));
        setTotal(Number(data.data.total ?? nextImages.length));
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
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [category, debouncedSearch]);

  useEffect(() => {
    if (showPicker) {
      setImages([]);
      setTotal(0);
      fetchImages(true, 0);
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
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-950 dark:text-white">Scene base</h3>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">Style and destination</p>
          </div>
        </div>

        {selectedScene && (
          <button
            type="button"
            onClick={() => { setShowPicker(true); setSearch(""); setDebouncedSearch(""); setCategory(null); }}
            className="inline-flex min-h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Change
          </button>
        )}
      </div>

      <div className="bg-slate-50 p-3 dark:bg-slate-900/50">
        {selectedScene ? (
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <ImageWithFallback
              src={getSceneDisplayUrl(selectedScene)}
              alt={selectedScene.title}
              className="h-[190px] w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent p-3">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
                <MapPin className="h-3.5 w-3.5" />
                Selected
              </div>
              <p className="truncate text-sm font-semibold text-white capitalize">{selectedScene.title}</p>
              <p className="mt-0.5 truncate text-xs text-white/75 capitalize">
                {selectedScene.category}
                {selectedScene.subcategory ? ` - ${selectedScene.subcategory}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2 top-2 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-white/20 bg-slate-950/45 text-white transition hover:bg-slate-950/70"
              aria-label="Clear selected scene"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-slate-400 dark:border-slate-700 dark:bg-slate-950">
            <div className="mb-3 rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
              <ImageIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300">Choose scene</p>
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="mt-3 inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg bg-slate-950 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Browse Gallery
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Spacious dialog picker modal */}
      <Dialog open={showPicker} onOpenChange={setShowPicker}>
        <DialogContent
          style={{ maxWidth: "85vw", width: "100%", maxHeight: "85vh", height: "80vh" }}
          className="p-0 overflow-hidden flex flex-col rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl gap-0"
        >
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-indigo-500" />
                Select Scene
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose a classic artwork scene to merge with your photo.
              </DialogDescription>
            </div>

            <div className="relative w-full md:w-80 pr-6 md:pr-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search scenes by title..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-9 md:right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            {/* Categories */}
            <aside className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50 p-4 lg:w-60 lg:border-b-0 lg:border-r">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Categories
                </p>
                {category && (
                  <button
                    type="button"
                    onClick={() => setCategory(null)}
                    className="cursor-pointer text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:max-h-none lg:grid-cols-1">
                <button
                  type="button"
                  onClick={() => setCategory(null)}
                  className={`min-h-9 cursor-pointer rounded-xl px-3 py-2 text-left text-xs font-semibold tracking-wide transition-colors ${
                    !category
                      ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                      : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  All Scenes
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`min-h-9 cursor-pointer rounded-xl px-3 py-2 text-left text-xs font-semibold tracking-wide capitalize transition-colors ${
                      category === cat
                        ? "bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm"
                        : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </aside>

            {/* Scene Grid Area */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] rounded-2xl bg-slate-100 dark:bg-slate-800/80 animate-pulse border border-slate-200/40 dark:border-slate-800/40"
                    />
                  ))}
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <ImageIcon className="h-10 w-10 opacity-30 mb-2" />
                  <p className="text-sm font-medium">No scenes found matching the criteria.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => handleSelect(img)}
                        className="group relative aspect-[3/4] w-full cursor-pointer rounded-2xl overflow-hidden border-2 border-transparent bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-600 focus:border-indigo-600 transition-all duration-300 hover:-translate-y-1"
                      >
                        <img
                          src={getSceneDisplayUrl(img)}
                          alt={img.title}
                          loading={index < 6 ? "eager" : "lazy"}
                          decoding="async"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Ambient glow edge */}
                        <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
                        {/* Hover overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

                        <div className="absolute inset-x-0 bottom-0 p-3 transform transition-transform duration-300 flex flex-col justify-end text-left">
                          <span className="inline-flex items-center w-max px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[9px] font-semibold text-white/90 uppercase tracking-wider mb-1 capitalize">
                            {img.category}
                          </span>
                          <p className="text-sm font-semibold text-white capitalize truncate drop-shadow-sm group-hover:text-indigo-200 transition-colors">
                            {img.title}
                          </p>
                          {img.subcategory && (
                            <p className="text-[10px] text-white/60 capitalize truncate mt-0.5">
                              {img.subcategory}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Showing {images.length} of {total} scenes
                    </p>
                    {images.length < total && (
                      <button
                        type="button"
                        onClick={() => fetchImages(false, images.length)}
                        disabled={loadingMore}
                        className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                      >
                        {loadingMore ? "Loading..." : "Load more"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
