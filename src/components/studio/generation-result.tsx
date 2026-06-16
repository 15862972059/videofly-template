"use client";

import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface GenerationResultProps {
  result: {
    objectKey: string;
    publicUrl: string;
  };
  inline?: boolean;
  aspectRatio?: "1:1" | "3:4" | "9:16" | "16:9";
  showActions?: boolean;
}

const aspectRatioMap: Record<NonNullable<GenerationResultProps["aspectRatio"]>, string> = {
  "1:1": "1 / 1",
  "3:4": "3 / 4",
  "9:16": "9 / 16",
  "16:9": "16 / 9",
};

export function GenerationResult({
  result,
  inline,
  aspectRatio = "3:4",
  showActions,
}: GenerationResultProps) {
  const t = useTranslations("Studio.generationResult");

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `/api/v1/image/download?url=${encodeURIComponent(result.publicUrl)}`;
    link.download = "ai-art-generation.png";
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("shareTitle"),
          text: t("shareText"),
          url: result.publicUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(result.publicUrl);
    }
  };

  const displayActions = showActions ?? !inline;

  return (
    <div
      className={`relative rounded-[1.5rem] overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}
      style={inline ? { aspectRatio: aspectRatioMap[aspectRatio] } : undefined}
    >
      <img
        src={result.publicUrl}
        alt={t("alt")}
        className="w-full h-full object-cover"
      />
      {displayActions && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent flex justify-between gap-2">
          <Button size="sm" className="gap-1.5 flex-1 bg-white text-slate-950 hover:bg-slate-100" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5" /> {t("save")}
          </Button>
          <Button size="sm" variant="secondary" className="gap-1.5 flex-1 bg-slate-950/55 text-white hover:bg-slate-950/70 border border-white/15" onClick={handleShare}>
            <Share2 className="w-3.5 h-3.5" /> {t("share")}
          </Button>
        </div>
      )}
    </div>
  );
}
