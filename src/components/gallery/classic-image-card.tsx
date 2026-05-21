"use client";

import type { ClassicImageData } from "@/types/ai-photo";
import type { ClassicImage } from "@/db";

interface ClassicImageCardProps {
  image: ClassicImageData | ClassicImage;
  onSelect: (image: ClassicImageData | ClassicImage) => void;
  priority?: boolean;
}

export function ClassicImageCard({ image, onSelect, priority = false }: ClassicImageCardProps) {
  const thumbnailUrl =
    (image as ClassicImage).thumbnailUrl ??
    (image as ClassicImageData).thumbnail_url ??
    "";
  const title =
    (image as ClassicImage).title ?? (image as ClassicImageData).title ?? "";
  const category =
    (image as ClassicImage).category ??
    (image as ClassicImageData).category ??
    "";

  return (
    <button
      type="button"
      onClick={() => onSelect(image)}
      className="group relative overflow-hidden rounded-xl bg-muted aspect-[3/4] text-left hover:ring-2 hover:ring-primary transition-all"
    >
      <img
        src={thumbnailUrl}
        alt={title}
        loading={priority ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
        <p className="text-sm font-medium text-white capitalize">
          {category}
        </p>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
    </button>
  );
}
