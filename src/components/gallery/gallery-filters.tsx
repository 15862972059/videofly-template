"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface GalleryFiltersProps {
  categories: string[];
  activeCategory?: string;
  activeSubcategory?: string;
  activeQuery?: string;
  onCategoryChange: (category: string | undefined) => void;
  onSubcategoryChange: (subcategory: string | undefined) => void;
  onQueryChange: (query: string) => void;
}

export function GalleryFilters({
  categories,
  activeCategory,
  activeQuery = "",
  onCategoryChange,
  onSubcategoryChange,
  onQueryChange,
}: GalleryFiltersProps) {
  const t = useTranslations("GalleryFilters");
  const [query, setQuery] = useState(activeQuery);

  useEffect(() => {
    setQuery(activeQuery);
  }, [activeQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onQueryChange(query);
  };

  const handleCategoryClick = (category: string | undefined) => {
    onCategoryChange(category);
    onSubcategoryChange(undefined);
  };

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/95 lg:sticky lg:top-24">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
          {t("search")}
        </p>
        <form onSubmit={handleSearch} className="mt-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-slate-900 shadow-sm transition-all placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  onQueryChange("");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label={t("clearSearch")}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <Search className="h-4 w-4" />
            {t("searchButton")}
          </button>
        </form>
      </div>

      <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {t("categories")}
          </p>
          {activeCategory && (
            <button
              type="button"
              onClick={() => handleCategoryClick(undefined)}
              className="cursor-pointer text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {t("clear")}
            </button>
          )}
        </div>

        <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:max-h-[calc(100vh-360px)] lg:grid-cols-1">
          <button
            type="button"
            onClick={() => handleCategoryClick(undefined)}
            className={`min-h-9 cursor-pointer rounded-xl px-3 py-2 text-left text-xs font-semibold tracking-wide transition-colors ${
              !activeCategory
                ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                : "border border-slate-200/60 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
            }`}
          >
            {t("allScenes")}
          </button>
          {categories.map((category) => {
            const getCategoryLabel = (cat: string) => {
              if (cat === "China") return t("categoryChina");
              if (cat === "Japan") return t("categoryJapan");
              if (cat === "Text-to-Image") return t("categoryTextToImage");
              if (cat === "Photography & Realism") return t("stylePhotographyRealism");
              if (cat === "Illustration & Art") return t("styleIllustrationArt");
              if (cat === "Products & E-commerce") return t("styleProductsEcommerce");
              if (cat === "Architecture & Spaces") return t("styleArchitectureSpaces");
              if (cat === "Brand & Logos") return t("styleBrandLogos");
              if (cat === "Characters & People") return t("styleCharactersPeople");
              if (cat === "Scenes & Storytelling") return t("styleScenesStorytelling");
              if (cat === "UI & Interfaces") return t("styleUiInterfaces");
              if (cat === "Charts & Infographics") return t("styleChartsInfographics");
              if (cat === "Posters & Typography") return t("stylePostersTypography");
              if (cat === "History & Classical Themes") return t("styleHistoryClassical");
              if (cat === "Other Use Cases") return t("styleOtherUseCases");
              return cat;
            };
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className={`min-h-9 cursor-pointer rounded-xl px-3 py-2 text-left text-xs font-semibold tracking-wide transition-colors ${
                  activeCategory === category
                    ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                    : "border border-slate-200/60 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
