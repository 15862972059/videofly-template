"use client";

import { useTranslations } from "next-intl";
import type { ClassicImageData } from "@/types/ai-photo";
import type { ClassicImage } from "@/db";
import { ClassicImageCard } from "./classic-image-card";

interface ClassicImageGridProps {
  images: (ClassicImageData | ClassicImage)[];
  onSelect: (image: ClassicImageData | ClassicImage) => void;
}

export function ClassicImageGrid({ images, onSelect }: ClassicImageGridProps) {
  const t = useTranslations("GalleryPage");

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{t("empty")}</p>
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
