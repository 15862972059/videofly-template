"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ClassicImageData } from "@/types/ai-photo";
import type { ClassicImage } from "@/db";

interface ClassicImageDetailDialogProps {
  image: ClassicImageData | ClassicImage | null;
  open: boolean;
  onClose: () => void;
  onUseScene: (image: ClassicImageData | ClassicImage) => void;
}

function getHeroUrl(image: ClassicImageData | ClassicImage): string {
  return (
    (image as ClassicImage).heroImageUrl ??
    (image as ClassicImageData).hero_image_url ??
    ""
  );
}

function getTitle(image: ClassicImageData | ClassicImage): string {
  return (
    (image as ClassicImage).title ?? (image as ClassicImageData).title ?? ""
  );
}

function getCategory(image: ClassicImageData | ClassicImage): string {
  return (
    (image as ClassicImage).category ??
    (image as ClassicImageData).category ??
    ""
  );
}

function getDescription(image: ClassicImageData | ClassicImage): string {
  return (
    (image as ClassicImage).description ??
    (image as ClassicImageData).description ??
    ""
  );
}

function getSlug(image: ClassicImageData | ClassicImage): string {
  return (
    (image as ClassicImage).slug ?? (image as ClassicImageData).slug ?? ""
  );
}

export function ClassicImageDetailDialog({
  image,
  open,
  onClose,
  onUseScene,
}: ClassicImageDetailDialogProps) {
  if (!image) return null;

  const heroUrl = getHeroUrl(image);
  const title = getTitle(image);
  const category = getCategory(image);
  const description = getDescription(image);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl capitalize">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-muted">
            <img
              src={heroUrl}
              alt={title}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>

          <div>
            <p className="text-sm text-muted-foreground capitalize">
              Category: {category}
            </p>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onUseScene(image)} className="flex-1">
              Use This Scene
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
