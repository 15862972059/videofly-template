"use client";

import { useState } from "react";

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
  activeSubcategory,
  activeQuery = "",
  onCategoryChange,
  onSubcategoryChange,
  onQueryChange,
}: GalleryFiltersProps) {
  const [query, setQuery] = useState(activeQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onQueryChange(query);
  };

  const handleCategoryClick = (category: string | undefined) => {
    onCategoryChange(category);
    onSubcategoryChange(undefined);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search artworks..."
          className="flex-1 px-4 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      </form>

      {/* Country tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryClick(undefined)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !activeCategory
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-colors ${
              activeCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}