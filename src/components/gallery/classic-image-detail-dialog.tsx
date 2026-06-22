"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Check, Sparkles } from "lucide-react";
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
  loading?: boolean;
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

function getPromptTemplate(image: ClassicImageData | ClassicImage): string {
  return (
    (image as ClassicImage).promptTemplate ??
    (image as ClassicImageData).prompt_template ??
    ""
  );
}

export function ClassicImageDetailDialog({
  image,
  open,
  onClose,
  onUseScene,
  loading = false,
}: ClassicImageDetailDialogProps) {
  const t = useTranslations("GalleryDetail");
  const [copied, setCopied] = useState(false);

  if (!image) return null;

  const heroUrl = getHeroUrl(image);
  const title = getTitle(image);
  const category = getCategory(image);
  const description = getDescription(image);
  const promptTemplate = getPromptTemplate(image);

  const handleCopy = () => {
    navigator.clipboard.writeText(promptTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTextToImage = category.toLowerCase() === "text-to-image" || category.toLowerCase() === "text_to_image" || category === "文生图";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        style={{ maxWidth: "70vw" }}
        className="overflow-hidden p-4"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl capitalize">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-muted">
            {heroUrl && (
              <img
                src={heroUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
          </div>

          <div>
            <p className="text-sm text-muted-foreground capitalize">
              {t("category")}: {category}
            </p>
            {description && (
              <p className="mt-2 text-muted-foreground">{description}</p>
            )}
          </div>

          {promptTemplate && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("prompt")}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      {t("copyPrompt")}
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 select-all whitespace-pre-wrap break-words leading-relaxed font-mono">
                {promptTemplate}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => onUseScene(image)}
              disabled={loading}
              className="flex-1 gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("loading")}
                </>
              ) : isTextToImage ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t("generateImage")}
                </>
              ) : (
                t("useScene")
              )}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              {t("close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
