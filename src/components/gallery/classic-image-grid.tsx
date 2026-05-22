"use client";

import type { ClassicImageData } from "@/types/ai-photo";
import type { ClassicImage } from "@/db";
import { ClassicImageCard } from "./classic-image-card";

interface ClassicImageGridProps {
  images: (ClassicImageData | ClassicImage)[];
  onSelect: (image: ClassicImageData | ClassicImage) => void;
}

export function ClassicImageGrid({ images, onSelect }: ClassicImageGridProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No artworks found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {images.map((image) => (
        <ClassicImageCard
          key={image.id}
          image={image}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
